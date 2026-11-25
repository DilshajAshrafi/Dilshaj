const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

function createFeed(dataSaver = false) {
  const html = readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const start = html.indexOf('    const githubActivity = document.querySelector("#github-activity");');
  const end = html.indexOf("    const assistantForm", start);
  assert.ok(start !== -1 && end !== -1, "GitHub activity script must be present");
  let now = 1000000;
  let nextTimer = 0;
  let observe;
  let visibilityChange;
  let clicks;
  let calls = 0;
  let fail = false;
  const timers = new Map();
  const list = {
    children: [],
    replaceChildren(...items) { this.children = items; },
  };
  const status = { textContent: "" };
  const button = {
    disabled: false,
    addEventListener(name, callback) { if (name === "click") clicks = callback; },
  };
  const document = {
    hidden: false,
    querySelector(selector) {
      return {
        "#github-activity": list,
        "#github-activity-status": status,
        "#github-activity-refresh": button,
      }[selector];
    },
    createElement() { return { append() {} }; },
    addEventListener(name, callback) { if (name === "visibilitychange") visibilityChange = callback; },
  };
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  class IntersectionObserver {
    constructor(callback) { observe = callback; }
    observe() {}
  }
  const window = {
    setTimeout(callback, delay) {
      const id = ++nextTimer;
      timers.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
  };
  const fetch = async () => {
    calls++;
    if (fail) return { ok: false, status: 503 };
    return {
      ok: true,
      json: async () => [{ id: "1", type: "PushEvent", repo: { name: "test/repo" }, created_at: "2026-01-01T00:00:00Z" }],
    };
  };
  vm.runInNewContext(html.slice(start, end), {
    document, window, IntersectionObserver, AbortController, Date: Clock, fetch, dataSaver,
    localTimeFormat: new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }),
  });
  return {
    show(visible) { observe([{ isIntersecting: visible }]); },
    setHidden(hidden) { document.hidden = hidden; visibilityChange(); },
    click() { clicks(); },
    fail() { fail = true; },
    async advance(ms) {
      now += ms;
      for (const [id, timer] of [...timers]) {
        if (timer.at <= now && timers.has(id)) {
          timers.delete(id);
          timer.callback();
        }
      }
      await new Promise((resolve) => setImmediate(resolve));
    },
    calls: () => calls,
    status: () => status.textContent,
    items: () => list.children.length,
  };
}

test("activity refreshes only when visible and pauses in a hidden tab", async () => {
  const feed = createFeed();
  await feed.advance(600000);
  assert.equal(feed.calls(), 0);
  feed.show(true);
  await feed.advance(0);
  assert.equal(feed.calls(), 1);
  await feed.advance(299999);
  assert.equal(feed.calls(), 1);
  feed.setHidden(true);
  await feed.advance(1000);
  assert.equal(feed.calls(), 1);
  feed.setHidden(false);
  await feed.advance(0);
  assert.equal(feed.calls(), 2);
  feed.show(false);
  await feed.advance(600000);
  assert.equal(feed.calls(), 2);
});

test("data saver refreshes less often and failed manual refresh keeps previous activity", async () => {
  const feed = createFeed(true);
  feed.show(true);
  await feed.advance(0);
  await feed.advance(300000);
  assert.equal(feed.calls(), 1);
  await feed.advance(600000);
  assert.equal(feed.calls(), 2);
  feed.fail();
  feed.click();
  await feed.advance(0);
  assert.equal(feed.calls(), 3);
  assert.equal(feed.items(), 1);
  assert.match(feed.status(), /could not be refreshed/);
});
