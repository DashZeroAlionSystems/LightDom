---
title: GitHub Copilot — operational best practices
date: 2025-10-28
topic: github-copilot
reviewed: 2025-10-28
---

Summary
-------
Key guidance for using GitHub Copilot (and Copilot agents) with this repo: use the COPILOT_RULES.md as the main source of truth, require CI gates, and avoid automatic merging without human review for sensitive areas.

Actionable bullets
- Use issue templates with `copilot`/`autofix` labels to request agent work.
- Require `type-check`, `lint`, and `unit tests` CI checks on PRs created by agents; block merges without review.
- Maintain a short Copilot onboarding checklist in `.github/COPILOT_RULES.md` and require human review for changes touching `contracts/`, `.github/`, and `SECURITY.md`.

Useful links
- https://docs.github.com/copilot/tutorials
- https://docs.github.com/en/code-security
