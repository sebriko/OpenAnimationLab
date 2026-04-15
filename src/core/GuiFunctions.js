function saveCode() {
  const activeTab = document.querySelector(".tab.active"); // Aktiven Tab ermitteln
  let tabName = activeTab ? activeTab.textContent.trim() : "untitled"; // Tab-Name oder 'untitled'

  tabName = tabName.slice(0, -1).trim();

  let code = editor.getValue();

  const blob = new Blob([code], { type: "text/javascript" }); // Blob aus dem Code erstellen
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);

  // Setze den Dateinamen basierend auf dem Tab-Namen
  link.download = `${tabName}.js`; // Der Dateiname entspricht dem Tab-Namen
  link.click(); // Der Download wird ausgelöst
}

async function publishCode() {
  // Tab-Name ermitteln (wie bei saveCode)
  const activeTab = document.querySelector(".tab.active");
  let tabName = activeTab ? activeTab.textContent.trim() : "animation";
  tabName = tabName.slice(0, -1).trim(); // Entfernt das "x" am Ende

  let jsCode = editor.getValue();

  jsCode = jsCode.replace(/\\(?!\\)/g, "\\\\");

  jsCode = replacer(jsCode);

  // Aktiven Renderer ermitteln (pixi oder svg)
  const renderer =
    typeof getActiveRenderer === "function" ? getActiveRenderer() : "pixi";

  // Renderer-spezifische Script-Tags
  let rendererScripts = "";
  let postLoadCode = "";
  let rendererAlias = "";

  if (renderer === "svg") {
    // SVG.js Renderer
    rendererScripts = `
  <script src="https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.2.5/svg.min.js"><\/script>
  
    <script src="https://www.educational-animation.org/oal/src/core/SvgJSEdu.js"><\/script>
  
    <script src="https://www.educational-animation.org/oal/src/core/HtmlSvgEdu.js"><\/script>
  
    <script src="https://www.educational-animation.org/oal/src/core/BoardSVG.js"><\/script>`;

    // Board → BoardSVG Alias, damit "new Board(...)" im SVG-Modus funktioniert
    rendererAlias = "const Board = BoardSVG;";

    postLoadCode = `
    // Overlay nach kurzer Zeit entfernen
    let overlayFrameCount = 0;
    function removeOverlay() {
      overlayFrameCount++;
      if (overlayFrameCount > 3) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
          overlay.style.transition = 'opacity 0.2s';
          overlay.style.opacity = '0';
          setTimeout(() => overlay.remove(), 200);
        }
      } else {
        requestAnimationFrame(removeOverlay);
      }
    }
    requestAnimationFrame(removeOverlay);`;
  } else {
    // PixiJS Renderer (Standard)
    rendererScripts = `
  <script src="https://pixijs.download/release/pixi.js"><\/script>
  
    <script src="https://www.educational-animation.org/oal/src/core/PixiJSEdu.js"><\/script>
  
    <script src="https://www.educational-animation.org/oal/src/core/HtmlSvgEdu.js"><\/script>
  
    <script src="https://www.educational-animation.org/oal/src/core/Board.js"><\/script>`;

    rendererAlias = "";

    postLoadCode = `
    // Fix für das schwarze Rechteck beim Laden
    // Versuche nach kurzer Zeit den Hintergrund zu setzen
    setTimeout(() => {
      if (typeof board !== 'undefined' && board.app && board.app.renderer) {
        board.app.renderer.backgroundColor = 0xFFFFFF;
      }
      
      if (typeof board !== 'undefined' && board.app && board.app.stage) {
        // Weißer Hintergrund als erstes Element
        const bg = new PIXI.Graphics();
        bg.beginFill(0xFFFFFF);
        bg.drawRect(0, 0, board.app.screen.width, board.app.screen.height);
        bg.endFill();
        board.app.stage.addChildAt(bg, 0);
      }
    }, 10);
    
    // Overlay nach mehreren Frames entfernen
    let overlayFrameCount = 0;
    function removeOverlay() {
      overlayFrameCount++;
      if (overlayFrameCount > 3) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
          overlay.style.transition = 'opacity 0.2s';
          overlay.style.opacity = '0';
          setTimeout(() => overlay.remove(), 200);
        }
      } else {
        requestAnimationFrame(removeOverlay);
      }
    }
    requestAnimationFrame(removeOverlay);`;
  }

  const htmlTemplate = String.raw`
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Animation</title>
  
  <style>
#preview {
  width: 100%;
  height: 100vh; 
  overflow: hidden;
  position: relative;
  border: none;
  background-color: #ffffff;
}

/* Overlay zum Verstecken des schwarzen Rechtecks */
#loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  z-index: 9999;
  pointer-events: none;
  transition: opacity 0.2s ease-out;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #ffffff;
}

/* CSS for HTML UI Components */
.pixi-html-ui {
  font-family: Arial, sans-serif;
  color: #555;
  box-sizing: border-box;
}

/* Button styles */
.pixi-button {
  background: linear-gradient(to bottom, #fafafa, #efefef);
  border: 1px solid #aaaaaa;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  padding: 8px 10px;
  line-height: 0.7; /* Zeilenhöhe zurücksetzen */
  transition: all 0.2s;
  outline: none;

  user-select: none;
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE/Edge */

  display: inline-block; /* Sicherstellen, dass der Button als Inline-Block behandelt wird */
  vertical-align: middle; /* Text vertikal zentrieren */
}

.pixi-button:hover {
  border-color: #228b22;
  background: #ffffff;
}

.pixi-button:active {
  background: #dddddd;
}

.pixi-button.active {
  border-color: #228b22;
  background: #e8f5e8;
}

/* Änderungen für den NumericStepper mit SVG-Buttons */
.pixi-numeric-stepper {
  display: flex;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  overflow: hidden;
  height: auto; /* Höhe wird jetzt automatisch angepasst */
}

.pixi-numeric-input {
  flex-grow: 1;
  border: 1px solid #aaaaaa;
  padding: 4px 8px;
  text-align: left;
  color: #333333; /* Schriftfarbe auf dunkelgrau ändern */
  /* Entfernen der Standard-Browser-Stepper-Pfeile */
  -moz-appearance: textfield; /* Firefox */
}

/* Chrome, Safari, Edge, Opera */
.pixi-numeric-input::-webkit-outer-spin-button,
.pixi-numeric-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Container für die Buttons */
.pixi-stepper-buttons {
  display: flex;
  flex-direction: column; /* Buttons untereinander anordnen */
}

.pixi-stepper-btn {
  background: linear-gradient(to bottom, #fafafa, #efefef);
  border: 1px solid #aaaaaa;
  cursor: pointer;
  text-align: center;
  padding: 0; /* Kein Padding für SVG-Buttons */
  transition: all 0.2s;
  flex: 1; /* Buttons nehmen gleich viel Platz ein */
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 22px; /* Minimale Breite für Buttons */
  color: #666666; /* Farbe für die SVG-Pfeile */
}

.pixi-stepper-increase {
  border-bottom: none; /* Entfernt doppelte Grenzen zwischen den Buttons */
  border-top-right-radius: 4px;
}

.pixi-stepper-decrease {
  border-bottom-right-radius: 4px;
}

.pixi-stepper-btn:hover {
  background-color: #e8e8e8;
  border-color: #228b22;
  color: #228b22; /* Grüne Farbe für die SVG-Pfeile beim Hover */
}

.pixi-stepper-btn:active {
  background-color: #dddddd;
  color: #1a6b1a; /* Dunklere grüne Farbe für die SVG-Pfeile beim Klicken */
}

/* SVG-Styles */
.pixi-stepper-btn svg {
  width: 50%;
  height: 50%;
}

/* Dropdown styles */
.pixi-dropdown {
  border: 1px solid #aaaaaa;
  border-radius: 4px;
  padding: 4px 8px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.pixi-dropdown:hover {
  border-color: #228b22;
}

.pixi-dropdown:focus {
  outline: none;
  border-color: #228b22;
  box-shadow: 0 0 0 2px rgba(34, 139, 34, 0.2);
}

/* TextInput styles */
.pixi-text-input {
  border: 1px solid #aaaaaa;
  border-radius: 4px;
  padding: 5px 8px;
  background-color: white;
  transition: border-color 0.2s;
}

.pixi-text-input:hover {
  border-color: #228b22;
}

.pixi-text-input:focus {
  outline: none;
  border-color: #228b22;
  box-shadow: 0 0 0 2px rgba(34, 139, 34, 0.2);
}

/* RadioButton styles */
.pixi-radio-container {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.pixi-radio {
  appearance: none;
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #555555;
  border-radius: 50%;
  background-color: white;
  cursor: pointer;
  position: relative;
}

.pixi-radio:checked {
  background-color: white;
}

.pixi-radio:checked::after {
  content: "";
  position: absolute;
  left: 4px;
  top: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #228b22;
}

.pixi-radio:hover {
  border-color: #228b22;
}

.pixi-radio-label {
  margin-left: 5px;
  cursor: pointer;
}

/* Toggle Switch styles */
.pixi-toggle-container {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.pixi-toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.pixi-toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.pixi-toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 10px;
}

.pixi-toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .pixi-toggle-slider {
  background-color: #228b22;
}

input:focus + .pixi-toggle-slider {
  box-shadow: 0 0 1px #228b22;
}

input:checked + .pixi-toggle-slider:before {
  transform: translateX(20px);
}

.pixi-toggle-label {
  margin-left: 10px;
  cursor: pointer;
}

/* Common overlay container */
#pixi-ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Let events pass through to PixiJS canvas by default */
  z-index: 10;
}

/* Component-specific states */
.pixi-html-ui {
  pointer-events: auto; /* Allow UI elements to receive events */
  transform-origin: top left;
}

  </style>
  
      <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" async></script>
  
  %%RENDERER_SCRIPTS%%
  
  
    <script>
  
     window.exportMode=true;
  
  </script>
  
</head>
<body>

  <div id="preview">
    <div id="loading-overlay"></div>
  </div>
  
 <div id="canvas-container">

  
  </div>
  <script>
    // Created with Open Animation Lab
    
    %%RENDERER_ALIAS%%
    
    %%JSCODE_PLACEHOLDER%%
    
    %%POST_LOAD_CODE%%
  </script>
</body>
</html>`;

  let htmlContent = htmlTemplate
    .replace("%%RENDERER_SCRIPTS%%", () => rendererScripts)
    .replace("%%RENDERER_ALIAS%%", () => rendererAlias)
    .replace("%%JSCODE_PLACEHOLDER%%", () => jsCode)
    .replace("%%POST_LOAD_CODE%%", () => postLoadCode);

  const blob = new Blob([htmlContent], { type: "text/html" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${tabName}.html`; // Verwendet jetzt den Tab-Namen
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Screenshot-Button Event Listener
document
  .getElementById("screenshotButton")
  .addEventListener("click", takeScreenshot);

// Dynamisch html-to-image laden
function loadHtmlToImage() {
  return new Promise((resolve, reject) => {
    if (window.htmlToImage) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load html-to-image"));
    document.head.appendChild(script);
  });
}

/**
 * Hauptfunktion für Screenshot – erkennt den aktiven Renderer
 * und delegiert an die passende Methode.
 */
async function takeScreenshot() {
  const renderer =
    typeof getActiveRenderer === "function" ? getActiveRenderer() : "pixi";

  if (renderer === "svg") {
    await takeScreenshotSVG();
  } else {
    await takeScreenshotPixi();
  }
}

// =========================================================================
// Hilfsfunktion: Model3D-Iframes in Screenshot einblenden
// =========================================================================

/**
 * Erfasst die Bilder aller aktiven Model3D-Instanzen asynchron.
 * Gibt ein Array von { img, destX, destY, destW, destH } zurück,
 * bereit zum Zeichnen auf einen Canvas.
 *
 * Position und Größe kommen aus instance.x/y/width/height (Board-Koordinaten),
 * NICHT aus captureScreenshot() – dessen cr.left/cr.top können falsche Versätze
 * aus dem iframe-internen Koordinatensystem einbringen.
 *
 * @param {number} scaleFactor - Faktor zum Umrechnen von Board-Koordinaten in Canvas-Pixel
 * @returns {Promise<Array<{img:HTMLImageElement, destX:number, destY:number, destW:number, destH:number}>>}
 */
async function collectModel3DImages(scaleFactor) {
  if (
    typeof HtmlSvgEdu === "undefined" ||
    !HtmlSvgEdu.Model3D ||
    !HtmlSvgEdu.Model3D._instances ||
    HtmlSvgEdu.Model3D._instances.size === 0
  ) {
    return [];
  }

  const results = [];
  for (const instance of HtmlSvgEdu.Model3D._instances) {
    const destX = instance.x * scaleFactor;
    const destY = instance.y * scaleFactor;
    const destW = instance.width * scaleFactor;
    const destH = instance.height * scaleFactor;

    let imageData = null;
    try {
      const result = await instance.captureScreenshot();
      imageData = result && result.imageData;
    } catch (e) {
      console.warn("[Screenshot] Model3D nicht erfasst:", e.message);
      continue;
    }
    if (!imageData) continue;

    const img = await new Promise((resolve) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => resolve(null);
      el.src = imageData;
    });
    if (img) results.push({ img, destX, destY, destW, destH });
  }
  return results;
}

/**
 * Zeichnet vorbereitete Model3D-Bilder auf den Canvas-Kontext.
 * Erwartet das Ergebnis von collectModel3DImages().
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} images - Ergebnis von collectModel3DImages()
 */
function drawModel3DImages(ctx, images) {
  for (const { img, destX, destY, destW, destH } of images) {
    ctx.drawImage(img, destX, destY, destW, destH);
  }
}

// =========================================================================
// SVG-Renderer Screenshot
// =========================================================================

/**
 * Rendert ein SVG-Element als Canvas (boardWidth × boardHeight Pixel).
 * Nutzt XMLSerializer, um das SVG zu serialisieren und als Bild zu laden.
 */
async function renderSVGToCanvas(svgElement, width, height) {
  return new Promise((resolve) => {
    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        console.warn("[Screenshot] SVG konnte nicht als Bild gerendert werden");
        resolve(null);
      };
      img.src = url;
    } catch (e) {
      console.warn("[Screenshot] SVG-Serialisierung fehlgeschlagen:", e);
      resolve(null);
    }
  });
}

/**
 * Screenshot für den SVG.js-Renderer.
 *
 * Strategie (spiegelt den PixiJS-Pfad):
 *   1) SVG-Element via XMLSerializer → Canvas (Hintergrund/Animation)
 *   2) Model3D-Screenshots erfassen
 *   3) pixi-ui-overlay (Text, Buttons) via html2canvas – genau wie im PixiJS-Pfad:
 *      Overlay temporär auf boardWidth×boardHeight setzen, transform entfernen,
 *      danach wiederherstellen.
 *   4) Komposition: SVG → 3D-Modell → HTML-Overlay → weißer Hintergrund
 *
 * Warum nicht html2canvas auf canvasContainer?
 *   Das SVG enthält ein _bgRect (weißes Hintergrundrechteck), das auch in
 *   den iframe-Bereichen opak bleibt – das 3D-Modell wäre dadurch verdeckt.
 */
async function takeScreenshotSVG() {
  const boardInstance =
    typeof BoardSVG !== "undefined" && BoardSVG.getInstance
      ? BoardSVG.getInstance()
      : typeof Board !== "undefined" && Board.getInstance
        ? Board.getInstance()
        : null;

  if (!boardInstance) {
    console.error("Kein Board (SVG) initialisiert.");
    return;
  }

  const boardWidth = boardInstance.width;
  const boardHeight = boardInstance.height;

  const canvasContainer = document.getElementById("canvas-container");
  if (!canvasContainer) {
    console.error("Kein canvas-container gefunden.");
    return;
  }

  // Tab-Name für Dateinamen
  const activeTab = document.querySelector(".tab.active");
  const tabName = activeTab
    ? activeTab.textContent.trim().slice(0, -1)
    : "screenshot";

  const guiElement = document.getElementById("pixi-ui-overlay");

  // MathJax-Elemente temporär ausblenden
  const mathJaxElements = guiElement
    ? guiElement.querySelectorAll("mjx-assistive-mml")
    : [];
  mathJaxElements.forEach((el) => (el.style.display = "none"));

  // Model3D-Screenshots starten, bevor iframes ausgeblendet werden
  const model3dPromise = collectModel3DImages(1);

  // SVG-Inhalt erfassen (parallel, unabhängig von Overlay)
  const svgElement = canvasContainer.querySelector("svg");
  const svgPromise = svgElement
    ? renderSVGToCanvas(svgElement, boardWidth, boardHeight)
    : Promise.resolve(null);

  // iframes jetzt ausblenden (nur für html2canvas auf dem Overlay)
  const iframeElements = guiElement
    ? [...guiElement.querySelectorAll("iframe")]
    : [];
  iframeElements.forEach((el) => (el.style.visibility = "hidden"));

  // Original-Styles für das Overlay sichern
  let originalTransform, originalOrigin, originalWidth, originalHeight;

  try {
    await document.fonts.ready;

    let guiCanvas = null;
    if (guiElement) {
      // Overlay temporär auf Board-Dimensionen ohne Transform setzen –
      // identisch zum PixiJS-Pfad.
      originalTransform = guiElement.style.transform || "";
      originalOrigin = guiElement.style.transformOrigin || "";
      originalWidth = guiElement.style.width;
      originalHeight = guiElement.style.height;

      guiElement.style.width = boardWidth + "px";
      guiElement.style.height = boardHeight + "px";
      guiElement.style.transform = "none";
      guiElement.style.transformOrigin = "0 0";

      guiCanvas = await html2canvas(guiElement, {
        backgroundColor: null,
        scale: 1,
        width: boardWidth,
        height: boardHeight,
        useCORS: true,
        allowTaint: true,
        logging: false,
        letterRendering: true,
        foreignObjectRendering: false,
        onclone: async (clonedDoc) => {
          await document.fonts.ready;
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Input-Felder in sichtbare Divs umwandeln
          const inputs = clonedDoc.querySelectorAll("input, textarea");
          inputs.forEach((input) => {
            if (input.value) {
              const div = clonedDoc.createElement("div");
              const computedStyle = window.getComputedStyle(input);
              div.style.cssText = computedStyle.cssText;
              div.style.pointerEvents = "none";
              div.style.whiteSpace =
                input.tagName === "TEXTAREA" ? "pre-wrap" : "nowrap";
              div.textContent = input.value;
              input.parentNode.replaceChild(div, input);
            }
          });
        },
      });

      // Overlay-Styles sofort wiederherstellen
      guiElement.style.width = originalWidth;
      guiElement.style.height = originalHeight;
      guiElement.style.transform = originalTransform;
      guiElement.style.transformOrigin = originalOrigin;
    }

    // iframes wiederherstellen
    iframeElements.forEach((el) => (el.style.visibility = ""));

    // SVG-Canvas und Model3D-Bilder abwarten
    const [svgCanvas, model3dImages] = await Promise.all([
      svgPromise,
      model3dPromise,
    ]);

    // Finales Canvas in vier Schichten:
    //   1) SVG-Inhalt (Animation, Hintergrundfarbe)
    //   2) 3D-Modelle (zwischen SVG und HTML-Overlay)
    //   3) HTML-Overlay (Text, Buttons – transparent wo iframes waren)
    //   4) Weißer Hintergrund ganz unten
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = boardWidth;
    finalCanvas.height = boardHeight;
    const ctx = finalCanvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (svgCanvas) ctx.drawImage(svgCanvas, 0, 0, boardWidth, boardHeight);
    drawModel3DImages(ctx, model3dImages);
    if (guiCanvas) ctx.drawImage(guiCanvas, 0, 0);

    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, boardWidth, boardHeight);
    ctx.globalCompositeOperation = "source-over";

    downloadCanvas(finalCanvas, `${tabName}.png`);
  } catch (error) {
    console.error("Fehler beim SVG-Screenshot:", error);
  } finally {
    // Sicherheits-Restore
    iframeElements.forEach((el) => (el.style.visibility = ""));
    mathJaxElements.forEach((el) => (el.style.display = ""));
    if (guiElement && originalTransform !== undefined) {
      guiElement.style.width = originalWidth;
      guiElement.style.height = originalHeight;
      guiElement.style.transform = originalTransform;
      guiElement.style.transformOrigin = originalOrigin;
    }
  }
}

// =========================================================================
// PixiJS-Renderer Screenshot (bisherige Logik)
// =========================================================================

/**
 * Screenshot für den PixiJS-Renderer.
 * Extrahiert den PixiJS-Canvas und erfasst das GUI-Overlay
 * mit html2canvas, dann werden beide Layer auf einem Canvas kombiniert.
 *
 * Kernidee: Das Overlay nutzt CSS scale(), um Board-Koordinaten
 * (z.B. 1280×720) auf die Container-Größe (z.B. 487×274) zu mappen.
 * Für den Screenshot setzen wir das Overlay temporär auf die volle
 * Board-Größe und entfernen den Scale, damit html2canvas die Elemente
 * in ihren natürlichen Positionen erfasst.
 */
async function takeScreenshotPixi() {
  if (!app) {
    console.error("PixiJS-Anwendung ist nicht initialisiert.");
    return;
  }

  // Board-Instanz für die logischen Dimensionen
  const boardInstance = Board.getInstance();
  if (!boardInstance) {
    console.error("Keine Board-Instanz gefunden.");
    return;
  }

  const boardWidth = boardInstance.width;
  const boardHeight = boardInstance.height;

  // Tab-Name für Dateinamen
  const activeTab = document.querySelector(".tab.active");
  const tabName = activeTab
    ? activeTab.textContent.trim().slice(0, -1)
    : "screenshot";

  // UI-Overlay Element finden
  const guiElement = document.getElementById("pixi-ui-overlay");

  // Original-Styles sichern (werden im finally-Block wiederhergestellt)
  let originalTransform, originalOrigin, originalWidth, originalHeight;

  try {
    // PixiJS-Canvas extrahieren
    const pixiCanvas = app.renderer.extract.canvas(app.stage);

    if (!guiElement) {
      // Kein Overlay vorhanden → nur PixiJS-Canvas speichern
      downloadCanvas(pixiCanvas, `${tabName}.png`);
      return;
    }

    // Original-Styles sichern
    originalTransform = guiElement.style.transform || "";
    originalOrigin = guiElement.style.transformOrigin || "";
    originalWidth = guiElement.style.width;
    originalHeight = guiElement.style.height;

    // MathJax-Elemente temporär ausblenden
    const mathJaxElements = guiElement.querySelectorAll("mjx-assistive-mml");
    mathJaxElements.forEach((el) => (el.style.display = "none"));

    // Model3D-Screenshots frühzeitig anfordern (parallel zu html2canvas),
    // damit keine unnötige Wartezeit entsteht.
    const scaleFactor = pixiCanvas.width / boardWidth;
    const model3dPromise = collectModel3DImages(scaleFactor);

    // ---------------------------------------------------------------
    // Temporäre Overlay-Anpassung für html2canvas:
    //
    // Normal:  Overlay = 487×274px + scale(0.381) → Kinder bei left:1100px
    //          werden visuell bei 1100×0.381 = 419px dargestellt
    //
    // Screenshot: Overlay = 1280×720px + scale(1) → Kinder bleiben bei
    //             left:1100px und liegen korrekt im 1280px breiten Overlay
    // ---------------------------------------------------------------
    guiElement.style.width = boardWidth + "px";
    guiElement.style.height = boardHeight + "px";
    guiElement.style.transform = "none";
    guiElement.style.transformOrigin = "0 0";

    await document.fonts.ready;

    // html2canvas erfasst das Overlay in Board-Dimensionen.
    // scale sorgt dafür, dass die Ausgabe die gleiche Pixel-Auflösung
    // wie der PixiJS-Canvas hat (boardWidth × resolution).
    // backgroundColor: null → iframe-Bereiche bleiben transparent, damit
    // das 3D-Modell (Layer 2) durch das Overlay hindurch sichtbar ist.
    const guiCanvas = await html2canvas(guiElement, {
      backgroundColor: null,
      scale: scaleFactor,
      width: boardWidth,
      height: boardHeight,
      useCORS: true,
      allowTaint: true,
      logging: false,
      letterRendering: true,
      foreignObjectRendering: false,
      onclone: async (clonedDoc) => {
        await document.fonts.ready;
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Input-Felder in sichtbare Divs umwandeln
        const inputs = clonedDoc.querySelectorAll("input, textarea");
        inputs.forEach((input) => {
          if (input.value) {
            const div = clonedDoc.createElement("div");
            const computedStyle = window.getComputedStyle(input);
            div.style.cssText = computedStyle.cssText;
            div.style.pointerEvents = "none";
            div.style.whiteSpace =
              input.tagName === "TEXTAREA" ? "pre-wrap" : "nowrap";
            div.textContent = input.value;
            input.parentNode.replaceChild(div, input);
          }
        });
      },
    });

    // Styles sofort wiederherstellen
    guiElement.style.width = originalWidth;
    guiElement.style.height = originalHeight;
    guiElement.style.transform = originalTransform;
    guiElement.style.transformOrigin = originalOrigin;

    // Model3D-Bilder abwarten
    const model3dImages = await model3dPromise;

    // Finales Canvas erstellen
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = pixiCanvas.width;
    finalCanvas.height = pixiCanvas.height;
    const ctx = finalCanvas.getContext("2d");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Layer 1: PixiJS-Rendering (Hintergrund)
    ctx.drawImage(pixiCanvas, 0, 0);

    // Layer 2: 3D-Modelle (zwischen PixiJS und GUI-Overlay, damit
    // HTML-Elemente wie Texte im Layer 3 darüber liegen)
    drawModel3DImages(ctx, model3dImages);

    // Layer 3: GUI-Overlay – backgroundColor:null lässt die iframe-Bereiche
    // transparent, sodass Layer 2 hindurchscheint; Texte liegen oben drüber
    ctx.drawImage(guiCanvas, 0, 0, pixiCanvas.width, pixiCanvas.height);

    // Download
    downloadCanvas(finalCanvas, `${tabName}.png`);

    // MathJax wiederherstellen
    mathJaxElements.forEach((el) => (el.style.display = ""));
  } catch (error) {
    console.error("Fehler beim PixiJS-Screenshot:", error);

    // Styles wiederherstellen falls noch nicht geschehen
    if (guiElement && originalTransform !== undefined) {
      guiElement.style.width = originalWidth;
      guiElement.style.height = originalHeight;
      guiElement.style.transform = originalTransform;
      guiElement.style.transformOrigin = originalOrigin;

      const mathJaxElements = guiElement.querySelectorAll("mjx-assistive-mml");
      mathJaxElements.forEach((el) => (el.style.display = ""));
    }

    // Fallback: nur PixiJS-Canvas ohne GUI
    try {
      const pixiCanvas = app.renderer.extract.canvas(app.stage);
      downloadCanvas(pixiCanvas, `${tabName}.png`);
    } catch (fallbackError) {
      console.error(
        "Auch der Fallback-Screenshot ist fehlgeschlagen:",
        fallbackError,
      );
    }
  }
}

/**
 * Fonts für Embedding vorbereiten
 */
async function embedFonts() {
  const fontCSS = [];

  // Alle geladenen Fonts durchgehen
  for (const font of document.fonts) {
    if (font.status === "loaded") {
      // Font-Face CSS generieren
      fontCSS.push(`
                @font-face {
                    font-family: '${font.family}';
                    font-style: ${font.style};
                    font-weight: ${font.weight};
                    src: local('${font.family}');
                }
            `);
    }
  }

  return fontCSS.join("\n");
}

/**
 * Alternative: Hybrid-Ansatz mit html2canvas
 * Nutzt html2canvas aber mit speziellen Optimierungen für Text
 */
async function takeScreenshotWithHtml2Canvas() {
  // Renderer-Check: nur für PixiJS sinnvoll
  if (!app) return;

  const pixiCanvas = app.renderer.extract.canvas(app.stage);
  const activeTab = document.querySelector(".tab.active");
  const tabName = activeTab
    ? activeTab.textContent.trim().slice(0, -1)
    : "screenshot";

  const guiElement = document.getElementById("pixi-ui-overlay");
  if (!guiElement) {
    downloadCanvas(pixiCanvas, `${tabName}.png`);
    return;
  }

  const originalTransform = guiElement.style.transform || "";
  const match = originalTransform.match(/scale\((-?\d+(\.\d+)?)\)/);
  let scaleValue = match ? parseFloat(match[1]) : 1;
  scaleValue = scaleValue * 0.8;

  // Vorbereitung für besseres Text-Rendering
  await prepareForHtml2Canvas(guiElement);

  try {
    const guiCanvas = await html2canvas(guiElement, {
      backgroundColor: null,
      scale: 1 / scaleValue,
      width: pixiCanvas.width,
      height: pixiCanvas.height,
      useCORS: true,
      allowTaint: true,
      logging: false,
      // Experimentelle Optionen für besseres Text-Rendering
      letterRendering: true,
      foreignObjectRendering: false,
      // Callback für Font-Loading
      onclone: async (clonedDoc) => {
        await document.fonts.ready;
        // Warte zusätzlich für Font-Rendering
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Fix für Input-Felder
        const inputs = clonedDoc.querySelectorAll("input, textarea");
        inputs.forEach((input) => {
          if (input.value) {
            const div = clonedDoc.createElement("div");
            const computedStyle = window.getComputedStyle(input);

            // Kopiere Styles
            div.style.cssText = computedStyle.cssText;
            div.style.pointerEvents = "none";
            div.style.whiteSpace =
              input.tagName === "TEXTAREA" ? "pre-wrap" : "nowrap";
            div.textContent = input.value;

            input.parentNode.replaceChild(div, input);
          }
        });
      },
    });

    // Kombiniere Canvas
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = pixiCanvas.width;
    finalCanvas.height = pixiCanvas.height;
    const ctx = finalCanvas.getContext("2d");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(pixiCanvas, 0, 0);
    ctx.drawImage(guiCanvas, 0, 0);

    downloadCanvas(finalCanvas, `${tabName}.png`);
  } catch (error) {
    console.error("Html2Canvas Fehler:", error);
    downloadCanvas(pixiCanvas, `${tabName}.png`);
  }
}

/**
 * Bereitet DOM für html2canvas vor
 */
async function prepareForHtml2Canvas(element) {
  // Stelle sicher dass alle Fonts geladen sind
  await document.fonts.ready;

  // Force-Render von Fonts
  const testDiv = document.createElement("div");
  testDiv.style.position = "absolute";
  testDiv.style.left = "-9999px";
  testDiv.style.visibility = "hidden";

  // Sammle alle verwendeten Fonts
  const fonts = new Set();
  element.querySelectorAll("*").forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.fontFamily) {
      fonts.add(style.fontFamily);
    }
  });

  // Rendere Test-Text mit allen Fonts
  fonts.forEach((font) => {
    const span = document.createElement("span");
    span.style.fontFamily = font;
    span.textContent =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    testDiv.appendChild(span);
  });

  document.body.appendChild(testDiv);

  // Warte auf Rendering
  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.removeChild(testDiv);
        resolve();
      });
    });
  });
}

/**
 * Download-Funktion
 */
function downloadCanvas(canvas, filename) {
  canvas.toBlob(
    (blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      setTimeout(() => {
        URL.revokeObjectURL(link.href);
      }, 100);
    },
    "image/png",
    1.0,
  );
}

// Globale Variable für den Vorschau-Vollbildmodus Status
let isPreviewFullscreen = false;

// Funktion für den Vorschau-Vollbildmodus
function togglePreviewFullscreen() {
  const preview = document.getElementById("preview");
  const canvasContainer = document.getElementById("canvas-container");
  const actions = document.querySelector(".actions");
  const header = document.querySelector(".header");
  const editorArea = document.getElementById("editorArea");

  if (!isPreviewFullscreen) {
    // Vollbildmodus aktivieren

    // Aktuelle Splitter-Position vor Vollbild speichern
    if (window.editorPreviewSplitter) {
      window.editorPreviewSplitter.saveCurrentPosition();
    }

    // Alle anderen Elemente ausblenden
    if (header) header.style.display = "none";
    if (editorArea) editorArea.style.display = "none";
    if (actions) actions.style.display = "none";

    // Preview auf Vollbild setzen
    preview.style.position = "fixed";
    preview.style.top = "0";
    preview.style.left = "0";
    preview.style.width = "100vw";
    preview.style.height = "100vh";
    preview.style.zIndex = "9999";
    preview.style.backgroundColor = "#f5f5f5";

    // Canvas Container anpassen
    canvasContainer.style.width = "100%";
    canvasContainer.style.height = "100%";
    canvasContainer.style.display = "flex";
    canvasContainer.style.alignItems = "center";
    canvasContainer.style.justifyContent = "center";

    // Fullscreen-Status an Splitter weiterleiten
    if (window.editorPreviewSplitter) {
      window.editorPreviewSplitter.setFullscreenMode(true);
    }

    // Exit-Button erstellen
    const exitButton = document.createElement("button");
    exitButton.id = "fullscreen-exit-btn";
    exitButton.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    exitButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: #4CAF50;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      transition: background-color 0.2s ease;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    `;

    exitButton.addEventListener("click", togglePreviewFullscreen);
    document.body.appendChild(exitButton);

    // ESC-Taste zum Beenden
    document.addEventListener("keydown", handleEscapeKey);
  } else {
    // Vollbildmodus deaktivieren

    // Exit-Button entfernen
    const exitButton = document.getElementById("fullscreen-exit-btn");
    if (exitButton) {
      exitButton.remove();
    }

    // ESC-Handler entfernen
    document.removeEventListener("keydown", handleEscapeKey);

    // Fullscreen-Status an Splitter weiterleiten
    if (window.editorPreviewSplitter) {
      window.editorPreviewSplitter.setFullscreenMode(false);
    }

    // Alle Elemente wieder anzeigen
    if (header) header.style.display = "";
    if (editorArea) editorArea.style.display = "";
    if (actions) actions.style.display = "";

    // Preview-Styles zurücksetzen
    preview.style.position = "";
    preview.style.top = "";
    preview.style.left = "";
    preview.style.width = "";
    preview.style.height = "";
    preview.style.zIndex = "";
    preview.style.backgroundColor = "";

    // Canvas Container zurücksetzen
    canvasContainer.style.width = "";
    canvasContainer.style.height = "";
    canvasContainer.style.display = "";
    canvasContainer.style.alignItems = "";
    canvasContainer.style.justifyContent = "";

    // Wichtig: Splitter-Position nach Vollbild wiederherstellen
    setTimeout(() => {
      if (window.editorPreviewSplitter) {
        window.editorPreviewSplitter.restorePosition();
      }
    }, 10);
  }

  isPreviewFullscreen = !isPreviewFullscreen;

  // Explizite Neuberechnung der Größe und Position der Animation
  setTimeout(() => {
    // Force rerender und resizing der Pixi-Anwendung
    window.dispatchEvent(new Event("resize"));

    // Falls es ein Board-Objekt gibt, explizit die Größe anpassen
    if (
      window.Board &&
      Board.getInstance &&
      typeof Board.getInstance === "function"
    ) {
      const boardInstance = Board.getInstance();
      if (boardInstance && typeof boardInstance.resizeCanvas === "function") {
        boardInstance.resizeCanvas();
      }
    }

    // Alternative: Falls board als globale Variable existiert
    if (window.board && typeof window.board.resizeCanvas === "function") {
      window.board.resizeCanvas();
    }

    // Falls die Animation mit einem anderen Mechanismus gerendert wird
    const pixiApp = document.querySelector("#canvas-container canvas");
    if (pixiApp) {
      // Sichtbarkeit kurz wechseln und zurück, um Rendering zu erzwingen
      pixiApp.style.visibility = "hidden";
      setTimeout(() => {
        pixiApp.style.visibility = "visible";
      }, 50);
    }
  }, 100);
}

// Handler für ESC-Taste
function handleEscapeKey(event) {
  if (event.key === "Escape" && isPreviewFullscreen) {
    togglePreviewFullscreen();
  }
}

// Hier wird der onclick-Handler für den Vollbild-Button hinzugefügt
document.addEventListener("DOMContentLoaded", function () {
  const fullscreenBtn = document.getElementById("preview-fullscreen-btn");
  if (fullscreenBtn) {
    fullscreenBtn.onclick = togglePreviewFullscreen;
  }
});

// Optional: CSS für bessere Vollbild-Darstellung hinzufügen
const fullscreenCSS = `
  #fullscreen-exit-btn:hover {
    transform: scale(1.05);
  }
  
  #fullscreen-exit-btn:active {
    transform: scale(0.95);
  }
  
  /* Verhindert Scrollen im Vollbildmodus */
  body.fullscreen-mode {
    overflow: hidden;
  }
`;

// CSS zur Seite hinzufügen
const style2 = document.createElement("style");
style2.textContent = fullscreenCSS;
document.head.appendChild(style2);

// Body-Klasse für Vollbildmodus hinzufügen/entfernen
function toggleBodyFullscreenClass() {
  if (isPreviewFullscreen) {
    document.body.classList.add("fullscreen-mode");
  } else {
    document.body.classList.remove("fullscreen-mode");
  }
}

// Die togglePreviewFullscreen Funktion erweitern
const originalTogglePreviewFullscreen = togglePreviewFullscreen;
togglePreviewFullscreen = function () {
  originalTogglePreviewFullscreen();
  toggleBodyFullscreenClass();
};

// ==============================================
// UNIFIED COLLAPSIBLE SYSTEM HELPERS
// Einheitliche Helper-Funktionen für Formular und Templates
// ==============================================

/**
 * Erstellt eine aufklappbare Gruppe (für Formular und Templates)
 * @param {string} title - Titel der Gruppe
 * @param {boolean} startExpanded - Soll die Gruppe initial geöffnet sein?
 * @param {string} type - 'form' oder 'template' für spezifische Styling
 * @returns {Object} - { container, header, content, toggle }
 */
function createCollapsibleGroup(title, startExpanded = false, type = "form") {
  const container = document.createElement("div");
  container.className = "collapsible-group";

  // Header erstellen
  const header = document.createElement("div");
  header.className = "collapsible-header";

  const icon = document.createElement("span");
  icon.className = "collapsible-icon";
  icon.innerHTML = "▼";

  const titleElement = document.createElement("h3");
  titleElement.textContent = title;

  header.appendChild(icon);
  header.appendChild(titleElement);

  // Content Container
  const content = document.createElement("div");
  content.className = "collapsible-content";

  const contentInner = document.createElement("div");
  contentInner.className = "collapsible-content-inner";
  content.appendChild(contentInner);

  // Initial state
  if (!startExpanded) {
    content.classList.add("collapsed");
    icon.classList.add("collapsed");
  }

  // Toggle function
  const toggle = () => {
    const isCollapsed = content.classList.contains("collapsed");
    content.classList.toggle("collapsed");
    icon.classList.toggle("collapsed");

    // Optional: Smooth scroll to header when expanding
    if (isCollapsed && type === "template") {
      setTimeout(() => {
        header.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  };

  // Event listener
  header.addEventListener("click", toggle);

  // Assembly
  container.appendChild(header);
  container.appendChild(content);

  return {
    container,
    header,
    content: contentInner, // Return inner content for easier access
    toggle,
  };
}

/**
 * Erstellt ein Template-Item mit einheitlichem Styling
 * @param {Object} template - Template-Objekt mit title, image, code
 * @param {string} tabName - Name des aktuellen Tabs
 * @returns {HTMLElement} - Template-Item Element
 */
function createTemplateItem(template, tabName) {
  const item = document.createElement("div");
  item.className = "template-item";

  const img = document.createElement("img");
  img.src = "./src/images/" + template.image;
  img.alt = template.title;

  const title = document.createElement("div");
  title.className = "template-item-title";
  title.textContent = template.title;

  item.appendChild(img);
  item.appendChild(title);

  // Click event
  item.addEventListener("click", () => {
    if (typeof loadTemplateCode === "function") {
      loadTemplateCode(tabName, template.code);
    }
  });

  return item;
}

/**
 * Erstellt eine Formular-Zeile mit einheitlichem Styling
 * @param {string} labelText - Text für das Label
 * @param {HTMLElement} inputElement - Input-Element
 * @param {string} infoText - Optionaler Info-Text
 * @returns {HTMLElement} - Formular-Zeile Element
 */
function createFormRow(labelText, inputElement, infoText = "") {
  const row = document.createElement("div");
  row.className = "form-row";

  // Label Column
  const labelColumn = document.createElement("div");
  labelColumn.className = "form-label-column";

  const label = document.createElement("label");
  label.textContent = labelText;
  label.className = "field-label";
  labelColumn.appendChild(label);

  if (infoText) {
    const info = document.createElement("div");
    info.className = "info-text";
    info.textContent = infoText;
    labelColumn.appendChild(info);
  }

  // Input Column
  const inputColumn = document.createElement("div");
  inputColumn.className = "form-input-column";
  inputColumn.appendChild(inputElement);

  row.appendChild(labelColumn);
  row.appendChild(inputColumn);

  return row;
}

/**
 * Erstellt eine Methoden-Zeile für das Formular
 * @param {string} methodName - Name der Methode
 * @param {string} example - Beispiel-Code
 * @param {string} infoText - Info-Text
 * @returns {HTMLElement} - Methoden-Zeile Element
 */
function createMethodRow(methodName, example, infoText = "") {
  const row = document.createElement("div");
  row.className = "form-row";

  // Label Column
  const labelColumn = document.createElement("div");
  labelColumn.className = "form-label-column";

  const label = document.createElement("label");
  label.textContent = methodName;
  labelColumn.appendChild(label);

  if (infoText) {
    const info = document.createElement("div");
    info.className = "info-text";
    info.textContent = infoText;
    labelColumn.appendChild(info);
  }

  // Method Display
  const methodDisplay = document.createElement("div");
  methodDisplay.className = "method-display";

  const methodExample = document.createElement("div");
  methodExample.className = "method-example";
  methodExample.textContent = example;

  const copyButton = createCopyButton(example);

  methodDisplay.appendChild(methodExample);
  methodDisplay.appendChild(copyButton);

  row.appendChild(labelColumn);
  row.appendChild(methodDisplay);

  return row;
}

/**
 * Erstellt einen einheitlichen Kopier-Button
 * @param {string} textToCopy - Text zum Kopieren
 * @returns {HTMLElement} - Kopier-Button Element
 */
function createCopyButton(textToCopy) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn-secondary btn-small";
  button.textContent = getTranslationSafe("copy_button", "Copy");

  button.addEventListener("click", (event) => {
    event.stopPropagation();

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        const originalText = button.textContent;
        button.textContent = getTranslationSafe("copied", "Copied");
        button.classList.add("btn-success");

        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("btn-success");
        }, 1000);
      })
      .catch((err) => {
        console.error("Error copying text:", err);
      });
  });

  return button;
}

/**
 * Erstellt Form-Buttons (OK, Cancel)
 * @param {Function} onSave - Callback für Speichern
 * @param {Function} onCancel - Callback für Abbrechen
 * @returns {HTMLElement} - Button-Container
 */
function createFormButtons(onSave, onCancel) {
  const container = document.createElement("div");
  container.className = "form-buttons";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "btn-secondary";
  cancelButton.textContent = getTranslationSafe("cancel", "Cancel");
  cancelButton.addEventListener("click", onCancel);

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "btn-primary";
  saveButton.textContent = getTranslationSafe("ok", "OK");
  saveButton.addEventListener("click", onSave);

  container.appendChild(cancelButton);
  container.appendChild(saveButton);

  return container;
}

/**
 * Organisiert Templates in Kategorien und erstellt aufklappbare Gruppen
 * @param {Array} templates - Array von Template-Objekten
 * @param {string} tabName - Name des aktuellen Tabs
 * @returns {HTMLElement} - Container mit allen Template-Kategorien
 */
function createTemplateCategories(templates, tabName) {
  const container = document.createElement("div");
  container.className = "template-categories";

  const categoryOrder = [
    "General",
    "Geometry",
    "UI",
    "Elements",
    "Lines & Curves",
    "Math",
    "Special",
  ];
  const categories = {};

  // Templates nach Kategorien organisieren
  templates.forEach((template) => {
    if (!categories[template.category]) {
      categories[template.category] = [];
    }
    categories[template.category].push(template);
  });

  // Kategorien als aufklappbare Gruppen erstellen
  categoryOrder.forEach((categoryName, index) => {
    if (!categories[categoryName]) return;

    const { container: groupContainer, content } = createCollapsibleGroup(
      categoryName,
      index === 0, // Erste Kategorie geöffnet
      "template",
    );

    // Template-Grid erstellen
    const grid = document.createElement("div");
    grid.className = "template-grid";

    categories[categoryName].forEach((template) => {
      const templateItem = createTemplateItem(template, tabName);
      grid.appendChild(templateItem);
    });

    content.appendChild(grid);
    container.appendChild(groupContainer);
  });

  return container;
}

/**
 * Erstellt das Formular mit aufklappbaren Gruppen
 * @param {Object} formData - Formular-Daten
 * @param {string} variableName - Name der Variable
 * @returns {HTMLElement} - Formular-Container
 */
function createFormWithCollapsibleGroups(formData, variableName = "") {
  const container = document.createElement("div");
  container.className = "form-container";

  // Close Button
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "close-button";
  closeButton.innerHTML = "&times;";
  closeButton.addEventListener("click", () => {
    if (typeof closeForm === "function") {
      closeForm(false);
    }
  });
  container.appendChild(closeButton);

  // Parameter Group
  if (formData.constructor && Object.keys(formData.constructor).length > 0) {
    const { container: paramGroup, content } = createCollapsibleGroup(
      getTranslationSafe("parameters", "Parameters"),
      true, // Parameters initial geöffnet
    );

    const fieldsContainer = document.createElement("div");
    fieldsContainer.className = "form-fields";

    Object.entries(formData.constructor).forEach(([key, value]) => {
      if (typeof createFormField === "function") {
        const { labelColumn, inputColumn } = createFormField(
          key,
          value,
          "constructor",
        );
        const row = createFormRow(formatLabel(key), inputColumn, "");
        // Replace label with original label column to preserve info text
        row.replaceChild(labelColumn, row.firstChild);
        fieldsContainer.appendChild(row);
      }
    });

    // Add form buttons
    const formButtons = createFormButtons(
      () => {
        if (typeof saveFormChanges === "function") {
          saveFormChanges();
        }
      },
      () => {
        if (typeof closeForm === "function") {
          closeForm(false);
        }
      },
    );
    fieldsContainer.appendChild(formButtons);

    content.appendChild(fieldsContainer);
    container.appendChild(paramGroup.container);
  }

  // Setter Group
  if (formData.setter && Object.keys(formData.setter).length > 0) {
    const { container: setterGroup, content } = createCollapsibleGroup(
      getTranslationSafe("additional", "Additional"),
      false,
    );

    const fieldsContainer = document.createElement("div");
    fieldsContainer.className = "form-fields";

    Object.entries(formData.setter).forEach(([key, value]) => {
      const methodExample = createMethodExample(key, value, variableName);
      const row = createMethodRow(
        value && typeof value === "object" && value.name ? value.name : key,
        methodExample,
        value && typeof value === "object" && value.info
          ? translateSerializationInfoSafe(value.info)
          : "",
      );
      fieldsContainer.appendChild(row);
    });

    content.appendChild(fieldsContainer);
    container.appendChild(setterGroup.container);
  }

  // Methods Group
  if (formData.methods && Object.keys(formData.methods).length > 0) {
    const { container: methodsGroup, content } = createCollapsibleGroup(
      getTranslationSafe("methods", "Methods"),
      false,
    );

    const fieldsContainer = document.createElement("div");
    fieldsContainer.className = "form-fields";

    Object.entries(formData.methods).forEach(([key, value]) => {
      const methodExample = createMethodExample(key, value, variableName, true);
      const row = createMethodRow(
        key,
        methodExample,
        value && typeof value === "object" && value.info
          ? translateSerializationInfoSafe(value.info)
          : "",
      );
      fieldsContainer.appendChild(row);
    });

    content.appendChild(fieldsContainer);
    container.appendChild(methodsGroup.container);
  }

  return container;
}

/**
 * Hilfsfunktion für Methoden-Beispiele
 * @param {string} key - Methoden-Name
 * @param {*} value - Methoden-Wert
 * @param {string} variableName - Variable Name
 * @param {boolean} isMethod - Ist es eine Methode?
 * @returns {string} - Beispiel-Code
 */
function createMethodExample(key, value, variableName, isMethod = false) {
  let exampleText = "";
  if (value && typeof value === "object" && value.example) {
    exampleText = variableName
      ? `${variableName}.${value.example}`
      : value.example;
  } else if (isMethod) {
    exampleText = variableName ? `${variableName}.${value}` : value;
  } else {
    exampleText = variableName
      ? `${variableName}.${value.name || key}(value)`
      : value.name
        ? `${value.name}(value)`
        : `${key}(value)`;
  }
  return exampleText;
}

/**
 * Utility: Alle aufklappbaren Gruppen schließen
 * @param {HTMLElement} container - Container mit Gruppen
 */
function collapseAllGroups(container) {
  const groups = container.querySelectorAll(".collapsible-content");
  const icons = container.querySelectorAll(".collapsible-icon");

  groups.forEach((group) => group.classList.add("collapsed"));
  icons.forEach((icon) => icon.classList.add("collapsed"));
}

/**
 * Utility: Alle aufklappbaren Gruppen öffnen
 * @param {HTMLElement} container - Container mit Gruppen
 */
function expandAllGroups(container) {
  const groups = container.querySelectorAll(".collapsible-content");
  const icons = container.querySelectorAll(".collapsible-icon");

  groups.forEach((group) => group.classList.remove("collapsed"));
  icons.forEach((icon) => icon.classList.remove("collapsed"));
}

/**
 * Safe wrapper für getTranslation - verwendet Fallback falls Funktion nicht verfügbar
 * @param {string} key - Translation key
 * @param {string} fallback - Fallback text
 * @returns {string} - Übersetzter oder Fallback-Text
 */
function getTranslationSafe(key, fallback = key) {
  if (typeof getTranslation === "function") {
    return getTranslation(key, fallback);
  } else if (
    typeof window !== "undefined" &&
    window.i18n &&
    typeof window.i18n.translate === "function"
  ) {
    return window.i18n.translate(key, fallback);
  }
  return fallback;
}

/**
 * Safe wrapper für translateSerializationInfo
 * @param {string} info - Info text to translate
 * @returns {string} - Translated info text
 */
function translateSerializationInfoSafe(info) {
  if (typeof translateSerializationInfo === "function") {
    return translateSerializationInfo(info);
  }
  return info;
}

/**
 * Safe wrapper für formatLabel
 * @param {string} key - Label key
 * @returns {string} - Formatted label
 */
function formatLabel(key) {
  if (typeof window.formatLabel === "function") {
    return window.formatLabel(key);
  }
  return key;
}

// Export functions for use in other modules (falls Module-System verwendet wird)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    createCollapsibleGroup,
    createTemplateItem,
    createFormRow,
    createMethodRow,
    createCopyButton,
    createFormButtons,
    createTemplateCategories,
    createFormWithCollapsibleGroups,
    createMethodExample,
    collapseAllGroups,
    expandAllGroups,
    getTranslationSafe,
    translateSerializationInfoSafe,
  };
}

// Globale Verfügbarkeit für Browser-Umgebung
if (typeof window !== "undefined") {
  window.UnifiedHelpers = {
    createCollapsibleGroup,
    createTemplateItem,
    createFormRow,
    createMethodRow,
    createCopyButton,
    createFormButtons,
    createTemplateCategories,
    createFormWithCollapsibleGroups,
    createMethodExample,
    collapseAllGroups,
    expandAllGroups,
    getTranslationSafe,
    translateSerializationInfoSafe,
  };
}
