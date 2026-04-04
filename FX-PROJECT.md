# FX Project — Agent9

## What This Is
A Cloudflare Worker that does two things:
1. **FX Agents Chat UI** — 10 specialized AI agents accessible at `fixitagent.ai/agents`
2. **Alert Webhook** — receives alerts, diagnoses with Claude, posts to Slack via `fixitagent.ai/api`

---

## Brand Structure
- **FX** — umbrella brand/company
- **Agent9 / fixitagent.ai** — product #1 under FX
- **A.I. Can Teach It** — Substack newsletter (Thursdays, beginner AI)
- **Mouth tape dropshipping** — TikTok organic traffic play

---

## Product Description (final approved)
> Agent9 is an AI-powered infrastructure watchdog that works 24/7. Before anyone gets paged, it diagnoses the root cause in under 2 seconds and takes care of it — securely.

---

## Live URLs
| URL | What it does |
|-----|-------------|
| `fixitagent.ai` | Main site (serves index.html) |
| `fixitagent.ai/agents` | FX Agents chat interface |
| `fixitagent.ai/api` | Webhook + chat proxy endpoint |
| `agent9.rojasjay.workers.dev` | Direct Cloudflare Workers URL |

---

## Cloudflare Account
- **Account:** J.Rojas Account
- **Account ID:** `6b2fdf0e036db269314e45966c0ff757`
- **Worker:** `agent9`
- **KV / D1 / R2:** None (not used yet)

---

## GitHub Repo
- **Repo:** `rojasjay-mine/agent9`
- **Main branch:** `main` (auto-deploys to Cloudflare)
- **Dev branch:** `claude/catch-up-memory-jCKwE`
- **GitHub App:** Claude Code installed with write access ✓

---

## Key Files
| File | Purpose |
|------|---------|
| `functions/api.js` | Main Worker — all routes live here |
| `wrangler.jsonc` | Cloudflare config — routes, assets, flags |
| `index.html` | Main site landing page |
| `agents.html` | Standalone agents page (backup) |
| `FX-PROJECT.md` | This file — project memory |

---

## Environment Variables (set in Cloudflare dashboard)
| Variable | Used For |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API calls |
| `SLACK_WEBHOOK_URL` | Posting alerts to Slack |

---

## The 10 FX Agents (at /agents)
| Agent | Role |
|-------|------|
| Webhook Doctor | Fixes 405 errors, POST handling |
| Cloudflare Copilot | Step-by-step Cloudflare navigation |
| Code Surgeon | Rewrites JS for Cloudflare |
| Slack Wrangler | Slack webhook setup & rotation |
| Deploy Commander | Manual deploy sequences |
| Error Analyst | Reads logs, gives root-cause fixes |
| TikTok Brain | Organic TikTok strategy (mouth tape niche) |
| Substack Ghost | Ghostwrites A.I. Can Teach It newsletter |
| ENV Guardian | Credential security & rotation |
| FX Strategist | Big picture brand & revenue strategy |

---

## Pricing (on landing page)
| Plan | Price | Includes |
|------|-------|---------|
| Starter | $79/mo | 1 environment, unlimited alerts, Claude diagnosis, Slack posting |
| Pro | $299/mo | 5 environments, multi-agent (v0.2), priority support |
| Enterprise | Custom | Unlimited + self-hosted + SLA |

**Model:** Customer brings their own Anthropic API key. Zero COGS on Claude API.

---

## Roadmap
- **v0.1 (LIVE)** — Webhook → Claude diagnosis → Slack post
- **v0.2 (next)** — Multi-agent: Triage, Diagnosis, Audit, Comms running in parallel
- **v1.0 (vision)** — Full self-healing: detects, writes fix, executes, rolls back if fails

---

## Fixes Applied (April 2026)
1. **`/api` dual-purpose fix** — was broken for the agents chat UI. Now detects chat requests (`body.messages` array) and proxies directly to Claude. Webhook alerts (`body.message` string) still post to Slack.
2. **fixitagent.ai route** — domain wasn't connected to the Worker. Fixed route in Cloudflare dashboard to `fixitagent.ai/*` and locked it in `wrangler.jsonc`.
3. **Hero description updated** — new approved copy live on landing page.

---

## Branding In Progress
- **Logo:** A9 crest — traditional Americana heraldic style, full body eagle (side profile, not facing viewer), red/white/blue colorway, fancy non-bold A9 font inside crest
- **Saved in Canva:** "Matte Black Americana Crest Logo" (DAHF2Il95SI) — edit at canva.com/d/A-pnlDSL7lNsyOm
- **Latest options generated** (red/white/blue refined):
  - canva.com/d/i-vo7EKyYmIobiY
  - canva.com/d/LbUPkuKoVsUIvNP
  - canva.com/d/bI-80r7IKtf3DWf
  - canva.com/d/gUYKt4G3NHSxGDP

---

## Revenue Plan (next steps)
1. **Connect Stripe** — create $79/mo payment link (in progress)
2. **Add payment link to site buttons** — replace "Get Early Access" CTA
3. **Post in 3 free communities** — Reddit r/devops, Indie Hackers, a Discord
4. **Get 1 paying customer this week** — manual setup (configure their API key in Cloudflare)
5. **Build full automation** — Stripe webhook → auto-create account → customer enters own API key → live

---

## Automation Roadmap (to remove manual work)
1. Stripe — payment ✓ (setting up)
2. Auth — customer login (Clerk, free tier)
3. Database — per-customer API keys + Slack webhooks (Cloudflare D1, free)
4. Stripe webhook — auto-create account on payment
5. Customer dashboard — enter keys, see status
