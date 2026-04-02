export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api" || url.pathname === "/api/") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }
      let alert;
      try {
        alert = await request.json();
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }
      const alertText = alert.message || JSON.stringify(alert);
      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `You are Agent9. Analyze this alert and respond with SEVERITY, DIAGNOSIS, and RECOMMENDED FIX:\n${alertText}` }]
        })
      });
      const claudeData = await claudeResponse.json();
      const diagnosis = claudeData.content?.[0]?.text || "No diagnosis.";
      await fetch(env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `*🚨 Agent9 Alert*\n\n*Alert:*\n${alertText}\n\n*Diagnosis:*\n${diagnosis}`
        })
      });
      return new Response("Done.", { status: 200 });
    }

    return env.ASSETS.fetch(request);
  }
};
