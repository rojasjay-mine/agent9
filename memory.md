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
