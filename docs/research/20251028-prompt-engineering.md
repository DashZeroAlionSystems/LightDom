---
title: Prompt engineering for code generation & fixes
date: 2025-10-28
topic: prompt-engineering
reviewed: 2025-10-28
---

Summary
-------
Short, practical prompts and guardrails for generating small, safe code fixes (autofix) and research summaries. Emphasizes smallest-change principle and tests-first prompts.

Best-practices (action bullets)
- Always include a short contract: inputs, outputs, error modes, success criteria.
- Prefer edits limited to 1–3 files and provide tests or a failing example if possible.
- Add an explicit "Do not change" list (files/dirs) to avoid touching security/infra artifacts.

Sample prompt
"""
Fix the TypeScript error in `src/framework/index.ts` caused by duplicated re-exports. Make a minimal change by explicitly re-exporting members and run `npm run type-check` to ensure no new errors are introduced. Do not modify files under `scripts/` or `.github/`.
"""

Sources
- https://docs.github.com/copilot/tutorials
- https://arxiv.org/abs/2305.04929 (prompt engineering principles)
