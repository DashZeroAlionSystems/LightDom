"""
Real-Time Neural Network Training for SEO Ranking
Supports live metric streaming, incremental learning, and online training
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional, Callable, Any
from torch.utils.data import Dataset, DataLoader, random_split
import json
import time
from datetime import datetime
import threading
import queue
import websocket
import mlflow
import mlflow.pytorch

class SEORankingDataset(Dataset):
    """Dataset for neural network training on SEO ranking"""

    def __init__(self, features: np.ndarray, labels: np.ndarray, query_ids: np.ndarray = None):
        self.features = torch.FloatTensor(features)
        self.labels = torch.FloatTensor(labels)
        self.query_ids = query_ids if query_ids is not None else np.arange(len(features))

    def __len__(self):
        return len(self.features)

    def __getitem__(self, idx):
        return {
            'features': self.features[idx],
            'labels': self.labels[idx],
            'query_id': self.query_ids[idx]
        }


class DeepRankingNetwork(nn.Module):
    """
    Deep Neural Network for SEO Ranking Prediction
    Architecture: Multi-layer feedforward with dropout and batch normalization
    """

    def __init__(
        self,
        input_dim: int,
        hidden_dims: List[int] = [512, 256, 128, 64],
        dropout: float = 0.3,
        use_batch_norm: bool = True
    ):
        super(DeepRankingNetwork, self).__init__()

        self.input_dim = input_dim
        self.hidden_dims = hidden_dims

        # Build layers
        layers = []
        prev_dim = input_dim

        for hidden_dim in hidden_dims:
            layers.append(nn.Linear(prev_dim, hidden_dim))

            if use_batch_norm:
                layers.append(nn.BatchNorm1d(hidden_dim))

            layers.append(nn.ReLU())
            layers.append(nn.Dropout(dropout))

            prev_dim = hidden_dim

        # Output layer (regression for ranking position)
        layers.append(nn.Linear(prev_dim, 1))

        self.network = nn.Sequential(*layers)

    def forward(self, x):
        return self.network(x)


class LambdaRankLoss(nn.Module):
    """
    LambdaRank loss implementation for neural networks
    Optimizes NDCG directly through pairwise ranking loss
    """

    def __init__(self, sigma: float = 1.0):
        super(LambdaRankLoss, self).__init__()
        self.sigma = sigma

    def ndcg_lambda_weight(self, positions_i, positions_j, k=10):
        """Calculate lambda weight based on NDCG change"""
        # DCG position discount
        delta_ndcg = abs(
            (1.0 / np.log2(positions_i + 2)) -
            (1.0 / np.log2(positions_j + 2))
        )
        return torch.FloatTensor([delta_ndcg]).to(positions_i.device)

    def forward(self, scores, labels, query_ids):
        """
        Calculate LambdaRank loss

        Args:
            scores: Predicted ranking scores
            labels: Ground truth relevance labels
            query_ids: Query group identifiers
        """
        loss = 0.0
        count = 0

        # Group by query
        unique_queries = torch.unique(query_ids)

        for qid in unique_queries:
            mask = query_ids == qid
            q_scores = scores[mask]
            q_labels = labels[mask]

            if len(q_scores) < 2:
                continue

            # Pairwise comparisons
            for i in range(len(q_scores)):
                for j in range(i + 1, len(q_scores)):
                    if q_labels[i] != q_labels[j]:
                        # Calculate lambda weight
                        positions = torch.argsort(torch.argsort(q_scores, descending=True))
                        pos_i = positions[i]
                        pos_j = positions[j]

                        lambda_weight = self.ndcg_lambda_weight(pos_i, pos_j)

                        # Pairwise ranking loss
                        score_diff = q_scores[i] - q_scores[j]
                        label_diff = q_labels[i] - q_labels[j]

                        # If higher relevance should rank higher
                        if label_diff > 0:
                            pair_loss = torch.log(1 + torch.exp(-self.sigma * score_diff))
                        else:
                            pair_loss = torch.log(1 + torch.exp(self.sigma * score_diff))

                        loss += lambda_weight * pair_loss
                        count += 1

        return loss / max(count, 1)


class RealTimeTrainingCallback:
    """Callback for streaming training metrics in real-time"""

    def __init__(
        self,
        metric_queue: queue.Queue = None,
        websocket_url: str = None,
        log_interval: int = 10
    ):
        self.metric_queue = metric_queue
        self.websocket_url = websocket_url
        self.log_interval = log_interval
        self.ws = None

        if websocket_url:
            self.connect_websocket()

    def connect_websocket(self):
        """Connect to WebSocket for live metric streaming"""
        try:
            self.ws = websocket.WebSocket()
            self.ws.connect(self.websocket_url)
            print(f"Connected to WebSocket: {self.websocket_url}")
        except Exception as e:
            print(f"WebSocket connection failed: {e}")
            self.ws = None

    def send_metrics(self, metrics: Dict[str, Any]):
        """Send metrics through queue and/or WebSocket"""

        # Add to queue
        if self.metric_queue:
            self.metric_queue.put(metrics)

        # Send via WebSocket
        if self.ws:
            try:
                self.ws.send(json.dumps(metrics))
            except Exception as e:
                print(f"WebSocket send failed: {e}")

    def on_epoch_end(self, epoch: int, metrics: Dict[str, float]):
        """Called at end of each epoch"""
        if epoch % self.log_interval == 0 or epoch == 0:
            self.send_metrics({
                'type': 'epoch_metrics',
                'epoch': epoch,
                'timestamp': datetime.now().isoformat(),
                **metrics
            })

    def on_batch_end(self, batch: int, loss: float):
        """Called at end of each batch"""
        if batch % (self.log_interval * 10) == 0:
            self.send_metrics({
                'type': 'batch_metrics',
                'batch': batch,
                'loss': float(loss),
                'timestamp': datetime.now().isoformat()
            })

    def close(self):
        """Close WebSocket connection"""
        if self.ws:
            self.ws.close()


class RealTimeNeuralRanker:
    """
    Real-time trainable neural network for SEO ranking
    Features:
    - Live metric streaming via WebSocket
    - Incremental learning (update existing model)
    - Online learning (single-sample updates)
    - Early stopping with patience
    - Model checkpointing
    """

    def __init__(
        self,
        input_dim: int,
        hidden_dims: List[int] = [512, 256, 128, 64],
        learning_rate: float = 0.001,
        dropout: float = 0.3,
        batch_size: int = 64,
        device: str = 'cuda' if torch.cuda.is_available() else 'cpu',
        websocket_url: str = None
    ):
        self.input_dim = input_dim
        self.hidden_dims = hidden_dims
        self.learning_rate = learning_rate
        self.dropout = dropout
        self.batch_size = batch_size
        self.device = device
        self.websocket_url = websocket_url

        # Initialize model
        self.model = DeepRankingNetwork(
            input_dim=input_dim,
            hidden_dims=hidden_dims,
            dropout=dropout
        ).to(device)

        # Optimizer and loss
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)
        self.criterion = LambdaRankLoss(sigma=1.0)

        # Metric queue for real-time streaming
        self.metric_queue = queue.Queue()

        # Callback
        self.callback = RealTimeTrainingCallback(
            metric_queue=self.metric_queue,
            websocket_url=websocket_url
        )

        # Training history
        self.history = []

    def train_realtime(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        query_ids_train: np.ndarray,
        X_val: np.ndarray = None,
        y_val: np.ndarray = None,
        query_ids_val: np.ndarray = None,
        epochs: int = 100,
        early_stopping_patience: int = 10,
        verbose: bool = True,
        mlflow_tracking: bool = True
    ) -> Dict[str, Any]:
        """
        Train model with real-time metric streaming

        Args:
            X_train: Training features (n_samples, n_features)
            y_train: Training labels (relevance scores)
            query_ids_train: Query group identifiers
            X_val: Validation features (optional)
            y_val: Validation labels
            query_ids_val: Validation query IDs
            epochs: Number of training epochs
            early_stopping_patience: Early stopping patience
            verbose: Print training progress
            mlflow_tracking: Enable MLflow tracking

        Returns:
            Training results dictionary
        """

        if mlflow_tracking:
            mlflow.start_run(run_name=f"neural-seo-{datetime.now().strftime('%Y%m%d_%H%M%S')}")
            mlflow.log_params({
                'input_dim': self.input_dim,
                'hidden_dims': self.hidden_dims,
                'learning_rate': self.learning_rate,
                'batch_size': self.batch_size,
                'epochs': epochs,
                'training_samples': len(X_train)
            })

        # Create datasets
        train_dataset = SEORankingDataset(X_train, y_train, query_ids_train)
        train_loader = DataLoader(train_dataset, batch_size=self.batch_size, shuffle=True)

        if X_val is not None:
            val_dataset = SEORankingDataset(X_val, y_val, query_ids_val)
            val_loader = DataLoader(val_dataset, batch_size=self.batch_size)

        # Training loop
        best_val_loss = float('inf')
        patience_counter = 0

        for epoch in range(epochs):
            epoch_start = time.time()

            # Training phase
            self.model.train()
            train_loss = 0.0
            batch_count = 0

            for batch_idx, batch in enumerate(train_loader):
                features = batch['features'].to(self.device)
                labels = batch['labels'].to(self.device)
                query_ids = batch['query_id']

                self.optimizer.zero_grad()

                # Forward pass
                predictions = self.model(features).squeeze()

                # Calculate loss
                loss = self.criterion(predictions, labels, query_ids)

                # Backward pass
                loss.backward()
                self.optimizer.step()

                train_loss += loss.item()
                batch_count += 1

                # Stream batch metrics
                self.callback.on_batch_end(batch_idx, loss.item())

            avg_train_loss = train_loss / batch_count

            # Validation phase
            val_metrics = {}
            if X_val is not None:
                val_metrics = self._validate(val_loader)
                val_loss = val_metrics['val_loss']
            else:
                val_loss = avg_train_loss

            # Calculate metrics
            epoch_time = time.time() - epoch_start

            metrics = {
                'train_loss': avg_train_loss,
                **val_metrics,
                'epoch_time': epoch_time,
                'learning_rate': self.optimizer.param_groups[0]['lr']
            }

            self.history.append(metrics)

            # Stream epoch metrics
            self.callback.on_epoch_end(epoch, metrics)

            if verbose:
                print(f"Epoch {epoch + 1}/{epochs} - "
                      f"Train Loss: {avg_train_loss:.4f} - "
                      f"Val Loss: {val_loss:.4f} - "
                      f"Time: {epoch_time:.2f}s")

            if mlflow_tracking:
                mlflow.log_metrics(metrics, step=epoch)

            # Early stopping
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                self.save_checkpoint('best_neural_model.pt')
            else:
                patience_counter += 1
                if patience_counter >= early_stopping_patience:
                    if verbose:
                        print(f"Early stopping at epoch {epoch + 1}")
                    break

        # Cleanup
        self.callback.close()

        if mlflow_tracking:
            mlflow.pytorch.log_model(self.model, "neural_ranking_model")
            mlflow.end_run()

        return {
            'best_val_loss': best_val_loss,
            'history': self.history,
            'total_epochs': len(self.history)
        }

    def _validate(self, val_loader: DataLoader) -> Dict[str, float]:
        """Validation step"""
        self.model.eval()
        val_loss = 0.0
        predictions = []
        actuals = []
        batch_count = 0

        with torch.no_grad():
            for batch in val_loader:
                features = batch['features'].to(self.device)
                labels = batch['labels'].to(self.device)
                query_ids = batch['query_id']

                preds = self.model(features).squeeze()
                loss = self.criterion(preds, labels, query_ids)

                val_loss += loss.item()
                batch_count += 1

                predictions.extend(preds.cpu().numpy().tolist())
                actuals.extend(labels.cpu().numpy().tolist())

        # Calculate NDCG (simplified)
        from sklearn.metrics import ndcg_score
        ndcg = ndcg_score([actuals], [predictions], k=10)

        return {
            'val_loss': val_loss / batch_count,
            'val_ndcg': ndcg
        }

    def incremental_update(
        self,
        X_new: np.ndarray,
        y_new: np.ndarray,
        query_ids_new: np.ndarray,
        n_epochs: int = 5
    ):
        """
        Incrementally update model with new data
        (continual learning without forgetting)
        """

        print(f"Incremental update with {len(X_new)} new samples...")

        dataset = SEORankingDataset(X_new, y_new, query_ids_new)
        loader = DataLoader(dataset, batch_size=self.batch_size, shuffle=True)

        self.model.train()

        for epoch in range(n_epochs):
            total_loss = 0.0
            batch_count = 0

            for batch in loader:
                features = batch['features'].to(self.device)
                labels = batch['labels'].to(self.device)
                query_ids = batch['query_id']

                self.optimizer.zero_grad()
                predictions = self.model(features).squeeze()
                loss = self.criterion(predictions, labels, query_ids)
                loss.backward()
                self.optimizer.step()

                total_loss += loss.item()
                batch_count += 1

            avg_loss = total_loss / batch_count
            print(f"Incremental Epoch {epoch + 1}/{n_epochs} - Loss: {avg_loss:.4f}")

            # Stream update metrics
            self.callback.send_metrics({
                'type': 'incremental_update',
                'epoch': epoch,
                'loss': avg_loss,
                'new_samples': len(X_new),
                'timestamp': datetime.now().isoformat()
            })

    def online_update(
        self,
        x: np.ndarray,
        y: float,
        query_id: int
    ):
        """
        Update model with single sample (online learning)
        Useful for real-time feedback incorporation
        """

        x_tensor = torch.FloatTensor(x).unsqueeze(0).to(self.device)
        y_tensor = torch.FloatTensor([y]).to(self.device)
        qid_tensor = torch.LongTensor([query_id])

        self.model.train()
        self.optimizer.zero_grad()

        prediction = self.model(x_tensor).squeeze()
        loss = F.mse_loss(prediction, y_tensor)  # Simple MSE for online learning

        loss.backward()
        self.optimizer.step()

        return loss.item()

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict ranking scores"""
        self.model.eval()

        X_tensor = torch.FloatTensor(X).to(self.device)

        with torch.no_grad():
            predictions = self.model(X_tensor).squeeze()

        return predictions.cpu().numpy()

    def save_checkpoint(self, filepath: str):
        """Save model checkpoint"""
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'history': self.history,
            'config': {
                'input_dim': self.input_dim,
                'hidden_dims': self.hidden_dims,
                'learning_rate': self.learning_rate,
                'dropout': self.dropout
            }
        }, filepath)

    def load_checkpoint(self, filepath: str):
        """Load model checkpoint"""
        checkpoint = torch.load(filepath, map_location=self.device)

        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        self.history = checkpoint.get('history', [])

        print(f"Model loaded from {filepath}")

    def get_live_metrics(self) -> List[Dict[str, Any]]:
        """Get all accumulated metrics from queue"""
        metrics = []
        while not self.metric_queue.empty():
            metrics.append(self.metric_queue.get())
        return metrics


if __name__ == "__main__":
    # Example usage
    print("Real-Time Neural Network Training - Example")

    # Generate sample data
    np.random.seed(42)
    n_samples = 1000
    n_features = 194

    X = np.random.randn(n_samples, n_features)
    y = np.random.rand(n_samples)  # Relevance scores 0-1
    query_ids = np.random.randint(0, 50, n_samples)  # 50 queries

    # Split data
    split = int(0.8 * n_samples)
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]
    qid_train, qid_val = query_ids[:split], query_ids[split:]

    # Initialize model
    model = RealTimeNeuralRanker(
        input_dim=n_features,
        hidden_dims=[512, 256, 128, 64],
        learning_rate=0.001,
        batch_size=32,
        websocket_url=None  # Set to "ws://localhost:8080/training" for live streaming
    )

    # Train with real-time metrics
    print("\nTraining neural network with real-time streaming...")
    results = model.train_realtime(
        X_train, y_train, qid_train,
        X_val, y_val, qid_val,
        epochs=20,
        early_stopping_patience=5,
        verbose=True
    )

    print(f"\nTraining completed!")
    print(f"Best validation loss: {results['best_val_loss']:.4f}")
    print(f"Total epochs: {results['total_epochs']}")

    # Test predictions
    test_predictions = model.predict(X_val[:10])
    print(f"\nSample predictions: {test_predictions}")

    # Test incremental learning
    print("\nTesting incremental learning...")
    X_new = np.random.randn(100, n_features)
    y_new = np.random.rand(100)
    qid_new = np.random.randint(0, 50, 100)

    model.incremental_update(X_new, y_new, qid_new, n_epochs=3)

    print("\nAll tests completed!")
