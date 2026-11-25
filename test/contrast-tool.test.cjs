const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

test("contrast tool reports WCAG thresholds without rounding before comparison", () => {
  const html = readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const start = html.indexOf('    const contrastForeground = document.querySelector("#contrast-foreground");');
  const end = html.indexOf('    const githubActivity = document.querySelector("#github-activity");', start);
  assert.ok(start !== -1 && end !== -1, "Contrast tool script must be present");
  const foreground = { value: "#000000", addEventListener() {} };
  const background = { value: "#ffffff", addEventListener() {} };
  const result = { textContent: "" };
  const document = {
    querySelector(selector) {
      return {
        "#contrast-foreground": foreground,
        "#contrast-background": background,
        "#contrast-result": result,
      }[selector];
    },
  };
  const context = vm.createContext({ document });
  vm.runInContext(html.slice(start, end), context);
  assert.match(result.textContent, /^21\.00:1 · Passes WCAG AA for normal text/);
  foreground.value = "#777777";
  vm.runInContext("updateContrastResult()", context);
  assert.match(result.textContent, /large text only/);
  foreground.value = "#ffffff";
  vm.runInContext("updateContrastResult()", context);
  assert.match(result.textContent, /^1\.00:1 · Does not pass/);
});
