// Shows a cookie consent banner when the user has not yet decided.
// Consent status is persisted in localStorage; cookies are only written after acceptance.

window.CookieConsent = {
  STORAGE_KEY: "cookie_consent",
  CONSENT_ACCEPTED: "accepted",
  CONSENT_DECLINED: "declined",

  translations: {
    title: {
      en: "Cookie Settings",
      de: "Cookie-Einstellungen",
    },
    message: {
      en: "We use cookies to save your preferences (theme and language) so they are remembered on your next visit. No tracking or advertising cookies are used.",
      de: "Wir verwenden Cookies, um Ihre Einstellungen (Theme und Sprache) zu speichern, damit diese beim nächsten Besuch erhalten bleiben. Es werden keine Tracking- oder Werbe-Cookies eingesetzt.",
    },
    accept: {
      en: "Accept",
      de: "Akzeptieren",
    },
    decline: {
      en: "Decline",
      de: "Ablehnen",
    },
    info: {
      en: "Your settings will still work during this session, but won't be saved as cookies.",
      de: "Ihre Einstellungen funktionieren weiterhin in dieser Sitzung, werden aber nicht als Cookies gespeichert.",
    },
  },

  isAccepted: function () {
    return localStorage.getItem(this.STORAGE_KEY) === this.CONSENT_ACCEPTED;
  },

  hasDecided: function () {
    const val = localStorage.getItem(this.STORAGE_KEY);
    return val === this.CONSENT_ACCEPTED || val === this.CONSENT_DECLINED;
  },

  /**
   * Sets a cookie only when consent has been accepted.
   * Central helper used by all other modules.
   * @returns {boolean} true if the cookie was written
   */
  setCookie: function (name, value, days) {
    if (!this.isAccepted()) {
      return false;
    }
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    return true;
  },

  deleteCookie: function (name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
  },

  getCookie: function (name) { return window.getCookie(name); },

  getLanguage: function () {
    return (
      window.__detectedLanguage || localStorage.getItem("language") || "en"
    );
  },

  t: function (key) {
    const lang = this.getLanguage();
    return (
      (this.translations[key] && this.translations[key][lang]) ||
      (this.translations[key] && this.translations[key]["en"]) ||
      key
    );
  },

  accept: function () {
    localStorage.setItem(this.STORAGE_KEY, this.CONSENT_ACCEPTED);

    // Migrate any existing localStorage preferences to cookies now that consent is granted
    this.migratePreferencesToCookies();

    this.removeBanner();

    document.dispatchEvent(
      new CustomEvent("cookieConsentChanged", {
        detail: { accepted: true },
      }),
    );
  },

  decline: function () {
    localStorage.setItem(this.STORAGE_KEY, this.CONSENT_DECLINED);

    this.deleteCookie("theme");
    this.deleteCookie("language");

    this.removeBanner();

    document.dispatchEvent(
      new CustomEvent("cookieConsentChanged", {
        detail: { accepted: false },
      }),
    );
  },

  migratePreferencesToCookies: function () {
    const theme = localStorage.getItem("theme");
    if (theme) {
      this.setCookie("theme", theme, 365);
    }

    const language = localStorage.getItem("language");
    if (language) {
      this.setCookie("language", language, 365);
    }
  },

  removeBanner: function () {
    const banner = document.getElementById("cookie-consent-banner");
    if (banner) {
      banner.classList.add("hiding");
      setTimeout(() => {
        if (banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
      }, 400);
    }
  },

  showBanner: function () {
    if (this.hasDecided()) return;

    this.injectStyles();

    const banner = document.createElement("div");
    banner.id = "cookie-consent-banner";
    banner.className = "cookie-consent-banner";

    banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-icon">🍪</div>
                <div class="cookie-consent-text">
                    <strong class="cookie-consent-title">${this.t("title")}</strong>
                    <p class="cookie-consent-message">${this.t("message")}</p>
                </div>
                <div class="cookie-consent-actions">
                    <button class="cookie-consent-btn cookie-consent-accept" id="cookie-consent-accept">
                        ${this.t("accept")}
                    </button>
                    <button class="cookie-consent-btn cookie-consent-decline" id="cookie-consent-decline">
                        ${this.t("decline")}
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(banner);

    document
      .getElementById("cookie-consent-accept")
      .addEventListener("click", () => {
        this.accept();
      });

    document
      .getElementById("cookie-consent-decline")
      .addEventListener("click", () => {
        this.decline();
      });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        banner.classList.add("visible");
      });
    });
  },

  injectStyles: function () {
    if (document.getElementById("cookie-consent-styles")) return;
    const link = document.createElement("link");
    link.id = "cookie-consent-styles";
    link.rel = "stylesheet";
    link.href = "src/cookie-consent.css";
    document.head.appendChild(link);
  },

  init: function () {
    if (document.getElementById("preloader")) {
      // Wait for the preloader to finish so the banner doesn't appear over the splash screen
      window.addEventListener("preloaderComplete", () => {
        setTimeout(() => {
          this.showBanner();
        }, 800);
      });
    } else {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          setTimeout(() => this.showBanner(), 500);
        });
      } else {
        setTimeout(() => this.showBanner(), 500);
      }
    }
  },
};

window.CookieConsent.init();
