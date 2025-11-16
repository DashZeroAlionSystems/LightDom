/**
 * N8N Workflow Templates for Header Script Injection
 * 
 * Pre-configured workflows for managing client header script injection:
 * - Script generation and deployment
 * - Client site monitoring
 * - Automatic optimization updates
 * - Performance tracking
 */

export const headerScriptWorkflowTemplates = {
  /**
   * Header Script Injection Workflow
   * Generates and tracks header script for client sites
   */
  scriptInjection: {
    name: "Client Header Script Injection",
    description: "Generate and manage header script injection for client websites",
    tags: ['client-onboarding', 'script-injection', 'automation'],
    nodes: [
      {
        name: "Webhook Trigger",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          path: "client/script-injection",
          method: "POST",
          responseMode: "onReceived",
          options: {}
        }
      },
      {
        name: "Validate Client Data",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          functionCode: `
// Validate incoming client data
const { clientId, domain, apiKey, config } = items[0].json;

if (!clientId || !domain || !apiKey) {
  throw new Error('Missing required fields: clientId, domain, or apiKey');
}

// Validate domain format
const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,}$/;
if (!domainRegex.test(domain)) {
  throw new Error('Invalid domain format');
}

return [{
  json: {
    clientId,
    domain,
    apiKey,
    config: config || {},
    validated: true,
    timestamp: new Date().toISOString()
  }
}];
`
        }
      },
      {
        name: "Generate Header Script",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [650, 300],
        parameters: {
          functionCode: `
// Generate the LightDom header script
const { clientId, domain, apiKey, config } = items[0].json;

const scriptVersion = 'v1.0.0';
const cdnUrl = 'https://cdn.lightdom.io/seo/v1/lightdom-seo.js';

const headerScript = \`<!-- LightDom Automated SEO - Zero Config Setup -->
<script async src="\${cdnUrl}"
        data-api-key="\${apiKey}"
        data-client-id="\${clientId}"
        data-domain="\${domain}"
        data-auto-optimize="\${config.autoOptimize !== false}"
        data-realtime="\${config.realtimeUpdates !== false}"
        data-version="\${scriptVersion}">
</script>
<!-- This script provides:
     • Automatic JSON-LD schema injection
     • Real-time SEO optimization via SVG widgets
     • Competitor analysis and tracking
     • Performance monitoring
     • Rich snippet generation
     • No visual changes to your site
     • <5ms performance impact
-->\`;

return [{
  json: {
    ...items[0].json,
    headerScript,
    scriptVersion,
    cdnUrl,
    generatedAt: new Date().toISOString()
  }
}];
`
        }
      },
      {
        name: "Store in Database",
        type: "n8n-nodes-base.postgres",
        typeVersion: 2,
        position: [850, 300],
        parameters: {
          operation: "executeQuery",
          query: `
UPDATE seo_clients 
SET 
  script_injected = true,
  script_injection_date = NOW(),
  header_script_content = $1,
  script_version = $2,
  last_script_update = NOW(),
  injection_workflow_id = $3,
  updated_at = NOW()
WHERE id = $4::uuid
RETURNING *;
          `,
          additionalFields: {
            queryParameters: "={{ JSON.stringify([$json.headerScript, $json.scriptVersion, $workflow.id, $json.clientId]) }}"
          }
        }
      },
      {
        name: "Log Injection Event",
        type: "n8n-nodes-base.postgres",
        typeVersion: 2,
        position: [1050, 300],
        parameters: {
          operation: "insert",
          schema: "public",
          table: "script_injection_events",
          columns: {
            mappingMode: "defineBelow",
            values: {
              client_id: "={{ $json.clientId }}",
              event_type: "injection",
              workflow_id: "={{ $workflow.id }}",
              script_version: "={{ $json.scriptVersion }}",
              status: "success",
              details: "={{ JSON.stringify($json) }}"
            }
          }
        }
      },
      {
        name: "Send Success Notification",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 3,
        position: [1250, 300],
        parameters: {
          method: "POST",
          url: "http://localhost:3001/api/notifications/script-injection",
          jsonParameters: true,
          bodyParametersJson: `={
  "clientId": {{ $json.clientId }},
  "domain": {{ $json.domain }},
  "status": "success",
  "headerScript": {{ $json.headerScript }},
  "message": "Header script successfully generated and stored"
}`
        }
      }
    ],
    connections: {
      "Webhook Trigger": {
        main: [[{ node: "Validate Client Data", type: "main", index: 0 }]]
      },
      "Validate Client Data": {
        main: [[{ node: "Generate Header Script", type: "main", index: 0 }]]
      },
      "Generate Header Script": {
        main: [[{ node: "Store in Database", type: "main", index: 0 }]]
      },
      "Store in Database": {
        main: [[{ node: "Log Injection Event", type: "main", index: 0 }]]
      },
      "Log Injection Event": {
        main: [[{ node: "Send Success Notification", type: "main", index: 0 }]]
      }
    },
    settings: {
      saveExecutionProgress: true,
      saveManualExecutions: true,
      saveDataSuccessExecution: "all",
      saveDataErrorExecution: "all",
      executionTimeout: 300,
      timezone: "America/New_York"
    }
  },

  /**
   * Client Site Monitoring Workflow
   * Monitors injected scripts and collects real-time data
   */
  siteMonitoring: {
    name: "Client Site Monitoring",
    description: "Monitor client sites with injected scripts and collect performance data",
    tags: ['monitoring', 'performance', 'real-time'],
    nodes: [
      {
        name: "Schedule Trigger",
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          rule: {
            interval: [
              {
                field: "minutes",
                minutesInterval: 15
              }
            ]
          }
        }
      },
      {
        name: "Get Active Clients",
        type: "n8n-nodes-base.postgres",
        typeVersion: 2,
        position: [450, 300],
        parameters: {
          operation: "executeQuery",
          query: `
SELECT 
  id, domain, api_key, script_version, 
  monitoring_workflow_id, config
FROM seo_clients
WHERE script_injected = true 
  AND status = 'active'
  AND (monitoring_workflow_id IS NULL OR monitoring_workflow_id = $1)
ORDER BY last_script_update DESC
LIMIT 50;
          `,
          additionalFields: {
            queryParameters: "={{ JSON.stringify([$workflow.id]) }}"
          }
        }
      },
      {
        name: "For Each Client",
        type: "n8n-nodes-base.splitInBatches",
        typeVersion: 1,
        position: [650, 300],
        parameters: {
          batchSize: 10,
          options: {}
        }
      },
      {
        name: "Check Site Health",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 3,
        position: [850, 300],
        parameters: {
          method: "GET",
          url: "={{ 'https://' + $json.domain }}",
          options: {
            timeout: 30000,
            redirect: {
              follow: true,
              maxRedirects: 3
            }
          }
        }
      },
      {
        name: "Verify Script Injection",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [1050, 300],
        parameters: {
          functionCode: `
// Check if LightDom script is present in the HTML
const html = items[0].data || '';
const scriptPresent = html.includes('lightdom-seo.js') || html.includes('data-api-key');

const metrics = {
  scriptFound: scriptPresent,
  responseTime: items[0].headers?.['x-response-time'] || 0,
  statusCode: items[0].statusCode || 0,
  contentLength: html.length,
  checkedAt: new Date().toISOString()
};

return [{
  json: {
    ...items[0].json,
    healthCheck: metrics,
    status: scriptPresent ? 'healthy' : 'warning'
  }
}];
`
        }
      },
      {
        name: "Update Monitoring Status",
        type: "n8n-nodes-base.postgres",
        typeVersion: 2,
        position: [1250, 300],
        parameters: {
          operation: "insert",
          schema: "public",
          table: "workflow_execution_logs",
          columns: {
            mappingMode: "defineBelow",
            values: {
              workflow_id: "={{ $workflow.id }}",
              client_id: "={{ $json.id }}",
              status: "completed",
              output_data: "={{ JSON.stringify($json.healthCheck) }}",
              execution_time_ms: "={{ $json.healthCheck.responseTime }}",
              completed_at: "={{ $now }}"
            }
          }
        }
      },
      {
        name: "Alert if Issues",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [1450, 300],
        parameters: {
          conditions: {
            boolean: [
              {
                value1: "={{ $json.healthCheck.scriptFound }}",
                value2: false
              }
            ]
          }
        }
      },
      {
        name: "Send Alert",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 3,
        position: [1650, 200],
        parameters: {
          method: "POST",
          url: "http://localhost:3001/api/alerts/script-missing",
          jsonParameters: true,
          bodyParametersJson: "={{ JSON.stringify($json) }}"
        }
      }
    ],
    connections: {
      "Schedule Trigger": {
        main: [[{ node: "Get Active Clients", type: "main", index: 0 }]]
      },
      "Get Active Clients": {
        main: [[{ node: "For Each Client", type: "main", index: 0 }]]
      },
      "For Each Client": {
        main: [[{ node: "Check Site Health", type: "main", index: 0 }]]
      },
      "Check Site Health": {
        main: [[{ node: "Verify Script Injection", type: "main", index: 0 }]]
      },
      "Verify Script Injection": {
        main: [[{ node: "Update Monitoring Status", type: "main", index: 0 }]]
      },
      "Update Monitoring Status": {
        main: [[{ node: "Alert if Issues", type: "main", index: 0 }]]
      },
      "Alert if Issues": {
        main: [
          [{ node: "Send Alert", type: "main", index: 0 }],
          [] // No action for healthy sites
        ]
      }
    },
    settings: {
      saveExecutionProgress: true,
      saveManualExecutions: false,
      saveDataSuccessExecution: "all",
      saveDataErrorExecution: "all",
      executionTimeout: 600,
      timezone: "America/New_York"
    }
  },

  /**
   * Automatic Optimization Update Workflow
   * Pushes optimization updates to client sites automatically
   */
  optimizationUpdate: {
    name: "Automatic Optimization Updates",
    description: "Automatically push SEO optimizations to client sites with injected scripts",
    tags: ['optimization', 'automation', 'real-time'],
    nodes: [
      {
        name: "Webhook Trigger",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          path: "optimization/push-update",
          method: "POST",
          responseMode: "onReceived"
        }
      },
      {
        name: "Get Client Info",
        type: "n8n-nodes-base.postgres",
        typeVersion: 2,
        position: [450, 300],
        parameters: {
          operation: "executeQuery",
          query: `
SELECT id, domain, api_key, config, auto_optimize
FROM seo_clients
WHERE id = $1::uuid
  AND script_injected = true
  AND auto_optimize = true
  AND status = 'active';
          `,
          additionalFields: {
            queryParameters: "={{ JSON.stringify([$json.clientId]) }}"
          }
        }
      },
      {
        name: "Generate Optimization",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [650, 300],
        parameters: {
          functionCode: `
// Generate optimization configuration
const { optimizationType, parameters } = items[0].json;

const optimization = {
  type: optimizationType || 'schema-injection',
  version: 'v1.0.0',
  config: {},
  timestamp: new Date().toISOString()
};

switch (optimizationType) {
  case 'schema-injection':
    optimization.config = {
      schemas: parameters.schemas || [],
      placement: parameters.placement || 'head',
      priority: parameters.priority || 'normal'
    };
    break;
    
  case 'meta-update':
    optimization.config = {
      metaTags: parameters.metaTags || {},
      overwrite: parameters.overwrite !== false
    };
    break;
    
  case 'performance':
    optimization.config = {
      lazyLoad: parameters.lazyLoad !== false,
      minifyResources: parameters.minifyResources !== false,
      caching: parameters.caching || {}
    };
    break;
}

return [{
  json: {
    ...items[0].json,
    optimization
  }
}];
`
        }
      },
      {
        name: "Push to Client",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 3,
        position: [850, 300],
        parameters: {
          method: "POST",
          url: "http://localhost:3001/api/realtime/push-optimization",
          jsonParameters: true,
          bodyParametersJson: "={{ JSON.stringify($json) }}",
          options: {
            timeout: 10000
          }
        }
      },
      {
        name: "Log Update",
        type: "n8n-nodes-base.postgres",
        typeVersion: 2,
        position: [1050, 300],
        parameters: {
          operation: "insert",
          schema: "public",
          table: "seo_optimization_configs",
          columns: {
            mappingMode: "defineBelow",
            values: {
              client_id: "={{ $json.clientId }}",
              page_pattern: "={{ $json.pagePattern || '*' }}",
              json_ld_schemas: "={{ JSON.stringify($json.optimization.config.schemas || []) }}",
              meta_tags: "={{ JSON.stringify($json.optimization.config.metaTags || {}) }}",
              active: true,
              priority: 100
            }
          }
        }
      },
      {
        name: "Notify Success",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 3,
        position: [1250, 300],
        parameters: {
          method: "POST",
          url: "http://localhost:3001/api/notifications/optimization-applied",
          jsonParameters: true,
          bodyParametersJson: "={{ JSON.stringify($json) }}"
        }
      }
    ],
    connections: {
      "Webhook Trigger": {
        main: [[{ node: "Get Client Info", type: "main", index: 0 }]]
      },
      "Get Client Info": {
        main: [[{ node: "Generate Optimization", type: "main", index: 0 }]]
      },
      "Generate Optimization": {
        main: [[{ node: "Push to Client", type: "main", index: 0 }]]
      },
      "Push to Client": {
        main: [[{ node: "Log Update", type: "main", index: 0 }]]
      },
      "Log Update": {
        main: [[{ node: "Notify Success", type: "main", index: 0 }]]
      }
    },
    settings: {
      saveExecutionProgress: true,
      saveManualExecutions: true,
      saveDataSuccessExecution: "all",
      saveDataErrorExecution: "all",
      executionTimeout: 300,
      timezone: "America/New_York"
    }
  }
};

export default headerScriptWorkflowTemplates;
