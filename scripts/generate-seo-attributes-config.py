#!/usr/bin/env python3
"""
Generate comprehensive SEO attributes configuration with all 192 attributes
Based on the database schema in migrations/006_seo_attributes_and_vectors.sql
"""

import json
from typing import Dict, Any, List

def create_attribute(
    id: int,
    name: str,
    category: str,
    selector: str,
    type: str,
    ml_weight: float,
    validation: Dict[str, Any],
    scraping: Dict[str, Any],
    training: Dict[str, Any],
    seeding: Dict[str, Any] = None
) -> Dict[str, Any]:
    """Create an attribute configuration"""
    attr = {
        "id": id,
        "category": category,
        "selector": selector,
        "type": type,
        "mlWeight": ml_weight,
        "validation": validation,
        "scraping": scraping,
        "training": training
    }
    if seeding:
        attr["seeding"] = seeding
    else:
        attr["seeding"] = {
            "source": "crawler",
            "refreshFrequency": "daily",
            "qualityThreshold": 0.85
        }
    return attr

def generate_meta_attributes(start_id: int) -> Dict[str, Any]:
    """Generate META & HEAD attributes (40)"""
    attrs = {}
    id_counter = start_id
    
    # Core meta tags
    meta_attrs = [
        ("title", "title", "string", 0.15, {"required": True, "minLength": 30, "maxLength": 60}, "text", "critical"),
        ("titleLength", "computed", "integer", 0.10, {"min": 0, "max": 150}, "computed", "high"),
        ("metaDescription", "meta[name='description']", "string", 0.15, {"required": True, "minLength": 120, "maxLength": 160}, "attr", "critical"),
        ("metaDescriptionLength", "computed", "integer", 0.10, {"min": 0, "max": 300}, "computed", "high"),
        ("metaKeywords", "meta[name='keywords']", "string", 0.05, {}, "attr", "medium"),
        ("metaAuthor", "meta[name='author']", "string", 0.02, {}, "attr", "low"),
        ("metaRobots", "meta[name='robots']", "string", 0.08, {}, "attr", "high"),
        ("metaViewport", "meta[name='viewport']", "string", 0.07, {}, "attr", "medium"),
        ("canonical", "link[rel='canonical']", "url", 0.12, {}, "attr", "high"),
        ("alternate", "link[rel='alternate']", "url", 0.05, {}, "attr", "medium"),
        ("prevUrl", "link[rel='prev']", "url", 0.03, {}, "attr", "low"),
        ("nextUrl", "link[rel='next']", "url", 0.03, {}, "attr", "low"),
        
        # Open Graph
        ("ogTitle", "meta[property='og:title']", "string", 0.10, {}, "attr", "high"),
        ("ogDescription", "meta[property='og:description']", "string", 0.08, {}, "attr", "high"),
        ("ogImage", "meta[property='og:image']", "url", 0.09, {}, "attr", "high"),
        ("ogUrl", "meta[property='og:url']", "url", 0.06, {}, "attr", "medium"),
        ("ogType", "meta[property='og:type']", "string", 0.05, {}, "attr", "medium"),
        ("ogSiteName", "meta[property='og:site_name']", "string", 0.04, {}, "attr", "medium"),
        ("ogLocale", "meta[property='og:locale']", "string", 0.03, {}, "attr", "low"),
        
        # Twitter Card
        ("twitterCard", "meta[name='twitter:card']", "string", 0.06, {}, "attr", "medium"),
        ("twitterSite", "meta[name='twitter:site']", "string", 0.05, {}, "attr", "medium"),
        ("twitterCreator", "meta[name='twitter:creator']", "string", 0.04, {}, "attr", "medium"),
        ("twitterTitle", "meta[name='twitter:title']", "string", 0.06, {}, "attr", "medium"),
        ("twitterDescription", "meta[name='twitter:description']", "string", 0.05, {}, "attr", "medium"),
        ("twitterImage", "meta[name='twitter:image']", "url", 0.06, {}, "attr", "medium"),
        
        # Language & Charset
        ("lang", "html[lang]", "string", 0.06, {}, "attr", "medium"),
        ("charset", "meta[charset]", "string", 0.04, {}, "attr", "low"),
        
        # Icons
        ("favicon", "link[rel='icon']", "url", 0.03, {}, "attr", "low"),
        ("appleTouchIcon", "link[rel='apple-touch-icon']", "url", 0.03, {}, "attr", "low"),
        
        # Additional meta tags
        ("metaGenerator", "meta[name='generator']", "string", 0.01, {}, "attr", "low"),
        ("metaReferrer", "meta[name='referrer']", "string", 0.02, {}, "attr", "low"),
        ("metaThemeColor", "meta[name='theme-color']", "string", 0.02, {}, "attr", "low"),
        ("metaAppleMobileWebAppCapable", "meta[name='apple-mobile-web-app-capable']", "string", 0.03, {}, "attr", "medium"),
        ("metaAppleMobileWebAppTitle", "meta[name='apple-mobile-web-app-title']", "string", 0.02, {}, "attr", "low"),
        ("metaFormat", "meta[name='format-detection']", "string", 0.02, {}, "attr", "low"),
        ("hreflang", "link[rel='alternate'][hreflang]", "string", 0.07, {}, "attr", "medium"),
        ("amphtml", "link[rel='amphtml']", "url", 0.04, {}, "attr", "medium"),
        ("manifest", "link[rel='manifest']", "url", 0.03, {}, "attr", "low"),
        ("prefetch", "link[rel='prefetch']", "url", 0.02, {}, "attr", "low"),
        ("preconnect", "link[rel='preconnect']", "url", 0.03, {}, "attr", "medium"),
    ]
    
    for name, selector, type_val, ml_weight, validation, method, importance in meta_attrs:
        scraping_config = {
            "method": method if method in ["text", "computed"] else "attr",
            "fallback": "" if type_val == "string" else 0 if type_val == "integer" else None
        }
        if method == "attr":
            scraping_config["attribute"] = "content" if "meta[" in selector else "href"
        if method == "computed":
            scraping_config["computation"] = f"{name}.length" if "Length" in name else name
        
        attrs[name] = create_attribute(
            id_counter, name, "meta", selector, type_val, ml_weight,
            validation, scraping_config,
            {"featureType": "text" if type_val == "string" else "numerical", "importance": importance, "normalization": "none" if type_val == "string" else "minmax"}
        )
        id_counter += 1
    
    return attrs

def generate_heading_attributes(start_id: int) -> Dict[str, Any]:
    """Generate HEADING STRUCTURE attributes (20)"""
    attrs = {}
    id_counter = start_id
    
    heading_attrs = [
        ("h1Count", "h1", "integer", 0.12, {"min": 0, "max": 5, "optimal": 1}, "count", "critical"),
        ("h2Count", "h2", "integer", 0.09, {"min": 0}, "count", "high"),
        ("h3Count", "h3", "integer", 0.07, {"min": 0}, "count", "medium"),
        ("h4Count", "h4", "integer", 0.05, {"min": 0}, "count", "medium"),
        ("h5Count", "h5", "integer", 0.03, {"min": 0}, "count", "low"),
        ("h6Count", "h6", "integer", 0.02, {"min": 0}, "count", "low"),
        ("h1Text", "h1", "string", 0.14, {"required": True, "minLength": 20}, "text", "critical"),
        ("h2Text", "h2", "string", 0.10, {}, "text", "high"),
        ("h3Text", "h3", "string", 0.07, {}, "text", "medium"),
        ("totalHeadings", "h1,h2,h3,h4,h5,h6", "integer", 0.08, {"min": 1}, "count", "high"),
        ("headingHierarchyValid", "computed", "boolean", 0.09, {}, "computed", "high"),
        ("h1ContainsKeyword", "computed", "boolean", 0.10, {}, "computed", "high"),
        ("h2ContainsKeyword", "computed", "boolean", 0.07, {}, "computed", "medium"),
        ("avgHeadingLength", "computed", "float", 0.05, {}, "computed", "medium"),
        ("headingKeywordDensity", "computed", "float", 0.08, {}, "computed", "high"),
        ("headingDistribution", "computed", "float", 0.06, {}, "computed", "medium"),
        ("firstH1Position", "computed", "integer", 0.07, {}, "computed", "medium"),
        ("headingsPerSection", "computed", "float", 0.04, {}, "computed", "low"),
        ("emptyHeadings", "computed", "integer", 0.06, {}, "computed", "medium"),
        ("duplicateHeadings", "computed", "integer", 0.05, {}, "computed", "medium"),
    ]
    
    for name, selector, type_val, ml_weight, validation, method, importance in heading_attrs:
        scraping_config = {
            "method": method,
            "fallback": 0 if type_val in ["integer", "float"] else False if type_val == "boolean" else ""
        }
        if method == "count":
            scraping_config["multiple"] = True
        if method == "computed":
            scraping_config["computation"] = f"compute_{name}"
        
        attrs[name] = create_attribute(
            id_counter, name, "headings", selector, type_val, ml_weight,
            validation, scraping_config,
            {"featureType": "numerical" if type_val in ["integer", "float", "boolean"] else "text", "importance": importance, "normalization": "minmax" if type_val in ["integer", "float"] else "none"}
        )
        id_counter += 1
    
    return attrs

def generate_content_attributes(start_id: int) -> Dict[str, Any]:
    """Generate CONTENT attributes (30)"""
    attrs = {}
    id_counter = start_id
    
    content_attrs = [
        ("bodyTextLength", "body", "integer", 0.10, {"min": 300}, "computed", "high"),
        ("wordCount", "body", "integer", 0.13, {"min": 300, "optimal": 1500}, "computed", "critical"),
        ("paragraphCount", "p", "integer", 0.07, {"min": 1}, "count", "medium"),
        ("listCount", "ul,ol", "integer", 0.05, {}, "count", "medium"),
        ("listItemCount", "li", "integer", 0.04, {}, "count", "low"),
        ("tableCount", "table", "integer", 0.04, {}, "count", "low"),
        ("formCount", "form", "integer", 0.03, {}, "count", "low"),
        ("inputCount", "input", "integer", 0.02, {}, "count", "low"),
        ("buttonCount", "button", "integer", 0.02, {}, "count", "low"),
        ("textareaCount", "textarea", "integer", 0.02, {}, "count", "low"),
        ("selectCount", "select", "integer", 0.02, {}, "count", "low"),
        ("sentenceCount", "computed", "integer", 0.06, {}, "computed", "medium"),
        ("avgWordsPerSentence", "computed", "float", 0.07, {"optimal": 20}, "computed", "medium"),
        ("keywordDensity", "computed", "float", 0.11, {"min": 0.01, "max": 0.03}, "computed", "high"),
        ("readabilityScore", "computed", "float", 0.09, {"min": 60}, "computed", "high"),
        ("uniqueWordsRatio", "computed", "float", 0.06, {}, "computed", "medium"),
        ("stopWordsRatio", "computed", "float", 0.04, {}, "computed", "low"),
        ("avgParagraphLength", "computed", "float", 0.05, {}, "computed", "medium"),
        ("textToHTMLRatio", "computed", "float", 0.07, {"min": 0.25}, "computed", "medium"),
        ("contentDepth", "computed", "integer", 0.06, {}, "computed", "medium"),
        ("multimediaRatio", "computed", "float", 0.05, {}, "computed", "medium"),
        ("codeBlockCount", "pre,code", "integer", 0.03, {}, "count", "low"),
        ("blockquoteCount", "blockquote", "integer", 0.03, {}, "count", "low"),
        ("strongCount", "strong,b", "integer", 0.04, {}, "count", "low"),
        ("emCount", "em,i", "integer", 0.03, {}, "count", "low"),
        ("textQualityScore", "computed", "float", 0.09, {}, "computed", "high"),
        ("duplicateContent", "computed", "float", 0.08, {"max": 0.1}, "computed", "high"),
        ("languageConsistency", "computed", "boolean", 0.05, {}, "computed", "medium"),
        ("spellingErrors", "computed", "integer", 0.06, {"max": 5}, "computed", "medium"),
        ("contentFreshness", "computed", "float", 0.07, {}, "computed", "medium"),
    ]
    
    for name, selector, type_val, ml_weight, validation, method, importance in content_attrs:
        scraping_config = {
            "method": method,
            "fallback": 0 if type_val in ["integer", "float"] else False if type_val == "boolean" else ""
        }
        if method == "count":
            scraping_config["multiple"] = True
        if method == "computed":
            scraping_config["computation"] = f"compute_{name}"
        
        attrs[name] = create_attribute(
            id_counter, name, "content", selector, type_val, ml_weight,
            validation, scraping_config,
            {"featureType": "numerical", "importance": importance, "normalization": "minmax" if type_val in ["integer", "float"] else "none"}
        )
        id_counter += 1
    
    return attrs

def generate_links_attributes(start_id: int) -> Dict[str, Any]:
    """Generate LINKS attributes (25)"""
    attrs = {}
    id_counter = start_id
    
    links_attrs = [
        ("totalLinks", "a", "integer", 0.08, {}, "count", "high"),
        ("internalLinksCount", "computed", "integer", 0.10, {"min": 3}, "computed", "high"),
        ("externalLinksCount", "computed", "integer", 0.08, {}, "computed", "medium"),
        ("anchorLinksCount", "a[href^='#']", "integer", 0.04, {}, "count", "low"),
        ("nofollowLinksCount", "a[rel*='nofollow']", "integer", 0.06, {}, "count", "medium"),
        ("dofollowLinksCount", "computed", "integer", 0.07, {}, "computed", "medium"),
        ("internalToExternalRatio", "computed", "float", 0.09, {"optimal": 3.0}, "computed", "high"),
        ("emptyHrefCount", "a[href=''],a[href='#']", "integer", 0.05, {"max": 0}, "count", "medium"),
        ("brokenLinksCount", "computed", "integer", 0.08, {"max": 0}, "computed", "high"),
        ("redirectLinksCount", "computed", "integer", 0.05, {}, "computed", "medium"),
        ("linkTextQuality", "computed", "float", 0.09, {}, "computed", "high"),
        ("navigationLinksCount", "nav a", "integer", 0.06, {"min": 5}, "count", "medium"),
        ("footerLinksCount", "footer a", "integer", 0.04, {}, "count", "low"),
        ("avgLinkTextLength", "computed", "float", 0.05, {"min": 15}, "computed", "medium"),
        ("linksWithTitle", "a[title]", "integer", 0.05, {}, "count", "medium"),
        ("uniqueLinkDestinations", "computed", "integer", 0.06, {}, "computed", "medium"),
        ("deepLinksRatio", "computed", "float", 0.07, {}, "computed", "medium"),
        ("linkDiversity", "computed", "float", 0.06, {}, "computed", "medium"),
        ("ugcLinks", "a[rel*='ugc']", "integer", 0.03, {}, "count", "low"),
        ("sponsoredLinks", "a[rel*='sponsored']", "integer", 0.04, {}, "count", "low"),
        ("targetBlankLinks", "a[target='_blank']", "integer", 0.04, {}, "count", "low"),
        ("javascriptLinks", "a[href^='javascript:']", "integer", 0.03, {"max": 0}, "count", "low"),
        ("mailtoLinks", "a[href^='mailto:']", "integer", 0.02, {}, "count", "low"),
        ("telLinks", "a[href^='tel:']", "integer", 0.02, {}, "count", "low"),
        ("downloadLinks", "a[download]", "integer", 0.03, {}, "count", "low"),
    ]
    
    for name, selector, type_val, ml_weight, validation, method, importance in links_attrs:
        scraping_config = {
            "method": method,
            "fallback": 0 if type_val in ["integer", "float"] else ""
        }
        if method == "count":
            scraping_config["multiple"] = True
        if method == "computed":
            scraping_config["computation"] = f"compute_{name}"
        
        attrs[name] = create_attribute(
            id_counter, name, "links", selector, type_val, ml_weight,
            validation, scraping_config,
            {"featureType": "numerical", "importance": importance, "normalization": "minmax"}
        )
        id_counter += 1
    
    return attrs

def generate_images_attributes(start_id: int) -> Dict[str, Any]:
    """Generate IMAGES attributes (20)"""
    attrs = {}
    id_counter = start_id
    
    images_attrs = [
        ("totalImages", "img", "integer", 0.07, {}, "count", "medium"),
        ("imagesWithAlt", "img[alt]", "integer", 0.11, {}, "count", "high"),
        ("imagesWithoutAlt", "computed", "integer", 0.10, {"max": 0}, "computed", "high"),
        ("imagesWithTitle", "img[title]", "integer", 0.05, {}, "count", "medium"),
        ("imagesWithLazyLoad", "img[loading='lazy']", "integer", 0.06, {}, "count", "medium"),
        ("altTextCoverage", "computed", "float", 0.12, {"min": 0.95}, "computed", "critical"),
        ("avgAltTextLength", "computed", "float", 0.08, {"min": 50, "max": 125}, "computed", "high"),
        ("imagesWithEmptyAlt", "img[alt='']", "integer", 0.06, {}, "count", "medium"),
        ("responsiveImages", "img[srcset]", "integer", 0.07, {}, "count", "medium"),
        ("imagesWithWebP", "computed", "integer", 0.05, {}, "computed", "medium"),
        ("imageSizeOptimized", "computed", "float", 0.06, {}, "computed", "medium"),
        ("decorativeImages", "computed", "integer", 0.04, {}, "computed", "low"),
        ("contentImages", "computed", "integer", 0.06, {}, "computed", "medium"),
        ("svgCount", "svg", "integer", 0.04, {}, "count", "low"),
        ("pictureElements", "picture", "integer", 0.05, {}, "count", "medium"),
        ("figureElements", "figure", "integer", 0.05, {}, "count", "medium"),
        ("figcaptionElements", "figcaption", "integer", 0.04, {}, "count", "low"),
        ("imageAspectRatios", "computed", "string", 0.03, {}, "computed", "low"),
        ("brokenImagesCount", "computed", "integer", 0.07, {"max": 0}, "computed", "high"),
        ("imagesToTextRatio", "computed", "float", 0.05, {}, "computed", "medium"),
    ]
    
    for name, selector, type_val, ml_weight, validation, method, importance in images_attrs:
        scraping_config = {
            "method": method,
            "fallback": 0 if type_val in ["integer", "float"] else ""
        }
        if method == "count":
            scraping_config["multiple"] = True
        if method == "computed":
            scraping_config["computation"] = f"compute_{name}"
        
        attrs[name] = create_attribute(
            id_counter, name, "images", selector, type_val, ml_weight,
            validation, scraping_config,
            {"featureType": "numerical" if type_val != "string" else "categorical", "importance": importance, "normalization": "minmax" if type_val in ["integer", "float"] else "none"}
        )
        id_counter += 1
    
    return attrs

def generate_structured_data_attributes(start_id: int) -> Dict[str, Any]:
    """Generate STRUCTURED DATA attributes (15)"""
    attrs = {}
    id_counter = start_id
    
    structured_attrs = [
        ("structuredDataCount", "script[type='application/ld+json']", "integer", 0.13, {"min": 1}, "count", "critical"),
        ("schemaTypes", "computed", "string", 0.11, {}, "computed", "high"),
        ("hasArticleSchema", "computed", "boolean", 0.10, {}, "computed", "high"),
        ("hasProductSchema", "computed", "boolean", 0.09, {}, "computed", "high"),
        ("hasOrganizationSchema", "computed", "boolean", 0.08, {}, "computed", "high"),
        ("hasBreadcrumbSchema", "computed", "boolean", 0.09, {}, "computed", "high"),
        ("itemscopeCount", "[itemscope]", "integer", 0.06, {}, "count", "medium"),
        ("itempropCount", "[itemprop]", "integer", 0.05, {}, "count", "medium"),
        ("hasPersonSchema", "computed", "boolean", 0.06, {}, "computed", "medium"),
        ("hasLocalBusinessSchema", "computed", "boolean", 0.07, {}, "computed", "medium"),
        ("hasEventSchema", "computed", "boolean", 0.06, {}, "computed", "medium"),
        ("hasRecipeSchema", "computed", "boolean", 0.05, {}, "computed", "medium"),
        ("schemaValidationErrors", "computed", "integer", 0.09, {"max": 0}, "computed", "high"),
        ("richSnippetEligibility", "computed", "float", 0.10, {}, "computed", "high"),
        ("structuredDataCoverage", "computed", "float", 0.08, {"min": 0.8}, "computed", "high"),
    ]
    
    for name, selector, type_val, ml_weight, validation, method, importance in structured_attrs:
        scraping_config = {
            "method": method,
            "fallback": 0 if type_val in ["integer", "float"] else False if type_val == "boolean" else ""
        }
        if method == "count":
            scraping_config["multiple"] = True
        if method == "computed":
            scraping_config["computation"] = f"compute_{name}"
        
        attrs[name] = create_attribute(
            id_counter, name, "structured_data", selector, type_val, ml_weight,
            validation, scraping_config,
            {"featureType": "numerical" if type_val in ["integer", "float", "boolean"] else "categorical", "importance": importance, "normalization": "minmax" if type_val in ["integer", "float"] else "none"}
        )
        id_counter += 1
    
    return attrs

def generate_performance_attributes(start_id: int) -> Dict[str, Any]:
    """Generate PERFORMANCE attributes (15)"""
    attrs = {}
    id_counter = start_id
    
    performance_attrs = [
        ("htmlSize", "computed", "integer", 0.08, {"max": 500000}, "computed", "high"),
        ("cssLinkCount", "link[rel='stylesheet']", "integer", 0.06, {"max": 5}, "count", "medium"),
        ("jsScriptCount", "script[src]", "integer", 0.07, {"max": 10}, "count", "medium"),
        ("inlineScriptCount", "script:not([src])", "integer", 0.05, {"max": 3}, "count", "medium"),
        ("inlineStyleCount", "style", "integer", 0.04, {"max": 2}, "count", "low"),
        ("prefetchCount", "link[rel='prefetch']", "integer", 0.04, {}, "count", "medium"),
        ("preconnectCount", "link[rel='preconnect']", "integer", 0.05, {}, "count", "medium"),
        ("preloadCount", "link[rel='preload']", "integer", 0.05, {}, "count", "medium"),
        ("dnsPreconnectCount", "link[rel='dns-prefetch']", "integer", 0.04, {}, "count", "low"),
        ("criticalCSSInlined", "computed", "boolean", 0.06, {}, "computed", "medium"),
        ("asyncScriptsCount", "script[async]", "integer", 0.05, {}, "count", "medium"),
        ("deferScriptsCount", "script[defer]", "integer", 0.05, {}, "count", "medium"),
        ("resourceHintsOptimized", "computed", "boolean", 0.06, {}, "computed", "medium"),
        ("renderBlockingResources", "computed", "integer", 0.08, {"max": 2}, "computed", "high"),
        ("totalResourceSize", "computed", "integer", 0.07, {}, "computed", "medium"),
    ]
    
    for name, selector, type_val, ml_weight, validation, method, importance in performance_attrs:
        scraping_config = {
            "method": method,
            "fallback": 0 if type_val in ["integer", "float"] else False if type_val == "boolean" else ""
        }
        if method == "count":
            scraping_config["multiple"] = True
        if method == "computed":
            scraping_config["computation"] = f"compute_{name}"
        
        attrs[name] = create_attribute(
            id_counter, name, "performance", selector, type_val, ml_weight,
            validation, scraping_config,
            {"featureType": "numerical", "importance": importance, "normalization": "minmax"}
        )
        id_counter += 1
    
    return attrs

def generate_accessibility_attributes(start_id: int) -> Dict[str, Any]:
    """Generate ACCESSIBILITY attributes (10)"""
    attrs = {}
    id_counter = start_id
    
    accessibility_attrs = [
        ("hasViewportMeta", "meta[name='viewport']", "boolean", 0.09, {}, "computed", "high"),
        ("hasAppleMobileWebAppCapable", "meta[name='apple-mobile-web-app-capable']", "boolean", 0.04, {}, "computed", "low"),
        ("hasThemeColor", "meta[name='theme-color']", "boolean", 0.05, {}, "computed", "medium"),
        ("ariaLabelCount", "[aria-label]", "integer", 0.08, {}, "count", "high"),
        ("ariaDescribedbyCount", "[aria-describedby]", "integer", 0.06, {}, "count", "medium"),
        ("roleCount", "[role]", "integer", 0.07, {}, "count", "medium"),
        ("accessibilityScore", "computed", "float", 0.11, {"min": 80}, "computed", "critical"),
        ("colorContrastIssues", "computed", "integer", 0.09, {"max": 0}, "computed", "high"),
        ("keyboardNavigable", "computed", "boolean", 0.08, {}, "computed", "high"),
        ("skipNavigation", "a[href^='#']", "boolean", 0.06, {}, "computed", "medium"),
    ]
    
    for name, selector, type_val, ml_weight, validation, method, importance in accessibility_attrs:
        scraping_config = {
            "method": method if method in ["computed", "count"] else "count",
            "fallback": 0 if type_val in ["integer", "float"] else False if type_val == "boolean" else ""
        }
        if method == "count":
            scraping_config["multiple"] = True
        if method == "computed":
            scraping_config["computation"] = f"compute_{name}"
        
        attrs[name] = create_attribute(
            id_counter, name, "accessibility", selector, type_val, ml_weight,
            validation, scraping_config,
            {"featureType": "numerical", "importance": importance, "normalization": "minmax" if type_val in ["integer", "float"] else "none"}
        )
        id_counter += 1
    
    return attrs

def generate_url_structure_attributes(start_id: int) -> Dict[str, Any]:
    """Generate URL STRUCTURE attributes (10)"""
    attrs = {}
    id_counter = start_id
    
    url_attrs = [
        ("protocol", "computed", "string", 0.06, {}, "computed", "medium"),
        ("hostname", "computed", "string", 0.05, {}, "computed", "medium"),
        ("pathname", "computed", "string", 0.06, {}, "computed", "medium"),
        ("pathnameLength", "computed", "integer", 0.07, {"max": 100}, "computed", "medium"),
        ("pathDepth", "computed", "integer", 0.08, {"max": 4}, "computed", "high"),
        ("hasQueryParams", "computed", "boolean", 0.05, {}, "computed", "medium"),
        ("queryParamCount", "computed", "integer", 0.04, {"max": 5}, "computed", "low"),
        ("hasFragment", "computed", "boolean", 0.03, {}, "computed", "low"),
        ("isSecure", "computed", "boolean", 0.11, {}, "computed", "critical"),
        ("urlSeoFriendly", "computed", "boolean", 0.09, {}, "computed", "high"),
    ]
    
    for name, selector, type_val, ml_weight, validation, method, importance in url_attrs:
        scraping_config = {
            "method": "computed",
            "computation": f"compute_{name}",
            "fallback": 0 if type_val in ["integer", "float"] else False if type_val == "boolean" else ""
        }
        
        attrs[name] = create_attribute(
            id_counter, name, "url_structure", selector, type_val, ml_weight,
            validation, scraping_config,
            {"featureType": "numerical" if type_val in ["integer", "float", "boolean"] else "categorical", "importance": importance, "normalization": "minmax" if type_val in ["integer", "float"] else "none"}
        )
        id_counter += 1
    
    return attrs

def generate_social_attributes(start_id: int) -> Dict[str, Any]:
    """Generate SOCIAL SIGNALS attributes (8)"""
    attrs = {}
    id_counter = start_id
    
    social_attrs = [
        ("facebookCount", "a[href*='facebook.com']", "integer", 0.05, {}, "count", "medium"),
        ("twitterCount", "a[href*='twitter.com'],a[href*='x.com']", "integer", 0.05, {}, "count", "medium"),
        ("linkedinCount", "a[href*='linkedin.com']", "integer", 0.04, {}, "count", "low"),
        ("instagramCount", "a[href*='instagram.com']", "integer", 0.04, {}, "count", "low"),
        ("youtubeCount", "a[href*='youtube.com']", "integer", 0.04, {}, "count", "low"),
        ("pinterestCount", "a[href*='pinterest.com']", "integer", 0.03, {}, "count", "low"),
        ("socialShareCount", "computed", "integer", 0.06, {}, "computed", "medium"),
        ("socialMediaPresence", "computed", "float", 0.07, {}, "computed", "medium"),
    ]
    
    for name, selector, type_val, ml_weight, validation, method, importance in social_attrs:
        scraping_config = {
            "method": method,
            "fallback": 0,
            "multiple": True if method == "count" else False
        }
        if method == "computed":
            scraping_config["computation"] = f"compute_{name}"
        
        attrs[name] = create_attribute(
            id_counter, name, "social", selector, type_val, ml_weight,
            validation, scraping_config,
            {"featureType": "numerical", "importance": importance, "normalization": "minmax"}
        )
        id_counter += 1
    
    return attrs

def generate_security_attributes(start_id: int) -> Dict[str, Any]:
    """Generate SECURITY attributes (8)"""
    attrs = {}
    id_counter = start_id
    
    security_attrs = [
        ("hasHttpsInLinks", "computed", "boolean", 0.08, {}, "computed", "high"),
        ("hasInsecureContent", "computed", "boolean", 0.09, {}, "computed", "high"),
        ("hasIframe", "iframe", "boolean", 0.06, {}, "computed", "medium"),
        ("iframeCount", "iframe", "integer", 0.05, {"max": 2}, "count", "medium"),
        ("hasExternalScripts", "script[src*='http']", "boolean", 0.07, {}, "computed", "medium"),
        ("hasCrossoriginLinks", "link[crossorigin],script[crossorigin]", "boolean", 0.05, {}, "computed", "medium"),
        ("mixedContentIssues", "computed", "integer", 0.08, {"max": 0}, "computed", "high"),
        ("securityHeadersPresent", "computed", "boolean", 0.07, {}, "computed", "medium"),
    ]
    
    for name, selector, type_val, ml_weight, validation, method, importance in security_attrs:
        scraping_config = {
            "method": method if method in ["computed"] else "count",
            "fallback": 0 if type_val in ["integer", "float"] else False
        }
        if method == "count":
            scraping_config["multiple"] = True
        if method == "computed":
            scraping_config["computation"] = f"compute_{name}"
        
        attrs[name] = create_attribute(
            id_counter, name, "security", selector, type_val, ml_weight,
            validation, scraping_config,
            {"featureType": "numerical", "importance": importance, "normalization": "minmax" if type_val in ["integer", "float"] else "none"}
        )
        id_counter += 1
    
    return attrs

def generate_score_attributes(start_id: int) -> Dict[str, Any]:
    """Generate COMPUTED SCORES attributes (5)"""
    attrs = {}
    id_counter = start_id
    
    score_attrs = [
        ("seoScore", "computed", "float", 0.20, {"min": 0, "max": 100}, "computed", "critical"),
        ("contentQualityScore", "computed", "float", 0.15, {"min": 0, "max": 100}, "computed", "critical"),
        ("technicalScore", "computed", "float", 0.15, {"min": 0, "max": 100}, "computed", "critical"),
        ("overallScore", "computed", "float", 0.25, {"min": 0, "max": 100}, "computed", "critical"),
        ("mobileScore", "computed", "float", 0.12, {"min": 0, "max": 100}, "computed", "high"),
    ]
    
    for name, selector, type_val, ml_weight, validation, method, importance in score_attrs:
        scraping_config = {
            "method": "computed",
            "computation": f"compute_{name}",
            "fallback": 0
        }
        
        attrs[name] = create_attribute(
            id_counter, name, "scores", selector, type_val, ml_weight,
            validation, scraping_config,
            {"featureType": "numerical", "importance": importance, "normalization": "minmax"}
        )
        id_counter += 1
    
    return attrs

def generate_optimization_recommendations() -> Dict[str, Any]:
    """Generate optimization recommendations"""
    return {
        "title_optimization": {
            "id": 1,
            "name": "Title Tag Optimization",
            "description": "Optimize title tag length and keyword placement",
            "priority": "critical",
            "confidence": 0.95,
            "requiredAttributes": ["title", "titleLength", "h1Text"],
            "conditions": [
                {"attribute": "titleLength", "operator": "<", "value": 30},
                {"attribute": "titleLength", "operator": ">", "value": 60}
            ],
            "actions": [
                {
                    "type": "modify",
                    "target": "title",
                    "method": "optimize_length",
                    "params": {"minLength": 30, "maxLength": 60, "includeKeyword": True}
                }
            ]
        },
        "meta_description_optimization": {
            "id": 2,
            "name": "Meta Description Optimization",
            "description": "Optimize meta description for better CTR",
            "priority": "critical",
            "confidence": 0.93,
            "requiredAttributes": ["metaDescription", "metaDescriptionLength"],
            "conditions": [
                {"attribute": "metaDescriptionLength", "operator": "<", "value": 120},
                {"attribute": "metaDescriptionLength", "operator": ">", "value": 160}
            ],
            "actions": [
                {
                    "type": "modify",
                    "target": "metaDescription",
                    "method": "optimize_length",
                    "params": {"minLength": 120, "maxLength": 160, "includeCallToAction": True}
                }
            ]
        },
        "h1_optimization": {
            "id": 3,
            "name": "H1 Tag Optimization",
            "description": "Ensure single H1 tag with proper keyword usage",
            "priority": "high",
            "confidence": 0.92,
            "requiredAttributes": ["h1Count", "h1Text"],
            "conditions": [
                {"attribute": "h1Count", "operator": "!=", "value": 1}
            ],
            "actions": [
                {
                    "type": "restructure",
                    "target": "h1",
                    "method": "consolidate_headings",
                    "params": {"targetCount": 1, "preserveKeywords": True}
                }
            ]
        },
        "alt_text_coverage": {
            "id": 4,
            "name": "Image Alt Text Coverage",
            "description": "Add alt text to all images",
            "priority": "high",
            "confidence": 0.90,
            "requiredAttributes": ["altTextCoverage", "imagesWithoutAlt"],
            "conditions": [
                {"attribute": "altTextCoverage", "operator": "<", "value": 0.95}
            ],
            "actions": [
                {
                    "type": "add",
                    "target": "img[alt=''],img:not([alt])",
                    "method": "generate_alt_text",
                    "params": {"useAI": True, "includeContext": True}
                }
            ]
        },
        "structured_data_implementation": {
            "id": 5,
            "name": "Structured Data Implementation",
            "description": "Add schema.org structured data for better rich snippets",
            "priority": "high",
            "confidence": 0.88,
            "requiredAttributes": ["structuredDataCount"],
            "conditions": [
                {"attribute": "structuredDataCount", "operator": "==", "value": 0}
            ],
            "actions": [
                {
                    "type": "inject",
                    "target": "head",
                    "method": "add_structured_data",
                    "params": {"schemaTypes": ["WebPage", "Organization", "BreadcrumbList"], "validate": True}
                }
            ]
        }
    }

def generate_full_config() -> Dict[str, Any]:
    """Generate the complete SEO attributes configuration"""
    
    # Generate all attribute categories
    id_counter = 1
    all_attributes = {}
    
    # Add attributes from each category
    all_attributes.update(generate_meta_attributes(id_counter))
    id_counter += len(all_attributes)
    
    all_attributes.update(generate_heading_attributes(id_counter))
    id_counter = max(attr["id"] for attr in all_attributes.values()) + 1
    
    all_attributes.update(generate_content_attributes(id_counter))
    id_counter = max(attr["id"] for attr in all_attributes.values()) + 1
    
    all_attributes.update(generate_links_attributes(id_counter))
    id_counter = max(attr["id"] for attr in all_attributes.values()) + 1
    
    all_attributes.update(generate_images_attributes(id_counter))
    id_counter = max(attr["id"] for attr in all_attributes.values()) + 1
    
    all_attributes.update(generate_structured_data_attributes(id_counter))
    id_counter = max(attr["id"] for attr in all_attributes.values()) + 1
    
    all_attributes.update(generate_performance_attributes(id_counter))
    id_counter = max(attr["id"] for attr in all_attributes.values()) + 1
    
    all_attributes.update(generate_accessibility_attributes(id_counter))
    id_counter = max(attr["id"] for attr in all_attributes.values()) + 1
    
    all_attributes.update(generate_url_structure_attributes(id_counter))
    id_counter = max(attr["id"] for attr in all_attributes.values()) + 1
    
    all_attributes.update(generate_social_attributes(id_counter))
    id_counter = max(attr["id"] for attr in all_attributes.values()) + 1
    
    all_attributes.update(generate_security_attributes(id_counter))
    id_counter = max(attr["id"] for attr in all_attributes.values()) + 1
    
    all_attributes.update(generate_score_attributes(id_counter))
    
    # Generate optimization recommendations
    optimizations = generate_optimization_recommendations()
    
    # Create full configuration
    config = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "SEO Attributes Configuration",
        "description": "Complete configuration for 192 SEO attributes with scraping, validation, and ML training rules",
        "version": "2.0.0",
        "attributes": all_attributes,
        "optimizationRecommendations": optimizations,
        "trainingConfiguration": {
            "modelType": "xgboost",
            "hyperparameters": {
                "learning_rate": 0.05,
                "max_depth": 6,
                "n_estimators": 400,
                "subsample": 0.8
            },
            "features": {
                "numerical": ["titleLength", "wordCount", "h1Count", "totalLinks"],
                "categorical": ["protocol", "lang", "schemaTypes"],
                "text": ["title", "metaDescription", "h1Text"],
                "computed": ["seoScore", "contentQualityScore", "technicalScore"]
            },
            "validation": {
                "method": "cross_validation",
                "folds": 5,
                "testSize": 0.2
            },
            "dataAugmentation": {
                "enabled": True,
                "methods": ["synonym_replacement", "back_translation"]
            },
            "featureEngineering": {
                "textEmbeddings": "bert-base-uncased",
                "categoricalEncoding": "one-hot",
                "numericalNormalization": "zscore",
                "interactionFeatures": True
            }
        },
        "metadata": {
            "version": "2.0.0",
            "lastUpdated": "2025-11-16",
            "totalAttributes": len(all_attributes),
            "totalOptimizations": len(optimizations),
            "author": "LightDom AI Team",
            "license": "MIT"
        }
    }
    
    return config

if __name__ == "__main__":
    print("🚀 Generating comprehensive SEO attributes configuration...")
    
    config = generate_full_config()
    
    # Write to file
    output_path = "../config/seo-attributes.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Generated {len(config['attributes'])} attributes")
    print(f"✅ Generated {len(config['optimizationRecommendations'])} optimization recommendations")
    print(f"✅ Configuration saved to {output_path}")
    
    # Print category breakdown
    categories = {}
    for attr in config['attributes'].values():
        cat = attr['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\n📊 Category breakdown:")
    for cat, count in sorted(categories.items()):
        print(f"   {cat}: {count}")
