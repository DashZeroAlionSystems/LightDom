"""
SEO Ranking Prediction Model
Implements LambdaMART using XGBoost and LightGBM for learning-to-rank
Optimizes NDCG@10 directly for position-aware ranking prediction
"""

import numpy as np
import pandas as pd
import xgboost as xgb
import lightgbm as lgb
from sklearn.model_selection import GroupKFold, train_test_split
from sklearn.preprocessing import StandardScaler
from typing import Tuple, List, Dict, Any, Optional
import joblib
import mlflow
import mlflow.xgboost
import mlflow.lightgbm
from datetime import datetime
import json

class SEORankingPredictor:
    """
    Production-ready ranking predictor for SEO optimization
    Supports both XGBoost and LightGBM with LambdaMART objective
    """
    
    def __init__(
        self,
        model_type: str = 'xgboost',
        learning_rate: float = 0.05,
        n_estimators: int = 400,
        max_depth: int = 6,
        subsample: float = 0.8,
        colsample_bytree: float = 0.8,
        eval_metric: str = 'ndcg@10',
        early_stopping_rounds: int = 50,
        random_state: int = 42
    ):
        self.model_type = model_type
        self.learning_rate = learning_rate
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.subsample = subsample
        self.colsample_bytree = colsample_bytree
        self.eval_metric = eval_metric
        self.early_stopping_rounds = early_stopping_rounds
        self.random_state = random_state
        
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = None
        self.feature_importance = None
        
    def prepare_ranking_data(
        self,
        features: pd.DataFrame,
        labels: pd.Series,
        query_ids: pd.Series,
        test_size: float = 0.2
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Prepare data for ranking task with query groups
        
        Args:
            features: Feature matrix
            labels: Relevance labels (0-4 graded scale)
            query_ids: Query identifiers for grouping
            test_size: Fraction for test set
            
        Returns:
            Train and test splits with group information
        """
        # Ensure query_ids are sorted for proper grouping
        sorted_indices = query_ids.argsort()
        features = features.iloc[sorted_indices]
        labels = labels.iloc[sorted_indices]
        query_ids = query_ids.iloc[sorted_indices]
        
        # Calculate group sizes
        unique_queries, group_sizes = np.unique(query_ids, return_counts=True)
        
        # Split by queries, not individual samples
        n_queries = len(unique_queries)
        n_test_queries = int(n_queries * test_size)
        
        # Random query split
        np.random.seed(self.random_state)
        test_query_indices = np.random.choice(n_queries, n_test_queries, replace=False)
        test_queries = unique_queries[test_query_indices]
        
        # Create masks
        test_mask = query_ids.isin(test_queries)
        train_mask = ~test_mask
        
        # Split data
        X_train = features[train_mask].values
        X_test = features[test_mask].values
        y_train = labels[train_mask].values
        y_test = labels[test_mask].values
        qid_train = query_ids[train_mask].values
        qid_test = query_ids[test_mask].values
        
        # Calculate group sizes for train and test
        train_groups = pd.Series(qid_train).value_counts().sort_index().values
        test_groups = pd.Series(qid_test).value_counts().sort_index().values
        
        # Store feature names
        self.feature_names = features.columns.tolist()
        
        return X_train, X_test, y_train, y_test, train_groups, test_groups
    
    def create_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create interaction features for better ranking prediction
        
        Args:
            df: DataFrame with base features
            
        Returns:
            DataFrame with additional interaction features
        """
        # Content quality × backlinks interaction
        if 'content_quality_score' in df.columns and 'total_backlinks' in df.columns:
            df['content_backlink_interaction'] = (
                df['content_quality_score'] * np.log1p(df['total_backlinks'])
            )
        
        # Engagement × position interaction
        if 'engagement_rate' in df.columns and 'average_position' in df.columns:
            df['engagement_position_interaction'] = (
                df['engagement_rate'] * (1 / (df['average_position'] + 1))
            )
        
        # Mobile traffic × mobile friendly interaction
        if 'mobile_traffic_ratio' in df.columns and 'mobile_responsive' in df.columns:
            df['mobile_optimization_impact'] = (
                df['mobile_traffic_ratio'] * df['mobile_responsive']
            )
        
        # Technical health composite
        tech_features = [
            'https_enabled', 'mobile_responsive', 'cwv_pass_rate'
        ]
        if all(f in df.columns for f in tech_features):
            df['technical_health_score'] = df[tech_features].mean(axis=1)
        
        # Authority composite score
        authority_features = [
            'domain_authority', 'domain_rating', 'trust_flow'
        ]
        if all(f in df.columns for f in authority_features):
            # Z-score normalization for each metric
            for feat in authority_features:
                df[f'{feat}_zscore'] = (
                    (df[feat] - df[feat].mean()) / df[feat].std()
                )
            
            # Composite score
            df['composite_authority_score'] = (
                df[[f'{feat}_zscore' for feat in authority_features]].mean(axis=1)
            )
        
        return df
    
    def create_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create temporal features from time-series data
        
        Args:
            df: DataFrame with temporal data
            
        Returns:
            DataFrame with temporal features
        """
        # Sort by URL and date for proper temporal calculations
        if 'url' in df.columns and 'date' in df.columns:
            df = df.sort_values(['url', 'date'])
            
            # Rolling averages
            for metric in ['traffic', 'engagement_rate', 'clicks']:
                if metric in df.columns:
                    df[f'{metric}_7d_ma'] = (
                        df.groupby('url')[metric]
                        .rolling(window=7, min_periods=1)
                        .mean()
                        .reset_index(0, drop=True)
                    )
                    
                    df[f'{metric}_30d_ma'] = (
                        df.groupby('url')[metric]
                        .rolling(window=30, min_periods=1)
                        .mean()
                        .reset_index(0, drop=True)
                    )
                    
                    # Lag features
                    df[f'{metric}_lag7'] = (
                        df.groupby('url')[metric].shift(7)
                    )
                    
                    # Trend (linear regression slope over 7 days)
                    # Simplified: use difference between current and 7-day lag
                    df[f'{metric}_trend'] = (
                        df[metric] - df[f'{metric}_lag7']
                    ) / 7
        
        return df
    
    def train_xgboost(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        train_groups: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        val_groups: np.ndarray
    ) -> xgb.XGBRanker:
        """
        Train XGBoost ranker with LambdaMART
        """
        ranker = xgb.XGBRanker(
            objective='rank:ndcg',
            learning_rate=self.learning_rate,
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            subsample=self.subsample,
            colsample_bytree=self.colsample_bytree,
            eval_metric=self.eval_metric,
            early_stopping_rounds=self.early_stopping_rounds,
            random_state=self.random_state,
            n_jobs=-1
        )
        
        # Train with validation
        ranker.fit(
            X_train, y_train,
            group=train_groups,
            eval_set=[(X_val, y_val)],
            eval_group=[val_groups],
            verbose=True
        )
        
        # Extract feature importance
        self.feature_importance = ranker.feature_importances_
        
        return ranker
    
    def train_lightgbm(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        train_groups: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        val_groups: np.ndarray
    ) -> lgb.LGBMRanker:
        """
        Train LightGBM ranker with LambdaMART
        30-60x faster than XGBoost for large datasets
        """
        ranker = lgb.LGBMRanker(
            objective='lambdarank',
            metric=self.eval_metric,
            learning_rate=self.learning_rate,
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            subsample=self.subsample,
            colsample_bytree=self.colsample_bytree,
            random_state=self.random_state,
            n_jobs=-1,
            importance_type='gain'
        )
        
        # Train with validation
        ranker.fit(
            X_train, y_train,
            group=train_groups,
            eval_set=[(X_val, y_val)],
            eval_group=[val_groups],
            eval_metric=self.eval_metric,
            callbacks=[
                lgb.early_stopping(self.early_stopping_rounds),
                lgb.log_evaluation(10)
            ]
        )
        
        # Extract feature importance
        self.feature_importance = ranker.feature_importances_
        
        return ranker
    
    def train(
        self,
        features: pd.DataFrame,
        labels: pd.Series,
        query_ids: pd.Series,
        test_size: float = 0.2,
        log_mlflow: bool = True
    ) -> Dict[str, Any]:
        """
        Complete training pipeline with MLflow tracking
        
        Args:
            features: Feature DataFrame
            labels: Relevance labels
            query_ids: Query group identifiers
            test_size: Test set fraction
            log_mlflow: Whether to log to MLflow
            
        Returns:
            Dictionary with model and metrics
        """
        # Start MLflow run
        if log_mlflow:
            mlflow.start_run()
            mlflow.log_params({
                'model_type': self.model_type,
                'learning_rate': self.learning_rate,
                'n_estimators': self.n_estimators,
                'max_depth': self.max_depth,
                'subsample': self.subsample,
                'colsample_bytree': self.colsample_bytree,
                'eval_metric': self.eval_metric
            })
        
        # Feature engineering
        features = self.create_interaction_features(features)
        features = self.create_temporal_features(features)
        
        # Prepare data
        X_train, X_test, y_train, y_test, train_groups, test_groups = (
            self.prepare_ranking_data(features, labels, query_ids, test_size)
        )
        
        # Scale features
        X_train = self.scaler.fit_transform(X_train)
        X_test = self.scaler.transform(X_test)
        
        # Train model
        if self.model_type == 'xgboost':
            self.model = self.train_xgboost(
                X_train, y_train, train_groups,
                X_test, y_test, test_groups
            )
        elif self.model_type == 'lightgbm':
            self.model = self.train_lightgbm(
                X_train, y_train, train_groups,
                X_test, y_test, test_groups
            )
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
        
        # Evaluate
        metrics = self.evaluate(X_test, y_test, test_groups)
        
        # Log to MLflow
        if log_mlflow:
            mlflow.log_metrics(metrics)
            
            # Log feature importance
            feature_importance_df = pd.DataFrame({
                'feature': self.feature_names,
                'importance': self.feature_importance
            }).sort_values('importance', ascending=False)
            
            mlflow.log_text(
                feature_importance_df.to_csv(index=False),
                'feature_importance.csv'
            )
            
            # Log model
            if self.model_type == 'xgboost':
                mlflow.xgboost.log_model(self.model, 'model')
            else:
                mlflow.lightgbm.log_model(self.model, 'model')
            
            mlflow.end_run()
        
        return {
            'model': self.model,
            'scaler': self.scaler,
            'metrics': metrics,
            'feature_importance': feature_importance_df
        }
    
    def evaluate(
        self,
        X_test: np.ndarray,
        y_test: np.ndarray,
        test_groups: np.ndarray
    ) -> Dict[str, float]:
        """
        Evaluate model with ranking metrics
        
        Args:
            X_test: Test features
            y_test: Test labels
            test_groups: Test query groups
            
        Returns:
            Dictionary of metrics
        """
        # Predict scores
        y_pred = self.model.predict(X_test)
        
        # Calculate NDCG@K for different K values
        metrics = {}
        
        for k in [3, 5, 10, 20]:
            ndcg_scores = []
            
            # Process each query group
            start_idx = 0
            for group_size in test_groups:
                end_idx = start_idx + group_size
                
                # Get predictions and labels for this query
                group_pred = y_pred[start_idx:end_idx]
                group_true = y_test[start_idx:end_idx]
                
                # Calculate NDCG@K
                ndcg = self._calculate_ndcg_at_k(group_true, group_pred, k)
                ndcg_scores.append(ndcg)
                
                start_idx = end_idx
            
            metrics[f'ndcg@{k}'] = np.mean(ndcg_scores)
        
        # Calculate MAP (Mean Average Precision)
        map_score = self._calculate_map(y_test, y_pred, test_groups)
        metrics['map'] = map_score
        
        return metrics
    
    def _calculate_ndcg_at_k(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        k: int
    ) -> float:
        """
        Calculate NDCG@K for a single query
        
        Args:
            y_true: True relevance labels
            y_pred: Predicted scores
            k: Top K documents to consider
            
        Returns:
            NDCG@K score
        """
        # Sort by predicted scores
        sorted_indices = np.argsort(y_pred)[::-1]
        
        # Get top K
        top_k_indices = sorted_indices[:min(k, len(sorted_indices))]
        
        # Calculate DCG@K
        dcg = 0
        for i, idx in enumerate(top_k_indices):
            relevance = y_true[idx]
            # Using the formula: (2^rel - 1) / log2(i + 2)
            dcg += (2**relevance - 1) / np.log2(i + 2)
        
        # Calculate Ideal DCG@K
        ideal_relevances = np.sort(y_true)[::-1][:k]
        idcg = sum(
            (2**rel - 1) / np.log2(i + 2)
            for i, rel in enumerate(ideal_relevances)
        )
        
        # Normalize
        if idcg == 0:
            return 0.0
        
        return dcg / idcg
    
    def _calculate_map(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        groups: np.ndarray
    ) -> float:
        """
        Calculate Mean Average Precision
        
        Args:
            y_true: True relevance labels
            y_pred: Predicted scores
            groups: Query groups
            
        Returns:
            MAP score
        """
        ap_scores = []
        
        start_idx = 0
        for group_size in groups:
            end_idx = start_idx + group_size
            
            # Get predictions and labels for this query
            group_pred = y_pred[start_idx:end_idx]
            group_true = y_true[start_idx:end_idx]
            
            # Convert to binary relevance (relevant if label >= 2)
            binary_true = (group_true >= 2).astype(int)
            
            if binary_true.sum() == 0:
                start_idx = end_idx
                continue
            
            # Sort by predicted scores
            sorted_indices = np.argsort(group_pred)[::-1]
            sorted_true = binary_true[sorted_indices]
            
            # Calculate AP
            precisions = []
            relevant_count = 0
            
            for i, is_relevant in enumerate(sorted_true):
                if is_relevant:
                    relevant_count += 1
                    precision = relevant_count / (i + 1)
                    precisions.append(precision)
            
            ap = np.mean(precisions) if precisions else 0
            ap_scores.append(ap)
            
            start_idx = end_idx
        
        return np.mean(ap_scores) if ap_scores else 0
    
    def predict(self, features: pd.DataFrame) -> np.ndarray:
        """
        Predict ranking scores for new data
        
        Args:
            features: Feature DataFrame
            
        Returns:
            Ranking scores
        """
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        # Apply same feature engineering
        features = self.create_interaction_features(features)
        features = self.create_temporal_features(features)
        
        # Ensure same feature order
        features = features[self.feature_names]
        
        # Scale
        X = self.scaler.transform(features.values)
        
        # Predict
        return self.model.predict(X)
    
    def save_model(self, path: str):
        """Save model, scaler, and metadata"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'feature_importance': self.feature_importance,
            'model_type': self.model_type,
            'params': {
                'learning_rate': self.learning_rate,
                'n_estimators': self.n_estimators,
                'max_depth': self.max_depth,
                'subsample': self.subsample,
                'colsample_bytree': self.colsample_bytree
            }
        }
        
        joblib.dump(model_data, path)
    
    def load_model(self, path: str):
        """Load saved model"""
        model_data = joblib.load(path)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        self.feature_importance = model_data['feature_importance']
        self.model_type = model_data['model_type']
        
        # Restore parameters
        params = model_data['params']
        for key, value in params.items():
            setattr(self, key, value)


def handle_imbalanced_data(
    features: pd.DataFrame,
    labels: pd.Series,
    query_ids: pd.Series,
    target_ratio: float = 0.2
) -> Tuple[pd.DataFrame, pd.Series, pd.Series]:
    """
    Handle extreme class imbalance in ranking data
    Most pages never rank in top positions (1000:1 imbalance)
    
    Args:
        features: Feature DataFrame
        labels: Relevance labels
        query_ids: Query identifiers
        target_ratio: Target ratio of high-ranking to low-ranking pages
        
    Returns:
        Balanced dataset
    """
    # Identify high-ranking (labels >= 2) vs low-ranking pages
    high_ranking_mask = labels >= 2
    low_ranking_mask = labels < 2
    
    n_high = high_ranking_mask.sum()
    n_low = low_ranking_mask.sum()
    
    # Calculate downsample size
    n_low_target = int(n_high / target_ratio)
    
    if n_low > n_low_target:
        # Downsample low-ranking pages
        low_indices = labels[low_ranking_mask].index
        sampled_low_indices = np.random.choice(
            low_indices, 
            size=n_low_target, 
            replace=False
        )
        
        # Combine high-ranking and sampled low-ranking
        keep_indices = np.concatenate([
            labels[high_ranking_mask].index,
            sampled_low_indices
        ])
        
        # Sort to maintain order
        keep_indices = np.sort(keep_indices)
        
        return (
            features.loc[keep_indices],
            labels.loc[keep_indices],
            query_ids.loc[keep_indices]
        )
    
    # No downsampling needed
    return features, labels, query_ids