/**
 * Tests for local 3D scenes (v4.5.0, src/scene3d.js).
 * Run with:  node tests/v450.test.js
 *
 * 1. OAL3D.localRefs() finds every "local:Name" string (all quote kinds,
 *    also in constants), nothing else.
 * 2. OAL3D.hasLocalScenes() is false for codes without local scenes –
 *    saving and exporting stay exactly as before for them.
 * 3. Model3D._localName() recognises only the prefix "local:".
 * The browser parts (IndexedDB, editor, export) are tested with Playwright.
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
vm.runInContext("var M = class { " + cut(htmlSrc, "static _localName(url) {", "\n  // Im Export:") + " };", ctx);

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

// 1. localRefs
check(
  "double quotes",
  OAL3D.localRefs('let m = new Model3D("local:Getriebe", 1280, 720);'),
  ["Getriebe"],
);
check(
  "single quotes, backticks, umlauts, spaces, duplicates",
  OAL3D.localRefs("const A = 'local:Meine Szene';\nlet b = new Model3D(`local:Zahnräder 2`, 1, 1);\nnew Model3D(A); x = 'local:Meine Szene';"),
  ["Meine Szene", "Zahnräder 2"],
);
check(
  "no match for online scenes, text without quotes or mixed quotes",
  OAL3D.localRefs(
    'new Model3D("https://www.educational-animation.org/3d-scene-editor/index.html?scene=c36167f4&mode=view");\n// local:Kommentar\nlet s = "local:x\';',
  ),
  [],
);

// 2. hasLocalScenes
check("plain 2D code", OAL3D.hasLocalScenes("let board = new Board(1280, 720);\nnew Rectangle(10, 10);"), false);
check("online scene only", OAL3D.hasLocalScenes('new Model3D("https://x/3d-scene-editor/index.html?scene=a-b-c")'), false);
check("local scene", OAL3D.hasLocalScenes('new Model3D("local:A")'), true);

// 3. Model3D._localName
vm.runInContext("var r = [M._localName('local:Getriebe'), M._localName('https://x/?scene=1'), M._localName(''), M._localName(5), M._localName('xlocal:a')];", ctx);
check("Model3D._localName", ctx.r, ["Getriebe", null, null, null, null]);

console.log(failed ? "\n" + failed + " test(s) FAILED" : "\nall tests passed");
process.exit(failed ? 1 : 0);
