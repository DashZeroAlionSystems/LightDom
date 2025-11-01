---
title: ML trainer environment — reproducible containerized setup
date: 2025-10-28
topic: ml-trainer-environment
reviewed: 2025-10-28
---

Summary
-------
This note outlines a minimal, reproducible environment for the Python-based SEO model trainer used by LightDom. The primary goals are to avoid native runtime crashes (e.g., Windows native exit codes), pin dependencies, and provide a Docker-based runner for CI and local development.

Actionable steps
- Containerize the trainer with a small Dockerfile pinning Python and wheel dependencies (use manylinux or official Python slim images).
- Use a requirements.txt with pinned versions; include a `pip wheel` step during image build to expose failing native builds early.
- Add a lightweight smoke test script that loads a small dataset and runs the trainer entrypoint; run this in CI (integration job) before accepting model-run records.

Quick commands
```bash
# Build trainer image
docker build -f src/seo/ml/Dockerfile -t lightdom-trainer:latest .

# Run smoke test
docker run --rm lightdom-trainer:latest python src/seo/ml/train_seo_model.py --smoke
```

Sources
- https://packaging.python.org/en/latest/guides/packaging-namespace-packages/
- https://pyodide.org/en/stable/ (notes on native incompatibilities)
- https://pyup.io/blog/pinning-python-dependencies/
