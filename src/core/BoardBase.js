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

  // Sichtbare Fläche des Browserfensters. Auf dem Handy kann window.innerWidth
  // größer sein als der Bildschirm: Ragt die Bühne beim Laden über den Rand,
  // vergrößert der Browser den Layout-Viewport – die Animation wird dann zu groß
  // berechnet und bleibt zu groß. visualViewport × scale liefert die echte Breite.
  getVisibleViewport() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    const vv = window.visualViewport;
    if (vv && vv.width > 0 && vv.height > 0) {
      const s = vv.scale > 0 ? vv.scale : 1;
      width = Math.min(width, Math.round(vv.width * s));
      height = Math.min(height, Math.round(vv.height * s));
    }
    return { width: width, height: height };
  }

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
      const vp = this.getVisibleViewport();
      return {
        width: vp.width,
        height: vp.height,
        margin: 0,
        fullscreen: true,
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

  // ── Keyboard event support ───────────────────────────────────────────────

  _initKeyboard() {
    this._keyboardListeners = { keydown: [], keyup: [] };
    this._keysPressed = {};

    this._boundKeyDown = (e) => {
      const safeEvent = this._createSafeKeyEvent(e);
      this._keysPressed[safeEvent.key] = true;

      for (const cb of this._keyboardListeners.keydown) {
        try {
          cb(safeEvent);
        } catch (err) {
          console.error("Error in keydown handler:", err);
        }
      }

      if (this._shouldPreventDefault(safeEvent.key)) {
        e.preventDefault();
      }
    };

    this._boundKeyUp = (e) => {
      const safeEvent = this._createSafeKeyEvent(e);
      delete this._keysPressed[safeEvent.key];

      for (const cb of this._keyboardListeners.keyup) {
        try {
          cb(safeEvent);
        } catch (err) {
          console.error("Error in keyup handler:", err);
        }
      }
    };

    this._boundBlur = () => {
      this._keysPressed = {};
    };

    window.addEventListener("keydown", this._boundKeyDown);
    window.addEventListener("keyup", this._boundKeyUp);
    window.addEventListener("blur", this._boundBlur);
  }

  _createSafeKeyEvent(e) {
    return {
      key: e.key,
      code: e.code,
      repeat: e.repeat,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    };
  }

  _shouldPreventDefault(key) {
    const preventKeys = new Set([
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Tab",
    ]);
    return this._keyboardListeners.keydown.length > 0 && preventKeys.has(key);
  }

  _cleanupKeyboard() {
    if (this._boundKeyDown) {
      window.removeEventListener("keydown", this._boundKeyDown);
      window.removeEventListener("keyup", this._boundKeyUp);
      window.removeEventListener("blur", this._boundBlur);
      this._boundKeyDown = null;
      this._boundKeyUp = null;
      this._boundBlur = null;
    }
    this._keyboardListeners = { keydown: [], keyup: [] };
    this._keysPressed = {};
  }

  onKeyDown(callback) {
    if (typeof callback !== "function") return this;
    this._keyboardListeners.keydown.push(callback);
    return this;
  }

  onKeyUp(callback) {
    if (typeof callback !== "function") return this;
    this._keyboardListeners.keyup.push(callback);
    return this;
  }

  isKeyDown(key) {
    return !!this._keysPressed[key];
  }

  getKeysPressed() {
    return Object.assign({}, this._keysPressed);
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

  // ── Vollbild-Knopf im Export (4.2.0) ──────────────────────────────────────
  // Nur im Export, nur als eigene Seite (nicht im iframe) und nur, wenn der
  // Browser echtes Vollbild kann (iPhone nicht). Liegt der Knopf über der
  // Bühne, blendet er sich nach 3 s aus und kommt bei Maus oder Tippen wieder.

  setupExportFullscreenButton() {
    if (this._fsButton) return;
    if (typeof window.exportMode === "undefined" || !window.exportMode) return;
    let topLevel = true;
    try { topLevel = window.self === window.top; } catch (e) { topLevel = false; }
    if (!topLevel) return;
    const root = document.documentElement;
    const canRequest = root.requestFullscreen || root.webkitRequestFullscreen;
    const enabled = document.fullscreenEnabled || document.webkitFullscreenEnabled;
    if (!canRequest || !enabled) return;

    const de = (root.lang || "").toLowerCase().indexOf("de") === 0;
    this._fsTexts = de
      ? { enter: "Vollbild", exit: "Vollbild beenden" }
      : { enter: "Full screen", exit: "Exit full screen" };
    const iconEnter =
      '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="none" stroke="#444444" stroke-width="2" stroke-linecap="round"><path d="M2 7V2h5M13 2h5v5M18 13v5h-5M7 18H2v-5"/></svg>';
    const iconExit =
      '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="none" stroke="#444444" stroke-width="2" stroke-linecap="round"><path d="M7 2v5H2M18 7h-5V2M13 18v-5h5M2 13h5v5"/></svg>';

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "oal-fullscreen-button";
    Object.assign(btn.style, {
      position: "fixed", top: "6px", right: "6px", zIndex: "10001",
      width: "36px", height: "36px", padding: "0", margin: "0",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(255, 255, 255, 0.85)", border: "1px solid #cccccc",
      borderRadius: "8px", cursor: "pointer", opacity: "0.6",
      transition: "opacity 0.4s", touchAction: "manipulation",
      WebkitTapHighlightColor: "transparent",
    });

    const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
    const update = () => {
      const fs = isFs();
      btn.innerHTML = fs ? iconExit : iconEnter;
      btn.title = fs ? this._fsTexts.exit : this._fsTexts.enter;
      btn.setAttribute("aria-label", btn.title);
      btn.setAttribute("aria-pressed", fs ? "true" : "false");
    };
    update();

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      try {
        if (isFs()) {
          const exit = document.exitFullscreen || document.webkitExitFullscreen;
          if (exit) { const p = exit.call(document); if (p && p.catch) p.catch(() => {}); }
        } else {
          const p = canRequest.call(root);
          if (p && p.catch) p.catch(() => {});
        }
      } catch (err) {}
    });
    btn.addEventListener("mouseenter", () => { btn.style.opacity = "1"; });
    btn.addEventListener("mouseleave", () => { this._fsShow(); });
    btn.addEventListener("focus", () => { btn.style.opacity = "1"; });
    btn.addEventListener("blur", () => { this._fsShow(); });

    this._fsOnChange = () => { update(); this._fsShow(); this.resizeCanvas(); };
    document.addEventListener("fullscreenchange", this._fsOnChange);
    document.addEventListener("webkitfullscreenchange", this._fsOnChange);
    this._fsOnActivity = () => this._fsShow();
    document.addEventListener("pointermove", this._fsOnActivity, true);
    document.addEventListener("pointerdown", this._fsOnActivity, true);

    this._fsOverStage = true;
    this._fsButton = btn;
    document.body.appendChild(btn);
    this._fsShow();
  }

  // Knopf zeigen; liegt er über der Bühne, nach 3 s ausblenden.
  _fsShow() {
    const btn = this._fsButton;
    if (!btn) return;
    if (this._fsHideTimer) { clearTimeout(this._fsHideTimer); this._fsHideTimer = null; }
    btn.style.opacity = "0.6";
    btn.style.pointerEvents = "auto";
    btn.style.visibility = "visible";
    if (this._fsOverStage) {
      this._fsHideTimer = setTimeout(() => {
        if (document.activeElement === btn) return;
        btn.style.opacity = "0";
        btn.style.pointerEvents = "none";
      }, 3000);
    }
  }

  // Nach jedem Größenwechsel: Ist rechts oder oben neben der Bühne Platz?
  updateFullscreenButton(left, top, width, height, boxWidth) {
    if (!this._fsButton) return;
    // Im Hochformat steht oben der Hinweis „Gerät quer halten“ → Knopf unten rechts.
    const portrait = window.matchMedia &&
      window.matchMedia("(orientation: portrait) and (max-width: 700px)").matches;
    this._fsButton.style.top = portrait ? "auto" : "6px";
    this._fsButton.style.bottom = portrait ? "6px" : "auto";
    const rightSpace = boxWidth - (left + width);
    const bottomSpace = window.innerHeight - (top + height);
    const over = portrait ? (rightSpace < 48 && bottomSpace < 48) : (rightSpace < 48 && top < 48);
    if (over !== this._fsOverStage) {
      this._fsOverStage = over;
      this._fsShow();
    }
  }

  destroyFullscreenButton() {
    if (!this._fsButton) return;
    if (this._fsHideTimer) clearTimeout(this._fsHideTimer);
    document.removeEventListener("fullscreenchange", this._fsOnChange);
    document.removeEventListener("webkitfullscreenchange", this._fsOnChange);
    document.removeEventListener("pointermove", this._fsOnActivity, true);
    document.removeEventListener("pointerdown", this._fsOnActivity, true);
    if (this._fsButton.parentNode) this._fsButton.parentNode.removeChild(this._fsButton);
    this._fsButton = null;
  }
}
