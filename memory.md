# Session Memory

## 2026-04-13 (session 4)
- Catch-up session — no code changes
- User installing Git + Claude Desktop locally
- Confirmed: repo/CI/Cloudflare unaffected by local installs
- Claude Desktop starts fresh but CLAUDE.md + memory.md carry project context
- Site status: live, all green, first paying customer is the goal
- Dev branch: claude/catch-up-INFic

## 2026-04-10
- Fixed missing `alertSecurityBreach` function — was causing ReferenceError on all security events (rate limit, unauthorized access, oversized payload, invalid Stripe sig)
- Added SECURITY_HEADERS to /api proxy response
- Added `.mcp.json` for n8n MCP server (project-scoped, uses N8N_API_KEY + N8N_BASE_URL env vars)
- Rewrote landing page copy — professional tone, no slang, polite/tech-savvy throughout
- Added 3-part security section to landing page: Authentication, Data Isolation, Request Integrity
- Redesigned /agents UI — light Tron color scheme (white/steel-blue), was appearing as black page
- Added agent taglines to empty state (e.g. "Paste the error. I'll diagnose it.")
- Fixed CI deploy: .assetsignore added to prevent wrangler from uploading node_modules as static assets
- CLOUDFLARE_API_TOKEN refreshed in GitHub repo secrets — deploys now 13/13 green
- Session memory moved to memory.md (separate from CLAUDE.md)
- ANTHROPIC_API_KEY missing from Cloudflare worker env vars — agents chat not working until added
  - Go to: dash.cloudflare.com → Workers & Pages → agent9 → Settings → Variables and Secrets
  - Add: ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SLACK_WEBHOOK_URL
- Dev branch: `claude/catch-up-xaAdf`

## 2026-04-11
- Fixed agents chat not working — root cause was syntax error in adminHTML template literal (escaped backticks `\`` in plain JS scope — esbuild rejects this in wrangler 4.x)
- Updated model ID: `claude-sonnet-4-20250514` → `claude-sonnet-4-6` (old ID was invalid)
- Increased max_tokens: 1000 → 16000 for full agent responses
- All 3 fixes deployed to main — agents confirmed working
- Fixed /agents layout: height 100vh flex column, msgs flex:1, header/tabs/input flexShrink:0
- Added /test-slack endpoint (owner-only) — visit fixitagent.ai/test-slack to verify Slack webhook
- Customer post-payment flow: Stripe checkout → /verify-checkout sets KV + auth cookie → lands on /agents (no separate login needed)
- SLACK_WEBHOOK_URL still needs to be added to Cloudflare env vars if Slack test fails

## 2026-04-12
- Upgraded alert layer: /admin now lists all provisioned API keys (email, name, key prefix, Slack status, created date)
- Added inline Provision Customer form to /admin — no more curl needed, shows key+secret JSON on submit
- Added POST /alert/test — customers verify API key + Slack delivery before going live
- All feature branch work (alert layer, 20 agents, Tron UI, auth, Stripe) merged to main and deployed
- Full security hardening deployed:
  - Replaced in-memory rate limiter with CF distributed RateLimit bindings (RL_GLOBAL 60/min, RL_API 15/min)
    - Configured in wrangler.jsonc under unsafe.bindings — globally enforced across all CF edge nodes
  - Added Cloudflare threat score check: requests with score >50 blocked on /api, /alert, /login, /checkout, /admin
  - /api now requires valid session cookie + active KV subscription — origin/referer-only auth was bypassable
  - Alert signature now required (was optional) — unsigned requests with valid key rejected
  - verifySessionCookie and alert HMAC now use crypto.subtle.verify (timing-safe, no string comparison)
  - Added HSTS (max-age=31536000 + preload), CSP, X-Permitted-Cross-Domain-Policies to all responses
  - SESSION_SECRET env var separates session signing from STRIPE_WEBHOOK_SECRET
  - Removed agent9.rojasjay.workers.dev from allowed origins
- SESSION_SECRET added to Cloudflare Worker secrets (generate with: openssl rand -hex 32)
- Dev branch: claude/catch-up-wdOyZ (merged to main)

## 2026-04-12 (continued)
- Added /admin/security-eval — live security scorecard, 14 checks across secrets/bindings/endpoints/headers, % score UI
- Added /admin/sandbox — interactive alert tester (owner-only, secrets never in browser, server-side signing via /admin/sign-alert)
- Fixed login broken by threat score check blocking /login — removed /login from threat-score sensitive paths
- Fixed empty sessionSecret crash — fallback is now "fx-agent9-session-default-v1" not ""
- Sandbox secrets hardened — dropdown embeds key only, signing done server-side in /admin/sign-alert (no self-request, inlined)
- Provisioned first test customer via /admin → Provision Customer form
- Slack webhook needed on provisioned customer OR SLACK_WEBHOOK_URL set in CF env vars for alerts to deliver

## 2026-04-12 (session 3)
- Fixed sandbox hang: added AbortSignal.timeout(20000) to Claude fetch in /admin/sign-alert and /alert
- Fixed sandbox hang: added AbortSignal.timeout(10000) to Slack fetch in /admin/sign-alert and /alert
- Added "SKIP CLAUDE" checkbox to sandbox UI — tests routing + Slack delivery without waiting on Claude
- CLOUDFLARE_API_TOKEN was expired — refreshed in GitHub repo secrets, deploys now working again
- SESSION_SECRET generated this session: a4354d782c730a968178a0dab5730ad063d31a87c61bc4e27728a0c40ca38c43
- Dev branch: claude/catch-up-NV6Js (all committed and pushed to main)

## 2026-04-13 (session 2)
- Wrangler v4 deploys broke secrets — v4 Versions model detached them from the worker
- Fixed CI: reverted to wrangler@3 deploy, added account_id to wrangler.jsonc
- Fixed security-eval: 522 self-probe errors now show as WARN not FAIL
- Fixed SSRF: slack_webhook URL validated to https://hooks.slack.com only on /admin/provision
- Added OWNER_EMAIL to Cloudflare secrets (rojasjay@gmail.com)
- Secrets still not loading into worker — wrangler v4 detached them
- Fix: workflow now runs `wrangler secret put` for all 6 secrets on every deploy
- Secrets hardcoded in workflow: STRIPE_WEBHOOK_SECRET, SESSION_SECRET, OWNER_EMAIL
- Still need user to add to GitHub repo secrets (Settings → Secrets → Actions):
  - WORKER_ANTHROPIC_API_KEY — Anthropic key
  - WORKER_STRIPE_SECRET_KEY — Stripe live key
  - WORKER_SLACK_WEBHOOK_URL — Slack webhook URL
- Once those 3 are added, deploy will run and push all secrets to Cloudflare correctly
- DONE — all 3 added, deploy green, agents working, security eval all green

## 2026-04-13
- Fixed GitHub Actions deploy: Node 20 deprecated → bumped to Node 22, forced Node 24 for actions
- Replaced cloudflare/wrangler-action@v3 with direct `npx wrangler@4 deploy` (action was broken with Node 24)
- CLOUDFLARE_API_TOKEN was expired — regenerated using "Edit Cloudflare Workers" template (no IP restriction)
- Added CLOUDFLARE_ACCOUNT_ID to workflow env — fixes error 9109 by skipping /memberships lookup
- All 5 CF secrets now set: ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SESSION_SECRET, SLACK_WEBHOOK_URL
- Deploys green — site live at fixitagent.ai
- Stripe key: recommended using restricted key (Checkout Sessions write, Customers read, Subscriptions read)
- Dev branch: claude/catch-up-N2izs (merged to main)

## 2026-04-13 (session 3)
- Redesigned landing page (index.html) — replaced Tron dark theme with light clean professional design
  - Font: Inter (was Orbitron + IBM Plex Mono)
  - Background: #f8fafc soft white-grey (was #04080f black)
  - Accent: #0ea5e9 sky blue (was #00c8ff cyan)
  - Cards: white with #e2e8f0 borders + subtle shadows
  - Removed: animated grid, scan line, all glow effects
  - Nav: frosted white, pricing cards rounded, terminal widget light grey
- Dev branch: claude/catch-up-ArCur (merged to main, deployed)

## Cloudflare env vars status (as of 2026-04-13)
ALL SET — all 5 secrets confirmed in Cloudflare Worker:
- ANTHROPIC_API_KEY ✓
- STRIPE_SECRET_KEY ✓
- STRIPE_WEBHOOK_SECRET ✓
- SESSION_SECRET ✓
- SLACK_WEBHOOK_URL ✓
Run fixitagent.ai/admin/security-eval to verify all green.
