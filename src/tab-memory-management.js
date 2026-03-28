class TabMemoryManager {
  constructor() {
    this.tabResources = new Map();
    this.cleanupQueue = [];
    this.memoryStats = {
      totalCleanups: 0,
      lastCleanupTime: 0,
      leakedObjects: 0,
    };
    this.isCleaningUp = false;
  }

  registerTabResources(tabName, resources) {
    if (!this.tabResources.has(tabName)) {
      this.tabResources.set(tabName, {
        board: null,
        pixiApp: null,
        htmlElements: [],
        eventListeners: [],
        intervals: [],
        timeouts: [],
        observers: [],
        customObjects: [],
        createdAt: Date.now(),
      });
    }

    const tabData = this.tabResources.get(tabName);
    Object.assign(tabData, resources);
  }

  async cleanupTab(tabName) {
    if (this.isCleaningUp) {
      console.warn("Cleanup already in progress, queuing tab:", tabName);
      this.cleanupQueue.push(tabName);
      return;
    }

    this.isCleaningUp = true;
    const startTime = performance.now();

    try {
      const tabData = this.tabResources.get(tabName);
      if (!tabData) {
        return;
      }

      if (tabData.board) {
        await this.destroyBoard(tabData.board);
      }

      if (tabData.pixiApp) {
        await this.destroyPixiApp(tabData.pixiApp);
      }

      this.cleanupHtmlElements(tabData.htmlElements);
      this.cleanupEventListeners(tabData.eventListeners);
      this.cleanupTimers(tabData);
      this.cleanupObservers(tabData.observers);
      this.cleanupCustomObjects(tabData.customObjects);
      this.tabResources.delete(tabName);
      this.cleanupGlobalReferences();

      if (window.gc) {
        window.gc();
      }

      const duration = performance.now() - startTime;
      this.memoryStats.totalCleanups++;
      this.memoryStats.lastCleanupTime = duration;
    } catch (error) {
      console.error("Error during tab cleanup:", error);
    } finally {
      this.isCleaningUp = false;

      if (this.cleanupQueue.length > 0) {
        const nextTab = this.cleanupQueue.shift();
        setTimeout(() => this.cleanupTab(nextTab), 0);
      }
    }
  }

  async destroyBoard(board) {
    if (!board) return;

    try {
      if (board.maintenanceInterval) {
        clearInterval(board.maintenanceInterval);
        board.maintenanceInterval = null;
      }

      if (board.resizeTimeout) {
        clearTimeout(board.resizeTimeout);
        board.resizeTimeout = null;
      }

      board.stopDrag();

      board.mouseListeners.clear();
      board.globalMouseListeners = [];
      board.dragConstraints.clear();

      const childrenToDestroy = [...board.allChildren];
      childrenToDestroy.forEach((child) => {
        try {
          if (child && !child.destroyed) {
            board.destroyChild(child);
          }
        } catch (e) {
          console.warn("Error destroying child:", e);
        }
      });

      board.allChildren = [];
      board.UIElements = [];

      if (board.objectPool) {
        board.objectPool.forEach((pool, type) => {
          pool.forEach((obj) => {
            if (obj && obj.destroy) {
              try {
                obj.destroy(true);
              } catch (e) {
                console.warn("Error destroying pooled object:", e);
              }
            }
          });
        });
        board.objectPool.clear();
      }

      if (board.world && !board.world.destroyed) {
        board.world.destroy({
          children: true,
          texture: true,
          baseTexture: true,
        });
      }

      if (board.worldMask && !board.worldMask.destroyed) {
        board.worldMask.destroy();
      }

      if (board.preloader && board.preloader.destroy) {
        board.preloader.destroy();
      }

      if (typeof board.destroy === "function") {
        board.destroy();
      }

      if (window.Board && window.Board[Symbol.for("instance")] === board) {
        delete window.Board[Symbol.for("instance")];
      }

      if (window.board === board) {
        delete window.board;
      }
    } catch (error) {
      console.error("Error destroying board:", error);
    }
  }

  async destroyPixiApp(app) {
    if (!app) return;

    try {
      if (app.ticker) {
        app.ticker.stop();
        app.ticker.destroy();
      }

      if (app.stage) {
        while (app.stage.children.length > 0) {
          const child = app.stage.children[0];
          app.stage.removeChild(child);
          if (child.destroy) {
            child.destroy(true);
          }
        }
      }

      if (app.renderer) {
        if (app.renderer.textureGC) {
          app.renderer.textureGC.run();
        } else if (app.renderer.texture && app.renderer.texture.gc) {
          app.renderer.texture.gc.run();
        }
      }

      if (app.view && app.view.parentNode) {
        app.view.parentNode.removeChild(app.view);
      }

      app.destroy(true, {
        children: true,
        texture: true,
        baseTexture: true,
      });

      if (window.app === app) {
        delete window.app;
      }
    } catch (error) {
      console.error("Error destroying PIXI app:", error);
    }
  }

  cleanupHtmlElements(elements) {
    if (!elements || !Array.isArray(elements)) return;

    elements.forEach((element) => {
      try {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      } catch (e) {
        console.warn("Error removing HTML element:", e);
      }
    });
  }

  cleanupEventListeners(listeners) {
    if (!listeners || !Array.isArray(listeners)) return;

    listeners.forEach(({ element, event, handler }) => {
      try {
        if (element && handler) {
          element.removeEventListener(event, handler);
        }
      } catch (e) {
        console.warn("Error removing event listener:", e);
      }
    });
  }

  cleanupTimers(tabData) {
    if (tabData.intervals) {
      tabData.intervals.forEach((id) => clearInterval(id));
    }

    if (tabData.timeouts) {
      tabData.timeouts.forEach((id) => clearTimeout(id));
    }
  }

  cleanupObservers(observers) {
    if (!observers || !Array.isArray(observers)) return;

    observers.forEach((observer) => {
      try {
        if (observer && observer.disconnect) {
          observer.disconnect();
        }
      } catch (e) {
        console.warn("Error disconnecting observer:", e);
      }
    });
  }

  cleanupCustomObjects(objects) {
    if (!objects || !Array.isArray(objects)) return;

    objects.forEach((obj) => {
      try {
        if (obj) {
          if (typeof obj.destroy === "function") {
            obj.destroy();
          } else if (typeof obj.cleanup === "function") {
            obj.cleanup();
          } else if (typeof obj.dispose === "function") {
            obj.dispose();
          }
        }
      } catch (e) {
        console.warn("Error cleaning up custom object:", e);
      }
    });
  }

  cleanupGlobalReferences() {
    if (window.PIXI) {
      try {
        if (PIXI.Assets && PIXI.Assets.cache) {
          const cache = PIXI.Assets.cache;
          if (cache && cache.reset) {
            cache.reset();
          }
        }

        if (PIXI.utils && PIXI.utils.TextureCache) {
          for (let key in PIXI.utils.TextureCache) {
            const texture = PIXI.utils.TextureCache[key];
            if (texture && texture.destroy) {
              texture.destroy(true);
            }
          }
        }
      } catch (e) {
        console.warn("Error cleaning PIXI cache:", e);
      }
    }

    const uiOverlay = document.getElementById("pixi-ui-overlay");
    if (uiOverlay) {
      uiOverlay.innerHTML = "";
    }

    const canvasContainer = document.getElementById("canvas-container");
    if (canvasContainer) {
      while (canvasContainer.firstChild) {
        canvasContainer.removeChild(canvasContainer.firstChild);
      }
    }
  }

  addManagedEventListener(tabName, element, event, handler) {
    const tabData = this.tabResources.get(tabName);
    if (!tabData) return;

    element.addEventListener(event, handler);
    tabData.eventListeners.push({ element, event, handler });
  }

  addManagedInterval(tabName, callback, delay) {
    const tabData = this.tabResources.get(tabName);
    if (!tabData) return null;

    const id = setInterval(callback, delay);
    tabData.intervals.push(id);
    return id;
  }

  addManagedTimeout(tabName, callback, delay) {
    const tabData = this.tabResources.get(tabName);
    if (!tabData) return null;

    const id = setTimeout(callback, delay);
    tabData.timeouts.push(id);
    return id;
  }

  getMemoryStats() {
    const stats = {
      ...this.memoryStats,
      activeTabsCount: this.tabResources.size,
      activeTabs: Array.from(this.tabResources.keys()),
      memoryUsage: null,
    };

      if (performance.memory) {
      stats.memoryUsage = {
        usedJSHeapSize:
          (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + " MB",
        totalJSHeapSize:
          (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + " MB",
        jsHeapSizeLimit:
          (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + " MB",
      };
    }

    return stats;
  }

  logDebugInfo() {}
}

window.tabMemoryManager = new TabMemoryManager();

const originalSwitchTab = window.switchTab;
window.switchTab = async function (tabName) {
  const activeTab = document.querySelector(".tab.active");
  if (activeTab) {
    const activeTabName = activeTab.getAttribute("data-tab");
    if (activeTabName && activeTabName !== tabName) {
      await window.tabMemoryManager.cleanupTab(activeTabName);
    }
  }

  originalSwitchTab(tabName);
};

const originalCloseTab = window.closeTab;
window.closeTab = async function (tabName) {
  await window.tabMemoryManager.cleanupTab(tabName);
  originalCloseTab(tabName);
};

const originalRunCode = window.runCode;
window.runCode = function () {
  const activeTab = document.querySelector(".tab.active");
  if (!activeTab) {
    originalRunCode();
    return;
  }

  const tabName = activeTab.getAttribute("data-tab");

  if (window.tabMemoryManager.tabResources.has(tabName)) {
    window.tabMemoryManager.cleanupTab(tabName).then(() => {
      executeCodeAndRegister();
    });
  } else {
    executeCodeAndRegister();
  }

  function executeCodeAndRegister() {
    originalRunCode();

    setTimeout(() => {
      let boardInstance = null;
      if (window.Board && typeof window.Board.getInstance === "function") {
        boardInstance = window.Board.getInstance();
      } else if (window.board) {
        boardInstance = window.board;
      }

      const pixiApp = window.app;
      const uiOverlay = document.getElementById("pixi-ui-overlay");
      const htmlElements = uiOverlay ? Array.from(uiOverlay.children) : [];

      window.tabMemoryManager.registerTabResources(tabName, {
        board: boardInstance,
        pixiApp: pixiApp,
        htmlElements: htmlElements,
      });
    }, 100);
  }
};

window.emergencyCleanup = async function () {
  console.warn("Running emergency cleanup for all tabs...");
  const allTabs = Array.from(window.tabMemoryManager.tabResources.keys());

  for (const tabName of allTabs) {
    await window.tabMemoryManager.cleanupTab(tabName);
  }

  if (window.gc) {
    window.gc();
  }

  window.tabMemoryManager.logDebugInfo();
};

window.tmm = {
  stats: () => window.tabMemoryManager.getMemoryStats(),
  debug: () => window.tabMemoryManager.logDebugInfo(),
  cleanup: (tabName) => window.tabMemoryManager.cleanupTab(tabName),
  emergency: () => window.emergencyCleanup(),
};
