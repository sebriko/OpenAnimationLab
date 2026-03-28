class I18nManager {
  constructor() {
    this.currentLanguage = "en";
    this.translations = {};
    this.fallbackLanguage = "en";
    this.supportedLanguages = ["de", "en"];

    this.loadTranslations();
    this.initializeLanguage();
  }

  loadTranslations() {
    this.translations = {
      // UI Elements and Buttons

      template_image: {
        en: "Template Image",
        de: "Vorlagen-Bild",
      },
      save: {
        en: "Save",
        de: "Speichern",
      },
      load: {
        en: "Load",
        de: "Laden",
      },
      publish: {
        en: "Publish",
        de: "Veröffentlichen",
      },
      run_code: {
        en: "Run Code",
        de: "Code ausführen",
      },
      search: {
        en: "Search",
        de: "Suchen",
      },
      copy: {
        en: "Copy",
        de: "Kopieren",
      },
      screenshot: {
        en: "Screenshot",
        de: "Screenshot",
      },
      fullscreen: {
        en: "Fullscreen",
        de: "Vollbild",
      },
      theme_toggle: {
        en: "Light/Dark Mode",
        de: "Hell-/Dunkelmodus",
      },

      // Tooltips
      save_code: {
        en: "Save code",
        de: "Code speichern",
      },
      load_code: {
        en: "Load code from file",
        de: "Code aus Datei laden",
      },
      publish_animation: {
        en: "Publish animation",
        de: "Animation veröffentlichen",
      },
      run_code_tooltip: {
        en: "Execute code",
        de: "Code ausführen",
      },
      search_code: {
        en: "Search in code",
        de: "Suche im Code",
      },
      copy_selected: {
        en: "Copy selected text",
        de: "Ausgewählten Text kopieren",
      },
      create_screenshot: {
        en: "Create screenshot",
        de: "Screenshot erstellen",
      },
      toggle_preview_fullscreen: {
        en: "Toggle preview fullscreen",
        de: "Vorschau-Vollbild umschalten",
      },

      // Undo/Redo
      undo_action: {
        en: "Undo (Ctrl+Z)",
        de: "Rückgängig (Strg+Z)",
      },
      redo_action: {
        en: "Redo (Ctrl+Y)",
        de: "Wiederholen (Strg+Y)",
      },
      nothing_to_undo: {
        en: "Nothing to undo",
        de: "Nichts zum Rückgängigmachen",
      },
      nothing_to_redo: {
        en: "Nothing to redo",
        de: "Nichts zum Wiederholen",
      },

      // Dropdowns
      pixijs_elements: {
        en: "2D",
        de: "2D",
      },
      ui_elements: {
        en: "UI & 3D",
        de: "UI & 3D",
      },

      // Search functionality
      search_placeholder: {
        en: "Search...",
        de: "Suchen...",
      },
      search_results: {
        en: "Search results",
        de: "Suchergebnisse",
      },
      previous_result: {
        en: "Previous result",
        de: "Vorheriges Suchergebnis",
      },
      next_result: {
        en: "Next result",
        de: "Nächstes Suchergebnis",
      },
      close_search: {
        en: "Close search",
        de: "Suche schließen",
      },
      search_function: {
        en: "Search function in editor",
        de: "Suchfunktion im Editor",
      },
      enter_search_term: {
        en: "Enter search term",
        de: "Suchbegriff eingeben",
      },
      no_results_found: {
        en: "No results found",
        de: "Keine Ergebnisse gefunden",
      },
      search_hits: {
        en: "Hit {current} of {total}",
        de: "Treffer {current} von {total}",
      },
      search_no_editor: {
        en: "Search function cannot be activated: No code window visible",
        de: "Suchfunktion kann nicht aktiviert werden: Kein Codefenster sichtbar",
      },
      toggle_replace: {
        en: "Toggle replace",
        de: "Ersetzen ein/ausblenden",
      },
      replace_with: {
        en: "Replace with...",
        de: "Ersetzen durch...",
      },
      enter_replacement: {
        en: "Enter replacement text",
        de: "Ersetzungstext eingeben",
      },
      replace: {
        en: "Replace",
        de: "Ersetzen",
      },
      replace_all: {
        en: "Replace all",
        de: "Alle ersetzen",
      },
      confirm_replace_all: {
        en: "Replace all {count} occurrences?",
        de: "Alle {count} Vorkommen ersetzen?",
      },
      replaced_occurrences: {
        en: "Replaced {count} occurrences",
        de: "{count} Vorkommen ersetzt",
      },

      // Form elements
      parameters: {
        en: "Initialization parameters",
        de: "Parameter zur Initialisierung",
      },
      additional: {
        en: "Setter parameters",
        de: "Setter-Parameter",
      },
      methods: {
        en: "Methods",
        de: "Methoden",
      },
      cancel: {
        en: "Cancel",
        de: "Abbrechen",
      },
      ok: {
        en: "OK",
        de: "OK",
      },
      copy_button: {
        en: "Copy",
        de: "Kopieren",
      },
      copied: {
        en: "Copied!",
        de: "Kopiert!",
      },
      choose_color: {
        en: "Choose Color",
        de: "Farbe wählen",
      },
      edit_matrix: {
        en: "Edit Matrix",
        de: "Matrix bearbeiten",
      },
      svg_file: {
        en: "SVG File",
        de: "SVG-Datei",
      },
      select_svg_file: {
        en: "Select SVG file",
        de: "SVG-Datei auswählen",
      },
      png_file: {
        en: "PNG File",
        de: "PNG-Datei",
      },
      select_image_file: {
        en: "Select image file",
        de: "Bilddatei auswählen",
      },
      number_of_points: {
        en: "Number of points:",
        de: "Anzahl Punkte:",
      },
      apply: {
        en: "Apply",
        de: "Übernehmen",
      },
      close: {
        en: "Close",
        de: "Schließen",
      },

      // JavaScript code placeholders
      js_placeholder: {
        en: "Enter JavaScript here...",
        de: "JavaScript hier eingeben...",
      },

      // Language selector
      language: {
        en: "Language",
        de: "Sprache",
      },

      // Language change dialog translations
      change_language_title: {
        en: "Change Language",
        de: "Sprache ändern",
      },
      reload_templates_message: {
        en: "Changing the language will reload the application with language-specific templates. Any unsaved work will be lost. Do you want to continue?",
        de: "Beim Ändern der Sprache wird die Anwendung mit sprachspezifischen Vorlagen neu geladen. Alle nicht gespeicherten Arbeiten gehen verloren. Möchten Sie fortfahren?",
      },
      reload_application: {
        en: "Reload Application",
        de: "Anwendung neu laden",
      },

      // Preloader
      initializing: {
        en: "Initializing...",
        de: "Initialisiere...",
      },

      // Error messages and notifications
      error_copying: {
        en: "Error copying: ",
        de: "Fehler beim Kopieren: ",
      },
      mathjax_not_loaded: {
        en: "MathJax was not loaded within 5 seconds.",
        de: "MathJax wurde nicht innerhalb von 5 Sekunden geladen.",
      },
      svg_load_error: {
        en: "Error loading SVG image:",
        de: "Fehler beim Laden des SVG-Bildes:",
      },
      svg_dataurl_error: {
        en: "Error creating SVG data URL:",
        de: "Fehler beim Erstellen der SVG-Data-URL:",
      },

      // Template categories
      category_general: {
        en: "General",
        de: "Allgemein",
      },
      category_geometry: {
        en: "Geometry",
        de: "Geometrie",
      },
      category_ui: {
        en: "UI",
        de: "Benutzeroberfläche",
      },
      category_elements: {
        en: "Elements",
        de: "Elemente",
      },
      category_lines_curves: {
        en: "Lines & Curves",
        de: "Linien & Kurven",
      },
      category_math: {
        en: "Math",
        de: "Mathematik",
      },
      category_images: {
        en: "Images",
        de: "Bilder",
      },
      category_3d: {
        en: "3D",
        de: "3D",
      },
      category_tips: {
        en: "Tips",
        de: "Tipps",
      },
      category_projects: {
        en: "Projects",
        de: "Projekte",
      },

      // Template interface
      no_templates_available: {
        en: "No templates available",
        de: "Keine Vorlagen verfügbar",
      },
      template_categories: {
        en: "Template Categories",
        de: "Vorlagen-Kategorien",
      },
      load_custom_templates: {
        en: "Load Templates",
        de: "Vorlagen laden",
      },
      save_current_templates: {
        en: "Save Templates",
        de: "Vorlagen speichern",
      },
      template_organizer: {
        en: "Template Organizer",
        de: "Vorlagen-Verwaltung",
      },
      custom_templates_loaded: {
        en: "Custom templates loaded",
        de: "Benutzerdefinierte Vorlagen geladen",
      },
      template_load_error: {
        en: "Error loading templates: ",
        de: "Fehler beim Laden der Vorlagen: ",
      },
      file_read_error: {
        en: "Error reading file",
        de: "Fehler beim Lesen der Datei",
      },
      templates_saved_successfully: {
        en: "Templates saved successfully!",
        de: "Vorlagen erfolgreich gespeichert!",
      },
      template_save_error: {
        en: "Error saving templates: ",
        de: "Fehler beim Speichern der Vorlagen: ",
      },

      // Info Window translations
      info: {
        en: "Info",
        de: "Info",
      },
      software_information: {
        en: "Software Information",
        de: "Software Information",
      },
      version: {
        en: "Version",
        de: "Version",
      },
      developer: {
        en: "Developer",
        de: "Entwickler",
      },
      purpose: {
        en: "Purpose",
        de: "Zweck",
      },
      purpose_text: {
        en: "Interactive JavaScript editor for creating educational animations and interactive learning content",
        de: "Interaktiver JavaScript-Editor für die Erstellung von Bildungsanimationen und interaktiven Lerninhalten",
      },
      license: {
        en: "License",
        de: "Lizenz",
      },
      license_text: {
        en: "This software is licensed under the Creative Commons Attribution 4.0 International (CC BY 4.0)",
        de: "Diese Software steht unter der Creative Commons Namensnennung 4.0 International (CC BY 4.0)",
      },
      support_feedback: {
        en: "Support & Feedback",
        de: "Unterstützung & Feedback",
      },
      help_improve: {
        en: "Help us improve the editor:",
        de: "Hilf uns dabei, den Editor zu verbessern:",
      },
      support_me: {
        en: "Support me",
        de: "Support me",
      },
      bug_report: {
        en: "Bug report",
        de: "Bug report",
      },
      imprint: {
        en: "Imprint",
        de: "Impressum",
      },
      responsible_content: {
        en: "Responsible for content:",
        de: "Verantwortlich für den Inhalt:",
      },
      contact: {
        en: "Contact",
        de: "Kontakt",
      },
      used_opensource: {
        en: "Used Open Source Software",
        de: "Verwendete Open-Source-Software",
      },
      used_opensource_text: {
        en: "This tool uses various excellent open source libraries and frameworks. We would like to thank all developers:",
        de: "Dieses Tool nutzt verschiedene hervorragende Open-Source-Bibliotheken und -Frameworks. Wir möchten uns bei allen Entwicklern bedanken:",
      },
      license_notice: {
        en: "License Notice",
        de: "Lizenzhinweis",
      },
      license_notice_text: {
        en: "All used libraries are under open source licenses (mainly MIT License and Apache License 2.0). The complete license texts are available in the respective projects. This tool respects all license terms and passes on the appropriate credits to the original authors.",
        de: "Alle verwendeten Bibliotheken stehen unter Open-Source-Lizenzen (hauptsächlich MIT License und Apache License 2.0). Die vollständigen Lizenztexte sind in den jeweiligen Projekten verfügbar. Dieses Tool respektiert alle Lizenzbestimmungen und gibt die entsprechenden Credits an die ursprünglichen Autoren weiter.",
      },
      last_update: {
        en: "Last Update",
        de: "Letztes Update",
      },

      // Library descriptions
      pixijs_desc: {
        en: "2D WebGL renderer for fast, interactive graphics",
        de: "2D-WebGL-Renderer für schnelle, interaktive Grafiken",
      },
      codemirror_desc: {
        en: "Versatile code editor for web browsers",
        de: "Vielseitiger Code-Editor für Webbrowser",
      },
      acorn_desc: {
        en: "JavaScript parser for ECMAScript standards",
        de: "JavaScript-Parser für ECMAScript-Standards",
      },
      jszip_desc: {
        en: "Library for creating, reading and editing ZIP files",
        de: "Bibliothek zum Erstellen, Lesen und Bearbeiten von ZIP-Dateien",
      },
      handlebars_desc: {
        en: "Template engine for semantic templates",
        de: "Template-Engine für semantische Vorlagen",
      },
      mathjax_desc: {
        en: "JavaScript engine for displaying mathematical notation",
        de: "JavaScript-Engine zur Darstellung mathematischer Notation",
      },
      htmltoimage_desc: {
        en: "Modern library for converting DOM to images with superior text rendering",
        de: "Moderne Bibliothek zur Konvertierung von DOM zu Bildern mit überlegener Textdarstellung",
      },
      jshint_desc: {
        en: "JavaScript code quality tool",
        de: "JavaScript-Code-Qualitätswerkzeug",
      },
      svgo_desc: {
        en: "SVG optimization tool",
        de: "SVG-Optimierungstool",
      },
      material_icons_desc: {
        en: "Icon font from Google for modern user interfaces",
        de: "Icon-Font von Google für moderne Benutzeroberflächen",
      },
      google_fonts_desc: {
        en: "Web font service from Google",
        de: "Web-Schriftarten-Service von Google",
      },
      license_various: {
        en: "Various open source licenses",
        de: "Verschiedene Open-Source-Lizenzen",
      },

      // Message window translations
      console_outputs: {
        en: "Console Outputs",
        de: "Console Ausgaben",
      },
      clear: {
        en: "Clear",
        de: "Löschen",
      },
      no_outputs_available: {
        en: "No outputs available.",
        de: "Keine Ausgaben verfügbar.",
      },
      message_reports: {
        en: "Message Reports",
        de: "Meldungsberichte",
      },

      // Console & debug messages
      console_restored: {
        en: "Console has been restored to original state",
        de: "Console wurde auf den ursprünglichen Zustand zurückgesetzt",
      },
      console_override_activated: {
        en: "Console override has been activated",
        de: "Console-Override wurde aktiviert",
      },
      console_override_active: {
        en: "Console override active:",
        de: "Console Override aktiv:",
      },
      console_log_is_original: {
        en: "console.log is original:",
        de: "console.log ist original:",
      },
      no_messages_info: {
        en: 'You can display messages here using console commands such as console.log("Hello World"). Note: Messages are stored in memory and may slow down the animation.',
        de: 'Per console.log("Hallo Welt") können Sie hier Meldungen anzeigen lassen. Achtung: Meldungen werden in den Arbeitsspeicher geschrieben und verlangsamen die Animation.',
      },
      line: {
        en: "Line",
        de: "Zeile",
      },
      page_fully_loaded: {
        en: "Page fully loaded",
        de: "Seite vollständig geladen",
      },
      all_systems_initialized: {
        en: "All systems successfully initialized",
        de: "Alle Systeme erfolgreich initialisiert",
      },
      created_with_editor: {
        en: "Created with Open Animation Lab",
        de: "Created with Open Animation Lab",
      },
      confirm_close_tab: {
        de: "Dieser Tab enthält Code. Sind Sie sicher, dass Sie ihn schließen möchten? Alle ungespeicherten Änderungen gehen verloren.",
        en: "This tab contains code. Are you sure you want to close it? All unsaved changes will be lost.",
      },

      // Class info window
      extract_class_info: {
        en: "Extract class information",
        de: "Klasseninformationen extrahieren",
      },
      class_information: {
        en: "Class Information for AI",
        de: "Klasseninformationen für KI",
      },
      copy_to_clipboard: {
        en: "Copy to clipboard",
        de: "In Zwischenablage kopieren",
      },
      no_class_info_found: {
        en: "No classes with serialization information found in the selected area.",
        de: "Keine Klassen mit Serialisierungsinformationen im markierten Bereich gefunden.",
      },
      class_info_copied: {
        en: "Copied!",
        de: "Kopiert!",
      },
      class_info_copy_error: {
        en: "Error copying to clipboard",
        de: "Fehler beim Kopieren in die Zwischenablage",
      },
      mark_text_for_class_info: {
        en: "Please mark text with class names first",
        de: "Bitte markieren Sie zuerst Text mit Klassennamen",
      },
      class_info_intro: {
        en: "Here is an overview of all classes used in the code. This overview should help to edit the code correctly. The framework and HTML wrapper already exist.",
        de: "Hier ist eine Übersicht aller Klassen, die im Code verwendet werden. Diese Übersicht soll dabei helfen, den Code korrekt zu bearbeiten. Das Framework und der HTML-Wrapper existieren bereits.",
      },
      class_label: {
        en: "CLASS",
        de: "KLASSE",
      },
      properties_label: {
        en: "PROPERTIES (Setter/Getter)",
        de: "EIGENSCHAFTEN (Setter/Getter)",
      },
      methods_label: {
        en: "METHODS",
        de: "METHODEN",
      },
      example_label: {
        en: "Example",
        de: "Beispiel",
      },
    };
  }

  initializeLanguage() {
    const savedLanguage = this.getCookie("language");

    if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    } else {
      const browserLang = navigator.language.substring(0, 2);
      if (this.supportedLanguages.includes(browserLang)) {
        this.currentLanguage = browserLang;
      }
    }

    this.applyLanguage();
  }

  setLanguage(language) {
    if (this.supportedLanguages.includes(language)) {
      this.currentLanguage = language;
      this.setCookie("language", language, 365);
      this.applyLanguage();
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  translate(key, fallback = null) {
    const translation = this.translations[key];

    if (translation && translation[this.currentLanguage]) {
      return translation[this.currentLanguage];
    }

    if (translation && translation[this.fallbackLanguage]) {
      return translation[this.fallbackLanguage];
    }

    return fallback || key;
  }

  t(key, fallback = null) {
    return this.translate(key, fallback);
  }

  // Maps English category names to translation keys
  translateCategory(englishCategoryName) {
    const categoryKeyMap = {
      General: "category_general",
      Geometry: "category_geometry",
      UI: "category_ui",
      Elements: "category_elements",
      "Lines & Curves": "category_lines_curves",
      Math: "category_math",
      Images: "category_images",
      "3D": "category_3d",
      Tips: "category_tips",
      Projects: "category_projects",
      Tutorials: "category_tutorials",
    };

    const translationKey = categoryKeyMap[englishCategoryName];

    if (translationKey) {
      return this.translate(translationKey, englishCategoryName);
    }

    return englishCategoryName;
  }

  getAllCategoryTranslations() {
    const categories = [
      "General",
      "Geometry",
      "UI",
      "Elements",
      "Lines & Curves",
      "Math",
      "Images",
      "3D",
      "Tips",
      "Projects",
      "Tutorials",
    ];

    const translations = {};
    categories.forEach((category) => {
      translations[category] = this.translateCategory(category);
    });

    return translations;
  }

  applyLanguage() {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const translation = this.translate(key);

      if (element.tagName === "INPUT" && element.type === "text") {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      const key = element.getAttribute("data-i18n-title");
      element.title = this.translate(key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      element.placeholder = this.translate(key);
    });

    document.querySelectorAll("[data-i18n-category]").forEach((element) => {
      const categoryName = element.getAttribute("data-i18n-category");
      element.textContent = this.translateCategory(categoryName);
    });

    const codeTextarea = document.getElementById("code");
    if (codeTextarea) {
      codeTextarea.placeholder = this.translate("js_placeholder");
    }

    document.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: { language: this.currentLanguage },
      }),
    );
  }

  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  addTranslations(language, translationsObject) {
    if (!this.supportedLanguages.includes(language)) {
      console.warn(`Language "${language}" is not supported`);
      return;
    }

    for (const [key, value] of Object.entries(translationsObject)) {
      if (!this.translations[key]) {
        this.translations[key] = {};
      }
      this.translations[key][language] = value;
    }
  }
}

window.i18n = new I18nManager();

function getTranslation(key, fallback = key) {
  if (window.i18n) {
    return window.i18n.translate(key, fallback);
  }
  return fallback;
}

function getCategoryTranslation(englishCategoryName) {
  if (window.i18n) {
    return window.i18n.translateCategory(englishCategoryName);
  }
  return englishCategoryName;
}

function translateSerializationInfo(translationKey) {
  if (!translationKey || !window.i18n) return translationKey;

  return window.i18n.translate(translationKey, translationKey);
}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = I18nManager;
}
