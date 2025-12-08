# StoryMiner Platform

Modular service suite for Storybook discovery, UI mining, and component intelligence.

## Structure Overview

- `config/` – connection profiles, discovery rules, and deployment manifests.
- `services/` – independent workers (orchestrator, crawler, classifier, overlay) designed for plug-and-play deployment.
- `services/orchestrator/src` – BullMQ wiring, config loader that reads `design/styleguide.json`, and a bootstrap runner sample.
- `services/crawler/src` – Playwright-powered crawler stub ready to pipe results into the classifier pipeline.
- `services/overlay/src` – WebSocket broadcaster for live detection telemetry.
- `data/` – machine-generated artifacts (raw fetches, processed screenshots, models, metadata). Heavy assets should live outside git; use the documented hierarchy.
- `docs/` – architecture notes, runbooks, and operational guidelines.
- `logs/` – runtime logs (rotated per deployment).
- `scripts/` – maintenance scripts, bootstrap utilities, and developer tooling.
- `packages/` – publishable SDKs or adapters that expose StoryMiner capabilities.

Refer to `docs/styleguide.md` for naming conventions, directory hierarchy, and motion/design tokens shared across the platform.
