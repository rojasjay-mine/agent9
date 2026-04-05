const LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>fixitagent.ai — 10 AI Specialists, One Price</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #070709; color: #e0e0e0; font-family: 'Courier New', monospace; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
  .logo { font-size: 11px; color: #444; letter-spacing: 4px; margin-bottom: 48px; }
  .headline { font-size: clamp(22px, 4vw, 36px); color: #e0e0e0; letter-spacing: 2px; text-align: center; line-height: 1.4; max-width: 600px; margin-bottom: 16px; }
  .sub { font-size: 13px; color: #444; letter-spacing: 1px; text-align: center; max-width: 480px; line-height: 1.8; margin-bottom: 48px; }
  .agents { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: 560px; margin-bottom: 48px; }
  .agent-tag { font-size: 9px; letter-spacing: 1px; padding: 4px 10px; border: 1px solid #1a1a1a; border-radius: 3px; color: #333; }
  .price-block { text-align: center; margin-bottom: 32px; }
  .trial { font-size: 11px; color: #0070f3; letter-spacing: 2px; margin-bottom: 8px; }
  .price { font-size: 28px; color: #e0e0e0; letter-spacing: 2px; }
  .price span { font-size: 12px; color: #444; }
  .cta { background: #0070f3; border: none; border-radius: 4px; padding: 14px 36px; color: #fff; font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: 2px; cursor: pointer; text-decoration: none; display: inline-block; transition: opacity 0.2s; }
  .cta:hover { opacity: 0.85; }
  .note { font-size: 9px; color: #2a2a2a; letter-spacing: 1px; margin-top: 16px; text-align: center; }
  .divider { width: 1px; height: 40px; background: #111; margin: 0 auto 48px; }
</style>
</head>
<body>
  <div class="logo">FX / FIXITAGENT.AI</div>
  <h1 class="headline">10 specialized AI teammates.<br/>Pre-loaded with your stack.</h1>
  <p class="sub">No re-explaining Cloudflare Pages syntax. No billing surprises. No setup. Just open a tab and talk to the expert you need.</p>
  <div class="agents">
    <span class="agent-tag">🩺 WEBHOOK DOCTOR</span>
    <span class="agent-tag">☁️ CLOUDFLARE COPILOT</span>
    <span class="agent-tag">🔬 CODE SURGEON</span>
    <span class="agent-tag">💬 SLACK WRANGLER</span>
    <span class="agent-tag">🚀 DEPLOY COMMANDER</span>
    <span class="agent-tag">🔍 ERROR ANALYST</span>
    <span class="agent-tag">🎵 TIKTOK BRAIN</span>
    <span class="agent-tag">✍️ SUBSTACK GHOST</span>
    <span class="agent-tag">🔐 ENV GUARDIAN</span>
    <span class="agent-tag">🧠 FX STRATEGIST</span>
  </div>
  <div class="divider"></div>
  <div class="price-block">
    <div class="trial">▸ 1 MONTH FREE — NO CARD REQUIRED UNTIL TRIAL ENDS</div>
    <div class="price">$79.99 <span>/ month after trial</span></div>
  </div>
  <form action="/checkout" method="POST">
    <button type="submit" class="cta">START FREE TRIAL</button>
  </form>
  <p class="note">Cancel anytime. No credits. No usage billing. Flat rate.</p>
</body>
</html>`;

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
  body { background: #070709; color: #e0e0e0; font-family: 'Courier New', monospace; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #070709; }
  ::-webkit-scrollbar-thumb { background: #1a1a2e; border-radius: 2px; }
  input::placeholder { color: #2a2a2a; }
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

  // Fetch memory from server on mount and merge with localStorage
  useEffect(() => {
    fetch("/memory")
      .then(r => r.ok ? r.json() : null)
      .then(serverData => {
        if (serverData && Object.keys(serverData).length > 0) {
          setMessages(prev => {
            const merged = { ...serverData, ...prev };
            saveHistory(merged);
            return merged;
          });
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
    header: { padding: "14px 20px", borderBottom: "1px solid #111", display: "flex", alignItems: "center", gap: "10px" },
    tabs: { display: "flex", overflowX: "auto", gap: "5px", padding: "10px 14px", borderBottom: "1px solid #0f0f0f", scrollbarWidth: "none" },
    role: { padding: "6px 16px", fontSize: "10px", color: "#2a2a2a", borderBottom: "1px solid #0a0a0a", letterSpacing: "1px" },
    msgs: { flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "300px", maxHeight: "calc(100vh - 200px)" },
    inputRow: { padding: "12px 16px", borderTop: "1px solid #0f0f0f", display: "flex", gap: "8px" },
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={S.header}>
        <span style={{ fontSize: "11px", color: "#444", letterSpacing: "3px" }}>FX</span>
        <span style={{ color: "#222" }}>|</span>
        <span style={{ fontSize: "11px", color: activeAgent.color, letterSpacing: "2px" }}>{activeAgent.icon} {activeAgent.name.toUpperCase()}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          {memoryStatus && <span style={{ fontSize: "9px", color: "#1a3a1a", letterSpacing: "1px" }}>MEM:{memoryStatus}</span>}
          <span style={{ fontSize: "9px", color: "#1f3a1f", letterSpacing: "1px" }}>SAVED</span>
          <button onClick={() => updateMessages(activeAgent.id, [])} style={{ background: "transparent", border: "1px solid #1a1a1a", borderRadius: "3px", padding: "3px 8px", color: "#333", fontSize: "9px", cursor: "pointer", fontFamily: "inherit" }}>CLEAR</button>
        </div>
      </div>
      <div style={S.tabs}>
        {AGENTS.map(a => {
          const hasHistory = (messages[a.id] || []).length > 0;
          const isActive = activeAgent.id === a.id;
          return (
            <button key={a.id} onClick={() => setActiveAgent(a)} style={{ flexShrink: 0, background: isActive ? "#0d0d1a" : "transparent", border: "1px solid " + (isActive ? a.color : hasHistory ? "#252525" : "#111"), borderRadius: "4px", padding: "5px 11px", cursor: "pointer", color: isActive ? a.color : hasHistory ? "#555" : "#222", fontSize: "10px", letterSpacing: "1px", whiteSpace: "nowrap", fontFamily: "inherit", position: "relative" }}>
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
            <div style={{ maxWidth: "84%", background: m.role === "user" ? "#0c0c1a" : "#080808", border: "1px solid " + (m.role === "user" ? activeAgent.color + "30" : "#111"), borderRadius: "5px", padding: "10px 14px", fontSize: "12px", lineHeight: "1.65", color: m.role === "user" ? "#bbb" : "#999", whiteSpace: "pre-wrap" }}>
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
          style={{ flex: 1, background: "#080808", border: "1px solid #1a1a1a", borderRadius: "4px", padding: "10px 14px", color: "#ccc", fontSize: "12px", outline: "none", fontFamily: "inherit" }} />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ background: loading ? "#080808" : activeAgent.color + "15", border: "1px solid " + (loading ? "#111" : activeAgent.color + "77"), borderRadius: "4px", padding: "10px 16px", color: loading ? "#222" : activeAgent.color, cursor: loading ? "not-allowed" : "pointer", fontSize: "11px", letterSpacing: "1px", fontFamily: "inherit" }}>
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

const MEMORY_KEY = "fx-agents-memory";

// Verify Stripe webhook signature using Web Crypto API
async function verifyStripeSignature(payload, sigHeader, secret) {
  const parts = sigHeader.split(",").reduce((acc, p) => {
    const [k, v] = p.split("=");
    acc[k] = v;
    return acc;
  }, {});
  if (!parts.t || !parts.v1) return false;
  const signed = `${parts.t}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
  const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  if (computed.length !== parts.v1.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ parts.v1.charCodeAt(i);
  return diff === 0;
}

// Generate a random access token
function genToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Parse cookie header
function getCookie(req, name) {
  const header = req.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // GET / — landing page
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(LANDING_HTML, {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // POST /checkout — create Stripe Checkout Session
    if (url.pathname === "/checkout" && request.method === "POST") {
      const origin = `https://${url.hostname}`;
      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          "mode": "subscription",
          "line_items[0][price]": env.STRIPE_PRICE_ID,
          "line_items[0][quantity]": "1",
          "subscription_data[trial_period_days]": "30",
          "success_url": `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          "cancel_url": `${origin}/`,
          "payment_method_collection": "if_required"
        })
      });
      const session = await res.json();
      if (!session.url) return new Response("Stripe error", { status: 500 });
      return Response.redirect(session.url, 303);
    }

    // GET /success — after Stripe payment, issue access token
    if (url.pathname === "/success") {
      const sessionId = url.searchParams.get("session_id");
      if (!sessionId) return Response.redirect("/", 303);

      const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=subscription&expand[]=customer`, {
        headers: { "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}` }
      });
      const session = await res.json();
      if (session.payment_status !== "paid" && session.subscription?.status !== "trialing") {
        return Response.redirect("/", 303);
      }

      const token = genToken();
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      const email = session.customer_details?.email || session.customer?.email || "";
      const status = session.subscription?.status || "trialing";

      await env.MEMORY.put(`token:${token}`, JSON.stringify({ customerId, subscriptionId, email, status }));
      await env.MEMORY.put(`customer:${customerId}`, token);

      return new Response(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>body{background:#070709;color:#e0e0e0;font-family:'Courier New',monospace;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:16px}</style></head><body><div style="font-size:11px;color:#0070f3;letter-spacing:3px">ACCESS GRANTED</div><div style="font-size:10px;color:#333;letter-spacing:1px">${email}</div><a href="/agents" style="margin-top:24px;background:#0070f3;border:none;border-radius:4px;padding:12px 32px;color:#fff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-decoration:none">ENTER AGENT9</a></body></html>`, {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Set-Cookie": `fx_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`
        }
      });
    }

    // GET /portal — Stripe customer portal for managing subscription
    if (url.pathname === "/portal") {
      const token = getCookie(request, "fx_token");
      if (!token) return Response.redirect("/", 303);
      const record = await env.MEMORY.get(`token:${token}`);
      if (!record) return Response.redirect("/", 303);
      const { customerId } = JSON.parse(record);
      const origin = `https://${url.hostname}`;
      const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ customer: customerId, return_url: `${origin}/agents` })
      });
      const portal = await res.json();
      if (!portal.url) return new Response("Portal error", { status: 500 });
      return Response.redirect(portal.url, 303);
    }

    // POST /stripe-webhook — handle subscription lifecycle events
    if (url.pathname === "/stripe-webhook" && request.method === "POST") {
      const payload = await request.text();
      const sig = request.headers.get("stripe-signature") || "";
      const valid = await verifyStripeSignature(payload, sig, env.STRIPE_WEBHOOK_SECRET);
      if (!valid) return new Response("Invalid signature", { status: 400 });

      const event = JSON.parse(payload);
      const sub = event.data?.object;

      if (["customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
        const customerId = sub.customer;
        const token = await env.MEMORY.get(`customer:${customerId}`);
        if (token) {
          const record = await env.MEMORY.get(`token:${token}`);
          if (record) {
            const data = JSON.parse(record);
            data.status = sub.status;
            await env.MEMORY.put(`token:${token}`, JSON.stringify(data));
          }
        }
      }
      return new Response("OK", { status: 200 });
    }

    // GET /agents — check subscription before serving UI
    if (url.pathname === "/agents" || url.pathname === "/agents/") {
      const token = getCookie(request, "fx_token");
      if (token) {
        const record = await env.MEMORY.get(`token:${token}`);
        if (record) {
          const { status } = JSON.parse(record);
          if (["active", "trialing"].includes(status)) {
            return new Response(AGENTS_HTML, {
              headers: { "Content-Type": "text/html;charset=UTF-8" }
            });
          }
        }
      }
      return Response.redirect("/", 303);
    }

    // GET /memory — fetch stored conversation history from KV
    if (url.pathname === "/memory" && request.method === "GET") {
      if (!env.MEMORY) {
        return new Response(JSON.stringify({}), {
          headers: { "Content-Type": "application/json" }
        });
      }
      const stored = await env.MEMORY.get(MEMORY_KEY);
      return new Response(stored || "{}", {
        headers: { "Content-Type": "application/json" }
      });
    }

    // POST /memory — save conversation history to KV
    if (url.pathname === "/memory" && request.method === "POST") {
      if (!env.MEMORY) {
        return new Response("KV not configured", { status: 503 });
      }
      let body;
      try {
        body = await request.text();
        JSON.parse(body); // validate JSON
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }
      await env.MEMORY.put(MEMORY_KEY, body);
      return new Response("OK", { status: 200 });
    }

    // POST /api — proxy to Claude API
    if (url.pathname === "/api" || url.pathname === "/api/") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
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

    return env.ASSETS.fetch(request);
  }
};
