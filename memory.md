# Session Memory

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
