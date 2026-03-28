document.addEventListener("DOMContentLoaded", function () {
  let currentTheme = "light";
  let themeLink = document.createElement("link");
  themeLink.rel = "stylesheet";
  themeLink.id = "theme-stylesheet";
  themeLink.href = "src/light-theme.css";
  document.head.appendChild(themeLink);

  // Preference priority: localStorage (always available), then cookie (only with consent)
  const savedTheme =
    localStorage.getItem("theme") ||
    (window.CookieConsent && window.CookieConsent.isAccepted()
      ? getCookieLocal("theme")
      : null);

  if (savedTheme && savedTheme !== currentTheme) {
    switchTheme(savedTheme);
  }

  const themeToggle = document.querySelector("#theme-toggle");
  if (themeToggle) {
    if (currentTheme === "light") {
      themeToggle.classList.add("active");
    }

    themeToggle.addEventListener("click", function () {
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      switchTheme(newTheme);
      this.classList.toggle("active");
    });
  }

  function getCookieLocal(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function switchTheme(theme) {
    const themeStylesheet = document.getElementById("theme-stylesheet");
    themeStylesheet.href = "src/" + theme + "-theme.css";

    try {
      if (typeof editor !== "undefined" && editor) {
        if (theme === "dark") {
          editor.setOption("theme", "darcula");
        } else {
          editor.setOption("theme", "neat");
        }
      }
    } catch (error) {}

    document.body.setAttribute("data-theme", theme);
    currentTheme = theme;

    localStorage.setItem("theme", theme);

    if (window.CookieConsent) {
      window.CookieConsent.setCookie("theme", theme, 365);
    }

    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      if (theme === "light") {
        themeToggle.classList.add("active");
      } else {
        themeToggle.classList.remove("active");
      }
    }

    document.dispatchEvent(
      new CustomEvent("themeChanged", {
        detail: { theme: theme },
      }),
    );
  }

  window.switchTheme = switchTheme;
  window.getCurrentTheme = () => currentTheme;

  window.getCodeMirrorTheme = () => {
    return currentTheme === "dark" ? "darcula" : "neat";
  };

  document.addEventListener("cookieConsentChanged", function (e) {
    if (e.detail.accepted) {
      if (window.CookieConsent) {
        window.CookieConsent.setCookie("theme", currentTheme, 365);
      }
    }
  });
});
