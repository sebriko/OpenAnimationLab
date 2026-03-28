class PerformanceManager {
  constructor() {
    this.lastExecutedCode = "";
    this.codeExecutionTimeout = null;
    this.tabPreloadCache = new Map();
    this.editorChangeTimeout = null;
    this.isInitialized = false;
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
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        window.app.ticker.maxFPS = 10;
      } else {
        window.app.ticker.maxFPS = 60;
      }
    });

    const observer = new IntersectionObserver((entries) => {
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
      observer.observe(canvasContainer);
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

  initialize() {
    if (this.isInitialized) return;

    this.optimizeEditor();
    this.optimizeCanvasRendering();
    this.setupPerformanceObserver();

    setInterval(() => this.cleanupUnusedResources(), 30000);

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
