const assert = require("node:assert/strict");
const { after, test } = require("node:test");
const assistantHandler = require("../api/assistant.js");
const { isSameOrigin, readMessage } = assistantHandler;

const originalApiKey = process.env.GEMINI_API_KEY;
after(() => {
  if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalApiKey;
});

function createResponse() {
  return {
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(body) {
      this.body = JSON.parse(body);
    }
  };
}

test("accepts same-origin HTTPS and local development requests only", () => {
  assert.equal(isSameOrigin("https://portfolio.example", "portfolio.example"), true);
  assert.equal(isSameOrigin("http://localhost:3000", "localhost:3000"), true);
  assert.equal(isSameOrigin("https://other.example", "portfolio.example"), false);
  assert.equal(isSameOrigin("http://portfolio.example", "portfolio.example"), false);
});

test("validates and normalizes assistant questions", () => {
  assert.deepEqual(readMessage({ message: "  How do I start?  " }), { message: "How do I start?" });
  assert.equal(readMessage({ message: "" }).status, 400);
  assert.equal(readMessage({ message: "x".repeat(1001) }).status, 400);
  assert.equal(readMessage({ message: "x".repeat(5000) }).status, 413);
  assert.equal(readMessage("{").status, 400);
});

test("rejects unsupported methods and cross-origin requests", async () => {
  const methodResponse = createResponse();
  await assistantHandler({
    method: "GET",
    headers: { host: "portfolio.example" },
    body: null
  }, methodResponse);
  assert.equal(methodResponse.statusCode, 405);

  const originResponse = createResponse();
  await assistantHandler({
    method: "POST",
    headers: { host: "portfolio.example", origin: "https://other.example" },
    body: { message: "hello" }
  }, originResponse);
  assert.equal(originResponse.statusCode, 403);
});

test("reports missing model configuration without making an upstream request", async () => {
  delete process.env.GEMINI_API_KEY;
  const response = createResponse();
  await assistantHandler({
    method: "POST",
    headers: {
      host: "portfolio.example",
      origin: "https://portfolio.example",
      "x-vercel-forwarded-for": "192.0.2.55"
    },
    body: { message: "hello" }
  }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.headers["Cache-Control"], "no-store");
});

test("uses the server-side model key, returns replies, and rate-limits bursts", async () => {
  const originalApiKey = process.env.GEMINI_API_KEY;
  const originalModel = process.env.GEMINI_MODEL;
  const originalFetch = global.fetch;
  let upstreamCalls = 0;
  process.env.GEMINI_API_KEY = "test-only-key";
  process.env.GEMINI_MODEL = "test-model";
  global.fetch = async (url, options) => {
    upstreamCalls += 1;
    assert.equal(url, "https://generativelanguage.googleapis.com/v1beta/models/test-model:generateContent");
    assert.equal(options.headers["x-goog-api-key"], "test-only-key");
    return {
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: "A focused, testable project is a good start." }] } }] })
    };
  };

  try {
    const request = {
      method: "POST",
      headers: {
        host: "portfolio.example",
        origin: "https://portfolio.example",
        "x-vercel-forwarded-for": "203.0.113.80"
      },
      body: { message: "How do I start a web project?" }
    };

    for (let count = 0; count < 8; count += 1) {
      const response = createResponse();
      await assistantHandler(request, response);
      assert.equal(response.statusCode, 200);
      assert.equal(response.body.reply, "A focused, testable project is a good start.");
    }

    const limitedResponse = createResponse();
    await assistantHandler(request, limitedResponse);
    assert.equal(limitedResponse.statusCode, 429);
    assert.equal(upstreamCalls, 8);
  } finally {
    global.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalApiKey;
    if (originalModel === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = originalModel;
  }
});
