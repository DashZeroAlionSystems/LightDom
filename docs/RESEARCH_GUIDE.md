# Research guide — ML, Workflows, Automation, AI, Prompt Engineering

Purpose
-------
This guide centralizes short, validated notes and links for topics we commonly research while developing LightDom: machine learning model training, workflow automation, AI agents, and prompt engineering. The goal is to create a small, reproducible knowledge base that automated agents and contributors can consult.

How to use
----------
- Add small research notes as markdown files under `docs/research/` (one topic per file).
- Use the `scripts/research_worker.sh` to generate a research artifact placeholder; this is used by CI workflows to simulate agent research runs.
- Keep notes concise (1–2 paragraphs) with 3 links max and a short actionable bullet list.

Topics to capture (starter list)
- Machine learning: reproducible training environments, containerized trainers, dependency pinning (pip/conda), common troubleshooting for native failures.
- Workflows & automation: GitHub Actions patterns, concurrency, self-hosted runners, secrets management, and deployment strategies (GHCR, Docker, cloud providers).
- AI & agents: safe operation patterns, agent orchestration, MCP servers, and auditing agent-created changes.
- Prompt engineering: canonical prompts for code generation, testing prompts, incremental prompting, and guardrails to reduce hallucinations.

Research rule (for Copilot agents)
- When adding research notes, include: title, summary (2–3 sentences), 3 curated links, 3 action bullets, and a `sources` list.
- Add a `reviewed: <YYYY-MM-DD>` metadata header when the note has been human-reviewed.

Where to store results
- `docs/research/` — human-readable notes and artifacts
- `diagnostics/research/` — CI-generated raw outputs and logs

Updating this guide
- This file is authoritative for how research notes should be structured. Update it when conventions change.
