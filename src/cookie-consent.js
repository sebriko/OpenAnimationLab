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

  getCookie: function (name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

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

    const style = document.createElement("style");
    style.id = "cookie-consent-styles";
    style.textContent = `
            .cookie-consent-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 99999;
                transform: translateY(100%);
                transition: transform 0.4s ease-out, opacity 0.4s ease-out;
                opacity: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .cookie-consent-banner.visible {
                transform: translateY(0);
                opacity: 1;
            }
            
            .cookie-consent-banner.hiding {
                transform: translateY(100%);
                opacity: 0;
            }
            
            .cookie-consent-content {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px 24px;
                margin: 0 auto;
                max-width: 1200px;
                border-top: 1px solid var(--border-light, #ddd);
                box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.12);
            }
            
            .cookie-consent-content {
                background: var(--bg-dark, #ffffff);
                color: var(--text-light, #333);
            }
            
            .cookie-consent-icon {
                font-size: 28px;
                flex-shrink: 0;
            }
            
            .cookie-consent-text {
                flex: 1;
                min-width: 0;
            }
            
            .cookie-consent-title {
                display: block;
                margin-bottom: 4px;
                font-size: 14px;
                font-weight: 600;
                color: var(--text-light, #333);
            }
            
            .cookie-consent-message {
                margin: 0;
                font-size: 13px;
                line-height: 1.4;
                color: var(--text-light, #666);
            }
            
            .cookie-consent-actions {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }
            
            .cookie-consent-btn {
                padding: 8px 20px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
                border: none;
                outline: none;
            }
            
            .cookie-consent-accept {
                background: var(--accent-color, #0056b3);
                color: #fff;
            }
            
            .cookie-consent-accept:hover {
                background: var(--accent-hover, #004494);
            }
            
            .cookie-consent-decline {
                background: var(--bg-lighter, #f0f0f0);
                color: var(--text-light, #333);
                border: 1px solid var(--border-light, #ddd);
            }
            
            .cookie-consent-decline:hover {
                background: var(--bg-medium, #e0e0e0);
            }
            
            /* Responsive */
            @media (max-width: 700px) {
                .cookie-consent-content {
                    flex-direction: column;
                    text-align: center;
                    padding: 20px 16px;
                }
                
                .cookie-consent-actions {
                    width: 100%;
                    justify-content: center;
                }
                
                .cookie-consent-btn {
                    flex: 1;
                    max-width: 160px;
                }
            }
        `;

    document.head.appendChild(style);
  },

  init: function () {
    const self = this;

    if (document.getElementById("preloader")) {
      // Wait for the preloader to finish so the banner doesn't appear over the splash screen
      window.addEventListener("preloaderComplete", function () {
        setTimeout(() => {
          self.showBanner();
        }, 800);
      });
    } else {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          setTimeout(() => self.showBanner(), 500);
        });
      } else {
        setTimeout(() => self.showBanner(), 500);
      }
    }
  },
};

window.CookieConsent.init();
