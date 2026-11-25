const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const html = readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

function scriptBetween(startText, endText) {
  const start = html.indexOf(startText);
  const end = html.indexOf(endText, start);
  assert.ok(start !== -1 && end !== -1, "Interaction script must be present");
  return html.slice(start, end);
}

function element() {
  return {
    hidden: false,
    children: [],
    attributes: {},
    handlers: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, handler) { this.handlers[name] = handler; },
    replaceChildren(...children) { this.children = children; },
  };
}

test("live demo loads only on request and unloads on toggle or dialog close", () => {
  const demo = element();
  const button = element();
  const preview = element();
  preview.hidden = true;
  const dialog = element();
  const document = {
    querySelector(selector) {
      return { "#case-demo": demo, "#case-demo-toggle": button, "#case-demo-preview": preview }[selector];
    },
    createElement(tag) { return { tag }; },
  };
  vm.runInNewContext(scriptBetween(
    '    const caseDemo = document.querySelector("#case-demo");',
    '    casePreviewImage.addEventListener("error"',
  ), { document, caseDialog: dialog, projectCases: { kisaan: { url: "https://example.test/" } } });

  assert.equal(preview.children.length, 0);
  button.handlers.click();
  assert.equal(preview.hidden, false);
  assert.equal(preview.children[0].src, "https://example.test/");
  assert.equal(button.attributes["aria-expanded"], "true");
  button.handlers.click();
  assert.equal(preview.hidden, true);
  assert.equal(preview.children.length, 0);
  button.handlers.click();
  dialog.handlers.close();
  assert.equal(preview.children.length, 0);
  assert.equal(button.attributes["aria-expanded"], "false");
});

test("skill map switches selected skill and related project links", () => {
  const buttons = ["web", "app", "ai"].map((skill) => Object.assign(element(), { dataset: { skill } }));
  const description = element();
  const results = element();
  const about = element();
  const radar = { dataset: {} };
  const document = {
    querySelectorAll: () => buttons,
    querySelector(selector) {
      return { "#skill-description": description, "#skill-results": results, "#about": about, "#skill-radar": radar }[selector];
    },
    createElement: () => element(),
  };
  vm.runInNewContext(scriptBetween(
    "    const skillMaps = {",
    '    const promptBuilderForm = document.querySelector("#prompt-builder-form");',
  ), { document, projectSearch: { value: "" }, projectFilterButtons: [element()] });

  buttons[2].handlers.click();
  assert.equal(buttons[2].attributes["aria-pressed"], "true");
  assert.equal(radar.dataset.selected, "ai");
  assert.equal(buttons[0].attributes["aria-pressed"], "false");
  assert.match(description.textContent, /AI-powered/);
  assert.deepEqual(Array.from(results.children, (link) => link.href), [
    "#project-kisaan", "#project-ai", "#project-mind-care",
  ]);
  buttons[0].handlers.click();
  assert.equal(buttons[2].attributes["aria-pressed"], "false");
  assert.equal(results.children.length, 2);
});

test("focus demo pauses, catches up after a hidden tab, and resets on close", () => {
  const demo = element();
  const time = element();
  const toggle = element();
  const reset = element();
  const status = element();
  const dialog = element();
  const document = {
    hidden: false,
    handlers: {},
    addEventListener(name, handler) { this.handlers[name] = handler; },
    querySelector(selector) {
      return {
        "#focus-demo": demo, "#focus-demo-time": time, "#focus-demo-toggle": toggle,
        "#focus-demo-status": status, "#focus-demo-reset": reset,
      }[selector];
    },
  };
  let now = 0;
  let callback;
  const window = {
    setTimeout(fn) { callback = fn; return 1; },
    clearTimeout() { callback = undefined; },
  };
  vm.runInNewContext(scriptBetween(
    '    const focusDemo = document.querySelector("#focus-demo");',
    '    let currentCaseKey = "";',
  ), { document, window, Date: { now: () => now }, caseDialog: dialog });

  toggle.handlers.click();
  assert.equal(time.textContent, "01:00");
  now = 1500;
  callback();
  assert.equal(time.textContent, "00:59");
  toggle.handlers.click();
  assert.equal(status.textContent, "Timer paused.");
  assert.equal(callback, undefined);
  now = 5000;
  toggle.handlers.click();
  document.hidden = true;
  document.handlers.visibilitychange();
  assert.equal(callback, undefined);
  now = 65000;
  document.hidden = false;
  document.handlers.visibilitychange();
  assert.equal(time.textContent, "00:00");
  assert.equal(status.textContent, "Timer complete.");
  assert.equal(toggle.textContent, "START AGAIN");
  toggle.handlers.click();
  dialog.handlers.close();
  assert.equal(time.textContent, "01:00");
  assert.equal(callback, undefined);
});

test("gallery switches between project screenshot and illustration, including load failure", () => {
  const image = element();
  const artwork = element();
  const controls = element();
  const caption = element();
  const buttons = ["screenshot", "artwork"].map((type) => Object.assign(element(), { dataset: { gallery: type } }));
  const document = {
    querySelector(selector) { return { "#case-artwork": artwork, "#case-gallery-controls": controls }[selector]; },
    querySelectorAll: () => buttons,
  };
  const context = vm.createContext({
    document, casePreviewImage: image, casePreviewCaption: caption, caseScreenshotFailed: false,
    projectCases: { "mind-care": { preview: { caption: "Mind Care screenshot." } } },
  });
  vm.runInContext(scriptBetween('    let currentCaseKey = "";', "    function openProjectCase(key) {"), context);
  vm.runInContext('currentCaseKey = "mind-care"; showCaseGallery("screenshot")', context);
  assert.equal(image.hidden, false);
  assert.equal(artwork.hidden, true);
  assert.equal(caption.textContent, "Mind Care screenshot.");
  buttons[1].handlers.click();
  assert.equal(image.hidden, true);
  assert.equal(artwork.hidden, false);
  assert.match(caption.textContent, /not a project screenshot/);
  vm.runInContext('caseScreenshotFailed = true; showCaseGallery("screenshot")', context);
  assert.equal(image.hidden, true);
  assert.match(caption.textContent, /could not be loaded/);
});
