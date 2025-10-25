#!/bin/bash

# ============================================================
# Test AI Training System
# ============================================================
# Tests the ML model training pipeline
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

API_URL="${API_BASE_URL:-http://localhost:3001}"
PYTHON_EXEC="${PYTHON_EXECUTABLE:-python3}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    AI Training System Tests                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Python Environment
echo -e "${BLUE}[1] Testing Python Environment...${NC}"

if $PYTHON_EXEC --version > /dev/null 2>&1; then
    PYTHON_VERSION=$($PYTHON_EXEC --version)
    echo -e "${GREEN}  ✓ Python found: $PYTHON_VERSION${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}  ✗ Python not found${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 2: ML Dependencies
echo -e "${BLUE}[2] Testing ML Dependencies...${NC}"

REQUIRED_PACKAGES=("sklearn" "xgboost" "pandas" "numpy")
MISSING_PACKAGES=()

for package in "${REQUIRED_PACKAGES[@]}"; do
    if $PYTHON_EXEC -c "import $package" 2>/dev/null; then
        echo -e "${GREEN}  ✓ $package installed${NC}"
    else
        echo -e "${RED}  ✗ $package missing${NC}"
        MISSING_PACKAGES+=($package)
    fi
done

if [ ${#MISSING_PACKAGES[@]} -eq 0 ]; then
    echo -e "${GREEN}  ✓ All ML dependencies installed${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}  ✗ Missing packages: ${MISSING_PACKAGES[@]}${NC}"
    echo -e "${YELLOW}  Install with: pip install -r src/seo/ml/requirements.txt${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 3: Dataset Readiness
echo -e "${BLUE}[3] Testing Dataset Readiness...${NC}"

DATASET_SIZE=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -t -c "SELECT COUNT(*) FROM seo_features.training_contributions WHERE quality_score >= 70" 2>/dev/null | tr -d ' ')

echo -e "  Dataset size: $DATASET_SIZE records"

MIN_DATASET_SIZE=${SEO_TRAINING_MIN_DATASET_SIZE:-100}

if [ ! -z "$DATASET_SIZE" ] && [ "$DATASET_SIZE" -ge "$MIN_DATASET_SIZE" ]; then
    echo -e "${GREEN}  ✓ Dataset ready for training${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}  ⚠ Dataset too small (need at least $MIN_DATASET_SIZE records)${NC}"
    echo -e "${YELLOW}  Current size: $DATASET_SIZE${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 4: Prepare Dataset
echo -e "${BLUE}[4] Testing Dataset Preparation...${NC}"

PREPARE_RESPONSE=$(curl -s -X POST $API_URL/api/seo/training/prepare-dataset \
  -H "Content-Type: application/json" \
  -d '{
    "targetSize": 100,
    "testSplit": 0.2
  }')

if echo "$PREPARE_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}  ✓ Dataset preparation successful${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    TRAIN_SAMPLES=$(echo "$PREPARE_RESPONSE" | jq -r '.dataset.trainingSamples')
    TEST_SAMPLES=$(echo "$PREPARE_RESPONSE" | jq -r '.dataset.testSamples')
    echo -e "  Training samples: $TRAIN_SAMPLES"
    echo -e "  Test samples: $TEST_SAMPLES"
else
    echo -e "${RED}  ✗ Dataset preparation failed${NC}"
    echo -e "${RED}  Response: $PREPARE_RESPONSE${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 5: Model Training API
echo -e "${BLUE}[5] Testing Model Training API...${NC}"

# Check if we have enough data
if [ "$DATASET_SIZE" -ge "$MIN_DATASET_SIZE" ]; then
    echo -e "${YELLOW}  Starting model training (this may take a few minutes)...${NC}"

    TRAIN_RESPONSE=$(curl -s -X POST $API_URL/api/seo/models/train \
      -H "Content-Type: application/json" \
      -d '{
        "modelName": "test-model",
        "modelVersion": "v1.0-test",
        "algorithm": "gradient_boosting",
        "hyperparameters": {
          "learningRate": 0.1,
          "nEstimators": 50,
          "maxDepth": 3
        },
        "targetMetric": "ndcg"
      }')

    if echo "$TRAIN_RESPONSE" | grep -q '"success":true\|"modelId"'; then
        echo -e "${GREEN}  ✓ Model training initiated${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        MODEL_ID=$(echo "$TRAIN_RESPONSE" | jq -r '.modelId // .model.id' 2>/dev/null)
        echo -e "  Model ID: $MODEL_ID"
    else
        echo -e "${RED}  ✗ Model training failed${NC}"
        echo -e "${RED}  Response: $TRAIN_RESPONSE${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    echo -e "${YELLOW}  ⚠ Skipping (insufficient training data)${NC}"
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 6: Training Runs Table
echo -e "${BLUE}[6] Testing Training Runs Storage...${NC}"

TRAINING_RUNS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -t -c "SELECT COUNT(*) FROM seo_features.model_training_runs" 2>/dev/null | tr -d ' ')

if [ ! -z "$TRAINING_RUNS" ]; then
    echo -e "${GREEN}  ✓ Training runs tracked in database${NC}"
    echo -e "  Total training runs: $TRAINING_RUNS"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}  ✗ No training runs found${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 7: Feature Importance
echo -e "${BLUE}[7] Testing Feature Importance API...${NC}"

IMPORTANCE_RESPONSE=$(curl -s $API_URL/api/seo/training/feature-importance)

if echo "$IMPORTANCE_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}  ✓ Feature importance retrieval successful${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    TOP_FEATURE=$(echo "$IMPORTANCE_RESPONSE" | jq -r '.featureImportance[0].feature')
    TOP_IMPORTANCE=$(echo "$IMPORTANCE_RESPONSE" | jq -r '.featureImportance[0].importance')
    echo -e "  Top feature: $TOP_FEATURE (importance: $TOP_IMPORTANCE)"
else
    echo -e "${RED}  ✗ Feature importance retrieval failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 8: Model Files
echo -e "${BLUE}[8] Testing Model File Storage...${NC}"

MODELS_DIR="${ML_MODELS_DIR:-./.data/models}"

if [ -d "$MODELS_DIR" ]; then
    MODEL_COUNT=$(find "$MODELS_DIR" -name "*.pkl" 2>/dev/null | wc -l)
    echo -e "${GREEN}  ✓ Models directory exists${NC}"
    echo -e "  Trained models: $MODEL_COUNT"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}  ⚠ Models directory not found${NC}"
    mkdir -p "$MODELS_DIR"
    echo -e "${YELLOW}  Created: $MODELS_DIR${NC}"
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 9: Python Training Script
echo -e "${BLUE}[9] Testing Python Training Script...${NC}"

TRAINING_SCRIPT="src/seo/ml/train_seo_model.py"

if [ -f "$TRAINING_SCRIPT" ]; then
    echo -e "${GREEN}  ✓ Training script found${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Test script help
    if $PYTHON_EXEC "$TRAINING_SCRIPT" --help > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Training script executable${NC}"
    else
        echo -e "${YELLOW}  ⚠ Training script may have issues${NC}"
    fi
else
    echo -e "${RED}  ✗ Training script not found: $TRAINING_SCRIPT${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 10: Model Performance Metrics
echo -e "${BLUE}[10] Testing Model Performance Metrics...${NC}"

METRICS_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -t -c "SELECT COUNT(*) FROM seo_features.model_performance_metrics" 2>/dev/null | tr -d ' ')

if [ ! -z "$METRICS_COUNT" ]; then
    echo -e "${GREEN}  ✓ Performance metrics tracked${NC}"
    echo -e "  Total metrics: $METRICS_COUNT"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}  ⚠ No performance metrics yet${NC}"
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Test Summary                                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests: $TESTS_RUN"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! AI training system is working correctly.${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please check the errors above.${NC}"
    exit 1
fi
