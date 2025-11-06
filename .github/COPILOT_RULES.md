Copilot agents — project rules and guidelines
===========================================

Purpose
-------
This file contains concise, actionable rules that GitHub Copilot or automated coding agents should follow when generating code, issues, or pull requests in this repository. These rules are intentionally specific to LightDom's conventions and aim to make automated contributions reliable, secure, and reviewable.

High-level contract (2–4 bullets)
- Inputs: Issue description or automation label, target files or feature area, priority and environment (dev/staging/production).
- Outputs: Small focused branch with a single change per PR, tests (unit or integration) for behavior changes, updated docs if public behaviour changed.
- Error modes: If CI/type-check fails, do not merge; open a follow-up issue linking diagnostics and revert partial changes where necessary.
- Success: PR passes `npm run type-check`, `npm run lint`, and `npm run test:unit` (and integration tests for infra changes).

Rules for code generation
- Keep changes small and focused: 1–3 files per PR. Prefer multiple PRs over large ones.
- TypeScript-first: Always run `npm run type-check` locally and ensure no new `tsc` errors are introduced.
- Add or update unit tests (Vitest/Jest) for logic changes. If tests cannot be added quickly, add an issue and mark the PR `needs-tests`.
- Avoid changing API contracts without adding migration notes and tests. Document public API changes in `README.md` or `COMPLETE_SYSTEM_DOCUMENTATION.md`.
- Do not commit secrets or credentials. If a secret is needed, add instructions to use repository secrets and update `DEPLOYMENT.md`.

Testing and quality gates
- PR must include at least one passing unit test for behavior changes.
- Run linters and formatters: `npm run lint` and `npm run format` (or `npm run format:check`).
- Type errors are fatal. Use `tsc --noEmit` to validate.

Code style and conventions
- Use existing project patterns: functional React components and hooks, TypeScript strictness, no `any` unless explicitly documented.
- Use the design system components in `src/styles/LightDomDesignSystem.tsx` and helpers in `src/utils/ReusableDesignSystem.tsx` where appropriate.

Issue / PR automation rules
- Labeling: New issues with label `copilot` or `autofix` will be auto-triaged by workflows.
- Assignment: Automated agents should add themselves as assignee using the `copilot-agent` label if available.
- Branch naming: Use `autofix/<short-description>` for automated branches created by agents.
- PR title format: `[autofix] <short summary> (agent:<agent-name>)`.

Security & safety
- Never modify security-sensitive files (keys, `.env`, scripts that echo secrets) in an automated PR.
- If a fix requires elevated privileges or secret access, open an issue detailing required secrets and request a human reviewer.
- For native or binary dependencies (Python native wheel, compiled extensions), prefer containerized approach and add a note to `DEPLOYMENT.md`.

Documentation & triage artifacts
- When triaging large TypeScript error sets, create artifacts under `diagnostics/` and reference them in PRs.
- If a change deprecates behavior, add a short note in `README.md` and `COMPLETE_SYSTEM_DOCUMENTATION.md`.

How to request automated work from Copilot agents
------------------------------------------------
1. Create an issue and add label `copilot` and optionally `autofix`.
2. Provide a minimal reproduction or failing test case when possible, and list file paths to edit.
3. For urgent fixes, add label `priority:high` and assign a human reviewer.

Follow-up and escalation
- If the automated PR fails CI, the agent should open an issue named `autofix-failure: <original-issue-number>` with CI logs and suggested next steps.

Notes
- These rules are lightweight and meant to be enforced by workflows and reviewers. Update this file if conventions change.

Research and knowledge rules
- Add research notes to `docs/research/` following `docs/RESEARCH_GUIDE.md`.
- When an automated research job runs, it should create an artifact under `docs/research/` and upload it as a workflow artifact named `research-artifacts`.
- Agents should prefer curated, authoritative sources and include them in a `sources` section. Human review is required before taking operational action based solely on automated research findings.
