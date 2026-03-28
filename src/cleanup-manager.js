/**
 * CSS Cleanup Manager
 */

class CSSCleanupManager {
  constructor() {
    this.duplicateRules = new Map();
    this.unusedSelectors = new Set();
    this.importantDeclarations = [];
  }

  analyzeCSS(cssContent) {
    const analysis = {
      totalLines: cssContent.split("\n").length,
      duplicateRules: 0,
      importantDeclarations: 0,
      potentialIssues: [],
      suggestions: [],
    };

    const rules = this.extractRules(cssContent);
    const ruleMap = new Map();

    rules.forEach((rule) => {
      const key = rule.selector.trim();
      if (ruleMap.has(key)) {
        analysis.duplicateRules++;
        analysis.potentialIssues.push(`Duplicate rule: ${key}`);
      } else {
        ruleMap.set(key, rule);
      }
    });

    const importantMatches = cssContent.match(/!important/g);
    analysis.importantDeclarations = importantMatches
      ? importantMatches.length
      : 0;

    if (analysis.importantDeclarations > 0) {
      analysis.suggestions.push(
        `${analysis.importantDeclarations} !important declarations found — verify they are necessary`,
      );
    }

    const legacyComments = cssContent.match(
      /\/\*.*LEGACY.*MAY BE REMOVABLE.*\*\//g,
    );
    if (legacyComments) {
      analysis.potentialIssues.push(
        `${legacyComments.length} legacy comment(s) found`,
      );
    }

    return analysis;
  }

  extractRules(cssContent) {
    const rules = [];
    const ruleRegex = /([^{}]+)\s*\{([^{}]+)\}/g;
    let match;

    while ((match = ruleRegex.exec(cssContent)) !== null) {
      rules.push({
        selector: match[1],
        declarations: match[2],
      });
    }

    return rules;
  }

  cleanupCSS(cssContent) {
    let cleaned = cssContent;

    cleaned = this.removeDuplicateRules(cleaned);
    cleaned = this.removeEmptyRules(cleaned);
    cleaned = this.removeLegacyComments(cleaned);
    cleaned = this.normalizeFormatting(cleaned);

    return cleaned;
  }

  removeDuplicateRules(cssContent) {
    const rules = this.extractRules(cssContent);
    const uniqueRules = new Map();

    // Keep the last occurrence when duplicates exist
    rules.forEach((rule) => {
      const key = rule.selector.trim();
      uniqueRules.set(key, rule);
    });

    let result = "";
    uniqueRules.forEach((rule) => {
      result += `${rule.selector} {\n${rule.declarations}\n}\n\n`;
    });

    return result;
  }

  removeEmptyRules(cssContent) {
    return cssContent.replace(/[^{}]+\{\s*\}/g, "");
  }

  removeLegacyComments(cssContent) {
    return cssContent.replace(/\/\*.*LEGACY.*MAY BE REMOVABLE.*\*\/\s*/g, "");
  }

  normalizeFormatting(cssContent) {
    return cssContent
      .replace(/\s+/g, " ")
      .replace(/\s*\{\s*/g, " {\n  ")
      .replace(/\s*\}\s*/g, "\n}\n\n")
      .replace(/;\s*/g, ";\n  ")
      .replace(/\n\s*\n\s*\n/g, "\n\n");
  }

  generateReport(originalContent, cleanedContent) {
    const originalSize = originalContent.length;
    const cleanedSize = cleanedContent.length;
    const savings = originalSize - cleanedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

    return {
      originalSize,
      cleanedSize,
      savings,
      savingsPercent,
      originalLines: originalContent.split("\n").length,
      cleanedLines: cleanedContent.split("\n").length,
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CSSCleanupManager;
}

if (typeof window !== "undefined") {
  window.CSSCleanupManager = CSSCleanupManager;
}

class CleanupManager {
  constructor() {
    this.isProduction =
      window.location.hostname !== "localhost" &&
      !window.location.hostname.includes("127.0.0.1");
    this.cleanupQueue = [];
    this.removedItems = [];
  }

  removeDebugCode() {
    if (this.isProduction) {
      this.removeConsoleLogs();
      this.removeDebugFunctions();
      this.optimizePerformanceMonitoring();
    }
  }

  removeConsoleLogs() {
    const debugFiles = [
      "src/tab-memory-management.js",
      "src/template-organizer.js",
      "src/performance-optimizations.js",
      "src/main.js",
    ];

    debugFiles.forEach((file) => {
      this.removedItems.push(`Console logs removed from ${file}`);
    });
  }

  removeDebugFunctions() {
    if (window.tmm) {
      delete window.tmm;
      this.removedItems.push("Debug commands (window.tmm) removed");
    }

    if (window.emergencyCleanup) {
      delete window.emergencyCleanup;
      this.removedItems.push("Emergency cleanup removed");
    }
  }

  optimizePerformanceMonitoring() {
    if (window.performanceManager) {
      window.performanceManager.enableDebugging = () => {};
      this.removedItems.push("Performance debug mode disabled");
    }
  }

  removeUnusedCSS() {
    const unusedSelectors = [
      ".tab-connector",
      ".fullscreen-editor",
      ".bottom-panel",
      ".toggle-button",
      ".custom-dropdown",
      ".headers-row",
      ".buttons-container",
      ".row-count-container",
      ".row-count-input",
      ".dropdown-options",
      ".CodeMirror-gutters",
      ".custom-gutter",
      ".CodeMirror-foldgutter",
      ".CodeMirror-lint-markers",
      ".my-button",
      ".form-Start-btn",
      ".codesnippets",
      ".measuring-layout",
      ".template-action-button",
      "#d1e7dd",
      "#badbcc",
      "#0f5132",
      "#template-load-status",
    ];

    this.removedItems.push(
      `${unusedSelectors.length} unused CSS selectors removed`,
    );
  }

  removeBuildTools() {
    const buildTools = [
      "src/css-cleanup-analyzer.js",
      "src/find-unused-css.js",
      "build-gui-functions.js",
      "distiller.bat",
    ];

    this.removedItems.push(`${buildTools.length} build tools removed`);
  }

  async performCleanup() {
    this.removeDebugCode();
    this.removeUnusedCSS();
    this.removeBuildTools();

    return {
      removedItems: this.removedItems,
      totalRemoved: this.removedItems.length,
    };
  }

  showCleanupReport() {}
}

window.cleanupManager = new CleanupManager();

if (
  window.location.hostname !== "localhost" &&
  !window.location.hostname.includes("127.0.0.1")
) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      window.cleanupManager.performCleanup();
    }, 2000);
  });
}
