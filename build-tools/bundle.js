const fs = require("fs");
const path = require("path");
const readline = require("readline");

const inputFiles = [
  "../src/core/HtmlSvgEdu.js",
  "../src/core/PixiJSEdu.js",
  "../src/core/Board.js",
  "namespace.js",
];
const outputFile = path.join(__dirname, "oae-bundle.js");

function waitForKeypress() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("\nPress Enter to exit...", () => {
    rl.close();
  });
}

try {
  let output = "";

  for (const file of inputFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      waitForKeypress();
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, "utf-8");
    output += `// ============================================================\n`;
    output += `// Source: ${file}\n`;
    output += `// ============================================================\n\n`;
    output += content + "\n\n";
    console.log(`  Added: ${file}`);
  }

  fs.writeFileSync(outputFile, output, "utf-8");
  console.log(`\nBundle written to: ${outputFile}`);
} catch (err) {
  console.error("\n--- ERROR ---");
  console.error(err);
}

waitForKeypress();
