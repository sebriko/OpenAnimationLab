/**
 * Tests for the classes added in v3.27.0: Calc, PlayButton (HtmlSvgEdu.js),
 * Spring and Arc geometry (SvgJSEdu.js / PixiJSEdu.js) and the editor
 * replacer (CodeEditor.js).
 *
 * Run with:  node tests/newClasses.test.js
 *
 * Checks: number formatting in German and English, helper functions, the
 * PlayButton controlling a timer, identical spring and arc geometry in both
 * renderers, and that the replacer qualifies the new classes only after
 * "new" (so comments like "// Spring (damped)" in older animations stay
 * unchanged) and Calc only before a dot.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

let passed = 0;
let failed = 0;
function check(name, condition) {
  if (condition) passed++;
  else {
    failed++;
    console.log("FAIL: " + name);
  }
}

// ---------- fake browser ----------
const stubElement = () => {
  const el = {
    style: {},
    classList: { add() {}, remove() {}, toggle() {} },
    appendChild() {},
    setAttribute() {},
    addEventListener(type, fn) {
      (el._listeners[type] = el._listeners[type] || []).push(fn);
    },
    dispatchEvent() {},
    _listeners: {},
    isConnected: true,
    textContent: "",
  };
  return el;
};
const htmlLang = { lang: "de" };
const ctx = {
  console,
  INSTANCE_KEY: "__instance",
  Board: { __instance: { addChild() {} } },
  navigator: { userAgent: "node" },
  requestAnimationFrame: () => 0,
  CustomEvent: class {
    constructor(type, init) {
      this.type = type;
      this.detail = init && init.detail;
    }
  },
  window: {},
  document: {
    documentElement: htmlLang,
    getElementById: () => stubElement(),
    querySelector: () => null,
    createElement: () => stubElement(),
    head: stubElement(),
    body: stubElement(),
  },
};
vm.createContext(ctx);
vm.runInContext(read("src/core/HtmlSvgEdu.js") + "\nthis.HtmlSvgEdu = HtmlSvgEdu;", ctx);
const { Calc, PlayButton, Component } = ctx.HtmlSvgEdu;

// ---------- Calc.format ----------
Calc._autoLang = "de";
check("de: comma", Calc.format(3.14159, 2) === "3,14");
check("de: unit with no-break space", Calc.format(9.81, 2, "m/s²") === "9,81\u00a0m/s²");
check("de: real minus", Calc.format(-2.5, 1) === "\u22122,5");
check("de: -0 without sign", Calc.format(-0.004, 2) === "0,00");
check("de: percent with space", Calc.format(37, 0, "%") === "37\u00a0%");
check("de: degree without space", Calc.format(30, 0, "°") === "30°");
check("de: degree Celsius with space", Calc.format(20, 1, "°C") === "20,0\u00a0°C");
check("not finite", Calc.format(NaN) === "\u2013");
check("default 2 digits", Calc.format(1) === "1,00");
Calc._autoLang = "en";
check("en: point", Calc.format(3.14159, 2) === "3.14");
check("en: percent without space", Calc.format(37, 0, "%") === "37%");
Calc.setLanguage("de");
check("setLanguage wins", Calc.format(1.5, 1) === "1,5" && Calc.getLanguage() === "de");
Calc.setLanguage(null);
Calc._autoLang = null;
htmlLang.lang = "en-GB";
check("html lang as fallback", Calc.getLanguage() === "en");
htmlLang.lang = "de";

// ---------- Calc helpers ----------
check("round", Calc.round(2.346, 2) === 2.35);
check("clamp", Calc.clamp(5, 0, 3) === 3 && Calc.clamp(-1, 0, 3) === 0 && Calc.clamp(5, 10, 0) === 5);
check("lerp", Calc.lerp(100, 300, 0.5) === 200);
check("map", Calc.map(5, 0, 10, 600, 100) === 350 && Calc.map(1, 1, 1, 7, 9) === 7);
check("rad/deg", Math.abs(Calc.rad(180) - Math.PI) < 1e-12 && Math.abs(Calc.deg(Math.PI) - 180) < 1e-12);
check("mixColor", Calc.mixColor(0x000000, 0xffffff, 0.5) === 0x808080 && Calc.mixColor(0xff0000, 0x0000ff, 0) === 0xff0000);
check("Calc has serializationMap", !!Calc.serializationMap && !!Calc.serializationMap.methods.format);

// ---------- PlayButton ----------
class FakeTimer {
  constructor() {
    this.running = false;
    this.paused = false;
  }
  start() {
    this.running = true;
    this.paused = false;
  }
  pause() {
    if (this.running) this.paused = true;
  }
  resume() {
    this.paused = false;
  }
  isRunning() {
    return this.running;
  }
  isPaused() {
    return this.paused;
  }
}
Calc._autoLang = "de";
const timer = new FakeTimer();
const button = new PlayButton(timer);
const label = () => button._element.textContent;
const click = () => button._element._listeners.click.forEach((fn) => fn({}));
check("PlayButton is a Component", button instanceof Component);
check("PlayButton starts paused", !button.isPlaying() && label().includes("Start"));
const events = [];
button.onChange((e) => events.push(e.value));
click();
check("click starts timer", timer.isRunning() && !timer.isPaused() && button.isPlaying());
check("label shows pause", label().includes("Pause"));
click();
check("second click pauses", timer.isPaused() && !button.isPlaying() && label().includes("Start"));
click();
check("third click resumes", !timer.isPaused() && button.isPlaying());
check("onChange values", events.join(",") === "true,false,true");
button.setPlaying(false);
check("setPlaying does not call onChange", events.length === 3 && timer.isPaused());
button.setLabels("Los", "Halt");
check("setLabels", label() === "Los");
Calc._autoLang = "en";
const enButton = new PlayButton(null);
check("English label", enButton._element.textContent.includes("Play"));
enButton._element._listeners.click.forEach((fn) => fn({}));
check("without timer it toggles", enButton.isPlaying());

// ---------- Spring and Arc geometry: identical in both renderers ----------
function loadNamespace(file, name, prelude) {
  const c = {
    console,
    requestAnimationFrame: () => 0,
    document: ctx.document,
    window: {},
    PIXI: { Container: class {}, Graphics: { prototype: {} } },
  };
  vm.createContext(c);
  let src = read(file);
  src = src.replace(/^const SvgJSEdu = \{\};/m, "var SvgJSEdu = {};");
  vm.runInContext((prelude || "") + src + "\nthis.NS = " + name + ";", c);
  return c.NS;
}
const Svg = loadNamespace("src/core/SvgJSEdu.js", "SvgJSEdu", "var svgRoot = null;");
const Pixi = loadNamespace("src/core/PixiJSEdu.js", "PixiJSEdu", "class PixiJSElementStub {}\n");
const springA = Svg.Spring._points(100, 100, 100, 400, 8, 30, 12);
const springB = Pixi.Spring._points(100, 100, 100, 400, 8, 30, 12);
check("spring: same points", JSON.stringify(springA) === JSON.stringify(springB));
check("spring: 2 * coils + 4 points", springA.length === 20);
check("spring: ends exact", springA[0][1] === 100 && springA[springA.length - 1][1] === 400);
check("spring: width", Math.abs(Math.max(...springA.map((p) => p[0])) - 115) < 1e-9);
const arcA = Svg.Arc._geometry(100, 0, -90, 90, true, true, 0, 2);
const arcB = Pixi.Arc._geometry(100, 0, -90, 90, true, true, 0, 2);
check("arc: same geometry", JSON.stringify(arcA) === JSON.stringify(arcB));
check("arc: arrow tip at end angle", Math.abs(arcA.arrow[0][0]) < 1e-9 && Math.abs(arcA.arrow[0][1] - 100) < 1e-9);
check("arc: pie slice starts at centre", arcA.outline[0][0] === 0 && arcA.outline[0][1] === 0);
const ring = Svg.Arc._geometry(100, 60, 0, 360, true, false, 0, 1);
check("arc: full ring has inner outline", ring.full && ring.inner && ring.inner.length > 10);
check("Plot ticks decimals", Svg.Plot._decimals(0.25) === 2 && Svg.Plot._decimals(5) === 0 && Pixi.Plot._decimals(0.5) === 1);

// ---------- replacer ----------
const editorSrc = read("src/core/CodeEditor.js");
const start = editorSrc.indexOf("// Klassen ab 3.27.0");
const end = editorSrc.indexOf("// Copy selected text to clipboard");
const rctx = {
  getActiveRendererType: () => "svg",
  getActiveGraphicsNamespace: () => Svg,
  SvgJSEdu: Svg,
  HtmlSvgEdu: ctx.HtmlSvgEdu,
};
vm.createContext(rctx);
vm.runInContext(editorSrc.slice(start, end) + "\nthis.replacer = replacer;", rctx);
const out = rctx.replacer(
  [
    "// Spring (damped) and Arc (start)",
    "let s = new Spring(1, 2, 3, 4);",
    "let p = new  Plot (1, 2);",
    "let a = new Arc(10, 0, 90);",
    "let b = new PlayButton(timer);",
    "let t = Calc.format(1);",
    "let u = myCalc.format;",
    "let v = obj.Calc.x;",
    "let c = new Circle(5);",
  ].join("\n"),
).split("\n");
check("replacer: comment unchanged", out[0] === "// Spring (damped) and Arc (start)");
check("replacer: Spring", out[1] === "let s = new SvgJSEdu.Spring(1, 2, 3, 4);");
check("replacer: Plot with spaces", out[2] === "let p = new  SvgJSEdu.Plot (1, 2);");
check("replacer: Arc", out[3] === "let a = new SvgJSEdu.Arc(10, 0, 90);");
check("replacer: PlayButton", out[4] === "let b = new HtmlSvgEdu.PlayButton(timer);");
check("replacer: Calc", out[5] === "let t = HtmlSvgEdu.Calc.format(1);");
check("replacer: myCalc unchanged", out[6] === "let u = myCalc.format;");
check("replacer: obj.Calc unchanged", out[7] === "let v = obj.Calc.x;");
check("replacer: old classes as before", out[8] === "let c = new SvgJSEdu.Circle(5);");

console.log(`${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
