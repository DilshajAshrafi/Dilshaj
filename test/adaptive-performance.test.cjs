const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

function createScene() {
  const html = readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const start = html.indexOf("    let stars = [];");
  const end = html.indexOf("    const scrollProgressBar", start);
  assert.ok(start !== -1 && end !== -1, "Starfield script must be present");
  let nextFrame;
  let longTaskCallback;
  let disconnected = false;
  const parent = { classList: { toggle() {} } };
  const canvas = {
    parentElement: parent,
    _width: 0,
    _height: 0,
    get width() { return this._width; },
    set width(value) { this._width = Math.floor(value); },
    get height() { return this._height; },
    set height(value) { this._height = Math.floor(value); },
    getBoundingClientRect: () => ({ width: 1500, height: 900 }),
  };
  const drawing = {
    setTransform() {}, clearRect() {}, fillRect() {}, beginPath() {}, moveTo() {},
    lineTo() {}, stroke() {},
    createLinearGradient: () => ({ addColorStop() {} }),
  };
  class PerformanceObserver {
    static supportedEntryTypes = ["longtask"];
    constructor(callback) { longTaskCallback = callback; }
    observe() {}
    disconnect() { disconnected = true; }
  }
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; }
    observe(target) { this.callback([{ target, isIntersecting: true }]); }
  }
  const document = {
    hidden: false,
    documentElement: { classList: { add() {} } },
    addEventListener() {},
    querySelectorAll: () => [],
  };
  const scene = vm.createContext({
    canvas, context: drawing, document, performanceLite: false, prefersReducedMotion: false,
    window: { devicePixelRatio: 1, PerformanceObserver, addEventListener() {} },
    PerformanceObserver, IntersectionObserver,
    syncLocalClock() {},
    requestAnimationFrame: (callback) => { nextFrame = callback; return 1; },
    cancelAnimationFrame() {},
  });
  vm.runInContext(html.slice(start, end), scene);
  return {
    tick(time) { const frame = nextFrame; nextFrame = undefined; frame(time); },
    longTasks(times) { longTaskCallback({ getEntries: () => times.map((startTime) => ({ startTime })) }); },
    lite: () => vm.runInContext("performanceLite", scene),
    meteors: () => vm.runInContext("meteors.length", scene),
    pixels: () => canvas.width * canvas.height,
    disconnected: () => disconnected,
  };
}

test("sustained slow frames enable lighter effects; occasional stalls do not", () => {
  const scene = createScene();
  let time = 0;
  for (let i = 0; i < 100; i++) {
    time += i % 3 === 0 ? 50 : 16;
    scene.tick(time);
  }
  assert.equal(scene.lite(), false);
  for (let i = 0; i < 180 && !scene.lite(); i++) {
    time += 50;
    scene.tick(time);
  }
  assert.equal(scene.lite(), true);
  assert.equal(scene.meteors(), 1);
  assert.ok(scene.pixels() <= 750000);
  assert.equal(scene.disconnected(), true);
});

test("only repeated long tasks within the time window enable lighter effects", () => {
  const scene = createScene();
  scene.longTasks([100, 200, 300, 400]);
  assert.equal(scene.lite(), false);
  scene.longTasks([15000, 15100, 15200, 15300]);
  assert.equal(scene.lite(), false);
  scene.longTasks([15400]);
  assert.equal(scene.lite(), true);
});
