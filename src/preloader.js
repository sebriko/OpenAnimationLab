// Preloader manager with background initialization.
// Language detection is cookie-consent-aware; defaults to English.

window.PreloaderManager = {
  startTime: Date.now(),
  minimumDisplayTime: 2000,
  maximumWaitTime: 8000,
  checkInterval: null,
  progress: 0,
  currentLanguage: "en",
  initializationStarted: false,
  initializationComplete: false,

  translations: {
    subtitle: {
      en: "Open-Source Editor for Educational Animations",
      de: "Open-Source-Editor für didaktische Animationen",
    },
    initializing: {
      en: "Initializing Editor...",
      de: "Initialisiere Editor...",
    },
    loadingComponents: {
      en: "Loading Components...",
      de: "Lade Komponenten...",
    },
    loadingLibraries: {
      en: "Loading Libraries...",
      de: "Lade Bibliotheken...",
    },
    loadingTemplate: {
      en: "Loading Template...",
      de: "Lade Vorlage...",
    },
    almostReady: {
      en: "Almost ready...",
      de: "Fast fertig...",
    },
    ready: {
      en: "Ready!",
      de: "Bereit!",
    },
  },

  init: function () {
    this.detectLanguage();
    this.addSubtitle();

    document.body.classList.add("loading");
    this.startBackgroundInitialization();
    this.waitForLoad();
  },

  delay: function (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  startBackgroundInitialization: function () {
    if (this.initializationStarted) return;
    this.initializationStarted = true;

    setTimeout(() => {
      this.initializeApplication();
    }, 100);
  },

  initializeApplication: async function () {
    try {
      this.updateProgress(20);
      this.updateStatus(this.t("loadingComponents"));

      if (typeof window.initializeEditor === "function") {
        window.initializeEditor();
      }

      await this.delay(100);
      this.updateProgress(40);

      const canvasContainer = document.getElementById("canvas-container");
      if (canvasContainer) {
        canvasContainer.style.visibility = "hidden";
        canvasContainer.style.position = "absolute";
      }

      if (typeof setupDragFunctionality === "function") {
        setupDragFunctionality();
      }

      this.updateProgress(50);

      await this.delay(100);
      this.updateProgress(60);
      this.updateStatus(this.t("loadingLibraries"));

      if (typeof setupSearchForm === "function") {
        setupSearchForm();
      }

      if (window.i18n) {
        window.i18n.applyLanguage();
      }

      this.updateProgress(70);

      if (window.performanceManager) {
        window.performanceManager.initialize();
      }

      await this.delay(100);
      this.updateProgress(75);

      if (typeof addTab === "function") {
        const urlParams = new URLSearchParams(window.location.search);
        const templateParam = urlParams.get("t");

        if (templateParam) {
          this.updateStatus(this.t("loadingTemplate") || "Loading template...");

          // Store template info for loading after the preloader dismisses
          window._pendingTemplateLoad = {
            templateParam: templateParam,
            shouldLoad: true,
          };

          document.getElementById("preview-table").style.display = "none";

          if (typeof findTemplateByImageName === "function") {
            const template = findTemplateByImageName(templateParam);
            if (template) {
              window._pendingTemplateLoad.template = template;
            }
          }
        }
      }

      this.updateProgress(85);

      await this.delay(100);
      this.updateProgress(90);
      this.updateStatus(this.t("almostReady"));

      await this.delay(200);
      this.updateProgress(95);
      this.updateStatus(this.t("ready"));
      this.initializationComplete = true;
    } catch (error) {
      console.error("Error during background initialization:", error);
      // Mark complete so the preloader doesn't hang on error
      this.initializationComplete = true;
    }
  },

  // Priority: window.__detectedLanguage (set by index.html early detection),
  // then localStorage, then cookie (only with consent), then browser language.
  detectLanguage: function () {
    if (
      window.__detectedLanguage &&
      ["en", "de"].includes(window.__detectedLanguage)
    ) {
      this.currentLanguage = window.__detectedLanguage;
      return;
    }

    let savedLanguage = localStorage.getItem("language");

    if (!savedLanguage) {
      const consentGiven = localStorage.getItem("cookie_consent") === "accepted";
      if (consentGiven) {
        savedLanguage = this.getCookie("language");
      }
    }

    if (savedLanguage && ["en", "de"].includes(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    } else {
      const browserLang = navigator.language.substring(0, 2);
      this.currentLanguage = browserLang === "de" ? "de" : "en";
    }
  },

  getCookie: function (name) { return window.getCookie(name); },

  t: function (key) {
    return (
      this.translations[key]?.[this.currentLanguage] ||
      this.translations[key]?.["en"] ||
      key
    );
  },

  addSubtitle: function () {
    const titleElement =
      document.querySelector(".preloader-title") ||
      document.querySelector(".preloader h1") ||
      document.querySelector("#preloader h1");

    if (titleElement && !document.querySelector(".preloader-subtitle")) {
      const subtitle = document.createElement("div");
      subtitle.className = "preloader-subtitle";
      subtitle.textContent = this.t("subtitle");
      subtitle.style.cssText = `
                font-size: 0.7em;
                margin-top: 0.5rem;
                opacity: 0.8;
                font-weight: 300;
                letter-spacing: 0.05em;
            `;

      titleElement.parentNode.insertBefore(subtitle, titleElement.nextSibling);
    }

    const logoContainer =
      document.querySelector(".preloader-logo") ||
      document.querySelector(".preloader-header");

    if (logoContainer && !document.querySelector(".preloader-subtitle")) {
      const existingSubtitle = logoContainer.querySelector(
        ".preloader-subtitle",
      );
      if (!existingSubtitle) {
        const subtitle = document.createElement("div");
        subtitle.className = "preloader-subtitle";
        subtitle.textContent = this.t("subtitle");
        subtitle.style.cssText = `
                    font-size: 0.7em;
                    margin-top: 0.5rem;
                    opacity: 0.8;
                    font-weight: 300;
                    letter-spacing: 0.05em;
                    text-align: center;
                `;
        logoContainer.appendChild(subtitle);
      }
    }
  },

  waitForLoad: function () {
    this.checkInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime;

      if (this.initializationComplete && elapsed >= this.minimumDisplayTime) {
        this.completeLoading();
      }

      if (elapsed >= this.maximumWaitTime) {
        console.warn("Maximum wait time reached, forcing load completion");
        this.completeLoading();
      }
    }, 100);
  },

  updateProgress: function (percentage) {
    this.progress = percentage;

    const progressBar = document.querySelector(".preloader-progress-bar");
    const percentageText = document.querySelector(".preloader-percentage");

    if (progressBar) {
      progressBar.style.width = percentage + "%";
    }

    if (percentageText) {
      percentageText.textContent = Math.round(percentage) + "%";
    }
  },

  updateStatus: function (message) {
    const statusElement = document.querySelector(".preloader-status");
    if (statusElement) {
      statusElement.textContent = message;
    }
  },

  completeLoading: function () {
    clearInterval(this.checkInterval);
    this.updateProgress(100);

    const preloader = document.getElementById("preloader");

    setTimeout(() => {
      preloader.classList.add("fade-out");

      setTimeout(() => {
        document.body.classList.remove("loading");
        preloader.style.display = "none";
        document.body.style.overflow = "";
        window.dispatchEvent(new Event("preloaderComplete"));
      }, 500);
    }, 300);
  },
};

// Called by the preloader to pre-activate theme stylesheets
window.initializeEditor = function () {
  const themes = ["neat", "darcula"];
  themes.forEach((theme) => {
    const link = document.querySelector(`link[href*="${theme}.css"]`);
    if (link) {
      link.media = "all";
    }
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    window.PreloaderManager.init();
  });
} else {
  window.PreloaderManager.init();
}
