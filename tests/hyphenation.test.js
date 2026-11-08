/**
 * Regression tests for the hyphenation of Text (HtmlSvgEdu.Hyphenator,
 * src/core/HtmlSvgEdu.js, K-015, v3.23.0).
 *
 * Run with:  node tests/hyphenation.test.js
 *
 * Loads the Hyphenator object from HtmlSvgEdu.js and the pattern files from
 * lib/hyph-utf8/ and checks the break points of typical words.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "src/core/HtmlSvgEdu.js"), "utf8");
const start = src.indexOf("HtmlSvgEdu.Hyphenator = {");
const end = src.indexOf("\n};", start);
if (start < 0 || end < 0) throw new Error("Hyphenator not found in HtmlSvgEdu.js");

const sandbox = { console };
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext("var HtmlSvgEdu = {};\n" + src.substring(start, end + 3), sandbox);
for (const file of ["de", "en-gb"]) {
  const p = path.join(root, sandbox.HtmlSvgEdu.Hyphenator.PATH, file + ".js");
  vm.runInContext(fs.readFileSync(p, "utf8"), sandbox);
}
const H = sandbox.HtmlSvgEdu.Hyphenator;

function show(word, lang) {
  const pts = H.hyphenate(word, H.fileFor(lang));
  let out = "";
  let last = 0;
  for (const k of pts) {
    out += word.substring(last, k) + "-";
    last = k;
  }
  return out + word.substring(last);
}

const cases = [
  // Fehlerbeispiele aus K-015
  ["farbigen", "de", "far-bi-gen"],
  ["Lehrmodell", "de", "Lehr-mo-dell"],
  ["schickt", "de", "schickt"],
  // typische Wörter der Website
  ["Animationen", "de", "Ani-ma-tio-nen"],
  ["Wasserkraftwerk", "de", "Was-ser-kraft-werk"],
  ["Schwingungsdauer", "de", "Schwin-gungs-dau-er"],
  ["Geschwindigkeit", "de", "Ge-schwin-dig-keit"],
  ["Beschleunigung", "de", "Be-schleu-ni-gung"],
  ["Zucker", "de", "Zu-cker"],
  ["Straße", "de", "Stra-ße"],
  ["Hebebühne", "de", "He-be-büh-ne"],
  // Bindestriche, Satzzeichen, kurze Wörter
  ["Feder-Masse-Schwinger", "de", "Fe-der-Mas-se-Schwin-ger"],
  ["(Lehrmodell),", "de", "(Lehr-mo-dell),"],
  ["Auge", "de", "Auge"],
  // Sprachkürzel
  ["Lehrmodell", "de-AT", "Lehr-mo-dell"],
  ["Lehrmodell", "fr", "Lehrmodell"],
  // British English (rechts mindestens 3 Buchstaben)
  ["acceleration", "en", "ac-cel-er-a-tion"],
  ["pendulum", "en", "pen-du-lum"],
  ["behaviour", "en", "be-ha-viour"],
  ["university", "en-GB", "uni-ver-sity"],
  ["however", "en-US", "how-ever"],
];

let failed = 0;
for (const [word, lang, expected] of cases) {
  const got = show(word, lang);
  if (got !== expected) {
    failed++;
    console.log(`FAIL  ${word} (${lang}): expected ${expected}, got ${got}`);
  }
}
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
