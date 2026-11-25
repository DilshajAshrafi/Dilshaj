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
  const document = {
    querySelectorAll: () => buttons,
    querySelector(selector) {
      return { "#skill-description": description, "#skill-results": results, "#about": about }[selector];
    },
    createElement: () => element(),
  };
  vm.runInNewContext(scriptBetween(
    "    const skillMaps = {",
    '    const promptBuilderForm = document.querySelector("#prompt-builder-form");',
  ), { document, projectSearch: { value: "" }, projectFilterButtons: [element()] });

  buttons[2].handlers.click();
  assert.equal(buttons[2].attributes["aria-pressed"], "true");
  assert.equal(buttons[0].attributes["aria-pressed"], "false");
  assert.match(description.textContent, /AI-powered/);
  assert.deepEqual(Array.from(results.children, (link) => link.href), [
    "#project-kisaan", "#project-ai", "#project-mind-care",
  ]);
  buttons[0].handlers.click();
  assert.equal(buttons[2].attributes["aria-pressed"], "false");
  assert.equal(results.children.length, 2);
});
