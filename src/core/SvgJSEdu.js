/**
 * SvgJSEdu.js - SVG.js-basiertes Framework für Bildungsanimationen
 * Konvertiert von PixiJSEdu.js (PIXI.js Canvas) zu SVG.js (natives SVG DOM)
 *
 * @license MIT
 * @author Sebastian Rikowski
 * @version 1.0.1
 *
 * Abhängigkeit: SVG.js 3.x (https://svgjs.dev)
 * <script src="https://cdn.jsdelivr.net/npm/@svgjs/svg.js@3.2.4/dist/svg.min.js"></script>
 *
 * Architektur:
 *   - SvgJSElement: Basisklasse mit allen gemeinsamen Funktionalitäten
 *   - Jede Form-Klasse erbt von SvgJSElement und implementiert nur _draw()
 *   - API 100% kompatibel zu PixiJSEdu.js
 */

// INSTANCE_KEY is defined as a global constant in PixiJSEdu.js:
//   const INSTANCE_KEY = Symbol("MyClassInstance");
// It is used directly here without redeclaration.
// If SvgJSEdu.js runs standalone (without PixiJSEdu.js),
// INSTANCE_KEY must be defined elsewhere beforehand.

const SvgJSEdu = {};

// ============================================================================
// Utility functions
// ============================================================================

/**
 * Konvertiert 0xRRGGBB-Farbwerte zu '#RRGGBB'-Strings
 */
function colorToHex(color) {
  if (typeof color === "string") return color;
  return "#" + ("000000" + (color & 0xffffff).toString(16)).slice(-6);
}

/**
 * Konvertiert Grad zu Bogenmaß
 */
function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}


// ============================================================================
// Board – Singleton managing the SVG root container
// ============================================================================

// Board and svgRoot are defined in Board.js / BoardSVG.js.
// BoardSVG[INSTANCE_KEY] is used as the singleton accessor.

SvgJSEdu.BoardGUI = class BoardGUI {
  static serializationMap = {
    description: {
      de: "Dieses Objekt repräsentiert die gesamte Animation",
      en: "This object represents the entire animation",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myBoard = new Board(1280, 720);",
    constructor: {
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
      color: {
        name: "color",
        info: {
          en: "Color in hexadecimal format (e.g. 0xff0000)",
          de: "Farbe im Hexadezimalformat (z.B. 0xff0000)",
        },
      },
    },
    setter: {},
    methods: {
      setFramerate: {
        example: "setFramerate(50)",
        info: {
          en: "Sets the frame rate of the animation. Default value is 60 without specific setting.",
          de: "Setzt die Bildrate der Animation. Ohne gesonderte Einstellung ist der Wert 60.",
        },
      },
      setAdaptiveFramerate: {
        example: "setAdaptiveFramerate(true)",
        info: {
          en: "Frame rate adapts optimally to performance with the set frame rate as target value.",
          de: "Bildrate passt sich der Leistungsfähigkeit optimal an mit der eingestellten Bildrate als Soll-Wert.",
        },
      },
    },
  };

  constructor(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container '${containerId}' nicht gefunden`);
      return;
    }

    const width = container.clientWidth || 1280;
    const height = container.clientHeight || 720;

    svgRoot = SVG().addTo(`#${containerId}`).size(width, height);
    svgRoot.attr({ style: "display: block;" });

    this._bgRect = svgRoot.rect(width, height).fill("#ffffff");
    this._mainGroup = svgRoot.group();

    BoardSVG[INSTANCE_KEY] = this;

    this._width = width;
    this._height = height;
  }

  get svgRoot() {
    return svgRoot;
  }

  get mainGroup() {
    return this._mainGroup;
  }

  set backgroundColor(color) {
    this._bgRect.fill(colorToHex(color));
  }

  get backgroundColor() {
    return this._bgRect.attr("fill");
  }

  addChild(element) {
    if (element && element._group) {
      this._mainGroup.add(element._group);
    }
  }

  removeChild(element) {
    if (
      element &&
      element._group &&
      element._group.parent() === this._mainGroup
    ) {
      element._group.remove();
    }
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  performResize(width, height) {
    this._width = width;
    this._height = height;
    svgRoot.size(width, height);
    this._bgRect.size(width, height);
  }
};

// ============================================================================
// Konturen beim Skalieren (non-scaling-stroke)
// ============================================================================
// setScale() markiert die SVG-Gruppe des Objekts mit data-oal-strokes:
// "fixed" = Konturen behalten ihre Stärke, "scale" = Konturen werden mitskaliert.
// Für jede Kontur gilt die Markierung des nächstgelegenen Vorfahren.
// Ein MutationObserver überträgt die Einstellung auch auf Elemente, die nach
// setScale() neu gezeichnet oder hinzugefügt werden (setPoints, setStart,
// setFillColor, addChild …) – sonst gingen sie beim Neuzeichnen verloren.

const OAL_STROKE_SELECTOR = "[stroke]:not([stroke='none'])";

function oalSyncStroke(el) {
  if (!el.matches || !el.matches(OAL_STROKE_SELECTOR)) return;
  const owner = el.closest("[data-oal-strokes]");
  if (!owner) return;
  if (owner.getAttribute("data-oal-strokes") === "fixed") {
    if (el.getAttribute("vector-effect") !== "non-scaling-stroke") {
      el.setAttribute("vector-effect", "non-scaling-stroke");
    }
  } else if (el.hasAttribute("vector-effect")) {
    el.removeAttribute("vector-effect");
  }
}

function oalSyncStrokesIn(node) {
  if (!node || node.nodeType !== 1) return;
  oalSyncStroke(node);
  node.querySelectorAll(OAL_STROKE_SELECTOR).forEach(oalSyncStroke);
}

function oalApplyStrokeScaling(element) {
  if (!element._group) return;
  const node = element._group.node;
  node.setAttribute("data-oal-strokes", element._scaleStrokes ? "scale" : "fixed");
  oalSyncStrokesIn(node);
  if (!element._strokeObserver && typeof MutationObserver !== "undefined") {
    element._strokeObserver = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "attributes") oalSyncStroke(r.target);
        else r.addedNodes.forEach(oalSyncStrokesIn);
      }
    });
    element._strokeObserver.observe(node, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["stroke"],
    });
  }
}

function oalStopStrokeScaling(element) {
  if (element._strokeObserver) {
    element._strokeObserver.disconnect();
    element._strokeObserver = null;
  }
}

// ============================================================================
// SvgJSElement – Base class for all SVG elements
// ============================================================================

class SvgJSElement {
  constructor() {
    this._group = svgRoot ? svgRoot.group() : null;

    this._visualX = 0;
    this._visualY = 0;

    // _pivotX/Y: setTransformationPoint offset
    // _rotationPivotX/Y: setRotationPoint center within the object
    this._pivotX = 0;
    this._pivotY = 0;
    this._rotationPivotX = 0;
    this._rotationPivotY = 0;
    this._rotationDegrees = 0;

    this._visible = true;
    this._alpha = 1.0;
    this._scaleX = 1;
    this._scaleY = 1;
    this._scaleStrokes = false;

    this._clickHandler = null;
    this._mouseDownHandler = null;
    this._mouseUpHandler = null;
    this._mouseOverHandler = null;
    this._mouseOutHandler = null;

    this._draggable = false;
    this._dragConstraints = null;
    this._isDragging = false;
    this._dragData = null;
    this._dragStartCallback = null;
    this._dragCallback = null;
    this._dragEndCallback = null;
    this._boundDragStart = null;
    this._boundDragMove = null;
    this._boundDragEnd = null;

    this._mask = null;
    this._maskClipPath = null;
  }

  // ---------- Position ----------

  _updateTransform() {
    if (!this._group) return;

    const scaledPivotX = this._rotationPivotX * this._scaleX;
    const scaledPivotY = this._rotationPivotY * this._scaleY;

    const rpWorldX = this._visualX + scaledPivotX - this._pivotX;
    const rpWorldY = this._visualY + scaledPivotY - this._pivotY;

    let transform = `translate(${rpWorldX}, ${rpWorldY})`;

    if (this._rotationDegrees !== 0) {
      transform += ` rotate(${this._rotationDegrees})`;
    }

    if (this._scaleX !== 1 || this._scaleY !== 1) {
      transform += ` scale(${this._scaleX}, ${this._scaleY})`;
    }

    transform += ` translate(${-this._rotationPivotX}, ${-this._rotationPivotY})`;

    this._group.attr("transform", transform);
  }

  _applyScale() {
    // Overridden by subclasses (e.g. SimpleSVG, SimplePNG)
    // For normal shapes, scaling is handled via _updateTransform().
  }

  _applyNonScalingStroke() {
    oalApplyStrokeScaling(this);
  }

  set x(value) {
    this._visualX = value;
    this._updateTransform();
  }

  get x() {
    return this._visualX;
  }

  set y(value) {
    this._visualY = value;
    this._updateTransform();
  }

  get y() {
    return this._visualY;
  }

  // ---------- Rotation ----------

  set rotation(degrees) {
    this._rotationDegrees = degrees;
    this._updateTransform();
  }

  get rotation() {
    return this._rotationDegrees;
  }

  // ---------- Sichtbarkeit ----------

  set visible(value) {
    this._visible = Boolean(value);
    if (this._group) {
      this._group.attr("display", this._visible ? null : "none");
    }
  }

  get visible() {
    return this._visible;
  }

  // ---------- Alpha / Transparenz ----------

  set alpha(value) {
    this._alpha = Math.max(0, Math.min(1, value));
    if (this._group) {
      this._group.attr("opacity", this._alpha);
    }
  }

  get alpha() {
    return this._alpha;
  }

  setAlpha(alpha) {
    this.alpha = alpha;
    return this;
  }

  // ---------- Skalierung ----------

  setScale(scaleX, scaleY, scaleStrokes = false) {
    this._scaleX = scaleX;
    this._scaleY = scaleY !== undefined ? scaleY : scaleX;
    this._scaleStrokes = scaleStrokes;
    this._applyScale();
    this._updateTransform();
    this._applyNonScalingStroke();
    return this;
  }

  // ---------- Transformationspunkte ----------

  setTransformationPoint(offsetX = 0, offsetY = 0) {
    this._pivotX = offsetX;
    this._pivotY = offsetY;
    this._updateTransform();
    return this;
  }

  setRotationPoint(offsetX = 0, offsetY = 0) {
    this._rotationPivotX = offsetX;
    this._rotationPivotY = offsetY;
    this._updateTransform();
    return this;
  }

  // ---------- Events ----------

  onClick(handler) {
    if (typeof handler !== "function") {
      console.error("onClick erwartet eine Funktion als Parameter");
      return this;
    }
    if (this._clickHandler) {
      this._group.off("click", this._clickHandler);
    }
    this._clickHandler = handler;
    this._group.css("cursor", "pointer");
    this._group.on("click", (e) => {
      if (!this._isDragging) handler(e);
    });
    return this;
  }

  onMouseDown(handler) {
    if (typeof handler !== "function") return this;
    if (this._mouseDownHandler) {
      this._group.off("mousedown touchstart", this._mouseDownHandler);
    }
    this._mouseDownHandler = handler;
    this._group.on("mousedown touchstart", handler);
    return this;
  }

  onMouseUp(handler) {
    if (typeof handler !== "function") return this;
    if (this._mouseUpHandler) {
      this._group.off("mouseup touchend", this._mouseUpHandler);
    }
    this._mouseUpHandler = handler;
    this._group.on("mouseup touchend", handler);
    return this;
  }

  onMouseOver(handler) {
    if (typeof handler !== "function") return this;
    if (this._mouseOverHandler) {
      this._group.off("mouseover", this._mouseOverHandler);
    }
    this._mouseOverHandler = handler;
    this._group.on("mouseover", handler);
    return this;
  }

  onMouseOut(handler) {
    if (typeof handler !== "function") return this;
    if (this._mouseOutHandler) {
      this._group.off("mouseout", this._mouseOutHandler);
    }
    this._mouseOutHandler = handler;
    this._group.on("mouseout", handler);
    return this;
  }

  // ---------- Drag & Drop ----------

  setDragging(x1, y1, x2, y2) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    this._dragConstraints = { minX, maxX, minY, maxY };
    this._draggable = true;
    this._setupDrag();
    return this;
  }

  _setupDrag() {
    if (!this._group) return;
    this._boundDragStart = (e) => {
      e.preventDefault();
      this._isDragging = true;

      const pt = this._getPointerPos(e);
      this._dragData = {
        startMouseX: pt.x,
        startMouseY: pt.y,
        startElemX: this._visualX,
        startElemY: this._visualY,
      };

      if (this._dragStartCallback) this._dragStartCallback(this);

      const svgEl = svgRoot.node;
      this._boundDragMove = (ev) => {
        if (!this._isDragging) return;
        ev.preventDefault();
        const p = this._getPointerPos(ev);
        let newX =
          this._dragData.startElemX + (p.x - this._dragData.startMouseX);
        let newY =
          this._dragData.startElemY + (p.y - this._dragData.startMouseY);

        if (this._dragConstraints) {
          newX = Math.max(
            this._dragConstraints.minX,
            Math.min(this._dragConstraints.maxX, newX),
          );
          newY = Math.max(
            this._dragConstraints.minY,
            Math.min(this._dragConstraints.maxY, newY),
          );
        }

        this.x = newX;
        this.y = newY;

        if (this._dragCallback) this._dragCallback(this);
      };

      this._boundDragEnd = () => {
        this._isDragging = false;
        svgEl.removeEventListener("mousemove", this._boundDragMove);
        svgEl.removeEventListener("mouseup", this._boundDragEnd);
        svgEl.removeEventListener("touchmove", this._boundDragMove);
        svgEl.removeEventListener("touchend", this._boundDragEnd);
        if (this._dragEndCallback) this._dragEndCallback(this);
      };

      svgEl.addEventListener("mousemove", this._boundDragMove);
      svgEl.addEventListener("mouseup", this._boundDragEnd);
      svgEl.addEventListener("touchmove", this._boundDragMove, {
        passive: false,
      });
      svgEl.addEventListener("touchend", this._boundDragEnd);
    };

    this._group.on("mousedown touchstart", this._boundDragStart);
  }

  _getPointerPos(e) {
    const svgEl = svgRoot.node;
    const pt = svgEl.createSVGPoint();
    if (e.touches && e.touches.length > 0) {
      pt.x = e.touches[0].clientX;
      pt.y = e.touches[0].clientY;
    } else {
      pt.x = e.clientX;
      pt.y = e.clientY;
    }
    const ctm = svgEl.getScreenCTM();
    if (ctm) {
      const inv = ctm.inverse();
      return pt.matrixTransform(inv);
    }
    return pt;
  }

  onDragStart(handler) {
    this._dragStartCallback = handler;
    return this;
  }

  onDrag(handler) {
    this._dragCallback = handler;
    return this;
  }

  onDragEnd(handler) {
    this._dragEndCallback = handler;
    return this;
  }

  // ---------- Masking ----------

  setMask(maskElement) {
    if (!this._group || !maskElement) return this;
    const clipPath = svgRoot.clip();
    if (maskElement._shapeElement) {
      clipPath.add(maskElement._shapeElement.clone());
    }
    this._group.clipWith(clipPath);
    this._mask = maskElement;
    this._maskClipPath = clipPath;
    return this;
  }

  removeMask() {
    if (this._group) {
      this._group.unclip();
    }
    if (this._maskClipPath) {
      this._maskClipPath.remove();
      this._maskClipPath = null;
    }
    this._mask = null;
    return this;
  }

  hasMask() {
    return this._mask !== null;
  }

  getMaskBounds() {
    if (!this._mask) return null;
    const bbox = this._mask._shapeElement
      ? this._mask._shapeElement.bbox()
      : null;
    return bbox;
  }

  // ---------- Parent Management ----------

  removeFromParent() {
    if (this._group && this._group.parent()) {
      this._group.remove();
    }
    return this;
  }

  // ---------- Fill & Stroke (shared by shape subclasses) ----------

  _removeGradientDef() {
    if (this._gradientDef) {
      this._gradientDef.remove();
      this._gradientDef = null;
    }
  }

  setFillColor(color) {
    this._fillColor = color;
    this._gradientStops = null;
    this._gradientType = null;
    this._removeGradientDef();
    if (this._shapeElement) {
      if (color !== null && color !== undefined) {
        this._shapeElement.fill(colorToHex(color));
      } else {
        this._shapeElement.fill("none");
      }
    }
    return this;
  }

  setLineColor(color) {
    this._lineColor = color;
    if (this._shapeElement) {
      if (color !== null && this._lineThickness > 0) {
        this._shapeElement.stroke({
          color: colorToHex(color),
          width: this._lineThickness,
        });
      } else {
        this._shapeElement.stroke("none");
      }
    }
    return this;
  }

  setLineThickness(thickness) {
    this._lineThickness = thickness;
    if (this._shapeElement) {
      if (thickness > 0 && this._lineColor !== null) {
        this._shapeElement.stroke({
          color: colorToHex(this._lineColor),
          width: thickness,
        });
      } else {
        this._shapeElement.stroke("none");
      }
    }
    return this;
  }

  setBorder(borderColor, borderLine) {
    this._lineColor = borderColor;
    this._lineThickness = borderLine;
    if (this._shapeElement) {
      if (borderColor !== null && borderLine > 0) {
        this._shapeElement.stroke({
          color: colorToHex(borderColor),
          width: borderLine,
        });
      } else {
        this._shapeElement.stroke("none");
      }
    }
    return this;
  }

  // ---------- Destroy ----------

  destroy() {
    oalStopStrokeScaling(this);
    if (this._group) {
      this._group.off();
    }
    this.removeMask();
    if (this._group) {
      this._group.remove();
      this._group = null;
    }
  }
}

// ============================================================================
// Group
// ============================================================================

SvgJSEdu.Group = class Group extends SvgJSElement {
  static serializationMap = {
    description: {
      de: "Gruppe zum Zusammenfassen von Objekten",
      en: "Group for combining objects",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myGroup = new Group();",
    constructor: {},
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      rotation: {
        name: "rotation",
        info: {
          en: "Rotation of the group in degrees",
          de: "Drehung der Gruppe in Grad",
        },
        example: "rotation = 45",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = false",
      },
    },
    methods: {
      addChild: {
        example: "addChild(myRectangle)",
        info: {
          en: "Adds an element to the group",
          de: "Fügt ein Element zur Gruppe hinzu",
        },
      },
      removeChild: {
        example: "removeChild(myRectangle)",
        info: {
          en: "Detaches an element from the group. It stays visible on the board; to remove it completely use board.removeChild(element)",
          de: "Löst ein Element aus der Gruppe. Es bleibt auf der Zeichenfläche sichtbar; ganz entfernen mit board.removeChild(element)",
        },
      },
      setTransformationPoint: {
        example: "setTransformationPoint(50, 50)",
        info: {
          en: "Sets the anchor point for positioning (x, y in pixels relative to the element)",
          de: "Setzt den Ankerpunkt für die Positionierung (x, y in Pixeln relativ zum Element)",
        },
      },
      setRotationPoint: {
        example: "setRotationPoint(25, 25)",
        info: {
          en: "Sets the rotation pivot point (x, y in pixels relative to the origin of the element)",
          de: "Setzt den Drehpunkt (x, y in Pixeln relativ zum Elementursprung)",
        },
      },
      setScale: {
        example: "setScale(1.5, 1.5)",
        info: {
          en: "Scales the element (scaleX, scaleY). Use equal values for proportional scaling (1.0 = original size). Strokes are not scaled by default. Pass true as last parameter to scale strokes too.",
          de: "Skaliert das Element (scaleX, scaleY). Gleiche Werte für proportionale Skalierung verwenden (1.0 = Originalgröße). Konturen werden standardmäßig nicht mitskaliert. Übergebe true als letzten Parameter, um Konturen mitzuskalieren.",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      getBounds: {
        example: "getBounds()",
        info: {
          en: "Returns the bounding box of the group",
          de: "Gibt die Begrenzungsbox der Gruppe zurück",
        },
      },
      setMask: {
        example: "setMask(10, 20, 100, 80)",
        info: {
          en: "Sets a rectangular mask for the group",
          de: "Setzt eine rechteckige Maske für die Gruppe",
        },
      },
      removeMask: {
        example: "removeMask()",
        info: {
          en: "Removes the mask from the group",
          de: "Entfernt die Maske von der Gruppe",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hello World"); }',
        info: {
          en: "Defines a function to execute when the group is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf die Gruppe ausgeführt wird.",
        },
      },
      onMouseDown: {
        example:
          'onMouseDown(handleMouseDown); \n\nfunction handleMouseDown() { console.log("Mouse button pressed"); }',
        info: {
          en: "Defines a function to execute when the mouse button is pressed down on the element.",
          de: "Legt fest, welche Funktion beim Drücken der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseUp: {
        example:
          'onMouseUp(handleMouseUp); \n\nfunction handleMouseUp() { console.log("Mouse button released"); }',
        info: {
          en: "Defines a function to execute when the mouse button is released on the element.",
          de: "Legt fest, welche Funktion beim Loslassen der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseOver: {
        example:
          'onMouseOver(handleMouseOver); \n\nfunction handleMouseOver() { console.log("Mouse entered element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor enters the element.",
          de: "Legt fest, welche Funktion beim Überfahren des Elements mit der Maus ausgeführt wird.",
        },
      },
      onMouseOut: {
        example:
          'onMouseOut(handleMouseOut); \n\nfunction handleMouseOut() { console.log("Mouse left element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor leaves the element.",
          de: "Legt fest, welche Funktion beim Verlassen des Elements mit der Maus ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
      onDragStart: {
        example:
          'onDragStart(handleDragStart); \n\nfunction handleDragStart() { console.log("Started dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging starts",
          de: "Setzt eine Callback-Funktion, die beim Start des Ziehens ausgeführt wird",
        },
      },
      onDrag: {
        example:
          'onDrag(handleDrag); \n\nfunction handleDrag() { console.log("Element is being dragged"); }',
        info: {
          en: "Sets a callback function that is executed while the element is being dragged",
          de: "Setzt eine Callback-Funktion, die während des Ziehens des Elements ausgeführt wird",
        },
      },
      onDragEnd: {
        example:
          'onDragEnd(handleDragEnd); \n\nfunction handleDragEnd() { console.log("Stopped dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging ends",
          de: "Setzt eine Callback-Funktion, die beim Ende des Ziehens ausgeführt wird",
        },
      },
    },
  };

  constructor() {
    super();
    this._children = []; // Tracks SvgJSEdu wrapper objects, not raw SVG nodes

    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  // ---------- Child Management ----------

  addChild(element) {
    if (!element || !element._group || !this._group) return this;

    this._group.add(element._group);

    if (!this._children.includes(element)) {
      this._children.push(element);
    }

    return this;
  }

  removeChild(element) {
    if (!element || !element._group) return this;

    if (element._group.parent() === this._group) {
      // Re-attach to the board (main group), matching PixiJS removeChild behavior.
      // Bisher landete das Element direkt in svgRoot (BoardSVG hat kein _group):
      // außerhalb der Hauptgruppe, sodass board.removeChild(element) es danach nicht fand.
      const board = BoardSVG[INSTANCE_KEY];
      const target = board && (board._mainGroup || board.mainGroup);
      if (target && target.add) {
        target.add(element._group);
      } else {
        svgRoot.add(element._group);
      }
    }

    const idx = this._children.indexOf(element);
    if (idx !== -1) {
      this._children.splice(idx, 1);
    }

    return this;
  }

  // ---------- Mask ----------
  // Overrides the base class: Group uses coordinate-based masking (4 numbers)
  // rather than element-based masking like SvgJSElement.

  setMask(x, y, width, height) {
    this.removeMask();

    this._maskClipPath = svgRoot.clip();
    this._maskRect = this._maskClipPath.rect(width, height).move(x, y);

    this._maskX = x;
    this._maskY = y;
    this._maskWidth = width;
    this._maskHeight = height;

    this._group.clipWith(this._maskClipPath);
    this._hasMask = true;

    return this;
  }

  removeMask() {
    if (this._hasMask) {
      if (this._group) {
        this._group.unclip();
      }
      if (this._maskClipPath) {
        this._maskClipPath.remove();
        this._maskClipPath = null;
      }
      this._maskRect = null;
      this._hasMask = false;
    }
    return this;
  }

  hasMask() {
    return this._hasMask || false;
  }

  getMaskBounds() {
    if (this._hasMask) {
      return {
        x: this._maskX,
        y: this._maskY,
        width: this._maskWidth,
        height: this._maskHeight,
      };
    }
    return null;
  }

  // ---------- Scale ----------
  // Group applies scale in _updateTransform() as part of the composite
  // transform, unlike shape elements which scale their SVG element directly.

  _applyScale() {
    if (!this._group) return;
    this._updateTransform();
  }

  _updateTransform() {
    if (!this._group) return;

    const scaledPivotX = this._rotationPivotX * this._scaleX;
    const scaledPivotY = this._rotationPivotY * this._scaleY;

    const rpWorldX = this._visualX + scaledPivotX - this._pivotX;
    const rpWorldY = this._visualY + scaledPivotY - this._pivotY;

    let transform = `translate(${rpWorldX}, ${rpWorldY})`;

    if (this._rotationDegrees !== 0) {
      transform += ` rotate(${this._rotationDegrees})`;
    }

    if (this._scaleX !== 1 || this._scaleY !== 1) {
      transform += ` scale(${this._scaleX}, ${this._scaleY})`;
    }

    transform += ` translate(${-this._rotationPivotX}, ${-this._rotationPivotY})`;

    this._group.attr("transform", transform);
  }

  // ---------- Bounds ----------

  getBounds() {
    if (!this._group) return null;
    try {
      return this._group.bbox();
    } catch (e) {
      return null;
    }
  }

  // ---------- Children Info ----------

  getChildCount() {
    return this._children.length;
  }

  removeAllChildren() {
    const copy = [...this._children];
    copy.forEach((child) => {
      this.removeChild(child);
    });
    return this;
  }

  getChildren() {
    return [...this._children];
  }

  hasChild(child) {
    return this._children.includes(child);
  }

  getChildAt(index) {
    if (index >= 0 && index < this._children.length) {
      return this._children[index];
    }
    return null;
  }

  // ---------- Destroy ----------

  destroy() {
    // Eine zerstörte Gruppe nimmt ihre Kinder mit (wie bei PixiJS). Bisher hängte
    // removeAllChildren() die Kinder sichtbar an die Zeichenfläche zurück: Nach
    // board.removeChild(gruppe) blieben deren Linien, Formen usw. stehen.
    const board = BoardSVG[INSTANCE_KEY];
    const copy = [...this._children];
    this._children = [];
    copy.forEach((child) => {
      try {
        if (board && typeof board.removeChild === "function") board.removeChild(child);
        else if (child && typeof child.destroy === "function") child.destroy();
      } catch (e) {
        console.warn("Group.destroy: Kind konnte nicht entfernt werden", e);
      }
    });
    this.removeMask();
    super.destroy();
  }
};

// ============================================================================
// Rectangle
// ============================================================================

SvgJSEdu.Rectangle = class Rectangle extends SvgJSElement {
  static serializationMap = {
    description: { de: "Rechteckiges grafisches Element", en: "Rectangular graphic element" },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myRectangle = new Rectangle(100, 50, 0xff0000, 0x000000, 2);",
    constructor: {
      width: {
        name: "width",
        info: { en: "Width of the rectangle", de: "Breite des Rechtecks" },
      },
      height: {
        name: "height",
        info: { en: "Height of the rectangle", de: "Höhe des Rechtecks" },
      },
      fillColor: {
        name: "fillColor",
        info: {
          en: "Fill color in hexadecimal format (e.g. 0xff0000)",
          de: "Füllfarbe im Hexadezimalformat (z.B. 0xff0000)",
        },
      },
      lineColor: {
        name: "lineColor",
        info: {
          en: "Line color in hexadecimal format",
          de: "Linienfarbe im Hexadezimalformat",
        },
      },
      lineThickness: {
        name: "lineThickness",
        info: {
          en: "Line thickness in pixels",
          de: "Linienstärke in Pixeln",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      rotation: {
        name: "rotation",
        info: {
          en: "Rotation of the element in degrees",
          de: "Drehung des Elements in Grad",
        },
        example: "rotation = 45",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = true",
      },
    },
    methods: {
      setFillColor: {
        example: "setFillColor(0xff0000)",
        info: {
          en: "Sets the fill color of the rectangle",
          de: "Setzt die Füllfarbe des Rechtecks",
        },
      },
      setLineColor: {
        example: "setLineColor(0x000000)",
        info: {
          en: "Sets the line color of the rectangle",
          de: "Setzt die Linienfarbe des Rechtecks",
        },
      },
      setLineThickness: {
        example: "setLineThickness(2)",
        info: {
          en: "Sets the line thickness",
          de: "Setzt die Linienstärke",
        },
      },
      setBorder: {
        example: "setBorder(0xff0000, 2)",
        info: {
          en: "Sets a border (color in hexadecimal format, thickness in pixels)",
          de: "Setzt einen Rahmen (Farbe im Hexadezimalformat, Dicke in Pixeln)",
        },
      },
      setWidth: {
        example: "setWidth(200)",
        info: {
          en: "Sets the width of the rectangle",
          de: "Setzt die Breite des Rechtecks",
        },
      },
      setHeight: {
        example: "setHeight(100)",
        info: {
          en: "Sets the height of the rectangle",
          de: "Setzt die Höhe des Rechtecks",
        },
      },
      setCornerRadius: {
        example: "setCornerRadius(10)",
        info: {
          en: "Sets the corner radius for rounded rectangles",
          de: "Setzt den Eckenradius für abgerundete Rechtecke",
        },
      },
      setRoundedCorners: {
        example: "setRoundedCorners(10, true, true, false, false)",
        info: {
          en: "Sets rounded corners with radius. Optional: specify which corners (topLeft, topRight, bottomRight, bottomLeft)",
          de: "Setzt abgerundete Ecken mit Radius. Optional: einzelne Ecken angeben (obenLinks, obenRechts, untenRechts, untenLinks)",
        },
      },
      setTransformationPoint: {
        example: "setTransformationPoint(0, 0)",
        info: {
          en: "Sets the anchor point for positioning (x, y in pixels relative to the element)",
          de: "Setzt den Ankerpunkt für die Positionierung (x, y in Pixeln relativ zum Element)",
        },
      },
      setRotationPoint: {
        example: "setRotationPoint(0, 0)",
        info: {
          en: "Sets the rotation pivot point (x, y in pixels relative to the origin of the element)",
          de: "Setzt den Drehpunkt (x, y in Pixeln relativ zum Elementursprung)",
        },
      },
      setGradient: {
        example:
          'setGradient("linear", [{offset:0,color:"#fff"},{offset:1,color:"#000"}])',
        info: {
          en: "Creates a linear or radial color gradient. Parameters: type ('linear' or 'radial'), array of color stops [{offset: 0-1, color: '#hex'}], optional angle in degrees for linear gradients",
          de: "Erstellt einen linearen oder radialen Farbverlauf. Parameter: Typ ('linear' oder 'radial'), Array von Farbstopps [{offset: 0-1, color: '#hex'}], optionaler Winkel in Grad für lineare Verläufe",
        },
      },
      setScale: {
        example: "setScale(1.5, 1.5)",
        info: {
          en: "Scales the element (scaleX, scaleY). Use equal values for proportional scaling (1.0 = original size). Strokes are not scaled by default. Pass true as last parameter to scale strokes too.",
          de: "Skaliert das Element (scaleX, scaleY). Gleiche Werte für proportionale Skalierung verwenden (1.0 = Originalgröße). Konturen werden standardmäßig nicht mitskaliert. Übergebe true als letzten Parameter, um Konturen mitzuskalieren.",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      onMouseDown: {
        example:
          'onMouseDown(handleMouseDown); \n\nfunction handleMouseDown() { console.log("Mouse button pressed"); }',
        info: {
          en: "Defines a function to execute when the mouse button is pressed down on the element.",
          de: "Legt fest, welche Funktion beim Drücken der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseUp: {
        example:
          'onMouseUp(handleMouseUp); \n\nfunction handleMouseUp() { console.log("Mouse button released"); }',
        info: {
          en: "Defines a function to execute when the mouse button is released on the element.",
          de: "Legt fest, welche Funktion beim Loslassen der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseOver: {
        example:
          'onMouseOver(handleMouseOver); \n\nfunction handleMouseOver() { console.log("Mouse entered element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor enters the element.",
          de: "Legt fest, welche Funktion beim Überfahren des Elements mit der Maus ausgeführt wird.",
        },
      },
      onMouseOut: {
        example:
          'onMouseOut(handleMouseOut); \n\nfunction handleMouseOut() { console.log("Mouse left element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor leaves the element.",
          de: "Legt fest, welche Funktion beim Verlassen des Elements mit der Maus ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
      onDragStart: {
        example:
          'onDragStart(handleDragStart); \n\nfunction handleDragStart() { console.log("Started dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging starts",
          de: "Setzt eine Callback-Funktion, die beim Start des Ziehens ausgeführt wird",
        },
      },
      onDrag: {
        example:
          'onDrag(handleDrag); \n\nfunction handleDrag() { console.log("Element is being dragged"); }',
        info: {
          en: "Sets a callback function that is executed while the element is being dragged",
          de: "Setzt eine Callback-Funktion, die während des Ziehens des Elements ausgeführt wird",
        },
      },
      onDragEnd: {
        example:
          'onDragEnd(handleDragEnd); \n\nfunction handleDragEnd() { console.log("Stopped dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging ends",
          de: "Setzt eine Callback-Funktion, die beim Ende des Ziehens ausgeführt wird",
        },
      },
    },
  };

  constructor(
    width = 100,
    height = 50,
    fillColor = null,
    lineColor = null,
    lineThickness = 0,
  ) {
    super();
    this._width = width;
    this._height = height;
    this._fillColor = fillColor;
    this._lineColor = lineColor;
    this._lineThickness = lineThickness;
    this._cornerRadius = 0;
    this._roundedCorners = {
      topLeft: true,
      topRight: true,
      bottomRight: true,
      bottomLeft: true,
    };
    this._gradientType = null;
    this._gradientStops = null;
    this._shapeElement = null;
    this._gradientDef = null;

    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (!this._group) return;
    if (this._shapeElement) {
      this._shapeElement.remove();
    }
    this._removeGradientDef();

    const needsSelectiveCorners =
      this._cornerRadius > 0 &&
      !(
        this._roundedCorners.topLeft &&
        this._roundedCorners.topRight &&
        this._roundedCorners.bottomRight &&
        this._roundedCorners.bottomLeft
      );

    if (needsSelectiveCorners) {
      const d = this._buildRoundedRectPath(
        this._width,
        this._height,
        this._cornerRadius,
        this._roundedCorners,
      );
      this._shapeElement = this._group.path(d);
    } else {
      this._shapeElement = this._group.rect(this._width, this._height);
      this._shapeElement.radius(this._cornerRadius);
    }

    if (this._lineColor !== null && this._lineThickness > 0) {
      this._shapeElement.stroke({
        color: colorToHex(this._lineColor),
        width: this._lineThickness,
      });
    } else {
      this._shapeElement.stroke("none");
    }

    if (this._gradientStops) {
      this._applyGradient();
    } else if (this._fillColor !== null && this._fillColor !== undefined) {
      this._shapeElement.fill(colorToHex(this._fillColor));
    } else {
      this._shapeElement.fill("none");
    }
  }

  /**
   * Builds an SVG path string for a rectangle with selective corner rounding.
   */
  _buildRoundedRectPath(width, height, radius, corners) {
    const r = Math.min(radius, Math.min(width, height) / 2);
    const x = 0;
    const y = 0;

    let d = "";

    if (corners.topLeft) {
      d += `M ${x + r} ${y}`;
    } else {
      d += `M ${x} ${y}`;
    }

    if (corners.topRight) {
      d += ` L ${x + width - r} ${y}`;
      d += ` A ${r} ${r} 0 0 1 ${x + width} ${y + r}`;
    } else {
      d += ` L ${x + width} ${y}`;
    }

    if (corners.bottomRight) {
      d += ` L ${x + width} ${y + height - r}`;
      d += ` A ${r} ${r} 0 0 1 ${x + width - r} ${y + height}`;
    } else {
      d += ` L ${x + width} ${y + height}`;
    }

    if (corners.bottomLeft) {
      d += ` L ${x + r} ${y + height}`;
      d += ` A ${r} ${r} 0 0 1 ${x} ${y + height - r}`;
    } else {
      d += ` L ${x} ${y + height}`;
    }

    if (corners.topLeft) {
      d += ` L ${x} ${y + r}`;
      d += ` A ${r} ${r} 0 0 1 ${x + r} ${y}`;
    } else {
      d += ` L ${x} ${y}`;
    }

    d += " Z";
    return d;
  }

  _applyGradient() {
    if (!this._gradientStops || !this._shapeElement) return;

    this._removeGradientDef();

    if (this._gradientType === "radial") {
      this._gradientDef = svgRoot.gradient("radial", (add) => {
        this._gradientStops.forEach((stop) => {
          add.stop(stop.offset, stop.color);
        });
      });
      this._gradientDef.attr({
        cx: "50%",
        cy: "50%",
        r: "50%",
        fx: "50%",
        fy: "50%",
      });
    } else {
      this._gradientDef = svgRoot.gradient("linear", (add) => {
        this._gradientStops.forEach((stop) => {
          add.stop(stop.offset, stop.color);
        });
      });
      const angle = this._gradientAngle || 0;
      if (angle === 0) {
        this._gradientDef.from(0, 0.5).to(1, 0.5);
      } else {
        const angleRad = (angle * Math.PI) / 180;
        const w = this._width;
        const h = this._height;
        const cx = w / 2;
        const cy = h / 2;
        const diagLength =
          Math.abs(w * Math.cos(angleRad)) +
          Math.abs(h * Math.sin(angleRad));
        const halfDiag = diagLength / 2;
        const x0 = cx - halfDiag * Math.cos(angleRad);
        const y0 = cy - halfDiag * Math.sin(angleRad);
        const x1 = cx + halfDiag * Math.cos(angleRad);
        const y1 = cy + halfDiag * Math.sin(angleRad);
        this._gradientDef.attr({
          gradientUnits: 'userSpaceOnUse',
          x1: x0,
          y1: y0,
          x2: x1,
          y2: y1,
        });
      }
    }

    this._shapeElement.fill(this._gradientDef);
  }

  // ---------- Dimensionen ----------

  setWidth(w) {
    this._width = w;
    this._draw();
    return this;
  }

  setHeight(h) {
    this._height = h;
    this._draw();
    return this;
  }

  setCornerRadius(r) {
    this._cornerRadius = r;
    this._draw();
    return this;
  }

  /**
   * Setzt abgerundete Ecken mit Radius und optionaler selektiver Eckenauswahl.
   * API-kompatibel mit PixiJSEdu.Rectangle.setRoundedCorners().
   */
  setRoundedCorners(
    radius,
    topLeft = true,
    topRight = true,
    bottomRight = true,
    bottomLeft = true,
  ) {
    this._cornerRadius = radius;
    this._roundedCorners = {
      topLeft: topLeft,
      topRight: topRight,
      bottomRight: bottomRight,
      bottomLeft: bottomLeft,
    };
    this._draw();
    return this;
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  set width(value) {
    this._width = value;
    this._draw();
  }

  get width() {
    return this._width;
  }

  set height(value) {
    this._height = value;
    this._draw();
  }

  get height() {
    return this._height;
  }

  // ---------- Gradient ----------

  setGradient(
    type = "linear",
    colorStops = [
      { offset: 0, color: "#fff" },
      { offset: 1, color: "#000" },
    ],
    angle = 0,
  ) {
    this._gradientType = type;
    this._gradientStops = colorStops;
    this._gradientAngle = angle;
    this._draw();
    return this;
  }

  // ---------- Serialization ----------

  getSerializableMethods() {
    const methods = {};
    if (this._gradientStops && this._gradientType) {
      methods.setGradient =
        'setGradient("' +
        this._gradientType +
        '", ' +
        JSON.stringify(this._gradientStops) +
        ", " +
        (this._gradientAngle || 0) +
        ")";
    }
    if (this._alpha !== 1) {
      methods.setAlpha = "setAlpha(" + this._alpha + ")";
    }
    if (this._cornerRadius !== 0) {
      const allCorners =
        this._roundedCorners.topLeft &&
        this._roundedCorners.topRight &&
        this._roundedCorners.bottomRight &&
        this._roundedCorners.bottomLeft;

      if (allCorners) {
        methods.setCornerRadius = "setCornerRadius(" + this._cornerRadius + ")";
      } else {
        methods.setRoundedCorners =
          "setRoundedCorners(" +
          this._cornerRadius +
          ", " +
          this._roundedCorners.topLeft +
          ", " +
          this._roundedCorners.topRight +
          ", " +
          this._roundedCorners.bottomRight +
          ", " +
          this._roundedCorners.bottomLeft +
          ")";
      }
    }
    return methods;
  }

  // ---------- Destroy ----------

  destroy() {
    this._removeGradientDef();
    if (this._shapeElement) {
      this._shapeElement.remove();
      this._shapeElement = null;
    }
    super.destroy();
  }
};

// ============================================================================
// Circle
// ============================================================================

SvgJSEdu.Circle = class Circle extends SvgJSElement {
  static serializationMap = {
    description: { de: "Kreisförmiges grafisches Element", en: "Circular graphic element" },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myCircle = new Circle(50, 0xff0000, 0x000000, 2);",
    constructor: {
      radius: {
        name: "radius",
        info: { en: "Radius of the circle", de: "Radius des Kreises" },
      },
      fillColor: {
        name: "fillColor",
        info: {
          en: "Fill color in hexadecimal format",
          de: "Füllfarbe im Hexadezimalformat",
        },
      },
      lineColor: {
        name: "lineColor",
        info: {
          en: "Line color in hexadecimal format",
          de: "Linienfarbe im Hexadezimalformat",
        },
      },
      lineThickness: {
        name: "lineThickness",
        info: { en: "Line thickness in pixels", de: "Linienstärke in Pixeln" },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      rotation: {
        name: "rotation",
        info: {
          en: "Rotation of the element in degrees",
          de: "Drehung des Elements in Grad",
        },
        example: "rotation = 45",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = true",
      },
    },
    methods: {
      setFillColor: {
        example: "setFillColor(0xff0000)",
        info: {
          en: "Sets the fill color of the circle",
          de: "Setzt die Füllfarbe des Kreises",
        },
      },
      setLineColor: {
        example: "setLineColor(0x000000)",
        info: {
          en: "Sets the line color of the circle",
          de: "Setzt die Linienfarbe des Kreises",
        },
      },
      setBorder: {
        example: "setBorder(0xff0000, 2)",
        info: {
          en: "Sets a border (color in hexadecimal format, thickness in pixels)",
          de: "Setzt einen Rahmen (Farbe im Hexadezimalformat, Dicke in Pixeln)",
        },
      },
      setRadius: {
        example: "setRadius(100)",
        info: {
          en: "Sets the radius of the circle",
          de: "Setzt den Radius des Kreises",
        },
      },
      setTransformationPoint: {
        example: "setTransformationPoint(0, 0)",
        info: {
          en: "Sets the anchor point for positioning (x, y in pixels relative to the element)",
          de: "Setzt den Ankerpunkt für die Positionierung (x, y in Pixeln relativ zum Element)",
        },
      },
      setRotationPoint: {
        example: "setRotationPoint(0, 0)",
        info: {
          en: "Sets the rotation pivot point (x, y in pixels relative to the origin of the element)",
          de: "Setzt den Drehpunkt (x, y in Pixeln relativ zum Elementursprung)",
        },
      },
      setGradient: {
        example:
          'setGradient("radial", [{offset:0,color:"#fff"},{offset:1,color:"#000"}])',
        info: {
          en: "Creates a radial color gradient. Parameters: type ('radial'), array of color stops [{offset: 0-1, color: '#hex'}]",
          de: "Erstellt einen radialen Farbverlauf. Parameter: Typ ('radial'), Array von Farbstopps [{offset: 0-1, color: '#hex'}]",
        },
      },
      setScale: {
        example: "setScale(1.5, 1.5)",
        info: {
          en: "Scales the element (scaleX, scaleY). Use equal values for proportional scaling (1.0 = original size). Strokes are not scaled by default. Pass true as last parameter to scale strokes too.",
          de: "Skaliert das Element (scaleX, scaleY). Gleiche Werte für proportionale Skalierung verwenden (1.0 = Originalgröße). Konturen werden standardmäßig nicht mitskaliert. Übergebe true als letzten Parameter, um Konturen mitzuskalieren.",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      onMouseDown: {
        example:
          'onMouseDown(handleMouseDown); \n\nfunction handleMouseDown() { console.log("Mouse button pressed"); }',
        info: {
          en: "Defines a function to execute when the mouse button is pressed down on the element.",
          de: "Legt fest, welche Funktion beim Drücken der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseUp: {
        example:
          'onMouseUp(handleMouseUp); \n\nfunction handleMouseUp() { console.log("Mouse button released"); }',
        info: {
          en: "Defines a function to execute when the mouse button is released on the element.",
          de: "Legt fest, welche Funktion beim Loslassen der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseOver: {
        example:
          'onMouseOver(handleMouseOver); \n\nfunction handleMouseOver() { console.log("Mouse entered element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor enters the element.",
          de: "Legt fest, welche Funktion beim Überfahren des Elements mit der Maus ausgeführt wird.",
        },
      },
      onMouseOut: {
        example:
          'onMouseOut(handleMouseOut); \n\nfunction handleMouseOut() { console.log("Mouse left element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor leaves the element.",
          de: "Legt fest, welche Funktion beim Verlassen des Elements mit der Maus ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
      onDragStart: {
        example:
          'onDragStart(handleDragStart); \n\nfunction handleDragStart() { console.log("Started dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging starts",
          de: "Setzt eine Callback-Funktion, die beim Start des Ziehens ausgeführt wird",
        },
      },
      onDrag: {
        example:
          'onDrag(handleDrag); \n\nfunction handleDrag() { console.log("Element is being dragged"); }',
        info: {
          en: "Sets a callback function that is executed while the element is being dragged",
          de: "Setzt eine Callback-Funktion, die während des Ziehens des Elements ausgeführt wird",
        },
      },
      onDragEnd: {
        example:
          'onDragEnd(handleDragEnd); \n\nfunction handleDragEnd() { console.log("Stopped dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging ends",
          de: "Setzt eine Callback-Funktion, die beim Ende des Ziehens ausgeführt wird",
        },
      },
    },
  };

  constructor(
    radius = 50,
    fillColor = null,
    lineColor = null,
    lineThickness = 0,
  ) {
    super();
    this._radius = radius;
    this._fillColor = fillColor;
    this._lineColor = lineColor;
    this._lineThickness = lineThickness;
    this._gradientType = null;
    this._gradientStops = null;
    this._shapeElement = null;
    this._gradientDef = null;

    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (!this._group) return;
    if (this._shapeElement) this._shapeElement.remove();
    this._removeGradientDef();

    // Position is controlled via the group transform; cx/cy stay at origin
    this._shapeElement = this._group.circle(this._radius * 2);
    this._shapeElement.cx(0).cy(0);

    if (this._gradientStops) {
      this._applyGradient();
    } else if (this._fillColor !== null && this._fillColor !== undefined) {
      this._shapeElement.fill(colorToHex(this._fillColor));
    } else {
      this._shapeElement.fill("none");
    }

    if (this._lineColor !== null && this._lineThickness > 0) {
      this._shapeElement.stroke({
        color: colorToHex(this._lineColor),
        width: this._lineThickness,
      });
    } else {
      this._shapeElement.stroke("none");
    }
  }

  _applyGradient() {
    if (!this._gradientStops || !this._shapeElement) return;

    this._removeGradientDef();

    if (this._gradientType === "radial") {
      this._gradientDef = svgRoot.gradient("radial", (add) => {
        this._gradientStops.forEach((stop) => {
          add.stop(stop.offset, stop.color);
        });
      });
      this._gradientDef.attr({
        cx: "50%",
        cy: "50%",
        r: "50%",
        fx: "50%",
        fy: "50%",
      });
    } else {
      this._gradientDef = svgRoot.gradient("linear", (add) => {
        this._gradientStops.forEach((stop) => {
          add.stop(stop.offset, stop.color);
        });
      });
      this._gradientDef.from(0, 0.5).to(1, 0.5);
    }

    this._shapeElement.fill(this._gradientDef);
  }

  // ---------- Radius ----------

  setRadius(r) {
    this._radius = r;
    if (this._shapeElement) {
      this._shapeElement.radius(r);
    }
    return this;
  }

  getRadius() {
    return this._radius;
  }

  // ---------- Gradient ----------

  setGradient(
    type = "radial",
    colorStops = [
      { offset: 0, color: "#fff" },
      { offset: 1, color: "#000" },
    ],
  ) {
    this._gradientType = type;
    this._gradientStops = colorStops;
    this._draw();
    return this;
  }

  // ---------- Serialization ----------

  getSerializableMethods() {
    const methods = {};
    if (this._gradientStops && this._gradientType) {
      methods.setGradient =
        'setGradient("' +
        this._gradientType +
        '", ' +
        JSON.stringify(this._gradientStops) +
        ")";
    }
    if (this._alpha !== 1) {
      methods.setAlpha = "setAlpha(" + this._alpha + ")";
    }
    return methods;
  }

  // ---------- Destroy ----------

  destroy() {
    this._removeGradientDef();
    if (this._shapeElement) {
      this._shapeElement.remove();
      this._shapeElement = null;
    }
    super.destroy();
  }
};

// ============================================================================
// Ellipse
// ============================================================================

SvgJSEdu.Ellipse = class Ellipse extends SvgJSElement {
  static serializationMap = {
    description: { de: "Elliptisches grafisches Element", en: "Elliptical graphic element" },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      "let myEllipse = new Ellipse(80, 50, 0xff0000, 0x000000, 2);",
    constructor: {
      radiusX: {
        name: "radiusX",
        info: {
          en: "Horizontal radius of the ellipse",
          de: "Horizontaler Radius der Ellipse",
        },
      },
      radiusY: {
        name: "radiusY",
        info: {
          en: "Vertical radius of the ellipse",
          de: "Vertikaler Radius der Ellipse",
        },
      },
      fillColor: {
        name: "fillColor",
        info: {
          en: "Fill color in hexadecimal format",
          de: "Füllfarbe im Hexadezimalformat",
        },
      },
      lineColor: {
        name: "lineColor",
        info: {
          en: "Line color in hexadecimal format",
          de: "Linienfarbe im Hexadezimalformat",
        },
      },
      lineThickness: {
        name: "lineThickness",
        info: { en: "Line thickness in pixels", de: "Linienstärke in Pixeln" },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      rotation: {
        name: "rotation",
        info: {
          en: "Rotation of the element in degrees",
          de: "Drehung des Elements in Grad",
        },
        example: "rotation = 45",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = true",
      },
    },
    methods: {
      setFillColor: {
        example: "setFillColor(0xff0000)",
        info: {
          en: "Sets the fill color of the ellipse",
          de: "Setzt die Füllfarbe der Ellipse",
        },
      },
      setLineColor: {
        example: "setLineColor(0x000000)",
        info: {
          en: "Sets the line color of the ellipse",
          de: "Setzt die Linienfarbe der Ellipse",
        },
      },
      setBorder: {
        example: "setBorder(0xff0000, 2)",
        info: {
          en: "Sets a border (color in hexadecimal format, thickness in pixels)",
          de: "Setzt einen Rahmen (Farbe im Hexadezimalformat, Dicke in Pixeln)",
        },
      },
      setRadiusX: {
        example: "setRadiusX(100)",
        info: {
          en: "Sets the horizontal radius of the ellipse",
          de: "Setzt den horizontalen Radius der Ellipse",
        },
      },
      setRadiusY: {
        example: "setRadiusY(60)",
        info: {
          en: "Sets the vertical radius of the ellipse",
          de: "Setzt den vertikalen Radius der Ellipse",
        },
      },
      setTransformationPoint: {
        example: "setTransformationPoint(0, 0)",
        info: {
          en: "Sets the anchor point for positioning (x, y in pixels relative to the element)",
          de: "Setzt den Ankerpunkt für die Positionierung (x, y in Pixeln relativ zum Element)",
        },
      },
      setRotationPoint: {
        example: "setRotationPoint(0, 0)",
        info: {
          en: "Sets the rotation pivot point (x, y in pixels relative to the origin of the element)",
          de: "Setzt den Drehpunkt (x, y in Pixeln relativ zum Elementursprung)",
        },
      },
      setGradient: {
        example:
          'setGradient("radial", [{offset:0,color:"#fff"},{offset:1,color:"#000"}])',
        info: {
          en: "Creates a linear or radial color gradient. Parameters: type ('linear' or 'radial'), array of color stops [{offset: 0-1, color: '#hex'}], optional angle in degrees for linear gradients",
          de: "Erstellt einen linearen oder radialen Farbverlauf. Parameter: Typ ('linear' oder 'radial'), Array von Farbstopps [{offset: 0-1, color: '#hex'}], optionaler Winkel in Grad für lineare Verläufe",
        },
      },
      setScale: {
        example: "setScale(1.5, 1.5)",
        info: {
          en: "Scales the element (scaleX, scaleY). Use equal values for proportional scaling (1.0 = original size). Strokes are not scaled by default. Pass true as last parameter to scale strokes too.",
          de: "Skaliert das Element (scaleX, scaleY). Gleiche Werte für proportionale Skalierung verwenden (1.0 = Originalgröße). Konturen werden standardmäßig nicht mitskaliert. Übergebe true als letzten Parameter, um Konturen mitzuskalieren.",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      onMouseDown: {
        example:
          'onMouseDown(handleMouseDown); \n\nfunction handleMouseDown() { console.log("Mouse button pressed"); }',
        info: {
          en: "Defines a function to execute when the mouse button is pressed down on the element.",
          de: "Legt fest, welche Funktion beim Drücken der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseUp: {
        example:
          'onMouseUp(handleMouseUp); \n\nfunction handleMouseUp() { console.log("Mouse button released"); }',
        info: {
          en: "Defines a function to execute when the mouse button is released on the element.",
          de: "Legt fest, welche Funktion beim Loslassen der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseOver: {
        example:
          'onMouseOver(handleMouseOver); \n\nfunction handleMouseOver() { console.log("Mouse entered element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor enters the element.",
          de: "Legt fest, welche Funktion beim Überfahren des Elements mit der Maus ausgeführt wird.",
        },
      },
      onMouseOut: {
        example:
          'onMouseOut(handleMouseOut); \n\nfunction handleMouseOut() { console.log("Mouse left element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor leaves the element.",
          de: "Legt fest, welche Funktion beim Verlassen des Elements mit der Maus ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
      onDragStart: {
        example:
          'onDragStart(handleDragStart); \n\nfunction handleDragStart() { console.log("Started dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging starts",
          de: "Setzt eine Callback-Funktion, die beim Start des Ziehens ausgeführt wird",
        },
      },
      onDrag: {
        example:
          'onDrag(handleDrag); \n\nfunction handleDrag() { console.log("Element is being dragged"); }',
        info: {
          en: "Sets a callback function that is executed while the element is being dragged",
          de: "Setzt eine Callback-Funktion, die während des Ziehens des Elements ausgeführt wird",
        },
      },
      onDragEnd: {
        example:
          'onDragEnd(handleDragEnd); \n\nfunction handleDragEnd() { console.log("Stopped dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging ends",
          de: "Setzt eine Callback-Funktion, die beim Ende des Ziehens ausgeführt wird",
        },
      },
    },
  };

  constructor(
    radiusX = 80,
    radiusY = 50,
    fillColor = null,
    lineColor = null,
    lineThickness = 0,
  ) {
    super();
    this._radiusX = radiusX;
    this._radiusY = radiusY;
    this._fillColor = fillColor;
    this._lineColor = lineColor;
    this._lineThickness = lineThickness;
    this._gradientType = null;
    this._gradientStops = null;
    this._shapeElement = null;
    this._gradientDef = null;

    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (!this._group) return;
    if (this._shapeElement) this._shapeElement.remove();
    this._removeGradientDef();

    this._shapeElement = this._group.ellipse(
      this._radiusX * 2,
      this._radiusY * 2,
    );
    this._shapeElement.cx(0).cy(0);

    if (this._gradientStops) {
      this._applyGradient();
    } else if (this._fillColor !== null && this._fillColor !== undefined) {
      this._shapeElement.fill(colorToHex(this._fillColor));
    } else {
      this._shapeElement.fill("none");
    }

    if (this._lineColor !== null && this._lineThickness > 0) {
      this._shapeElement.stroke({
        color: colorToHex(this._lineColor),
        width: this._lineThickness,
      });
    } else {
      this._shapeElement.stroke("none");
    }
  }

  _applyGradient() {
    if (!this._gradientStops || !this._shapeElement) return;

    this._removeGradientDef();

    if (this._gradientType === "radial") {
      this._gradientDef = svgRoot.gradient("radial", (add) => {
        this._gradientStops.forEach((stop) => {
          add.stop(stop.offset, stop.color);
        });
      });
      this._gradientDef.attr({
        cx: "50%",
        cy: "50%",
        r: "50%",
        fx: "50%",
        fy: "50%",
      });
    } else {
      this._gradientDef = svgRoot.gradient("linear", (add) => {
        this._gradientStops.forEach((stop) => {
          add.stop(stop.offset, stop.color);
        });
      });
      this._gradientDef.from(0, 0.5).to(1, 0.5);
    }

    this._shapeElement.fill(this._gradientDef);
  }

  // ---------- Radius ----------

  setRadiusX(rx) {
    this._radiusX = rx;
    if (this._shapeElement) {
      this._shapeElement.rx(rx);
    }
    return this;
  }

  getRadiusX() {
    return this._radiusX;
  }

  setRadiusY(ry) {
    this._radiusY = ry;
    if (this._shapeElement) {
      this._shapeElement.ry(ry);
    }
    return this;
  }

  getRadiusY() {
    return this._radiusY;
  }

  // ---------- Gradient ----------

  setGradient(
    type = "radial",
    colorStops = [
      { offset: 0, color: "#fff" },
      { offset: 1, color: "#000" },
    ],
  ) {
    this._gradientType = type;
    this._gradientStops = colorStops;
    this._draw();
    return this;
  }

  // ---------- Serialization ----------

  getSerializableMethods() {
    const methods = {};
    if (this._gradientStops && this._gradientType) {
      methods.setGradient =
        'setGradient("' +
        this._gradientType +
        '", ' +
        JSON.stringify(this._gradientStops) +
        ")";
    }
    if (this._alpha !== 1) {
      methods.setAlpha = "setAlpha(" + this._alpha + ")";
    }
    return methods;
  }

  // ---------- Destroy ----------

  destroy() {
    this._removeGradientDef();
    if (this._shapeElement) {
      this._shapeElement.remove();
      this._shapeElement = null;
    }
    super.destroy();
  }
};

// ============================================================================
// PathBase – Base class for LinePath, BezierPath, SplinePath
// ============================================================================

class PathBase extends SvgJSElement {
  constructor(points = [], color = 0x000000, thickness = 2) {
    super();
    this.points = points;
    this._color = color;
    this._thickness = thickness;
    this._fillColor = null;
    this._alpha = 1.0;

    this.markedX = 0;
    this.markedY = 0;
    this.markerInitialized = false;
    this.markColor = 0x000000;
    this.markRadius = 3;
    this._markerElement = null;
    this._vGuideLine = null;
    this._hGuideLine = null;

    this.guideLineInitialized = false;
    this.guideX = 0;
    this.guideY = 0;
    this.guideLineColor = 0x888888;
    this.guideLineThickness = 1;
    this.guideLineAlpha = 0.8;
    this._guideVLine = null;
    this._guideHLine = null;

    this._pathElement = null;
    this._fillElement = null;
  }

  // ---------- Punkte-Verwaltung ----------

  addPoint(x, y) {
    this.addPointEnd(x, y);
  }

  addPointEnd(x, y) {
    this.points.push([x, y]);
    this._draw();
  }

  addPointStart(x, y) {
    this.points.unshift([x, y]);
    this._draw();
  }

  removePoint(index) {
    if (index >= 0 && index < this.points.length) {
      this.points.splice(index, 1);
      this._draw();
    }
  }

  removePointEnd() {
    if (this.points.length > 0) {
      this.points.pop();
      this._draw();
    }
  }

  removePointStart() {
    if (this.points.length > 0) {
      this.points.shift();
      this._draw();
    }
  }

  updatePoint(index, x, y) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = [x, y];
      this._draw();
    }
  }

  updatePoints(newPoints) {
    this.setPoints(newPoints);
  }

  setPoints(newPoints) {
    this.points = [...newPoints];
    this._draw();
  }

  // ---------- Farbe / Dicke ----------

  setFillColor(fillColor) {
    this._fillColor = fillColor;
    this._draw();
    return this;
  }

  setColor(color) {
    this._color = color;
    this._draw();
    return this;
  }

  setThickness(thickness) {
    this._thickness = thickness;
    this._draw();
    return this;
  }

  setAlpha(alpha) {
    this._alpha = Math.max(0, Math.min(1, alpha));
    this.alpha = this._alpha;
    return this;
  }

  get alphaValue() {
    return this._alpha;
  }

  // ---------- Marker ----------

  markAt(x, color = null, radius = null) {
    this.markedX = x;
    if (color !== null) this.markColor = color;
    if (radius !== null) this.markRadius = radius;
    this.markerInitialized = true;

    const y = this.getY(x);
    if (y !== null) {
      this.markedY = y;
      this._drawMarker(x, y);
      this._drawMarkerGuideLines(x, y);
    } else {
      this._clearMarker();
    }
  }

  markAtXY(x, y, color = null, radius = null) {
    this.markedX = x;
    this.markedY = y;
    if (color !== null) this.markColor = color;
    if (radius !== null) this.markRadius = radius;
    this.markerInitialized = true;
    this._drawMarker(x, y);
    this._drawMarkerGuideLines(x, y);
  }

  removeMark() {
    this.markerInitialized = false;
    this._clearMarker();
  }

  _drawMarker(x, y) {
    if (this._markerElement) this._markerElement.remove();
    this._markerElement = this._group
      .circle(this.markRadius * 2)
      .cx(x)
      .cy(y)
      .fill(colorToHex(this.markColor));
  }

  _drawMarkerGuideLines(x, y) {
    if (this._vGuideLine) this._vGuideLine.remove();
    if (this._hGuideLine) this._hGuideLine.remove();

    this._vGuideLine = this._group
      .line(x, 0, x, y)
      .stroke({ color: colorToHex(this.markColor), width: 1, opacity: 0.5 });
    this._hGuideLine = this._group
      .line(0, y, x, y)
      .stroke({ color: colorToHex(this.markColor), width: 1, opacity: 0.5 });
  }

  _clearMarker() {
    if (this._markerElement) {
      this._markerElement.remove();
      this._markerElement = null;
    }
    if (this._vGuideLine) {
      this._vGuideLine.remove();
      this._vGuideLine = null;
    }
    if (this._hGuideLine) {
      this._hGuideLine.remove();
      this._hGuideLine = null;
    }
  }

  // ---------- Guide Lines ----------

  showGuideLines(x, color = 0x888888, thickness = 1, alpha = 0.8) {
    this.guideX = x;
    this.guideLineColor = color;
    this.guideLineThickness = thickness;
    this.guideLineAlpha = Math.max(0, Math.min(1, alpha));
    this.guideLineInitialized = true;

    const y = this.getY(x);
    if (y !== null) {
      this.guideY = y;
      this._drawGuideLines(x, y);
    }
  }

  showGuideLinesAtXY(x, y, color = 0x888888, thickness = 1, alpha = 0.8) {
    this.guideX = x;
    this.guideY = y;
    this.guideLineColor = color;
    this.guideLineThickness = thickness;
    this.guideLineAlpha = Math.max(0, Math.min(1, alpha));
    this.guideLineInitialized = true;
    this._drawGuideLines(x, y);
  }

  _drawGuideLines(x, y) {
    if (this._guideVLine) this._guideVLine.remove();
    if (this._guideHLine) this._guideHLine.remove();

    this._guideVLine = this._group.line(x, 0, x, y).stroke({
      color: colorToHex(this.guideLineColor),
      width: this.guideLineThickness,
      opacity: this.guideLineAlpha,
    });
    this._guideHLine = this._group.line(0, y, x, y).stroke({
      color: colorToHex(this.guideLineColor),
      width: this.guideLineThickness,
      opacity: this.guideLineAlpha,
    });
  }

  hideGuideLines() {
    this.guideLineInitialized = false;
    if (this._guideVLine) {
      this._guideVLine.remove();
      this._guideVLine = null;
    }
    if (this._guideHLine) {
      this._guideHLine.remove();
      this._guideHLine = null;
    }
  }

  updateGuideLines(x) {
    if (this.guideLineInitialized) {
      this.showGuideLines(
        x,
        this.guideLineColor,
        this.guideLineThickness,
        this.guideLineAlpha,
      );
    }
  }

  setGuideLineStyle(color, thickness, alpha) {
    this.guideLineColor = color;
    this.guideLineThickness = thickness;
    this.guideLineAlpha = Math.max(0, Math.min(1, alpha));
    if (this.guideLineInitialized) {
      this.showGuideLines(
        this.guideX,
        this.guideLineColor,
        this.guideLineThickness,
        this.guideLineAlpha,
      );
    }
  }

  // Overridden in subclasses
  getY(x) {
    return null;
  }
  getX(y) {
    return null;
  }

  // ---------- Destroy ----------

  destroy(options) {
    this._clearMarker();
    this.hideGuideLines();
    if (this._pathElement) {
      this._pathElement.remove();
      this._pathElement = null;
    }
    if (this._fillElement) {
      this._fillElement.remove();
      this._fillElement = null;
    }
    super.destroy();
  }
}

SvgJSEdu.Polygon = class Polygon {
  static serializationMap = {
    description: {
      de: "Vieleckiges grafisches Element",
      en: "Polygon graphic element",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myPolygon = new Polygon(6, 60, 0x0000ff);",
    constructor: {
      sides: {
        name: "sides",
        info: {
          en: "Number of sides (3 for triangle, 4 for square, etc.)",
          de: "Anzahl der Seiten (3 für Dreieck, 4 für Quadrat, usw.)",
        },
      },
      radius: {
        name: "radius",
        info: {
          en: "Radius of the polygon in pixels",
          de: "Radius des Vielecks in Pixeln",
        },
      },
      color: {
        name: "color",
        info: {
          en: "Color in hexadecimal format (e.g. 0xff0000)",
          de: "Farbe im Hexadezimalformat (z.B. 0xff0000)",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      rotation: {
        name: "rotation",
        info: {
          en: "Rotation of the element in degrees",
          de: "Drehung des Elements in Grad",
        },
        example: "rotation = 45",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = false",
      },
    },
    methods: {
      setBorder: {
        example: "setBorder(0xff0000, 2)",
        info: {
          en: "Sets a border (color in hexadecimal format, thickness in pixels)",
          de: "Setzt einen Rahmen (Farbe im Hexadezimalformat, Dicke in Pixeln)",
        },
      },
      setTransformationPoint: {
        example: "setTransformationPoint(0, 0)",
        info: {
          en: "Sets the anchor point for positioning (x, y in pixels relative to the element)",
          de: "Setzt den Ankerpunkt für die Positionierung (x, y in Pixeln relativ zum Element)",
        },
      },
      setRotationPoint: {
        example: "setRotationPoint(0, 0)",
        info: {
          en: "Sets the rotation pivot point (x, y in pixels relative to the origin of the element)",
          de: "Setzt den Drehpunkt (x, y in Pixeln relativ zum Elementursprung)",
        },
      },
      setGradient: {
        example:
          'setGradient("radial", [{offset:0,color:"#fff"},{offset:1,color:"#000"}])',
        info: {
          en: "Creates a linear or radial color gradient. Parameters: type ('linear' or 'radial'), array of color stops [{offset: 0-1, color: '#hex'}], optional angle in degrees for linear gradients",
          de: "Erstellt einen linearen oder radialen Farbverlauf. Parameter: Typ ('linear' oder 'radial'), Array von Farbstopps [{offset: 0-1, color: '#hex'}], optionaler Winkel in Grad für lineare Verläufe",
        },
      },
      setScale: {
        example: "setScale(1.5, 1.5)",
        info: {
          en: "Scales the element (scaleX, scaleY). Use equal values for proportional scaling (1.0 = original size). Strokes are not scaled by default. Pass true as last parameter to scale strokes too.",
          de: "Skaliert das Element (scaleX, scaleY). Gleiche Werte für proportionale Skalierung verwenden (1.0 = Originalgröße). Konturen werden standardmäßig nicht mitskaliert. Übergebe true als letzten Parameter, um Konturen mitzuskalieren.",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      setStartAngle: {
        example: "setStartAngle(90)",
        info: {
          en: "Sets the starting angle for drawing the polygon in degrees",
          de: "Setzt den Startwinkel für das Zeichnen des Vielecks in Grad",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      onMouseDown: {
        example:
          'onMouseDown(handleMouseDown); \n\nfunction handleMouseDown() { console.log("Mouse button pressed"); }',
        info: {
          en: "Defines a function to execute when the mouse button is pressed down on the element.",
          de: "Legt fest, welche Funktion beim Drücken der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseUp: {
        example:
          'onMouseUp(handleMouseUp); \n\nfunction handleMouseUp() { console.log("Mouse button released"); }',
        info: {
          en: "Defines a function to execute when the mouse button is released on the element.",
          de: "Legt fest, welche Funktion beim Loslassen der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseOver: {
        example:
          'onMouseOver(handleMouseOver); \n\nfunction handleMouseOver() { console.log("Mouse entered element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor enters the element.",
          de: "Legt fest, welche Funktion beim Überfahren des Elements mit der Maus ausgeführt wird.",
        },
      },
      onMouseOut: {
        example:
          'onMouseOut(handleMouseOut); \n\nfunction handleMouseOut() { console.log("Mouse left element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor leaves the element.",
          de: "Legt fest, welche Funktion beim Verlassen des Elements mit der Maus ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
      onDragStart: {
        example:
          'onDragStart(handleDragStart); \n\nfunction handleDragStart() { console.log("Started dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging starts",
          de: "Setzt eine Callback-Funktion, die beim Start des Ziehens ausgeführt wird",
        },
      },
      onDrag: {
        example:
          'onDrag(handleDrag); \n\nfunction handleDrag() { console.log("Element is being dragged"); }',
        info: {
          en: "Sets a callback function that is executed while the element is being dragged",
          de: "Setzt eine Callback-Funktion, die während des Ziehens des Elements ausgeführt wird",
        },
      },
      onDragEnd: {
        example:
          'onDragEnd(handleDragEnd); \n\nfunction handleDragEnd() { console.log("Stopped dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging ends",
          de: "Setzt eine Callback-Funktion, die beim Ende des Ziehens ausgeführt wird",
        },
      },
    },
  };

  constructor(sides, radius, color = null) {
    this._sides = Math.max(3, Math.floor(sides));
    this._radius = radius;
    this._color = color;
    this._visualX = 0;
    this._visualY = 0;
    this._pivotX = 0;
    this._pivotY = 0;
    this._rotationPivotX = 0;
    this._rotationPivotY = 0;
    this._rotationDegrees = 0;
    this._alpha = 1;
    this._startAngle = -90;

    this._borderColor = 0;
    this._borderLine = 0;

    this._gradientType = null;
    this._gradientStops = null;

    this._scaleX = 1;
    this._scaleY = 1;
    this._scaleStrokes = false;

    this._visible = true;

    this._draggable = false;
    this._dragBounds = null;
    this._isDragging = false;
    this._dragOffsetX = 0;
    this._dragOffsetY = 0;
    this._boundDragMove = null;
    this._boundDragEnd = null;

    this._clickHandler = null;
    this._mouseDownHandler = null;
    this._mouseUpHandler = null;
    this._mouseOverHandler = null;
    this._mouseOutHandler = null;
    this._dragStartCallback = null;
    this._dragCallback = null;
    this._dragEndCallback = null;

    this._boundListeners = {};

    const board = BoardSVG.getInstance() || Board.getInstance();
    if (!board || !board.svgRoot) {
      console.error("Polygon: No active Board/svgRoot found.");
      return;
    }

    this._group = svgRoot.group();
    this._group.attr("cursor", "pointer");

    this._polygonElement = null;
    this._gradientDef = null;
    this._draw();

    board.addChild(this);
  }

  // ---------- Gradient helpers ----------

  _removeGradientDef() {
    if (this._gradientDef) {
      this._gradientDef.remove();
      this._gradientDef = null;
    }
  }

  // ---------- Polygon points ----------

  _calculatePolygonPoints() {
    const points = [];
    const angleStep = (Math.PI * 2) / this._sides;
    const startAngleRad = this._startAngle * (Math.PI / 180);
    for (let i = 0; i < this._sides; i++) {
      const angle = startAngleRad + i * angleStep;
      const x = Math.cos(angle) * this._radius;
      const y = Math.sin(angle) * this._radius;
      points.push([x, y]);
    }
    return points;
  }

  _draw() {
    if (!this._group) return;
    if (this._polygonElement) {
      this._polygonElement.remove();
      this._polygonElement = null;
    }

    this._removeGradientDef();

    const points = this._calculatePolygonPoints();
    const pointsFlat = points.map((p) => p.join(",")).join(" ");

    this._polygonElement = this._group.polygon(pointsFlat);

    if (this._gradientStops && this._gradientType) {
      this._applyGradient();
    } else if (this._color !== null) {
      this._polygonElement.fill(this._colorToHex(this._color));
    } else {
      this._polygonElement.fill("none");
    }

    if (this._borderLine > 0) {
      this._polygonElement.stroke({
        color: this._colorToHex(this._borderColor),
        width: this._borderLine,
      });
    } else {
      this._polygonElement.stroke("none");
    }

    this._updateTransform();
  }

  _applyGradient() {
    if (!this._gradientStops || !this._polygonElement) return;

    this._removeGradientDef();

    if (this._gradientType === "radial") {
      this._gradientDef = svgRoot.gradient("radial", (add) => {
        this._gradientStops.forEach((stop) => {
          add.stop(stop.offset, stop.color);
        });
      });
      this._gradientDef.attr({
        cx: "50%",
        cy: "50%",
        r: "50%",
        fx: "50%",
        fy: "50%",
      });
    } else {
      this._gradientDef = svgRoot.gradient("linear", (add) => {
        this._gradientStops.forEach((stop) => {
          add.stop(stop.offset, stop.color);
        });
      });
      this._gradientDef.from(0, 0.5).to(1, 0.5);
    }

    this._polygonElement.fill(this._gradientDef);
  }

  _updateTransform() {
    if (!this._group) return;

    const scaledPivotX = this._rotationPivotX * this._scaleX;
    const scaledPivotY = this._rotationPivotY * this._scaleY;

    const rpWorldX = this._visualX + scaledPivotX - this._pivotX;
    const rpWorldY = this._visualY + scaledPivotY - this._pivotY;

    let transform = `translate(${rpWorldX}, ${rpWorldY})`;

    if (this._rotationDegrees !== 0) {
      transform += ` rotate(${this._rotationDegrees})`;
    }

    if (this._scaleX !== 1 || this._scaleY !== 1) {
      transform += ` scale(${this._scaleX}, ${this._scaleY})`;
    }

    transform += ` translate(${-this._rotationPivotX}, ${-this._rotationPivotY})`;

    this._group.attr("transform", transform);
  }

  // ---------- Position ----------

  set x(value) {
    this._visualX = value;
    this._updateTransform();
  }

  get x() {
    return this._visualX;
  }

  set y(value) {
    this._visualY = value;
    this._updateTransform();
  }

  get y() {
    return this._visualY;
  }

  // ---------- Rotation (degrees) ----------

  set rotation(degrees) {
    this._rotationDegrees = degrees;
    this._updateTransform();
  }

  get rotation() {
    return this._rotationDegrees || 0;
  }

  // ---------- Visibility ----------

  set visible(value) {
    this._visible = Boolean(value);
    if (this._group) {
      this._group.attr("visibility", this._visible ? "visible" : "hidden");
    }
  }

  get visible() {
    return this._visible;
  }

  setBorder(borderColor, borderLine) {
    this._borderColor = borderColor;
    this._borderLine = borderLine;
    if (this._polygonElement) {
      if (borderLine > 0) {
        this._polygonElement.stroke({
          color: this._colorToHex(borderColor),
          width: borderLine,
        });
      } else {
        this._polygonElement.stroke("none");
      }
    }
  }

  setTransformationPoint(offsetX = 0, offsetY = 0) {
    this._pivotX = offsetX;
    this._pivotY = offsetY;
    this._updateTransform();
    return this;
  }

  setRotationPoint(offsetX = 0, offsetY = 0) {
    this._rotationPivotX = offsetX;
    this._rotationPivotY = offsetY;
    this._updateTransform();
    return this;
  }

  setGradient(
    type = "radial",
    colorStops = [
      { offset: 0, color: "#fff" },
      { offset: 1, color: "#000" },
    ],
  ) {
    this._gradientType = type;
    this._gradientStops = colorStops;
    this._draw();
  }

  setScale(scaleX, scaleY, scaleStrokes = false) {
    this._scaleX = scaleX;
    this._scaleY = scaleY !== undefined ? scaleY : scaleX;
    this._scaleStrokes = scaleStrokes;
    this._applyScale();
    this._updateTransform();
    this._applyNonScalingStroke();
    return this;
  }

  _applyNonScalingStroke() {
    oalApplyStrokeScaling(this);
  }

  setAlpha(value) {
    this._alpha = Math.max(0, Math.min(1, value));
    if (this._group) {
      this._group.attr("opacity", this._alpha);
    }
  }

  setStartAngle(degrees) {
    this._startAngle = degrees;
    this._draw();
  }

  // ---------- Events ----------

  _bindEvent(eventName, domEvent, callback) {
    if (!this._group || !callback) return;

    if (this._boundListeners[eventName]) {
      this._group.node.removeEventListener(
        domEvent,
        this._boundListeners[eventName],
      );
    }

    const board = BoardSVG.getInstance() || Board.getInstance();

    const handler = (e) => {
      e.stopPropagation();
      const pos = board
        ? board._getPointerPos(e)
        : { x: e.clientX, y: e.clientY };
      const mouseEvent = {
        type: eventName,
        x: pos.x,
        y: pos.y,
        globalX: pos.x,
        globalY: pos.y,
        button: e.button || 0,
        buttons: e.buttons || 0,
        ctrlKey: e.ctrlKey || false,
        shiftKey: e.shiftKey || false,
        altKey: e.altKey || false,
        originalEvent: e,
      };
      callback(mouseEvent);
    };

    this._boundListeners[eventName] = handler;
    this._group.node.addEventListener(domEvent, handler);
  }

  onClick(callback) {
    this._clickHandler = callback;
    this._bindEvent("click", "pointerdown", callback);
    return this;
  }

  onMouseDown(callback) {
    this._mouseDownHandler = callback;
    this._bindEvent("mousedown", "pointerdown", callback);
    return this;
  }

  onMouseUp(callback) {
    this._mouseUpHandler = callback;
    this._bindEvent("mouseup", "pointerup", callback);
    return this;
  }

  onMouseOver(callback) {
    this._mouseOverHandler = callback;
    this._bindEvent("mouseover", "pointerover", callback);
    return this;
  }

  onMouseOut(callback) {
    this._mouseOutHandler = callback;
    this._bindEvent("mouseout", "pointerout", callback);
    return this;
  }

  // ---------- Dragging ----------

  setDragging(minX, minY, maxX, maxY) {
    this._draggable = true;
    this._dragBounds = { minX, minY, maxX, maxY };

    const board = BoardSVG.getInstance() || Board.getInstance();
    if (!board) return this;

    const onPointerDown = (e) => {
      e.stopPropagation();
      this._isDragging = true;

      const pos = board._getPointerPos(e);
      this._dragOffsetX = pos.x - this._visualX;
      this._dragOffsetY = pos.y - this._visualY;

      if (this._dragStartCallback) {
        this._dragStartCallback({
          x: this._visualX,
          y: this._visualY,
          globalX: pos.x,
          globalY: pos.y,
        });
      }

      this._boundDragMove = (me) => this._onDragMove(me);
      this._boundDragEnd = (me) => this._onDragEnd(me);

      svgRoot.node.addEventListener("pointermove", this._boundDragMove);
      svgRoot.node.addEventListener("pointerup", this._boundDragEnd);
      svgRoot.node.addEventListener("pointerleave", this._boundDragEnd);
    };

    if (this._boundListeners._dragPointerDown) {
      this._group.node.removeEventListener(
        "pointerdown",
        this._boundListeners._dragPointerDown,
      );
    }
    this._boundListeners._dragPointerDown = onPointerDown;
    this._group.node.addEventListener("pointerdown", onPointerDown);

    return this;
  }

  _onDragMove(e) {
    if (!this._isDragging) return;

    const board = BoardSVG.getInstance() || Board.getInstance();
    if (!board) return;

    const pos = board._getPointerPos(e);
    let newX = pos.x - this._dragOffsetX;
    let newY = pos.y - this._dragOffsetY;

    if (this._dragBounds) {
      newX = Math.max(
        this._dragBounds.minX,
        Math.min(this._dragBounds.maxX, newX),
      );
      newY = Math.max(
        this._dragBounds.minY,
        Math.min(this._dragBounds.maxY, newY),
      );
    }

    this.x = newX;
    this.y = newY;

    if (this._dragCallback) {
      this._dragCallback({
        x: this._visualX,
        y: this._visualY,
        globalX: pos.x,
        globalY: pos.y,
      });
    }
  }

  _onDragEnd(e) {
    if (!this._isDragging) return;
    this._isDragging = false;

    if (this._boundDragMove) {
      svgRoot.node.removeEventListener("pointermove", this._boundDragMove);
    }
    if (this._boundDragEnd) {
      svgRoot.node.removeEventListener("pointerup", this._boundDragEnd);
      svgRoot.node.removeEventListener("pointerleave", this._boundDragEnd);
    }

    if (this._dragEndCallback) {
      this._dragEndCallback({
        x: this._visualX,
        y: this._visualY,
      });
    }
  }

  onDragStart(callback) {
    this._dragStartCallback = callback;
    return this;
  }

  onDrag(callback) {
    this._dragCallback = callback;
    return this;
  }

  onDragEnd(callback) {
    this._dragEndCallback = callback;
    return this;
  }

  getSerializableMethods() {
    const methods = {};
    if (this._gradientStops && this._gradientType) {
      methods.setGradient =
        'setGradient("' +
        this._gradientType +
        '", ' +
        JSON.stringify(this._gradientStops) +
        ")";
    }
    if (this._alpha !== 1) {
      methods.setAlpha = "setAlpha(" + this._alpha + ")";
    }
    if (this._startAngle !== -90) {
      methods.setStartAngle = "setStartAngle(" + this._startAngle + ")";
    }
    return methods;
  }

  // ---------- Destroy ----------

  destroy() {
    oalStopStrokeScaling(this);
    if (this._boundDragMove) {
      svgRoot.node.removeEventListener("pointermove", this._boundDragMove);
    }
    if (this._boundDragEnd) {
      svgRoot.node.removeEventListener("pointerup", this._boundDragEnd);
      svgRoot.node.removeEventListener("pointerleave", this._boundDragEnd);
    }

    this._boundListeners = {};

    this._clickHandler = null;
    this._mouseDownHandler = null;
    this._mouseUpHandler = null;
    this._mouseOverHandler = null;
    this._mouseOutHandler = null;
    this._dragStartCallback = null;
    this._dragCallback = null;
    this._dragEndCallback = null;

    this._removeGradientDef();

    if (this._group) {
      this._group.remove();
      this._group = null;
    }

    this._polygonElement = null;
  }

  // ---------- Helpers ----------

  _colorToHex(color) {
    if (typeof color === "string") return color;
    return "#" + ("000000" + (color & 0xffffff).toString(16)).slice(-6);
  }
};

// ============================================================================
// LinePath
// ============================================================================

SvgJSEdu.LinePath = class LinePath extends PathBase {
  static serializationMap = {
    description: {
      de: "Linienzug aus Punkten",
      en: "Line path from points",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      "let myLinePath = new LinePath([[0,0], [100,50], [200,100]], 0xff0000, 3);",
    constructor: {
      points: {
        name: "points",
        info: {
          en: "Array of coordinate pairs [[x1,y1], [x2,y2], ...] in pixels",
          de: "Array von Koordinatenpaaren [[x1,y1], [x2,y2], ...] in Pixeln",
        },
      },
      color: {
        name: "color",
        info: {
          en: "Line color in hexadecimal format (e.g. 0xff0000)",
          de: "Linienfarbe im Hexadezimalformat (z.B. 0xff0000)",
        },
      },
      thickness: {
        name: "thickness",
        info: { en: "Line thickness in pixels", de: "Linienstärke in Pixeln" },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = true",
      },
    },
    methods: {
      setFillColor: {
        name: "setFillColor",
        example: "setFillColor(0xff0000)",
        info: {
          en: "Sets the fill color of the shape",
          de: "Setzt die Füllfarbe der Form",
        },
      },
      setAlpha: {
        name: "setAlpha",
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      setPoints: {
        name: "setPoints",
        info: {
          en: "Replaces the entire point array. If the path was closed, it will be automatically closed again.",
          de: "Ersetzt das gesamte Punktearray. War der Pfad geschlossen, wird er automatisch erneut geschlossen.",
        },
        example: "setPoints([[0,0], [100,50], [200,100]])",
      },
      addPointEnd: {
        name: "addPointEnd",
        info: {
          en: "Adds a point at the end of the line",
          de: "Fügt einen Punkt am Ende der Linie hinzu",
        },
        example: "addPointEnd(150, 75)",
      },
      addPointStart: {
        name: "addPointStart",
        info: {
          en: "Adds a point at the beginning of the line",
          de: "Fügt einen Punkt am Anfang der Linie hinzu",
        },
        example: "addPointStart(25, 25)",
      },
      removePointEnd: {
        name: "removePointEnd",
        info: {
          en: "Removes the last point of the line",
          de: "Entfernt den letzten Punkt der Linie",
        },
        example: "removePointEnd()",
      },
      removePointStart: {
        name: "removePointStart",
        info: {
          en: "Removes the first point of the line",
          de: "Entfernt den ersten Punkt der Linie",
        },
        example: "removePointStart()",
      },
      shiftX: {
        name: "shiftX",
        info: {
          en: "Shifts the entire line by a delta value in X direction",
          de: "Verschiebt die gesamte Linie um einen Delta-Wert in X-Richtung",
        },
        example: "shiftX(50)",
      },
      closePath: {
        name: "closePath",
        info: {
          en: "Closes the path by connecting the first and last point. The path remains closed after setPoints() calls.",
          de: "Schließt den Pfad durch Verbindung des ersten und letzten Punktes. Der Pfad bleibt auch nach setPoints()-Aufrufen geschlossen.",
        },
        example: "closePath()",
      },
      openPath: {
        name: "openPath",
        info: {
          en: "Opens a closed path by removing the closing point and disabling auto-close.",
          de: "Öffnet einen geschlossenen Pfad, indem der Schließpunkt entfernt und Auto-Close deaktiviert wird.",
        },
        example: "openPath()",
      },
      setColor: {
        name: "setColor",
        info: {
          en: "Sets the line color",
          de: "Setzt die Linienfarbe",
        },
        example: "setColor(0x00ff00)",
      },
      setThickness: {
        name: "setThickness",
        info: {
          en: "Sets the line thickness",
          de: "Setzt die Linienstärke",
        },
        example: "setThickness(5)",
      },
      markAt: {
        name: "markAt",
        info: {
          en: "Marks a point on the path at given x-coordinate",
          de: "Markiert einen Punkt auf dem Pfad bei gegebener x-Koordinate",
        },
        example: "markAt(100, 0xff0000, 5)",
      },
      removeMark: {
        name: "removeMark",
        info: {
          en: "Removes the marker from the path",
          de: "Entfernt die Markierung vom Pfad",
        },
        example: "removeMark()",
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      onMouseDown: {
        example:
          'onMouseDown(handleMouseDown); \n\nfunction handleMouseDown() { console.log("Mouse button pressed"); }',
        info: {
          en: "Defines a function to execute when the mouse button is pressed down on the element.",
          de: "Legt fest, welche Funktion beim Drücken der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseUp: {
        example:
          'onMouseUp(handleMouseUp); \n\nfunction handleMouseUp() { console.log("Mouse button released"); }',
        info: {
          en: "Defines a function to execute when the mouse button is released on the element.",
          de: "Legt fest, welche Funktion beim Loslassen der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseOver: {
        example:
          'onMouseOver(handleMouseOver); \n\nfunction handleMouseOver() { console.log("Mouse entered element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor enters the element.",
          de: "Legt fest, welche Funktion beim Überfahren des Elements mit der Maus ausgeführt wird.",
        },
      },
      onMouseOut: {
        example:
          'onMouseOut(handleMouseOut); \n\nfunction handleMouseOut() { console.log("Mouse left element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor leaves the element.",
          de: "Legt fest, welche Funktion beim Verlassen des Elements mit der Maus ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
      onDragStart: {
        example:
          'onDragStart(handleDragStart); \n\nfunction handleDragStart() { console.log("Started dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging starts",
          de: "Setzt eine Callback-Funktion, die beim Start des Ziehens ausgeführt wird",
        },
      },
      onDrag: {
        example:
          'onDrag(handleDrag); \n\nfunction handleDrag() { console.log("Element is being dragged"); }',
        info: {
          en: "Sets a callback function that is executed while the element is being dragged",
          de: "Setzt eine Callback-Funktion, die während des Ziehens des Elements ausgeführt wird",
        },
      },
      onDragEnd: {
        example:
          'onDragEnd(handleDragEnd); \n\nfunction handleDragEnd() { console.log("Stopped dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging ends",
          de: "Setzt eine Callback-Funktion, die beim Ende des Ziehens ausgeführt wird",
        },
      },
    },
  };

  constructor(points = [], color = 0x000000, thickness = 2) {
    super(points, color, thickness);
    this._isClosed = false;
    this._shiftXOffset = 0;
    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (!this._group) return;
    if (this._pathElement) this._pathElement.remove();
    if (this._fillElement) this._fillElement.remove();
    this._fillElement = null;

    if (this.points.length < 2) return;

    let d = `M ${this.points[0][0]},${this.points[0][1]}`;
    for (let i = 1; i < this.points.length; i++) {
      d += ` L ${this.points[i][0]},${this.points[i][1]}`;
    }

    if (this._fillColor !== null && this.points.length >= 3) {
      const [x0, y0] = this.points[0];
      const [xn, yn] = this.points[this.points.length - 1];
      if (x0 === xn && y0 === yn) {
        this._fillElement = this._group
          .path(d + " Z")
          .fill(colorToHex(this._fillColor))
          .stroke("none");
      }
    }

    this._pathElement = this._group
      .path(d)
      .fill("none")
      .stroke({
        color: colorToHex(this._color),
        width: this._thickness,
      });
  }

  setPoints(newPoints) {
    this.points = [...newPoints];
    if (this._isClosed) {
      this._closePathInternal();
    }
    this._draw();
  }

  addPointEnd(x, y) {
    if (this._isClosed && this.points.length >= 2) {
      this.points.splice(this.points.length - 1, 0, [x, y]);
    } else {
      this.points.push([x, y]);
    }
    this._draw();
  }

  addPointStart(x, y) {
    this.points.unshift([x, y]);
    if (this._isClosed && this.points.length >= 2) {
      this.points[this.points.length - 1] = [x, y];
    }
    this._draw();
  }

  removePointEnd() {
    if (this.points.length === 0) return;
    if (this._isClosed && this.points.length > 2) {
      this.points.splice(this.points.length - 2, 1);
    } else if (!this._isClosed) {
      this.points.pop();
    }
    this._draw();
  }

  removePointStart() {
    if (this.points.length === 0) return;
    this.points.shift();
    if (this._isClosed && this.points.length >= 1) {
      this.points[this.points.length - 1] = [
        this.points[0][0],
        this.points[0][1],
      ];
    }
    this._draw();
  }

  addPoint(x, y) {
    this.addPointEnd(x, y);
  }

  removePoint(index) {
    if (index < 0 || index >= this.points.length) return;
    this.points.splice(index, 1);
    if (this._isClosed && index === 0 && this.points.length >= 1) {
      this.points[this.points.length - 1] = [
        this.points[0][0],
        this.points[0][1],
      ];
    }
    this._draw();
  }

  updatePoint(index, x, y) {
    if (index < 0 || index >= this.points.length) return;
    this.points[index] = [x, y];
    if (this._isClosed) {
      if (index === 0) {
        this.points[this.points.length - 1] = [x, y];
      } else if (index === this.points.length - 1) {
        this.points[0] = [x, y];
      }
    }
    this._draw();
  }

  updatePoints(newPoints) {
    this.setPoints(newPoints);
  }

  shiftX(deltaX) {
    this._shiftXOffset += deltaX;
    this._group.translate(deltaX, 0);
    if (this.markerInitialized) {
      this.markAt(this.markedX - deltaX, this.markColor, this.markRadius);
    }
  }

  _closePathInternal() {
    if (this.points.length < 2) return;
    const firstPoint = this.points[0];
    const lastPoint = this.points[this.points.length - 1];
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      this.points.push([firstPoint[0], firstPoint[1]]);
    }
  }

  closePath() {
    if (this.points.length < 2) return;
    if (this._isClosed) return;

    this._isClosed = true;
    this._closePathInternal();
    this._draw();
  }

  openPath() {
    if (!this._isClosed) return;
    if (this.points.length < 2) return;

    this._isClosed = false;

    const firstPoint = this.points[0];
    const lastPoint = this.points[this.points.length - 1];
    if (firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1]) {
      this.points.pop();
    }

    this._draw();
  }

  get isClosed() {
    return this._isClosed;
  }

  setColor(color) {
    this._color = color;
    this._draw();
  }

  setThickness(thickness) {
    this._thickness = thickness;
    this._draw();
  }

  getY(x) {
    if (this.points.length < 2) return null;
    const sorted = [...this.points].sort((a, b) => a[0] - b[0]);
    if (x < sorted[0][0] || x > sorted[sorted.length - 1][0]) return null;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i][0] <= x && x <= sorted[i + 1][0]) {
        const t = (x - sorted[i][0]) / (sorted[i + 1][0] - sorted[i][0]);
        return sorted[i][1] + t * (sorted[i + 1][1] - sorted[i][1]);
      }
    }
    return null;
  }

  getX(y) {
    if (this.points.length < 2) return null;
    for (let i = 0; i < this.points.length - 1; i++) {
      const [x1, y1] = this.points[i];
      const [x2, y2] = this.points[i + 1];
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      if (y >= minY && y <= maxY && y2 !== y1) {
        const t = (y - y1) / (y2 - y1);
        return x1 + t * (x2 - x1);
      }
    }
    return null;
  }

  removeMark() {
    this.markerInitialized = false;
    if (this._markerCircle) {
      this._markerCircle.remove();
      this._markerCircle = null;
    }
    if (this._vGuideLine) {
      this._vGuideLine.remove();
      this._vGuideLine = null;
    }
    if (this._hGuideLine) {
      this._hGuideLine.remove();
      this._hGuideLine = null;
    }
  }
};

// ============================================================================
// BezierPath
// ============================================================================

SvgJSEdu.BezierPath = class BezierPath extends PathBase {
  static serializationMap = {
    description: {
      de: "Bezierkurve mit Kontrollpunkten",
      en: "Bezier curve with control points",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      "let myBezierPath = new BezierPath([[0,0,10,-10], [100,50,120,30], [200,100,180,120]], 0xff0000, 3);",
    constructor: {
      points: {
        name: "points",
        info: {
          en: "Array of points with control points [[x, y, cx, cy], ...]",
          de: "Array von Punkten mit Steuerpunkten [[x, y, cx, cy], ...]",
        },
      },
      color: {
        name: "color",
        info: {
          en: "Line color in hexadecimal format (e.g. 0xff0000)",
          de: "Linienfarbe im Hexadezimalformat (z.B. 0xff0000)",
        },
      },
      thickness: {
        name: "thickness",
        info: {
          en: "Line thickness in pixels",
          de: "Linienstärke in Pixeln",
        },
      },
    },
    setter: {
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = false",
      },
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
    },
    methods: {
      setFillColor: {
        name: "setFillColor",
        info: {
          en: "Sets the fill color for closed bezier shapes",
          de: "Setzt die Füllfarbe für geschlossene Bezier-Formen",
        },
        example: "setFillColor(0xff0000)",
      },
      setAlpha: {
        name: "setAlpha",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
        example: "setAlpha(0.5)",
      },
      setPoints: {
        name: "setPoints",
        info: {
          en: "Replaces the entire point array with a new array",
          de: "Ersetzt das gesamte Punktearray durch ein neues Array",
        },
        example:
          "setPoints([[0,0,10,-10], [100,50,120,30], [200,100,180,120]])",
      },
      addPointEnd: {
        name: "addPointEnd",
        info: {
          en: "Adds a point with control point at the end of the bezier path",
          de: "Fügt einen Punkt mit Steuerpunkt am Ende des Bezier-Pfads hinzu",
        },
        example: "addPointEnd(150, 75, 160, 60)",
      },
      addPointStart: {
        name: "addPointStart",
        info: {
          en: "Adds a point with control point at the beginning of the bezier path",
          de: "Fügt einen Punkt mit Steuerpunkt am Anfang des Bezier-Pfads hinzu",
        },
        example: "addPointStart(25, 25, 30, 20)",
      },
      removePointEnd: {
        name: "removePointEnd",
        info: {
          en: "Removes the last point of the bezier path",
          de: "Entfernt den letzten Punkt des Bezier-Pfads",
        },
        example: "removePointEnd()",
      },
      removePointStart: {
        name: "removePointStart",
        info: {
          en: "Removes the first point of the bezier path",
          de: "Entfernt den ersten Punkt des Bezier-Pfads",
        },
        example: "removePointStart()",
      },
      shiftX: {
        name: "shiftX",
        info: {
          en: "Shifts the entire bezier path by a delta value in X direction",
          de: "Verschiebt den gesamten Bezier-Pfad um einen Delta-Wert in X-Richtung",
        },
        example: "shiftX(50)",
      },
      setColor: {
        name: "setColor",
        example: "setColor(0x00ff00)",
        info: {
          en: "Sets the line color",
          de: "Setzt die Linienfarbe",
        },
      },
      setThickness: {
        name: "setThickness",
        example: "setThickness(5)",
        info: {
          en: "Sets the line thickness",
          de: "Setzt die Linienstärke",
        },
      },
      getY: {
        name: "getY",
        example: "getY(100)",
        info: {
          en: "Returns the y-coordinate for a given x-coordinate on the curve",
          de: "Gibt die y-Koordinate für eine gegebene x-Koordinate auf der Kurve zurück",
        },
      },
      getX: {
        name: "getX",
        example: "getX(150)",
        info: {
          en: "Returns the x-coordinate for a given y-coordinate on the curve",
          de: "Gibt die x-Koordinate für eine gegebene y-Koordinate auf der Kurve zurück",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      onMouseDown: {
        example:
          'onMouseDown(handleMouseDown); \n\nfunction handleMouseDown() { console.log("Mouse button pressed"); }',
        info: {
          en: "Defines a function to execute when the mouse button is pressed down on the element.",
          de: "Legt fest, welche Funktion beim Drücken der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseUp: {
        example:
          'onMouseUp(handleMouseUp); \n\nfunction handleMouseUp() { console.log("Mouse button released"); }',
        info: {
          en: "Defines a function to execute when the mouse button is released on the element.",
          de: "Legt fest, welche Funktion beim Loslassen der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseOver: {
        example:
          'onMouseOver(handleMouseOver); \n\nfunction handleMouseOver() { console.log("Mouse entered element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor enters the element.",
          de: "Legt fest, welche Funktion beim Überfahren des Elements mit der Maus ausgeführt wird.",
        },
      },
      onMouseOut: {
        example:
          'onMouseOut(handleMouseOut); \n\nfunction handleMouseOut() { console.log("Mouse left element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor leaves the element.",
          de: "Legt fest, welche Funktion beim Verlassen des Elements mit der Maus ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
      onDragStart: {
        example:
          'onDragStart(handleDragStart); \n\nfunction handleDragStart() { console.log("Started dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging starts",
          de: "Setzt eine Callback-Funktion, die beim Start des Ziehens ausgeführt wird",
        },
      },
      onDrag: {
        example:
          'onDrag(handleDrag); \n\nfunction handleDrag() { console.log("Element is being dragged"); }',
        info: {
          en: "Sets a callback function that is executed while the element is being dragged",
          de: "Setzt eine Callback-Funktion, die während des Ziehens des Elements ausgeführt wird",
        },
      },
      onDragEnd: {
        example:
          'onDragEnd(handleDragEnd); \n\nfunction handleDragEnd() { console.log("Stopped dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging ends",
          de: "Setzt eine Callback-Funktion, die beim Ende des Ziehens ausgeführt wird",
        },
      },
    },
  };

  constructor(points = [], color = 0x000000, thickness = 2) {
    super(points, color, thickness);

    this._shiftX = 0;
    this.markedX = 0;
    this.markerInitialized = false;
    this.markColor = 0x000000;
    this.markRadius = 3;

    // Marker-Elemente (werden bei Bedarf erzeugt)
    this._markedCircle = null;
    this._vGuideLine = null;
    this._hGuideLine = null;

    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (!this._group) return;
    if (this._pathElement) this._pathElement.remove();
    if (this._fillElement) this._fillElement.remove();
    this._fillElement = null;

    if (this.points.length < 2) return;

    // Point format: [x, y, cx, cy]
    // Maps to SVG cubic bezier: C cx0,cy0 cx3,cy3 x3,y3
    const startPoint = this.points[0];
    let d = `M ${startPoint[0]},${startPoint[1]}`;

    for (let i = 0; i < this.points.length - 1; i++) {
      const [x0, y0, cx0, cy0] = this.points[i];
      const [x3, y3, cx3, cy3] = this.points[i + 1];
      d += ` C ${cx0},${cy0} ${cx3},${cy3} ${x3},${y3}`;
    }

    if (this._fillColor !== null && this.points.length >= 3) {
      this._fillElement = this._group
        .path(d + " Z")
        .fill(colorToHex(this._fillColor))
        .stroke("none");
    }

    let strokeD = d;
    if (this._fillColor !== null && this.points.length >= 3) {
      strokeD = d + " Z";
    }

    this._pathElement = this._group
      .path(strokeD)
      .fill("none")
      .stroke({
        color: colorToHex(this._color),
        width: this._thickness,
      });
  }

  setPoints(newPoints) {
    this.points = [...newPoints];
    this._draw();
  }

  addPointEnd(x, y, cx, cy) {
    this.points.push([x, y, cx, cy]);
    this._draw();
  }

  addPointStart(x, y, cx, cy) {
    this.points.unshift([x, y, cx, cy]);
    this._draw();
  }

  removePointEnd() {
    if (this.points.length > 0) {
      this.points.pop();
      this._draw();
    }
  }

  removePointStart() {
    if (this.points.length > 0) {
      this.points.shift();
      this._draw();
    }
  }

  addPoint(x, y, cx, cy) {
    this.addPointEnd(x, y, cx, cy);
  }

  removePoint(index) {
    if (index >= 0 && index < this.points.length) {
      this.points.splice(index, 1);
      this._draw();
    }
  }

  updatePoint(index, x, y, cx, cy) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = [x, y, cx, cy];
      this._draw();
    }
  }

  updatePoints(newPoints) {
    this.setPoints(newPoints);
  }

  shiftX(deltaX) {
    this._shiftX += deltaX;
    this._group.transform({ translateX: this._shiftX });
    if (this.markerInitialized) {
      this.markAt(this.markedX - deltaX, this.markColor, this.markRadius);
    }
  }

  setAlpha(alpha) {
    const clamped = Math.max(0, Math.min(1, alpha));
    this._group.opacity(clamped);
  }

  setFillColor(fillColor) {
    this._fillColor = fillColor;
    this._draw();
  }

  markAt(x, color = null, radius = null) {
    this.markedX = x;
    if (color !== null) this.markColor = color;
    if (radius !== null) this.markRadius = radius;
    this.markerInitialized = true;

    const y = this.getY(x);

    if (this._markedCircle) this._markedCircle.remove();
    if (this._vGuideLine) this._vGuideLine.remove();
    if (this._hGuideLine) this._hGuideLine.remove();
    this._markedCircle = null;
    this._vGuideLine = null;
    this._hGuideLine = null;

    if (y !== null) {
      const hexColor = colorToHex(this.markColor);

      this._markedCircle = this._group
        .circle(this.markRadius * 2)
        .center(x, y)
        .fill(hexColor);

      this._vGuideLine = this._group
        .line(x, 0, x, y)
        .stroke({ color: hexColor, width: 1, opacity: 0.5 });

      this._hGuideLine = this._group
        .line(0, y, x, y)
        .stroke({ color: hexColor, width: 1, opacity: 0.5 });
    }
  }

  removeMark() {
    this.markerInitialized = false;
    if (this._markedCircle) this._markedCircle.remove();
    if (this._vGuideLine) this._vGuideLine.remove();
    if (this._hGuideLine) this._hGuideLine.remove();
    this._markedCircle = null;
    this._vGuideLine = null;
    this._hGuideLine = null;
  }

  _getYOnCubicBezier(x, p0, p1, p2, p3) {
    let t = 0.5;
    const epsilon = 0.0001;
    const maxIterations = 20;
    for (let i = 0; i < maxIterations; i++) {
      const t2 = t * t;
      const t3 = t2 * t;
      const mt = 1 - t;
      const mt2 = mt * mt;
      const mt3 = mt2 * mt;
      const xt =
        mt3 * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t3 * p3[0];
      const dx = xt - x;
      if (Math.abs(dx) < epsilon) {
        const yt =
          mt3 * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t3 * p3[1];
        return yt;
      }
      const dxdt =
        -3 * mt2 * p0[0] +
        3 * mt2 * p1[0] -
        6 * mt * t * p1[0] +
        6 * mt * t * p2[0] -
        3 * t2 * p2[0] +
        3 * t2 * p3[0];
      if (Math.abs(dxdt) < epsilon) break;
      t = t - dx / dxdt;
      t = Math.max(0, Math.min(1, t));
    }
    return null;
  }

  getY(x) {
    if (this.points.length < 2) return null;
    const adjustedX = x - this._shiftX;

    for (let i = 0; i < this.points.length - 1; i++) {
      const [x0, y0, cx0, cy0] = this.points[i];
      const [x3, y3, cx3, cy3] = this.points[i + 1];

      const minX = Math.min(x0, x3, cx0, cx3);
      const maxX = Math.max(x0, x3, cx0, cx3);
      if (adjustedX >= minX && adjustedX <= maxX) {
        const y = this._getYOnCubicBezier(
          adjustedX,
          [x0, y0],
          [cx0, cy0],
          [cx3, cy3],
          [x3, y3],
        );
        if (y !== null) return y;
      }
    }
    return null;
  }

  getX(y) {
    if (this.points.length < 2) return null;
    const results = [];
    for (let i = 0; i < this.points.length - 1; i++) {
      const [x0, y0, cx0, cy0] = this.points[i];
      const [x3, y3, cx3, cy3] = this.points[i + 1];
      const minY = Math.min(y0, y3, cy0, cy3);
      const maxY = Math.max(y0, y3, cy0, cy3);
      if (y >= minY && y <= maxY) {
        const startPoints = [0, 0.25, 0.5, 0.75, 1];
        const foundTValues = new Set();
        for (const startT of startPoints) {
          let t = startT;
          const tolerance = 0.0001;
          let iterations = 0;
          const maxIterations = 50;
          while (iterations < maxIterations) {
            const t2 = t * t;
            const t3 = t2 * t;
            const mt = 1 - t;
            const mt2 = mt * mt;
            const mt3 = mt2 * mt;
            const currentY =
              mt3 * y0 + 3 * mt2 * t * cy0 + 3 * mt * t2 * cy3 + t3 * y3;
            const error = Math.abs(currentY - y);
            if (error < tolerance) {
              let isNew = true;
              for (const existingT of foundTValues) {
                if (Math.abs(existingT - t) < 0.01) {
                  isNew = false;
                  break;
                }
              }
              if (isNew && t >= 0 && t <= 1) {
                foundTValues.add(t);
                const x =
                  mt3 * x0 + 3 * mt2 * t * cx0 + 3 * mt * t2 * cx3 + t3 * x3;
                results.push(x);
              }
              break;
            }
            const dydt =
              -3 * mt2 * y0 +
              3 * mt2 * cy0 -
              6 * mt * t * cy0 +
              6 * mt * t * cy3 -
              3 * t2 * cy3 +
              3 * t2 * y3;
            if (Math.abs(dydt) < 0.0001) {
              let lower = 0,
                upper = 1;
              let binaryT = 0.5;
              for (let j = 0; j < 20; j++) {
                const bt2 = binaryT * binaryT;
                const bt3 = bt2 * binaryT;
                const bmt = 1 - binaryT;
                const bmt2 = bmt * bmt;
                const bmt3 = bmt2 * bmt;
                const binaryY =
                  bmt3 * y0 + 3 * bmt2 * binaryT * cy0 + 3 * bmt * bt2 * cy3 + bt3 * y3;
                if (binaryY < y) {
                  lower = binaryT;
                } else {
                  upper = binaryT;
                }
                binaryT = (lower + upper) / 2;
              }
              t = binaryT;
            } else {
              t = t - (currentY - y) / dydt;
              t = Math.max(0, Math.min(1, t));
            }
            iterations++;
          }
        }
      }
    }
    if (results.length === 0) return null;
    if (results.length === 1) return results[0];
    results.sort((a, b) => a - b);
    const uniqueResults = [];
    for (let i = 0; i < results.length; i++) {
      if (i === 0 || Math.abs(results[i] - results[i - 1]) > 1) {
        uniqueResults.push(results[i]);
      }
    }
    return uniqueResults.length === 1 ? uniqueResults[0] : uniqueResults;
  }

  setColor(color) {
    this._color = color;
    this._draw();
  }

  setThickness(thickness) {
    this._thickness = thickness;
    this._draw();
  }
};

// ============================================================================
// SplinePath (Catmull-Rom Spline)
// ============================================================================

SvgJSEdu.SplinePath = class SplinePath extends PathBase {
  static serializationMap = {
    description: {
      de: "Spline-Kurve aus Punkten",
      en: "Spline curve from points",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      "let mySplinePath = new SplinePath([[0,0], [100,50], [200,100]], 0xff0000, 3, 0);",
    constructor: {
      points: {
        name: "points",
        info: {
          en: "Array of points to define the shape",
          de: "Array von Punkten zur Definition der Form",
        },
      },
      color: {
        name: "color",
        info: {
          en: "Line color in hexadecimal format",
          de: "Linienfarbe im Hexadezimalformat",
        },
      },
      thickness: {
        name: "thickness",
        info: { en: "Line thickness in pixels", de: "Linienstärke in Pixeln" },
      },
      tension: {
        name: "tension",
        info: {
          en: "Tension of the spline curve (0 = smooth, 1 = straight lines)",
          de: "Spannung der Spline-Kurve (0 = glatt, 1 = gerade Linien)",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = true",
      },
    },
    methods: {
      setFillColor: {
        name: "setFillColor",
        example: "setFillColor(0xff0000)",
        info: {
          en: "Sets the fill color of the shape",
          de: "Setzt die Füllfarbe der Form",
        },
      },
      setColor: {
        name: "setColor",
        example: "setColor(0x00ff00)",
        info: {
          en: "Sets the line color",
          de: "Setzt die Linienfarbe",
        },
      },
      setThickness: {
        name: "setThickness",
        example: "setThickness(5)",
        info: {
          en: "Sets the line thickness",
          de: "Setzt die Linienstärke",
        },
      },
      setAlpha: {
        name: "setAlpha",
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      setTension: {
        name: "setTension",
        example: "setTension(0.5)",
        info: {
          en: "Sets the tension of the spline curve (0 = smooth, 1 = straight lines)",
          de: "Setzt die Spannung der Spline-Kurve (0 = glatt, 1 = gerade Linien)",
        },
      },
      setPoints: {
        name: "setPoints",
        example: "setPoints([[0,0], [100,50], [200,100]])",
        info: {
          en: "Replaces the entire point array",
          de: "Ersetzt das gesamte Punktearray",
        },
      },
      setColor: {
        name: "setColor",
        example: "setColor(0x00ff00)",
        info: {
          en: "Sets the line color",
          de: "Setzt die Linienfarbe",
        },
      },
      getY: {
        name: "getY",
        example: "getY(100)",
        info: {
          en: "Returns the y-coordinate for a given x-coordinate on the curve",
          de: "Gibt die y-Koordinate für eine gegebene x-Koordinate auf der Kurve zurück",
        },
      },
      getX: {
        name: "getX",
        example: "getX(150)",
        info: {
          en: "Returns the x-coordinate for a given y-coordinate on the curve",
          de: "Gibt die x-Koordinate für eine gegebene y-Koordinate auf der Kurve zurück",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      onMouseDown: {
        example:
          'onMouseDown(handleMouseDown); \n\nfunction handleMouseDown() { console.log("Mouse button pressed"); }',
        info: {
          en: "Defines a function to execute when the mouse button is pressed down on the element.",
          de: "Legt fest, welche Funktion beim Drücken der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseUp: {
        example:
          'onMouseUp(handleMouseUp); \n\nfunction handleMouseUp() { console.log("Mouse button released"); }',
        info: {
          en: "Defines a function to execute when the mouse button is released on the element.",
          de: "Legt fest, welche Funktion beim Loslassen der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseOver: {
        example:
          'onMouseOver(handleMouseOver); \n\nfunction handleMouseOver() { console.log("Mouse entered element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor enters the element.",
          de: "Legt fest, welche Funktion beim Überfahren des Elements mit der Maus ausgeführt wird.",
        },
      },
      onMouseOut: {
        example:
          'onMouseOut(handleMouseOut); \n\nfunction handleMouseOut() { console.log("Mouse left element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor leaves the element.",
          de: "Legt fest, welche Funktion beim Verlassen des Elements mit der Maus ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
      onDragStart: {
        example:
          'onDragStart(handleDragStart); \n\nfunction handleDragStart() { console.log("Started dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging starts",
          de: "Setzt eine Callback-Funktion, die beim Start des Ziehens ausgeführt wird",
        },
      },
      onDrag: {
        example:
          'onDrag(handleDrag); \n\nfunction handleDrag() { console.log("Element is being dragged"); }',
        info: {
          en: "Sets a callback function that is executed while the element is being dragged",
          de: "Setzt eine Callback-Funktion, die während des Ziehens des Elements ausgeführt wird",
        },
      },
      onDragEnd: {
        example:
          'onDragEnd(handleDragEnd); \n\nfunction handleDragEnd() { console.log("Stopped dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging ends",
          de: "Setzt eine Callback-Funktion, die beim Ende des Ziehens ausgeführt wird",
        },
      },
    },
  };

  constructor(points = [], color = 0x000000, thickness = 2, tension = 0) {
    super(points, color, thickness);
    this._tension = tension;
    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  setTension(tension) {
    this._tension = tension;
    this._draw();
  }

  _draw() {
    if (!this._group) return;
    if (this._pathElement) this._pathElement.remove();
    if (this._fillElement) this._fillElement.remove();
    this._fillElement = null;

    if (this.points.length < 2) return;

    // Catmull-Rom to cubic Bézier conversion
    const pts = this.points;
    const f = (1 - this._tension) / 6;
    let d = `M ${pts[0][0]},${pts[0][1]}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1[0] + (p2[0] - p0[0]) * f;
      const cp1y = p1[1] + (p2[1] - p0[1]) * f;
      const cp2x = p2[0] - (p3[0] - p1[0]) * f;
      const cp2y = p2[1] - (p3[1] - p1[1]) * f;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }

    const [x0, y0] = pts[0];
    const [xn, yn] = pts[pts.length - 1];
    const isClosed = x0 === xn && y0 === yn;

    if (this._fillColor !== null) {
      this._fillElement = this._group
        .path(isClosed ? d + " Z" : d)
        .fill(colorToHex(this._fillColor))
        .stroke("none");
    }

    this._pathElement = this._group
      .path(d)
      .fill("none")
      .stroke({
        color: colorToHex(this._color),
        width: this._thickness,
      });
  }

  _bezierPoint(t, p0, p1, p2, p3) {
    const u = 1 - t;
    return (
      u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
    );
  }

  getY(x) {
    if (this.points.length < 2) return null;
    const sortedPoints = [...this.points].sort((a, b) => a[0] - b[0]);
    const f = (1 - this._tension) / 6;

    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const p0 = sortedPoints[i === 0 ? i : i - 1];
      const p1 = sortedPoints[i];
      const p2 = sortedPoints[i + 1];
      const p3 = sortedPoints[i + 2] || p2;

      const cp1x = p1[0] + (p2[0] - p0[0]) * f;
      const cp1y = p1[1] + (p2[1] - p0[1]) * f;
      const cp2x = p2[0] - (p3[0] - p1[0]) * f;
      const cp2y = p2[1] - (p3[1] - p1[1]) * f;

      if (p1[0] <= x && x <= p2[0]) {
        // Binary search for parameter t
        let lower = 0,
          upper = 1;
        const tolerance = 0.0001;
        while (upper - lower > tolerance) {
          const t = (lower + upper) / 2;
          const cx = this._bezierPoint(t, p1[0], cp1x, cp2x, p2[0]);
          if (cx < x) lower = t;
          else upper = t;
        }
        const t = (lower + upper) / 2;
        return this._bezierPoint(t, p1[1], cp1y, cp2y, p2[1]);
      }
    }
    return null;
  }

  getX(y) {
    if (this.points.length < 2) return null;
    const results = [];
    const sortedPoints = [...this.points].sort((a, b) => a[0] - b[0]);
    const f = (1 - this._tension) / 6;

    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const p0 = sortedPoints[i === 0 ? i : i - 1];
      const p1 = sortedPoints[i];
      const p2 = sortedPoints[i + 1];
      const p3 = sortedPoints[i + 2] || p2;

      const cp1x = p1[0] + (p2[0] - p0[0]) * f;
      const cp1y = p1[1] + (p2[1] - p0[1]) * f;
      const cp2x = p2[0] - (p3[0] - p1[0]) * f;
      const cp2y = p2[1] - (p3[1] - p1[1]) * f;

      // Newton-Raphson search with multiple start points to find all roots
      const startPoints = [0, 0.25, 0.5, 0.75, 1];
      const foundTValues = new Set();
      for (const startT of startPoints) {
        let t = startT;
        const tolerance = 0.0001;
        let iterations = 0;
        while (iterations < 50) {
          const currentY = this._bezierPoint(t, p1[1], cp1y, cp2y, p2[1]);
          if (Math.abs(currentY - y) < tolerance) {
            let isNew = true;
            for (const ex of foundTValues) {
              if (Math.abs(ex - t) < 0.01) {
                isNew = false;
                break;
              }
            }
            if (isNew && t >= 0 && t <= 1) {
              foundTValues.add(t);
              results.push(this._bezierPoint(t, p1[0], cp1x, cp2x, p2[0]));
            }
            break;
          }
          const dt = 0.001;
          const y1 = this._bezierPoint(t - dt, p1[1], cp1y, cp2y, p2[1]);
          const y2 = this._bezierPoint(t + dt, p1[1], cp1y, cp2y, p2[1]);
          const derivative = (y2 - y1) / (2 * dt);
          if (Math.abs(derivative) < 0.0001) {
            let lo = 0,
              hi = 1;
            for (let j = 0; j < 20; j++) {
              const mid = (lo + hi) / 2;
              const bY = this._bezierPoint(mid, p1[1], cp1y, cp2y, p2[1]);
              if (bY < y) lo = mid;
              else hi = mid;
            }
            t = (lo + hi) / 2;
          } else {
            t = t - (currentY - y) / derivative;
            t = Math.max(0, Math.min(1, t));
          }
          iterations++;
        }
      }
    }

    if (results.length === 0) return null;
    if (results.length === 1) return results[0];
    results.sort((a, b) => a - b);
    const unique = [];
    for (let i = 0; i < results.length; i++) {
      if (i === 0 || Math.abs(results[i] - results[i - 1]) > 1) {
        unique.push(results[i]);
      }
    }
    return unique.length === 1 ? unique[0] : unique;
  }
};

// ============================================================================
// Arrow
// ============================================================================

SvgJSEdu.Arrow = class Arrow extends SvgJSElement {
  static serializationMap = {
    description: {
      de: "Pfeil mit Linie und Spitze",
      en: "Arrow with line and head",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myArrow = new Arrow(0, 0, 100, 100, 0xff0000, 2, 10, 6);",
    constructor: {
      startX: {
        name: "startX",
        info: {
          en: "X start coordinate of the line",
          de: "X-Startkoordinate der Linie",
        },
      },
      startY: {
        name: "startY",
        info: {
          en: "Y start coordinate of the line",
          de: "Y-Startkoordinate der Linie",
        },
      },
      endX: {
        name: "endX",
        info: {
          en: "X end coordinate of the line",
          de: "X-Endkoordinate der Linie",
        },
      },
      endY: {
        name: "endY",
        info: {
          en: "Y end coordinate of the line",
          de: "Y-Endkoordinate der Linie",
        },
      },
      color: {
        name: "color",
        info: {
          en: "Color of the line in hexadecimal format (e.g. 0xff0000)",
          de: "Farbe der Linie im Hexadezimalformat (z.B. 0xff0000)",
        },
      },
      thickness: {
        name: "thickness",
        info: {
          en: "Line thickness in pixels",
          de: "Linienstärke in Pixeln",
        },
      },
      arrowHeadLength: {
        name: "arrowHeadLength",
        info: {
          en: "Length of the arrow head in pixels",
          de: "Länge der Pfeilspitze in Pixeln",
        },
      },
      arrowHeadWidth: {
        name: "arrowHeadWidth",
        info: {
          en: "Width of the arrow head in pixels",
          de: "Breite der Pfeilspitze in Pixeln",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      rotation: {
        name: "rotation",
        info: {
          en: "Rotation of the element in degrees",
          de: "Drehung des Elements in Grad",
        },
        example: "rotation = 45",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = false",
      },
      alpha: {
        name: "alpha",
        info: {
          en: "Transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
        example: "alpha = 0.5",
      },
    },
    methods: {
      setColor: {
        example: "setColor(0xff0000)",
        info: {
          en: "Changes the color of the line",
          de: "Ändert die Farbe der Linie",
        },
      },
      setThickness: {
        example: "setThickness(2)",
        info: {
          en: "Sets the line thickness",
          de: "Setzt die Linienstärke",
        },
      },
      setStrokeDash: {
        example: "setStrokeDash([5, 5])",
        info: {
          en: "Creates a dashed line with pattern",
          de: "Erstellt eine gestrichelte Linie mit Muster",
        },
      },
      setStart: {
        example: "setStart(0, 0)",
        info: {
          en: "Sets the start point of the line",
          de: "Setzt den Startpunkt der Linie",
        },
      },
      setEnd: {
        example: "setEnd(100, 100)",
        info: {
          en: "Sets the end point of the line",
          de: "Setzt den Endpunkt der Linie",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      setOutline: {
        example: "setOutline(0.5, 0xffffff)",
        info: {
          en: "Enables outline with thickness and color",
          de: "Aktiviert Kontur mit Stärke und Farbe",
        },
      },
      removeOutline: {
        example: "removeOutline()",
        info: {
          en: "Disables the outline",
          de: "Deaktiviert die Kontur",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      onMouseDown: {
        example:
          'onMouseDown(handleMouseDown); \n\nfunction handleMouseDown() { console.log("Mouse button pressed"); }',
        info: {
          en: "Defines a function to execute when the mouse button is pressed down on the element.",
          de: "Legt fest, welche Funktion beim Drücken der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseUp: {
        example:
          'onMouseUp(handleMouseUp); \n\nfunction handleMouseUp() { console.log("Mouse button released"); }',
        info: {
          en: "Defines a function to execute when the mouse button is released on the element.",
          de: "Legt fest, welche Funktion beim Loslassen der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseOver: {
        example:
          'onMouseOver(handleMouseOver); \n\nfunction handleMouseOver() { console.log("Mouse entered element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor enters the element.",
          de: "Legt fest, welche Funktion beim Überfahren des Elements mit der Maus ausgeführt wird.",
        },
      },
      onMouseOut: {
        example:
          'onMouseOut(handleMouseOut); \n\nfunction handleMouseOut() { console.log("Mouse left element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor leaves the element.",
          de: "Legt fest, welche Funktion beim Verlassen des Elements mit der Maus ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
      onDragStart: {
        example:
          'onDragStart(handleDragStart); \n\nfunction handleDragStart() { console.log("Started dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging starts",
          de: "Setzt eine Callback-Funktion, die beim Start des Ziehens ausgeführt wird",
        },
      },
      onDrag: {
        example:
          'onDrag(handleDrag); \n\nfunction handleDrag() { console.log("Element is being dragged"); }',
        info: {
          en: "Sets a callback function that is executed while the element is being dragged",
          de: "Setzt eine Callback-Funktion, die während des Ziehens des Elements ausgeführt wird",
        },
      },
      onDragEnd: {
        example:
          'onDragEnd(handleDragEnd); \n\nfunction handleDragEnd() { console.log("Stopped dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging ends",
          de: "Setzt eine Callback-Funktion, die beim Ende des Ziehens ausgeführt wird",
        },
      },
    },
  };

  constructor(
    startX = 0,
    startY = 0,
    endX = 100,
    endY = 0,
    color = 0x000000,
    thickness = 2,
    arrowLength = 10,
    arrowWidth = 6,
  ) {
    super();
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;
    this._color = color;
    this._thickness = thickness;
    this._arrowLength = arrowLength;
    this._arrowWidth = arrowWidth;
    this._lineElement = null;
    this._headElement = null;

    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (!this._group) return;
    if (this._lineElement) this._lineElement.remove();
    if (this._headElement) this._headElement.remove();

    const dx = this._endX - this._startX;
    const dy = this._endY - this._startY;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    const ux = dx / len;
    const uy = dy / len;

    const lineEndX = this._endX - ux * this._arrowLength;
    const lineEndY = this._endY - uy * this._arrowLength;

    this._lineElement = this._group
      .line(this._startX, this._startY, lineEndX, lineEndY)
      .stroke({
        color: colorToHex(this._color),
        width: this._thickness,
      });

    const halfWidth = this._arrowWidth / 2;
    const perpX = -uy * halfWidth;
    const perpY = ux * halfWidth;

    const points = [
      [this._endX, this._endY],
      [lineEndX + perpX, lineEndY + perpY],
      [lineEndX - perpX, lineEndY - perpY],
    ];

    this._headElement = this._group
      .polygon(points.flat())
      .fill(colorToHex(this._color))
      .stroke("none");
  }

  get startX() {
    return this._startX;
  }

  set startX(value) {
    this._startX = value;
    this._draw();
  }

  get startY() {
    return this._startY;
  }

  set startY(value) {
    this._startY = value;
    this._draw();
  }

  get endX() {
    return this._endX;
  }

  set endX(value) {
    this._endX = value;
    this._draw();
  }

  get endY() {
    return this._endY;
  }

  set endY(value) {
    this._endY = value;
    this._draw();
  }

  setStart(x, y) {
    this._startX = x;
    this._startY = y;
    this._draw();
    return this;
  }

  setEnd(x, y) {
    this._endX = x;
    this._endY = y;
    this._draw();
    return this;
  }

  setColor(color) {
    this._color = color;
    this._draw();
    return this;
  }

  setThickness(thickness) {
    this._thickness = thickness;
    this._draw();
    return this;
  }

  setArrowLength(length) {
    this._arrowLength = length;
    this._draw();
    return this;
  }

  setArrowWidth(width) {
    this._arrowWidth = width;
    this._draw();
    return this;
  }

  setAlpha(alpha) {
    this._alpha = Math.max(0, Math.min(1, alpha));
    this.alpha = this._alpha;
    return this;
  }
};

// ============================================================================
// Parallelogram
// ============================================================================

SvgJSEdu.Parallelogram = class Parallelogram extends SvgJSElement {
  static serializationMap = {
    description: {
      de: "Parallelogramm aus zwei Vektoren",
      en: "Parallelogram from two vectors",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      "let myParallelogram = new Parallelogram(0, 0, 100, 0, 50, 50, 0x00ff00);",
    constructor: {
      originX: {
        name: "originX",
        info: {
          en: "X coordinate of the origin point",
          de: "X-Koordinate des Ursprungspunkts",
        },
      },
      originY: {
        name: "originY",
        info: {
          en: "Y coordinate of the origin point",
          de: "Y-Koordinate des Ursprungspunkts",
        },
      },
      vector1X: {
        name: "vector1X",
        info: {
          en: "X coordinate of the first vector endpoint",
          de: "X-Koordinate des ersten Vektorendpunkts",
        },
      },
      vector1Y: {
        name: "vector1Y",
        info: {
          en: "Y coordinate of the first vector endpoint",
          de: "Y-Koordinate des ersten Vektorendpunkts",
        },
      },
      vector2X: {
        name: "vector2X",
        info: {
          en: "X coordinate of the second vector endpoint",
          de: "X-Koordinate des zweiten Vektorendpunkts",
        },
      },
      vector2Y: {
        name: "vector2Y",
        info: {
          en: "Y coordinate of the second vector endpoint",
          de: "Y-Koordinate des zweiten Vektorendpunkts",
        },
      },
      fillColor: {
        name: "fillColor",
        info: {
          en: "Fill color in hexadecimal format (e.g. 0x00ff00)",
          de: "Füllfarbe im Hexadezimalformat (z.B. 0x00ff00)",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = false",
      },
      alpha: {
        name: "alpha",
        info: {
          en: "Sets the transparency of the parallelogram (0.0 to 1.0)",
          de: "Setzt die Transparenz des Parallelogramms (0.0 bis 1.0)",
        },
        example: "alpha = 0.5",
      },
    },
    methods: {
      setFillColor: {
        name: "setFillColor",
        info: {
          en: "Sets the fill color of the parallelogram",
          de: "Setzt die Füllfarbe des Parallelogramms",
        },
        example: "setFillColor(0xff0000)",
      },
      setAlpha: {
        name: "setAlpha",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
        example: "setAlpha(0.5)",
      },
      setOrigin: {
        name: "setOrigin",
        info: {
          en: "Sets the origin point of the parallelogram",
          de: "Setzt den Ursprungspunkt des Parallelogramms",
        },
        example: "setOrigin(50, 50)",
      },
      setVector1: {
        name: "setVector1",
        info: {
          en: "Sets the endpoint of the first vector",
          de: "Setzt den Endpunkt des ersten Vektors",
        },
        example: "setVector1(150, 100)",
      },
      setVector2: {
        name: "setVector2",
        info: {
          en: "Sets the endpoint of the second vector",
          de: "Setzt den Endpunkt des zweiten Vektors",
        },
        example: "setVector2(100, 150)",
      },
      getResultantEndpoint: {
        name: "getResultantEndpoint",
        info: {
          en: "Returns the endpoint of the resultant vector",
          de: "Gibt den Endpunkt des resultierenden Vektors zurück",
        },
        example: "getResultantEndpoint()",
      },
      showVectors: {
        name: "showVectors",
        info: {
          en: "Shows/hides the vector arrows",
          de: "Zeigt/versteckt die Vektorpfeile",
        },
        example: "showVectors(true)",
      },
      showResultant: {
        name: "showResultant",
        info: {
          en: "Shows/hides the resultant vector arrow",
          de: "Zeigt/versteckt den resultierenden Vektorpfeil",
        },
        example: "showResultant(true)",
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      onMouseDown: {
        example:
          'onMouseDown(handleMouseDown); \n\nfunction handleMouseDown() { console.log("Mouse button pressed"); }',
        info: {
          en: "Defines a function to execute when the mouse button is pressed down on the element.",
          de: "Legt fest, welche Funktion beim Drücken der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseUp: {
        example:
          'onMouseUp(handleMouseUp); \n\nfunction handleMouseUp() { console.log("Mouse button released"); }',
        info: {
          en: "Defines a function to execute when the mouse button is released on the element.",
          de: "Legt fest, welche Funktion beim Loslassen der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseOver: {
        example:
          'onMouseOver(handleMouseOver); \n\nfunction handleMouseOver() { console.log("Mouse entered element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor enters the element.",
          de: "Legt fest, welche Funktion beim Überfahren des Elements mit der Maus ausgeführt wird.",
        },
      },
      onMouseOut: {
        example:
          'onMouseOut(handleMouseOut); \n\nfunction handleMouseOut() { console.log("Mouse left element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor leaves the element.",
          de: "Legt fest, welche Funktion beim Verlassen des Elements mit der Maus ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
      onDragStart: {
        example:
          'onDragStart(handleDragStart); \n\nfunction handleDragStart() { console.log("Started dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging starts",
          de: "Setzt eine Callback-Funktion, die beim Start des Ziehens ausgeführt wird",
        },
      },
      onDrag: {
        example:
          'onDrag(handleDrag); \n\nfunction handleDrag() { console.log("Element is being dragged"); }',
        info: {
          en: "Sets a callback function that is executed while the element is being dragged",
          de: "Setzt eine Callback-Funktion, die während des Ziehens des Elements ausgeführt wird",
        },
      },
      onDragEnd: {
        example:
          'onDragEnd(handleDragEnd); \n\nfunction handleDragEnd() { console.log("Stopped dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging ends",
          de: "Setzt eine Callback-Funktion, die beim Ende des Ziehens ausgeführt wird",
        },
      },
    },
  };

  constructor(
    originX,
    originY,
    vector1X,
    vector1Y,
    vector2X,
    vector2Y,
    fillColor = 0x00ff00,
  ) {
    super();

    this._originX = originX;
    this._originY = originY;
    this._vector1X = vector1X;
    this._vector1Y = vector1Y;
    this._vector2X = vector2X;
    this._vector2Y = vector2Y;

    this._fillColor = fillColor;
    this._alpha = 1.0;

    this._showVectors = false;
    this._showResultant = false;

    this._shapeElement = null;
    this._vector1Arrow = null;
    this._vector2Arrow = null;
    this._resultantArrow = null;

    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (!this._group) return;
    if (this._shapeElement) this._shapeElement.remove();

    const p1 = { x: this._originX, y: this._originY };
    const p2 = { x: this._vector1X, y: this._vector1Y };
    const p4 = this.getResultantEndpoint();
    const p3 = { x: this._vector2X, y: this._vector2Y };

    this._shapeElement = this._group.polygon([
      p1.x,
      p1.y,
      p2.x,
      p2.y,
      p4.x,
      p4.y,
      p3.x,
      p3.y,
    ]);
    this._shapeElement
      .fill(colorToHex(this._fillColor))
      .opacity(this._alpha)
      .stroke({ width: 0 });

    this._updateVectorArrows();
  }

  _updateVectorArrows() {
    if (this._vector1Arrow) {
      this._vector1Arrow.remove();
      this._vector1Arrow = null;
    }
    if (this._vector2Arrow) {
      this._vector2Arrow.remove();
      this._vector2Arrow = null;
    }
    if (this._resultantArrow) {
      this._resultantArrow.remove();
      this._resultantArrow = null;
    }

    if (this._showVectors) {
      this._vector1Arrow = new SvgJSEdu.Arrow(
        this._originX,
        this._originY,
        this._vector1X,
        this._vector1Y,
        0xff0000,
        3,
        15,
        10,
      );
      this._group.add(this._vector1Arrow._group);

      this._vector2Arrow = new SvgJSEdu.Arrow(
        this._originX,
        this._originY,
        this._vector2X,
        this._vector2Y,
        0x0000ff,
        3,
        15,
        10,
      );
      this._group.add(this._vector2Arrow._group);
    }

    if (this._showResultant) {
      const resultant = this.getResultantEndpoint();
      this._resultantArrow = new SvgJSEdu.Arrow(
        this._originX,
        this._originY,
        resultant.x,
        resultant.y,
        0x000000,
        4,
        20,
        12,
      );
      this._group.add(this._resultantArrow._group);
    }
  }

  getResultantEndpoint() {
    const v1 = {
      x: this._vector1X - this._originX,
      y: this._vector1Y - this._originY,
    };
    const v2 = {
      x: this._vector2X - this._originX,
      y: this._vector2Y - this._originY,
    };

    return {
      x: this._originX + v1.x + v2.x,
      y: this._originY + v1.y + v2.y,
    };
  }

  setFillColor(color) {
    this._fillColor = color;
    if (this._shapeElement) this._shapeElement.fill(colorToHex(color));
    return this;
  }

  setAlpha(alpha) {
    this._alpha = Math.max(0, Math.min(1, alpha));
    if (this._shapeElement) this._shapeElement.opacity(this._alpha);
    return this;
  }

  setOrigin(x, y) {
    this._originX = x;
    this._originY = y;
    this._draw();
    return this;
  }

  setVector1(x, y) {
    this._vector1X = x;
    this._vector1Y = y;
    this._draw();
    return this;
  }

  setVector2(x, y) {
    this._vector2X = x;
    this._vector2Y = y;
    this._draw();
    return this;
  }

  showVectors(show) {
    this._showVectors = show;
    this._updateVectorArrows();
    return this;
  }

  showResultant(show) {
    this._showResultant = show;
    this._updateVectorArrows();
    return this;
  }
};

// ============================================================================
// PointLabel
// ============================================================================

SvgJSEdu.PointLabel = class PointLabel extends SvgJSElement {
  static serializationMap = {
    description: {
      de: "Beschriftung für einen Punkt",
      en: "Label for a point",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      'let myPointLabel = new PointLabel(100, 100, "P", 15, -15, "Arial", 16, 0x000000);',
    constructor: {
      pointX: {
        name: "pointX",
        info: {
          en: "X coordinate of the reference point",
          de: "X-Koordinate des Referenzpunkts",
        },
      },
      pointY: {
        name: "pointY",
        info: {
          en: "Y coordinate of the reference point",
          de: "Y-Koordinate des Referenzpunkts",
        },
      },
      label: {
        name: "label",
        info: {
          en: "Text to display as label (supports <b>, <i>, <sub> and <sup> tags, also combined and nested)",
          de: "Text, der als Beschriftung angezeigt wird (unterstützt die Tags <b>, <i>, <sub> und <sup>, auch kombiniert und verschachtelt)",
        },
      },
      offsetX: {
        name: "offsetX",
        info: {
          en: "Horizontal offset from the reference point",
          de: "Horizontaler Versatz vom Referenzpunkt",
        },
      },
      offsetY: {
        name: "offsetY",
        info: {
          en: "Vertical offset from the reference point",
          de: "Vertikaler Versatz vom Referenzpunkt",
        },
      },
      font: {
        name: "font",
        info: {
          en: "Font family for the text",
          de: "Schriftart für den Text",
        },
      },
      fontSize: {
        name: "fontSize",
        info: {
          en: "Font size for the text",
          de: "Schriftgröße für den Text",
        },
      },
      textColor: {
        name: "textColor",
        info: {
          en: "Color of the text in hexadecimal format",
          de: "Farbe des Textes im Hexadezimalformat",
        },
      },
      backgroundColor: {
        name: "backgroundColor",
        info: {
          en: "Background color for the label (optional)",
          de: "Hintergrundfarbe für die Beschriftung (optional)",
        },
      },
      padding: {
        name: "padding",
        info: {
          en: "Padding around the text",
          de: "Innenabstand um den Text",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = false",
      },
      alpha: {
        name: "alpha",
        info: {
          en: "Sets the transparency of the object (0.0 to 1.0)",
          de: "Setzt die Transparenz des Objekts (0.0 bis 1.0)",
        },
        example: "alpha = 0.5",
      },
    },
    methods: {
      setText: {
        example: 'setText("<b>F</b><sub>res</sub> = <i>m</i> · <i>a</i>")',
        info: {
          en: "Changes the text of the label (supports <b>, <i>, <sub> and <sup> tags)",
          de: "Ändert den Text der Beschriftung (unterstützt die Tags <b>, <i>, <sub> und <sup>)",
        },
      },
      setTextColor: {
        example: "setTextColor(0xff0000)",
        info: {
          en: "Changes the color of the text",
          de: "Ändert die Farbe des Textes",
        },
      },
      setFontSize: {
        example: "setFontSize(16)",
        info: {
          en: "Sets the font size of the text",
          de: "Setzt die Schriftgröße des Textes",
        },
      },
      setPoint: {
        example: "setPoint(100, 100)",
        info: {
          en: "Sets the reference point position",
          de: "Setzt die Position des Referenzpunkts",
        },
      },
      setOffset: {
        example: "setOffset(10, -5)",
        info: {
          en: "Sets the offset from the reference point",
          de: "Setzt den Versatz vom Referenzpunkt",
        },
      },
      setBackgroundColor: {
        example: "setBackgroundColor(0xffffff)",
        info: {
          en: "Sets the background color of the label",
          de: "Setzt die Hintergrundfarbe der Beschriftung",
        },
      },
      setPadding: {
        example: "setPadding(5)",
        info: {
          en: "Sets the padding around the text",
          de: "Setzt den Innenabstand um den Text",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      onMouseDown: {
        example:
          'onMouseDown(handleMouseDown); \n\nfunction handleMouseDown() { console.log("Mouse button pressed"); }',
        info: {
          en: "Defines a function to execute when the mouse button is pressed down on the element.",
          de: "Legt fest, welche Funktion beim Drücken der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseUp: {
        example:
          'onMouseUp(handleMouseUp); \n\nfunction handleMouseUp() { console.log("Mouse button released"); }',
        info: {
          en: "Defines a function to execute when the mouse button is released on the element.",
          de: "Legt fest, welche Funktion beim Loslassen der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseOver: {
        example:
          'onMouseOver(handleMouseOver); \n\nfunction handleMouseOver() { console.log("Mouse entered element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor enters the element.",
          de: "Legt fest, welche Funktion beim Überfahren des Elements mit der Maus ausgeführt wird.",
        },
      },
      onMouseOut: {
        example:
          'onMouseOut(handleMouseOut); \n\nfunction handleMouseOut() { console.log("Mouse left element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor leaves the element.",
          de: "Legt fest, welche Funktion beim Verlassen des Elements mit der Maus ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
      onDragStart: {
        example:
          'onDragStart(handleDragStart); \n\nfunction handleDragStart() { console.log("Started dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging starts",
          de: "Setzt eine Callback-Funktion, die beim Start des Ziehens ausgeführt wird",
        },
      },
      onDrag: {
        example:
          'onDrag(handleDrag); \n\nfunction handleDrag() { console.log("Element is being dragged"); }',
        info: {
          en: "Sets a callback function that is executed while the element is being dragged",
          de: "Setzt eine Callback-Funktion, die während des Ziehens des Elements ausgeführt wird",
        },
      },
      onDragEnd: {
        example:
          'onDragEnd(handleDragEnd); \n\nfunction handleDragEnd() { console.log("Stopped dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging ends",
          de: "Setzt eine Callback-Funktion, die beim Ende des Ziehens ausgeführt wird",
        },
      },
    },
  };

  constructor(
    pointX,
    pointY,
    label,
    offsetX = 10,
    offsetY = -10,
    font = "Arial",
    fontSize = 12,
    textColor = 0x000000,
    backgroundColor = null,
    padding = 2,
  ) {
    super();

    this._pointX = pointX;
    this._pointY = pointY;
    this._text = label;
    this._offsetX = offsetX;
    this._offsetY = offsetY;
    this._fontFamily = font;
    this._fontSize = fontSize;
    this._textColor = textColor;
    this._backgroundColor = backgroundColor;
    this._padding = padding;
    this._alpha = 1.0;

    this._backgroundElement = null;
    this._textElement = null;

    this._createTextElement();

    requestAnimationFrame(() => {
      this._updatePosition();
    });

    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _parseHTMLText(htmlText) {
    const segments = [];
    const tagRegex = /<\/?(\w+)>/g;
    let lastIndex = 0;
    let bold = false;
    let italic = false;
    let type = "normal";
    const typeStack = [];
    let match;

    while ((match = tagRegex.exec(htmlText)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          text: htmlText.substring(lastIndex, match.index),
          type: type,
          bold: bold,
          italic: italic,
        });
      }

      const isClosing = match[0].startsWith("</");
      const tagName = match[1].toLowerCase();

      if (!isClosing) {
        if (tagName === "b") bold = true;
        else if (tagName === "i") italic = true;
        else if (tagName === "sub" || tagName === "sup") {
          typeStack.push(type);
          type = tagName;
        }
      } else {
        if (tagName === "b") bold = false;
        else if (tagName === "i") italic = false;
        else if (tagName === "sub" || tagName === "sup") {
          type = typeStack.pop() || "normal";
        }
      }

      lastIndex = tagRegex.lastIndex;
    }

    if (lastIndex < htmlText.length) {
      segments.push({
        text: htmlText.substring(lastIndex),
        type: type,
        bold: bold,
        italic: italic,
      });
    }

    return segments;
  }

  _createTextElement() {
    if (this._textElement) {
      this._textElement.remove();
      this._textElement = null;
    }
    if (this._backgroundElement) {
      this._backgroundElement.remove();
      this._backgroundElement = null;
    }

    const segments = this._parseHTMLText(this._text);
    const self = this;

    this._textElement = this._group.text(function (add) {
      segments.forEach((segment) => {
        const size =
          segment.type === "normal" ? self._fontSize : self._fontSize * 0.7;

        const tspan = add.tspan(segment.text).font({
          family: self._fontFamily,
          size: size,
          weight: segment.bold ? "bold" : "normal",
          style: segment.italic ? "italic" : "normal",
        });

        if (segment.type === "sub") {
          tspan.attr("baseline-shift", "sub");
        } else if (segment.type === "sup") {
          tspan.attr("baseline-shift", "super");
        }
      });
    });

    this._textElement
      .fill(colorToHex(this._textColor))
      .font({
        family: this._fontFamily,
        size: this._fontSize,
        anchor: "middle",
      })
      .attr("dominant-baseline", "central");
  }

  _updatePosition() {
    if (!this._textElement) return;

    const posX = this._pointX + this._offsetX;
    const posY = this._pointY + this._offsetY;

    this._textElement.attr("x", posX);
    this._textElement.attr("y", posY);

    this._drawBackground();
  }

  _drawBackground() {
    if (this._backgroundElement) {
      this._backgroundElement.remove();
      this._backgroundElement = null;
    }

    if (this._backgroundColor !== null && this._textElement) {
      try {
        const bbox = this._textElement.bbox();

        this._backgroundElement = this._group
          .rect(bbox.width + 2 * this._padding, bbox.height + 2 * this._padding)
          .move(bbox.x - this._padding, bbox.y - this._padding)
          .fill(colorToHex(this._backgroundColor))
          .opacity(this._alpha);

        this._backgroundElement.back();
      } catch (e) {
        // bbox() may fail if the element is not visible
      }
    }

    if (this._textElement) this._textElement.opacity(this._alpha);
  }

  setText(text) {
    this._text = text;
    this._createTextElement();
    requestAnimationFrame(() => {
      this._updatePosition();
    });
    return this;
  }

  setTextColor(color) {
    this._textColor = color;
    if (this._textElement) {
      this._textElement.fill(colorToHex(color));
    }
    return this;
  }

  setFontSize(size) {
    this._fontSize = size;
    this._createTextElement();
    requestAnimationFrame(() => {
      this._updatePosition();
    });
    return this;
  }

  setPoint(x, y) {
    this._pointX = x;
    this._pointY = y;
    this._updatePosition();
    return this;
  }

  setOffset(offsetX, offsetY) {
    this._offsetX = offsetX;
    this._offsetY = offsetY;
    this._updatePosition();
    return this;
  }

  setBackgroundColor(color) {
    this._backgroundColor = color;
    this._updatePosition();
    return this;
  }

  setPadding(padding) {
    this._padding = padding;
    this._updatePosition();
    return this;
  }

  setAlpha(alpha) {
    this._alpha = Math.max(0, Math.min(1, alpha));
    this._drawBackground();
    return this;
  }
};

// ============================================================================
// LineLabel
// ============================================================================

SvgJSEdu.LineLabel = class LineLabel extends SvgJSElement {
  static serializationMap = {
    description: {
      de: "Beschriftung für eine Strecke",
      en: "Label for a line segment",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      'let myLineLabel = new LineLabel(0, 0, 100, 50, "AB", 15, "Arial", 16, 0x000000);',
    constructor: {
      startX: {
        name: "startX",
        info: {
          en: "X coordinate of the line start point",
          de: "X-Koordinate des Startpunkts der Strecke",
        },
      },
      startY: {
        name: "startY",
        info: {
          en: "Y coordinate of the line start point",
          de: "Y-Koordinate des Startpunkts der Strecke",
        },
      },
      endX: {
        name: "endX",
        info: {
          en: "X coordinate of the line end point",
          de: "X-Koordinate des Endpunkts der Strecke",
        },
      },
      endY: {
        name: "endY",
        info: {
          en: "Y coordinate of the line end point",
          de: "Y-Koordinate des Endpunkts der Strecke",
        },
      },
      label: {
        name: "label",
        info: {
          en: "Text to display as label (supports <b>, <i>, <sub> and <sup> tags, also combined and nested)",
          de: "Text, der als Beschriftung angezeigt wird (unterstützt die Tags <b>, <i>, <sub> und <sup>, auch kombiniert und verschachtelt)",
        },
      },
      distance: {
        name: "distance",
        info: {
          en: "Orthogonal distance from the line to the label",
          de: "Orthogonaler Abstand von der Strecke zur Beschriftung",
        },
      },
      font: {
        name: "font",
        info: {
          en: "Font family for the text",
          de: "Schriftart für den Text",
        },
      },
      fontSize: {
        name: "fontSize",
        info: {
          en: "Font size for the text",
          de: "Schriftgröße für den Text",
        },
      },
      textColor: {
        name: "textColor",
        info: {
          en: "Color of the text in hexadecimal format",
          de: "Farbe des Textes im Hexadezimalformat",
        },
      },
      backgroundColor: {
        name: "backgroundColor",
        info: {
          en: "Background color for the label (optional)",
          de: "Hintergrundfarbe für die Beschriftung (optional)",
        },
      },
      padding: {
        name: "padding",
        info: {
          en: "Padding around the text",
          de: "Innenabstand um den Text",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = false",
      },
      alpha: {
        name: "alpha",
        info: {
          en: "Sets the transparency of the object (0.0 to 1.0)",
          de: "Setzt die Transparenz des Objekts (0.0 bis 1.0)",
        },
        example: "alpha = 0.5",
      },
    },
    methods: {
      setText: {
        example: 'setText("<b>F</b><sub>res</sub> = <i>m</i> · <i>a</i>")',
        info: {
          en: "Changes the text of the label (supports <b>, <i>, <sub> and <sup> tags)",
          de: "Ändert den Text der Beschriftung (unterstützt die Tags <b>, <i>, <sub> und <sup>)",
        },
      },
      setTextColor: {
        example: "setTextColor(0xff0000)",
        info: {
          en: "Changes the color of the text",
          de: "Ändert die Farbe des Textes",
        },
      },
      setFontSize: {
        example: "setFontSize(16)",
        info: {
          en: "Sets the font size of the text",
          de: "Setzt die Schriftgröße des Textes",
        },
      },
      setDistance: {
        example: "setDistance(15)",
        info: {
          en: "Sets the orthogonal distance from the line",
          de: "Setzt den orthogonalen Abstand von der Strecke",
        },
      },
      setStart: {
        example: "setStart(100, 100)",
        info: {
          en: "Sets the start point of the line",
          de: "Setzt den Startpunkt der Strecke",
        },
      },
      setEnd: {
        example: "setEnd(200, 150)",
        info: {
          en: "Sets the end point of the line",
          de: "Setzt den Endpunkt der Strecke",
        },
      },
      setBackgroundColor: {
        example: "setBackgroundColor(0xffffff)",
        info: {
          en: "Sets the background color of the label",
          de: "Setzt die Hintergrundfarbe der Beschriftung",
        },
      },
      setPadding: {
        example: "setPadding(5)",
        info: {
          en: "Sets the padding around the text",
          de: "Setzt den Innenabstand um den Text",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      setFlipSide: {
        example: "setFlipSide(true)",
        info: {
          en: "Flips the label to the opposite side of the line",
          de: "Spiegelt die Beschriftung auf die gegenüberliegende Seite der Linie",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
    },
  };

  constructor(
    startX = 0,
    startY = 0,
    endX = 100,
    endY = 0,
    label = "",
    distance = 10,
    font = "Arial",
    fontSize = 12,
    textColor = 0x000000,
    backgroundColor = null,
    padding = 2,
  ) {
    super();
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;
    this._text = label;
    this._distance = distance;
    this._fontFamily = font;
    this._fontSize = fontSize;
    this._textColor = textColor;
    this._backgroundColor = backgroundColor;
    this._padding = padding;
    this._flipped = false;

    this._backgroundRect = null;
    this._textElement = null;

    this._createTextElement();

    // Deferred: bbox() requires rendered elements
    requestAnimationFrame(() => {
      this._updatePosition();
    });

    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _parseHTMLText(htmlText) {
    const segments = [];
    const tagRegex = /<\/?(\w+)>/g;
    let lastIndex = 0;
    let bold = false;
    let italic = false;
    let type = "normal";
    const typeStack = [];
    let match;

    while ((match = tagRegex.exec(htmlText)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          text: htmlText.substring(lastIndex, match.index),
          type: type,
          bold: bold,
          italic: italic,
        });
      }

      const isClosing = match[0].startsWith("</");
      const tagName = match[1].toLowerCase();

      if (!isClosing) {
        if (tagName === "b") bold = true;
        else if (tagName === "i") italic = true;
        else if (tagName === "sub" || tagName === "sup") {
          typeStack.push(type);
          type = tagName;
        }
      } else {
        if (tagName === "b") bold = false;
        else if (tagName === "i") italic = false;
        else if (tagName === "sub" || tagName === "sup") {
          type = typeStack.pop() || "normal";
        }
      }

      lastIndex = tagRegex.lastIndex;
    }

    if (lastIndex < htmlText.length) {
      segments.push({
        text: htmlText.substring(lastIndex),
        type: type,
        bold: bold,
        italic: italic,
      });
    }

    return segments;
  }

  _createTextElement() {
    if (this._textElement) {
      this._textElement.remove();
      this._textElement = null;
    }
    if (this._backgroundRect) {
      this._backgroundRect.remove();
      this._backgroundRect = null;
    }

    const segments = this._parseHTMLText(this._text);
    const self = this;

    // dy offsets for sub/sup, relative to baseline, in em
    const subDy = 0.4;
    const supDy = -0.5;

    this._textElement = this._group.text(function (add) {
      segments.forEach((segment, index) => {
        const size =
          segment.type === "normal" ? self._fontSize : self._fontSize * 0.7;

        const tspan = add.tspan(segment.text).font({
          family: self._fontFamily,
          size: size,
          weight: segment.bold ? "bold" : "normal",
          style: segment.italic ? "italic" : "normal",
        });

        if (segment.type === "sub") {
          tspan.attr("dy", subDy * self._fontSize + "px");
        } else if (segment.type === "sup") {
          tspan.attr("dy", supDy * self._fontSize + "px");
        }

        // Reset the next normal tspan back to baseline after sub/sup
        if (segment.type === "normal" && index > 0) {
          const prev = segments[index - 1];
          if (prev.type === "sub") {
            tspan.attr("dy", -subDy * self._fontSize + "px");
          } else if (prev.type === "sup") {
            tspan.attr("dy", -supDy * self._fontSize + "px");
          }
        }
      });
    });

    this._textElement
      .fill(colorToHex(this._textColor))
      .font({
        family: this._fontFamily,
        size: this._fontSize,
        anchor: "middle",
      })
      .attr("dominant-baseline", "central");
  }

  _updatePosition() {
    if (!this._textElement) return;

    const midX = (this._startX + this._endX) / 2;
    const midY = (this._startY + this._endY) / 2;

    const dx = this._endX - this._startX;
    const dy = this._endY - this._startY;
    const length = Math.sqrt(dx * dx + dy * dy);

    let offsetX = 0;
    let offsetY = 0;

    if (length > 0) {
      const unitX = dx / length;
      const unitY = dy / length;

      // Normal vector orthogonal to the line direction
      let normalX = -unitY;
      let normalY = unitX;

      // Flip normal when line points left, matching PixiJS behavior
      if (dx < 0) {
        normalX = -normalX;
        normalY = -normalY;
      }

      if (this._flipped) {
        normalX = -normalX;
        normalY = -normalY;
      }

      offsetX = normalX * this._distance;
      offsetY = normalY * this._distance;
    }

    const posX = midX + offsetX;
    const posY = midY + offsetY;

    this._textElement.attr("x", posX);
    this._textElement.attr("y", posY);

    this._drawBackground(posX, posY);
  }

  _drawBackground(posX, posY) {
    if (this._backgroundRect) {
      this._backgroundRect.remove();
      this._backgroundRect = null;
    }

    if (this._backgroundColor !== null && this._textElement) {
      try {
        const bbox = this._textElement.bbox();

        this._backgroundRect = this._group
          .rect(bbox.width + 2 * this._padding, bbox.height + 2 * this._padding)
          .fill(colorToHex(this._backgroundColor))
          .stroke("none")
          .move(bbox.x - this._padding, bbox.y - this._padding)
          .opacity(this._alpha);

        this._backgroundRect.back();
      } catch (e) {
        // bbox() may fail if the element is not visible
      }
    }
  }

  setText(text) {
    this._text = text;
    this._createTextElement();
    requestAnimationFrame(() => {
      this._updatePosition();
    });
    return this;
  }

  setTextColor(color) {
    this._textColor = color;
    if (this._textElement) {
      this._textElement.fill(colorToHex(color));
    }
    return this;
  }

  setFontSize(size) {
    this._fontSize = size;
    this._createTextElement();
    requestAnimationFrame(() => {
      this._updatePosition();
    });
    return this;
  }

  setDistance(distance) {
    this._distance = distance;
    this._updatePosition();
    return this;
  }

  setStart(x, y) {
    this._startX = x;
    this._startY = y;
    this._updatePosition();
    return this;
  }

  setEnd(x, y) {
    this._endX = x;
    this._endY = y;
    this._updatePosition();
    return this;
  }

  setBackgroundColor(color) {
    this._backgroundColor = color;
    this._updatePosition();
    return this;
  }

  setPadding(padding) {
    this._padding = padding;
    this._updatePosition();
    return this;
  }

  setFlipSide(flipped) {
    this._flipped = flipped;
    this._updatePosition();
    return this;
  }

  // ---------- Destroy ----------

  destroy() {
    if (this._textElement) {
      this._textElement.remove();
      this._textElement = null;
    }
    if (this._backgroundRect) {
      this._backgroundRect.remove();
      this._backgroundRect = null;
    }
    super.destroy();
  }
};

// ============================================================================
// AngleLabel
// ============================================================================

SvgJSEdu.AngleLabel = class AngleLabel extends SvgJSElement {
  static serializationMap = {
    description: {
      de: "Winkelmarkierung mit Text",
      en: "Angle label with text",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      'let myAngleLabel = new AngleLabel(100, 100, 150, 100, 150, 150, 30, "α", "Arial", 16, 0x444444, 1, 0x444444);',
    constructor: {
      centerX: {
        name: "centerX",
        info: {
          en: "X coordinate of the arc center",
          de: "X-Koordinate des Kreismittelpunkts",
        },
      },
      centerY: {
        name: "centerY",
        info: {
          en: "Y coordinate of the arc center",
          de: "Y-Koordinate des Kreismittelpunkts",
        },
      },
      arm1X: {
        name: "arm1X",
        info: {
          en: "X coordinate of the first arm endpoint",
          de: "X-Koordinate des ersten Schenkels",
        },
      },
      arm1Y: {
        name: "arm1Y",
        info: {
          en: "Y coordinate of the first arm endpoint",
          de: "Y-Koordinate des ersten Schenkels",
        },
      },
      arm2X: {
        name: "arm2X",
        info: {
          en: "X coordinate of the second arm endpoint",
          de: "X-Koordinate des zweiten Schenkels",
        },
      },
      arm2Y: {
        name: "arm2Y",
        info: {
          en: "Y coordinate of the second arm endpoint",
          de: "Y-Koordinate des zweiten Schenkels",
        },
      },
      radius: {
        name: "radius",
        info: {
          en: "Radius of the arc",
          de: "Radius des Kreisbogens",
        },
      },
      label: {
        name: "label",
        info: {
          en: "Text to display in the arc",
          de: "Text, der im Kreisbogen angezeigt wird",
        },
      },
      font: {
        name: "font",
        info: {
          en: "Font family for the text",
          de: "Schriftart für den Text",
        },
      },
      fontSize: {
        name: "fontSize",
        info: {
          en: "Font size for the text",
          de: "Schriftgröße für den Text",
        },
      },
      textColor: {
        name: "textColor",
        info: {
          en: "Color of the text in hexadecimal format",
          de: "Farbe des Textes im Hexadezimalformat",
        },
      },
      lineThickness: {
        name: "lineThickness",
        info: {
          en: "Thickness of the arc line",
          de: "Linienstärke des Kreisbogens",
        },
      },
      lineColor: {
        name: "lineColor",
        info: {
          en: "Color of the arc line in hexadecimal format",
          de: "Farbe der Linie im Hexadezimalformat",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = false",
      },
      alpha: {
        name: "alpha",
        info: {
          en: "Sets the transparency of the object (0.0 to 1.0)",
          de: "Setzt die Transparenz des Objekts (0.0 bis 1.0)",
        },
        example: "alpha = 0.5",
      },
    },
    methods: {
      setText: {
        example: 'setText("90°")',
        info: {
          en: "Changes the text displayed in the arc",
          de: "Ändert den Text im Kreisbogen",
        },
      },
      setTextColor: {
        example: "setTextColor(0xff0000)",
        info: {
          en: "Changes the color of the text",
          de: "Ändert die Farbe des Textes",
        },
      },
      setFontSize: {
        example: "setFontSize(16)",
        info: {
          en: "Sets the font size of the text",
          de: "Setzt die Schriftgröße des Textes",
        },
      },
      setLineColor: {
        example: "setLineColor(0x0000ff)",
        info: {
          en: "Changes the color of the arc line",
          de: "Ändert die Farbe der Bogenlinie",
        },
      },
      setLineThickness: {
        example: "setLineThickness(2)",
        info: {
          en: "Sets the thickness of the arc line",
          de: "Setzt die Linienstärke des Kreisbogens",
        },
      },
      setRadius: {
        example: "setRadius(30)",
        info: {
          en: "Sets the radius of the arc",
          de: "Setzt den Radius des Kreisbogens",
        },
      },
      setCenter: {
        example: "setCenter(100, 100)",
        info: {
          en: "Sets the center position of the arc",
          de: "Setzt die Mittelposition des Kreisbogens",
        },
      },
      setArm1: {
        example: "setArm1(150, 100)",
        info: {
          en: "Sets the endpoint of the first arm",
          de: "Setzt den Endpunkt des ersten Schenkels",
        },
      },
      setArm2: {
        example: "setArm2(100, 150)",
        info: {
          en: "Sets the endpoint of the second arm",
          de: "Setzt den Endpunkt des zweiten Schenkels",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      setLabelDistance: {
        example: "setLabelDistance(25)",
        info: {
          en: "Sets the distance of the label text from the center point",
          de: "Setzt die Entfernung der Beschriftung zum Mittelpunkt",
        },
      },
      setArrowheads: {
        example: "setArrowheads(true, 12)",
        info: {
          en: "Shows or hides arrowheads at the ends of the arc. Optionally sets the arrowhead size (default 8)",
          de: "Zeigt oder verbirgt Pfeilspitzen an den Enden des Bogens. Optional kann die Größe angegeben werden (Standard 8)",
        },
      },
      setLongArc: {
        example: "setLongArc(true)",
        info: {
          en: "Sets whether to draw the longer arc (true) or shorter arc (false)",
          de: "Legt fest, ob der längere Bogen (true) oder kürzere Bogen (false) gezeichnet wird",
        },
      },
      setExternalLabel: {
        example: "setExternalLabel(true, 15)",
        info: {
          en: "Enables external labeling for small angles. Two small arcs extend beyond the angle arms and the label is placed outside. Optionally sets the arc span in degrees (default 15)",
          de: "Aktiviert die externe Beschriftung für kleine Winkel. Zwei kleine Bögen ragen über die Schenkel hinaus und die Beschriftung wird außen platziert. Optional kann die Bogenspanne in Grad angegeben werden (Standard 15)",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
    },
  };

  constructor(
    centerX = 0,
    centerY = 0,
    arm1X = 50,
    arm1Y = 0,
    arm2X = 0,
    arm2Y = 50,
    radius = 30,
    label = "",
    font = "Arial",
    fontSize = 12,
    textColor = 0x444444,
    lineThickness = 1,
    lineColor = 0x444444,
  ) {
    super();
    this._centerX = centerX;
    this._centerY = centerY;
    this._arm1X = arm1X;
    this._arm1Y = arm1Y;
    this._arm2X = arm2X;
    this._arm2Y = arm2Y;
    this._radius = radius;
    this._text = label;
    this._fontFamily = font;
    this._fontSize = fontSize;
    this._textColor = textColor;
    this._lineThickness = lineThickness;
    this._lineColor = lineColor;
    this._longArc = false;
    this._labelDistance = null;
    this._showArrowheads = false;
    this._arrowheadSize = 8;
    this._externalLabel = false;
    this._externalArcSpan = 15;

    this._arcElement = null;
    this._textElement = null;
    this._arrowhead1Element = null;
    this._arrowhead2Element = null;

    this._draw();

    // Deferred: bbox() requires rendered elements
    requestAnimationFrame(() => {
      this._updateTextPosition();
    });

    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _calculateAngles() {
    const angle1 = Math.atan2(
      this._arm1Y - this._centerY,
      this._arm1X - this._centerX,
    );
    const angle2 = Math.atan2(
      this._arm2Y - this._centerY,
      this._arm2X - this._centerX,
    );

    let startAngle = angle1;
    let endAngle = angle2;

    // Find shortest arc direction, matching PixiJS behavior
    let angleDiff = endAngle - startAngle;
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

    if (angleDiff < 0) {
      const temp = startAngle;
      startAngle = endAngle;
      endAngle = temp;
      angleDiff = -angleDiff;
    }

    if (this._longArc) {
      const temp = startAngle;
      startAngle = endAngle;
      endAngle = temp + 2 * Math.PI;
      angleDiff = 2 * Math.PI - angleDiff;
    }

    return { startAngle, endAngle, angleDiff };
  }

  _isRightAngle() {
    const v1x = this._arm1X - this._centerX;
    const v1y = this._arm1Y - this._centerY;
    const v2x = this._arm2X - this._centerX;
    const v2y = this._arm2Y - this._centerY;
    const dotProduct = v1x * v2x + v1y * v2y;
    return Math.abs(dotProduct) < 0.001;
  }

  _draw() {
    if (!this._group) return;
    if (this._arcElement) this._arcElement.remove();
    if (this._textElement) {
      this._textElement.remove();
      this._textElement = null;
    }

    const { startAngle, endAngle, angleDiff } = this._calculateAngles();

    if (this._lineThickness > 0) {
      const r = this._radius;
      const cx = this._centerX;
      const cy = this._centerY;

      let d;
      if (this._externalLabel) {
        const spanRad = this._externalArcSpan * Math.PI / 180;
        const ext1StartX = cx + r * Math.cos(startAngle - spanRad);
        const ext1StartY = cy + r * Math.sin(startAngle - spanRad);
        const ext1EndX = cx + r * Math.cos(startAngle);
        const ext1EndY = cy + r * Math.sin(startAngle);
        const ext2StartX = cx + r * Math.cos(endAngle);
        const ext2StartY = cy + r * Math.sin(endAngle);
        const ext2EndX = cx + r * Math.cos(endAngle + spanRad);
        const ext2EndY = cy + r * Math.sin(endAngle + spanRad);
        d = `M ${ext1StartX},${ext1StartY} A ${r},${r} 0 0 1 ${ext1EndX},${ext1EndY} M ${ext2StartX},${ext2StartY} A ${r},${r} 0 0 1 ${ext2EndX},${ext2EndY}`;
      } else {
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const largeArc = angleDiff > Math.PI ? 1 : 0;
        const sweep = 1;
        d = `M ${x1},${y1} A ${r},${r} 0 ${largeArc} ${sweep} ${x2},${y2}`;
      }

      this._arcElement = this._group
        .path(d)
        .fill("none")
        .stroke({
          color: colorToHex(this._lineColor),
          width: this._lineThickness,
        })
        .attr("opacity", this._alpha);
    } else {
      this._arcElement = null;
    }

    this._drawArrowheads();
    this._createTextElement();
    this._updateTextPosition();
  }

  _drawArrowheads() {
    if (this._arrowhead1Element) {
      this._arrowhead1Element.remove();
      this._arrowhead1Element = null;
    }
    if (this._arrowhead2Element) {
      this._arrowhead2Element.remove();
      this._arrowhead2Element = null;
    }

    if (!this._showArrowheads || !this._group) return;

    const { startAngle, endAngle } = this._calculateAngles();
    const r = this._radius;
    const cx = this._centerX;
    const cy = this._centerY;
    const s = this._arrowheadSize;
    const halfWidth = s * 0.3;
    const color = colorToHex(this._lineColor);
    const angularOffset = s / r;

    // Arrowhead at start
    const tipX1 = cx + r * Math.cos(startAngle);
    const tipY1 = cy + r * Math.sin(startAngle);
    const refAngle1 = startAngle + (this._externalLabel ? -angularOffset : angularOffset);
    const refX1 = cx + r * Math.cos(refAngle1);
    const refY1 = cy + r * Math.sin(refAngle1);
    const dirX1 = tipX1 - refX1;
    const dirY1 = tipY1 - refY1;
    const len1 = Math.sqrt(dirX1 * dirX1 + dirY1 * dirY1) || 1;
    const ndX1 = dirX1 / len1;
    const ndY1 = dirY1 / len1;
    const npX1 = -ndY1;
    const npY1 = ndX1;

    const baseX1 = tipX1 - ndX1 * s;
    const baseY1 = tipY1 - ndY1 * s;
    const wingA1X = baseX1 + npX1 * halfWidth;
    const wingA1Y = baseY1 + npY1 * halfWidth;
    const wingB1X = baseX1 - npX1 * halfWidth;
    const wingB1Y = baseY1 - npY1 * halfWidth;

    this._arrowhead1Element = this._group
      .polygon(`${tipX1},${tipY1} ${wingA1X},${wingA1Y} ${wingB1X},${wingB1Y}`)
      .fill(color)
      .stroke("none")
      .attr("opacity", this._alpha);

    // Arrowhead at end
    const tipX2 = cx + r * Math.cos(endAngle);
    const tipY2 = cy + r * Math.sin(endAngle);
    const refAngle2 = endAngle + (this._externalLabel ? angularOffset : -angularOffset);
    const refX2 = cx + r * Math.cos(refAngle2);
    const refY2 = cy + r * Math.sin(refAngle2);
    const dirX2 = tipX2 - refX2;
    const dirY2 = tipY2 - refY2;
    const len2 = Math.sqrt(dirX2 * dirX2 + dirY2 * dirY2) || 1;
    const ndX2 = dirX2 / len2;
    const ndY2 = dirY2 / len2;
    const npX2 = -ndY2;
    const npY2 = ndX2;

    const baseX2 = tipX2 - ndX2 * s;
    const baseY2 = tipY2 - ndY2 * s;
    const wingA2X = baseX2 + npX2 * halfWidth;
    const wingA2Y = baseY2 + npY2 * halfWidth;
    const wingB2X = baseX2 - npX2 * halfWidth;
    const wingB2Y = baseY2 - npY2 * halfWidth;

    this._arrowhead2Element = this._group
      .polygon(`${tipX2},${tipY2} ${wingA2X},${wingA2Y} ${wingB2X},${wingB2Y}`)
      .fill(color)
      .stroke("none")
      .attr("opacity", this._alpha);
  }

  _createTextElement() {
    if (this._textElement) {
      this._textElement.remove();
      this._textElement = null;
    }

    const self = this;

    this._textElement = this._group.text(function (add) {
      add.tspan(self._text);
    });

    this._textElement
      .fill(colorToHex(this._textColor))
      .font({
        family: this._fontFamily,
        size: this._fontSize,
        anchor: "middle",
      })
      .attr("dominant-baseline", "central")
      .attr("opacity", this._alpha);
  }

  _updateTextPosition() {
    if (!this._textElement) return;

    const { startAngle, endAngle, angleDiff } = this._calculateAngles();

    let textAngle, textDist;
    if (this._externalLabel) {
      const spanRad = this._externalArcSpan * Math.PI / 180;
      textAngle = endAngle + spanRad / 2;
      if (this._labelDistance !== null) {
        textDist = this._labelDistance;
      } else {
        textDist = this._radius + this._fontSize * 0.6;
      }
    } else {
      textAngle = startAngle + angleDiff / 2;
      while (textAngle > 2 * Math.PI) textAngle -= 2 * Math.PI;
      while (textAngle < 0) textAngle += 2 * Math.PI;
      if (this._labelDistance !== null) {
        textDist = this._labelDistance;
      } else {
        let radiusFactor = 0.7;
        if (this._text === "•" && this._isRightAngle()) {
          radiusFactor = 0.55;
        }
        textDist = this._radius * radiusFactor;
      }
    }

    const textX = this._centerX + Math.cos(textAngle) * textDist;
    const textY = this._centerY + Math.sin(textAngle) * textDist;

    this._textElement.attr("x", textX);
    this._textElement.attr("y", textY);
  }

  setText(text) {
    this._text = text;
    this._createTextElement();
    requestAnimationFrame(() => {
      this._updateTextPosition();
    });
    return this;
  }

  setTextColor(color) {
    this._textColor = color;
    if (this._textElement) this._textElement.fill(colorToHex(color));
    return this;
  }

  setFontSize(size) {
    this._fontSize = size;
    this._createTextElement();
    requestAnimationFrame(() => {
      this._updateTextPosition();
    });
    return this;
  }

  setLineColor(color) {
    this._lineColor = color;
    this._draw();
    return this;
  }

  setLineThickness(thickness) {
    this._lineThickness = thickness;
    this._draw();
    return this;
  }

  setRadius(radius) {
    this._radius = radius;
    this._draw();
    return this;
  }

  setCenter(x, y) {
    this._centerX = x;
    this._centerY = y;
    this._draw();
    return this;
  }

  setArm1(x, y) {
    this._arm1X = x;
    this._arm1Y = y;
    this._draw();
    return this;
  }

  setArm2(x, y) {
    this._arm2X = x;
    this._arm2Y = y;
    this._draw();
    return this;
  }

  setAlpha(alpha) {
    this._alpha = Math.max(0, Math.min(1, alpha));
    if (this._arcElement) this._arcElement.attr("opacity", this._alpha);
    if (this._textElement) this._textElement.attr("opacity", this._alpha);
    if (this._arrowhead1Element) this._arrowhead1Element.attr("opacity", this._alpha);
    if (this._arrowhead2Element) this._arrowhead2Element.attr("opacity", this._alpha);
    return this;
  }

  setLabelDistance(distance) {
    this._labelDistance = distance;
    this._updateTextPosition();
    return this;
  }

  setArrowheads(visible, size) {
    this._showArrowheads = !!visible;
    if (size !== undefined) {
      this._arrowheadSize = size;
    }
    this._drawArrowheads();
    return this;
  }

  setLongArc(useLongArc) {
    this._longArc = !!useLongArc;
    this._draw();
    return this;
  }

  setExternalLabel(enabled, arcSpan) {
    this._externalLabel = !!enabled;
    if (arcSpan !== undefined) {
      this._externalArcSpan = arcSpan;
    }
    this._draw();
    return this;
  }

  // ---------- Destroy ----------

  destroy() {
    if (this._arcElement) {
      this._arcElement.remove();
      this._arcElement = null;
    }
    if (this._textElement) {
      this._textElement.remove();
      this._textElement = null;
    }
    if (this._arrowhead1Element) {
      this._arrowhead1Element.remove();
      this._arrowhead1Element = null;
    }
    if (this._arrowhead2Element) {
      this._arrowhead2Element.remove();
      this._arrowhead2Element = null;
    }
    super.destroy();
  }
};

// ============================================================================
// LengthLabel
// ============================================================================

SvgJSEdu.LengthLabel = class LengthLabel extends SvgJSElement {
  static serializationMap = {
    description: {
      de: "Längenmarkierung (Bemaßung) mit Maßlinie, Pfeilen und Text",
      en: "Length label (dimension) with dimension line, arrowheads and text",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      'let myLengthLabel = new LengthLabel(100, 200, 300, 200, 30, "<i>l</i> = 2 m", "Arial", 16, 0x444444, 1, 0x444444);',
    constructor: {
      startX: {
        name: "startX",
        info: {
          en: "X coordinate of the start point of the measured length",
          de: "X-Koordinate des Startpunkts der gemessenen Länge",
        },
      },
      startY: {
        name: "startY",
        info: {
          en: "Y coordinate of the start point of the measured length",
          de: "Y-Koordinate des Startpunkts der gemessenen Länge",
        },
      },
      endX: {
        name: "endX",
        info: {
          en: "X coordinate of the end point of the measured length",
          de: "X-Koordinate des Endpunkts der gemessenen Länge",
        },
      },
      endY: {
        name: "endY",
        info: {
          en: "Y coordinate of the end point of the measured length",
          de: "Y-Koordinate des Endpunkts der gemessenen Länge",
        },
      },
      offset: {
        name: "offset",
        info: {
          en: "Distance of the dimension line from the measured length. Positive and negative values place it on opposite sides (same side as LineLabel for positive values). 0 = directly on the length, without extension lines",
          de: "Abstand der Maßlinie von der gemessenen Länge. Positive und negative Werte legen sie auf verschiedene Seiten (bei positiven Werten dieselbe Seite wie bei LineLabel). 0 = direkt auf der Länge, ohne Maßhilfslinien",
        },
      },
      label: {
        name: "label",
        info: {
          en: "Text of the label (supports <b>, <i>, <sub> and <sup> tags, also combined and nested)",
          de: "Text der Beschriftung (unterstützt die Tags <b>, <i>, <sub> und <sup>, auch kombiniert und verschachtelt)",
        },
      },
      font: {
        name: "font",
        info: {
          en: "Font family for the text",
          de: "Schriftart für den Text",
        },
      },
      fontSize: {
        name: "fontSize",
        info: {
          en: "Font size for the text",
          de: "Schriftgröße für den Text",
        },
      },
      textColor: {
        name: "textColor",
        info: {
          en: "Colour of the text in hexadecimal format",
          de: "Farbe des Textes im Hexadezimalformat",
        },
      },
      lineThickness: {
        name: "lineThickness",
        info: {
          en: "Thickness of the dimension line and the extension lines",
          de: "Linienstärke der Maßlinie und der Maßhilfslinien",
        },
      },
      lineColor: {
        name: "lineColor",
        info: {
          en: "Colour of the lines and arrowheads in hexadecimal format",
          de: "Farbe der Linien und Pfeilspitzen im Hexadezimalformat",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = false",
      },
      alpha: {
        name: "alpha",
        info: {
          en: "Sets the transparency of the object (0.0 to 1.0)",
          de: "Setzt die Transparenz des Objekts (0.0 bis 1.0)",
        },
        example: "alpha = 0.5",
      },
    },
    methods: {
      setText: {
        example: 'setText("<i>l</i> = 2,5 m")',
        info: {
          en: "Changes the text of the label (supports <b>, <i>, <sub> and <sup> tags)",
          de: "Ändert den Text der Beschriftung (unterstützt die Tags <b>, <i>, <sub> und <sup>)",
        },
      },
      setTextColor: {
        example: "setTextColor(0xff0000)",
        info: {
          en: "Changes the colour of the text",
          de: "Ändert die Farbe des Textes",
        },
      },
      setFontSize: {
        example: "setFontSize(16)",
        info: {
          en: "Sets the font size of the text",
          de: "Setzt die Schriftgröße des Textes",
        },
      },
      setLineColor: {
        example: "setLineColor(0x0000ff)",
        info: {
          en: "Changes the colour of the lines and arrowheads",
          de: "Ändert die Farbe der Linien und Pfeilspitzen",
        },
      },
      setLineThickness: {
        example: "setLineThickness(2)",
        info: {
          en: "Sets the thickness of the dimension line and the extension lines",
          de: "Setzt die Linienstärke der Maßlinie und der Maßhilfslinien",
        },
      },
      setStart: {
        example: "setStart(100, 200)",
        info: {
          en: "Sets the start point of the measured length",
          de: "Setzt den Startpunkt der gemessenen Länge",
        },
      },
      setEnd: {
        example: "setEnd(300, 200)",
        info: {
          en: "Sets the end point of the measured length",
          de: "Setzt den Endpunkt der gemessenen Länge",
        },
      },
      setPoints: {
        example: "setPoints(100, 200, 300, 200)",
        info: {
          en: "Sets the start and end point at once (startX, startY, endX, endY)",
          de: "Setzt Start- und Endpunkt auf einmal (startX, startY, endX, endY)",
        },
      },
      setOffset: {
        example: "setOffset(40)",
        info: {
          en: "Sets the distance of the dimension line from the measured length (negative = other side)",
          de: "Setzt den Abstand der Maßlinie von der gemessenen Länge (negativ = andere Seite)",
        },
      },
      setFlipSide: {
        example: "setFlipSide(true)",
        info: {
          en: "Moves the dimension line and the label to the opposite side",
          de: "Legt Maßlinie und Beschriftung auf die gegenüberliegende Seite",
        },
      },
      setLabelDistance: {
        example: "setLabelDistance(8)",
        info: {
          en: "Sets the gap between the dimension line and the text (default: automatic)",
          de: "Setzt den Abstand zwischen Maßlinie und Text (Standard: automatisch)",
        },
      },
      setArrowheads: {
        example: "setArrowheads(true, 12)",
        info: {
          en: "Shows or hides the arrowheads at the ends of the dimension line. Optionally sets the arrowhead size (default 8)",
          de: "Zeigt oder verbirgt die Pfeilspitzen an den Enden der Maßlinie. Optional kann die Größe angegeben werden (Standard 8)",
        },
      },
      setExtensionLines: {
        example: "setExtensionLines(true, 6, 3)",
        info: {
          en: "Shows or hides the extension lines. Optionally sets how far they extend beyond the dimension line (default 6) and the gap to the measured points (default 3)",
          de: "Zeigt oder verbirgt die Maßhilfslinien. Optional: wie weit sie über die Maßlinie hinausragen (Standard 6) und Lücke zu den gemessenen Punkten (Standard 3)",
        },
      },
      setTextAlongLine: {
        example: "setTextAlongLine(true)",
        info: {
          en: "Turns the text parallel to the dimension line, as in technical drawings (default false = text stays horizontal)",
          de: "Dreht den Text parallel zur Maßlinie wie in technischen Zeichnungen (Standard false = Text bleibt waagerecht)",
        },
      },
      setExternalLabel: {
        example: "setExternalLabel(true, 20)",
        info: {
          en: "For short lengths: the arrowheads point inwards from outside and the label is placed beyond the end point. There is no line between the arrowheads. Optionally sets the length of the lines outside the points (default 20)",
          de: "Für kurze Längen: Die Pfeilspitzen zeigen von außen nach innen, die Beschriftung steht hinter dem Endpunkt. Zwischen den Pfeilspitzen liegt keine Linie. Optional kann die Länge der Linien außerhalb der Punkte angegeben werden (Standard 20)",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      getLength: {
        example: "getLength()",
        info: {
          en: "Returns the measured length in pixels",
          de: "Gibt die gemessene Länge in Pixeln zurück",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
    },
  };

  constructor(
    startX = 0,
    startY = 0,
    endX = 100,
    endY = 0,
    offset = 20,
    label = "",
    font = "Arial",
    fontSize = 12,
    textColor = 0x444444,
    lineThickness = 1,
    lineColor = 0x444444,
  ) {
    super();
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;
    this._offset = offset;
    this._text = label;
    this._fontFamily = font;
    this._fontSize = fontSize;
    this._textColor = textColor;
    this._lineThickness = lineThickness;
    this._lineColor = lineColor;
    this._flipped = false;
    this._labelDistance = null;
    this._showArrowheads = true;
    this._arrowheadSize = 8;
    this._showExtensionLines = true;
    this._extensionOvershoot = 6;
    this._extensionGap = 3;
    this._textAlongLine = false;
    this._externalLabel = false;
    this._externalLength = 20;
    this._lineElement = null;
    this._arrowElement = null;
    this._textElement = null;
    this._textSize = null;
    this._draw();
    // Deferred: bbox() requires rendered elements
    requestAnimationFrame(() => {
      this._textSize = null;
      this._updateTextPosition();
    });
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  // ---------- Geometry ----------

  _geometry() {
    const dx = this._endX - this._startX;
    const dy = this._endY - this._startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    let ux = 1;
    let uy = 0;
    if (length > 0) {
      ux = dx / length;
      uy = dy / length;
    }
    // Normal as in LineLabel: same side for both directions of a line
    let nx = -uy;
    let ny = ux;
    if (dx < 0) {
      nx = -nx;
      ny = -ny;
    }
    if (this._flipped) {
      nx = -nx;
      ny = -ny;
    }
    const o = this._offset;
    // Direction from the measured length towards the dimension line
    const side = o < 0 ? -1 : 1;
    const ax = this._startX + nx * o;
    const ay = this._startY + ny * o;
    const bx = this._endX + nx * o;
    const by = this._endY + ny * o;
    return { length, ux, uy, nx, ny, side, ax, ay, bx, by };
  }

  _textRotation(ux, uy) {
    if (!this._textAlongLine) return 0;
    let deg = (Math.atan2(uy, ux) * 180) / Math.PI;
    // Keep the text readable: never upside down
    if (deg > 90) deg -= 180;
    if (deg <= -90) deg += 180;
    return deg;
  }

  // ---------- Drawing ----------

  _draw() {
    if (!this._group) return;
    this._drawLines();
    this._drawArrowheads();
    this._createTextElement();
    this._updateTextPosition();
  }

  _drawLines() {
    if (this._lineElement) {
      this._lineElement.remove();
      this._lineElement = null;
    }
    if (!this._group || !(this._lineThickness > 0)) return;
    const g = this._geometry();
    const s = this._showArrowheads ? this._arrowheadSize : 0;
    const t = this._lineThickness;
    let d = "";

    // Dimension line
    if (this._externalLabel) {
      // Two short lines outside the points, no line between the arrowheads
      const e = this._externalLength;
      const cut = s > 0 ? Math.min(t * 1.7, s, e) : 0;
      d += `M ${g.ax - g.ux * e},${g.ay - g.uy * e} L ${g.ax - g.ux * cut},${g.ay - g.uy * cut} `;
      d += `M ${g.bx + g.ux * cut},${g.by + g.uy * cut} L ${g.bx + g.ux * e},${g.by + g.uy * e} `;
    } else if (g.length > 0) {
      // Shorten the line under the arrow tips so that it does not stick out
      const cut = s > 0 ? Math.min(t * 1.7, s, g.length / 2) : 0;
      d += `M ${g.ax + g.ux * cut},${g.ay + g.uy * cut} L ${g.bx - g.ux * cut},${g.by - g.uy * cut} `;
    }

    // Extension lines
    const absO = Math.abs(this._offset);
    if (this._showExtensionLines && absO > this._extensionGap) {
      const gap = this._extensionGap * g.side;
      const far = this._offset + this._extensionOvershoot * g.side;
      d += `M ${this._startX + g.nx * gap},${this._startY + g.ny * gap} L ${this._startX + g.nx * far},${this._startY + g.ny * far} `;
      d += `M ${this._endX + g.nx * gap},${this._endY + g.ny * gap} L ${this._endX + g.nx * far},${this._endY + g.ny * far} `;
    }

    if (d === "") return;
    this._lineElement = this._group
      .path(d.trim())
      .fill("none")
      .stroke({
        color: colorToHex(this._lineColor),
        width: this._lineThickness,
        linecap: "butt",
      });
    this._lineElement.back();
  }

  _arrowPoints(tipX, tipY, dirX, dirY) {
    // dir points in the direction of the tip
    const s = this._arrowheadSize;
    const halfWidth = s * 0.3;
    const baseX = tipX - dirX * s;
    const baseY = tipY - dirY * s;
    const pX = -dirY * halfWidth;
    const pY = dirX * halfWidth;
    return `${tipX},${tipY} ${baseX + pX},${baseY + pY} ${baseX - pX},${baseY - pY}`;
  }

  _drawArrowheads() {
    if (this._arrowElement) {
      this._arrowElement.remove();
      this._arrowElement = null;
    }
    if (!this._showArrowheads || !this._group) return;
    const g = this._geometry();
    if (g.length === 0) return;
    // Inside: tips point outwards; external: tips point inwards
    const k = this._externalLabel ? 1 : -1;
    const p1 = this._arrowPoints(g.ax, g.ay, g.ux * k, g.uy * k);
    const p2 = this._arrowPoints(g.bx, g.by, -g.ux * k, -g.uy * k);
    this._arrowElement = this._group
      .path(`M ${p1.split(" ").join(" L ")} Z M ${p2.split(" ").join(" L ")} Z`)
      .fill(colorToHex(this._lineColor))
      .stroke("none");
  }

  _parseHTMLText(htmlText) {
    const segments = [];
    const tagRegex = /<\/?(\w+)>/g;
    let lastIndex = 0;
    let bold = false;
    let italic = false;
    let type = "normal";
    const typeStack = [];
    let match;

    while ((match = tagRegex.exec(htmlText)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          text: htmlText.substring(lastIndex, match.index),
          type: type,
          bold: bold,
          italic: italic,
        });
      }

      const isClosing = match[0].startsWith("</");
      const tagName = match[1].toLowerCase();

      if (!isClosing) {
        if (tagName === "b") bold = true;
        else if (tagName === "i") italic = true;
        else if (tagName === "sub" || tagName === "sup") {
          typeStack.push(type);
          type = tagName;
        }
      } else {
        if (tagName === "b") bold = false;
        else if (tagName === "i") italic = false;
        else if (tagName === "sub" || tagName === "sup") {
          type = typeStack.pop() || "normal";
        }
      }

      lastIndex = tagRegex.lastIndex;
    }

    if (lastIndex < htmlText.length) {
      segments.push({
        text: htmlText.substring(lastIndex),
        type: type,
        bold: bold,
        italic: italic,
      });
    }

    return segments;
  }

  _createTextElement() {
    if (this._textElement) {
      this._textElement.remove();
      this._textElement = null;
    }
    this._textSize = null;
    if (!this._group) return;

    const segments = this._parseHTMLText(String(this._text));
    const self = this;
    const subDy = 0.4;
    const supDy = -0.5;

    this._textElement = this._group.text(function (add) {
      segments.forEach((segment, index) => {
        const size =
          segment.type === "normal" ? self._fontSize : self._fontSize * 0.7;

        const tspan = add.tspan(segment.text).font({
          family: self._fontFamily,
          size: size,
          weight: segment.bold ? "bold" : "normal",
          style: segment.italic ? "italic" : "normal",
        });

        if (segment.type === "sub") {
          tspan.attr("dy", subDy * self._fontSize + "px");
        } else if (segment.type === "sup") {
          tspan.attr("dy", supDy * self._fontSize + "px");
        }

        if (segment.type === "normal" && index > 0) {
          const prev = segments[index - 1];
          if (prev.type === "sub") {
            tspan.attr("dy", -subDy * self._fontSize + "px");
          } else if (prev.type === "sup") {
            tspan.attr("dy", -supDy * self._fontSize + "px");
          }
        }
      });
    });

    this._textElement
      .fill(colorToHex(this._textColor))
      .font({
        family: this._fontFamily,
        size: this._fontSize,
        anchor: "middle",
      })
      .attr("dominant-baseline", "central");
  }

  _measureText() {
    if (this._textSize) return this._textSize;
    let w = 0;
    let h = 0;
    try {
      const bbox = this._textElement.bbox();
      w = bbox.width;
      h = bbox.height;
    } catch (e) {
      // bbox() may fail if the element is not visible
    }
    if (w > 0 && h > 0) {
      this._textSize = { w, h };
      return this._textSize;
    }
    // Estimate until the text is rendered
    const plain = String(this._text).replace(/<\/?\w+>/g, "");
    return { w: plain.length * this._fontSize * 0.55, h: this._fontSize * 1.15 };
  }

  _updateTextPosition() {
    if (!this._textElement) return;
    const g = this._geometry();
    const size = this._measureText();
    const rot = this._textRotation(g.ux, g.uy);
    const gap =
      this._labelDistance !== null
        ? this._labelDistance
        : Math.max(3, this._fontSize * 0.25);
    let x;
    let y;

    if (this._externalLabel) {
      // Beyond the end point, on the axis of the dimension line
      const along = this._textAlongLine
        ? size.w / 2
        : Math.abs(g.ux) * (size.w / 2) + Math.abs(g.uy) * (size.h / 2);
      const d = this._externalLength + gap + along;
      x = g.bx + g.ux * d;
      y = g.by + g.uy * d;
    } else {
      // Beside the middle of the dimension line, away from the measured length
      const across = this._textAlongLine
        ? size.h / 2
        : Math.abs(g.nx) * (size.w / 2) + Math.abs(g.ny) * (size.h / 2);
      const d = gap + across;
      const mx = (g.ax + g.bx) / 2;
      const my = (g.ay + g.by) / 2;
      x = mx + g.nx * g.side * d;
      y = my + g.ny * g.side * d;
    }

    this._textElement.attr("x", x);
    this._textElement.attr("y", y);
    if (rot !== 0) {
      this._textElement.attr("transform", `rotate(${rot}, ${x}, ${y})`);
    } else {
      this._textElement.attr("transform", null);
    }
  }

  // ---------- Public methods ----------

  setText(text) {
    this._text = text;
    this._createTextElement();
    this._updateTextPosition();
    requestAnimationFrame(() => {
      this._textSize = null;
      this._updateTextPosition();
    });
    return this;
  }

  setTextColor(color) {
    this._textColor = color;
    if (this._textElement) this._textElement.fill(colorToHex(color));
    return this;
  }

  setFontSize(size) {
    this._fontSize = size;
    return this.setText(this._text);
  }

  setLineColor(color) {
    this._lineColor = color;
    this._drawLines();
    this._drawArrowheads();
    return this;
  }

  setLineThickness(thickness) {
    this._lineThickness = thickness;
    this._drawLines();
    return this;
  }

  _redrawGeometry() {
    this._drawLines();
    this._drawArrowheads();
    this._updateTextPosition();
    return this;
  }

  setStart(x, y) {
    this._startX = x;
    this._startY = y;
    return this._redrawGeometry();
  }

  setEnd(x, y) {
    this._endX = x;
    this._endY = y;
    return this._redrawGeometry();
  }

  setPoints(startX, startY, endX, endY) {
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;
    return this._redrawGeometry();
  }

  setOffset(offset) {
    this._offset = offset;
    return this._redrawGeometry();
  }

  setFlipSide(flipped) {
    this._flipped = !!flipped;
    return this._redrawGeometry();
  }

  setLabelDistance(distance) {
    this._labelDistance = distance;
    this._updateTextPosition();
    return this;
  }

  setArrowheads(visible, size) {
    this._showArrowheads = !!visible;
    if (size !== undefined) this._arrowheadSize = size;
    return this._redrawGeometry();
  }

  setExtensionLines(visible, overshoot, gap) {
    this._showExtensionLines = !!visible;
    if (overshoot !== undefined) this._extensionOvershoot = overshoot;
    if (gap !== undefined) this._extensionGap = gap;
    this._drawLines();
    return this;
  }

  setTextAlongLine(enabled) {
    this._textAlongLine = !!enabled;
    this._updateTextPosition();
    return this;
  }

  setExternalLabel(enabled, length) {
    this._externalLabel = !!enabled;
    if (length !== undefined) this._externalLength = length;
    return this._redrawGeometry();
  }

  getLength() {
    return this._geometry().length;
  }

  // ---------- Destroy ----------

  destroy() {
    if (this._lineElement) {
      this._lineElement.remove();
      this._lineElement = null;
    }
    if (this._arrowElement) {
      this._arrowElement.remove();
      this._arrowElement = null;
    }
    if (this._textElement) {
      this._textElement.remove();
      this._textElement = null;
    }
    super.destroy();
  }
};

// ============================================================================
// Line
// ============================================================================

SvgJSEdu.Line = class Line extends SvgJSElement {
  static serializationMap = {
    description: { de: "Einfache Linie", en: "Simple line" },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myLine = new Line(0, 0, 100, 50, 0xff0000, 2);",
    constructor: {
      startX: { name: "startX", info: { en: "X start", de: "X-Start" } },
      startY: { name: "startY", info: { en: "Y start", de: "Y-Start" } },
      endX: { name: "endX", info: { en: "X end", de: "X-Ende" } },
      endY: { name: "endY", info: { en: "Y end", de: "Y-Ende" } },
      color: {
        name: "color",
        info: {
          en: "Color in hexadecimal format",
          de: "Farbe im Hexadezimalformat",
        },
      },
      thickness: {
        name: "thickness",
        info: { en: "Line thickness in pixels", de: "Linienstärke in Pixeln" },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      rotation: {
        name: "rotation",
        info: {
          en: "Rotation of the element in degrees",
          de: "Drehung des Elements in Grad",
        },
        example: "rotation = 45",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = false",
      },
      alpha: {
        name: "alpha",
        info: {
          en: "Sets the transparency (0.0 to 1.0)",
          de: "Setzt die Transparenz (0.0 bis 1.0)",
        },
        example: "alpha = 0.5",
      },
    },
    methods: {
      setColor: {
        example: "setColor(0xff0000)",
        info: { en: "Changes the color", de: "Ändert die Farbe" },
      },
      setThickness: {
        example: "setThickness(2)",
        info: { en: "Sets line thickness", de: "Setzt Linienstärke" },
      },
      setStrokeDash: {
        example: "setStrokeDash([5, 5])",
        info: {
          en: "Creates a dashed line with pattern",
          de: "Erstellt eine gestrichelte Linie mit Muster",
        },
      },
      setStart: {
        example: "setStart(0, 0)",
        info: { en: "Sets the start point", de: "Setzt den Startpunkt" },
      },
      setEnd: {
        example: "setEnd(100, 100)",
        info: { en: "Sets the end point", de: "Setzt den Endpunkt" },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
    },
  };

  constructor(
    startX = 0,
    startY = 0,
    endX = 100,
    endY = 0,
    color = 0xff0000,
    thickness = 2,
  ) {
    super();
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;
    this._color = color;
    this._thickness = thickness;
    this._dashPattern = null;
    this._lineElement = null;

    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (!this._group) return;
    if (this._lineElement) this._lineElement.remove();

    this._lineElement = this._group
      .line(this._startX, this._startY, this._endX, this._endY)
      .stroke({
        color: colorToHex(this._color),
        width: this._thickness,
        opacity: this._alpha,
      });

    if (this._dashPattern) {
      this._lineElement.attr("stroke-dasharray", this._dashPattern.join(","));
    }
  }

  setStart(x, y) {
    this._startX = x;
    this._startY = y;
    this._draw();
    return this;
  }

  setEnd(x, y) {
    this._endX = x;
    this._endY = y;
    this._draw();
    return this;
  }

  setColor(color) {
    this._color = color;
    this._draw();
    return this;
  }

  setThickness(thickness) {
    this._thickness = thickness;
    this._draw();
    return this;
  }

  setStrokeDash(pattern) {
    this._dashPattern = pattern;
    this._draw();
    return this;
  }

  setAlpha(alpha) {
    this._alpha = Math.max(0, Math.min(1, alpha));
    this._draw();
    return this;
  }
};

// ============================================================================
// Ruler
// ============================================================================

SvgJSEdu.Ruler = class Ruler extends SvgJSElement {
  static serializationMap = {
    description: { de: "Lineal mit Teilstrichen", en: "Ruler with ticks" },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      'let myRuler = new Ruler("right", [0, 10, 20, 30, 40], 50, 0, 0xff0000, 2, 15, 16, 0x000000, true, 1, ".");',
    constructor: {
      direction: {
        name: "direction",
        info: {
          en: 'Direction of the ruler ("top", "bottom", "left", "right")',
          de: 'Richtung des Lineals ("top", "bottom", "left", "right")',
        },
      },
      values: {
        name: "values",
        info: {
          en: "Array with the values to display",
          de: "Array mit den anzuzeigenden Werten",
        },
      },
      spacing: {
        name: "spacing",
        info: {
          en: "Distance between tick marks in pixels",
          de: "Abstand zwischen den Teilstrichen in Pixeln",
        },
      },
      spacingOffset: {
        name: "spacingOffset",
        info: {
          en: "Offset for the first tick mark",
          de: "Offset für den ersten Teilstrich",
        },
      },
      color: {
        name: "color",
        info: {
          en: "Color of the tick marks in hexadecimal format (e.g. 0xff0000)",
          de: "Farbe der Teilstriche im Hexadezimalformat (z.B. 0xff0000)",
        },
      },
      thickness: {
        name: "thickness",
        info: {
          en: "Line thickness of the tick marks in pixels",
          de: "Linienstärke der Teilstriche in Pixeln",
        },
      },
      tickLength: {
        name: "tickLength",
        info: {
          en: "Length of the tick marks in pixels",
          de: "Länge der Teilstriche in Pixeln",
        },
      },
      fontSize: {
        name: "fontSize",
        info: {
          en: "Font size of the labels",
          de: "Schriftgröße der Labels",
        },
      },
      fontColor: {
        name: "fontColor",
        info: {
          en: "Color of the labels in hexadecimal format",
          de: "Farbe der Labels im Hexadezimalformat",
        },
      },
      positionSwitch: {
        name: "positionSwitch",
        info: {
          en: "Controls the alignment of tick marks and labels",
          de: "Steuert die Ausrichtung der Teilstriche und Labels",
        },
      },
      decimalPlaces: {
        name: "decimalPlaces",
        info: {
          en: "Number of decimal places to display for numerical values",
          de: "Anzahl der anzuzeigenden Dezimalstellen bei numerischen Werten",
        },
      },
      decimalSeparator: {
        name: "decimalSeparator",
        info: {
          en: 'Separator for decimal places (e.g. "." or ",")',
          de: 'Trennzeichen für Dezimalstellen (z.B. "." oder ",")',
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = false",
      },
    },
    methods: {
      setColor: {
        example: "setColor(0xff0000)",
        info: {
          en: "Changes the color of the tick marks",
          de: "Ändert die Farbe der Teilstriche",
        },
      },
      setFontColor: {
        example: "setFontColor(0x000000)",
        info: {
          en: "Changes the color of the labels",
          de: "Ändert die Farbe der Labels",
        },
      },
      setThickness: {
        example: "setThickness(2)",
        info: {
          en: "Sets the line thickness of the tick marks",
          de: "Setzt die Linienstärke der Teilstriche",
        },
      },
      updateValues: {
        example: 'updateValues(["0", "5", "10"])',
        info: {
          en: "Updates the values to display",
          de: "Aktualisiert die anzuzeigenden Werte",
        },
      },
      setSubTicks: {
        example: "setSubTicks(4, 5, 0xff0000, 1)",
        info: {
          en: "Adds sub tick marks between the main labeled ticks. Sub ticks are also drawn in the spacingOffset region between the ruler's origin and the first main tick. Parameters: count (number of sub ticks between main ticks), length (length of sub ticks in pixels), color (optional, hex color, defaults to main tick color), thickness (optional, line thickness, defaults to main tick thickness)",
          de: "Fügt Zwischenteilstriche zwischen den beschrifteten Hauptteilstrichen hinzu. Zwischenteilstriche werden auch im spacingOffset-Bereich zwischen dem Nullpunkt des Lineals und dem ersten Hauptteilstrich gezeichnet. Parameter: count (Anzahl der Zwischenteilstriche zwischen zwei Hauptteilstrichen), length (Länge der Zwischenteilstriche in Pixeln), color (optional, Hex-Farbe, Standard ist die Farbe der Hauptteilstriche), thickness (optional, Linienstärke, Standard ist die Stärke der Hauptteilstriche)",
        },
      },
    },
  };

  constructor(
    direction = "right",
    values = [],
    spacing = 50,
    spacingOffset = 0,
    color = 0xff0000,
    thickness = 1,
    tickLength = 10,
    fontSize = 21,
    fontColor = 0x444444,
    positionSwitch = true,
    decimalPlaces = 1,
    decimalSeparator = ".",
  ) {
    super();
    this._direction = direction;
    this._values = values;
    this._spacing = spacing;
    this._spacingOffset = spacingOffset;
    this._color = color;
    this._thickness = thickness;
    this._tickLength = tickLength;
    this._fontSize = fontSize;
    this._fontColor = fontColor;
    this._positionSwitch = positionSwitch;
    this._decimalPlaces = decimalPlaces;
    this._decimalSeparator = decimalSeparator;
    this._ticksGroup = null;

    // Sub tick properties (disabled by default)
    this._subTickCount = 0;
    this._subTickLength = 0;
    this._subTickColor = null;
    this._subTickThickness = null;

    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (!this._group) return;
    if (this._ticksGroup) this._ticksGroup.remove();
    this._ticksGroup = this._group.group();

    const formatValue = (value) => {
      if (typeof value === "number") {
        return value
          .toFixed(this._decimalPlaces)
          .replace(".", this._decimalSeparator);
      }
      return String(value);
    };

    // Helper to compute tick start/end coordinates for a given position and length
    const getTickCoords = (pos, length) => {
      let tickStart, tickEnd;
      switch (this._direction) {
        case "top":
          tickStart = [0, -pos];
          tickEnd = this._positionSwitch
            ? [-length, -pos]
            : [length, -pos];
          break;
        case "bottom":
          tickStart = [0, pos];
          tickEnd = this._positionSwitch
            ? [-length, pos]
            : [length, pos];
          break;
        case "left":
          tickStart = [-pos, 0];
          tickEnd = this._positionSwitch
            ? [-pos, length]
            : [-pos, -length];
          break;
        case "right":
          tickStart = [pos, 0];
          tickEnd = this._positionSwitch
            ? [pos, length]
            : [pos, -length];
          break;
      }
      return { tickStart, tickEnd };
    };

    // Helper to draw a single sub tick at a given position
    const drawSubTick = (pos) => {
      const subColor =
        this._subTickColor !== null ? this._subTickColor : this._color;
      const subThickness =
        this._subTickThickness !== null
          ? this._subTickThickness
          : this._thickness;
      const { tickStart, tickEnd } = getTickCoords(pos, this._subTickLength);
      this._ticksGroup
        .line(tickStart[0], tickStart[1], tickEnd[0], tickEnd[1])
        .stroke({ color: colorToHex(subColor), width: subThickness });
    };

    const subTicksActive =
      this._subTickCount > 0 && this._subTickLength > 0;

    // Draw sub ticks in the spacingOffset region (between origin and the first
    // main tick). We extend the regular sub-tick pattern backwards from the
    // first main tick so the sub-tick spacing stays consistent across the
    // whole ruler.
    if (subTicksActive && this._values.length > 0 && this._spacingOffset > 0) {
      const subSpacing = this._spacing / (this._subTickCount + 1);
      const firstMainPos = this._spacingOffset;
      let subPos = firstMainPos - subSpacing;
      // Small epsilon to avoid drawing at position 0 due to floating-point drift
      while (subPos > 1e-9) {
        drawSubTick(subPos);
        subPos -= subSpacing;
      }
    }

    this._values.forEach((value, index) => {
      const pos = this._spacingOffset + index * this._spacing;
      const formattedValue = formatValue(value);

      const { tickStart, tickEnd } = getTickCoords(pos, this._tickLength);

      this._ticksGroup
        .line(tickStart[0], tickStart[1], tickEnd[0], tickEnd[1])
        .stroke({ color: colorToHex(this._color), width: this._thickness });

      // Draw sub ticks between this main tick and the next one
      if (subTicksActive && index < this._values.length - 1) {
        const subSpacing = this._spacing / (this._subTickCount + 1);
        for (let i = 1; i <= this._subTickCount; i++) {
          drawSubTick(pos + i * subSpacing);
        }
      }

      const label = this._ticksGroup
        .text(formattedValue)
        .font({
          family: "Arial",
          size: this._fontSize,
        })
        .fill(colorToHex(this._fontColor));

      // SVG <text> positions at baseline via x/y. Using text-anchor and
      // dominant-baseline attributes avoids needing bbox() before render,
      // which can be inaccurate. This matches PixiJS top-left anchor semantics.
      let labelX, labelY;

      switch (this._direction) {
        case "top":
        case "bottom":
          if (this._positionSwitch) {
            label.attr({
              "text-anchor": "end",
              "dominant-baseline": "central",
            });
            labelX = tickEnd[0] - 5;
            labelY = tickEnd[1];
          } else {
            label.attr({
              "text-anchor": "start",
              "dominant-baseline": "central",
            });
            labelX = tickEnd[0] + 5;
            labelY = tickEnd[1];
          }
          label.attr({ x: labelX, y: labelY });
          break;

        case "left":
        case "right":
          if (this._positionSwitch) {
            label.attr({
              "text-anchor": "middle",
              "dominant-baseline": "hanging",
            });
            labelX = tickEnd[0];
            labelY = tickEnd[1] + 5;
          } else {
            label.attr({
              "text-anchor": "middle",
              "dominant-baseline": "auto",
            });
            labelX = tickEnd[0];
            labelY = tickEnd[1] - 5;
          }
          label.attr({ x: labelX, y: labelY });
          break;
      }
    });

    return this;
  }

  setColor(color) {
    this._color = color;
    this._draw();
    return this;
  }

  setFontColor(fontColor) {
    this._fontColor = fontColor;
    this._draw();
    return this;
  }

  setThickness(thickness) {
    this._thickness = thickness;
    this._draw();
    return this;
  }

  updateValues(values) {
    this._values = values;
    this._draw();
    return this;
  }

  setTickLength(tickLength) {
    this._tickLength = tickLength;
    this._draw();
    return this;
  }

  setFontSize(fontSize) {
    this._fontSize = fontSize;
    this._draw();
    return this;
  }

  setSpacing(spacing) {
    this._spacing = spacing;
    this._draw();
    return this;
  }

  setSpacingOffset(spacingOffset) {
    this._spacingOffset = spacingOffset;
    this._draw();
    return this;
  }

  setDirection(direction) {
    this._direction = direction;
    this._draw();
    return this;
  }

  setPositionSwitch(positionSwitch) {
    this._positionSwitch = positionSwitch;
    this._draw();
    return this;
  }

  setDecimalOptions(decimalPlaces, decimalSeparator = ".") {
    this._decimalPlaces = decimalPlaces;
    this._decimalSeparator = decimalSeparator;
    this._draw();
    return this;
  }

  setSubTicks(count, length, color = null, thickness = null) {
    this._subTickCount = count;
    this._subTickLength = length;
    this._subTickColor = color;
    this._subTickThickness = thickness;
    this._draw();
    return this;
  }
};

// ============================================================================
// CoordinateSystem
// ============================================================================

SvgJSEdu.CoordinateSystem = class CoordinateSystem extends SvgJSElement {
  static serializationMap = {
    description: {
      de: "Koordinatensystem mit Achsen",
      en: "Coordinate system with axes",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      "let myCoordinateSystem = new CoordinateSystem(100, 100, 100, 100, 0x000000, 10, 6, 1);",
    constructor: {
      sizeLeft: {
        name: "sizeLeft",
        info: {
          en: "Size of the left axis",
          de: "Größe der linken Achse",
        },
      },
      sizeRight: {
        name: "sizeRight",
        info: {
          en: "Size of the right axis",
          de: "Größe der rechten Achse",
        },
      },
      sizeTop: {
        name: "sizeTop",
        info: {
          en: "Size of the top axis",
          de: "Größe der oberen Achse",
        },
      },
      sizeBottom: {
        name: "sizeBottom",
        info: {
          en: "Size of the bottom axis",
          de: "Größe der unteren Achse",
        },
      },
      color: {
        name: "color",
        info: {
          en: "Color of the coordinate system in hexadecimal format (e.g. 0xff0000)",
          de: "Farbe des Koordinatensystems im Hexadezimalformat (z.B. 0xff0000)",
        },
      },
      arrowLength: {
        name: "arrowLength",
        info: {
          en: "Length of the arrow head in pixels",
          de: "Länge der Pfeilspitze in Pixeln",
        },
      },
      arrowWidth: {
        name: "arrowWidth",
        info: {
          en: "Width of the arrow head in pixels",
          de: "Breite der Pfeilspitze in Pixeln",
        },
      },
      thickness: {
        name: "thickness",
        info: {
          en: "Line thickness in pixels",
          de: "Linienstärke in Pixeln",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      rotation: {
        name: "rotation",
        info: {
          en: "Rotation of the element in degrees",
          de: "Drehung des Elements in Grad",
        },
        example: "rotation = 45",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = false",
      },
    },
    methods: {
      setColor: {
        example: "setColor(0xff0000)",
        info: {
          en: "Changes the color of the coordinate system",
          de: "Ändert die Farbe des Koordinatensystems",
        },
      },
      setThickness: {
        example: "setThickness(2)",
        info: {
          en: "Sets the line thickness",
          de: "Setzt die Linienstärke",
        },
      },
    },
  };

  constructor(
    sizeLeft = 100,
    sizeRight = 100,
    sizeTop = 100,
    sizeBottom = 100,
    color = 0xff0000,
    arrowLength = 10,
    arrowWidth = 6,
    thickness = 1,
  ) {
    super();
    this._sizeLeft = sizeLeft;
    this._sizeRight = sizeRight;
    this._sizeTop = sizeTop;
    this._sizeBottom = sizeBottom;
    this._arrowLength = arrowLength;
    this._arrowWidth = arrowWidth;
    this._color = color;
    this._thickness = thickness;

    this._arrows = { top: null, bottom: null, left: null, right: null };

    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (!this._group) return;
    for (const key of ["top", "bottom", "left", "right"]) {
      if (this._arrows[key]) {
        this._arrows[key].destroy();
        this._arrows[key] = null;
      }
    }

    if (this._sizeTop !== 0) {
      this._arrows.top = new SvgJSEdu.Arrow(
        0,
        0,
        0,
        -this._sizeTop,
        this._color,
        this._thickness,
        this._arrowLength,
        this._arrowWidth,
      );
      this._group.add(this._arrows.top._group);
    }
    if (this._sizeBottom !== 0) {
      this._arrows.bottom = new SvgJSEdu.Arrow(
        0,
        0,
        0,
        this._sizeBottom,
        this._color,
        this._thickness,
        this._arrowLength,
        this._arrowWidth,
      );
      this._group.add(this._arrows.bottom._group);
    }
    if (this._sizeLeft !== 0) {
      this._arrows.left = new SvgJSEdu.Arrow(
        0,
        0,
        -this._sizeLeft,
        0,
        this._color,
        this._thickness,
        this._arrowLength,
        this._arrowWidth,
      );
      this._group.add(this._arrows.left._group);
    }
    if (this._sizeRight !== 0) {
      this._arrows.right = new SvgJSEdu.Arrow(
        0,
        0,
        this._sizeRight,
        0,
        this._color,
        this._thickness,
        this._arrowLength,
        this._arrowWidth,
      );
      this._group.add(this._arrows.right._group);
    }
  }

  setColor(color) {
    this._color = color;
    for (const key of ["top", "bottom", "left", "right"]) {
      if (this._arrows[key]) this._arrows[key].setColor(color);
    }
    return this;
  }

  setThickness(thickness) {
    this._thickness = thickness;
    for (const key of ["top", "bottom", "left", "right"]) {
      if (this._arrows[key]) this._arrows[key].setThickness(thickness);
    }
    return this;
  }
};

// ============================================================================
// SimpleSVG – Inline SVG image element
// ============================================================================

SvgJSEdu.SimpleSVG = class SimpleSVG extends SvgJSElement {
  static serializationMap = {
    description: { de: "SVG-Grafik als Objekt", en: "SVG graphic as object" },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: 'let mySVG = new SimpleSVG("<svg>...</svg>");',
    constructor: {
      svgString: {
        name: "svgString",
        info: {
          en: "Content of the SVG file",
          de: "Inhalt der SVG-Datei",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      rotation: {
        name: "rotation",
        info: {
          en: "Rotation of the element in degrees",
          de: "Drehung des Elements in Grad",
        },
        example: "rotation = 45",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = true",
      },
      maintainStrokeWidth: {
        name: "maintainStrokeWidth",
        info: {
          en: "Strokes maintain their original thickness when scaling",
          de: "Konturen behalten ihre ursprüngliche Stärke beim Skalieren",
        },
        example: "maintainStrokeWidth = true",
      },
      resolution: {
        name: "resolution",
        info: {
          en: "Rendering resolution (1-4, higher = sharper but more memory)",
          de: "Rendering-Auflösung (1-4, höher = schärfer aber mehr Speicher)",
        },
        example: "resolution = 2",
      },
    },
    methods: {
      setScale: {
        name: "setScale",
        info: {
          en: "Scales the element (scaleX, scaleY). Use equal values for proportional scaling (1.0 = original size). Strokes are not scaled by default. Pass true as last parameter to scale strokes too.",
          de: "Skaliert das Element (scaleX, scaleY). Gleiche Werte für proportionale Skalierung verwenden (1.0 = Originalgröße). Konturen werden standardmäßig nicht mitskaliert. Übergebe true als letzten Parameter, um Konturen mitzuskalieren.",
        },
        example: "setScale(1.5, 1.5)",
      },
      setAlpha: {
        name: "setAlpha",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
        example: "setAlpha(0.5)",
      },
      setRotationPoint: {
        example: "setRotationPoint(0, 0)",
        info: {
          en: "Sets the rotation pivot point (x, y in pixels relative to the origin of the element)",
          de: "Setzt den Drehpunkt (x, y in Pixeln relativ zum Elementursprung)",
        },
      },
      setTransformationPoint: {
        name: "setTransformationPoint",
        example: "setTransformationPoint(0, 0)",
        info: {
          en: "Sets the anchor point for positioning (x, y in pixels relative to the element)",
          de: "Setzt den Ankerpunkt für die Positionierung (x, y in Pixeln relativ zum Element)",
        },
      },
      removeFromParent: {
        name: "removeFromParent",
        info: {
          en: "Removes the element from its parent container",
          de: "Entfernt das Element aus seinem übergeordneten Container",
        },
        example: "removeFromParent()",
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      onMouseDown: {
        example:
          'onMouseDown(handleMouseDown); \n\nfunction handleMouseDown() { console.log("Mouse button pressed"); }',
        info: {
          en: "Defines a function to execute when the mouse button is pressed down on the element.",
          de: "Legt fest, welche Funktion beim Drücken der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseUp: {
        example:
          'onMouseUp(handleMouseUp); \n\nfunction handleMouseUp() { console.log("Mouse button released"); }',
        info: {
          en: "Defines a function to execute when the mouse button is released on the element.",
          de: "Legt fest, welche Funktion beim Loslassen der Maustaste auf dem Element ausgeführt wird.",
        },
      },
      onMouseOver: {
        example:
          'onMouseOver(handleMouseOver); \n\nfunction handleMouseOver() { console.log("Mouse entered element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor enters the element.",
          de: "Legt fest, welche Funktion beim Überfahren des Elements mit der Maus ausgeführt wird.",
        },
      },
      onMouseOut: {
        example:
          'onMouseOut(handleMouseOut); \n\nfunction handleMouseOut() { console.log("Mouse left element"); }',
        info: {
          en: "Defines a function to execute when the mouse cursor leaves the element.",
          de: "Legt fest, welche Funktion beim Verlassen des Elements mit der Maus ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
      onDragStart: {
        example:
          'onDragStart(handleDragStart); \n\nfunction handleDragStart() { console.log("Started dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging starts",
          de: "Setzt eine Callback-Funktion, die beim Start des Ziehens ausgeführt wird",
        },
      },
      onDrag: {
        example:
          'onDrag(handleDrag); \n\nfunction handleDrag() { console.log("Element is being dragged"); }',
        info: {
          en: "Sets a callback function that is executed while the element is being dragged",
          de: "Setzt eine Callback-Funktion, die während des Ziehens des Elements ausgeführt wird",
        },
      },
      onDragEnd: {
        example:
          'onDragEnd(handleDragEnd); \n\nfunction handleDragEnd() { console.log("Stopped dragging element"); }',
        info: {
          en: "Sets a callback function that is executed when dragging ends",
          de: "Setzt eine Callback-Funktion, die beim Ende des Ziehens ausgeführt wird",
        },
      },
    },
  };

  static textureCache = new Map();
  static MAX_CACHE_SIZE = 50;

  static clearCache() {
    SimpleSVG.textureCache.clear();
  }

  constructor(svgString) {
    super();
    this._originalSvgString = svgString;
    this._maintainStrokeWidth = true;
    this._resolution = 2;
    this._svgNestedGroup = null;
    this._originalDimensions = null;

    this._loadSVG();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  /**
   * Parst einen viewBox-String "minX minY width height" in ein Objekt.
   */
  _parseViewBox(viewBoxStr) {
    if (!viewBoxStr) return null;
    const parts = viewBoxStr.trim().split(/[\s,]+/);
    if (parts.length >= 4) {
      return {
        x: parseFloat(parts[0]),
        y: parseFloat(parts[1]),
        width: parseFloat(parts[2]),
        height: parseFloat(parts[3]),
      };
    }
    return null;
  }

  /**
   * Extrahiert die originalen Dimensionen aus dem geparsten SVG-Element.
   * Liest width/height als String-Attribute und fällt auf viewBox zurück.
   */
  _extractOriginalDimensions(svgEl) {
    let width = null;
    let height = null;

    if (svgEl.hasAttribute("width")) {
      width = parseFloat(svgEl.getAttribute("width"));
      if (isNaN(width)) width = null;
    }
    if (svgEl.hasAttribute("height")) {
      height = parseFloat(svgEl.getAttribute("height"));
      if (isNaN(height)) height = null;
    }

    if ((!width || !height) && svgEl.hasAttribute("viewBox")) {
      const vb = this._parseViewBox(svgEl.getAttribute("viewBox"));
      if (vb) {
        width = width || vb.width;
        height = height || vb.height;
      }
    }

    return {
      width: width || 100,
      height: height || 100,
    };
  }

_loadSVG() {
  if (!this._originalSvgString) return;

  try {
    let svgString = this._originalSvgString;

    // --- 1) Prolog bereinigen -------------------------------------------
    // Ein DOMParser im XML-Modus verlangt, dass VOR <?xml ...?> nichts
    // steht (kein Whitespace, Umbruch oder BOM), sonst:
    // "XML declaration allowed only at the start of the document".
    // Für Inline-SVG ist der Prolog irrelevant und wird entfernt.
    svgString = svgString
      .replace(/^\uFEFF/, "")               // Byte-Order-Mark
      .replace(/^\s+/, "")                  // führende Leerzeichen/Umbrüche
      .replace(/^<\?xml[^>]*\?>\s*/i, "")   // XML-Deklaration
      .replace(/^<!DOCTYPE[^>]*>\s*/i, ""); // optionales DOCTYPE

    // --- 2) Namespace-Präfixe absichern ---------------------------------
    // Optimierer (SVGO / Illustrator "Web-optimiert") entfernen oft
    // xmlns:xlink, lassen aber xlink:href stehen -> "unbound prefix".
    // Wir schreiben xlink:href auf das moderne href um ...
    svgString = svgString.replace(/\bxlink:href\b/g, "href");
    // ... und deklarieren xlink notfalls nach, falls noch ein anderes
    // xlink:-Attribut (z. B. xlink:title) übrig ist.
    if (/\bxlink:/.test(svgString) && !/xmlns:xlink/.test(svgString)) {
      svgString = svgString.replace(
        /<svg\b/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"',
      );
    }

    // --- 3) Default-Namespace absichern ---------------------------------
    // Ohne SVG-Namespace behandelt der DOMParser die Elemente als
    // generisches XML und der Browser rendert nichts.
    if (!/xmlns\s*=/.test(svgString)) {
      svgString = svgString.replace(
        /<svg\b/,
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    }

    // --- 4) Parsen ------------------------------------------------------
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svgEl = doc.documentElement;

    if (
      svgEl.tagName === "parsererror" ||
      svgEl.querySelector("parsererror")
    ) {
      // textContent liefert die konkrete Parser-Meldung -> bessere Diagnose.
      console.error(
        "Fehler beim Parsen des SVG-Strings:",
        svgEl.textContent,
      );
      return;
    }

    this._originalDimensions = this._extractOriginalDimensions(svgEl);
    const dims = this._originalDimensions;

    if (this._svgNestedGroup) {
      this._svgNestedGroup.remove();
      this._svgNestedGroup = null;
    }

    const ns = "http://www.w3.org/2000/svg";
    const nestedSvg = document.createElementNS(ns, "svg");

    if (svgEl.hasAttribute("viewBox")) {
      nestedSvg.setAttribute("viewBox", svgEl.getAttribute("viewBox"));
    } else {
      nestedSvg.setAttribute("viewBox", `0 0 ${dims.width} ${dims.height}`);
    }

    nestedSvg.setAttribute("width", dims.width);
    nestedSvg.setAttribute("height", dims.height);
    nestedSvg.setAttribute("x", "0");
    nestedSvg.setAttribute("y", "0");
    nestedSvg.setAttribute("overflow", "visible");

    while (svgEl.firstChild) {
      nestedSvg.appendChild(svgEl.firstChild);
    }

    this._group.node.appendChild(nestedSvg);

    this._svgNestedGroup = SVG(nestedSvg);

    if (this._maintainStrokeWidth) {
      this.maintainStrokeWidth = true;
    }

    if (this._scaleX !== 1 || this._scaleY !== 1) {
      this._applyScale();
    }
  } catch (error) {
    console.error("Fehler beim Laden des SVG:", error);
  }
}

  set maintainStrokeWidth(value) {
    this._maintainStrokeWidth = value;
    if (this._svgNestedGroup) {
      const elements = this._svgNestedGroup.node.querySelectorAll("[stroke]");
      elements.forEach((el) => {
        if (value) {
          el.setAttribute("vector-effect", "non-scaling-stroke");
        } else {
          el.removeAttribute("vector-effect");
        }
      });
    }
  }

  get maintainStrokeWidth() {
    return this._maintainStrokeWidth;
  }

  set resolution(value) {
    this._resolution = Math.max(1, Math.min(4, value));
  }

  get resolution() {
    return this._resolution;
  }

  getOriginalWidth() {
    if (this._originalDimensions) {
      return this._originalDimensions.width;
    }
    return 0;
  }

  getOriginalHeight() {
    if (this._originalDimensions) {
      return this._originalDimensions.height;
    }
    return 0;
  }

  getCurrentWidth() {
    return this.getOriginalWidth() * this._scaleX;
  }

  getCurrentHeight() {
    return this.getOriginalHeight() * this._scaleY;
  }

  // SimpleSVG handles scaling via element resize in _applyScale(),
  // so _updateTransform() must NOT include scale() in the transform.
  _updateTransform() {
    if (!this._group) return;

    const scaledPivotX = this._rotationPivotX * this._scaleX;
    const scaledPivotY = this._rotationPivotY * this._scaleY;

    const rpWorldX = this._visualX + scaledPivotX - this._pivotX;
    const rpWorldY = this._visualY + scaledPivotY - this._pivotY;

    let transform = `translate(${rpWorldX}, ${rpWorldY})`;

    if (this._rotationDegrees !== 0) {
      transform += ` rotate(${this._rotationDegrees})`;
    }

    transform += ` translate(${-scaledPivotX}, ${-scaledPivotY})`;

    this._group.attr("transform", transform);
  }

  _applyScale() {
    if (this._svgNestedGroup) {
      const dims = this._originalDimensions;
      if (dims) {
        this._svgNestedGroup.size(
          dims.width * this._scaleX,
          dims.height * this._scaleY,
        );
      }
    }
  }
};

// ============================================================================
// SimplePNG – PNG image as object
// ============================================================================

SvgJSEdu.SimplePNG = class SimplePNG extends SvgJSElement {
  static serializationMap = {
    description: { de: "PNG-Bild als Objekt", en: "PNG image as object" },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: 'let myPNG = new SimplePNG("image.png");',
    constructor: {
      pngContent: {
        name: "pngContent",
        info: {
          en: "Source of the PNG image (URL or Base64)",
          de: "Quelle des PNG-Bildes (URL oder Base64)",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the element in pixels",
          de: "Horizontale Position des Elements in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the element in pixels",
          de: "Vertikale Position des Elements in Pixeln",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true = visible, false = hidden)",
          de: "Sichtbarkeit des Elements (true = sichtbar, false = unsichtbar)",
        },
        example: "visible = true",
      },
      alpha: {
        name: "alpha",
        info: {
          en: "Transparency of the image (0.0 to 1.0)",
          de: "Transparenz des Bildes (0.0 bis 1.0)",
        },
        example: "alpha = 0.5",
      },
    },
    methods: {
      setScale: {
        name: "setScale",
        info: {
          en: "Scales the element (scaleX, scaleY). Use equal values for proportional scaling (1.0 = original size). Strokes are not scaled by default. Pass true as last parameter to scale strokes too.",
          de: "Skaliert das Element (scaleX, scaleY). Gleiche Werte für proportionale Skalierung verwenden (1.0 = Originalgröße). Konturen werden standardmäßig nicht mitskaliert. Übergebe true als letzten Parameter, um Konturen mitzuskalieren.",
        },
        example: "setScale(1.5, 1.5)",
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      setRotationPoint: {
        example: "setRotationPoint(0, 0)",
        info: {
          en: "Sets the rotation pivot point (x, y in pixels relative to the origin of the element)",
          de: "Setzt den Drehpunkt (x, y in Pixeln relativ zum Elementursprung)",
        },
      },
      setTransformationPoint: {
        name: "setTransformationPoint",
        example: "setTransformationPoint(0, 0)",
        info: {
          en: "Sets the anchor point for positioning (x, y in pixels relative to the element)",
          de: "Setzt den Ankerpunkt für die Positionierung (x, y in Pixeln relativ zum Element)",
        },
      },
      removeFromParent: {
        name: "removeFromParent",
        info: {
          en: "Removes the element from its parent container",
          de: "Entfernt das Element aus seinem übergeordneten Container",
        },
        example: "removeFromParent()",
      },
    },
  };

  constructor(pngContent) {
    super();
    this._pngContent = pngContent;
    this._imageElement = null;
    this._originalDimensions = null;

    this._loadPNGImage();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _loadPNGImage() {
    if (!this._pngContent) {
      console.error("Keine Bildquelle angegeben");
      return;
    }

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        if (!this._originalDimensions) {
          this._originalDimensions = { width: img.width, height: img.height };
        }

        if (this._imageElement) {
          this._imageElement.remove();
        }

        this._imageElement = this._group.image(this._pngContent);
        this._imageElement.size(img.width, img.height);

        if (this._scaleX !== 1 || this._scaleY !== 1) {
          this._applyScale();
        }
      };

      img.onerror = (err) => {
        console.error("Fehler beim Laden des PNG-Bildes:", err);
        console.error("Bildquelle:", this._pngContent);
      };

      img.src = this._pngContent;
    } catch (error) {
      console.error("Fehler beim Erstellen des PNG-Bildes:", error);
    }
  }

  getOriginalWidth() {
    return this._originalDimensions ? this._originalDimensions.width : 0;
  }

  getOriginalHeight() {
    return this._originalDimensions ? this._originalDimensions.height : 0;
  }

  getCurrentWidth() {
    return this.getOriginalWidth() * this._scaleX;
  }

  getCurrentHeight() {
    return this.getOriginalHeight() * this._scaleY;
  }

  // SimplePNG handles scaling via element resize in _applyScale(),
  // so _updateTransform() must NOT include scale() in the transform.
  _updateTransform() {
    if (!this._group) return;

    const scaledPivotX = this._rotationPivotX * this._scaleX;
    const scaledPivotY = this._rotationPivotY * this._scaleY;

    const rpWorldX = this._visualX + scaledPivotX - this._pivotX;
    const rpWorldY = this._visualY + scaledPivotY - this._pivotY;

    let transform = `translate(${rpWorldX}, ${rpWorldY})`;

    if (this._rotationDegrees !== 0) {
      transform += ` rotate(${this._rotationDegrees})`;
    }

    transform += ` translate(${-scaledPivotX}, ${-scaledPivotY})`;

    this._group.attr("transform", transform);
  }

  _applyScale() {
    if (this._imageElement && this._originalDimensions) {
      this._imageElement.size(
        this._originalDimensions.width * this._scaleX,
        this._originalDimensions.height * this._scaleY,
      );
    }
  }

};

// ============================================================================
// Timer – Animation with keyframes and easing
// ============================================================================

SvgJSEdu.Timer = class Timer {
  static serializationMap = {
    description: {
      de: "Timer für Animationen",
      en: "Timer for animations",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myTimer = new Timer(5000, true, false);",
    constructor: {
      duration: {
        name: "duration",
        info: {
          en: "Duration of the animation in milliseconds (leave empty for infinite)",
          de: "Dauer der Animation in Millisekunden (leer lassen für unendlich)",
        },
      },
      loop: {
        name: "loop",
        info: {
          en: "Determines whether the animation repeats endlessly (true/false)",
          de: "Bestimmt, ob die Animation endlos wiederholt wird (true/false)",
        },
      },
      autoStart: {
        name: "autoStart",
        info: {
          en: "Starts the animation automatically upon creation (true/false)",
          de: "Startet die Animation automatisch bei Erstellung (true/false)",
        },
      },
    },
    setter: {},
    methods: {
      start: {
        example: "start()",
        info: { en: "Starts the timer", de: "Startet den Timer" },
      },
      stop: {
        example: "stop()",
        info: { en: "Stops the timer", de: "Stoppt den Timer" },
      },
      pause: {
        example: "pause()",
        info: { en: "Pauses the timer", de: "Pausiert den Timer" },
      },
      resume: {
        example: "resume()",
        info: {
          en: "Resumes a paused timer",
          de: "Setzt einen pausierten Timer fort",
        },
      },
      reset: {
        example: "reset()",
        info: {
          en: "Resets the timer to the beginning",
          de: "Setzt den Timer zurück auf den Anfang",
        },
      },
      addAnimation: {
        example: 'addAnimation(myObject, "x", 100, 300)',
        info: {
          en: "Adds an animation: object, property, start value, end value",
          de: "Fügt eine Animation hinzu: Objekt, Eigenschaft, Startwert, Endwert",
        },
      },
      addKeyframeAnimation: {
        example:
          'addKeyframeAnimation(myObject, "alpha", [{time: 0, value: 0}, {time: 0.5, value: 1}, {time: 1, value: 0}])',
        info: {
          en: "Adds a keyframe animation. Parameters: target object, property name as string, list of keyframes, each with time (0 to 1) and value (see example)",
          de: "Fügt eine Keyframe-Animation hinzu. Parameter: Zielobjekt, Eigenschaftsname als String, Liste von Keyframes mit jeweils time (0 bis 1) und value (siehe Beispiel)",
        },
      },
      setEasing: {
        example: 'setEasing("easeInOut")',
        info: {
          en: 'Sets the easing function: "linear", "easeIn", "easeOut", "easeInOut", "bounce"',
          de: 'Setzt die Easing-Funktion: "linear", "easeIn", "easeOut", "easeInOut", "bounce"',
        },
      },
      onComplete: {
        example:
          'onComplete(animationFinished);\nfunction animationFinished() { console.log("Animation fertig!"); }',
        info: {
          en: "Registers a callback function that executes when the animation is finished",
          de: "Registriert eine Callback-Funktion, die ausgeführt wird, wenn die Animation beendet ist",
        },
      },
      onUpdate: {
        example:
          'onUpdate(handleProgress);\nfunction handleProgress() { console.log("Progress"); }',
        info: {
          en: "Registers a callback function that is called on every frame and receives the progress (0 to 1). With an endless timer the progress always stays 0 – use getElapsedTime() instead",
          de: "Registriert eine Callback-Funktion, die bei jedem Frame aufgerufen wird und den Fortschritt (0 bis 1) erhält. Beim Endlos-Timer bleibt der Fortschritt immer 0 – dann getElapsedTime() verwenden",
        },
      },
      setProgress: {
        example: "setProgress(0.5)",
        info: {
          en: "Sets the animation progress directly (0.0 to 1.0)",
          de: "Setzt den Fortschritt der Animation direkt (0.0 bis 1.0)",
        },
      },
      getProgress: {
        example: "getProgress()",
        info: {
          en: "Returns the current progress from 0 to 1 (with an endless timer always 0)",
          de: "Gibt den aktuellen Fortschritt von 0 bis 1 zurück (beim Endlos-Timer immer 0)",
        },
      },
      getElapsedTime: {
        example: "getElapsedTime()",
        info: {
          en: "Returns the elapsed time in milliseconds since the start. Ideal for endless timers",
          de: "Gibt die seit dem Start vergangene Zeit in Millisekunden zurück. Ideal für Endlos-Timer",
        },
      },
      getRemainingTime: {
        example: "getRemainingTime()",
        info: {
          en: "Returns the remaining time in milliseconds (with an endless timer Infinity)",
          de: "Gibt die verbleibende Zeit in Millisekunden zurück (beim Endlos-Timer Infinity)",
        },
      },
      isRunning: {
        example: "isRunning()",
        info: {
          en: "Returns true while the timer is running and not paused",
          de: "Gibt true zurück, solange der Timer läuft und nicht pausiert ist",
        },
      },
      isPaused: {
        example: "isPaused()",
        info: {
          en: "Returns true while the timer is paused",
          de: "Gibt true zurück, solange der Timer pausiert ist",
        },
      },
      setDuration: {
        example: "setDuration(3000)",
        info: {
          en: "Changes the duration in milliseconds (null = endless)",
          de: "Ändert die Dauer in Millisekunden (null = endlos)",
        },
      },
      setLoop: {
        example: "setLoop(true)",
        info: {
          en: "Switches repetition on or off (true/false)",
          de: "Schaltet die Wiederholung ein oder aus (true/false)",
        },
      },
      clearAnimations: {
        example: "clearAnimations()",
        info: {
          en: "Removes all animations and keyframe animations added to the timer",
          de: "Entfernt alle hinzugefügten Animationen und Keyframe-Animationen",
        },
      },
    },
  };

  // Running timers. runCode() stops them before a new run, so callbacks of a previous run
  // cannot keep drawing onto the new board (objects register with BoardSVG[INSTANCE_KEY]).
  static _running = new Set();

  static stopAll() {
    [...Timer._running].forEach((t) => t.stop());
    Timer._running.clear();
  }

  constructor(duration = null, loop = false, autoStart = false) {
    this._board = Timer._activeBoard();
    this._duration = duration;
    this._loop = loop;
    this._autoStart = autoStart;
    this._isRunning = false;
    this._isPaused = false;
    this._startTime = 0;
    this._pausedTime = 0;
    this._currentTime = 0;
    this._progress = 0;
    this._animations = [];
    this._keyframeAnimations = [];
    this._easingFunction = "linear";
    this._onCompleteCallback = null;
    this._onUpdateCallback = null;
    this._animationFrameId = null;

    if (this._autoStart) {
      this.start();
    }
  }

  start() {
    if (this._isRunning && !this._isPaused) return this;
    if (this._isPaused) {
      this._startTime = Date.now() - this._pausedTime;
      this._isPaused = false;
    } else {
      this._startTime = Date.now();
      this._currentTime = 0;
      this._progress = 0;
    }
    this._isRunning = true;
    this._startUpdateLoop();
    return this;
  }

  stop() {
    this._isRunning = false;
    this._isPaused = false;
    this._stopUpdateLoop();
    return this;
  }

  pause() {
    if (!this._isRunning || this._isPaused) return this;
    this._isPaused = true;
    this._pausedTime = this._currentTime;
    this._stopUpdateLoop();
    return this;
  }

  resume() {
    if (!this._isPaused) return this;
    this.start();
    return this;
  }

  reset() {
    this.stop();
    this._currentTime = 0;
    this._progress = 0;
    this._pausedTime = 0;
    this._applyAnimations(0);
    return this;
  }

  addAnimation(targetObject, property, startValue, endValue) {
    this._animations.push({
      target: targetObject,
      property: property,
      startValue: startValue,
      endValue: endValue,
    });
    return this;
  }

  addKeyframeAnimation(targetObject, property, keyframes) {
    const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
    this._keyframeAnimations.push({
      target: targetObject,
      property: property,
      keyframes: sortedKeyframes,
    });
    return this;
  }

  setEasing(easingType) {
    this._easingFunction = easingType;
    return this;
  }

  onComplete(callback) {
    this._onCompleteCallback = callback;
    return this;
  }

  onUpdate(callback) {
    this._onUpdateCallback = callback;
    return this;
  }

  setProgress(progress) {
    this._progress = Math.max(0, Math.min(1, progress));
    if (this._duration !== null) {
      this._currentTime = this._progress * this._duration;
    }
    this._applyAnimations(this._progress);
    if (this._onUpdateCallback) {
      this._onUpdateCallback(this._progress);
    }
    return this;
  }

  static _activeBoard() {
    return typeof BoardSVG !== "undefined" && typeof INSTANCE_KEY !== "undefined"
      ? BoardSVG[INSTANCE_KEY] || null
      : null;
  }

  // The board this timer belongs to is gone (code was run again): stop for good.
  _boardGone() {
    const b = Timer._activeBoard();
    if (!this._board) {
      this._board = b;
      return false;
    }
    return b !== this._board;
  }

  _startUpdateLoop() {
    Timer._running.add(this);
    this._animationFrameLoop();
  }

  _stopUpdateLoop() {
    Timer._running.delete(this);
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  _animationFrameLoop() {
    if (this._isRunning && !this._isPaused) {
      if (this._boardGone()) {
        this.stop();
        return;
      }
      this._update();
      this._animationFrameId = requestAnimationFrame(() =>
        this._animationFrameLoop(),
      );
    }
  }

  destroy() {
    this.stop();
    this._animations = [];
    this._keyframeAnimations = [];
    this._onCompleteCallback = null;
    this._onUpdateCallback = null;
  }

  _update() {
    if (!this._isRunning || this._isPaused) return;
    this._currentTime = Date.now() - this._startTime;

    if (this._duration === null) {
      // Infinite timer: just call onUpdate every frame
      if (this._onUpdateCallback) {
        this._onUpdateCallback(this._progress);
      }
    } else {
      this._progress = Math.min(this._currentTime / this._duration, 1);
      this._applyAnimations(this._progress);

      if (this._onUpdateCallback) {
        this._onUpdateCallback(this._progress);
      }

      if (this._progress >= 1) {
        if (this._loop) {
          this._startTime = Date.now();
          this._currentTime = 0;
          this._progress = 0;
        } else {
          this.stop();
          if (this._onCompleteCallback) {
            this._onCompleteCallback();
          }
        }
      }
    }
  }

  _applyAnimations(progress) {
    const easedProgress = this._applyEasing(progress);
    this._animations.forEach((anim) => {
      const value =
        anim.startValue + (anim.endValue - anim.startValue) * easedProgress;
      anim.target[anim.property] = value;
    });
    this._keyframeAnimations.forEach((anim) => {
      const value = this._interpolateKeyframes(anim.keyframes, progress);
      anim.target[anim.property] = value;
    });
  }

  _interpolateKeyframes(keyframes, progress) {
    if (keyframes.length === 0) return 0;
    if (keyframes.length === 1) return keyframes[0].value;

    let startKeyframe = keyframes[0];
    let endKeyframe = keyframes[keyframes.length - 1];
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (progress >= keyframes[i].time && progress <= keyframes[i + 1].time) {
        startKeyframe = keyframes[i];
        endKeyframe = keyframes[i + 1];
        break;
      }
    }
    const localProgress =
      (progress - startKeyframe.time) / (endKeyframe.time - startKeyframe.time);
    const easedLocalProgress = this._applyEasing(
      Math.max(0, Math.min(1, localProgress)),
    );
    return (
      startKeyframe.value +
      (endKeyframe.value - startKeyframe.value) * easedLocalProgress
    );
  }

  _applyEasing(t) {
    switch (this._easingFunction) {
      case "linear":
        return t;
      case "easeIn":
        return t * t;
      case "easeOut":
        return 1 - (1 - t) * (1 - t);
      case "easeInOut":
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case "bounce":
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
          return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
          return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
      default:
        return t;
    }
  }

  getProgress() {
    return this._progress;
  }

  getElapsedTime() {
    return this._currentTime;
  }

  getRemainingTime() {
    if (this._duration === null) return Infinity;
    return Math.max(0, this._duration - this._currentTime);
  }

  isRunning() {
    return this._isRunning && !this._isPaused;
  }

  isPaused() {
    return this._isPaused;
  }

  setDuration(duration) {
    this._duration = duration;
    return this;
  }

  setLoop(loop) {
    this._loop = loop;
    return this;
  }

  clearAnimations() {
    this._animations = [];
    this._keyframeAnimations = [];
    return this;
  }

  destroy() {
    this.stop();
    this._animations = [];
    this._keyframeAnimations = [];
    this._onCompleteCallback = null;
    this._onUpdateCallback = null;
  }
};

// ============================================================================
// Particles – High-performance renderer for large numbers of particles
//
// SVG counterpart of PixiJSEdu.Particles. Each particle is a lightweight
// <circle> element inside a single <g> group. No SvgJSElement overhead
// (no event handling, no pivot calculation).
//
// API-compatible with the PixiJSEdu version so user code works on both
// renderers without changes.
// ============================================================================

SvgJSEdu.Particles = class Particles {
  static serializationMap = {
    description: {
      de: "Hochperformantes Partikelsystem für viele gleichartige Partikel",
      en: "High-performance particle system for many uniform particles",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myParticles = new Particles(1000, 3, 0xffffff);",
    constructor: {
      count: {
        name: "count",
        info: {
          en: "Number of particles to pre-allocate",
          de: "Anzahl der vorab zu erzeugenden Partikel",
        },
      },
      radius: {
        name: "radius",
        info: {
          en: "Radius of each particle in pixels",
          de: "Radius jedes Partikels in Pixeln",
        },
      },
      color: {
        name: "color",
        info: {
          en: "Default color for all particles (hex, e.g. 0xff0000). Default: 0xffffff",
          de: "Standardfarbe aller Partikel (hex, z.B. 0xff0000). Standard: 0xffffff",
        },
      },
    },
    setter: {},
    methods: {
      setPosition: {
        example: "setPosition(0, 100, 200)",
        info: {
          en: "Sets the position of particle at the given index",
          de: "Setzt die Position des Partikels am angegebenen Index",
        },
      },
      setX: {
        example: "setX(0, 100)",
        info: {
          en: "Sets the x-coordinate of particle at the given index",
          de: "Setzt die x-Koordinate des Partikels am angegebenen Index",
        },
      },
      setY: {
        example: "setY(0, 200)",
        info: {
          en: "Sets the y-coordinate of particle at the given index",
          de: "Setzt die y-Koordinate des Partikels am angegebenen Index",
        },
      },
      getX: {
        example: "getX(0)",
        info: {
          en: "Returns the x-coordinate of particle at the given index",
          de: "Gibt die x-Koordinate des Partikels am angegebenen Index zurück",
        },
      },
      getY: {
        example: "getY(0)",
        info: {
          en: "Returns the y-coordinate of particle at the given index",
          de: "Gibt die y-Koordinate des Partikels am angegebenen Index zurück",
        },
      },
      setColor: {
        example: "setColor(0, 0xff0000)",
        info: {
          en: "Sets the color of particle at the given index",
          de: "Setzt die Farbe des Partikels am angegebenen Index",
        },
      },
      setAlpha: {
        example: "setAlpha(0, 0.5)",
        info: {
          en: "Sets the opacity of particle at the given index (0 = invisible, 1 = fully visible)",
          de: "Setzt die Transparenz des Partikels am angegebenen Index (0 = unsichtbar, 1 = vollständig sichtbar)",
        },
      },
      getAlpha: {
        example: "getAlpha(0)",
        info: {
          en: "Returns the opacity of particle at the given index",
          de: "Gibt die Transparenz des Partikels am angegebenen Index zurück",
        },
      },
      setScale: {
        example: "setScale(0, 2.0)",
        info: {
          en: "Sets the scale factor of particle at the given index (1.0 = original size)",
          de: "Setzt den Skalierungsfaktor des Partikels am angegebenen Index (1.0 = Originalgröße)",
        },
      },
      setRadius: {
        example: "setRadius(0, 5)",
        info: {
          en: "Sets an individual radius for the particle",
          de: "Setzt einen individuellen Radius für das Partikel",
        },
      },
      setVisible: {
        example: "setVisible(0, false)",
        info: {
          en: "Shows or hides particle at the given index",
          de: "Zeigt oder versteckt das Partikel am angegebenen Index",
        },
      },
      getElement: {
        example: "getElement(0)",
        info: {
          en: "Returns the internal SVG circle element for direct access",
          de: "Gibt das interne SVG-Kreiselement für direkten Zugriff zurück",
        },
      },
      addParticle: {
        example: "addParticle(100, 200, 0xff0000)",
        info: {
          en: "Adds a new particle and returns its index",
          de: "Fügt ein neues Partikel hinzu und gibt seinen Index zurück",
        },
      },
      setAllColors: {
        example: "setAllColors(0x00ff00)",
        info: {
          en: "Sets the same color for all particles",
          de: "Setzt dieselbe Farbe für alle Partikel",
        },
      },
      setAllAlphas: {
        example: "setAllAlphas(0.5)",
        info: {
          en: "Sets the same opacity for all particles",
          de: "Setzt dieselbe Transparenz für alle Partikel",
        },
      },
      setAllVisible: {
        example: "setAllVisible(true)",
        info: {
          en: "Shows or hides all particles at once",
          de: "Zeigt oder versteckt alle Partikel auf einmal",
        },
      },
    },
  };

  constructor(count, radius, color) {
    this._count = count;
    this._radius = radius;
    this._defaultColor = color !== undefined ? color : 0xffffff;
    this._group = svgRoot ? svgRoot.group() : null;
    this._circles = new Array(count);
    this._proxies = new Array(count);
    this._alphas = new Float32Array(count);
    for (let i = 0; i < count; i++) this._alphas[i] = 1;

    if (this._group) {
      // Disable pointer events on the entire group for performance
      this._group.attr("pointer-events", "none");
      const hex = colorToHex(this._defaultColor);
      for (let i = 0; i < count; i++) {
        this._circles[i] = this._group
          .circle(radius * 2)
          .cx(0)
          .cy(0)
          .fill(hex)
          .attr("pointer-events", "none");
      }
    }

    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  get count() {
    return this._count;
  }

  get radius() {
    return this._radius;
  }

  // ------------------------------------------------------------------
  // Per-particle accessors
  // ------------------------------------------------------------------

  setPosition(index, x, y) {
    this._circles[index].cx(x).cy(y);
  }

  setX(index, x) {
    this._circles[index].cx(x);
  }

  setY(index, y) {
    this._circles[index].cy(y);
  }

  getX(index) {
    return this._circles[index].cx();
  }

  getY(index) {
    return this._circles[index].cy();
  }

  setColor(index, color) {
    this._circles[index].fill(colorToHex(color));
  }

  setAlpha(index, alpha) {
    this._alphas[index] = alpha;
    this._circles[index].opacity(alpha);
  }

  getAlpha(index) {
    return this._alphas[index];
  }

  setScale(index, scale) {
    this._circles[index].radius(this._radius * scale);
  }

  setRadius(index, r) {
    this._circles[index].radius(r);
  }

  setVisible(index, visible) {
    if (visible) {
      this._circles[index].show();
    } else {
      this._circles[index].hide();
    }
  }

  getElement(index) {
    return this._circles[index];
  }

  getSprite(index) {
    if (!this._proxies[index]) {
      const self = this;
      const i = index;
      this._proxies[i] = {
        _x: 0,
        _y: 0,
        get x() { return this._x; },
        set x(v) { this._x = v; self._circles[i].cx(v); },
        get y() { return this._y; },
        set y(v) { this._y = v; self._circles[i].cy(v); },
        get alpha() { return self._alphas[i]; },
        set alpha(v) { self._alphas[i] = v; self._circles[i].opacity(v); },
        get visible() { return self._circles[i].visible(); },
        set visible(v) { if (v) self._circles[i].show(); else self._circles[i].hide(); },
        get tint() { return 0; },
        set tint(c) { self._circles[i].fill(colorToHex(c)); },
        scale: {
          set: function(s) { self._circles[i].radius(self._radius * s); }
        }
      };
    }
    return this._proxies[index];
  }

  // ------------------------------------------------------------------
  // Dynamic particle creation
  // ------------------------------------------------------------------

  addParticle(x, y, color) {
    const hex = colorToHex(color !== undefined ? color : this._defaultColor);
    const c = this._group
      .circle(this._radius * 2)
      .cx(x || 0)
      .cy(y || 0)
      .fill(hex)
      .attr("pointer-events", "none");
    this._circles.push(c);
    this._proxies.push(null);
    // Grow alpha tracking array
    const newAlphas = new Float32Array(this._count + 1);
    newAlphas.set(this._alphas);
    newAlphas[this._count] = 1;
    this._alphas = newAlphas;
    this._count++;
    return this._count - 1;
  }

  // ------------------------------------------------------------------
  // Bulk operations
  // ------------------------------------------------------------------

  setAllColors(color) {
    const hex = colorToHex(color);
    for (let i = 0; i < this._count; i++) {
      this._circles[i].fill(hex);
    }
  }

  setAllAlphas(alpha) {
    for (let i = 0; i < this._count; i++) {
      this._alphas[i] = alpha;
      this._circles[i].opacity(alpha);
    }
  }

  setAllVisible(visible) {
    for (let i = 0; i < this._count; i++) {
      if (visible) {
        this._circles[i].show();
      } else {
        this._circles[i].hide();
      }
    }
  }

  // ------------------------------------------------------------------
  // Cleanup
  // ------------------------------------------------------------------

  destroy() {
    if (this._group) {
      this._group.remove();
      this._group = null;
    }
    this._circles = null;
    this._alphas = null;
  }
};

// ============================================================================
// Plot – Diagramm mit Wertebereich, Achsen, Strichen, Gitter und Kurven (3.27.0)
// ============================================================================

SvgJSEdu.Plot = class Plot extends SvgJSElement {
  static serializationMap = {
    description: {
      de: "Diagramm mit Wertebereich: zeichnet Achsen mit Pfeilen, Striche mit Zahlen, Gitter, Funktionen, Messkurven und wandernde Punkte. Die Kurven werden in Werten angegeben, nicht in Pixeln",
      en: "Chart with a value range: draws axes with arrows, ticks with numbers, a grid, functions, measured curves and moving points. Curves are given in values, not in pixels",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myPlot = new Plot(100, 100, 600, 400, 0, 10, -5, 5);",
    constructor: {
      x: {
        name: "x",
        info: {
          en: "X coordinate of the top left corner of the chart area in pixels",
          de: "X-Koordinate der linken oberen Ecke der Diagrammfläche in Pixeln",
        },
      },
      y: {
        name: "y",
        info: {
          en: "Y coordinate of the top left corner of the chart area in pixels",
          de: "Y-Koordinate der linken oberen Ecke der Diagrammfläche in Pixeln",
        },
      },
      width: {
        name: "width",
        info: {
          en: "Width of the chart area in pixels (the arrow and the axis title are drawn to the right of it)",
          de: "Breite der Diagrammfläche in Pixeln (Pfeil und Achsentitel stehen rechts daneben)",
        },
      },
      height: {
        name: "height",
        info: {
          en: "Height of the chart area in pixels (the arrow and the axis title are drawn above it)",
          de: "Höhe der Diagrammfläche in Pixeln (Pfeil und Achsentitel stehen darüber)",
        },
      },
      xMin: {
        name: "xMin",
        info: {
          en: "Smallest value on the horizontal axis",
          de: "Kleinster Wert auf der waagerechten Achse",
        },
      },
      xMax: {
        name: "xMax",
        info: {
          en: "Largest value on the horizontal axis",
          de: "Größter Wert auf der waagerechten Achse",
        },
      },
      yMin: {
        name: "yMin",
        info: {
          en: "Smallest value on the vertical axis",
          de: "Kleinster Wert auf der senkrechten Achse",
        },
      },
      yMax: {
        name: "yMax",
        info: {
          en: "Largest value on the vertical axis",
          de: "Größter Wert auf der senkrechten Achse",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the chart area in pixels",
          de: "Horizontale Position der Diagrammfläche in Pixeln",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the chart area in pixels",
          de: "Vertikale Position der Diagrammfläche in Pixeln",
        },
        example: "y = 100",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
        },
        example: "visible = true",
      },
      alpha: {
        name: "alpha",
        info: {
          en: "Transparency of the element (0.0 to 1.0)",
          de: "Transparenz des Elements (0.0 bis 1.0)",
        },
        example: "alpha = 0.5",
      },
    },
    methods: {
      addFunction: {
        example: "let curve = myPlot.addFunction(x => Math.sin(x), 0xc0392b, 3)",
        info: {
          en: "Draws a function y = f(x) over the whole range and returns the curve. If the function uses a variable (for example from a slider), call update() after changing it",
          de: "Zeichnet eine Funktion y = f(x) über den ganzen Bereich und gibt die Kurve zurück. Verwendet die Funktion eine Variable (zum Beispiel von einem Regler), danach update() aufrufen",
        },
      },
      addCurve: {
        example: "let curve = myPlot.addCurve(0x2e86c1, 3)",
        info: {
          en: "Creates an empty curve for measured values and returns it. Curve methods: addPoint(x, y), setPoints(list), clear(), setMaxPoints(n), setColor, setThickness, setDashed(true), setFill(color, alpha), setVisible, remove()",
          de: "Erzeugt eine leere Kurve für Messwerte und gibt sie zurück. Methoden der Kurve: addPoint(x, y), setPoints(liste), clear(), setMaxPoints(n), setColor, setThickness, setDashed(true), setFill(farbe, alpha), setVisible, remove()",
        },
      },
      addPoint: {
        example: "let dot = myPlot.addPoint(2, 1, 0xc0392b, 7)",
        info: {
          en: "Draws a point at the values (x | y) and returns it. Move it with dot.setPosition(x, y). Outside the range it is hidden",
          de: "Zeichnet einen Punkt bei den Werten (x | y) und gibt ihn zurück. Verschieben mit punkt.setPosition(x, y). Außerhalb des Bereichs ist er unsichtbar",
        },
      },
      update: {
        example: "update()",
        info: {
          en: "Recalculates all functions, for example after a slider has changed a parameter",
          de: "Berechnet alle Funktionen neu, zum Beispiel nachdem ein Regler einen Parameter geändert hat",
        },
      },
      setRange: {
        example: "setRange(0, 20, -10, 10)",
        info: {
          en: "Changes the value range (xMin, xMax, yMin, yMax). Axes, ticks, curves and points follow",
          de: "Ändert den Wertebereich (xMin, xMax, yMin, yMax). Achsen, Striche, Kurven und Punkte passen sich an",
        },
      },
      setTicks: {
        example: "setTicks(1, 2)",
        info: {
          en: "Draws ticks with numbers every xStep and yStep. 0 or null switches the ticks of an axis off. Numbers use a decimal comma in German animations",
          de: "Zeichnet Striche mit Zahlen im Abstand xStep und yStep. 0 oder null schaltet die Striche einer Achse aus. Zahlen in deutschen Animationen mit Dezimalkomma",
        },
      },
      setGrid: {
        example: "setGrid(true, 0xdddddd)",
        info: {
          en: "Shows or hides grid lines at the ticks. Optional colour",
          de: "Zeigt oder verbirgt Gitterlinien an den Strichen. Optional mit Farbe",
        },
      },
      setAxisLabels: {
        example: 'setAxisLabels("<i>t</i> in s", "<i>s</i> in m")',
        info: {
          en: "Sets the axis titles next to the arrowheads (supports <b>, <i>, <sub> and <sup>)",
          de: "Setzt die Achsentitel neben den Pfeilspitzen (unterstützt <b>, <i>, <sub> und <sup>)",
        },
      },
      setColor: {
        example: "setColor(0x444444)",
        info: {
          en: "Colour of the axes and ticks",
          de: "Farbe der Achsen und Striche",
        },
      },
      setTextColor: {
        example: "setTextColor(0x444444)",
        info: {
          en: "Colour of the numbers and axis titles",
          de: "Farbe der Zahlen und Achsentitel",
        },
      },
      setFont: {
        example: 'setFont("Arial", 18)',
        info: {
          en: "Font family and size of the numbers and axis titles",
          de: "Schriftart und -größe der Zahlen und Achsentitel",
        },
      },
      setArrows: {
        example: "setArrows(false)",
        info: {
          en: "Shows or hides the arrowheads at the ends of the axes",
          de: "Zeigt oder verbirgt die Pfeilspitzen an den Enden der Achsen",
        },
      },
      setSize: {
        example: "setSize(600, 400)",
        info: {
          en: "Changes the size of the chart area in pixels",
          de: "Ändert die Größe der Diagrammfläche in Pixeln",
        },
      },
      toPixelX: {
        example: "toPixelX(5)",
        info: {
          en: "Returns the x coordinate on the board in pixels for a value, for example to place a text or a picture",
          de: "Gibt die x-Koordinate auf der Zeichenfläche in Pixeln für einen Wert zurück, zum Beispiel um einen Text oder ein Bild zu platzieren",
        },
      },
      toPixelY: {
        example: "toPixelY(2.5)",
        info: {
          en: "Returns the y coordinate on the board in pixels for a value",
          de: "Gibt die y-Koordinate auf der Zeichenfläche in Pixeln für einen Wert zurück",
        },
      },
      toValueX: {
        example: "toValueX(board.mouseX)",
        info: {
          en: "Converts an x coordinate on the board in pixels into a value of the chart",
          de: "Rechnet eine x-Koordinate auf der Zeichenfläche in Pixeln in einen Wert des Diagramms um",
        },
      },
      toValueY: {
        example: "toValueY(300)",
        info: {
          en: "Converts a y coordinate on the board in pixels into a value of the chart",
          de: "Rechnet eine y-Koordinate auf der Zeichenfläche in Pixeln in einen Wert des Diagramms um",
        },
      },
      clear: {
        example: "clear()",
        info: {
          en: "Removes all curves and points. Axes and ticks remain",
          de: "Entfernt alle Kurven und Punkte. Achsen und Striche bleiben",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
    },
  };

  // Text mit <b>, <i>, <sub>, <sup> in Abschnitte zerlegen
  static _segments(text) {
    const src = text === undefined || text === null ? "" : String(text);
    const segments = [];
    const tagRegex = /<\/?(b|i|sub|sup)>/gi;
    let lastIndex = 0;
    let bold = false;
    let italic = false;
    let type = "normal";
    const typeStack = [];
    let match;
    while ((match = tagRegex.exec(src)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ text: src.substring(lastIndex, match.index), type, bold, italic });
      }
      const closing = match[0].charAt(1) === "/";
      const tag = match[1].toLowerCase();
      if (!closing) {
        if (tag === "b") bold = true;
        else if (tag === "i") italic = true;
        else {
          typeStack.push(type);
          type = tag;
        }
      } else if (tag === "b") bold = false;
      else if (tag === "i") italic = false;
      else type = typeStack.pop() || "normal";
      lastIndex = tagRegex.lastIndex;
    }
    if (lastIndex < src.length) {
      segments.push({ text: src.substring(lastIndex), type, bold, italic });
    }
    return segments;
  }

  // Nachkommastellen, die eine Schrittweite braucht (0,5 → 1; 0,25 → 2)
  static _decimals(step) {
    for (let d = 0; d <= 6; d++) {
      const v = step * Math.pow(10, d);
      if (Math.abs(v - Math.round(v)) < 1e-6 * Math.max(1, Math.abs(v))) return d;
    }
    return 6;
  }

  constructor(x = 100, y = 100, width = 500, height = 300, xMin = 0, xMax = 10, yMin = 0, yMax = 10) {
    super();
    this._w = Math.max(1, Number(width) || 1);
    this._h = Math.max(1, Number(height) || 1);
    this._xMin = Number(xMin);
    this._xMax = Number(xMax);
    this._yMin = Number(yMin);
    this._yMax = Number(yMax);
    this._fixRange();
    this._color = 0x444444;
    this._axisThickness = 1.5;
    this._textColor = 0x444444;
    this._font = "Arial";
    this._fontSize = 18;
    this._xStep = null;
    this._yStep = null;
    this._grid = false;
    this._gridColor = 0xdddddd;
    this._xLabel = "";
    this._yLabel = "";
    this._arrows = true;
    this._curves = [];
    this._points = [];
    if (this._group) {
      this._gridLayer = this._group.group();
      this._dataLayer = this._group.group();
      this._axisLayer = this._group.group();
      this._pointLayer = this._group.group();
      this._clipPath = svgRoot.clip();
      this._clipRect = this._clipPath.rect(this._w, this._h).move(0, 0);
      this._dataLayer.clipWith(this._clipPath);
    }
    this.x = Number(x) || 0;
    this.y = Number(y) || 0;
    this._drawAxes();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _fixRange() {
    if (!(this._xMax > this._xMin)) this._xMax = this._xMin + 1;
    if (!(this._yMax > this._yMin)) this._yMax = this._yMin + 1;
  }

  // ---------- Umrechnung Wert ↔ Pixel (lokal) ----------
  _vx(v) {
    return ((v - this._xMin) / (this._xMax - this._xMin)) * this._w;
  }
  _vy(v) {
    return this._h - ((v - this._yMin) / (this._yMax - this._yMin)) * this._h;
  }
  _axisY() {
    return this._yMin <= 0 && this._yMax >= 0 ? this._vy(0) : this._h;
  }
  _axisX() {
    return this._xMin <= 0 && this._xMax >= 0 ? this._vx(0) : 0;
  }

  toPixelX(value) {
    return this.x + this._vx(Number(value));
  }
  toPixelY(value) {
    return this.y + this._vy(Number(value));
  }
  toValueX(px) {
    return this._xMin + ((Number(px) - this.x) / this._w) * (this._xMax - this._xMin);
  }
  toValueY(py) {
    return this._yMin + ((this._h - (Number(py) - this.y)) / this._h) * (this._yMax - this._yMin);
  }

  // ---------- Text ----------
  _text(layer, text, x, baseline, anchor) {
    const segments = Plot._segments(text);
    if (segments.length === 0) return null;
    const size = this._fontSize;
    const family = this._font;
    const t = layer.text(function (add) {
      segments.forEach((seg, index) => {
        const tspan = add.tspan(seg.text).font({
          family: family,
          size: seg.type === "normal" ? size : size * 0.7,
          weight: seg.bold ? "bold" : "normal",
          style: seg.italic ? "italic" : "normal",
        });
        if (seg.type === "sub") tspan.attr("dy", 0.4 * size + "px");
        else if (seg.type === "sup") tspan.attr("dy", -0.5 * size + "px");
        if (seg.type === "normal" && index > 0) {
          const prev = segments[index - 1].type;
          if (prev === "sub") tspan.attr("dy", -0.4 * size + "px");
          else if (prev === "sup") tspan.attr("dy", 0.5 * size + "px");
        }
      });
    });
    t.font({ family: this._font, size: size }).fill(colorToHex(this._textColor));
    t.attr({ x: x, y: baseline, "text-anchor": anchor || "start" });
    // tspans ohne eigene x/y, damit text-anchor für die ganze Zeile gilt
    t.children().forEach((c) => {
      c.node.removeAttribute("x");
      c.node.removeAttribute("y");
    });
    t.css("user-select", "none");
    return t;
  }

  // ---------- Achsen, Striche, Gitter ----------
  _drawAxes() {
    if (!this._group) return;
    this._gridLayer.clear();
    this._axisLayer.clear();
    const w = this._w;
    const h = this._h;
    const ay = this._axisY();
    const ax = this._axisX();
    const fs = this._fontSize;
    const color = colorToHex(this._color);
    const ext = this._arrows ? 14 : 0;
    const stroke = { color: color, width: this._axisThickness, linecap: "butt" };

    const xTicks = this._tickValues(this._xMin, this._xMax, this._xStep);
    const yTicks = this._tickValues(this._yMin, this._yMax, this._yStep);

    if (this._grid) {
      let d = "";
      xTicks.forEach((v) => {
        const px = this._vx(v);
        d += `M ${px},0 L ${px},${h} `;
      });
      yTicks.forEach((v) => {
        const py = this._vy(v);
        d += `M 0,${py} L ${w},${py} `;
      });
      if (d) {
        this._gridLayer.path(d.trim()).fill("none").stroke({ color: colorToHex(this._gridColor), width: 1 });
      }
    }

    // Achsen
    this._axisLayer
      .path(`M 0,${ay} L ${w + ext},${ay} M ${ax},${h} L ${ax},${-ext}`)
      .fill("none")
      .stroke(stroke);
    if (this._arrows) {
      const L = 12;
      const B = 4.5;
      this._axisLayer
        .path(
          `M ${w + ext + 2},${ay} L ${w + ext + 2 - L},${ay - B} L ${w + ext + 2 - L},${ay + B} Z ` +
            `M ${ax},${-ext - 2} L ${ax - B},${-ext - 2 + L} L ${ax + B},${-ext - 2 + L} Z`,
        )
        .fill(color)
        .stroke("none");
    }

    // Striche und Zahlen
    const tickLen = 5;
    let d = "";
    const origin0 =
      this._xMin <= 0 && this._xMax >= 0 && this._yMin <= 0 && this._yMax >= 0;
    const xd = this._xStep ? Plot._decimals(this._xStep) : 0;
    const yd = this._yStep ? Plot._decimals(this._yStep) : 0;
    const fmt = (v, dd) =>
      typeof HtmlSvgEdu !== "undefined" && HtmlSvgEdu.Calc
        ? HtmlSvgEdu.Calc.format(v, dd)
        : v.toFixed(dd);
    xTicks.forEach((v) => {
      const px = this._vx(v);
      d += `M ${px},${ay - tickLen} L ${px},${ay + tickLen} `;
      if (origin0 && Math.abs(v) < 1e-9) return;
      this._text(this._axisLayer, fmt(v, xd), px, ay + tickLen + 3 + fs * 0.85, "middle");
    });
    yTicks.forEach((v) => {
      const py = this._vy(v);
      d += `M ${ax - tickLen},${py} L ${ax + tickLen},${py} `;
      if (origin0 && Math.abs(v) < 1e-9) return;
      this._text(this._axisLayer, fmt(v, yd), ax - tickLen - 4, py + fs * 0.35, "end");
    });
    if (origin0 && (this._xStep || this._yStep)) {
      this._text(this._axisLayer, "0", ax - tickLen - 2, ay + tickLen + 3 + fs * 0.85, "end");
    }
    if (d) this._axisLayer.path(d.trim()).fill("none").stroke(stroke);

    // Achsentitel neben den Pfeilspitzen
    if (this._xLabel !== "") {
      this._text(this._axisLayer, this._xLabel, w + ext + 10, ay + fs * 0.35, "start");
    }
    if (this._yLabel !== "") {
      this._text(this._axisLayer, this._yLabel, ax + 12, -ext + fs * 0.35, "start");
    }

    if (this._clipRect) this._clipRect.size(w, h);
  }

  _tickValues(min, max, step) {
    const s = Number(step);
    if (!(s > 0)) return [];
    const values = [];
    const first = Math.ceil(min / s - 1e-9);
    const last = Math.floor(max / s + 1e-9);
    if (last - first > 500) return [];
    for (let k = first; k <= last; k++) {
      values.push(Math.round(k * s * 1e9) / 1e9);
    }
    return values;
  }

  // ---------- Kurven ----------
  _newCurve(color, thickness) {
    const plot = this;
    const curve = {
      _fn: null,
      _data: [],
      _max: 0,
      _color: color === undefined ? 0xc0392b : color,
      _thickness: thickness === undefined ? 3 : thickness,
      _dash: null,
      _fillColor: null,
      _fillAlpha: 0.3,
      _visible: true,
      _fillEl: null,
      _lineEl: null,
      setFunction(fn) {
        this._fn = typeof fn === "function" ? fn : null;
        plot._drawCurve(this);
        return this;
      },
      update() {
        plot._drawCurve(this);
        return this;
      },
      addPoint(x, y) {
        this._data.push([Number(x), Number(y)]);
        if (this._max > 0 && this._data.length > this._max) {
          this._data.splice(0, this._data.length - this._max);
        }
        plot._drawCurve(this);
        return this;
      },
      setPoints(points) {
        this._data = Array.isArray(points)
          ? points.map((p) => (Array.isArray(p) ? [Number(p[0]), Number(p[1])] : [Number(p.x), Number(p.y)]))
          : [];
        if (this._max > 0 && this._data.length > this._max) {
          this._data.splice(0, this._data.length - this._max);
        }
        plot._drawCurve(this);
        return this;
      },
      getPoints() {
        return this._data.map((p) => [p[0], p[1]]);
      },
      clear() {
        this._data = [];
        plot._drawCurve(this);
        return this;
      },
      setMaxPoints(n) {
        this._max = Math.max(0, Math.round(Number(n) || 0));
        if (this._max > 0 && this._data.length > this._max) {
          this._data.splice(0, this._data.length - this._max);
          plot._drawCurve(this);
        }
        return this;
      },
      setColor(c) {
        this._color = c;
        plot._drawCurve(this);
        return this;
      },
      setThickness(t) {
        this._thickness = Number(t);
        plot._drawCurve(this);
        return this;
      },
      setDashed(on = true, dash = 8, gap = 6) {
        this._dash = on ? [Number(dash), Number(gap)] : null;
        plot._drawCurve(this);
        return this;
      },
      setFill(c, alpha = 0.3) {
        this._fillColor = c === undefined ? null : c;
        this._fillAlpha = Number(alpha);
        plot._drawCurve(this);
        return this;
      },
      setVisible(v) {
        this._visible = !!v;
        plot._drawCurve(this);
        return this;
      },
      remove() {
        plot._removeCurve(this);
      },
    };
    this._curves.push(curve);
    return curve;
  }

  // Liste von Abschnitten in Pixeln (Lücken bei ungültigen Werten)
  _curveRuns(curve) {
    const runs = [];
    let run = [];
    const lim = (v, a) => Math.max(-10 * a, Math.min(11 * a, v));
    const push = (x, y) => {
      if (isFinite(x) && isFinite(y)) {
        run.push([lim(this._vx(x), this._w), lim(this._vy(y), this._h)]);
      } else if (run.length) {
        runs.push(run);
        run = [];
      }
    };
    if (curve._fn) {
      const n = Math.max(2, Math.ceil(this._w));
      for (let i = 0; i <= n; i++) {
        const x = this._xMin + ((this._xMax - this._xMin) * i) / n;
        let y;
        try {
          y = Number(curve._fn(x));
        } catch (e) {
          y = NaN;
        }
        push(x, y);
      }
    } else {
      curve._data.forEach((p) => push(p[0], p[1]));
    }
    if (run.length) runs.push(run);
    return runs;
  }

  // Flächen zwischen Kurve und x-Achse, an Nulldurchgängen getrennt
  // (sonst überschneidet sich das Vieleck und die Füllung wird falsch)
  _fillPolygons(runs) {
    const base = Math.max(0, Math.min(this._h, this._axisY()));
    const polys = [];
    runs.forEach((r) => {
      if (r.length < 2) return;
      let cur = [[r[0][0], base], r[0]];
      for (let i = 1; i < r.length; i++) {
        const a = r[i - 1];
        const b = r[i];
        const da = a[1] - base;
        const db = b[1] - base;
        if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
          const cx = a[0] + ((b[0] - a[0]) * da) / (da - db);
          cur.push([cx, base]);
          polys.push(cur);
          cur = [[cx, base]];
        }
        cur.push(b);
      }
      cur.push([r[r.length - 1][0], base]);
      polys.push(cur);
    });
    return polys;
  }

  _drawCurve(curve) {
    if (!this._group) return;
    if (curve._lineEl) {
      curve._lineEl.remove();
      curve._lineEl = null;
    }
    if (curve._fillEl) {
      curve._fillEl.remove();
      curve._fillEl = null;
    }
    if (!curve._visible) return;
    const runs = this._curveRuns(curve).filter((r) => r.length > 0);
    if (runs.length === 0) return;
    const f = (n) => Math.round(n * 100) / 100;
    if (curve._fillColor !== null && curve._fillColor !== undefined) {
      let fd = "";
      this._fillPolygons(runs).forEach((poly) => {
        poly.forEach((p, i) => (fd += `${i === 0 ? "M" : "L"} ${f(p[0])},${f(p[1])} `));
        fd += "Z ";
      });
      if (fd) {
        curve._fillEl = this._dataLayer
          .path(fd.trim())
          .fill({ color: colorToHex(curve._fillColor), opacity: curve._fillAlpha })
          .stroke("none");
      }
    }
    if (curve._thickness > 0) {
      let d = "";
      runs.forEach((r) => {
        d += `M ${f(r[0][0])},${f(r[0][1])} `;
        for (let i = 1; i < r.length; i++) d += `L ${f(r[i][0])},${f(r[i][1])} `;
        if (r.length === 1) d += `L ${f(r[0][0]) + 0.01},${f(r[0][1])} `;
      });
      const stroke = {
        color: colorToHex(curve._color),
        width: curve._thickness,
        linecap: "round",
        linejoin: "round",
      };
      if (curve._dash) stroke.dasharray = curve._dash.join(" ");
      curve._lineEl = this._dataLayer.path(d.trim()).fill("none").stroke(stroke);
    }
  }

  _removeCurve(curve) {
    if (curve._lineEl) curve._lineEl.remove();
    if (curve._fillEl) curve._fillEl.remove();
    curve._lineEl = null;
    curve._fillEl = null;
    this._curves = this._curves.filter((c) => c !== curve);
  }

  addFunction(fn, color = 0xc0392b, thickness = 3) {
    const curve = this._newCurve(color, thickness);
    curve.setFunction(fn);
    return curve;
  }

  addCurve(color = 0x2e86c1, thickness = 3) {
    return this._newCurve(color, thickness);
  }

  // ---------- Punkte ----------
  addPoint(x = 0, y = 0, color = 0xc0392b, radius = 7) {
    const plot = this;
    const point = {
      _x: Number(x),
      _y: Number(y),
      _color: color,
      _radius: Number(radius),
      _visible: true,
      _el: null,
      setPosition(px, py) {
        this._x = Number(px);
        this._y = Number(py);
        plot._drawPoint(this);
        return this;
      },
      getX() {
        return this._x;
      },
      getY() {
        return this._y;
      },
      setColor(c) {
        this._color = c;
        plot._drawPoint(this);
        return this;
      },
      setRadius(r) {
        this._radius = Number(r);
        plot._drawPoint(this);
        return this;
      },
      setVisible(v) {
        this._visible = !!v;
        plot._drawPoint(this);
        return this;
      },
      remove() {
        if (this._el) this._el.remove();
        this._el = null;
        plot._points = plot._points.filter((p) => p !== this);
      },
    };
    this._points.push(point);
    this._drawPoint(point);
    return point;
  }

  _pointInside(p) {
    const ex = (this._xMax - this._xMin) * 1e-6;
    const ey = (this._yMax - this._yMin) * 1e-6;
    return (
      isFinite(p._x) && isFinite(p._y) &&
      p._x >= this._xMin - ex && p._x <= this._xMax + ex &&
      p._y >= this._yMin - ey && p._y <= this._yMax + ey
    );
  }

  _drawPoint(p) {
    if (!this._group) return;
    if (!p._el) {
      p._el = this._pointLayer.circle(1);
    }
    const r = Math.max(0, p._radius);
    p._el
      .size(2 * r)
      .center(this._vx(p._x), this._vy(p._y))
      .fill(colorToHex(p._color))
      .stroke({ color: "#333333", width: 1 });
    if (p._visible && this._pointInside(p)) p._el.show();
    else p._el.hide();
  }

  _redrawAll() {
    this._drawAxes();
    this._curves.forEach((c) => this._drawCurve(c));
    this._points.forEach((p) => this._drawPoint(p));
  }

  // ---------- Einstellungen ----------
  update() {
    this._curves.forEach((c) => this._drawCurve(c));
    return this;
  }

  setRange(xMin, xMax, yMin, yMax) {
    this._xMin = Number(xMin);
    this._xMax = Number(xMax);
    this._yMin = Number(yMin);
    this._yMax = Number(yMax);
    this._fixRange();
    this._redrawAll();
    return this;
  }

  setSize(width, height) {
    this._w = Math.max(1, Number(width) || 1);
    this._h = Math.max(1, Number(height) || 1);
    this._redrawAll();
    return this;
  }

  getWidth() {
    return this._w;
  }

  getHeight() {
    return this._h;
  }

  setTicks(xStep, yStep) {
    this._xStep = Number(xStep) > 0 ? Number(xStep) : null;
    this._yStep = Number(yStep) > 0 ? Number(yStep) : null;
    this._drawAxes();
    return this;
  }

  setGrid(visible = true, color) {
    this._grid = !!visible;
    if (color !== undefined) this._gridColor = color;
    this._drawAxes();
    return this;
  }

  setAxisLabels(xLabel = "", yLabel = "") {
    this._xLabel = xLabel === undefined || xLabel === null ? "" : String(xLabel);
    this._yLabel = yLabel === undefined || yLabel === null ? "" : String(yLabel);
    this._drawAxes();
    return this;
  }

  setColor(color) {
    this._color = color;
    this._drawAxes();
    return this;
  }

  setTextColor(color) {
    this._textColor = color;
    this._drawAxes();
    return this;
  }

  setFont(font = "Arial", fontSize = 18) {
    this._font = font;
    this._fontSize = Number(fontSize) || 18;
    this._drawAxes();
    return this;
  }

  setArrows(visible = true) {
    this._arrows = !!visible;
    this._drawAxes();
    return this;
  }

  clear() {
    this._curves.slice().forEach((c) => this._removeCurve(c));
    this._points.slice().forEach((p) => p.remove());
    return this;
  }

  destroy() {
    if (this._clipPath) {
      this._clipPath.remove();
      this._clipPath = null;
    }
    super.destroy();
  }
};

// ============================================================================
// Spring – Feder als Zickzack zwischen zwei Punkten (3.27.0)
// ============================================================================

SvgJSEdu.Spring = class Spring extends SvgJSElement {
  static serializationMap = {
    description: {
      de: "Feder als Zickzacklinie zwischen zwei Punkten. Die Zahl der Windungen bleibt gleich: wird die Feder kürzer, rücken die Windungen zusammen",
      en: "Spring as a zigzag line between two points. The number of coils stays the same: when the spring gets shorter, the coils move closer together",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let mySpring = new Spring(640, 100, 640, 400, 10, 30, 0x444444, 2);",
    constructor: {
      x1: {
        name: "x1",
        info: {
          en: "X coordinate of the start point (for example the fixing point)",
          de: "X-Koordinate des Anfangspunkts (zum Beispiel der Aufhängung)",
        },
      },
      y1: {
        name: "y1",
        info: {
          en: "Y coordinate of the start point",
          de: "Y-Koordinate des Anfangspunkts",
        },
      },
      x2: {
        name: "x2",
        info: {
          en: "X coordinate of the end point (for example the mass)",
          de: "X-Koordinate des Endpunkts (zum Beispiel der Masse)",
        },
      },
      y2: {
        name: "y2",
        info: {
          en: "Y coordinate of the end point",
          de: "Y-Koordinate des Endpunkts",
        },
      },
      coils: {
        name: "coils",
        info: {
          en: "Number of coils (zigzags)",
          de: "Zahl der Windungen (Zacken)",
        },
      },
      width: {
        name: "width",
        info: {
          en: "Width of the spring in pixels",
          de: "Breite der Feder in Pixeln",
        },
      },
      lineColor: {
        name: "lineColor",
        info: {
          en: "Line colour in hexadecimal format (e.g. 0x444444)",
          de: "Linienfarbe im Hexadezimalformat (z.B. 0x444444)",
        },
      },
      lineThickness: {
        name: "lineThickness",
        info: {
          en: "Line thickness in pixels",
          de: "Linienstärke in Pixeln",
        },
      },
    },
    setter: {
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
        },
        example: "visible = true",
      },
      alpha: {
        name: "alpha",
        info: {
          en: "Transparency of the element (0.0 to 1.0)",
          de: "Transparenz des Elements (0.0 bis 1.0)",
        },
        example: "alpha = 0.5",
      },
    },
    methods: {
      setEnds: {
        example: "setEnds(640, 100, 640, 450)",
        info: {
          en: "Sets start and end point at once (x1, y1, x2, y2) – the usual way to move a spring in a timer",
          de: "Setzt Anfangs- und Endpunkt auf einmal (x1, y1, x2, y2) – so bewegt man eine Feder im Timer",
        },
      },
      setStart: {
        example: "setStart(640, 100)",
        info: {
          en: "Sets the start point",
          de: "Setzt den Anfangspunkt",
        },
      },
      setEnd: {
        example: "setEnd(640, 450)",
        info: {
          en: "Sets the end point",
          de: "Setzt den Endpunkt",
        },
      },
      setCoils: {
        example: "setCoils(12)",
        info: {
          en: "Sets the number of coils",
          de: "Setzt die Zahl der Windungen",
        },
      },
      setWidth: {
        example: "setWidth(40)",
        info: {
          en: "Sets the width of the spring in pixels",
          de: "Setzt die Breite der Feder in Pixeln",
        },
      },
      setLeadLength: {
        example: "setLeadLength(20)",
        info: {
          en: "Length of the straight pieces at both ends in pixels (default 12)",
          de: "Länge der geraden Stücke an beiden Enden in Pixeln (Standard 12)",
        },
      },
      setLineColor: {
        example: "setLineColor(0x2e86c1)",
        info: {
          en: "Sets the line colour",
          de: "Setzt die Linienfarbe",
        },
      },
      setLineThickness: {
        example: "setLineThickness(3)",
        info: {
          en: "Sets the line thickness",
          de: "Setzt die Linienstärke",
        },
      },
      getLength: {
        example: "getLength()",
        info: {
          en: "Returns the distance between start and end point in pixels",
          de: "Gibt den Abstand zwischen Anfangs- und Endpunkt in Pixeln zurück",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
    },
  };

  // Punkte der Feder (auch für PixiJSEdu.Spring gleich)
  static _points(x1, y1, x2, y2, coils, width, lead) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1e-6) return [[x1, y1], [x2, y2]];
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;
    const l = Math.max(0, Math.min(lead, len * 0.15));
    const body = len - 2 * l;
    const n = Math.max(1, Math.round(coils)) * 2;
    const half = width / 2;
    const pts = [[x1, y1]];
    const ax = x1 + ux * l;
    const ay = y1 + uy * l;
    pts.push([ax, ay]);
    for (let i = 0; i < n; i++) {
      const t = ((i + 0.5) / n) * body;
      const s = i % 2 === 0 ? half : -half;
      pts.push([ax + ux * t + nx * s, ay + uy * t + ny * s]);
    }
    pts.push([x2 - ux * l, y2 - uy * l]);
    pts.push([x2, y2]);
    return pts;
  }

  constructor(x1 = 100, y1 = 100, x2 = 100, y2 = 300, coils = 8, width = 24, lineColor = 0x444444, lineThickness = 2) {
    super();
    this._x1 = Number(x1);
    this._y1 = Number(y1);
    this._x2 = Number(x2);
    this._y2 = Number(y2);
    this._coils = Number(coils) || 8;
    this._width = Number(width);
    this._lead = 12;
    this._lineColor = lineColor;
    this._lineThickness = Number(lineThickness);
    this._pathEl = null;
    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (!this._group) return;
    const pts = Spring._points(this._x1, this._y1, this._x2, this._y2, this._coils, this._width, this._lead);
    const f = (n) => Math.round(n * 100) / 100;
    const d = pts.map((p, i) => (i === 0 ? "M " : "L ") + f(p[0]) + "," + f(p[1])).join(" ");
    if (!this._pathEl) {
      this._pathEl = this._group.path(d).fill("none");
    } else {
      this._pathEl.plot(d);
    }
    this._pathEl.stroke({
      color: colorToHex(this._lineColor),
      width: this._lineThickness,
      linecap: "round",
      linejoin: "round",
    });
  }

  setEnds(x1, y1, x2, y2) {
    this._x1 = Number(x1);
    this._y1 = Number(y1);
    this._x2 = Number(x2);
    this._y2 = Number(y2);
    this._draw();
    return this;
  }

  setStart(x, y) {
    this._x1 = Number(x);
    this._y1 = Number(y);
    this._draw();
    return this;
  }

  setEnd(x, y) {
    this._x2 = Number(x);
    this._y2 = Number(y);
    this._draw();
    return this;
  }

  setCoils(coils) {
    this._coils = Math.max(1, Number(coils) || 1);
    this._draw();
    return this;
  }

  setWidth(width) {
    this._width = Number(width);
    this._draw();
    return this;
  }

  setLeadLength(length) {
    this._lead = Math.max(0, Number(length) || 0);
    this._draw();
    return this;
  }

  setLineColor(color) {
    this._lineColor = color;
    this._draw();
    return this;
  }

  setLineThickness(thickness) {
    this._lineThickness = Number(thickness);
    this._draw();
    return this;
  }

  getLength() {
    const dx = this._x2 - this._x1;
    const dy = this._y2 - this._y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
};

// ============================================================================
// Arc – Kreisbogen, Tortenstück oder Ringstück, optional mit Pfeilspitze (3.27.0)
// ============================================================================

SvgJSEdu.Arc = class Arc extends SvgJSElement {
  static serializationMap = {
    description: {
      de: "Kreisbogen um den Bezugspunkt (Mitte). Mit Füllfarbe ein Tortenstück, mit Innenradius ein Ringstück, mit Pfeilspitze ein Drehpfeil. Winkel in Grad: 0 = rechts, positive Winkel im Uhrzeigersinn",
      en: "Circular arc around the origin (centre). With a fill colour a pie slice, with an inner radius a ring segment, with an arrowhead a rotation arrow. Angles in degrees: 0 = right, positive angles clockwise",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myArc = new Arc(80, -90, 90, 0x444444, 3);",
    constructor: {
      radius: {
        name: "radius",
        info: {
          en: "Radius in pixels",
          de: "Radius in Pixeln",
        },
      },
      startAngle: {
        name: "startAngle",
        info: {
          en: "Start angle in degrees (0 = right, 90 = down)",
          de: "Startwinkel in Grad (0 = rechts, 90 = unten)",
        },
      },
      endAngle: {
        name: "endAngle",
        info: {
          en: "End angle in degrees. Larger than the start angle = clockwise, smaller = anticlockwise",
          de: "Endwinkel in Grad. Größer als der Startwinkel = im Uhrzeigersinn, kleiner = gegen den Uhrzeigersinn",
        },
      },
      lineColor: {
        name: "lineColor",
        info: {
          en: "Line colour in hexadecimal format (e.g. 0x444444)",
          de: "Linienfarbe im Hexadezimalformat (z.B. 0x444444)",
        },
      },
      lineThickness: {
        name: "lineThickness",
        info: {
          en: "Line thickness in pixels (0 = no line)",
          de: "Linienstärke in Pixeln (0 = keine Linie)",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the centre in pixels",
          de: "Horizontale Position des Mittelpunkts in Pixeln",
        },
        example: "x = 640",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the centre in pixels",
          de: "Vertikale Position des Mittelpunkts in Pixeln",
        },
        example: "y = 360",
      },
      rotation: {
        name: "rotation",
        info: {
          en: "Rotation around the centre in degrees (clockwise)",
          de: "Drehung um den Mittelpunkt in Grad (im Uhrzeigersinn)",
        },
        example: "rotation = 45",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
        },
        example: "visible = true",
      },
      alpha: {
        name: "alpha",
        info: {
          en: "Transparency of the element (0.0 to 1.0)",
          de: "Transparenz des Elements (0.0 bis 1.0)",
        },
        example: "alpha = 0.5",
      },
    },
    methods: {
      setAngles: {
        example: "setAngles(0, 270)",
        info: {
          en: "Sets start and end angle in degrees",
          de: "Setzt Start- und Endwinkel in Grad",
        },
      },
      setStartAngle: {
        example: "setStartAngle(-90)",
        info: {
          en: "Sets the start angle in degrees",
          de: "Setzt den Startwinkel in Grad",
        },
      },
      setEndAngle: {
        example: "setEndAngle(180)",
        info: {
          en: "Sets the end angle in degrees",
          de: "Setzt den Endwinkel in Grad",
        },
      },
      setRadius: {
        example: "setRadius(100)",
        info: {
          en: "Sets the radius in pixels",
          de: "Setzt den Radius in Pixeln",
        },
      },
      setInnerRadius: {
        example: "setInnerRadius(60)",
        info: {
          en: "Inner radius in pixels: turns a pie slice into a ring segment (0 = pie slice)",
          de: "Innenradius in Pixeln: macht aus dem Tortenstück ein Ringstück (0 = Tortenstück)",
        },
      },
      setFillColor: {
        example: "setFillColor(0xf5b041)",
        info: {
          en: "Fills the arc as a pie slice (or ring segment). null = no fill",
          de: "Füllt den Bogen als Tortenstück (oder Ringstück). null = keine Füllung",
        },
      },
      setLineColor: {
        example: "setLineColor(0xc0392b)",
        info: {
          en: "Sets the line colour",
          de: "Setzt die Linienfarbe",
        },
      },
      setLineThickness: {
        example: "setLineThickness(3)",
        info: {
          en: "Sets the line thickness (0 = no line)",
          de: "Setzt die Linienstärke (0 = keine Linie)",
        },
      },
      setArrowhead: {
        example: "setArrowhead(true, 14)",
        info: {
          en: "Shows an arrowhead at the end of the arc, for example for a direction of rotation. Optional size in pixels",
          de: "Zeigt eine Pfeilspitze am Ende des Bogens, zum Beispiel für eine Drehrichtung. Optional mit Größe in Pixeln",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des Elements (0.0 = vollständig transparent, 1.0 = vollständig sichtbar)",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hallo World"); }',
        info: {
          en: "Defines a function to execute when the element is clicked.",
          de: "Legt fest, welche Funktion beim Klick auf das Element ausgeführt wird.",
        },
      },
      setDragging: {
        example: "setDragging(0, 0, 1280, 720)",
        info: {
          en: "Enables dragging within the specified bounds (x1, y1, x2, y2 in pixels)",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Grenzen (x1, y1, x2, y2 in Pixeln)",
        },
      },
    },
  };

  // Geometrie, gemeinsam für SVG und PixiJS: Umriss als Punktliste
  // (outline), Linie (line) und Pfeilspitze (arrow), alles um (0 | 0).
  static _geometry(r, ri, a0, a1, fill, arrow, arrowSize, thickness) {
    const rad = Math.PI / 180;
    let sweep = a1 - a0;
    const full = Math.abs(sweep) >= 360;
    if (full) sweep = sweep > 0 ? 360 : -360;
    const dir = sweep >= 0 ? 1 : -1;
    const pt = (radius, deg) => [radius * Math.cos(deg * rad), radius * Math.sin(deg * rad)];
    const sample = (radius, from, to) => {
      const steps = Math.max(2, Math.ceil((Math.abs(to - from) / 360) * Math.max(24, radius * 1.5)));
      const out = [];
      for (let i = 0; i <= steps; i++) out.push(pt(radius, from + ((to - from) * i) / steps));
      return out;
    };
    const result = { full, sweep, line: [], outline: null, inner: null, arrow: null };
    // Pfeilspitze: Spitze genau am Endwinkel, Linie endet unter der Spitze
    let lineEnd = a0 + sweep;
    if (arrow && r > 0 && !full) {
      const s = arrowSize > 0 ? arrowSize : 10 + thickness * 2;
      const baseDeg = a0 + sweep - (dir * (s / r)) / rad;
      const tip = pt(r, a0 + sweep);
      const base = pt(r, baseDeg);
      let ux = tip[0] - base[0];
      let uy = tip[1] - base[1];
      const ul = Math.sqrt(ux * ux + uy * uy) || 1;
      ux /= ul;
      uy /= ul;
      const hw = s * 0.4;
      const bx = tip[0] - ux * s;
      const by = tip[1] - uy * s;
      result.arrow = [tip, [bx - uy * hw, by + ux * hw], [bx + uy * hw, by - ux * hw]];
      lineEnd = a0 + sweep - (dir * ((s * 0.6) / r)) / rad;
      if ((lineEnd - a0) * dir < 0) lineEnd = a0;
    }
    if (r > 0) result.line = sample(r, a0, lineEnd);
    if (fill) {
      if (ri > 0) {
        result.outline = sample(r, a0, a0 + sweep).concat(sample(ri, a0 + sweep, a0));
        if (full) {
          result.outline = sample(r, a0, a0 + sweep);
          result.inner = sample(ri, a0, a0 + sweep);
        }
      } else if (full) {
        result.outline = sample(r, a0, a0 + sweep);
      } else {
        result.outline = [[0, 0]].concat(sample(r, a0, a0 + sweep));
      }
    }
    return result;
  }

  constructor(radius = 60, startAngle = 0, endAngle = 90, lineColor = 0x444444, lineThickness = 2) {
    super();
    this._radius = Math.max(0, Number(radius) || 0);
    this._innerRadius = 0;
    this._startAngle = Number(startAngle) || 0;
    this._endAngle = Number(endAngle) || 0;
    this._lineColor = lineColor;
    this._lineThickness = Number(lineThickness);
    this._fillColor = null;
    this._arrow = false;
    this._arrowSize = 0;
    this._fillEl = null;
    this._lineEl = null;
    this._arrowEl = null;
    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (!this._group) return;
    [this._fillEl, this._lineEl, this._arrowEl].forEach((el) => el && el.remove());
    this._fillEl = this._lineEl = this._arrowEl = null;
    const hasFill = this._fillColor !== null && this._fillColor !== undefined;
    const g = Arc._geometry(
      this._radius,
      Math.min(this._innerRadius, this._radius),
      this._startAngle,
      this._endAngle,
      hasFill,
      this._arrow,
      this._arrowSize,
      this._lineThickness,
    );
    const f = (n) => Math.round(n * 100) / 100;
    const poly = (pts, close) =>
      pts.map((p, i) => (i === 0 ? "M " : "L ") + f(p[0]) + "," + f(p[1])).join(" ") + (close ? " Z" : "");
    const showLine = this._lineThickness > 0;
    const stroke = {
      color: colorToHex(this._lineColor),
      width: this._lineThickness,
      linecap: "butt",
      linejoin: "round",
    };
    if (hasFill && g.outline) {
      let d = poly(g.outline, true);
      if (g.inner) d += " " + poly(g.inner, true);
      this._fillEl = this._group.path(d).attr("fill-rule", "evenodd").fill(colorToHex(this._fillColor));
      // Gefüllt: Umriss rundherum (Tortenstück mit Radien, Ringstück mit Innenbogen)
      if (showLine) this._fillEl.stroke(stroke);
      else this._fillEl.stroke("none");
    }
    if (showLine && !(hasFill && g.outline) && g.line.length > 1) {
      this._lineEl = this._group.path(poly(g.line, g.full)).fill("none").stroke(stroke);
    }
    if (g.arrow) {
      this._arrowEl = this._group
        .path(poly(g.arrow, true))
        .fill(colorToHex(this._lineColor))
        .stroke("none");
    }
  }

  setAngles(startAngle, endAngle) {
    this._startAngle = Number(startAngle) || 0;
    this._endAngle = Number(endAngle) || 0;
    this._draw();
    return this;
  }

  setStartAngle(angle) {
    this._startAngle = Number(angle) || 0;
    this._draw();
    return this;
  }

  setEndAngle(angle) {
    this._endAngle = Number(angle) || 0;
    this._draw();
    return this;
  }

  getStartAngle() {
    return this._startAngle;
  }

  getEndAngle() {
    return this._endAngle;
  }

  setRadius(radius) {
    this._radius = Math.max(0, Number(radius) || 0);
    this._draw();
    return this;
  }

  getRadius() {
    return this._radius;
  }

  setInnerRadius(radius) {
    this._innerRadius = Math.max(0, Number(radius) || 0);
    this._draw();
    return this;
  }

  setFillColor(color) {
    this._fillColor = color === undefined ? null : color;
    this._draw();
    return this;
  }

  setLineColor(color) {
    this._lineColor = color;
    this._draw();
    return this;
  }

  setLineThickness(thickness) {
    this._lineThickness = Number(thickness) || 0;
    this._draw();
    return this;
  }

  setArrowhead(visible = true, size) {
    this._arrow = !!visible;
    if (size !== undefined) this._arrowSize = Math.max(0, Number(size) || 0);
    this._draw();
    return this;
  }
};

// ============================================================================
// Module-Export
// ============================================================================

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SvgJSEdu, SvgJSElement, PathBase };
}
