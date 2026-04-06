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

## Stripe integration
- Product: `prod_UGqw8ZLonlFJmS` (agent9)
- Prices:
  - Starter monthly $79: `price_1TIJEiGVEPbuDOhcpbg0sLcH`
  - Starter annual $828: `price_1TIx1lGVEPbuDOhcbDPb0lj9`
  - Pro monthly $299: `price_1TIx1lGVEPbuDOhcFhdIyEQO`
  - Pro annual $2988: `price_1TIx1mGVEPbuDOhc9cjxLnec`
- Endpoints: `POST /checkout` (creates Checkout Session), `POST /webhook` (handles events)
- Webhook events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
- Webhook URL: `https://fixitagent.ai/webhook`
- Required Cloudflare env vars (add as Secrets): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Checkout has 14-day free trial, success redirects to `/?subscribed=true`

## Conventions
- No build step — keep frontend as inline template literal in api.js
- Model: `claude-sonnet-4-20250514`
- KV key for memory: `fx-agents-memory`
