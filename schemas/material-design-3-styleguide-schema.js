/**
 * Material Design 3 Style Guide Schema Template
 * 
 * Complete schema template based on Material Design 3.0 specifications.
 * This serves as the foundation for generating style guides and components.
 * 
 * Includes:
 * - Complete color system (primary, secondary, tertiary, error, neutral)
 * - Typography scale with semantic roles
 * - Spacing system (8px grid)
 * - Elevation and shadows
 * - Border radius scale
 * - Motion and animation
 * - Component specifications
 * - State layers
 * - Accessibility guidelines
 */

export const MaterialDesign3StyleGuideSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://lightdom.app/schemas/material-design-3-styleguide.json",
  "title": "Material Design 3 Style Guide",
  "description": "Complete Material Design 3.0 style guide schema with all design tokens and component specifications",
  "type": "object",
  "version": "3.0.0",
  
  "properties": {
    "metadata": {
      "type": "object",
      "title": "Style Guide Metadata",
      "description": "Information about the style guide",
      "properties": {
        "name": { "type": "string", "description": "Name of the design system" },
        "version": { "type": "string", "description": "Version number" },
        "description": { "type": "string", "description": "Description of the design system" },
        "author": { "type": "string", "description": "Author or organization" },
        "basedOn": { "type": "string", "default": "Material Design 3.0" },
        "generated": { "type": "string", "format": "date-time" },
        "url": { "type": "string", "format": "uri", "description": "Source URL if extracted from existing site" }
      },
      "required": ["name", "version"]
    },

    "tokens": {
      "type": "object",
      "title": "Design Tokens",
      "description": "All design tokens for the system",
      "properties": {
        "colors": {
          "type": "object",
          "title": "Color System",
          "description": "Complete Material Design 3 color system",
          "properties": {
            "primary": {
              "type": "object",
              "title": "Primary Color Palette",
              "description": "Main brand color with tonal variations",
              "properties": {
                "0": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$", "description": "Pure black" },
                "10": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$", "description": "Darkest shade" },
                "20": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" },
                "30": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" },
                "40": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$", "description": "Default primary" },
                "50": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" },
                "60": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" },
                "70": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" },
                "80": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" },
                "90": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" },
                "95": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" },
                "99": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" },
                "100": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$", "description": "Pure white" }
              }
            },
            "secondary": {
              "$ref": "#/properties/tokens/properties/colors/properties/primary"
            },
            "tertiary": {
              "$ref": "#/properties/tokens/properties/colors/properties/primary"
            },
            "error": {
              "$ref": "#/properties/tokens/properties/colors/properties/primary"
            },
            "neutral": {
              "$ref": "#/properties/tokens/properties/colors/properties/primary"
            },
            "neutralVariant": {
              "$ref": "#/properties/tokens/properties/colors/properties/primary"
            },
            "semantic": {
              "type": "object",
              "title": "Semantic Colors",
              "description": "Purpose-specific colors",
              "properties": {
                "success": { "$ref": "#/properties/tokens/properties/colors/properties/primary" },
                "warning": { "$ref": "#/properties/tokens/properties/colors/properties/primary" },
                "info": { "$ref": "#/properties/tokens/properties/colors/properties/primary" }
              }
            }
          }
        },

        "typography": {
          "type": "object",
          "title": "Typography System",
          "description": "Complete typography scale with semantic roles",
          "properties": {
            "fontFamilies": {
              "type": "object",
              "properties": {
                "brand": { "type": "string", "description": "Brand font family" },
                "plain": { "type": "string", "description": "Body text font family" },
                "code": { "type": "string", "description": "Monospace font family" }
              }
            },
            "typeScale": {
              "type": "object",
              "title": "Type Scale",
              "description": "Material Design 3 type scale",
              "properties": {
                "displayLarge": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "57px / 3.562rem" },
                    "lineHeight": { "type": "string", "description": "64px" },
                    "fontWeight": { "type": "number", "default": 400 },
                    "letterSpacing": { "type": "string", "default": "-0.25px" }
                  }
                },
                "displayMedium": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "45px / 2.812rem" },
                    "lineHeight": { "type": "string", "description": "52px" },
                    "fontWeight": { "type": "number", "default": 400 },
                    "letterSpacing": { "type": "string", "default": "0px" }
                  }
                },
                "displaySmall": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "36px / 2.25rem" },
                    "lineHeight": { "type": "string", "description": "44px" },
                    "fontWeight": { "type": "number", "default": 400 },
                    "letterSpacing": { "type": "string", "default": "0px" }
                  }
                },
                "headlineLarge": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "32px / 2rem" },
                    "lineHeight": { "type": "string", "description": "40px" },
                    "fontWeight": { "type": "number", "default": 400 },
                    "letterSpacing": { "type": "string", "default": "0px" }
                  }
                },
                "headlineMedium": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "28px / 1.75rem" },
                    "lineHeight": { "type": "string", "description": "36px" },
                    "fontWeight": { "type": "number", "default": 400 },
                    "letterSpacing": { "type": "string", "default": "0px" }
                  }
                },
                "headlineSmall": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "24px / 1.5rem" },
                    "lineHeight": { "type": "string", "description": "32px" },
                    "fontWeight": { "type": "number", "default": 400 },
                    "letterSpacing": { "type": "string", "default": "0px" }
                  }
                },
                "titleLarge": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "22px / 1.375rem" },
                    "lineHeight": { "type": "string", "description": "28px" },
                    "fontWeight": { "type": "number", "default": 400 },
                    "letterSpacing": { "type": "string", "default": "0px" }
                  }
                },
                "titleMedium": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "16px / 1rem" },
                    "lineHeight": { "type": "string", "description": "24px" },
                    "fontWeight": { "type": "number", "default": 500 },
                    "letterSpacing": { "type": "string", "default": "0.15px" }
                  }
                },
                "titleSmall": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "14px / 0.875rem" },
                    "lineHeight": { "type": "string", "description": "20px" },
                    "fontWeight": { "type": "number", "default": 500 },
                    "letterSpacing": { "type": "string", "default": "0.1px" }
                  }
                },
                "bodyLarge": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "16px / 1rem" },
                    "lineHeight": { "type": "string", "description": "24px" },
                    "fontWeight": { "type": "number", "default": 400 },
                    "letterSpacing": { "type": "string", "default": "0.5px" }
                  }
                },
                "bodyMedium": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "14px / 0.875rem" },
                    "lineHeight": { "type": "string", "description": "20px" },
                    "fontWeight": { "type": "number", "default": 400 },
                    "letterSpacing": { "type": "string", "default": "0.25px" }
                  }
                },
                "bodySmall": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "12px / 0.75rem" },
                    "lineHeight": { "type": "string", "description": "16px" },
                    "fontWeight": { "type": "number", "default": 400 },
                    "letterSpacing": { "type": "string", "default": "0.4px" }
                  }
                },
                "labelLarge": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "14px / 0.875rem" },
                    "lineHeight": { "type": "string", "description": "20px" },
                    "fontWeight": { "type": "number", "default": 500 },
                    "letterSpacing": { "type": "string", "default": "0.1px" }
                  }
                },
                "labelMedium": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "12px / 0.75rem" },
                    "lineHeight": { "type": "string", "description": "16px" },
                    "fontWeight": { "type": "number", "default": 500 },
                    "letterSpacing": { "type": "string", "default": "0.5px" }
                  }
                },
                "labelSmall": {
                  "type": "object",
                  "properties": {
                    "fontSize": { "type": "string", "description": "11px / 0.688rem" },
                    "lineHeight": { "type": "string", "description": "16px" },
                    "fontWeight": { "type": "number", "default": 500 },
                    "letterSpacing": { "type": "string", "default": "0.5px" }
                  }
                }
              }
            }
          }
        },

        "spacing": {
          "type": "object",
          "title": "Spacing System",
          "description": "8px grid-based spacing system",
          "properties": {
            "baseUnit": { "type": "number", "default": 8, "description": "Base spacing unit in pixels" },
            "scale": {
              "type": "object",
              "properties": {
                "0": { "type": "string", "default": "0px" },
                "1": { "type": "string", "default": "4px", "description": "0.5 units" },
                "2": { "type": "string", "default": "8px", "description": "1 unit" },
                "3": { "type": "string", "default": "12px", "description": "1.5 units" },
                "4": { "type": "string", "default": "16px", "description": "2 units" },
                "5": { "type": "string", "default": "20px", "description": "2.5 units" },
                "6": { "type": "string", "default": "24px", "description": "3 units" },
                "7": { "type": "string", "default": "28px", "description": "3.5 units" },
                "8": { "type": "string", "default": "32px", "description": "4 units" },
                "10": { "type": "string", "default": "40px", "description": "5 units" },
                "12": { "type": "string", "default": "48px", "description": "6 units" },
                "16": { "type": "string", "default": "64px", "description": "8 units" },
                "20": { "type": "string", "default": "80px", "description": "10 units" },
                "24": { "type": "string", "default": "96px", "description": "12 units" },
                "32": { "type": "string", "default": "128px", "description": "16 units" }
              }
            }
          }
        },

        "elevation": {
          "type": "object",
          "title": "Elevation System",
          "description": "Material Design elevation levels",
          "properties": {
            "level0": { "type": "string", "description": "No elevation (flat on surface)" },
            "level1": { "type": "string", "description": "0px 1px 2px 0px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15)" },
            "level2": { "type": "string", "description": "0px 1px 2px 0px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15)" },
            "level3": { "type": "string", "description": "0px 4px 8px 3px rgba(0,0,0,0.15), 0px 1px 3px 0px rgba(0,0,0,0.3)" },
            "level4": { "type": "string", "description": "0px 6px 10px 4px rgba(0,0,0,0.15), 0px 2px 3px 0px rgba(0,0,0,0.3)" },
            "level5": { "type": "string", "description": "0px 8px 12px 6px rgba(0,0,0,0.15), 0px 4px 4px 0px rgba(0,0,0,0.3)" }
          }
        },

        "shape": {
          "type": "object",
          "title": "Shape System",
          "description": "Border radius scale",
          "properties": {
            "none": { "type": "string", "default": "0px" },
            "extraSmall": { "type": "string", "default": "4px" },
            "small": { "type": "string", "default": "8px" },
            "medium": { "type": "string", "default": "12px" },
            "large": { "type": "string", "default": "16px" },
            "extraLarge": { "type": "string", "default": "28px" },
            "full": { "type": "string", "default": "9999px" }
          }
        },

        "motion": {
          "type": "object",
          "title": "Motion System",
          "description": "Animation and transition specifications",
          "properties": {
            "durations": {
              "type": "object",
              "properties": {
                "short1": { "type": "string", "default": "50ms" },
                "short2": { "type": "string", "default": "100ms" },
                "short3": { "type": "string", "default": "150ms" },
                "short4": { "type": "string", "default": "200ms" },
                "medium1": { "type": "string", "default": "250ms" },
                "medium2": { "type": "string", "default": "300ms" },
                "medium3": { "type": "string", "default": "350ms" },
                "medium4": { "type": "string", "default": "400ms" },
                "long1": { "type": "string", "default": "450ms" },
                "long2": { "type": "string", "default": "500ms" },
                "long3": { "type": "string", "default": "550ms" },
                "long4": { "type": "string", "default": "600ms" },
                "extraLong1": { "type": "string", "default": "700ms" },
                "extraLong2": { "type": "string", "default": "800ms" },
                "extraLong3": { "type": "string", "default": "900ms" },
                "extraLong4": { "type": "string", "default": "1000ms" }
              }
            },
            "easings": {
              "type": "object",
              "properties": {
                "emphasized": { "type": "string", "default": "cubic-bezier(0.2, 0.0, 0, 1.0)" },
                "emphasizedDecelerate": { "type": "string", "default": "cubic-bezier(0.05, 0.7, 0.1, 1.0)" },
                "emphasizedAccelerate": { "type": "string", "default": "cubic-bezier(0.3, 0.0, 0.8, 0.15)" },
                "standard": { "type": "string", "default": "cubic-bezier(0.2, 0.0, 0, 1.0)" },
                "standardDecelerate": { "type": "string", "default": "cubic-bezier(0, 0, 0, 1)" },
                "standardAccelerate": { "type": "string", "default": "cubic-bezier(0.3, 0, 1, 1)" },
                "linear": { "type": "string", "default": "cubic-bezier(0, 0, 1, 1)" }
              }
            }
          }
        },

        "stateLayer": {
          "type": "object",
          "title": "State Layer",
          "description": "Opacity values for interactive states",
          "properties": {
            "hover": { "type": "number", "default": 0.08 },
            "focus": { "type": "number", "default": 0.12 },
            "pressed": { "type": "number", "default": 0.12 },
            "dragged": { "type": "number", "default": 0.16 }
          }
        }
      }
    },

    "components": {
      "type": "object",
      "title": "Component Specifications",
      "description": "Specifications for each component type",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "category": { 
            "type": "string",
            "enum": ["Actions", "Communication", "Containment", "Navigation", "Selection", "Text inputs"]
          },
          "description": { "type": "string" },
          "variants": {
            "type": "array",
            "items": { "type": "string" }
          },
          "states": {
            "type": "object",
            "properties": {
              "enabled": { "type": "boolean" },
              "disabled": { "type": "boolean" },
              "hover": { "type": "boolean" },
              "focus": { "type": "boolean" },
              "pressed": { "type": "boolean" },
              "dragged": { "type": "boolean" },
              "selected": { "type": "boolean" },
              "activated": { "type": "boolean" },
              "error": { "type": "boolean" }
            }
          },
          "anatomy": {
            "type": "object",
            "description": "Component structure and parts"
          },
          "specifications": {
            "type": "object",
            "description": "Design specifications (sizes, spacing, etc.)"
          },
          "accessibility": {
            "type": "object",
            "properties": {
              "role": { "type": "string" },
              "ariaAttributes": { "type": "array", "items": { "type": "string" } },
              "keyboardSupport": { "type": "array", "items": { "type": "string" } },
              "screenReaderText": { "type": "string" }
            }
          }
        }
      }
    },

    "accessibility": {
      "type": "object",
      "title": "Accessibility Guidelines",
      "description": "WCAG 2.1 AA compliance guidelines",
      "properties": {
        "colorContrast": {
          "type": "object",
          "properties": {
            "normalText": { "type": "number", "minimum": 4.5 },
            "largeText": { "type": "number", "minimum": 3.0 },
            "uiComponents": { "type": "number", "minimum": 3.0 }
          }
        },
        "touchTargets": {
          "type": "object",
          "properties": {
            "minimumSize": { "type": "string", "default": "48px" },
            "spacing": { "type": "string", "default": "8px" }
          }
        },
        "focusIndicators": {
          "type": "object",
          "properties": {
            "required": { "type": "boolean", "default": true },
            "minimumThickness": { "type": "string", "default": "2px" },
            "minimumContrast": { "type": "number", "default": 3.0 }
          }
        }
      }
    },

    "brandGuidelines": {
      "type": "object",
      "title": "Brand Guidelines",
      "description": "Brand-specific rules and guidelines",
      "properties": {
        "logo": {
          "type": "object",
          "properties": {
            "usage": { "type": "string" },
            "clearSpace": { "type": "string" },
            "minimumSize": { "type": "string" },
            "dos": { "type": "array", "items": { "type": "string" } },
            "donts": { "type": "array", "items": { "type": "string" } }
          }
        },
        "voice": {
          "type": "object",
          "properties": {
            "tone": { "type": "string" },
            "personality": { "type": "array", "items": { "type": "string" } },
            "writingPrinciples": { "type": "array", "items": { "type": "string" } }
          }
        }
      }
    }
  },

  "required": ["metadata", "tokens"]
};

/**
 * Default Material Design 3 values
 */
export const DefaultMaterialDesign3Values = {
  metadata: {
    name: "Material Design 3",
    version: "3.0.0",
    basedOn: "Material Design 3.0",
    description: "Google's open-source design system"
  },
  
  tokens: {
    colors: {
      primary: {
        0: "#000000",
        10: "#21005E",
        20: "#381E72",
        30: "#4F378B",
        40: "#6750A4",
        50: "#7F67BE",
        60: "#9A82DB",
        70: "#B69DF8",
        80: "#D0BCFF",
        90: "#EADDFF",
        95: "#F6EDFF",
        99: "#FFFBFE",
        100: "#FFFFFF"
      }
    },
    
    typography: {
      fontFamilies: {
        brand: "Roboto, sans-serif",
        plain: "Roboto, sans-serif",
        code: "Roboto Mono, monospace"
      }
    },
    
    spacing: {
      baseUnit: 8
    }
  }
};

export default MaterialDesign3StyleGuideSchema;
