// Share and AI help (v4.3.0, prompt and quick reference v4.4.0)
//
// 1. "Share" window
//    A: copy a link that contains the code itself (compressed, after "#").
//       Nothing is stored on a server; the part after "#" is never sent to
//       the server either.
//    B: submit to educational-animation.org: copies the link and opens the
//       submission form in a new tab.
//    Opening a shared link loads the code into the editor but does NOT run
//    it – the user looks at it first and starts it with the play button.
//
// 2. "Build with AI" window
//    The user describes an idea; the button copies a complete request for
//    any AI assistant: idea, rules of the Lab, link to the reference and –
//    optionally – the current code and the latest error messages.
//    No AI runs inside the Lab, no data goes through our server.

(function () {
  "use strict";

  const SITE = "https://www.educational-animation.org";
  const HASH_DEFLATE = "oal1=";
  const HASH_PLAIN = "oal0=";
  const LONG_LINK = 8000; // longer links get cut by some messengers
  const MAX_LINK = 1900000; // browsers accept about 2 MB in the address bar

  const PAGES = {
    de: {
      submit: SITE + "/de/animation-einreichen/",
      reference: SITE + "/de/referenz-fuer-den-editor/",
      quickref: SITE + "/oal/reference-de.txt",
      aiHelp: SITE + "/de/der-editor/",
    },
    en: {
      submit: SITE + "/en/submit-animation/",
      reference: SITE + "/en/editor-reference/",
      quickref: SITE + "/oal/reference-en.txt",
      aiHelp: SITE + "/en/the-editor/",
    },
  };

  // ── Helpers ────────────────────────────────────────────────────────────

  function lang() {
    const l = window.i18n && window.i18n.getCurrentLanguage ? window.i18n.getCurrentLanguage() : "en";
    return l === "de" ? "de" : "en";
  }

  function t(key) {
    return window.i18n ? window.i18n.t(key) : key;
  }

  function formatCount(n) {
    return n.toLocaleString(lang() === "de" ? "de-DE" : "en-GB");
  }

  function getCode() {
    return window.editor && typeof window.editor.getValue === "function" ? window.editor.getValue() : "";
  }

  function bytesToBase64Url(bytes) {
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function base64UrlToBytes(text) {
    let b64 = text.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  async function streamThrough(bytes, stream) {
    const out = new Blob([bytes]).stream().pipeThrough(stream);
    return new Uint8Array(await new Response(out).arrayBuffer());
  }

  async function packCode(code) {
    const raw = new TextEncoder().encode(code);
    if (typeof CompressionStream === "function") {
      try {
        const packed = await streamThrough(raw, new CompressionStream("deflate-raw"));
        return HASH_DEFLATE + bytesToBase64Url(packed);
      } catch (e) {
        /* fall through to the uncompressed form */
      }
    }
    return HASH_PLAIN + bytesToBase64Url(raw);
  }

  async function unpackCode(hash) {
    const h = hash.replace(/^#/, "");
    if (h.startsWith(HASH_DEFLATE)) {
      const bytes = base64UrlToBytes(h.slice(HASH_DEFLATE.length));
      const raw = await streamThrough(bytes, new DecompressionStream("deflate-raw"));
      return new TextDecoder().decode(raw);
    }
    if (h.startsWith(HASH_PLAIN)) {
      return new TextDecoder().decode(base64UrlToBytes(h.slice(HASH_PLAIN.length)));
    }
    return null;
  }

  async function buildShareLink() {
    return SITE + "/oal/index.html?lang=" + lang() + "#" + (await packCode(getCode()));
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      /* try the old way */
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    area.remove();
    return ok;
  }

  function setStatus(id, text, kind) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = "sa-status" + (kind ? " sa-" + kind : "");
  }

  // ── Windows ────────────────────────────────────────────────────────────

  function centerWindowEl(win) {
    const w = win.offsetWidth;
    const h = win.offsetHeight;
    win.style.transform = "none";
    win.style.left = Math.max(0, (window.innerWidth - w) / 2) + "px";
    win.style.top = Math.max(0, (window.innerHeight - h) / 2) + "px";
  }

  function openWindow(id) {
    if (typeof closeAllWindows === "function") closeAllWindows();
    const win = document.getElementById(id);
    if (!win) return null;
    win.classList.add("visible");
    setTimeout(() => centerWindowEl(win), 0);
    return win;
  }

  function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) win.classList.remove("visible");
  }

  // ── Share ──────────────────────────────────────────────────────────────

  let lastLink = "";

  window.openShareWindow = async function () {
    openWindow("shareWindow");
    setStatus("shareLinkStatus", "");
    setStatus("shareSubmitStatus", "");
    const field = document.getElementById("shareLinkField");
    const hint = document.getElementById("shareLongHint");
    if (hint) hint.style.display = "none";

    if (!getCode().trim()) {
      lastLink = "";
      if (field) field.value = "";
      setStatus("shareLinkStatus", t("share_empty"), "warn");
      return;
    }

    lastLink = await buildShareLink();
    if (field) field.value = lastLink;
    if (hint && lastLink.length > LONG_LINK) hint.style.display = "block";
  };

  window.closeShareWindow = function () {
    closeWindow("shareWindow");
  };

  window.copyShareLink = async function () {
    if (!lastLink) return;
    if (lastLink.length > MAX_LINK) {
      setStatus("shareLinkStatus", t("share_too_long"), "warn");
      return;
    }
    const ok = await copyText(lastLink);
    setStatus(
      "shareLinkStatus",
      ok ? t("share_copied").replace("{n}", formatCount(lastLink.length)) : t("copy_failed"),
      ok ? "ok" : "warn",
    );
  };

  window.submitShareLink = async function () {
    if (!lastLink) return;
    if (lastLink.length > MAX_LINK) {
      setStatus("shareSubmitStatus", t("share_too_long"), "warn");
      return;
    }
    const ok = await copyText(lastLink);
    window.open(PAGES[lang()].submit, "_blank", "noopener");
    setStatus("shareSubmitStatus", ok ? t("share_submit_done") : t("copy_failed"), ok ? "ok" : "warn");
  };

  // Load code from a shared link – without running it
  async function loadSharedCode() {
    const hash = window.location.hash || "";
    if (!hash.startsWith("#" + HASH_DEFLATE) && !hash.startsWith("#" + HASH_PLAIN)) return;

    let code = null;
    try {
      code = await unpackCode(hash);
    } catch (e) {
      code = null;
    }

    // Remove the code from the address bar, so a reload does not bring it back
    try {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch (e) {
      /* ignore */
    }

    if (code === null) {
      showBanner(t("shared_broken"), "warn");
      return;
    }

    const previewTable = document.getElementById("preview-table");
    if (previewTable) previewTable.remove();

    const fullCode = code.trim() + "\n";
    if (window.editor && window.editor.setValue) {
      window.editor.setValue(fullCode);
      const wrapper = window.editor.getWrapperElement();
      wrapper.style.display = "block";
      wrapper.style.visibility = "visible";
      setTimeout(() => window.editor.refresh(), 1);
    }

    const activeTab = document.querySelector(".tab.active");
    const tabName = activeTab ? activeTab.getAttribute("data-tab") : null;
    if (tabName && typeof tabContents !== "undefined") tabContents[tabName] = fullCode;
    if (tabName && typeof tabObjects !== "undefined" && tabObjects[tabName]) {
      tabObjects[tabName].showPreview = false;
    }
    // Show the run button etc. (hidden while the template gallery was shown)
    ["left-actions", "right-actions"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "flex";
    });
    if (typeof resizeEditor === "function") resizeEditor();

    showBanner(t("shared_loaded"), "info");
  }

  function showBanner(text, kind) {
    const old = document.getElementById("sharedBanner");
    if (old) old.remove();
    const area = document.getElementById("editorArea");
    if (!area) return;
    const banner = document.createElement("div");
    banner.id = "sharedBanner";
    banner.className = "sa-banner sa-banner-" + kind;
    banner.setAttribute("role", "status");
    const span = document.createElement("span");
    span.textContent = text;
    const close = document.createElement("button");
    close.className = "sa-banner-close";
    close.setAttribute("aria-label", t("close"));
    close.innerHTML = '<span class="material-icons" aria-hidden="true">close</span>';
    close.onclick = () => banner.remove();
    banner.appendChild(span);
    banner.appendChild(close);
    area.insertBefore(banner, area.firstChild);
  }

  window.addEventListener("preloaderComplete", () => {
    requestAnimationFrame(() => requestAnimationFrame(loadSharedCode));
  });

  // ── Build with AI ──────────────────────────────────────────────────────

  const PROMPT = {
    de: [
      "Du hilfst mir, eine Animation für das Open Animation Lab (OAL) zu programmieren. Das OAL ist ein kostenloser JavaScript-Editor im Browser: {site}/oal/",
      "",
      "MEINE IDEE:",
      "{idea}",
      "",
      "SO GEHST DU VOR:",
      "1. Lies zuerst die Kurzreferenz mit allen Befehlen: {quickref} (ausführlich: {reference}). Kannst du keine Links öffnen oder bricht der Abruf ab, sag es mir – dann lade ich die Kurzreferenz als Datei hoch.",
      "2. Benutze nur Befehle aus der Referenz. Erfinde keine.",
      "3. Hänge ich ein Bild oder eine Skizze an, übernimm Lage, Größen und Farben möglichst genau daraus. Nenne ich Maße oder Positionen, halte dich genau daran.",
      "4. Gib mir den vollständigen Code in einem einzigen Block. Ich kopiere ihn ins OAL und starte ihn mit ▶.",
      "5. Nenne danach in einer kurzen Liste, wo die Hauptteile liegen (x, y, Größe), und in einem Satz, welche fachlichen Annahmen du getroffen hast.",
      "",
      "SO SOLL ES AUSSEHEN (Stil von educational-animation.org):",
      "- Zeichenfläche 1280 × 720, Hintergrund weiß, Schrift Arial. Beschriftungen 20 px in 0x444444.",
      "- Die Grafik steht links oder in der Mitte und nutzt den Platz gut aus. Bedienelemente stehen rechts oben ab etwa x = 950 untereinander (Beschriftung, darunter der Regler, rund 110 px Abstand) oder in einer Reihe unten. Start/Pause (PlayButton 140 × 44) unten rechts.",
      "- Regler: new ButtonSlider(min, max, start, schritt, 40, 200) mit enableValueDisplay(). Rechts neben der Schiene erscheint die Zahl – dort 70 px frei lassen.",
      "- Checkboxen Größe 24, Schrift 20. Linien 2 px, Pfeile 2 bis 3 px. Klare, kräftige Farben, wenige je Bild.",
      "- Lege alle Positionen und Größen als Konstanten am Anfang an (z. B. const MITTE_X = 640), damit ich sie leicht ändern kann.",
      "",
      "REGELN DES OAL (häufige Fehler):",
      "- Beginne mit let board = new Board(1280, 720); – y wächst nach unten, positive Drehung ist im Uhrzeigersinn, Winkel in Grad. Drehpfeile zeigen in die Richtung, in die sich etwas dreht.",
      "- Bezugspunkte: Rectangle = Ecke oben links; Circle, Ellipse, Polygon, Arc = Mitte; Line, Arrow, LinePath = die angegebenen Punkte.",
      "- Grafiken liegen in der Reihenfolge übereinander, in der sie erzeugt werden: zuerst Hintergrund und Hilfslinien, dann Körper, dann Pfeile und Punkte.",
      "- Text, Button, ButtonSlider, Checkbox, Dropdown, MathForm und Model3D liegen immer über allen Grafiken. Man kann sie nicht drehen und nicht in eine Group packen.",
      "- Text: (x, y) ist die linke obere Ecke eines Kastens mit 10 px Innenabstand. setSize(w, h) schaltet den Zeilenumbruch ein. Formatierung: <b>, <i>, <sub>, <sup>, Farbe mit <span style=\"color:#c0392b\">…</span>. Ein Zeichen mittig auf einen Punkt (z. B. N in einen Kreis): textAlign \"center\" und text.setVerticalAlign(\"middle\").",
      "- Keine Backslashes außer \\n. Umlaute und Sonderzeichen direkt schreiben. In MathForm (LaTeX) nur ein Backslash.",
      "- Gesperrte Wörter, auch als Namen: window, document, fetch, eval, globalThis. Tastatur über board.onKeyDown, Maus über board.onMouseMove(e => …) mit e.x und e.y.",
      "- Eigene Funktionen und Variablen nie wie Klassen der Bibliothek nennen (Line, Text, Group, Timer, Button …).",
      "- Regler, Checkboxen und Zahlenfelder: onChange(e => …) – der neue Wert ist e.value. setValue() löst kein onChange aus.",
      "- Schreibe eine Funktion zeichne(), die alles aus den aktuellen Werten zeichnet, und rufe sie nach jeder Änderung auf – auch wenn die Animation pausiert.",
      "- Bewegung: let timer = new Timer(); timer.onUpdate(…); timer.start(); – ohne Dauer läuft der Timer endlos, timer.getElapsedTime() liefert die Zeit in ms. Geschwindigkeiten beim Ziehen mit der Maus über mehrere Bilder glätten.",
      "- Fertige Bausteine nutzen statt selbst bauen: Calc.format(Zahl, Stellen, \"Einheit\") für Zahlen mit Komma, new Plot(x, y, Breite, Höhe, xMin, xMax, yMin, yMax) für Diagramme, PlayButton(timer) für Start/Pause, Spring für Federn, Arc für Bögen und Drehpfeile, AngleLabel für Winkel, CoordinateSystem mit setArrows(true, true, false, false) für Achsen nur nach rechts und oben.",
      "- Model3D nur, wenn ich eine Szenen-ID nenne.",
      "- Rechne mit den echten Formeln und prüfe Richtungen fachlich (Kräfte, Felder, Ströme, Drehsinn).",
      "- Schreibe // lang: de in die erste Zeile.",
    ],
    en: [
      "Please help me program an animation for the Open Animation Lab (OAL), a free JavaScript editor in the browser: {site}/oal/",
      "",
      "MY IDEA:",
      "{idea}",
      "",
      "HOW TO WORK:",
      "1. First read the quick reference with all commands: {quickref} (full version: {reference}). If you cannot open links or the download breaks off, tell me – I will upload the quick reference as a file.",
      "2. Only use commands from the reference. Do not invent any.",
      "3. If I attach a picture or a sketch, copy positions, sizes and colours from it as closely as possible. If I give sizes or positions, stick to them exactly.",
      "4. Give me the complete code in one single block. I paste it into the OAL and start it with ▶.",
      "5. Afterwards, list briefly where the main parts are (x, y, size) and say in one sentence which assumptions about the subject you made.",
      "",
      "HOW IT SHOULD LOOK (style of educational-animation.org):",
      "- Board 1280 × 720, white background, font Arial. Labels 20 px in 0x444444.",
      "- The graphic sits on the left or in the middle and makes good use of the space. Controls sit at the top right from about x = 950, one below the other (label, slider below it, about 110 px apart), or in a row at the bottom. Start/pause (PlayButton 140 × 44) at the bottom right.",
      "- Sliders: new ButtonSlider(min, max, start, step, 40, 200) with enableValueDisplay(). The number appears to the right of the track – leave 70 px free there.",
      "- Checkboxes size 24, font 20. Lines 2 px, arrows 2 to 3 px. Clear, strong colours, only a few per picture.",
      "- Put all positions and sizes into constants at the top (e.g. const CENTRE_X = 640) so that I can change them easily.",
      "",
      "RULES OF THE OAL (frequent mistakes):",
      "- Start with let board = new Board(1280, 720); – y grows downwards, positive rotation is clockwise, angles in degrees. Rotation arrows point in the direction something actually turns.",
      "- Reference points: Rectangle = top-left corner; Circle, Ellipse, Polygon, Arc = centre; Line, Arrow, LinePath = the given points.",
      "- Graphics stack in the order they are created: background and guide lines first, then bodies, then arrows and points.",
      "- Text, Button, ButtonSlider, Checkbox, Dropdown, MathForm and Model3D always lie above all graphics. They cannot be rotated or put into a Group.",
      "- Text: (x, y) is the top-left corner of a box with 10 px padding. setSize(w, h) switches on word wrap. Formatting: <b>, <i>, <sub>, <sup>, colour with <span style=\"color:#c0392b\">…</span>. To centre a character on a point (e.g. N in a circle): textAlign \"center\" and text.setVerticalAlign(\"middle\").",
      "- No backslashes except \\n. Write special characters directly. In MathForm (LaTeX) use a single backslash.",
      "- Blocked words, also as names: window, document, fetch, eval, globalThis. Keyboard via board.onKeyDown, mouse via board.onMouseMove(e => …) with e.x and e.y.",
      "- Never name own functions or variables like library classes (Line, Text, Group, Timer, Button …).",
      "- Sliders, checkboxes and number fields: onChange(e => …) – the new value is e.value. setValue() does not fire onChange.",
      "- Write a function draw() that draws everything from the current values, and call it after every change – also while the animation is paused.",
      "- Motion: let timer = new Timer(); timer.onUpdate(…); timer.start(); – without a duration the timer runs endlessly, timer.getElapsedTime() gives the time in ms. Smooth speeds when dragging with the mouse over several frames.",
      "- Use the ready-made building blocks instead of writing your own: Calc.format(number, digits, \"unit\") for numbers, new Plot(x, y, width, height, xMin, xMax, yMin, yMax) for diagrams, PlayButton(timer) for start/pause, Spring for springs, Arc for arcs and rotation arrows, AngleLabel for angles, CoordinateSystem with setArrows(true, true, false, false) for axes pointing only right and up.",
      "- Only use Model3D if I give a scene ID.",
      "- Use the real formulas and check directions (forces, fields, currents, sense of rotation).",
      "- Write // lang: en in the first line.",
    ],
  };

  const PROMPT_CODE = {
    de: "MEIN BISHERIGER CODE (bitte darauf aufbauen):",
    en: "MY CODE SO FAR (please build on it):",
  };
  const PROMPT_ERRORS = {
    de: "DIESE MELDUNGEN ZEIGT DAS OAL GERADE (bitte beheben):",
    en: "THE OAL CURRENTLY SHOWS THESE MESSAGES (please fix them):",
  };
  const PROMPT_NO_IDEA = {
    de: "(Bitte frag mich zuerst, was die Animation zeigen soll.)",
    en: "(Please ask me first what the animation should show.)",
  };

  function currentErrors() {
    if (typeof systemMessages === "undefined" || !Array.isArray(systemMessages)) return [];
    return systemMessages
      .filter((m) => m.type === "error")
      .map((m) => (m.lineNumber ? (lang() === "de" ? "Zeile " : "Line ") + m.lineNumber + ": " : "") + String(m.message));
  }

  // Code that is only the empty start template does not count as "own code"
  function hasOwnCode() {
    const code = getCode().trim();
    if (!code) return false;
    const lines = code.split("\n").filter((l) => l.trim() && !l.trim().startsWith("//"));
    return lines.length > 1;
  }

  function buildPrompt() {
    const l = lang();
    const idea = (document.getElementById("aiIdea").value || "").trim() || PROMPT_NO_IDEA[l];
    let text = PROMPT[l]
      .join("\n")
      .split("{site}").join(SITE)
      .split("{reference}").join(PAGES[l].reference)
      .split("{quickref}").join(PAGES[l].quickref)
      .split("{idea}").join(idea);

    const withCode = document.getElementById("aiWithCode");
    if (withCode && withCode.checked && getCode().trim()) {
      text += "\n\n" + PROMPT_CODE[l] + "\n```javascript\n" + getCode().trim() + "\n```";
    }
    const withErrors = document.getElementById("aiWithErrors");
    const errors = currentErrors();
    if (withErrors && withErrors.checked && errors.length) {
      text += "\n\n" + PROMPT_ERRORS[l] + "\n" + errors.map((e) => "- " + e).join("\n");
    }
    return text;
  }

  window.openAiWindow = function () {
    openWindow("aiWindow");
    setStatus("aiStatus", "");
    const own = hasOwnCode();
    const withCode = document.getElementById("aiWithCode");
    if (withCode) withCode.checked = own;
    const codeRow = document.getElementById("aiWithCodeRow");
    if (codeRow) codeRow.style.display = getCode().trim() ? "" : "none";

    const errors = currentErrors();
    const errorRow = document.getElementById("aiWithErrorsRow");
    const withErrors = document.getElementById("aiWithErrors");
    if (errorRow) errorRow.style.display = errors.length ? "" : "none";
    if (withErrors) withErrors.checked = errors.length > 0;

    const help = document.getElementById("aiHelpLink");
    if (help) help.href = PAGES[lang()].aiHelp;
    const ref = document.getElementById("aiReferenceLink");
    if (ref) ref.href = PAGES[lang()].reference;
    const quick = document.getElementById("aiQuickrefLink");
    if (quick) quick.href = PAGES[lang()].quickref;

    setTimeout(() => {
      const idea = document.getElementById("aiIdea");
      if (idea) idea.focus();
    }, 50);
  };

  window.closeAiWindow = function () {
    closeWindow("aiWindow");
  };

  window.copyAiPrompt = async function () {
    const ok = await copyText(buildPrompt());
    setStatus("aiStatus", ok ? t("ai_copied") : t("copy_failed"), ok ? "ok" : "warn");
  };

  // ── Setup ──────────────────────────────────────────────────────────────

  function setup() {
    [
      ["shareWindow", "shareWindowHeader"],
      ["aiWindow", "aiWindowHeader"],
    ].forEach(([winId, headId]) => {
      const win = document.getElementById(winId);
      const head = document.getElementById(headId);
      if (win && head && window.makeDraggable) window.makeDraggable(win, head);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.closeShareWindow();
      window.closeAiWindow();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }

  // For tests
  window.__shareAi = { packCode, unpackCode, buildPrompt };
})();
