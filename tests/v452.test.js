/**
 * Tests for the blank scene (v4.5.2).
 * Run with:  node tests/v452.test.js
 *
 * 1. OAL3D.hasBlankScene(): new Model3D() without an address counts as blank
 *    scene; string addresses (local:…, website) do not.
 * 2. Model3D._blankScene() has the settings of the former empty website
 *    scenes and no objects.
 * Constructor, setSceneSettings and the exports are tested with Playwright.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sceneSrc = fs.readFileSync(path.join(root, "src/scene3d.js"), "utf8");
const htmlSrc = fs.readFileSync(path.join(root, "src/core/HtmlSvgEdu.js"), "utf8");

const stubEl = () => ({ appendChild() {}, setAttribute() {}, style: {}, classList: { add() {} } });
const ctx = {
  console,
  URL,
  window: { location: { href: "https://www.educational-animation.org/oal/index.html", origin: "https://www.educational-animation.org" } },
  document: { createElement: stubEl, head: stubEl(), getElementById: () => null },
  BroadcastChannel: class { constructor() {} },
};
ctx.window.document = ctx.document;
vm.createContext(ctx);
vm.runInContext(sceneSrc, ctx);
const OAL3D = ctx.window.OAL3D;

function cut(src, start, end) {
  const i = src.indexOf(start);
  const j = src.indexOf(end, i + start.length);
  if (i < 0 || j < 0) throw new Error("not found: " + start);
  return src.slice(i, j);
}
vm.runInContext("var M = class { " + cut(htmlSrc, "static _blankScene() {", "\n  // Aussehen der Szene") + " };", ctx);

let failed = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) console.log("ok   " + name);
  else {
    failed++;
    console.log("FAIL " + name + "\n     got      " + a + "\n     expected " + e);
  }
}

const cases = {
  "new Model3D(1280, 720)": true,
  "new Model3D(MODELL_BREITE, MODELL_HOEHE)": true,
  "new Model3D()": true,
  'new Model3D("", 1280, 720)': true,
  'new Model3D("local:Getriebe", 1280, 720)': false,
  'new Model3D("https://www.educational-animation.org/3d-scene-editor/index.html?scene=a&mode=view", 1, 1)': false,
  "let board = new Board(1280, 720);": false,
};
for (const [code, expected] of Object.entries(cases)) check("hasBlankScene " + code, OAL3D.hasBlankScene(code), expected);

vm.runInContext("var b = M._blankScene();", ctx);
check("blank settings", [ctx.b.settings.edgeColor, ctx.b.settings.edgeThickness, ctx.b.settings.glossiness, ctx.b.settings.edgeQuality, ctx.b.settings.clickableHighlightColor], ["#555555", 0.5, 35, "ultra", "#b9f8cf"]);
check("blank is empty", [ctx.b.objects.length, ctx.b.poses.length], [0, 0]);

console.log(failed ? "\n" + failed + " test(s) FAILED" : "\nall tests passed");
process.exit(failed ? 1 : 0);
