/**
 * CSS Cleanup Analyzer
 * Analysiert die style.css Datei und erstellt einen Bereinigungsbericht
 */

// Lade den CSS Cleanup Manager
import("./cleanup-manager.js")
  .then(() => {
    const analyzer = new CSSCleanupManager();

    // Lade die CSS-Datei
    fetch("./src/style.css")
      .then((response) => response.text())
      .then((cssContent) => {
        // Führe Analyse durch
        const analysis = analyzer.analyzeCSS(cssContent);

        // Bereinige CSS
        const cleanedCSS = analyzer.cleanupCSS(cssContent);

        // Generiere Bericht
        const report = analyzer.generateReport(cssContent, cleanedCSS);

        // Speichere bereinigte Version
        const blob = new Blob([cleanedCSS], { type: "text/css" });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "style-cleaned.css";
        downloadLink.textContent = "📥 Bereinigte CSS herunterladen";
        downloadLink.style.cssText = `
                display: inline-block;
                padding: 10px 20px;
                background: #4caf50;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                margin: 20px 0;
                font-family: Arial, sans-serif;
            `;

        // Zeige auch in der UI an
        const resultsDiv = document.createElement("div");
        resultsDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #2c2c2c;
                    color: #e0e0e0;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    max-width: 400px;
                    z-index: 10000;
                    font-family: Arial, sans-serif;
                ">
                    <h3 style="margin: 0 0 15px 0; color: #4caf50;">CSS-Bereinigung abgeschlossen</h3>
                    <p><strong>Ersparnis:</strong> ${report.savingsPercent}% (${report.savings} Zeichen)</p>
                    <p><strong>Zeilen reduziert:</strong> ${report.originalLines - report.cleanedLines}</p>
                    <p><strong>Doppelte Regeln entfernt:</strong> ${analysis.duplicateRules}</p>
                    <p><strong>!important Deklarationen:</strong> ${analysis.importantDeclarations}</p>
                    <div style="margin-top: 15px;">
                        <a href="${url}" download="style-cleaned.css" style="
                            display: inline-block;
                            padding: 8px 16px;
                            background: #4caf50;
                            color: white;
                            text-decoration: none;
                            border-radius: 4px;
                            font-size: 14px;
                        ">Bereinigte CSS herunterladen</a>
                    </div>
                    <button onclick="this.parentElement.remove()" style="
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: none;
                        border: none;
                        color: #999;
                        cursor: pointer;
                        font-size: 18px;
                    ">×</button>
                </div>
            `;

        document.body.appendChild(resultsDiv);
      })
      .catch((error) => {
        console.error("❌ Fehler beim Analysieren der CSS-Datei:", error);
      });
  })
  .catch((error) => {
    console.error("❌ Fehler beim Laden des CSS Cleanup Managers:", error);
  });
