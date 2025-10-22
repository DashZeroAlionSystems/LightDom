"""
BERT Fine-Tuned Model for Semantic SEO Analysis
Implements transformer-based semantic understanding for content relevance scoring
"""

import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional, Any
from transformers import (
    BertTokenizer,
    BertModel,
    BertForSequenceClassification,
    AutoTokenizer,
    AutoModel,
    get_linear_schedule_with_warmup
)
from torch.utils.data import Dataset, DataLoader
from sklearn.metrics.pairwise import cosine_similarity
import mlflow
import mlflow.pytorch
from datetime import datetime
import json

class SEOSemanticDataset(Dataset):
    """Dataset for BERT fine-tuning on SEO relevance tasks"""

    def __init__(
        self,
        queries: List[str],
        documents: List[str],
        relevance_scores: List[float],
        tokenizer: BertTokenizer,
        max_length: int = 512
    ):
        self.queries = queries
        self.documents = documents
        self.relevance_scores = relevance_scores
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.queries)

    def __getitem__(self, idx):
        query = str(self.queries[idx])
        document = str(self.documents[idx])
        score = float(self.relevance_scores[idx])

        # Tokenize query and document together
        encoding = self.tokenizer.encode_plus(
            query,
            document,
            add_special_tokens=True,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )

        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(score, dtype=torch.float)
        }


class BERTSemanticScorer(nn.Module):
    """
    BERT-based model for scoring query-document semantic relevance
    Output: Relevance score (0-1) indicating how well document matches query intent
    """

    def __init__(
        self,
        model_name: str = 'bert-base-uncased',
        num_labels: int = 1,  # Regression task (relevance score)
        dropout: float = 0.1
    ):
        super(BERTSemanticScorer, self).__init__()

        self.bert = BertModel.from_pretrained(model_name)
        self.dropout = nn.Dropout(dropout)
        self.regressor = nn.Linear(self.bert.config.hidden_size, num_labels)
        self.sigmoid = nn.Sigmoid()  # Scale output to 0-1

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask
        )

        # Use [CLS] token representation
        pooled_output = outputs.pooler_output
        pooled_output = self.dropout(pooled_output)

        # Regression to relevance score
        logits = self.regressor(pooled_output)
        relevance_score = self.sigmoid(logits)

        return relevance_score


class BERTSentenceEmbedder:
    """
    Generate sentence embeddings using BERT for semantic similarity
    Optimized with sentence-transformers architecture
    """

    def __init__(
        self,
        model_name: str = 'sentence-transformers/all-MiniLM-L6-v2',
        device: str = 'cuda' if torch.cuda.is_available() else 'cpu'
    ):
        self.device = device
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name).to(device)
        self.model.eval()

    def mean_pooling(self, model_output, attention_mask):
        """Mean pooling of token embeddings"""
        token_embeddings = model_output[0]
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

    def encode(
        self,
        texts: List[str],
        batch_size: int = 32,
        show_progress: bool = False
    ) -> np.ndarray:
        """Generate embeddings for list of texts"""

        embeddings = []

        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]

            # Tokenize
            encoded = self.tokenizer(
                batch_texts,
                padding=True,
                truncation=True,
                max_length=512,
                return_tensors='pt'
            ).to(self.device)

            # Generate embeddings
            with torch.no_grad():
                model_output = self.model(**encoded)

            # Mean pooling
            batch_embeddings = self.mean_pooling(model_output, encoded['attention_mask'])

            # Normalize embeddings
            batch_embeddings = torch.nn.functional.normalize(batch_embeddings, p=2, dim=1)

            embeddings.append(batch_embeddings.cpu().numpy())

        return np.vstack(embeddings)

    def semantic_similarity(
        self,
        query: str,
        documents: List[str]
    ) -> np.ndarray:
        """
        Calculate semantic similarity between query and documents
        Returns: Array of similarity scores (0-1)
        """

        query_embedding = self.encode([query])
        doc_embeddings = self.encode(documents)

        # Cosine similarity
        similarities = cosine_similarity(query_embedding, doc_embeddings)[0]

        return similarities


class BERTSemanticSEOModel:
    """
    Production-ready BERT model for SEO semantic analysis
    Combines relevance scoring and semantic similarity
    """

    def __init__(
        self,
        model_name: str = 'bert-base-uncased',
        device: str = 'cuda' if torch.cuda.is_available() else 'cpu',
        learning_rate: float = 2e-5,
        batch_size: int = 16,
        max_epochs: int = 10,
        early_stopping_patience: int = 3
    ):
        self.device = device
        self.model_name = model_name
        self.learning_rate = learning_rate
        self.batch_size = batch_size
        self.max_epochs = max_epochs
        self.early_stopping_patience = early_stopping_patience

        # Initialize tokenizer and model
        self.tokenizer = BertTokenizer.from_pretrained(model_name)
        self.model = None
        self.embedder = BERTSentenceEmbedder()

        # Training history
        self.training_history = []

    def prepare_model(self):
        """Initialize BERT model for fine-tuning"""
        self.model = BERTSemanticScorer(model_name=self.model_name).to(self.device)
        return self.model

    def train(
        self,
        queries: List[str],
        documents: List[str],
        relevance_scores: List[float],
        validation_split: float = 0.2,
        mlflow_tracking: bool = True
    ) -> Dict[str, Any]:
        """
        Fine-tune BERT model on SEO relevance task

        Args:
            queries: List of search queries/keywords
            documents: List of page content/titles
            relevance_scores: Ground truth relevance (0-1 scale)
            validation_split: Validation data percentage
            mlflow_tracking: Enable MLflow experiment tracking

        Returns:
            Training metrics and history
        """

        if mlflow_tracking:
            mlflow.start_run(run_name=f"bert-seo-semantic-{datetime.now().strftime('%Y%m%d_%H%M%S')}")
            mlflow.log_params({
                'model_name': self.model_name,
                'learning_rate': self.learning_rate,
                'batch_size': self.batch_size,
                'max_epochs': self.max_epochs,
                'training_samples': len(queries)
            })

        # Prepare model
        if self.model is None:
            self.prepare_model()

        # Split data
        split_idx = int(len(queries) * (1 - validation_split))
        train_queries = queries[:split_idx]
        train_docs = documents[:split_idx]
        train_scores = relevance_scores[:split_idx]

        val_queries = queries[split_idx:]
        val_docs = documents[split_idx:]
        val_scores = relevance_scores[split_idx:]

        # Create datasets
        train_dataset = SEOSemanticDataset(
            train_queries, train_docs, train_scores,
            self.tokenizer, max_length=512
        )
        val_dataset = SEOSemanticDataset(
            val_queries, val_docs, val_scores,
            self.tokenizer, max_length=512
        )

        train_loader = DataLoader(train_dataset, batch_size=self.batch_size, shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=self.batch_size)

        # Optimizer and scheduler
        optimizer = torch.optim.AdamW(self.model.parameters(), lr=self.learning_rate)
        total_steps = len(train_loader) * self.max_epochs
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=int(0.1 * total_steps),
            num_training_steps=total_steps
        )

        # Loss function (MSE for regression)
        criterion = nn.MSELoss()

        # Training loop
        best_val_loss = float('inf')
        patience_counter = 0

        for epoch in range(self.max_epochs):
            # Training phase
            self.model.train()
            train_loss = 0.0

            for batch in train_loader:
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['labels'].to(self.device)

                optimizer.zero_grad()

                outputs = self.model(input_ids, attention_mask)
                loss = criterion(outputs.squeeze(), labels)

                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                optimizer.step()
                scheduler.step()

                train_loss += loss.item()

            avg_train_loss = train_loss / len(train_loader)

            # Validation phase
            self.model.eval()
            val_loss = 0.0
            predictions = []
            actuals = []

            with torch.no_grad():
                for batch in val_loader:
                    input_ids = batch['input_ids'].to(self.device)
                    attention_mask = batch['attention_mask'].to(self.device)
                    labels = batch['labels'].to(self.device)

                    outputs = self.model(input_ids, attention_mask)
                    loss = criterion(outputs.squeeze(), labels)

                    val_loss += loss.item()
                    predictions.extend(outputs.squeeze().cpu().numpy().tolist())
                    actuals.extend(labels.cpu().numpy().tolist())

            avg_val_loss = val_loss / len(val_loader)

            # Calculate correlation (semantic relevance metric)
            correlation = np.corrcoef(predictions, actuals)[0, 1]

            # Log metrics
            epoch_metrics = {
                'epoch': epoch + 1,
                'train_loss': avg_train_loss,
                'val_loss': avg_val_loss,
                'correlation': correlation,
                'learning_rate': scheduler.get_last_lr()[0]
            }

            self.training_history.append(epoch_metrics)

            print(f"Epoch {epoch + 1}/{self.max_epochs}")
            print(f"  Train Loss: {avg_train_loss:.4f}")
            print(f"  Val Loss: {avg_val_loss:.4f}")
            print(f"  Correlation: {correlation:.4f}")

            if mlflow_tracking:
                mlflow.log_metrics(epoch_metrics, step=epoch)

            # Early stopping
            if avg_val_loss < best_val_loss:
                best_val_loss = avg_val_loss
                patience_counter = 0
                # Save best model
                self.save_model('best_bert_seo_model.pt')
            else:
                patience_counter += 1
                if patience_counter >= self.early_stopping_patience:
                    print(f"Early stopping at epoch {epoch + 1}")
                    break

        if mlflow_tracking:
            mlflow.pytorch.log_model(self.model, "bert_semantic_model")
            mlflow.end_run()

        return {
            'best_val_loss': best_val_loss,
            'final_correlation': correlation,
            'training_history': self.training_history
        }

    def predict_relevance(
        self,
        queries: List[str],
        documents: List[str]
    ) -> np.ndarray:
        """
        Predict semantic relevance scores for query-document pairs

        Returns:
            Array of relevance scores (0-1)
        """

        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")

        self.model.eval()

        dataset = SEOSemanticDataset(
            queries, documents, [0.0] * len(queries),  # Dummy scores
            self.tokenizer, max_length=512
        )
        loader = DataLoader(dataset, batch_size=self.batch_size)

        predictions = []

        with torch.no_grad():
            for batch in loader:
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)

                outputs = self.model(input_ids, attention_mask)
                predictions.extend(outputs.squeeze().cpu().numpy().tolist())

        return np.array(predictions)

    def get_content_embeddings(
        self,
        texts: List[str]
    ) -> np.ndarray:
        """
        Generate semantic embeddings for content
        Use for clustering, similarity search, topic modeling
        """
        return self.embedder.encode(texts)

    def semantic_similarity_matrix(
        self,
        texts: List[str]
    ) -> np.ndarray:
        """
        Compute pairwise semantic similarity matrix
        Useful for content deduplication and clustering
        """
        embeddings = self.get_content_embeddings(texts)
        return cosine_similarity(embeddings)

    def find_similar_content(
        self,
        query: str,
        documents: List[str],
        top_k: int = 10
    ) -> List[Tuple[int, float]]:
        """
        Find top-k most semantically similar documents to query

        Returns:
            List of (index, similarity_score) tuples
        """
        similarities = self.embedder.semantic_similarity(query, documents)
        top_indices = np.argsort(similarities)[::-1][:top_k]

        return [(int(idx), float(similarities[idx])) for idx in top_indices]

    def save_model(self, filepath: str):
        """Save model checkpoint"""
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'model_name': self.model_name,
            'training_history': self.training_history
        }, filepath)
        print(f"Model saved to {filepath}")

    def load_model(self, filepath: str):
        """Load model checkpoint"""
        checkpoint = torch.load(filepath, map_location=self.device)

        if self.model is None:
            self.prepare_model()

        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.training_history = checkpoint.get('training_history', [])
        print(f"Model loaded from {filepath}")


# Utility functions for SEO-specific semantic analysis

def extract_entities(
    text: str,
    model: BERTSemanticSEOModel
) -> List[Dict[str, Any]]:
    """
    Extract semantic entities from text (keywords, topics, concepts)
    """
    # This would integrate with spaCy or custom NER model
    # Placeholder implementation
    return []


def calculate_topical_authority_score(
    pillar_content: str,
    cluster_contents: List[str],
    model: BERTSemanticSEOModel
) -> float:
    """
    Calculate topical authority score based on semantic coherence
    between pillar page and cluster pages
    """

    # Get embeddings
    pillar_embedding = model.get_content_embeddings([pillar_content])
    cluster_embeddings = model.get_content_embeddings(cluster_contents)

    # Calculate average similarity to pillar
    similarities = cosine_similarity(pillar_embedding, cluster_embeddings)[0]
    authority_score = np.mean(similarities)

    return float(authority_score)


def detect_content_gaps(
    target_keyword: str,
    your_content: str,
    competitor_contents: List[str],
    model: BERTSemanticSEOModel
) -> Dict[str, Any]:
    """
    Identify semantic gaps in your content compared to competitors
    """

    # Calculate relevance scores
    your_relevance = model.embedder.semantic_similarity(target_keyword, [your_content])[0]

    competitor_relevances = model.embedder.semantic_similarity(target_keyword, competitor_contents)
    avg_competitor_relevance = np.mean(competitor_relevances)

    gap_score = avg_competitor_relevance - your_relevance

    return {
        'your_relevance': float(your_relevance),
        'competitor_avg_relevance': float(avg_competitor_relevance),
        'gap_score': float(gap_score),
        'needs_improvement': gap_score > 0.1
    }


if __name__ == "__main__":
    # Example usage
    print("BERT Semantic SEO Model - Example")

    # Sample data
    queries = [
        "best seo tools for small business",
        "how to optimize website speed",
        "content marketing strategy"
    ]

    documents = [
        "Top 10 SEO tools perfect for small businesses and startups",
        "Complete guide to website speed optimization and Core Web Vitals",
        "Effective content marketing strategies to grow your business"
    ]

    relevance_scores = [0.95, 0.92, 0.88]

    # Initialize model
    model = BERTSemanticSEOModel(
        model_name='bert-base-uncased',
        learning_rate=2e-5,
        batch_size=8,
        max_epochs=5
    )

    # Train model
    print("\nTraining BERT model...")
    results = model.train(queries, documents, relevance_scores)

    print(f"\nTraining completed!")
    print(f"Best validation loss: {results['best_val_loss']:.4f}")
    print(f"Final correlation: {results['final_correlation']:.4f}")

    # Test predictions
    test_query = "seo optimization tools"
    test_docs = documents

    predictions = model.predict_relevance([test_query] * len(test_docs), test_docs)

    print(f"\nSemantic relevance predictions for '{test_query}':")
    for doc, score in zip(test_docs, predictions):
        print(f"  Score: {score:.4f} - {doc[:60]}...")
