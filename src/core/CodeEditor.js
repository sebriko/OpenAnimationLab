var code;

// UTILITY FUNCTIONS
// Extract class names from an object
function extractClassNames(obj) {
  if (!obj) return [];
  return Object.keys(obj).filter((key) => {
    try {
      const val = obj[key];
      return typeof val === "function" && val.toString().startsWith("class");
    } catch (e) {
      return false;
    }
  });
}

/**
 * Returns the active graphics namespace (PixiJSEdu or SvgJSEdu).
 * Uses the renderer selector if available, otherwise falls back to PixiJSEdu.
 */
function getActiveGraphicsNamespace() {
  if (typeof getRendererNamespace === "function") {
    return getRendererNamespace();
  }
  // Fallback order
  if (typeof PixiJSEdu !== "undefined") return PixiJSEdu;
  if (typeof SvgJSEdu !== "undefined") return SvgJSEdu;
  return {};
}

/**
 * Returns the active renderer type ('pixi' or 'svg').
 */
function getActiveRendererType() {
  if (typeof getActiveRenderer === "function") {
    return getActiveRenderer();
  }
  return "pixi"; // default
}

// Replace bare class names with their fully qualified namespace equivalents
function replacer(code) {
  const rendererType = getActiveRendererType();
  const graphicsNs = getActiveGraphicsNamespace();
  const graphicsNsName = rendererType === "svg" ? "SvgJSEdu" : "PixiJSEdu";

  if (
    rendererType === "pixi" &&
    typeof PixiJSEdu !== "undefined" &&
    typeof PIXI !== "undefined"
  ) {
    // Qualify classes that inherit from PIXI.Container
    const pixiReplacements = Object.keys(PixiJSEdu).filter((key) => {
      const val = PixiJSEdu[key];
      return (
        typeof val === "function" && val.prototype instanceof PIXI.Container
      );
    });

    pixiReplacements.forEach((word) => {
      const regex = new RegExp(`\\b(${word})\\b(?=\\s*\\()`, "g");
      code = code.replace(regex, `PixiJSEdu.$1`);
    });
  } else if (rendererType === "svg" && typeof SvgJSEdu !== "undefined") {
    // Qualify all function-valued exports in the SvgJSEdu namespace
    const svgReplacements = Object.keys(SvgJSEdu).filter((key) => {
      const val = SvgJSEdu[key];
      return typeof val === "function";
    });

    svgReplacements.forEach((word) => {
      // Skip BoardGUI – the Board alias is handled separately
      if (word === "BoardGUI") return;
      const regex = new RegExp(`\\b(${word})\\b(?=\\s*\\()`, "g");
      code = code.replace(regex, `SvgJSEdu.$1`);
    });
  }

  // Always qualify HtmlSvgEdu UI classes regardless of the active renderer
  if (typeof HtmlSvgEdu !== "undefined") {
    const uiReplacements = Object.keys(HtmlSvgEdu).filter((key) => {
      const val = HtmlSvgEdu[key];
      return (
        typeof val === "function" &&
        val.prototype instanceof HtmlSvgEdu.Component
      );
    });

    uiReplacements.forEach((word) => {
      const regex = new RegExp(`\\b(${word})\\b(?=\\s*\\()`, "g");
      code = code.replace(regex, `HtmlSvgEdu.$1`);
    });
  }

  return code;
}

// Copy selected text to clipboard
function copySelectedText() {
  const editor = document.querySelector(".CodeMirror").CodeMirror;
  const selectedText = editor.getSelection();

  if (!selectedText) {
    return;
  }

  navigator.clipboard
    .writeText(selectedText)
    .then(() => {
      // nothing to do on success
    })
    .catch((err) => {
      console.error(err);
    });
}

// LINTING FUNCTIONS
// Custom linter for JavaScript with special handling for framework classes
function customLinter(text, options) {
  const defaultOptions = {
    esversion: 9,
    asi: true,
    browser: true,
    devel: true,
    undef: true,
    unused: false,
    globals: {
      PixiJSEdu: true,
      SvgJSEdu: true,
      HtmlSvgEdu: true,
      PIXI: true,
      SVG: true,
      isSafe: true,
      Board: true,
      BoardSVG: true,
      replacer: true,
      editor: true,
      addTab: true,
      CodeMirror: true,
    },
  };

  const lintOptions = Object.assign(
    {},
    defaultOptions,
    {
      "-W027": true,
    },
    options,
  );

  JSHINT(text, lintOptions);
  const errors = JSHINT.errors || [];

  const ignoreErrors = [
    "Expected an assignment or function call",
    "unreachable code after return statement",
    "'PixiJSEdu' is not defined",
    "'SvgJSEdu' is not defined",
    "'HtmlSvgEdu' is not defined",
    "'PIXI' is not defined",
    "'SVG' is not defined",
    "'BoardSVG' is not defined",
  ];

  // Collect known class names from all framework namespaces for error filtering
  const knownFrameworkClasses = [
    ...extractClassNames(HtmlSvgEdu),
    ...(typeof PixiJSEdu !== "undefined" ? extractClassNames(PixiJSEdu) : []),
    ...(typeof SvgJSEdu !== "undefined" ? extractClassNames(SvgJSEdu) : []),
    "Board",
    "BoardSVG",
  ];

  return errors
    .filter((err) => {
      if (!err) return false;

      if (ignoreErrors.some((msg) => err.reason.includes(msg))) {
        return false;
      }

      if (
        err.reason.includes("is not defined") &&
        knownFrameworkClasses.some((cls) => err.reason.includes(cls))
      ) {
        return false;
      }

      return true;
    })
    .map((err) => ({
      message: err.reason,
      severity: err.code && err.code.startsWith("E") ? "error" : "warning",
      from: CodeMirror.Pos(err.line - 1, err.character - 1),
      to: CodeMirror.Pos(err.line - 1, err.character),
    }));
}

// EDITOR FUNCTIONALITY
// Resize the editor to fit available space, with portrait-mode support
function resizeEditor() {
  const actions = document.querySelector(".actions");
  const header = document.querySelector(".header");
  const editorElement = window.editor
    ? window.editor.getWrapperElement()
    : null;

  if (!editorElement) return;

  const isPortraitMode =
    window.innerWidth <= 768 ||
    (window.innerHeight > window.innerWidth && window.innerWidth <= 1024);

  if (isPortraitMode) {
    window.editor.setSize(null, "auto");
    editorElement.style.height = "auto";

    const scrollElement = editorElement.querySelector(".CodeMirror-scroll");
    if (scrollElement) {
      scrollElement.style.height = "auto";
      scrollElement.style.minHeight = "300px";
      scrollElement.style.maxHeight = "none";
      scrollElement.style.overflowY = "visible";
    }

    const sizerElement = editorElement.querySelector(".CodeMirror-sizer");
    if (sizerElement) {
      sizerElement.style.minHeight = "300px";
    }

    const formElement = document.querySelector(".form-container");
    if (formElement) {
      formElement.style.height = "auto";
      formElement.style.minHeight = "300px";
    }
  } else {
    const h = window.innerHeight - (actions.offsetHeight + header.offsetHeight);

    window.editor.setSize(null, h);
    editorElement.style.height = h + "px";

    const scrollElement = editorElement.querySelector(".CodeMirror-scroll");
    if (scrollElement) {
      scrollElement.style.height = h + "px";
      scrollElement.style.minHeight = h + "px";
      scrollElement.style.maxHeight = "";
      scrollElement.style.overflowY = "";
    }

    const formElement = document.querySelector(".form-container");
    if (formElement) {
      formElement.style.height = h - 30 + "px";
      formElement.style.minHeight = h - 30 + "px";
    }
  }

  if (window.editor && window.editor.refresh) {
    setTimeout(() => {
      window.editor.refresh();
    }, 10);
  }
}

// Add button to line in gutter
function addButtonToLine(cm, line) {
  const marker = document.createElement("div");
  marker.className = "form-Start-btn";

  marker.innerHTML =
    '<span style="' +
    "display: inline-block;" +
    "width: 16px;" +
    "height: 16px;" +
    "line-height: 16px;" +
    "text-align: center;" +
    "background: #4CAF50;" +
    "color: white;" +
    "border-radius: 50%;" +
    "font-size: 11px;" +
    "font-weight: bold;" +
    "font-style: italic;" +
    "font-family: Georgia, serif;" +
    "cursor: pointer;" +
    "margin-left: -2px;" +
    "transform: translateY(-1px);" +
    '">i</span>';

  marker.onclick = () => {
    editor.setCursor({ line });
    checkForNewStatement();
  };

  cm.setGutterMarker(line, "custom-gutter", marker);
}

// Check if line has lint errors or warnings
function hasLintErrors(line) {
  if (!editor.state || !editor.state.lint || !editor.state.lint.marked) {
    return false;
  }

  const markers = editor.state.lint.marked;
  return markers.some((mark) => {
    const pos = mark.find();
    return pos && pos.from.line === line;
  });
}

// Update gutter buttons based on code content
function updateGutterButtons() {
  editor.clearGutter("custom-gutter");

  editor.eachLine((lineHandle) => {
    const text = lineHandle.text;
    const lineNum = editor.getLineNumber(lineHandle);

    if (isValidNewStatement(text) && !hasLintErrors(lineNum)) {
      addButtonToLine(editor, lineNum);
    }
  });
}

// Clear error markers from editor
function clearErrorMarkers() {
  if (editor.runtimeErrorMarkers) {
    editor.runtimeErrorMarkers.forEach(({ widget, marker }) => {
      editor.removeLineWidget(widget);
      marker.clear();
    });
    editor.runtimeErrorMarkers = [];
  }
}

// CLASS DETECTION & FORM HANDLING
// Regular expressions for detecting class instantiations
const ASSIGNMENT_REGEX =
  /(?:const|let|var)?\s*([A-Za-z0-9_]+)\s*=\s*new\s+([A-Za-z0-9_]+)\s*\(/;
const SIMPLE_NEW_REGEX = /new\s+([A-Za-z0-9_]+)\s*\(/;

/**
 * Looks up a class in the active graphics namespace and HtmlSvgEdu.
 * Handles the Board alias (Board / BoardSVG → BoardGUI in the namespace).
 */
function findClassSource(className) {
  const ns = getActiveGraphicsNamespace();

  // "Board" and "BoardSVG" are both aliases for "BoardGUI" inside the namespace
  let lookupName = className;
  if (className === "Board" || className === "BoardSVG") {
    lookupName = "BoardGUI";
  }

  // 1. Active graphics namespace
  if (ns && ns[lookupName]) return ns[lookupName];

  // 2. Explicit fallback across both namespaces
  if (typeof PixiJSEdu !== "undefined" && PixiJSEdu[lookupName])
    return PixiJSEdu[lookupName];
  if (typeof SvgJSEdu !== "undefined" && SvgJSEdu[lookupName])
    return SvgJSEdu[lookupName];

  // 3. HtmlSvgEdu
  if (typeof HtmlSvgEdu !== "undefined" && HtmlSvgEdu[lookupName])
    return HtmlSvgEdu[lookupName];

  return null;
}

// Check if a text block contains a valid new statement for a known class
function isValidNewStatement(text) {
  const normalizedText = text.replace(/\s+/g, " ").trim();

  let match =
    normalizedText.match(ASSIGNMENT_REGEX) ||
    normalizedText.match(SIMPLE_NEW_REGEX);

  if (!match) return false;

  let className = match[2] || match[1];

  const classSource = findClassSource(className);

  if (!classSource) return false;

  return !!classSource.serializationMap;
}

// Parse and analyze the constructor statement at the current cursor position
function parseConstructorStatement() {
  const cursor = editor.getCursor();

  let completeStatement = "";
  let startLine = cursor.line;
  let endLine = cursor.line;

  while (startLine >= 0) {
    const line = editor.getLine(startLine);
    completeStatement = line + "\n" + completeStatement;

    if (line.includes("=") || line.includes("new ")) {
      break;
    }
    startLine--;
  }

  let parenCount = 0;
  let foundStart = false;

  for (let i = startLine; i <= editor.lastLine(); i++) {
    const line = editor.getLine(i);

    if (i > startLine) {
      completeStatement += "\n" + line;
    }

    for (let char of line) {
      if (char === "(") {
        parenCount++;
        foundStart = true;
      } else if (char === ")") {
        parenCount--;
        if (foundStart && parenCount === 0) {
          endLine = i;
          break;
        }
      }
    }

    if (foundStart && parenCount === 0) {
      break;
    }
  }

  const normalizedStatement = completeStatement.replace(/\s+/g, " ").trim();

  // Try to match as assignment first
  let match = normalizedStatement.match(
    /(?:const|let|var)?\s*([A-Za-z0-9_]+)\s*=\s*new\s+([A-Za-z0-9_]+)\s*\((.*)\)/,
  );
  let variableName = null;

  if (match) {
    variableName = match[1];
    let className = match[2];

    const classSource = findClassSource(className);
    if (!classSource) return null;

    // Board and BoardSVG are both displayed as BoardGUI in the form
    const displayClassName =
      className === "Board" || className === "BoardSVG"
        ? "BoardGUI"
        : className;

    const serializationMap = classSource.serializationMap;
    if (!serializationMap) return null;

    return {
      className: displayClassName,
      constructorArgs: match[3],
      serializationMap,
      variableName,
    };
  }

  // Try to match simple new expression
  match = normalizedStatement.match(/new\s+([A-Za-z0-9_]+)\s*\((.*)\)/);
  if (match) {
    const className = match[1];
    const constructorArgs = match[2];

    const classSource = findClassSource(className);
    if (!classSource) return null;

    const displayClassName =
      className === "Board" || className === "BoardSVG"
        ? "BoardGUI"
        : className;

    const serializationMap = classSource.serializationMap;
    if (!serializationMap) return null;

    return {
      className: displayClassName,
      constructorArgs,
      serializationMap,
      variableName: null,
    };
  }

  return null;
}

// Check for and handle new statements at current cursor position
function checkForNewStatement() {
  const constructorInfo = parseConstructorStatement();
  if (!constructorInfo) return null;

  const { className, constructorArgs, serializationMap, variableName } =
    constructorInfo;
  const resultJson = processConstructorArgs(
    className,
    constructorArgs,
    serializationMap,
    variableName,
  );

  if (serializationMap.setter) {
    resultJson.setter = {};
    Object.entries(serializationMap.setter).forEach(([key, value]) => {
      resultJson.setter[key] = value;
    });
  }

  if (serializationMap.methods) {
    resultJson.methods = {};
    Object.entries(serializationMap.methods).forEach(([key, value]) => {
      resultJson.methods[key] = value;
    });
  }

  generateFormFromJSON(resultJson, variableName);
  return resultJson;
}

// CODE EXECUTION
function runCode() {
  const leftActions = document.getElementById("left-actions");
  const rightActions = document.getElementById("right-actions");

  leftActions.style.display = "flex";
  rightActions.style.display = "flex";

  clearErrorMarkers();

  if (typeof window.clearMessageLog === "function") {
    window.clearMessageLog();
  }

  // Apply renderer aliases before executing user code so that bare names like
  // Board, Rectangle, Circle etc. resolve to the correct namespace (PixiJSEdu
  // or SvgJSEdu) depending on the currently selected renderer.
  if (typeof window.applyRendererAliases === "function") {
    window.applyRendererAliases();
  }

  code = editor.getValue();

  code = code.replace(/\\(?!\\)/g, "\\\\");

  const activeTab = document.querySelector(".tab.active");
  let tabName = activeTab ? activeTab.getAttribute("data-tab") : "Tab 1";
  const previewCode = document.getElementById("preview-" + tabName);

  const preview = document.getElementById("preview");

  preview.style.visibility = "hidden";
  previewCode.innerHTML = "";

  code = replacer(code);

  // Inject instance names for debugging
  function injectNames(code) {
    const lines = code.split("\n");
    let result = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      result.push(line);

      const declMatch = line.match(
        /^(?:const|let|var)\s+(\w+)\s*=\s*new\s+[\w.]+\s*\((.*)/,
      );
      if (declMatch) {
        const varName = declMatch[1];
        let rest = declMatch[2];

        if (rest.includes(")")) {
          result.push(`${varName}.instanceName = "${varName}";`);
        } else {
          let openParens = 1;

          while (i + 1 < lines.length && openParens > 0) {
            i++;
            const nextLine = lines[i];
            result.push(nextLine);

            for (let char of nextLine) {
              if (char === "(") openParens++;
              else if (char === ")") openParens--;
            }

            if (openParens === 0) {
              result.push(`${varName}.instanceName = "${varName}";`);
              break;
            }
          }
        }
      }
    }

    return result.join("\n");
  }

  setTimeout(() => {
    // In SVG mode, inject "const Board = BoardSVG;" so user code using "new Board(...)"
    // automatically targets the SVG renderer.
    const rendererAlias =
      typeof getActiveRendererType === "function" &&
      getActiveRendererType() === "svg"
        ? "const Board = BoardSVG;"
        : "";

    try {
      if (isSafe(code)) {
        let preparedCode = injectNames(code);

        // Wrap console calls to redirect output to the message panel.
        // Rate-limiting prevents a runaway loop from flooding the UI.
        preparedCode = `
                (function() {
                    const __maxMsgs = 10;
                    let __msgCount = 0;
                    let __limitReached = false;

                    const console = {
                        log: function(...args) {
                            if (__limitReached) return;
                            __msgCount++;
                            if (__msgCount > __maxMsgs) {
                                __limitReached = true;
                                window.logEvalMessage('Limit erreicht: Nur die letzten ' + __maxMsgs + ' console.log-Meldungen werden angezeigt. Weitere Aufrufe werden ignoriert.', 'info');
                                return;
                            }
                            window.logEvalMessage(args.join(' '), 'log');
                        },
                        error: function(...args) {
                            window.logEvalMessage(args.join(' '), 'error');
                        },
                        info: function(...args) {
                            window.logEvalMessage(args.join(' '), 'info');
                        }
                    };
                    ${rendererAlias}
                    ${preparedCode}
                })();
        `;

        // Destroy any existing Board singleton before re-running so resources
        // from the previous execution are fully released. INSTANCE_KEY is a
        // global defined in PixiJSEdu.js.

        // PixiJS Board instance
        if (
          typeof Board !== "undefined" &&
          typeof INSTANCE_KEY !== "undefined" &&
          Board[INSTANCE_KEY]
        ) {
          const existingInstance = Board[INSTANCE_KEY];
          if (
            existingInstance &&
            typeof existingInstance.destroy === "function"
          ) {
            try {
              existingInstance.destroy();
            } catch (e) {
              console.warn(
                "Fehler beim Zerstören der PixiJS Board-Instanz:",
                e,
              );
            }
            delete Board[INSTANCE_KEY];
          }
        }

        // SVG Board instance
        if (
          typeof BoardSVG !== "undefined" &&
          typeof INSTANCE_KEY !== "undefined" &&
          BoardSVG[INSTANCE_KEY]
        ) {
          const existingSvgInstance = BoardSVG[INSTANCE_KEY];
          if (
            existingSvgInstance &&
            typeof existingSvgInstance.destroy === "function"
          ) {
            try {
              existingSvgInstance.destroy();
            } catch (e) {
              console.warn("Fehler beim Zerstören der SVG Board-Instanz:", e);
            }
            delete BoardSVG[INSTANCE_KEY];
          }
        }

        // Clean up the PIXI Application if one exists
        if (window.app) {
          try {
            if (window.app.ticker) window.app.ticker.stop();
            window.app.destroy(true, {
              children: true,
              texture: true,
              baseTexture: true,
            });
          } catch (e) {
            // ignore
          }
          window.app = null;
        }

        // Clean up SVG root if one exists
        if (typeof svgRoot !== "undefined" && svgRoot) {
          try {
            svgRoot.remove();
          } catch (e) {
            // ignore
          }
          svgRoot = null;
        }

        // Clear the canvas container
        const canvasContainer = document.getElementById("canvas-container");
        if (canvasContainer) {
          while (canvasContainer.firstChild) {
            canvasContainer.removeChild(canvasContainer.firstChild);
          }
        }

        eval(preparedCode);
      } else {
      }
    } catch (err) {
      const stackLines = err.stack ? err.stack.split("\n") : [];
      let lineNumber = null;

      for (let i = 0; i < stackLines.length; i++) {
        if (stackLines[i].includes("eval")) {
          const match = stackLines[i].match(/eval:(\d+):\d+/);
          if (match) {
            lineNumber = parseInt(match[1]) - (rendererAlias ? 15 : 14);
            break;
          }
        }
      }

      window.logEvalMessage(err.message || err.toString(), "error", lineNumber);
    }
  }, 50);

  setTimeout(() => {
    preview.style.visibility = "visible";
  }, 50);

  setTimeout(() => {
    // Retrieve the board instance in a renderer-agnostic way
    let boardInstance = null;

    if (
      typeof Board !== "undefined" &&
      typeof Board.getInstance === "function"
    ) {
      boardInstance = Board.getInstance();
    }
    // Additional fallback for the SVG renderer
    if (
      !boardInstance &&
      typeof BoardSVG !== "undefined" &&
      typeof BoardSVG.getInstance === "function"
    ) {
      boardInstance = BoardSVG.getInstance();
    }

    if (boardInstance && typeof boardInstance.resizeCanvas === "function") {
      boardInstance.resizeCanvas();
    }

    preview.style.visibility = "visible";
  }, 50);
}

// INITIALIZATION
// Register custom linting helper
CodeMirror.registerHelper("lint", "javascript", customLinter);

// Register custom autocomplete helper
CodeMirror.registerHelper("hint", "custom", function (editor) {
  var cursor = editor.getCursor();
  var token = editor.getTokenAt(cursor);

  if (token.string === ".") {
    var line = editor.getLine(cursor.line);
    var beforeDot = line.slice(0, token.start).trim().split(".").pop();

    try {
      var obj = eval(beforeDot);

      if (obj) {
        var suggestions = Object.getOwnPropertyNames(obj)
          .concat(Object.keys(obj))
          .filter((item, pos, arr) => arr.indexOf(item) === pos);

        return {
          list: suggestions,
          from: { line: cursor.line, ch: token.start + 1 },
          to: { line: cursor.line, ch: cursor.ch },
        };
      }
    } catch (e) {
      console.warn("No valid object found:", e);
    }
  }

  return { list: [], from: cursor, to: cursor };
});

// Add comprehensive styles for the editor
const style = document.createElement("style");
style.textContent = `
/* Runtime error styling */
.runtime-error-widget {
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 3px solid #f44336;
  padding: 5px;
  margin: 5px 0;
  display: flex;
  align-items: center;
}

.error-icon {
  margin-right: 8px;
  color: #f44336;
}

.error-message {
  color: #f44336;
  font-family: monospace;
}

.runtime-error-line {
  background-color: rgba(244, 67, 54, 0.1);
  text-decoration: wavy underline #f44336;
}

/* Lint markers */
.CodeMirror-lint-marker-error,
.CodeMirror-lint-marker-warning {
  cursor: pointer;
  margin-left: 3px;
}

.CodeMirror-lint-mark-error {
  text-decoration: wavy underline #f44336;
}

.CodeMirror-lint-mark-warning {
  text-decoration: wavy underline #ff9800;
}

/* Bracket matching styles */
.CodeMirror-matchingbracket {
  background-color: rgba(99, 102, 241, 0.2) !important;
  color: #6366f1 !important;
  font-weight: bold;
  outline: 1px solid rgba(99, 102, 241, 0.5);
  outline-offset: -1px;
  border-radius: 2px;
}

.CodeMirror-nonmatchingbracket {
  background-color: rgba(244, 67, 54, 0.2) !important;
  color: #ef4444 !important;
  font-weight: bold;
  outline: 1px solid rgba(244, 67, 54, 0.5);
  outline-offset: -1px;
  border-radius: 2px;
}

/* Alternative subtle bracket matching (add .subtle class to use) */
.CodeMirror-matchingbracket.subtle {
  background-color: rgba(99, 102, 241, 0.1);
  color: inherit;
  outline: 1px solid rgba(99, 102, 241, 0.3);
  outline-offset: -1px;
  border-radius: 1px;
}

.CodeMirror-activeline-background {
  background: rgba(99, 102, 241, 0.1) !important;
}

.CodeMirror-cursor {
  border-left: 2px solid #6366f1;
  border-right: none;
  width: 0;
}

.CodeMirror-selected {
  background: rgba(99, 102, 241, 0.2) !important;
}

/* Matching text highlighting */
.cm-matchhighlight {
  background-color: rgba(255, 255, 0, 0.3);
  border-radius: 2px;
}

.CodeMirror {
  color: var(--text-light) !important;
}

.CodeMirror .CodeMirror-code {
  color: var(--text-light) !important;
}

.CodeMirror-lines {
  color: var(--text-light) !important;
}

.CodeMirror .cm-variable {
  color: var(--text-light) !important;
}

.CodeMirror .cm-variable-2 {
  color: var(--text-light) !important;
}

.CodeMirror .cm-variable-3 {
  color: var(--text-light) !important;
}

.CodeMirror .cm-def {
  color: var(--text-light) !important;
}

.CodeMirror .cm-property {
  color: var(--text-light) !important;
}

.CodeMirror .cm-atom {
  color: var(--text-light) !important;
}

.CodeMirror .cm-meta {
  color: var(--text-light) !important;
}

.CodeMirror .cm-qualifier {
  color: var(--text-light) !important;
}

.CodeMirror .cm-builtin {
  color: var(--text-light) !important;
}

.CodeMirror .cm-bracket {
  color: var(--text-light) !important;
}

.CodeMirror .cm-tag {
  color: var(--text-light) !important;
}

.CodeMirror .cm-attribute {
  color: var(--text-light) !important;
}

.CodeMirror .cm-comment {
  color: #808080 !important;
  font-style: italic;
}

/* Narrow line-number column */
.CodeMirror-linenumbers {
  width: 28px !important;
  min-width: 20px !important;
}

.CodeMirror-linenumber {
  padding: 0 3px 0 2px !important;
  min-width: 20px !important;
  text-align: right !important;
}

/* Performance optimisations for faster double-click response */
.CodeMirror {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

.CodeMirror-lines {
  cursor: text;
  will-change: auto;
}

.CodeMirror-code > div:hover {
  transition: none !important;
}

/* Disable transitions during selection for snappier feel */
.CodeMirror-selected,
.CodeMirror-selectedtext,
.CodeMirror-line::selection,
.CodeMirror-line > span::selection,
.CodeMirror-line > span > span::selection {
  transition: none !important;
}

.CodeMirror-cursors {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}

.CodeMirror-sizer {
  min-height: auto !important;
}

.CodeMirror-vscrollbar,
.CodeMirror-hscrollbar {
  outline: none;
}

.CodeMirror {
  font-size: 15px !important;
}

.CodeMirror-lines {
  line-height: 1.4 !important;
}
`;
document.head.appendChild(style);

// Main initialization
document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("code");

  const initialTheme = window.getCodeMirrorTheme
    ? window.getCodeMirrorTheme()
    : "neat";

  editor = CodeMirror.fromTextArea(textarea, {
    mode: "javascript",
    theme: initialTheme,
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: [
      "CodeMirror-linenumbers",
      "CodeMirror-foldgutter",
      "CodeMirror-lint-markers",
      "custom-gutter",
    ],

    autoIndent: true,
    smartIndent: true,
    electricChars: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,

    matchBrackets: true,
    autoCloseBrackets: true,

    styleActiveLine: true,
    showCursorWhenSelecting: true,
    dragDrop: true,

    configureMouse: function (cm, repeat, event) {
      if (repeat === "double") {
        const pos = cm.coordsChar({ left: event.clientX, top: event.clientY });
        const word = cm.findWordAt(pos);
        cm.setSelection(word.anchor, word.head);
        return { unit: "word" };
      }
      return {};
    },

    viewportMargin: 10,
    maxHighlightLength: 10000,

    extraKeys: {
      "Ctrl-Space": "autocomplete",
      Tab: function (cm) {
        if (cm.getSelection()) {
          cm.indentSelection("add");
        } else {
          if (cm.options.indentWithTabs) {
            cm.replaceSelection("\t");
          } else {
            const spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
            cm.replaceSelection(spaces);
          }
        }
      },
      "Shift-Tab": function (cm) {
        cm.indentSelection("subtract");
      },
      "Ctrl-/": function (cm) {
        cm.toggleComment();
      },
      "Ctrl-D": function (cm) {
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        cm.replaceRange(line + "\n", { line: cursor.line + 1, ch: 0 });
      },
      "Alt-Up": function (cm) {
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        if (cursor.line > 0) {
          const prevLine = cm.getLine(cursor.line - 1);
          cm.replaceRange(
            line + "\n",
            { line: cursor.line - 1, ch: 0 },
            { line: cursor.line, ch: 0 },
          );
          cm.replaceRange(
            prevLine,
            { line: cursor.line, ch: 0 },
            { line: cursor.line + 1, ch: 0 },
          );
          cm.setCursor({ line: cursor.line - 1, ch: cursor.ch });
        }
      },
      "Alt-Down": function (cm) {
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        if (cursor.line < cm.lineCount() - 1) {
          const nextLine = cm.getLine(cursor.line + 1);
          cm.replaceRange(
            nextLine + "\n",
            { line: cursor.line, ch: 0 },
            { line: cursor.line + 1, ch: 0 },
          );
          cm.replaceRange(
            line,
            { line: cursor.line + 1, ch: 0 },
            { line: cursor.line + 2, ch: 0 },
          );
          cm.setCursor({ line: cursor.line + 1, ch: cursor.ch });
        }
      },
    },

    lint: true,
    hintOptions: { hint: CodeMirror.hint.custom },

    highlightSelectionMatches: {
      minChars: 2,
      trim: true,
      style: "matchhighlight",
      delay: 50,
    },
  });

  editor.setOption("pollInterval", 50);

  let changeEventsEnabled = false;

  editor.on("beforeChange", function (cm, changeObj) {
    if (
      changeObj.text.length === 2 &&
      changeObj.text[0] === "" &&
      changeObj.text[1] === ""
    ) {
      const pos = changeObj.from;
      const prevChar = cm.getRange(
        { line: pos.line, ch: Math.max(0, pos.ch - 1) },
        pos,
      );

      const nextChar = cm.getRange(pos, { line: pos.line, ch: pos.ch + 1 });

      if (
        (prevChar === "{" && nextChar === "}") ||
        (prevChar === "[" && nextChar === "]") ||
        (prevChar === "(" && nextChar === ")")
      ) {
        const line = cm.getLine(pos.line);
        const indent = line.match(/^\s*/)[0];
        const indentUnit = " ".repeat(cm.getOption("indentUnit"));

        const newIndent = indent + indentUnit;

        changeObj.update(changeObj.from, changeObj.to, ["", newIndent, indent]);

        setTimeout(() => {
          cm.setCursor({ line: pos.line + 1, ch: newIndent.length });
        }, 0);
      }
    }
  });

  editor.on("inputRead", function (cm, changeObj) {
    if (changeObj.text[0] === ".") {
      cm.showHint();
    }

    if (changeObj.text[0] === "}" || changeObj.text[0] === "]") {
      const pos = changeObj.from;
      cm.indentLine(pos.line);
    }
  });

  addTab();
  resizeEditor();

  let copyBtnTimeout = null;
  editor.on("cursorActivity", function (cm) {
    if (copyBtnTimeout) clearTimeout(copyBtnTimeout);

    copyBtnTimeout = setTimeout(() => {
      const selectedText = cm.getSelection();
      const copyBtn = document.getElementById("copy-btn");
      if (copyBtn) {
        copyBtn.style.display = selectedText ? "inline-flex" : "none";
      }
    }, 10);
  });

  setTimeout(() => {
    changeEventsEnabled = true;

    editor.on("change", () => {
      if (!changeEventsEnabled) return;

      const code = editor.getValue();

      if (window.contentMarks) {
        window.contentMarks.forEach((mark) => mark.clear());
        window.contentMarks = [];
      } else {
        window.contentMarks = [];
      }

      // 1. Mask SVG literals
      const svgRegex = /`?<svg[\s\S]*?<\/svg>`?/gi;
      let match;

      while ((match = svgRegex.exec(code)) !== null) {
        const startIndex = match.index;
        const endIndex = match.index + match[0].length;

        const span = document.createElement("span");
        span.textContent = "🎨 SVG";
        span.style.color = "#6B7280";
        span.style.fontStyle = "italic";
        span.style.fontWeight = "500";
        span.style.backgroundColor = "rgba(99, 102, 241, 0.1)";
        span.style.border = "1px solid rgba(99, 102, 241, 0.3)";
        span.style.padding = "3px 8px";
        span.style.borderRadius = "6px";
        span.style.cursor = "text";
        span.style.fontSize = "0.9em";
        span.style.letterSpacing = "0.5px";

        span.setAttribute("data-svg-content", match[0]);

        const mark = editor.markText(
          editor.posFromIndex(startIndex),
          editor.posFromIndex(endIndex),
          {
            replacedWith: span,
            atomic: true,
            handleMouseEvents: true,
          },
        );

        span.addEventListener("click", function () {
          const pos = editor.posFromIndex(endIndex);
          editor.setCursor(pos);
          editor.focus();
        });

        window.contentMarks.push(mark);
      }

      // 2. Mask base64 PNG literals
      const base64PngRegex = /"data:image\/png;base64,[A-Za-z0-9+/=]+"/gi;
      base64PngRegex.lastIndex = 0;

      while ((match = base64PngRegex.exec(code)) !== null) {
        const startIndex = match.index;
        const endIndex = match.index + match[0].length;

        const span = document.createElement("span");
        span.textContent = "🎨 PNG";
        span.style.color = "#059669";
        span.style.fontStyle = "italic";
        span.style.fontWeight = "500";
        span.style.backgroundColor = "rgba(5, 150, 105, 0.1)";
        span.style.border = "1px solid rgba(5, 150, 105, 0.3)";
        span.style.padding = "3px 8px";
        span.style.borderRadius = "6px";
        span.style.cursor = "text";
        span.style.fontSize = "0.9em";
        span.style.letterSpacing = "0.5px";

        span.setAttribute("data-base64-content", match[0]);

        const base64Length = match[0].length;
        const sizeKB = Math.round((base64Length * 0.75) / 1024);
        span.title = `Base64 PNG (≈${sizeKB}KB)`;

        const mark = editor.markText(
          editor.posFromIndex(startIndex),
          editor.posFromIndex(endIndex),
          {
            replacedWith: span,
            atomic: true,
            handleMouseEvents: true,
          },
        );

        span.addEventListener("click", function () {
          const pos = editor.posFromIndex(endIndex);
          editor.setCursor(pos);
          editor.focus();
        });

        window.contentMarks.push(mark);
      }

      // 3. Mask other base64 image formats
      const base64ImageRegex =
        /"data:image\/(jpeg|jpg|gif|webp|bmp);base64,[A-Za-z0-9+/=]+"/gi;
      base64ImageRegex.lastIndex = 0;

      while ((match = base64ImageRegex.exec(code)) !== null) {
        const startIndex = match.index;
        const endIndex = match.index + match[0].length;
        const imageType = match[1].toUpperCase();

        const span = document.createElement("span");
        span.textContent = `🖼️ ${imageType}`;
        span.style.color = "#DC2626";
        span.style.fontStyle = "italic";
        span.style.fontWeight = "500";
        span.style.backgroundColor = "rgba(220, 38, 38, 0.1)";
        span.style.border = "1px solid rgba(220, 38, 38, 0.3)";
        span.style.padding = "3px 8px";
        span.style.borderRadius = "6px";
        span.style.cursor = "text";
        span.style.fontSize = "0.9em";
        span.style.letterSpacing = "0.5px";

        span.setAttribute("data-base64-content", match[0]);

        const base64Length = match[0].length;
        const sizeKB = Math.round((base64Length * 0.75) / 1024);
        span.title = `Base64 ${imageType} (≈${sizeKB}KB)`;

        const mark = editor.markText(
          editor.posFromIndex(startIndex),
          editor.posFromIndex(endIndex),
          {
            replacedWith: span,
            atomic: true,
            handleMouseEvents: true,
          },
        );

        span.addEventListener("click", function () {
          const pos = editor.posFromIndex(endIndex);
          editor.setCursor(pos);
          editor.focus();
        });

        window.contentMarks.push(mark);
      }

      // 4. Mask X3D scene literals
      const x3dRegex = /`[^`]*<scene[\s\S]*?<\/scene>[^`]*`/gi;
      x3dRegex.lastIndex = 0;

      while ((match = x3dRegex.exec(code)) !== null) {
        const startIndex = match.index;
        const endIndex = match.index + match[0].length;

        const span = document.createElement("span");
        span.textContent = "🌐 X3D";
        span.style.color = "#7C3AED";
        span.style.fontStyle = "italic";
        span.style.fontWeight = "500";
        span.style.backgroundColor = "rgba(124, 58, 237, 0.1)";
        span.style.border = "1px solid rgba(124, 58, 237, 0.3)";
        span.style.padding = "3px 8px";
        span.style.borderRadius = "6px";
        span.style.cursor = "text";
        span.style.fontSize = "0.9em";
        span.style.letterSpacing = "0.5px";

        span.setAttribute("data-x3d-content", match[0]);

        const x3dLength = match[0].length;
        const lines = match[0].split("\n").length;
        span.title = `X3D Scene (${x3dLength} chars, ${lines} lines)`;

        const mark = editor.markText(
          editor.posFromIndex(startIndex),
          editor.posFromIndex(endIndex),
          {
            replacedWith: span,
            atomic: true,
            handleMouseEvents: true,
          },
        );

        span.addEventListener("click", function () {
          const pos = editor.posFromIndex(endIndex);
          editor.setCursor(pos);
          editor.focus();
        });

        window.contentMarks.push(mark);
      }
    });

    editor.on("changes", () => {
      setTimeout(updateGutterButtons, 100);
    });

    updateGutterButtons();
  }, 100);

  window.addEventListener("resize", resizeEditor);

  const formElement = document.querySelector("form");
  if (formElement) {
    formElement.style.display = "none";
  }
});
