let systemMessages = [];

// Rate-limiting and throttling state for message system
let messageDisplayScheduled = false;
let suppressedCount = 0;
const MAX_MESSAGES = 10;
const MESSAGE_THROTTLE_MS = 200;

// Public API for logging messages from eval context
window.logEvalMessage = function (message, type = "log", lineNumber = null) {
  if (type === "error" && typeof window.oalErrorHint === "function") {
    try {
      const hint = window.oalErrorHint(String(message));
      if (hint) message = message + " – " + hint;
    } catch (e) {
      // Hinweis ist nur eine Hilfe
    }
  }
  const messageEntry = {
    id: Date.now() + Math.random(),
    message: message,
    type: type, // 'log', 'error', 'info'
    lineNumber: lineNumber,
    timestamp: new Date().toISOString(),
  };

  systemMessages.push(messageEntry);

  if (systemMessages.length > MAX_MESSAGES) {
    suppressedCount += systemMessages.length - MAX_MESSAGES;
    systemMessages = systemMessages.slice(-MAX_MESSAGES);
  }

  // For errors: add visual marker in the editor and auto-open the message window
  if (type === "error") {
    if (lineNumber && typeof addErrorMarker === "function") {
      addErrorMarker(lineNumber - 1, message);
    }
  }

  if (!messageDisplayScheduled) {
    messageDisplayScheduled = true;
    setTimeout(() => {
      messageDisplayScheduled = false;
      updateMessageDisplay();
    }, MESSAGE_THROTTLE_MS);
  }
};

function updateMessageDisplay() {
  const messageLog = document.getElementById("messageLog");
  if (!messageLog) return;

  if (systemMessages.length === 0) {
    const noMessagesText = window.i18n
      ? window.i18n.t("no_messages_info")
      : 'Per console.log("Hallo Welt") können Sie hier Meldungen anzeigen lassen. Achtung: Meldungen werden in den Arbeitsspeicher geschrieben und velangsamen die Animation';
    messageLog.innerHTML = `<div class="no-messages">${noMessagesText}</div>`;
    return;
  }

  let html = "";

  if (suppressedCount > 0) {
    const suppressedText = window.i18n
      ? window.i18n.t("messages_suppressed", { count: suppressedCount })
      : `${suppressedCount} ältere Meldung(en) wurden verworfen. Es werden nur die letzten ${MAX_MESSAGES} angezeigt.`;
    html += `<div class="message-entry console-info" style="opacity:0.6; font-style:italic;">
            <div class="message-text">${suppressedText}</div>
        </div>`;
  }

  systemMessages.forEach((msg) => {
    const timestamp = new Date(msg.timestamp).toLocaleTimeString("de-DE");
    const lineText = window.i18n ? window.i18n.t("line") : "Zeile";
    const messageClass = msg.type === "error" ? "console-error" : "console-log";
    const signalText =
      msg.type === "error" ? "ERROR" : msg.type === "info" ? "INFO" : "LOG";

    html += `
            <div class="message-entry ${messageClass}">
                <div class="message-header">
                    <span class="message-signal">${signalText}</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-text">${escapeHtml(msg.message)}</div>
                ${msg.lineNumber ? `<div class="message-line" onclick="if(typeof editor!=='undefined'){editor.setCursor(${msg.lineNumber - 1},0);editor.focus();}" style="cursor:pointer;" title="Zur Zeile springen">${lineText} ${msg.lineNumber}</div>` : ""}
            </div>
        `;
  });

  messageLog.innerHTML = html;
  messageLog.scrollTop = messageLog.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function centerWindow(windowElement) {
  const windowWidth = windowElement.offsetWidth;
  const windowHeight = windowElement.offsetHeight;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const left = Math.max(0, (screenWidth - windowWidth) / 2);
  const top = Math.max(0, (screenHeight - windowHeight) / 2);

  windowElement.style.transform = "none";
  windowElement.style.left = left + "px";
  windowElement.style.top = top + "px";
}

window.openMessageWindow = function () {
  closeAllWindows();
  const messageWindow = document.getElementById("messageWindow");
  messageWindow.classList.add("visible");
  activeWindow = messageWindow;
  updateMessageDisplay();

  setTimeout(() => {
    centerWindow(messageWindow);
  }, 0);
};

window.closeMessageWindow = function () {
  const messageWindow = document.getElementById("messageWindow");
  messageWindow.classList.remove("visible");
  activeWindow = null;
};

window.clearMessageLog = function () {
  systemMessages = [];
  suppressedCount = 0;
  updateMessageDisplay();
};

window.openInfoWindow = function () {
  closeAllWindows();
  const infoWindow = document.getElementById("infoWindow");
  infoWindow.classList.add("visible");
  activeWindow = infoWindow;

  setTimeout(() => {
    centerWindow(infoWindow);
  }, 0);
};

window.closeInfoWindow = function () {
  const infoWindow = document.getElementById("infoWindow");
  infoWindow.classList.remove("visible");
  activeWindow = null;
};

function closeAllWindows() {
  closeMessageWindow();
  closeInfoWindow();
  if (window.closeShareWindow) window.closeShareWindow();
  if (window.closeAiWindow) window.closeAiWindow();
}

function setupDragFunctionality() {
  const windows = ["messageWindow", "infoWindow"];
  const headers = ["messageWindowHeader", "infoWindowHeader"];

  windows.forEach((windowId, index) => {
    const modalWindow = document.getElementById(windowId);
    const header = document.getElementById(headers[index]);
    if (!modalWindow || !header) return;
    window.makeDraggable(modalWindow, header);
  });
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeAllWindows();
  }
});

document.addEventListener("languageChanged", function (e) {
  updateMessageDisplay();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    setupDragFunctionality();
  });
} else {
  setupDragFunctionality();
}

// ── 4.4.0: Hinweise zu häufigen Fehlermeldungen (auch für KI-Anfragen) ──────
// Die Meldungen des Browsers sind englisch und knapp. Hier kommt ein kurzer
// Hinweis in der Sprache der Oberfläche dazu, bei unbekannten Befehlen mit
// ähnlichen Namen aus den Bibliotheken.
(function () {
  function uiLang() {
    try {
      if (window.i18n && typeof window.i18n.getCurrentLanguage === "function") {
        return window.i18n.getCurrentLanguage() === "de" ? "de" : "en";
      }
    } catch (e) {
      // ignore
    }
    return "de";
  }

  let knownNames = null;
  function collectNames() {
    if (knownNames) return knownNames;
    const methods = new Set();
    const classes = new Set();
    [
      typeof SvgJSEdu !== "undefined" ? SvgJSEdu : null,
      typeof PixiJSEdu !== "undefined" ? PixiJSEdu : null,
      typeof HtmlSvgEdu !== "undefined" ? HtmlSvgEdu : null,
    ].forEach((ns) => {
      if (!ns) return;
      Object.keys(ns).forEach((cls) => {
        const C = ns[cls];
        if (typeof C !== "function") return;
        classes.add(cls);
        const map = C.serializationMap;
        if (!map) return;
        ["methods", "setter"].forEach((part) => {
          if (map[part]) Object.keys(map[part]).forEach((m) => methods.add(m));
        });
      });
    });
    knownNames = { methods: [...methods], classes: [...classes] };
    return knownNames;
  }

  function distance(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    const d = [];
    for (let i = 0; i <= a.length; i++) d.push([i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        d[i][j] = Math.min(
          d[i - 1][j] + 1,
          d[i][j - 1] + 1,
          d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        );
      }
    }
    return d[a.length][b.length];
  }

  function similar(name, list) {
    const low = name.toLowerCase();
    return list
      .map((m) => {
        const ml = m.toLowerCase();
        let score = distance(name, m);
        if (ml.indexOf(low) >= 0 || low.indexOf(ml) >= 0) score = Math.min(score, 1);
        // gleiches Wort am Ende (setColor ↔ setFillColor, setLineColor)
        const tail = low.replace(/^(set|get|on|add)/, "");
        if (tail.length > 3 && ml.endsWith(tail)) score = Math.min(score, 2);
        // gleicher Anfang (set…, on…) zuerst
        if (ml.slice(0, 3) === low.slice(0, 3)) score -= 0.5;
        return { m, score };
      })
      .filter((x) => x.score <= 2 && x.m !== name && !/^(mixColor|lerp|clamp|map|round|rad|deg)$/.test(x.m))
      .sort((a, b) => a.score - b.score || a.m.length - b.m.length)
      .slice(0, 3)
      .map((x) => x.m);
  }

  const T = {
    de: {
      notFunction: (m, sim) =>
        "Tipp: „" + m + "()“ gibt es hier nicht." +
        (sim.length ? " Ähnlich: " + sim.join(", ") + "." : " Bitte in der Referenz nachsehen."),
      position: "Tipp: Positionen werden mit .x = … und .y = … gesetzt.",
      iterable: "Tipp: Hier wird eine Liste erwartet, z. B. setPoints([[x1, y1], [x2, y2]]) – außen eckige Klammern.",
      notDefined: (n, cls) =>
        cls
          ? "Tipp: Groß- und Kleinschreibung prüfen – gemeint ist wohl „" + cls + "“."
          : "Tipp: „" + n + "“ ist unbekannt – Tippfehler, oder die Variable wurde nicht mit let angelegt.",
      undefinedProp: "Tipp: Dieses Objekt gibt es an dieser Stelle (noch) nicht – wurde es vorher mit new erzeugt und richtig geschrieben?",
      syntax: "Tipp: Klammern und Anführungszeichen prüfen. Backslashes sind außer \\n nicht erlaubt; Umlaute und Sonderzeichen direkt schreiben.",
      stack: "Tipp: Eine Funktion ruft sich ohne Ende selbst auf.",
      loop: (line) =>
        "Die Schleife" + (line ? " in Zeile " + line : "") +
        " läuft seit 4 Sekunden ohne Pause und wurde abgebrochen – wahrscheinlich eine Endlosschleife. Bedingung prüfen.",
    },
    en: {
      notFunction: (m, sim) =>
        "Hint: “" + m + "()” does not exist here." +
        (sim.length ? " Similar: " + sim.join(", ") + "." : " Please check the reference."),
      position: "Hint: set positions with .x = … and .y = …",
      iterable: "Hint: a list is expected here, e.g. setPoints([[x1, y1], [x2, y2]]) – square brackets outside.",
      notDefined: (n, cls) =>
        cls
          ? "Hint: check upper and lower case – you probably mean “" + cls + "”."
          : "Hint: “" + n + "” is unknown – a typo, or the variable was not declared with let.",
      undefinedProp: "Hint: this object does not exist (yet) at this point – was it created with new and spelled correctly?",
      syntax: "Hint: check brackets and quotation marks. Backslashes are not allowed except \\n; write special characters directly.",
      stack: "Hint: a function keeps calling itself.",
      loop: (line) =>
        "The loop" + (line ? " in line " + line : "") +
        " has been running for 4 seconds without a break and was stopped – probably an endless loop. Check its condition.",
    },
  };

  window.oalErrorHint = function (message) {
    const t = T[uiLang()];
    let m;
    if ((m = message.match(/(?:^|[\s.])(\w+) is not a function/))) {
      const name = m[1];
      if (/^(setPosition|setPos|moveTo|setXY)$/i.test(name)) return t.position;
      return t.notFunction(name, similar(name, collectNames().methods));
    }
    if (/is not iterable/.test(message)) return t.iterable;
    if ((m = message.match(/^(\w+) is not defined/))) {
      const name = m[1];
      const cls = collectNames().classes.find(
        (c) => c.toLowerCase() === name.toLowerCase() && c !== name,
      );
      return t.notDefined(name, cls);
    }
    if (/Cannot read propert(y|ies) of (undefined|null)|Cannot set propert(y|ies) of (undefined|null)/.test(message)) {
      return t.undefinedProp;
    }
    if (/Unexpected token|Unterminated|Invalid or unexpected token|missing \) after|Unexpected end of input|Unexpected identifier/.test(message)) {
      return t.syntax;
    }
    if (/Maximum call stack/.test(message)) return t.stack;
    return "";
  };

  // Meldung des Schleifenwächters (CodeEditor.js, addLoopGuards)
  window.oalLoopMessage = function (line) {
    let shown = line;
    try {
      const ctx = window.__codeErrorContext;
      if (ctx && ctx.lineMap && ctx.lineMap[line - 1] !== undefined) {
        shown = ctx.lineMap[line - 1] + 1;
      }
    } catch (e) {
      // ignore
    }
    return T[uiLang()].loop(shown);
  };
})();
