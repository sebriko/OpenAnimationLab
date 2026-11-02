"use strict";

const _safeCodeBlacklist = new Set([
  "eval", "Function", "AsyncFunction", "GeneratorFunction",
  "setImmediate", "execScript", "require", "import",
  "XMLHttpRequest", "fetch", "WebSocket",
  "process", "global", "globalThis", "window", "document",
]);

// Message shown when the code uses a blocked word (E-008).
// Fallback texts are used when i18n is not (yet) available.
const _safeCodeTexts = {
  de: "„{word}“ ist im Open Animation Lab aus Sicherheitsgründen gesperrt – der Code wurde nicht ausgeführt. Gesperrt sind: {list}. Das gilt auch für Namen von Variablen und Eigenschaften. Für Maus und Tastatur gibt es board.onMouseDown, board.onMouseUp, board.onMouseMove, board.onKeyDown und board.onKeyUp.",
  en: "‘{word}’ is blocked in the Open Animation Lab for security reasons – the code was not run. Blocked words: {list}. This also applies to names of variables and properties. For mouse and keyboard, use board.onMouseDown, board.onMouseUp, board.onMouseMove, board.onKeyDown and board.onKeyUp.",
};

function _safeCodeMessage(word) {
  let text = null;
  let lang = "en";
  if (typeof window !== "undefined" && window.i18n) {
    if (typeof window.i18n.getCurrentLanguage === "function") {
      lang = window.i18n.getCurrentLanguage();
    }
    if (typeof window.i18n.translate === "function") {
      const t = window.i18n.translate("safe_code_blocked", null);
      if (t && t !== "safe_code_blocked") text = t;
    }
  }
  if (!text) text = _safeCodeTexts[lang] || _safeCodeTexts.en;
  return text
    .replace("{word}", word)
    .replace("{list}", Array.from(_safeCodeBlacklist).join(", "));
}

// Returns the first blocked node as { word, line } or null.
function findBlockedWord(ast) {
  function hit(word, node) {
    return { word: word, line: node.loc ? node.loc.start.line : null };
  }

  function checkNode(node) {
    if (node.type === "Identifier" && _safeCodeBlacklist.has(node.name)) {
      return hit(node.name, node);
    }
    if (node.type === "MemberExpression" && node.property) {
      if (node.property.type === "Identifier" && _safeCodeBlacklist.has(node.property.name)) {
        return hit(node.property.name, node.property);
      }
      if (node.property.type === "Literal" && _safeCodeBlacklist.has(String(node.property.value))) {
        return hit(String(node.property.value), node.property);
      }
    }
    if (node.type === "ImportExpression") {
      return hit("import", node);
    }
    if (
      node.type === "NewExpression" &&
      node.callee.type === "Identifier" &&
      _safeCodeBlacklist.has(node.callee.name)
    ) {
      return hit(node.callee.name, node.callee);
    }
    for (const key in node) {
      if (key === "loc") continue;
      if (typeof node[key] === "object" && node[key] !== null) {
        const found = checkNode(node[key]);
        if (found) return found;
      }
    }
    return null;
  }

  return checkNode(ast);
}

function isSafe(code) {
  let ast;
  try {
    ast = acorn.parse(code, { ecmaVersion: 2020, locations: true });
  } catch (err) {
    // Report syntax errors with line number to the message system
    if (typeof window !== "undefined" && typeof window.logEvalMessage === "function") {
      const lineNumber = err.loc ? err.loc.line : null;
      window.logEvalMessage(
        err.message || "Syntaxfehler im Code",
        "error",
        lineNumber,
      );
    }
    return false;
  }

  const blocked = findBlockedWord(ast);
  if (!blocked) return true;

  // Report blocked words instead of silently doing nothing (E-008)
  if (typeof window !== "undefined" && typeof window.logEvalMessage === "function") {
    window.logEvalMessage(_safeCodeMessage(blocked.word), "error", blocked.line);
  }
  return false;
}
