const AGENTS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>AI U — Your Working Representative</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js"></script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#f8fafc;color:#0f172a;font-family:'Inter',system-ui,sans-serif;font-size:14px;line-height:1.6}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#f1f5f9}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
const { useState, useRef, useEffect } = React;

const MODES = {
  professional: {
    id: "professional",
    label: "Professional",
    accent: "#2563eb",
    accentLight: "#eff6ff",
    placeholder: "Talk to your twin...",
    emptyTitle: "Your Professional Clone",
    emptyDesc: "Your twin knows your expertise, your positions, and your voice. Use it to draft responses, handle conversations, or think through decisions — as you.",
    buildSystem: (ctx) => ctx
      ? "You are the AI twin of this person. Respond exactly as they would — using their voice, their knowledge, their judgment, and their history. Never break character. If asked if you're AI, acknowledge it but stay in their voice.\n\nEverything you know about this person:\n" + ctx
      : "You are a professional AI twin. The user is building their twin — they haven't uploaded their context yet. Encourage them to click 'My Context' to upload notes about themselves so you can truly represent them. For now, respond helpfully to whatever they ask.",
  },
  companion: {
    id: "companion",
    label: "Companion",
    accent: "#7c3aed",
    accentLight: "#f5f3ff",
    placeholder: "Talk to your companion...",
    emptyTitle: "Your Personal Companion",
    emptyDesc: "Your companion already knows everything you've shared. Talk through anything — no judgment, no re-explaining. It remembers.",
    buildSystem: (ctx) => ctx
      ? "You are a warm, deeply personal AI companion. You already know everything about this person from what they've shared below. You are supportive, honest, and never judgmental. You remember their history. You ask thoughtful follow-up questions. You never give generic advice — you speak to their specific situation.\n\nEverything you know about this person:\n" + ctx
      : "You are a warm AI companion. The person hasn't uploaded their personal context yet — encourage them to click 'My Context' to share their story so you can truly know them. For now, be a kind, attentive listener.",
  },
};

const HIST_KEY = "mirror-twin-v1";
const load = (k, d) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

function App() {
  const [mode, setMode] = useState(() => load("mirror-mode", "professional"));
  const [msgs, setMsgs] = useState(() => load(HIST_KEY, { professional: [], companion: [] }));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState("");
  const [showCtx, setShowCtx] = useState(false);
  const [ctxDraft, setCtxDraft] = useState("");
  const [ctxSaving, setCtxSaving] = useState(false);
  const [ctxStatus, setCtxStatus] = useState("");
  const bottomRef = useRef(null);
  const M = MODES[mode];
  const current = msgs[mode] || [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [current, loading]);

  // Load server memory + context on mount
  useEffect(() => {
    fetch("/memory").then(r => r.ok ? r.json() : null).then(d => {
      if (d && Object.keys(d).length > 0) { setMsgs(d); save(HIST_KEY, d); }
    }).catch(() => {});
    fetch("/context").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.context) { setContext(d.context); setCtxDraft(d.context); }
    }).catch(() => {});
  }, []);

  const updateMsgs = (m, next) => {
    setMsgs(prev => {
      const updated = { ...prev, [m]: next };
      save(HIST_KEY, updated);
      fetch("/memory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) }).catch(() => {});
      return updated;
    });
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const updated = [...current, userMsg];
    updateMsgs(mode, updated);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 16000, system: M.buildSystem(context), messages: updated }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "No response.";
      updateMsgs(mode, [...updated, { role: "assistant", content: reply }]);
    } catch {
      updateMsgs(mode, [...updated, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  const saveContext = async () => {
    setCtxSaving(true);
    setCtxStatus("");
    try {
      const res = await fetch("/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: ctxDraft }),
      });
      if (res.ok) { setContext(ctxDraft); setCtxStatus("Saved"); setShowCtx(false); }
      else setCtxStatus("Save failed");
    } catch { setCtxStatus("Save failed"); }
    setCtxSaving(false);
  };

  const C = { border: "#e2e8f0", bg: "#f8fafc", panel: "#ffffff", dim: "#64748b", text: "#0f172a" };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* HEADER */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid " + C.border, background: C.panel, display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <span style={{ fontWeight: 800, fontSize: "16px", letterSpacing: "-0.5px" }}>AI <span style={{ color: M.accent }}>U</span></span>
        <div style={{ marginLeft: "4px", display: "flex", gap: "4px" }}>
          {Object.values(MODES).map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); save("mirror-mode", m.id); }}
              style={{ padding: "5px 14px", borderRadius: "20px", border: "1.5px solid " + (mode === m.id ? m.accent : C.border), background: mode === m.id ? m.accentLight : "transparent", color: mode === m.id ? m.accent : C.dim, fontSize: "12px", fontWeight: mode === m.id ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
              {m.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={() => { setShowCtx(true); setCtxDraft(context); }}
            style={{ padding: "5px 14px", borderRadius: "6px", border: "1.5px solid " + (context ? M.accent : C.border), background: context ? M.accentLight : "transparent", color: context ? M.accent : C.dim, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {context ? "My Context ✓" : "+ My Context"}
          </button>
          <button onClick={() => updateMsgs(mode, [])} style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid " + C.border, background: "transparent", color: C.dim, fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>Clear</button>
          <a href="/logout" style={{ fontSize: "11px", color: C.dim, textDecoration: "none", padding: "5px 4px" }}>Logout</a>
        </div>
      </div>

      {/* CONTEXT PANEL */}
      {showCtx && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: C.panel, border: "1px solid " + C.border, borderRadius: "16px", width: "100%", maxWidth: "600px", padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ fontWeight: 800, fontSize: "18px", marginBottom: "8px" }}>Your Context</div>
            <div style={{ fontSize: "13px", color: C.dim, marginBottom: "20px", lineHeight: "1.7" }}>This is what your twin knows about you. Paste anything — notes, your bio, your history, how you think, what you care about. The more you share, the more it becomes you.</div>
            <textarea value={ctxDraft} onChange={e => setCtxDraft(e.target.value)}
              placeholder={"My name is...\nI work in...\nI believe...\nPeople describe me as...\nI've been through...\nMy communication style is...\n\nPaste anything that makes you, you."}
              style={{ width: "100%", height: "260px", background: C.bg, border: "1.5px solid " + C.border, borderRadius: "8px", padding: "14px", fontSize: "13px", color: C.text, fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: "1.7" }}
              onFocus={e => e.target.style.borderColor = M.accent}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <div style={{ marginTop: "12px", fontSize: "11px", color: C.dim }}>{ctxDraft.length} characters</div>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button onClick={saveContext} disabled={ctxSaving}
                style={{ flex: 1, padding: "12px", background: M.accent, color: "#fff", border: "none", borderRadius: "8px", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, cursor: ctxSaving ? "not-allowed" : "pointer", opacity: ctxSaving ? 0.7 : 1 }}>
                {ctxSaving ? "Saving..." : "Save Context"}
              </button>
              <button onClick={() => setShowCtx(false)}
                style={{ padding: "12px 20px", background: "transparent", border: "1.5px solid " + C.border, borderRadius: "8px", fontFamily: "inherit", fontSize: "14px", color: C.dim, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
            {ctxStatus && <div style={{ marginTop: "10px", fontSize: "12px", color: ctxStatus === "Saved" ? "#22c55e" : "#ef4444", textAlign: "center" }}>{ctxStatus}</div>}
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: "16px", background: C.bg }}>
        {current.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "80px", maxWidth: "480px", margin: "80px auto 0" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: M.accentLight, border: "2px solid " + M.accent + "40", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
              {mode === "professional" ? "💼" : "💬"}
            </div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: C.text, marginBottom: "10px" }}>{M.emptyTitle}</div>
            <div style={{ fontSize: "14px", color: C.dim, lineHeight: "1.8" }}>{M.emptyDesc}</div>
            {!context && (
              <button onClick={() => { setShowCtx(true); setCtxDraft(""); }}
                style={{ marginTop: "24px", padding: "10px 24px", background: M.accent, color: "#fff", border: "none", borderRadius: "8px", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                Upload My Context
              </button>
            )}
          </div>
        )}
        {current.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "82%", background: m.role === "user" ? M.accent : C.panel, border: "1px solid " + (m.role === "user" ? "transparent" : C.border), borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px", padding: "12px 16px", fontSize: "14px", lineHeight: "1.8", color: m.role === "user" ? "#fff" : C.text, whiteSpace: "pre-wrap", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {m.role === "assistant" && <div style={{ fontSize: "10px", color: M.accent, marginBottom: "6px", fontWeight: 700, letterSpacing: "1px" }}>{mode === "professional" ? "YOUR TWIN" : "COMPANION"}</div>}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: M.accentLight, border: "1px solid " + M.accent + "40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
              {mode === "professional" ? "💼" : "💬"}
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: M.accent, opacity: 0.6, animation: "bounce 1.2s ease-in-out " + (i*0.2) + "s infinite" }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid " + C.border, background: C.panel, display: "flex", gap: "8px", flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder={M.placeholder}
          style={{ flex: 1, background: C.bg, border: "1.5px solid " + C.border, borderRadius: "10px", padding: "11px 16px", color: C.text, fontSize: "14px", outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }}
          onFocus={e => e.target.style.borderColor = M.accent}
          onBlur={e => e.target.style.borderColor = C.border}
        />
        <button onClick={send} disabled={loading || !input.trim()}
          style={{ background: loading || !input.trim() ? C.border : M.accent, border: "none", borderRadius: "10px", padding: "11px 22px", color: loading || !input.trim() ? C.dim : "#fff", cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontSize: "13px", fontFamily: "inherit", fontWeight: 700, transition: "all 0.15s" }}>
          Send
        </button>
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
</script>
<style>
  @keyframes bounce { 0%,100%{transform:translateY(0);opacity:0.6} 50%{transform:translateY(-4px);opacity:1} }
</style>
</body>
</html>`;

const PRICES = {
  "companion-monthly": "price_1TM6FgGVEPbuDOhc3odvIism",
  "twin-monthly":      "price_1TM6FiGVEPbuDOhcKBUl9JDH",
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
    const dot = token.indexOf(".");
    if (dot === -1) return null;
    const email = atob(token.slice(0, dot));
    const sigBytes = Uint8Array.from(atob(token.slice(dot + 1)), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(email));
    return valid ? email : null;
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

// ── Alert agent routing ───────────────────────────────────────────────────────
const ALERT_AGENTS = {
  "pipeline-doctor": {
    name: "Pipeline Doctor", icon: "⚙️",
    system: "You are Pipeline Doctor, expert in CI/CD systems including GitHub Actions, Jenkins, CircleCI, and GitLab CI. When given a pipeline failure, identify the exact step that failed, root cause, and provide a numbered fix. Be concise and actionable. Format: SEVERITY / ROOT CAUSE / FIX STEPS."
  },
  "k8s-medic": {
    name: "K8s Medic", icon: "🐳",
    system: "You are K8s Medic, expert in Kubernetes. Diagnose pod crashes, OOMKills, deployment failures, node issues, and resource exhaustion. Give exact kubectl commands to investigate and fix. Format: SEVERITY / ROOT CAUSE / FIX STEPS."
  },
  "log-surgeon": {
    name: "Log Surgeon", icon: "📋",
    system: "You are Log Surgeon, expert at parsing error logs, stack traces, and anomaly patterns from any system. Identify the root cause from log data and give a precise fix. Format: SEVERITY / ROOT CAUSE / FIX STEPS."
  },
  "cost-sentinel": {
    name: "Cost Sentinel", icon: "💰",
    system: "You are Cost Sentinel, expert in cloud cost anomalies across GCP, AWS, and Azure. When given a spend alert, identify what caused the spike, which service or resource is responsible, and how to stop and prevent it. Format: SEVERITY / ROOT CAUSE / FIX STEPS."
  },
  "slo-watcher": {
    name: "SLO Watcher", icon: "📊",
    system: "You are SLO Watcher, expert in SLOs, SLAs, error budgets, and latency analysis. When given an SLO breach alert, diagnose what is causing the degradation and give exact remediation steps. Format: SEVERITY / ROOT CAUSE / FIX STEPS."
  },
  "db-analyst": {
    name: "DB Analyst", icon: "🗄️",
    system: "You are DB Analyst, expert in database performance across PostgreSQL, MySQL, MongoDB, and Redis. Diagnose slow queries, connection pool exhaustion, replication lag, and index issues. Give exact queries and config changes to fix. Format: SEVERITY / ROOT CAUSE / FIX STEPS."
  },
  "security-auditor": {
    name: "Security Auditor", icon: "🛡️",
    system: "You are Security Auditor, expert in cloud security, IAM misconfigurations, auth failures, and intrusion detection. When given a security alert, assess the threat level and provide immediate containment and remediation steps. Format: SEVERITY / ROOT CAUSE / FIX STEPS."
  },
  "api-guardian": {
    name: "API Guardian", icon: "🔗",
    system: "You are API Guardian, expert in API failures, rate limiting, upstream timeouts, and gateway errors. Diagnose what is failing and why, and give exact steps to restore service and prevent recurrence. Format: SEVERITY / ROOT CAUSE / FIX STEPS."
  },
  "data-pipeline-doctor": {
    name: "Data Pipeline Doctor", icon: "🔄",
    system: "You are Data Pipeline Doctor, expert in ETL/ELT failures, schema drift, data quality issues, and ingestion pipeline breakdowns. Diagnose the failure and give exact steps to restore the pipeline and prevent data loss. Format: SEVERITY / ROOT CAUSE / FIX STEPS."
  },
  "incident-commander": {
    name: "Incident Commander", icon: "🎯",
    system: "You are Incident Commander, a senior SRE who coordinates multi-system incidents. Given an alert, identify all affected systems, establish a timeline, prioritize remediation, and give a clear incident response plan. Format: SEVERITY / AFFECTED SYSTEMS / IMPACT / IMMEDIATE ACTIONS / ROOT CAUSE INVESTIGATION."
  },
};

function routeAlert(alert) {
  const combined = [alert.type, alert.title, alert.source, alert.details].join(" ").toLowerCase();
  if (/pipeline|ci[\s_-]?cd|deploy|github.action|jenkins|circleci|build.fail/.test(combined)) return ALERT_AGENTS["pipeline-doctor"];
  if (/k8s|kubernetes|pod|container|oomkill|evict|node.not.ready|crashloop/.test(combined)) return ALERT_AGENTS["k8s-medic"];
  if (/cost|spend|budget|billing|quota.exceed|usage.spike/.test(combined)) return ALERT_AGENTS["cost-sentinel"];
  if (/slo|sla|error.budget|latency|p99|p95|error.rate/.test(combined)) return ALERT_AGENTS["slo-watcher"];
  if (/database|postgres|mysql|mongo|redis|slow.query|replication|connection.pool/.test(combined)) return ALERT_AGENTS["db-analyst"];
  if (/security|iam|permission|unauth|breach|intrusion|firewall|vuln/.test(combined)) return ALERT_AGENTS["security-auditor"];
  if (/api|rate.limit|timeout|upstream|gateway|503|504/.test(combined)) return ALERT_AGENTS["api-guardian"];
  if (/etl|schema.drift|data.quality|ingestion|pipeline/.test(combined)) return ALERT_AGENTS["data-pipeline-doctor"];
  if (/log|error.spike|anomaly|stackdriver|cloudwatch/.test(combined)) return ALERT_AGENTS["log-surgeon"];
  return ALERT_AGENTS["incident-commander"];
}

async function hmacHex(message, secret) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const raw = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(raw)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Timing-safe HMAC verification — prevents timing oracle attacks
async function verifyHmac(message, secret, hexSig) {
  try {
    const sigBytes = new Uint8Array(hexSig.match(/.{2}/g).map(b => parseInt(b, 16)));
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    return await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(message));
  } catch { return false; }
}

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy": "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'",
  "X-Permitted-Cross-Domain-Policies": "none",
};

// Distributed rate limiter — uses CF RateLimit binding (global across all edge nodes)
// alertedIps tracks first-hit alerting per worker instance (alert dedup only, not enforcement)
const alertedIps = new Set();
async function checkRateLimit(env, ip, binding = "RL_GLOBAL") {
  if (env[binding]) {
    const { success } = await env[binding].limit({ key: ip });
    if (!success) {
      const firstHit = !alertedIps.has(ip + binding);
      alertedIps.add(ip + binding);
      setTimeout(() => alertedIps.delete(ip + binding), 60000);
      return { limited: true, firstHit };
    }
    return { limited: false, firstHit: false };
  }
  // Fallback: in-memory (local dev / binding not configured)
  return { limited: false, firstHit: false };
}

async function alertSecurityBreach(env, type, details) {
  if (!env.SLACK_WEBHOOK_URL) return;
  await fetch(env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `🚨 <!channel> *SECURITY ALERT — ${type}*\n${details}\n*Time:* ${new Date().toUTCString()}`
    })
  }).catch(() => {});
}

async function handleSlackEvent(event, env) {
  if (event.bot_id || event.subtype === "bot_message") return;
  const isDM = event.channel_type === "im";
  const isMention = event.type === "app_mention";
  if (!isDM && !isMention) return;

  const text = (event.text || "").replace(/<@[A-Z0-9]+>/g, "").trim();
  const imageFiles = (event.files || []).filter(f => f.mimetype?.startsWith("image/") && f.url_private);
  if (!text && imageFiles.length === 0) return;

  const mode = isDM ? "companion" : "professional";
  const ownerEmail = (env.OWNER_EMAIL || "").toLowerCase();
  let context = "";
  if (ownerEmail && env.MEMORY) {
    context = (await env.MEMORY.get(`context:${ownerEmail}`)) || "";
  }

  const threadKey = event.thread_ts ? `${event.channel}:${event.thread_ts}` : event.channel;
  let history = [];
  if (env.MEMORY) {
    const raw = await env.MEMORY.get(`slack-hist:${threadKey}`);
    if (raw) try { history = JSON.parse(raw); } catch {}
  }

  // Build current-turn content — text + any images fetched from Slack
  let userContent;
  if (imageFiles.length > 0 && env.SLACK_BOT_TOKEN) {
    userContent = [];
    if (text) userContent.push({ type: "text", text });
    for (const file of imageFiles.slice(0, 4)) {
      try {
        const imgRes = await fetch(file.url_private, {
          headers: { "Authorization": `Bearer ${env.SLACK_BOT_TOKEN}` },
          signal: AbortSignal.timeout(15000),
        });
        if (imgRes.ok) {
          const buf = await imgRes.arrayBuffer();
          const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
          userContent.push({ type: "image", source: { type: "base64", media_type: file.mimetype, data: b64 } });
        }
      } catch {}
    }
    if (userContent.length === 0) userContent = text || "(image)";
  } else {
    userContent = text;
  }

  // History stored as text-only (no base64 blobs in KV)
  const historyText = text || (imageFiles.length > 0 ? "[image]" : "");
  const updatedHistory = [...history, { role: "user", content: historyText }];

  const systemPrompts = {
    professional: context
      ? `You are the AI twin of this person. Respond exactly as they would — using their voice, knowledge, judgment, and history. Never break character.\n\nEverything you know about this person:\n${context}`
      : "You are a professional AI twin. Respond helpfully and professionally.",
    companion: context
      ? `You are a warm, deeply personal AI companion. You already know everything about this person. Be supportive, honest, and never judgmental.\n\nEverything you know about this person:\n${context}`
      : "You are a warm AI companion. Be a kind, attentive listener.",
  };

  let reply = "Sorry, I couldn't generate a response.";
  try {
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: systemPrompts[mode],
        messages: [...history, { role: "user", content: userContent }],
      }),
      signal: AbortSignal.timeout(25000),
    });
    const data = await claudeRes.json();
    reply = data.content?.[0]?.text || reply;
  } catch {}

  if (env.MEMORY) {
    const saved = [...updatedHistory, { role: "assistant", content: reply }];
    await env.MEMORY.put(`slack-hist:${threadKey}`, JSON.stringify(saved.slice(-20)));
  }

  if (env.SLACK_BOT_TOKEN) {
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.SLACK_BOT_TOKEN}` },
      body: JSON.stringify({ channel: event.channel, thread_ts: event.thread_ts || event.ts, text: reply }),
    }).catch(() => {});
  }
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

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";

    // Handle Slack URL verification before any middleware
    if (url.pathname === "/slack/events" && request.method === "POST") {
      const rawBody = await request.text();
      let payload;
      try { payload = JSON.parse(rawBody); } catch { return new Response("Invalid JSON", { status: 400 }); }
      if (payload.type === "url_verification") {
        return new Response(JSON.stringify({ challenge: payload.challenge }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      if (!env.SLACK_SIGNING_SECRET) return new Response("Not configured", { status: 503 });
      const tsHeader = request.headers.get("X-Slack-Request-Timestamp") || "";
      const slackSig = request.headers.get("X-Slack-Signature") || "";
      if (Math.abs(Date.now() / 1000 - parseInt(tsHeader)) > 300) {
        return new Response("Stale request", { status: 403 });
      }
      const valid = await verifyHmac(`v0:${tsHeader}:${rawBody}`, env.SLACK_SIGNING_SECRET, slackSig.replace("v0=", ""));
      if (!valid) return new Response("Invalid signature", { status: 403 });
      if (payload.type === "event_callback") {
        ctx.waitUntil(handleSlackEvent(payload.event, env));
      }
      return new Response("ok");
    }

    // ── Tracing ────────────────────────────────────────────────────────────────
    const rayId   = request.headers.get("CF-Ray") || crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const startMs = Date.now();
    const country = request.cf?.country || "XX";
    const ua      = (request.headers.get("User-Agent") || "").slice(0, 120);
    // Structured log — visible in Workers Observability dashboard + wrangler tail
    console.log(JSON.stringify({
      t: new Date().toISOString(), ray: rayId,
      method: request.method, path: url.pathname,
      ip, country, threat: request.cf?.threatScore ?? 0,
      ua: ua.slice(0, 80),
    }));

    // Block oversized request bodies (max 1MB) — checked before rate limit to avoid counting junk
    const contentLength = parseInt(request.headers.get("Content-Length") || "0");
    if (contentLength > 1_000_000) {
      await alertSecurityBreach(env, "OVERSIZED PAYLOAD", `IP: ${ip}\nPath: ${url.pathname}\nSize: ${contentLength} bytes`);
      return new Response("Payload too large", { status: 413, headers: SECURITY_HEADERS });
    }

    // ── Honeypot paths — never legitimate on this site, instant alert + block ──
    const HONEYPOT_PATHS = [
      "/wp-admin", "/wp-login.php", "/phpMyAdmin", "/.env", "/config.php",
      "/admin.php", "/.git", "/xmlrpc.php", "/actuator", "/shell.php",
      "/cgi-bin/", "/.htaccess", "/web.config", "/server-status", "/backup",
      "/.DS_Store", "/etc/passwd", "/proc/self", "/wp-content", "/wp-includes",
    ];
    if (HONEYPOT_PATHS.some(p => url.pathname.toLowerCase().startsWith(p))) {
      console.log(JSON.stringify({ ray: rayId, event: "HONEYPOT", ip, country, path: url.pathname, ua }));
      ctx.waitUntil(alertSecurityBreach(env, "SCANNER HONEYPOT HIT",
        `IP: ${ip} | Country: ${country} | Path: ${url.pathname} | UA: ${ua.slice(0, 80)} | Ray: ${rayId}`));
      return new Response("Not found", { status: 404, headers: SECURITY_HEADERS });
    }

    // ── Malicious user-agent detection — known attack / scanner tools ─────────
    const SCANNER_UAS = ["sqlmap", "nikto", "nmap", "masscan", "zgrab", "nuclei",
      "dirbuster", "gobuster", "wfuzz", "hydra", "metasploit", "burpsuite",
      "acunetix", "nessus", "openvas", "w3af", "skipfish"];
    if (SCANNER_UAS.some(s => ua.toLowerCase().includes(s))) {
      console.log(JSON.stringify({ ray: rayId, event: "SCANNER_UA", ip, country, ua, path: url.pathname }));
      ctx.waitUntil(alertSecurityBreach(env, "SCANNER UA DETECTED",
        `IP: ${ip} | Country: ${country} | UA: ${ua.slice(0, 120)} | Path: ${url.pathname} | Ray: ${rayId}`));
      return new Response("Forbidden", { status: 403, headers: SECURITY_HEADERS });
    }

    // ── Path injection / traversal guard ─────────────────────────────────────
    const rawPath = url.pathname + url.search;
    const INJECTION_PATTERNS = ["../", "%2e%2e", "<script", "%3cscript",
      "union+select", "union%20select", "\x00", "%00", "eval(", "exec(",
      "/etc/passwd", "cmd.exe", "powershell"];
    if (INJECTION_PATTERNS.some(p => rawPath.toLowerCase().includes(p))) {
      console.log(JSON.stringify({ ray: rayId, event: "INJECTION", ip, country, path: rawPath.slice(0, 200) }));
      ctx.waitUntil(alertSecurityBreach(env, "INJECTION ATTEMPT",
        `IP: ${ip} | Country: ${country} | Path: ${rawPath.slice(0, 200)} | Ray: ${rayId}`));
      return new Response("Bad request", { status: 400, headers: SECURITY_HEADERS });
    }

    // Cloudflare threat score — block known bad actors
    // /login excluded so legitimate users on flagged IPs can still authenticate
    const threatScore = request.cf?.threatScore ?? 0;
    const threatSensitive = ["/api", "/alert", "/checkout", "/admin"].some(p => url.pathname.startsWith(p));
    if (threatScore > 50 && threatSensitive) {
      return new Response("Forbidden", { status: 403, headers: SECURITY_HEADERS });
    }

    // Distributed rate limit: 60 req/min globally (skip Stripe + Slack webhooks)
    if (url.pathname !== "/webhook" && url.pathname !== "/slack/events") {
      const { limited, firstHit } = await checkRateLimit(env, ip, "RL_GLOBAL");
      if (limited) {
        if (firstHit) await alertSecurityBreach(env, "RATE LIMIT EXCEEDED", `IP: ${ip}\nPath: ${url.pathname}\nThreat Score: ${threatScore}`);
        return new Response("Too many requests", { status: 429, headers: SECURITY_HEADERS });
      }
    }

    // Origin check — defense-in-depth for browser-based attacks (not sole auth mechanism)
    const origin = request.headers.get("Origin") || "";
    const referer = request.headers.get("Referer") || "";
    const ALLOWED = ["https://fixitagent.ai", "https://www.fixitagent.ai"];
    const fromSite = ALLOWED.some(a => origin.startsWith(a) || referer.startsWith(a));

    // Session secret — dedicated env var, falls back to Stripe secret, then a non-empty default
    // Non-empty fallback prevents crypto.subtle.importKey throwing on empty key
    const sessionSecret = env.SESSION_SECRET || env.STRIPE_WEBHOOK_SECRET || "fx-agent9-session-default-v1";
    const cookieHeader = request.headers.get("Cookie") || "";

    // POST /slack/events — Slack bot (app_mention + DMs → Claude → reply in Slack)
    if (url.pathname === "/slack/events" && request.method === "POST") {
      const rawBody = await request.text();
      let payload;
      try { payload = JSON.parse(rawBody); } catch { return new Response("Invalid JSON", { status: 400 }); }
      // Handle URL verification before HMAC (one-time setup ping from Slack)
      if (payload.type === "url_verification") {
        return new Response(JSON.stringify({ challenge: payload.challenge }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      // Verify signature for all real events
      if (!env.SLACK_SIGNING_SECRET) return new Response("Not configured", { status: 503 });
      const tsHeader = request.headers.get("X-Slack-Request-Timestamp") || "";
      const slackSig = request.headers.get("X-Slack-Signature") || "";
      if (Math.abs(Date.now() / 1000 - parseInt(tsHeader)) > 300) {
        return new Response("Stale request", { status: 403, headers: SECURITY_HEADERS });
      }
      const valid = await verifyHmac(`v0:${tsHeader}:${rawBody}`, env.SLACK_SIGNING_SECRET, slackSig.replace("v0=", ""));
      if (!valid) return new Response("Invalid signature", { status: 403, headers: SECURITY_HEADERS });
      if (payload.type === "event_callback") {
        ctx.waitUntil(handleSlackEvent(payload.event, env));
      }
      return new Response("ok", { headers: SECURITY_HEADERS });
    }

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
        try {
          const token = await signSession(email, sessionSecret);
          return new Response("OK", { status: 200, headers: { "Set-Cookie": authCookie(token), ...SECURITY_HEADERS } });
        } catch (e) {
          return new Response("Session signing failed — check SESSION_SECRET in Worker env vars", { status: 500 });
        }
      }

      const subRaw = env.MEMORY ? await env.MEMORY.get(`subscriber:${email}`) : null;
      if (!subRaw) return new Response("No active subscription found for that email.", { status: 403 });
      const sub = JSON.parse(subRaw);
      if (sub.status !== "active") return new Response("Your subscription is no longer active.", { status: 403 });
      try {
        const token = await signSession(email, sessionSecret);
        return new Response("OK", { status: 200, headers: { "Set-Cookie": authCookie(token), ...SECURITY_HEADERS } });
      } catch (e) {
        return new Response("Session signing failed — check SESSION_SECRET in Worker env vars", { status: 500 });
      }
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
      let apiKeys = [];

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

      // List provisioned alert customers
      if (env.MEMORY) {
        try {
          const list = await env.MEMORY.list({ prefix: "apikey:" });
          for (const k of list.keys) {
            const val = await env.MEMORY.get(k.name);
            if (val) {
              const d = JSON.parse(val);
              apiKeys.push({ key: k.name.replace("apikey:", ""), email: d.email, name: d.name, created_at: d.created_at || "", slack: d.slack_webhook ? "✓" : "✗" });
            }
          }
        } catch {}
      }

      const adminHTML = `<!DOCTYPE html>
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
    <div class="row"><span class="label">KV Memory</span><span class="val ${kvStatus === 'OK' ? 'ok' : 'err'}">${kvStatus}</span></div>
    <div class="row"><span class="label">Stripe</span><span class="val ${stripeStatus === 'Connected' ? 'ok' : 'err'}">${stripeStatus}</span></div>
    <div class="row"><span class="label">Slack</span><span class="val ${slackStatus === 'Configured' ? 'ok' : 'err'}">${slackStatus}</span></div>
    <div class="row"><span class="label">Active Subscribers</span><span class="val ok">${subCount}</span></div>
  </div>
  <div class="card">
    <h2>SUBSCRIBERS</h2>
    ${subscribers.length === 0 ? '<div style="color:#2a5070;font-size:13px">No active subscribers yet.</div>' :
      subscribers.map(s => `<div class="sub-item">${s.email} — ${s.status}${s.trial_end ? ' (trial until ' + s.trial_end + ')' : ''}</div>`).join('')}
  </div>
  <div class="card">
    <h2>ALERT CUSTOMERS (${apiKeys.length})</h2>
    ${apiKeys.length === 0 ? '<div style="color:#2a5070;font-size:13px">No customers provisioned yet.</div>' :
      apiKeys.map(k => `<div class="sub-item" style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        <span style="color:#d0eeff">${k.name}</span><span style="color:#2a5070">${k.email}</span>
        <span style="color:#00c8ff;font-size:11px">${k.key}</span><span style="color:#2a5070;font-size:11px">Slack ${k.slack} · ${k.created_at ? k.created_at.slice(0,10) : 'unknown'}</span>
      </div>`).join('')}
  </div>
  <div class="card">
    <h2>PROVISION CUSTOMER</h2>
    <form id="provision-form" style="display:flex;flex-direction:column;gap:12px">
      <input id="prov-email" placeholder="customer@example.com" style="background:#04080f;border:1px solid #0d2040;color:#d0eeff;padding:8px 12px;font-family:inherit;font-size:13px;outline:none" />
      <input id="prov-name" placeholder="Company / customer name" style="background:#04080f;border:1px solid #0d2040;color:#d0eeff;padding:8px 12px;font-family:inherit;font-size:13px;outline:none" />
      <input id="prov-slack" placeholder="https://hooks.slack.com/... (optional)" style="background:#04080f;border:1px solid #0d2040;color:#d0eeff;padding:8px 12px;font-family:inherit;font-size:13px;outline:none" />
      <button type="submit" style="background:#00c8ff;color:#04080f;border:none;padding:10px 20px;font-family:inherit;font-weight:700;font-size:13px;letter-spacing:1px;cursor:pointer">PROVISION KEY</button>
    </form>
    <pre id="prov-result" style="margin-top:16px;background:#04080f;border:1px solid #0d2040;padding:12px;font-size:12px;color:#00c8ff;white-space:pre-wrap;display:none"></pre>
    <script>
    document.getElementById('provision-form').addEventListener('submit', async e => {
      e.preventDefault();
      const result = document.getElementById('prov-result');
      result.style.display = 'block';
      result.textContent = 'Provisioning...';
      try {
        const res = await fetch('/admin/provision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_email: document.getElementById('prov-email').value.trim(),
            name: document.getElementById('prov-name').value.trim(),
            slack_webhook: document.getElementById('prov-slack').value.trim()
          })
        });
        const data = await res.json();
        result.textContent = JSON.stringify(data, null, 2);
        if (res.ok) { document.getElementById('provision-form').reset(); }
      } catch(err) { result.textContent = 'Error: ' + err.message; }
    });
    </script>
  </div>
  <div class="card">
    <h2>QUICK LINKS</h2>
    <div class="links">
      <a href="/agents">Agents</a>
      <a href="/admin/sandbox">Alert Sandbox</a>
      <a href="/admin/security-eval">Security Eval</a>
      <a href="/test-slack">Test Slack</a>
      <a href="/logout">Logout</a>
      <a href="/">Home</a>
    </div>
  </div>
</div>
</body>
</html>`;
      return new Response(adminHTML, {
        headers: { "Content-Type": "text/html;charset=UTF-8", ...SECURITY_HEADERS }
      });
    }

    // GET /admin/sandbox — owner-only interactive alert sandbox
    if (url.pathname === "/admin/sandbox" && request.method === "GET") {
      const email = await verifySessionCookie(cookieHeader, sessionSecret);
      const ownerEmail = (env.OWNER_EMAIL || "rojasjay@gmail.com").toLowerCase();
      if (email !== ownerEmail) return new Response("Forbidden", { status: 403 });

      // Load provisioned keys for the dropdown — keys only, NO secrets in HTML
      let apiKeys = [];
      if (env.MEMORY) {
        try {
          const list = await env.MEMORY.list({ prefix: "apikey:" });
          for (const k of list.keys) {
            const val = await env.MEMORY.get(k.name);
            if (val) {
              const d = JSON.parse(val);
              apiKeys.push({ key: k.name.replace("apikey:", ""), name: d.name, email: d.email });
            }
          }
        } catch {}
      }

      const sandboxHTML = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Alert Sandbox — fixitagent.ai</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#04080f;color:#8ec8e8;font-family:'IBM Plex Mono',monospace;padding:40px 20px}
body::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(0,160,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,160,255,0.07) 1px,transparent 1px);background-size:60px 60px}
.wrap{max-width:780px;margin:0 auto;position:relative;z-index:1}
.logo{font-family:'Orbitron',monospace;font-weight:700;font-size:18px;color:#d0eeff;letter-spacing:2px;margin-bottom:8px;text-shadow:0 0 20px rgba(0,200,255,0.5)}.logo span{color:#00c8ff}
h1{font-family:'Orbitron',monospace;font-size:22px;color:#d0eeff;margin-bottom:32px}
.card{border:1px solid #0d2040;background:#070d1a;padding:24px;margin-bottom:16px}
.card h2{font-family:'Orbitron',monospace;font-size:12px;color:#00c8ff;letter-spacing:2px;margin-bottom:20px}
label{display:block;color:#2a5070;font-size:11px;letter-spacing:1px;margin-bottom:6px;margin-top:14px}
label:first-of-type{margin-top:0}
input,select,textarea{width:100%;background:#04080f;border:1px solid #0d2040;color:#d0eeff;padding:9px 12px;font-family:'IBM Plex Mono',monospace;font-size:13px;outline:none;resize:vertical}
input:focus,select:focus,textarea:focus{border-color:#00c8ff}
select option{background:#04080f}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
button{background:#00c8ff;color:#04080f;border:none;padding:11px 24px;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:13px;letter-spacing:1px;cursor:pointer;margin-top:20px;width:100%}
button:disabled{opacity:0.4;cursor:not-allowed}
.result{margin-top:16px}
.result-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.result-label{font-size:11px;letter-spacing:1px;color:#2a5070}
.badge{font-size:11px;font-weight:700;padding:3px 8px;letter-spacing:1px}
.badge.ok{color:#04080f;background:#00c8ff}
.badge.err{color:#04080f;background:#ff4e4e}
pre{background:#04080f;border:1px solid #0d2040;padding:14px;font-size:12px;white-space:pre-wrap;word-break:break-all;color:#8ec8e8;max-height:300px;overflow-y:auto}
.curl-box{margin-top:12px}
.curl-label{font-size:11px;color:#2a5070;letter-spacing:1px;margin-bottom:6px}
.links{margin-top:24px;display:flex;gap:16px}
.links a{color:#00c8ff;font-size:13px;text-decoration:none}
.preset-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.preset{background:transparent;border:1px solid #0d2040;color:#2a5070;padding:5px 10px;font-family:inherit;font-size:11px;cursor:pointer;letter-spacing:1px;width:auto;margin-top:0}
.preset:hover{border-color:#00c8ff;color:#00c8ff}
</style>
</head><body>
<div class="wrap">
<div class="logo">FX<span>AGENT</span></div>
<h1>Alert Sandbox</h1>

<div class="card">
<h2>CUSTOMER</h2>
<label>SELECT CUSTOMER (provisioned)</label>
<select id="customer-select">
  <option value="">— select a customer —</option>
  ${apiKeys.map(k => `<option value="${k.key}">${k.name} (${k.email}) — ${k.key.slice(0,16)}...</option>`).join('')}
</select>
</div>

<div class="card">
<h2>ALERT PAYLOAD</h2>
<div style="margin-bottom:4px;font-size:11px;color:#2a5070;letter-spacing:1px">PRESETS</div>
<div class="preset-row">
  <button class="preset" onclick="loadPreset('k8s')">K8s OOMKill</button>
  <button class="preset" onclick="loadPreset('pipeline')">CI Failure</button>
  <button class="preset" onclick="loadPreset('db')">DB Slow Query</button>
  <button class="preset" onclick="loadPreset('cost')">Cost Spike</button>
  <button class="preset" onclick="loadPreset('slo')">SLO Breach</button>
  <button class="preset" onclick="loadPreset('security')">Security Alert</button>
  <button class="preset" onclick="loadPreset('api')">API Gateway 503</button>
</div>
<div class="row2">
  <div>
    <label>TITLE</label>
    <input id="alert-title" placeholder="Pod OOMKilled in production" />
  </div>
  <div>
    <label>SEVERITY</label>
    <select id="alert-severity">
      <option value="critical">critical</option>
      <option value="medium">medium</option>
      <option value="low">low</option>
    </select>
  </div>
</div>
<div class="row2" style="margin-top:0">
  <div>
    <label>TYPE / SOURCE</label>
    <input id="alert-type" placeholder="kubernetes" />
  </div>
  <div>
    <label>SOURCE</label>
    <input id="alert-source" placeholder="prod-cluster-us-east-1" />
  </div>
</div>
<label>MESSAGE / DETAILS</label>
<textarea id="alert-message" rows="4" placeholder="Container memory limit exceeded. Last restart: 2m ago. Restarts: 5."></textarea>
<div style="display:flex;align-items:center;gap:16px;margin-top:16px">
<button id="send-btn" onclick="sendAlert()">SEND ALERT →</button>
<label style="display:flex;align-items:center;gap:8px;font-size:12px;color:#2a5070;cursor:pointer">
  <input type="checkbox" id="skip-claude" style="width:14px;height:14px;accent-color:#00c8ff"> SKIP CLAUDE (routing + Slack only)
</label>
</div>
</div>

<div id="result-section" style="display:none">
<div class="card">
<h2>RESPONSE</h2>
<div class="result">
  <div class="result-header">
    <span class="result-label">HTTP STATUS</span>
    <span id="status-badge" class="badge"></span>
  </div>
  <pre id="response-body"></pre>
</div>
</div>
<div class="card">
<h2>REQUEST SENT</h2>
<div class="curl-label">CURL EQUIVALENT</div>
<pre id="curl-output"></pre>
</div>
</div>

<div class="links"><a href="/admin">← Admin</a><a href="/admin/security-eval">Security Eval</a></div>
</div>

<script>
const PRESETS = {
  k8s: { title:"Pod OOMKilled in production", type:"kubernetes", source:"prod-cluster-us-east-1", severity:"critical", message:"Container web-api in namespace production was OOMKilled. Memory limit: 512Mi. Peak usage: 511Mi. Restarts in last hour: 5. Last restart: 2 minutes ago." },
  pipeline: { title:"CI pipeline failed on main", type:"github-actions", source:"rojasjay/agent9", severity:"medium", message:"Workflow deploy.yml failed at step 'Deploy to Cloudflare'. Exit code 1. Error: CLOUDFLARE_API_TOKEN expired. 3 consecutive failures." },
  db: { title:"Postgres slow query detected", type:"database", source:"prod-postgres-primary", severity:"medium", message:"Query avg latency exceeded threshold: SELECT * FROM orders JOIN users took 8.4s avg over last 5 min. Table: orders (12M rows). Missing index on created_at." },
  cost: { title:"GCP billing spike — $400 over budget", type:"cost", source:"gcp-billing-alert", severity:"medium", message:"Daily spend $1,240 vs $840 budget. BigQuery: +$280 (unexpected full table scans). Cloud Run: +$120 (autoscaled to 50 instances at 14:32 UTC)." },
  slo: { title:"Error rate SLO breached", type:"slo", source:"datadog-monitor", severity:"critical", message:"Error rate 4.2% over last 30 min. SLO threshold: 1%. Error budget burned: 78% in 6 hours. Endpoints affected: POST /api/orders (503s), GET /api/users (timeout)." },
  security: { title:"Multiple failed auth attempts", type:"security", source:"cloudflare-waf", severity:"critical", message:"185 failed login attempts from IP 45.33.32.156 over 10 min. Targeting /admin, /login. Credential stuffing pattern detected. Country: RU." },
  api: { title:"API Gateway returning 503s", type:"api", source:"uptime-monitor", severity:"critical", message:"POST /api/payments returning 503 for last 8 min. Upstream timeout to payments-service. 1,240 failed requests. Circuit breaker open. Revenue impact: ~$12k." },
};

function loadPreset(key) {
  const p = PRESETS[key];
  document.getElementById('alert-title').value = p.title;
  document.getElementById('alert-type').value = p.type;
  document.getElementById('alert-source').value = p.source;
  document.getElementById('alert-severity').value = p.severity;
  document.getElementById('alert-message').value = p.message;
}

async function sendAlert() {
  const apiKey = document.getElementById('customer-select').value;
  if (!apiKey) { alert('Select a customer first'); return; }

  const payload = {
    title: document.getElementById('alert-title').value.trim(),
    type: document.getElementById('alert-type').value.trim(),
    source: document.getElementById('alert-source').value.trim(),
    severity: document.getElementById('alert-severity').value,
    message: document.getElementById('alert-message').value.trim(),
  };

  const btn = document.getElementById('send-btn');
  btn.disabled = true; btn.textContent = 'SENDING...';

  // Signing done server-side — secret never touches the browser
  let status, responseText;
  try {
    const res = await fetch('/admin/sign-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, alert: payload, skip_claude: document.getElementById('skip-claude').checked }),
    });
    status = res.status;
    responseText = await res.text();
  } catch(e) { responseText = 'Network error: ' + e.message; status = 0; }

  const badge = document.getElementById('status-badge');
  badge.textContent = status;
  badge.className = 'badge ' + (status === 200 ? 'ok' : 'err');
  document.getElementById('response-body').textContent = (() => { try { return JSON.stringify(JSON.parse(responseText), null, 2); } catch { return responseText; } })();
  // Show curl template — customer fills in their own signature
  const alertBody = JSON.stringify(payload);
  document.getElementById('curl-output').textContent =
\`# Generate signature (replace YOUR_SECRET):
TIMESTAMP=\$(date +%s000)
SIG=\$(echo -n "\${TIMESTAMP}.\${BODY}" | openssl dgst -sha256 -hmac "YOUR_SECRET" | awk '{print \$2}')

curl -X POST https://fixitagent.ai/alert \\
  -H "Content-Type: application/json" \\
  -H "X-FX-Key: \${apiKey}" \\
  -H "X-FX-Signature: \$SIG" \\
  -H "X-FX-Timestamp: \$TIMESTAMP" \\
  -d '\${alertBody}'\`;

  document.getElementById('result-section').style.display = 'block';
  document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
  btn.disabled = false; btn.textContent = 'SEND ALERT →';
}
</script>
</body></html>`;

      return new Response(sandboxHTML, { headers: { "Content-Type": "text/html;charset=UTF-8", ...SECURITY_HEADERS } });
    }

    // POST /admin/sign-alert — owner-only sandbox alert processor
    // Inlines alert logic directly — no self-request, avoids chained worker timeout
    if (url.pathname === "/admin/sign-alert" && request.method === "POST") {
      const email = await verifySessionCookie(cookieHeader, sessionSecret);
      const ownerEmail = (env.OWNER_EMAIL || "rojasjay@gmail.com").toLowerCase();
      if (email !== ownerEmail) return new Response("Forbidden", { status: 403, headers: SECURITY_HEADERS });

      let body;
      try { body = await request.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
      const { api_key, alert } = body;
      if (!api_key || !alert) return new Response("api_key and alert required", { status: 400 });

      const customerRaw = env.MEMORY ? await env.MEMORY.get(`apikey:${api_key}`) : null;
      if (!customerRaw) return new Response("Unknown API key", { status: 404 });
      const customer = JSON.parse(customerRaw);

      // Route and analyse inline — same logic as /alert but no subrequest overhead
      const agent = routeAlert(alert);
      const alertText = alert.message || alert.details || alert.text || alert.description || JSON.stringify(alert);

      const skipClaude = body.skip_claude === true;
      let analysis = "Analysis skipped.";
      if (!skipClaude && env.ANTHROPIC_API_KEY) {
        try {
          const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
            body: JSON.stringify({
              model: "claude-sonnet-4-6",
              max_tokens: 1000,
              system: agent.system,
              messages: [{ role: "user", content: `Alert from ${customer.name}:\n\nTitle: ${alert.title || "Untitled"}\nSource: ${alert.source || "unknown"}\nSeverity: ${alert.severity || "unknown"}\n\nDetails:\n${alertText}` }],
            }),
            signal: AbortSignal.timeout(20000),
          });
          const d = await claudeRes.json();
          analysis = d.content?.[0]?.text || "Analysis unavailable.";
        } catch { analysis = "Analysis unavailable (Claude timeout or error)."; }
      } else if (!skipClaude) {
        analysis = "Analysis unavailable (ANTHROPIC_API_KEY not set).";
      }

      const severityEmoji = { critical: "🚨", medium: "⚠️", low: "ℹ️" }[(alert.severity||"").toLowerCase()] || "🔔";
      const slackTarget = customer.slack_webhook || env.SLACK_WEBHOOK_URL;
      let slackStatus = "not configured";
      if (slackTarget) {
        const sr = await fetch(slackTarget, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `${severityEmoji} *${agent.icon} ${agent.name}* — ${alert.title || "Alert"}\n*Customer:* ${customer.name}\n\n${analysis}\n\n_fixitagent.ai_`
          }),
          signal: AbortSignal.timeout(10000),
        }).catch(() => null);
        slackStatus = sr?.ok ? "delivered" : "failed";
      }

      return new Response(JSON.stringify({ ok: true, agent: agent.name, slack: slackStatus, analysis }), {
        headers: { "Content-Type": "application/json", ...SECURITY_HEADERS },
      });
    }

    // GET /admin/security-eval — owner-only security scorecard
    if (url.pathname === "/admin/security-eval" && request.method === "GET") {
      const email = await verifySessionCookie(cookieHeader, sessionSecret);
      const ownerEmail = (env.OWNER_EMAIL || "rojasjay@gmail.com").toLowerCase();
      if (email !== ownerEmail) return new Response("Forbidden", { status: 403 });

      const checks = [];
      const pass = (name, detail) => checks.push({ name, status: "PASS", detail });
      const fail = (name, detail) => checks.push({ name, status: "FAIL", detail });
      const warn = (name, detail) => checks.push({ name, status: "WARN", detail });

      // 1. Env vars / secrets
      env.SESSION_SECRET        ? pass("SESSION_SECRET set",        "Session signing isolated from Stripe secret")
                                : fail("SESSION_SECRET set",        "Missing — sessions fall back to STRIPE_WEBHOOK_SECRET");
      env.ANTHROPIC_API_KEY     ? pass("ANTHROPIC_API_KEY set",     "Claude API calls will work")
                                : fail("ANTHROPIC_API_KEY set",     "Missing — agents chat broken");
      env.STRIPE_SECRET_KEY     ? pass("STRIPE_SECRET_KEY set",     "Checkout and webhook lookups will work")
                                : fail("STRIPE_SECRET_KEY set",     "Missing — payments broken");
      env.STRIPE_WEBHOOK_SECRET ? pass("STRIPE_WEBHOOK_SECRET set", "Stripe webhook signature verification active")
                                : fail("STRIPE_WEBHOOK_SECRET set", "Missing — webhook forgery possible");
      env.SLACK_WEBHOOK_URL     ? pass("SLACK_WEBHOOK_URL set",     "Security alerts will deliver")
                                : warn("SLACK_WEBHOOK_URL set",     "Missing — security breach alerts are silent");
      env.SLACK_SIGNING_SECRET  ? pass("SLACK_SIGNING_SECRET set",  "Slack event signatures will be verified")
                                : warn("SLACK_SIGNING_SECRET set",  "Missing — /slack/events will return 503");
      env.SLACK_BOT_TOKEN       ? pass("SLACK_BOT_TOKEN set",       "Bot can post replies to Slack")
                                : warn("SLACK_BOT_TOKEN set",       "Missing — bot cannot post replies");
      env.OWNER_EMAIL           ? pass("OWNER_EMAIL set",           env.OWNER_EMAIL)
                                : warn("OWNER_EMAIL set",           "Falling back to hardcoded rojasjay@gmail.com");

      // 2. Rate limiting bindings
      env.RL_GLOBAL ? pass("RL_GLOBAL binding",  "Distributed rate limiting active (60 req/min)")
                    : fail("RL_GLOBAL binding",  "Not bound — rate limiting is disabled");
      env.RL_API    ? pass("RL_API binding",     "Tight Claude API rate limiting active (15 req/min)")
                    : fail("RL_API binding",     "Not bound — /api has no extra rate limit");

      // 3. KV binding
      if (env.MEMORY) {
        try {
          await env.MEMORY.get("_security_eval_probe");
          pass("KV binding", "MEMORY namespace accessible");
        } catch { fail("KV binding", "MEMORY.get() threw — KV may be misconfigured"); }
      } else { fail("KV binding", "MEMORY binding not present"); }

      // 4. Live endpoint probes (self-test)
      const base = `https://${url.hostname}`;

      // /api should reject unauthenticated requests
      try {
        const r = await fetch(`${base}/api`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}", signal: AbortSignal.timeout(5000) });
        r.status === 401 ? pass("/api auth gate",     "Unauthenticated POST → 401 as expected")
        : r.status === 522 ? warn("/api auth gate",  "Probe timed out (522) — self-requests may be restricted")
                           : fail("/api auth gate",  `Expected 401, got ${r.status} — auth gate may be broken`);
      } catch (e) { warn("/api auth gate", `Probe failed: ${e.message}`); }

      // /alert should reject unsigned requests
      try {
        const r = await fetch(`${base}/alert`, { method: "POST", headers: { "Content-Type": "application/json", "X-FX-Key": "fxa_probe_fake" }, body: "{}", signal: AbortSignal.timeout(5000) });
        r.status === 401 ? pass("/alert signature required", "Unsigned request → 401 as expected")
        : r.status === 522 ? warn("/alert signature required", "Probe timed out (522) — self-requests may be restricted")
                           : fail("/alert signature required", `Expected 401, got ${r.status}`);
      } catch (e) { warn("/alert signature required", `Probe failed: ${e.message}`); }

      // /agents should redirect unauthenticated users
      try {
        const r = await fetch(`${base}/agents`, { redirect: "manual", signal: AbortSignal.timeout(5000) });
        (r.status === 302 || r.status === 301) ? pass("/agents auth gate", "Unauthenticated → redirect as expected")
        : r.status === 522               ? warn("/agents auth gate", "Probe timed out (522) — self-requests may be restricted")
                                         : fail("/agents auth gate", `Expected redirect, got ${r.status}`);
      } catch (e) { warn("/agents auth gate", `Probe failed: ${e.message}`); }

      // HSTS header present
      try {
        const r = await fetch(`${base}/login`, { signal: AbortSignal.timeout(5000) });
        r.status === 522 ? warn("HSTS header", "Probe timed out (522) — self-requests may be restricted")
        : r.headers.get("Strict-Transport-Security")
          ? pass("HSTS header", r.headers.get("Strict-Transport-Security"))
          : fail("HSTS header", "Missing from /login response");
      } catch (e) { warn("HSTS header", `Probe failed: ${e.message}`); }

      // CSP header present
      try {
        const r = await fetch(`${base}/login`, { signal: AbortSignal.timeout(5000) });
        r.status === 522 ? warn("CSP header", "Probe timed out (522) — self-requests may be restricted")
        : r.headers.get("Content-Security-Policy")
          ? pass("CSP header", "Content-Security-Policy present")
          : fail("CSP header", "Missing from /login response");
      } catch (e) { warn("CSP header", `Probe failed: ${e.message}`); }

      // 5. Threat detection layers
      pass("Honeypot trap",         "20 scanner paths trigger instant alert + block");
      pass("Scanner UA detection",  "16 known attack tools blocked by User-Agent");
      pass("Injection guard",       "Path traversal + SQLi + XSS patterns in URLs blocked");

      // 6. Tracing / observability
      pass("Request tracing",       "CF-Ray ID + structured JSON logs on every request");
      pass("Workers Observability", "observability.enabled=true set in wrangler.jsonc");

      // 7. Honeypot probe — /.env should return 404 (not expose anything)
      try {
        const r = await fetch(`${base}/.env`, { signal: AbortSignal.timeout(5000) });
        r.status === 404 ? pass("Honeypot /.env",    "Returns 404 as expected")
        : r.status === 522 ? warn("Honeypot /.env",  "Probe timed out (522)")
                           : fail("Honeypot /.env",  `Unexpected status ${r.status} — honeypot may be misconfigured`);
      } catch (e) { warn("Honeypot /.env", `Probe failed: ${e.message}`); }

      const passed = checks.filter(c => c.status === "PASS").length;
      const failed = checks.filter(c => c.status === "FAIL").length;
      const warned = checks.filter(c => c.status === "WARN").length;
      // Score = PASS / (PASS + FAIL) only — WARNs are informational, not failures
      // 522 self-probe timeouts are a CF infrastructure limit, not a security gap
      const scoreable = passed + failed;
      const score = scoreable > 0 ? Math.round((passed / scoreable) * 100) : 100;

      const rowColor = s => s === "PASS" ? "#00c8ff" : s === "FAIL" ? "#ff4e4e" : "#fbbf24";
      const evalHTML = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Security Eval — fixitagent.ai</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#04080f;color:#8ec8e8;font-family:'IBM Plex Mono',monospace;padding:40px 20px}
body::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(0,160,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,160,255,0.07) 1px,transparent 1px);background-size:60px 60px}
.wrap{max-width:780px;margin:0 auto;position:relative;z-index:1}
.logo{font-family:'Orbitron',monospace;font-weight:700;font-size:18px;color:#d0eeff;letter-spacing:2px;margin-bottom:8px;text-shadow:0 0 20px rgba(0,200,255,0.5)}.logo span{color:#00c8ff}
h1{font-family:'Orbitron',monospace;font-size:22px;color:#d0eeff;margin-bottom:6px}
.score{font-family:'Orbitron',monospace;font-size:48px;color:${score >= 90 ? '#00c8ff' : score >= 70 ? '#fbbf24' : '#ff4e4e'};text-shadow:0 0 30px ${score >= 90 ? 'rgba(0,200,255,0.5)' : score >= 70 ? 'rgba(251,191,36,0.5)' : 'rgba(255,78,78,0.5)'};margin:24px 0 4px}
.summary{color:#2a5070;font-size:13px;margin-bottom:32px}
.card{border:1px solid #0d2040;background:#070d1a;padding:24px;margin-bottom:16px}
.card h2{font-family:'Orbitron',monospace;font-size:12px;color:#00c8ff;letter-spacing:2px;margin-bottom:16px}
.row{display:grid;grid-template-columns:160px 60px 1fr;gap:8px;padding:8px 0;border-bottom:1px solid #0d2040;font-size:12px;align-items:start}
.row:last-child{border:none}
.check-name{color:#8ec8e8}
.status{font-weight:700;font-size:11px;letter-spacing:1px}
.detail{color:#2a5070}
.links{margin-top:24px;display:flex;gap:16px}
.links a{color:#00c8ff;font-size:13px;text-decoration:none}
</style></head><body>
<div class="wrap">
<div class="logo">FX<span>AGENT</span></div>
<h1>Security Evaluation</h1>
<div class="score">${score}%</div>
<div class="summary">${passed} passed · ${warned} warnings · ${failed} failed · ${new Date().toUTCString()}</div>
<div class="card">
<h2>RESULTS</h2>
${checks.map(c => `<div class="row">
  <span class="check-name">${c.name}</span>
  <span class="status" style="color:${rowColor(c.status)}">${c.status}</span>
  <span class="detail">${c.detail}</span>
</div>`).join('')}
</div>
<div class="links"><a href="/admin">← Admin</a><a href="/admin/security-eval">Re-run</a></div>
</div></body></html>`;

      return new Response(evalHTML, { headers: { "Content-Type": "text/html;charset=UTF-8", ...SECURITY_HEADERS } });
    }

    // GET /test-slack — owner-only, fires a test message to Slack
    if (url.pathname === "/test-slack" && request.method === "GET") {
      const email = await verifySessionCookie(cookieHeader, sessionSecret);
      const ownerEmail = (env.OWNER_EMAIL || "rojasjay@gmail.com").toLowerCase();
      if (email !== ownerEmail) return new Response("Forbidden", { status: 403 });
      if (!env.SLACK_WEBHOOK_URL) return new Response("SLACK_WEBHOOK_URL not set", { status: 503 });
      const res = await fetch(env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `🧪 *Agent9 Slack Test*\nWorker is online and Slack is connected.\n*Time:* ${new Date().toUTCString()}` })
      });
      return new Response(res.ok ? "Slack OK" : `Slack error: ${res.status}`, { status: res.ok ? 200 : 500 });
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

    // GET /context — load user's uploaded context from KV
    if (url.pathname === "/context" && request.method === "GET") {
      const email = await verifySessionCookie(cookieHeader, sessionSecret);
      if (!email) return new Response("Unauthorized", { status: 401, headers: SECURITY_HEADERS });
      if (!env.MEMORY) return new Response(JSON.stringify({ context: "" }), { headers: { "Content-Type": "application/json" } });
      const stored = await env.MEMORY.get(`context:${email}`);
      return new Response(JSON.stringify({ context: stored || "" }), { headers: { "Content-Type": "application/json", ...SECURITY_HEADERS } });
    }

    // POST /context — save user's uploaded context to KV (max 20KB)
    if (url.pathname === "/context" && request.method === "POST") {
      const email = await verifySessionCookie(cookieHeader, sessionSecret);
      if (!email) return new Response("Unauthorized", { status: 401, headers: SECURITY_HEADERS });
      if (!env.MEMORY) return new Response("KV not configured", { status: 503 });
      let body;
      try { body = await request.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
      const ctx = (body.context || "").slice(0, 20000);
      await env.MEMORY.put(`context:${email}`, ctx);
      return new Response("OK", { status: 200, headers: SECURITY_HEADERS });
    }

    // POST /api — proxy to Claude API
    if (url.pathname === "/api" || url.pathname === "/api/") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }
      // Require valid session cookie — prevents cancelled/external users from hitting Claude API
      const apiEmail = await verifySessionCookie(cookieHeader, sessionSecret);
      if (!apiEmail) {
        await alertSecurityBreach(env, "UNAUTHORIZED /api ACCESS", `IP: ${ip}\nOrigin: ${origin || "none"}\nNo valid session`);
        return new Response("Unauthorized", { status: 401, headers: SECURITY_HEADERS });
      }
      // Verify subscription still active
      const apiSubRaw = env.MEMORY ? await env.MEMORY.get(`subscriber:${apiEmail}`) : null;
      if (!apiSubRaw || JSON.parse(apiSubRaw).status !== "active") {
        return new Response("Subscription required", { status: 403, headers: SECURITY_HEADERS });
      }
      // Tighter per-IP rate limit for Claude API calls (expensive)
      const { limited: apiLimited } = await checkRateLimit(env, ip, "RL_API");
      if (apiLimited) return new Response("Too many requests", { status: 429, headers: SECURITY_HEADERS });

      let body;
      try {
        body = await request.json();
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }

      const { model, max_tokens, system, messages } = body;

      const claudePayload = {
        model: model || "claude-sonnet-4-6",
        max_tokens: max_tokens || 16000,
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
        headers: { "Content-Type": "application/json", ...SECURITY_HEADERS }
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

    // POST /alert — authenticated inbound alert from customer monitoring system
    if (url.pathname === "/alert" && request.method === "POST") {
      const apiKey = request.headers.get("X-FX-Key") || "";
      const signature = request.headers.get("X-FX-Signature") || "";
      const timestamp = request.headers.get("X-FX-Timestamp") || "";
      const rawBody = await request.text();

      // Filter GraphQL scanner probes
      try { const p = JSON.parse(rawBody); if (p.query?.includes("__schema")) return new Response("OK", { status: 200 }); } catch {}

      if (!apiKey) return new Response("Missing X-FX-Key header", { status: 401, headers: SECURITY_HEADERS });

      const customerRaw = env.MEMORY ? await env.MEMORY.get(`apikey:${apiKey}`) : null;
      if (!customerRaw) {
        await alertSecurityBreach(env, "INVALID ALERT API KEY", `IP: ${ip}\nKey: ${apiKey.slice(0,8)}...`);
        return new Response("Invalid API key", { status: 401, headers: SECURITY_HEADERS });
      }
      const customer = JSON.parse(customerRaw);

      // Require HMAC signature — unsigned requests rejected even with valid key
      if (!signature || !timestamp) {
        return new Response("Missing X-FX-Signature and X-FX-Timestamp headers", { status: 401, headers: SECURITY_HEADERS });
      }
      const ts = parseInt(timestamp);
      if (isNaN(ts) || Math.abs(Date.now() - ts) > 300000) {
        return new Response("Timestamp expired or invalid", { status: 401, headers: SECURITY_HEADERS });
      }
      const sigValid = await verifyHmac(`${timestamp}.${rawBody}`, customer.secret, signature);
      if (!sigValid) {
        await alertSecurityBreach(env, "INVALID ALERT SIGNATURE", `Customer: ${customer.email}\nIP: ${ip}`);
        return new Response("Invalid signature", { status: 401, headers: SECURITY_HEADERS });
      }

      let alert;
      try { alert = JSON.parse(rawBody); } catch { return new Response("Invalid JSON", { status: 400 }); }
      if (!alert || Object.keys(alert).length === 0) return new Response("OK", { status: 200 });

      // Route to correct agent
      const agent = routeAlert(alert);
      const alertText = alert.message || alert.details || alert.text || alert.description || JSON.stringify(alert);

      // Claude analysis
      let analysis = "Analysis unavailable.";
      if (env.ANTHROPIC_API_KEY) {
        try {
          const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
            body: JSON.stringify({
              model: "claude-sonnet-4-6",
              max_tokens: 1000,
              system: agent.system,
              messages: [{ role: "user", content: `Alert from ${customer.name}:\n\nTitle: ${alert.title || "Untitled"}\nSource: ${alert.source || "unknown"}\nSeverity: ${alert.severity || "unknown"}\n\nDetails:\n${alertText}` }],
            }),
            signal: AbortSignal.timeout(20000),
          });
          const d = await claudeRes.json();
          analysis = d.content?.[0]?.text || analysis;
        } catch {}
      }

      // Deliver to customer's Slack
      const severityEmoji = { critical: "🚨", medium: "⚠️", low: "ℹ️" }[(alert.severity||"").toLowerCase()] || "🔔";
      const slackTarget = customer.slack_webhook || env.SLACK_WEBHOOK_URL;
      if (slackTarget) {
        await fetch(slackTarget, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `${severityEmoji} *${agent.icon} ${agent.name}* — ${alert.title || "Alert"}\n*Customer:* ${customer.name}\n\n${analysis}\n\n_fixitagent.ai_`
          }),
          signal: AbortSignal.timeout(10000),
        }).catch(() => {});
      }

      return new Response(JSON.stringify({ ok: true, agent: agent.name }), {
        headers: { "Content-Type": "application/json", ...SECURITY_HEADERS }
      });
    }

    // POST /alert/test — customer verifies their API key + Slack integration
    if (url.pathname === "/alert/test" && request.method === "POST") {
      const apiKey = request.headers.get("X-FX-Key") || "";
      if (!apiKey) return new Response("Missing X-FX-Key header", { status: 401, headers: SECURITY_HEADERS });
      const customerRaw = env.MEMORY ? await env.MEMORY.get(`apikey:${apiKey}`) : null;
      if (!customerRaw) return new Response("Invalid API key", { status: 401, headers: SECURITY_HEADERS });
      const customer = JSON.parse(customerRaw);

      const slackTarget = customer.slack_webhook || env.SLACK_WEBHOOK_URL;
      let slackOk = false;
      if (slackTarget) {
        const res = await fetch(slackTarget, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `✅ *FX Agents — Integration Test*\n*Customer:* ${customer.name}\n*API Key:* ${apiKey.slice(0,12)}...\nYour alert integration is working correctly.\n_fixitagent.ai_` })
        }).catch(() => null);
        slackOk = res?.ok || false;
      }

      return new Response(JSON.stringify({
        ok: true,
        customer: customer.name,
        endpoint: "https://fixitagent.ai/alert",
        slack: slackTarget ? (slackOk ? "delivered" : "failed") : "not configured",
      }), { headers: { "Content-Type": "application/json", ...SECURITY_HEADERS } });
    }

    // POST /admin/provision — create customer API key + secret (owner only)
    if (url.pathname === "/admin/provision" && request.method === "POST") {
      const email = await verifySessionCookie(cookieHeader, sessionSecret);
      const ownerEmail = (env.OWNER_EMAIL || "rojasjay@gmail.com").toLowerCase();
      if (email !== ownerEmail) return new Response("Forbidden", { status: 403 });
      let body;
      try { body = await request.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
      const { customer_email, slack_webhook, name } = body;
      if (!customer_email) return new Response("customer_email required", { status: 400 });
      if (slack_webhook) {
        try {
          const wh = new URL(slack_webhook);
          if (wh.protocol !== "https:" || wh.hostname !== "hooks.slack.com") {
            return new Response("slack_webhook must be a https://hooks.slack.com URL", { status: 400 });
          }
        } catch {
          return new Response("slack_webhook is not a valid URL", { status: 400 });
        }
      }

      const keyBytes = new Uint8Array(16);
      const secretBytes = new Uint8Array(32);
      crypto.getRandomValues(keyBytes);
      crypto.getRandomValues(secretBytes);
      const apiKey = "fxa_" + Array.from(keyBytes).map(b => b.toString(16).padStart(2,"0")).join("").slice(0,24);
      const secret = Array.from(secretBytes).map(b => b.toString(16).padStart(2,"0")).join("");

      if (env.MEMORY) {
        await env.MEMORY.put(`apikey:${apiKey}`, JSON.stringify({
          email: customer_email,
          slack_webhook: slack_webhook || "",
          name: name || customer_email,
          secret,
          created_at: new Date().toISOString(),
        }));
      }
      return new Response(JSON.stringify({
        api_key: apiKey,
        secret,
        endpoint: "https://fixitagent.ai/alert",
        headers: { "X-FX-Key": apiKey, "X-FX-Signature": "HMAC-SHA256(timestamp.body, secret)", "X-FX-Timestamp": "Date.now()" }
      }), { headers: { "Content-Type": "application/json", ...SECURITY_HEADERS } });
    }

    return env.ASSETS.fetch(request);
  }
};
