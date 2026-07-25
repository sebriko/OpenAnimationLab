"use strict";

const _safeCodeBlacklist = new Set([
  "eval", "Function", "AsyncFunction", "GeneratorFunction",
  "setImmediate", "execScript", "require", "import",
  "XMLHttpRequest", "fetch", "WebSocket",
  "process", "global", "globalThis", "window", "document",
]);

function isSafe(code) {
  try {
    const ast = acorn.parse(code, { ecmaVersion: 2020 });

    function checkNode(node) {
      if (node.type === "Identifier" && _safeCodeBlacklist.has(node.name)) {
        return false;
      }
      if (
        node.type === "MemberExpression" && node.property &&
        ((node.property.type === "Identifier" && _safeCodeBlacklist.has(node.property.name)) ||
         (node.property.type === "Literal" && _safeCodeBlacklist.has(String(node.property.value))))
      ) {
        return false;
      }
      if (node.type === "ImportExpression") {
        return false;
      }
      if (
        node.type === "NewExpression" &&
        node.callee.type === "Identifier" &&
        _safeCodeBlacklist.has(node.callee.name)
      ) {
        return false;
      }
      for (const key in node) {
        if (typeof node[key] === "object" && node[key] !== null) {
          if (!checkNode(node[key])) return false;
        }
      }
      return true;
    }

    return checkNode(ast);
  } catch (err) {
    return false;
  }
}
