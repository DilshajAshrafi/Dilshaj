const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

function createWorker() {
  const listeners = {};
  const cachedRequests = [];
  const cache = {
    put: async (request) => cachedRequests.push(request),
  };
  const caches = {
    open: async () => cache,
    match: async () => undefined,
  };
  const response = { ok: true, clone() { return this; } };
  const self = {
    location: { origin: "https://portfolio.example" },
    addEventListener: (name, listener) => { listeners[name] = listener; },
  };
  runInNewContext(readFileSync("service-worker.js", "utf8"), {
    self, caches, URL, fetch: async () => response, console,
  });
  return { listeners, cachedRequests, response };
}

function dispatchFetch(worker, options = {}) {
  const request = {
    method: "GET",
    url: "https://portfolio.example/asset",
    destination: "",
    mode: "cors",
    ...options,
    headers: new Headers(options.headers),
  };
  let response;
  worker.listeners.fetch({ request, respondWith: (promise) => { response = promise; } });
  return { request, response };
}

test("media and range requests bypass the service worker cache", () => {
  const worker = createWorker();
  for (const options of [
    { destination: "audio" },
    { destination: "video" },
    { headers: { Range: "bytes=0-1023" } },
  ]) {
    assert.equal(dispatchFetch(worker, options).response, undefined);
  }
  assert.equal(worker.cachedRequests.length, 0);
});

test("ordinary same-origin assets can still be cached", async () => {
  const worker = createWorker();
  const { request, response } = dispatchFetch(worker, { destination: "image" });
  assert.equal(await response, worker.response);
  assert.deepEqual(worker.cachedRequests, [request]);
});
