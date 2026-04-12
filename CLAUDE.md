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
- `wrangler.jsonc` — Worker config, KV namespace, routes, cron
- `index.html`, `agents.html`, `public/` — static assets

## Agents (10 total)
webhook-doctor, cloudflare-copilot, code-surgeon, slack-wrangler, deploy-commander, error-analyst, tiktok-brain, substack-ghost, env-guardian, fx-strategist

## Dev branch
`claude/review-last-session-W2uxf` — current working branch. Merge to main to deploy.

## Stripe integration
- Product: `prod_UGqw8ZLonlFJmS` (agent9)
- Prices:
  - Solo monthly $29: `price_1TJXeDGVEPbuDOhc59XQkMii`
  - Solo annual $299: `price_1TJXeHGVEPbuDOhcHI7UNbXg`
  - Starter monthly $79: `price_1TIJEiGVEPbuDOhcpbg0sLcH`
  - Starter annual $828: `price_1TIx1lGVEPbuDOhcbDPb0lj9`
  - Pro monthly $299: `price_1TIx1lGVEPbuDOhcFhdIyEQO`
  - Pro annual $2988: `price_1TIx1mGVEPbuDOhc9cjxLnec`
- Endpoints: `POST /checkout` (creates Checkout Session), `POST /webhook` (handles events)
- Webhook events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
- Webhook URL: `https://fixitagent.ai/webhook`
- Required Cloudflare env vars (add as Secrets): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Checkout has 14-day free trial, success redirects to `/?subscribed=true`
- Stripe account verification (business details) still pending — needed for payouts

## Auth flow
- After checkout → `/verify-checkout?cs={CHECKOUT_SESSION_ID}` → stores `subscriber:{email}` in KV, sets `fx_auth` cookie (HMAC-SHA256 signed), redirects to `/agents`
- `/agents` gated: verifies cookie + checks `subscriber:{email}` status = "active" in KV
- `/login` — email form, checks KV, sets cookie
- `/logout` — clears cookie
- Memory scoped per user: KV key `memory:{email}`
- Cookie: HttpOnly, Secure, SameSite=Strict, 30-day expiry
- Signing secret: `STRIPE_WEBHOOK_SECRET` env var

## Security (all live)
- Origin check on `/api` and `/memory` — only fixitagent.ai allowed
- Rate limit: 30 req/min per IP, Stripe webhook exempt
- 1MB request body size cap
- Security headers on all responses (XSS, iframe, MIME sniffing)
- GraphQL scanner probe filter on `/alert`
- Stripe webhook signature verification
- Real-time Slack @channel alerts on: rate limit exceeded, unauthorized /api access, oversized payload, invalid Stripe signature

## Monitoring
- Hourly cron (`0 * * * *`) posts health check to Slack #alerts
- Health check covers: worker online, KV status, active subscriber count, Stripe configured
- Slack #alerts channel ID: C0ANQCB103Y
- Slack #revenue- channel ID: C0ANL2EKSJX

## Cloudflare env vars needed
- `ANTHROPIC_API_KEY` — Claude API key
- `STRIPE_SECRET_KEY` — sk_live_...
- `STRIPE_WEBHOOK_SECRET` — whsec_bAPLGxBo2XEQ8dJOVYBTFxopxVvtWaoR
- `SLACK_WEBHOOK_URL` — Slack incoming webhook
- `SESSION_SECRET` — random 32-byte hex string for signing session cookies (separate from Stripe secret)

## Conventions
- No build step — keep frontend as inline template literal in api.js
- Model: `claude-sonnet-4-6`
- KV key for memory: `fx-agents-memory`
- Memory: server (KV) is source of truth, localStorage is cache only

## Visual theme
Tron Legacy — deep navy (#04080f), glowing electric blue grid, Tron cyan (#00c8ff) accents, scan line at 40% opacity. Applies to index.html, how-it-works.html, and LOGIN_HTML in api.js.

## Current goal
First paying customer. Solo $29/mo, Starter $79/mo, Pro $299/mo. Site live, Stripe wired, auth gated, security locked.

## Deploy
- GitHub Actions workflow: `.github/workflows/deploy.yml` — triggers on push to main
- `CLOUDFLARE_API_TOKEN` saved as GitHub Actions secret
- Account ID: `6b2fdf0e036db269314e45966c0ff757`
- To deploy: merge to main or push any commit to main
- To deploy from Claude session: `npx wrangler deploy` (requires CLOUDFLARE_API_TOKEN in env)
- `.assetsignore` excludes node_modules/functions/config from static asset upload (critical — without it deploys fail)

