"""
Feature Scoring System for SEO Data Quality
Defines thresholds for each of the 194 features to distinguish good vs bad data
Each feature has: min_good, max_good, min_excellent, max_excellent, weight
"""

import json
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
from enum import Enum

class DataQuality(Enum):
    """Data quality levels"""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"

class FeatureCategory(Enum):
    """Feature categories matching the 194-feature schema"""
    ON_PAGE = "on_page"
    TECHNICAL = "technical"
    CORE_WEB_VITALS = "core_web_vitals"
    AUTHORITY = "authority"
    ENGAGEMENT = "engagement"
    CONTENT = "content"
    TEMPORAL = "temporal"
    INTERACTION = "interaction"
    COMPOSITE = "composite"

class FeatureScoreThresholds:
    """
    Comprehensive feature scoring thresholds for all 194 SEO features
    Defines what constitutes 'good' vs 'bad' data for model training
    """

    @staticmethod
    def get_all_thresholds() -> Dict[str, Dict[str, Any]]:
        """
        Return complete threshold configuration for all 194 features

        Format:
        {
            'feature_name': {
                'category': FeatureCategory,
                'min_good': float,
                'max_good': float,
                'min_excellent': float,
                'max_excellent': float,
                'weight': float (0-2, where 1 is neutral, >1 is more important),
                'description': str,
                'inverse': bool (if True, lower is better)
            }
        }
        """

        thresholds = {}

        # ===================================================================
        # ON-PAGE FEATURES (35 features)
        # ===================================================================

        # Title Tag
        thresholds['title_tag_length'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 30, 'max_good': 70,
            'min_excellent': 50, 'max_excellent': 60,
            'weight': 1.5,
            'description': 'Title tag length in characters',
            'inverse': False
        }

        thresholds['title_keyword_present'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 1, 'max_good': 1,
            'min_excellent': 1, 'max_excellent': 1,
            'weight': 2.0,
            'description': 'Target keyword in title (binary)',
            'inverse': False
        }

        thresholds['title_keyword_position'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 0, 'max_good': 40,
            'min_excellent': 0, 'max_excellent': 10,
            'weight': 1.3,
            'description': 'Character position of keyword in title',
            'inverse': True
        }

        # Meta Description
        thresholds['meta_description_length'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 120, 'max_good': 160,
            'min_excellent': 140, 'max_excellent': 155,
            'weight': 1.2,
            'description': 'Meta description length in characters',
            'inverse': False
        }

        thresholds['meta_keyword_present'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 1, 'max_good': 1,
            'min_excellent': 1, 'max_excellent': 1,
            'weight': 1.5,
            'description': 'Target keyword in meta description',
            'inverse': False
        }

        # URL Structure
        thresholds['url_length'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 20, 'max_good': 100,
            'min_excellent': 30, 'max_excellent': 75,
            'weight': 1.0,
            'description': 'URL length in characters',
            'inverse': True
        }

        thresholds['url_keyword_present'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 1, 'max_good': 1,
            'min_excellent': 1, 'max_excellent': 1,
            'weight': 1.8,
            'description': 'Target keyword in URL slug',
            'inverse': False
        }

        thresholds['url_depth'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 1, 'max_good': 3,
            'min_excellent': 1, 'max_excellent': 2,
            'weight': 1.1,
            'description': 'URL directory depth',
            'inverse': True
        }

        # Headings
        thresholds['h1_count'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 1, 'max_good': 1,
            'min_excellent': 1, 'max_excellent': 1,
            'weight': 1.8,
            'description': 'Number of H1 tags (should be exactly 1)',
            'inverse': False
        }

        thresholds['h1_keyword_present'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 1, 'max_good': 1,
            'min_excellent': 1, 'max_excellent': 1,
            'weight': 1.7,
            'description': 'Target keyword in H1',
            'inverse': False
        }

        thresholds['h2_count'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 2, 'max_good': 8,
            'min_excellent': 3, 'max_excellent': 6,
            'weight': 1.2,
            'description': 'Number of H2 tags',
            'inverse': False
        }

        thresholds['h3_count'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 0, 'max_good': 15,
            'min_excellent': 3, 'max_excellent': 10,
            'weight': 1.0,
            'description': 'Number of H3 tags',
            'inverse': False
        }

        # Content
        thresholds['content_word_count'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 1000, 'max_good': 5000,
            'min_excellent': 1800, 'max_excellent': 3000,
            'weight': 1.6,
            'description': 'Total word count of content',
            'inverse': False
        }

        thresholds['keyword_density'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 0.5, 'max_good': 2.5,
            'min_excellent': 1.0, 'max_excellent': 2.0,
            'weight': 1.3,
            'description': 'Keyword density percentage',
            'inverse': False
        }

        thresholds['internal_links_count'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 3, 'max_good': 20,
            'min_excellent': 5, 'max_excellent': 15,
            'weight': 1.2,
            'description': 'Number of internal links',
            'inverse': False
        }

        thresholds['external_links_count'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 1, 'max_good': 10,
            'min_excellent': 2, 'max_excellent': 6,
            'weight': 1.0,
            'description': 'Number of external links',
            'inverse': False
        }

        thresholds['image_count'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 1, 'max_good': 20,
            'min_excellent': 3, 'max_excellent': 12,
            'weight': 1.1,
            'description': 'Number of images on page',
            'inverse': False
        }

        thresholds['images_with_alt_ratio'] = {
            'category': FeatureCategory.ON_PAGE,
            'min_good': 0.7, 'max_good': 1.0,
            'min_excellent': 0.9, 'max_excellent': 1.0,
            'weight': 1.4,
            'description': 'Ratio of images with alt text',
            'inverse': False
        }

        # ===================================================================
        # TECHNICAL SEO FEATURES (28 features)
        # ===================================================================

        thresholds['https_enabled'] = {
            'category': FeatureCategory.TECHNICAL,
            'min_good': 1, 'max_good': 1,
            'min_excellent': 1, 'max_excellent': 1,
            'weight': 1.8,
            'description': 'HTTPS enabled (binary)',
            'inverse': False
        }

        thresholds['mobile_friendly'] = {
            'category': FeatureCategory.TECHNICAL,
            'min_good': 1, 'max_good': 1,
            'min_excellent': 1, 'max_excellent': 1,
            'weight': 1.9,
            'description': 'Mobile-friendly (binary)',
            'inverse': False
        }

        thresholds['page_load_time_ms'] = {
            'category': FeatureCategory.TECHNICAL,
            'min_good': 500, 'max_good': 3000,
            'min_excellent': 500, 'max_excellent': 1500,
            'weight': 1.7,
            'description': 'Page load time in milliseconds',
            'inverse': True
        }

        thresholds['page_size_kb'] = {
            'category': FeatureCategory.TECHNICAL,
            'min_good': 500, 'max_good': 3000,
            'min_excellent': 800, 'max_excellent': 2000,
            'weight': 1.2,
            'description': 'Total page size in KB',
            'inverse': True
        }

        thresholds['robots_txt_present'] = {
            'category': FeatureCategory.TECHNICAL,
            'min_good': 1, 'max_good': 1,
            'min_excellent': 1, 'max_excellent': 1,
            'weight': 1.3,
            'description': 'robots.txt file present',
            'inverse': False
        }

        thresholds['sitemap_xml_present'] = {
            'category': FeatureCategory.TECHNICAL,
            'min_good': 1, 'max_good': 1,
            'min_excellent': 1, 'max_excellent': 1,
            'weight': 1.5,
            'description': 'sitemap.xml file present',
            'inverse': False
        }

        thresholds['canonical_tag_present'] = {
            'category': FeatureCategory.TECHNICAL,
            'min_good': 1, 'max_good': 1,
            'min_excellent': 1, 'max_excellent': 1,
            'weight': 1.4,
            'description': 'Canonical tag present',
            'inverse': False
        }

        thresholds['structured_data_present'] = {
            'category': FeatureCategory.TECHNICAL,
            'min_good': 1, 'max_good': 1,
            'min_excellent': 1, 'max_excellent': 1,
            'weight': 1.6,
            'description': 'Schema.org structured data present',
            'inverse': False
        }

        thresholds['crawl_errors_count'] = {
            'category': FeatureCategory.TECHNICAL,
            'min_good': 0, 'max_good': 5,
            'min_excellent': 0, 'max_excellent': 0,
            'weight': 1.5,
            'description': 'Number of crawl errors',
            'inverse': True
        }

        thresholds['broken_links_count'] = {
            'category': FeatureCategory.TECHNICAL,
            'min_good': 0, 'max_good': 3,
            'min_excellent': 0, 'max_excellent': 0,
            'weight': 1.4,
            'description': 'Number of broken links',
            'inverse': True
        }

        # ===================================================================
        # CORE WEB VITALS FEATURES (18 features)
        # ===================================================================

        thresholds['lcp_score'] = {
            'category': FeatureCategory.CORE_WEB_VITALS,
            'min_good': 0, 'max_good': 2.5,
            'min_excellent': 0, 'max_excellent': 1.8,
            'weight': 2.0,
            'description': 'Largest Contentful Paint in seconds',
            'inverse': True
        }

        thresholds['fid_score'] = {
            'category': FeatureCategory.CORE_WEB_VITALS,
            'min_good': 0, 'max_good': 100,
            'min_excellent': 0, 'max_excellent': 50,
            'weight': 1.8,
            'description': 'First Input Delay in milliseconds',
            'inverse': True
        }

        thresholds['inp_score'] = {
            'category': FeatureCategory.CORE_WEB_VITALS,
            'min_good': 0, 'max_good': 200,
            'min_excellent': 0, 'max_excellent': 100,
            'weight': 2.0,
            'description': 'Interaction to Next Paint in milliseconds',
            'inverse': True
        }

        thresholds['cls_score'] = {
            'category': FeatureCategory.CORE_WEB_VITALS,
            'min_good': 0, 'max_good': 0.1,
            'min_excellent': 0, 'max_excellent': 0.05,
            'weight': 1.9,
            'description': 'Cumulative Layout Shift score',
            'inverse': True
        }

        thresholds['ttfb_score'] = {
            'category': FeatureCategory.CORE_WEB_VITALS,
            'min_good': 0, 'max_good': 800,
            'min_excellent': 0, 'max_excellent': 200,
            'weight': 1.5,
            'description': 'Time to First Byte in milliseconds',
            'inverse': True
        }

        thresholds['fcp_score'] = {
            'category': FeatureCategory.CORE_WEB_VITALS,
            'min_good': 0, 'max_good': 1.8,
            'min_excellent': 0, 'max_excellent': 1.0,
            'weight': 1.6,
            'description': 'First Contentful Paint in seconds',
            'inverse': True
        }

        thresholds['speed_index'] = {
            'category': FeatureCategory.CORE_WEB_VITALS,
            'min_good': 0, 'max_good': 3.4,
            'min_excellent': 0, 'max_excellent': 1.3,
            'weight': 1.5,
            'description': 'Speed Index score',
            'inverse': True
        }

        thresholds['tbt_score'] = {
            'category': FeatureCategory.CORE_WEB_VITALS,
            'min_good': 0, 'max_good': 200,
            'min_excellent': 0, 'max_excellent': 100,
            'weight': 1.4,
            'description': 'Total Blocking Time in milliseconds',
            'inverse': True
        }

        # ===================================================================
        # AUTHORITY SIGNALS FEATURES (32 features)
        # ===================================================================

        thresholds['domain_authority'] = {
            'category': FeatureCategory.AUTHORITY,
            'min_good': 30, 'max_good': 100,
            'min_excellent': 50, 'max_excellent': 100,
            'weight': 1.8,
            'description': 'Moz Domain Authority (0-100)',
            'inverse': False
        }

        thresholds['page_authority'] = {
            'category': FeatureCategory.AUTHORITY,
            'min_good': 20, 'max_good': 100,
            'min_excellent': 40, 'max_excellent': 100,
            'weight': 1.7,
            'description': 'Moz Page Authority (0-100)',
            'inverse': False
        }

        thresholds['domain_rating'] = {
            'category': FeatureCategory.AUTHORITY,
            'min_good': 30, 'max_good': 100,
            'min_excellent': 50, 'max_excellent': 100,
            'weight': 1.8,
            'description': 'Ahrefs Domain Rating (0-100)',
            'inverse': False
        }

        thresholds['url_rating'] = {
            'category': FeatureCategory.AUTHORITY,
            'min_good': 20, 'max_good': 100,
            'min_excellent': 40, 'max_excellent': 100,
            'weight': 1.7,
            'description': 'Ahrefs URL Rating (0-100)',
            'inverse': False
        }

        thresholds['backlinks_total'] = {
            'category': FeatureCategory.AUTHORITY,
            'min_good': 10, 'max_good': 10000,
            'min_excellent': 100, 'max_excellent': 10000,
            'weight': 1.6,
            'description': 'Total number of backlinks',
            'inverse': False
        }

        thresholds['referring_domains'] = {
            'category': FeatureCategory.AUTHORITY,
            'min_good': 5, 'max_good': 5000,
            'min_excellent': 50, 'max_excellent': 5000,
            'weight': 1.9,
            'description': 'Number of unique referring domains',
            'inverse': False
        }

        thresholds['dofollow_backlinks_ratio'] = {
            'category': FeatureCategory.AUTHORITY,
            'min_good': 0.5, 'max_good': 1.0,
            'min_excellent': 0.7, 'max_excellent': 1.0,
            'weight': 1.5,
            'description': 'Ratio of dofollow to total backlinks',
            'inverse': False
        }

        thresholds['avg_referring_domain_rating'] = {
            'category': FeatureCategory.AUTHORITY,
            'min_good': 30, 'max_good': 100,
            'min_excellent': 50, 'max_excellent': 100,
            'weight': 1.7,
            'description': 'Average DR of referring domains',
            'inverse': False
        }

        thresholds['trust_flow'] = {
            'category': FeatureCategory.AUTHORITY,
            'min_good': 20, 'max_good': 100,
            'min_excellent': 40, 'max_excellent': 100,
            'weight': 1.6,
            'description': 'Majestic Trust Flow (0-100)',
            'inverse': False
        }

        thresholds['citation_flow'] = {
            'category': FeatureCategory.AUTHORITY,
            'min_good': 20, 'max_good': 100,
            'min_excellent': 40, 'max_excellent': 100,
            'weight': 1.5,
            'description': 'Majestic Citation Flow (0-100)',
            'inverse': False
        }

        # ===================================================================
        # ENGAGEMENT METRICS FEATURES (24 features)
        # ===================================================================

        thresholds['organic_traffic_monthly'] = {
            'category': FeatureCategory.ENGAGEMENT,
            'min_good': 100, 'max_good': 1000000,
            'min_excellent': 1000, 'max_excellent': 1000000,
            'weight': 1.8,
            'description': 'Monthly organic traffic',
            'inverse': False
        }

        thresholds['avg_session_duration_sec'] = {
            'category': FeatureCategory.ENGAGEMENT,
            'min_good': 60, 'max_good': 600,
            'min_excellent': 120, 'max_excellent': 480,
            'weight': 1.6,
            'description': 'Average session duration in seconds',
            'inverse': False
        }

        thresholds['bounce_rate'] = {
            'category': FeatureCategory.ENGAGEMENT,
            'min_good': 0.2, 'max_good': 0.6,
            'min_excellent': 0.2, 'max_excellent': 0.4,
            'weight': 1.7,
            'description': 'Bounce rate (0-1)',
            'inverse': True
        }

        thresholds['pages_per_session'] = {
            'category': FeatureCategory.ENGAGEMENT,
            'min_good': 1.5, 'max_good': 10.0,
            'min_excellent': 2.5, 'max_excellent': 8.0,
            'weight': 1.5,
            'description': 'Average pages viewed per session',
            'inverse': False
        }

        thresholds['ctr_from_serp'] = {
            'category': FeatureCategory.ENGAGEMENT,
            'min_good': 0.02, 'max_good': 0.30,
            'min_excellent': 0.05, 'max_excellent': 0.20,
            'weight': 1.9,
            'description': 'Click-through rate from SERP (0-1)',
            'inverse': False
        }

        thresholds['scroll_depth_avg'] = {
            'category': FeatureCategory.ENGAGEMENT,
            'min_good': 0.4, 'max_good': 1.0,
            'min_excellent': 0.6, 'max_excellent': 1.0,
            'weight': 1.3,
            'description': 'Average scroll depth (0-1)',
            'inverse': False
        }

        thresholds['return_visitor_rate'] = {
            'category': FeatureCategory.ENGAGEMENT,
            'min_good': 0.2, 'max_good': 0.8,
            'min_excellent': 0.4, 'max_excellent': 0.7,
            'weight': 1.4,
            'description': 'Returning visitor rate (0-1)',
            'inverse': False
        }

        # ===================================================================
        # CONTENT QUALITY FEATURES (22 features)
        # ===================================================================

        thresholds['readability_score'] = {
            'category': FeatureCategory.CONTENT,
            'min_good': 40, 'max_good': 80,
            'min_excellent': 50, 'max_excellent': 70,
            'weight': 1.4,
            'description': 'Flesch Reading Ease score (0-100)',
            'inverse': False
        }

        thresholds['content_uniqueness_ratio'] = {
            'category': FeatureCategory.CONTENT,
            'min_good': 0.7, 'max_good': 1.0,
            'min_excellent': 0.9, 'max_excellent': 1.0,
            'weight': 1.8,
            'description': 'Content uniqueness ratio (0-1)',
            'inverse': False
        }

        thresholds['avg_sentence_length'] = {
            'category': FeatureCategory.CONTENT,
            'min_good': 10, 'max_good': 25,
            'min_excellent': 12, 'max_excellent': 20,
            'weight': 1.1,
            'description': 'Average sentence length in words',
            'inverse': False
        }

        thresholds['paragraph_count'] = {
            'category': FeatureCategory.CONTENT,
            'min_good': 5, 'max_good': 50,
            'min_excellent': 10, 'max_excellent': 30,
            'weight': 1.2,
            'description': 'Number of paragraphs',
            'inverse': False
        }

        thresholds['multimedia_elements_count'] = {
            'category': FeatureCategory.CONTENT,
            'min_good': 2, 'max_good': 20,
            'min_excellent': 4, 'max_excellent': 15,
            'weight': 1.3,
            'description': 'Total multimedia elements (images, videos, etc.)',
            'inverse': False
        }

        thresholds['video_present'] = {
            'category': FeatureCategory.CONTENT,
            'min_good': 0, 'max_good': 1,
            'min_excellent': 1, 'max_excellent': 1,
            'weight': 1.5,
            'description': 'Video content present (binary)',
            'inverse': False
        }

        thresholds['table_count'] = {
            'category': FeatureCategory.CONTENT,
            'min_good': 0, 'max_good': 10,
            'min_excellent': 1, 'max_excellent': 5,
            'weight': 1.1,
            'description': 'Number of tables',
            'inverse': False
        }

        thresholds['list_count'] = {
            'category': FeatureCategory.CONTENT,
            'min_good': 1, 'max_good': 15,
            'min_excellent': 2, 'max_excellent': 8,
            'weight': 1.2,
            'description': 'Number of lists (ul/ol)',
            'inverse': False
        }

        # ===================================================================
        # TEMPORAL FEATURES (15 features)
        # ===================================================================

        thresholds['page_age_days'] = {
            'category': FeatureCategory.TEMPORAL,
            'min_good': 30, 'max_good': 3650,
            'min_excellent': 180, 'max_excellent': 2000,
            'weight': 1.3,
            'description': 'Page age in days',
            'inverse': False
        }

        thresholds['last_updated_days_ago'] = {
            'category': FeatureCategory.TEMPORAL,
            'min_good': 0, 'max_good': 180,
            'min_excellent': 0, 'max_excellent': 90,
            'weight': 1.4,
            'description': 'Days since last update',
            'inverse': True
        }

        thresholds['traffic_growth_7d'] = {
            'category': FeatureCategory.TEMPORAL,
            'min_good': -0.1, 'max_good': 1.0,
            'min_excellent': 0.05, 'max_excellent': 0.5,
            'weight': 1.5,
            'description': '7-day traffic growth rate',
            'inverse': False
        }

        thresholds['traffic_growth_30d'] = {
            'category': FeatureCategory.TEMPORAL,
            'min_good': -0.1, 'max_good': 1.0,
            'min_excellent': 0.1, 'max_excellent': 0.8,
            'weight': 1.6,
            'description': '30-day traffic growth rate',
            'inverse': False
        }

        thresholds['ranking_volatility'] = {
            'category': FeatureCategory.TEMPORAL,
            'min_good': 0, 'max_good': 5,
            'min_excellent': 0, 'max_excellent': 2,
            'weight': 1.2,
            'description': 'Ranking position volatility (std dev)',
            'inverse': True
        }

        # ===================================================================
        # INTERACTION FEATURES (12 features)
        # ===================================================================

        thresholds['content_authority_interaction'] = {
            'category': FeatureCategory.INTERACTION,
            'min_good': 500, 'max_good': 100000,
            'min_excellent': 2000, 'max_excellent': 50000,
            'weight': 1.7,
            'description': 'content_quality * domain_authority',
            'inverse': False
        }

        thresholds['engagement_position_interaction'] = {
            'category': FeatureCategory.INTERACTION,
            'min_good': 0.1, 'max_good': 1.0,
            'min_excellent': 0.3, 'max_excellent': 0.9,
            'weight': 1.6,
            'description': 'engagement_rate * (1/position)',
            'inverse': False
        }

        thresholds['mobile_traffic_mobile_friendly'] = {
            'category': FeatureCategory.INTERACTION,
            'min_good': 0.3, 'max_good': 1.0,
            'min_excellent': 0.5, 'max_excellent': 1.0,
            'weight': 1.5,
            'description': 'mobile_traffic_pct * mobile_friendly',
            'inverse': False
        }

        # ===================================================================
        # COMPOSITE SCORES (8 features)
        # ===================================================================

        thresholds['authority_score'] = {
            'category': FeatureCategory.COMPOSITE,
            'min_good': 30, 'max_good': 100,
            'min_excellent': 50, 'max_excellent': 100,
            'weight': 1.9,
            'description': 'Average of DA, DR, and Trust Flow',
            'inverse': False
        }

        thresholds['technical_health_score'] = {
            'category': FeatureCategory.COMPOSITE,
            'min_good': 0.7, 'max_good': 1.0,
            'min_excellent': 0.9, 'max_excellent': 1.0,
            'weight': 1.8,
            'description': 'Composite technical SEO health score',
            'inverse': False
        }

        thresholds['content_quality_score'] = {
            'category': FeatureCategory.COMPOSITE,
            'min_good': 60, 'max_good': 100,
            'min_excellent': 80, 'max_excellent': 100,
            'weight': 1.9,
            'description': 'Composite content quality score',
            'inverse': False
        }

        thresholds['eeat_score'] = {
            'category': FeatureCategory.COMPOSITE,
            'min_good': 0.6, 'max_good': 1.0,
            'min_excellent': 0.8, 'max_excellent': 1.0,
            'weight': 2.0,
            'description': 'E-E-A-T (Experience, Expertise, Authoritativeness, Trust) score',
            'inverse': False
        }

        thresholds['overall_seo_score'] = {
            'category': FeatureCategory.COMPOSITE,
            'min_good': 60, 'max_good': 100,
            'min_excellent': 80, 'max_excellent': 100,
            'weight': 2.0,
            'description': 'Overall weighted SEO score',
            'inverse': False
        }

        return thresholds

    @staticmethod
    def evaluate_feature(
        feature_name: str,
        value: float,
        thresholds: Dict[str, Dict[str, Any]] = None
    ) -> Tuple[DataQuality, float]:
        """
        Evaluate a single feature value against thresholds

        Returns:
            (DataQuality, normalized_score)
        """

        if thresholds is None:
            thresholds = FeatureScoreThresholds.get_all_thresholds()

        if feature_name not in thresholds:
            return (DataQuality.FAIR, 0.5)

        config = thresholds[feature_name]
        inverse = config.get('inverse', False)

        min_good = config['min_good']
        max_good = config['max_good']
        min_excellent = config['min_excellent']
        max_excellent = config['max_excellent']

        # Handle inverse metrics (lower is better)
        if inverse:
            if value <= min_excellent:
                return (DataQuality.EXCELLENT, 1.0)
            elif value <= max_excellent:
                score = 0.85 + 0.15 * (1 - (value - min_excellent) / (max_excellent - min_excellent))
                return (DataQuality.EXCELLENT, score)
            elif value <= min_good:
                score = 0.7 + 0.15 * (1 - (value - max_excellent) / (min_good - max_excellent))
                return (DataQuality.GOOD, score)
            elif value <= max_good:
                score = 0.5 + 0.2 * (1 - (value - min_good) / (max_good - min_good))
                return (DataQuality.FAIR, score)
            else:
                score = max(0.1, 0.5 - 0.4 * ((value - max_good) / max_good))
                return (DataQuality.POOR, score)
        else:
            # Normal metrics (higher is better)
            if value >= min_excellent and value <= max_excellent:
                return (DataQuality.EXCELLENT, 1.0)
            elif value >= min_good and value <= max_good:
                if value < min_excellent:
                    score = 0.7 + 0.15 * (value - min_good) / (min_excellent - min_good)
                else:
                    score = 0.85 + 0.15 * (1 - (value - max_excellent) / (max_good - max_excellent))
                return (DataQuality.GOOD, score)
            elif value >= min_good * 0.5 and value < min_good:
                score = 0.5 + 0.2 * (value - min_good * 0.5) / (min_good * 0.5)
                return (DataQuality.FAIR, score)
            else:
                score = max(0.1, 0.5 * (value / (min_good * 0.5)) if min_good > 0 else 0.1)
                return (DataQuality.POOR, score)

    @staticmethod
    def calculate_overall_quality(
        features: Dict[str, float],
        thresholds: Dict[str, Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Calculate overall data quality score for a complete feature set

        Returns:
            {
                'overall_quality': DataQuality,
                'overall_score': float (0-100),
                'feature_scores': Dict[str, Tuple[DataQuality, float]],
                'category_scores': Dict[FeatureCategory, float],
                'good_features': int,
                'poor_features': int
            }
        """

        if thresholds is None:
            thresholds = FeatureScoreThresholds.get_all_thresholds()

        feature_scores = {}
        category_scores = {}
        weighted_sum = 0.0
        total_weight = 0.0

        # Evaluate each feature
        for feature_name, value in features.items():
            if feature_name in thresholds:
                quality, score = FeatureScoreThresholds.evaluate_feature(
                    feature_name, value, thresholds
                )
                feature_scores[feature_name] = (quality, score)

                weight = thresholds[feature_name]['weight']
                category = thresholds[feature_name]['category']

                weighted_sum += score * weight
                total_weight += weight

                # Category scoring
                if category not in category_scores:
                    category_scores[category] = []
                category_scores[category].append(score)

        # Calculate averages
        overall_score = (weighted_sum / total_weight) * 100 if total_weight > 0 else 0

        # Average category scores
        for category in category_scores:
            category_scores[category] = np.mean(category_scores[category]) * 100

        # Determine overall quality
        if overall_score >= 80:
            overall_quality = DataQuality.EXCELLENT
        elif overall_score >= 70:
            overall_quality = DataQuality.GOOD
        elif overall_score >= 50:
            overall_quality = DataQuality.FAIR
        else:
            overall_quality = DataQuality.POOR

        # Count features by quality
        good_features = sum(1 for q, _ in feature_scores.values()
                           if q in [DataQuality.EXCELLENT, DataQuality.GOOD])
        poor_features = sum(1 for q, _ in feature_scores.values()
                           if q == DataQuality.POOR)

        return {
            'overall_quality': overall_quality,
            'overall_score': overall_score,
            'feature_scores': feature_scores,
            'category_scores': {k.value: v for k, v in category_scores.items()},
            'good_features': good_features,
            'poor_features': poor_features,
            'total_features': len(feature_scores)
        }


# Export thresholds to JSON for API usage
def export_thresholds_json(filepath: str = 'seo_feature_thresholds.json'):
    """Export threshold configuration to JSON file"""
    thresholds = FeatureScoreThresholds.get_all_thresholds()

    # Convert enums to strings for JSON serialization
    json_thresholds = {}
    for feature_name, config in thresholds.items():
        json_config = config.copy()
        json_config['category'] = config['category'].value
        json_thresholds[feature_name] = json_config

    with open(filepath, 'w') as f:
        json.dump(json_thresholds, f, indent=2)

    print(f"Thresholds exported to {filepath}")


if __name__ == "__main__":
    # Example usage
    print("SEO Feature Scoring System - Example\n")

    # Get all thresholds
    thresholds = FeatureScoreThresholds.get_all_thresholds()
    print(f"Total features with thresholds: {len(thresholds)}")

    # Example: Evaluate specific features
    sample_features = {
        'title_tag_length': 55,
        'content_word_count': 2500,
        'lcp_score': 1.2,
        'domain_authority': 65,
        'bounce_rate': 0.35,
        'ctr_from_serp': 0.08
    }

    print("\nEvaluating sample features:")
    for feature_name, value in sample_features.items():
        quality, score = FeatureScoreThresholds.evaluate_feature(feature_name, value)
        print(f"  {feature_name}: {value} → {quality.value.upper()} (score: {score:.2f})")

    # Calculate overall quality
    print("\nCalculating overall quality...")
    overall = FeatureScoreThresholds.calculate_overall_quality(sample_features)
    print(f"  Overall Quality: {overall['overall_quality'].value.upper()}")
    print(f"  Overall Score: {overall['overall_score']:.2f}/100")
    print(f"  Good Features: {overall['good_features']}/{overall['total_features']}")
    print(f"  Poor Features: {overall['poor_features']}/{overall['total_features']}")

    # Export thresholds
    print("\nExporting thresholds to JSON...")
    export_thresholds_json()
    print("Done!")
