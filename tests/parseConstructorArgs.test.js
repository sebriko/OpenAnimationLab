/**
 * Regression tests for parseConstructorArgs (src/core/Form.js).
 *
 * Run with:  node tests/parseConstructorArgs.test.js
 *
 * These tests verify that argument lists with nested parentheses, brackets,
 * braces, strings, and comments are split correctly at the top-level commas.
 */

// ---------------------------------------------------------------------------
// Minimal stubs so the function can run outside the browser
// ---------------------------------------------------------------------------
function isJavaScriptExpression(value) {
  if (typeof value !== "string") return false;
  const t = value.trim();
  if (["true", "false", "null", "undefined"].includes(t)) return false;
  if (/^-?\d+(\.\d+)?$/.test(t)) return false;
  if (/^0x[0-9A-Fa-f]+$/i.test(t)) return false;
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'")) ||
    (t.startsWith("`") && t.endsWith("`"))
  )
    return false;
  if (
    (t.startsWith("[") && t.endsWith("]")) ||
    (t.startsWith("{") && t.endsWith("}"))
  )
    return false;
  if (/\(.*\)/.test(t)) return true;
  if (/[+\-*/%&|!<>=?:]/.test(t)) return true;
  if (/^[a-zA-Z_$]/.test(t)) return true;
  return false;
}

function evaluateArgValue(value) {
  if (isJavaScriptExpression(value)) return value;
  if (value === "null") return null;
  if (value === "undefined") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return parseFloat(value);
  if (/^0x[0-9A-Fa-f]+$/i.test(value)) return value;
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  )
    return value.substring(1, value.length - 1);
  if (value.startsWith("`") && value.endsWith("`"))
    return value.substring(1, value.length - 1);
  return value;
}

// ---------------------------------------------------------------------------
// Copy of parseConstructorArgs (kept in sync with Form.js)
// ---------------------------------------------------------------------------
function parseConstructorArgs(argsString) {
  if (!argsString.trim()) return [];

  const result = [];
  let current = "";
  let inString = false;
  let stringChar = "";
  let inObject = 0;
  let inArray = 0;
  let inParen = 0;
  let inTemplate = false;

  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];

    if (char === "`") {
      inTemplate = !inTemplate;
      current += char;
      continue;
    }

    if (
      !inTemplate &&
      (char === '"' || char === "'") &&
      (i === 0 || argsString[i - 1] !== "\\")
    ) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      current += char;
      continue;
    }

    if (!inString && !inTemplate) {
      if (char === "{") inObject++;
      if (char === "}") inObject--;
      if (char === "[") inArray++;
      if (char === "]") inArray--;
      if (char === "(") inParen++;
      if (char === ")") inParen--;
    }

    if (
      char === "," &&
      !inString &&
      !inTemplate &&
      inObject === 0 &&
      inArray === 0 &&
      inParen === 0
    ) {
      const trimmed = current.trim();
      result.push({
        value: evaluateArgValue(trimmed),
        raw: trimmed,
        isExpression: isJavaScriptExpression(trimmed),
      });
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    const trimmed = current.trim();
    result.push({
      value: evaluateArgValue(trimmed),
      raw: trimmed,
      isExpression: isJavaScriptExpression(trimmed),
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function assertArgRaws(label, input, expectedRaws) {
  const args = parseConstructorArgs(input);
  const raws = args.map((a) => a.raw);
  const ok =
    raws.length === expectedRaws.length &&
    raws.every((r, i) => r === expectedRaws[i]);
  if (!ok) {
    console.error(
      `FAIL: ${label}\n  input:    ${JSON.stringify(input)}\n  expected: ${JSON.stringify(expectedRaws)}\n  got:      ${JSON.stringify(raws)}`,
    );
    failed++;
  } else {
    console.log(`  ok: ${label}`);
    passed++;
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

console.log("\n--- Basic argument splitting ---");

assertArgRaws("simple args", "100, 200, 'red'", ["100", "200", "'red'"]);
assertArgRaws("empty string", "", []);
assertArgRaws("single arg", "42", ["42"]);
assertArgRaws("boolean and null", "true, null, false", ["true", "null", "false"]);

console.log("\n--- Nested parentheses (the original bug) ---");

assertArgRaws("nested function call with multiple args", "foo(a, b), 'hello'", ["foo(a, b)", "'hello'"]);
assertArgRaws("deeply nested function calls", "String(Math.round(value)), font, 20, 0x000000, 'left'", ["String(Math.round(value))", "font", "20", "0x000000", "'left'"]);
assertArgRaws("nested call with multiple inner args", "Math.max(a, b), Math.min(c, d)", ["Math.max(a, b)", "Math.min(c, d)"]);
assertArgRaws("multiple nested levels", "fn(a(b(c, d), e), f), g", ["fn(a(b(c, d), e), f)", "g"]);
assertArgRaws("constructor-like: new Text with nested calls", "String(Math.round(value)), font, size, color, 'left'", ["String(Math.round(value))", "font", "size", "color", "'left'"]);

console.log("\n--- Strings with commas and parentheses ---");

assertArgRaws("double-quoted string with comma", '100, "hello, world", 200', ["100", '"hello, world"', "200"]);
assertArgRaws("single-quoted string with comma", "100, 'Text, mit Komma', 200", ["100", "'Text, mit Komma'", "200"]);
assertArgRaws("string with parentheses", "'foo(bar)', 42", ["'foo(bar)'", "42"]);
assertArgRaws("template literal with comma", "`a, b`, 42", ["`a, b`", "42"]);

console.log("\n--- Objects and arrays ---");

assertArgRaws("object literal with commas", "{a: 1, b: 2}, 'text'", ["{a: 1, b: 2}", "'text'"]);
assertArgRaws("array literal with commas", "[1, 2, 3], 'text'", ["[1, 2, 3]", "'text'"]);
assertArgRaws("nested object in array", "[{a: 1, b: 2}, {c: 3}], 42", ["[{a: 1, b: 2}, {c: 3}]", "42"]);

console.log("\n--- Mixed nesting ---");

assertArgRaws("function call with object arg", "fn({a: 1, b: 2}), 42", ["fn({a: 1, b: 2})", "42"]);
assertArgRaws("function call with array arg", "fn([1, 2, 3]), 'text'", ["fn([1, 2, 3])", "'text'"]);
assertArgRaws("complex mixed nesting", "foo(bar(a, b), [1, 2], {x: 3}), baz(c), 'Text, mit Komma'", ["foo(bar(a, b), [1, 2], {x: 3})", "baz(c)", "'Text, mit Komma'"]);

console.log("\n--- Multiline arguments ---");

assertArgRaws("multiline with nested calls", "calculateSomething(a, b),\n    anotherFunction(x)", ["calculateSomething(a, b)", "anotherFunction(x)"]);
assertArgRaws("multiline with indentation", "100,\n    200,\n    'red'", ["100", "200", "'red'"]);

console.log("\n--- Method calls ---");

assertArgRaws("method call as argument", "object.method(a, b), 42", ["object.method(a, b)", "42"]);
assertArgRaws("chained method calls", "obj.foo(a).bar(b, c), 42", ["obj.foo(a).bar(b, c)", "42"]);

console.log("\n--- Edge cases ---");

assertArgRaws("escaped quotes in strings", "\"hello \\\"world\\\"\", 42", ["\"hello \\\"world\\\"\"", "42"]);
assertArgRaws("only whitespace", "   ", []);
assertArgRaws("string with closing paren", "'hello)', 42", ["'hello)'", "42"]);
assertArgRaws("string with opening paren", "'hello(', 42", ["'hello('", "42"]);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
process.exit(failed > 0 ? 1 : 0);
