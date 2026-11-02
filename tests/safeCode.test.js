/**
 * Tests for isSafe / findBlockedWord (src/safeCode.js), E-008.
 *
 * Run with:  node tests/safeCode.test.js
 *
 * Blocked words must be reported with word and line; harmless code must pass;
 * blocked words inside strings or comments must not count.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const messages = [];
const ctx = {
  window: {
    logEvalMessage: (msg, type, line) => messages.push({ msg, type, line }),
  },
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "lib/acorn/8.8.2/acorn.min.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(root, "src/safeCode.js"), "utf8") +
  "\nthis.isSafe = isSafe;", ctx);

let passed = 0;
let failed = 0;
function check(name, code, expectSafe, expectWord, expectLine) {
  messages.length = 0;
  const safe = ctx.isSafe(code);
  let ok = safe === expectSafe;
  if (ok && !expectSafe && expectWord) {
    const m = messages[0];
    ok = !!m && m.type === "error" && m.msg.indexOf(expectWord) >= 0 && m.line === expectLine;
  }
  if (ok && expectSafe) ok = messages.length === 0;
  if (ok) passed++;
  else {
    failed++;
    console.log("FAIL:", name, safe, JSON.stringify(messages));
  }
}

check("harmless code", "let board = new Board(1280, 720);\nlet c = new Circle(5);", true);
check("window as identifier", "let a = 1;\n\nwindow.addEventListener('x', f);", false, "window", 3);
check("document as identifier", "let d = document;", false, "document", 1);
check("property name", "let o = {};\nlet x = o.global;", false, "global", 2);
check("computed property", "let o = {};\nlet x = o['document'];", false, "document", 2);
check("new Function", "\nlet f = new Function('return 1');", false, "Function", 2);
check("fetch call", "let a = 1;\nlet b = 2;\nfetch('x');", false, "fetch", 3);
check("dynamic import", "import('x');", false, "import", 1);
check("word in string", "let s = 'window document fetch';", true);
check("word in comment", "// window.addEventListener\nlet a = 1;", true);
check("similar name", "let windowWidth = 3;\nlet myDocument = 4;", true);
check("syntax error", "let = ;", false);
messages.length = 0;
ctx.isSafe("let a = window;");
if (messages[0] && messages[0].msg.indexOf("eval, Function") >= 0) passed++;
else { failed++; console.log("FAIL: list of blocked words missing"); }

console.log(passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
