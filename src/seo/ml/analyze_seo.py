#!/usr/bin/env python3
"""
SEO Analysis Script
Called by the Node.js API to perform ML-powered SEO analysis
"""

import sys
import json
import argparse
import numpy as np
import pandas as pd
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Mock imports (replace with actual imports when dependencies are installed)
try:
    from SEODataCollector import SEODataCollector
    from RankingPredictor import SEORankingPredictor
    from FeatureEngineering import SEOFeatureEngineer
except ImportError:
    # Mock classes for demonstration
    class SEODataCollector:
        def collectCompleteData(self, url, keyword):
            return self._mock_data(url, keyword)
        
        def _mock_data(self, url, keyword):
            return {
                'url': url,
                'targetKeyword': keyword,
                'currentPosition': np.random.randint(1, 50),
                'onPage': {
                    'contentLength': np.random.randint(500, 5000),
                    'titleOptimized': np.random.random() > 0.5,
                    'metaOptimized': np.random.random() > 0.5,
                    'headingStructure': np.random.randint(60, 100),
                    'contentQuality': np.random.randint(50, 95),
                    'keywordDensity': np.random.uniform(0.5, 3.5),
                    'schemaMarkup': np.random.random() > 0.3
                },
                'technical': {
                    'largestContentfulPaint': np.random.randint(1000, 4000),
                    'interactionToNextPaint': np.random.randint(100, 500),
                    'cumulativeLayoutShift': np.random.uniform(0, 0.25)
                },
                'authority': {
                    'domainRating': np.random.randint(20, 90),
                    'totalBacklinks': np.random.randint(10, 10000),
                    'referringDomains': np.random.randint(5, 500)
                },
                'userBehavior': {
                    'clickThroughRate': np.random.uniform(0.01, 0.10),
                    'engagementRate': np.random.uniform(0.3, 0.9),
                    'bounceRate': np.random.uniform(0.2, 0.8),
                    'dwellTime': np.random.randint(30, 300)
                }
            }
    
    class SEORankingPredictor:
        def predict(self, features):
            # Mock prediction
            return np.array([np.random.uniform(0.3, 0.9)])
    
    class SEOFeatureEngineer:
        def engineer_features(self, df, fit=False):
            return df

def analyze_seo(url: str, keyword: str, depth: str = 'ml-powered') -> dict:
    """
    Perform SEO analysis on a URL for a target keyword
    
    Args:
        url: Target URL to analyze
        keyword: Target keyword for ranking prediction
        depth: Analysis depth ('basic', 'comprehensive', 'ml-powered')
    
    Returns:
        Dictionary with analysis results
    """
    try:
        # Initialize services
        collector = SEODataCollector()
        
        # Collect SEO data
        seo_data = collector.collectCompleteData(url, keyword)
        
        # Prepare response
        result = {
            'url': url,
            'keyword': keyword,
            'currentPosition': seo_data.get('currentPosition', 0),
            'timestamp': datetime.now().isoformat()
        }
        
        if depth == 'basic':
            # Basic analysis only
            result.update({
                'onPageScore': calculate_onpage_score(seo_data['onPage']),
                'technicalScore': calculate_technical_score(seo_data['technical']),
                'authorityScore': seo_data['authority']['domainRating']
            })
            
        elif depth in ['comprehensive', 'ml-powered']:
            # Comprehensive analysis
            result.update({
                'onPageAnalysis': analyze_onpage(seo_data['onPage']),
                'technicalAnalysis': analyze_technical(seo_data['technical']),
                'authorityAnalysis': analyze_authority(seo_data['authority']),
                'userBehaviorAnalysis': analyze_user_behavior(seo_data['userBehavior'])
            })
            
            if depth == 'ml-powered':
                # ML-powered predictions
                predictor = SEORankingPredictor()
                engineer = SEOFeatureEngineer()
                
                # Create feature dataframe
                features_df = pd.DataFrame([flatten_dict(seo_data)])
                features_df = engineer.engineer_features(features_df, fit=False)
                
                # Predict ranking
                ranking_score = predictor.predict(features_df)[0]
                predicted_position = score_to_position(ranking_score, seo_data['currentPosition'])
                
                result.update({
                    'predictedPosition': predicted_position,
                    'rankingScore': float(ranking_score),
                    'featureImportance': get_mock_feature_importance(),
                    'recommendations': generate_recommendations(seo_data, ranking_score)
                })
        
        return result
        
    except Exception as e:
        return {
            'error': str(e),
            'url': url,
            'keyword': keyword
        }

def calculate_onpage_score(onpage_data: dict) -> float:
    """Calculate on-page SEO score"""
    score = 0
    max_score = 0
    
    # Title optimization (20 points)
    if onpage_data.get('titleOptimized'):
        score += 20
    max_score += 20
    
    # Meta optimization (15 points)
    if onpage_data.get('metaOptimized'):
        score += 15
    max_score += 15
    
    # Heading structure (15 points)
    heading_score = onpage_data.get('headingStructure', 0)
    score += (heading_score / 100) * 15
    max_score += 15
    
    # Content quality (25 points)
    content_score = onpage_data.get('contentQuality', 0)
    score += (content_score / 100) * 25
    max_score += 25
    
    # Keyword density (10 points)
    keyword_density = onpage_data.get('keywordDensity', 0)
    if 1.0 <= keyword_density <= 2.5:
        score += 10
    elif 0.5 <= keyword_density < 1.0 or 2.5 < keyword_density <= 3.5:
        score += 5
    max_score += 10
    
    # Schema markup (15 points)
    if onpage_data.get('schemaMarkup'):
        score += 15
    max_score += 15
    
    return (score / max_score) * 100

def calculate_technical_score(technical_data: dict) -> float:
    """Calculate technical SEO score based on Core Web Vitals"""
    score = 0
    
    # LCP (33.33%)
    lcp = technical_data.get('largestContentfulPaint', 4000)
    if lcp <= 2500:
        score += 33.33
    elif lcp <= 4000:
        score += 16.67
    
    # INP (33.33%)
    inp = technical_data.get('interactionToNextPaint', 500)
    if inp <= 200:
        score += 33.33
    elif inp <= 500:
        score += 16.67
    
    # CLS (33.33%)
    cls = technical_data.get('cumulativeLayoutShift', 0.25)
    if cls <= 0.1:
        score += 33.33
    elif cls <= 0.25:
        score += 16.67
    
    return score

def analyze_onpage(onpage_data: dict) -> dict:
    """Detailed on-page analysis"""
    return {
        'score': calculate_onpage_score(onpage_data),
        'issues': [],
        'opportunities': [],
        'details': onpage_data
    }

def analyze_technical(technical_data: dict) -> dict:
    """Detailed technical analysis"""
    return {
        'score': calculate_technical_score(technical_data),
        'coreWebVitals': {
            'lcp': {
                'value': technical_data.get('largestContentfulPaint', 0),
                'rating': get_cwv_rating('lcp', technical_data.get('largestContentfulPaint', 0))
            },
            'inp': {
                'value': technical_data.get('interactionToNextPaint', 0),
                'rating': get_cwv_rating('inp', technical_data.get('interactionToNextPaint', 0))
            },
            'cls': {
                'value': technical_data.get('cumulativeLayoutShift', 0),
                'rating': get_cwv_rating('cls', technical_data.get('cumulativeLayoutShift', 0))
            }
        }
    }

def analyze_authority(authority_data: dict) -> dict:
    """Detailed authority analysis"""
    return {
        'domainRating': authority_data.get('domainRating', 0),
        'backlinks': authority_data.get('totalBacklinks', 0),
        'referringDomains': authority_data.get('referringDomains', 0),
        'authorityScore': authority_data.get('domainRating', 0)  # Simplified
    }

def analyze_user_behavior(behavior_data: dict) -> dict:
    """Detailed user behavior analysis"""
    return {
        'ctr': behavior_data.get('clickThroughRate', 0),
        'engagementRate': behavior_data.get('engagementRate', 0),
        'bounceRate': behavior_data.get('bounceRate', 0),
        'dwellTime': behavior_data.get('dwellTime', 0)
    }

def get_cwv_rating(metric: str, value: float) -> str:
    """Get Core Web Vitals rating"""
    if metric == 'lcp':
        if value <= 2500:
            return 'good'
        elif value <= 4000:
            return 'needs-improvement'
        else:
            return 'poor'
    elif metric == 'inp':
        if value <= 200:
            return 'good'
        elif value <= 500:
            return 'needs-improvement'
        else:
            return 'poor'
    elif metric == 'cls':
        if value <= 0.1:
            return 'good'
        elif value <= 0.25:
            return 'needs-improvement'
        else:
            return 'poor'
    return 'unknown'

def score_to_position(score: float, current_position: int) -> int:
    """Convert ranking score to predicted position"""
    # Simple heuristic: higher score = better position
    if score >= 0.8:
        return max(1, current_position - 10)
    elif score >= 0.6:
        return max(1, current_position - 5)
    elif score >= 0.4:
        return max(1, current_position - 2)
    else:
        return current_position + 2

def flatten_dict(d: dict, parent_key: str = '', sep: str = '_') -> dict:
    """Flatten nested dictionary"""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

def get_mock_feature_importance() -> list:
    """Get mock feature importance data"""
    features = [
        ('content_quality_score', 0.145, 'content'),
        ('domain_authority', 0.132, 'authority'),
        ('engagement_rate', 0.098, 'user_behavior'),
        ('core_web_vitals_score', 0.087, 'technical'),
        ('backlink_velocity', 0.076, 'authority'),
        ('content_freshness', 0.065, 'temporal'),
        ('mobile_optimization', 0.054, 'technical'),
        ('semantic_relevance', 0.048, 'content'),
        ('user_satisfaction_score', 0.042, 'composite'),
        ('title_keyword_presence', 0.038, 'content')
    ]
    
    return [
        {'feature': f[0], 'importance': f[1], 'category': f[2]}
        for f in features
    ]

def generate_recommendations(seo_data: dict, ranking_score: float) -> list:
    """Generate SEO recommendations based on analysis"""
    recommendations = []
    
    # Check Core Web Vitals
    if seo_data['technical']['largestContentfulPaint'] > 2500:
        recommendations.append({
            'action': 'Improve Largest Contentful Paint (LCP) to under 2.5 seconds',
            'impact': 'high',
            'effort': 'medium'
        })
    
    if seo_data['technical']['interactionToNextPaint'] > 200:
        recommendations.append({
            'action': 'Reduce Interaction to Next Paint (INP) to under 200ms',
            'impact': 'high',
            'effort': 'medium'
        })
    
    # Check content optimization
    if not seo_data['onPage']['titleOptimized']:
        recommendations.append({
            'action': 'Optimize title tag with target keyword',
            'impact': 'high',
            'effort': 'low'
        })
    
    if not seo_data['onPage']['schemaMarkup']:
        recommendations.append({
            'action': 'Add structured data markup (Schema.org)',
            'impact': 'medium',
            'effort': 'low'
        })
    
    # Check authority
    if seo_data['authority']['domainRating'] < 50:
        recommendations.append({
            'action': 'Build high-quality backlinks from authoritative sites',
            'impact': 'high',
            'effort': 'high'
        })
    
    # Check user behavior
    if seo_data['userBehavior']['bounceRate'] > 0.5:
        recommendations.append({
            'action': 'Improve content engagement to reduce bounce rate',
            'impact': 'medium',
            'effort': 'medium'
        })
    
    return recommendations[:4]  # Return top 4 recommendations

def main():
    parser = argparse.ArgumentParser(description='SEO Analysis Script')
    parser.add_argument('--url', required=True, help='URL to analyze')
    parser.add_argument('--keyword', required=True, help='Target keyword')
    parser.add_argument('--depth', default='ml-powered', 
                       choices=['basic', 'comprehensive', 'ml-powered'],
                       help='Analysis depth')
    
    args = parser.parse_args()
    
    # Perform analysis
    result = analyze_seo(args.url, args.keyword, args.depth)
    
    # Output JSON result
    print(json.dumps(result, indent=2))

if __name__ == '__main__':
    main()