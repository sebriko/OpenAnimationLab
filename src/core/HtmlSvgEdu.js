/**
 * HtmlSvgEdu - Educational Animation Library
 * Version: 1.0.1
 * Author: Sebastian Rikowski
 * License: MIT
 *
 * Copyright (c) 2025 Sebastian Rikowski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const HtmlSvgEdu = {};
HtmlSvgEdu.Component = class Component {
  static serializationMap = {
    description: {
      de: "Basis-Klasse für alle HTML UI Komponenten",
      en: "Base class for all HTML UI components",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myComponent = new Component();",
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element",
          de: "Horizontale Position des Elements",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element",
          de: "Vertikale Position des Elements",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
        },
        example: "visible = true",
      },
    },
    methods: {},
  };
  constructor() {
    this._x = 0;
    this._y = 0;
    this._element = null;
    this._visible = true;
  }
  static updateContainerScale(scaleValue) {
    const container = document.getElementById("pixi-ui-overlay");
    if (container) {
      container.style.transform = "scale(" + scaleValue + ")";
      container.style.transformOrigin = "top left";
    }
  }
  _createElement(type) {
    const element = document.createElement(type);
    element.classList.add("pixi-html-ui");
    const uiContainer =
      document.getElementById("pixi-ui-overlay") || this._createUiContainer();
    uiContainer.appendChild(element);
    this._element = element;
    this._applyPosition();
    Board[INSTANCE_KEY].addChild(this);
    return element;
  }
  _createUiContainer() {
    const container = document.createElement("div");
    container.id = "pixi-ui-overlay";
    container.style.position = "absolute";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    document.getElementById("canvas-container").appendChild(container);
    return container;
  }
  _applyPosition() {
    if (!this._element) return;
    const boardHeight = Board[INSTANCE_KEY].height;
    this._element.style.position = "absolute";
    this._element.style.left = this._x + "px";
    this._element.style.top = this._y + "px";
  }
  set x(value) {
    this._x = value;
    this._applyPosition();
  }
  get x() {
    return this._x;
  }
  set y(value) {
    this._y = value;
    this._applyPosition();
  }
  get y() {
    return this._y;
  }
  set visible(value) {
    this._visible = value;
    if (this._element) {
      this._element.style.display = this._visible ? "block" : "none";
    }
  }
  get visible() {
    return this._visible;
  }
  remove() {
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
  }
};
HtmlSvgEdu.Button = class Button extends HtmlSvgEdu.Component {
  static serializationMap = {
    description: {
      de: "Schaltfläche mit Klick-Event",
      en: "Button with click event",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: 'let myButton = new Button("Click me", 100, 40);',
    constructor: {
      label: {
        name: "label",
        info: {
          en: "Label or text of the element",
          de: "Bezeichner oder Text des Elements",
        },
      },
      width: {
        name: "width",
        info: {
          en: "Width of the element in pixels",
          de: "Breite des Elements in Pixeln",
        },
      },
      height: {
        name: "height",
        info: {
          en: "Height of the element in pixels",
          de: "Höhe des Elements in Pixeln",
        },
      },
      font: {
        name: "font",
        info: {
          en: "Font family of the text",
          de: "Schriftart des Textes",
        },
      },
      fontSize: {
        name: "fontSize",
        info: {
          en: "Font size in pixels",
          de: "Schriftgröße in Pixeln",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element",
          de: "Horizontale Position des Elements",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element",
          de: "Vertikale Position des Elements",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
        },
        example: "visible = true",
      },
    },
    methods: {
      onClick: {
        name: "onClick",
        info: {
          en: "Registers a callback that is executed on click",
          de: "Registriert einen Callout, der beim Klick ausgeführt wird",
        },
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
      },
      setText: {
        name: "setText",
        info: {
          en: "Sets the label text of the button",
          de: "Setzt den Beschriftungstext des Buttons",
        },
        example: 'setText("Neuer Text")',
      },
    },
  };
  constructor(label, width, height, font, fontSize) {
    super();
    this._label = label;
    this._width = width;
    this._height = height;
    this._font = font || "Arial";
    this._fontSize = fontSize || 16;
    this._toggleMode = false;
    this._active = false;
    this._clickHandler = null;
    this._element = this._createElement("button");
    this._element.textContent = label;
    this._element.className = "pixi-html-ui pixi-button";
    this._applyStyles();
    this._setupEvents();
  }
  _applyStyles() {
    if (!this._element) return;
    this._element.style.width = this._width + "px";
    this._element.style.height = this._height + "px";
    this._element.style.fontFamily = this._font;
    this._element.style.fontSize = this._fontSize + "px";
    if (this._toggleMode && this._active) {
      this._element.classList.add("active");
    } else {
      this._element.classList.remove("active");
    }
  }
  _setupEvents() {
    if (!this._element) return;
    this._element.addEventListener("click", (e) => {
      if (this._toggleMode) {
        this._active = !this._active;
        this._element.classList.toggle("active", this._active);
      }
      const event = new CustomEvent("button-click", {
        detail: { component: this },
      });
      this._element.dispatchEvent(event);
      if (typeof this._clickHandler === "function") {
        this._clickHandler();
      }
    });
  }
  setText(label) {
    this._text = label;
    if (this._element) {
      this._element.textContent = label;
    }
  }
  setFont(font) {
    this._font = font;
    if (this._element) {
      this._element.style.fontFamily = font;
    }
  }
  setFontSize(fontSize) {
    this._fontSize = fontSize;
    if (this._element) {
      this._element.style.fontSize = fontSize + "px";
    }
  }
  setToggleMode(toggleMode, active) {
    this._toggleMode = toggleMode;
    this._active = active || false;
    if (this._element) {
      this._element.classList.toggle(
        "active",
        this._toggleMode && this._active,
      );
    }
  }
  addClickListener(callback) {
    if (this._element) {
      this._element.addEventListener("button-click", callback);
    }
  }
  removeClickListener(callback) {
    if (this._element) {
      this._element.removeEventListener("button-click", callback);
    }
  }
  onClick(callout) {
    this._clickHandler = callout;
  }
};

HtmlSvgEdu.Checkbox = class Checkbox extends HtmlSvgEdu.Component {
  static serializationMap = {
    description: {
      de: "Kontrollkästchen mit Ein-/Ausschaltzustand",
      en: "Checkbox with on/off state",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: 'let myCheckbox = new Checkbox(true, 20, "Select option");',
    constructor: {
      checked: {
        name: "checked",
        info: {
          en: "Indicates whether the element is selected",
          de: "Gibt an, ob das Element ausgewählt ist",
        },
      },
      size: {
        name: "size",
        info: {
          en: "Size of the element (e.g. 20 for 20px)",
          de: "Größe des Elements (z.B. 20 für 20px)",
        },
      },
      label: {
        name: "label",
        info: {
          en: "Label or text of the element (\\n for line break, <sub></sub> and <sup></sup> for subscript/superscript possible)",
          de: "Bezeichner oder Text des Elements (\\n für Zeilenwechsel, <sub></sub> und <sup></sup> für tiefgestellt/hochgestellt möglich)",
        },
      },
      font: {
        name: "font",
        info: {
          en: "Font family of the text",
          de: "Schriftart des Textes",
        },
      },
      fontSize: {
        name: "fontSize",
        info: {
          en: "Font size in pixels",
          de: "Schriftgröße in Pixeln",
        },
      },
      textColor: {
        name: "textColor",
        info: {
          en: "Text color of the label (e.g. 0x000000)",
          de: "Textfarbe des Labels (z.B. 0x000000)",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element",
          de: "Horizontale Position des Elements",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element",
          de: "Vertikale Position des Elements",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
        },
        example: "visible = true",
      },
      checked: {
        name: "checked",
        info: {
          en: "Indicates whether the element is selected (true/false)",
          de: "Gibt an, ob das Element ausgewählt ist (true/false)",
        },
        example: "checked = true",
      },
    },
    methods: {
      onClick: {
        name: "onClick",
        info: {
          en: "Adds an event listener for changes",
          de: "Fügt einen Event-Listener für Änderungen hinzu",
        },
        example:
          'onClick(handleClick); \n\nfunction handleClick(event) { console.log("Status:", event.value); }',
      },
    },
  };
  constructor(
    checked = false,
    size = 20,
    label = "Checkbox",
    font = "Arial",
    fontSize = 16,
    textColor = 0x000000,
  ) {
    super();
    this._checked = checked;
    this._size = size;
    this._label = label;
    this._font = font;
    this._fontSize = fontSize;
    this._textColor = textColor;
    this._focused = false;
    this._cssTextColor = this._hexToCSS(textColor);

    this._isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
    this._isChrome =
      navigator.userAgent.toLowerCase().indexOf("chrome") > -1 &&
      navigator.userAgent.toLowerCase().indexOf("edg") === -1;
    this._isEdge = navigator.userAgent.toLowerCase().indexOf("edg") > -1;
    this._isSafari =
      navigator.userAgent.toLowerCase().indexOf("safari") > -1 &&
      !this._isChrome &&
      !this._isEdge;

    this._container = this._createElement("div");
    this._container.className = "pixi-html-ui pixi-svg-checkbox-container";
    this._svgElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    this._svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    this._calculateSvgSize();
    this._addStyles();
    this._createCheckboxElements();
    this._container.appendChild(this._svgElement);
    this._element = this._container;
    this._setupEvents();
  }
  _hexToCSS(hexColor) {
    const hex = hexColor.toString(16).padStart(6, "0");
    return "#" + hex;
  }
  _parseHtmlTags(text) {
    const parts = [];
    let currentPos = 0;
    const tagRegex = /<(sub|sup)>(.*?)<\/\1>/gi;
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
      if (match.index > currentPos) {
        const beforeText = text.substring(currentPos, match.index);
        if (beforeText) {
          parts.push({ type: "normal", text: beforeText });
        }
      }
      parts.push({
        type: match[1].toLowerCase(),
        text: match[2],
      });
      currentPos = match.index + match[0].length;
    }
    if (currentPos < text.length) {
      const remainingText = text.substring(currentPos);
      if (remainingText) {
        parts.push({ type: "normal", text: remainingText });
      }
    }
    if (parts.length === 0) {
      parts.push({ type: "normal", text: text });
    }
    return parts;
  }
  _calculateTextDimensions() {
    const lines = this._label.split("\\n");
    let maxLineWidth = 0;
    let totalHeight = 0;
    lines.forEach((line) => {
      const parsedLine = this._parseHtmlTags(line);
      let lineWidth = 0;
      let lineHeight = this._fontSize;
      parsedLine.forEach((part) => {
        let charWidth, partHeight;
        if (part.type === "sub" || part.type === "sup") {
          const subSupSize = this._fontSize * 0.85;
          charWidth = part.text.length * (subSupSize * 0.6);
          partHeight = subSupSize;
        } else {
          charWidth = part.text.length * (this._fontSize * 0.6);
          partHeight = this._fontSize;
        }
        lineWidth += charWidth;
        lineHeight = Math.max(lineHeight, partHeight);
      });
      maxLineWidth = Math.max(maxLineWidth, lineWidth);
      totalHeight += lineHeight;
    });
    if (lines.length > 1) {
      totalHeight += (lines.length - 1) * (this._fontSize * 0.2);
    }
    return {
      width: maxLineWidth,
      height: totalHeight,
      lineCount: lines.length,
      lines: lines,
    };
  }
  _calculateSvgSize() {
    const adaptiveSize = Math.max(this._size, this._fontSize * 0.8);
    const strokeWidth = 2;
    const strokeOffset = strokeWidth / 2;
    const textDimensions = this._calculateTextDimensions();
    const svgWidth =
      strokeOffset +
      adaptiveSize +
      strokeOffset +
      10 +
      textDimensions.width +
      20;
    const basePadding = 30;
    const extraPadding = this._fontSize > 100 ? this._fontSize * 0.3 : 0;
    const minHeight = Math.max(
      adaptiveSize + strokeWidth,
      textDimensions.height,
    );
    const svgHeight = minHeight + basePadding + extraPadding;
    this._svgElement.setAttribute("width", svgWidth);
    this._svgElement.setAttribute("height", svgHeight);
    this._svgElement.setAttribute(
      "viewBox",
      "0 0 " + svgWidth + " " + svgHeight,
    );
    this._adaptiveSize = adaptiveSize;
    this._strokeOffset = strokeOffset;
    this._textDimensions = textDimensions;
  }

  _getSubSupStyles() {
    if (this._isFirefox) {
      return {
        subStyle: "baseline-shift: sub;",
        supStyle: "baseline-shift: super;",
        subDy: this._fontSize * 0.2 + 3,
        supDy: -this._fontSize * 0.3,
        subResetDy: -(this._fontSize * 0.2 + 3),
        supResetDy: this._fontSize * 0.3,
      };
    } else if (this._isChrome || this._isEdge) {
      return {
        subStyle: "baseline-shift: -25%;",
        supStyle: "baseline-shift: 40%;",
        subDy: this._fontSize * 0.1,
        supDy: -this._fontSize * 0.15,
        subResetDy: -(this._fontSize * 0.1),
        supResetDy: this._fontSize * 0.15,
      };
    } else if (this._isSafari) {
      return {
        subStyle: "baseline-shift: -20%;",
        supStyle: "baseline-shift: 35%;",
        subDy: this._fontSize * 0.15,
        supDy: -this._fontSize * 0.2,
        subResetDy: -(this._fontSize * 0.15),
        supResetDy: this._fontSize * 0.2,
      };
    } else {
      return {
        subStyle: "baseline-shift: sub;",
        supStyle: "baseline-shift: super;",
        subDy: this._fontSize * 0.2,
        supDy: -this._fontSize * 0.25,
        subResetDy: -(this._fontSize * 0.2),
        supResetDy: this._fontSize * 0.25,
      };
    }
  }

  _addStyles() {
    const browserStyles = this._getSubSupStyles();
    const style = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style",
    );
    style.textContent =
      "/* Checkbox-Stil */" +
      ".checkbox-container { cursor: pointer; }" +
      ".checkbox-box { " +
      "stroke: #555555; " +
      "stroke-width: 1;" +
      "fill: white;" +
      "}" +
      ".checkbox-container:hover .checkbox-box { stroke: #228B22; }" +
      ".checkbox-check {" +
      "stroke: #228B22;" +
      "stroke-width: 3;" +
      "fill: none;" +
      "stroke-linecap: round;" +
      "stroke-linejoin: round;" +
      "visibility: hidden;" +
      "}" +
      ".checkbox-checked .checkbox-check { visibility: visible; }" +
      ".checkbox-label {" +
      "font-family: " +
      this._font +
      ";" +
      "font-size: " +
      this._fontSize +
      "px;" +
      "fill: " +
      this._cssTextColor +
      ";" +
      "dominant-baseline: middle;" +
      "user-select: none;" +
      "}" +
      ".checkbox-sub {" +
      "font-size: " +
      this._fontSize * 0.85 +
      "px;" +
      browserStyles.subStyle +
      "}" +
      ".checkbox-sup {" +
      "font-size: " +
      this._fontSize * 0.85 +
      "px;" +
      browserStyles.supStyle +
      "}";
    this._svgElement.appendChild(style);
  }
  _createCheckboxElements() {
    const checkboxSize =
      this._adaptiveSize || Math.max(this._size, this._fontSize * 0.8);
    const textDimensions = this._textDimensions;
    const contentWidth = checkboxSize + 10 + textDimensions.width;
    const svgWidth = parseInt(this._svgElement.getAttribute("width"));
    const svgHeight = parseInt(this._svgElement.getAttribute("height"));
    const contentStartX = (svgWidth - contentWidth) / 2;
    const totalContentHeight = Math.max(checkboxSize, textDimensions.height);
    const contentCenterY = svgHeight / 2;
    this._checkboxGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    this._checkboxGroup.setAttribute("class", "checkbox-container");
    this._checkboxGroup.setAttribute(
      "id",
      "checkbox-" + Math.random().toString(36).substr(2, 9),
    );
    if (this._checked) {
      this._checkboxGroup.classList.add("checkbox-checked");
    }
    const checkboxX = contentStartX;
    const checkboxY = contentCenterY - checkboxSize / 2;
    const radius = 3;
    const r = Math.min(radius, checkboxSize / 2);

    const pathData = `
      M ${checkboxX + r} ${checkboxY}
      L ${checkboxX + checkboxSize - r} ${checkboxY}
      Q ${checkboxX + checkboxSize} ${checkboxY} ${checkboxX + checkboxSize} ${checkboxY + r}
      L ${checkboxX + checkboxSize} ${checkboxY + checkboxSize - r}
      Q ${checkboxX + checkboxSize} ${checkboxY + checkboxSize} ${checkboxX + checkboxSize - r} ${checkboxY + checkboxSize}
      L ${checkboxX + r} ${checkboxY + checkboxSize}
      Q ${checkboxX} ${checkboxY + checkboxSize} ${checkboxX} ${checkboxY + checkboxSize - r}
      L ${checkboxX} ${checkboxY + r}
      Q ${checkboxX} ${checkboxY} ${checkboxX + r} ${checkboxY}
      Z
    `
      .trim()
      .replace(/\s+/g, " ");

    this._box = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this._box.setAttribute("d", pathData);
    this._box.setAttribute("class", "checkbox-box");
    this._checkboxGroup.appendChild(this._box);
    this._checkmark = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    this._checkmark.setAttribute("class", "checkbox-check");
    this._checkmark.setAttribute(
      "d",
      "M " +
        (checkboxX + checkboxSize * 0.25) +
        " " +
        (checkboxY + checkboxSize * 0.55) +
        " L " +
        (checkboxX + checkboxSize * 0.45) +
        " " +
        (checkboxY + checkboxSize * 0.75) +
        " L " +
        (checkboxX + checkboxSize * 0.75) +
        " " +
        (checkboxY + checkboxSize * 0.25),
    );
    this._checkboxGroup.appendChild(this._checkmark);
    this._createStyledLabel(checkboxX, checkboxSize, contentCenterY);
    this._svgElement.appendChild(this._checkboxGroup);
  }
  _createStyledLabel(checkboxX, checkboxSize, contentCenterY) {
    const textX = checkboxX + checkboxSize + 10;
    const lines = this._label.split("\\n");
    const lineHeight = this._fontSize * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    const textCenteringDelta = -(this._fontSize * 0.2);
    const textStartY =
      contentCenterY - totalTextHeight / 2 + textCenteringDelta;
    const browserStyles = this._getSubSupStyles();

    lines.forEach((line, lineIndex) => {
      const textElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      textElement.setAttribute("class", "checkbox-label");
      textElement.setAttribute("x", textX.toString());
      textElement.setAttribute(
        "y",
        (
          textStartY +
          (lineIndex + 0.5) * lineHeight +
          this._fontSize * 0.3
        ).toString(),
      );
      textElement.setAttribute("dominant-baseline", "middle");
      const parsedLine = this._parseHtmlTags(line);
      if (parsedLine.length === 1 && parsedLine[0].type === "normal") {
        textElement.textContent = parsedLine[0].text;
      } else {
        let currentX = 0;
        parsedLine.forEach((part) => {
          const tspan = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "tspan",
          );
          tspan.textContent = part.text;
          if (currentX > 0) {
            tspan.setAttribute("dx", "0");
          }
          if (part.type === "sub") {
            tspan.setAttribute("class", "checkbox-sub");
            tspan.setAttribute("dy", browserStyles.subDy);
          } else if (part.type === "sup") {
            tspan.setAttribute("class", "checkbox-sup");
            tspan.setAttribute("dy", browserStyles.supDy);
          } else {
            if (lineIndex > 0 || parsedLine.indexOf(part) > 0) {
              const prevPart = parsedLine[parsedLine.indexOf(part) - 1];
              if (
                prevPart &&
                (prevPart.type === "sub" || prevPart.type === "sup")
              ) {
                tspan.setAttribute(
                  "dy",
                  prevPart.type === "sub"
                    ? browserStyles.subResetDy
                    : browserStyles.supResetDy,
                );
              }
            }
          }
          textElement.appendChild(tspan);
          const charWidth =
            part.type === "normal"
              ? this._fontSize * 0.6
              : this._fontSize * 0.85 * 0.6;
          currentX += part.text.length * charWidth;
        });
      }
      this._checkboxGroup.appendChild(textElement);
    });
  }
  _createMultilineLabel(checkboxSize, yOffset, totalHeight) {}
  _setupEvents() {
    this._checkboxGroup.addEventListener("click", (e) => {
      this.checked = !this._checked;
      const customEvent = new CustomEvent("checkbox-change", {
        detail: { component: this, checked: this._checked },
      });
      customEvent.value = this._checked;
      this._element.dispatchEvent(customEvent);
    });
    this._container.tabIndex = 0;
    this._container.addEventListener("focus", () => {
      this._focused = true;
    });
    this._container.addEventListener("blur", () => {
      this._focused = false;
    });
    this._container.addEventListener("keydown", (e) => {
      if (e.key === " " || e.keyCode === 32) {
        e.preventDefault();
        this.checked = !this._checked;
        const customEvent = new CustomEvent("checkbox-change", {
          detail: { component: this, checked: this._checked },
        });
        customEvent.value = this._checked;
        this._element.dispatchEvent(customEvent);
      }
    });
  }
  get checked() {
    return this._checked;
  }
  set checked(value) {
    this._checked = value;
    if (this._checkboxGroup) {
      if (value) {
        this._checkboxGroup.classList.add("checkbox-checked");
      } else {
        this._checkboxGroup.classList.remove("checkbox-checked");
      }
    }
  }
  setFont(font) {
    this._font = font;
    this._updateStyles();
  }
  setFontSize(fontSize) {
    this._fontSize = fontSize;
    this._calculateSvgSize();
    this._repositionElements();
    this._updateStyles();
  }
  setLabel(label) {
    this._label = label;
    this._calculateSvgSize();
    this._repositionElements();
  }
  setTextColor(textColor) {
    this._textColor = textColor;
    this._cssTextColor = this._hexToCSS(textColor);
    this._updateStyles();
  }
  _updateStyles() {
    const oldStyle = this._svgElement.querySelector("style");
    if (oldStyle) {
      oldStyle.remove();
    }
    this._addStyles();
  }
  _repositionElements() {
    if (this._checkboxGroup) {
      this._checkboxGroup.remove();
      this._adaptiveSize = Math.max(this._size, this._fontSize * 0.8);
      this._createCheckboxElements();
    }
  }
  onClick(callback) {
    if (this._element) {
      this._element.addEventListener("checkbox-change", callback);
    }
  }
};

HtmlSvgEdu.RadioButton = class RadioButton extends HtmlSvgEdu.Component {
  static serializationMap = {
    description: {
      de: "Optionsfeld für Gruppenauswahl",
      en: "Radio button for group selection",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: 'let myRadio = new RadioButton("group1", false, 20, "Option 1");',
    constructor: {
      groupName: {
        name: "groupName",
        info: {
          en: "Name of the radio button group (radio buttons with the same name belong together)",
          de: "Name der Radiobutton-Gruppe (Radiobuttons mit gleichem Namen gehören zusammen)",
        },
      },
      checked: {
        name: "checked",
        info: {
          en: "Indicates whether the element is selected",
          de: "Gibt an, ob das Element ausgewählt ist",
        },
      },
      size: {
        name: "size",
        info: {
          en: "Size of the element (e.g. 20 for 20px)",
          de: "Größe des Elements (z.B. 20 für 20px)",
        },
      },
      label: {
        name: "label",
        info: {
          en: "Label or text of the element (\\n for line break, <sub></sub> and <sup></sup> for subscript/superscript possible)",
          de: "Bezeichner oder Text des Elements (\\n für Zeilenwechsel, <sub></sub> und <sup></sup> für tiefgestellt/hochgestellt möglich)",
        },
      },
      font: {
        name: "font",
        info: {
          en: "Font family of the text",
          de: "Schriftart des Textes",
        },
      },
      fontSize: {
        name: "fontSize",
        info: {
          en: "Font size in pixels",
          de: "Schriftgröße in Pixeln",
        },
      },
      textColor: {
        name: "textColor",
        info: {
          en: "Text color of the label (e.g. 0x000000)",
          de: "Textfarbe des Labels (z.B. 0x000000)",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element",
          de: "Horizontale Position des Elements",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element",
          de: "Vertikale Position des Elements",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
        },
        example: "visible = true",
      },
    },
    methods: {
      onClick: {
        name: "onClick",
        info: {
          en: "Adds an event listener for clicks",
          de: "Fügt einen Event-Listener für Klicks hinzu",
        },
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
      },
    },
  };
  static _groups = new Map();
  constructor(
    groupName = "default",
    checked = false,
    size = 20,
    label = "RadioButton",
    font = "Arial",
    fontSize = 16,
    textColor = 0x000000,
  ) {
    super();
    this._groupName = groupName;
    this._checked = checked;
    this._size = size;
    this._label = label;
    this._font = font;
    this._fontSize = fontSize;
    this._textColor = textColor;
    this._focused = false;
    this._cssTextColor = this._hexToCSS(textColor);
    this._clickCallback = null;

    this._isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
    this._isChrome =
      navigator.userAgent.toLowerCase().indexOf("chrome") > -1 &&
      navigator.userAgent.toLowerCase().indexOf("edg") === -1;
    this._isEdge = navigator.userAgent.toLowerCase().indexOf("edg") > -1;
    this._isSafari =
      navigator.userAgent.toLowerCase().indexOf("safari") > -1 &&
      !this._isChrome &&
      !this._isEdge;

    this._registerInGroup();
    this._container = this._createElement("div");
    this._container.className = "pixi-html-ui pixi-svg-radiobutton-container";
    this._svgElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    this._svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    this._calculateSvgSize();
    this._addStyles();
    this._createRadioButtonElements();
    this._container.appendChild(this._svgElement);
    this._element = this._container;
    this._setupEvents();
    if (this._checked) {
      this._setAsCheckedInGroup();
    }
  }
  _registerInGroup() {
    if (!RadioButton._groups.has(this._groupName)) {
      RadioButton._groups.set(this._groupName, new Set());
    }
    RadioButton._groups.get(this._groupName).add(this);
  }
  _unregisterFromGroup() {
    if (RadioButton._groups.has(this._groupName)) {
      RadioButton._groups.get(this._groupName).delete(this);
      if (RadioButton._groups.get(this._groupName).size === 0) {
        RadioButton._groups.delete(this._groupName);
      }
    }
  }
  _setAsCheckedInGroup() {
    if (RadioButton._groups.has(this._groupName)) {
      const group = RadioButton._groups.get(this._groupName);
      group.forEach((radioButton) => {
        if (radioButton !== this) {
          radioButton._setCheckedState(false);
        }
      });
    }
  }
  _setCheckedState(checked) {
    this._checked = checked;
    if (this._radioButtonGroup) {
      if (checked) {
        this._radioButtonGroup.classList.add("radiobutton-checked");
      } else {
        this._radioButtonGroup.classList.remove("radiobutton-checked");
      }
    }
  }
  _hexToCSS(hexColor) {
    if (typeof hexColor === "string") {
      if (
        hexColor.startsWith("#") ||
        hexColor.startsWith("rgb") ||
        /^[a-z]+$/i.test(hexColor)
      ) {
        return hexColor;
      }
      return "#" + hexColor;
    }
    if (typeof hexColor === "number") {
      const hex = hexColor.toString(16).padStart(6, "0");
      return "#" + hex;
    }
    return "#000000";
  }
  _parseHtmlTags(text) {
    const parts = [];
    let currentPos = 0;
    const tagRegex = /<(sub|sup)>(.*?)<\/\1>/gi;
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
      if (match.index > currentPos) {
        const beforeText = text.substring(currentPos, match.index);
        if (beforeText) {
          parts.push({ type: "normal", text: beforeText });
        }
      }
      parts.push({
        type: match[1].toLowerCase(),
        text: match[2],
      });
      currentPos = match.index + match[0].length;
    }
    if (currentPos < text.length) {
      const remainingText = text.substring(currentPos);
      if (remainingText) {
        parts.push({ type: "normal", text: remainingText });
      }
    }
    if (parts.length === 0) {
      parts.push({ type: "normal", text: text });
    }
    return parts;
  }
  _calculateTextDimensions() {
    const lines = this._label.split("\\n");
    let maxLineWidth = 0;
    let totalHeight = 0;
    lines.forEach((line) => {
      const parsedLine = this._parseHtmlTags(line);
      let lineWidth = 0;
      let lineHeight = this._fontSize;
      parsedLine.forEach((part) => {
        let charWidth, partHeight;
        if (part.type === "sub" || part.type === "sup") {
          const subSupSize = this._fontSize * 0.85;
          charWidth = part.text.length * (subSupSize * 0.6);
          partHeight = subSupSize;
        } else {
          charWidth = part.text.length * (this._fontSize * 0.6);
          partHeight = this._fontSize;
        }
        lineWidth += charWidth;
        lineHeight = Math.max(lineHeight, partHeight);
      });
      maxLineWidth = Math.max(maxLineWidth, lineWidth);
      totalHeight += lineHeight;
    });
    if (lines.length > 1) {
      totalHeight += (lines.length - 1) * (this._fontSize * 0.2);
    }
    return {
      width: maxLineWidth,
      height: totalHeight,
      lineCount: lines.length,
      lines: lines,
    };
  }
  _calculateSvgSize() {
    const adaptiveSize = Math.max(this._size, this._fontSize * 0.8);
    const strokeWidth = 2;
    const strokeOffset = strokeWidth / 2;
    const textDimensions = this._calculateTextDimensions();
    const svgWidth =
      strokeOffset +
      adaptiveSize +
      strokeOffset +
      10 +
      textDimensions.width +
      20;
    const basePadding = 30;
    const extraPadding = this._fontSize > 100 ? this._fontSize * 0.3 : 0;
    const minHeight = Math.max(
      adaptiveSize + strokeWidth,
      textDimensions.height,
    );
    const svgHeight = minHeight + basePadding + extraPadding;
    this._svgElement.setAttribute("width", svgWidth);
    this._svgElement.setAttribute("height", svgHeight);
    this._svgElement.setAttribute(
      "viewBox",
      "0 0 " + svgWidth + " " + svgHeight,
    );
    this._adaptiveSize = adaptiveSize;
    this._strokeOffset = strokeOffset;
    this._textDimensions = textDimensions;
  }

  _getSubSupStyles() {
    if (this._isFirefox) {
      return {
        subStyle: "baseline-shift: sub;",
        supStyle: "baseline-shift: super;",
        subDy: this._fontSize * 0.2 + 3,
        supDy: -this._fontSize * 0.3,
        subResetDy: -(this._fontSize * 0.2 + 3),
        supResetDy: this._fontSize * 0.3,
      };
    } else if (this._isChrome || this._isEdge) {
      return {
        subStyle: "baseline-shift: -25%;",
        supStyle: "baseline-shift: 40%;",
        subDy: this._fontSize * 0.1,
        supDy: -this._fontSize * 0.15,
        subResetDy: -(this._fontSize * 0.1),
        supResetDy: this._fontSize * 0.15,
      };
    } else if (this._isSafari) {
      return {
        subStyle: "baseline-shift: -20%;",
        supStyle: "baseline-shift: 35%;",
        subDy: this._fontSize * 0.15,
        supDy: -this._fontSize * 0.2,
        subResetDy: -(this._fontSize * 0.15),
        supResetDy: this._fontSize * 0.2,
      };
    } else {
      return {
        subStyle: "baseline-shift: sub;",
        supStyle: "baseline-shift: super;",
        subDy: this._fontSize * 0.2,
        supDy: -this._fontSize * 0.25,
        subResetDy: -(this._fontSize * 0.2),
        supResetDy: this._fontSize * 0.25,
      };
    }
  }

  _addStyles() {
    const browserStyles = this._getSubSupStyles();
    const style = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style",
    );
    style.textContent =
      "/* RadioButton-Stil */" +
      ".radiobutton-container { cursor: pointer; }" +
      ".radiobutton-circle { " +
      "stroke: #555555; " +
      "stroke-width: 1;" +
      "fill: white;" +
      "}" +
      ".radiobutton-container:hover .radiobutton-circle { stroke: #228B22; }" +
      ".radiobutton-dot {" +
      "fill: #228B22;" +
      "visibility: hidden;" +
      "}" +
      ".radiobutton-checked .radiobutton-dot { visibility: visible; }" +
      ".radiobutton-label {" +
      "font-family: " +
      this._font +
      ";" +
      "font-size: " +
      this._fontSize +
      "px;" +
      "dominant-baseline: middle;" +
      "user-select: none;" +
      "}" +
      ".radiobutton-sub {" +
      "font-size: " +
      this._fontSize * 0.85 +
      "px;" +
      browserStyles.subStyle +
      "}" +
      ".radiobutton-sup {" +
      "font-size: " +
      this._fontSize * 0.85 +
      "px;" +
      browserStyles.supStyle +
      "}";
    this._svgElement.appendChild(style);
  }
  _createRadioButtonElements() {
    const radioButtonSize =
      this._adaptiveSize || Math.max(this._size, this._fontSize * 0.8);
    const textDimensions = this._textDimensions;
    const contentWidth = radioButtonSize + 10 + textDimensions.width;
    const svgWidth = parseInt(this._svgElement.getAttribute("width"));
    const svgHeight = parseInt(this._svgElement.getAttribute("height"));
    const contentStartX = (svgWidth - contentWidth) / 2;
    const totalContentHeight = Math.max(radioButtonSize, textDimensions.height);
    const contentCenterY = svgHeight / 2;
    this._radioButtonGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    this._radioButtonGroup.setAttribute("class", "radiobutton-container");
    this._radioButtonGroup.setAttribute(
      "id",
      "radiobutton-" + Math.random().toString(36).substr(2, 9),
    );
    if (this._checked) {
      this._radioButtonGroup.classList.add("radiobutton-checked");
    }
    const radioButtonX = contentStartX + radioButtonSize / 2;
    const radioButtonY = contentCenterY;
    this._circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    this._circle.setAttribute("class", "radiobutton-circle");
    this._circle.setAttribute("cx", radioButtonX.toString());
    this._circle.setAttribute("cy", radioButtonY.toString());
    this._circle.setAttribute("r", (radioButtonSize / 2).toString());
    this._radioButtonGroup.appendChild(this._circle);
    this._dot = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    this._dot.setAttribute("class", "radiobutton-dot");
    this._dot.setAttribute("cx", radioButtonX.toString());
    this._dot.setAttribute("cy", radioButtonY.toString());
    this._dot.setAttribute("r", (radioButtonSize / 6).toString());
    this._radioButtonGroup.appendChild(this._dot);
    this._createStyledLabel(contentStartX, radioButtonSize, contentCenterY);
    this._svgElement.appendChild(this._radioButtonGroup);
  }
  _createStyledLabel(radioButtonX, radioButtonSize, contentCenterY) {
    const textX = radioButtonX + radioButtonSize + 10;
    const lines = this._label.split("\\n");
    const lineHeight = this._fontSize * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    const textCenteringDelta = -(this._fontSize * 0.2);
    const textStartY =
      contentCenterY - totalTextHeight / 2 + textCenteringDelta;
    const browserStyles = this._getSubSupStyles();

    this._textElements = [];

    lines.forEach((line, lineIndex) => {
      const textElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      textElement.setAttribute("class", "radiobutton-label");
      textElement.setAttribute("x", textX.toString());
      textElement.setAttribute(
        "y",
        (
          textStartY +
          (lineIndex + 0.5) * lineHeight +
          this._fontSize * 0.3
        ).toString(),
      );
      textElement.setAttribute("dominant-baseline", "middle");
      textElement.setAttribute("fill", this._cssTextColor);

      const parsedLine = this._parseHtmlTags(line);
      if (parsedLine.length === 1 && parsedLine[0].type === "normal") {
        textElement.textContent = parsedLine[0].text;
      } else {
        let currentX = 0;
        parsedLine.forEach((part) => {
          const tspan = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "tspan",
          );
          tspan.textContent = part.text;
          if (currentX > 0) {
            tspan.setAttribute("dx", "0");
          }
          if (part.type === "sub") {
            tspan.setAttribute("class", "radiobutton-sub");
            tspan.setAttribute("dy", browserStyles.subDy);
          } else if (part.type === "sup") {
            tspan.setAttribute("class", "radiobutton-sup");
            tspan.setAttribute("dy", browserStyles.supDy);
          } else {
            if (lineIndex > 0 || parsedLine.indexOf(part) > 0) {
              const prevPart = parsedLine[parsedLine.indexOf(part) - 1];
              if (
                prevPart &&
                (prevPart.type === "sub" || prevPart.type === "sup")
              ) {
                tspan.setAttribute(
                  "dy",
                  prevPart.type === "sub"
                    ? browserStyles.subResetDy
                    : browserStyles.supResetDy,
                );
              }
            }
          }
          textElement.appendChild(tspan);
          const charWidth =
            part.type === "normal"
              ? this._fontSize * 0.6
              : this._fontSize * 0.85 * 0.6;
          currentX += part.text.length * charWidth;
        });
      }
      this._radioButtonGroup.appendChild(textElement);
      this._textElements.push(textElement);
    });
  }
  _setupEvents() {
    this._radioButtonGroup.addEventListener("click", (e) => {
      if (!this._checked) {
        this.checked = true;
      }

      if (this._clickCallback) {
        this._clickCallback();
      }
    });
    this._container.tabIndex = 0;
    this._container.addEventListener("focus", () => {
      this._focused = true;
    });
    this._container.addEventListener("blur", () => {
      this._focused = false;
    });
    this._container.addEventListener("keydown", (e) => {
      if (e.key === " " || e.keyCode === 32) {
        e.preventDefault();
        if (!this._checked) {
          this.checked = true;
        }

        if (this._clickCallback) {
          this._clickCallback();
        }
      } else if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        this._navigateInGroup(e.key);
        e.preventDefault();
      }
    });
  }
  _navigateInGroup(keyDirection) {
    if (!RadioButton._groups.has(this._groupName)) return;
    const group = Array.from(RadioButton._groups.get(this._groupName));
    const currentIndex = group.indexOf(this);
    if (currentIndex === -1) return;
    let nextIndex;
    if (keyDirection === "ArrowUp" || keyDirection === "ArrowLeft") {
      nextIndex = currentIndex === 0 ? group.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex === group.length - 1 ? 0 : currentIndex + 1;
    }
    const nextRadioButton = group[nextIndex];
    nextRadioButton._container.focus();
    nextRadioButton.checked = true;

    if (nextRadioButton._clickCallback) {
      nextRadioButton._clickCallback();
    }
  }
  get checked() {
    return this._checked;
  }
  set checked(value) {
    if (value && !this._checked) {
      this._setAsCheckedInGroup();
      this._setCheckedState(true);
    } else if (!value) {
      this._setCheckedState(false);
    }
  }
  get groupName() {
    return this._groupName;
  }
  get value() {
    return this._label;
  }
  static getCheckedInGroup(groupName) {
    if (!RadioButton._groups.has(groupName)) return null;
    const group = RadioButton._groups.get(groupName);
    for (const radioButton of group) {
      if (radioButton.checked) {
        return radioButton;
      }
    }
    return null;
  }
  static getValueInGroup(groupName) {
    const checked = RadioButton.getCheckedInGroup(groupName);
    return checked ? checked.value : null;
  }
  static getAllInGroup(groupName) {
    if (!RadioButton._groups.has(groupName)) return [];
    return Array.from(RadioButton._groups.get(groupName));
  }
  setFont(font) {
    this._font = font;
    this._updateStyles();
  }
  setFontSize(fontSize) {
    this._fontSize = fontSize;
    this._calculateSvgSize();
    this._repositionElements();
    this._updateStyles();
  }
  setLabel(label) {
    this._label = label;
    this._calculateSvgSize();
    this._repositionElements();
  }
  setTextColor(textColor) {
    this._textColor = textColor;
    this._cssTextColor = this._hexToCSS(textColor);
    if (this._textElements) {
      this._textElements.forEach((textElement) => {
        textElement.setAttribute("fill", this._cssTextColor);
      });
    }
  }
  _updateStyles() {
    const oldStyle = this._svgElement.querySelector("style");
    if (oldStyle) {
      oldStyle.remove();
    }
    this._addStyles();
  }
  _repositionElements() {
    if (this._radioButtonGroup) {
      this._radioButtonGroup.remove();
      this._adaptiveSize = Math.max(this._size, this._fontSize * 0.8);
      this._createRadioButtonElements();
    }
  }
  onClick(callback) {
    this._clickCallback = callback;
  }
  destroy() {
    this._unregisterFromGroup();
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    if (super.destroy) {
      super.destroy();
    }
  }
};
HtmlSvgEdu.NumericStepper = class NumericStepper extends HtmlSvgEdu.Component {
  static serializationMap = {
    description: {
      de: "Numerischer Stepper mit Plus/Minus-Buttons",
      en: "Numeric stepper with plus/minus buttons",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myStepper = new NumericStepper(50, 0, 100, 5, 120);",
    constructor: {
      value: {
        name: "value",
        info: {
          en: "Current value of the element",
          de: "Aktueller Wert des Elements",
        },
      },
      min: {
        name: "min",
        info: {
          en: "Minimum value of the element",
          de: "Minimaler Wert des Elements",
        },
      },
      max: {
        name: "max",
        info: {
          en: "Maximum value of the element",
          de: "Maximaler Wert des Elements",
        },
      },
      step: {
        name: "step",
        info: {
          en: "Step size of the element",
          de: "Schrittgröße des Elements",
        },
      },
      width: {
        name: "width",
        info: {
          en: "Width of the element in pixels",
          de: "Breite des Elements in Pixeln",
        },
      },
      font: {
        name: "font",
        info: {
          en: "Font family of the text",
          de: "Schriftart des Textes",
        },
      },
      fontSize: {
        name: "fontSize",
        info: {
          en: "Font size in pixels",
          de: "Schriftgröße in Pixeln",
        },
      },
      decimalSeparator: {
        name: "decimalSeparator",
        info: {
          en: "Decimal separator character (, or .)",
          de: "Dezimaltrennzeichen (, oder .)",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element",
          de: "Horizontale Position des Elements",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element",
          de: "Vertikale Position des Elements",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
        },
        example: "visible = true",
      },
    },
    methods: {
      onChange: {
        name: "onChange",
        info: {
          en: "Adds an event listener for value changes",
          de: "Fügt einen Event-Listener für Wertänderungen hinzu",
        },
        example:
          "onChange(handleChange);\n\nfunction handleChange(event) {  console.log(event.value); }",
      },
    },
  };
  constructor(value, min, max, step, width, font, fontSize, decimalSeparator) {
    super();
    this._value = value || 0;
    this._min = min !== undefined ? min : Number.MIN_SAFE_INTEGER;
    this._max = max !== undefined ? max : Number.MAX_SAFE_INTEGER;
    this._step = step || 1;
    this._width = width || 120;
    this._font = font || "Arial";
    this._fontSize = fontSize || 16;
    this._decimalSeparator = decimalSeparator || ".";
    this._holdTimer = null;
    this._holdInterval = null;
    this._holdDirection = 0;
    this._initialHoldDelay = 500;
    this._holdRepeatRate = 100;
    this._decimals = this._calculateDecimals(this._step);
    this._oldValue = this._value;
    this._container = this._createElement("div");
    this._container.className = "pixi-html-ui pixi-numeric-stepper";
    this._input = document.createElement("input");
    this._input.type = "text";
    this._input.value = this._formatValue(this._roundValue(value));
    this._input.className = "pixi-numeric-input";
    this._container.appendChild(this._input);
    this._buttonsContainer = document.createElement("div");
    this._buttonsContainer.className = "pixi-stepper-buttons";
    this._increaseBtn = document.createElement("button");
    this._increaseBtn.innerHTML =
      "<svg width='12' height='8' viewBox='0 0 12 8'>" +
      "<path d='M6 0 L12 8 L0 8 Z' fill='currentColor'/>" +
      "</svg>";
    this._increaseBtn.className = "pixi-stepper-btn pixi-stepper-increase";
    this._buttonsContainer.appendChild(this._increaseBtn);
    this._decreaseBtn = document.createElement("button");
    this._decreaseBtn.innerHTML =
      "<svg width='12' height='8' viewBox='0 0 12 8'>" +
      "<path d='M6 8 L0 0 L12 0 Z' fill='currentColor'/>" +
      "</svg>";
    this._decreaseBtn.className = "pixi-stepper-btn pixi-stepper-decrease";
    this._buttonsContainer.appendChild(this._decreaseBtn);
    this._container.appendChild(this._buttonsContainer);
    this._element = this._container;
    this._applyStyles();
    this._setupEvents();
  }
  _calculateDecimals(step) {
    const stepStr = step.toString();
    const decimalIndex = stepStr.indexOf(".");
    if (decimalIndex === -1) {
      return 0;
    }
    return stepStr.length - decimalIndex - 1;
  }
  _roundValue(value) {
    const factor = Math.pow(10, this._decimals);
    return Math.round(value * factor) / factor;
  }
  _formatValue(value) {
    let formattedValue = value.toFixed(this._decimals);
    if (this._decimalSeparator === ",") {
      formattedValue = formattedValue.replace(".", ",");
    }
    return formattedValue;
  }
  _parseValue(valueStr) {
    if (typeof valueStr !== "string") {
      valueStr = String(valueStr);
    }
    const normalizedValue = valueStr.replace(",", ".");
    return parseFloat(normalizedValue) || 0;
  }
  _applyStyles() {
    if (!this._element) return;
    const baseHeight = this._fontSize * 1.5;
    const buttonWidth = Math.max(22, this._fontSize * 1.2);
    this._container.style.display = "flex";
    this._container.style.width = this._width + "px";
    this._container.style.height = baseHeight + "px";
    this._input.style.fontFamily = this._font;
    this._input.style.fontSize = this._fontSize + "px";
    this._input.style.width = this._width - buttonWidth + "px";
    this._input.style.height = "100%";
    this._input.style.boxSizing = "border-box";
    this._buttonsContainer.style.display = "flex";
    this._buttonsContainer.style.flexDirection = "column";
    this._buttonsContainer.style.width = buttonWidth + "px";
    this._buttonsContainer.style.height = "100%";
    const btnStyle = {
      fontFamily: this._font,
      fontSize: Math.floor(this._fontSize * 0.8) + "px",
      padding: "0",
      margin: "0",
      lineHeight: "1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "50%",
      boxSizing: "border-box",
    };
    Object.entries(btnStyle).forEach(
      function ([key, value]) {
        this._decreaseBtn.style[key] = value;
        this._increaseBtn.style[key] = value;
      }.bind(this),
    );
  }
  _startHold(direction) {
    this._stopHold();
    this._holdDirection = direction;
    this._performStepAction(direction);
    this._holdTimer = setTimeout(() => {
      this._holdInterval = setInterval(() => {
        this._performStepAction(this._holdDirection);
      }, this._holdRepeatRate);
    }, this._initialHoldDelay);
  }
  _stopHold() {
    if (this._holdTimer) {
      clearTimeout(this._holdTimer);
      this._holdTimer = null;
    }
    if (this._holdInterval) {
      clearInterval(this._holdInterval);
      this._holdInterval = null;
    }
    this._holdDirection = 0;
  }
  _performStepAction(direction) {
    const currentValue = this._parseValue(this._input.value);
    this._oldValue = this._value;
    if (direction === 1) {
      this._value = this._roundValue(currentValue + this._step);
    } else if (direction === -1) {
      this._value = this._roundValue(currentValue - this._step);
    }
    this._validateValue();
    this._input.value = this._formatValue(this._value);
    this._triggerChangeEvent();
  }
  _triggerChangeEvent() {
    const event = new CustomEvent("stepper-change", {
      detail: {
        component: this,
        value: this._value,
        oldValue: this._oldValue,
        newValue: this._value,
      },
    });
    event.value = this._value;
    event.oldValue = this._oldValue;
    event.newValue = this._value;
    this._element.dispatchEvent(event);
  }
  _setupEvents() {
    this._input.addEventListener("change", (e) => {
      const parsedValue = this._parseValue(this._input.value);
      this._oldValue = this._value;
      if (isNaN(parsedValue)) {
        this._input.value = this._formatValue(this._value);
        return;
      }
      this._value = this._roundValue(parsedValue);
      this._validateValue();
      this._triggerChangeEvent();
    });
    this._input.addEventListener("input", (e) => {
      const allowedChars = new RegExp(
        "^-?\\d*\\" + this._decimalSeparator + "?\\d*$",
      );
      if (!allowedChars.test(this._input.value)) {
        this._input.value = this._input.value.slice(0, -1);
      }
    });
    this._decreaseBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this._startHold(-1);
    });
    this._decreaseBtn.addEventListener("mouseup", (e) => {
      this._stopHold();
    });
    this._decreaseBtn.addEventListener("mouseleave", (e) => {
      this._stopHold();
    });
    this._increaseBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this._startHold(1);
    });
    this._increaseBtn.addEventListener("mouseup", (e) => {
      this._stopHold();
    });
    this._increaseBtn.addEventListener("mouseleave", (e) => {
      this._stopHold();
    });
    document.addEventListener("mouseup", () => {
      this._stopHold();
    });
    this._decreaseBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this._startHold(-1);
    });
    this._decreaseBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      this._stopHold();
    });
    this._decreaseBtn.addEventListener("touchcancel", (e) => {
      this._stopHold();
    });
    this._increaseBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this._startHold(1);
    });
    this._increaseBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      this._stopHold();
    });
    this._increaseBtn.addEventListener("touchcancel", (e) => {
      this._stopHold();
    });
  }
  _validateValue() {
    if (this._value < this._min) this._value = this._min;
    if (this._value > this._max) this._value = this._max;
    this._value = this._roundValue(this._value);
    if (this._input) {
      this._input.value = this._formatValue(this._value);
    }
  }
  setValue(value) {
    this._oldValue = this._value;
    this._value = this._roundValue(Number(value));
    this._validateValue();
    this._triggerChangeEvent();
  }
  setMin(min) {
    this._min = Number(min);
    this._validateValue();
  }
  setMax(max) {
    this._max = Number(max);
    this._validateValue();
  }
  setStep(step) {
    this._step = Number(step);
    this._decimals = this._calculateDecimals(this._step);
    this._value = this._roundValue(this._value);
    this._validateValue();
  }
  setFont(font) {
    this._font = font;
    this._applyStyles();
  }
  setFontSize(fontSize) {
    this._fontSize = fontSize;
    this._applyStyles();
    if (this._element) {
      const baseHeight = this._fontSize * 1.5;
      this._container.style.height = baseHeight + "px";
    }
  }
  setDecimalSeparator(separator) {
    if (separator === "," || separator === ".") {
      this._decimalSeparator = separator;
      if (this._input) {
        this._input.value = this._formatValue(this._value);
      }
    }
  }
  setHoldTimings(initialDelay, repeatRate) {
    this._initialHoldDelay = initialDelay || 500;
    this._holdRepeatRate = repeatRate || 100;
  }
  get value() {
    return this._value;
  }
  set value(val) {
    this.setValue(val);
  }
  get decimalSeparator() {
    return this._decimalSeparator;
  }
  set decimalSeparator(separator) {
    this.setDecimalSeparator(separator);
  }
  onChange(callback) {
    if (this._element) {
      this._element.addEventListener("stepper-change", callback);
    }
  }
  destroy() {
    this._stopHold();
    document.removeEventListener("mouseup", this._stopHold);
    if (super.destroy) {
      super.destroy();
    }
  }
};
HtmlSvgEdu.Dropdown = class Dropdown extends HtmlSvgEdu.Component {
  static serializationMap = {
    description: {
      de: "Dropdown-Menü für die Auswahl aus einer Liste von Optionen",
      en: "Dropdown menu for selecting from a list of options",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      'let myDropdown = new Dropdown(["Option 1", "Option 2"], 200, 40);',
    constructor: {
      options: {
        name: "options",
        info: {
          en: "Array of options to display in the dropdown",
          de: "Array von Optionen, die im Dropdown angezeigt werden",
        },
      },
      width: {
        name: "width",
        info: {
          en: "Width of the element in pixels",
          de: "Breite des Elements in Pixeln",
        },
      },
      height: {
        name: "height",
        info: {
          en: "Height of the element in pixels",
          de: "Höhe des Elements in Pixeln",
        },
      },
      font: {
        name: "font",
        info: {
          en: "Font family of the text",
          de: "Schriftart des Textes",
        },
      },
      fontSize: {
        name: "fontSize",
        info: {
          en: "Font size in pixels",
          de: "Schriftgröße in Pixeln",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element",
          de: "Horizontale Position des Elements",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element",
          de: "Vertikale Position des Elements",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
        },
        example: "visible = true",
      },
      selectedIndex: {
        name: "selectedIndex",
        info: {
          en: "Index of the selected option",
          de: "Index der ausgewählten Option",
        },
        example: "selectedIndex = 0",
      },
    },
    methods: {
      onChange: {
        name: "onChange",
        info: {
          en: "Registers a callback that is executed when the selection changes",
          de: "Registriert einen Callback, der bei Änderung der Auswahl ausgeführt wird",
        },
        example:
          'onChange(handleChange); \n\nfunction handleChange(event) { console.log("Selected: " + event.detail.value); }',
      },
      getSelectedValue: {
        name: "getSelectedValue",
        info: {
          en: "Returns the currently selected value",
          de: "Gibt den aktuell ausgewählten Wert zurück",
        },
        example: "getSelectedValue();",
      },
      setOptions: {
        name: "setOptions",
        info: {
          en: "Updates the list of available options",
          de: "Aktualisiert die Liste der verfügbaren Optionen",
        },
        example: 'setOptions(["New Option 1", "New Option 2", "New Option 3"])',
      },
    },
  };

  constructor(options, width, height, font, fontSize) {
    super();
    this._options = options || [];
    this._width = width || 200;
    this._height = height || 40;
    this._font = font || "Arial";
    this._fontSize = fontSize || 16;
    this._selectedIndex = 0;
    this._isOpen = false;

    this._element = this._createElement("div");
    this._element.className = "pixi-html-ui pixi-dropdown-container";

    this._buttonElement = document.createElement("div");
    this._buttonElement.className = "pixi-dropdown-button";
    this._element.appendChild(this._buttonElement);

    this._selectedText = document.createElement("span");
    this._selectedText.className = "pixi-dropdown-text";
    this._buttonElement.appendChild(this._selectedText);

    this._arrowElement = document.createElement("div");
    this._arrowElement.className = "pixi-dropdown-arrow";
    this._arrowElement.innerHTML = this._createArrowSVG();
    this._buttonElement.appendChild(this._arrowElement);

    this._listElement = document.createElement("div");
    this._listElement.className = "pixi-dropdown-list";
    this._element.appendChild(this._listElement);

    this._populateOptions();
    this._applyStyles();
    this._applyPosition();
    this._setupEvents();
    this._updateSelectedText();
  }

  _createArrowSVG() {
    const svgSize = Math.round(this._fontSize * 0.75);

    return `
      <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4.5 L6 7.5 L9 4.5" 
              stroke="currentColor" 
              stroke-width="1.5" 
              fill="none" 
              stroke-linecap="round" 
              stroke-linejoin="round"/>
      </svg>
    `;
  }

  _populateOptions() {
    if (!this._listElement) return;
    this._listElement.innerHTML = "";

    this._options.forEach((option, index) => {
      const optionElement = document.createElement("div");
      optionElement.className = "pixi-dropdown-option";
      optionElement.textContent = option;
      optionElement.dataset.index = index;

      if (index === this._selectedIndex) {
        optionElement.classList.add("selected");
      }

      this._listElement.appendChild(optionElement);
    });
  }

  _applyStyles() {
    if (!this._element) return;

    this._element.style.position = "absolute";
    this._element.style.width = this._width + "px";
    this._element.style.fontFamily = this._font;
    this._element.style.fontSize = this._fontSize + "px";

    this._buttonElement.style.width = "100%";
    this._buttonElement.style.height = this._height + "px";
    this._buttonElement.style.background =
      "linear-gradient(to bottom, #fafafa, #efefef)";
    this._buttonElement.style.border = "1px solid #aaaaaa";
    this._buttonElement.style.borderRadius = "10px";
    this._buttonElement.style.padding = "4px 8px";
    this._buttonElement.style.cursor = "pointer";
    this._buttonElement.style.display = "flex";
    this._buttonElement.style.alignItems = "center";
    this._buttonElement.style.justifyContent = "space-between";
    this._buttonElement.style.transition = "all 0.2s";
    this._buttonElement.style.boxSizing = "border-box";
    this._buttonElement.style.userSelect = "none";
    this._buttonElement.style.color = "#555";

    this._selectedText.style.flex = "1";
    this._selectedText.style.overflow = "hidden";
    this._selectedText.style.textOverflow = "ellipsis";
    this._selectedText.style.whiteSpace = "nowrap";

    this._arrowElement.style.display = "flex";
    this._arrowElement.style.alignItems = "center";
    this._arrowElement.style.marginLeft = "8px";
    this._arrowElement.style.transition = "transform 0.2s";
    this._arrowElement.style.color = "#666";

    this._listElement.style.position = "absolute";
    this._listElement.style.top = this._height + 2 + "px";
    this._listElement.style.left = "0";
    this._listElement.style.width = "100%";
    this._listElement.style.maxHeight = "200px";
    this._listElement.style.overflowY = "auto";
    this._listElement.style.background = "white";
    this._listElement.style.border = "1px solid #aaaaaa";
    this._listElement.style.borderRadius = "4px";
    this._listElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    this._listElement.style.display = "none";
    this._listElement.style.zIndex = "1000";

    const styleId = "pixi-dropdown-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .pixi-dropdown-option {
          padding: 8px 12px !important;
          cursor: pointer;
          transition: background-color 0.2s;
          color: #555;
          font-size: inherit !important;
          font-family: inherit !important;
          line-height: 1.5 !important;
          font-weight: normal !important;
          letter-spacing: normal !important;
          text-transform: none !important;
          box-sizing: border-box;
          min-height: 36px;
          height: auto !important;
          display: flex;
          align-items: center;
        }
        .pixi-dropdown-option:hover {
          background-color: #f0f0f0;
          padding: 8px 12px !important;
          font-size: inherit !important;
          line-height: 1.5 !important;
        }
        .pixi-dropdown-option.selected {
          background-color: #e8f5e8;
          background-image: none;
          font-weight: normal !important;
          font-size: inherit !important;
          font-family: inherit !important;
          line-height: 1.5 !important;
          letter-spacing: normal !important;
          text-transform: none !important;
          padding: 8px 12px !important;
          min-height: 36px;
          height: auto !important;
          box-sizing: border-box;
        }
        .pixi-dropdown-button:hover {
          border-color: #228B22;
          background: #ffffff;
        }
        .pixi-dropdown-button.open {
          border-color: #228B22;
        }
        .pixi-dropdown-button.open .pixi-dropdown-arrow {
          transform: rotate(180deg);
        }
      `;
      document.head.appendChild(style);
    }
  }

  _applyPosition() {
    if (!this._element) return;
    this._element.style.left = this._x + "px";
    this._element.style.top = this._y + "px";
  }

  _setupEvents() {
    if (!this._buttonElement || !this._listElement) return;

    this._buttonElement.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggleDropdown();
    });

    this._listElement.addEventListener("click", (e) => {
      e.stopPropagation();
      if (e.target.classList.contains("pixi-dropdown-option")) {
        const index = parseInt(e.target.dataset.index);
        this._selectOption(index);
      }
    });

    this._documentClickHandler = (e) => {
      if (!this._element.contains(e.target)) {
        this._closeDropdown();
      }
    };

    this._keydownHandler = (e) => {
      if (e.key === "Escape" && this._isOpen) {
        this._closeDropdown();
      }
    };

    document.addEventListener("click", this._documentClickHandler);
    document.addEventListener("keydown", this._keydownHandler);
  }

  _toggleDropdown() {
    if (this._isOpen) {
      this._closeDropdown();
    } else {
      this._openDropdown();
    }
  }

  _openDropdown() {
    this._isOpen = true;
    this._listElement.style.display = "block";
    this._buttonElement.classList.add("open");
  }

  _closeDropdown() {
    this._isOpen = false;
    this._listElement.style.display = "none";
    this._buttonElement.classList.remove("open");
  }

  _selectOption(index) {
    if (index >= 0 && index < this._options.length) {
      const oldIndex = this._selectedIndex;
      this._selectedIndex = index;

      const options = this._listElement.querySelectorAll(
        ".pixi-dropdown-option",
      );
      options.forEach((opt, i) => {
        if (i === index) {
          opt.classList.add("selected");
        } else {
          opt.classList.remove("selected");
        }
      });

      this._updateSelectedText();
      this._closeDropdown();

      if (oldIndex !== index) {
        const customEvent = new CustomEvent("dropdown-change", {
          detail: {
            component: this,
            index: this._selectedIndex,
            value: this._options[this._selectedIndex],
            oldIndex: oldIndex,
            oldValue: this._options[oldIndex],
          },
        });
        customEvent.selectedIndex = this._selectedIndex;
        customEvent.selectedValue = this._options[this._selectedIndex];
        this._element.dispatchEvent(customEvent);
      }
    }
  }

  _updateSelectedText() {
    if (this._selectedText && this._options.length > 0) {
      this._selectedText.textContent = this._options[this._selectedIndex] || "";
    }
  }

  set x(value) {
    this._x = value;
    this._applyPosition();
  }

  get x() {
    return this._x;
  }

  set y(value) {
    this._y = value;
    this._applyPosition();
  }

  get y() {
    return this._y;
  }

  set visible(value) {
    this._visible = value;
    if (this._element) {
      this._element.style.display = this._visible ? "block" : "none";
    }
  }

  get visible() {
    return this._visible;
  }

  set selectedIndex(value) {
    if (value >= 0 && value < this._options.length) {
      this._selectOption(value);
    }
  }

  get selectedIndex() {
    return this._selectedIndex;
  }

  set fontSize(value) {
    this._fontSize = value;
    if (this._element) {
      this._element.style.fontSize = this._fontSize + "px";
    }
    if (this._arrowElement) {
      this._arrowElement.innerHTML = this._createArrowSVG();
    }
  }

  get fontSize() {
    return this._fontSize;
  }

  getSelectedValue() {
    return this._options[this._selectedIndex];
  }

  setOptions(options) {
    this._options = options;
    this._selectedIndex = Math.min(
      this._selectedIndex,
      Math.max(0, options.length - 1),
    );
    this._populateOptions();
    this._updateSelectedText();
  }

  onChange(callback) {
    if (this._element) {
      this._element.addEventListener("dropdown-change", callback);
    }
  }

  remove() {
    if (this._documentClickHandler) {
      document.removeEventListener("click", this._documentClickHandler);
    }
    if (this._keydownHandler) {
      document.removeEventListener("keydown", this._keydownHandler);
    }

    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
  }
};
HtmlSvgEdu.ButtonSlider = class ButtonSlider extends HtmlSvgEdu.Component {
  static serializationMap = {
    description: {
      de: "Schieberegler mit ziehbarer Schaltfläche",
      en: "Slider with draggable button",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let mySlider = new ButtonSlider(0, 100, 50, 1, 20, 200);",
    constructor: {
      min: {
        name: "min",
        info: {
          en: "Minimum value of the element",
          de: "Minimaler Wert des Elements",
        },
      },
      max: {
        name: "max",
        info: {
          en: "Maximum value of the element",
          de: "Maximaler Wert des Elements",
        },
      },
      value: {
        name: "value",
        info: {
          en: "Current value of the element",
          de: "Aktueller Wert des Elements",
        },
      },
      step: {
        name: "step",
        info: {
          en: "Step size of the element",
          de: "Schrittgröße des Elements",
        },
      },
      height: {
        name: "height",
        info: {
          en: "Height of the button in pixels",
          de: "Höhe des Buttons in Pixeln",
        },
      },
      trackLength: {
        name: "trackLength",
        info: {
          en: "Length of the slider track in pixels",
          de: "Länge des Schieberegler-Tracks in Pixeln",
        },
      },
      thumbShape: {
        name: "thumbShape",
        info: {
          en: 'Shape of the thumb: "rectangle", "circle", "triangle-A", "triangle-B"',
          de: 'Form des Knopfs: "rectangle", "circle", "triangle-A", "triangle-B"',
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element",
          de: "Horizontale Position des Elements",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element",
          de: "Vertikale Position des Elements",
        },
        example: "y = 200",
      },
      value: {
        name: "value",
        info: {
          en: "Sets the current value",
          de: "Setzt den aktuellen Wert",
        },
        example: "value = 30",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
        },
        example: "visible = true",
      },
    },
    methods: {
      setValue: {
        info: {
          en: "Sets the current value",
          de: "Setzt den aktuellen Wert",
        },
        example: "setValue(25)",
      },
      enableValueDisplay: {
        info: {
          en: "Enables the value display",
          de: "Aktiviert die Wertanzeige",
        },
        example: "enableValueDisplay()",
      },
      setValueDisplayFont: {
        info: {
          en: "Sets font family and size for the value display",
          de: "Setzt Schriftart und -größe für die Wertanzeige",
        },
        example: 'setValueDisplayFont("Arial", 16)',
      },
      setThumbShape: {
        info: {
          en: 'Sets the shape of the thumb ("rectangle", "circle", "triangle-A", "triangle-B")',
          de: 'Setzt die Form des Knopfs ("rectangle", "circle", "triangle-A", "triangle-B")',
        },
        example: 'setThumbShape("triangle-A")',
      },
      enableSnap: {
        info: {
          en: "Enables snapping to specific values",
          de: "Aktiviert das Einrasten an bestimmten Werten",
        },
        example: "enableSnap([10, 20, 30])",
      },
      setDisplayCommaType: {
        info: {
          en: 'Sets the type of decimal separator ("dot" for point, "comma" for comma)',
          de: 'Setzt die Art des Dezimalzeichens ("dot" für Punkt, "comma" für Komma)',
        },
        example: 'setDisplayCommaType("comma")',
      },
      setRangeMarker: {
        info: {
          en: "Sets a semi-transparent green range marker on the track",
          de: "Setzt einen halbtransparenten grünen Wertebereich-Marker auf dem Track",
        },
        example: "setRangeMarker(20, 60) // Markiert Bereich von 20 bis 60",
      },
      setVertical: {
        info: {
          en: "Sets the slider to vertical orientation",
          de: "Setzt den Schieberegler auf vertikale Ausrichtung",
        },
        example: "setVertical()",
      },

      onChange: {
        info: {
          en: "Adds a listener for value changes",
          de: "Fügt einen Listener für Wertänderungen hinzu",
        },
        example:
          "onChange(handleChange);\n\nfunction handleChange(e) { console.log(e.value); }",
      },
    },
  };
  constructor(min, max, value, step, height, trackLength, thumbShape) {
    super();
    this._value = value !== undefined ? value : 50;
    this._min = min !== undefined ? min : 0;
    this._max = max !== undefined ? max : 100;
    this._step = step !== undefined ? step : 1;
    this._height = height || 20;
    this._width = this._height / 2;
    this._trackLength = trackLength || 200;
    this._showValue = false;
    this._valueFormatter = null;
    this._font = "Arial";
    this._fontSize = 16;
    this._displayCommaType = "dot";
    this._snapValues = null;
    this._snapEnabled = false;
    this._thumbShape = thumbShape || "rectangle";
    this._valueDisplay = null;
    this._isVertical = false;
    this._rangeMarkerStart = null;
    this._rangeMarkerEnd = null;
    this._rangeMarkerVisible = false;
    this._rangeMarker = null;
    this._container = this._createElement("div");
    this._container.className = "pixi-html-ui pixi-svg-slider-container";
    this._createSVGElements();
    this._element = this._container;
    this._applyStyles();
    this._setupEvents();
    this._updateThumbPosition();
  }
  _createSVGElements() {
    let svgWidth, svgHeight;
    if (this._isVertical) {
      svgWidth = this._height + 10;
      svgHeight = this._trackLength + this._width;
    } else {
      svgWidth = this._trackLength + this._width;
      svgHeight = this._height + 10;
    }
    this._svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this._svg.setAttribute("width", svgWidth);
    this._svg.setAttribute("height", svgHeight);
    this._svg.setAttribute("viewBox", "0 0 " + svgWidth + " " + svgHeight);
    this._svg.style.overflow = "visible";
    this._track = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    if (this._isVertical) {
      const offset = (this._height - this._width) / 2;
      this._track.setAttribute("x1", svgWidth / 2);
      this._track.setAttribute("y1", this._width / 2 + offset);
      this._track.setAttribute("x2", svgWidth / 2);
      this._track.setAttribute(
        "y2",
        this._trackLength + this._width / 2 + offset,
      );
    } else {
      this._track.setAttribute("x1", this._width / 2);
      this._track.setAttribute("y1", svgHeight / 2);
      this._track.setAttribute("x2", this._trackLength + this._width / 2);
      this._track.setAttribute("y2", svgHeight / 2);
    }
    this._track.setAttribute("stroke", "#555555");
    this._track.setAttribute("stroke-width", "1");
    this._rangeMarker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    this._rangeMarker.setAttribute("fill", "rgba(34, 139, 34, 0.4)");
    this._rangeMarker.setAttribute("stroke", "rgba(34, 139, 34, 0.8)");
    this._rangeMarker.setAttribute("stroke-width", "0.5");
    this._rangeMarker.setAttribute("rx", "2");
    this._rangeMarker.setAttribute("ry", "2");
    this._rangeMarker.style.display = "none";
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const gradient = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "linearGradient",
    );
    gradient.setAttribute("id", "sliderGradient" + Math.random());
    if (this._isVertical) {
      gradient.setAttribute("x1", "0%");
      gradient.setAttribute("y1", "0%");
      gradient.setAttribute("x2", "100%");
      gradient.setAttribute("y2", "0%");
    } else {
      gradient.setAttribute("x1", "0%");
      gradient.setAttribute("y1", "0%");
      gradient.setAttribute("x2", "0%");
      gradient.setAttribute("y2", "100%");
    }
    const stop1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop",
    );
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "rgba(250, 250, 250, 0.5)");
    const stop2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop",
    );
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "rgba(204, 204, 204, 0.3)");
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    this._gradientId = gradient.getAttribute("id");
    this._hitArea = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    this._hitArea.setAttribute("width", svgWidth);
    this._hitArea.setAttribute("height", svgHeight);
    this._hitArea.setAttribute("fill", "transparent");
    this._hitArea.style.cursor = "pointer";
    this._svg.appendChild(defs);
    this._svg.appendChild(this._hitArea);
    this._svg.appendChild(this._rangeMarker);
    this._svg.appendChild(this._track);
    this._thumbGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    this._createThumb();
    this._svg.appendChild(this._thumbGroup);
    this._container.appendChild(this._svg);
  }
  _createThumb() {
    while (this._thumbGroup.firstChild) {
      this._thumbGroup.removeChild(this._thumbGroup.firstChild);
    }
    this._thumbInnerGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    switch (this._thumbShape) {
      case "circle":
        this._createCircleThumb();
        break;
      case "triangle-A":
        this._createTriangleUpThumb();
        break;
      case "triangle-B":
        this._createTriangleDownThumb();
        break;
      case "rectangle":
      default:
        this._createRectangleThumb();
        break;
    }
    if (this._isVertical) {
      const centerX = this._width / 2;
      const centerY = this._height / 2;
      this._thumbInnerGroup.setAttribute(
        "transform",
        "rotate(90 " + centerX + " " + centerY + ")",
      );
    }
    this._thumbGroup.appendChild(this._thumbInnerGroup);
    this._thumbGroup.style.cursor = "pointer";
  }
  _createRectangleThumb() {
    this._thumb = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    this._thumb.setAttribute("width", this._width);
    this._thumb.setAttribute("height", this._height);
    this._thumb.setAttribute("rx", "2");
    this._thumb.setAttribute("ry", "2");
    this._thumb.setAttribute("fill", "url(#" + this._gradientId + ")");
    this._thumb.setAttribute("stroke", "#999999");
    this._thumb.setAttribute("stroke-width", "0.5");
    this._thumbLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    this._thumbLine.setAttribute("x1", this._width / 2);
    this._thumbLine.setAttribute("y1", 0);
    this._thumbLine.setAttribute("x2", this._width / 2);
    this._thumbLine.setAttribute("y2", this._height);
    this._thumbLine.setAttribute("stroke", "rgba(20, 20, 20, 0.9)");
    this._thumbLine.setAttribute("stroke-width", "1");
    this._thumbInnerGroup.appendChild(this._thumb);
    this._thumbInnerGroup.appendChild(this._thumbLine);
  }
  _createCircleThumb() {
    const radius = Math.min(this._width, this._height) / 2;
    this._thumb = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    this._thumb.setAttribute("cx", this._width / 2);
    this._thumb.setAttribute("cy", this._height / 2);
    this._thumb.setAttribute("r", radius);
    this._thumb.setAttribute("fill", "url(#" + this._gradientId + ")");
    this._thumb.setAttribute("stroke", "#999999");
    this._thumb.setAttribute("stroke-width", "0.5");
    this._thumbLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    this._thumbLine.setAttribute("cx", this._width / 2);
    this._thumbLine.setAttribute("cy", this._height / 2);
    this._thumbLine.setAttribute("r", "2");
    this._thumbLine.setAttribute("fill", "rgba(20, 20, 20, 0.9)");
    this._thumbInnerGroup.appendChild(this._thumb);
    this._thumbInnerGroup.appendChild(this._thumbLine);
  }
  _createTriangleDownThumb() {
    const centerX = this._width / 2;
    const topY = 0;
    const bottomY = this._height / 2;
    const leftX = 0;
    const rightX = this._width;
    const points =
      leftX +
      "," +
      topY +
      " " +
      rightX +
      "," +
      topY +
      " " +
      centerX +
      "," +
      bottomY;
    this._thumb = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon",
    );
    this._thumb.setAttribute("points", points);
    this._thumb.setAttribute("fill", "url(#" + this._gradientId + ")");
    this._thumb.setAttribute("stroke", "#999999");
    this._thumb.setAttribute("stroke-width", "0.5");
    this._thumbLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    this._thumbLine.setAttribute("x1", centerX);
    this._thumbLine.setAttribute("y1", topY + 1);
    this._thumbLine.setAttribute("x2", centerX);
    this._thumbLine.setAttribute("y2", bottomY - 1);
    this._thumbLine.setAttribute("stroke", "rgba(20, 20, 20, 0.9)");
    this._thumbLine.setAttribute("stroke-width", "1");
    this._thumbInnerGroup.appendChild(this._thumb);
    this._thumbInnerGroup.appendChild(this._thumbLine);
  }
  _createTriangleUpThumb() {
    const centerX = this._width / 2;
    const topY = this._height / 2;
    const bottomY = this._height;
    const leftX = 0;
    const rightX = this._width;
    const points =
      centerX +
      "," +
      topY +
      " " +
      leftX +
      "," +
      bottomY +
      " " +
      rightX +
      "," +
      bottomY;
    this._thumb = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon",
    );
    this._thumb.setAttribute("points", points);
    this._thumb.setAttribute("fill", "url(#" + this._gradientId + ")");
    this._thumb.setAttribute("stroke", "#999999");
    this._thumb.setAttribute("stroke-width", "0.5");
    this._thumbLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    this._thumbLine.setAttribute("x1", centerX);
    this._thumbLine.setAttribute("y1", topY + 1);
    this._thumbLine.setAttribute("x2", centerX);
    this._thumbLine.setAttribute("y2", bottomY - 1);
    this._thumbLine.setAttribute("stroke", "rgba(20, 20, 20, 0.9)");
    this._thumbLine.setAttribute("stroke-width", "1");
    this._thumbInnerGroup.appendChild(this._thumb);
    this._thumbInnerGroup.appendChild(this._thumbLine);
  }
  _formatDisplayValue(value) {
    let roundedValue = Math.round(value / this._step) * this._step;

    let decimalPlaces = 0;
    if (this._step < 1) {
      decimalPlaces = Math.max(0, -Math.floor(Math.log10(this._step)));
    }

    let displayString = roundedValue.toFixed(decimalPlaces);

    if (this._displayCommaType === "comma") {
      displayString = displayString.replace(".", ",");
    }

    if (this._valueFormatter) {
      displayString = String(this._valueFormatter(roundedValue, displayString));
    }

    return displayString;
  }
  _updateRangeMarker() {
    if (!this._rangeMarker || !this._rangeMarkerVisible) return;
    if (this._isVertical) {
      const svgWidth = this._svg.getAttribute("width");
      const trackX = svgWidth / 2;
      const markerWidth = 20;
      const markerX = trackX - markerWidth / 2;
      const offset = (this._height - this._width) / 2;
      const startPercentage =
        1 - (this._rangeMarkerEnd - this._min) / (this._max - this._min);
      const endPercentage =
        1 - (this._rangeMarkerStart - this._min) / (this._max - this._min);
      const startY =
        this._width / 2 + offset + startPercentage * this._trackLength;
      const endY = this._width / 2 + offset + endPercentage * this._trackLength;
      const height = endY - startY;
      this._rangeMarker.setAttribute("x", markerX);
      this._rangeMarker.setAttribute("y", startY);
      this._rangeMarker.setAttribute("width", markerWidth);
      this._rangeMarker.setAttribute("height", height);
    } else {
      const svgHeight = this._svg.getAttribute("height");
      const trackY = svgHeight / 2;
      const markerHeight = 20;
      const markerY = trackY - markerHeight / 2;
      const startPercentage =
        (this._rangeMarkerStart - this._min) / (this._max - this._min);
      const endPercentage =
        (this._rangeMarkerEnd - this._min) / (this._max - this._min);
      const startX = this._width / 2 + startPercentage * this._trackLength;
      const endX = this._width / 2 + endPercentage * this._trackLength;
      const width = endX - startX;
      this._rangeMarker.setAttribute("x", startX);
      this._rangeMarker.setAttribute("y", markerY);
      this._rangeMarker.setAttribute("width", width);
      this._rangeMarker.setAttribute("height", markerHeight);
    }
  }
  _applyStyles() {
    if (!this._element) return;
    this._container.style.display = "flex";
    this._container.style.alignItems = "center";
    this._container.style.backgroundColor = "transparent";
    this._container.style.padding = "5px";
    this._container.style.borderRadius = "4px";
    if (this._isVertical) {
      this._container.style.flexDirection = "column";
    } else {
      this._container.style.flexDirection = "row";
    }
    if (this._valueDisplay) {
      this._valueDisplay.style.fontFamily = this._font;
      this._valueDisplay.style.fontSize = this._fontSize + "px";
      if (this._isVertical) {
        this._valueDisplay.style.marginLeft = "0";
        this._valueDisplay.style.marginTop = "10px";
      } else {
        this._valueDisplay.style.marginLeft = "10px";
        this._valueDisplay.style.marginTop = "0";
      }
      this._valueDisplay.style.minWidth = "40px";
      this._valueDisplay.style.textAlign = "center";
      this._valueDisplay.textContent = this._formatDisplayValue(this._value);
    }
    if (this._track) {
      if (this._isVertical) {
        const svgWidth = this._svg.getAttribute("width");
        const offset = (this._height - this._width) / 2;
        this._track.setAttribute("x1", svgWidth / 2);
        this._track.setAttribute("y1", this._width / 2 + offset);
        this._track.setAttribute("x2", svgWidth / 2);
        this._track.setAttribute(
          "y2",
          this._trackLength + this._width / 2 + offset,
        );
      } else {
        const svgHeight = this._svg.getAttribute("height");
        this._track.setAttribute("x1", this._width / 2);
        this._track.setAttribute("y1", svgHeight / 2);
        this._track.setAttribute("x2", this._trackLength + this._width / 2);
        this._track.setAttribute("y2", svgHeight / 2);
      }
    }
    if (this._svg) {
      let svgWidth, svgHeight;
      if (this._isVertical) {
        svgWidth = this._height + 10;
        svgHeight = this._trackLength + this._width;
      } else {
        svgWidth = this._trackLength + this._width;
        svgHeight = this._height + 10;
      }
      this._svg.setAttribute("width", svgWidth);
      this._svg.setAttribute("height", svgHeight);
      this._svg.setAttribute("viewBox", "0 0 " + svgWidth + " " + svgHeight);
    }
    if (this._hitArea) {
      if (this._isVertical) {
        this._hitArea.setAttribute("width", this._height + 10);
        this._hitArea.setAttribute("height", this._trackLength + this._width);
      } else {
        this._hitArea.setAttribute("width", this._trackLength + this._width);
        this._hitArea.setAttribute("height", this._height + 10);
      }
    }
    this._updateRangeMarker();
    this._updateThumbPosition();
  }
  _updateThumbPosition() {
    if (!this._thumbGroup) return;
    const percentage = (this._value - this._min) / (this._max - this._min);
    let posX, posY;
    if (this._isVertical) {
      const invertedPercentage = 1 - percentage;
      posY = invertedPercentage * this._trackLength;
      const svgWidth = this._svg.getAttribute("width");
      if (this._thumbShape === "triangle-B") {
        posX = svgWidth / 2 - this._width / 2;
      } else if (this._thumbShape === "triangle-A") {
        posX = svgWidth / 2 - this._width / 2;
      } else {
        posX = svgWidth / 2 - this._width / 2;
      }
    } else {
      posX = percentage * this._trackLength;
      if (this._thumbShape === "triangle-B") {
        const trackY = this._svg.getAttribute("height") / 2;
        posY = trackY - this._height / 2;
      } else if (this._thumbShape === "triangle-A") {
        const trackY = this._svg.getAttribute("height") / 2;
        posY = trackY - this._height / 2;
      } else {
        posY = this._svg.getAttribute("height") / 2 - this._height / 2;
      }
    }
    this._thumbGroup.setAttribute(
      "transform",
      "translate(" + posX + ", " + posY + ")",
    );
  }
  _setupEvents() {
    if (!this._svg) return;
    let isDragging = false;
    let dragOffset = 0;
    const setThumbStroke = (color) => {
      if (this._thumb) {
        this._thumb.setAttribute("stroke", color);
      }
    };
    const getValueFromPosition = (clientX, clientY) => {
      const svgRect = this._svg.getBoundingClientRect();
      const CTM = this._svg.getScreenCTM();
      if (!CTM) return this._value;
      const svgPoint = this._svg.createSVGPoint();
      svgPoint.x = clientX;
      svgPoint.y = clientY;
      const transformedPoint = svgPoint.matrixTransform(CTM.inverse());
      let percentage;
      if (this._isVertical) {
        let trackPosition = transformedPoint.y - dragOffset;
        percentage = (trackPosition - this._width / 2) / this._trackLength;
        percentage = 1 - percentage;
        percentage = Math.max(0, Math.min(1, percentage));
      } else {
        let trackPosition = transformedPoint.x - dragOffset;
        percentage = (trackPosition - this._width / 2) / this._trackLength;
        percentage = Math.max(0, Math.min(1, percentage));
      }
      const rawValue = this._min + percentage * (this._max - this._min);
      const steppedValue = Math.round(rawValue / this._step) * this._step;
      return Math.max(this._min, Math.min(this._max, steppedValue));
    };
    const updateValue = (clientX, clientY) => {
      let newValue = getValueFromPosition(clientX, clientY);
      if (
        this._snapEnabled &&
        this._snapValues &&
        this._snapValues.length > 0
      ) {
        const CTM = this._svg.getScreenCTM();
        if (CTM) {
          const svgPoint = this._svg.createSVGPoint();
          svgPoint.x = clientX;
          svgPoint.y = clientY;
          const transformedPoint = svgPoint.matrixTransform(CTM.inverse());
          const pixelThreshold = 4 * (CTM.a !== 0 ? 1 / CTM.a : 1);
          let closestSnapValue = null;
          let minDistance = Infinity;
          for (const snapValue of this._snapValues) {
            if (snapValue >= this._min && snapValue <= this._max) {
              const snapPercentage =
                (snapValue - this._min) / (this._max - this._min);
              let snapPosition;
              if (this._isVertical) {
                const invertedPercentage = 1 - snapPercentage;
                snapPosition =
                  invertedPercentage * this._trackLength + this._width / 2;
                const distance = Math.abs(transformedPoint.y - snapPosition);
                if (distance < pixelThreshold && distance < minDistance) {
                  minDistance = distance;
                  closestSnapValue = snapValue;
                }
              } else {
                snapPosition =
                  snapPercentage * this._trackLength + this._width / 2;
                const distance = Math.abs(transformedPoint.x - snapPosition);
                if (distance < pixelThreshold && distance < minDistance) {
                  minDistance = distance;
                  closestSnapValue = snapValue;
                }
              }
            }
          }
          if (closestSnapValue !== null) {
            newValue = closestSnapValue;
          }
        }
      }
      if (newValue !== this._value) {
        this.setValue(newValue);
        const event = new CustomEvent("slider-change", {
          detail: { component: this, value: this._value },
        });
        event.value = this._value;
        this._element.dispatchEvent(event);
      }
    };
    const onMouseDown = (e) => {
      isDragging = true;
      const CTM = this._svg.getScreenCTM();
      if (!CTM) return;
      const svgPoint = this._svg.createSVGPoint();
      const mousePoint = this._svg.createSVGPoint();
      mousePoint.x = e.clientX;
      mousePoint.y = e.clientY;
      const transformedMousePoint = mousePoint.matrixTransform(CTM.inverse());
      if (this._isVertical) {
        const percentage = (this._value - this._min) / (this._max - this._min);
        const invertedPercentage = 1 - percentage;
        const thumbCenterInSVG =
          invertedPercentage * this._trackLength + this._width / 2;
        dragOffset = transformedMousePoint.y - thumbCenterInSVG;
      } else {
        const percentage = (this._value - this._min) / (this._max - this._min);
        const thumbCenterInSVG =
          percentage * this._trackLength + this._width / 2;
        dragOffset = transformedMousePoint.x - thumbCenterInSVG;
      }
      document.body.style.userSelect = "none";
      setThumbStroke("#228B22");
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      e.preventDefault();
    };
    const onMouseMove = (e) => {
      if (isDragging) {
        updateValue(e.clientX, e.clientY);
        e.preventDefault();
      }
    };
    const onMouseUp = (e) => {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = "";
        setThumbStroke("#999999");
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        updateValue(e.clientX, e.clientY);
      }
    };
    const onMouseOver = () => {
      setThumbStroke("#228B22");
    };
    const onMouseOut = () => {
      if (!isDragging) {
        setThumbStroke("#999999");
      }
    };
    const onTrackClick = (e) => {
      if (!isDragging) {
        dragOffset = 0;
        updateValue(e.clientX, e.clientY);
        isDragging = true;
        const CTM = this._svg.getScreenCTM();
        if (CTM) {
          const mousePoint = this._svg.createSVGPoint();
          mousePoint.x = e.clientX;
          mousePoint.y = e.clientY;
          const transformedMousePoint = mousePoint.matrixTransform(
            CTM.inverse(),
          );
          if (this._isVertical) {
            const percentage =
              (this._value - this._min) / (this._max - this._min);
            const invertedPercentage = 1 - percentage;
            const thumbCenterInSVG =
              invertedPercentage * this._trackLength + this._width / 2;
            dragOffset = transformedMousePoint.y - thumbCenterInSVG;
          } else {
            const percentage =
              (this._value - this._min) / (this._max - this._min);
            const thumbCenterInSVG =
              percentage * this._trackLength + this._width / 2;
            dragOffset = transformedMousePoint.x - thumbCenterInSVG;
          }
        }
        document.body.style.userSelect = "none";
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        setThumbStroke("#228B22");
      }
    };
    this._thumbGroup.addEventListener("mousedown", onMouseDown);
    this._thumbGroup.addEventListener("mouseover", onMouseOver);
    this._thumbGroup.addEventListener("mouseout", onMouseOut);
    this._hitArea.addEventListener("mousedown", onTrackClick);
    this._thumbGroup.addEventListener("touchstart", (e) => {
      isDragging = true;
      const CTM = this._svg.getScreenCTM();
      if (!CTM) return;
      const touchPoint = this._svg.createSVGPoint();
      touchPoint.x = e.touches[0].clientX;
      touchPoint.y = e.touches[0].clientY;
      const transformedTouchPoint = touchPoint.matrixTransform(CTM.inverse());
      if (this._isVertical) {
        const percentage = (this._value - this._min) / (this._max - this._min);
        const invertedPercentage = 1 - percentage;
        const thumbCenterInSVG =
          invertedPercentage * this._trackLength + this._width / 2;
        dragOffset = transformedTouchPoint.y - thumbCenterInSVG;
      } else {
        const percentage = (this._value - this._min) / (this._max - this._min);
        const thumbCenterInSVG =
          percentage * this._trackLength + this._width / 2;
        dragOffset = transformedTouchPoint.x - thumbCenterInSVG;
      }
      setThumbStroke("#228B22");
      document.addEventListener("touchmove", onTouchMove);
      document.addEventListener("touchend", onTouchEnd);
      e.preventDefault();
    });
    const onTouchMove = (e) => {
      if (isDragging) {
        updateValue(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
      }
    };
    const onTouchEnd = (e) => {
      if (isDragging) {
        isDragging = false;
        setThumbStroke("#999999");
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
        if (
          this._snapEnabled &&
          this._snapValues &&
          this._snapValues.length > 0
        ) {
          if (e.changedTouches && e.changedTouches.length > 0) {
            updateValue(
              e.changedTouches[0].clientX,
              e.changedTouches[0].clientY,
            );
          }
        }
      }
    };
    this._hitArea.addEventListener("touchstart", (e) => {
      if (!isDragging) {
        dragOffset = 0;
        updateValue(e.touches[0].clientX, e.touches[0].clientY);
        const CTM = this._svg.getScreenCTM();
        if (CTM) {
          const touchPoint = this._svg.createSVGPoint();
          touchPoint.x = e.touches[0].clientX;
          touchPoint.y = e.touches[0].clientY;
          const transformedTouchPoint = touchPoint.matrixTransform(
            CTM.inverse(),
          );
          if (this._isVertical) {
            const percentage =
              (this._value - this._min) / (this._max - this._min);
            const invertedPercentage = 1 - percentage;
            const thumbCenterInSVG =
              invertedPercentage * this._trackLength + this._width / 2;
            dragOffset = transformedTouchPoint.y - thumbCenterInSVG;
          } else {
            const percentage =
              (this._value - this._min) / (this._max - this._min);
            const thumbCenterInSVG =
              percentage * this._trackLength + this._width / 2;
            dragOffset = transformedTouchPoint.x - thumbCenterInSVG;
          }
        }
        isDragging = true;
        document.addEventListener("touchmove", onTouchMove);
        document.addEventListener("touchend", onTouchEnd);
        setThumbStroke("#228B22");
        e.preventDefault();
      }
    });
  }
  setValue(value) {
    value = Number(value);
    value = Math.max(this._min, Math.min(this._max, value));
    value =
      Math.round((value - this._min) / this._step) * this._step + this._min;
    if (this._value !== value) {
      this._value = value;
      if (this._valueDisplay) {
        this._valueDisplay.textContent = this._formatDisplayValue(this._value);
      }
      this._updateThumbPosition();
    }
  }
  setMin(min) {
    this._min = Number(min);
    if (this._value < this._min) {
      this.setValue(this._min);
    }
    this._updateRangeMarker();
    this._updateThumbPosition();
  }
  setMax(max) {
    this._max = Number(max);
    if (this._value > this._max) {
      this.setValue(this._max);
    }
    this._updateRangeMarker();
    this._updateThumbPosition();
  }
  setStep(step) {
    this._step = Number(step);
    this.setValue(this._value);
    if (this._valueDisplay) {
      this._valueDisplay.textContent = this._formatDisplayValue(this._value);
    }
  }
  setHeight(height) {
    this._height = Number(height);
    this._width = this._height / 2;
    this._createThumb();
    this._applyStyles();
    this._setupEvents();
  }
  setTrackLength(length) {
    this._trackLength = Number(length);
    this._applyStyles();
  }
  enableValueDisplay(formatter) {
    this._showValue = true;
    if (typeof formatter === "function") {
      this._valueFormatter = formatter;
    }
    if (!this._valueDisplay) {
      this._valueDisplay = document.createElement("span");
      this._valueDisplay.className = "pixi-slider-value";
      this._container.appendChild(this._valueDisplay);
    }
    this._applyStyles();
  }
  setValueDisplayFont(font = "Arial", fontSize = 16) {
    this._font = font;
    this._fontSize = fontSize;
    if (this._valueDisplay) {
      this._applyStyles();
    }
  }
  setDisplayCommaType(commaType) {
    this._displayCommaType = commaType === "comma" ? "comma" : "dot";
    if (this._valueDisplay) {
      this._valueDisplay.textContent = this._formatDisplayValue(this._value);
    }
  }
  setThumbShape(shape) {
    const validShapes = ["rectangle", "circle", "triangle-A", "triangle-B"];
    if (validShapes.includes(shape)) {
      this._thumbShape = shape;
      this._createThumb();
      this._setupEvents();
      this._updateThumbPosition();
    } else {
      console.warn(
        "Invalid thumb shape: " +
          shape +
          ". Valid shapes are: " +
          validShapes.join(", "),
      );
    }
  }
  setRangeMarker(startValue, endValue) {
    startValue = Math.max(this._min, Math.min(this._max, Number(startValue)));
    endValue = Math.max(this._min, Math.min(this._max, Number(endValue)));
    if (startValue > endValue) {
      [startValue, endValue] = [endValue, startValue];
    }
    this._rangeMarkerStart = startValue;
    this._rangeMarkerEnd = endValue;
    this._rangeMarkerVisible = true;
    if (this._rangeMarker) {
      this._rangeMarker.style.display = "block";
      this._updateRangeMarker();
    }
  }
  setVertical() {
    if (this._isVertical) return;
    this._isVertical = true;
    if (this._svg) {
      this._container.removeChild(this._svg);
    }
    this._createSVGElements();
    this._applyStyles();
    this._setupEvents();
    this._updateThumbPosition();
  }
  get value() {
    return this._value;
  }
  set value(val) {
    this.setValue(val);
  }
  get thumbShape() {
    return this._thumbShape;
  }
  set thumbShape(shape) {
    this.setThumbShape(shape);
  }
  get displayCommaType() {
    return this._displayCommaType;
  }
  set displayCommaType(commaType) {
    this.setDisplayCommaType(commaType);
  }
  get rangeMarkerStart() {
    return this._rangeMarkerStart;
  }
  get rangeMarkerEnd() {
    return this._rangeMarkerEnd;
  }
  get rangeMarkerVisible() {
    return this._rangeMarkerVisible;
  }
  get isVertical() {
    return this._isVertical;
  }
  onChange(callback) {
    if (this._element) {
      this._element.addEventListener("slider-change", callback);
    }
  }
  /**
   * Enables snap-to-values feature with the specified values
   * @param {Array} values - Array of values to snap to (must be between min and max)
   */
  enableSnap(values) {
    if (Array.isArray(values)) {
      this._snapValues = values.filter(
        (val) => val >= this._min && val <= this._max,
      );
      this._snapEnabled = true;
    }
  }
  static {
    if (!document.getElementById("svg-slider-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "svg-slider-styles";
      styleElement.textContent =
        ".pixi-svg-slider-container {" +
        "background-color: transparent;" +
        "padding: 5px 10px;" +
        "border-radius: 4px;" +
        "display: flex;" +
        "align-items: center;" +
        "}" +
        ".pixi-slider-value {" +
        "margin-left: 10px;" +
        "min-width: 40px;" +
        "text-align: center;" +
        "font-family: Arial, sans-serif;" +
        "}";
      document.head.appendChild(styleElement);
    }
  }
};
HtmlSvgEdu.MathForm = class MathForm extends HtmlSvgEdu.Component {
  static serializationMap = {
    description: {
      de: "Mathematische Formel mit MathJax-Rendering",
      en: "Mathematical formula with MathJax rendering",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: 'let myFormula = new MathForm("x^2 + y^2 = r^2");',
    constructor: {
      formula: {
        name: "formula",
        info: {
          en: "Mathematical formula as LaTeX string or MathJax-formatted string",
          de: "Mathematische Formel als LaTeX-String oder MathJax-formatierter String",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element",
          de: "Horizontale Position des Elements",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element",
          de: "Vertikale Position des Elements",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
        },
        example: "visible = true",
      },
    },
    methods: {
      setScale: {
        name: "setScale",
        info: {
          en: "Sets the scaling factor of the formula",
          de: "Setzt den Skalierungsfaktor der Formel",
        },
        example: "setScale(1.5)",
      },
      setColor: {
        name: "setColor",
        info: {
          en: "Sets the color of the formula",
          de: "Setzt die Farbe der Formel",
        },
        example: 'setColor("#FF0000")',
      },
    },
  };
  constructor(formula) {
    super();
    this._width = "auto";
    this._height = "auto";
    this._scale = 1;
    this._color = "#000000";
    this._element = this._createElement("div");
    this._element.className = "pixi-html-ui pixi-math-form";
    this._formulaContainer = document.createElement("div");
    this._element.appendChild(this._formulaContainer);
    this._applyStyles();
    this.setFormula(formula);
  }
  _applyStyles() {
    if (!this._element) return;
    if (typeof this._width === "number") {
      this._element.style.width = this._width + "px";
    } else {
      this._element.style.width = this._width;
    }
    if (typeof this._height === "number") {
      this._element.style.height = this._height + "px";
    } else {
      this._element.style.height = this._height;
    }
    this._formulaContainer.style.transform = "scale(" + this._scale + ")";
    this._formulaContainer.style.transformOrigin = "left top";
    this._formulaContainer.style.color = this._color;
  }
  _determineFormatType(formula) {
    if (!formula) return { rawFormula: "", isBlock: false };
    if (formula.startsWith("$$") && formula.endsWith("$$")) {
      return {
        rawFormula: formula.substring(2, formula.length - 2),
        isBlock: true,
        format: "dollar",
      };
    }
    if (formula.startsWith("\\[") && formula.endsWith("\\]")) {
      return {
        rawFormula: formula.substring(2, formula.length - 2),
        isBlock: true,
        format: "bracket",
      };
    }
    if (
      formula.startsWith("$") &&
      formula.endsWith("$") &&
      !formula.startsWith("$$")
    ) {
      return {
        rawFormula: formula.substring(1, formula.length - 1),
        isBlock: false,
        format: "dollar",
      };
    }
    if (formula.startsWith("\\(") && formula.endsWith("\\)")) {
      return {
        rawFormula: formula.substring(2, formula.length - 2),
        isBlock: false,
        format: "bracket",
      };
    }
    return {
      rawFormula: formula,
      isBlock: false,
      format: "none",
    };
  }
  _renderFormula() {
    if (!this._formulaContainer || !this._formula) return;
    const { rawFormula, isBlock, format } = this._determineFormatType(
      this._formula,
    );
    if (isBlock) {
      this._formulaContainer.innerHTML = "\\[" + rawFormula + "\\]";
      this._formulaContainer.style.display = "block";
      this._formulaContainer.style.margin = "1em 0";
    } else {
      this._formulaContainer.innerHTML = "\\(" + rawFormula + "\\)";
      this._formulaContainer.style.display = "inline-block";
      this._formulaContainer.style.margin = "0";
    }
    this._processMathJax();
  }
  _processMathJax() {
    if (window.MathJax && window.MathJax.typeset) {
      window.MathJax.typeset([this._formulaContainer]);
    } else {
      this._waitForMathJax();
    }
  }
  _waitForMathJax() {
    const checkInterval = setInterval(() => {
      if (window.MathJax && window.MathJax.typeset) {
        clearInterval(checkInterval);
        window.MathJax.typeset([this._formulaContainer]);
      }
    }, 100);
    setTimeout(() => {
      clearInterval(checkInterval);
      console.warn("MathJax wurde nicht innerhalb von 5 Sekunden geladen.");
    }, 5000);
  }
  setFormula(formula) {
    this._formula = formula;
    this._formula.replace(/(?<!\\)\\(?!\\)/g, "\\\\");
    this._renderFormula();
  }
  setScale(scale) {
    this._scale = scale;
    this._applyStyles();
  }
  setColor(color) {
    this._color = color;
    this._applyStyles();
  }
  setWidth(width) {
    this._width = width;
    this._applyStyles();
  }
  setHeight(height) {
    this._height = height;
    this._applyStyles();
  }
};

HtmlSvgEdu.Text = class Text extends HtmlSvgEdu.Component {
  static serializationMap = {
    description: {
      de: "Text-Element mit Formatierung",
      en: "Text element with formatting",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      'let myText = new Text("Hello World", "Arial", 16, 0x000000, "center");',
    constructor: {
      text: {
        name: "text",
        info: {
          en: "Text content to display (\\n for line break, <sub></sub> and <sup></sup> for subscript/superscript possible)",
          de: "Anzuzeigender Textinhalt (\\n für Zeilenwechsel, <sub></sub> und <sup></sup> für tiefgestellt/hochgestellt möglich)",
        },
      },
      font: {
        name: "font",
        info: {
          en: "Font family of the text",
          de: "Schriftart des Textes",
        },
      },
      fontSize: {
        name: "fontSize",
        info: {
          en: "Font size in pixels",
          de: "Schriftgröße in Pixeln",
        },
      },
      textColor: {
        name: "textColor",
        info: {
          en: "Color of the text (e.g. 0x000000)",
          de: "Farbe des Textes (z.B. 0x000000)",
        },
      },
      textAlign: {
        name: "textAlign",
        info: {
          en: "Text alignment (left, center, right)",
          de: "Textausrichtung (left, center, right)",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element",
          de: "Horizontale Position des Elements",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element",
          de: "Vertikale Position des Elements",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
        },
        example: "visible = true",
      },
      width: {
        name: "width",
        info: {
          en: "Width of the text box for word wrapping (null to disable)",
          de: "Breite des Textfelds für Zeilenumbruch (null zum Deaktivieren)",
        },
        example: "width = 200",
      },
      height: {
        name: "height",
        info: {
          en: "Height of the text box (null for automatic height)",
          de: "Höhe des Textfelds (null für automatische Höhe)",
        },
        example: "height = 100",
      },
    },
    methods: {
      setText: {
        name: "setText",
        info: {
          en: "Changes the text content",
          de: "Ändert den Textinhalt",
        },
        example:
          'setText("New text with <sub>subscript</sub> and <sup>superscript</sup>")',
      },
      setFont: {
        name: "setFont",
        info: {
          en: "Changes the font family",
          de: "Ändert die Schriftart",
        },
        example: 'setFont("Times New Roman")',
      },
      setFontSize: {
        name: "setFontSize",
        info: {
          en: "Changes the font size",
          de: "Ändert die Schriftgröße",
        },
        example: "setFontSize(24)",
      },
      setTextColor: {
        name: "setTextColor",
        info: {
          en: "Changes the text color",
          de: "Ändert die Textfarbe",
        },
        example: "setTextColor(0xFF0000)",
      },
      setSize: {
        name: "setSize",
        info: {
          en: "Sets the text box dimensions for word wrapping. Pass null to disable the box.",
          de: "Setzt die Textfeld-Abmessungen für automatischen Zeilenumbruch. null deaktiviert das Textfeld.",
        },
        example: "setSize(200, 100)",
      },
      setLineHeight: {
        name: "setLineHeight",
        info: {
          en: "Sets the line height factor (1.0 = single, 1.5 = one-and-a-half, 2.0 = double)",
          de: "Setzt den Zeilenabstandsfaktor (1.0 = einfach, 1.5 = anderthalbfach, 2.0 = doppelt)",
        },
        example: "setLineHeight(1.5)",
      },
      setLetterSpacing: {
        name: "setLetterSpacing",
        info: {
          en: "Sets the letter spacing in pixels",
          de: "Setzt den Zeichenabstand in Pixeln",
        },
        example: "setLetterSpacing(2)",
      },
      setHyphenation: {
        name: "setHyphenation",
        info: {
          en: "Enables or disables automatic hyphenation (only effective when a text box width is set)",
          de: "Aktiviert oder deaktiviert die automatische Silbentrennung (nur wirksam wenn eine Textfeld-Breite gesetzt ist)",
        },
        example: "setHyphenation(true)",
      },
    },
  };
  constructor(
    text = "Text",
    font = "Arial",
    fontSize = 16,
    textColor = 0x000000,
    textAlign = "left",
  ) {
    super();
    this._text = text;
    this._font = font;
    this._fontSize = fontSize;
    this._textColor = textColor;
    this._textAlign = textAlign;
    this._lineHeightFactor = 1.2;
    this._letterSpacing = 0;
    this._hyphenate = false;
    this._boxWidth = null;
    this._boxHeight = null;
    this._wrappedLines = null;
    this._instanceId = "text-" + Math.random().toString(36).substr(2, 9);
    this._cssTextColor = this._hexToCSS(textColor);
    this._container = this._createElement("div");
    this._container.className = "pixi-html-ui pixi-svg-text-container";
    this._svgElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    this._svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    this._calculateSvgSize();
    this._addStyles();
    this._createTextElements();
    this._applyAlignmentTransform();
    this._container.appendChild(this._svgElement);
    this._element = this._container;
  }
  _hexToCSS(hexColor) {
    const hex = hexColor.toString(16).padStart(6, "0");
    return "#" + hex;
  }
  _applyAlignmentTransform() {
    switch (this._textAlign) {
      case "center":
        this._container.style.transform = "translateX(-50%)";
        break;
      case "right":
        this._container.style.transform = "translateX(-100%)";
        break;
      default:
        this._container.style.transform = "";
        break;
    }
  }
  _parseHtmlTags(text) {
    const parts = [];
    let currentPos = 0;
    const tagRegex = /<(sub|sup)>(.*?)<\/\1>/gi;
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
      if (match.index > currentPos) {
        const beforeText = text.substring(currentPos, match.index);
        if (beforeText) {
          parts.push({ type: "normal", text: beforeText });
        }
      }
      parts.push({
        type: match[1].toLowerCase(),
        text: match[2],
      });
      currentPos = match.index + match[0].length;
    }
    if (currentPos < text.length) {
      const remainingText = text.substring(currentPos);
      if (remainingText) {
        parts.push({ type: "normal", text: remainingText });
      }
    }
    if (parts.length === 0) {
      parts.push({ type: "normal", text: text });
    }
    return parts;
  }
  _calculateTextDimensions() {
    const lines = this._text.split("\\n");
    let maxLineWidth = 0;
    let totalHeight = 0;
    lines.forEach((line) => {
      const parsedLine = this._parseHtmlTags(line);
      let lineWidth = 0;
      let lineHeight = this._fontSize;
      parsedLine.forEach((part) => {
        let charWidth, partHeight;
        if (part.type === "sub" || part.type === "sup") {
          const subSupSize = this._fontSize * 0.7;
          charWidth = part.text.length * (subSupSize * 0.6);
          partHeight = subSupSize;
        } else {
          charWidth = part.text.length * (this._fontSize * 0.6);
          partHeight = this._fontSize;
        }
        lineWidth += charWidth;
        lineHeight = Math.max(lineHeight, partHeight);
      });
      maxLineWidth = Math.max(maxLineWidth, lineWidth);
      totalHeight += lineHeight;
    });
    if (lines.length > 1) {
      totalHeight += (lines.length - 1) * (this._fontSize * (this._lineHeightFactor - 1.0));
    }
    totalHeight += this._fontSize * 0.4; // extra space for sub/sup characters
    return {
      width: maxLineWidth,
      height: totalHeight,
      lineCount: lines.length,
      lines: lines,
    };
  }
  _calculateSvgSize() {
    let svgWidth, svgHeight;
    if (this._boxWidth !== null) {
      this._wrappedLines = this._getWrappedLines();
      svgWidth = this._boxWidth;
      const lineHeight = this._fontSize * this._lineHeightFactor;
      const totalTextHeight = this._wrappedLines.length * lineHeight;
      svgHeight =
        this._boxHeight !== null ? this._boxHeight : totalTextHeight + 20;
      this._textDimensions = {
        width: svgWidth - 20,
        height: svgHeight - 20,
        lineCount: this._wrappedLines.length,
        lines: this._wrappedLines,
      };
    } else {
      this._wrappedLines = null;
      const textDimensions = this._calculateTextDimensions();
      const padding = 20;
      svgWidth = textDimensions.width + padding;
      svgHeight = textDimensions.height + padding;
      this._textDimensions = textDimensions;
    }
    this._svgElement.setAttribute("width", svgWidth);
    this._svgElement.setAttribute("height", svgHeight);
    this._svgElement.setAttribute(
      "viewBox",
      "0 0 " + svgWidth + " " + svgHeight,
    );
  }
  _estimateTextWidth(text) {
    const plainText = text.replace(/<[^>]+>/g, "");
    return (
      plainText.length * (this._fontSize * 0.6) +
      Math.max(0, plainText.length - 1) * this._letterSpacing
    );
  }
  _getWrappedLines() {
    const hardLines = this._text.split("\\n");
    const result = [];
    for (const line of hardLines) {
      const wrapped = this._wrapLine(line);
      result.push(...wrapped);
    }
    return result;
  }
  _wrapLine(text) {
    if (!text) return [""];
    const availWidth = this._boxWidth - 20;
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? currentLine + " " + word : word;
      if (this._estimateTextWidth(testLine) <= availWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = "";
        }
        if (this._estimateTextWidth(word) <= availWidth) {
          currentLine = word;
        } else if (this._hyphenate) {
          let remaining = word;
          while (remaining.length > 0) {
            if (this._estimateTextWidth(remaining) <= availWidth) {
              currentLine = remaining;
              remaining = "";
            } else {
              const splitPos = this._findHyphenPoint(remaining, availWidth);
              lines.push(remaining.substring(0, splitPos) + "-");
              remaining = remaining.substring(splitPos);
            }
          }
        } else {
          currentLine = word;
        }
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines.length > 0 ? lines : [""];
  }
  _findHyphenPoint(word, maxWidth) {
    const vowels = "aeiouäöüAEIOUÄÖÜ";
    const isVowel = (c) => vowels.includes(c);
    let bestSyllablePos = -1;
    let lastFitPos = -1;
    for (let i = 2; i < word.length - 1; i++) {
      if (this._estimateTextWidth(word.substring(0, i) + "-") > maxWidth)
        break;
      lastFitPos = i;
      if (i >= 2 && i < word.length - 2) {
        if (!isVowel(word[i - 1]) && isVowel(word[i])) {
          bestSyllablePos = i;
        } else if (
          isVowel(word[i - 1]) &&
          !isVowel(word[i]) &&
          i + 1 < word.length &&
          !isVowel(word[i + 1])
        ) {
          bestSyllablePos = i + 1;
        }
      }
    }
    const splitPos = bestSyllablePos > 0 ? bestSyllablePos : lastFitPos;
    return splitPos > 0 ? splitPos : Math.max(2, Math.floor(word.length / 2));
  }
  _addStyles() {
    const style = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style",
    );
    style.textContent =
      "/* Text styles for instance " +
      this._instanceId +
      " */" +
      "." +
      this._instanceId +
      "-label {" +
      "font-family: " +
      this._font +
      ";" +
      "font-size: " +
      this._fontSize +
      "px;" +
      "fill: " +
      this._cssTextColor +
      ";" +
      "dominant-baseline: middle;" +
      "user-select: none;" +
      "letter-spacing: " +
      this._letterSpacing +
      "px;" +
      "}" +
      "." +
      this._instanceId +
      "-sub {" +
      "font-size: " +
      this._fontSize * 0.7 +
      "px;" +
      "}" +
      "." +
      this._instanceId +
      "-sup {" +
      "font-size: " +
      this._fontSize * 0.7 +
      "px;" +
      "}";
    this._svgElement.appendChild(style);
  }
  _createTextElements() {
    const textDimensions = this._textDimensions;
    const svgWidth = parseInt(this._svgElement.getAttribute("width"));
    const svgHeight = parseInt(this._svgElement.getAttribute("height"));
    this._textGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    this._textGroup.setAttribute("class", "text-container");
    this._textGroup.setAttribute("id", this._instanceId);
    this._createStyledLabel(svgWidth, svgHeight);
    this._svgElement.appendChild(this._textGroup);
  }
  _createStyledLabel(svgWidth, svgHeight) {
    const lines =
      this._wrappedLines !== null
        ? this._wrappedLines
        : this._text.split("\\n");
    const lineHeight = this._fontSize * this._lineHeightFactor;
    const totalTextHeight = lines.length * lineHeight;
    const textStartY =
      this._wrappedLines !== null
        ? 0
        : svgHeight / 2 - totalTextHeight / 2;
    lines.forEach((line, lineIndex) => {
      const textElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      textElement.setAttribute("class", this._instanceId + "-label");
      let textX;
      let textAnchor = "start";
      switch (this._textAlign) {
        case "center":
          textX = svgWidth / 2;
          textAnchor = "middle";
          break;
        case "right":
          textX = svgWidth - 10;
          textAnchor = "end";
          break;
        default:
          textX = 10;
          textAnchor = "start";
          break;
      }
      textElement.setAttribute("x", textX.toString());
      const baselineY = textStartY + (lineIndex + 0.5) * lineHeight;
      textElement.setAttribute("y", baselineY.toString());
      textElement.setAttribute("text-anchor", textAnchor);
      textElement.setAttribute("dominant-baseline", "middle");
      const parsedLine = this._parseHtmlTags(line);
      if (parsedLine.length === 1 && parsedLine[0].type === "normal") {
        textElement.textContent = parsedLine[0].text;
      } else {
        let currentX = 0;
        parsedLine.forEach((part, index) => {
          const tspan = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "tspan",
          );
          tspan.textContent = part.text;

          if (part.type === "sub") {
            tspan.setAttribute("class", this._instanceId + "-sub");
            tspan.setAttribute("dy", (this._fontSize * 0.25).toString());
          } else if (part.type === "sup") {
            tspan.setAttribute("class", this._instanceId + "-sup");
            tspan.setAttribute("dy", (-this._fontSize * 0.35).toString());
          } else {
            if (index > 0) {
              const prevPart = parsedLine[index - 1];
              if (prevPart.type === "sub") {
                tspan.setAttribute("dy", (-this._fontSize * 0.25).toString());
              } else if (prevPart.type === "sup") {
                tspan.setAttribute("dy", (this._fontSize * 0.35).toString());
              }
            }
          }

          if (
            index > 0 &&
            (this._textAlign === "center" || this._textAlign === "right")
          ) {
            tspan.setAttribute("dx", "0");
          }

          textElement.appendChild(tspan);
        });
      }
      this._textGroup.appendChild(textElement);
    });
  }
  get text() {
    return this._text;
  }
  set text(value) {
    this._text = value;
    this._refreshText();
  }
  setText(text) {
    this._text = text;
    this._refreshText();
  }
  setFont(font) {
    this._font = font;
    this._updateStyles();
  }
  setFontSize(fontSize) {
    this._fontSize = fontSize;
    this._refreshText();
  }
  setTextColor(textColor) {
    this._textColor = textColor;
    this._cssTextColor = this._hexToCSS(textColor);
    this._updateStyles();
  }
  setTextAlign(textAlign) {
    this._textAlign = textAlign;
    this._refreshText();
  }
  get width() {
    return this._boxWidth;
  }
  set width(value) {
    this._boxWidth = value;
    this._refreshText();
  }
  get height() {
    return this._boxHeight;
  }
  set height(value) {
    this._boxHeight = value;
    this._refreshText();
  }
  setSize(width, height = null) {
    this._boxWidth = width;
    this._boxHeight = height;
    this._refreshText();
  }
  setLineHeight(factor) {
    this._lineHeightFactor = factor;
    this._refreshText();
  }
  setLetterSpacing(px) {
    this._letterSpacing = px;
    this._refreshText();
  }
  setHyphenation(enabled) {
    this._hyphenate = enabled;
    if (this._boxWidth !== null) {
      this._refreshText();
    }
  }
  _updateStyles() {
    const oldStyle = this._svgElement.querySelector("style");
    if (oldStyle) {
      oldStyle.remove();
    }
    this._addStyles();
  }
  _refreshText() {
    if (this._textGroup) {
      this._textGroup.remove();
      this._calculateSvgSize();
      this._updateStyles();
      this._createTextElements();
      this._applyAlignmentTransform();
    }
  }
};

HtmlSvgEdu.Preloader = class Preloader extends HtmlSvgEdu.Component {
  static serializationMap = {
    description: {
      de: "Ladeanzeige mit Spinner",
      en: "Loading indicator with spinner",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      'let myPreloader = new Preloader("Loading...", true, 0xF5F5F5, 0x666666);',
    constructor: {
      text: {
        name: "text",
        info: {
          en: "Loading text to display",
          de: "Anzuzeigender Ladetext",
        },
      },
      showSpinner: {
        name: "showSpinner",
        info: {
          en: "Show animated spinner",
          de: "Animierten Spinner anzeigen",
        },
      },
      backgroundColor: {
        name: "backgroundColor",
        info: {
          en: "Background color (e.g. 0xF5F5F5)",
          de: "Hintergrundfarbe (z.B. 0xF5F5F5)",
        },
      },
      spinnerColor: {
        name: "spinnerColor",
        info: {
          en: "Spinner color (e.g. 0x666666)",
          de: "Spinner-Farbe (z.B. 0x666666)",
        },
      },
    },
    setter: {
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the preloader",
          de: "Sichtbarkeit des Preloaders",
        },
        example: "visible = false",
      },
    },
    methods: {
      show: {
        name: "show",
        info: {
          en: "Shows the preloader",
          de: "Zeigt den Preloader an",
        },
        example: "show()",
      },
      hide: {
        name: "hide",
        info: {
          en: "Hides the preloader with fade out",
          de: "Blendet den Preloader aus",
        },
        example: "hide()",
      },
      setText: {
        name: "setText",
        info: {
          en: "Changes the loading text",
          de: "Ändert den Ladetext",
        },
        example: 'setText("Loading assets...")',
      },
    },
  };
  constructor(
    text = "",
    showSpinner = true,
    backgroundColor = 0xf5f5f5,
    spinnerColor = 0x666666,
  ) {
    super();
    this._text = text;
    this._showSpinner = showSpinner;
    this._showText = text !== "";
    this._backgroundColor = backgroundColor;
    this._spinnerColor = spinnerColor;
    this._isAnimating = false;
    this._instanceId = "preloader-" + Math.random().toString(36).substr(2, 9);
    this._cssBackgroundColor = this._hexToCSS(backgroundColor);
    this._cssSpinnerColor = this._hexToCSS(spinnerColor);
    this._container = this._createElement("div");
    this._container.className = "pixi-html-ui pixi-preloader-overlay";
    this._container.id = this._instanceId;
    this._container.style.position = "absolute";
    this._container.style.top = "0";
    this._container.style.left = "0";
    this._container.style.width = "100%";
    this._container.style.height = "100%";
    this._container.style.backgroundColor = this._cssBackgroundColor;
    this._container.style.display = "flex";
    this._container.style.alignItems = "center";
    this._container.style.justifyContent = "center";
    this._container.style.flexDirection = "column";
    this._container.style.zIndex = "9999";
    this._container.style.transition = "opacity 0.3s ease-out";
    this._container.style.opacity = "1";
    this._addStyles();
    this._createContent();
    this._element = this._container;
    this.show();
  }
  _hexToCSS(hexColor) {
    const hex = hexColor.toString(16).padStart(6, "0");
    return "#" + hex;
  }
  _addStyles() {
    if (document.getElementById(this._instanceId + "-styles")) return;
    const styleElement = document.createElement("style");
    styleElement.id = this._instanceId + "-styles";
    styleElement.textContent =
      "#" +
      this._instanceId +
      ".hiding {" +
      "opacity: 0 !important;" +
      "pointer-events: none;" +
      "}" +
      "#" +
      this._instanceId +
      " .spinner {" +
      "width: 40px;" +
      "height: 40px;" +
      "border: 3px solid rgba(0, 0, 0, 0.1);" +
      "border-top-color: " +
      this._cssSpinnerColor +
      ";" +
      "border-radius: 50%;" +
      "animation: " +
      this._instanceId +
      "-spin 1s linear infinite;" +
      "margin-bottom: 15px;" +
      "}" +
      "@keyframes " +
      this._instanceId +
      "-spin {" +
      "to { transform: rotate(360deg); }" +
      "}" +
      "#" +
      this._instanceId +
      " .loading-text {" +
      "font-family: Arial, sans-serif;" +
      "font-size: 14px;" +
      "color: " +
      this._cssSpinnerColor +
      ";" +
      "display: flex;" +
      "align-items: center;" +
      "}" +
      "#" +
      this._instanceId +
      " .dots {" +
      "display: inline-block;" +
      "width: 20px;" +
      "margin-left: 2px;" +
      "}" +
      "#" +
      this._instanceId +
      " .dots::after {" +
      "content: '...';" +
      "animation: " +
      this._instanceId +
      "-dots 1.5s infinite;" +
      "}" +
      "@keyframes " +
      this._instanceId +
      "-dots {" +
      "0%, 20% { content: ''; }" +
      "40% { content: '.'; }" +
      "60% { content: '..'; }" +
      "80%, 100% { content: '...'; }" +
      "}";
    document.head.appendChild(styleElement);
  }
  _createContent() {
    if (this._showSpinner) {
      this._spinner = document.createElement("div");
      this._spinner.className = "spinner";
      this._container.appendChild(this._spinner);
    }
    if (this._showText && this._text) {
      const textContainer = document.createElement("div");
      textContainer.className = "loading-text";
      this._textElement = document.createElement("span");
      this._textElement.textContent = this._text;
      textContainer.appendChild(this._textElement);
      const dots = document.createElement("span");
      dots.className = "dots";
      textContainer.appendChild(dots);
      this._container.appendChild(textContainer);
    }
  }
  setDimensions(width, height) {
    if (this._container) {
      this._container.style.width = width + "px";
      this._container.style.height = height + "px";
    }
  }
  show() {
    this._container.classList.remove("hiding");
    this._container.style.display = "flex";
    this._isAnimating = false;
  }
  hide(duration = 300) {
    if (this._isAnimating) return;
    this._isAnimating = true;
    this._container.classList.add("hiding");
    setTimeout(() => {
      this._container.style.display = "none";
      this._isAnimating = false;
    }, duration);
  }
  setText(text) {
    this._text = text;
    this._showText = text !== "";
    const existingTextContainer =
      this._container.querySelector(".loading-text");
    if (existingTextContainer) {
      existingTextContainer.remove();
    }
    if (this._showText && this._text) {
      const textContainer = document.createElement("div");
      textContainer.className = "loading-text";
      this._textElement = document.createElement("span");
      this._textElement.textContent = this._text;
      textContainer.appendChild(this._textElement);
      const dots = document.createElement("span");
      dots.className = "dots";
      textContainer.appendChild(dots);
      this._container.appendChild(textContainer);
    } else {
      this._textElement = null;
    }
  }
  setSpinnerVisibility(visible) {
    this._showSpinner = visible;
    if (this._spinner) {
      this._spinner.style.display = visible ? "block" : "none";
    }
  }
  set visible(value) {
    if (value) {
      this.show();
    } else {
      this.hide();
    }
  }
  get visible() {
    return (
      this._container.style.display !== "none" &&
      !this._container.classList.contains("hiding")
    );
  }
  destroy() {
    const styleElement = document.getElementById(this._instanceId + "-styles");
    if (styleElement) {
      styleElement.remove();
    }
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
  }
};

HtmlSvgEdu.ParameterTable = class ParameterTable extends HtmlSvgEdu.Component {
  static serializationMap = {
    description: {
      de: "Parameter-Tabelle mit editierbaren Werten",
      en: "Parameter table with editable values",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      'let myTable = new ParameterTable([{name: "Speed", value: 50}], 300);',
    constructor: {
      parameters: {
        name: "parameters",
        info: {
          en: 'Array of parameter objects with name and value [{name: "Parameter", value: 123}]. Names support HTML tags: <b>, <i>, <sub>, <sup>',
          de: 'Array von Parameter-Objekten mit Name und Wert [{name: "Parameter", value: 123}]. Namen unterstützen HTML-Tags: <b>, <i>, <sub>, <sup>',
        },
      },
      width: {
        name: "width",
        info: {
          en: "Width of the table in pixels",
          de: "Breite der Tabelle in Pixeln",
        },
      },
      font: {
        name: "font",
        info: {
          en: "Font family of the text",
          de: "Schriftart des Textes",
        },
      },
      fontSize: {
        name: "fontSize",
        info: {
          en: "Font size in pixels",
          de: "Schriftgröße in Pixeln",
        },
      },
      textColor: {
        name: "textColor",
        info: {
          en: "Text color (e.g. 0x000000)",
          de: "Textfarbe (z.B. 0x000000)",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element",
          de: "Horizontale Position des Elements",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element",
          de: "Vertikale Position des Elements",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
        },
        example: "visible = true",
      },
    },
    methods: {
      setTitle: {
        name: "setTitle",
        info: {
          en: "Sets the table title/header. Supports HTML tags: <b>, <i>, <sub>, <sup>",
          de: "Setzt die Tabellenüberschrift. Unterstützt HTML-Tags: <b>, <i>, <sub>, <sup>",
        },
        example: 'setTitle("Configuration"); // or setTitle("v<sub>max</sub>")',
      },
      setValue: {
        name: "setValue",
        info: {
          en: "Sets the value of a parameter by name",
          de: "Setzt den Wert eines Parameters anhand des Namens",
        },
        example: 'setValue("Speed", 50)',
      },
      getValue: {
        name: "getValue",
        info: {
          en: "Gets the value of a parameter by name",
          de: "Gibt den Wert eines Parameters anhand des Namens zurück",
        },
        example: 'getValue("Speed")',
      },
      setValueLimits: {
        name: "setValueLimits",
        info: {
          en: "Sets min/max limits for a parameter value",
          de: "Setzt Min/Max-Grenzen für einen Parameterwert",
        },
        example: 'setValueLimits("Speed", 0, 100)',
      },
      setDecimalSeparator: {
        name: "setDecimalSeparator",
        info: {
          en: 'Sets decimal separator ("." or ",")',
          de: 'Setzt das Dezimaltrennzeichen ("." oder ",")',
        },
        example: 'setDecimalSeparator(",")',
      },
      setRounding: {
        name: "setRounding",
        info: {
          en: "Sets rounding precision for a parameter (e.g. 0.01 for 2 decimals, 1 for integers)",
          de: "Setzt die Rundungsgenauigkeit für einen Parameter (z.B. 0.01 für 2 Dezimalstellen, 1 für Ganzzahlen)",
        },
        example: 'setRounding("Speed", 0.01)',
      },
      addParameter: {
        name: "addParameter",
        info: {
          en: "Adds a new parameter to the table. Name supports HTML tags: <b>, <i>, <sub>, <sup>",
          de: "Fügt einen neuen Parameter zur Tabelle hinzu. Name unterstützt HTML-Tags: <b>, <i>, <sub>, <sup>",
        },
        example:
          'addParameter("New Param", 0); // or addParameter("F<sub>res</sub>", 100)',
      },
      removeParameter: {
        name: "removeParameter",
        info: {
          en: "Removes a parameter from the table",
          de: "Entfernt einen Parameter aus der Tabelle",
        },
        example: 'removeParameter("Speed")',
      },
      onChange: {
        name: "onChange",
        info: {
          en: "Adds an event listener for value changes",
          de: "Fügt einen Event-Listener für Wertänderungen hinzu",
        },
        example:
          "onChange(handleChange);\n\nfunction handleChange(event) { console.log(event.parameterName, event.newValue); }",
      },
    },
  };
  constructor(
    parameters = [],
    width = 300,
    font = "Arial",
    fontSize = 14,
    textColor = 0x000000,
  ) {
    super();
    this._parameters = parameters || [];
    this._width = width;
    this._font = font;
    this._fontSize = fontSize;
    this._textColor = textColor;
    this._title = "";
    this._decimalSeparator = ".";
    this._valueLimits = new Map();
    this._rounding = new Map();
    this._defaultRounding = 0.001;
    this._cssTextColor = this._hexToCSS(textColor);
    this._container = this._createElement("div");
    this._container.className = "pixi-html-ui pixi-parameter-table";
    this._addStyles();
    this._createTable();
    this._element = this._container;
    this._populateTable();
  }
  _hexToCSS(hexColor) {
    const hex = hexColor.toString(16).padStart(6, "0");
    return "#" + hex;
  }
  _addStyles() {
    if (document.getElementById("parameter-table-styles")) return;
    const styleElement = document.createElement("style");
    styleElement.id = "parameter-table-styles";
    styleElement.textContent =
      ".pixi-parameter-table {\n" +
      "    background-color: rgba(255, 255, 255, 0.95);\n" +
      "    border: 1px solid #ccc;\n" +
      "    border-radius: 4px;\n" +
      "    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n" +
      "    overflow: hidden;\n" +
      "}\n" +
      ".pixi-parameter-table table {\n" +
      "    width: 100%;\n" +
      "    border-collapse: collapse;\n" +
      "    margin: 0;\n" +
      "}\n" +
      ".pixi-parameter-table-title {\n" +
      "    background-color: #f0f0f0;\n" +
      "    padding: 8px 12px;\n" +
      "    font-weight: bold;\n" +
      "    text-align: center;\n" +
      "    border-bottom: 1px solid #ddd;\n" +
      "}\n" +
      ".pixi-parameter-table th,\n" +
      ".pixi-parameter-table td {\n" +
      "    padding: 6px 12px;\n" +
      "    text-align: left;\n" +
      "    border-bottom: 1px solid #eee;\n" +
      "}\n" +
      ".pixi-parameter-table th {\n" +
      "    background-color: #f8f8f8;\n" +
      "    font-weight: normal;\n" +
      "    width: 50%;\n" +
      "}\n" +
      ".pixi-parameter-table td {\n" +
      "    background-color: #fff;\n" +
      "}\n" +
      ".pixi-parameter-table tr:last-child th,\n" +
      ".pixi-parameter-table tr:last-child td {\n" +
      "    border-bottom: none;\n" +
      "}\n" +
      ".pixi-parameter-table input {\n" +
      "    width: 100%;\n" +
      "    padding: 4px 6px;\n" +
      "    border: 1px solid #ddd;\n" +
      "    border-radius: 3px;\n" +
      "    font-family: inherit;\n" +
      "    font-size: inherit;\n" +
      "    color: inherit;\n" +
      "    background-color: #fff;\n" +
      "    box-sizing: border-box;\n" +
      "    transition: border-color 0.2s;\n" +
      "}\n" +
      ".pixi-parameter-table input:focus {\n" +
      "    outline: none;\n" +
      "    border-color: #228B22;\n" +
      "}\n" +
      ".pixi-parameter-table input:hover {\n" +
      "    border-color: #999;\n" +
      "}\n" +
      ".pixi-parameter-table input.error {\n" +
      "    border-color: #ff4444;\n" +
      "    background-color: #fff5f5;\n" +
      "}\n";
    document.head.appendChild(styleElement);
  }
  _createTable() {
    this._titleElement = document.createElement("div");
    this._titleElement.className = "pixi-parameter-table-title";
    this._titleElement.style.display = "none";
    this._container.appendChild(this._titleElement);
    this._table = document.createElement("table");
    this._tableBody = document.createElement("tbody");
    this._table.appendChild(this._tableBody);
    this._container.appendChild(this._table);
    this._applyStyles();
  }
  _applyStyles() {
    if (!this._container) return;
    this._container.style.width = this._width + "px";
    if (this._titleElement) {
      this._titleElement.style.fontFamily = this._font;
      this._titleElement.style.fontSize = this._fontSize + 2 + "px";
      this._titleElement.style.color = this._cssTextColor;
    }
    if (this._table) {
      this._table.style.fontFamily = this._font;
      this._table.style.fontSize = this._fontSize + "px";
      this._table.style.color = this._cssTextColor;
    }
  }
  _populateTable() {
    this._tableBody.innerHTML = "";
    this._parameters.forEach((param, index) => {
      this._createParameterRow(param, index);
    });
  }

  _sanitizeAndParseHTML(text) {
    const allowedTags = ["sub", "sup", "i", "b"];

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;

    const sanitizeNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();

        if (allowedTags.includes(tagName)) {
          const newElement = document.createElement(tagName);
          for (let child of node.childNodes) {
            const sanitizedChild = sanitizeNode(child);
            if (typeof sanitizedChild === "string") {
              newElement.appendChild(document.createTextNode(sanitizedChild));
            } else {
              newElement.appendChild(sanitizedChild);
            }
          }
          return newElement;
        } else {
          return document.createTextNode(node.textContent);
        }
      }

      return "";
    };

    const fragment = document.createDocumentFragment();
    for (let child of tempDiv.childNodes) {
      const sanitized = sanitizeNode(child);
      if (typeof sanitized === "string") {
        fragment.appendChild(document.createTextNode(sanitized));
      } else if (sanitized) {
        fragment.appendChild(sanitized);
      }
    }

    return fragment;
  }

  _stripHTML(text) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || "";
  }

  _createParameterRow(param, index) {
    const row = document.createElement("tr");
    const labelCell = document.createElement("th");

    const sanitizedHTML = this._sanitizeAndParseHTML(param.name);
    labelCell.innerHTML = "";
    labelCell.appendChild(sanitizedHTML);

    row.appendChild(labelCell);
    const valueCell = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.value = this._formatValue(
      this._roundValue(param.value, param.name),
      param.name,
    );
    input.dataset.parameterIndex = index;
    input.dataset.parameterName = param.name;
    input.dataset.parameterNameClean = this._stripHTML(param.name);

    input.addEventListener("input", (e) => this._handleInput(e));
    input.addEventListener("change", (e) => this._handleChange(e));
    input.addEventListener("blur", (e) => this._handleBlur(e));
    valueCell.appendChild(input);
    row.appendChild(valueCell);
    this._tableBody.appendChild(row);
  }

  _roundValue(value, parameterName) {
    const cleanName = this._stripHTML(parameterName);
    const rounding = this._rounding.has(cleanName)
      ? this._rounding.get(cleanName)
      : this._defaultRounding;
    if (rounding > 0) {
      return Math.round(value / rounding) * rounding;
    }
    return value;
  }

  _formatValue(value, parameterName) {
    const cleanName = parameterName ? this._stripHTML(parameterName) : "";
    const rounding =
      cleanName && this._rounding.has(cleanName)
        ? this._rounding.get(cleanName)
        : this._defaultRounding;
    let decimals = 0;
    if (rounding < 1) {
      decimals = Math.max(0, -Math.floor(Math.log10(rounding)));
    }
    let formattedValue = value.toFixed(decimals);
    if (formattedValue.includes(".")) {
      formattedValue = formattedValue.replace(/\.?0+$/, "");
    }
    if (this._decimalSeparator === ",") {
      formattedValue = formattedValue.replace(".", ",");
    }
    return formattedValue;
  }

  _parseValue(valueStr) {
    if (typeof valueStr !== "string") {
      valueStr = String(valueStr);
    }
    const normalizedValue = valueStr.replace(",", ".");
    return parseFloat(normalizedValue);
  }

  _handleInput(event) {
    const input = event.target;
    const parameterName = input.dataset.parameterName;
    const cleanName = this._stripHTML(parameterName);
    const value = this._parseValue(input.value);

    if (!isNaN(value)) {
      if (this._valueLimits.has(cleanName)) {
        const limits = this._valueLimits.get(cleanName);
        if (value < limits.min || value > limits.max) {
          input.classList.add("error");
        } else {
          input.classList.remove("error");
        }
      } else {
        input.classList.remove("error");
      }
    } else if (
      input.value !== "" &&
      input.value !== "-" &&
      input.value !== this._decimalSeparator
    ) {
      input.classList.add("error");
    }
  }

  _handleChange(event) {
    const input = event.target;
    const parameterIndex = parseInt(input.dataset.parameterIndex);
    const parameterName = input.dataset.parameterName;
    const cleanName = this._stripHTML(parameterName);
    const value = this._parseValue(input.value);

    if (!isNaN(value)) {
      let finalValue = value;
      if (this._valueLimits.has(cleanName)) {
        const limits = this._valueLimits.get(cleanName);
        finalValue = Math.max(limits.min, Math.min(limits.max, value));
      }
      finalValue = this._roundValue(finalValue, parameterName);
      this._parameters[parameterIndex].value = finalValue;
      input.value = this._formatValue(finalValue, parameterName);
      input.classList.remove("error");

      const customEvent = new CustomEvent("parameter-change", {
        detail: {
          component: this,
          parameterName: parameterName,
          parameterIndex: parameterIndex,
          oldValue: value,
          newValue: finalValue,
        },
      });
      customEvent.parameterName = parameterName;
      customEvent.newValue = finalValue;
      this._element.dispatchEvent(customEvent);
    } else {
      input.value = this._formatValue(
        this._parameters[parameterIndex].value,
        parameterName,
      );
      input.classList.remove("error");
    }
  }

  _handleBlur(event) {
    const input = event.target;
    const parameterIndex = parseInt(input.dataset.parameterIndex);
    if (input.classList.contains("error")) {
      const parameterName = input.dataset.parameterName;
      input.value = this._formatValue(
        this._parameters[parameterIndex].value,
        parameterName,
      );
      input.classList.remove("error");
    }
  }

  setTitle(title) {
    this._title = title;
    if (this._titleElement) {
      if (title) {
        this._titleElement.innerHTML = "";
        this._titleElement.appendChild(this._sanitizeAndParseHTML(title));
        this._titleElement.style.display = "block";
      } else {
        this._titleElement.style.display = "none";
      }
    }
  }

  setValue(parameterName, value) {
    const paramIndex = this._parameters.findIndex(
      (p) =>
        p.name === parameterName || this._stripHTML(p.name) === parameterName,
    );

    if (paramIndex !== -1) {
      const cleanName = this._stripHTML(this._parameters[paramIndex].name);
      let finalValue = value;

      if (this._valueLimits.has(cleanName)) {
        const limits = this._valueLimits.get(cleanName);
        finalValue = Math.max(limits.min, Math.min(limits.max, value));
      }

      finalValue = this._roundValue(
        finalValue,
        this._parameters[paramIndex].name,
      );
      this._parameters[paramIndex].value = finalValue;

      const input =
        this._tableBody.querySelector(
          'input[data-parameter-name="' +
            this._parameters[paramIndex].name +
            '"]',
        ) ||
        this._tableBody.querySelector(
          'input[data-parameter-name-clean="' + cleanName + '"]',
        );

      if (input) {
        input.value = this._formatValue(
          finalValue,
          this._parameters[paramIndex].name,
        );
      }
    }
  }

  getValue(parameterName) {
    const param = this._parameters.find(
      (p) =>
        p.name === parameterName || this._stripHTML(p.name) === parameterName,
    );
    return param ? param.value : null;
  }

  setValueLimits(parameterName, min, max) {
    const cleanName = this._stripHTML(parameterName);
    this._valueLimits.set(cleanName, { min: min, max: max });

    const paramIndex = this._parameters.findIndex(
      (p) =>
        p.name === parameterName || this._stripHTML(p.name) === parameterName,
    );

    if (paramIndex !== -1) {
      const currentValue = this._parameters[paramIndex].value;
      const limitedValue = Math.max(min, Math.min(max, currentValue));
      if (limitedValue !== currentValue) {
        this.setValue(this._parameters[paramIndex].name, limitedValue);
      }
    }
  }

  removeValueLimits(parameterName) {
    const cleanName = this._stripHTML(parameterName);
    this._valueLimits.delete(cleanName);
  }

  setRounding(parameterName, rounding) {
    const cleanName = this._stripHTML(parameterName);
    if (rounding > 0) {
      this._rounding.set(cleanName, rounding);

      const paramIndex = this._parameters.findIndex(
        (p) =>
          p.name === parameterName || this._stripHTML(p.name) === parameterName,
      );

      if (paramIndex !== -1) {
        const currentValue = this._parameters[paramIndex].value;
        const roundedValue = this._roundValue(
          currentValue,
          this._parameters[paramIndex].name,
        );
        if (roundedValue !== currentValue) {
          this.setValue(this._parameters[paramIndex].name, roundedValue);
        }
      }
    }
  }

  removeRounding(parameterName) {
    const cleanName = this._stripHTML(parameterName);
    this._rounding.delete(cleanName);
  }

  setDefaultRounding(rounding) {
    if (rounding > 0) {
      this._defaultRounding = rounding;
      this._parameters.forEach((param, index) => {
        const cleanName = this._stripHTML(param.name);
        if (!this._rounding.has(cleanName)) {
          const roundedValue = this._roundValue(param.value, param.name);
          if (roundedValue !== param.value) {
            this.setValue(param.name, roundedValue);
          }
        }
      });
    }
  }

  setDecimalSeparator(separator) {
    if (separator === "," || separator === ".") {
      this._decimalSeparator = separator;
      this._populateTable();
    }
  }

  setFont(font) {
    this._font = font;
    this._applyStyles();
  }

  setFontSize(fontSize) {
    this._fontSize = fontSize;
    this._applyStyles();
  }

  setTextColor(textColor) {
    this._textColor = textColor;
    this._cssTextColor = this._hexToCSS(textColor);
    this._applyStyles();
  }

  addParameter(name, value = 0) {
    const cleanName = this._stripHTML(name);
    if (this._parameters.find((p) => this._stripHTML(p.name) === cleanName)) {
      console.warn('Parameter "' + name + '" already exists');
      return;
    }

    const roundedValue = this._roundValue(value, name);
    this._parameters.push({ name: name, value: roundedValue });
    this._createParameterRow(
      { name: name, value: roundedValue },
      this._parameters.length - 1,
    );
  }

  removeParameter(name) {
    const index = this._parameters.findIndex(
      (p) => p.name === name || this._stripHTML(p.name) === name,
    );

    if (index !== -1) {
      const cleanName = this._stripHTML(this._parameters[index].name);
      this._parameters.splice(index, 1);
      this._valueLimits.delete(cleanName);
      this._rounding.delete(cleanName);
      this._populateTable();
    }
  }

  getAllParameters() {
    return this._parameters.map((p) => ({ name: p.name, value: p.value }));
  }

  onChange(callback) {
    if (this._element) {
      this._element.addEventListener("parameter-change", callback);
    }
  }

  get parameters() {
    return this._parameters;
  }

  get title() {
    return this._title;
  }

  get decimalSeparator() {
    return this._decimalSeparator;
  }

  get defaultRounding() {
    return this._defaultRounding;
  }

  getRounding(parameterName) {
    const cleanName = this._stripHTML(parameterName);
    return this._rounding.has(cleanName)
      ? this._rounding.get(cleanName)
      : this._defaultRounding;
  }
};
HtmlSvgEdu.Model3D = class Model3D extends HtmlSvgEdu.Component {
  static _instances = new Set();

  static serializationMap = {
    description: {
      de: "3D-Modell-Viewer als iframe mit postMessage-API",
      en: "3D model viewer as iframe with postMessage API",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      'let myModel = new Model3D("https://example.com/model", 600, 400);',
    constructor: {
      url: {
        name: "url",
        info: {
          en: "URL of the 3D model viewer to embed",
          de: "URL des einzubettenden 3D-Modell-Viewers",
        },
      },
      width: {
        name: "width",
        info: {
          en: "Width of the iframe in pixels",
          de: "Breite des iframes in Pixeln",
        },
      },
      height: {
        name: "height",
        info: {
          en: "Height of the iframe in pixels",
          de: "Höhe des iframes in Pixeln",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element",
          de: "Horizontale Position des Elements",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element",
          de: "Vertikale Position des Elements",
        },
        example: "y = 200",
      },
      width: {
        name: "width",
        info: {
          en: "Width of the iframe in pixels",
          de: "Breite des iframes in Pixeln",
        },
        example: "width = 600",
      },
      height: {
        name: "height",
        info: {
          en: "Height of the iframe in pixels",
          de: "Höhe des iframes in Pixeln",
        },
        example: "height = 400",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
        },
        example: "visible = true",
      },
    },
    methods: {
      setProperty: {
        name: "setProperty",
        info: {
          en: "Sets a property of an object in the 3D scene",
          de: "Setzt eine Eigenschaft eines Objekts in der 3D-Szene",
        },
        example: 'setProperty("Zahnrad_1", "color", "#ff0000")',
      },
      setCamera: {
        name: "setCamera",
        info: {
          en: "Controls the camera in the 3D scene",
          de: "Steuert die Kamera in der 3D-Szene",
        },
        example: 'setCamera({ position: { x: 0, y: 5, z: 10 } })',
      },
      setMode: {
        name: "setMode",
        info: {
          en: "Sets the viewer mode",
          de: "Setzt den Viewer-Modus",
        },
        example: 'setMode("wireframe")',
      },
      setBackground: {
        name: "setBackground",
        info: {
          en: "Sets the background of the 3D scene",
          de: "Setzt den Hintergrund der 3D-Szene",
        },
        example: 'setBackground("#ffffff")',
      },
      hideObject: {
        name: "hideObject",
        info: {
          en: "Hides an object in the 3D scene",
          de: "Versteckt ein Objekt in der 3D-Szene",
        },
        example: 'hideObject("Zahnrad_1")',
      },
      showObject: {
        name: "showObject",
        info: {
          en: "Shows a previously hidden object in the 3D scene",
          de: "Zeigt ein zuvor verstecktes Objekt in der 3D-Szene",
        },
        example: 'showObject("Zahnrad_1")',
      },
      selectObject: {
        name: "selectObject",
        info: {
          en: "Selects an object in the 3D scene",
          de: "Wählt ein Objekt in der 3D-Szene aus",
        },
        example: 'selectObject("Zahnrad_1")',
      },
      deselectAll: {
        name: "deselectAll",
        info: {
          en: "Deselects all objects in the 3D scene",
          de: "Hebt die Auswahl aller Objekte in der 3D-Szene auf",
        },
        example: "deselectAll()",
      },
      getSceneInfo: {
        name: "getSceneInfo",
        info: {
          en: "Requests scene information from the 3D viewer",
          de: "Fordert Szeneninformationen vom 3D-Viewer an",
        },
        example: "getSceneInfo()",
      },
      onMessage: {
        name: "onMessage",
        info: {
          en: "Registers a callback for messages from the 3D viewer (objectSelected, propertyChanged, etc.)",
          de: "Registriert einen Callback für Nachrichten vom 3D-Viewer (objectSelected, propertyChanged, usw.)",
        },
        example: "onMessage((data) => { console.log(data); })",
      },
      onReady: {
        name: "onReady",
        info: {
          en: "Registers a callback that fires once the 3D viewer is fully loaded and ready to receive commands.",
          de: "Registriert einen Callback, der ausgelöst wird, sobald der 3D-Viewer vollständig geladen und bereit ist, Befehle zu empfangen.",
        },
        example: "onReady(() => { getSceneInfo(); })",
      },
      onObjectSelected: {
        name: "onObjectSelected",
        info: {
          en: "Registers a callback that fires when a clickable object in the 3D scene is clicked. The callback receives an event object with a 'value' property containing the object name.",
          de: "Registriert einen Callback, der ausgelöst wird, wenn ein anklickbares Objekt in der 3D-Szene angeklickt wird. Der Callback erhält ein Event-Objekt mit der Eigenschaft 'value', die den Objektnamen enthält.",
        },
        example: "onObjectSelected((event) => { console.log(event.value); })",
      },
    },
  };

  constructor(url, width = 600, height = 400) {
    super();
    this._url = url;
    this._width = width;
    this._height = height;
    this._messageCallback = null;
    this._objectSelectedCallback = null;
    this._readyCallback = null;
    this._screenshotResolve = null;
    this._screenshotId = null;
    this._boundMessageHandler = this._handleMessage.bind(this);
    HtmlSvgEdu.Model3D._instances.add(this);

    const iframe = this._createElement("iframe");
    iframe.style.width = this._width + "px";
    iframe.style.height = this._height + "px";
    iframe.style.border = "none";
    iframe.scrolling = "no";
    iframe.style.overflow = "hidden";
    iframe.style.pointerEvents = "auto";
    iframe.setAttribute("scrolling", "no");
    iframe.addEventListener("load", () => {
      if (window.logEvalMessage) window.logEvalMessage("[Model3D] iframe geladen: " + this._url, "log");
      if (this._readyCallback) this._readyCallback();
    });
    iframe.src = this._url;
    if (window.logEvalMessage) window.logEvalMessage("[Model3D] iframe src gesetzt: " + this._url, "log");

    window.addEventListener("message", this._boundMessageHandler);
  }

  _handleMessage(event) {
    const data = event.data;
    if (!data || data.type !== "sceneEditor") return;
    if (window.logEvalMessage) window.logEvalMessage("[Model3D] Nachricht empfangen: " + data.action, "log");
    if (this._readyCallback && data.action === "ready") {
      this._readyCallback();
    }
    if (data.action === "screenshotData" && data.data && data.data.screenshotId === this._screenshotId) {
      if (this._screenshotResolve) {
        this._screenshotResolve(data.data);
        this._screenshotResolve = null;
        this._screenshotId = null;
      }
      return;
    }
    if (this._messageCallback) {
      this._messageCallback(data);
    }
    if (this._objectSelectedCallback && data.action === "objectSelected") {
      this._objectSelectedCallback({ value: data.data.name });
    }
  }

  _postMessage(payload) {
    if (this._element && this._element.contentWindow) {
      this._element.contentWindow.postMessage(payload, "*");
    }
  }

  captureScreenshot() {
    // Direkter Canvas-Zugriff (same-origin)
    try {
      const win = this._element && this._element.contentWindow;
      const doc = this._element && this._element.contentDocument;
      if (win && doc) {
        const canvas = doc.querySelector("canvas");
        if (canvas) {
          if (win.sceneEditor && win.sceneEditor.sceneManager) {
            const sm = win.sceneEditor.sceneManager;
            sm.renderer.render(sm.scene, sm.camera);
          }
          const canvasLeft = canvas.offsetLeft || 0;
          const canvasTop = canvas.offsetTop || 0;
          const bcrInner = canvas.getBoundingClientRect();
          console.log("[3D-SVG] this._x:", this._x, "this._y:", this._y, "_width:", this._width, "_height:", this._height);
          console.log("[3D-SVG] iframe style.width:", this._element.style.width, "style.height:", this._element.style.height);
          console.log("[3D-SVG] canvas.clientWidth:", canvas.clientWidth, "canvas.clientHeight:", canvas.clientHeight);
          console.log("[3D-SVG] canvas.offsetLeft:", canvas.offsetLeft, "canvas.offsetTop:", canvas.offsetTop);
          console.log("[3D-SVG] getBoundingClientRect (inner):", JSON.stringify(bcrInner));
          console.log("[3D-SVG] canvas.width (physical):", canvas.width, "canvas.height:", canvas.height);
          return Promise.resolve({
            imageData: canvas.toDataURL("image/png"),
            x: this._x + canvasLeft,
            y: this._y + canvasTop,
            width: canvas.clientWidth,
            height: canvas.clientHeight,
          });
        }
      }
    } catch (e) {
      console.warn("[Model3D] Direkter Canvas-Zugriff fehlgeschlagen:", e.message);
    }
    // Fallback: postMessage (cross-origin)
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this._screenshotResolve = null;
        this._screenshotId = null;
        reject(new Error("Screenshot timeout"));
      }, 3000);
      this._screenshotId = Math.random().toString(36).slice(2);
      this._screenshotResolve = (responseData) => {
        clearTimeout(timeoutId);
        const cr = responseData.canvasRect;
        resolve({
          imageData: responseData.imageData,
          x: this._x + (cr ? cr.left : 0),
          y: this._y + (cr ? cr.top : 0),
          width: cr ? cr.width : this._width,
          height: cr ? cr.height : this._height,
        });
      };
      this._postMessage({ action: "requestScreenshot", screenshotId: this._screenshotId });
    });
  }

  set width(value) {
    this._width = value;
    if (this._element) this._element.style.width = value + "px";
  }

  get width() {
    return this._width;
  }

  set height(value) {
    this._height = value;
    if (this._element) this._element.style.height = value + "px";
  }

  get height() {
    return this._height;
  }

  setProperty(object, property, value) {
    this._postMessage({ action: "setProperty", object, property, value });
  }

  setCamera(cameraData) {
    this._postMessage({ action: "setCamera", ...cameraData });
  }

  setMode(mode) {
    this._postMessage({ action: "setMode", mode });
  }

  setBackground(color) {
    this._postMessage({ action: "setBackground", color });
  }

  hideObject(object) {
    this._postMessage({ action: "hideObject", object });
  }

  showObject(object) {
    this._postMessage({ action: "showObject", object });
  }

  selectObject(object) {
    this._postMessage({ action: "selectObject", object });
  }

  deselectAll() {
    this._postMessage({ action: "deselectAll" });
  }

  getSceneInfo() {
    this._postMessage({ action: "getSceneInfo" });
  }

  onReady(callback) {
    this._readyCallback = callback;
  }

  onMessage(callback) {
    this._messageCallback = callback;
  }

  onObjectSelected(callback) {
    this._objectSelectedCallback = callback;
  }

  remove() {
    window.removeEventListener("message", this._boundMessageHandler);
    HtmlSvgEdu.Model3D._instances.delete(this);
    super.remove();
  }
};
