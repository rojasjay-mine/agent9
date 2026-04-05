# FX / Agent9 — Session State

## What this is
**fixitagent.ai** — Cloudflare Workers multi-agent AI UI, 10 Claude-powered specialized agents.
$79.99/month flat subscription. No credits. No usage billing.
Repo: `rojasjay-mine/agent9` | Main branch | Worker: `functions/api.js`

## Stack
- Cloudflare Workers (single `functions/api.js` handles everything)
- React (CDN) + Babel in HTML string inside api.js — no framework
- KV: `fx-agents-memory` (id: `ba902d31d72444d9aae25bbb24a269e1`) bound as `MEMORY`
- Env vars needed: `ANTHROPIC_API_KEY`, `SLACK_WEBHOOK_URL`

## Routes
- `GET  /agents` → serves FX Agents UI
- `POST /api`    → Claude proxy (passes system + messages, returns raw response)
- `GET  /memory` → fetch full conversation history from KV
- `POST /memory` → save full conversation history to KV

## The 10 Agents
Webhook Doctor, Cloudflare Copilot, Code Surgeon, Slack Wrangler, Deploy Commander, Error Analyst, TikTok Brain, Substack Ghost, ENV Guardian, FX Strategist

## Done
- [x] Multi-agent UI
- [x] /api Claude proxy (was broken, now fixed — passes system + messages correctly)
- [x] /memory GET + POST endpoints (KV persistence)
- [x] KV namespace created and wired in wrangler.jsonc
- [x] Competitor research + 8 market gaps identified (see below)

## Next (priority order)
1. **Stripe** — Payments + Billing for $79.99/month subscriptions (briefing pending)
2. **Competitor presentation** (Canva — outline ready, tools were disconnected)
3. **Solo builder search** — Indie Hackers, Product Hunt, Beehiiv (rate limited last attempt)
4. **Cross-session memory** — expand KV to store per-agent memory briefs (biggest differentiator)
5. **Auto-triage webhook** — POST /alert → Claude → Slack (was removed, needs re-adding)
6. **Agent-to-agent handoffs** — "Send to Agent" button between agents
7. **Per-user memory** — currently all users share one KV key
8. **Delete agent9 (2).js** — orphaned file with hardcoded keys

## Pricing
- $79.99/month flat
- No tiers decided yet — waiting on Stripe briefing

## Scope
FX = fixitagent.ai only. No dropshipping, no Substack work for now.

## Competitive Intelligence (researched this session)

### True competitors
| Tool | Price | Threat level |
|---|---|---|
| ChatGPT Plus | $20/mo | High — primary substitute |
| Claude Pro | $20/mo | High — same engine, no specialist layer |
| Relevance AI | $29–$599/mo | Medium — multi-agent but way more expensive |
| Lindy AI | $49.99–$299/mo | Medium — ops focus, not DevOps |
| n8n / Make / Zapier | $4–$49/mo | Low — plumbing, not agents |

### Top 8 market gaps (what competitors are NOT doing)
1. No persistent cross-session memory (agents forget everything)
2. Billing shock / unpredictable credit costs (Lindy 2.4 stars Trustpilot)
3. Generic outputs — no stack-specific knowledge pre-loaded
4. Claude Pro usage lockout mid-workflow (~40-50 msgs per 5-8hrs)
5. Weeks of setup before getting value
6. Tool fragmentation ($3k-$12k/yr average solopreneur stack)
7. No DevOps/Cloudflare intelligence in consumer AI tools
8. No cross-domain strategic coherence

### Agent9's moat
- Pre-built vertical agents with deep stack-specific system prompts
- Zero setup, zero re-explaining your stack
- Flat predictable pricing (no credits)
- Only product combining DevOps + content + strategy in one UI under $100

### Positioning
"10 specialized AI teammates, pre-loaded with your exact stack, one flat price — for the solo builder who can't afford to hire."
