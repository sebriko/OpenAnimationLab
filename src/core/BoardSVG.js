/**
 * BoardSVG.js – SVG.js-basierter Ersatz für die PixiJS Board-Klasse
 * Vollständig kompatibel mit dem SvgJSEdu.js Framework
 *
 * Wird als "BoardSVG" definiert (nicht "Board"), um Namenskonflikte mit
 * der PixiJS Board-Klasse zu vermeiden. Der Renderer-Selector sorgt
 * dafür, dass beim Ausführen von User-Code die richtige Klasse als
 * globales "Board" zur Verfügung steht.
 *
 * Verwendet SVG.js 3.x statt PIXI.js / Canvas.
 * Behält die gleiche öffentliche API bei, damit bestehender Code
 * (PixiJSEdu-Animationen) mit minimalen Änderungen weiterläuft.
 *
 * @license MIT
 * @author Sebastian Rikowski
 * @version 2.0.0 (SVG.js-Migration)
 *
 * Abhängigkeit: SVG.js 3.x (https://svgjs.dev)
 * <script src="https://cdn.jsdelivr.net/npm/@svgjs/svg.js@3.2.4/dist/svg.min.js"></script>
 */

// svgRoot is declared with var to allow safe re-declaration across scripts
// and to match the hoisting behaviour expected by SvgJSEdu.js.
var svgRoot;

globalThis.INSTANCE_KEY ??= Symbol("MyClassInstance");
var INSTANCE_KEY = globalThis.INSTANCE_KEY;

class BoardSVG extends BoardBase {
  // ============================================================================
  // serializationMap – für den OAE-Editor
  // ============================================================================

  static serializationMap = {
    description: {
      de: "Zeichenfläche für die Animation (Board – SVG-Renderer)",
      en: "Drawing area for the animation (Board – SVG renderer)",
    },
    weblink: {
      de: "https://www.educational-animation.org",
      en: "https://www.educational-animation.org",
    },
    example: "let board = new Board(1280, 720, 0xFFFFFF);",
    constructor: {
      width: {
        name: "width",
        info: {
          en: "Logical width of the board in pixels",
          de: "Logische Breite des Boards in Pixeln",
        },
      },
      height: {
        name: "height",
        info: {
          en: "Logical height of the board in pixels",
          de: "Logische Höhe des Boards in Pixeln",
        },
      },
      backgroundColor: {
        name: "backgroundColor",
        info: {
          en: "Background color in hex format (e.g. 0xFFFFFF)",
          de: "Hintergrundfarbe im Hex-Format (z.B. 0xFFFFFF)",
        },
      },
    },
    setter: {
      backgroundColor: {
        name: "backgroundColor",
        info: {
          en: "Background color of the board in hexadecimal format",
          de: "Hintergrundfarbe des Boards im Hexadezimalformat",
        },
        example: "backgroundColor = 0xFFFFFF",
      },
    },
    methods: {
      addChild: {
        example: "addChild(myElement)",
        info: {
          en: "Adds an SvgJSEdu element to the board",
          de: "Fügt ein SvgJSEdu-Element zum Board hinzu",
        },
      },
      removeChild: {
        example: "removeChild(myElement)",
        info: {
          en: "Removes an element from the board",
          de: "Entfernt ein Element vom Board",
        },
      },
      setFramerate: {
        example: "setFramerate(30)",
        info: {
          en: "Sets the animation framerate (for ticker-based animations)",
          de: "Setzt die Animations-Framerate (für Ticker-basierte Animationen)",
        },
      },
      onMouseDown: {
        example: "onMouseDown(handler)",
        info: {
          en: "Registers a global mouse-down handler on the board",
          de: "Registriert einen globalen Mouse-Down-Handler auf dem Board",
        },
      },
      onMouseUp: {
        example: "onMouseUp(handler)",
        info: {
          en: "Registers a global mouse-up handler on the board",
          de: "Registriert einen globalen Mouse-Up-Handler auf dem Board",
        },
      },
      onMouseMove: {
        example: "onMouseMove(handler)",
        info: {
          en: "Registers a global mouse-move handler on the board",
          de: "Registriert einen globalen Mouse-Move-Handler auf dem Board",
        },
      },
    },
  };

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor(width, height, backgroundColor = 0xffffff) {
    const canvasContainer = document.getElementById("canvas-container");
    if (canvasContainer) {
      canvasContainer.style.display = "none";
      canvasContainer.style.visibility = "hidden";
    }

    super();
    this._initBase(width, height, backgroundColor);
    this._backgroundColor = backgroundColor;

    // BoardSVG-specific properties
    this._tickerCallbacks = [];
    this._tickerRunning = false;
    this._tickerAnimFrameId = null;
    this._lastTickTime = 0;

    // Register singleton under the shared key so both BoardSVG and the
    // legacy Board alias resolve to the same instance.
    BoardSVG[INSTANCE_KEY] = this;
    Board[INSTANCE_KEY] = this;

    this.prepareCanvasContainer();
    this.createPreloader();
    this._init();

    setTimeout(() => {
      this.showPreview();
      this.resizeCanvas();
      setTimeout(() => {
        this.hidePreloader();
      }, 500);
    }, 50);
  }

  // ============================================================================
  // Static Methods
  // ============================================================================

  static getInstance() {
    return BoardSVG[INSTANCE_KEY];
  }

  // ============================================================================
  // Initialisation
  // ============================================================================

  _init() {
    if (!this.canvasContainer) {
      console.error("canvas-container Element nicht gefunden.");
      return;
    }

    const existingSvgs = this.canvasContainer.querySelectorAll("svg");
    existingSvgs.forEach((svg) => svg.remove());
    const existingCanvases = this.canvasContainer.querySelectorAll("canvas");
    existingCanvases.forEach((c) => c.remove());

    if (window.app) {
      try {
        if (window.app.ticker) window.app.ticker.stop();
        window.app.destroy(true, {
          children: true,
          texture: true,
          baseTexture: true,
        });
      } catch (e) {
        console.warn("Fehler beim Zerstören der alten PIXI App:", e);
      }
      window.app = null;
    }

    svgRoot = SVG().addTo("#canvas-container").size(this.width, this.height);
    svgRoot.attr({
      style: "display: block;",
      preserveAspectRatio: "xMidYMid meet",
    });

    const svgEl = svgRoot.node;
    svgEl.setAttribute("draggable", "false");
    svgEl.style.touchAction = "none";
    svgEl.style.userSelect = "none";
    svgEl.style.webkitUserDrag = "none";
    svgEl.style.imageRendering = "auto";

    svgEl.addEventListener("dragstart", (e) => {
      e.preventDefault();
      return false;
    });
    svgEl.addEventListener("selectstart", (e) => {
      e.preventDefault();
      return false;
    });
    svgEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    this._bgRect = svgRoot
      .rect(this.width, this.height)
      .fill(this._colorToHex(this._backgroundColor));

    this._mainGroup = svgRoot.group();

    // ClipPath keeps all child elements within the logical board bounds.
    this._worldClip = svgRoot.clip().add(svgRoot.rect(this.width, this.height));
    this._mainGroup.clipWith(this._worldClip);

    this._setupStageInteractivity();

    this._boundResizeHandler = () => this.resizeCanvas();
    window.addEventListener("resize", this._boundResizeHandler);
  }

  // ============================================================================
  // SVG-Root Accessor
  // ============================================================================

  get svgRoot() {
    return svgRoot;
  }

  get mainGroup() {
    return this._mainGroup;
  }

  // ============================================================================
  // Background Colour
  // ============================================================================

  set backgroundColor(color) {
    this._backgroundColor = color;
    if (this._bgRect) {
      this._bgRect.fill(this._colorToHex(color));
    }
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  // ============================================================================
  // Child Management
  // ============================================================================

  addChild(element) {
    if (
      typeof HtmlSvgEdu !== "undefined" &&
      element instanceof HtmlSvgEdu.Component
    ) {
      this.UIElements.push(element);
      this.allChildren.push(element);
      return element;
    }

    if (element && element._group) {
      this._mainGroup.add(element._group);
      if (!this.allChildren.includes(element)) {
        this.allChildren.push(element);
      }
      return element;
    }

    console.warn("addChild: Unbekannter Element-Typ", element);
    return element;
  }

  removeChild(element) {
    if (!element) return;

    if (element._group && element._group.parent() === this._mainGroup) {
      element._group.remove();
    }

    const idx = this.allChildren.indexOf(element);
    if (idx > -1) this.allChildren.splice(idx, 1);

    const uiIdx = this.UIElements.indexOf(element);
    if (uiIdx > -1) this.UIElements.splice(uiIdx, 1);

    if (element.destroy && typeof element.destroy === "function") {
      try {
        element.destroy();
      } catch (e) {
        console.warn("Fehler beim Zerstören des Elements:", e);
      }
    }
  }

  // ============================================================================
  // Global Pointer Events
  // ============================================================================

  _setupStageInteractivity() {
    const svgEl = svgRoot.node;

    svgEl.addEventListener("pointerdown", (e) => {
      this._handleGlobalEvent("mousedown", e);
    });

    svgEl.addEventListener("pointerup", (e) => {
      this._handleGlobalEvent("mouseup", e);
    });

    svgEl.addEventListener("pointermove", (e) => {
      this._handleGlobalEvent("mousemove", e);
    });
  }

  _handleGlobalEvent(eventType, domEvent) {
    const pos = this._getPointerPos(domEvent);
    const mouseEvent = {
      type: eventType,
      x: pos.x,
      y: pos.y,
      globalX: pos.x,
      globalY: pos.y,
      button: domEvent.button || 0,
      buttons: domEvent.buttons || 0,
      ctrlKey: domEvent.ctrlKey || false,
      shiftKey: domEvent.shiftKey || false,
      altKey: domEvent.altKey || false,
      originalEvent: domEvent,
    };

    for (const listener of this.globalMouseListeners) {
      if (listener.type === eventType) {
        try {
          listener.callback(mouseEvent);
        } catch (error) {
          console.error(`Fehler im globalen ${eventType}-Handler:`, error);
        }
      }
    }
  }

  _getPointerPos(domEvent) {
    const svgEl = svgRoot.node;
    const pt = svgEl.createSVGPoint();
    if (domEvent.touches && domEvent.touches.length > 0) {
      pt.x = domEvent.touches[0].clientX;
      pt.y = domEvent.touches[0].clientY;
    } else {
      pt.x = domEvent.clientX;
      pt.y = domEvent.clientY;
    }
    const ctm = svgEl.getScreenCTM();
    if (ctm) {
      return pt.matrixTransform(ctm.inverse());
    }
    return { x: pt.x, y: pt.y };
  }

  // ============================================================================
  // Resize
  // ============================================================================

  performResize() {
    const preview = document.getElementById("preview");

    if (!this.canvasContainer || !preview || !svgRoot) {
      console.warn("Missing elements for resize");
      return;
    }

    const availableSpace = this.getAvailableSpace();

    const scaleX = availableSpace.width / this.width;
    const scaleY = availableSpace.height / this.height;
    let scale = Math.min(scaleX, scaleY);

    if (availableSpace.isMobile && scale < 0.5) {
      this.scaleValue = Math.max(scale, 0.1);
    } else {
      this.scaleValue = scale;
    }

    const scaledWidth = Math.floor(this.width * this.scaleValue);
    const scaledHeight = Math.floor(this.height * this.scaleValue);

    requestAnimationFrame(() => {
      document.body.classList.add("resizing-canvas");

      svgRoot.size(scaledWidth, scaledHeight);
      svgRoot.viewbox(0, 0, this.width, this.height);

      const previewRect = preview.getBoundingClientRect();
      const leftPos = Math.max(0, (previewRect.width - scaledWidth) / 2);
      const topPos = Math.max(0, (previewRect.height - scaledHeight) / 2);

      Object.assign(this.canvasContainer.style, {
        position: "absolute",
        width: scaledWidth + "px",
        height: scaledHeight + "px",
        left: leftPos + "px",
        top: topPos + "px",
        transform: "none",
        overflow: "hidden",
        touchAction: availableSpace.isMobile ? "none" : "auto",
        userSelect: "none",
        WebkitUserSelect: "none",
      });

      if (
        typeof HtmlSvgEdu !== "undefined" &&
        HtmlSvgEdu.Component &&
        HtmlSvgEdu.Component.updateContainerScale
      ) {
        HtmlSvgEdu.Component.updateContainerScale(this.scaleValue);
      }

      setTimeout(() => {
        document.body.classList.remove("resizing-canvas");
      }, 100);
    });

    if (availableSpace.isMobile) {
      this.adjustMobileViewport();
    }
  }

  // ============================================================================
  // World Mask
  // ============================================================================

  updateWorldMask() {
    if (this._worldClip) {
      this._worldClip.clear();
      this._worldClip.add(svgRoot.rect(this.width, this.height));
    }
  }

  setMaskEnabled(enabled) {
    if (this._mainGroup) {
      if (enabled && this._worldClip) {
        this._mainGroup.clipWith(this._worldClip);
      } else {
        this._mainGroup.unclip();
      }
    }
  }

  // ============================================================================
  // Ticker Loop
  // ============================================================================

  /**
   * Registriert einen Ticker-Callback (analog zu PIXI app.ticker.add).
   * Der Callback erhält den Delta-Wert (in Frames bei 60fps Basis).
   */
  addTickerCallback(callback) {
    if (typeof callback !== "function") return;
    this._tickerCallbacks.push(callback);
    if (!this._tickerRunning) {
      this._startTicker();
    }
  }

  removeTickerCallback(callback) {
    const idx = this._tickerCallbacks.indexOf(callback);
    if (idx > -1) this._tickerCallbacks.splice(idx, 1);
    if (this._tickerCallbacks.length === 0) {
      this._stopTicker();
    }
  }

  _startTicker() {
    if (this._tickerRunning) return;
    this._tickerRunning = true;
    this._lastTickTime = performance.now();

    const tick = (now) => {
      if (!this._tickerRunning) return;

      const elapsed = now - this._lastTickTime;
      const targetInterval = this.currentFPS > 0 ? 1000 / this.currentFPS : 0;

      if (targetInterval === 0 || elapsed >= targetInterval) {
        const delta = elapsed / (1000 / 60);
        this._lastTickTime = now;

        for (let i = 0; i < this._tickerCallbacks.length; i++) {
          try {
            this._tickerCallbacks[i](delta);
          } catch (err) {
            console.error("Fehler im Ticker-Callback:", err);
          }
        }
      }

      this._tickerAnimFrameId = requestAnimationFrame(tick);
    };

    this._tickerAnimFrameId = requestAnimationFrame(tick);
  }

  _stopTicker() {
    this._tickerRunning = false;
    if (this._tickerAnimFrameId) {
      cancelAnimationFrame(this._tickerAnimFrameId);
      this._tickerAnimFrameId = null;
    }
  }

  // ============================================================================
  // Performance Stats
  // ============================================================================

  getPerformanceStats() {
    return {
      fps: this.currentFPS,
      objectCount: this.allChildren.length,
      listenerCount: this.globalMouseListeners.length,
      renderRequests: 0,
      resolution: 1,
      devicePixelRatio: window.devicePixelRatio || 1,
      memoryUsage: performance.memory
        ? {
            used:
              (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + " MB",
            total:
              (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + " MB",
          }
        : "Not available",
    };
  }

  // ============================================================================
  // Destroy
  // ============================================================================

  destroy() {
    this._stopTicker();

    if (this._boundResizeHandler) {
      window.removeEventListener("resize", this._boundResizeHandler);
      this._boundResizeHandler = null;
    }

    if (this.preloader && typeof this.preloader.destroy === "function") {
      this.preloader.destroy();
      this.preloader = null;
    }
    if (this.fallbackPreloader && this.fallbackPreloader.parentNode) {
      this.fallbackPreloader.parentNode.removeChild(this.fallbackPreloader);
      this.fallbackPreloader = null;
    }

    const childrenCopy = [...this.allChildren];
    childrenCopy.forEach((child) => {
      if (child && child.destroy && typeof child.destroy === "function") {
        try {
          child.destroy();
        } catch (e) {
          console.warn("Fehler beim Zerstören eines Elements:", e);
        }
      }
    });

    this.allChildren = [];
    this.UIElements = [];
    this.globalMouseListeners = [];

    if (svgRoot) {
      svgRoot.remove();
      svgRoot = null;
    }

    if (this.canvasContainer) {
      while (this.canvasContainer.firstChild) {
        this.canvasContainer.removeChild(this.canvasContainer.firstChild);
      }
      this.canvasContainer.style.visibility = "hidden";
    }

    if (BoardSVG[INSTANCE_KEY] === this) {
      delete BoardSVG[INSTANCE_KEY];
    }

    if (typeof Board !== "undefined" && Board[INSTANCE_KEY] === this) {
      delete Board[INSTANCE_KEY];
    }

    if (window.board === this) {
      window.board = null;
    }
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  _colorToHex(color) {
    if (typeof color === "string") return color;
    return "#" + ("000000" + (color & 0xffffff).toString(16)).slice(-6);
  }
}

if (typeof SvgJSEdu !== "undefined") {
  SvgJSEdu.BoardGUI = BoardSVG;
}
