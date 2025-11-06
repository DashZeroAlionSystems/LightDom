#!/usr/bin/env bash
# Simple wait-for-services helper used in CI integration workflow.
# Waits for Postgres (5432) and Redis (6379) to be reachable on localhost.

set -euo pipefail

wait_for_port() {
  local host=$1
  local port=$2
  local retries=30
  local count=0
  echo "Waiting for $host:$port..."
  while ! nc -z $host $port; do
    count=$((count+1))
    if [ $count -ge $retries ]; then
      echo "Timed out waiting for $host:$port"
      return 1
    fi
    sleep 2
  done
  echo "$host:$port is up"
  return 0
}

# Try localhost ports
wait_for_port localhost 5432 || true
wait_for_port localhost 6379 || true

echo "wait-for-services.sh finished"
