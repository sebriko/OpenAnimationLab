const fs = require("fs");
const path = require("path");

console.log("Starting GuiFunctions Builder...");

// Pfade definieren
const files = {
  template: "GuiFunctionsTemplate.js",
  output: "../src/core/GuiFunctions.js",
  uiCss: "../src/UI-components.css",
  pixi: "../src/core/PixiJSEdu.js",
  htmlSvg: "../src/core/HtmlSvgEdu.js",
  board: "../src/core/Board.js",
};

// Prüfen ob alle Dateien existieren
const checkFiles = () => {
  const missingFiles = [];

  Object.entries(files).forEach(([key, filePath]) => {
    if (key === "output") return; // Output-Datei wird erstellt

    if (!fs.existsSync(filePath)) {
      missingFiles.push(`${key}: ${filePath}`);
    }
  });

  if (missingFiles.length > 0) {
    console.error("FEHLER: Folgende Dateien wurden nicht gefunden:");
    missingFiles.forEach((file) => console.error(`- ${file}`));
    process.exit(1);
  }

  console.log("Alle Dateien gefunden. Beginne Verarbeitung...");
};

// Datei sicher lesen
const readFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error(`FEHLER beim Lesen von ${filePath}:`, error.message);
    process.exit(1);
  }
};

// Datei sicher schreiben
const writeFile = (filePath, content) => {
  try {
    // Verzeichnis erstellen falls es nicht existiert
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, "utf8");
  } catch (error) {
    console.error(`FEHLER beim Schreiben von ${filePath}:`, error.message);
    process.exit(1);
  }
};

// Main function
const buildGuiFunctions = () => {
  try {
    // Dateien prüfen
    checkFiles();

    // Template laden
    console.log("Lade Template-Datei...");
    let template = readFile(files.template);

    // Replacements definieren
    const replacements = [
      {
        placeholder: "###UI-Styles###",
        file: files.uiCss,
        name: "UI-Styles",
      },
      {
        placeholder: "###PixiJsEdu###",
        file: files.pixi,
        name: "PixiJsEdu",
      },
      {
        placeholder: "###HtmlSvgEdu###",
        file: files.htmlSvg,
        name: "HtmlSvgEdu",
      },
      {
        placeholder: "###Board###",
        file: files.board,
        name: "Board",
      },
    ];

    // Ersetzungen durchführen
    let result = template;
    replacements.forEach(({ placeholder, file, name }) => {
      console.log(`Ersetze ${placeholder} mit Inhalt von ${file}...`);
      const content = readFile(file);

      // String-basierte Ersetzung (sicherer als Regex bei JavaScript-Code)
      result = result.split(placeholder).join(content);
    });

    // Ergebnis speichern
    console.log(`Schreibe Ergebnis in ${files.output}...`);
    writeFile(files.output, result);

    console.log("\nERFOLGREICH! GuiFunctionsDraft.js wurde erstellt.");
    console.log("Folgende Ersetzungen wurden vorgenommen:");
    replacements.forEach(({ placeholder, file }) => {
      console.log(`- ${placeholder} durch Inhalt von ${file}`);
    });
  } catch (error) {
    console.error("FEHLER beim Verarbeiten:", error.message);
    process.exit(1);
  }
};

// Script ausführen
buildGuiFunctions();
console.log("\nFertig!");
