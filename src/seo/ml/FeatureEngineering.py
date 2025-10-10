"""
SEO Feature Engineering Pipeline
Transforms raw SEO data into ML-ready features with interaction terms,
temporal aggregations, and domain-specific composite scores
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Tuple, Optional
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy import stats
import re
from datetime import datetime, timedelta

class SEOFeatureEngineer:
    """
    Comprehensive feature engineering for SEO ranking prediction
    Creates 150+ features from raw SEO data
    """
    
    def __init__(self, 
                 scaler_type: str = 'standard',
                 create_interactions: bool = True,
                 create_temporal: bool = True,
                 create_ratios: bool = True,
                 create_text_features: bool = True):
        
        self.scaler_type = scaler_type
        self.create_interactions = create_interactions
        self.create_temporal = create_temporal
        self.create_ratios = create_ratios
        self.create_text_features = create_text_features
        
        # Initialize scalers
        if scaler_type == 'standard':
            self.scaler = StandardScaler()
        elif scaler_type == 'robust':
            self.scaler = RobustScaler()
        else:
            self.scaler = None
            
        self.tfidf_vectorizer = TfidfVectorizer(max_features=100, ngram_range=(1, 2))
        self.feature_names = []
        
    def engineer_features(self, df: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
        """
        Complete feature engineering pipeline
        
        Args:
            df: Raw SEO data DataFrame
            fit: Whether to fit transformers (True for training)
            
        Returns:
            DataFrame with engineered features
        """
        # Create a copy to avoid modifying original
        df_features = df.copy()
        
        # Basic feature transformations
        df_features = self._create_basic_features(df_features)
        
        # Ratio features
        if self.create_ratios:
            df_features = self._create_ratio_features(df_features)
        
        # Interaction features
        if self.create_interactions:
            df_features = self._create_interaction_features(df_features)
        
        # Temporal features
        if self.create_temporal:
            df_features = self._create_temporal_features(df_features)
        
        # Text-based features
        if self.create_text_features:
            df_features = self._create_text_features(df_features, fit)
        
        # Domain-specific composite scores
        df_features = self._create_composite_scores(df_features)
        
        # Log transform skewed features
        df_features = self._log_transform_features(df_features)
        
        # Handle missing values
        df_features = self._handle_missing_values(df_features)
        
        # Scale numerical features
        if self.scaler is not None:
            numeric_features = df_features.select_dtypes(include=[np.number]).columns
            if fit:
                df_features[numeric_features] = self.scaler.fit_transform(df_features[numeric_features])
            else:
                df_features[numeric_features] = self.scaler.transform(df_features[numeric_features])
        
        # Store feature names
        self.feature_names = df_features.columns.tolist()
        
        return df_features
    
    def _create_basic_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create basic transformed features"""
        
        # Binary encoding for boolean features
        boolean_cols = df.select_dtypes(include=['bool']).columns
        for col in boolean_cols:
            df[col] = df[col].astype(int)
        
        # Extract temporal features from dates
        if 'crawl_timestamp' in df.columns:
            df['crawl_hour'] = pd.to_datetime(df['crawl_timestamp']).dt.hour
            df['crawl_dayofweek'] = pd.to_datetime(df['crawl_timestamp']).dt.dayofweek
            df['crawl_day'] = pd.to_datetime(df['crawl_timestamp']).dt.day
            df['crawl_month'] = pd.to_datetime(df['crawl_timestamp']).dt.month
        
        # URL features
        if 'url' in df.columns:
            df['url_length'] = df['url'].str.len()
            df['url_depth'] = df['url'].str.count('/')
            df['url_has_params'] = df['url'].str.contains('\\?').astype(int)
            df['url_param_count'] = df['url'].str.count('&') + df['url'].str.contains('\\?').astype(int)
            
            # Extract domain features
            df['is_subdomain'] = df['url'].apply(
                lambda x: len(x.split('/')[2].split('.')) > 2 if len(x.split('/')) > 2 else False
            ).astype(int)
        
        # Content readability bins
        if 'content_readability_score' in df.columns:
            df['readability_bin'] = pd.cut(
                df['content_readability_score'],
                bins=[0, 30, 60, 90, 100],
                labels=['very_hard', 'hard', 'moderate', 'easy']
            )
            # One-hot encode
            readability_dummies = pd.get_dummies(df['readability_bin'], prefix='readability')
            df = pd.concat([df, readability_dummies], axis=1)
        
        # Core Web Vitals categorization
        if 'largest_contentful_paint' in df.columns:
            df['lcp_category'] = pd.cut(
                df['largest_contentful_paint'],
                bins=[0, 2500, 4000, float('inf')],
                labels=['good', 'needs_improvement', 'poor']
            )
            lcp_dummies = pd.get_dummies(df['lcp_category'], prefix='lcp')
            df = pd.concat([df, lcp_dummies], axis=1)
        
        if 'interaction_to_next_paint' in df.columns:
            df['inp_category'] = pd.cut(
                df['interaction_to_next_paint'],
                bins=[0, 200, 500, float('inf')],
                labels=['good', 'needs_improvement', 'poor']
            )
            inp_dummies = pd.get_dummies(df['inp_category'], prefix='inp')
            df = pd.concat([df, inp_dummies], axis=1)
        
        if 'cumulative_layout_shift' in df.columns:
            df['cls_category'] = pd.cut(
                df['cumulative_layout_shift'],
                bins=[0, 0.1, 0.25, float('inf')],
                labels=['good', 'needs_improvement', 'poor']
            )
            cls_dummies = pd.get_dummies(df['cls_category'], prefix='cls')
            df = pd.concat([df, cls_dummies], axis=1)
        
        return df
    
    def _create_ratio_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create ratio and percentage features"""
        
        # Image optimization ratio
        if all(col in df.columns for col in ['images_with_alt_text', 'image_count']):
            df['image_alt_ratio'] = np.where(
                df['image_count'] > 0,
                df['images_with_alt_text'] / df['image_count'],
                1.0
            )
        
        # Link ratios
        if all(col in df.columns for col in ['dofollow_links', 'total_backlinks']):
            df['dofollow_ratio'] = np.where(
                df['total_backlinks'] > 0,
                df['dofollow_links'] / df['total_backlinks'],
                0.0
            )
        
        # Authority distribution
        if all(col in df.columns for col in ['high_authority_links', 'medium_authority_links', 
                                              'low_authority_links', 'total_backlinks']):
            df['high_authority_ratio'] = np.where(
                df['total_backlinks'] > 0,
                df['high_authority_links'] / df['total_backlinks'],
                0.0
            )
            
            df['authority_concentration'] = np.where(
                df['total_backlinks'] > 0,
                df['high_authority_links'] / (df['low_authority_links'] + 1),
                0.0
            )
        
        # Anchor text diversity
        anchor_cols = ['exact_match_anchors', 'partial_match_anchors', 
                      'branded_anchors', 'generic_anchors']
        if all(col in df.columns for col in anchor_cols):
            total_anchors = df[anchor_cols].sum(axis=1)
            
            for col in anchor_cols:
                ratio_col = col.replace('_anchors', '_anchor_ratio')
                df[ratio_col] = np.where(
                    total_anchors > 0,
                    df[col] / total_anchors,
                    0.0
                )
        
        # Content to code ratio
        if all(col in df.columns for col in ['content_length', 'javascript_size', 'css_size']):
            total_code = df['javascript_size'] + df['css_size']
            df['content_to_code_ratio'] = np.where(
                total_code > 0,
                df['content_length'] / total_code,
                float('inf')
            )
            df['content_to_code_ratio'] = df['content_to_code_ratio'].replace(float('inf'), 100)
        
        # Mobile traffic ratio
        if 'ctr_by_device' in df.columns:
            # Extract mobile CTR if stored as dict/JSON
            # This is a simplified version - adjust based on actual data structure
            pass
        
        # Engagement efficiency
        if all(col in df.columns for col in ['engagement_rate', 'bounce_rate']):
            df['engagement_efficiency'] = df['engagement_rate'] * (1 - df['bounce_rate'])
        
        return df
    
    def _create_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create interaction features between related signals"""
        
        # Content quality × backlinks
        if all(col in df.columns for col in ['content_quality_score', 'total_backlinks']):
            df['content_backlink_synergy'] = (
                df['content_quality_score'] * np.log1p(df['total_backlinks'])
            )
            
            # Normalized version
            df['content_backlink_product'] = (
                stats.zscore(df['content_quality_score'].fillna(0)) * 
                stats.zscore(np.log1p(df['total_backlinks'].fillna(0)))
            )
        
        # Engagement × position
        if all(col in df.columns for col in ['engagement_rate', 'average_position']):
            # Inverse position weight (position 1 = weight 1, position 10 = weight 0.1)
            position_weight = 1 / (df['average_position'] + 1)
            df['engagement_position_score'] = df['engagement_rate'] * position_weight
            
            # Flag for high engagement despite poor position
            df['engagement_outperforms_position'] = (
                (df['engagement_rate'] > df['engagement_rate'].median()) & 
                (df['average_position'] > 10)
            ).astype(int)
        
        # Mobile optimization impact
        if all(col in df.columns for col in ['mobile_responsive', 'mobile_traffic_ratio']):
            df['mobile_optimization_impact'] = (
                df['mobile_responsive'] * df['mobile_traffic_ratio']
            )
            
            # Mobile penalty flag
            df['mobile_penalty_risk'] = (
                (df['mobile_responsive'] == 0) & 
                (df['mobile_traffic_ratio'] > 0.5)
            ).astype(int)
        
        # Technical × content interaction
        if all(col in df.columns for col in ['technical_health_score', 'content_quality_score']):
            df['technical_content_synergy'] = (
                df['technical_health_score'] * df['content_quality_score']
            )
        
        # Authority × freshness
        if all(col in df.columns for col in ['domain_authority', 'content_age']):
            # Inverse age weight (fresher content gets higher weight)
            freshness_weight = 1 / (np.log1p(df['content_age']) + 1)
            df['authority_freshness_score'] = df['domain_authority'] * freshness_weight
        
        # Speed × user experience
        if all(col in df.columns for col in ['largest_contentful_paint', 'engagement_rate']):
            # Inverse LCP (faster = higher score)
            speed_score = 1 / (df['largest_contentful_paint'] / 1000 + 1)
            df['speed_engagement_product'] = speed_score * df['engagement_rate']
        
        # Comprehensive quality score
        quality_signals = ['content_quality_score', 'technical_health_score', 
                          'user_satisfaction_score', 'composite_authority_score']
        available_signals = [col for col in quality_signals if col in df.columns]
        
        if len(available_signals) >= 2:
            df['comprehensive_quality_score'] = df[available_signals].mean(axis=1)
            df['quality_variance'] = df[available_signals].std(axis=1)
            df['quality_consistency'] = 1 / (df['quality_variance'] + 1)
        
        return df
    
    def _create_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create time-based features and trends"""
        
        # Content age features
        if 'publish_date' in df.columns and 'crawl_timestamp' in df.columns:
            df['publish_date'] = pd.to_datetime(df['publish_date'])
            df['crawl_timestamp'] = pd.to_datetime(df['crawl_timestamp'])
            
            df['content_age_days'] = (df['crawl_timestamp'] - df['publish_date']).dt.days
            df['content_age_log'] = np.log1p(df['content_age_days'])
            
            # Freshness categories
            df['content_freshness'] = pd.cut(
                df['content_age_days'],
                bins=[0, 7, 30, 90, 365, float('inf')],
                labels=['very_fresh', 'fresh', 'recent', 'established', 'aged']
            )
            freshness_dummies = pd.get_dummies(df['content_freshness'], prefix='freshness')
            df = pd.concat([df, freshness_dummies], axis=1)
        
        # If we have historical data, calculate trends
        if 'url' in df.columns and 'date' in df.columns:
            # Sort by URL and date
            df = df.sort_values(['url', 'date'])
            
            # Traffic trends
            trend_metrics = ['traffic', 'clicks', 'impressions', 'engagement_rate', 
                           'average_position', 'bounce_rate']
            
            for metric in trend_metrics:
                if metric in df.columns:
                    # 7-day moving average
                    df[f'{metric}_7d_ma'] = (
                        df.groupby('url')[metric]
                        .transform(lambda x: x.rolling(7, min_periods=1).mean())
                    )
                    
                    # 30-day moving average
                    df[f'{metric}_30d_ma'] = (
                        df.groupby('url')[metric]
                        .transform(lambda x: x.rolling(30, min_periods=1).mean())
                    )
                    
                    # Week-over-week change
                    df[f'{metric}_wow_change'] = (
                        df.groupby('url')[metric]
                        .transform(lambda x: x.pct_change(periods=7))
                    )
                    
                    # Month-over-month change
                    df[f'{metric}_mom_change'] = (
                        df.groupby('url')[metric]
                        .transform(lambda x: x.pct_change(periods=30))
                    )
                    
                    # Volatility (rolling standard deviation)
                    df[f'{metric}_volatility'] = (
                        df.groupby('url')[metric]
                        .transform(lambda x: x.rolling(30, min_periods=7).std())
                    )
                    
                    # Trend direction (simple linear regression slope)
                    def calculate_trend(series):
                        if len(series) < 2:
                            return 0
                        x = np.arange(len(series))
                        if series.notna().sum() < 2:
                            return 0
                        try:
                            slope, _ = np.polyfit(x[series.notna()], series.dropna(), 1)
                            return slope
                        except:
                            return 0
                    
                    df[f'{metric}_trend'] = (
                        df.groupby('url')[metric]
                        .transform(lambda x: x.rolling(30, min_periods=2).apply(calculate_trend))
                    )
        
        # Seasonality features
        if 'crawl_timestamp' in df.columns:
            df['is_weekend'] = pd.to_datetime(df['crawl_timestamp']).dt.dayofweek.isin([5, 6]).astype(int)
            df['is_holiday_season'] = pd.to_datetime(df['crawl_timestamp']).dt.month.isin([11, 12]).astype(int)
        
        # Backlink velocity
        if all(col in df.columns for col in ['backlinks_last_30_days', 'total_backlinks']):
            df['backlink_velocity'] = df['backlinks_last_30_days'] / (df['total_backlinks'] + 1)
            df['backlink_acceleration'] = df['backlinks_last_30_days'] - df.get('backlinks_last_60_days', 0)
        
        return df
    
    def _create_text_features(self, df: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
        """Create features from text content"""
        
        text_features = []
        
        # Title features
        if 'title_tag' in df.columns:
            df['title_word_count'] = df['title_tag'].str.split().str.len()
            df['title_char_count'] = df['title_tag'].str.len()
            df['title_has_number'] = df['title_tag'].str.contains(r'\d').astype(int)
            df['title_has_question'] = df['title_tag'].str.contains(r'\?').astype(int)
            df['title_has_power_word'] = df['title_tag'].str.contains(
                r'best|top|guide|how|why|tips|tricks|secrets|amazing|powerful',
                case=False
            ).astype(int)
            
            # Title case analysis
            df['title_is_title_case'] = df['title_tag'].apply(
                lambda x: x == x.title() if pd.notna(x) else False
            ).astype(int)
            
            # Sentiment indicators (simplified)
            df['title_positive_sentiment'] = df['title_tag'].str.contains(
                r'best|great|excellent|amazing|perfect|wonderful|fantastic',
                case=False
            ).astype(int)
            
            text_features.append('title_tag')
        
        # Meta description features
        if 'meta_description' in df.columns:
            df['meta_word_count'] = df['meta_description'].str.split().str.len()
            df['meta_char_count'] = df['meta_description'].str.len()
            df['meta_has_cta'] = df['meta_description'].str.contains(
                r'learn|discover|find|get|shop|buy|read|click|visit',
                case=False
            ).astype(int)
            
            text_features.append('meta_description')
        
        # Content analysis
        if 'content' in df.columns:
            # Basic stats
            df['content_word_count'] = df['content'].str.split().str.len()
            df['content_sentence_count'] = df['content'].str.count(r'[.!?]+')
            df['content_paragraph_count'] = df['content'].str.count(r'\n\n') + 1
            
            # Average sentence length
            df['avg_sentence_length'] = np.where(
                df['content_sentence_count'] > 0,
                df['content_word_count'] / df['content_sentence_count'],
                0
            )
            
            # Question density
            df['question_density'] = np.where(
                df['content_word_count'] > 0,
                df['content'].str.count(r'\?') / df['content_word_count'] * 1000,
                0
            )
            
            text_features.append('content')
        
        # TF-IDF features for text columns
        if text_features and fit:
            # Combine all text for TF-IDF
            combined_text = df[text_features].fillna('').agg(' '.join, axis=1)
            
            # Fit TF-IDF
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(combined_text)
            
            # Convert to DataFrame
            tfidf_df = pd.DataFrame(
                tfidf_matrix.toarray(),
                columns=[f'tfidf_{i}' for i in range(tfidf_matrix.shape[1])],
                index=df.index
            )
            
            # Add to main DataFrame
            df = pd.concat([df, tfidf_df], axis=1)
        
        elif text_features and not fit:
            # Transform using fitted vectorizer
            combined_text = df[text_features].fillna('').agg(' '.join, axis=1)
            tfidf_matrix = self.tfidf_vectorizer.transform(combined_text)
            
            tfidf_df = pd.DataFrame(
                tfidf_matrix.toarray(),
                columns=[f'tfidf_{i}' for i in range(tfidf_matrix.shape[1])],
                index=df.index
            )
            
            df = pd.concat([df, tfidf_df], axis=1)
        
        return df
    
    def _create_composite_scores(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create domain-specific composite scores"""
        
        # Technical health score
        tech_components = {
            'https_enabled': 1.0,
            'mobile_responsive': 1.0,
            'lcp_good': 1.0,  # Assuming these were created
            'inp_good': 1.0,
            'cls_good': 1.0,
            'no_broken_internal_links': 1.0,
            'canonical_tag_correct': 0.5,
            'sitemap_present': 0.5
        }
        
        tech_score_components = []
        tech_weights = []
        
        for component, weight in tech_components.items():
            if component in df.columns:
                tech_score_components.append(df[component])
                tech_weights.append(weight)
            elif component == 'no_broken_internal_links' and 'broken_internal_links' in df.columns:
                tech_score_components.append((df['broken_internal_links'] == 0).astype(int))
                tech_weights.append(weight)
        
        if tech_score_components:
            tech_weights = np.array(tech_weights) / sum(tech_weights)  # Normalize
            df['technical_health_composite'] = sum(
                comp * weight for comp, weight in zip(tech_score_components, tech_weights)
            )
        
        # Authority composite score (already in schema, but let's enhance)
        authority_components = ['domain_authority', 'domain_rating', 'trust_flow', 'citation_flow']
        available_authority = [col for col in authority_components if col in df.columns]
        
        if len(available_authority) >= 2:
            # Z-score normalization for each
            for col in available_authority:
                if df[col].std() > 0:
                    df[f'{col}_zscore'] = stats.zscore(df[col].fillna(df[col].median()))
                else:
                    df[f'{col}_zscore'] = 0
            
            # Composite score (average of z-scores)
            zscore_cols = [f'{col}_zscore' for col in available_authority]
            df['authority_composite_enhanced'] = df[zscore_cols].mean(axis=1)
            
            # Authority consistency (low variance = consistent authority signals)
            df['authority_consistency'] = 1 / (df[zscore_cols].std(axis=1) + 1)
        
        # User satisfaction composite
        satisfaction_components = {
            'engagement_rate': 1.0,
            'low_bounce_rate': 1.0,  # Inverse of bounce rate
            'dwell_time': 0.8,
            'pages_per_session': 0.6,
            'return_visitor_rate': 0.8,
            'low_pogosticking_rate': 1.0  # Inverse
        }
        
        satisfaction_score_components = []
        satisfaction_weights = []
        
        for component, weight in satisfaction_components.items():
            if component in df.columns:
                satisfaction_score_components.append(
                    stats.zscore(df[component].fillna(df[component].median()))
                )
                satisfaction_weights.append(weight)
            elif component == 'low_bounce_rate' and 'bounce_rate' in df.columns:
                satisfaction_score_components.append(
                    stats.zscore(1 - df['bounce_rate'].fillna(df['bounce_rate'].median()))
                )
                satisfaction_weights.append(weight)
            elif component == 'low_pogosticking_rate' and 'pogosticking_rate' in df.columns:
                satisfaction_score_components.append(
                    stats.zscore(1 - df['pogosticking_rate'].fillna(df['pogosticking_rate'].median()))
                )
                satisfaction_weights.append(weight)
        
        if satisfaction_score_components:
            satisfaction_weights = np.array(satisfaction_weights) / sum(satisfaction_weights)
            df['user_satisfaction_composite'] = sum(
                comp * weight for comp, weight in zip(satisfaction_score_components, satisfaction_weights)
            )
        
        # E-E-A-T score (Experience, Expertise, Authoritativeness, Trustworthiness)
        eeat_components = {
            'author_byline_present': 0.5,
            'author_bio_present': 0.5,
            'author_expertise_signals': 1.0,
            'content_depth': 1.0,  # Based on content length and structure
            'citation_count': 0.8,
            'external_reference_quality': 1.0,
            'domain_authority': 1.0,
            'trust_flow': 1.0
        }
        
        eeat_score = 0
        eeat_weight_sum = 0
        
        for component, weight in eeat_components.items():
            if component in df.columns:
                if component == 'content_depth' and 'content_length' in df.columns:
                    # Normalize content length to 0-1 scale (assuming 5000 words is excellent)
                    content_score = np.minimum(df['content_length'] / 5000, 1.0)
                    eeat_score += content_score * weight
                else:
                    # Normalize to 0-1 if needed
                    if df[component].max() > 1:
                        normalized = df[component] / df[component].max()
                    else:
                        normalized = df[component]
                    eeat_score += normalized * weight
                eeat_weight_sum += weight
        
        if eeat_weight_sum > 0:
            df['eeat_composite_score'] = eeat_score / eeat_weight_sum
        
        # Overall quality score (meta-composite)
        quality_composites = [
            'technical_health_composite',
            'authority_composite_enhanced',
            'user_satisfaction_composite',
            'eeat_composite_score',
            'content_quality_score'
        ]
        
        available_composites = [col for col in quality_composites if col in df.columns]
        
        if len(available_composites) >= 3:
            df['overall_quality_score'] = df[available_composites].mean(axis=1)
            
            # Quality balance (low variance across quality dimensions)
            df['quality_balance_score'] = 1 / (df[available_composites].std(axis=1) + 0.1)
        
        return df
    
    def _log_transform_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply log transformation to skewed features"""
        
        # Features that are typically skewed
        log_transform_candidates = [
            'total_backlinks', 'referring_domains', 'content_length',
            'page_size', 'javascript_size', 'css_size', 'image_size',
            'impressions', 'clicks', 'traffic', 'dwell_time',
            'largest_contentful_paint', 'time_to_first_byte',
            'backlinks_last_30_days', 'content_age_days'
        ]
        
        for feature in log_transform_candidates:
            if feature in df.columns:
                # Check skewness
                skewness = stats.skew(df[feature].dropna())
                
                # Transform if highly skewed (|skewness| > 1)
                if abs(skewness) > 1:
                    df[f'{feature}_log'] = np.log1p(df[feature])
                    
                    # Optionally drop original if log version is better
                    # df = df.drop(columns=[feature])
        
        return df
    
    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values with domain-appropriate strategies"""
        
        # Numerical features: use median for most, 0 for counts
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            if df[col].isna().any():
                if any(keyword in col for keyword in ['count', 'total', 'number']):
                    # Fill with 0 for count-based features
                    df[col] = df[col].fillna(0)
                elif any(keyword in col for keyword in ['rate', 'ratio', 'score']):
                    # Fill with median for rates and scores
                    df[col] = df[col].fillna(df[col].median())
                else:
                    # Default to median
                    df[col] = df[col].fillna(df[col].median())
        
        # Categorical features: fill with 'unknown'
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns
        
        for col in categorical_cols:
            df[col] = df[col].fillna('unknown')
        
        # Boolean features: fill with False (0)
        boolean_cols = df.select_dtypes(include=['bool']).columns
        
        for col in boolean_cols:
            df[col] = df[col].fillna(False)
        
        return df
    
    def get_feature_names(self) -> List[str]:
        """Return list of all feature names after engineering"""
        return self.feature_names
    
    def get_feature_importance_analysis(self, 
                                       feature_importance: np.ndarray,
                                       top_n: int = 20) -> pd.DataFrame:
        """
        Analyze feature importance and group by category
        
        Args:
            feature_importance: Array of feature importances from model
            top_n: Number of top features to return
            
        Returns:
            DataFrame with feature analysis
        """
        importance_df = pd.DataFrame({
            'feature': self.feature_names,
            'importance': feature_importance
        }).sort_values('importance', ascending=False)
        
        # Categorize features
        def categorize_feature(feature_name):
            if any(keyword in feature_name for keyword in ['title', 'meta', 'h1', 'h2', 'content', 'keyword']):
                return 'content'
            elif any(keyword in feature_name for keyword in ['backlink', 'domain_authority', 'trust', 'citation']):
                return 'authority'
            elif any(keyword in feature_name for keyword in ['lcp', 'inp', 'cls', 'speed', 'mobile', 'technical']):
                return 'technical'
            elif any(keyword in feature_name for keyword in ['engagement', 'bounce', 'ctr', 'dwell', 'session']):
                return 'user_behavior'
            elif any(keyword in feature_name for keyword in ['7d', '30d', 'trend', 'velocity', 'change']):
                return 'temporal'
            elif any(keyword in feature_name for keyword in ['interaction', 'synergy', 'product']):
                return 'interaction'
            elif any(keyword in feature_name for keyword in ['composite', 'score', 'quality']):
                return 'composite'
            else:
                return 'other'
        
        importance_df['category'] = importance_df['feature'].apply(categorize_feature)
        
        # Get top features
        top_features = importance_df.head(top_n)
        
        # Category summary
        category_importance = importance_df.groupby('category')['importance'].agg(['sum', 'mean', 'count'])
        
        return {
            'top_features': top_features,
            'category_importance': category_importance,
            'full_importance': importance_df
        }