#!/bin/bash

# Advanced Data Mining API Integration Tests
# Simple curl-based tests to validate the API endpoints

API_BASE="http://localhost:3001/api/datamining"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Advanced Data Mining API Integration Tests                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: List all available tools
echo "Test 1: List Available Tools"
echo "-----------------------------"
curl -s "${API_BASE}/tools" | jq '.' || echo "❌ Failed"
echo ""
echo ""

# Test 2: Create a workflow
echo "Test 2: Create Workflow"
echo "-----------------------"
WORKFLOW_RESPONSE=$(curl -s -X POST "${API_BASE}/workflows" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workflow",
    "description": "API Integration Test",
    "steps": [
      {
        "name": "Test Step",
        "tool": "puppeteer-scraper",
        "config": {
          "url": "https://example.com",
          "selectors": { "title": "h1" }
        }
      }
    ]
  }')

echo "$WORKFLOW_RESPONSE" | jq '.'
WORKFLOW_ID=$(echo "$WORKFLOW_RESPONSE" | jq -r '.workflow.id')
echo ""
echo "Created Workflow ID: $WORKFLOW_ID"
echo ""
echo ""

# Test 3: Get workflow details
if [ ! -z "$WORKFLOW_ID" ] && [ "$WORKFLOW_ID" != "null" ]; then
  echo "Test 3: Get Workflow Details"
  echo "-----------------------------"
  curl -s "${API_BASE}/workflows/${WORKFLOW_ID}" | jq '.'
  echo ""
  echo ""
fi

# Test 4: List all workflows
echo "Test 4: List All Workflows"
echo "--------------------------"
curl -s "${API_BASE}/workflows" | jq '.'
echo ""
echo ""

# Test 5: Update workflow
if [ ! -z "$WORKFLOW_ID" ] && [ "$WORKFLOW_ID" != "null" ]; then
  echo "Test 5: Update Workflow"
  echo "-----------------------"
  curl -s -X PUT "${API_BASE}/workflows/${WORKFLOW_ID}" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Updated Test Workflow",
      "description": "Updated via API"
    }' | jq '.'
  echo ""
  echo ""
fi

# Test 6: Create a campaign
echo "Test 6: Create Campaign"
echo "-----------------------"
CAMPAIGN_RESPONSE=$(curl -s -X POST "${API_BASE}/campaigns" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign",
    "description": "API Integration Test Campaign",
    "workflows": [
      {
        "name": "Workflow 1",
        "steps": [
          {
            "name": "Step 1",
            "tool": "puppeteer-scraper",
            "config": { "url": "https://example.com" }
          }
        ]
      }
    ]
  }')

echo "$CAMPAIGN_RESPONSE" | jq '.'
CAMPAIGN_ID=$(echo "$CAMPAIGN_RESPONSE" | jq -r '.campaign.id')
echo ""
echo "Created Campaign ID: $CAMPAIGN_ID"
echo ""
echo ""

# Test 7: List all campaigns
echo "Test 7: List All Campaigns"
echo "--------------------------"
curl -s "${API_BASE}/campaigns" | jq '.'
echo ""
echo ""

# Test 8: Generate components
echo "Test 8: Generate UI Components"
echo "-------------------------------"
curl -s -X POST "${API_BASE}/components/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "entityName": "DataSource",
    "fields": [
      { "name": "name", "type": "string", "required": true },
      { "name": "url", "type": "url", "required": true },
      { "name": "type", "type": "select", "options": ["api", "html", "xml"] }
    ]
  }' | jq '.component.components | keys'
echo ""
echo ""

# Test 9: Get analytics summary
echo "Test 9: Analytics Summary"
echo "-------------------------"
curl -s "${API_BASE}/analytics/summary" | jq '.'
echo ""
echo ""

# Test 10: Get specific tool details
echo "Test 10: Get Tool Details"
echo "-------------------------"
curl -s "${API_BASE}/tools/puppeteer-scraper" | jq '.'
echo ""
echo ""

# Cleanup - Delete created resources
if [ ! -z "$WORKFLOW_ID" ] && [ "$WORKFLOW_ID" != "null" ]; then
  echo "Cleanup: Delete Workflow"
  echo "------------------------"
  curl -s -X DELETE "${API_BASE}/workflows/${WORKFLOW_ID}" | jq '.'
  echo ""
fi

if [ ! -z "$CAMPAIGN_ID" ] && [ "$CAMPAIGN_ID" != "null" ]; then
  echo "Cleanup: Delete Campaign"
  echo "------------------------"
  curl -s -X DELETE "${API_BASE}/campaigns/${CAMPAIGN_ID}" | jq '.'
  echo ""
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  API Integration Tests Complete!                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
