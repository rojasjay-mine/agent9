# agent9 — FX Agents (fixitagent.ai)

## What this is
A Cloudflare Worker serving a React-based AI agent chat UI at fixitagent.ai. Proxies Claude API calls and persists conversation history via KV.

## Stack
- **Runtime:** Cloudflare Workers (wrangler.jsonc, `main: functions/api.js`)
- **Frontend:** Inline React 18 (UMD/Babel, no build step) served at `/agents`
- **API proxy:** `/api` → Anthropic Claude API (`ANTHROPIC_API_KEY` env var)
- **Memory:** `/memory` GET/POST → Cloudflare KV (`MEMORY` binding, id: `ba902d31d72444d9aae25bbb24a269e1`)
- **Assets:** Static files served via `ASSETS` binding
- **Routes:** `fixitagent.ai/*` and `www.fixitagent.ai/*`

## Key files
- `functions/api.js` — entire backend + embedded frontend HTML
- `wrangler.jsonc` — Worker config, KV namespace, routes
- `index.html`, `agents.html`, `public/` — static assets

## Agents (10 total)
webhook-doctor, cloudflare-copilot, code-surgeon, slack-wrangler, deploy-commander, error-analyst, tiktok-brain, substack-ghost, env-guardian, fx-strategist

## Dev branch
`claude/catch-up-cXBUt` — push here, never to main without permission

## Conventions
- No build step — keep frontend as inline template literal in api.js
- Model: `claude-sonnet-4-20250514`
- KV key for memory: `fx-agents-memory`
