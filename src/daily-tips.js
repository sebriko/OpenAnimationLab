(function () {
  "use strict";

  const TIPS_DATA = {
    de: {
      tips: [
        {
          id: 1,
          title: "Tastenkombinationen nutzen",
          paragraphs: [
            "Mit Strg+Enter können Sie nach einer Codeänderung die Animation sofort aktualisieren",
            "Mit Strg+S können Sie Ihren Code schnell speichern.",
            "Strg+F öffnet die Suchfunktion im Editor.",
            "Strg+B fügt alle Klasseninformationen des aktuellen Codes in die Zwischenablage ein (für KI-Prompts)",
          ],
          image: null,
        },
        {
          id: 2,
          title: "Code-Vorlagen verwenden",
          paragraphs: [
            "Nutzen Sie die integrierten Projektvorlagen für einen schnellen Start.",
            "Die Vorlagen enthalten bewährte Strukturen und Beispielcode.",
            "Sie können eigene Vorlagen erstellen und speichern.",
          ],
          image: null,
        },
        {
          id: 3,
          title: "Dark Mode für augenschonendes Arbeiten",
          paragraphs: [
            "Wechseln Sie zwischen Light und Dark Theme mit dem Helligkeitssymbol.",
            "Das gewählte Theme wird automatisch gespeichert.",
            "Der Dark Mode reduziert die Augenbelastung bei längerer Arbeit.",
          ],
          image: null,
        },
        {
          id: 4,
          title: "Mehrere Projekte gleichzeitig",
          paragraphs: [
            "Nutzen Sie die Tab-Funktion für mehrere Projekte.",
            "Klicken Sie auf das + Symbol, um einen neuen Tab zu erstellen.",
            "Jeder Tab speichert seinen eigenen Code und Zustand.",
          ],
          image: null,
        },
        {
          id: 5,
          title: "Screenshots erstellen",
          paragraphs: [
            "Mit dem Kamera-Symbol können Sie Screenshots Ihrer Animationen erstellen.",
            "Screenshots werden automatisch mit Zeitstempel benannt.",
            "Perfekt für Dokumentation und Präsentationen.",
          ],
          image: null,
        },
        {
          id: 6,
          title: "Vollbildmodus nutzen",
          paragraphs: [
            "Verwenden Sie den Vollbildmodus für eine bessere Präsentation.",
            "Das Vollbild-Symbol befindet sich rechts unten.",
            "Mit ESC verlassen Sie den Vollbildmodus wieder.",
          ],
          image: null,
        },
        {
          id: 7,
          title: "Code-Fehler finden",
          paragraphs: [
            "Der Editor zeigt Syntaxfehler direkt in der Zeile an.",
            "Nutzen Sie die Konsole für Debug-Ausgaben mit console.log().",
            "Die Nachrichtenfunktion zeigt alle Ausgaben übersichtlich an.",
          ],
          image: null,
        },
      ],
    },
    en: {
      tips: [
        {
          id: 1,
          title: "Using Keyboard Shortcuts",
          paragraphs: [
            "Press Ctrl+Enter to instantly update the animation after a code change.",
            "Press Ctrl+S to quickly save your code.",
            "Ctrl+F opens the search function in the editor.",
            "Ctrl+B copies all class information of the current code to the clipboard (for AI prompts).",
          ],
          image: null,
        },
        {
          id: 2,
          title: "Use Code Templates",
          paragraphs: [
            "Use the integrated project templates for a quick start.",
            "Templates contain proven structures and example code.",
            "You can create and save your own templates.",
          ],
          image: null,
        },
        {
          id: 3,
          title: "Dark Mode for Eye-Friendly Work",
          paragraphs: [
            "Switch between Light and Dark theme with the brightness icon.",
            "Your chosen theme is automatically saved.",
            "Dark mode reduces eye strain during extended work.",
          ],
          image: null,
        },
        {
          id: 4,
          title: "Multiple Projects Simultaneously",
          paragraphs: [
            "Use the tab function for multiple projects.",
            "Click the + symbol to create a new tab.",
            "Each tab saves its own code and state.",
          ],
          image: null,
        },
        {
          id: 5,
          title: "Create Screenshots",
          paragraphs: [
            "Use the camera icon to create screenshots of your animations.",
            "Screenshots are automatically named with timestamps.",
            "Perfect for documentation and presentations.",
          ],
          image: null,
        },
        {
          id: 6,
          title: "Use Fullscreen Mode",
          paragraphs: [
            "Use fullscreen mode for better presentation.",
            "The fullscreen icon is located at the bottom right.",
            "Press ESC to exit fullscreen mode.",
          ],
          image: null,
        },
        {
          id: 7,
          title: "Find Code Errors",
          paragraphs: [
            "The editor shows syntax errors directly in the line.",
            "Use the console for debug output with console.log().",
            "The message function displays all outputs clearly.",
          ],
          image: null,
        },
      ],
    },
  };

  window.TipOfTheDay = {
    tips: null,
    currentTipIndex: 0,
    isInitialized: false,
    modalWindow: null,

    config: {
      showOnStartup: true,
      showSequential: false, // true = sequential, false = random
      storageKey: "tipOfTheDay",
      cookieKey: "tipOfTheDaySettings",
    },

    hasUrlParameters() {
      return window.location.search.length > 0;
    },

    init() {
      if (this.isInitialized) return;

      // Skip when the page was loaded with URL parameters (e.g. direct template link)
      if (this.hasUrlParameters()) {
        return;
      }

      try {
        this.registerTranslations();
        this.loadSettings();
        this.loadTips();
        this.createModal();

        if (this.config.showOnStartup) {
          if (document.body.classList.contains("loading")) {
            // Wait for the preloader to finish before showing the tip
            window.addEventListener("preloaderComplete", () => {
              setTimeout(() => {
                this.showTip();
              }, 300);
            });
          } else {
            setTimeout(() => {
              this.showTip();
            }, 300);
          }
        }

        this.isInitialized = true;
      } catch (error) {
        console.error("Error initializing Tip of the Day:", error);
      }
    },

    registerTranslations() {
      if (!window.i18n || !window.i18n.translations) return;

      const tipTranslations = {
        tip_of_the_day: {
          de: "Tipp des Tages",
          en: "Tip of the Day",
        },
        previous: {
          de: "Vorheriger",
          en: "Previous",
        },
        next: {
          de: "Nächster",
          en: "Next",
        },
        show_on_startup: {
          de: "Tipp beim Start anzeigen",
          en: "Show tip on startup",
        },
      };

      Object.keys(tipTranslations).forEach((key) => {
        if (!window.i18n.translations[key]) {
          window.i18n.translations[key] = tipTranslations[key];
        }
      });
    },

    loadTips() {
      try {
        const lang = this.getCurrentLanguage();
        this.tips = TIPS_DATA[lang]?.tips || TIPS_DATA.de.tips;

        if (!this.tips || this.tips.length === 0) {
          throw new Error("No tips found");
        }
      } catch (error) {
        console.error("Error loading tips:", error);
        this.tips = this.getDefaultTips();
      }
    },

    getCurrentLanguage() {
      if (window.i18n && window.i18n.getCurrentLanguage) {
        return window.i18n.getCurrentLanguage();
      }

      const cookieLang = this.getCookie("language");
      if (cookieLang) return cookieLang;

      const storedLang = localStorage.getItem("language");
      if (storedLang) return storedLang;

      return "de";
    },

    getCookie(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
          return c.substring(nameEQ.length, c.length);
      }
      return null;
    },

    setCookie(name, value, days = 365) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = "expires=" + date.toUTCString();
      document.cookie = name + "=" + value + ";" + expires + ";path=/";
    },

    loadSettings() {
      try {
        const stored = localStorage.getItem(this.config.storageKey);
        if (stored) {
          const settings = JSON.parse(stored);
          this.currentTipIndex = settings.currentTipIndex || 0;
          if (typeof settings.showOnStartup !== "undefined") {
            this.config.showOnStartup = settings.showOnStartup;
          }
          if (typeof settings.showSequential !== "undefined") {
            this.config.showSequential = settings.showSequential;
          }
        }

        const cookieSettings = this.getCookie(this.config.cookieKey);
        if (cookieSettings && !stored) {
          const settings = JSON.parse(decodeURIComponent(cookieSettings));
          this.currentTipIndex = settings.currentTipIndex || 0;
          if (typeof settings.showOnStartup !== "undefined") {
            this.config.showOnStartup = settings.showOnStartup;
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    },

    saveSettings() {
      const settings = {
        currentTipIndex: this.currentTipIndex,
        showOnStartup: this.config.showOnStartup,
        showSequential: this.config.showSequential,
      };

      localStorage.setItem(this.config.storageKey, JSON.stringify(settings));
      this.setCookie(
        this.config.cookieKey,
        encodeURIComponent(JSON.stringify(settings)),
      );
    },

    createModal() {
      if (document.getElementById("tipOfTheDayWindow")) {
        this.modalWindow = document.getElementById("tipOfTheDayWindow");
        return;
      }

      const modalHTML = `
                <div id="tipOfTheDayWindow" class="modal-window tip-of-day-window">
                    <div class="modal-window-header" id="tipOfTheDayHeader">
                        <div class="modal-window-title">
                            <span class="material-icons">lightbulb</span>
                            <span data-i18n="tip_of_the_day">Tipp des Tages</span>
                        </div>
                        <button class="modal-window-close" onclick="TipOfTheDay.closeTip()">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                    <div class="modal-window-content">
                        <div class="tip-content">
                            <h2 id="tipTitle" class="tip-title"></h2>
                            <div id="tipImage" class="tip-image" style="display: none;">
                                <img src="" alt="Tip illustration">
                            </div>
                            <div id="tipText" class="tip-text"></div>
                        </div>
                        
                        <div class="tip-navigation">
                            <button class="tip-nav-button" onclick="TipOfTheDay.previousTip()">
                                <span class="material-icons">arrow_back</span>
                                <span data-i18n="previous">Vorheriger</span>
                            </button>
                            
                            <div class="tip-counter">
                                <span id="tipCounter">1 / 1</span>
                            </div>
                            
                            <button class="tip-nav-button" onclick="TipOfTheDay.nextTip()">
                                <span data-i18n="next">Nächster</span>
                                <span class="material-icons">arrow_forward</span>
                            </button>
                        </div>
                        
                        <div class="tip-settings">
                            <label class="checkbox-container">
                                <input type="checkbox" id="showTipOnStartup" 
                                       onchange="TipOfTheDay.toggleShowOnStartup()"
                                       ${this.config.showOnStartup ? "checked" : ""}>
                                <span data-i18n="show_on_startup">Tipp beim Start anzeigen</span>
                            </label>
                        </div>
                    </div>
                </div>
            `;

      document.body.insertAdjacentHTML("beforeend", modalHTML);
      this.modalWindow = document.getElementById("tipOfTheDayWindow");

      this.setupDraggable();
      this.updateModalTranslations();
    },

    updateModalTranslations() {
      if (!this.modalWindow || !window.i18n || !window.i18n.translate) return;

      this.modalWindow.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.getAttribute("data-i18n");
        const translation = window.i18n.translate(key);
        if (translation && translation !== key) {
          if (element.tagName === "INPUT" && element.type === "text") {
            element.placeholder = translation;
          } else {
            element.textContent = translation;
          }
        }
      });
    },

    showTip(index = null) {
      if (!this.tips || this.tips.length === 0) {
        console.error("No tips available");
        return;
      }

      if (index !== null) {
        this.currentTipIndex = index;
      } else if (!this.config.showSequential) {
        this.currentTipIndex = Math.floor(Math.random() * this.tips.length);
      }
      // Sequential mode: index is already set and advanced on close

      this.currentTipIndex = Math.max(
        0,
        Math.min(this.currentTipIndex, this.tips.length - 1),
      );

      const tip = this.tips[this.currentTipIndex];

      this.updateTipContent(tip);

      this.modalWindow.style.display = "block";
      this.modalWindow.style.opacity = "0";

      this.centerModal();

      setTimeout(() => {
        this.modalWindow.style.transition = "opacity 0.3s ease-in";
        this.modalWindow.style.opacity = "1";
      }, 10);

      this.updateCounter();
    },

    updateTipContent(tip) {
      const titleElement = document.getElementById("tipTitle");
      const textElement = document.getElementById("tipText");
      const imageElement = document.getElementById("tipImage");
      const imageImg = imageElement.querySelector("img");

      titleElement.textContent = tip.title || "";

      textElement.innerHTML = "";
      if (tip.paragraphs && Array.isArray(tip.paragraphs)) {
        tip.paragraphs.forEach((paragraph) => {
          const p = document.createElement("p");
          p.textContent = paragraph;
          textElement.appendChild(p);
        });
      }

      if (tip.image) {
        imageImg.src = tip.image;
        imageImg.alt = tip.title || "Tip illustration";
        imageElement.style.display = "block";
      } else {
        imageElement.style.display = "none";
      }
    },

    nextTip() {
      this.currentTipIndex = (this.currentTipIndex + 1) % this.tips.length;
      const tip = this.tips[this.currentTipIndex];
      this.updateTipContent(tip);
      this.updateCounter();
      this.saveSettings();
    },

    previousTip() {
      this.currentTipIndex =
        (this.currentTipIndex - 1 + this.tips.length) % this.tips.length;
      const tip = this.tips[this.currentTipIndex];
      this.updateTipContent(tip);
      this.updateCounter();
      this.saveSettings();
    },

    updateCounter() {
      const counterElement = document.getElementById("tipCounter");
      if (counterElement) {
        counterElement.textContent = `${this.currentTipIndex + 1} / ${this.tips.length}`;
      }
    },

    closeTip() {
      if (this.modalWindow) {
        this.modalWindow.style.transition = "opacity 0.2s ease-out";
        this.modalWindow.style.opacity = "0";

        setTimeout(() => {
          this.modalWindow.style.display = "none";

          // In sequential mode, advance the index so the next open shows the next tip
          if (this.config.showSequential) {
            this.currentTipIndex =
              (this.currentTipIndex + 1) % this.tips.length;
          }

          this.saveSettings();
        }, 200);
      }
    },

    toggleShowOnStartup() {
      const checkbox = document.getElementById("showTipOnStartup");
      this.config.showOnStartup = checkbox.checked;
      this.saveSettings();
    },

    centerModal() {
      if (!this.modalWindow) return;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const modalWidth = this.modalWindow.offsetWidth || 600;
      const modalHeight = this.modalWindow.offsetHeight || 450;

      const left = Math.max(50, (windowWidth - modalWidth) / 2);
      const top = Math.max(50, (windowHeight - modalHeight) / 2);

      this.modalWindow.style.position = "fixed";
      this.modalWindow.style.left = left + "px";
      this.modalWindow.style.top = top + "px";
      this.modalWindow.style.transform = "none";
    },

    setupDraggable() {
      const header = document.getElementById("tipOfTheDayHeader");
      if (!header) return;

      let isDragging = false;
      let dragOffset = { x: 0, y: 0 };

      header.addEventListener("mousedown", (e) => {
        if (e.target.closest(".modal-window-close")) return;

        isDragging = true;
        const rect = this.modalWindow.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;

        header.style.cursor = "grabbing";
        e.preventDefault();
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const newLeft = e.clientX - dragOffset.x;
        const newTop = e.clientY - dragOffset.y;

        const maxLeft = window.innerWidth - this.modalWindow.offsetWidth - 50;
        const maxTop = window.innerHeight - this.modalWindow.offsetHeight - 50;

        this.modalWindow.style.left =
          Math.max(50, Math.min(newLeft, maxLeft)) + "px";
        this.modalWindow.style.top =
          Math.max(50, Math.min(newTop, maxTop)) + "px";
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
        header.style.cursor = "move";
      });

      header.style.cursor = "move";
    },

    getDefaultTips() {
      return [
        {
          id: 1,
          title: "Willkommen beim Open Animation Lab!",
          paragraphs: [
            "Dieser Editor ermöglicht es Ihnen, interaktive Animationen zu erstellen.",
            "Nutzen Sie die Projektvorlagen für einen schnellen Start.",
          ],
          image: null,
        },
      ];
    },

    open() {
      this.showTip();
    },

    close() {
      this.closeTip();
    },
  };

  document.addEventListener("languageChanged", function () {
    if (window.TipOfTheDay.isInitialized) {
      window.TipOfTheDay.registerTranslations();
      window.TipOfTheDay.loadTips();
      window.TipOfTheDay.updateModalTranslations();

      if (
        window.TipOfTheDay.modalWindow &&
        window.TipOfTheDay.modalWindow.style.display === "block"
      ) {
        const tip = window.TipOfTheDay.tips[window.TipOfTheDay.currentTipIndex];
        window.TipOfTheDay.updateTipContent(tip);
        window.TipOfTheDay.updateCounter();
      }
    }
  });

  // Initialisierung beim DOM Ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.TipOfTheDay.init();
    });
  } else {
    // DOM bereits geladen
    setTimeout(() => {
      window.TipOfTheDay.init();
    }, 100);
  }
})();
