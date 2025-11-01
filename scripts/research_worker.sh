#!/usr/bin/env bash
# Minimal research worker: create a short research note in docs/research.
set -euo pipefail
mkdir -p docs/research
RUN_ID=${RUN_ID:-$(date +%s)}
WORKER_ID=${WORKER_ID:-1}
TOPIC=${TOPIC:-"ml-workflows"}
OUT=docs/research/ci-${RUN_ID}-${TOPIC}-w${WORKER_ID}.md
cat > "$OUT" <<EOF
---
title: Research note -- $TOPIC
run_id: $RUN_ID
worker: $WORKER_ID
---

Summary
-------
This is an automated placeholder research note for topic: $TOPIC (worker $WORKER_ID).

Actionable bullets
- Capture canonical links and short notes
- Add small checklist for adoption
- Reference any sample commands or scripts

Sources
- https://docs.github.com/copilot/tutorials
- Add more sources after manual review

reviewed: 
EOF

echo "Wrote $OUT"
chmod 644 "$OUT"
