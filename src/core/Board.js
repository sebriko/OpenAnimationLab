globalThis.INSTANCE_KEY ??= Symbol("MyClassInstance");
var INSTANCE_KEY = globalThis.INSTANCE_KEY;

class Board {
  constructor(width, height, backgroundColor = 0xffffff) {
    const canvasContainer = document.getElementById("canvas-container");
    if (canvasContainer) {
      canvasContainer.style.display = "none";
      canvasContainer.style.visibility = "hidden";
    }

    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
    this.scaleValue = null;
    this.currentFPS = 60;

    this.allChildren = [];
    this.UIElements = [];

    // Rendering state used by requestRender() to coalesce RAF calls
    this.isRendering = false;
    this.pendingRenderRequests = 0;
    this.resizeTimeout = null;

    this.mouseListeners = new Map();
    this.globalMouseListeners = [];
    this.isDragging = false;
    this.dragTarget = null;
    this.dragOffset = { x: 0, y: 0 };
    this.dragConstraints = new Map();

    this.enableDragSmoothing = false;
    this.dragSmoothingFactor = 1.0;

    this.lastDragUpdate = 0;
    this.dragThrottleMs = 16; // ~60 fps

    this.dragRenderPending = false;

    this.isFullscreen = false;
    this.fullscreenObserver = null;

    this.maintenanceInterval = null;
    this.lastMaintenanceTime = 0;
    this.maintenanceIntervalMs = 30000;

    this.performanceMonitor = {
      objectCount: 0,
      listenerCount: 0,
      renderCount: 0,
      lastFPS: 60,
    };

    this.objectPool = new Map();
    this.weakObjectRefs = new WeakMap();

    this.isMobile = this.detectMobile();

    this.devicePixelRatio = window.devicePixelRatio || 1;
    // Cap at 2x: sufficient for sharp rendering while keeping GPU load reasonable
    this.maxResolution = 2;
    this.dynamicResolution = true;

    Board[INSTANCE_KEY] = this;

    this.prepareCanvasContainer();

    this.createPreloader();
    this.init();
    this.createGrid(10, 8, this.width, this.height);

    setTimeout(() => {
      this.showPreview();
      this.resizeCanvas();
      this.startAutoMaintenance();
      setTimeout(() => {
        this.hidePreloader();
      }, 500);
    }, 50);
  }

  detectMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobile =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase(),
      );
    const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 600;
    return isMobile || isSmallScreen;
  }

  calculateOptimalResolution() {
    let resolution = this.devicePixelRatio;

    if (this.isMobile) {
      resolution = Math.min(resolution, 2);
    }

    const screenSize = window.innerWidth * window.innerHeight;
    if (screenSize > 2560 * 1440) {
      // 4K+: 2x is sufficient and avoids unnecessary GPU load
      resolution = Math.min(resolution, 2);
    } else if (screenSize > 1920 * 1080) {
      resolution = Math.min(resolution, 2.5);
    }

    // Drop resolution when frame rate is critically low
    if (this.dynamicResolution && this.performanceMonitor.lastFPS < 30) {
      resolution = Math.max(1, resolution * 0.75);
    }

    // Round to half-steps for consistent results; never below 1
    resolution = Math.max(1, Math.round(resolution * 2) / 2);

    return resolution;
  }

  initWithPreloader() {
    this.init()
      .then(() => {
        this.createGrid(10, 8, this.width, this.height);

        requestAnimationFrame(() => {
          this.showPreview();
          this.resizeCanvas();
          this.startAutoMaintenance();

          setTimeout(() => {
            this.hidePreloader();
          }, 100);
        });
      })
      .catch((error) => {
        console.error("Board initialization error:", error);
        this.hidePreloader();
      });
  }

  startAutoMaintenance() {
    this.maintenanceInterval = setInterval(() => {
      this.performMaintenance();
    }, this.maintenanceIntervalMs);

    if (window.app && window.app.ticker) {
      window.app.ticker.add(() => {
        this.monitorPerformance();
      });
    }
  }

  monitorPerformance() {
    try {
      if (!window.app || !window.app.ticker) return;

      const currentFPS = window.app.ticker.FPS;
      this.performanceMonitor.lastFPS = currentFPS;

      // Only trigger emergency maintenance at critically low FPS and not too frequently
      if (currentFPS < 20 && Date.now() - this.lastMaintenanceTime > 5000) {
        console.warn(
          "Low FPS detected:",
          Math.round(currentFPS),
          "Running emergency maintenance",
        );
        this.performMaintenance(true);
      }
    } catch (error) {
      console.error("Error in performance monitoring:", error);
    }
  }

  performMaintenance(emergency = false) {
    const startTime = performance.now();

    const cleanedListeners = this.cleanupEventListeners();
    const cleanedObjects = this.cleanupOrphanedObjects();

    if (this.pendingRenderRequests > 10) {
      this.pendingRenderRequests = 0;
      this.isRendering = false;
    }

    if (window.app && window.app.renderer) {
      if (emergency && PIXI.Assets) {
        const cache = PIXI.Assets.cache;
        if (cache && cache.reset) {
          cache.reset();
        }
      } else if (emergency && PIXI.Texture) {
        const textureCache = PIXI.Texture.EMPTY._textureCache || {};
        for (const key in textureCache) {
          if (textureCache[key] && textureCache[key].destroy) {
            try {
              textureCache[key].destroy(true);
            } catch (e) {
              // Texture may already be destroyed
            }
          }
        }
      }

      // Run WebGL garbage collection
      if (window.app.renderer.textureGC) {
        window.app.renderer.textureGC.run();
      } else if (window.app.renderer.texture) {
        window.app.renderer.texture.gc.run();
      }
    }

    this.cleanupObjectPool();

    this.lastMaintenanceTime = Date.now();
    this.performanceMonitor.objectCount = this.allChildren.length;
    this.performanceMonitor.listenerCount = this.mouseListeners.size;
  }

  cleanupEventListeners() {
    let cleanedCount = 0;
    const objectsToRemove = [];

    this.mouseListeners.forEach((listeners, child) => {
      if (
        !child ||
        child.destroyed === true ||
        (child.parent === null && !child.interactive)
      ) {
        objectsToRemove.push(child);
        cleanedCount++;
      }
    });

    objectsToRemove.forEach((child) => {
      this.mouseListeners.delete(child);
      this.dragConstraints.delete(child);

      if (child && child.removeAllListeners) {
        try {
          child.removeAllListeners();
        } catch (e) {
          // Object may already be destroyed
        }
      }
    });

    this.globalMouseListeners = this.globalMouseListeners.filter((listener) => {
      return listener && listener.callback;
    });

    return cleanedCount;
  }

  cleanupOrphanedObjects() {
    let cleanedCount = 0;

    this.allChildren = this.allChildren.filter((child) => {
      if (!child || child.destroyed === true) {
        cleanedCount++;
        if (child && !child.destroyed) {
          this.destroyChild(child);
        }
        return false;
      }
      return true;
    });

    this.UIElements = this.UIElements.filter((child) => {
      return child && child.destroyed !== true;
    });

    return cleanedCount;
  }

  cleanupObjectPool() {
    this.objectPool.forEach((pool, type) => {
      // Keep at most 10 pooled objects per type to bound memory usage
      if (pool.length > 10) {
        const toRemove = pool.splice(10);
        toRemove.forEach((obj) => {
          if (obj && obj.destroy) {
            obj.destroy(true);
          }
        });
      }
    });
  }

  addChild(child) {
    if (child instanceof HtmlSvgEdu.Component) {
      this.UIElements.push(child);
      this.allChildren.push(child);
      this.requestRender();
      return child;
    }

    this.world.addChild(child);
    this.allChildren.push(child);

    this.enhanceObjectWithEventAPI(child);
    this.setupChildInteractivity(child);
    this.optimizeChildRenderQuality(child);
    this.requestRender();

    return child;
  }

  optimizeChildRenderQuality(child) {
    if (!child) return;

    if (child.texture && child.texture.baseTexture) {
      // LINEAR scale mode avoids pixelation when sprites are scaled up
      if (PIXI.SCALE_MODES && PIXI.SCALE_MODES.LINEAR !== undefined) {
        child.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
      } else {
        child.texture.baseTexture.scaleMode = 1; // LINEAR in older PIXI versions
      }

      if (PIXI.MIPMAP_MODES && PIXI.MIPMAP_MODES.POW2 !== undefined) {
        child.texture.baseTexture.mipmap = PIXI.MIPMAP_MODES.POW2;
      }
    }

    if (child instanceof PIXI.Graphics) {
      if (child.geometry && child.geometry.graphicsData) {
        child.geometry.graphicsData.forEach((data) => {
          if (data.shape && typeof data.shape.radius !== "undefined") {
            data.shape.segments = Math.max(128, data.shape.segments || 32);
          }
        });
      }

      // PIXI v8: disable batching to avoid quality loss with many Graphics objects
      if (child.context && child.context.batchMode !== undefined) {
        child.context.batchMode = "no-batch";
      }
    }

    if (child.children && child.children.length > 0) {
      child.children.forEach((subChild) => {
        this.optimizeChildRenderQuality(subChild);
      });
    }
  }

  destroyChild(child) {
    if (!child || child._destroyed) return;

    child._destroyed = true;

    this.mouseListeners.delete(child);
    this.dragConstraints.delete(child);

    const childIndex = this.allChildren.indexOf(child);
    if (childIndex > -1) {
      this.allChildren.splice(childIndex, 1);
    }

    const uiIndex = this.UIElements.indexOf(child);
    if (uiIndex > -1) {
      this.UIElements.splice(uiIndex, 1);
    }

    if (child.destroy && typeof child.destroy === "function") {
      try {
        child.destroy({
          children: true,
          texture: false, // Textures are shared; do not destroy them here
          baseTexture: false,
        });
      } catch (error) {
        console.warn("Error destroying child:", error);
      }
    }
  }

  removeChild(child) {
    if (!child) return;

    if (child.parent) {
      child.parent.removeChild(child);
    }

    this.destroyChild(child);
    this.requestRender();
  }

  setupChildInteractivity(child) {
    if (!child || child.destroyed) return;

    child.interactive = true;
    child.buttonMode = child.draggable === true;
    child.eventMode = "static";
    child.cursor = child.draggable === true ? "pointer" : "default";

    // Guard against registering duplicate listeners
    if (child._mouseEventsSetup) return;
    child._mouseEventsSetup = true;
    child.removeAllListeners();

    child.on("pointerover", (event) => {
      this.handleChildMouseEvent("mouseover", child, event);
    });

    child.on("pointerout", (event) => {
      this.handleChildMouseEvent("mouseout", child, event);
    });

    child.on("pointerdown", (event) => {
      this.handleChildMouseEvent("mousedown", child, event);
      if (child.draggable === true) {
        this.startDrag(child, event);
      }
    });

    child.on("pointerup", (event) => {
      this.handleChildMouseEvent("mouseup", child, event);
    });

    child.on("pointertap", (event) => {
      this.handleChildMouseEvent("click", child, event);
    });

    child.on("pointermove", (event) => {
      this.handleChildMouseEvent("mousemove", child, event);
    });
  }

  updateDragPosition(targetX, targetY) {
    if (!this.dragTarget || this.dragTarget.destroyed) {
      this.stopDrag();
      return;
    }

    const now = performance.now();

    if (now - this.lastDragUpdate >= this.dragThrottleMs) {
      this.lastDragUpdate = now;
      this.performDragUpdate(targetX, targetY);
    } else if (!this.dragRenderPending) {
      this.dragRenderPending = true;
      requestAnimationFrame(() => {
        if (this.isDragging && this.dragTarget && !this.dragTarget.destroyed) {
          this.performDragUpdate(targetX, targetY);
        }
        this.dragRenderPending = false;
      });
    }
  }

  stopDrag() {
    if (this.isDragging && this.dragTarget) {
      if (!this.dragTarget.destroyed) {
        this.handleChildMouseEvent("dragend", this.dragTarget, null);
      }

      this.isDragging = false;
      this.dragTarget = null;
      this.dragOffset = { x: 0, y: 0 };
      this.dragRenderPending = false;
      this.lastDragUpdate = 0;
    }
  }

  setupStageInteractivity() {
    app.stage.interactive = true;
    app.stage.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);

    let cachedMousePos = null;
    let lastCacheTime = 0;
    const cacheTimeout = 8; // ms; keeps position lookups cheap during drag

    const handlePointerMove = (event) => {
      if (this.isDragging && this.dragTarget && !this.dragTarget.destroyed) {
        const now = performance.now();

        if (!cachedMousePos || now - lastCacheTime > cacheTimeout) {
          cachedMousePos = event.data.getLocalPosition(this.dragTarget.parent);
          lastCacheTime = now;
        }

        const newX = cachedMousePos.x - this.dragOffset.x;
        const newY = cachedMousePos.y - this.dragOffset.y;

        this.updateDragPosition(newX, newY);
        this.handleChildMouseEvent("drag", this.dragTarget, event);
      }

      this.handleGlobalMouseEvent("mousemove", event);
    };

    app.stage.on("pointermove", handlePointerMove);

    app.stage.on("pointerup", (event) => {
      cachedMousePos = null;
      this.stopDrag();
      this.handleGlobalMouseEvent("mouseup", event);
    });

    app.stage.on("pointerdown", (event) => {
      this.handleGlobalMouseEvent("mousedown", event);
    });

    const stageCanvas = app.view || app.canvas;
    if (stageCanvas) {
      stageCanvas.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });
    }
  }

  requestRender() {
    if (this.isRendering || this.pendingRenderRequests > 3) {
      return;
    }

    this.pendingRenderRequests++;
    this.isRendering = true;

    requestAnimationFrame(() => {
      this.isRendering = false;
      this.pendingRenderRequests = Math.max(0, this.pendingRenderRequests - 1);

      if (this.pendingRenderRequests > 0) {
        this.requestRender();
      }
    });
  }

  destroy() {
    this.stopDrag();

    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = null;
    }

    window.removeEventListener("resize", this.resizeCanvas);

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
      this.destroyChild(child);
    });

    this.allChildren = [];
    this.UIElements = [];

    this.mouseListeners.clear();
    this.dragConstraints.clear();
    this.objectPool.clear();

    if (this.worldMask && !this.worldMask.destroyed) {
      this.worldMask.destroy();
      this.worldMask = null;
    }

    if (this.world && !this.world.destroyed) {
      this.world.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      });
      this.world = null;
    }

    if (window.app) {
      if (window.app.ticker) {
        window.app.ticker.stop();
      }

      if (window.app.stage) {
        while (window.app.stage.children.length > 0) {
          const child = window.app.stage.children[0];
          window.app.stage.removeChild(child);
          if (child.destroy) {
            child.destroy(true);
          }
        }
      }

      const appCanvas = window.app.view || window.app.canvas;
      if (appCanvas && appCanvas.parentNode) {
        appCanvas.parentNode.removeChild(appCanvas);
      }

      window.app.destroy(true, {
        children: true,
        texture: true,
        baseTexture: true,
      });

      window.app = null;
    }

    const canvasContainer = document.getElementById("canvas-container");
    if (canvasContainer) {
      while (canvasContainer.firstChild) {
        canvasContainer.removeChild(canvasContainer.firstChild);
      }
      canvasContainer.style.visibility = "hidden";
    }

    if (Board[INSTANCE_KEY] === this) {
      delete Board[INSTANCE_KEY];
    }

    if (window.board === this) {
      window.board = null;
    }
  }

  getPerformanceStats() {
    return {
      fps: this.performanceMonitor.lastFPS,
      objectCount: this.allChildren.length,
      listenerCount: this.mouseListeners.size,
      renderRequests: this.pendingRenderRequests,
      resolution: this.calculateOptimalResolution(),
      devicePixelRatio: this.devicePixelRatio,
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

  prepareCanvasContainer() {
    const canvasContainer = document.getElementById("canvas-container");
    if (!canvasContainer) {
      console.warn("Canvas container not found.");
      return;
    }

    canvasContainer.style.visibility = "hidden";
    canvasContainer.style.position = "absolute";
    canvasContainer.style.backgroundColor = "#F5F5F5";

    // CSS-level font/image smoothing for the container element
    canvasContainer.style.imageRendering = "auto";
    canvasContainer.style.WebkitFontSmoothing = "antialiased";
    canvasContainer.style.MozOsxFontSmoothing = "grayscale";

    // Set initial size to avoid flicker before the first resizeCanvas() call
    const preview = document.getElementById("preview");
    if (preview) {
      const previewRect = preview.getBoundingClientRect();
      const margin = this.isMobile ? 5 : 20;

      const scale = Math.min(
        (previewRect.width - margin * 2) / this.width,
        (previewRect.height - margin * 2) / this.height,
        1,
      );

      const scaledWidth = Math.floor(this.width * scale);
      const scaledHeight = Math.floor(this.height * scale);
      const leftPos = (previewRect.width - scaledWidth) / 2;
      const topPos = (previewRect.height - scaledHeight) / 2;

      Object.assign(canvasContainer.style, {
        width: scaledWidth + "px",
        height: scaledHeight + "px",
        left: leftPos + "px",
        top: topPos + "px",
        transition: "none", // No transitions while loading
      });
    }
  }

  createPreloader() {
    const canvasContainer = document.getElementById("canvas-container");
    if (!canvasContainer) {
      console.warn("Canvas container not found. Skipping preloader.");
      return;
    }

    setTimeout(() => {
      canvasContainer.style.display = "block";
      canvasContainer.style.visibility = "visible";
      canvasContainer.style.opacity = "0";
      canvasContainer.style.transition = "opacity 0.2s ease-in";

      requestAnimationFrame(() => {
        canvasContainer.style.opacity = "1";
      });
    }, 10);

    if (typeof HtmlSvgEdu !== "undefined" && HtmlSvgEdu.Preloader) {
      this.preloader = new HtmlSvgEdu.Preloader(
        "",       // no label text
        true,     // show spinner
        0xf5f5f5, // background
        0x666666, // spinner color
      );

      this.preloader.setDimensions(this.width, this.height);
      canvasContainer.appendChild(this.preloader._element);

      this.preloader._element.style.position = "absolute";
      this.preloader._element.style.top = "0";
      this.preloader._element.style.left = "0";
      this.preloader._element.style.width = "100%";
      this.preloader._element.style.height = "100%";
    } else {
      console.warn("HtmlSvgEdu.Preloader not found. Creating fallback preloader.");
      this.createFallbackPreloader();
    }
  }

  createFallbackPreloader() {
    const canvasContainer = document.getElementById("canvas-container");
    if (!canvasContainer) return;

    this.fallbackPreloader = document.createElement("div");
    this.fallbackPreloader.style.cssText =
      "position: absolute;\n" +
      "top: 0;\n" +
      "left: 0;\n" +
      "width: 100%;\n" +
      "height: 100%;\n" +
      "background-color: #F5F5F5;\n" +
      "display: flex;\n" +
      "align-items: center;\n" +
      "justify-content: center;\n" +
      "z-index: 1000;\n" +
      "transition: opacity 0.3s ease-out;";

    const spinner = document.createElement("div");
    spinner.style.cssText =
      "width: 40px;\n" +
      "height: 40px;\n" +
      "border: 3px solid #ddd;\n" +
      "border-top-color: #666;\n" +
      "border-radius: 50%;\n" +
      "animation: spin 1s linear infinite;";

    if (!document.querySelector("#fallback-spinner-style")) {
      const style = document.createElement("style");
      style.id = "fallback-spinner-style";
      style.textContent =
        "@keyframes spin {\n" + "  to { transform: rotate(360deg); }\n" + "}";
      document.head.appendChild(style);
    }

    this.fallbackPreloader.appendChild(spinner);
    canvasContainer.appendChild(this.fallbackPreloader);
  }

  hidePreloader() {
    const canvasContainer = document.getElementById("canvas-container");

    if (this.preloader && typeof this.preloader.hide === "function") {
      this.preloader.hide();
      setTimeout(() => {
        if (this.preloader && typeof this.preloader.destroy === "function") {
          this.preloader.destroy();
          this.preloader = null;
        }
        if (canvasContainer) {
          canvasContainer.style.backgroundColor = "transparent";
        }
      }, 500);
    } else if (this.fallbackPreloader) {
      this.fallbackPreloader.style.opacity = "0";
      setTimeout(() => {
        if (this.fallbackPreloader && this.fallbackPreloader.parentNode) {
          this.fallbackPreloader.parentNode.removeChild(this.fallbackPreloader);
          this.fallbackPreloader = null;
        }
        if (canvasContainer) {
          canvasContainer.style.backgroundColor = "transparent";
        }
      }, 300);
    }
  }

  // Attach a fluent event/drag API directly onto a PIXI display object
  enhanceObjectWithEventAPI(child) {
    if (!child || child._eventAPIAdded) return child;

    child._eventAPIAdded = true;
    child._board = this;

    child.onClick = (callback) => {
      this.addEventListener(child, "click", callback);
      return child;
    };

    child.onHover = (onEnter, onLeave) => {
      if (onEnter) this.addEventListener(child, "mouseover", onEnter);
      if (onLeave) this.addEventListener(child, "mouseout", onLeave);
      return child;
    };

    child.onMouseOver = (callback) => {
      this.addEventListener(child, "mouseover", callback);
      return child;
    };

    child.onMouseOut = (callback) => {
      this.addEventListener(child, "mouseout", callback);
      return child;
    };

    child.onMouseDown = (callback) => {
      this.addEventListener(child, "mousedown", callback);
      return child;
    };

    child.onMouseUp = (callback) => {
      this.addEventListener(child, "mouseup", callback);
      return child;
    };

    child.onMouseMove = (callback) => {
      this.addEventListener(child, "mousemove", callback);
      return child;
    };

    child.onDragStart = (callback) => {
      this.addEventListener(child, "dragstart", callback);
      return child;
    };

    child.onDrag = (callback) => {
      this.addEventListener(child, "drag", callback);
      return child;
    };

    child.onDragEnd = (callback) => {
      this.addEventListener(child, "dragend", callback);
      return child;
    };

    child.addEventListener = (eventType, callback) => {
      this.addEventListener(child, eventType, callback);
      return child;
    };

    child.removeEventListener = (eventType, callback) => {
      this.removeEventListener(child, eventType, callback);
      return child;
    };

    child.setDragging = (x1, y1, x2, y2) => {
      // Normalize so that argument order does not matter
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);

      this.dragConstraints.set(child, {
        minX,
        maxX,
        minY,
        maxY,
        isLine: maxX - minX === 0 || maxY - minY === 0,
      });

      child.draggable = true;
      child.buttonMode = true;
      child.cursor = "pointer";

      if (!child._mouseEventsSetup) {
        this.setupChildInteractivity(child);
      }

      return child;
    };

    child.removeDragging = () => {
      this.dragConstraints.delete(child);
      child.draggable = false;
      child.buttonMode = false;
      child.cursor = "default";
      return child;
    };

    child.getDragConstraints = () => {
      return this.dragConstraints.get(child) || null;
    };

    child.enableInteractivity = () => {
      this.setupChildInteractivity(child);
      return child;
    };

    child.disableInteractivity = () => {
      child.interactive = false;
      child.buttonMode = false;
      child.eventMode = "none";
      child.cursor = "default";
      return child;
    };

    return child;
  }

  handleChildMouseEvent(eventType, child, pixiEvent) {
    const listeners = this.mouseListeners.get(child);
    if (listeners && listeners[eventType]) {
      const mouseEvent = this.createMouseEvent(eventType, pixiEvent);
      listeners[eventType].forEach((callback) => {
        try {
          callback(mouseEvent, child);
        } catch (error) {
          console.error("Error in " + eventType + " event handler:", error);
        }
      });
    }
  }

  createMouseEvent(type, pixiEvent) {
    if (!pixiEvent || !pixiEvent.data) {
      return {
        type: type,
        x: 0,
        y: 0,
        globalX: 0,
        globalY: 0,
        button: 0,
        buttons: 0,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        originalEvent: null,
      };
    }

    const globalPos = pixiEvent.data.global;
    const localPos = pixiEvent.data.getLocalPosition(this.world);

    return {
      type: type,
      x: localPos.x,
      y: localPos.y,
      globalX: globalPos.x,
      globalY: globalPos.y,
      button: pixiEvent.data.button || 0,
      buttons: pixiEvent.data.buttons || 0,
      ctrlKey: pixiEvent.data.originalEvent?.ctrlKey || false,
      shiftKey: pixiEvent.data.originalEvent?.shiftKey || false,
      altKey: pixiEvent.data.originalEvent?.altKey || false,
      originalEvent: pixiEvent,
    };
  }

  startDrag(child, event) {
    if (child.draggable === true) {
      this.isDragging = true;
      this.dragTarget = child;

      const mousePos = event.data.getLocalPosition(child.parent);
      this.dragOffset = {
        x: mousePos.x - child.x,
        y: mousePos.y - child.y,
      };

      this.handleChildMouseEvent("dragstart", child, event);
    }
  }

  // Constraints apply to the object's position only, not its bounding box
  performDragUpdate(targetX, targetY) {
    if (!this.dragTarget || this.dragTarget.destroyed) return;

    let finalX = targetX;
    let finalY = targetY;

    const constraints = this.dragConstraints.get(this.dragTarget);
    if (constraints) {
      finalX = Math.max(constraints.minX, Math.min(finalX, constraints.maxX));
      finalY = Math.max(constraints.minY, Math.min(finalY, constraints.maxY));
    }

    this.dragTarget.x = finalX;
    this.dragTarget.y = finalY;

    const listeners = this.mouseListeners.get(this.dragTarget);
    if (listeners && listeners["drag"]) {
      const mouseEvent = {
        type: "drag",
        x: finalX,
        y: finalY,
        target: this.dragTarget,
      };
      listeners["drag"].forEach((callback) => {
        try {
          callback(mouseEvent, this.dragTarget);
        } catch (error) {
          console.error("Error in drag event handler:", error);
        }
      });
    }
  }

  addEventListener(child, eventType, callback) {
    if (!this.mouseListeners.has(child)) {
      this.mouseListeners.set(child, {});
    }

    const listeners = this.mouseListeners.get(child);
    if (!listeners[eventType]) {
      listeners[eventType] = [];
    }

    listeners[eventType].push(callback);
    this.setupChildInteractivity(child);
  }

  removeEventListener(child, eventType, callback) {
    const listeners = this.mouseListeners.get(child);
    if (listeners && listeners[eventType]) {
      const index = listeners[eventType].indexOf(callback);
      if (index > -1) {
        listeners[eventType].splice(index, 1);
      }

      // Clean up empty arrays and maps to avoid accumulating dead entries
      if (listeners[eventType].length === 0) {
        delete listeners[eventType];
      }

      if (Object.keys(listeners).length === 0) {
        this.mouseListeners.delete(child);
      }
    }
  }

  addGlobalEventListener(eventType, callback) {
    this.globalMouseListeners.push({ type: eventType, callback });
  }

  // Convenience methods kept for backwards compatibility
  onClick(child, callback) {
    this.addEventListener(child, "click", callback);
  }

  onHover(child, onEnter, onLeave) {
    if (onEnter) this.addEventListener(child, "mouseover", onEnter);
    if (onLeave) this.addEventListener(child, "mouseout", onLeave);
  }

  onDrag(child, onStart, onMove, onEnd) {
    if (onStart) this.addEventListener(child, "dragstart", onStart);
    if (onMove) this.addEventListener(child, "mousemove", onMove);
    if (onEnd) this.addEventListener(child, "dragend", onEnd);
  }

  onMouseDown(callback) {
    this.addGlobalEventListener("mousedown", callback);
    return this;
  }

  onMouseUp(callback) {
    this.addGlobalEventListener("mouseup", callback);
    return this;
  }

  onMouseMove(callback) {
    this.addGlobalEventListener("mousemove", callback);
    return this;
  }

  static getInstance() {
    return Board[INSTANCE_KEY];
  }

  async init() {
    const canvasContainer = document.getElementById("canvas-container");
    if (canvasContainer) {
      const allCanvases = canvasContainer.querySelectorAll("canvas");
      allCanvases.forEach((canvas) => {
        canvas.remove();
      });
    }

    const existingGUI = document.getElementById("pixi-ui-overlay");
    if (existingGUI) {
      existingGUI.remove();
    }

    // Destroy any pre-existing PIXI app before creating a new one
    if (window.app) {
      try {
        if (window.app.ticker) {
          window.app.ticker.stop();
        }
        window.app.destroy(true, {
          children: true,
          texture: true,
          baseTexture: true,
        });
      } catch (e) {
        console.warn("Error destroying existing PIXI app:", e);
      }
      window.app = null;
    }

    let optimalResolution = this.calculateOptimalResolution();

    // Force 1x on mobile to prevent oversized canvas buffers
    if (this.isMobile || window.innerWidth <= 768) {
      optimalResolution = 1;
    }

    window.app = new PIXI.Application();
    await app.init({
      width: this.width,
      height: this.height,
      backgroundColor: this.backgroundColor,
      antialias: true,
      resolution: optimalResolution,
      autoDensity: true, // Maps CSS pixels to physical pixels correctly
      backgroundAlpha: 1,
      powerPreference: this.isMobile ? "low-power" : "high-performance",
      hello: true,
      preserveDrawingBuffer: false,
      clearBeforeRender: true,
    });

    // Increase curve smoothness for sharper circles and arcs
    if (PIXI.GraphicsContext && PIXI.GraphicsContext.defaultOptions) {
      PIXI.GraphicsContext.defaultOptions.bezierSmoothness = 0.5;
    }
    if (PIXI.Graphics && PIXI.Graphics.curves) {
      PIXI.Graphics.curves.adaptive = true;
      PIXI.Graphics.curves.maxLength = 10;
      PIXI.Graphics.curves.minSegments = 8;
      PIXI.Graphics.curves.maxSegments = 2048;
    }

    if (app.renderer) {
      if (app.renderer.options) {
        app.renderer.options.antialias = true;
        app.renderer.options.resolution = optimalResolution;
      }

      if (app.renderer.state && app.renderer.state.setBlendMode) {
        if (PIXI.BLEND_MODES && PIXI.BLEND_MODES.NORMAL !== undefined) {
          app.renderer.state.setBlendMode(PIXI.BLEND_MODES.NORMAL);
        } else if (typeof PIXI.BLEND_MODES === "object") {
          app.renderer.state.setBlendMode(0); // NORMAL in older PIXI versions
        }
      }
    }

    app.ticker.maxFPS = this.currentFPS;

    document
      .getElementById("canvas-container")
      .appendChild(app.view || app.canvas);

    const canvasEl = app.view || app.canvas;
    canvasEl.style.imageRendering = "auto";
    canvasEl.style.willChange = "transform";

    // Prevent the browser from generating a ghost image during pointer drag
    canvasEl.setAttribute("draggable", "false");
    canvasEl.style.touchAction = "none";
    canvasEl.style.userSelect = "none";
    canvasEl.style.webkitUserDrag = "none";

    canvasEl.addEventListener("dragstart", (e) => {
      e.preventDefault();
      return false;
    });

    canvasEl.addEventListener("selectstart", (e) => {
      e.preventDefault();
      return false;
    });

    this.setupStageInteractivity();

    // Debounced via resizeCanvas() itself
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  handleGlobalMouseEvent(eventType, pixiEvent) {
    const mouseEvent = this.createMouseEvent(eventType, pixiEvent);

    this.globalMouseListeners.forEach((listener) => {
      if (listener.type === eventType) {
        try {
          listener.callback(mouseEvent);
        } catch (error) {
          console.error("Error in global " + eventType + " event handler:", error);
        }
      }
    });
  }

  createGrid(divisionsX, divisionsY, width, height) {
    if (this.gridCreated) return; // Guard against duplicate calls
    this.gridCreated = true;

    this.world = new PIXI.Container();

    const background = new PIXI.Graphics();
    background.beginFill(this.backgroundColor);
    background.drawRect(0, 0, width, height);
    background.endFill();
    this.world.addChildAt(background, 0);

    app.stage.addChild(this.world);

    this.createWorldMask();
  }

  createWorldMask() {
    this.worldMask = new PIXI.Graphics();
    this.worldMask.beginFill(0xffffff);
    this.worldMask.drawRect(0, 0, this.width, this.height);
    this.worldMask.endFill();

    this.world.mask = this.worldMask;
    // Mask must be added to the stage to take effect in PIXI
    app.stage.addChild(this.worldMask);
  }

  updateWorldMask() {
    if (this.worldMask) {
      this.worldMask.clear();
      this.worldMask.beginFill(0xffffff);
      this.worldMask.drawRect(0, 0, this.width, this.height);
      this.worldMask.endFill();
    }
  }

  setMaskEnabled(enabled) {
    if (this.world) {
      this.world.mask = enabled ? this.worldMask : null;
    }
  }

  showPreview() {
    const container = document.getElementById("canvas-container");
    if (container && container.style.visibility !== "visible") {
      container.style.visibility = "visible";
    }
  }

  getAvailableSpace() {
    const preview = document.getElementById("preview");
    const container = document.getElementById("canvas-container");

    if (!preview || !container) {
      return { width: 800, height: 600, margin: 20 };
    }

    const isFullscreen =
      this.isFullscreen ||
      preview.classList.contains("fullscreen-preview") ||
      document.fullscreenElement ||
      (typeof window.exportMode !== "undefined" && window.exportMode);

    if (isFullscreen) {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        margin: 0,
      };
    }

    // Normal mode - calculate available space properly
    const previewRect = preview.getBoundingClientRect();

    const isMobileDevice = this.isMobile || window.innerWidth <= 768;

    let margin = 20;
    if (isMobileDevice) {
      margin = 5;
    } else if (previewRect.width < 400) {
      margin = 10;
    } else if (previewRect.width < 600) {
      margin = 15;
    }

    const availableWidth = Math.max(previewRect.width - margin * 2, 50);
    const availableHeight = Math.max(previewRect.height - margin * 2, 50);

    return {
      width: availableWidth,
      height: availableHeight,
      margin: margin,
      previewWidth: previewRect.width,
      previewHeight: previewRect.height,
      isMobile: isMobileDevice,
    };
  }

  resizeCanvas() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      this.performResize();
    }, 16);
  }

  // Hybrid resize strategy:
  // - scale >= 1 (upscale): renderer renders at display size; stage scale > 1.
  //   Avoids CSS upscaling blur on large screens.
  // - scale < 1 (downscale): renderer renders at full logical size; CSS scales down.
  //   Browser downsampling produces sharper lines/text than PIXI at low resolution.
  performResize() {
    const canvas = app.view || app.canvas;
    const container = document.getElementById("canvas-container");
    const preview = document.getElementById("preview");

    if (!canvas || !container || !preview) {
      console.warn("Missing elements for resize");
      return;
    }

    const availableSpace = this.getAvailableSpace();

    const scaleX = availableSpace.width / this.width;
    const scaleY = availableSpace.height / this.height;
    const scale = Math.min(scaleX, scaleY);

    if (availableSpace.isMobile && scale < 0.5) {
      this.scaleValue = Math.max(scale, 0.1);
    } else {
      this.scaleValue = scale;
    }

    const scaledWidth = Math.floor(this.width * this.scaleValue);
    const scaledHeight = Math.floor(this.height * this.scaleValue);

    requestAnimationFrame(() => {
      document.body.classList.add("resizing-canvas");

      const canvasElement = document.querySelector("canvas:not(.x3dom-canvas)");

      if (this.scaleValue >= 1) {
        if (canvasElement) {
          canvasElement.style.width = "";
          canvasElement.style.height = "";
        }
        app.renderer.resize(scaledWidth, scaledHeight);
        app.stage.scale.set(this.scaleValue);
      } else {
        if (canvasElement) {
          canvasElement.style.width = scaledWidth + "px";
          canvasElement.style.height = scaledHeight + "px";
        }
        app.renderer.resize(this.width, this.height);
        app.stage.scale.set(1);
      }

      const previewRect = preview.getBoundingClientRect();

      const leftPos = Math.max(0, (previewRect.width - scaledWidth) / 2);
      const topPos = Math.max(0, (previewRect.height - scaledHeight) / 2);

      Object.assign(container.style, {
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
        WebkitTransform: "translateZ(0)",
        willChange: "transform",
      });

      if (HtmlSvgEdu?.Component?.updateContainerScale) {
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

  adjustMobileViewport() {
    // Prevent pinch-zoom on iOS
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      document.head.appendChild(meta);
    } else {
      viewport.content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    }

    document.body.style.overscrollBehavior = "none";
    document.body.style.touchAction = "manipulation";
  }

  setExportMode(enabled) {
    this.isExportMode = enabled;
    if (enabled) {
      document.body.classList.add("export-mode");
    } else {
      document.body.classList.remove("export-mode");
    }
    this.resizeCanvas();
  }

  restoreObjectAssign() {
    if (this.originalObjectAssign) {
      Object.assign = this.originalObjectAssign;
      this.originalObjectAssign = null;
    }
  }

  getCurrentScale() {
    return this.scaleValue || 1;
  }

  getCanvasDimensions() {
    return {
      width: this.width,
      height: this.height,
      scaledWidth: Math.floor(this.width * (this.scaleValue || 1)),
      scaledHeight: Math.floor(this.height * (this.scaleValue || 1)),
      scale: this.scaleValue || 1,
      resolution: this.calculateOptimalResolution(),
    };
  }

  setFramerate(fps) {
    if (typeof fps !== "number" || fps <= 0 || fps > 240) {
      console.warn("Invalid framerate. Must be between 1 and 240 FPS.");
      return false;
    }

    this.currentFPS = fps;

    if (window.app && window.app.ticker) {
      window.app.ticker.maxFPS = fps;
      return true;
    } else {
      console.warn("PIXI app not yet initialized. Framerate will be applied on next init().");
      return false;
    }
  }

  getFramerate() {
    if (window.app && window.app.ticker) {
      return window.app.ticker.maxFPS;
    }
    return this.currentFPS;
  }

  setAdaptiveFramerate(enabled) {
    if (window.app && window.app.ticker) {
      // Setting maxFPS to 0 lets PIXI run uncapped (effectively adaptive)
      window.app.ticker.maxFPS = enabled ? 0 : this.currentFPS;
    }
  }
}
