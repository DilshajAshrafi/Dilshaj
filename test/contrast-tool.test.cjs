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
  const foregroundValue = { textContent: "" };
  const backgroundValue = { textContent: "" };
  const preview = { style: {} };
  const readout = { dataset: {} };
  const ratio = { textContent: "" };
  const result = { textContent: "" };
  const document = {
    querySelector(selector) {
      return {
        "#contrast-foreground": foreground,
        "#contrast-background": background,
        "#contrast-foreground-value": foregroundValue,
        "#contrast-background-value": backgroundValue,
        "#contrast-preview": preview,
        "#contrast-readout": readout,
        "#contrast-ratio": ratio,
        "#contrast-result": result,
      }[selector];
    },
  };
  const context = vm.createContext({ document });
  vm.runInContext(html.slice(start, end), context);
  assert.equal(ratio.textContent, "21.00:1");
  assert.match(result.textContent, /Passes WCAG AA for normal text/);
  assert.equal(readout.dataset.grade, "pass");
  assert.equal(foregroundValue.textContent, "#000000");
  assert.equal(backgroundValue.textContent, "#FFFFFF");
  assert.equal(preview.style.color, "#000000");
  assert.equal(preview.style.backgroundColor, "#ffffff");
  foreground.value = "#70787d";
  vm.runInContext("updateContrastResult()", context);
  assert.equal(ratio.textContent, "4.50:1");
  assert.equal(readout.dataset.grade, "large");
  assert.match(result.textContent, /large text only/);
  assert.equal(foregroundValue.textContent, "#70787D");
  assert.equal(preview.style.color, "#70787d");
  foreground.value = "#777777";
  vm.runInContext("updateContrastResult()", context);
  assert.match(result.textContent, /large text only/);
  foreground.value = "#ffffff";
  vm.runInContext("updateContrastResult()", context);
  assert.equal(ratio.textContent, "1.00:1");
  assert.equal(readout.dataset.grade, "fail");
  assert.match(result.textContent, /Does not pass/);
});
