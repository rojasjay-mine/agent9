export default {
  async fetch(request, env) {
    const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
    const SLACK_WEBHOOK_URL = env.SLACK_WEBHOOK_URL;
    if (request.method !== "POST") {
      return new Response("Agent9 is live.", { status: 200 });
    }

    let alert;
    try {
      alert = await request.json();
    } catch {
      return new Response("Invalid JSON payload.", { status: 400 });
    }

    const alertText = alert.message || JSON.stringify(alert);

    // Send to Claude for diagnosis
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `You are Agent9, an elite infrastructure remediation AI. 
An alert has been received. Analyze it, diagnose the root cause, and provide a clear fix recommendation.

Alert:
${alertText}

Respond in this format:
SEVERITY: [LOW / MEDIUM / CRITICAL]
DIAGNOSIS: (what is wrong and why)
RECOMMENDED FIX: (exact steps to resolve)`
          }
        ]
      })
    });

    const claudeData = await claudeResponse.json();
    const diagnosis = claudeData.content?.[0]?.text || "Claude could not generate a diagnosis.";

    // Post to Slack
    await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `*🚨 Agent9 Alert Received*\n\n*Incoming Alert:*\n${alertText}\n\n*Claude Diagnosis:*\n${diagnosis}`
      })
    });

    return new Response("Alert processed and posted to Slack.", { status: 200 });
  }
};
