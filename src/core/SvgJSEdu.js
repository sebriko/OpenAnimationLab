/**
 * SvgJSEdu.js - SVG.js-basiertes Framework für Bildungsanimationen
 * Konvertiert von PixiJSEdu.js (PIXI.js Canvas) zu SVG.js (natives SVG DOM)
 *
 * @license MIT
 * @author Sebastian Rikowski
 * @version 1.0.0
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

/**
 * Konvertiert Bogenmaß zu Grad
 */
function radToDeg(radians) {
  return radians * (180 / Math.PI);
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

    // rotationPivot is in scaled coordinates, matching PixiJS visual-coordinate semantics
    const scaledPivotX = this._rotationPivotX * this._scaleX;
    const scaledPivotY = this._rotationPivotY * this._scaleY;

    const rpWorldX = this._visualX + scaledPivotX - this._pivotX;
    const rpWorldY = this._visualY + scaledPivotY - this._pivotY;

    // Transform sequence:
    // 1. translate to rotation pivot in world coordinates
    // 2. rotate
    // 3. translate back to object origin (in scaled coordinates)
    //
    // Scale is applied directly on the shape element via _applyScale(),
    // not here, matching PixiJS sprite re-render behavior.

    let transform = `translate(${rpWorldX}, ${rpWorldY})`;

    if (this._rotationDegrees !== 0) {
      transform += ` rotate(${this._rotationDegrees})`;
    }

    transform += ` translate(${-scaledPivotX}, ${-scaledPivotY})`;

    this._group.attr("transform", transform);
  }

  _applyScale() {
    // Overridden by subclasses
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

  setScale(scaleX, scaleY) {
    this._scaleX = scaleX;
    this._scaleY = scaleY !== undefined ? scaleY : scaleX;
    this._applyScale();
    this._updateTransform();
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
    this._group.css("cursor", "grab");

    this._boundDragStart = (e) => {
      e.preventDefault();
      this._isDragging = true;
      this._group.css("cursor", "grabbing");

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
        this._group.css("cursor", "grab");
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

  // ---------- Destroy ----------

  destroy() {
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
          en: "Horizontal position of the group",
          de: "Horizontale Position der Gruppe",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the group",
          de: "Vertikale Position der Gruppe",
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
          en: "Controls the visibility of the group",
          de: "Steuert die Sichtbarkeit der Gruppe",
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
          en: "Removes an element from the group",
          de: "Entfernt ein Element aus der Gruppe",
        },
      },
      setTransformationPoint: {
        example: "setTransformationPoint(50, 50)",
        info: {
          en: "Defines the transformation point for position of the group",
          de: "Definiert den Transformationspunkt für die Position der Gruppe",
        },
      },
      setRotationPoint: {
        example: "setRotationPoint(25, 25)",
        info: {
          en: "Sets the rotation pivot relative to the group's origin (0, 0)",
          de: "Setzt den Rotationspunkt relativ zum Ursprung (0, 0) der Gruppe",
        },
      },
      setScale: {
        example: "setScale(0.75)",
        info: {
          en: "Scales the entire group proportionally",
          de: "Skaliert die gesamte Gruppe proportional",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the entire group (0 = invisible, 1 = fully visible)",
          de: "Setzt die Transparenz der gesamten Gruppe (0 = unsichtbar, 1 = vollständig sichtbar)",
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
          en: "Enables dragging within the specified rectangular bounds",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Rechtecksgrenzen",
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
      // Re-attach to the board root, matching PixiJS removeChild behavior
      const boardGroup =
        BoardSVG[INSTANCE_KEY]._group || BoardSVG[INSTANCE_KEY];
      if (boardGroup && boardGroup.add) {
        boardGroup.add(element._group);
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
    this.removeAllChildren();
    this.removeMask();
    super.destroy();
  }
};

// ============================================================================
// Rectangle
// ============================================================================

SvgJSEdu.Rectangle = class Rectangle extends SvgJSElement {
  static serializationMap = {
    description: { de: "Rechteck", en: "Rectangle" },
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
          en: "Defines whether the object is visible or invisible",
          de: "Legt fest, ob das Objekt sichtbar oder unsichtbar ist",
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
          en: "Sets a border with color and thickness",
          de: "Setzt einen Rahmen mit Farbe und Dicke",
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
          en: "Defines the transformation point for position of the element",
          de: "Definiert den Transformationspunkt für die Position des Elements",
        },
      },
      setRotationPoint: {
        example: "setRotationPoint(0, 0)",
        info: {
          en: "Sets the rotation pivot relative to the element's origin (0, 0)",
          de: "Setzt den Rotationspunkt relativ zum Ursprung (0, 0) des Elements",
        },
      },
      setGradient: {
        example:
          'setGradient("linear", [{offset:0,color:"#fff"},{offset:1,color:"#000"}])',
        info: {
          en: "Creates a gradient fill",
          de: "Erstellt einen Farbverlauf",
        },
      },
      setScale: {
        example: "setScale(1.5, 1.5)",
        info: {
          en: "Scales the element in both directions",
          de: "Skaliert das Element in beide Richtungen",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency (0.0 to 1.0)",
          de: "Setzt die Transparenz (0.0 bis 1.0)",
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
          en: "Enables dragging within the specified rectangular bounds",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Rechtecksgrenzen",
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
    if (this._shapeElement) {
      this._shapeElement.remove();
    }
    if (this._gradientDef) {
      this._gradientDef.remove();
      this._gradientDef = null;
    }

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

    if (this._gradientDef) {
      this._gradientDef.remove();
      this._gradientDef = null;
    }

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

  // ---------- Fill & Stroke ----------

  setFillColor(color) {
    this._fillColor = color;
    this._gradientStops = null;
    this._gradientType = null;
    if (this._gradientDef) {
      this._gradientDef.remove();
      this._gradientDef = null;
    }
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

  // ---------- Border ----------

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
    if (this._gradientDef) {
      this._gradientDef.remove();
      this._gradientDef = null;
    }
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
    description: { de: "Kreis", en: "Circle" },
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
          en: "Defines whether the object is visible or invisible",
          de: "Legt fest, ob das Objekt sichtbar oder unsichtbar ist",
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
          en: "Sets a border with color and thickness",
          de: "Setzt einen Rahmen mit Farbe und Dicke",
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
          en: "Defines the transformation point for position of the element",
          de: "Definiert den Transformationspunkt für die Position des Elements",
        },
      },
      setRotationPoint: {
        example: "setRotationPoint(0, 0)",
        info: {
          en: "Sets the rotation pivot relative to the element's origin (0, 0)",
          de: "Setzt den Rotationspunkt relativ zum Ursprung (0, 0) des Elements",
        },
      },
      setGradient: {
        example:
          'setGradient("radial", [{offset:0,color:"#fff"},{offset:1,color:"#000"}])',
        info: {
          en: "Creates a radial gradient",
          de: "Erstellt einen radialen Farbverlauf",
        },
      },
      setScale: {
        example: "setScale(0.75)",
        info: {
          en: "Scales the circle proportionally",
          de: "Skaliert den Kreis proportional",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the entire circle (0 = invisible, 1 = fully visible)",
          de: "Setzt die Transparenz des gesamten Kreises (0 = unsichtbar, 1 = vollständig sichtbar)",
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
          en: "Enables dragging within the specified rectangular bounds",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Rechtecksgrenzen",
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
    if (this._shapeElement) this._shapeElement.remove();
    if (this._gradientDef) {
      this._gradientDef.remove();
      this._gradientDef = null;
    }

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

    if (this._gradientDef) {
      this._gradientDef.remove();
      this._gradientDef = null;
    }

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

  // ---------- Fill & Stroke ----------

  setFillColor(color) {
    this._fillColor = color;
    this._gradientStops = null;
    this._gradientType = null;
    if (this._gradientDef) {
      this._gradientDef.remove();
      this._gradientDef = null;
    }
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

  // ---------- Border ----------

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
    if (this._gradientDef) {
      this._gradientDef.remove();
      this._gradientDef = null;
    }
    if (this._shapeElement) {
      this._shapeElement.remove();
      this._shapeElement = null;
    }
    super.destroy();
  }
};

// ============================================================================
// Polygon
// ============================================================================

SvgJSEdu.Polygon = class Polygon extends SvgJSElement {
  static serializationMap = {
    description: { de: "Polygon aus Punkten", en: "Polygon from points" },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      "let myPolygon = new Polygon([[0,0],[100,0],[50,80]], 0xff0000, 0x000000, 2);",
    constructor: {
      points: {
        name: "points",
        info: {
          en: "Array of [x,y] coordinate pairs",
          de: "Array von [x,y]-Koordinatenpaaren",
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
          en: "Defines whether the object is visible or invisible",
          de: "Legt fest, ob das Objekt sichtbar oder unsichtbar ist",
        },
        example: "visible = true",
      },
    },
    methods: {
      setFillColor: {
        example: "setFillColor(0xff0000)",
        info: {
          en: "Sets the fill color of the polygon",
          de: "Setzt die Füllfarbe des Polygons",
        },
      },
      setLineColor: {
        example: "setLineColor(0x000000)",
        info: {
          en: "Sets the line color of the polygon",
          de: "Setzt die Linienfarbe des Polygons",
        },
      },
      setLineThickness: {
        example: "setLineThickness(2)",
        info: {
          en: "Sets the line thickness",
          de: "Setzt die Linienstärke",
        },
      },
      setPoints: {
        example: "setPoints([[0,0],[100,0],[50,80]])",
        info: {
          en: "Replaces the polygon points",
          de: "Ersetzt die Polygonpunkte",
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
          en: "Enables dragging within the specified rectangular bounds",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Rechtecksgrenzen",
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
    points = [],
    fillColor = null,
    lineColor = 0x000000,
    lineThickness = 1,
  ) {
    super();
    this._points = points;
    this._fillColor = fillColor;
    this._lineColor = lineColor;
    this._lineThickness = lineThickness;
    this._shapeElement = null;

    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (this._shapeElement) this._shapeElement.remove();
    if (this._points.length < 2) return;

    const flat = this._points.flat();
    this._shapeElement = this._group.polygon(flat);

    if (this._fillColor !== null && this._fillColor !== undefined) {
      this._shapeElement.fill(colorToHex(this._fillColor));
    } else {
      this._shapeElement.fill("none");
    }

    this._shapeElement.stroke({
      color: colorToHex(this._lineColor),
      width: this._lineThickness,
    });
  }

  setFillColor(color) {
    this._fillColor = color;
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
    if (this._shapeElement)
      this._shapeElement.stroke({
        color: colorToHex(color),
        width: this._lineThickness,
      });
    return this;
  }

  setLineThickness(thickness) {
    this._lineThickness = thickness;
    if (this._shapeElement)
      this._shapeElement.stroke({
        color: colorToHex(this._lineColor),
        width: thickness,
      });
    return this;
  }

  setPoints(points) {
    this._points = [...points];
    this._draw();
    return this;
  }

  updatePoint(index, x, y) {
    if (index >= 0 && index < this._points.length) {
      this._points[index] = [x, y];
      this._draw();
    }
    return this;
  }

  getPoints() {
    return [...this._points];
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
          en: "Visibility of the element",
          de: "Sichtbarkeit des Elements",
        },
        example: "visible = false",
      },
    },
    methods: {
      setBorder: {
        example: "setBorder(0xff0000, 2)",
        info: {
          en: "Sets a border with color and thickness",
          de: "Setzt einen Rahmen mit Farbe und Dicke",
        },
      },
      setTransformationPoint: {
        example: "setTransformationPoint(0, 0)",
        info: {
          en: "Defines the transformation point for position of the element",
          de: "Definiert den Transformationspunkt für die Position des Elements",
        },
      },
      setRotationPoint: {
        example: "setRotationPoint(0, 0)",
        info: {
          en: "Sets the rotation pivot relative to the element's origin (0, 0)",
          de: "Setzt den Rotationspunkt relativ zum Ursprung (0, 0) des Elements",
        },
      },
      setGradient: {
        example:
          'setGradient("radial", [{offset:0,color:"#fff"},{offset:1,color:"#000"}])',
        info: {
          en: "Creates a gradient",
          de: "Erstellt einen Farbverlauf",
        },
      },
      setScale: {
        example: "setScale(0.75)",
        info: {
          en: "Scales the polygon proportionally",
          de: "Skaliert das Vieleck proportional",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the entire polygon (0 = invisible, 1 = fully visible)",
          de: "Setzt die Transparenz des gesamten Vielecks (0 = unsichtbar, 1 = vollständig sichtbar)",
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
          en: "Enables dragging within the specified rectangular bounds",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Rechtecksgrenzen",
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
    if (this._polygonElement) {
      this._polygonElement.remove();
      this._polygonElement = null;
    }

    if (this._gradientDef) {
      this._gradientDef.remove();
      this._gradientDef = null;
    }

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

    if (this._gradientDef) {
      this._gradientDef.remove();
      this._gradientDef = null;
    }

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

    const effectiveX = this._visualX + this._rotationPivotX - this._pivotX;
    const effectiveY = this._visualY + this._rotationPivotY - this._pivotY;

    // SVG transform sequence: translate → rotate → scale
    let transform = `translate(${effectiveX}, ${effectiveY})`;

    if (this._rotationDegrees !== 0) {
      transform += ` rotate(${this._rotationDegrees})`;
    }

    if (this._scaleX !== 1 || this._scaleY !== 1) {
      transform += ` scale(${this._scaleX}, ${this._scaleY})`;
    }

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

  setScale(factor) {
    this._scaleX = factor;
    this._scaleY = factor;
    this._updateTransform();
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

    if (this._gradientDef) {
      this._gradientDef.remove();
      this._gradientDef = null;
    }

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
          en: "Array of points to define the path",
          de: "Array von Punkten zur Definition des Pfads",
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
          en: "Defines whether the object is visible or invisible",
          de: "Legt fest, ob das Objekt sichtbar oder unsichtbar ist",
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
          en: "Sets the transparency of the entire object",
          de: "Setzt die Transparenz des gesamten Objekts",
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
          en: "Enables dragging within the specified rectangular bounds",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Rechtecksgrenzen",
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
          en: "Sets the visibility of the entire object",
          de: "Setzt die Sichtbarkeit des gesamten Objekts",
        },
        example: "visible = false",
      },
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
          en: "Sets the transparency of the entire object (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des gesamten Objekts (0.0 = vollständig transparent, 1.0 = vollständig undurchsichtig)",
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
          en: "Enables dragging within the specified rectangular bounds",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Rechtecksgrenzen",
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
      "let mySplinePath = new SplinePath([[0,0], [100,50], [200,100]], 0xff0000, 3);",
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
          en: "Defines whether the object is visible or invisible",
          de: "Legt fest, ob das Objekt sichtbar oder unsichtbar ist",
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
          en: "Sets the transparency of the entire object (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des gesamten Objekts (0.0 = vollständig transparent, 1.0 = vollständig undurchsichtig)",
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
          en: "Enables dragging within the specified rectangular bounds",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Rechtecksgrenzen",
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
    this._draw();
    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (this._pathElement) this._pathElement.remove();
    if (this._fillElement) this._fillElement.remove();
    this._fillElement = null;

    if (this.points.length < 2) return;

    // Catmull-Rom to cubic Bézier conversion
    const pts = this.points;
    let d = `M ${pts[0][0]},${pts[0][1]}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

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

    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const p0 = sortedPoints[i === 0 ? i : i - 1];
      const p1 = sortedPoints[i];
      const p2 = sortedPoints[i + 1];
      const p3 = sortedPoints[i + 2] || p2;

      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

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

    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const p0 = sortedPoints[i === 0 ? i : i - 1];
      const p1 = sortedPoints[i];
      const p2 = sortedPoints[i + 1];
      const p3 = sortedPoints[i + 2] || p2;

      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

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
          en: "Sets the visibility of the object",
          de: "Setzt die Sichtbarkeit des Objekts",
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
          en: "Sets the transparency of the entire arrow (0.0 to 1.0)",
          de: "Setzt die Transparenz des gesamten Pfeils (0.0 bis 1.0)",
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
          en: "Enables dragging within the specified rectangular bounds",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Rechtecksgrenzen",
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
          en: "Sets the visibility of the parallelogram",
          de: "Setzt die Sichtbarkeit des Parallelogramms",
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
          en: "Sets the transparency of the parallelogram (0.0 to 1.0)",
          de: "Setzt die Transparenz des Parallelogramms (0.0 bis 1.0)",
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
          en: "Enables dragging within the specified rectangular bounds",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Rechtecksgrenzen",
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
          en: "Text to display as label (supports <sub> and <sup> tags)",
          de: "Text der als Beschriftung angezeigt wird (unterstützt <sub> und <sup> Tags)",
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
          en: "Sets the visibility of the object",
          de: "Setzt die Sichtbarkeit des Objekts",
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
        example: 'setText("H<sub>2</sub>O")',
        info: {
          en: "Changes the text of the label (supports <sub> and <sup> tags)",
          de: "Ändert den Text der Beschriftung (unterstützt <sub> und <sup> Tags)",
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
          en: "Sets the transparency of the entire label (0.0 to 1.0)",
          de: "Setzt die Transparenz der gesamten Beschriftung (0.0 bis 1.0)",
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
          en: "Enables dragging within the specified rectangular bounds",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Rechtecksgrenzen",
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
    const regex = /<(sub|sup)>(.*?)<\/\1>/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(htmlText)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          text: htmlText.substring(lastIndex, match.index),
          type: "normal",
        });
      }
      segments.push({
        text: match[2],
        type: match[1],
      });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < htmlText.length) {
      segments.push({
        text: htmlText.substring(lastIndex),
        type: "normal",
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
          en: "Text to display as label (supports <sub> and <sup> tags)",
          de: "Text der als Beschriftung angezeigt wird (unterstützt <sub> und <sup> Tags)",
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
          en: "Sets the visibility of the object",
          de: "Setzt die Sichtbarkeit des Objekts",
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
        example: 'setText("H<sub>2</sub>O")',
        info: {
          en: "Changes the text of the label (supports <sub> and <sup> tags)",
          de: "Ändert den Text der Beschriftung (unterstützt <sub> und <sup> Tags)",
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
          en: "Sets the transparency of the entire label (0.0 to 1.0)",
          de: "Setzt die Transparenz der gesamten Beschriftung (0.0 bis 1.0)",
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
          en: "Enables dragging within the specified rectangular bounds",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Rechtecksgrenzen",
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
    const regex = /<(sub|sup)>(.*?)<\/\1>/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(htmlText)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          text: htmlText.substring(lastIndex, match.index),
          type: "normal",
        });
      }
      segments.push({
        text: match[2],
        type: match[1],
      });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < htmlText.length) {
      segments.push({
        text: htmlText.substring(lastIndex),
        type: "normal",
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
          en: "Sets the visibility of the object",
          de: "Setzt die Sichtbarkeit des Objekts",
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
          en: "Sets the transparency of the entire angle arc (0.0 to 1.0)",
          de: "Setzt die Transparenz des gesamten Winkelbogens (0.0 bis 1.0)",
        },
      },
      setLongArc: {
        example: "setLongArc(true)",
        info: {
          en: "Sets whether to draw the longer arc (true) or shorter arc (false)",
          de: "Legt fest, ob der längere Bogen (true) oder kürzere Bogen (false) gezeichnet wird",
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
          en: "Enables dragging within the specified rectangular bounds",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Rechtecksgrenzen",
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

    this._arcElement = null;
    this._textElement = null;

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

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = angleDiff > Math.PI ? 1 : 0;
      const sweep = 1;

      const d = `M ${x1},${y1} A ${r},${r} 0 ${largeArc} ${sweep} ${x2},${y2}`;

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

    this._createTextElement();
    this._updateTextPosition();
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

    const { startAngle, angleDiff } = this._calculateAngles();

    let midAngle = startAngle + angleDiff / 2;
    while (midAngle > 2 * Math.PI) midAngle -= 2 * Math.PI;
    while (midAngle < 0) midAngle += 2 * Math.PI;

    let radiusFactor = 0.7;
    if (this._text === "•" && this._isRightAngle()) {
      radiusFactor = 0.55;
    }

    const textX =
      this._centerX + Math.cos(midAngle) * (this._radius * radiusFactor);
    const textY =
      this._centerY + Math.sin(midAngle) * (this._radius * radiusFactor);

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
    return this;
  }

  setLongArc(useLongArc) {
    this._longArc = !!useLongArc;
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
          en: "Sets the visibility",
          de: "Setzt die Sichtbarkeit",
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
          en: "Sets transparency (0.0 to 1.0)",
          de: "Setzt Transparenz (0.0 bis 1.0)",
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
          en: "Horizontal position of the ruler",
          de: "Horizontale Position des Lineals",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the ruler",
          de: "Vertikale Position des Lineals",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Controls the visibility of the ruler",
          de: "Steuert die Sichtbarkeit des Lineals",
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
          en: "Controls the visibility of the entire coordinate system",
          de: "Steuert die Sichtbarkeit des gesamten Koordinatensystems",
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
          en: "Defines whether the object is visible or invisible",
          de: "Legt fest, ob das Objekt sichtbar oder unsichtbar ist",
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
          en: "Scales the element in both directions",
          de: "Skaliert das Element in beide Richtungen",
        },
        example: "setScale(1.5, 1.5)",
      },
      setAlpha: {
        name: "setAlpha",
        info: {
          en: "Sets the transparency of the element (0 = invisible, 1 = fully visible)",
          de: "Setzt die Transparenz des Elements (0 = unsichtbar, 1 = vollständig sichtbar)",
        },
        example: "setAlpha(0.5)",
      },
      setRotationPoint: {
        example: "setRotationPoint(0, 0)",
        info: {
          en: "Sets the rotation pivot relative to the element's origin (0, 0)",
          de: "Setzt den Rotationspunkt relativ zum Ursprung (0, 0) des Elements",
        },
      },
      setTransformationPoint: {
        name: "setTransformationPoint",
        example: "setTransformationPoint(0, 0)",
        info: {
          en: "Defines the transformation point for position of the element",
          de: "Definiert den Transformationspunkt für die Position des Elements",
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
          en: "Enables dragging within the specified rectangular bounds",
          de: "Ermöglicht das Ziehen innerhalb der angegebenen Rechtecksgrenzen",
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
    this._maintainStrokeWidth = false;
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
      // Ensure xmlns is present: without the SVG namespace, DOMParser
      // treats elements as generic XML and the browser won't render them.
      let svgString = this._originalSvgString;
      if (!svgString.includes("xmlns")) {
        svgString = svgString.replace(
          "<svg",
          '<svg xmlns="http://www.w3.org/2000/svg"',
        );
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, "image/svg+xml");
      const svgEl = doc.documentElement;

      if (
        svgEl.tagName === "parsererror" ||
        svgEl.querySelector("parsererror")
      ) {
        console.error("Fehler beim Parsen des SVG-Strings");
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
          en: "Adds a keyframe animation with multiple time points",
          de: "Fügt eine Keyframe-Animation hinzu mit mehreren Zeitpunkten",
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
          en: "Registers a callback function that is called on every frame",
          de: "Registriert eine Callback-Funktion, die bei jedem Frame aufgerufen wird",
        },
      },
      setProgress: {
        example: "setProgress(0.5)",
        info: {
          en: "Sets the animation progress directly (0.0 to 1.0)",
          de: "Setzt den Fortschritt der Animation direkt (0.0 bis 1.0)",
        },
      },
    },
  };

  constructor(duration = null, loop = false, autoStart = false) {
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

  _startUpdateLoop() {
    this._animationFrameLoop();
  }

  _stopUpdateLoop() {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  _animationFrameLoop() {
    if (this._isRunning && !this._isPaused) {
      this._update();
      this._animationFrameId = requestAnimationFrame(() =>
        this._animationFrameLoop(),
      );
    }
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
// SpatialHash – helper data structure for ParticleSystem
// ============================================================================

SvgJSEdu.SpatialHash = class SpatialHash {
  constructor(cellSize = 50) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  clear() {
    this.grid.clear();
  }

  hash(x, y) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return cellX + "," + cellY;
  }

  insert(particle) {
    const key = this.hash(particle.x, particle.y);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key).push(particle);
  }

  getNearby(particle) {
    const nearby = [];
    const cellX = Math.floor(particle.x / this.cellSize);
    const cellY = Math.floor(particle.y / this.cellSize);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = cellX + dx + "," + (cellY + dy);
        const cell = this.grid.get(key);
        if (cell) {
          nearby.push(...cell);
        }
      }
    }
    return nearby;
  }
};

// ============================================================================
// Particle – single particle (internal, used by ParticleSystem)
// ============================================================================

SvgJSEdu.Particle = class Particle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.radius = options.radius || 5;
    this.color = options.color || 0xffffff;
    this.life = options.life || Infinity;
    this.age = 0;
    this.active = true;
    this._element = null;
  }
};

// ============================================================================
// ParticleSystem
// ============================================================================

SvgJSEdu.ParticleSystem = class ParticleSystem extends SvgJSElement {
  static serializationMap = {
    description: {
      de: "Partikelsystem für Simulationen",
      en: "Particle system for simulations",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example:
      "let myParticleSystem = new ParticleSystem({maxParticles: 100, gravity: 0.5});",
    constructor: {
      options: {
        name: "options",
        info: {
          en: "Configuration object for particle system",
          de: "Konfigurationsobjekt für Partikelsystem",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: { en: "Horizontal position", de: "Horizontale Position" },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: { en: "Vertical position", de: "Vertikale Position" },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: { en: "Visibility", de: "Sichtbarkeit" },
        example: "visible = false",
      },
      debug: {
        name: "debug",
        info: {
          en: "Enable/disable debug visualization",
          de: "Debug-Visualisierung",
        },
        example: "debug = true",
      },
    },
    methods: {
      setMainContainer: {
        example: "setMainContainer(containerShape)",
        info: {
          en: "Sets the main container that defines movement boundaries with collision",
          de: "Setzt den Haupt-Container, der die Bewegungsgrenzen mit Kollision definiert",
        },
      },
      setSpawnContainer: {
        example:
          "setSpawnContainer(containerShape, {rate: 10, initialVelocity: {x:0, y:0}})",
        info: {
          en: "Sets the spawn area for particle creation",
          de: "Setzt den Spawn-Bereich für Partikelerzeugung",
        },
      },
      setDeathContainer: {
        example: "setDeathContainer(containerShape)",
        info: {
          en: "Sets the death zone where particles are destroyed",
          de: "Setzt die Todeszone, in der Partikel zerstört werden",
        },
      },
      createParticle: {
        example:
          "createParticle(100, 200, {radius: 10, color: 0xFF0000, vx: 2, vy: -1})",
        info: {
          en: "Manually creates a single particle",
          de: "Erstellt manuell ein einzelnes Partikel",
        },
      },
      setGravity: {
        example: "setGravity(0, 0.5)",
        info: {
          en: "Sets gravity force",
          de: "Setzt die Gravitationskraft",
        },
      },
      setFriction: {
        example: "setFriction(0.99)",
        info: {
          en: "Sets global friction coefficient (0-1)",
          de: "Setzt den globalen Reibungskoeffizienten (0-1)",
        },
      },
      setRestitution: {
        example: "setRestitution(0.8)",
        info: {
          en: "Sets bounce coefficient (0-1)",
          de: "Setzt den Abprallkoeffizienten (0-1)",
        },
      },
      clearParticles: {
        example: "clearParticles()",
        info: {
          en: "Removes all active particles",
          de: "Entfernt alle aktiven Partikel",
        },
      },
      pause: {
        example: "pause()",
        info: { en: "Pauses the simulation", de: "Pausiert die Simulation" },
      },
      resume: {
        example: "resume()",
        info: { en: "Resumes the simulation", de: "Setzt die Simulation fort" },
      },
    },
  };

  constructor(options = {}) {
    super();
    this.config = {
      maxParticles: options.maxParticles || 1000,
      gravity: options.gravity || { x: 0, y: 0.1 },
      friction: options.friction || 0.99,
      restitution: options.restitution || 0.8,
      particleRadius: options.particleRadius || 5,
      particleColor: options.particleColor || 0xffffff,
      useSpatialHash: options.useSpatialHash !== false,
      cellSize: options.cellSize || 50,
      debug: options.debug || false,
    };

    this.containers = new Map();
    this.mainContainer = null;
    this.spawnContainer = null;
    this.deathContainer = null;
    this.propertyContainers = [];
    this.particles = [];
    this.particlePool = [];
    this.activeParticles = 0;
    this.paused = false;
    this.spatialHash = new SvgJSEdu.SpatialHash(this.config.cellSize);

    this._particleGroup = this._group.group();
    this._debugGroup = null;
    if (this.config.debug) {
      this._debugGroup = this._group.group();
    }

    this._rafId = null;
    this._lastTimestamp = null;
    this._spawnAccumulator = 0;

    BoardSVG[INSTANCE_KEY].addChild(this);
  }

  set debug(value) {
    this.config.debug = value;
    if (value && !this._debugGroup) {
      this._debugGroup = this._group.group();
    } else if (!value && this._debugGroup) {
      this._debugGroup.remove();
      this._debugGroup = null;
    }
  }

  get debug() {
    return this.config.debug;
  }

  setMainContainer(shape) {
    this.mainContainer = shape;
    return this;
  }

  setSpawnContainer(shape, config = {}) {
    this.spawnContainer = {
      shape,
      rate: config.rate || 10,
      initialVelocity: config.initialVelocity || { x: 0, y: 0 },
      velocityRandomness: config.velocityRandomness || { x: 0, y: 0 },
    };
    return this;
  }

  setDeathContainer(shape) {
    this.deathContainer = shape;
    return this;
  }

  addPropertyContainer(shape, properties, callbacks = {}) {
    this.propertyContainers.push({ shape, properties, callbacks });
    return this;
  }

  createParticle(x, y, options = {}) {
    if (this.activeParticles >= this.config.maxParticles) return null;

    const particle = new SvgJSEdu.Particle(x, y, {
      radius: options.radius || this.config.particleRadius,
      color: options.color || this.config.particleColor,
      vx: options.vx || 0,
      vy: options.vy || 0,
      life: options.life || Infinity,
    });

    particle._element = this._particleGroup
      .circle(particle.radius * 2)
      .cx(x)
      .cy(y)
      .fill(colorToHex(particle.color));

    this.particles.push(particle);
    this.activeParticles++;
    return particle;
  }

  setGravity(gx, gy) {
    this.config.gravity = { x: gx, y: gy };
    return this;
  }

  setFriction(friction) {
    this.config.friction = friction;
    return this;
  }

  setRestitution(restitution) {
    this.config.restitution = restitution;
    return this;
  }

  clearParticles() {
    for (const p of this.particles) {
      if (p._element) p._element.remove();
    }
    this.particles = [];
    this.activeParticles = 0;
    return this;
  }

  _update(delta) {
    if (this.paused) return;

    const dt = delta / 16.67; // normalize to ~60fps

    if (this.spawnContainer) {
      this._spawnAccumulator += this.spawnContainer.rate * (delta / 1000);
      while (
        this._spawnAccumulator >= 1 &&
        this.activeParticles < this.config.maxParticles
      ) {
        this._spawnAccumulator--;
        const shape = this.spawnContainer.shape;
        const bbox = shape._shapeElement
          ? shape._shapeElement.bbox()
          : { x: 0, y: 0, width: 100, height: 100 };
        const sx = bbox.x + Math.random() * bbox.width + (shape._visualX || 0);
        const sy = bbox.y + Math.random() * bbox.height + (shape._visualY || 0);
        const vx =
          this.spawnContainer.initialVelocity.x +
          (Math.random() - 0.5) *
            2 *
            (this.spawnContainer.velocityRandomness.x || 0);
        const vy =
          this.spawnContainer.initialVelocity.y +
          (Math.random() - 0.5) *
            2 *
            (this.spawnContainer.velocityRandomness.y || 0);
        this.createParticle(sx, sy, { vx, vy });
      }
    }

    const gravity = this.config.gravity;
    const friction = this.config.friction;
    const restitution = this.config.restitution;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.vx += gravity.x * dt;
      p.vy += gravity.y * dt;

      p.vx *= friction;
      p.vy *= friction;

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.age += delta;

      if (p.age > p.life) {
        this._removeParticle(i);
        continue;
      }

      if (this.mainContainer && this.mainContainer._shapeElement) {
        const bbox = this.mainContainer._shapeElement.bbox();
        const ox = this.mainContainer._visualX || 0;
        const oy = this.mainContainer._visualY || 0;
        const minX = bbox.x + ox + p.radius;
        const maxX = bbox.x + bbox.width + ox - p.radius;
        const minY = bbox.y + oy + p.radius;
        const maxY = bbox.y + bbox.height + oy - p.radius;

        if (p.x < minX) {
          p.x = minX;
          p.vx = Math.abs(p.vx) * restitution;
        }
        if (p.x > maxX) {
          p.x = maxX;
          p.vx = -Math.abs(p.vx) * restitution;
        }
        if (p.y < minY) {
          p.y = minY;
          p.vy = Math.abs(p.vy) * restitution;
        }
        if (p.y > maxY) {
          p.y = maxY;
          p.vy = -Math.abs(p.vy) * restitution;
        }
      }

      if (this.deathContainer && this.deathContainer._shapeElement) {
        const bbox = this.deathContainer._shapeElement.bbox();
        const ox = this.deathContainer._visualX || 0;
        const oy = this.deathContainer._visualY || 0;
        if (
          p.x >= bbox.x + ox &&
          p.x <= bbox.x + bbox.width + ox &&
          p.y >= bbox.y + oy &&
          p.y <= bbox.y + bbox.height + oy
        ) {
          this._removeParticle(i);
          continue;
        }
      }

      if (p._element) {
        p._element.cx(p.x).cy(p.y);
      }
    }
  }

  _removeParticle(index) {
    const p = this.particles[index];
    if (p._element) p._element.remove();
    this.particles.splice(index, 1);
    this.activeParticles--;
  }

  start() {
    if (this._rafId) return this;
    this._lastTimestamp = null;
    this._runLoop();
    return this;
  }

  _runLoop() {
    this._rafId = requestAnimationFrame((timestamp) => {
      if (this._lastTimestamp === null) this._lastTimestamp = timestamp;
      const delta = timestamp - this._lastTimestamp;
      this._lastTimestamp = timestamp;
      this._update(delta);
      this._runLoop();
    });
  }

  stop() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    return this;
  }

  pause() {
    this.paused = true;
    return this;
  }

  resume() {
    this.paused = false;
    return this;
  }

  destroy() {
    this.stop();
    this.clearParticles();
    super.destroy();
  }
};

// ============================================================================
// Module-Export
// ============================================================================

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SvgJSEdu, SvgJSElement, PathBase };
}
