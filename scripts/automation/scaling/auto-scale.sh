#!/bin/bash
# Auto-scaling Script for LightDom Blockchain Automation

echo "⚖️ Checking scaling requirements..."

# Get current metrics
CPU_USAGE=$(curl -s http://localhost:3000/metrics | grep cpu_usage_percent | awk '{print $2}')
MEMORY_USAGE=$(curl -s http://localhost:3000/metrics | grep memory_usage_percent | awk '{print $2}')

echo "Current CPU usage: $CPU_USAGE%"
echo "Current Memory usage: $MEMORY_USAGE%"

# Check if scaling is needed
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
  echo "🔼 CPU usage high, scaling up..."
  node scripts/scaling/scale-up.js --resource=cpu --amount=2
elif (( $(echo "$CPU_USAGE < 30" | bc -l) )); then
  echo "🔽 CPU usage low, scaling down..."
  node scripts/scaling/scale-down.js --resource=cpu --amount=1
fi

if (( $(echo "$MEMORY_USAGE > 85" | bc -l) )); then
  echo "🔼 Memory usage high, scaling up..."
  node scripts/scaling/scale-up.js --resource=memory --amount=4096
fi

echo "✅ Scaling check completed"
