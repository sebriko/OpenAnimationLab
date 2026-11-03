/**
 * Tests for SimpleMP3 (src/core/HtmlSvgEdu.js), E-012, v3.21.0.
 *
 * Run with:  node tests/simpleMP3.test.js
 *
 * Uses a fake Audio element (no sound in Node). Checks: playing, restart,
 * stop, value limits, onEnded, hints in the message window (no sound chosen,
 * autoplay blocked, large file), cleanup by the Board, cleanup when the
 * editor tab is closed (destroyForTab) and that SimpleMP3 is a Component
 * (so the editor qualifies it as HtmlSvgEdu.SimpleMP3).
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const messages = [];

// ---------- fake browser ----------
const stubElement = () => ({
  style: {},
  classList: { add() {} },
  appendChild() {},
  setAttribute() {},
  addEventListener() {},
});

let blockAutoplay = false;
class FakeAudio {
  constructor() {
    this.paused = true;
    this.ended = false;
    this.currentTime = 0;
    this.duration = NaN;
    this.volume = 1;
    this.loop = false;
    this.muted = false;
    this.playbackRate = 1;
    this.src = "";
    this._listeners = {};
    FakeAudio.all.push(this);
  }
  addEventListener(type, fn) {
    (this._listeners[type] = this._listeners[type] || []).push(fn);
  }
  _fire(type) {
    (this._listeners[type] || []).forEach((fn) => fn());
  }
  play() {
    if (blockAutoplay) {
      const err = new Error("blocked");
      err.name = "NotAllowedError";
      return Promise.reject(err);
    }
    this.paused = false;
    this.ended = false;
    this.playCount = (this.playCount || 0) + 1;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  removeAttribute(name) {
    if (name === "src") this.src = "";
  }
  load() {
    this.loaded = true;
  }
}
FakeAudio.all = [];

const boardChildren = [];
let activeTab = "Tab 1";
const ctx = {
  console,
  Audio: FakeAudio,
  INSTANCE_KEY: "__instance",
  Board: { __instance: { addChild: (c) => boardChildren.push(c) } },
  navigator: { userAgent: "node" },
  window: {
    logEvalMessage: (msg, type) => messages.push({ msg, type }),
    i18n: { getCurrentLanguage: () => "de" },
  },
  document: {
    documentElement: { lang: "de" },
    getElementById: () => stubElement(),
    querySelector: (sel) =>
      sel === ".tab.active" && activeTab
        ? { getAttribute: () => activeTab }
        : null,
    createElement: () => stubElement(),
    head: stubElement(),
    body: stubElement(),
  },
};
vm.createContext(ctx);
vm.runInContext(
  fs.readFileSync(path.join(root, "src/core/HtmlSvgEdu.js"), "utf8") +
    "\nthis.HtmlSvgEdu = HtmlSvgEdu;",
  ctx,
);
const SimpleMP3 = ctx.HtmlSvgEdu.SimpleMP3;

let passed = 0;
let failed = 0;
function check(name, condition) {
  if (condition) passed++;
  else {
    failed++;
    console.log("FAIL: " + name);
  }
}
const tick = () => new Promise((r) => setTimeout(r, 0));
const SMALL = "data:audio/mpeg;base64," + "A".repeat(4000);

(async () => {
  // Component → the editor's replacer qualifies it with HtmlSvgEdu.
  check("is a Component", SimpleMP3.prototype instanceof ctx.HtmlSvgEdu.Component);
  check("has serializationMap", !!SimpleMP3.serializationMap.constructor.mp3Content);

  // Info texts must not contain { } or ' (reference plugin, Unterweisung 7)
  const map = SimpleMP3.serializationMap;
  const infos = [map.description.de, map.description.en];
  ["constructor", "setter", "methods"].forEach((group) =>
    Object.values(map[group]).forEach((e) => infos.push(e.info.de, e.info.en)),
  );
  check("info texts without { } '", infos.every((t) => !/[{}']/.test(t)));

  // Empty source: no error, one hint, nothing plays
  messages.length = 0;
  const empty = new SimpleMP3("");
  empty.play();
  empty.play();
  check("empty: not playing", empty.isPlaying() === false);
  check("empty: one hint", messages.length === 1 && /grüne i/.test(messages[0].msg));
  check("empty: duration 0", empty.getDuration() === 0);

  // Normal sound
  messages.length = 0;
  const s = new SimpleMP3(SMALL);
  const a = FakeAudio.all[FakeAudio.all.length - 1];
  check("source set", a.src === SMALL);
  check("pitch follows speed", a.preservesPitch === false);
  check("no hint for small file", messages.length === 0);
  check("registered with board", boardChildren.includes(s));

  s.play();
  check("play", s.isPlaying() && a.playCount === 1);
  a.currentTime = 0.4;
  s.pause();
  check("pause keeps position", !s.isPlaying() && a.currentTime === 0.4);
  s.play();
  check("play continues", a.currentTime === 0.4);
  s.restart();
  check("restart from beginning", a.currentTime === 0 && a.playCount === 3);
  a.currentTime = 0.7;
  s.stop();
  check("stop", !s.isPlaying() && a.currentTime === 0);

  // play() after the end starts again from the beginning
  a.currentTime = 0.9;
  a.ended = true;
  a.paused = true;
  s.play();
  check("play after end", a.currentTime === 0 && s.isPlaying());

  // Properties and limits
  s.volume = 3;
  check("volume max 1", s.volume === 1 && a.volume === 1);
  s.volume = -2;
  check("volume min 0", s.volume === 0);
  s.volume = 0.5;
  check("volume 0.5", a.volume === 0.5);
  s.loop = true;
  check("loop", a.loop === true && s.loop === true);
  s.playbackRate = 10;
  check("playbackRate max 4", a.playbackRate === 4);
  s.playbackRate = 0;
  check("playbackRate invalid → 1", a.playbackRate === 1);
  s.playbackRate = 1.5;
  check("playbackRate 1.5", a.playbackRate === 1.5);
  s.currentTime = 0.25;
  check("currentTime", s.currentTime === 0.25);
  s.muted = true;
  check("muted", a.muted === true);
  s.muted = false;
  s.visible = false;
  check("visible false mutes", a.muted === true);
  s.visible = true;
  check("visible true unmutes", a.muted === false);
  a.duration = 0.94;
  check("getDuration", s.getDuration() === 0.94);

  // onEnded
  let endedCalls = 0;
  s.onEnded(() => endedCalls++);
  a._fire("ended");
  check("onEnded", endedCalls === 1);

  // Autoplay blocked → one hint, no exception
  messages.length = 0;
  blockAutoplay = true;
  const b = new SimpleMP3(SMALL);
  b.play();
  b.play();
  await tick();
  check("autoplay hint once", messages.length === 1 && /Klick/.test(messages[0].msg));
  blockAutoplay = false;

  // Large file → hint
  messages.length = 0;
  new SimpleMP3("data:audio/mpeg;base64," + "A".repeat(500 * 1024));
  check("large file hint", messages.length === 1 && /KB/.test(messages[0].msg));

  // Cleanup (Board.destroy calls destroy, Pixi passes options)
  s.play();
  s.destroy({ children: true });
  check("destroy stops and releases", a.paused && a.src === "" && a.loaded);
  check("destroy removes instance", !SimpleMP3._instances.has(s));
  s.play();
  check("play after destroy is harmless", true);
  s.destroy();

  // stopAll
  const c = new SimpleMP3(SMALL);
  c.play();
  SimpleMP3.stopAll();
  check("stopAll", !c.isPlaying());

  // Closing an editor tab ends only the sounds started in that tab
  activeTab = "Tab 1";
  const t1 = new SimpleMP3(SMALL);
  const a1 = FakeAudio.all[FakeAudio.all.length - 1];
  activeTab = "Tab 2";
  const t2 = new SimpleMP3(SMALL);
  t1.play();
  t2.play();
  SimpleMP3.destroyForTab("Tab 1");
  check("closed tab: sound ends", a1.paused && a1.src === "" && !SimpleMP3._instances.has(t1));
  check("other tab: sound continues", t2.isPlaying() && SimpleMP3._instances.has(t2));
  SimpleMP3.destroyForTab("Tab 2");
  check("second tab closed", !t2.isPlaying());
  activeTab = null;
  const t3 = new SimpleMP3(SMALL);
  check("no tab (export): tab name null", t3._tabName === null);

  // English hints
  ctx.window.i18n.getCurrentLanguage = () => "en";
  messages.length = 0;
  new SimpleMP3("").play();
  check("english hint", /green i/.test(messages[0] && messages[0].msg));

  console.log(passed + " passed, " + failed + " failed");
  process.exit(failed ? 1 : 0);
})();
