/**
 * renderer-selector.js – Switches between the PixiJS and SVG.js renderers.
 *
 * Exposes three functions consumed by CodeEditor.js:
 *   • getActiveRenderer()    → 'pixi' | 'svg'
 *   • getRendererNamespace() → PixiJSEdu | SvgJSEdu
 *   • applyRendererAliases() → sets global aliases (Board → BoardSVG, etc.)
 *
 * @license GNU GPLv3
 * @author Sebastian Rikowski
 */

(function () {
  "use strict";

  let _activeRenderer = "svg";

  try {
    const stored = localStorage.getItem("oal-renderer");
    if (stored === "pixi" || stored === "svg") {
      _activeRenderer = stored;
    }
  } catch (e) {
    // localStorage unavailable — keep default 'svg'
  }

  const RENDERERS = [
    { code: "pixi", name: "PixiJS (Canvas)" },
    { code: "svg", name: "SVG.js (SVG)" },
  ];

  /**
   * Returns the currently active renderer.
   * @returns {'pixi'|'svg'}
   */
  window.getActiveRenderer = function () {
    return _activeRenderer;
  };

  /**
   * Returns the namespace object of the active renderer.
   * @returns {object} PixiJSEdu or SvgJSEdu
   */
  window.getRendererNamespace = function () {
    if (_activeRenderer === "svg" && typeof SvgJSEdu !== "undefined") {
      return SvgJSEdu;
    }
    if (typeof PixiJSEdu !== "undefined") {
      return PixiJSEdu;
    }
    if (typeof SvgJSEdu !== "undefined") return SvgJSEdu;
    return {};
  };

  /**
   * Sets global aliases so user code can use "Board", "Rectangle", etc.
   * regardless of which renderer is selected.
   * Currently a no-op — the Board alias is injected inside runCode().
   */
  window.applyRendererAliases = function () {};

  /**
   * Sets the active renderer and persists the selection.
   * @param {'pixi'|'svg'} type
   * @param {boolean} [autoRerun=true]
   */
  window.setActiveRenderer = function (type, autoRerun) {
    if (type !== "pixi" && type !== "svg") return;
    if (autoRerun === undefined) autoRerun = true;

    var changed = _activeRenderer !== type;
    _activeRenderer = type;

    try {
      localStorage.setItem("oal-renderer", type);
    } catch (e) {}

    _updateSelectorUI();

    if (changed && autoRerun) {
      if (type === "svg" && typeof SVG === "undefined") {
        console.error(
          "SVG.js is not loaded. Make sure " +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.2.5/svg.min.js"></script> ' +
            "is included in index.html.",
        );
        if (typeof window.logEvalMessage === "function") {
          window.logEvalMessage(
            "SVG.js library not found. Please update index.html.",
            "error",
          );
        }
        return;
      }

      if (type === "svg" && typeof SvgJSEdu === "undefined") {
        console.error(
          "SvgJSEdu.js is not loaded. Make sure " +
            '<script src="./src/core/SvgJSEdu.js"></script> ' +
            "is included in index.html.",
        );
        if (typeof window.logEvalMessage === "function") {
          window.logEvalMessage(
            "SvgJSEdu.js framework not found. Please update index.html.",
            "error",
          );
        }
        return;
      }

      if (typeof runCode === "function") {
        setTimeout(function () {
          runCode();
        }, 50);
      }
    }
  };

  function _createRendererSelector() {
    var filebar = document.getElementById("filebar");
    if (!filebar) return;

    if (document.getElementById("renderer-selector-container")) return;

    var container = document.createElement("div");
    container.className = "renderer-selector";
    container.id = "renderer-selector-container";

    var label = document.createElement("span");
    label.className = "renderer-label";
    label.textContent = "Renderer";
    container.appendChild(label);

    var button = document.createElement("button");
    button.className = "regular-button renderer-button";
    button.id = "renderer-button";
    button.title = "Switch renderer";

    var currentRenderer = RENDERERS.find(function (r) {
      return r.code === _activeRenderer;
    });
    button.innerHTML =
      '<span class="renderer-text">' +
      (currentRenderer ? currentRenderer.name : "SVG.js (SVG)") +
      "</span>" +
      '<span class="renderer-arrow">▼</span>';
    container.appendChild(button);

    var dropdown = document.createElement("div");
    dropdown.className = "renderer-dropdown";
    dropdown.id = "renderer-dropdown";

    RENDERERS.forEach(function (renderer) {
      var option = document.createElement("div");
      option.className = "renderer-option";
      option.dataset.renderer = renderer.code;
      option.innerHTML =
        '<span class="renderer-name">' + renderer.name + "</span>";

      option.addEventListener("click", function () {
        window.setActiveRenderer(renderer.code);
        _hideDropdown();
      });

      dropdown.appendChild(option);
    });

    container.appendChild(dropdown);

    if (filebar.firstChild) {
      filebar.insertBefore(container, filebar.firstChild);
    } else {
      filebar.appendChild(container);
    }

    button.addEventListener("click", function (e) {
      e.stopPropagation();
      _toggleDropdown();
    });

    document.addEventListener("click", function (e) {
      if (!container.contains(e.target)) {
        _hideDropdown();
      }
    });

    _updateActiveRenderer();
  }

  function _toggleDropdown() {
    var dropdown = document.getElementById("renderer-dropdown");
    var button = document.getElementById("renderer-button");
    if (!dropdown || !button) return;

    if (dropdown.classList.contains("show")) {
      _hideDropdown();
    } else {
      var buttonRect = button.getBoundingClientRect();
      var containerRect = button.parentElement.getBoundingClientRect();

      dropdown.style.top = buttonRect.bottom - containerRect.top + 2 + "px";

      dropdown.classList.add("show");
      button.classList.add("active");
    }
  }

  function _hideDropdown() {
    var dropdown = document.getElementById("renderer-dropdown");
    var button = document.getElementById("renderer-button");
    if (dropdown) dropdown.classList.remove("show");
    if (button) button.classList.remove("active");
  }

  function _updateSelectorUI() {
    var button = document.getElementById("renderer-button");
    if (button) {
      var textEl = button.querySelector(".renderer-text");
      if (textEl) {
        var current = RENDERERS.find(function (r) {
          return r.code === _activeRenderer;
        });
        textEl.textContent = current ? current.name : _activeRenderer;
      }
    }

    _updateActiveRenderer();
  }

  function _updateActiveRenderer() {
    var options = document.querySelectorAll(".renderer-option");
    options.forEach(function (option) {
      if (option.dataset.renderer === _activeRenderer) {
        option.classList.add("active");
      } else {
        option.classList.remove("active");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _createRendererSelector);
  } else {
    _createRendererSelector();
  }
})();
