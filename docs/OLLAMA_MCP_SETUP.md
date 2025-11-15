# Ollama MCP Client Integration

This guide explains how to use the [`ollmcp`](https://github.com/jonigl/mcp-client-for-ollama) client with LightDom so DeepSeek models running in Ollama can call our MCP servers.

## Prerequisites

1. **Python 3.10+** available on your PATH (the repo ships with `.conda/python.exe`).
2. **Ollama** running locally (`ollama serve`).
3. **DeepSeek model** pulled locally, e.g.:
   ```bash
   ollama pull deepseek-r1:latest
   ```
4. Install the `ollmcp` package in the same Python environment that LightDom uses:
   ```bash
   E:/Personal/project/lightdom/LightDom/.conda/python.exe -m pip install --upgrade ollmcp
   ```
   > You can substitute your own interpreter. The launcher honours the `LIGHTDOM_PYTHON` or `OLLAMA_MCP_PYTHON` environment variables if you want to point at a different Python.

## Configuration

The repo now includes `config/mcp/ollama-mcp-servers.json`. It registers:

- `lightdom-deepseek` – our TypeScript MCP server (`src/mcp/deepseek-mcp-server.ts`)
- `lightdom-n8n` – optional bridge to the n8n MCP server (disabled by default)
- `lightdom-automation` – automation script runner that exposes curated npm automation flows via MCP tools

The config also defines reusable bundles:

```json
"bundles": {
   "deepseek-core": ["lightdom-deepseek"],
   "deepseek-with-n8n": ["lightdom-deepseek", "lightdom-n8n"],
   "deepseek-automation": ["lightdom-deepseek", "lightdom-automation"],
   "deepseek-automation-n8n": ["lightdom-deepseek", "lightdom-automation", "lightdom-n8n"]
}
```

You can extend this list manually or through the session launcher when you save a custom selection.

Update the `env` blocks with your database credentials or n8n API key as needed. You can add additional MCP servers following the same structure.

If you prefer to keep a personal copy, set the `OLLAMA_MCP_SERVERS` environment variable to point at your own JSON file before launching.

## Running the client

Use one of the new npm scripts depending on the workflow you need:

- `npm run ollama:mcp` – fire up the `mcp_client_for_ollama` with the current defaults.
- `npm run ollama:session` (alias `npm run mcp:session`) – guided launcher that lets you pick a model, choose/bundle MCP servers, and optionally save reusable bundles.
- `npm run ollama:models` – harvest local and registry model metadata for quick comparison (supports `--json`, `--query <term>` and `--host`).
- `node scripts/start-all-services.js` – the all-in-one bootstrap now launches the DeepSeek MCP client automatically (optional service `deepseek-mcp`).

The baseline launcher still allows manual overrides:

```bash
# Use a different model
OLLAMA_MCP_MODEL=deepseek-r1:1.5b npm run ollama:mcp

# Point at a remote Ollama instance
OLLAMA_HOST=http://localhost:22545 npm run ollama:mcp

# Provide a custom server configuration
OLLAMA_MCP_SERVERS=%USERPROFILE%/.config/ollmcp/custom.json npm run ollama:mcp
```

## Integrating with DeepSeek workflows

- Launch `npm run ollama:mcp` in one terminal to start the interactive MCP-aware DeepSeek session.
- In another terminal, run your usual LightDom development scripts (e.g. `npm run dev` or `npm run dev:all`).
- When DeepSeek invokes MCP tools, they will execute against the running LightDom servers defined in the configuration file.

When you need more control, prefer the interactive session launcher:

```bash
# Open the guided MCP launcher
npm run ollama:session

# Skip the prompts by supplying flags
npm run ollama:session -- --model deepseek-r1:latest --bundle deepseek-core
```

The script will:

1. Discover local models (CLI + API) and let you filter/select them.
2. Read `config/mcp/ollama-mcp-servers.json`, including the new bundle definitions.
3. Optionally persist ad-hoc server selections back into the config.
4. Generate an isolated MCP config in your temp directory and start the session with sane defaults.

The MCP tooling co-exists with the existing `OllamaDeepSeekIntegration` TypeScript service—use the class when you need programmatic control inside Node, and the `ollmcp` client (or the new session launcher) when you want a human-in-the-loop interactive environment.

## Troubleshooting

- **Missing package** – reinstall with `python -m pip install --upgrade ollmcp`.
- **Server not found** – ensure the `npx tsx ...` commands in the JSON config work on their own. The guided launcher prints which servers and bundles it is using; rerun it to confirm your selection.
- **Credentials** – supply required environment variables (`DB_*`, `N8N_API_KEY`, etc.) directly in the JSON config or via your shell session before launching the client.
- **Model availability** – verify the requested model appears in `ollama list`.

For more client options refer to the upstream repository: <https://github.com/jonigl/mcp-client-for-ollama>.
