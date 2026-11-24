// Builds the compact reference for AI assistants: reference-de.txt and reference-en.txt
// (Markdown in a .txt file, so every server and every AI tool reads it as plain text).
// Source: the serializationMap of each class in the SVG renderer (default) and
// HtmlSvgEdu – the same data as the online reference, without the mouse methods
// repeated in every class.
// Usage (needs the OAL loaded in a browser page):  node tests/build-quick-reference.js
// The script is run with Playwright from the cloud test set-up; in a browser
// console you can also call buildQuickReference("de") after pasting the function.

function buildQuickReference(lang) {
  const L = lang === "de" ? "de" : "en";
  const T = {
    de: {
      title: "# Open Animation Lab – Kurzreferenz für KI-Assistenten",
      version: "Version",
      intro: [
        "Alle Befehle des Open Animation Lab (OAL) in Kurzform. Das OAL ist ein kostenloser JavaScript-Editor im Browser: https://www.educational-animation.org/oal/ – ausführliche Referenz: https://www.educational-animation.org/de/referenz-fuer-den-editor/",
        "Benutze nur Befehle, die hier stehen. Klassen werden ohne Namensraum geschrieben: new Rectangle(…), new Text(…).",
      ],
      rulesTitle: "## Regeln",
      rules: [
        "Jede Animation beginnt mit `let board = new Board(1280, 720);`. Koordinaten in Pixeln, (0 | 0) ist oben links, y wächst nach unten. Winkel in Grad, positive Drehung im Uhrzeigersinn.",
        "Bezugspunkte: Rectangle = Ecke oben links; Circle, Ellipse, Polygon, Arc = Mitte; Line, Arrow, LinePath = die angegebenen Punkte.",
        "Grafiken liegen in der Reihenfolge übereinander, in der sie erzeugt werden. Bedienelemente (Text, Button, ButtonSlider, Checkbox, RadioButton, NumericStepper, Dropdown, MathForm, ParameterTable, Model3D, HtmlRectangle, PlayButton) liegen immer über allen Grafiken, lassen sich nicht drehen und nicht in eine Group packen.",
        "Text: (x, y) ist die linke obere Ecke eines Kastens mit 10 px Innenabstand. Formatierung: <b>, <i>, <sub>, <sup>, Farbe mit <span style=\"color:#c0392b\">…</span>. Zeilenwechsel mit \\n oder <br>.",
        "Keine Backslashes außer \\n (sie werden vor dem Ausführen verdoppelt). Umlaute und Sonderzeichen direkt schreiben. In MathForm (LaTeX) nur ein Backslash.",
        "Gesperrt, auch als Namen: window, document, fetch, eval, globalThis. Eigene Namen nie wie Klassen (Line, Text, Group, Timer …).",
        "Ereignisse: Regler, Checkbox, RadioButton, NumericStepper und PlayButton melden Änderungen mit onChange(e => …), der neue Wert ist e.value. setValue() löst kein onChange aus. Maus auf der ganzen Fläche: board.onMouseMove(e => …) mit e.x und e.y; Tastatur: board.onKeyDown(e => …) mit e.key.",
        "Bewegung: `let timer = new Timer(); timer.onUpdate(() => { … }); timer.start();` – ohne Dauer läuft der Timer endlos, timer.getElapsedTime() liefert die Zeit in ms.",
        "Zahlen mit Komma: Calc.format(zahl, stellen, \"Einheit\"). Regler und Zahlenfelder zeigen in deutschen Animationen automatisch ein Komma.",
        "Schreibe `// lang: de` oder `// lang: en` in die erste Zeile.",
      ],
      commonTitle: "## Für fast alle Grafiken",
      common:
        "Eigenschaften x, y, rotation, visible. Methoden: setAlpha(0.5), setScale(1.5, 1.5), setRotationPoint(x, y), onClick(f), onMouseDown(f), onMouseUp(f), onMouseOver(f), onMouseOut(f), setDragging(x1, y1, x2, y2), onDragStart(f), onDrag(f), onDragEnd(f). Bedienelemente haben x, y, visible und setTooltip(\"…\").",
      graphics: "## Grafiken",
      components: "## Bedienelemente und Helfer",
      params: "Parameter",
      props: "Eigenschaften",
      methods: "Methoden",
    },
    en: {
      title: "# Open Animation Lab – quick reference for AI assistants",
      version: "Version",
      intro: [
        "All commands of the Open Animation Lab (OAL) in short form. The OAL is a free JavaScript editor in the browser: https://www.educational-animation.org/oal/ – full reference: https://www.educational-animation.org/en/editor-reference/",
        "Only use commands listed here. Classes are written without a namespace: new Rectangle(…), new Text(…).",
      ],
      rulesTitle: "## Rules",
      rules: [
        "Every animation starts with `let board = new Board(1280, 720);`. Coordinates in pixels, (0 | 0) is top left, y grows downwards. Angles in degrees, positive rotation is clockwise.",
        "Reference points: Rectangle = top-left corner; Circle, Ellipse, Polygon, Arc = centre; Line, Arrow, LinePath = the given points.",
        "Graphics stack in the order they are created. UI components (Text, Button, ButtonSlider, Checkbox, RadioButton, NumericStepper, Dropdown, MathForm, ParameterTable, Model3D, HtmlRectangle, PlayButton) always lie above all graphics, cannot be rotated and cannot be put into a Group.",
        "Text: (x, y) is the top-left corner of a box with 10 px padding. Formatting: <b>, <i>, <sub>, <sup>, colour with <span style=\"color:#c0392b\">…</span>. Line break with \\n or <br>.",
        "No backslashes except \\n (they are doubled before the code runs). Write special characters directly. In MathForm (LaTeX) use a single backslash.",
        "Blocked, also as names: window, document, fetch, eval, globalThis. Never name your own variables like classes (Line, Text, Group, Timer …).",
        "Events: sliders, Checkbox, RadioButton, NumericStepper and PlayButton report changes with onChange(e => …), the new value is e.value. setValue() does not fire onChange. Mouse anywhere on the board: board.onMouseMove(e => …) with e.x and e.y; keyboard: board.onKeyDown(e => …) with e.key.",
        "Motion: `let timer = new Timer(); timer.onUpdate(() => { … }); timer.start();` – without a duration the timer runs endlessly, timer.getElapsedTime() gives the time in ms.",
        "Numbers: Calc.format(number, digits, \"unit\"). Sliders and number fields show a decimal point in English and a comma in German animations automatically.",
        "Write `// lang: en` or `// lang: de` in the first line.",
      ],
      commonTitle: "## For almost all graphics",
      common:
        "Properties x, y, rotation, visible. Methods: setAlpha(0.5), setScale(1.5, 1.5), setRotationPoint(x, y), onClick(f), onMouseDown(f), onMouseUp(f), onMouseOver(f), onMouseOut(f), setDragging(x1, y1, x2, y2), onDragStart(f), onDrag(f), onDragEnd(f). UI components have x, y, visible and setTooltip(\"…\").",
      graphics: "## Graphics",
      components: "## UI components and helpers",
      params: "Parameters",
      props: "Properties",
      methods: "Methods",
    },
  }[L];

  const COMMON = new Set([
    "onClick", "onMouseDown", "onMouseUp", "onMouseOver", "onMouseOut", "setDragging",
    "onDragStart", "onDrag", "onDragEnd", "setTooltip", "setAlpha", "setScale",
    "setRotationPoint", "setTransformationPoint", "info", "position",
  ]);
  const SIMPLE_PROPS = new Set(["x", "y", "rotation", "visible", "alpha"]);
  const GRAPHICS = ["Group", "Rectangle", "Circle", "Ellipse", "Polygon", "Line", "Arrow", "LinePath",
    "BezierPath", "SplinePath", "Arc", "Spring", "Parallelogram", "PointLabel", "LineLabel", "AngleLabel",
    "LengthLabel", "Ruler", "CoordinateSystem", "Plot", "SimpleSVG", "SimplePNG", "Timer"];
  const COMPONENTS = ["Text", "Button", "PlayButton", "ButtonSlider", "Checkbox", "RadioButton",
    "NumericStepper", "Dropdown", "MathForm", "ParameterTable", "HtmlRectangle", "Model3D", "SimpleMP3", "Calc"];

  const info = (o) => (o && o.info ? (o.info[L] || o.info.en || "") : "");
  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
  function shortExample(ex) {
    let e = String(ex || "").trim();
    if (e.indexOf("\n") >= 0) e = e.split("\n")[0].trim();
    e = e.replace(/;\s*$/, "").replace(/\s*\/\/.*$/, "");
    return e;
  }

  function block(name, C, isBoard) {
    const map = C && C.serializationMap;
    if (!map) return "";
    const out = [];
    const desc = clean(map.description && (map.description[L] || map.description.en));
    out.push("### " + name + (desc ? " – " + desc : ""));
    if (map.example) out.push("`" + clean(map.example) + "`");
    const ctor = map.constructor && typeof map.constructor === "object" && !Array.isArray(map.constructor) && map.constructor !== Object ? map.constructor : null;
    if (ctor) {
      const ps = Object.keys(ctor).map((k) => {
        const i = clean(info(ctor[k]));
        return k + (i ? " (" + i + ")" : "");
      });
      if (ps.length) out.push(T.params + ": " + ps.join("; "));
    }
    const setters = map.setter || {};
    const props = Object.keys(setters);
    if (props.length) {
      const simple = props.filter((p) => SIMPLE_PROPS.has(p));
      const special = props.filter((p) => !SIMPLE_PROPS.has(p));
      const parts = simple.slice();
      special.forEach((p) => {
        const i = clean(info(setters[p]));
        parts.push(p + (i ? " (" + i + ")" : ""));
      });
      out.push(T.props + ": " + parts.join("; "));
    }
    const methods = map.methods || {};
    const ms = Object.keys(methods).filter((m) => isBoard || name === "Calc" || !COMMON.has(m));
    if (ms.length) {
      out.push(T.methods + ":");
      ms.forEach((m) => {
        const ex = shortExample(methods[m].example) || m + "()";
        const call = name === "Calc" || /^Calc\./.test(ex) ? ex.replace(/^(objektname\.)?/, "") : (isBoard ? "board." : "obj.") + ex.replace(/^\w+\./, "");
        const i = clean(info(methods[m]));
        out.push("- `" + call + "`" + (i ? " – " + i : ""));
      });
    }
    return out.join("\n");
  }

  const ver = (document.title.match(/\d+\.\d+\.\d+/) || [""])[0] ||
    ((document.querySelector("[data-version]") || {}).textContent || "");
  const parts = [T.title, "", T.version + " " + (window.OAL_VERSION || ver || ""), ""];
  T.intro.forEach((p) => parts.push(p, ""));
  parts.push(T.rulesTitle, "");
  T.rules.forEach((r) => parts.push("- " + r));
  parts.push("", T.commonTitle, "", T.common, "", T.graphics, "");
  parts.push(block("Board", typeof BoardSVG !== "undefined" ? BoardSVG : null, true), "");
  GRAPHICS.forEach((n) => {
    const C = SvgJSEdu[n];
    const b = block(n, C, false);
    if (b) parts.push(b, "");
  });
  parts.push(T.components, "");
  COMPONENTS.forEach((n) => {
    const C = HtmlSvgEdu[n];
    const b = block(n, C, false);
    if (b) parts.push(b, "");
  });
  return parts.join("\n").replace(/\n{3,}/g, "\n\n");
}

if (typeof module !== "undefined") module.exports = { buildQuickReference };
