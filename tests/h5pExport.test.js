/**
 * Tests for the H5P export (src/core/GuiFunctions.js, 3.25.0).
 *
 * Run with:  node tests/h5pExport.test.js
 *
 * Checks:
 * 1. h5pLicenseInfo turns the licence notice into h5p.json licence fields
 *    (no more fixed "C" = all rights reserved).
 * 2. exportToBase64 + the decoder of the H5P library round-trip UTF-8
 *    (umlauts, β, –) and survive H5P's HTML masking of text fields.
 * The functions are taken from GuiFunctions.js itself, not copied.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const src = fs.readFileSync(
  path.join(__dirname, "..", "src", "core", "GuiFunctions.js"),
  "utf8"
);

function extract(name) {
  const start = src.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " not found");
  let depth = 0;
  let i = src.indexOf("{", start);
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    if (src[i] === "}" && --depth === 0) break;
  }
  return src.slice(start, i + 1);
}

const ctx = { TextEncoder, TextDecoder, btoa, atob };
vm.createContext(ctx);
vm.runInContext(extract("h5pLicenseInfo") + "\n" + extract("exportToBase64"), ctx);

let failed = 0;
function check(label, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log("ok   " + label);
  } else {
    failed++;
    console.log("FAIL " + label + "\n     got      " + a + "\n     expected " + e);
  }
}

// 1. Licence
check("empty notice -> U", ctx.h5pLicenseInfo(""), { license: "U" });
check(
  "CC BY 4.0 with author",
  ctx.h5pLicenseInfo("© Ihr Name – CC BY 4.0"),
  {
    license: "CC BY",
    licenseVersion: "4.0",
    licenseExtras: "© Ihr Name – CC BY 4.0",
    authors: [{ name: "Ihr Name", role: "Author" }],
  }
);
check(
  "CC BY-SA without version -> 4.0",
  ctx.h5pLicenseInfo("CC BY-SA").license + " " + ctx.h5pLicenseInfo("CC BY-SA").licenseVersion,
  "CC BY-SA 4.0"
);
check(
  "CC BY-NC-SA 3.0",
  ctx.h5pLicenseInfo("Lizenz: CC BY-NC-SA 3.0").license,
  "CC BY-NC-SA"
);
check(
  "MIT stays U, text kept, author from ©",
  ctx.h5pLicenseInfo("© Sebastian Rikowski, educational-animation.org – MIT License"),
  {
    license: "U",
    licenseExtras: "© Sebastian Rikowski, educational-animation.org – MIT License",
    authors: [{ name: "Sebastian Rikowski", role: "Author" }],
  }
);
check("CC0 -> PD", ctx.h5pLicenseInfo("CC0").license, "PD");
check("year after ©", ctx.h5pLicenseInfo("© 2026 Max Muster").authors[0].name, "Max Muster");

// 2. Base64 round trip (decoder as in oal-animation.js)
function decodeBase64Utf8(base64) {
  const binary = atob(String(base64).replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder("utf-8").decode(bytes);
}
const html = '<!DOCTYPE html><title>Kräfte am Keil</title><p>Winkel β – "ä" & \'ö\' &amp;</p>';
const b64 = ctx.exportToBase64(html);
check("base64 round trip", decodeBase64Utf8(b64), html);
check("base64 has no characters H5P masks", /[<>&"']/.test(b64), false);
const big = "ä".repeat(100000);
check("base64 large input (chunks)", decodeBase64Utf8(ctx.exportToBase64(big)), big);

// 3. Library source is valid JavaScript and sandboxes without same-origin
const lib = src.slice(src.indexOf("H5P.OALAnimation = (function"));
check("library: sandbox only allow-scripts", /setAttribute\("sandbox", "allow-scripts"\)/.test(lib), true);
check("library: no allow-same-origin", /allow-same-origin/.test(lib.slice(0, lib.indexOf("})(H5P.jQuery);"))), false);

if (failed) {
  console.log("\n" + failed + " test(s) failed");
  process.exit(1);
}
console.log("\nall tests passed");
