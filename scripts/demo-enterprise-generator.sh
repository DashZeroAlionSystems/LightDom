#!/bin/bash

# Enterprise Generator Quick Demo
# This script demonstrates the capabilities of the enterprise generation system

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   LightDom Enterprise Knowledge Graph & Restructuring Demo    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if running in dry-run mode
DRY_RUN=${1:-""}

if [ "$DRY_RUN" == "--dry-run" ]; then
    echo "🔍 Running in DRY RUN mode - no files will be created"
    echo ""
fi

echo "📋 This demo will:"
echo "   1. Analyze your codebase (~5 minutes)"
echo "   2. Generate interactive knowledge graph"
echo "   3. Design enterprise microservices architecture"
echo "   4. Create restructured project in enterprise-output/"
echo "   5. Set up 10 microservices with Docker"
echo "   6. Generate comprehensive documentation"
echo ""

read -p "Press Enter to continue or Ctrl+C to cancel..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 1: Checking Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for required packages
echo "Checking for required npm packages..."
MISSING=""

if ! npm list @babel/parser >/dev/null 2>&1; then
    MISSING="$MISSING @babel/parser"
fi

if ! npm list @babel/traverse >/dev/null 2>&1; then
    MISSING="$MISSING @babel/traverse"
fi

if ! npm list glob >/dev/null 2>&1; then
    MISSING="$MISSING glob"
fi

if ! npm list playwright >/dev/null 2>&1; then
    MISSING="$MISSING playwright"
fi

if [ -n "$MISSING" ]; then
    echo "⚠️  Missing packages:$MISSING"
    echo ""
    if [ "$DRY_RUN" != "--dry-run" ]; then
        read -p "Install missing packages? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm install --save-dev$MISSING
        fi
    else
        echo "Would install:$MISSING"
    fi
else
    echo "✅ All dependencies present"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 2: Running Enterprise Generator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$DRY_RUN" == "--dry-run" ]; then
    npm run enterprise:generate:dry-run
else
    npm run enterprise:generate
fi

GENERATOR_EXIT=$?

if [ $GENERATOR_EXIT -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                  ✨ Generation Complete! ✨                    ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    if [ "$DRY_RUN" != "--dry-run" ]; then
        echo "📊 Knowledge Graph:"
        if [ -f "knowledge-graph-output/knowledge-graph.html" ]; then
            echo "   Open in browser: file://$(pwd)/knowledge-graph-output/knowledge-graph.html"
        fi
        echo ""
        
        echo "📁 Enterprise Output:"
        echo "   Location: $(pwd)/enterprise-output/"
        echo ""
        
        echo "🚀 Next Steps:"
        echo "   1. cd enterprise-output"
        echo "   2. cp .env.example .env"
        echo "   3. Edit .env with your configuration"
        echo "   4. ./start.sh"
        echo ""
        
        echo "🌐 After starting, access:"
        echo "   - Frontend:     http://localhost:3000"
        echo "   - API Gateway:  http://localhost:3001"
        echo "   - Grafana:      http://localhost:3002"
        echo "   - Prometheus:   http://localhost:9090"
        echo "   - Worker Pool:  http://localhost:3200"
        echo ""
        
        read -p "Open knowledge graph visualization now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v xdg-open > /dev/null; then
                xdg-open knowledge-graph-output/knowledge-graph.html
            elif command -v open > /dev/null; then
                open knowledge-graph-output/knowledge-graph.html
            else
                echo "Please open manually: knowledge-graph-output/knowledge-graph.html"
            fi
        fi
    fi
else
    echo ""
    echo "❌ Generation failed with exit code: $GENERATOR_EXIT"
    echo "Please check the error messages above."
    exit $GENERATOR_EXIT
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 For more information, see:"
echo "   - ENTERPRISE_GENERATOR_README.md (comprehensive guide)"
echo "   - enterprise-output/README.md (enterprise platform docs)"
echo "   - enterprise-output/docs/ (detailed documentation)"
echo ""
