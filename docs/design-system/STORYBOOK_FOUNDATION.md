# Storybook Foundation Plan

_Last updated: 2025-11-15_

## Objectives

- Establish a dependable Storybook baseline that can run alongside existing services without blocking the core dev loop.
- Capture Material Design 3, fluid/organic motion, and Blueprint inspiration in a central reference for component authors.
- Stage the environment for upcoming Anime.js workflow prototypes and template-driven workflow builders.

## Current Baseline

- **Config files**: `.storybook/main.ts`, `.storybook/preview.ts`, `.storybook/test-runner.ts`
  - MD3 viewports and global controls already wired in preview.
  - Test runner injects axe for accessibility.
- **Run command**: `npm run storybook` (or `node scripts/storybook-service.js start` for health-monitored mode).
- **Ports**: default 6006; scripted service keeps a heartbeat and can auto-restart.

## Immediate Actions

1. **Health-check Storybook build**
   - Run `npm run storybook` in a dedicated terminal to verify Vite bundling and MDX stories compile.
   - If it fails, capture logs here and triage dependencies before proceeding with design tasks.
2. **Document design systems**
   - Summarise Material Design 3 motion, typography, color guidance.
   - Collect references for “fluid” cover art and blueprint-inspired diagramming.
3. **Prepare template stories**
   - Create placeholder stories for "Workflow Category Empty State" and "Workflow Builder Shell" with simple props.
   - These stories will host the Anime.js experiments soon.

## Planned Enhancements

- **Anime.js Workflow Graphs**: embed small workflow nodes with open/close animations using Anime.js timelines; keep logic isolated in hooks for reuse in React components.
- **Template Catalog**: Storybook stories that list available workflow templates, powered by data attributes and default values mined from existing workflow configs.
- **Storybook Embeds**: research if `@storybook/manager` or iframe embedding covers drag-and-drop preview needs; document viable approaches.
- **Automation Hooks**: evaluate `@storybook/addon-interactions` for async n8n-like demos and integrate Playwright/Puppeteer scripts for regression on the workflow visual editor.

## Data & Telemetry Needs

- For terminal security tooling, define the schema (process id, parent tree, window title, command line snippets, timestamps) and decide retention policies before combining with workflow templates.
- For design research crawlers, ensure Terms of Service compliance (Figma Community, animejs.com docs). Rate-limit, cache results, and record source metadata in `docs/research/` before automating usage.

## Next Checkpoint

- Confirm Storybook passes a full spin-up by running `npm run storybook` once documentation above is reviewed.
- Log outcome and blockers directly in this file.
- After baseline is green, begin Anime.js prototype stories and data-driven template scaffolds.
