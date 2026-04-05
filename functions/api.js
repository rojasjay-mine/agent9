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

const PRICES = {
  "starter-monthly": "price_1TIJEiGVEPbuDOhcpbg0sLcH",
  "starter-annual":  "price_1TIx1lGVEPbuDOhcbDPb0lj9",
  "pro-monthly":     "price_1TIx1lGVEPbuDOhcFhdIyEQO",
  "pro-annual":      "price_1TIx1mGVEPbuDOhc9cjxLnec",
};

async function verifyStripeSignature(body, sigHeader, secret) {
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
  const raw = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${body}`));
  const computed = Array.from(new Uint8Array(raw)).map(b => b.toString(16).padStart(2, "0")).join("");
  return computed === sig;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/agents" || url.pathname === "/agents/") {
      return new Response(AGENTS_HTML, {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
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
        success_url: "https://fixitagent.ai/?subscribed=true",
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
        if (!valid) return new Response("Invalid signature", { status: 400 });
      }

      let event;
      try { event = JSON.parse(rawBody); } catch { return new Response("Invalid JSON", { status: 400 }); }

      let slackMsg = null;

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const email = session.customer_details?.email || "unknown";
        const amount = session.amount_subtotal ? `$${(session.amount_subtotal / 100).toFixed(0)}` : "";
        slackMsg = `🎉 *New Agent9 Subscriber!*\n*Email:* ${email}\n*Amount:* ${amount}/mo\n*Trial:* 14 days free`;
      } else if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object;
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

    return env.ASSETS.fetch(request);
  }
};
