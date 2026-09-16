/**
 * BoardBase – shared logic for both Board (PixiJS) and BoardSVG (SVG.js).
 *
 * Contains mobile detection, viewport adjustment, available-space calculation,
 * resize debouncing, preloader management, export mode, scale getters, and
 * global event listener registration.
 *
 * Subclasses must implement: performResize(), destroy()
 */

class BoardBase {
  _initBase(width, height, backgroundColor) {
    this.width = width;
    this.height = height;
    this.scaleValue = null;
    this.currentFPS = 60;

    this.allChildren = [];
    this.UIElements = [];

    this.resizeTimeout = null;
    this.globalMouseListeners = [];
    this.isFullscreen = false;
    this.isMobile = this.detectMobile();

    this.canvasContainer = document.getElementById("canvas-container");
  }

  // ── Mobile detection ──────────────────────────────────────────────────────

  detectMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobile =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase(),
      );
    const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 600;
    return isMobile || isSmallScreen;
  }

  adjustMobileViewport() {
    const content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = content;
      document.head.appendChild(meta);
    } else {
      viewport.content = content;
    }

    document.body.style.overscrollBehavior = "none";
    document.body.style.touchAction = "manipulation";
  }

  // ── Available space calculation ───────────────────────────────────────────

  getAvailableSpace() {
    const preview = document.getElementById("preview");
    const container = this.canvasContainer;

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

  // ── Resize (debounce wrapper — subclass implements performResize) ────────

  resizeCanvas() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => {
      this.performResize();
    }, 16);
  }

  // ── Canvas container preparation ─────────────────────────────────────────

  prepareCanvasContainer() {
    if (!this.canvasContainer) {
      console.warn("Canvas container not found.");
      return;
    }

    this.canvasContainer.style.visibility = "hidden";
    this.canvasContainer.style.position = "absolute";
    this.canvasContainer.style.backgroundColor = "#F5F5F5";
    this.canvasContainer.style.imageRendering = "auto";

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

      Object.assign(this.canvasContainer.style, {
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        left: `${leftPos}px`,
        top: `${topPos}px`,
        transition: "none",
      });
    }
  }

  // ── Preloader ─────────────────────────────────────────────────────────────

  createPreloader() {
    if (!this.canvasContainer) {
      console.warn("Canvas container not found. Skipping preloader.");
      return;
    }

    setTimeout(() => {
      this.canvasContainer.style.display = "block";
      this.canvasContainer.style.visibility = "visible";
      this.canvasContainer.style.opacity = "0";
      this.canvasContainer.style.transition = "opacity 0.2s ease-in";

      requestAnimationFrame(() => {
        this.canvasContainer.style.opacity = "1";
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
      this.canvasContainer.appendChild(this.preloader._element);

      Object.assign(this.preloader._element.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
      });
    } else {
      console.warn(
        "HtmlSvgEdu.Preloader not found. Creating fallback preloader.",
      );
      this.createFallbackPreloader();
    }
  }

  createFallbackPreloader() {
    if (!this.canvasContainer) return;

    this.fallbackPreloader = document.createElement("div");
    this.fallbackPreloader.style.cssText =
      "position: absolute; top: 0; left: 0; width: 100%; height: 100%; " +
      "background-color: #F5F5F5; display: flex; align-items: center; " +
      "justify-content: center; z-index: 1000; transition: opacity 0.3s ease-out;";

    const spinner = document.createElement("div");
    spinner.style.cssText =
      "width: 40px; height: 40px; border: 3px solid #ddd; " +
      "border-top-color: #666; border-radius: 50%; animation: spin 1s linear infinite;";

    if (!document.querySelector("#fallback-spinner-style")) {
      const style = document.createElement("style");
      style.id = "fallback-spinner-style";
      style.textContent =
        "@keyframes spin { to { transform: rotate(360deg); } }";
      document.head.appendChild(style);
    }

    this.fallbackPreloader.appendChild(spinner);
    this.canvasContainer.appendChild(this.fallbackPreloader);
  }

  hidePreloader() {
    if (this.preloader && typeof this.preloader.hide === "function") {
      this.preloader.hide();
      setTimeout(() => {
        if (this.preloader && typeof this.preloader.destroy === "function") {
          this.preloader.destroy();
          this.preloader = null;
        }
        if (this.canvasContainer) {
          this.canvasContainer.style.backgroundColor = "transparent";
        }
      }, 500);
    } else if (this.fallbackPreloader) {
      this.fallbackPreloader.style.opacity = "0";
      setTimeout(() => {
        if (this.fallbackPreloader && this.fallbackPreloader.parentNode) {
          this.fallbackPreloader.parentNode.removeChild(this.fallbackPreloader);
          this.fallbackPreloader = null;
        }
        if (this.canvasContainer) {
          this.canvasContainer.style.backgroundColor = "transparent";
        }
      }, 300);
    }
  }

  showPreview() {
    if (
      this.canvasContainer &&
      this.canvasContainer.style.visibility !== "visible"
    ) {
      this.canvasContainer.style.visibility = "visible";
    }
  }

  // ── Export mode ───────────────────────────────────────────────────────────

  setExportMode(enabled) {
    this.isExportMode = enabled;
    if (enabled) {
      document.body.classList.add("export-mode");
    } else {
      document.body.classList.remove("export-mode");
    }
    this.resizeCanvas();
  }

  // ── Scale / dimensions ────────────────────────────────────────────────────

  getCurrentScale() {
    return this.scaleValue || 1;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getCanvasDimensions() {
    return {
      width: this.width,
      height: this.height,
      scaledWidth: Math.floor(this.width * (this.scaleValue || 1)),
      scaledHeight: Math.floor(this.height * (this.scaleValue || 1)),
      scale: this.scaleValue || 1,
    };
  }

  // ── Framerate ─────────────────────────────────────────────────────────────

  setFramerate(fps) {
    if (typeof fps !== "number" || fps <= 0 || fps > 240) {
      console.warn("Invalid framerate. Must be between 1 and 240 FPS.");
      return false;
    }
    this.currentFPS = fps;
    return true;
  }

  getFramerate() {
    return this.currentFPS;
  }

  setAdaptiveFramerate(enabled) {
    if (enabled) {
      this.currentFPS = 0;
    }
  }

  // ── Global event listeners ────────────────────────────────────────────────

  addGlobalEventListener(eventType, callback) {
    this.globalMouseListeners.push({ type: eventType, callback });
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

  // ── Board-level convenience event methods ─────────────────────────────────

  onClick(child, callback) {
    if (child && child.onClick) {
      child.onClick(callback);
    }
  }

  onHover(child, onEnter, onLeave) {
    if (child) {
      if (onEnter && child.onMouseOver) child.onMouseOver(onEnter);
      if (onLeave && child.onMouseOut) child.onMouseOut(onLeave);
    }
  }

  onDrag(child, onStart, onMove, onEnd) {
    if (child) {
      if (onStart && child.onDragStart) child.onDragStart(onStart);
      if (onMove && child.onDrag) child.onDrag(onMove);
      if (onEnd && child.onDragEnd) child.onDragEnd(onEnd);
    }
  }
}
