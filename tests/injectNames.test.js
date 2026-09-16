/**
 * Regression tests for injectNames (src/core/CodeEditor.js) and the
 * backslash replacement in runCode().
 *
 * Run with:  node tests/injectNames.test.js
 *
 * Bugs fixed:
 * 1. injectNames used rest.includes(")") — fooled by nested calls like
 *    String(value) when the constructor spans multiple lines.
 * 2. Parenthesis counting in injectNames did not skip string contents,
 *    so a ")" inside a string literal was counted as a real closing paren.
 * 3. The backslash replacement /\\(?!\\)/g doubled escaped quotes (\' → \\'),
 *    breaking strings like 'It\'s here' → 'It\\'s here' (syntax error).
 */

// ---------------------------------------------------------------------------
// countParensDelta — copy from CodeEditor.js
// ---------------------------------------------------------------------------
function countParensDelta(text) {
  let delta = 0;
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (!inString && (ch === "'" || ch === '"' || ch === "`")) {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (inString) {
      if (ch === "\\" && i + 1 < text.length) {
        i++;
        continue;
      }
      if (ch === stringChar) {
        inString = false;
      }
      continue;
    }

    if (ch === "/" && i + 1 < text.length && text[i + 1] === "/") {
      break;
    }

    if (ch === "(") delta++;
    else if (ch === ")") delta--;
  }
  return delta;
}

// ---------------------------------------------------------------------------
// injectNames — copy from CodeEditor.js (fixed version)
// ---------------------------------------------------------------------------
function injectNames(code) {
  const lines = code.split("\n");
  let result = [];
  let lineMap = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    result.push(line);
    lineMap.push(i);

    const declMatch = line.match(
      /^(?:const|let|var)\s+(\w+)\s*=\s*new\s+[\w.]+\s*\((.*)/,
    );
    if (declMatch) {
      const varName = declMatch[1];
      let rest = declMatch[2];

      let openParens = 1 + countParensDelta(rest);

      if (openParens === 0) {
        result.push(`${varName}.instanceName = "${varName}";`);
        lineMap.push(i);
      } else {
        while (i + 1 < lines.length && openParens > 0) {
          i++;
          const nextLine = lines[i];
          result.push(nextLine);
          lineMap.push(i);

          openParens += countParensDelta(nextLine);

          if (openParens === 0) {
            result.push(`${varName}.instanceName = "${varName}";`);
            lineMap.push(i);
            break;
          }
        }
      }
    }
  }

  return { code: result.join("\n"), lineMap };
}

// ---------------------------------------------------------------------------
// Backslash replacement — copy from CodeEditor.js (fixed version)
// ---------------------------------------------------------------------------
function applyBackslashReplacement(code) {
  return code.replace(/\\(?![\\'"`])/g, "\\\\");
}

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function assertTransform(label, input, expected) {
  const { code: actual } = injectNames(input);
  if (actual !== expected) {
    console.error(
      `FAIL: ${label}\n  input:\n${indent(input)}\n  expected:\n${indent(expected)}\n  got:\n${indent(actual)}`,
    );
    failed++;
  } else {
    console.log(`  ok: ${label}`);
    passed++;
  }
}

function assertValidJS(label, input) {
  const { code: transformed } = injectNames(input);
  try {
    new Function(transformed);
    console.log(`  ok: ${label}`);
    passed++;
  } catch (e) {
    console.error(
      `FAIL: ${label}\n  Transformed code is not valid JS: ${e.message}\n  input:\n${indent(input)}\n  transformed:\n${indent(transformed)}`,
    );
    failed++;
  }
}

function assertBackslashValid(label, input) {
  const replaced = applyBackslashReplacement(input);
  try {
    new Function(replaced);
    console.log(`  ok: ${label}`);
    passed++;
  } catch (e) {
    console.error(
      `FAIL: ${label}\n  Backslash-replaced code is not valid JS: ${e.message}\n  input:\n${indent(input)}\n  replaced:\n${indent(replaced)}`,
    );
    failed++;
  }
}

function indent(s) {
  return s
    .split("\n")
    .map((l) => "    " + l)
    .join("\n");
}

// ---------------------------------------------------------------------------
// injectNames tests
// ---------------------------------------------------------------------------

console.log("\n--- Single-line constructor (no nesting) ---");

assertTransform(
  "simple single-line constructor",
  "let board = new Board(800, 600);",
  'let board = new Board(800, 600);\nboard.instanceName = "board";',
);

assertTransform(
  "const declaration",
  "const rect = new Rectangle(100, 50, 'red');",
  'const rect = new Rectangle(100, 50, \'red\');\nrect.instanceName = "rect";',
);

console.log("\n--- Single-line with nested function calls ---");

assertTransform(
  "nested function call on single line",
  "let label = new Text(String(Math.round(value)), font, 20, 0x000000, 'left');",
  'let label = new Text(String(Math.round(value)), font, 20, 0x000000, \'left\');\nlabel.instanceName = "label";',
);

assertTransform(
  "multiple nested calls on single line",
  "let obj = new Foo(bar(a, b), baz(c, d));",
  'let obj = new Foo(bar(a, b), baz(c, d));\nobj.instanceName = "obj";',
);

console.log("\n--- Multi-line constructor WITHOUT nested calls ---");

assertTransform(
  "multi-line simple args",
  "let board = new Board(\n    800,\n    600);",
  'let board = new Board(\n    800,\n    600);\nboard.instanceName = "board";',
);

console.log("\n--- Multi-line with nested calls (THE ORIGINAL BUG) ---");

assertTransform(
  "multi-line with nested function call",
  "let label = new Text(String(value),\n    font, 20, 0x000000, 'left');",
  'let label = new Text(String(value),\n    font, 20, 0x000000, \'left\');\nlabel.instanceName = "label";',
);

assertTransform(
  "multi-line with deeply nested calls",
  "let label = new Text(String(Math.round(value)),\n    font, 20);",
  'let label = new Text(String(Math.round(value)),\n    font, 20);\nlabel.instanceName = "label";',
);

assertTransform(
  "multi-line with multiple nested calls",
  "let obj = new SomeClass(\n    calculateSomething(a, b),\n    anotherFunction(x));",
  'let obj = new SomeClass(\n    calculateSomething(a, b),\n    anotherFunction(x));\nobj.instanceName = "obj";',
);

console.log("\n--- Strings with parentheses inside constructors ---");

assertTransform(
  "string containing ) does not close constructor",
  'let label = new Text("Hello )",\n    "Arial", 16);',
  'let label = new Text("Hello )",\n    "Arial", 16);\nlabel.instanceName = "label";',
);

assertTransform(
  "string containing ( does not open group",
  'let label = new Text("Hello (",\n    "Arial", 16);',
  'let label = new Text("Hello (",\n    "Arial", 16);\nlabel.instanceName = "label";',
);

assertTransform(
  "single-quoted string with parens on single line",
  "let label = new Text('fn(a, b)', 'Arial', 16);",
  'let label = new Text(\'fn(a, b)\', \'Arial\', 16);\nlabel.instanceName = "label";',
);

console.log("\n--- Namespace-qualified constructors (after replacer) ---");

assertTransform(
  "HtmlSvgEdu.Text with nested call",
  "let label = new HtmlSvgEdu.Text(String(value),\n    'Arial', 16);",
  'let label = new HtmlSvgEdu.Text(String(value),\n    \'Arial\', 16);\nlabel.instanceName = "label";',
);

assertTransform(
  "SvgJSEdu.Rectangle",
  "let rect = new SvgJSEdu.Rectangle(100, 50, 'red');",
  'let rect = new SvgJSEdu.Rectangle(100, 50, \'red\');\nrect.instanceName = "rect";',
);

console.log("\n--- Syntax validity checks ---");

assertValidJS("single-line with nested call", "let label = new Object(String(Math.round(42)), 'arial', 20, 0x000000, 'left');");
assertValidJS("multi-line with nested call", "let label = new Object(String(42),\n    'arial', 20);");
assertValidJS("multi-line with string containing parens", 'let label = new Object("Hello )",\n    "Arial", 16);');
assertValidJS("complex multi-line", "let obj = new Object(\n    parseInt('10', 16),\n    Math.max(1, 2));");

console.log("\n--- Non-constructor lines are untouched ---");

assertTransform("regular code not modified", "let x = 42;\nconst y = 'hello';", "let x = 42;\nconst y = 'hello';");
assertTransform("function call without new", "let result = someFunction(a, b);", "let result = someFunction(a, b);");

// ---------------------------------------------------------------------------
// Backslash replacement tests
// ---------------------------------------------------------------------------

console.log("\n--- Backslash replacement: escaped quotes preserved ---");

assertBackslashValid("escaped single quote in single-quoted string", "let x = 'It\\'s here';");
assertBackslashValid("escaped double quote in double-quoted string", 'let x = "He said \\"hello\\"";');
assertBackslashValid("escaped backtick in template literal", "let x = `test \\` end`;");
assertBackslashValid("no backslashes at all", "let x = 'hello';");
assertBackslashValid("newline escape becomes literal", 'let x = "hello\\nworld";');
assertBackslashValid("double backslash stays", 'let x = "path\\\\file";');

console.log("\n--- Backslash replacement: within constructor calls ---");

assertBackslashValid("Text with escaped quote", "let label = new Object('It\\'s a test', 'Arial', 16);");
assertBackslashValid("Text with newline escape", 'let label = new Object("Line1\\nLine2", "Arial", 16);');

// ---------------------------------------------------------------------------
// countParensDelta unit tests
// ---------------------------------------------------------------------------

console.log("\n--- countParensDelta ---");

function assertDelta(label, input, expected) {
  const actual = countParensDelta(input);
  if (actual !== expected) {
    console.error(`FAIL: ${label}\n  input: ${JSON.stringify(input)}\n  expected: ${expected}, got: ${actual}`);
    failed++;
  } else {
    console.log(`  ok: ${label}`);
    passed++;
  }
}

assertDelta("simple parens", "foo(a, b)", 0);
assertDelta("one open", "foo(a, b", 1);
assertDelta("one close", "a, b)", -1);
assertDelta("nested parens", "foo(bar(a, b))", 0);
assertDelta("paren in double-quoted string", '"hello )"', 0);
assertDelta("paren in single-quoted string", "'hello )'", 0);
assertDelta("paren in backtick string", "`hello )`", 0);
assertDelta("escaped quote not ending string", "'it\\'s (here)'", 0);
assertDelta("line comment hides parens", "foo // (bar)", 0);
assertDelta("no parens", "hello world", 0);
assertDelta("multiple string-enclosed parens", '"(" + ")"', 0);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
process.exit(failed > 0 ? 1 : 0);
