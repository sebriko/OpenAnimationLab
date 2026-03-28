"use strict";

function isSafe(code) {
  try {
    const ast = acorn.parse(code, { ecmaVersion: 2020 });

    const blacklist = new Set([
      "eval",
      "Function",
      "AsyncFunction",
      "GeneratorFunction",
      "setImmediate",
      "execScript",
      "require",
      "import",
      "XMLHttpRequest",
      "fetch",
      "WebSocket",
      "process",
      "global",
      "globalThis",
      "window",
      "document",
    ]);

    function checkNode(node) {
      if (node.type === "Identifier" && blacklist.has(node.name)) {
        return false;
      }

      if (
        node.type === "MemberExpression" &&
        ((node.property &&
          node.property.type === "Identifier" &&
          blacklist.has(node.property.name)) ||
          (node.property &&
            node.property.type === "Literal" &&
            blacklist.has(String(node.property.value))))
      ) {
        return false;
      }

      if (node.type === "ImportExpression") {
        return false;
      }

      if (
        node.type === "NewExpression" &&
        node.callee.type === "Identifier" &&
        blacklist.has(node.callee.name)
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
