const MAX_MESSAGE_LENGTH = 1000;
const MAX_BODY_BYTES = 4000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 8;
// This per-instance limit is a burst guard; configure Gemini usage quotas before public launch.
const rateLimits = new Map();

function sendJson(response, status, body) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.end(JSON.stringify(body));
}

function isSameOrigin(origin, host) {
  if (typeof origin !== "string" || typeof host !== "string") return false;
  try {
    const parsedOrigin = new URL(origin);
    const expectedProtocol = host.startsWith("localhost") ? "http:" : "https:";
    return parsedOrigin.host === host && parsedOrigin.protocol === expectedProtocol;
  } catch {
    return false;
  }
}

function readMessage(body) {
  let payload = body;
  if (typeof body === "string" || Buffer.isBuffer(body)) {
    const rawBody = Buffer.isBuffer(body) ? body.toString("utf8") : body;
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return { error: "That request is too large. Shorten your question and try again.", status: 413 };
    }
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return { error: "The request must contain valid JSON.", status: 400 };
    }
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { error: "The request must contain a question.", status: 400 };
  }
  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > MAX_BODY_BYTES) {
    return { error: "That request is too large. Shorten your question and try again.", status: 413 };
  }
  if (typeof payload.message !== "string") {
    return { error: "Enter a question before sending.", status: 400 };
  }

  const message = payload.message.trim();
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return { error: `Questions must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`, status: 400 };
  }
  return { message };
}

function isRateLimited(clientKey, now = Date.now()) {
  for (const [key, limit] of rateLimits) {
    if (limit.expiresAt <= now) rateLimits.delete(key);
  }

  const current = rateLimits.get(clientKey);
  if (current && current.expiresAt > now && current.count >= RATE_LIMIT_MAX_REQUESTS) return true;
  if (!current && rateLimits.size >= 5000) {
    rateLimits.delete(rateLimits.keys().next().value);
  }
  if (!current || current.expiresAt <= now) {
    rateLimits.set(clientKey, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    current.count += 1;
  }
  return false;
}

module.exports = async function assistantHandler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Use POST to ask the portfolio guide a question." });
    return;
  }

  if (!isSameOrigin(request.headers.origin, request.headers.host)) {
    sendJson(response, 403, { error: "This assistant only accepts requests from the portfolio website." });
    return;
  }

  const parsed = readMessage(request.body);
  if (parsed.error) {
    sendJson(response, parsed.status, { error: parsed.error });
    return;
  }

  const forwardedIp = request.headers["x-vercel-forwarded-for"] || request.headers["x-forwarded-for"];
  const clientIp = typeof forwardedIp === "string"
    ? forwardedIp.split(",")[0].trim()
    : request.socket && request.socket.remoteAddress || "unknown";
  if (isRateLimited(clientIp)) {
    sendJson(response, 429, { error: "Please wait a minute before asking another question." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    sendJson(response, 503, { error: "Live AI is not configured yet. Add GEMINI_API_KEY to the hosting provider's private environment variables." });
    return;
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  let upstream;
  try {
    upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: [
              "You are the portfolio guide for Dilshaj Ashrafi, a CSE + AI student focused on web and application development and artificial intelligence.",
              "Answer briefly and helpfully about web and application development, AI learning, or the portfolio projects listed below.",
              "Portfolio facts: Kisaan Sathi is a farmer-support web application with AI-focused crop guidance, irrigation planning, soil and pest care, and scheme information. Mind Care is a collaborative student wellbeing web app with reflection, focus tools, multilingual support, and optional AI chat. The Autonomous AI Assistant & Knowledge Engine is a featured project about autonomous assistance and connected knowledge.",
              "Do not invent personal details, credentials, technologies, contributions, dates, or project results. If the portfolio does not provide an answer, say so and point to the public GitHub profile.",
              "Do not request sensitive personal information, claim to contact Dilshaj, or present yourself as a human."
            ].join(" ")
          }]
        },
        contents: [{ role: "user", parts: [{ text: parsed.message }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.4 }
      }),
      signal: AbortSignal.timeout(18_000)
    });
  } catch (error) {
    console.error("[portfolio-assistant] Gemini request failed:", error.name);
    sendJson(response, 502, { error: "The AI service could not be reached. Please try again later." });
    return;
  }

  if (!upstream.ok) {
    console.error(`[portfolio-assistant] Gemini returned HTTP ${upstream.status}.`);
    sendJson(response, 502, { error: "The AI service could not answer right now. Please try again later." });
    return;
  }

  let data;
  try {
    data = await upstream.json();
  } catch {
    sendJson(response, 502, { error: "The AI service returned an unreadable response. Please try again." });
    return;
  }

  const reply = data.candidates?.[0]?.content?.parts
    ?.map((part) => typeof part.text === "string" ? part.text : "")
    .join("")
    .trim();
  if (!reply) {
    sendJson(response, 502, { error: "The AI service did not return a text reply. Please try again." });
    return;
  }

  sendJson(response, 200, { reply });
};

module.exports.isSameOrigin = isSameOrigin;
module.exports.readMessage = readMessage;
