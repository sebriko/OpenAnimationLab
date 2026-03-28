class EditorPreviewSplitter {
  constructor() {
    this.editor = document.querySelector(".editor");
    this.preview = document.querySelector("#preview");
    this.container = document.querySelector(".content-container");
    this.splitter = null;
    this.isResizing = false;
    this.startX = 0;
    this.startWidthLeft = 0;
    this.startWidthRight = 0;

    this.isFullscreenMode = false;
    this.savedPosition = null;
    this.isPortraitMode = false;
    this.defaultLeftPercent = 50;
    this.defaultRightPercent = 50;

    this.layoutRecalculationTimeout = null;

    this.init();
  }

  init() {
    this.checkPortraitMode();
    this.createSplitter();
    this.addEventListeners();
    this.resetPosition();
    this.addOrientationListener();
  }

  checkPortraitMode() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Portrait mode: narrow screen or height exceeds width on tablets
    this.isPortraitMode = width <= 768 || (height > width && width <= 1024);

    if (this.isPortraitMode) {
      document.body.classList.add("portrait-mode");
    } else {
      document.body.classList.remove("portrait-mode");
    }

    return this.isPortraitMode;
  }

  addOrientationListener() {
    let resizeTimeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const wasPortrait = this.isPortraitMode;
        this.checkPortraitMode();

        if (wasPortrait !== this.isPortraitMode) {
          this.handleModeChange();
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", () => {
      setTimeout(handleResize, 200);
    });
  }

  handleModeChange() {
    if (this.isPortraitMode) {
      this.splitter.style.display = "none";

      // Remove inline widths so CSS takes over
      this.editor.style.width = "";
      this.preview.style.width = "";
      this.adjustPortraitLayout();
    } else {
      this.splitter.style.display = "";
      this.restorePosition();
    }

    this.triggerResize();
  }

  adjustPortraitLayout() {
    const canvasContainer = document.getElementById("canvas-container");

    if (canvasContainer && window.Board) {
      const boardInstance = window.Board.getInstance
        ? window.Board.getInstance()
        : null;

      if (boardInstance) {
        const boardWidth = boardInstance.width || 800;
        const boardHeight = boardInstance.height || 600;
        const aspectRatio = boardHeight / boardWidth;

        const availableWidth = window.innerWidth - 20;
        const calculatedHeight = availableWidth * aspectRatio;

        const previewHeight = Math.min(
          calculatedHeight + 30,
          window.innerHeight * 0.6,
        );
        this.preview.style.height = previewHeight + "px";
      }
    }

    setTimeout(() => {
      if (window.Board && window.Board.getInstance) {
        const boardInstance = window.Board.getInstance();
        if (boardInstance && boardInstance.resizeCanvas) {
          boardInstance.resizeCanvas();
        }
      }
    }, 100);
  }

  createSplitter() {
    this.splitter = document.createElement("div");
    this.splitter.className = "splitter";
    this.splitter.innerHTML = '<div class="splitter-handle"></div>';

    this.editor.after(this.splitter);

    // An overlay div prevents iframe/canvas from capturing mouse events during drag
    this.overlay = document.createElement("div");
    this.overlay.className = "resize-overlay";
    document.body.appendChild(this.overlay);

    if (this.isPortraitMode) {
      this.splitter.style.display = "none";
    }
  }

  addEventListeners() {
    this.splitter.addEventListener("mousedown", this.startResize.bind(this));
    document.addEventListener("mousemove", this.resize.bind(this));
    document.addEventListener("mouseup", this.stopResize.bind(this));

    this.splitter.addEventListener("touchstart", this.startResize.bind(this));
    document.addEventListener("touchmove", this.resize.bind(this));
    document.addEventListener("touchend", this.stopResize.bind(this));

    this.splitter.addEventListener("dblclick", this.resetPosition.bind(this));
  }

  saveCurrentPosition() {
    if (!this.isFullscreenMode && !this.isPortraitMode) {
      const editorRect = this.editor.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();
      const leftPercent = (editorRect.width / containerRect.width) * 100;

      this.savedPosition = {
        leftPercent: leftPercent,
        rightPercent:
          100 -
          leftPercent -
          (this.splitter.offsetWidth / containerRect.width) * 100,
      };
    }
  }

  setFullscreenMode(isFullscreen) {
    this.isFullscreenMode = isFullscreen;

    if (isFullscreen) {
      this.splitter.style.display = "none";
    } else if (!this.isPortraitMode) {
      this.splitter.style.display = "";
    }
  }

  restorePosition() {
    if (this.savedPosition && !this.isFullscreenMode && !this.isPortraitMode) {
      this.editor.style.width = `${this.savedPosition.leftPercent.toFixed(4)}%`;
      this.preview.style.width = `${this.savedPosition.rightPercent.toFixed(4)}%`;

      this.triggerResize();
    } else if (!this.isPortraitMode) {
      this.resetPosition();
    }
  }

  startResize(e) {
    if (this.isFullscreenMode || this.isPortraitMode) return;

    e.preventDefault();
    this.isResizing = true;

    this.overlay.classList.add("active");
    this.splitter.classList.add("dragging");

    this.startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;

    const editorRect = this.editor.getBoundingClientRect();
    const previewRect = this.preview.getBoundingClientRect();
    this.startWidthLeft = editorRect.width;
    this.startWidthRight = previewRect.width;

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }

  resize(e) {
    if (!this.isResizing || this.isFullscreenMode || this.isPortraitMode)
      return;

    const currentX = e.type.includes("mouse")
      ? e.clientX
      : e.touches[0].clientX;
    const dx = currentX - this.startX;

    const containerWidth = this.container.offsetWidth;
    const splitterWidth = this.splitter.offsetWidth;
    const availableWidth = containerWidth - splitterWidth;

    let newLeftWidth = this.startWidthLeft + dx;
    let newRightWidth = this.startWidthRight - dx;

    const minWidth = 200;
    if (newLeftWidth < minWidth) {
      newLeftWidth = minWidth;
      newRightWidth = availableWidth - minWidth;
    }
    if (newRightWidth < minWidth) {
      newRightWidth = minWidth;
      newLeftWidth = availableWidth - minWidth;
    }

    // Ensure left + right = available width (floating-point guard)
    const totalCalculated = newLeftWidth + newRightWidth;
    if (Math.abs(totalCalculated - availableWidth) > 1) {
      newRightWidth = availableWidth - newLeftWidth;
    }

    const leftPercent = (newLeftWidth / containerWidth) * 100;
    const rightPercent = (newRightWidth / containerWidth) * 100;

    this.editor.style.width = `${leftPercent.toFixed(4)}%`;
    this.preview.style.width = `${rightPercent.toFixed(4)}%`;

    this.triggerResize();
  }

  stopResize() {
    if (!this.isResizing) return;

    this.isResizing = false;

    this.overlay.classList.remove("active");
    this.splitter.classList.remove("dragging");

    document.body.style.userSelect = "";
    document.body.style.cursor = "";

    this.saveCurrentPosition();
    this.triggerResize();
  }

  resetPosition() {
    if (this.isFullscreenMode || this.isPortraitMode) return;

    const containerWidth = this.container.offsetWidth;
    const splitterWidth = this.splitter.offsetWidth;
    const availableWidth = containerWidth - splitterWidth;

    const leftPercent = (availableWidth / 2 / containerWidth) * 100;
    const rightPercent = (availableWidth / 2 / containerWidth) * 100;

    this.editor.style.width = `${leftPercent.toFixed(4)}%`;
    this.preview.style.width = `${rightPercent.toFixed(4)}%`;

    this.saveCurrentPosition();
    this.triggerResize();
  }

  triggerResize() {
    window.dispatchEvent(new Event("resize"));

    if (window.resizeCanvas) {
      window.resizeCanvas();
    }

    if (window.editor && window.editor.refresh) {
      setTimeout(() => {
        window.editor.refresh();
      }, 10);
    }

    if (window.Board && window.Board.getInstance) {
      const boardInstance = window.Board.getInstance();
      if (boardInstance && boardInstance.resizeCanvas) {
        setTimeout(() => {
          boardInstance.resizeCanvas();
        }, 20);
      }
    }
  }

  isInPortraitMode() {
    return this.isPortraitMode;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    window.editorPreviewSplitter = new EditorPreviewSplitter();
  }, 100);
});
