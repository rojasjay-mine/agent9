const AGENTS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>FX Agents</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0c1220; color: #c8d8f0; font-family: 'Courier New', monospace; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #0c1220; }
  ::-webkit-scrollbar-thumb { background: #1e3050; border-radius: 2px; }
  input::placeholder { color: #3a5070; }
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
const { useState, useRef, useEffect } = React;
const AGENTS = [
  { id: "webhook-doctor", name: "Webhook Doctor", icon: "🩺", color: "#ff4444", role: "Diagnoses 405 errors, POST handling, Cloudflare Pages function syntax", system: "You are Webhook Doctor, an expert in Cloudflare Pages Functions, REST APIs, and webhook debugging. You specialize in fixing 405 Method Not Allowed errors, POST request handling, and Cloudflare Pages function syntax. Be concise, numbered steps. Give exact code fixes." },
  { id: "cloudflare-copilot", name: "Cloudflare Copilot", icon: "☁️", color: "#f6821f", role: "Step-by-step Cloudflare Pages & Workers navigation", system: "You are Cloudflare Copilot, an expert in Cloudflare Pages, Workers, DNS, environment variables, and the 2026 Cloudflare dashboard UI. Give exact step-by-step navigation instructions. Be precise about UI locations. Never guess." },
  { id: "code-surgeon", name: "Code Surgeon", icon: "🔬", color: "#00ff88", role: "Rewrites and fixes JS for Cloudflare Pages Functions", system: "You are Code Surgeon, an expert JavaScript developer specializing in Cloudflare Pages Functions syntax. You rewrite functions/api.js to work correctly on Pages not Workers. Output clean, complete, copy-paste-ready code. No explanations unless asked." },
  { id: "slack-wrangler", name: "Slack Wrangler", icon: "💬", color: "#9b59b6", role: "Slack webhook setup, rotation, and testing", system: "You are Slack Wrangler, an expert in Slack Incoming Webhooks, Slack App configuration, webhook rotation, and testing via Hoppscotch. Give exact numbered steps. Understand security best practices around credential rotation." },
  { id: "deploy-commander", name: "Deploy Commander", icon: "🚀", color: "#0070f3", role: "Manual deploy sequences for Cloudflare Pages via GitHub", system: "You are Deploy Commander, an expert in manual deployment workflows for Cloudflare Pages using GitHub. Specialize in: edit file on GitHub, commit, trigger manual redeploy on Cloudflare Pages. Give numbered steps, exact file paths, flag ordering errors." },
  { id: "error-analyst", name: "Error Analyst", icon: "🔍", color: "#ffcc00", role: "Reads error logs and gives root-cause fixes", system: "You are Error Analyst, an expert at reading raw error logs, HTTP responses, and stack traces. When given error output, immediately identify root cause and give a numbered fix. Direct, no hedging." },
  { id: "tiktok-brain", name: "TikTok Brain", icon: "🎵", color: "#ff0050", role: "Organic TikTok strategy for mouth tape dropshipping", system: "You are TikTok Brain, an expert in faceless organic TikTok content strategy for dropshipping. Specialize in mouth tape / sleep strip niche. Know hook formulas, content angles, trending sounds, drive traffic without showing a face. Be tactical." },
  { id: "substack-ghost", name: "Substack Ghost", icon: "✍️", color: "#ff6719", role: "Drafts A.I. Can Teach It newsletter content", system: "You are Substack Ghost, ghostwriter for A.I. Can Teach It, a beginner AI newsletter. Schedule: Thursdays. Tone: simple, practical. Write welcome emails, issue drafts, subject lines, CTAs. Faceless brand." },
  { id: "env-guardian", name: "ENV Guardian", icon: "🔐", color: "#8b5cf6", role: "Manages environment variables and credential security", system: "You are ENV Guardian, expert in secure credential management for Cloudflare Pages, API keys, Slack webhooks. Guide rotation, storage in Cloudflare Pages Settings, security hygiene after exposure. Never ask for actual keys." },
  { id: "fx-strategist", name: "FX Strategist", icon: "🧠", color: "#06b6d4", role: "Big picture FX brand and revenue strategy", system: "You are FX Strategist, business brain behind the FX brand fixitagent.ai. See across: Agent9, mouth tape dropshipping, A.I. Can Teach It Substack. Find revenue bridges, sequencing gaps, overlooked angles. Direct, contrarian when warranted." },
];
const STORAGE_KEY = "fx-agents-v1";
const loadHistory = () => { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; } };
const saveHistory = (d) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} };
function App() {
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [memoryStatus, setMemoryStatus] = useState("");
  const bottomRef = useRef(null);
  const current = messages[activeAgent.id] || [];
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [current, loading]);

  // Fetch memory from server on mount — server is source of truth
  useEffect(() => {
    fetch("/memory")
      .then(r => r.ok ? r.json() : null)
      .then(serverData => {
        if (serverData && Object.keys(serverData).length > 0) {
          setMessages(serverData);
          saveHistory(serverData);
          setMemoryStatus("SYNCED");
        }
      })
      .catch(() => {});
  }, []);

  const updateMessages = (id, msgs) => {
    setMessages(prev => {
      const next = { ...prev, [id]: msgs };
      saveHistory(next);
      // Persist to server memory
      fetch("/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      }).catch(() => {});
      return next;
    });
  };
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const updated = [...current, userMsg];
    updateMessages(activeAgent.id, updated);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: activeAgent.system, messages: updated }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "No response.";
      updateMessages(activeAgent.id, [...updated, { role: "assistant", content: reply }]);
    } catch {
      updateMessages(activeAgent.id, [...updated, { role: "assistant", content: "API error." }]);
    }
    setLoading(false);
  };
  const S = {
    header: { padding: "14px 20px", borderBottom: "1px solid #1e3050", display: "flex", alignItems: "center", gap: "10px" },
    tabs: { display: "flex", overflowX: "auto", gap: "5px", padding: "10px 14px", borderBottom: "1px solid #172840", scrollbarWidth: "none" },
    role: { padding: "6px 16px", fontSize: "10px", color: "#3a5878", borderBottom: "1px solid #172840", letterSpacing: "1px" },
    msgs: { flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "300px", maxHeight: "calc(100vh - 200px)" },
    inputRow: { padding: "12px 16px", borderTop: "1px solid #172840", display: "flex", gap: "8px" },
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={S.header}>
        <span style={{ fontSize: "11px", color: "#4a6a8a", letterSpacing: "3px" }}>FX</span>
        <span style={{ color: "#2a4060" }}>|</span>
        <span style={{ fontSize: "11px", color: activeAgent.color, letterSpacing: "2px" }}>{activeAgent.icon} {activeAgent.name.toUpperCase()}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          {memoryStatus && <span style={{ fontSize: "9px", color: "#2a6a3a", letterSpacing: "1px" }}>MEM:{memoryStatus}</span>}
          <span style={{ fontSize: "9px", color: "#2a5a3a", letterSpacing: "1px" }}>SAVED</span>
          <button onClick={() => updateMessages(activeAgent.id, [])} style={{ background: "transparent", border: "1px solid #1e3050", borderRadius: "3px", padding: "3px 8px", color: "#4a6a8a", fontSize: "9px", cursor: "pointer", fontFamily: "inherit" }}>CLEAR</button>
        </div>
      </div>
      <div style={S.tabs}>
        {AGENTS.map(a => {
          const hasHistory = (messages[a.id] || []).length > 0;
          const isActive = activeAgent.id === a.id;
          return (
            <button key={a.id} onClick={() => setActiveAgent(a)} style={{ flexShrink: 0, background: isActive ? "#102040" : "transparent", border: "1px solid " + (isActive ? a.color : hasHistory ? "#2a4060" : "#1a3050"), borderRadius: "4px", padding: "5px 11px", cursor: "pointer", color: isActive ? a.color : hasHistory ? "#7a9ab8" : "#3a5878", fontSize: "10px", letterSpacing: "1px", whiteSpace: "nowrap", fontFamily: "inherit", position: "relative" }}>
              {a.icon} {a.name}
              {hasHistory && !isActive && <span style={{ position: "absolute", top: "3px", right: "3px", width: "4px", height: "4px", borderRadius: "50%", background: a.color, opacity: 0.7 }} />}
            </button>
          );
        })}
      </div>
      <div style={S.role}>▸ {activeAgent.role}</div>
      <div style={S.msgs}>
        {current.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            <div style={{ fontSize: "28px" }}>{activeAgent.icon}</div>
            <div style={{ fontSize: "10px", marginTop: "10px", color: activeAgent.color + "55", letterSpacing: "2px" }}>{activeAgent.name} ready</div>
          </div>
        )}
        {current.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "84%", background: m.role === "user" ? "#111e35" : "#0e1928", border: "1px solid " + (m.role === "user" ? activeAgent.color + "50" : "#1e3050"), borderRadius: "5px", padding: "10px 14px", fontSize: "12px", lineHeight: "1.65", color: m.role === "user" ? "#d0e8ff" : "#b0c8e8", whiteSpace: "pre-wrap" }}>
              {m.role === "assistant" && <div style={{ fontSize: "9px", color: activeAgent.color, marginBottom: "6px", letterSpacing: "2px" }}>{activeAgent.icon} {activeAgent.name.toUpperCase()}</div>}
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ color: activeAgent.color + "66", fontSize: "11px", letterSpacing: "2px" }}>{activeAgent.icon} thinking...</div>}
        <div ref={bottomRef} />
      </div>
      <div style={S.inputRow}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()} placeholder={"Ask " + activeAgent.name + "..."}
          style={{ flex: 1, background: "#0e1928", border: "1px solid #1e3050", borderRadius: "4px", padding: "10px 14px", color: "#d0e8ff", fontSize: "12px", outline: "none", fontFamily: "inherit" }} />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ background: loading ? "#0e1928" : activeAgent.color + "22", border: "1px solid " + (loading ? "#1e3050" : activeAgent.color + "99"), borderRadius: "4px", padding: "10px 16px", color: loading ? "#2a4060" : activeAgent.color, cursor: loading ? "not-allowed" : "pointer", fontSize: "11px", letterSpacing: "1px", fontFamily: "inherit" }}>
          SEND
        </button>
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
</script>
</body>
</html>`;

const PRICES = {
  "solo-monthly":    "price_1TJXeDGVEPbuDOhc59XQkMii",
  "solo-annual":     "price_1TJXeHGVEPbuDOhcHI7UNbXg",
  "starter-monthly": "price_1TIJEiGVEPbuDOhcpbg0sLcH",
  "starter-annual":  "price_1TIx1lGVEPbuDOhcbDPb0lj9",
  "pro-monthly":     "price_1TIx1lGVEPbuDOhcFhdIyEQO",
  "pro-annual":      "price_1TIx1mGVEPbuDOhc9cjxLnec",
};

// ── Login page HTML ───────────────────────────────────────────────────────────
const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Access — fixitagent.ai</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#04080f;color:#8ec8e8;font-family:'IBM Plex Mono',monospace;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
  body::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(0,160,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,160,255,0.07) 1px,transparent 1px);background-size:60px 60px}
  .box{position:relative;z-index:1;width:100%;max-width:400px;border:1px solid #0d2040;background:#070d1a;padding:48px 40px}
  .logo{font-family:'Orbitron',monospace;font-weight:700;font-size:18px;color:#d0eeff;letter-spacing:2px;margin-bottom:40px;text-decoration:none;display:block;text-shadow:0 0 20px rgba(0,200,255,0.5)}
  .logo span{color:#00c8ff}
  h1{font-family:'Orbitron',monospace;font-size:20px;color:#d0eeff;margin-bottom:10px}
  p{font-size:13px;color:#2a5070;margin-bottom:28px;line-height:1.7}
  input{width:100%;background:#04080f;border:1px solid #0d2040;padding:12px 16px;color:#d0eeff;font-family:'IBM Plex Mono',monospace;font-size:13px;outline:none;margin-bottom:12px;transition:border-color 0.2s}
  input:focus{border-color:#00c8ff;box-shadow:0 0 8px rgba(0,200,255,0.2)}
  button{width:100%;background:#00c8ff;border:1px solid #00c8ff;padding:12px;color:#04080f;font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:500;cursor:pointer;letter-spacing:1px;transition:all 0.2s}
  button:hover{background:#40d8ff;box-shadow:0 0 20px rgba(0,200,255,0.3)}
  button:disabled{background:#071a2e;border-color:#0d2040;color:#0066aa;cursor:not-allowed}
  .msg{margin-top:16px;font-size:12px;color:#ff4e4e;min-height:20px;line-height:1.6}
  .msg.ok{color:#00c8ff}
  .footer{margin-top:32px;font-size:12px;color:#2a5070}
  .footer a{color:#00c8ff;text-decoration:none}
</style>
</head>
<body>
<div class="box">
  <a href="/" class="logo">FX<span>AGENT</span></a>
  <h1>Member Access</h1>
  <p>Enter the email you used to subscribe.</p>
  <input type="email" id="email" placeholder="you@example.com" autofocus />
  <button id="btn" onclick="login()">ACCESS AGENTS →</button>
  <div class="msg" id="msg"></div>
  <div class="footer">Not a member? <a href="/#pricing">See plans →</a></div>
</div>
<script>
async function login() {
  const email = document.getElementById('email').value.trim();
  const msg = document.getElementById('msg');
  const btn = document.getElementById('btn');
  if (!email) { msg.textContent = 'Enter your email.'; return; }
  btn.disabled = true; btn.textContent = 'CHECKING...'; msg.textContent = '';
  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) { msg.className = 'msg ok'; msg.textContent = 'Access granted. Redirecting...'; window.location.href = '/agents'; return; }
    const text = await res.text();
    msg.textContent = text || 'No active subscription found. Check your email or upgrade.';
  } catch { msg.textContent = 'Something went wrong. Try again.'; }
  btn.disabled = false; btn.textContent = 'ACCESS AGENTS →';
}
document.getElementById('email').addEventListener('keydown', e => e.key === 'Enter' && login());
</script>
</body>
</html>`;

// ── Auth helpers ──────────────────────────────────────────────────────────────
async function signSession(email, secret) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(email));
  const b64sig = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${btoa(email)}.${b64sig}`;
}

async function verifySessionCookie(cookieHeader, secret) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/fx_auth=([^;]+)/);
  if (!match) return null;
  const token = decodeURIComponent(match[1]);
  try {
    const [b64email] = token.split(".");
    const email = atob(b64email);
    const expected = await signSession(email, secret);
    if (token !== expected) return null;
    return email;
  } catch { return null; }
}

function authCookie(token, maxAge = 2592000) {
  return `fx_auth=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

// ── Stripe signature verification ─────────────────────────────────────────────
async function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts = sigHeader.split(",").reduce((acc, p) => {
    const [k, v] = p.split("="); acc[k] = v; return acc;
  }, {});
  const timestamp = parts.t;
  const sig = parts.v1;
  if (!timestamp || !sig) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const raw = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`));
  const computed = Array.from(new Uint8Array(raw)).map(b => b.toString(16).padStart(2, "0")).join("");
  return computed === sig;
}

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

// Simple in-memory rate limiter (per IP, resets on worker restart)
const rateLimitMap = new Map();
function isRateLimited(ip, limit = 30, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now, alerted: false };
  if (now - entry.start > windowMs) { entry.count = 0; entry.start = now; entry.alerted = false; }
  entry.count++;
  rateLimitMap.set(ip, entry);
  // Return {limited, firstHit} so we only alert once per window
  if (entry.count > limit) {
    const firstHit = !entry.alerted;
    entry.alerted = true;
    return { limited: true, firstHit };
  }
  return { limited: false, firstHit: false };
}

export default {
  async scheduled(event, env) {
    const now = new Date().toUTCString();
    let kvStatus = "✓";
    let subCount = 0;

    try {
      await env.MEMORY.get("fx-agents-memory");
    } catch {
      kvStatus = "✗ KV ERROR";
    }

    // Check active subscriptions via Stripe
    if (env.STRIPE_SECRET_KEY) {
      try {
        const res = await fetch("https://api.stripe.com/v1/subscriptions?status=active&limit=100", {
          headers: { "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}` }
        });
        const data = await res.json();
        subCount = data.data?.length || 0;
      } catch {}
    }

    if (env.SLACK_WEBHOOK_URL) {
      await fetch(env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🟢 *Agent9 Hourly Status*\n*Time:* ${now}\n*Worker:* ✓ Online\n*KV Memory:* ${kvStatus}\n*Active Subscribers:* ${subCount}\n*Stripe:* ${env.STRIPE_SECRET_KEY ? "✓ Configured" : "✗ Missing key"}`
        })
      }).catch(() => {});
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";

    // Rate limit: 30 requests/min per IP (skip for Stripe webhooks)
    const { limited, firstHit } = url.pathname !== "/webhook" ? isRateLimited(ip) : { limited: false, firstHit: false };
    if (limited) {
      if (firstHit) await alertSecurityBreach(env, "RATE LIMIT EXCEEDED", `IP: ${ip}\nPath: ${url.pathname}\nMethod: ${request.method}`);
      return new Response("Too many requests", { status: 429, headers: SECURITY_HEADERS });
    }

    // Block oversized request bodies (max 1MB)
    const contentLength = parseInt(request.headers.get("Content-Length") || "0");
    if (contentLength > 1_000_000) {
      await alertSecurityBreach(env, "OVERSIZED PAYLOAD", `IP: ${ip}\nPath: ${url.pathname}\nSize: ${contentLength} bytes`);
      return new Response("Payload too large", { status: 413, headers: SECURITY_HEADERS });
    }

    // Origin check helper — only fixitagent.ai allowed for sensitive endpoints
    const origin = request.headers.get("Origin") || "";
    const referer = request.headers.get("Referer") || "";
    const ALLOWED = ["https://fixitagent.ai", "https://www.fixitagent.ai"];
    const fromSite = ALLOWED.some(a => origin.startsWith(a) || referer.startsWith(a));

    const sessionSecret = env.STRIPE_WEBHOOK_SECRET || "fx-fallback-secret";
    const cookieHeader = request.headers.get("Cookie") || "";

    // GET /login — serve login page
    if (url.pathname === "/login" && request.method === "GET") {
      return new Response(LOGIN_HTML, {
        headers: { "Content-Type": "text/html;charset=UTF-8", ...SECURITY_HEADERS }
      });
    }

    // POST /login — verify email against KV subscriber list, set auth cookie
    if (url.pathname === "/login" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
      const email = (body.email || "").trim().toLowerCase();
      if (!email) return new Response("Email required", { status: 400 });

      // Owner always gets in — auto-creates KV entry if missing
      const ownerEmail = (env.OWNER_EMAIL || "rojasjay@gmail.com").toLowerCase();
      if (email === ownerEmail) {
        if (env.MEMORY) {
          await env.MEMORY.put(`subscriber:${email}`, JSON.stringify({ status: "active", customerId: "owner" }));
        }
        const token = await signSession(email, sessionSecret);
        return new Response("OK", { status: 200, headers: { "Set-Cookie": authCookie(token), ...SECURITY_HEADERS } });
      }

      const subRaw = env.MEMORY ? await env.MEMORY.get(`subscriber:${email}`) : null;
      if (!subRaw) return new Response("No active subscription found for that email.", { status: 403 });
      const sub = JSON.parse(subRaw);
      if (sub.status !== "active") return new Response("Your subscription is no longer active.", { status: 403 });
      const token = await signSession(email, sessionSecret);
      return new Response("OK", {
        status: 200,
        headers: { "Set-Cookie": authCookie(token), ...SECURITY_HEADERS }
      });
    }

    // GET /admin — owner-only dashboard (system status, subscribers, health)
    if ((url.pathname === "/admin" || url.pathname === "/admin/") && request.method === "GET") {
      const email = await verifySessionCookie(cookieHeader, sessionSecret);
      const ownerEmail = (env.OWNER_EMAIL || "rojasjay@gmail.com").toLowerCase();
      if (email !== ownerEmail) return Response.redirect("https://fixitagent.ai/login", 302);

      // Gather stats
      let subCount = 0;
      let kvStatus = "OK";
      let stripeStatus = "Not configured";
      let slackStatus = env.SLACK_WEBHOOK_URL ? "Configured" : "Not configured";
      let subscribers = [];

      try { await env.MEMORY.get("_health"); } catch { kvStatus = "ERROR"; }

      if (env.STRIPE_SECRET_KEY) {
        try {
          const res = await fetch("https://api.stripe.com/v1/subscriptions?status=active&limit=100", {
            headers: { "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}` }
          });
          const data = await res.json();
          subCount = data.data?.length || 0;
          subscribers = (data.data || []).map(s => ({
            email: s.customer_email || s.customer,
            plan: s.items?.data?.[0]?.price?.id || "unknown",
            status: s.status,
            trial_end: s.trial_end ? new Date(s.trial_end * 1000).toISOString().slice(0,10) : null,
          }));
          stripeStatus = "Connected";
        } catch { stripeStatus = "Error"; }
      }

      const adminHTML = \`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Admin — fixitagent.ai</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#04080f;color:#8ec8e8;font-family:'IBM Plex Mono',monospace;padding:40px 20px}
  body::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(0,160,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,160,255,0.07) 1px,transparent 1px);background-size:60px 60px}
  .wrap{max-width:700px;margin:0 auto;position:relative;z-index:1}
  .logo{font-family:'Orbitron',monospace;font-weight:700;font-size:18px;color:#d0eeff;letter-spacing:2px;margin-bottom:8px;text-shadow:0 0 20px rgba(0,200,255,0.5)}
  .logo span{color:#00c8ff}
  h1{font-family:'Orbitron',monospace;font-size:24px;color:#d0eeff;margin-bottom:32px}
  .card{border:1px solid #0d2040;background:#070d1a;padding:24px;margin-bottom:16px}
  .card h2{font-family:'Orbitron',monospace;font-size:13px;color:#00c8ff;letter-spacing:2px;margin-bottom:16px}
  .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #0d2040;font-size:13px}
  .row:last-child{border:none}
  .label{color:#2a5070}
  .val{color:#d0eeff}
  .val.ok{color:#00c8ff}
  .val.err{color:#ff4e4e}
  .sub-list{margin-top:12px}
  .sub-item{padding:10px 0;border-bottom:1px solid #0d2040;font-size:12px;color:#8ec8e8}
  .sub-item:last-child{border:none}
  .links{margin-top:24px;display:flex;gap:16px}
  .links a{color:#00c8ff;font-size:13px;text-decoration:none}
  .links a:hover{text-decoration:underline}
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">FX<span>AGENT</span></div>
  <h1>Admin Panel</h1>
  <div class="card">
    <h2>SYSTEM STATUS</h2>
    <div class="row"><span class="label">Worker</span><span class="val ok">Online</span></div>
    <div class="row"><span class="label">KV Memory</span><span class="val \${kvStatus === 'OK' ? 'ok' : 'err'}">\${kvStatus}</span></div>
    <div class="row"><span class="label">Stripe</span><span class="val \${stripeStatus === 'Connected' ? 'ok' : 'err'}">\${stripeStatus}</span></div>
    <div class="row"><span class="label">Slack</span><span class="val \${slackStatus === 'Configured' ? 'ok' : 'err'}">\${slackStatus}</span></div>
    <div class="row"><span class="label">Active Subscribers</span><span class="val ok">\${subCount}</span></div>
  </div>
  <div class="card">
    <h2>SUBSCRIBERS</h2>
    \${subscribers.length === 0 ? '<div style="color:#2a5070;font-size:13px">No active subscribers yet.</div>' :
      subscribers.map(s => \`<div class="sub-item">\${s.email} — \${s.status}\${s.trial_end ? ' (trial until ' + s.trial_end + ')' : ''}</div>\`).join('')}
  </div>
  <div class="card">
    <h2>QUICK LINKS</h2>
    <div class="links">
      <a href="/agents">Agents</a>
      <a href="/logout">Logout</a>
      <a href="/">Home</a>
    </div>
  </div>
</div>
</body>
</html>\`;
      return new Response(adminHTML, {
        headers: { "Content-Type": "text/html;charset=UTF-8", ...SECURITY_HEADERS }
      });
    }

    // GET /logout — clear cookie and redirect home
    if (url.pathname === "/logout") {
      return new Response(null, {
        status: 302,
        headers: { "Location": "https://fixitagent.ai/", "Set-Cookie": authCookie("", 0) }
      });
    }

    // GET /verify-checkout — called after Stripe checkout, sets auth cookie
    if (url.pathname === "/verify-checkout" && request.method === "GET") {
      const csId = url.searchParams.get("cs");
      if (!csId || !env.STRIPE_SECRET_KEY) return Response.redirect("https://fixitagent.ai/#pricing", 302);
      const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${csId}`, {
        headers: { "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}` }
      });
      if (!res.ok) return Response.redirect("https://fixitagent.ai/#pricing", 302);
      const session = await res.json();
      const email = (session.customer_details?.email || "").toLowerCase();
      if (!email) return Response.redirect("https://fixitagent.ai/#pricing", 302);
      if (env.MEMORY) {
        await env.MEMORY.put(`subscriber:${email}`, JSON.stringify({
          status: "active",
          customerId: session.customer,
          sessionId: csId,
        }));
      }
      const token = await signSession(email, sessionSecret);
      return new Response(null, {
        status: 302,
        headers: { "Location": "https://fixitagent.ai/agents", "Set-Cookie": authCookie(token) }
      });
    }

    // GET /agents — gated behind active subscription
    if (url.pathname === "/agents" || url.pathname === "/agents/") {
      const email = await verifySessionCookie(cookieHeader, sessionSecret);
      if (!email) return Response.redirect("https://fixitagent.ai/login", 302);
      const subRaw = env.MEMORY ? await env.MEMORY.get(`subscriber:${email}`) : null;
      if (!subRaw) return Response.redirect("https://fixitagent.ai/login", 302);
      const sub = JSON.parse(subRaw);
      if (sub.status !== "active") return Response.redirect("https://fixitagent.ai/#pricing", 302);
      return new Response(AGENTS_HTML, {
        headers: { "Content-Type": "text/html;charset=UTF-8", ...SECURITY_HEADERS }
      });
    }

    // GET /memory — fetch stored conversation history from KV (per user)
    if (url.pathname === "/memory" && request.method === "GET") {
      const email = await verifySessionCookie(cookieHeader, sessionSecret);
      if (!email) return new Response("Unauthorized", { status: 401, headers: SECURITY_HEADERS });
      if (!env.MEMORY) return new Response(JSON.stringify({}), { headers: { "Content-Type": "application/json" } });
      const stored = await env.MEMORY.get(`memory:${email}`);
      return new Response(stored || "{}", { headers: { "Content-Type": "application/json" } });
    }

    // POST /memory — save conversation history to KV (per user)
    if (url.pathname === "/memory" && request.method === "POST") {
      const email = await verifySessionCookie(cookieHeader, sessionSecret);
      if (!email) return new Response("Unauthorized", { status: 401, headers: SECURITY_HEADERS });
      if (!env.MEMORY) return new Response("KV not configured", { status: 503 });
      let body;
      try {
        body = await request.text();
        JSON.parse(body);
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }
      await env.MEMORY.put(`memory:${email}`, body);
      return new Response("OK", { status: 200 });
    }

    // POST /api — proxy to Claude API
    if (url.pathname === "/api" || url.pathname === "/api/") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }
      // Auth check — only allow requests from fixitagent.ai
      if (!fromSite) {
        await alertSecurityBreach(env, "UNAUTHORIZED /api ACCESS", `IP: ${ip}\nOrigin: ${origin || "none"}\nReferer: ${referer || "none"}`);
        return new Response("Unauthorized", { status: 401, headers: SECURITY_HEADERS });
      }
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }

      const { model, max_tokens, system, messages } = body;

      const claudePayload = {
        model: model || "claude-sonnet-4-20250514",
        max_tokens: max_tokens || 1000,
        messages: messages || [],
      };
      if (system) claudePayload.system = system;

      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify(claudePayload)
      });

      const claudeData = await claudeResponse.json();
      return new Response(JSON.stringify(claudeData), {
        status: claudeResponse.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    // POST /checkout — create Stripe Checkout Session
    if (url.pathname === "/checkout" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
      const { plan = "starter", billing = "monthly" } = body;
      const priceId = PRICES[`${plan}-${billing}`];
      if (!priceId) return new Response("Invalid plan", { status: 400 });
      if (!env.STRIPE_SECRET_KEY) return new Response("Stripe not configured", { status: 503 });

      const params = new URLSearchParams({
        mode: "subscription",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        "subscription_data[trial_period_days]": "14",
        success_url: "https://fixitagent.ai/verify-checkout?cs={CHECKOUT_SESSION_ID}",
        cancel_url: "https://fixitagent.ai/#pricing",
      });

      const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
      const session = await stripeRes.json();
      if (!stripeRes.ok) return new Response(JSON.stringify(session), { status: stripeRes.status, headers: { "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // POST /webhook — handle Stripe events
    if (url.pathname === "/webhook" && request.method === "POST") {
      const sig = request.headers.get("stripe-signature");
      const rawBody = await request.text();

      if (env.STRIPE_WEBHOOK_SECRET) {
        const valid = await verifyStripeSignature(rawBody, sig || "", env.STRIPE_WEBHOOK_SECRET);
        if (!valid) {
        await alertSecurityBreach(env, "INVALID STRIPE SIGNATURE", `IP: ${ip}\nPossible webhook forgery attempt`);
        return new Response("Invalid signature", { status: 400 });
      }
      }

      let event;
      try { event = JSON.parse(rawBody); } catch { return new Response("Invalid JSON", { status: 400 }); }

      let slackMsg = null;

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const email = (session.customer_details?.email || "").toLowerCase();
        const amount = session.amount_subtotal ? `$${(session.amount_subtotal / 100).toFixed(0)}` : "";
        if (email && env.MEMORY) {
          await env.MEMORY.put(`subscriber:${email}`, JSON.stringify({
            status: "active",
            customerId: session.customer,
            sessionId: session.id,
          }));
        }
        slackMsg = `🎉 *New Agent9 Subscriber!*\n*Email:* ${email || "unknown"}\n*Amount:* ${amount}/mo\n*Trial:* 14 days free`;
      } else if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object;
        // Look up email from Stripe customer and mark cancelled in KV
        if (env.STRIPE_SECRET_KEY && env.MEMORY) {
          try {
            const custRes = await fetch(`https://api.stripe.com/v1/customers/${sub.customer}`, {
              headers: { "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}` }
            });
            const cust = await custRes.json();
            const email = (cust.email || "").toLowerCase();
            if (email) {
              const existing = await env.MEMORY.get(`subscriber:${email}`);
              if (existing) {
                const data = JSON.parse(existing);
                await env.MEMORY.put(`subscriber:${email}`, JSON.stringify({ ...data, status: "cancelled" }));
              }
            }
          } catch {}
        }
        slackMsg = `❌ *Subscription Cancelled*\n*Customer:* ${sub.customer}\n*Plan:* ${sub.items?.data?.[0]?.price?.id || "unknown"}\n*Ended:* ${new Date(sub.ended_at * 1000).toISOString().slice(0,10)}`;
      } else if (event.type === "invoice.payment_failed") {
        const inv = event.data.object;
        const email = inv.customer_email || inv.customer || "unknown";
        const amount = inv.amount_due ? `$${(inv.amount_due / 100).toFixed(2)}` : "";
        slackMsg = `⚠️ *Payment Failed*\n*Email:* ${email}\n*Amount:* ${amount}\n*Attempt:* ${inv.attempt_count}`;
      }

      if (slackMsg && env.SLACK_WEBHOOK_URL) {
        await fetch(env.SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: slackMsg }),
        }).catch(() => {});
      }

      return new Response("OK", { status: 200 });
    }

    // POST / — infrastructure alert handler (no origin check — external monitoring tools send alerts)
    if (request.method === "POST" && (url.pathname === "/" || url.pathname === "/alert")) {
      let alert;
      try {
        alert = await request.json();
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }

      // Filter junk: empty payloads and GraphQL scanner probes
      const keys = Object.keys(alert);
      if (keys.length === 0) return new Response("OK", { status: 200 });
      if (alert.query && typeof alert.query === "string" && alert.query.includes("__schema")) {
        return new Response("OK", { status: 200 });
      }

      const alertText = alert.message || alert.text || alert.description || JSON.stringify(alert);

      // Claude diagnosis
      let diagnosis = "No diagnosis available.";
      if (env.ANTHROPIC_API_KEY) {
        try {
          const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": env.ANTHROPIC_API_KEY,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-sonnet-4-20250514",
              max_tokens: 1000,
              messages: [{
                role: "user",
                content: `You are Agent9, an elite infrastructure remediation AI. Analyze this alert, diagnose the root cause, and provide a clear fix.

Alert:
${alertText}

Respond in this format:
SEVERITY: [LOW / MEDIUM / CRITICAL]
DIAGNOSIS: (what is wrong and why)
RECOMMENDED FIX: (exact steps to resolve)`,
              }],
            }),
          });
          const claudeData = await claudeRes.json();
          diagnosis = claudeData.content?.[0]?.text || diagnosis;
        } catch {}
      }

      // Post to Slack
      if (env.SLACK_WEBHOOK_URL) {
        await fetch(env.SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `🚨 *Agent9 Alert*\n\n*Alert:*\n${alertText}\n\n*Diagnosis:*\n${diagnosis}`,
          }),
        }).catch(() => {});
      }

      return new Response("OK", { status: 200 });
    }

    return env.ASSETS.fetch(request);
  }
};
