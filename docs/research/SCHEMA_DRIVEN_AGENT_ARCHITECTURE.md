# Schema-Driven Agent Architecture: BiDi Real-Time Workflow System

## Executive Summary

This document defines the complete schema architecture for a containerized, BiDi-powered data mining system where agents can be dynamically spawned, configured, and managed through linked schemas with real-time two-way communication.

**Version**: 1.0.0  
**Date**: November 2024  
**Status**: Architecture Design

---

## Table of Contents

1. [Core Schema Definitions](#core-schema-definitions)
2. [Agent Lifecycle Schemas](#agent-lifecycle-schemas)
3. [Real-Time Communication Schemas](#real-time-communication-schemas)
4. [Container Orchestration Schemas](#container-orchestration-schemas)
5. [Relationship Mapping](#relationship-mapping)
6. [Workflow Simulation](#workflow-simulation)
7. [Implementation Example](#implementation-example)

---

## 1. Core Schema Definitions

### 1.1 App Instance Schema

The top-level application container that manages all mining campaigns.

```json
{
  "$schema": "https://lightdom.ai/schemas/v1/app-instance.json",
  "$id": "app-instance",
  "type": "object",
  "title": "App Instance",
  "description": "Root container managing multiple data mining campaigns",
  
  "properties": {
    "instanceId": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier for this app instance"
    },
    
    "containerConfig": {
      "$ref": "#/definitions/ContainerConfig",
      "description": "Container runtime configuration"
    },
    
    "campaigns": {
      "type": "array",
      "items": { "$ref": "campaign-schema.json" },
      "description": "Active data mining campaigns"
    },
    
    "agents": {
      "type": "array",
      "items": { "$ref": "agent-schema.json" },
      "description": "Active mining agents"
    },
    
    "biDiConnections": {
      "type": "array",
      "items": { "$ref": "#/definitions/BiDiConnection" },
      "description": "Active bidirectional communication channels"
    },
    
    "relationships": {
      "$ref": "relationship-map.json",
      "description": "Schema relationship graph"
    }
  },
  
  "definitions": {
    "ContainerConfig": {
      "type": "object",
      "properties": {
        "image": { "type": "string", "default": "lightdom/mining-app:latest" },
        "replicas": { "type": "integer", "minimum": 1, "default": 1 },
        "resources": {
          "type": "object",
          "properties": {
            "cpu": { "type": "string", "default": "1.0" },
            "memory": { "type": "string", "default": "2Gi" },
            "gpu": { "type": "boolean", "default": false }
          }
        },
        "autoScale": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean", "default": true },
            "minReplicas": { "type": "integer", "default": 1 },
            "maxReplicas": { "type": "integer", "default": 10 },
            "targetUtilization": { "type": "number", "default": 0.75 }
          }
        }
      }
    },
    
    "BiDiConnection": {
      "type": "object",
      "properties": {
        "connectionId": { "type": "string" },
        "protocol": { "enum": ["webDriverBiDi", "websocket", "grpc"] },
        "endpoint": { "type": "string", "format": "uri" },
        "state": { "enum": ["connecting", "connected", "disconnected", "error"] },
        "eventStreams": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  },
  
  "relationships": {
    "hasMany": ["campaigns", "agents", "biDiConnections"],
    "manages": ["containerConfig"],
    "connectsTo": ["deepseek-service", "tensorflow-service", "database"]
  }
}
```

### 1.2 Agent Schema

Defines an autonomous mining agent that can be spawned dynamically.

```json
{
  "$schema": "https://lightdom.ai/schemas/v1/agent.json",
  "$id": "agent-schema",
  "type": "object",
  "title": "Mining Agent",
  "description": "Autonomous agent for data mining with real-time config updates",
  
  "properties": {
    "agentId": {
      "type": "string",
      "format": "uuid"
    },
    
    "type": {
      "enum": ["crawler", "analyzer", "optimizer", "validator"],
      "description": "Agent role in the mining workflow"
    },
    
    "spawnConfig": {
      "$ref": "#/definitions/SpawnConfig",
      "description": "How this agent was created"
    },
    
    "targetAttribute": {
      "$ref": "attribute-config.json",
      "description": "Specific data attribute this agent mines"
    },
    
    "algorithmConfig": {
      "$ref": "#/definitions/AlgorithmConfig",
      "description": "Mining algorithm configuration"
    },
    
    "realTimeConfig": {
      "$ref": "#/definitions/RealTimeConfig",
      "description": "Settings that can be updated live"
    },
    
    "biDiChannel": {
      "$ref": "#/definitions/BiDiChannel",
      "description": "Two-way communication channel"
    },
    
    "state": {
      "$ref": "#/definitions/AgentState",
      "description": "Current agent state and metrics"
    },
    
    "linkedSchemas": {
      "type": "array",
      "items": { "type": "string", "format": "uri" },
      "description": "Schema.org types this agent works with"
    }
  },
  
  "definitions": {
    "SpawnConfig": {
      "type": "object",
      "properties": {
        "triggeredBy": {
          "enum": ["user", "deepseek", "auto-scale", "campaign-start"],
          "description": "What caused this agent to spawn"
        },
        "parentAgentId": {
          "type": "string",
          "description": "ID of agent that spawned this one (if any)"
        },
        "spawnReason": {
          "type": "string",
          "description": "Why this agent was created"
        },
        "inheritedConfig": {
          "type": "object",
          "description": "Configuration inherited from parent"
        },
        "timestamp": {
          "type": "string",
          "format": "date-time"
        }
      }
    },
    
    "AlgorithmConfig": {
      "type": "object",
      "properties": {
        "type": {
          "enum": ["selector-based", "ml-predicted", "hybrid", "adaptive"]
        },
        "selectors": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "selector": { "type": "string" },
              "priority": { "type": "integer" },
              "successRate": { "type": "number" }
            }
          }
        },
        "mlModel": {
          "type": "object",
          "properties": {
            "modelId": { "type": "string" },
            "version": { "type": "string" },
            "confidence": { "type": "number" }
          }
        },
        "adaptiveRules": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "condition": { "type": "string" },
              "action": { "type": "string" },
              "enabled": { "type": "boolean" }
            }
          }
        }
      }
    },
    
    "RealTimeConfig": {
      "type": "object",
      "description": "Configuration that can be hot-reloaded via BiDi",
      "properties": {
        "updateMode": {
          "enum": ["immediate", "graceful", "simulation-first"],
          "default": "simulation-first"
        },
        "configVersion": {
          "type": "integer",
          "description": "Incremented on each update"
        },
        "pendingUpdates": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "field": { "type": "string" },
              "newValue": {},
              "simulationResult": { "type": "object" },
              "approved": { "type": "boolean" }
            }
          }
        }
      }
    },
    
    "BiDiChannel": {
      "type": "object",
      "properties": {
        "channelId": { "type": "string" },
        "inboundStreams": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "stream": { "type": "string" },
              "handler": { "type": "string" },
              "buffered": { "type": "boolean" }
            }
          }
        },
        "outboundStreams": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "stream": { "type": "string" },
              "destination": { "type": "string" },
              "throttle": { "type": "integer" }
            }
          }
        }
      }
    },
    
    "AgentState": {
      "type": "object",
      "properties": {
        "status": {
          "enum": ["initializing", "idle", "working", "paused", "error", "terminated"]
        },
        "currentTask": { "type": "string" },
        "metrics": {
          "type": "object",
          "properties": {
            "tasksCompleted": { "type": "integer" },
            "successRate": { "type": "number" },
            "averageResponseTime": { "type": "number" },
            "lastActivity": { "type": "string", "format": "date-time" }
          }
        },
        "errors": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "timestamp": { "type": "string", "format": "date-time" },
              "error": { "type": "string" },
              "recovered": { "type": "boolean" }
            }
          }
        }
      }
    }
  },
  
  "relationships": {
    "belongsTo": ["app-instance", "campaign"],
    "uses": ["algorithm-config", "attribute-config"],
    "communicatesWith": ["other-agents", "deepseek-service", "coordinator"],
    "spawns": ["child-agents"],
    "reports": ["metrics", "results"]
  }
}
```

### 1.3 Attribute Configuration Schema

```json
{
  "$schema": "https://lightdom.ai/schemas/v1/attribute-config.json",
  "$id": "attribute-config",
  "type": "object",
  "title": "Attribute Configuration",
  "description": "Configuration for mining a specific data attribute",
  
  "properties": {
    "attributeId": { "type": "string" },
    "name": { "type": "string" },
    "type": {
      "enum": ["text", "number", "currency", "date", "url", "image", "json"]
    },
    
    "extractionStrategy": {
      "type": "object",
      "properties": {
        "primary": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Primary CSS selectors"
        },
        "fallback": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Fallback selectors"
        },
        "pattern": {
          "type": "string",
          "description": "Regex pattern for extraction"
        },
        "transform": {
          "type": "string",
          "description": "JavaScript function to transform extracted value"
        }
      }
    },
    
    "validation": {
      "type": "object",
      "properties": {
        "required": { "type": "boolean" },
        "pattern": { "type": "string" },
        "min": { "type": "number" },
        "max": { "type": "number" },
        "customValidator": { "type": "string" }
      }
    },
    
    "liveUpdateConfig": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean", "default": true },
        "simulateBeforeApply": { "type": "boolean", "default": true },
        "rollbackOnError": { "type": "boolean", "default": true }
      }
    },
    
    "linkedSchemas": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Schema.org types (e.g., Product, Offer, Price)"
    }
  },
  
  "relationships": {
    "usedBy": ["agent"],
    "validatedBy": ["validator-service"],
    "transformedBy": ["transformer-service"],
    "partOf": ["campaign"],
    "linkedTo": ["schema.org-types"]
  }
}
```

---

## 2. Agent Lifecycle Schemas

### 2.1 Agent Spawn Request

```json
{
  "$schema": "https://lightdom.ai/schemas/v1/agent-spawn-request.json",
  "type": "object",
  "title": "Agent Spawn Request",
  
  "properties": {
    "requestId": { "type": "string", "format": "uuid" },
    "requestedBy": {
      "enum": ["user", "deepseek", "system", "parent-agent"]
    },
    
    "agentType": {
      "enum": ["crawler", "analyzer", "optimizer", "validator"]
    },
    
    "purpose": {
      "type": "string",
      "description": "Why this agent is being created"
    },
    
    "configuration": {
      "type": "object",
      "properties": {
        "inherit": {
          "type": "object",
          "properties": {
            "fromParent": { "type": "boolean" },
            "parentId": { "type": "string" },
            "overrides": { "type": "object" }
          }
        },
        "custom": {
          "type": "object",
          "description": "Custom configuration for this agent"
        }
      }
    },
    
    "containerSpec": {
      "type": "object",
      "properties": {
        "image": { "type": "string" },
        "resources": { "$ref": "app-instance.json#/definitions/ContainerConfig/properties/resources" },
        "environment": {
          "type": "object",
          "additionalProperties": { "type": "string" }
        }
      }
    },
    
    "biDiSetup": {
      "type": "object",
      "properties": {
        "protocol": { "enum": ["webDriverBiDi", "websocket"] },
        "eventSubscriptions": {
          "type": "array",
          "items": { "type": "string" }
        },
        "streamingMode": { "enum": ["buffered", "unbuffered", "adaptive"] }
      }
    }
  }
}
```

### 2.2 Agent Lifecycle Events

```json
{
  "$schema": "https://lightdom.ai/schemas/v1/agent-lifecycle-events.json",
  "type": "object",
  "title": "Agent Lifecycle Events",
  
  "events": {
    "agent.spawning": {
      "description": "Agent container is being created",
      "payload": {
        "agentId": "string",
        "requestId": "string",
        "timestamp": "datetime"
      }
    },
    
    "agent.initializing": {
      "description": "Agent is setting up BiDi channels and loading config",
      "payload": {
        "agentId": "string",
        "biDiChannelId": "string",
        "configVersion": "integer"
      }
    },
    
    "agent.ready": {
      "description": "Agent is ready to receive tasks",
      "payload": {
        "agentId": "string",
        "capabilities": ["array"],
        "biDiConnected": "boolean"
      }
    },
    
    "agent.configUpdating": {
      "description": "Real-time config update in progress",
      "payload": {
        "agentId": "string",
        "updateFields": ["array"],
        "simulationRequired": "boolean"
      }
    },
    
    "agent.configUpdated": {
      "description": "Config update completed",
      "payload": {
        "agentId": "string",
        "oldVersion": "integer",
        "newVersion": "integer",
        "changes": "object"
      }
    },
    
    "agent.taskReceived": {
      "description": "Agent received a task via BiDi",
      "payload": {
        "agentId": "string",
        "taskId": "string",
        "taskType": "string"
      }
    },
    
    "agent.resultStreaming": {
      "description": "Agent is streaming results back via BiDi",
      "payload": {
        "agentId": "string",
        "taskId": "string",
        "resultChunk": "object",
        "isComplete": "boolean"
      }
    },
    
    "agent.error": {
      "description": "Agent encountered an error",
      "payload": {
        "agentId": "string",
        "error": "string",
        "recoverable": "boolean",
        "action": "enum[retry, restart, terminate]"
      }
    },
    
    "agent.terminating": {
      "description": "Agent is shutting down",
      "payload": {
        "agentId": "string",
        "reason": "string",
        "graceful": "boolean"
      }
    }
  }
}
```

---

## 3. Real-Time Communication Schemas

### 3.1 BiDi Message Schema

```json
{
  "$schema": "https://lightdom.ai/schemas/v1/bidi-message.json",
  "type": "object",
  "title": "BiDi Message",
  
  "properties": {
    "messageId": { "type": "string", "format": "uuid" },
    "timestamp": { "type": "string", "format": "date-time" },
    "direction": { "enum": ["inbound", "outbound"] },
    
    "sender": {
      "type": "object",
      "properties": {
        "type": { "enum": ["agent", "coordinator", "deepseek", "user"] },
        "id": { "type": "string" }
      }
    },
    
    "recipient": {
      "type": "object",
      "properties": {
        "type": { "enum": ["agent", "coordinator", "deepseek", "broadcast"] },
        "id": { "type": "string" }
      }
    },
    
    "messageType": {
      "enum": [
        "command",
        "event",
        "query",
        "response",
        "configUpdate",
        "resultStream",
        "heartbeat"
      ]
    },
    
    "payload": {
      "type": "object",
      "description": "Message-specific data"
    },
    
    "metadata": {
      "type": "object",
      "properties": {
        "priority": { "enum": ["low", "normal", "high", "critical"] },
        "requiresAck": { "type": "boolean" },
        "correlationId": { "type": "string" },
        "ttl": { "type": "integer", "description": "Time to live in seconds" }
      }
    }
  }
}
```

### 3.2 Config Update Stream Schema

```json
{
  "$schema": "https://lightdom.ai/schemas/v1/config-update-stream.json",
  "type": "object",
  "title": "Configuration Update Stream",
  
  "properties": {
    "updateId": { "type": "string" },
    "targetAgentId": { "type": "string" },
    "updateType": { "enum": ["partial", "full", "merge"] },
    
    "changes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "description": "JSONPath to the config field"
          },
          "operation": { "enum": ["set", "delete", "append", "merge"] },
          "value": {},
          "previous": {}
        }
      }
    },
    
    "simulation": {
      "type": "object",
      "properties": {
        "required": { "type": "boolean" },
        "workerId": { "type": "string", "description": "ID of worker running simulation" },
        "result": {
          "type": "object",
          "properties": {
            "success": { "type": "boolean" },
            "metrics": { "type": "object" },
            "recommendation": { "enum": ["apply", "reject", "modify"] }
          }
        }
      }
    },
    
    "rollback": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean" },
        "checkpointId": { "type": "string" },
        "conditions": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "metric": { "type": "string" },
              "threshold": { "type": "number" },
              "operator": { "enum": ["<", ">", "==", "!="] }
            }
          }
        }
      }
    }
  }
}
```

---

## 4. Container Orchestration Schemas

### 4.1 Container Deployment Schema

```json
{
  "$schema": "https://lightdom.ai/schemas/v1/container-deployment.json",
  "type": "object",
  "title": "Container Deployment",
  
  "properties": {
    "deploymentId": { "type": "string" },
    "containerType": {
      "enum": ["app-instance", "agent-worker", "coordinator", "simulation-worker"]
    },
    
    "spec": {
      "type": "object",
      "properties": {
        "image": { "type": "string" },
        "tag": { "type": "string" },
        "command": {
          "type": "array",
          "items": { "type": "string" }
        },
        "environment": {
          "type": "object",
          "additionalProperties": { "type": "string" }
        },
        "volumes": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "mountPath": { "type": "string" },
              "type": { "enum": ["config", "data", "cache", "logs"] }
            }
          }
        },
        "ports": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "containerPort": { "type": "integer" },
              "protocol": { "enum": ["TCP", "UDP", "HTTP", "HTTPS", "BiDi"] }
            }
          }
        },
        "resources": {
          "type": "object",
          "properties": {
            "requests": {
              "type": "object",
              "properties": {
                "cpu": { "type": "string" },
                "memory": { "type": "string" },
                "gpu": { "type": "integer" }
              }
            },
            "limits": {
              "type": "object",
              "properties": {
                "cpu": { "type": "string" },
                "memory": { "type": "string" },
                "gpu": { "type": "integer" }
              }
            }
          }
        },
        "healthCheck": {
          "type": "object",
          "properties": {
            "type": { "enum": ["http", "tcp", "command", "bidi-ping"] },
            "endpoint": { "type": "string" },
            "interval": { "type": "integer" },
            "timeout": { "type": "integer" },
            "retries": { "type": "integer" }
          }
        }
      }
    },
    
    "scheduling": {
      "type": "object",
      "properties": {
        "strategy": { "enum": ["immediate", "scheduled", "on-demand"] },
        "cron": { "type": "string", "description": "Cron expression if scheduled" },
        "triggers": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "event": { "type": "string" },
              "condition": { "type": "string" }
            }
          }
        }
      }
    },
    
    "networking": {
      "type": "object",
      "properties": {
        "networkMode": { "enum": ["bridge", "host", "overlay"] },
        "biDiEndpoint": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean" },
            "port": { "type": "integer" },
            "tls": { "type": "boolean" }
          }
        }
      }
    }
  }
}
```

---

## 5. Relationship Mapping

### 5.1 Schema Relationship Graph

```json
{
  "$schema": "https://lightdom.ai/schemas/v1/relationship-map.json",
  "type": "object",
  "title": "Schema Relationship Map",
  
  "relationships": [
    {
      "from": "app-instance",
      "to": "campaign",
      "type": "hasMany",
      "cardinality": "1:N",
      "actions": ["create", "read", "update", "delete", "list"],
      "biDi": {
        "enabled": true,
        "events": ["campaign.created", "campaign.updated", "campaign.deleted"]
      }
    },
    
    {
      "from": "campaign",
      "to": "agent",
      "type": "hasMany",
      "cardinality": "1:N",
      "actions": ["spawn", "terminate", "configure", "monitor"],
      "biDi": {
        "enabled": true,
        "events": ["agent.spawned", "agent.ready", "agent.terminated", "agent.metrics"]
      }
    },
    
    {
      "from": "agent",
      "to": "attribute-config",
      "type": "uses",
      "cardinality": "N:1",
      "actions": ["read", "validate"],
      "biDi": {
        "enabled": true,
        "events": ["config.updated", "validation.failed"]
      }
    },
    
    {
      "from": "agent",
      "to": "agent",
      "type": "spawns",
      "cardinality": "1:N",
      "description": "Agents can spawn child agents",
      "actions": ["spawn-child", "inherit-config", "delegate-task"],
      "biDi": {
        "enabled": true,
        "events": ["child.spawned", "child.completed", "child.error"]
      }
    },
    
    {
      "from": "attribute-config",
      "to": "schema.org-type",
      "type": "linkedTo",
      "cardinality": "N:M",
      "description": "Attributes map to Schema.org types",
      "actions": ["infer-schema", "validate-structure"],
      "biDi": {
        "enabled": false
      }
    },
    
    {
      "from": "agent",
      "to": "deepseek-service",
      "type": "communicatesWith",
      "cardinality": "N:1",
      "actions": ["query", "optimize", "learn"],
      "biDi": {
        "enabled": true,
        "events": ["optimization.suggested", "config.generated", "pattern.learned"]
      }
    },
    
    {
      "from": "simulation-worker",
      "to": "agent",
      "type": "tests",
      "cardinality": "1:1",
      "description": "Simulation worker tests config before applying to agent",
      "actions": ["simulate", "validate", "report"],
      "biDi": {
        "enabled": true,
        "events": ["simulation.started", "simulation.completed", "simulation.failed"]
      }
    }
  ],
  
  "inferredActions": {
    "description": "Actions automatically available based on relationships",
    "rules": [
      {
        "relationship": "hasMany",
        "autoGenerate": ["list", "create", "deleteAll"]
      },
      {
        "relationship": "belongsTo",
        "autoGenerate": ["get", "set"]
      },
      {
        "relationship": "manyToMany",
        "autoGenerate": ["link", "unlink", "listLinked"]
      }
    ]
  }
}
```

---

## 6. Workflow Simulation

### 6.1 Complete Agent Spawn to Task Completion Flow

```javascript
// Step-by-step linked schema workflow

// STEP 1: Campaign requests agent spawn
const spawnRequest = {
  "$schema": "agent-spawn-request.json",
  "requestId": "req-12345",
  "requestedBy": "deepseek",
  "agentType": "crawler",
  "purpose": "Mine product prices from e-commerce site",
  
  "configuration": {
    "inherit": {
      "fromParent": false
    },
    "custom": {
      "targetAttribute": {
        "$schema": "attribute-config.json",
        "name": "productPrice",
        "type": "currency",
        "extractionStrategy": {
          "primary": ["[data-testid='price']", "[itemprop='price']"],
          "fallback": [".product-price", ".price"],
          "pattern": "\\$([0-9,.]+)"
        }
      }
    }
  },
  
  "containerSpec": {
    "image": "lightdom/crawler-agent:latest",
    "resources": {
      "cpu": "0.5",
      "memory": "512Mi"
    },
    "environment": {
      "USE_BIDI": "true",
      "ATTRIBUTE_TARGET": "productPrice"
    }
  },
  
  "biDiSetup": {
    "protocol": "webDriverBiDi",
    "eventSubscriptions": [
      "network.responseReceived",
      "log.entryAdded",
      "config.update"
    ],
    "streamingMode": "adaptive"
  }
};

// STEP 2: Container orchestrator deploys agent
const deployment = {
  "$schema": "container-deployment.json",
  "deploymentId": "deploy-agent-67890",
  "containerType": "agent-worker",
  
  "spec": {
    "image": "lightdom/crawler-agent:latest",
    "tag": "v1.2.0",
    "command": ["node", "agent-worker.js"],
    "environment": {
      "AGENT_ID": "agent-67890",
      "USE_BIDI": "true",
      "COORDINATOR_URL": "http://coordinator:8080",
      "ATTRIBUTE_TARGET": "productPrice"
    },
    "ports": [{
      "containerPort": 9222,
      "protocol": "BiDi"
    }],
    "healthCheck": {
      "type": "bidi-ping",
      "interval": 10,
      "timeout": 5,
      "retries": 3
    }
  }
};

// STEP 3: Agent initializes and establishes BiDi connection
const agentState = {
  "$schema": "agent-schema.json",
  "agentId": "agent-67890",
  "type": "crawler",
  
  "spawnConfig": {
    "triggeredBy": "deepseek",
    "spawnReason": "Mine product prices for competitor analysis",
    "timestamp": "2024-11-04T21:00:00Z"
  },
  
  "biDiChannel": {
    "channelId": "bidi-channel-123",
    "inboundStreams": [
      { "stream": "config.update", "handler": "handleConfigUpdate", "buffered": false },
      { "stream": "task.assign", "handler": "handleTask", "buffered": true }
    ],
    "outboundStreams": [
      { "stream": "result.data", "destination": "coordinator", "throttle": 0 },
      { "stream": "metrics", "destination": "monitoring", "throttle": 5000 }
    ]
  },
  
  "state": {
    "status": "ready",
    "metrics": {
      "tasksCompleted": 0,
      "successRate": 0,
      "averageResponseTime": 0
    }
  }
};

// STEP 4: Coordinator sends task via BiDi
const taskMessage = {
  "$schema": "bidi-message.json",
  "messageId": "msg-task-001",
  "timestamp": "2024-11-04T21:00:05Z",
  "direction": "inbound",
  
  "sender": {
    "type": "coordinator",
    "id": "coordinator-main"
  },
  
  "recipient": {
    "type": "agent",
    "id": "agent-67890"
  },
  
  "messageType": "command",
  
  "payload": {
    "command": "mineAttribute",
    "parameters": {
      "url": "https://example.com/product/123",
      "attribute": "productPrice"
    }
  },
  
  "metadata": {
    "priority": "normal",
    "requiresAck": true,
    "correlationId": "task-001"
  }
};

// STEP 5: While working, DeepSeek optimizes config in real-time
const configUpdate = {
  "$schema": "config-update-stream.json",
  "updateId": "update-001",
  "targetAgentId": "agent-67890",
  "updateType": "partial",
  
  "changes": [{
    "path": "$.algorithmConfig.selectors[0]",
    "operation": "set",
    "value": {
      "selector": "[data-price-value]",
      "priority": 1,
      "successRate": 0.95
    },
    "previous": {
      "selector": "[data-testid='price']",
      "priority": 1,
      "successRate": 0.75
    }
  }],
  
  "simulation": {
    "required": true,
    "workerId": "sim-worker-001",
    "result": {
      "success": true,
      "metrics": {
        "predictedSuccessRate": 0.95,
        "predictedResponseTime": 250
      },
      "recommendation": "apply"
    }
  },
  
  "rollback": {
    "enabled": true,
    "checkpointId": "checkpoint-001",
    "conditions": [{
      "metric": "successRate",
      "threshold": 0.5,
      "operator": "<"
    }]
  }
};

// STEP 6: Agent applies update and continues working
const configUpdatedEvent = {
  "$schema": "agent-lifecycle-events.json#/events/agent.configUpdated",
  "agentId": "agent-67890",
  "oldVersion": 1,
  "newVersion": 2,
  "changes": {
    "selectors": {
      "old": ["[data-testid='price']"],
      "new": ["[data-price-value]"]
    }
  }
};

// STEP 7: Agent streams results back via BiDi
const resultStream = {
  "$schema": "bidi-message.json",
  "messageId": "msg-result-001",
  "messageType": "resultStream",
  
  "payload": {
    "taskId": "task-001",
    "resultChunk": {
      "success": true,
      "attribute": "productPrice",
      "data": "$49.99",
      "selector": "[data-price-value]",
      "confidence": 0.98,
      "timestamp": "2024-11-04T21:00:10Z"
    },
    "isComplete": true
  }
};

// STEP 8: System learns from result and updates ML model
const learningUpdate = {
  "selector": "[data-price-value]",
  "domain": "example.com",
  "successRate": 0.98,
  "action": "prioritize-in-future-tasks"
};
```

---

## 7. Implementation Example

### 7.1 Complete TypeScript Implementation

```typescript
// agent-orchestrator.ts
import { AppInstance, Agent, AgentSpawnRequest, BiDiMessage } from './schemas';

class AgentOrchestrator {
  private appInstance: AppInstance;
  private agents: Map<string, Agent> = new Map();
  private biDiConnections: Map<string, BiDiConnection> = new Map();
  
  async spawnAgent(request: AgentSpawnRequest): Promise<Agent> {
    // Validate request against schema
    this.validateSchema(request, 'agent-spawn-request.json');
    
    // Create container deployment
    const deployment = this.createDeployment(request);
    await this.containerService.deploy(deployment);
    
    // Wait for agent to initialize BiDi connection
    const agent = await this.waitForAgentReady(deployment.agentId);
    
    // Establish bidirectional communication
    const biDiChannel = await this.setupBiDiChannel(agent);
    
    // Subscribe to agent events
    this.subscribeToAgentEvents(agent, biDiChannel);
    
    // Store agent reference
    this.agents.set(agent.agentId, agent);
    
    return agent;
  }
  
  async updateAgentConfigRealTime(
    agentId: string,
    changes: ConfigChange[]
  ): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    
    // Create config update stream
    const updateStream: ConfigUpdateStream = {
      updateId: generateId(),
      targetAgentId: agentId,
      updateType: 'partial',
      changes,
      simulation: {
        required: true,
        workerId: await this.allocateSimulationWorker()
      }
    };
    
    // Simulate changes first
    const simulationResult = await this.simulateConfigChange(updateStream);
    
    if (simulationResult.recommendation === 'apply') {
      // Send update via BiDi
      await this.sendBiDiMessage(agent.biDiChannel, {
        messageType: 'configUpdate',
        payload: updateStream
      });
      
      // Wait for acknowledgment
      await this.waitForConfigAck(agentId, updateStream.updateId);
    }
  }
  
  private async setupBiDiChannel(agent: Agent): Promise<BiDiChannel> {
    const channel: BiDiChannel = {
      channelId: generateId(),
      inboundStreams: [
        {
          stream: 'config.update',
          handler: 'handleConfigUpdate',
          buffered: false
        },
        {
          stream: 'task.assign',
          handler: 'handleTask',
          buffered: true
        }
      ],
      outboundStreams: [
        {
          stream: 'result.data',
          destination: 'coordinator',
          throttle: 0
        },
        {
          stream: 'metrics',
          destination: 'monitoring',
          throttle: 5000
        }
      ]
    };
    
    // Establish WebSocket/BiDi connection
    const connection = await this.biDiService.connect(
      agent.containerEndpoint,
      channel
    );
    
    this.biDiConnections.set(channel.channelId, connection);
    
    return channel;
  }
  
  private subscribeToAgentEvents(
    agent: Agent,
    channel: BiDiChannel
  ): void {
    const connection = this.biDiConnections.get(channel.channelId);
    
    // Listen for result streams
    connection.on('message', (message: BiDiMessage) => {
      switch (message.messageType) {
        case 'resultStream':
          this.handleResultStream(agent, message);
          break;
          
        case 'event':
          this.handleAgentEvent(agent, message);
          break;
          
        case 'query':
          this.handleAgentQuery(agent, message);
          break;
      }
    });
    
    // Listen for lifecycle events
    connection.on('agent.configUpdated', (event) => {
      this.onAgentConfigUpdated(agent, event);
    });
    
    connection.on('agent.error', (event) => {
      this.onAgentError(agent, event);
    });
  }
}
```

---

## Summary

This schema architecture enables:

1. **Live Querying**: BiDi allows real-time queries to relationship structures
2. **Atomic Components**: Each agent is an atomic unit with CRUD operations
3. **Containerized Algorithms**: Crawlers run in isolated containers with live config updates
4. **Schema-Driven Spawning**: New agents spawn based on schema definitions
5. **Real-Time Two-Way Streams**: Continuous bidirectional communication
6. **Auto-Expansion**: API can be extended by creating new schema relationships
7. **Self-Organization**: Agents organize functionality based on schema relationships

All schemas are linked, validated, and can be queried by DeepSeek to understand the entire system architecture.
