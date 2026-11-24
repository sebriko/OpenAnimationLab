/**
 * Tests for the AI-friendliness changes of v4.4.0.
 * Run with:  node tests/v440.test.js
 *
 * 1. replacer() leaves string literals alone ("Timer(0)" stays text).
 * 2. addLoopGuards() puts __oalLoop(line) into every loop body without new lines.
 * 3. Text.colorTags() turns <span style="color:…"> into internal colour tags.
 * 4. Timer._normDuration(): 0, negative, empty → endless (null).
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const editorSrc = fs.readFileSync(path.join(root, "src/core/CodeEditor.js"), "utf8");
const htmlSrc = fs.readFileSync(path.join(root, "src/core/HtmlSvgEdu.js"), "utf8");
const svgSrc = fs.readFileSync(path.join(root, "src/core/SvgJSEdu.js"), "utf8");

function cut(src, start, end) {
  const i = src.indexOf(start);
  const j = src.indexOf(end, i + start.length);
  if (i < 0 || j < 0) throw new Error("not found: " + start);
  return src.slice(i, j);
}

const ctx = { console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "lib/acorn/8.8.2/acorn.min.js"), "utf8"), ctx);
vm.runInContext(cut(editorSrc, "function addLoopGuards(", "\n// 4.4.0: Zeichenketten"), ctx);
vm.runInContext(cut(editorSrc, "function maskStringLiterals(", "\n// Replace bare class names"), ctx);
vm.runInContext(
  "var HtmlSvgEdu = { Text: {} };\n" +
    cut(htmlSrc, "HtmlSvgEdu.Text.colorTags =", "\nHtmlSvgEdu.Preloader"),
  ctx,
);
vm.runInContext(
  "var Timer = class { " + cut(svgSrc, "static _normDuration(duration) {", "\n  constructor(duration") + " };",
  ctx,
);

let passed = 0;
let failed = 0;
function check(name, cond) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.log("FAIL " + name);
  }
}

// 1. masking
const code1 = 'let t = new Text("Timer(0): " + x); let r = new Rectangle(1, 2); // Line(3)\nlet s = \'Calc.format\';';
const m = vm.runInContext("maskStringLiterals(" + JSON.stringify(code1) + ")", ctx);
check("strings masked", m.code.indexOf("Timer(0)") === -1 && m.code.indexOf("Rectangle(") > 0);
check("comment kept", m.code.indexOf("// Line(3)") > 0);
const back = vm.runInContext(
  "unmaskStringLiterals(" + JSON.stringify(m.code.replace("Rectangle(", "SvgJSEdu.Rectangle(")) + ", " + JSON.stringify(m.strings) + ")",
  ctx,
);
check("strings restored", back.indexOf('"Timer(0): "') > 0 && back.indexOf("SvgJSEdu.Rectangle(") > 0 && back.indexOf("'Calc.format'") > 0);
const code2 = "let re = /['\"]/g; let q = \"Line(1)\";";
const m2 = vm.runInContext("maskStringLiterals(" + JSON.stringify(code2) + ")", ctx);
check("regex literal is not a string", m2.strings.length === 1 && m2.strings[0] === '"Line(1)"');

// 2. loop guards
const loops = "let a = 0;\nfor (let i = 0; i < 3; i++) a++;\nwhile (a < 10) { a++; }\ndo { a--; } while (a > 5);";
const guarded = vm.runInContext("addLoopGuards(" + JSON.stringify(loops) + ")", ctx);
check("three guards", (guarded.match(/__oalLoop\(/g) || []).length === 3);
check("same line count", guarded.split("\n").length === loops.split("\n").length);
check("line numbers", guarded.indexOf("__oalLoop(2)") > 0 && guarded.indexOf("__oalLoop(3)") > 0 && guarded.indexOf("__oalLoop(4)") > 0);
const runCtx = { __oalLoop: () => {} };
vm.createContext(runCtx);
vm.runInContext(guarded + "\nthis.result = a;", runCtx);
check("guarded code still runs", runCtx.result === 5);
check("broken code stays", vm.runInContext("addLoopGuards('for (;;')", ctx) === "for (;;");

// 3. colour tags
const ct = (s) => vm.runInContext("HtmlSvgEdu.Text.colorTags(" + JSON.stringify(s) + ")", ctx);
check("span double quotes", ct('<span style="color:#2980b9">■</span> x') === "<c:#2980b9>■</c> x");
check("span single quotes + rgb", ct("<span style='color: rgb(200, 0, 0)'>r</span>") === "<c:rgb(200,0,0)>r</c>");
check("font colour", ct('<font color="red">r</font>') === "<c:red>r</c>");
check("plain text untouched", ct("a < b und <b>fett</b>") === "a < b und <b>fett</b>");

// 4. Timer duration
const nd = (v) => vm.runInContext("Timer._normDuration(" + JSON.stringify(v) + ")", ctx);
check("0 → endless", nd(0) === null);
check("-5 → endless", nd(-5) === null);
check("null → endless", nd(null) === null);
check("'' → endless", nd("") === null);
check("5000 stays", nd(5000) === 5000);
check("'2000' → 2000", nd("2000") === 2000);

console.log(passed + " passed, " + failed + " failed");
if (failed) process.exit(1);
