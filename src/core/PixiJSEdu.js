/**
 * PixiJSEdu - Educational Animation Library
 * Version: 1.0.3
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
 *
 * This library is built on top of PixiJS (https://pixijs.com/)
 * PixiJS is licensed under the MIT License
 */

var PixiJSEdu = PixiJSEdu || {};

PixiJSEdu.BoardGUI = class BoardGUI extends PIXI.Container {
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
};

PixiJSEdu.Group = class Group extends PIXI.Container {
  static serializationMap = {
    description: {
      de: "Gruppe von grafischen Objekten",
      en: "Group of graphic objects",
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
          en: "Visibility of the entire group (true/false)",
          de: "Sichtbarkeit der gesamten Gruppe (true/false)",
        },
        example: "visible = false",
      },
    },
    methods: {
      addChild: {
        example: "addChild(rectangle)",
        info: {
          en: "Adds an object to the group",
          de: "Fügt ein Objekt zur Gruppe hinzu",
        },
      },
      removeChild: {
        example: "removeChild(rectangle)",
        info: {
          en: "Removes an object from the group",
          de: "Entfernt ein Objekt aus der Gruppe",
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

  constructor() {
    super();
    this._visualX = 0;
    this._visualY = 0;
    this._pivotX = 0;
    this._pivotY = 0;
    this._rotationPivotX = 0;
    this._rotationPivotY = 0;
    this._rotationDegrees = 0;
    this._visible = true;
    this._alpha = 1;
    this._maskGraphics = null;
    this._hasMask = false;

    this._clickHandler = null;
    this._mouseDownHandler = null;
    this._mouseUpHandler = null;
    this._mouseOverHandler = null;
    this._mouseOutHandler = null;

    this.eventMode = "static";
    this.cursor = "pointer";

    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
  }

  _updatePosition() {
    super.x = this._visualX + this._rotationPivotX - this._pivotX;
    super.y = this._visualY + this._rotationPivotY - this._pivotY;
  }

  _updateRotationPivot() {
    this.pivot.set(this._rotationPivotX, this._rotationPivotY);
    this._updatePosition();
  }

  set x(value) {
    this._visualX = value;
    this._updatePosition();
    if (this._hasMask && this._maskGraphics) {
      this._updateMaskPosition();
    }
  }

  get x() {
    return this._visualX;
  }

  set y(value) {
    this._visualY = value;
    this._updatePosition();
    if (this._hasMask && this._maskGraphics) {
      this._updateMaskPosition();
    }
  }

  get y() {
    return this._visualY;
  }

  set rotation(degrees) {
    this._rotationDegrees = degrees;
    super.rotation = degrees * (Math.PI / 180);
  }

  get rotation() {
    return this._rotationDegrees || 0;
  }

  set visible(value) {
    super.visible = Boolean(value);
  }

  get visible() {
    return super.visible;
  }

  setMask(x, y, width, height) {
    this.removeMask();
    this._maskGraphics = new PIXI.Graphics();
    this._maskGraphics.beginFill(0xffffff);
    this._maskGraphics.drawRect(x, y, width, height);
    this._maskGraphics.endFill();
    this._maskX = x;
    this._maskY = y;
    this._maskWidth = width;
    this._maskHeight = height;
    this.addChild(this._maskGraphics);
    this.mask = this._maskGraphics;
    this._hasMask = true;
    return this;
  }

  _updateMaskPosition() {
    if (this._maskGraphics && this._hasMask) {
      // Mask position update logic if needed
    }
  }

  removeMask() {
    if (this._hasMask && this._maskGraphics) {
      this.mask = null;
      this.removeChild(this._maskGraphics);
      this._maskGraphics.destroy();
      this._maskGraphics = null;
      this._hasMask = false;
    }
    return this;
  }

  hasMask() {
    return this._hasMask;
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

  addChild(child) {
    if (child.parent === app.stage) {
      app.stage.removeChild(child);
    }
    if (child.parent === Board[INSTANCE_KEY]) {
      Board[INSTANCE_KEY].removeChild(child);
    }
    super.addChild(child);
    return this;
  }

  removeChild(child) {
    super.removeChild(child);
    app.stage.addChild(child);
    Board[INSTANCE_KEY].addChild(child);
    return this;
  }

  setTransformationPoint(offsetX = 0, offsetY = 0) {
    this._pivotX = offsetX;
    this._pivotY = offsetY;
    this._updatePosition();
    return this;
  }

  setRotationPoint(offsetX = 0, offsetY = 0) {
    this._rotationPivotX = offsetX;
    this._rotationPivotY = offsetY;
    this._updateRotationPivot();
    return this;
  }

  setScale(factor) {
    this.scale.set(factor);
    return this;
  }

  setAlpha(alpha) {
    this._alpha = Math.max(0, Math.min(1, alpha));
    this.alpha = this._alpha;
    return this;
  }

  getBounds() {
    return super.getBounds();
  }

  getChildCount() {
    return this.children.length;
  }

  removeAllChildren() {
    const childrenCopy = [...this.children];
    childrenCopy.forEach((child) => {
      if (child !== this._maskGraphics) {
        this.removeChild(child);
      }
    });
    return this;
  }

  getChildren() {
    return this.children.filter((child) => child !== this._maskGraphics);
  }

  hasChild(child) {
    return this.children.includes(child) && child !== this._maskGraphics;
  }

  getChildAt(index) {
    const realChildren = this.getChildren();
    if (index >= 0 && index < realChildren.length) {
      return realChildren[index];
    }
    return null;
  }

  destroy() {
    if (this._clickHandler) {
      this.off("pointerdown", this._clickHandler);
    }
    if (this._mouseDownHandler) {
      this.off("pointerdown", this._mouseDownHandler);
    }
    if (this._mouseUpHandler) {
      this.off("pointerup", this._mouseUpHandler);
    }
    if (this._mouseOverHandler) {
      this.off("pointerover", this._mouseOverHandler);
    }
    if (this._mouseOutHandler) {
      this.off("pointerout", this._mouseOutHandler);
    }

    this.removeMask();
    if (this.parent === app.stage) {
      app.stage.removeChild(this);
    }
    if (this.parent === Board[INSTANCE_KEY]) {
      Board[INSTANCE_KEY].removeChild(this);
    }
    this.children.forEach((child) => {
      if (child.destroy) {
        child.destroy();
      }
    });
    super.destroy();
  }
};

PixiJSEdu.Rectangle = class Rectangle extends PIXI.Container {
  static serializationMap = {
    description: {
      de: "Rechteckiges grafisches Element",
      en: "Rectangular graphic element",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myRectangle = new Rectangle(200, 100, 0xff0000);",
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
          en: "Visibility of the element (true/false)",
          de: "Sichtbarkeit des Elements (true/false)",
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
        example: "setRotationPoint(50, 50)",
        info: {
          en: "Sets the rotation pivot relative to the element's origin (0, 0)",
          de: "Setzt den Rotationspunkt relativ zum Ursprung (0, 0) des Elements",
        },
      },
      setGradient: {
        example:
          'setGradient("linear", [{offset:0,color:"#ff0"},{offset:1,color:"#f00"}], 90)',
        info: {
          en: "Creates a linear or radial gradient. Optional angle in degrees for linear gradients (0 = left to right, 90 = top to bottom)",
          de: "Erstellt einen linearen oder radialen Farbverlauf. Optionaler Winkel in Grad für lineare Verläufe (0 = links nach rechts, 90 = oben nach unten)",
        },
      },
      setScale: {
        example: "setScale(0.75)",
        info: {
          en: "Scales the entire element proportionally",
          de: "Skaliert das gesamte Element proportional",
        },
      },
      setAlpha: {
        example: "setAlpha(0.5)",
        info: {
          en: "Sets the transparency of the element (0 = invisible, 1 = fully visible)",
          de: "Setzt die Transparenz des Elements (0 = unsichtbar, 1 = vollständig sichtbar)",
        },
      },
      setRoundedCorners: {
        example: "setRoundedCorners(10);",
        info: {
          en: "Sets rounded corners with radius. Optional: specify which corners (topLeft, topRight, bottomRight, bottomLeft)",
          de: "Setzt abgerundete Ecken mit Radius. Optional: einzelne Ecken angeben (obenLinks, obenRechts, untenRechts, untenLinks)",
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
        example: "setHeight(150)",
        info: {
          en: "Sets the height of the rectangle",
          de: "Setzt die Höhe des Rechtecks",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hello World"); }',
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

  constructor(width, height, color = null) {
    super();
    this._width = width;
    this._height = height;
    this._color = color;
    this._visualX = 0;
    this._visualY = 0;
    this._pivotX = 0;
    this._pivotY = 0;
    this._rotationPivotX = 0;
    this._rotationPivotY = 0;
    this._rotationDegrees = 0;
    this._cornerRadius = 0;
    this._roundedCorners = {
      topLeft: true,
      topRight: true,
      bottomRight: true,
      bottomLeft: true,
    };

    this._clickHandler = null;
    this._mouseDownHandler = null;
    this._mouseUpHandler = null;
    this._mouseOverHandler = null;
    this._mouseOutHandler = null;

    this.rectGraphics = new PIXI.Graphics();
    this.gradientSprite = null;
    this.addChild(this.rectGraphics);
    this._draw();

    this.eventMode = "static";
    this.cursor = "pointer";

    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (!this._gradientStops) {
      this.rectGraphics.clear();
      this.rectGraphics.lineStyle(
        this._borderLine || 0,
        this._borderColor || 0,
      );
      if (this._color !== null) {
        this.rectGraphics.beginFill(this._color);
      } else {
        this.rectGraphics.beginFill(0x000000, 0);
      }
      if (this._cornerRadius > 0) {
        this._drawRoundedRect();
      } else {
        this.rectGraphics.drawRect(0, 0, this._width, this._height);
      }
      this.rectGraphics.endFill();
      this.rectGraphics.visible = true;
      if (this.gradientSprite) {
        this.removeChild(this.gradientSprite);
        this.gradientSprite = null;
      }
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = this._width;
      canvas.height = this._height;
      const ctx = canvas.getContext("2d");
      let gradient;
      if (this._gradientType === "radial") {
        const cx = this._width / 2;
        const cy = this._height / 2;
        const r = Math.max(this._width, this._height) / 2;
        gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      } else {
        const angleRad = ((this._gradientAngle || 0) * Math.PI) / 180;
        const cx = this._width / 2;
        const cy = this._height / 2;
        // Calculate the gradient line endpoints to cover the entire rectangle at the given angle
        const diagLength =
          Math.abs(this._width * Math.cos(angleRad)) +
          Math.abs(this._height * Math.sin(angleRad));
        const halfDiag = diagLength / 2;
        const x0 = cx - halfDiag * Math.cos(angleRad);
        const y0 = cy - halfDiag * Math.sin(angleRad);
        const x1 = cx + halfDiag * Math.cos(angleRad);
        const y1 = cy + halfDiag * Math.sin(angleRad);
        gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      }
      this._gradientStops.forEach((stop) => {
        gradient.addColorStop(stop.offset, stop.color);
      });
      ctx.fillStyle = gradient;
      if (this._cornerRadius > 0) {
        this._drawRoundedRectCanvas(ctx);
      } else {
        ctx.fillRect(0, 0, this._width, this._height);
      }
      ctx.fill();
      const texture = PIXI.Texture.from(canvas);
      if (this.gradientSprite) {
        this.removeChild(this.gradientSprite);
      }
      this.gradientSprite = new PIXI.Sprite(texture);
      this.gradientSprite.x = 0;
      this.gradientSprite.y = 0;
      this.rectGraphics.visible = false;
      this.addChildAt(this.gradientSprite, 0);
      this.rectGraphics.clear();
      this.rectGraphics.lineStyle(
        this._borderLine || 0,
        this._borderColor || 0,
      );
      this.rectGraphics.beginFill(this._color, 0);
      if (this._cornerRadius > 0) {
        this._drawRoundedRect();
      } else {
        this.rectGraphics.drawRect(0, 0, this._width, this._height);
      }
      this.rectGraphics.endFill();
      this.rectGraphics.visible = true;
    }
  }

  _drawRoundedRect() {
    const x = 0;
    const y = 0;
    const width = this._width;
    const height = this._height;
    const radius = Math.min(this._cornerRadius, Math.min(width, height) / 2);
    this.rectGraphics.moveTo(x + radius, y);
    if (this._roundedCorners.topRight) {
      this.rectGraphics.lineTo(x + width - radius, y);
      this.rectGraphics.arcTo(x + width, y, x + width, y + radius, radius);
    } else {
      this.rectGraphics.lineTo(x + width, y);
    }
    if (this._roundedCorners.bottomRight) {
      this.rectGraphics.lineTo(x + width, y + height - radius);
      this.rectGraphics.arcTo(
        x + width,
        y + height,
        x + width - radius,
        y + height,
        radius,
      );
    } else {
      this.rectGraphics.lineTo(x + width, y + height);
    }
    if (this._roundedCorners.bottomLeft) {
      this.rectGraphics.lineTo(x + radius, y + height);
      this.rectGraphics.arcTo(x, y + height, x, y + height - radius, radius);
    } else {
      this.rectGraphics.lineTo(x, y + height);
    }
    if (this._roundedCorners.topLeft) {
      this.rectGraphics.lineTo(x, y + radius);
      this.rectGraphics.arcTo(x, y, x + radius, y, radius);
    } else {
      this.rectGraphics.lineTo(x, y);
    }
    this.rectGraphics.closePath();
  }

  _drawRoundedRectCanvas(ctx) {
    const x = 0;
    const y = 0;
    const width = this._width;
    const height = this._height;
    const radius = Math.min(this._cornerRadius, Math.min(width, height) / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    if (this._roundedCorners.topRight) {
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + radius, radius);
    } else {
      ctx.lineTo(x + width, y);
    }
    if (this._roundedCorners.bottomRight) {
      ctx.lineTo(x + width, y + height - radius);
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    } else {
      ctx.lineTo(x + width, y + height);
    }
    if (this._roundedCorners.bottomLeft) {
      ctx.lineTo(x + radius, y + height);
      ctx.arcTo(x, y + height, x, y + height - radius, radius);
    } else {
      ctx.lineTo(x, y + height);
    }
    if (this._roundedCorners.topLeft) {
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
    } else {
      ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  _updatePosition() {
    super.x = this._visualX + this._rotationPivotX - this._pivotX;
    super.y = this._visualY + this._rotationPivotY - this._pivotY;
  }

  _updateRotationPivot() {
    this.pivot.set(this._rotationPivotX, this._rotationPivotY);
    this._updatePosition();
  }

  set x(value) {
    this._visualX = value;
    this._updatePosition();
  }

  get x() {
    return this._visualX;
  }

  set y(value) {
    this._visualY = value;
    this._updatePosition();
  }

  get y() {
    return this._visualY;
  }

  set rotation(degrees) {
    this._rotationDegrees = degrees;
    super.rotation = degrees * (Math.PI / 180);
  }

  get rotation() {
    return this._rotationDegrees || 0;
  }

  set visible(value) {
    super.visible = Boolean(value);
  }

  get visible() {
    return super.visible;
  }

  setBorder(borderColor, borderLine) {
    this._borderLine = borderLine;
    this._borderColor = borderColor;
    this._draw();
  }

  setTransformationPoint(offsetX = 0, offsetY = 0) {
    this._pivotX = offsetX;
    this._pivotY = offsetY;
    this._updatePosition();
    return this;
  }

  setRotationPoint(offsetX = 0, offsetY = 0) {
    this._rotationPivotX = offsetX;
    this._rotationPivotY = offsetY;
    this._updateRotationPivot();
    return this;
  }

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
  }

  setScale(factor) {
    this.scale.set(factor);
  }

  setAlpha(alpha) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

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
  }

  setWidth(width) {
    this._width = width;
    this._draw();
  }

  setHeight(height) {
    this._height = height;
    this._draw();
  }

  destroy() {
    if (this._clickHandler) {
      this.off("pointerdown", this._clickHandler);
    }
    if (this._mouseDownHandler) {
      this.off("pointerdown", this._mouseDownHandler);
    }
    if (this._mouseUpHandler) {
      this.off("pointerup", this._mouseUpHandler);
    }
    if (this._mouseOverHandler) {
      this.off("pointerover", this._mouseOverHandler);
    }
    if (this._mouseOutHandler) {
      this.off("pointerout", this._mouseOutHandler);
    }
    if (this.gradientSprite) {
      this.gradientSprite.destroy();
    }
    this.rectGraphics.destroy();
    super.destroy();
  }
};

PixiJSEdu.Circle = class Circle extends PIXI.Container {
  static serializationMap = {
    description: {
      de: "Kreisförmiges grafisches Element",
      en: "Circular graphic element",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myCircle = new Circle(50, 0x00ff00);",
    constructor: {
      radius: {
        name: "radius",
        info: {
          en: "Radius of the circle in pixels",
          de: "Radius des Kreises in Pixeln",
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
      setRadius: {
        example: "setRadius(50)",
        info: {
          en: "Sets the radius of the circle",
          de: "Setzt den Radius des Kreises",
        },
      },
      onClick: {
        example:
          'onClick(sendMessage); \n\nfunction sendMessage() { console.log("Hello World"); }',
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

  constructor(radius, color = null) {
    super();
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

    this._clickHandler = null;
    this._mouseDownHandler = null;
    this._mouseUpHandler = null;
    this._mouseOverHandler = null;
    this._mouseOutHandler = null;

    this.circleGraphics = new PIXI.Graphics();
    this.gradientSprite = null;
    this.addChild(this.circleGraphics);
    this._draw();
    this.drawing = false;

    this.eventMode = "static";
    this.cursor = "pointer";

    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    if (!this._gradientStops) {
      this.circleGraphics.clear();
      this.circleGraphics.lineStyle(
        this._borderLine || 0,
        this._borderColor || 0,
      );
      if (this._color !== null) {
        this.circleGraphics.beginFill(this._color);
      } else {
        this.circleGraphics.beginFill(0x000000, 0);
      }
      this.circleGraphics.drawCircle(0, 0, this._radius);
      this.circleGraphics.endFill();
      this.circleGraphics.visible = true;
      if (this.gradientSprite) {
        this.removeChild(this.gradientSprite);
        this.gradientSprite = null;
      }
    } else {
      const canvas = document.createElement("canvas");
      const diameter = this._radius * 2;
      canvas.width = diameter;
      canvas.height = diameter;
      const ctx = canvas.getContext("2d");
      let gradient;
      if (this._gradientType === "radial") {
        gradient = ctx.createRadialGradient(
          this._radius,
          this._radius,
          0,
          this._radius,
          this._radius,
          this._radius,
        );
      } else {
        gradient = ctx.createLinearGradient(
          0,
          this._radius,
          diameter,
          this._radius,
        );
      }
      this._gradientStops.forEach((stop) => {
        gradient.addColorStop(stop.offset, stop.color);
      });
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this._radius, this._radius, this._radius, 0, Math.PI * 2);
      ctx.fill();
      if (this._borderLine) {
        ctx.lineWidth = this._borderLine;
        ctx.strokeStyle = "#" + this._borderColor.toString(16).padStart(6, "0");
        ctx.stroke();
      }
      const texture = PIXI.Texture.from(canvas);
      if (this.gradientSprite) {
        this.removeChild(this.gradientSprite);
      }
      this.gradientSprite = new PIXI.Sprite(texture);
      this.gradientSprite.x = -this._radius;
      this.gradientSprite.y = -this._radius;
      this.circleGraphics.visible = false;
      this.addChildAt(this.gradientSprite, 0);
      this.circleGraphics.clear();
      this.circleGraphics.lineStyle(
        this._borderLine || 0,
        this._borderColor || 0,
      );
      this.circleGraphics.beginFill(this._color, 0);
      this.circleGraphics.drawCircle(0, 0, this._radius);
      this.circleGraphics.endFill();
      this.circleGraphics.visible = true;
    }
  }

  _updatePosition() {
    super.x = this._visualX + this._rotationPivotX - this._pivotX;
    super.y = this._visualY + this._rotationPivotY - this._pivotY;
  }

  _updateRotationPivot() {
    this.pivot.set(this._rotationPivotX, this._rotationPivotY);
    this._updatePosition();
  }

  set x(value) {
    this._visualX = value;
    this._updatePosition();
  }

  get x() {
    return this._visualX;
  }

  set y(value) {
    this._visualY = value;
    this._updatePosition();
  }

  get y() {
    return this._visualY;
  }

  set rotation(degrees) {
    this._rotationDegrees = degrees;
    super.rotation = degrees * (Math.PI / 180);
  }

  get rotation() {
    return this._rotationDegrees || 0;
  }

  set visible(value) {
    super.visible = Boolean(value);
  }

  get visible() {
    return super.visible;
  }

  setBorder(borderColor, borderLine) {
    this._borderLine = borderLine;
    this._borderColor = borderColor;
    this._draw();
  }

  setTransformationPoint(offsetX = 0, offsetY = 0) {
    this._pivotX = offsetX;
    this._pivotY = offsetY;
    this._updatePosition();
    return this;
  }

  setRotationPoint(offsetX = 0, offsetY = 0) {
    this._rotationPivotX = offsetX;
    this._rotationPivotY = offsetY;
    this._updateRotationPivot();
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
    this.scale.set(factor);
  }

  setAlpha(value) {
    this._alpha = Math.max(0, Math.min(1, value));
    this.alpha = this._alpha;
  }

  setRadius(radius) {
    this._radius = radius;
    this._draw();
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
    return methods;
  }

  destroy() {
    if (this._clickHandler) {
      this.off("pointerdown", this._clickHandler);
    }
    if (this._mouseDownHandler) {
      this.off("pointerdown", this._mouseDownHandler);
    }
    if (this._mouseUpHandler) {
      this.off("pointerup", this._mouseUpHandler);
    }
    if (this._mouseOverHandler) {
      this.off("pointerover", this._mouseOverHandler);
    }
    if (this._mouseOutHandler) {
      this.off("pointerout", this._mouseOutHandler);
    }
    if (this.gradientSprite) {
      this.gradientSprite.destroy();
    }
    this.circleGraphics.destroy();
    super.destroy();
  }
};

PixiJSEdu.Polygon = class Polygon extends PIXI.Container {
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
    super();
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

    this._clickHandler = null;
    this._mouseDownHandler = null;
    this._mouseUpHandler = null;
    this._mouseOverHandler = null;
    this._mouseOutHandler = null;

    this.polygonGraphics = new PIXI.Graphics();
    this.gradientSprite = null;
    this.addChild(this.polygonGraphics);
    this._draw();
    this.drawing = false;

    this.eventMode = "static";
    this.cursor = "pointer";

    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
  }
  _calculatePolygonPoints() {
    const points = [];
    const angleStep = (Math.PI * 2) / this._sides;
    const startAngleRad = this._startAngle * (Math.PI / 180);
    for (let i = 0; i < this._sides; i++) {
      const angle = startAngleRad + i * angleStep;
      const x = Math.cos(angle) * this._radius;
      const y = Math.sin(angle) * this._radius;
      points.push(x, y);
    }
    return points;
  }
  _draw() {
    const points = this._calculatePolygonPoints();
    if (!this._gradientStops) {
      this.polygonGraphics.clear();
      this.polygonGraphics.lineStyle(
        this._borderLine || 0,
        this._borderColor || 0,
      );
      if (this._color !== null) {
        this.polygonGraphics.beginFill(this._color);
      } else {
        this.polygonGraphics.beginFill(0x000000, 0);
      }
      this.polygonGraphics.drawPolygon(points);
      this.polygonGraphics.endFill();
      this.polygonGraphics.visible = true;
      if (this.gradientSprite) {
        this.removeChild(this.gradientSprite);
        this.gradientSprite = null;
      }
    } else {
      const canvas = document.createElement("canvas");
      const diameter = this._radius * 2;
      const padding = this._borderLine ? this._borderLine : 0;
      canvas.width = diameter + padding * 2;
      canvas.height = diameter + padding * 2;
      const ctx = canvas.getContext("2d");
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      let gradient;
      if (this._gradientType === "radial") {
        gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          this._radius,
        );
      } else {
        gradient = ctx.createLinearGradient(
          centerX - this._radius,
          centerY,
          centerX + this._radius,
          centerY,
        );
      }
      this._gradientStops.forEach((stop) => {
        gradient.addColorStop(stop.offset, stop.color);
      });
      ctx.fillStyle = gradient;
      ctx.beginPath();
      const angleStep = (Math.PI * 2) / this._sides;
      const startAngleRad = this._startAngle * (Math.PI / 180);
      for (let i = 0; i < this._sides; i++) {
        const angle = startAngleRad + i * angleStep;
        const x = centerX + Math.cos(angle) * this._radius;
        const y = centerY + Math.sin(angle) * this._radius;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      if (this._borderLine) {
        ctx.lineWidth = this._borderLine;
        ctx.strokeStyle = "#" + this._borderColor.toString(16).padStart(6, "0");
        ctx.stroke();
      }
      const texture = PIXI.Texture.from(canvas);
      if (this.gradientSprite) {
        this.removeChild(this.gradientSprite);
      }
      this.gradientSprite = new PIXI.Sprite(texture);
      this.gradientSprite.x = -centerX;
      this.gradientSprite.y = -centerY;
      this.polygonGraphics.visible = false;
      this.addChildAt(this.gradientSprite, 0);
      this.polygonGraphics.clear();
      this.polygonGraphics.lineStyle(
        this._borderLine || 0,
        this._borderColor || 0,
      );
      this.polygonGraphics.beginFill(this._color, 0);
      this.polygonGraphics.drawPolygon(points);
      this.polygonGraphics.endFill();
      this.polygonGraphics.visible = true;
    }
  }

  _updatePosition() {
    super.x = this._visualX + this._rotationPivotX - this._pivotX;
    super.y = this._visualY + this._rotationPivotY - this._pivotY;
  }
  _updateRotationPivot() {
    this.pivot.set(this._rotationPivotX, this._rotationPivotY);
    this._updatePosition();
  }
  set x(value) {
    this._visualX = value;
    this._updatePosition();
  }
  get x() {
    return this._visualX;
  }
  set y(value) {
    this._visualY = value;
    this._updatePosition();
  }
  get y() {
    return this._visualY;
  }
  set rotation(degrees) {
    this._rotationDegrees = degrees;
    super.rotation = degrees * (Math.PI / 180);
  }
  get rotation() {
    return this._rotationDegrees || 0;
  }
  set visible(value) {
    super.visible = Boolean(value);
  }
  get visible() {
    return super.visible;
  }
  setBorder(borderColor, borderLine) {
    this._borderLine = borderLine;
    this._borderColor = borderColor;
    this._draw();
  }
  setTransformationPoint(offsetX = 0, offsetY = 0) {
    this._pivotX = offsetX;
    this._pivotY = offsetY;
    this._updatePosition();
    return this;
  }
  setRotationPoint(offsetX = 0, offsetY = 0) {
    this._rotationPivotX = offsetX;
    this._rotationPivotY = offsetY;
    this._updateRotationPivot();
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
    this.scale.set(factor);
  }
  setAlpha(value) {
    this._alpha = Math.max(0, Math.min(1, value));
    this.alpha = this._alpha;
  }
  setStartAngle(degrees) {
    this._startAngle = degrees;
    this._draw();
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

  destroy() {
    if (this._clickHandler) {
      this.off("pointerdown", this._clickHandler);
    }
    if (this._mouseDownHandler) {
      this.off("pointerdown", this._mouseDownHandler);
    }
    if (this._mouseUpHandler) {
      this.off("pointerup", this._mouseUpHandler);
    }
    if (this._mouseOverHandler) {
      this.off("pointerover", this._mouseOverHandler);
    }
    if (this._mouseOutHandler) {
      this.off("pointerout", this._mouseOutHandler);
    }
    if (this.gradientSprite) {
      this.gradientSprite.destroy();
    }
    this.polygonGraphics.destroy();
    super.destroy();
  }
};
PixiJSEdu.LinePath = class LinePath extends PIXI.Container {
  static serializationMap = {
    description: { de: "Linienpfad aus Punkten", en: "Line path from points" },
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
          en: "Array of points to define the line",
          de: "Array von Punkten zur Definition der Linie",
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
          en: "Sets the fill color for closed line shapes",
          de: "Setzt die Füllfarbe für geschlossene Linienformen",
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
          en: "Replaces the entire point array with a new array. If the path was closed, it will be automatically closed again.",
          de: "Ersetzt das gesamte Punktearray durch ein neues Array. War der Pfad geschlossen, wird er automatisch erneut geschlossen.",
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
    super();
    this.points = points;
    this._color = color;
    this._thickness = thickness;
    this._fillColor = null;
    this._isClosed = false;
    this._x = 0;
    this._y = 0;
    this.markedX = 0;
    this.markerInitialized = false;
    this.markColor = 0x000000;
    this.markRadius = 3;

    this._clickHandler = null;
    this._mouseDownHandler = null;
    this._mouseUpHandler = null;
    this._mouseOverHandler = null;
    this._mouseOutHandler = null;

    this.segmentsContainer = new PIXI.Container();
    this.addChild(this.segmentsContainer);
    this.segments = [];
    this.fillGraphics = new PIXI.Graphics();
    this.segmentsContainer.addChild(this.fillGraphics);
    this.markedCircle = new PIXI.Graphics();
    this.addChild(this.markedCircle);
    this.vGuideLine = new PIXI.Graphics();
    this.addChild(this.vGuideLine);
    this.hGuideLine = new PIXI.Graphics();
    this.addChild(this.hGuideLine);
    this._rebuildSegments();

    this.eventMode = "static";
    this.cursor = "pointer";

    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
  }

  set x(value) {
    this._x = value;
    this.position.x = this._x;
  }

  get x() {
    return this._x;
  }

  set y(value) {
    this._y = value;
    this.position.y = this._y;
  }

  get y() {
    return this._y;
  }

  setFillColor(fillColor) {
    this._fillColor = fillColor;
    this._updateFill();
  }

  setAlpha(alpha) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  setPoints(newPoints) {
    this.points = [...newPoints];
    if (this._isClosed) {
      this._closePathInternal();
    }
    this._rebuildSegments();
  }

  addPointEnd(x, y) {
    if (this._isClosed && this.points.length >= 2) {
      this.points.splice(this.points.length - 1, 0, [x, y]);
      this._rebuildSegments();
    } else {
      this.points.push([x, y]);
      if (this.points.length >= 2) {
        this._addSegment(this.points.length - 2, this.points.length - 1);
      }
      this._updateFill();
    }
  }

  addPointStart(x, y) {
    this.points.unshift([x, y]);
    if (this._isClosed && this.points.length >= 2) {
      this.points[this.points.length - 1] = [x, y];
    }
    this._rebuildSegments();
  }

  removePointEnd() {
    if (this.points.length > 0) {
      if (this._isClosed && this.points.length > 2) {
        this.points.splice(this.points.length - 2, 1);
        this._rebuildSegments();
      } else if (!this._isClosed) {
        this.points.pop();
        if (this.segments.length > 0) {
          const lastSegment = this.segments.pop();
          this.segmentsContainer.removeChild(lastSegment);
          lastSegment.destroy();
        }
        this._updateFill();
      }
    }
  }

  removePointStart() {
    if (this.points.length > 0) {
      this.points.shift();
      if (this._isClosed && this.points.length >= 1) {
        this.points[this.points.length - 1] = [
          this.points[0][0],
          this.points[0][1],
        ];
      }
      this._rebuildSegments();
    }
  }

  shiftX(deltaX) {
    this.segmentsContainer.x += deltaX;
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
    this._rebuildSegments();
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

    this._rebuildSegments();
  }

  addPoint(x, y) {
    this.addPointEnd(x, y);
  }

  removePoint(index) {
    if (index >= 0 && index < this.points.length) {
      this.points.splice(index, 1);
      if (this._isClosed && index === 0 && this.points.length >= 1) {
        this.points[this.points.length - 1] = [
          this.points[0][0],
          this.points[0][1],
        ];
      }
      this._rebuildSegments();
    }
  }

  updatePoint(index, x, y) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = [x, y];
      if (this._isClosed) {
        if (index === 0) {
          this.points[this.points.length - 1] = [x, y];
        } else if (index === this.points.length - 1) {
          this.points[0] = [x, y];
        }
      }
      this._updateSegmentsForPoint(index);
      this._updateFill();
    }
  }

  updatePoints(newPoints) {
    this.setPoints(newPoints);
  }

  get isClosed() {
    return this._isClosed;
  }

  _rebuildSegments() {
    this._clearSegments();
    for (let i = 0; i < this.points.length - 1; i++) {
      this._addSegment(i, i + 1);
    }
    this._updateFill();
  }

  _clearSegments() {
    this.segments.forEach((segment) => {
      this.segmentsContainer.removeChild(segment);
      segment.destroy();
    });
    this.segments = [];
  }

  _addSegment(startIndex, endIndex) {
    if (startIndex >= this.points.length || endIndex >= this.points.length)
      return;
    const segment = new PIXI.Graphics();
    segment.beginFill();
    segment.lineStyle(this._thickness, this._color);
    const [x1, y1] = this.points[startIndex];
    const [x2, y2] = this.points[endIndex];
    segment.moveTo(x1, y1);
    segment.lineTo(x2, y2);
    segment.endFill();
    this.segments.push(segment);
    this.segmentsContainer.addChild(segment);
  }

  _updateSegmentsForPoint(pointIndex) {
    if (pointIndex > 0) {
      this._updateSegment(pointIndex - 1, pointIndex - 1, pointIndex);
    }
    if (pointIndex < this.points.length - 1) {
      this._updateSegment(pointIndex, pointIndex, pointIndex + 1);
    }
  }

  _updateSegment(segmentIndex, startPointIndex, endPointIndex) {
    if (segmentIndex >= this.segments.length) return;
    const segment = this.segments[segmentIndex];
    segment.clear();
    segment.beginFill();
    segment.lineStyle(this._thickness, this._color);
    const [x1, y1] = this.points[startPointIndex];
    const [x2, y2] = this.points[endPointIndex];
    segment.moveTo(x1, y1);
    segment.lineTo(x2, y2);
    segment.endFill();
  }

  _updateFill() {
    this.fillGraphics.clear();
    if (this._fillColor !== null && this.points.length >= 3) {
      const [x0, y0] = this.points[0];
      const [xn, yn] = this.points[this.points.length - 1];
      if (x0 === xn && y0 === yn) {
        this.fillGraphics.beginFill(this._fillColor);
        this.fillGraphics.moveTo(x0, y0);
        for (let i = 1; i < this.points.length; i++) {
          const [x, y] = this.points[i];
          this.fillGraphics.lineTo(x, y);
        }
        this.fillGraphics.closePath();
        this.fillGraphics.endFill();
      }
    }
    this.segmentsContainer.setChildIndex(this.fillGraphics, 0);
  }

  getY(x) {
    if (this.points.length < 2) return null;
    const adjustedX = x - this.segmentsContainer.x;
    const sortedPoints = [...this.points].sort((a, b) => a[0] - b[0]);
    if (
      adjustedX < sortedPoints[0][0] ||
      adjustedX > sortedPoints[sortedPoints.length - 1][0]
    ) {
      return null;
    }
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const p1 = sortedPoints[i];
      const p2 = sortedPoints[i + 1];
      if (p1[0] <= adjustedX && adjustedX <= p2[0]) {
        const ratio = (adjustedX - p1[0]) / (p2[0] - p1[0]);
        return p1[1] + ratio * (p2[1] - p1[1]);
      }
    }
    return null;
  }

  markAt(x, color = null, radius = null) {
    this.markedX = x;
    if (color !== null) this.markColor = color;
    if (radius !== null) this.markRadius = radius;
    this.markerInitialized = true;
    const y = this.getY(x);
    if (y !== null) {
      this.markedCircle.clear();
      this.markedCircle.beginFill(this.markColor);
      this.markedCircle.drawCircle(x, y, this.markRadius);
      this.markedCircle.endFill();
      this.vGuideLine.clear();
      this.vGuideLine.lineStyle(1, this.markColor, 0.5);
      this.vGuideLine.moveTo(x, 0);
      this.vGuideLine.lineTo(x, y);
      this.hGuideLine.clear();
      this.hGuideLine.lineStyle(1, this.markColor, 0.5);
      this.hGuideLine.moveTo(0, y);
      this.hGuideLine.lineTo(x, y);
    } else {
      this.markedCircle.clear();
      this.vGuideLine.clear();
      this.hGuideLine.clear();
    }
  }

  removeMark() {
    this.markerInitialized = false;
    this.markedCircle.clear();
    this.vGuideLine.clear();
    this.hGuideLine.clear();
  }

  setColor(color) {
    this._color = color;
    this._rebuildSegments();
  }

  setThickness(thickness) {
    this._thickness = thickness;
    this._rebuildSegments();
  }

  set visible(value) {
    super.visible = Boolean(value);
  }

  get visible() {
    return super.visible;
  }

  destroy(options) {
    if (this._clickHandler) {
      this.off("pointerdown", this._clickHandler);
    }
    if (this._mouseDownHandler) {
      this.off("pointerdown", this._mouseDownHandler);
    }
    if (this._mouseUpHandler) {
      this.off("pointerup", this._mouseUpHandler);
    }
    if (this._mouseOverHandler) {
      this.off("pointerover", this._mouseOverHandler);
    }
    if (this._mouseOutHandler) {
      this.off("pointerout", this._mouseOutHandler);
    }
    this._clearSegments();
    this.fillGraphics.destroy();
    super.destroy(options);
  }
};

PixiJSEdu.BezierPath = class BezierPath extends PIXI.Container {
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
    super();
    this.points = points;
    this._color = color;
    this._thickness = thickness;
    this._fillColor = null;
    this._x = 0;
    this._y = 0;
    this.markedX = 0;
    this.markerInitialized = false;
    this.markColor = 0x000000;
    this.markRadius = 3;

    this._clickHandler = null;
    this._mouseDownHandler = null;
    this._mouseUpHandler = null;
    this._mouseOverHandler = null;
    this._mouseOutHandler = null;

    this.segmentsContainer = new PIXI.Container();
    this.addChild(this.segmentsContainer);
    this.fillGraphics = new PIXI.Graphics();
    this.segmentsContainer.addChild(this.fillGraphics);
    this.lineGraphics = new PIXI.Graphics();
    this.segmentsContainer.addChild(this.lineGraphics);
    this.markedCircle = new PIXI.Graphics();
    this.addChild(this.markedCircle);
    this.vGuideLine = new PIXI.Graphics();
    this.addChild(this.vGuideLine);
    this.hGuideLine = new PIXI.Graphics();
    this.addChild(this.hGuideLine);
    this._redrawAll();

    this.eventMode = "static";
    this.cursor = "pointer";

    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
  }
  set x(value) {
    this._x = value;
    this.position.x = this._x;
  }
  get x() {
    return this._x;
  }
  set y(value) {
    this._y = value;
    this.position.y = this._y;
  }
  get y() {
    return this._y;
  }
  setFillColor(fillColor) {
    this._fillColor = fillColor;
    this._redrawAll();
  }
  setAlpha(alpha) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }
  setPoints(newPoints) {
    this.points = [...newPoints];
    this._redrawAll();
  }
  addPointEnd(x, y, cx, cy) {
    const point = [x, y, cx, cy];
    this.points.push(point);
    this._redrawAll();
  }
  addPointStart(x, y, cx, cy) {
    const point = [x, y, cx, cy];
    this.points.unshift(point);
    this._redrawAll();
  }
  removePointEnd() {
    if (this.points.length > 0) {
      this.points.pop();
      this._redrawAll();
    }
  }
  removePointStart() {
    if (this.points.length > 0) {
      this.points.shift();
      this._redrawAll();
    }
  }
  shiftX(deltaX) {
    this.segmentsContainer.x += deltaX;
    if (this.markerInitialized) {
      this.markAt(this.markedX - deltaX, this.markColor, this.markRadius);
    }
  }
  addPoint(x, y, cx, cy) {
    this.addPointEnd(x, y, cx, cy);
  }
  removePoint(index) {
    if (index >= 0 && index < this.points.length) {
      this.points.splice(index, 1);
      this._redrawAll();
    }
  }
  updatePoint(index, x, y, cx, cy) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = [x, y, cx, cy];
      this._redrawAll();
    }
  }
  updatePoints(newPoints) {
    this.setPoints(newPoints);
  }
  _redrawAll() {
    this.fillGraphics.clear();
    this.lineGraphics.clear();
    if (this._fillColor !== null && this.points.length >= 2) {
      this._drawFill();
    }
    if (this.points.length >= 2) {
      this._drawLines();
    }
  }
  _drawFill() {
    this.fillGraphics.beginFill(this._fillColor);
    const startPoint = this.points[0];
    this.fillGraphics.moveTo(startPoint[0], startPoint[1]);
    for (let i = 0; i < this.points.length - 1; i++) {
      const startPoint = this.points[i];
      const endPoint = this.points[i + 1];
      const [x0, y0, cx0, cy0] = startPoint;
      const [x3, y3, cx3, cy3] = endPoint;
      this.fillGraphics.bezierCurveTo(cx0, cy0, cx3, cy3, x3, y3);
    }
    this.fillGraphics.closePath();
    this.fillGraphics.endFill();
  }
  _drawLines() {
    this.lineGraphics.beginFill(0x000000, 0);
    this.lineGraphics.lineStyle(this._thickness, this._color);
    const startPoint = this.points[0];
    this.lineGraphics.moveTo(startPoint[0], startPoint[1]);
    for (let i = 0; i < this.points.length - 1; i++) {
      const startPoint = this.points[i];
      const endPoint = this.points[i + 1];
      const [x0, y0, cx0, cy0] = startPoint;
      const [x3, y3, cx3, cy3] = endPoint;
      this.lineGraphics.bezierCurveTo(cx0, cy0, cx3, cy3, x3, y3);
    }
    if (this._fillColor !== null && this.points.length >= 3) {
      const firstPoint = this.points[0];
      this.lineGraphics.lineTo(firstPoint[0], firstPoint[1]);
    }
    this.lineGraphics.endFill();
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
    const adjustedX = x - this.segmentsContainer.x;
    for (let i = 0; i < this.points.length - 1; i++) {
      const startPoint = this.points[i];
      const endPoint = this.points[i + 1];
      const [x0, y0, cx0, cy0] = startPoint;
      const [x3, y3, cx3, cy3] = endPoint;
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
  markAt(x, color = null, radius = null) {
    this.markedX = x;
    if (color !== null) this.markColor = color;
    if (radius !== null) this.markRadius = radius;
    this.markerInitialized = true;
    const y = this.getY(x);
    if (y !== null) {
      this.markedCircle.clear();
      this.markedCircle.beginFill(this.markColor);
      this.markedCircle.drawCircle(x, y, this.markRadius);
      this.markedCircle.endFill();
      this.vGuideLine.clear();
      this.vGuideLine.lineStyle(1, this.markColor, 0.5);
      this.vGuideLine.moveTo(x, 0);
      this.vGuideLine.lineTo(x, y);
      this.hGuideLine.clear();
      this.hGuideLine.lineStyle(1, this.markColor, 0.5);
      this.hGuideLine.moveTo(0, y);
      this.hGuideLine.lineTo(x, y);
    } else {
      this.markedCircle.clear();
      this.vGuideLine.clear();
      this.hGuideLine.clear();
    }
  }
  removeMark() {
    this.markerInitialized = false;
    this.markedCircle.clear();
    this.vGuideLine.clear();
    this.hGuideLine.clear();
  }
  setColor(color) {
    this._color = color;
    this._redrawAll();
  }
  setThickness(thickness) {
    this._thickness = thickness;
    this._redrawAll();
  }
  set visible(value) {
    super.visible = Boolean(value);
  }

  get visible() {
    return super.visible;
  }

  destroy(options) {
    if (this._clickHandler) {
      this.off("pointerdown", this._clickHandler);
    }
    if (this._mouseDownHandler) {
      this.off("pointerdown", this._mouseDownHandler);
    }
    if (this._mouseUpHandler) {
      this.off("pointerup", this._mouseUpHandler);
    }
    if (this._mouseOverHandler) {
      this.off("pointerover", this._mouseOverHandler);
    }
    if (this._mouseOutHandler) {
      this.off("pointerout", this._mouseOutHandler);
    }
    this.fillGraphics.destroy();
    this.lineGraphics.destroy();
    this.markedCircle.destroy();
    this.vGuideLine.destroy();
    this.hGuideLine.destroy();
    super.destroy(options);
  }
};
PixiJSEdu.SplinePath = class SplinePath extends PIXI.Container {
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
          en: "Sets the transparency of the entire object (0.0 = fully transparent, 1.0 = fully opaque)",
          de: "Setzt die Transparenz des gesamten Objekts (0.0 = vollständig transparent, 1.0 = vollständig undurchsichtig)",
        },
      },
      setPoints: {
        name: "setPoints",
        info: {
          en: "Replaces the entire point array with a new array",
          de: "Ersetzt das gesamte Punktearray durch ein neues Array",
        },
        example: "setPoints([[0,0], [100,50], [200,100]])",
      },
      addPointEnd: {
        name: "addPointEnd",
        info: {
          en: "Adds a point at the end of the spline",
          de: "Fügt einen Punkt am Ende der Spline hinzu",
        },
        example: "addPointEnd(150, 75)",
      },
      addPointStart: {
        name: "addPointStart",
        info: {
          en: "Adds a point at the beginning of the spline",
          de: "Fügt einen Punkt am Anfang der Spline hinzu",
        },
        example: "addPointStart(25, 25)",
      },
      removePointEnd: {
        name: "removePointEnd",
        info: {
          en: "Removes the last point of the spline",
          de: "Entfernt den letzten Punkt der Spline",
        },
        example: "removePointEnd()",
      },
      removePointStart: {
        name: "removePointStart",
        info: {
          en: "Removes the first point of the spline",
          de: "Entfernt den ersten Punkt der Spline",
        },
        example: "removePointStart()",
      },
      setColor: {
        name: "setColor",
        info: {
          en: "Sets the line color of the spline",
          de: "Setzt die Linienfarbe der Spline",
        },
        example: "setColor(0x00ff00)",
      },
      setThickness: {
        name: "setThickness",
        info: {
          en: "Sets the line thickness of the spline",
          de: "Setzt die Linienstärke der Spline",
        },
        example: "setThickness(5)",
      },
      markAt: {
        name: "markAt",
        info: {
          en: "Marks a point on the spline at given x-coordinate with optional color and radius",
          de: "Markiert einen Punkt auf der Spline bei gegebener x-Koordinate mit optionaler Farbe und Radius",
        },
        example: "markAt(100, 0xff0000, 5)",
      },
      markAtXY: {
        name: "markAtXY",
        info: {
          en: "Marks a point at given x and y coordinates with optional color and radius",
          de: "Markiert einen Punkt bei gegebenen x- und y-Koordinaten mit optionaler Farbe und Radius",
        },
        example: "markAtXY(100, 50, 0xff0000, 5)",
      },
      removeMark: {
        name: "removeMark",
        info: {
          en: "Removes the marker from the spline",
          de: "Entfernt die Markierung von der Spline",
        },
        example: "removeMark()",
      },
      showGuideLines: {
        name: "showGuideLines",
        info: {
          en: "Shows guide lines at specified x-coordinate with customizable appearance",
          de: "Zeigt Führungslinien bei angegebener x-Koordinate mit anpassbarem Aussehen",
        },
        example: "showGuideLines(100, 0x00ff00, 2, 0.7)",
      },
      showGuideLinesAtXY: {
        name: "showGuideLinesAtXY",
        info: {
          en: "Shows guide lines at specified x and y coordinates with customizable appearance",
          de: "Zeigt Führungslinien bei angegebenen x- und y-Koordinaten mit anpassbarem Aussehen",
        },
        example: "showGuideLinesAtXY(100, 50, 0x00ff00, 2, 0.7)",
      },
      hideGuideLines: {
        name: "hideGuideLines",
        info: {
          en: "Hides the guide lines",
          de: "Versteckt die Führungslinien",
        },
        example: "hideGuideLines()",
      },
      updateGuideLines: {
        name: "updateGuideLines",
        info: {
          en: "Updates the x-position of existing guide lines",
          de: "Aktualisiert die x-Position der bestehenden Führungslinien",
        },
        example: "updateGuideLines(150)",
      },
      getY: {
        name: "getY",
        info: {
          en: "Returns the y-coordinate for a given x-coordinate on the curve",
          de: "Gibt die y-Koordinate für eine gegebene x-Koordinate auf der Kurve zurück",
        },
        example: "getY(100)",
      },
      getX: {
        name: "getX",
        info: {
          en: "Returns the x-coordinate for a given y-coordinate on the curve",
          de: "Gibt die x-Koordinate für eine gegebene y-Koordinate auf der Kurve zurück",
        },
        example: "getX(150)",
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
    super();
    this.points = points;
    this._color = color;
    this._thickness = thickness;
    this.markedX = 0;
    this.markedY = 0;
    this.markerInitialized = false;
    this.markColor = 0x000000;
    this.markRadius = 3;
    this._fillColor = null;
    this._x = 0;
    this._y = 0;
    this._visible = true;
    this._alpha = 1.0;
    this.guideLineInitialized = false;
    this.guideX = 0;
    this.guideY = 0;
    this.guideLineColor = 0x888888;
    this.guideLineThickness = 1;
    this.guideLineAlpha = 0.8;

    this._clickHandler = null;
    this._mouseDownHandler = null;
    this._mouseUpHandler = null;
    this._mouseOverHandler = null;
    this._mouseOutHandler = null;

    this.curveShape = new PIXI.Graphics();
    this.addChild(this.curveShape);
    this.markedCircle = new PIXI.Graphics();
    this.addChild(this.markedCircle);
    this.vGuideLine = new PIXI.Graphics();
    this.addChild(this.vGuideLine);
    this.hGuideLine = new PIXI.Graphics();
    this.addChild(this.hGuideLine);
    this.guideVLine = new PIXI.Graphics();
    this.addChild(this.guideVLine);
    this.guideHLine = new PIXI.Graphics();
    this.addChild(this.guideHLine);
    this._draw();

    this.eventMode = "static";
    this.cursor = "pointer";

    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
  }
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
  setFillColor(fillColor) {
    this._fillColor = fillColor;
    this._draw();
  }
  setColor(color) {
    this._color = color;
    this._draw();
  }
  setThickness(thickness) {
    this._thickness = thickness;
    this._draw();
  }
  setAlpha(alpha) {
    this._alpha = Math.max(0, Math.min(1, alpha));
    this.alpha = this._alpha;
  }
  get alphaValue() {
    return this._alpha;
  }
  set x(value) {
    this._x = value;
    this.position.x = this._x;
    this._draw();
  }
  get x() {
    return this._x;
  }
  set y(value) {
    this._y = value;
    this.position.y = this._y;
    this._draw();
  }
  get y() {
    return this._y;
  }
  set visible(value) {
    super.visible = Boolean(value);
  }
  get visible() {
    return super.visible;
  }
  markAt(x, color = null, radius = null) {
    this.markedX = x;
    if (color !== null) this.markColor = color;
    if (radius !== null) this.markRadius = radius;
    this.markerInitialized = true;
    const y = this.getY(x);
    if (y !== null) {
      this.markedY = y;
      this.markedCircle.clear();
      this.markedCircle.beginFill(this.markColor);
      this.markedCircle.drawCircle(x, y, this.markRadius);
      this.markedCircle.endFill();
      this.vGuideLine.clear();
      this.vGuideLine.lineStyle(1, this.markColor, 0.5);
      this.vGuideLine.moveTo(x, 0);
      this.vGuideLine.lineTo(x, y);
      this.hGuideLine.clear();
      this.hGuideLine.lineStyle(1, this.markColor, 0.5);
      this.hGuideLine.moveTo(0, y);
      this.hGuideLine.lineTo(x, y);
    } else {
      this.markedCircle.clear();
      this.vGuideLine.clear();
      this.hGuideLine.clear();
    }
  }
  markAtXY(x, y, color = null, radius = null) {
    this.markedX = x;
    this.markedY = y;
    if (color !== null) this.markColor = color;
    if (radius !== null) this.markRadius = radius;
    this.markerInitialized = true;
    this.markedCircle.clear();
    this.markedCircle.beginFill(this.markColor);
    this.markedCircle.drawCircle(x, y, this.markRadius);
    this.markedCircle.endFill();
    this.vGuideLine.clear();
    this.vGuideLine.lineStyle(1, this.markColor, 0.5);
    this.vGuideLine.moveTo(x, 0);
    this.vGuideLine.lineTo(x, y);
    this.hGuideLine.clear();
    this.hGuideLine.lineStyle(1, this.markColor, 0.5);
    this.hGuideLine.moveTo(0, y);
    this.hGuideLine.lineTo(x, y);
  }
  removeMark() {
    this.markerInitialized = false;
    this.markedCircle.clear();
    this.vGuideLine.clear();
    this.hGuideLine.clear();
  }
  showGuideLines(x, color = 0x888888, thickness = 1, alpha = 0.8) {
    this.guideX = x;
    this.guideLineColor = color;
    this.guideLineThickness = thickness;
    this.guideLineAlpha = Math.max(0, Math.min(1, alpha));
    this.guideLineInitialized = true;
    const y = this.getY(x);
    if (y !== null) {
      this.guideY = y;
      this.guideVLine.clear();
      this.guideVLine.lineStyle(
        this.guideLineThickness,
        this.guideLineColor,
        this.guideLineAlpha,
      );
      this.guideVLine.beginFill();
      this.guideVLine.moveTo(x, 0);
      this.guideVLine.lineTo(x, y);
      this.guideVLine.endFill();
      this.guideHLine.clear();
      this.guideHLine.lineStyle(
        this.guideLineThickness,
        this.guideLineColor,
        this.guideLineAlpha,
      );
      this.guideHLine.beginFill();
      this.guideHLine.moveTo(0, y);
      this.guideHLine.lineTo(x, y);
      this.guideHLine.endFill();
    } else {
      this.guideVLine.clear();
      this.guideHLine.clear();
    }
  }
  showGuideLinesAtXY(x, y, color = 0x888888, thickness = 1, alpha = 0.8) {
    this.guideX = x;
    this.guideY = y;
    this.guideLineColor = color;
    this.guideLineThickness = thickness;
    this.guideLineAlpha = Math.max(0, Math.min(1, alpha));
    this.guideLineInitialized = true;
    this.guideVLine.clear();
    this.guideVLine.lineStyle(
      this.guideLineThickness,
      this.guideLineColor,
      this.guideLineAlpha,
    );
    this.guideVLine.beginFill();
    this.guideVLine.moveTo(x, 0);
    this.guideVLine.lineTo(x, y);
    this.guideVLine.endFill();
    this.guideHLine.clear();
    this.guideHLine.lineStyle(
      this.guideLineThickness,
      this.guideLineColor,
      this.guideLineAlpha,
    );
    this.guideHLine.beginFill();
    this.guideHLine.moveTo(0, y);
    this.guideHLine.lineTo(x, y);
    this.guideHLine.endFill();
  }
  hideGuideLines() {
    this.guideLineInitialized = false;
    this.guideVLine.clear();
    this.guideHLine.clear();
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
  _draw() {
    const graphics = this.curveShape;
    graphics.clear();
    graphics.lineStyle(this._thickness, this._color);
    if (this._fillColor !== null) {
      graphics.beginFill(this._fillColor);
    } else {
      graphics.beginFill(0x000000, 0);
    }
    if (this.points.length > 1) {
      const [x0, y0] = this.points[0];
      graphics.moveTo(x0, y0);
      for (let i = 0; i < this.points.length - 1; i++) {
        const p0 = this.points[i === 0 ? i : i - 1];
        const p1 = this.points[i];
        const p2 = this.points[i + 1];
        const p3 = this.points[i + 2] || p2;
        const controlX1 = p1[0] + (p2[0] - p0[0]) / 6;
        const controlY1 = p1[1] + (p2[1] - p0[1]) / 6;
        const controlX2 = p2[0] - (p3[0] - p1[0]) / 6;
        const controlY2 = p2[1] - (p3[1] - p1[1]) / 6;
        graphics.bezierCurveTo(
          controlX1,
          controlY1,
          controlX2,
          controlY2,
          p2[0],
          p2[1],
        );
      }
      const [xn, yn] = this.points[this.points.length - 1];
      if (x0 === xn && y0 === yn) {
        graphics.closePath();
      }
      graphics.endFill();
    }
  }
  _bezierPoint(t, p0, p1, p2, p3) {
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (1 - t) * (1 - t) * (1 - t) * p0 +
      3 * (1 - t) * (1 - t) * t * p1 +
      3 * (1 - t) * t * t * p2 +
      t3 * p3
    );
  }
  getY(x) {
    if (this.points.length < 2) return null;
    const sortedPoints = [...this.points].sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      let p0 = sortedPoints[i === 0 ? i : i - 1];
      let p1 = sortedPoints[i];
      let p2 = sortedPoints[i + 1];
      let p3 = sortedPoints[i + 2] || p2;
      const controlX1 = p1[0] + (p2[0] - p0[0]) / 6;
      const controlY1 = p1[1] + (p2[1] - p0[1]) / 6;
      const controlX2 = p2[0] - (p3[0] - p1[0]) / 6;
      const controlY2 = p2[1] - (p3[1] - p1[1]) / 6;
      if (p1[0] <= x && x <= p2[0]) {
        let t = 0.5;
        const tolerance = 0.0001;
        let lower = 0,
          upper = 1;
        while (upper - lower > tolerance) {
          const curveX = this._bezierPoint(
            t,
            p1[0],
            controlX1,
            controlX2,
            p2[0],
          );
          if (curveX < x) {
            lower = t;
          } else {
            upper = t;
          }
          t = (lower + upper) / 2;
        }
        return this._bezierPoint(t, p1[1], controlY1, controlY2, p2[1]);
      }
    }
    return null;
  }
  getX(y) {
    if (this.points.length < 2) return null;
    const results = [];
    const sortedPoints = [...this.points].sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      let p0 = sortedPoints[i === 0 ? i : i - 1];
      let p1 = sortedPoints[i];
      let p2 = sortedPoints[i + 1];
      let p3 = sortedPoints[i + 2] || p2;
      const controlX1 = p1[0] + (p2[0] - p0[0]) / 6;
      const controlY1 = p1[1] + (p2[1] - p0[1]) / 6;
      const controlX2 = p2[0] - (p3[0] - p1[0]) / 6;
      const controlY2 = p2[1] - (p3[1] - p1[1]) / 6;
      const minY = Math.min(p1[1], p2[1]);
      const maxY = Math.max(p1[1], p2[1]);
      const bezierMinY = Math.min(minY, controlY1, controlY2);
      const bezierMaxY = Math.max(maxY, controlY1, controlY2);
      if (y >= bezierMinY && y <= bezierMaxY) {
        const startPoints = [0, 0.25, 0.5, 0.75, 1];
        const foundTValues = new Set();
        for (const startT of startPoints) {
          let t = startT;
          const tolerance = 0.0001;
          let iterations = 0;
          const maxIterations = 50;
          while (iterations < maxIterations) {
            const currentY = this._bezierPoint(
              t,
              p1[1],
              controlY1,
              controlY2,
              p2[1],
            );
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
                const x = this._bezierPoint(
                  t,
                  p1[0],
                  controlX1,
                  controlX2,
                  p2[0],
                );
                results.push(x);
              }
              break;
            }
            const dt = 0.001;
            const y1 = this._bezierPoint(
              t - dt,
              p1[1],
              controlY1,
              controlY2,
              p2[1],
            );
            const y2 = this._bezierPoint(
              t + dt,
              p1[1],
              controlY1,
              controlY2,
              p2[1],
            );
            const derivative = (y2 - y1) / (2 * dt);
            if (Math.abs(derivative) < 0.0001) {
              let lower = 0,
                upper = 1;
              let binaryT = 0.5;
              for (let j = 0; j < 20; j++) {
                const binaryY = this._bezierPoint(
                  binaryT,
                  p1[1],
                  controlY1,
                  controlY2,
                  p2[1],
                );
                if (binaryY < y) {
                  lower = binaryT;
                } else {
                  upper = binaryT;
                }
                binaryT = (lower + upper) / 2;
              }
              t = binaryT;
            } else {
              t = t - (currentY - y) / derivative;
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

  destroy(options) {
    if (this._clickHandler) {
      this.off("pointerdown", this._clickHandler);
    }
    if (this._mouseDownHandler) {
      this.off("pointerdown", this._mouseDownHandler);
    }
    if (this._mouseUpHandler) {
      this.off("pointerup", this._mouseUpHandler);
    }
    if (this._mouseOverHandler) {
      this.off("pointerover", this._mouseOverHandler);
    }
    if (this._mouseOutHandler) {
      this.off("pointerout", this._mouseOutHandler);
    }
    this.curveShape.destroy();
    this.markedCircle.destroy();
    this.vGuideLine.destroy();
    this.hGuideLine.destroy();
    this.guideVLine.destroy();
    this.guideHLine.destroy();

    super.destroy(options);
  }
};
PixiJSEdu.Arrow = class Arrow extends PIXI.Container {
  static serializationMap = {
    description: {
      de: "Pfeil mit Linie und Spitze",
      en: "Arrow with line and head",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myArrow = new Arrow(0, 0, 100, 50, 0xff0000, 3, 15, 8);",
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
    startX,
    startY,
    endX,
    endY,
    color = 0xff0000,
    thickness = 2,
    arrowHeadLength = 10,
    arrowHeadWidth = 6,
  ) {
    super();
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;
    this._color = color;
    this._arrowHeadLength = arrowHeadLength;
    this._arrowHeadWidth = arrowHeadWidth;
    this._thickness = thickness;
    this._visible = true;
    this._alpha = 1.0;
    this._outlineEnabled = false;
    this._outlineThickness = 0.5;
    this._outlineColor = 0xffffff;
    this._rotationDegrees = 0;

    this.outlineContainer = new PIXI.Container();
    this.addChild(this.outlineContainer);
    this.mainContainer = new PIXI.Container();
    this.addChild(this.mainContainer);
    this.arrowOutlineGraphics = new PIXI.Graphics();
    this.outlineContainer.addChild(this.arrowOutlineGraphics);
    this.lineOutlineGraphics = new PIXI.Graphics();
    this.outlineContainer.addChild(this.lineOutlineGraphics);
    this.arrowGraphics = new PIXI.Graphics();
    this.mainContainer.addChild(this.arrowGraphics);
    this.lineGraphics = new PIXI.Graphics();
    this.mainContainer.addChild(this.lineGraphics);
    this._draw();
    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
  }
  _draw() {
    const dx = this._endX - this._startX;
    const dy = this._endY - this._startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angleRad = Math.atan2(dy, dx);
    if (this._outlineEnabled) {
      this.lineOutlineGraphics.clear();
      this.lineOutlineGraphics.lineStyle(
        this._thickness + this._outlineThickness * 2,
        this._outlineColor,
      );
      this.lineOutlineGraphics.beginFill();
      this.lineOutlineGraphics.moveTo(0, 0);
      this.lineOutlineGraphics.lineTo(
        length - this._arrowHeadLength + this._outlineThickness,
        0,
      );
      this.lineOutlineGraphics.endFill();
      this.lineOutlineGraphics.x = this._startX;
      this.lineOutlineGraphics.y = this._startY;
      this.lineOutlineGraphics.rotation = angleRad;
      this.arrowOutlineGraphics.clear();
      this.arrowOutlineGraphics.beginFill(this._outlineColor);
      const offset = this._outlineThickness;
      const A = { x: 0, y: 0 };
      const B = { x: -this._arrowHeadLength, y: -this._arrowHeadWidth / 2 };
      const C = { x: -this._arrowHeadLength, y: this._arrowHeadWidth / 2 };
      const BA = { x: A.x - B.x, y: A.y - B.y };
      const CA = { x: A.x - C.x, y: A.y - C.y };
      const lenBA = Math.sqrt(BA.x * BA.x + BA.y * BA.y);
      const lenCA = Math.sqrt(CA.x * CA.x + CA.y * CA.y);
      BA.x /= lenBA;
      BA.y /= lenBA;
      CA.x /= lenCA;
      CA.y /= lenCA;
      const dotProduct = BA.x * CA.x + BA.y * CA.y;
      const angleAtTip = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
      const miterLimit = 10;
      const halfAngle = angleAtTip / 2;
      const miterLength = offset / Math.sin(halfAngle);
      const maxMiterLength = offset * miterLimit;
      function getNormal(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        return { x: -dy / len, y: dx / len };
      }
      function offsetLine(p1, p2, offset) {
        const normal = getNormal(p1, p2);
        return {
          p1: { x: p1.x + normal.x * offset, y: p1.y + normal.y * offset },
          p2: { x: p2.x + normal.x * offset, y: p2.y + normal.y * offset },
        };
      }
      function lineIntersection(line1, line2) {
        const x1 = line1.p1.x,
          y1 = line1.p1.y;
        const x2 = line1.p2.x,
          y2 = line1.p2.y;
        const x3 = line2.p1.x,
          y3 = line2.p1.y;
        const x4 = line2.p2.x,
          y4 = line2.p2.y;
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 0.0001) return null;
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        return {
          x: x1 + t * (x2 - x1),
          y: y1 + t * (y2 - y1),
        };
      }
      const lineAB = offsetLine(A, B, offset);
      const lineBC = offsetLine(B, C, offset);
      const lineCA = offsetLine(C, A, offset);
      let A_outline = lineIntersection(lineCA, lineAB);
      const B_outline = lineIntersection(lineAB, lineBC);
      const C_outline = lineIntersection(lineBC, lineCA);
      if (A_outline && miterLength > maxMiterLength) {
        const dirX = A_outline.x - A.x;
        const dirY = A_outline.y - A.y;
        const dirLen = Math.sqrt(dirX * dirX + dirY * dirY);
        A_outline = {
          x: A.x + (dirX / dirLen) * maxMiterLength,
          y: A.y + (dirY / dirLen) * maxMiterLength,
        };
        const bisector = {
          x: (BA.x + CA.x) / 2,
          y: (BA.y + CA.y) / 2,
        };
        const bisectorLen = Math.sqrt(
          bisector.x * bisector.x + bisector.y * bisector.y,
        );
        bisector.x /= bisectorLen;
        bisector.y /= bisectorLen;
        const perpX = -bisector.y;
        const perpY = bisector.x;
        const bevelWidth = offset * 0.5;
        const bevel1 = {
          x: A.x + bisector.x * maxMiterLength + perpX * bevelWidth,
          y: A.y + bisector.y * maxMiterLength + perpY * bevelWidth,
        };
        const bevel2 = {
          x: A.x + bisector.x * maxMiterLength - perpX * bevelWidth,
          y: A.y + bisector.y * maxMiterLength - perpY * bevelWidth,
        };
        if (B_outline && C_outline) {
          this.arrowOutlineGraphics.moveTo(bevel1.x, bevel1.y);
          this.arrowOutlineGraphics.lineTo(bevel2.x, bevel2.y);
          this.arrowOutlineGraphics.lineTo(B_outline.x, B_outline.y);
          this.arrowOutlineGraphics.lineTo(C_outline.x, C_outline.y);
          this.arrowOutlineGraphics.lineTo(bevel1.x, bevel1.y);
        }
      } else {
        if (A_outline && B_outline && C_outline) {
          this.arrowOutlineGraphics.moveTo(A_outline.x, A_outline.y);
          this.arrowOutlineGraphics.lineTo(B_outline.x, B_outline.y);
          this.arrowOutlineGraphics.lineTo(C_outline.x, C_outline.y);
          this.arrowOutlineGraphics.lineTo(A_outline.x, A_outline.y);
        }
      }
      this.arrowOutlineGraphics.endFill();
      this.arrowOutlineGraphics.x = this._endX;
      this.arrowOutlineGraphics.y = this._endY;
      this.arrowOutlineGraphics.rotation = angleRad;
    } else {
      this.lineOutlineGraphics.clear();
      this.arrowOutlineGraphics.clear();
    }
    this.lineGraphics.clear();
    this.lineGraphics.lineStyle(this._thickness, this._color);
    this.lineGraphics.beginFill();
    this.lineGraphics.moveTo(0, 0);
    this.lineGraphics.lineTo(length - this._arrowHeadLength, 0);
    this.lineGraphics.endFill();
    this.lineGraphics.x = this._startX;
    this.lineGraphics.y = this._startY;
    this.lineGraphics.rotation = angleRad;
    this.arrowGraphics.clear();
    this.arrowGraphics.lineStyle(1, this._color);
    this.arrowGraphics.beginFill(this._color);
    this.arrowGraphics.moveTo(0, 0);
    this.arrowGraphics.lineTo(
      -this._arrowHeadLength,
      -this._arrowHeadWidth / 2,
    );
    this.arrowGraphics.lineTo(-this._arrowHeadLength, this._arrowHeadWidth / 2);
    this.arrowGraphics.lineTo(0, 0);
    this.arrowGraphics.endFill();
    this.arrowGraphics.x = this._endX;
    this.arrowGraphics.y = this._endY;
    this.arrowGraphics.rotation = angleRad;
    this.lineGraphics.alpha = this._alpha;
    this.arrowGraphics.alpha = this._alpha;
    this.lineOutlineGraphics.alpha = this._alpha;
    this.arrowOutlineGraphics.alpha = this._alpha;
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
  setArrowHead(length, width) {
    this._arrowHeadLength = length;
    this._arrowHeadWidth = width;
    this._draw();
    return this;
  }
  setAlpha(alpha) {
    this._alpha = Math.max(0, Math.min(1, alpha));
    this._draw();
    return this;
  }
  setOutline(thickness = 0.5, color = 0xffffff) {
    this._outlineEnabled = true;
    this._outlineThickness = thickness;
    this._outlineColor = color;
    this._draw();
    return this;
  }
  removeOutline() {
    this._outlineEnabled = false;
    this._draw();
    return this;
  }
  set visible(value) {
    super.visible = Boolean(value);
  }
  get visible() {
    return super.visible;
  }
  set alpha(value) {
    this._alpha = Math.max(0, Math.min(1, value));
    this._draw();
  }
  get alpha() {
    return this._alpha;
  }

  set rotation(degrees) {
    this._rotationDegrees = degrees;
    super.rotation = degrees * (Math.PI / 180);
  }

  get rotation() {
    return this._rotationDegrees;
  }

  get startX() {
    return this._startX;
  }

  get startY() {
    return this._startY;
  }

  get endX() {
    return this._endX;
  }

  get endY() {
    return this._endY;
  }
};

PixiJSEdu.Parallelogram = class Parallelogram extends PIXI.Container {
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
    this._savedAlpha = 1.0;
    this._visible = true;

    this._showVectors = false;
    this._showResultant = false;

    this.parallelogramGraphics = new PIXI.Graphics();
    this.addChild(this.parallelogramGraphics);

    this.vectorsContainer = new PIXI.Container();
    this.addChild(this.vectorsContainer);

    this.vector1Arrow = null;
    this.vector2Arrow = null;
    this.resultantArrow = null;

    this._draw();

    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
  }

  _draw() {
    this.parallelogramGraphics.clear();

    if (!this._visible) return;

    const p1 = { x: this._originX, y: this._originY };
    const p2 = { x: this._vector1X, y: this._vector1Y };
    const p3 = { x: this._vector2X, y: this._vector2Y };

    const resultant = this.getResultantEndpoint();
    const p4 = { x: resultant.x, y: resultant.y };

    this.parallelogramGraphics.beginFill(this._fillColor, this._alpha);

    this.parallelogramGraphics.moveTo(p1.x, p1.y);
    this.parallelogramGraphics.lineTo(p2.x, p2.y);
    this.parallelogramGraphics.lineTo(p4.x, p4.y);
    this.parallelogramGraphics.lineTo(p3.x, p3.y);
    this.parallelogramGraphics.lineTo(p1.x, p1.y);

    this.parallelogramGraphics.endFill();

    this._updateVectorArrows();
  }

  _updateVectorArrows() {
    if (this.vector1Arrow) {
      this.vectorsContainer.removeChild(this.vector1Arrow);
      this.vector1Arrow.destroy();
      this.vector1Arrow = null;
    }
    if (this.vector2Arrow) {
      this.vectorsContainer.removeChild(this.vector2Arrow);
      this.vector2Arrow.destroy();
      this.vector2Arrow = null;
    }
    if (this.resultantArrow) {
      this.vectorsContainer.removeChild(this.resultantArrow);
      this.resultantArrow.destroy();
      this.resultantArrow = null;
    }

    if (this._showVectors) {
      this.vector1Arrow = new PixiJSEdu.Arrow(
        this._originX,
        this._originY,
        this._vector1X,
        this._vector1Y,
        0xff0000,
        3,
        15,
        10,
      );
      this.vectorsContainer.addChild(this.vector1Arrow);

      this.vector2Arrow = new PixiJSEdu.Arrow(
        this._originX,
        this._originY,
        this._vector2X,
        this._vector2Y,
        0x0000ff,
        3,
        15,
        10,
      );
      this.vectorsContainer.addChild(this.vector2Arrow);
    }

    if (this._showResultant) {
      const resultant = this.getResultantEndpoint();
      this.resultantArrow = new PixiJSEdu.Arrow(
        this._originX,
        this._originY,
        resultant.x,
        resultant.y,
        0x000000,
        4,
        20,
        12,
      );
      this.vectorsContainer.addChild(this.resultantArrow);
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
    this._draw();
    return this;
  }

  setAlpha(alpha) {
    this._alpha = Math.max(0, Math.min(1, alpha));
    this._savedAlpha = this._alpha;
    this._draw();
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

  set visible(value) {
    super.visible = Boolean(value);
  }

  get visible() {
    return super.visible;
  }

  set alpha(value) {
    this._alpha = Math.max(0, Math.min(1, value));
    this._savedAlpha = this._alpha;
    this._draw();
  }

  get alpha() {
    return this._alpha;
  }

  destroy(options) {
    if (this.vector1Arrow) this.vector1Arrow.destroy();
    if (this.vector2Arrow) this.vector2Arrow.destroy();
    if (this.resultantArrow) this.resultantArrow.destroy();

    this.parallelogramGraphics.destroy();
    this.vectorsContainer.destroy();

    super.destroy(options);
  }
};

PixiJSEdu.PointLabel = class PointLabel extends PIXI.Container {
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
    this._visible = true;
    this._alpha = 1.0;

    this.backgroundGraphics = new PIXI.Graphics();
    this.addChild(this.backgroundGraphics);

    this.textContainer = new PIXI.Container();
    this.addChild(this.textContainer);

    this._createTextElements();

    this._updatePosition();

    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
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

  _createTextElements() {
    this.textContainer.removeChildren();

    const segments = this._parseHTMLText(this._text);
    let currentX = 0;

    segments.forEach((segment) => {
      const fontSize =
        segment.type === "normal" ? this._fontSize : this._fontSize * 0.7;

      const textObj = new PIXI.Text(segment.text, {
        fontFamily: this._fontFamily,
        fontSize: fontSize,
        fill: this._textColor,
        align: "center",
      });

      textObj.x = currentX;

      if (segment.type === "sub") {
        textObj.y = this._fontSize * 0.3 + 2;
      } else if (segment.type === "sup") {
        textObj.y = -this._fontSize * 0.3;
      } else {
        textObj.y = 0;
      }

      this.textContainer.addChild(textObj);
      currentX += textObj.width;
    });

    const bounds = this.textContainer.getBounds();
    this.textContainer.pivot.x = bounds.width / 2;
    this.textContainer.pivot.y = bounds.height / 2;
  }

  _updatePosition() {
    this.textContainer.x = this._pointX + this._offsetX;
    this.textContainer.y = this._pointY + this._offsetY;

    this._drawBackground();
  }

  _drawBackground() {
    this.backgroundGraphics.clear();

    if (this._backgroundColor !== null) {
      const bounds = this.textContainer.getBounds();
      this.backgroundGraphics.beginFill(this._backgroundColor, this._alpha);
      this.backgroundGraphics.drawRect(
        bounds.x - this._padding,
        bounds.y - this._padding,
        bounds.width + 2 * this._padding,
        bounds.height + 2 * this._padding,
      );
      this.backgroundGraphics.endFill();
    }

    this.backgroundGraphics.alpha = this._alpha;
    this.textContainer.alpha = this._alpha;
  }

  setText(text) {
    this._text = text;
    this._createTextElements();
    this._updatePosition();
    return this;
  }

  setTextColor(color) {
    this._textColor = color;
    this.textContainer.children.forEach((child) => {
      if (child instanceof PIXI.Text) {
        child.style.fill = color;
      }
    });
    return this;
  }

  setFontSize(size) {
    this._fontSize = size;
    this._createTextElements();
    this._updatePosition();
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
    this._drawBackground();
    return this;
  }

  setPadding(padding) {
    this._padding = padding;
    this._drawBackground();
    return this;
  }

  setAlpha(alpha) {
    this._alpha = Math.max(0, Math.min(1, alpha));
    this._drawBackground();
    return this;
  }

  set visible(value) {
    super.visible = Boolean(value);
  }

  get visible() {
    return super.visible;
  }

  set alpha(value) {
    this._alpha = Math.max(0, Math.min(1, value));
    this._drawBackground();
    return this;
  }

  get alpha() {
    return this._alpha;
  }
};

PixiJSEdu.LineLabel = class LineLabel extends PIXI.Container {
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
    startX,
    startY,
    endX,
    endY,
    label,
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
    this._visible = true;
    this._alpha = 1.0;
    this._flipped = false;

    this.backgroundGraphics = new PIXI.Graphics();
    this.addChild(this.backgroundGraphics);

    this.textContainer = new PIXI.Container();
    this.addChild(this.textContainer);

    this._createTextElements();

    this._updatePosition();

    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
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

  _createTextElements() {
    this.textContainer.removeChildren();

    const segments = this._parseHTMLText(this._text);
    let currentX = 0;

    segments.forEach((segment) => {
      const fontSize =
        segment.type === "normal" ? this._fontSize : this._fontSize * 0.7;

      const textObj = new PIXI.Text(segment.text, {
        fontFamily: this._fontFamily,
        fontSize: fontSize,
        fill: this._textColor,
        align: "center",
      });

      textObj.x = currentX;

      if (segment.type === "sub") {
        textObj.y = this._fontSize * 0.3 + 2;
      } else if (segment.type === "sup") {
        textObj.y = -this._fontSize * 0.3;
      } else {
        textObj.y = 0;
      }

      this.textContainer.addChild(textObj);
      currentX += textObj.width;
    });

    const bounds = this.textContainer.getBounds();
    this.textContainer.pivot.x = bounds.width / 2;
    this.textContainer.pivot.y = bounds.height / 2;
  }

  _calculateLineAngle() {
    const dx = this._endX - this._startX;
    const dy = this._endY - this._startY;
    let angle = Math.atan2(dy, dx);

    // Normalize angle to [0, 2π]
    while (angle < 0) angle += 2 * Math.PI;
    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;

    return angle;
  }

  _isMoreHorizontal() {
    const dx = this._endX - this._startX;
    return dx >= 0;
  }

  _updatePosition() {
    const midX = (this._startX + this._endX) / 2;
    const midY = (this._startY + this._endY) / 2;

    const dx = this._endX - this._startX;
    const dy = this._endY - this._startY;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
      this.textContainer.x = midX;
      this.textContainer.y = midY;
      return;
    }

    const unitX = dx / length;
    const unitY = dy / length;

    // Normal vector orthogonal to the line segment, oriented consistently
    // so the label always appears on the same side regardless of direction
    let normalX = -unitY;
    let normalY = unitX;

    if (dx < 0) {
      normalX = -normalX;
      normalY = -normalY;
    }

    if (this._flipped) {
      normalX = -normalX;
      normalY = -normalY;
    }

    const offsetX = normalX * this._distance;
    const offsetY = normalY * this._distance;

    this.textContainer.x = midX + offsetX;
    this.textContainer.y = midY + offsetY;

    this._drawBackground();
  }

  _drawBackground() {
    this.backgroundGraphics.clear();

    if (this._backgroundColor !== null) {
      const bounds = this.textContainer.getBounds();
      this.backgroundGraphics.beginFill(this._backgroundColor, this._alpha);
      this.backgroundGraphics.drawRect(
        bounds.x - this._padding,
        bounds.y - this._padding,
        bounds.width + 2 * this._padding,
        bounds.height + 2 * this._padding,
      );
      this.backgroundGraphics.endFill();
    }

    this.backgroundGraphics.alpha = this._alpha;
    this.textContainer.alpha = this._alpha;
  }

  setText(text) {
    this._text = text;
    this._createTextElements();
    this._updatePosition();
    return this;
  }

  setTextColor(color) {
    this._textColor = color;
    this.textContainer.children.forEach((child) => {
      if (child instanceof PIXI.Text) {
        child.style.fill = color;
      }
    });
    return this;
  }

  setFontSize(size) {
    this._fontSize = size;
    this._createTextElements();
    this._updatePosition();
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
    this._drawBackground();
    return this;
  }

  setPadding(padding) {
    this._padding = padding;
    this._drawBackground();
    return this;
  }

  setAlpha(alpha) {
    this._alpha = Math.max(0, Math.min(1, alpha));
    this._drawBackground();
    return this;
  }

  setFlipSide(flipped) {
    this._flipped = flipped;
    this._updatePosition();
    return this;
  }

  set visible(value) {
    super.visible = Boolean(value);
  }

  get visible() {
    return super.visible;
  }

  set alpha(value) {
    this._alpha = Math.max(0, Math.min(1, value));
    this._drawBackground();
    return this;
  }

  get alpha() {
    return this._alpha;
  }
};

PixiJSEdu.AngleLabel = class AngleLabel extends PIXI.Container {
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
    centerX,
    centerY,
    arm1X,
    arm1Y,
    arm2X,
    arm2Y,
    radius,
    label,
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
    this._visible = true;
    this._alpha = 1.0;
    this._longArc = false;
    this.arcGraphics = new PIXI.Graphics();
    this.addChild(this.arcGraphics);
    this.textObject = new PIXI.Text(this._text, {
      fontFamily: this._fontFamily,
      fontSize: this._fontSize,
      fill: this._textColor,
      align: "center",
    });
    this.textObject.anchor.set(0.5, 0.5);
    this.addChild(this.textObject);
    this._draw();
    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
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
    this.arcGraphics.clear();
    const { startAngle, endAngle, angleDiff } = this._calculateAngles();

    if (this._lineThickness > 0) {
      this.arcGraphics.lineStyle(
        this._lineThickness,
        this._lineColor,
        this._alpha,
      );
      this.arcGraphics.beginFill(0x000000, 0);
      this.arcGraphics.arc(
        this._centerX,
        this._centerY,
        this._radius,
        startAngle,
        endAngle,
        false,
      );
      this.arcGraphics.endFill();
    }

    this.arcGraphics.alpha = this._alpha;

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
    this.textObject.x = textX;
    this.textObject.y = textY;
    this.textObject.alpha = this._alpha;
  }
  setText(text) {
    this._text = text;
    this.textObject.text = text;
    this._draw();
    return this;
  }
  setTextColor(color) {
    this._textColor = color;
    this.textObject.style.fill = color;
    return this;
  }
  setFontSize(size) {
    this._fontSize = size;
    this.textObject.style.fontSize = size;
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
    this._draw();
    return this;
  }
  setLongArc(useLongArc) {
    this._longArc = !!useLongArc;
    this._draw();
    return this;
  }
  set visible(value) {
    super.visible = Boolean(value);
  }
  get visible() {
    return super.visible;
  }
  set alpha(value) {
    this._alpha = Math.max(0, Math.min(1, value));
    this._draw();
    return this;
  }
  get alpha() {
    return this._alpha;
  }
};
PixiJSEdu.Line = class Line extends PIXI.Container {
  static serializationMap = {
    description: { de: "Einfache Linie", en: "Simple line" },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let myLine = new Line(0, 0, 100, 50, 0xff0000, 2);",
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
          en: "Sets the transparency of the line (0.0 to 1.0)",
          de: "Setzt die Transparenz der Linie (0.0 bis 1.0)",
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
  constructor(startX, startY, endX, endY, color = 0xff0000, thickness = 2) {
    super();
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;
    this._color = color;
    this._thickness = thickness;
    this._visible = true;
    this._alpha = 1.0;
    this._dashPattern = null;
    this._rotationDegrees = 0;

    this.lineGraphics = new PIXI.Graphics();
    this.addChild(this.lineGraphics);
    this._draw();
    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
  }
  _draw() {
    this.lineGraphics.clear();
    if (this._dashPattern) {
      this._drawDashedLine();
    } else {
      this.lineGraphics.beginFill();
      this.lineGraphics.lineStyle(this._thickness, this._color);
      this.lineGraphics.moveTo(this._startX, this._startY);
      this.lineGraphics.lineTo(this._endX, this._endY);
      this.lineGraphics.endFill();
    }
    this.lineGraphics.alpha = this._alpha;
  }
  _drawDashedLine() {
    if (!this._dashPattern || this._dashPattern.length === 0) return;
    const dx = this._endX - this._startX;
    const dy = this._endY - this._startY;
    const totalLength = Math.sqrt(dx * dx + dy * dy);
    if (totalLength === 0) return;
    const unitX = dx / totalLength;
    const unitY = dy / totalLength;
    let currentDistance = 0;
    let patternIndex = 0;
    let drawing = true;
    this.lineGraphics.beginFill();
    this.lineGraphics.lineStyle(this._thickness, this._color);
    while (currentDistance < totalLength) {
      const segmentLength = Math.min(
        this._dashPattern[patternIndex],
        totalLength - currentDistance,
      );
      const startX = this._startX + currentDistance * unitX;
      const startY = this._startY + currentDistance * unitY;
      const endX = this._startX + (currentDistance + segmentLength) * unitX;
      const endY = this._startY + (currentDistance + segmentLength) * unitY;
      if (drawing) {
        this.lineGraphics.moveTo(startX, startY);
        this.lineGraphics.lineTo(endX, endY);
      }
      this.lineGraphics.endFill();
      currentDistance += segmentLength;
      patternIndex = (patternIndex + 1) % this._dashPattern.length;
      drawing = !drawing;
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
  set visible(value) {
    super.visible = Boolean(value);
  }
  get visible() {
    return super.visible;
  }
  set alpha(value) {
    this._alpha = Math.max(0, Math.min(1, value));
    this._draw();
  }
  get alpha() {
    return this._alpha;
  }

  set rotation(degrees) {
    this._rotationDegrees = degrees;
    super.rotation = degrees * (Math.PI / 180);
  }

  get rotation() {
    return this._rotationDegrees;
  }
};
PixiJSEdu.Ruler = class Ruler extends PIXI.Container {
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
    this._ticksContainer = new PIXI.Container();
    this.addChild(this._ticksContainer);
    this._draw();
    if (typeof app !== "undefined" && app.stage) {
      app.stage.addChild(this);
    }
    if (typeof Board !== "undefined" && Board[INSTANCE_KEY]) {
      Board[INSTANCE_KEY].addChild(this);
    }
  }
  set visible(value) {
    super.visible = Boolean(value);
  }
  get visible() {
    return super.visible;
  }
  _draw() {
    this._ticksContainer.removeChildren();
    const formatValue = (value) => {
      if (typeof value === "number") {
        return value
          .toFixed(this._decimalPlaces)
          .replace(".", this._decimalSeparator);
      }
      return value;
    };
    this._values.forEach((value, index) => {
      const pos = this._spacingOffset + index * this._spacing;
      const formattedValue = formatValue(value);
      const tick = new PIXI.Graphics();
      let tickStart, tickEnd;
      switch (this._direction) {
        case "top":
          tickStart = [0, -pos];
          tickEnd = this._positionSwitch
            ? [-this._tickLength, -pos]
            : [this._tickLength, -pos];
          break;
        case "bottom":
          tickStart = [0, pos];
          tickEnd = this._positionSwitch
            ? [-this._tickLength, pos]
            : [this._tickLength, pos];
          break;
        case "left":
          tickStart = [-pos, 0];
          tickEnd = this._positionSwitch
            ? [-pos, this._tickLength]
            : [-pos, -this._tickLength];
          break;
        case "right":
          tickStart = [pos, 0];
          tickEnd = this._positionSwitch
            ? [pos, this._tickLength]
            : [pos, -this._tickLength];
          break;
      }
      tick.lineStyle(this._thickness, this._color);
      tick.beginFill();
      tick.moveTo(...tickStart);
      tick.lineTo(...tickEnd);
      tick.endFill();
      this._ticksContainer.addChild(tick);
      const label = new PIXI.Text(formattedValue, {
        fontFamily: "Arial",
        fontSize: this._fontSize,
        fill: this._fontColor,
      });
      let labelX, labelY;
      switch (this._direction) {
        case "top":
        case "bottom":
          labelX = this._positionSwitch
            ? tickEnd[0] - label.width - 5
            : tickEnd[0] + 5;
          labelY = tickEnd[1] - label.height / 2;
          break;
        case "left":
        case "right":
          labelX = tickEnd[0] - label.width / 2;
          labelY = this._positionSwitch
            ? tickEnd[1] + 5
            : tickEnd[1] - label.height - 5;
          break;
      }
      label.x = labelX;
      label.y = labelY;
      this._ticksContainer.addChild(label);
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
};
PixiJSEdu.CoordinateSystem = class CoordinateSystem extends PIXI.Container {
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
    sizeLeft,
    sizeRight,
    sizeTop,
    sizeBottom,
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
    this._arrows = {
      top: null,
      bottom: null,
      left: null,
      right: null,
    };
    this._draw();
    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
  }
  set visible(value) {
    super.visible = Boolean(value);
  }
  get visible() {
    return super.visible;
  }
  _draw() {
    if (this._arrows.top) this.removeChild(this._arrows.top);
    if (this._arrows.bottom) this.removeChild(this._arrows.bottom);
    if (this._arrows.left) this.removeChild(this._arrows.left);
    if (this._arrows.right) this.removeChild(this._arrows.right);
    if (this._sizeTop !== 0) {
      this._arrows.top = new PixiJSEdu.Arrow(
        0,
        0,
        0,
        -this._sizeTop,
        this._color,
        this._thickness,
        this._arrowLength,
        this._arrowWidth,
      );
      this.addChild(this._arrows.top);
    }
    if (this._sizeBottom !== 0) {
      this._arrows.bottom = new PixiJSEdu.Arrow(
        0,
        0,
        0,
        this._sizeBottom,
        this._color,
        this._thickness,
        this._arrowLength,
        this._arrowWidth,
      );
      this.addChild(this._arrows.bottom);
    }
    if (this._sizeLeft !== 0) {
      this._arrows.left = new PixiJSEdu.Arrow(
        0,
        0,
        -this._sizeLeft,
        0,
        this._color,
        this._thickness,
        this._arrowLength,
        this._arrowWidth,
      );
      this.addChild(this._arrows.left);
    }
    if (this._sizeRight !== 0) {
      this._arrows.right = new PixiJSEdu.Arrow(
        0,
        0,
        this._sizeRight,
        0,
        this._color,
        this._thickness,
        this._arrowLength,
        this._arrowWidth,
      );
      this.addChild(this._arrows.right);
    }
  }
  setColor(color) {
    this._color = color;
    if (this._arrows.top) this._arrows.top.setColor(color);
    if (this._arrows.bottom) this._arrows.bottom.setColor(color);
    if (this._arrows.left) this._arrows.left.setColor(color);
    if (this._arrows.right) this._arrows.right.setColor(color);
    return this;
  }
  setThickness(thickness) {
    this._thickness = thickness;
    if (this._arrows.top) this._arrows.top.setThickness(thickness);
    if (this._arrows.bottom) this._arrows.bottom.setThickness(thickness);
    if (this._arrows.left) this._arrows.left.setThickness(thickness);
    if (this._arrows.right) this._arrows.right.setThickness(thickness);
    return this;
  }
};

PixiJSEdu.SimpleSVG = class SimpleSVG extends PIXI.Container {
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

  // Texture cache shared across all SimpleSVG instances to avoid redundant renders
  static textureCache = new Map();
  static MAX_CACHE_SIZE = 50;

  constructor(svgString) {
    super();
    this._originalSvgString = this._normalizeSVGNumbers(svgString);
    this._maintainStrokeWidth = false;
    this._visualX = 0;
    this._visualY = 0;
    this._transformationPivotX = 0;
    this._transformationPivotY = 0;
    this._pivotX = 0;
    this._pivotY = 0;
    this._rotationDegrees = 0;
    this._visible = true;
    this._scale = { x: 1, y: 1 };
    this._alpha = 1;
    this._originalDimensions = null;
    this._originalStrokes = null;
    this._clickHandler = null;
    this._dragHandler = null;
    this._draggable = false;
    this._dragConstraints = null;
    this._isDragging = false;
    this._dragData = null;
    this._resolution = 2;
    this._isLoading = false;
    this._loadingPromise = null;
    this._pendingOperations = [];

    this._needsRedraw = true;
    this._redrawTimeout = null;

    this._cacheKey = null;

    this.borderGraphics = new PIXI.Graphics();
    this.addChild(this.borderGraphics);
    this.gruppe = new PIXI.Container();
    this.addChild(this.gruppe);
    this._setupParentRedirect();
    this.sprite = null;
    Board[INSTANCE_KEY].addChild(this.gruppe);

    if (this._maintainStrokeWidth) {
      this._extractOriginalStrokes();
    }

    this._scheduleRedraw();
  }

  // Debounced redraw to batch rapid property changes into a single render
  _scheduleRedraw() {
    if (this._redrawTimeout) {
      clearTimeout(this._redrawTimeout);
    }

    this._needsRedraw = true;
    this._redrawTimeout = setTimeout(() => {
      if (this._needsRedraw) {
        this._loadSVGAsImage();
        this._needsRedraw = false;
      }
    }, 16);
  }

  _generateCacheKey() {
    const key = [
      this._originalSvgString.substring(0, 100),
      this._scale.x,
      this._scale.y,
      this._resolution,
      this._maintainStrokeWidth,
    ].join("|");
    return key;
  }

  // Evicts the oldest half of cached textures when the cache exceeds MAX_CACHE_SIZE
  _cleanupCache() {
    if (SimpleSVG.textureCache.size > SimpleSVG.MAX_CACHE_SIZE) {
      const entriesToRemove = Math.floor(SimpleSVG.textureCache.size / 2);
      const keys = Array.from(SimpleSVG.textureCache.keys());

      for (let i = 0; i < entriesToRemove; i++) {
        const texture = SimpleSVG.textureCache.get(keys[i]);
        if (texture && texture.destroy) {
          texture.destroy(true);
        }
        SimpleSVG.textureCache.delete(keys[i]);
      }
    }
  }

  _updatePosition() {
    if (this.gruppe) {
      this.gruppe.x = this._visualX + this._pivotX - this._transformationPivotX;
      this.gruppe.y = this._visualY + this._pivotY - this._transformationPivotY;
    }
  }

  set x(value) {
    this._visualX = value;
    this._updatePosition();
    this._updateBorder();
  }

  get x() {
    return this._visualX;
  }

  set y(value) {
    this._visualY = value;
    this._updatePosition();
    this._updateBorder();
  }

  get y() {
    return this._visualY;
  }

  set rotation(degrees) {
    this._rotationDegrees = degrees;
    if (this.gruppe) {
      this.gruppe.rotation = degrees * (Math.PI / 180);
    }
  }

  get rotation() {
    return this._rotationDegrees || 0;
  }

  set draggable(value) {
    this._draggable = value;
    if (value) {
      this._setupDragInteractivity();
    } else {
      this._removeDragInteractivity();
    }
  }

  get draggable() {
    return this._draggable;
  }

  setRotationPoint(offsetX = 0, offsetY = 0) {
    const oldPivotX = this._pivotX;
    const oldPivotY = this._pivotY;
    this._pivotX = offsetX;
    this._pivotY = offsetY;
    if (this.gruppe) {
      this.gruppe.pivot.set(offsetX, offsetY);
      this.gruppe.x += offsetX - oldPivotX;
      this.gruppe.y += offsetY - oldPivotY;
    }
    return this;
  }

  setTransformationPoint(offsetX = 0, offsetY = 0) {
    this._transformationPivotX = offsetX;
    this._transformationPivotY = offsetY;
    this._updatePosition();
    return this;
  }

  setDragging(x1, y1, x2, y2) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    this._dragConstraints = {
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      isLine: maxX - minX === 0 || maxY - minY === 0,
    };
    this.draggable = true;
    return this;
  }

  _setupDragInteractivity() {
    if (!this.sprite) {
      this._pendingOperations.push(() => this._setupDragInteractivity());
      return;
    }
    this.sprite.interactive = true;
    this.sprite.buttonMode = true;
    this._removeDragListeners();

    if (!this._boundDragStart) {
      this._boundDragStart = this._onDragStart.bind(this);
      this._boundDragMove = this._onDragMove.bind(this);
      this._boundDragEnd = this._onDragEnd.bind(this);
    }

    this.sprite.on("pointerdown", this._boundDragStart);
  }

  _removeDragInteractivity() {
    if (!this.sprite) return;
    this._removeDragListeners();
    if (!this._clickHandler) {
      this.sprite.interactive = false;
      this.sprite.buttonMode = false;
    }
  }

  _removeDragListeners() {
    if (!this.sprite) return;

    if (this._boundDragStart) {
      this.sprite.off("pointerdown", this._boundDragStart);
    }

    const stage = this._findStage();
    if (stage && this._boundDragMove && this._boundDragEnd) {
      stage.off("pointermove", this._boundDragMove);
      stage.off("pointerup", this._boundDragEnd);
      stage.off("pointerupoutside", this._boundDragEnd);
    }
  }

  _onDragStart(event) {
    if (!this._draggable) return;
    event.stopPropagation();
    this._isDragging = true;
    this._dragData = event.data;

    const globalPosition = this._dragData.global;
    const parentPosition = this.gruppe.parent.toLocal(globalPosition);
    this._dragStartX = parentPosition.x - this._visualX;
    this._dragStartY = parentPosition.y - this._visualY;

    if (this.sprite) {
      this.sprite.cursor = "grabbing";
    }

    const stage = this._findStage();
    if (stage) {
      stage.on("pointermove", this._boundDragMove);
      stage.on("pointerup", this._boundDragEnd);
      stage.on("pointerupoutside", this._boundDragEnd);
      stage.interactive = true;
    }
  }

  _findStage() {
    let current = this.gruppe;
    while (current && current.parent) {
      current = current.parent;
    }
    return current;
  }

  _onDragMove(event) {
    if (!this._isDragging || !this._dragData) return;

    const globalPosition = event.data.global;
    const newPosition = this.gruppe.parent.toLocal(globalPosition);

    let newX = newPosition.x - this._dragStartX;
    let newY = newPosition.y - this._dragStartY;

    if (this._dragConstraints) {
      const spriteWidth = this.sprite
        ? this.sprite.width / this._resolution
        : 0;
      const spriteHeight = this.sprite
        ? this.sprite.height / this._resolution
        : 0;
      newX = Math.max(
        this._dragConstraints.minX,
        Math.min(this._dragConstraints.maxX - spriteWidth, newX),
      );
      newY = Math.max(
        this._dragConstraints.minY,
        Math.min(this._dragConstraints.maxY - spriteHeight, newY),
      );

      if (this._dragConstraints.isLine) {
        if (this._dragConstraints.maxX - this._dragConstraints.minX === 0) {
          newX = this._dragConstraints.minX;
        } else if (
          this._dragConstraints.maxY - this._dragConstraints.minY ===
          0
        ) {
          newY = this._dragConstraints.minY;
        }
      }
    }

    this.x = newX;
    this.y = newY;

    if (this._dragHandler && typeof this._dragHandler === "function") {
      this._dragHandler(newX, newY);
    }
  }

  _onDragEnd(event) {
    if (!this._isDragging) return;

    const stage = this._findStage();
    if (stage && this._boundDragMove && this._boundDragEnd) {
      stage.off("pointermove", this._boundDragMove);
      stage.off("pointerup", this._boundDragEnd);
      stage.off("pointerupoutside", this._boundDragEnd);
    }

    this._isDragging = false;
    this._dragData = null;

    if (this.sprite) {
      this.sprite.cursor = "grab";
    }

    if (this._clickHandler && event && event.data) {
      const globalPosition = event.data.global;
      const position = this.gruppe.parent.toLocal(globalPosition);
      const draggedX = Math.abs(position.x - this._dragStartX - this._visualX);
      const draggedY = Math.abs(position.y - this._dragStartY - this._visualY);

      if (draggedX < 5 && draggedY < 5) {
        this._clickHandler(event);
      }
    }
  }

  _setupParentRedirect() {
    const originalParentSetter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(this),
      "parent",
    );

    Object.defineProperty(this, "parent", {
      get: () => {
        return (
          this._customParent ||
          (originalParentSetter && originalParentSetter.get
            ? originalParentSetter.get.call(this)
            : undefined)
        );
      },
      set: (value) => {
        if (value && value !== this._customParent) {
          if (
            this._customParent &&
            this._customParent.removeChild &&
            this.gruppe &&
            this.gruppe.parent === this._customParent
          ) {
            this._customParent.removeChild(this.gruppe);
          }
          if (
            value.addChild &&
            this.gruppe &&
            value !== this &&
            value !== this.gruppe
          ) {
            value.addChild(this.gruppe);
            this._customParent = value;
            if (originalParentSetter && originalParentSetter.set) {
              originalParentSetter.set.call(this, value);
            }
          }
        } else if (!value && this._customParent) {
          if (
            this._customParent.removeChild &&
            this.gruppe &&
            this.gruppe.parent
          ) {
            this._customParent.removeChild(this.gruppe);
          }
          this._customParent = null;
          if (originalParentSetter && originalParentSetter.set) {
            originalParentSetter.set.call(this, null);
          }
        }
      },
      configurable: true,
      enumerable: true,
    });

    if (this.setParent) {
      this.setParent = (parent) => {
        this.parent = parent;
      };
    }
  }

  removeFromParent() {
    if (this._customParent && this._customParent.removeChild) {
      this._customParent.removeChild(this.gruppe);
      this._customParent = null;
    }
    if (super.removeFromParent) {
      super.removeFromParent();
    }
  }

  destroy(options) {
    if (this._redrawTimeout) {
      clearTimeout(this._redrawTimeout);
      this._redrawTimeout = null;
    }

    this._removeDragListeners();

    if (this.gruppe && this.gruppe.parent) {
      this.gruppe.parent.removeChild(this.gruppe);
    }

    if (this.borderGraphics) {
      this.borderGraphics.destroy();
    }

    if (this.sprite) {
      this.sprite.destroy(false); // preserve cached texture
    }

    if (this.gruppe) {
      this.gruppe.destroy();
    }

    if (Board[INSTANCE_KEY]) {
      const board = Board[INSTANCE_KEY];
      const index = board.allChildren.indexOf(this);
      if (index > -1) {
        board.allChildren.splice(index, 1);
      }
    }

    super.destroy(options);
  }

  _normalizeSVGNumbers(svgString) {
    let normalized = svgString.replace(
      /(\s+[\w-]+\s*=\s*["']?)(\.\d+)/g,
      (match, prefix, number) => {
        return prefix + "0" + number;
      },
    );

    normalized = normalized.replace(
      /(\s+[\w-]+\s*=\s*)(\.\d+)(?=[\s>])/g,
      (match, prefix, number) => {
        return prefix + "0" + number;
      },
    );

    return normalized;
  }

  _extractOriginalStrokes() {
    const strokeMatches = [
      ...this._originalSvgString.matchAll(
        /stroke-width\s*=\s*["']?((?:0?)?\.\d+|\d+(?:\.\d+)?)["']?/g,
      ),
    ];
    this._originalStrokes = strokeMatches.map((match) => {
      let value = match[1];
      if (value.startsWith(".")) {
        value = "0" + value;
      }
      return parseFloat(value) || 1;
    });

    if (this._originalStrokes.length === 0) {
      const strokeElements = [
        ...this._originalSvgString.matchAll(/<[^>]*stroke\s*=/g),
      ];
      this._originalStrokes = strokeElements.map(() => 1);
    }
  }

  _extractOriginalDimensions(svgString) {
    const widthMatch = svgString.match(
      /width\s*=\s*["']?((?:0?)?\.\d+|\d+(?:\.\d+)?)["']?/,
    );
    const heightMatch = svgString.match(
      /height\s*=\s*["']?((?:0?)?\.\d+|\d+(?:\.\d+)?)["']?/,
    );

    let width = null;
    let height = null;

    if (widthMatch) {
      let widthStr = widthMatch[1];
      if (widthStr.startsWith(".")) widthStr = "0" + widthStr;
      width = parseFloat(widthStr);
    }

    if (heightMatch) {
      let heightStr = heightMatch[1];
      if (heightStr.startsWith(".")) heightStr = "0" + heightStr;
      height = parseFloat(heightStr);
    }

    if (!width || !height) {
      const viewBoxMatch = svgString.match(
        /viewBox\s*=\s*["']?\s*((?:0?)?\.\d+|\d+(?:\.\d+)?)\s+((?:0?)?\.\d+|\d+(?:\.\d+)?)\s+((?:0?)?\.\d+|\d+(?:\.\d+)?)\s+((?:0?)?\.\d+|\d+(?:\.\d+)?)["']?/,
      );
      if (viewBoxMatch) {
        let viewBoxWidth = viewBoxMatch[3];
        let viewBoxHeight = viewBoxMatch[4];

        if (viewBoxWidth.startsWith(".")) viewBoxWidth = "0" + viewBoxWidth;
        if (viewBoxHeight.startsWith(".")) viewBoxHeight = "0" + viewBoxHeight;

        const parsedWidth = parseFloat(viewBoxWidth);
        const parsedHeight = parseFloat(viewBoxHeight);

        width = width || parsedWidth;
        height = height || parsedHeight;
      }
    }

    width = width || 100;
    height = height || 100;

    return { width, height };
  }

  _adjustStrokeWidths(svgString, scaleX, scaleY) {
    if (
      !this._maintainStrokeWidth ||
      !this._originalStrokes ||
      this._originalStrokes.length === 0
    ) {
      return svgString;
    }

    let adjustedSvg = svgString;
    let strokeIndex = 0;
    const avgScale = (scaleX + scaleY) / 2;

    adjustedSvg = adjustedSvg.replace(
      /stroke-width\s*=\s*["']?((?:0?)?\.\d+|\d+(?:\.\d+)?)["']?/g,
      (match, width) => {
        if (strokeIndex < this._originalStrokes.length) {
          const adjustedWidth = this._originalStrokes[strokeIndex] / avgScale;
          strokeIndex++;
          return 'stroke-width="' + adjustedWidth.toFixed(2) + '"';
        }
        return match;
      },
    );

    return adjustedSvg;
  }

  _scaleSVGString(svgString, scaleX, scaleY) {
    if (!this._originalDimensions) {
      this._originalDimensions = this._extractOriginalDimensions(svgString);
    }

    const renderScale = this._resolution;
    const newWidth = Math.round(
      this._originalDimensions.width * scaleX * renderScale,
    );
    const newHeight = Math.round(
      this._originalDimensions.height * scaleY * renderScale,
    );

    let scaledSvg = svgString;

    if (!scaledSvg.includes("xmlns=")) {
      scaledSvg = scaledSvg.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    }

    if (scaledSvg.includes("width=")) {
      scaledSvg = scaledSvg.replace(
        /width\s*=\s*["']?[^"'\s>]+["']?/,
        'width="' + newWidth + '"',
      );
    } else {
      scaledSvg = scaledSvg.replace("<svg", '<svg width="' + newWidth + '"');
    }

    if (scaledSvg.includes("height=")) {
      scaledSvg = scaledSvg.replace(
        /height\s*=\s*["']?[^"'\s>]+["']?/,
        'height="' + newHeight + '"',
      );
    } else {
      scaledSvg = scaledSvg.replace("<svg", '<svg height="' + newHeight + '"');
    }

    if (!scaledSvg.includes("viewBox=")) {
      const viewBox =
        "0 0 " +
        this._originalDimensions.width +
        " " +
        this._originalDimensions.height;
      scaledSvg = scaledSvg.replace("<svg", '<svg viewBox="' + viewBox + '"');
    }

    scaledSvg = this._adjustStrokeWidths(
      scaledSvg,
      scaleX * renderScale,
      scaleY * renderScale,
    );

    return scaledSvg;
  }

  _prepareSVG(svgString) {
    if (!svgString || svgString.trim() === "" || !svgString.includes("<svg")) {
      console.error("SVG-String ungültig:", svgString);
      return null;
    }

    let preparedSvg = svgString;

    if (!preparedSvg.includes("xmlns=")) {
      preparedSvg = preparedSvg.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    }

    if (!preparedSvg.includes("width=") || !preparedSvg.includes("height=")) {
      const dimensions = this._extractOriginalDimensions(preparedSvg);

      if (!preparedSvg.includes("width=")) {
        preparedSvg = preparedSvg.replace(
          "<svg",
          '<svg width="' + dimensions.width + '"',
        );
      }
      if (!preparedSvg.includes("height=")) {
        preparedSvg = preparedSvg.replace(
          "<svg",
          '<svg height="' + dimensions.height + '"',
        );
      }
    }

    return preparedSvg;
  }

  _executePendingOperations() {
    while (this._pendingOperations.length > 0) {
      const operation = this._pendingOperations.shift();
      operation();
    }
  }

  _loadSVGAsImage() {
    if (this._isLoading) {
      return this._loadingPromise;
    }

    this._isLoading = true;

    this._cacheKey = this._generateCacheKey();
    const cachedTexture = SimpleSVG.textureCache.get(this._cacheKey);

    if (cachedTexture && cachedTexture.valid) {
      this._applyTexture(cachedTexture);
      this._isLoading = false;
      this._executePendingOperations();
      return Promise.resolve();
    }

    const scaledSvgString = this._scaleSVGString(
      this._originalSvgString,
      this._scale.x,
      this._scale.y,
    );
    const preparedSvg = this._prepareSVG(scaledSvgString);

    if (!preparedSvg) {
      this._isLoading = false;
      return Promise.reject(new Error("Invalid SVG"));
    }

    this._loadingPromise = new Promise((resolve, reject) => {
      try {
        const svgBase64 = btoa(unescape(encodeURIComponent(preparedSvg)));
        const dataUrl = "data:image/svg+xml;base64," + svgBase64;

        const img = new Image();

        img.onload = () => {
          const textureOptions = {
            resolution: this._resolution,
            antialias: true,
          };

          if (PIXI.SCALE_MODES) {
            textureOptions.scaleMode = PIXI.SCALE_MODES.LINEAR;
          }

          if (PIXI.MIPMAP_MODES && PIXI.MIPMAP_MODES.POW2) {
            textureOptions.mipmap = PIXI.MIPMAP_MODES.POW2;
          }

          const texture = PIXI.Texture.from(img, textureOptions);

          SimpleSVG.textureCache.set(this._cacheKey, texture);
          this._cleanupCache();

          this._applyTexture(texture);
          this._isLoading = false;
          this._executePendingOperations();
          resolve();
        };

        img.onerror = (err) => {
          console.error("Fehler beim Laden des SVG-Bildes:", err);
          this._isLoading = false;
          reject(err);
        };

        img.src = dataUrl;
      } catch (error) {
        console.error("Fehler beim Erstellen der SVG-Data-URL:", error);
        this._isLoading = false;
        reject(error);
      }
    });

    return this._loadingPromise;
  }

  _applyTexture(texture) {
    if (this.sprite) {
      this.gruppe.removeChild(this.sprite);
      this.sprite.destroy(false); // preserve cached texture
      this.sprite = null;
    }

    this.sprite = new PIXI.Sprite(texture);
    this.sprite.x = 0;
    this.sprite.y = 0;

    // Scale down the sprite by the resolution factor so it renders at the correct logical size
    const scaleFactor = 1 / this._resolution;
    this.sprite.scale.set(scaleFactor, scaleFactor);

    this.sprite.interactive = true;
    this.sprite.buttonMode = true;

    if (this._draggable) {
      this.sprite.cursor = "grab";
    }

    this.gruppe.addChild(this.sprite);
    this._setupClickHandler();

    if (this._draggable) {
      this._setupDragInteractivity();
    }

    this._updateBorder();
  }

  _setupClickHandler() {
    if (!this.sprite) return;

    this.sprite.removeAllListeners("pointerdown");

    if (this._clickHandler || this._draggable) {
      this.sprite.on("pointerdown", (event) => {
        if (this._draggable) {
          this._onDragStart(event);
        } else if (
          this._clickHandler &&
          typeof this._clickHandler === "function"
        ) {
          this._clickHandler(event);
        }
      });
    }
  }

  _updateBorder() {
    if (!this.sprite) return;

    const width = this.sprite.width / this._resolution;
    const height = this.sprite.height / this._resolution;

    if (width === 0 || height === 0) return;

    this.borderGraphics.clear();

    if (this._showBorder) {
      this.borderGraphics.lineStyle(1, 0x000000, 0.2);
      this.borderGraphics.drawRect(0, 0, width, height);
    }
  }

  onClick(handler) {
    if (typeof handler !== "function") {
      console.error("onClick erwartet eine Funktion als Parameter");
      return;
    }

    this._clickHandler = handler;

    if (this.sprite) {
      this._setupClickHandler();
    }
  }

  onDrag(handler) {
    if (typeof handler !== "function") {
      console.error("onDrag erwartet eine Funktion als Parameter");
      return;
    }

    this._dragHandler = handler;
  }

  set visible(value) {
    this._visible = value;
    if (this.gruppe) {
      this.gruppe.visible = this._visible;
    }
  }

  get visible() {
    return this._visible;
  }

  set maintainStrokeWidth(value) {
    if (this._maintainStrokeWidth !== value) {
      this._maintainStrokeWidth = value;
      if (value && !this._originalStrokes) {
        this._extractOriginalStrokes();
      }
      this._scheduleRedraw();
    }
  }

  get maintainStrokeWidth() {
    return this._maintainStrokeWidth;
  }

  set resolution(value) {
    value = Math.max(1, Math.min(4, value));
    if (this._resolution !== value) {
      this._resolution = value;
      this._scheduleRedraw();
    }
  }

  get resolution() {
    return this._resolution;
  }

  setScale(scaleX, scaleY) {
    if (this._scale.x === scaleX && this._scale.y === scaleY) {
      return;
    }

    const operation = () => {
      this._scale.x = scaleX;
      this._scale.y = scaleY;
      this._scheduleRedraw();
    };

    if (this._isLoading) {
      this._pendingOperations.push(operation);
    } else {
      operation();
    }
  }

  setAlpha(value) {
    value = Math.max(0, Math.min(1, value));
    if (this.gruppe) {
      this.gruppe.alpha = value;
    }
    this._alpha = value;
  }

  // Sets position, scale, and rotation in a single call without triggering a redraw.
  // Useful for animation loops that update transforms every frame.
  setTransform(x, y, scaleX, scaleY, rotation) {
    this._visualX = x;
    this._visualY = y;
    this._updatePosition();

    if (this.gruppe) {
      this.gruppe.scale.set(scaleX, scaleY);
      this.gruppe.rotation = rotation * (Math.PI / 180);
    }

    this._scale.x = scaleX;
    this._scale.y = scaleY;
    this._rotationDegrees = rotation;
  }
};

PixiJSEdu.SimpleSVG.clearCache = function () {
  SimpleSVG.textureCache.forEach((texture, key) => {
    if (texture && texture.destroy) {
      texture.destroy(true);
    }
  });
  SimpleSVG.textureCache.clear();
};

PixiJSEdu.Timer = class Timer extends PIXI.Container {
  static serializationMap = {
    description: { de: "Timer für Animationen", en: "Timer for animations" },
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
        info: {
          en: "Starts the timer",
          de: "Startet den Timer",
        },
      },
      stop: {
        example: "stop()",
        info: {
          en: "Stops the timer",
          de: "Stoppt den Timer",
        },
      },
      pause: {
        example: "pause()",
        info: {
          en: "Pauses the timer",
          de: "Pausiert den Timer",
        },
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
    super();
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
    this._updateFunction = this._update.bind(this);
    this._ticker = null;
    this._animationFrameId = null;
    this._initializeTicker();
    if (this._autoStart) {
      this.start();
    }
    app.stage.addChild(this);
    Board[INSTANCE_KEY].addChild(this);
    this.visible = false;
  }
  _initializeTicker() {
    if (typeof app !== "undefined" && app.ticker) {
      this._ticker = app.ticker;
    } else if (typeof PIXI !== "undefined" && PIXI.Ticker) {
      this._ticker = PIXI.Ticker.shared;
    } else {
      this._ticker = null;
    }
  }
  _startUpdateLoop() {
    if (this._ticker) {
      this._ticker.add(this._updateFunction);
    } else {
      this._animationFrameLoop();
    }
  }
  _stopUpdateLoop() {
    if (this._ticker) {
      this._ticker.remove(this._updateFunction);
    } else if (this._animationFrameId) {
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
  start() {
    if (this._isRunning && !this._isPaused) return;
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
    if (!this._isRunning || this._isPaused) return;
    this._isPaused = true;
    this._pausedTime = this._currentTime;
    this._stopUpdateLoop();
    return this;
  }
  resume() {
    if (!this._isPaused) return;
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
  _update() {
    if (!this._isRunning || this._isPaused) return;
    this._currentTime = Date.now() - this._startTime;
    if (this._duration === null) {
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
    if (this._duration === null) {
      return Infinity;
    }
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
    if (this.parent === app.stage) {
      app.stage.removeChild(this);
    }
    if (this.parent === Board[INSTANCE_KEY]) {
      Board[INSTANCE_KEY].removeChild(this);
    }
    this._animations = [];
    this._keyframeAnimations = [];
    this._onCompleteCallback = null;
    this._onUpdateCallback = null;
    super.destroy();
  }
};
PixiJSEdu.ParticleSystem = class ParticleSystem extends PIXI.Container {
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
          en: "Configuration object for particle system (maxParticles, gravity, friction, etc.)",
          de: "Konfigurationsobjekt für Partikelsystem (maxParticles, gravity, friction, etc.)",
        },
      },
    },
    setter: {
      x: {
        name: "x",
        info: {
          en: "Horizontal position of the particle system",
          de: "Horizontale Position des Partikelsystems",
        },
        example: "x = 100",
      },
      y: {
        name: "y",
        info: {
          en: "Vertical position of the particle system",
          de: "Vertikale Position des Partikelsystems",
        },
        example: "y = 200",
      },
      visible: {
        name: "visible",
        info: {
          en: "Visibility of the particle system",
          de: "Sichtbarkeit des Partikelsystems",
        },
        example: "visible = false",
      },
      debug: {
        name: "debug",
        info: {
          en: "Enable/disable debug visualization",
          de: "Debug-Visualisierung aktivieren/deaktivieren",
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
          en: "Sets the spawn area for particle creation with spawn configuration",
          de: "Setzt den Spawn-Bereich für Partikelerzeugung mit Spawn-Konfiguration",
        },
      },
      setDeathContainer: {
        example: "setDeathContainer(containerShape)",
        info: {
          en: "Sets the death zone where particles are destroyed",
          de: "Setzt die Todeszone, in der Partikel zerstört werden",
        },
      },
      addPropertyContainer: {
        example:
          'addPropertyContainer(containerShape, {vx: (v) => v*2}, {onEnter: (p) => console.log("entered")})',
        info: {
          en: "Adds a property container that modifies particle properties and triggers callbacks",
          de: "Fügt einen Eigenschafts-Container hinzu, der Partikeleigenschaften verändert und Callbacks auslöst",
        },
      },
      createParticle: {
        example:
          "createParticle(100, 200, {radius: 10, color: 0xFF0000, vx: 2, vy: -1})",
        info: {
          en: "Manually creates a single particle at specified position with options",
          de: "Erstellt manuell ein einzelnes Partikel an angegebener Position mit Optionen",
        },
      },
      setGravity: {
        example: "setGravity(0, 0.5)",
        info: {
          en: "Sets gravity force affecting all particles (x and y components)",
          de: "Setzt die Gravitationskraft, die alle Partikel beeinflusst (x- und y-Komponenten)",
        },
      },
      setFriction: {
        example: "setFriction(0.99)",
        info: {
          en: "Sets global friction coefficient (0-1, where 1 = no friction)",
          de: "Setzt den globalen Reibungskoeffizienten (0-1, wobei 1 = keine Reibung)",
        },
      },
      setRestitution: {
        example: "setRestitution(0.8)",
        info: {
          en: "Sets bounce coefficient for collisions (0 = no bounce, 1 = perfect bounce)",
          de: "Setzt den Abprallkoeffizienten für Kollisionen (0 = kein Abprall, 1 = perfekter Abprall)",
        },
      },
      clearParticles: {
        example: "clearParticles()",
        info: {
          en: "Removes all active particles from the system",
          de: "Entfernt alle aktiven Partikel aus dem System",
        },
      },
      pause: {
        example: "pause()",
        info: {
          en: "Pauses the particle simulation",
          de: "Pausiert die Partikelsimulation",
        },
      },
      resume: {
        example: "resume()",
        info: {
          en: "Resumes the particle simulation",
          de: "Setzt die Partikelsimulation fort",
        },
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
    this.spatialHash = new SpatialHash(this.config.cellSize);
    this.quadTree = null;
    this.particleContainer = new PIXI.Container();
    this.addChild(this.particleContainer);
    this.debugGraphics = null;
    if (this.config.debug) {
      this.debugGraphics = new PIXI.Graphics();
      this.addChild(this.debugGraphics);
    }
    this.textureCache = new Map();
    this._texturesReady = false;
    this._lastTime = performance.now();
    if (typeof app !== "undefined" && app.ticker) {
      app.ticker.add(this.update, this);
    } else {
      this._useRAF = true;
      this._rafUpdate = () => {
        this.update();
        if (this._useRAF) {
          requestAnimationFrame(this._rafUpdate);
        }
      };
      requestAnimationFrame(this._rafUpdate);
    }
  }
  _ensureTexturesReady() {
    if (this._texturesReady) return;
    if (typeof app === "undefined" || !app.renderer) {
      return;
    }
    this._prepareTextures();
    this._texturesReady = true;
  }
  _prepareTextures() {
    const radii = [3, 5, 8, 10, 15, 20, 30];
    radii.forEach((radius) => {
      this._createCircleTexture(radius);
    });
  }
  _createCircleTexture(radius, color = 0xffffff) {
    const key = radius + "_" + color;
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key);
    }
    if (typeof app === "undefined" || !app.renderer) {
      return null;
    }
    const graphics = new PIXI.Graphics();
    graphics.beginFill(color);
    graphics.drawCircle(0, 0, radius);
    graphics.endFill();
    const texture = app.renderer.generateTexture(graphics);
    graphics.destroy();
    this.textureCache.set(key, texture);
    return texture;
  }
  setMainContainer(container) {
    this.mainContainer = {
      shape: container,
      type: "main",
      vertices: this._extractVertices(container),
      bounds: this._calculateBounds(container),
    };
    this.containers.set("main", this.mainContainer);
  }
  setSpawnContainer(container, spawnConfig = {}) {
    this.spawnContainer = {
      shape: container,
      type: "spawn",
      vertices: this._extractVertices(container),
      bounds: this._calculateBounds(container),
      config: {
        rate: spawnConfig.rate || 10,
        burst: spawnConfig.burst || false,
        initialVelocity: spawnConfig.initialVelocity || { x: 0, y: 0 },
        velocityVariation: spawnConfig.velocityVariation || { x: 2, y: 2 },
        properties: spawnConfig.properties || {},
      },
    };
    this.containers.set("spawn", this.spawnContainer);
  }
  setDeathContainer(container) {
    this.deathContainer = {
      shape: container,
      type: "death",
      vertices: this._extractVertices(container),
      bounds: this._calculateBounds(container),
    };
    this.containers.set("death", this.deathContainer);
  }
  addPropertyContainer(container, properties = {}, callbacks = {}) {
    const propertyContainer = {
      shape: container,
      type: "property",
      vertices: this._extractVertices(container),
      bounds: this._calculateBounds(container),
      properties: properties,
      callbacks: callbacks,
      affectedParticles: new Set(),
    };
    this.propertyContainers.push(propertyContainer);
    this.containers.set(
      "property_" + this.propertyContainers.length,
      propertyContainer,
    );
    return propertyContainer;
  }
  _extractVertices(container) {
    const vertices = [];
    if (container.geometry) {
      const points = container.geometry.points;
      for (let i = 0; i < points.length; i += 2) {
        vertices.push({
          x: points[i] + container.x,
          y: points[i + 1] + container.y,
        });
      }
    } else if (container.points) {
      for (let i = 0; i < container.points.length; i += 2) {
        vertices.push({
          x: container.points[i],
          y: container.points[i + 1],
        });
      }
    }
    return vertices;
  }
  _calculateBounds(container) {
    const vertices = this._extractVertices(container);
    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;
    vertices.forEach((v) => {
      minX = Math.min(minX, v.x);
      minY = Math.min(minY, v.y);
      maxX = Math.max(maxX, v.x);
      maxY = Math.max(maxY, v.y);
    });
    return { minX, minY, maxX, maxY };
  }
  createParticle(x, y, options = {}) {
    this._ensureTexturesReady();
    let particle;
    if (this.particlePool.length > 0) {
      particle = this.particlePool.pop();
      particle.reset(x, y);
      particle.sprite.visible = true;
    } else {
      particle = new Particle(
        x,
        y,
        options.radius || this.config.particleRadius,
      );
      const texture = this._createCircleTexture(
        particle.radius,
        options.color || this.config.particleColor,
      );
      if (texture) {
        particle.sprite = new PIXI.Sprite(texture);
        particle.sprite.anchor.set(0.5);
      } else {
        particle.sprite = new PIXI.Graphics();
        particle.sprite.beginFill(options.color || this.config.particleColor);
        particle.sprite.drawCircle(0, 0, particle.radius);
        particle.sprite.endFill();
      }
      this.particleContainer.addChild(particle.sprite);
    }
    particle.vx = options.vx || 0;
    particle.vy = options.vy || 0;
    particle.mass = options.mass || 1;
    particle.restitution = options.restitution || this.config.restitution;
    this.particles.push(particle);
    this.activeParticles++;
    return particle;
  }
  update(ticker) {
    if (this.paused) return;
    this._ensureTexturesReady();
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - this._lastTime) / 1000, 0.1);
    this._lastTime = currentTime;
    this._spawnParticles(deltaTime);
    if (this.config.useSpatialHash) {
      this.spatialHash.clear();
      this.particles.forEach((p) => {
        if (p.active) this.spatialHash.insert(p);
      });
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      if (!particle.active) continue;
      this._updateParticlePhysics(particle, deltaTime);
      this._checkContainerInteractions(particle);
      this._checkCollisions(particle);
      if (
        this.deathContainer &&
        this._isInContainer(particle, this.deathContainer)
      ) {
        this._destroyParticle(particle, i);
      }
      particle.sprite.x = particle.x;
      particle.sprite.y = particle.y;
    }
    if (this.config.debug) {
      this._drawDebug();
    }
  }
  _spawnParticles(deltaTime) {
    if (
      !this.spawnContainer ||
      this.activeParticles >= this.config.maxParticles
    )
      return;
    const config = this.spawnContainer.config;
    const particlesToSpawn = Math.floor(config.rate * deltaTime);
    for (let i = 0; i < particlesToSpawn; i++) {
      const pos = this._getRandomPositionInContainer(this.spawnContainer);
      if (pos) {
        const vx =
          config.initialVelocity.x +
          (Math.random() - 0.5) * config.velocityVariation.x;
        const vy =
          config.initialVelocity.y +
          (Math.random() - 0.5) * config.velocityVariation.y;
        this.createParticle(pos.x, pos.y, {
          vx: vx,
          vy: vy,
          ...config.properties,
        });
      }
    }
  }
  _updateParticlePhysics(particle, deltaTime) {
    particle.vx += this.config.gravity.x * deltaTime;
    particle.vy += this.config.gravity.y * deltaTime;
    particle.vx *= this.config.friction;
    particle.vy *= this.config.friction;
    particle.x += particle.vx * deltaTime * 60;
    particle.y += particle.vy * deltaTime * 60;
  }
  _checkContainerInteractions(particle) {
    if (this.mainContainer) {
      if (!this._isInContainer(particle, this.mainContainer)) {
        this._handleContainerCollision(particle, this.mainContainer);
      }
    }
    this.propertyContainers.forEach((container) => {
      const isInside = this._isInContainer(particle, container);
      const wasInside = container.affectedParticles.has(particle);
      if (isInside && !wasInside) {
        container.affectedParticles.add(particle);
        this._applyContainerProperties(particle, container);
        if (container.callbacks.onEnter) {
          container.callbacks.onEnter(particle, container);
        }
      } else if (!isInside && wasInside) {
        container.affectedParticles.delete(particle);
        if (container.callbacks.onExit) {
          container.callbacks.onExit(particle, container);
        }
      } else if (isInside && wasInside) {
        if (container.callbacks.onStay) {
          container.callbacks.onStay(particle, container);
        }
      }
    });
  }
  _checkCollisions(particle) {
    let candidates;
    if (this.config.useSpatialHash) {
      candidates = this.spatialHash.getNearby(particle);
    } else {
      candidates = this.particles;
    }
    candidates.forEach((other) => {
      if (other === particle || !other.active) return;
      const dx = other.x - particle.x;
      const dy = other.y - particle.y;
      const distSq = dx * dx + dy * dy;
      const minDist = particle.radius + other.radius;
      if (distSq < minDist * minDist) {
        this._resolveParticleCollision(particle, other, Math.sqrt(distSq));
      }
    });
  }
  _resolveParticleCollision(p1, p2, distance) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const nx = dx / distance;
    const ny = dy / distance;
    const dvx = p2.vx - p1.vx;
    const dvy = p2.vy - p1.vy;
    const dvn = dvx * nx + dvy * ny;
    if (dvn > 0) return;
    const restitution = (p1.restitution + p2.restitution) / 2;
    const impulse = (2 * dvn) / (p1.mass + p2.mass);
    p1.vx -= impulse * p2.mass * nx * restitution;
    p1.vy -= impulse * p2.mass * ny * restitution;
    p2.vx += impulse * p1.mass * nx * restitution;
    p2.vy += impulse * p1.mass * ny * restitution;
    const overlap = p1.radius + p2.radius - distance;
    const separationX = nx * overlap * 0.5;
    const separationY = ny * overlap * 0.5;
    p1.x -= separationX;
    p1.y -= separationY;
    p2.x += separationX;
    p2.y += separationY;
  }
  _isInContainer(particle, container) {
    return this._pointInPolygon(particle.x, particle.y, container.vertices);
  }
  _pointInPolygon(x, y, vertices) {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x,
        yi = vertices[i].y;
      const xj = vertices[j].x,
        yj = vertices[j].y;
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
  _handleContainerCollision(particle, container) {
    let minDist = Infinity;
    let closestEdge = null;
    let closestPoint = null;
    const vertices = container.vertices;
    for (let i = 0; i < vertices.length; i++) {
      const v1 = vertices[i];
      const v2 = vertices[(i + 1) % vertices.length];
      const point = this._closestPointOnSegment(particle.x, particle.y, v1, v2);
      const dist = Math.sqrt(
        (point.x - particle.x) ** 2 + (point.y - particle.y) ** 2,
      );
      if (dist < minDist) {
        minDist = dist;
        closestEdge = { v1, v2 };
        closestPoint = point;
      }
    }
    if (closestEdge && minDist < particle.radius) {
      const edge = {
        x: closestEdge.v2.x - closestEdge.v1.x,
        y: closestEdge.v2.y - closestEdge.v1.y,
      };
      const edgeLength = Math.sqrt(edge.x ** 2 + edge.y ** 2);
      edge.x /= edgeLength;
      edge.y /= edgeLength;
      const normal = { x: -edge.y, y: edge.x };
      const center = this._getPolygonCenter(vertices);
      const toCenter = {
        x: center.x - closestPoint.x,
        y: center.y - closestPoint.y,
      };
      if (normal.x * toCenter.x + normal.y * toCenter.y < 0) {
        normal.x *= -1;
        normal.y *= -1;
      }
      const dot = particle.vx * normal.x + particle.vy * normal.y;
      particle.vx -= 2 * dot * normal.x;
      particle.vy -= 2 * dot * normal.y;
      particle.vx *= particle.restitution;
      particle.vy *= particle.restitution;
      const penetration = particle.radius - minDist;
      particle.x += normal.x * penetration;
      particle.y += normal.y * penetration;
    }
  }
  _closestPointOnSegment(px, py, v1, v2) {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    if (dx === 0 && dy === 0) {
      return { x: v1.x, y: v1.y };
    }
    const t = Math.max(
      0,
      Math.min(1, ((px - v1.x) * dx + (py - v1.y) * dy) / (dx * dx + dy * dy)),
    );
    return {
      x: v1.x + t * dx,
      y: v1.y + t * dy,
    };
  }
  _getPolygonCenter(vertices) {
    let x = 0,
      y = 0;
    vertices.forEach((v) => {
      x += v.x;
      y += v.y;
    });
    return { x: x / vertices.length, y: y / vertices.length };
  }
  _applyContainerProperties(particle, container) {
    Object.entries(container.properties).forEach(([key, value]) => {
      if (typeof value === "function") {
        particle[key] = value(particle[key], particle);
      } else {
        particle[key] = value;
      }
    });
  }
  _getRandomPositionInContainer(container) {
    const bounds = container.bounds;
    let attempts = 0;
    while (attempts < 100) {
      const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      const y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
      if (this._pointInPolygon(x, y, container.vertices)) {
        return { x, y };
      }
      attempts++;
    }
    return null;
  }
  _destroyParticle(particle, index) {
    particle.active = false;
    particle.sprite.visible = false;
    this.propertyContainers.forEach((container) => {
      container.affectedParticles.delete(particle);
    });
    this.particles.splice(index, 1);
    this.activeParticles--;
    this.particlePool.push(particle);
  }
  _drawDebug() {
    if (!this.debugGraphics) return;
    this.debugGraphics.clear();
    this.containers.forEach((container, name) => {
      this.debugGraphics.lineStyle(
        2,
        this._getContainerColor(container.type),
        0.5,
      );
      if (container.vertices.length > 0) {
        this.debugGraphics.moveTo(
          container.vertices[0].x,
          container.vertices[0].y,
        );
        container.vertices.forEach((v, i) => {
          if (i > 0) this.debugGraphics.lineTo(v.x, v.y);
        });
        this.debugGraphics.closePath();
      }
    });
    if (this.config.useSpatialHash) {
      this.debugGraphics.lineStyle(1, 0x333333, 0.2);
      this.spatialHash.drawGrid(this.debugGraphics);
    }
  }
  _getContainerColor(type) {
    switch (type) {
      case "main":
        return 0x0000ff;
      case "spawn":
        return 0x00ff00;
      case "death":
        return 0xff0000;
      case "property":
        return 0xffff00;
      default:
        return 0xffffff;
    }
  }
  set debug(value) {
    this.config.debug = Boolean(value);
    if (this.config.debug && !this.debugGraphics) {
      this.debugGraphics = new PIXI.Graphics();
      this.addChild(this.debugGraphics);
    } else if (!this.config.debug && this.debugGraphics) {
      this.debugGraphics.visible = false;
    } else if (this.debugGraphics) {
      this.debugGraphics.visible = this.config.debug;
    }
  }
  get debug() {
    return this.config.debug;
  }
  setGravity(x, y) {
    this.config.gravity.x = x;
    this.config.gravity.y = y;
  }
  setFriction(value) {
    this.config.friction = Math.max(0, Math.min(1, value));
  }
  setRestitution(value) {
    this.config.restitution = Math.max(0, Math.min(1, value));
  }
  clearParticles() {
    this.particles.forEach((particle) => {
      if (particle.sprite) {
        particle.sprite.visible = false;
      }
      particle.active = false;
      this.particlePool.push(particle);
    });
    this.particles = [];
    this.activeParticles = 0;
    this.propertyContainers.forEach((container) => {
      container.affectedParticles.clear();
    });
  }
  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
    this._lastTime = performance.now();
  }
  getSerializableMethods() {
    const methods = {};
    if (this.config.gravity.x !== 0 || this.config.gravity.y !== 0.1) {
      methods.setGravity =
        "setGravity(" +
        this.config.gravity.x +
        ", " +
        this.config.gravity.y +
        ")";
    }
    if (this.config.friction !== 0.99) {
      methods.setFriction = "setFriction(" + this.config.friction + ")";
    }
    if (this.config.restitution !== 0.8) {
      methods.setRestitution =
        "setRestitution(" + this.config.restitution + ")";
    }
    if (this.config.debug) {
      methods.debug = "debug = true";
    }
    if (this.mainContainer) {
      methods.mainContainer = "setMainContainer()";
    }
    if (this.spawnContainer) {
      methods.spawnContainer =
        "setSpawnContainer(, " +
        JSON.stringify(this.spawnContainer.config) +
        ")";
    }
    if (this.deathContainer) {
      methods.deathContainer = "setDeathContainer()";
    }
    if (this.propertyContainers.length > 0) {
      methods.propertyContainers = "propertyContainers";
    }
    return methods;
  }
  destroy() {
    if (typeof app !== "undefined" && app.ticker) {
      app.ticker.remove(this.update, this);
    } else if (this._useRAF) {
      this._useRAF = false;
    }
    this.particles.forEach((p) => {
      if (p.sprite) p.sprite.destroy();
    });
    this.textureCache.forEach((texture) => texture.destroy());
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
    }
    super.destroy();
  }
};
class Particle {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = radius;
    this.mass = 1;
    this.restitution = 0.8;
    this.active = true;
    this.sprite = null;
    this.properties = {};
  }
  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.active = true;
    this.sprite.visible = true;
    this.properties = {};
  }
}
class SpatialHash {
  constructor(cellSize) {
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
  drawGrid(graphics) {
    this.grid.forEach((particles, key) => {
      const [cellX, cellY] = key.split(",").map(Number);
      graphics.drawRect(
        cellX * this.cellSize,
        cellY * this.cellSize,
        this.cellSize,
        this.cellSize,
      );
    });
  }
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ParticleSystem, Particle, SpatialHash };
}
PixiJSEdu.SimplePNG = class SimplePNG extends PIXI.Container {
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
          en: "Scales the element in both directions",
          de: "Skaliert das Element in beide Richtungen",
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
    },
  };
  constructor(pngContent) {
    super();
    this._pngContent = pngContent;
    this._x = 0;
    this._y = 0;
    this._visible = true;
    this._alpha = 1.0;
    this._scale = { x: 1, y: 1 };
    this._originalDimensions = null;
    this._clickHandler = null;
    this.borderGraphics = new PIXI.Graphics();
    this.addChild(this.borderGraphics);
    this.sprite = null;
    this.gruppe = new PIXI.Graphics();
    this.addChild(this.gruppe);
    Board[INSTANCE_KEY].addChild(this.gruppe);
    this._loadPNGImage();
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
        const texture = PIXI.Texture.from(img, { resolution: 1 });
        if (this.sprite) {
          if (this.sprite.parent) {
            this.sprite.parent.removeChild(this.sprite);
          }
          this.sprite.destroy();
        }
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.x = this._x;
        this.sprite.y = this._y;
        this.sprite.scale.set(this._scale.x, this._scale.y);
        this.sprite.alpha = this._alpha;
        this.sprite.eventMode = "static";
        this.sprite.cursor = "pointer";
        this.sprite.on("pointerdown", this._handleClick.bind(this));
        this._updateBorder();
        this.gruppe.addChild(this.sprite);
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
  _updateBorder() {
    if (!this.sprite) return;
    const width = this.sprite.width;
    const height = this.sprite.height;
    if (width === 0 || height === 0) return;
    this.borderGraphics.clear();
    this.borderGraphics.lineStyle(1, 0x000000, 0.2);
    this.borderGraphics.drawRect(this._x, this._y, width, height);
  }
  _handleClick(event) {
    if (this._clickHandler && typeof this._clickHandler === "function") {
      this._clickHandler(event);
    }
  }
  onClick(handler) {
    if (typeof handler !== "function") {
      console.error("onClick erwartet eine Funktion als Parameter");
      return;
    }
    this._clickHandler = handler;
    if (this.sprite) {
      this.sprite.eventMode = "static";
      this.sprite.cursor = "pointer";
    }
  }
  set x(value) {
    this._x = value;
    if (this.sprite) this.sprite.x = value;
    this._updateBorder();
  }
  get x() {
    return this._x;
  }
  set y(value) {
    this._y = value;
    if (this.sprite) this.sprite.y = value;
    this._updateBorder();
  }
  get y() {
    return this._y;
  }
  set visible(value) {
    this._visible = value;
    if (this.sprite) this.sprite.visible = value;
    this.alpha = this._visible ? this._alpha : 0;
  }
  get visible() {
    return this._visible;
  }
  set alpha(value) {
    this._alpha = Math.max(0, Math.min(1, value));
    if (this.sprite) this.sprite.alpha = this._alpha;
    super.alpha = this._alpha;
  }
  get alpha() {
    return this._alpha;
  }
  setScale(scaleX, scaleY) {
    this._scale.x = scaleX;
    this._scale.y = scaleY;
    if (this.sprite) {
      this.sprite.scale.set(scaleX, scaleY);
      this._updateBorder();
    }
  }
  getOriginalWidth() {
    return this._originalDimensions ? this._originalDimensions.width : 0;
  }
  getOriginalHeight() {
    return this._originalDimensions ? this._originalDimensions.height : 0;
  }
  getCurrentWidth() {
    return this.sprite ? this.sprite.width : 0;
  }
  getCurrentHeight() {
    return this.sprite ? this.sprite.height : 0;
  }
  destroy() {
    if (this.sprite) {
      this.sprite.off("pointerdown", this._handleClick);
      if (this.sprite.parent) {
        this.sprite.parent.removeChild(this.sprite);
      }
      this.sprite.destroy();
    }
    super.destroy();
  }
};
PixiJSEdu.Model3D = class Model3D extends PIXI.Container {
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
          en: "Defines whether the object is visible or invisible",
          de: "Legt fest, ob das Objekt sichtbar oder unsichtbar ist",
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
    },
  };

  constructor(url, width = 600, height = 400) {
    super();
    this._url = url;
    this._iframeWidth = width;
    this._iframeHeight = height;
    this._visible = true;
    this._messageCallback = null;
    this._boundMessageHandler = this._handleMessage.bind(this);

    this._iframe = this._createIframe();
    window.addEventListener("message", this._boundMessageHandler);
    Board[INSTANCE_KEY].addChild(this);
  }

  _createIframe() {
    const iframe = document.createElement("iframe");
    iframe.src = this._url;
    iframe.style.position = "absolute";
    iframe.style.left = this.x + "px";
    iframe.style.top = this.y + "px";
    iframe.style.width = this._iframeWidth + "px";
    iframe.style.height = this._iframeHeight + "px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.setAttribute("scrolling", "no");

    const uiContainer =
      document.getElementById("pixi-ui-overlay") ||
      this._createUiContainer();
    uiContainer.appendChild(iframe);
    return iframe;
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

  _handleMessage(event) {
    if (!this._messageCallback) return;
    const data = event.data;
    if (data && data.type === "sceneEditor") {
      this._messageCallback(data);
    }
  }

  _postMessage(payload) {
    if (this._iframe && this._iframe.contentWindow) {
      this._iframe.contentWindow.postMessage(payload, "*");
    }
  }

  set x(value) {
    super.x = value;
    if (this._iframe) this._iframe.style.left = value + "px";
  }

  get x() {
    return super.x;
  }

  set y(value) {
    super.y = value;
    if (this._iframe) this._iframe.style.top = value + "px";
  }

  get y() {
    return super.y;
  }

  set width(value) {
    this._iframeWidth = value;
    if (this._iframe) this._iframe.style.width = value + "px";
  }

  get width() {
    return this._iframeWidth;
  }

  set height(value) {
    this._iframeHeight = value;
    if (this._iframe) this._iframe.style.height = value + "px";
  }

  get height() {
    return this._iframeHeight;
  }

  set visible(value) {
    this._visible = value;
    super.visible = value;
    if (this._iframe)
      this._iframe.style.display = value ? "block" : "none";
  }

  get visible() {
    return this._visible;
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

  onMessage(callback) {
    this._messageCallback = callback;
  }

  destroy() {
    window.removeEventListener("message", this._boundMessageHandler);
    if (this._iframe && this._iframe.parentNode) {
      this._iframe.parentNode.removeChild(this._iframe);
    }
    super.destroy();
  }
};
