class PerformanceManager {
  constructor() {
    this.lastExecutedCode = "";
    this.codeExecutionTimeout = null;
    this.tabPreloadCache = new Map();
    this.editorChangeTimeout = null;
    this.isInitialized = false;

    // References for cleanup
    this._visibilityHandler = null;
    this._canvasObserver = null;
    this._cleanupTimerId = null;
  }

  optimizedRunCode() {
    const currentCode = editor?.getValue() || "";

    if (currentCode === this.lastExecutedCode) {
      return;
    }

    if (this.codeExecutionTimeout) {
      clearTimeout(this.codeExecutionTimeout);
    }

    this.codeExecutionTimeout = setTimeout(() => {
      if (typeof runCode === "function") {
        runCode();
        this.lastExecutedCode = currentCode;
      }
    }, 100);
  }

  optimizeEditor() {
    if (!editor) return;

    editor.setOption("viewportMargin", 10);

    editor.on("change", () => {
      if (this.editorChangeTimeout) clearTimeout(this.editorChangeTimeout);
      this.editorChangeTimeout = setTimeout(() => {
        if (
          currentTabName &&
          editor.getValue() !== tabContents[currentTabName]
        ) {
          tabContents[currentTabName] = editor.getValue();
        }
      }, 200);
    });
  }

  optimizeCanvasRendering() {
    if (!window.app?.ticker) return;

    // Throttle PixiJS FPS when the page is not visible
    this._visibilityHandler = () => {
      if (document.hidden) {
        window.app.ticker.maxFPS = 10;
      } else {
        window.app.ticker.maxFPS = 60;
      }
    };
    document.addEventListener("visibilitychange", this._visibilityHandler);

    this._canvasObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          window.app.ticker.start();
        } else {
          window.app.ticker.stop();
        }
      });
    });

    const canvasContainer = document.getElementById("canvas-container");
    if (canvasContainer) {
      this._canvasObserver.observe(canvasContainer);
    }
  }

  cleanupUnusedResources() {
    const activeTabs = Array.from(document.querySelectorAll(".tab")).map(
      (tab) => tab.getAttribute("data-tab"),
    );

    Object.keys(tabContents).forEach((tabName) => {
      if (!activeTabs.includes(tabName)) {
        delete tabContents[tabName];
      }
    });

    Object.keys(tabObjects).forEach((tabName) => {
      if (!activeTabs.includes(tabName)) {
        delete tabObjects[tabName];
      }
    });
  }

  setupPerformanceObserver() {
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.duration > 50) {
              console.warn(`Long task detected: ${entry.duration}ms`, entry);
            }
          });
        });
        observer.observe({ entryTypes: ["longtask"] });
      } catch (e) {
        // longtask not supported in this browser (e.g. Firefox)
      }
    }
  }

  preloadTab(tabName) {
    if (!this.tabPreloadCache.has(tabName) && tabContents[tabName]) {
      this.tabPreloadCache.set(tabName, {
        content: tabContents[tabName],
        timestamp: Date.now(),
      });
    }
  }

  enableDebugging() {
    let tabSwitchStartTime = 0;

    const originalSwitchTab = window.switchTab;
    window.switchTab = function (tabName) {
      tabSwitchStartTime = performance.now();
      console.time(`Tab switch to ${tabName}`);

      originalSwitchTab(tabName);

      setTimeout(() => {
        const endTime = performance.now();
        const duration = endTime - tabSwitchStartTime;
        console.timeEnd(`Tab switch to ${tabName}`);

        if (duration > 100) {
          console.warn(`Slow tab switch detected: ${duration.toFixed(2)}ms`);
        }
      }, 0);
    };
  }

  // Adaptive cleanup: schedules the next run based on page visibility
  _scheduleCleanup() {
    const baseInterval = 30000;

    this._cleanupTimerId = setTimeout(() => {
      if (!document.hidden) {
        this.cleanupUnusedResources();
      }
      this._scheduleCleanup();
    }, baseInterval);
  }

  cleanup() {
    if (this._visibilityHandler) {
      document.removeEventListener("visibilitychange", this._visibilityHandler);
      this._visibilityHandler = null;
    }
    if (this._canvasObserver) {
      this._canvasObserver.disconnect();
      this._canvasObserver = null;
    }
    if (this._cleanupTimerId) {
      clearTimeout(this._cleanupTimerId);
      this._cleanupTimerId = null;
    }
  }

  initialize() {
    if (this.isInitialized) return;

    this.optimizeEditor();
    this.optimizeCanvasRendering();
    this.setupPerformanceObserver();

    this._scheduleCleanup();

    document.addEventListener("mouseover", (e) => {
      if (e.target.classList.contains("tab")) {
        const tabName = e.target.getAttribute("data-tab");
        if (tabName) {
          setTimeout(() => this.preloadTab(tabName), 100);
        }
      }
    });

    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      this.enableDebugging();
    }

    this.isInitialized = true;
  }
}

window.performanceManager = new PerformanceManager();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.performanceManager.initialize();
  });
} else {
  window.performanceManager.initialize();
}
