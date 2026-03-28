// Cookie-consent-aware: cookies are only set when consent has been granted.

document.addEventListener("DOMContentLoaded", function () {
  createLanguageSelector();
});

function createLanguageSelector() {
  const filebar = document.getElementById("filebar");
  if (!filebar) return;

  const languageContainer = document.createElement("div");
  languageContainer.className = "language-selector";

  const languageButton = document.createElement("button");
  languageButton.className = "regular-button language-button";
  languageButton.id = "language-button";
  languageButton.title = window.i18n ? window.i18n.t("language") : "Language";

  const currentLang = window.i18n
    ? window.i18n.getCurrentLanguage().toUpperCase()
    : "EN";
  languageButton.innerHTML = `<span class="language-text">${currentLang}</span><span class="language-arrow">▼</span>`;

  const dropdown = document.createElement("div");
  dropdown.className = "language-dropdown";
  dropdown.id = "language-dropdown";

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ];

  languages.forEach((lang) => {
    const option = document.createElement("div");
    option.className = "language-option";
    option.dataset.lang = lang.code;
    option.innerHTML = `<span class="language-flag">${lang.flag}</span><span class="language-name">${lang.name}</span>`;

    option.addEventListener("click", function () {
      const currentLanguage = window.i18n
        ? window.i18n.getCurrentLanguage()
        : "en";

      if (lang.code !== currentLanguage) {
        showTemplateReloadDialog(lang.code);
      }

      hideDropdown();
    });

    dropdown.appendChild(option);
  });

  languageContainer.appendChild(languageButton);
  languageContainer.appendChild(dropdown);

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    filebar.insertBefore(languageContainer, themeToggle);
  } else {
    filebar.appendChild(languageContainer);
  }

  languageButton.addEventListener("click", function (e) {
    e.stopPropagation();
    toggleDropdown();
  });

  document.addEventListener("click", function (e) {
    if (!languageContainer.contains(e.target)) {
      hideDropdown();
    }
  });

  updateActiveLanguage();
}

function showTemplateReloadDialog(newLangCode) {
  const dialogOverlay = document.createElement("div");
  dialogOverlay.className = "modal-overlay template-reload-dialog";
  dialogOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

  const dialogBox = document.createElement("div");
  dialogBox.className = "modal-box";
  dialogBox.style.cssText = `
        background: var(--bg-dark);
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        color: var(--text-light);
        border: 1px solid var(--border-light);
    `;

  const title = document.createElement("h3");
  title.textContent = getTranslation(
    "change_language_title",
    "Change Language",
  );
  title.style.marginTop = "0";
  title.style.marginBottom = "20px";
  title.style.color = "var(--text-primary)";

  const message = document.createElement("p");
  message.textContent = getTranslation(
    "reload_templates_message",
    "Changing the language will reload the application with language-specific templates. Any unsaved work will be lost. Do you want to continue?",
  );
  message.style.marginBottom = "25px";
  message.style.lineHeight = "1.5";
  message.style.color = "var(--text-light)";

  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;

  const cancelButton = document.createElement("button");
  cancelButton.className = "form-button";
  cancelButton.textContent = getTranslation("cancel", "Cancel");
  cancelButton.style.cssText = `
        padding: 8px 20px;
        background: var(--bg-lighter);
        color: var(--text-primary);
        border: 1px solid var(--border-light);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
    `;

  cancelButton.addEventListener("mouseover", () => {
    cancelButton.style.background = "var(--bg-medium)";
  });

  cancelButton.addEventListener("mouseout", () => {
    cancelButton.style.background = "var(--bg-lighter)";
  });

  cancelButton.addEventListener("click", () => {
    document.body.removeChild(dialogOverlay);
  });

  const confirmButton = document.createElement("button");
  confirmButton.className = "form-button primary";
  confirmButton.textContent = getTranslation(
    "reload_application",
    "Reload Application",
  );
  confirmButton.style.cssText = `
        padding: 8px 20px;
        background: var(--accent-color, #0056b3);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
    `;

  confirmButton.addEventListener("mouseover", () => {
    confirmButton.style.background = "var(--accent-hover, #004494)";
  });

  confirmButton.addEventListener("mouseout", () => {
    confirmButton.style.background = "var(--accent-color, #0056b3)";
  });

  confirmButton.addEventListener("click", () => {
    reloadWithNewLanguage(newLangCode);
  });

  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(confirmButton);

  dialogBox.appendChild(title);
  dialogBox.appendChild(message);
  dialogBox.appendChild(buttonContainer);

  dialogOverlay.appendChild(dialogBox);
  document.body.appendChild(dialogOverlay);

  const handleEsc = (e) => {
    if (e.key === "Escape") {
      document.body.removeChild(dialogOverlay);
      document.removeEventListener("keydown", handleEsc);
    }
  };
  document.addEventListener("keydown", handleEsc);

  confirmButton.focus();
}

function reloadWithNewLanguage(langCode) {
  if (window.i18n) {
    window.i18n.setLanguage(langCode);
  }

  // Always persist to localStorage (no consent required)
  localStorage.setItem("language", langCode);

  // Only write cookie when consent has been granted
  if (window.CookieConsent) {
    window.CookieConsent.setCookie("language", langCode, 365);
  }

  const url = new URL(window.location.href);
  url.searchParams.set("lang", langCode);
  window.location.href = url.toString();
}

function toggleDropdown() {
  const dropdown = document.getElementById("language-dropdown");
  const button = document.getElementById("language-button");

  if (dropdown.classList.contains("show")) {
    hideDropdown();
  } else {
    showDropdown();
  }
}

function showDropdown() {
  const dropdown = document.getElementById("language-dropdown");
  const button = document.getElementById("language-button");

  dropdown.classList.add("show");
  button.classList.add("active");
}

function hideDropdown() {
  const dropdown = document.getElementById("language-dropdown");
  const button = document.getElementById("language-button");

  dropdown.classList.remove("show");
  button.classList.remove("active");
}

function selectLanguageWithoutReload(langCode) {
  if (window.i18n) {
    window.i18n.setLanguage(langCode);
    updateLanguageButton(langCode);
    updateActiveLanguage();
  }

  localStorage.setItem("language", langCode);

  if (window.CookieConsent) {
    window.CookieConsent.setCookie("language", langCode, 365);
  }
}

function updateLanguageButton(langCode) {
  const button = document.getElementById("language-button");
  if (button) {
    const langText = button.querySelector(".language-text");
    if (langText) {
      langText.textContent = langCode.toUpperCase();
    }
  }
}

function updateActiveLanguage() {
  const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : "en";
  const options = document.querySelectorAll(".language-option");

  options.forEach((option) => {
    if (option.dataset.lang === currentLang) {
      option.classList.add("active");
    } else {
      option.classList.remove("active");
    }
  });
}

document.addEventListener("languageChanged", function (e) {
  updateLanguageButton(e.detail.language);
  updateActiveLanguage();

  const button = document.getElementById("language-button");
  if (button && window.i18n) {
    button.title = window.i18n.t("language");
  }
});

// When cookie consent is granted retroactively, persist the current language as a cookie
document.addEventListener("cookieConsentChanged", function (e) {
  if (e.detail.accepted && window.CookieConsent) {
    const currentLang = window.i18n
      ? window.i18n.getCurrentLanguage()
      : localStorage.getItem("language") || "en";
    window.CookieConsent.setCookie("language", currentLang, 365);
  }
});

function getTranslation(key, defaultText) {
  if (typeof window.i18n !== "undefined" && window.i18n.t) {
    return window.i18n.t(key) || defaultText;
  }
  return defaultText;
}
