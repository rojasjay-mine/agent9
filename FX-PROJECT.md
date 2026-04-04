# FX Project — Agent9

## What This Is
A Cloudflare Worker that does two things:
1. **FX Agents Chat UI** — 10 specialized AI agents accessible at `fixitagent.ai/agents`
2. **Alert Webhook** — receives alerts, diagnoses with Claude, posts to Slack via `fixitagent.ai/api`

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
- **KV / D1 / R2:** None (not used)

---

## GitHub Repo
- **Repo:** `rojasjay-mine/agent9`
- **Main branch:** `main` (auto-deploys to Cloudflare)
- **Dev branch:** `claude/catch-up-memory-jCKwE`

---

## Key Files
| File | Purpose |
|------|---------|
| `functions/api.js` | Main Worker — all routes live here |
| `wrangler.jsonc` | Cloudflare config — routes, assets, flags |
| `index.html` | Main site homepage |
| `agents.html` | Standalone agents page (backup) |

---

## Environment Variables (set in Cloudflare dashboard)
| Variable | Used For |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API calls |
| `SLACK_WEBHOOK_URL` | Posting alerts to Slack |

---

## The 10 FX Agents
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

## FX Brand Overview
- **Agent9** — AI infrastructure agent (this project)
- **Mouth tape dropshipping** — TikTok organic traffic play
- **A.I. Can Teach It** — Substack newsletter, Thursdays, beginner AI

---

## Fixes Applied (April 2026)
1. **`/api` dual-purpose fix** — was broken for the agents chat UI. Now detects chat requests (`body.messages` array) and proxies directly to Claude. Webhook alerts (`body.message` string) still post to Slack.
2. **fixitagent.ai route** — domain wasn't connected to the Worker. Fixed route in Cloudflare dashboard to `fixitagent.ai/*` and locked it in `wrangler.jsonc`.

---

## How to Deploy
Cloudflare auto-deploys when `main` is updated on GitHub.

Manual deploy (if needed):
```bash
npx wrangler deploy
```

---

## GitHub Access
Claude Code GitHub App installed on `agent9` repo with write access — can push directly.
