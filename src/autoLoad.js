// Auto-loads a file on startup via URL parameter: index.html?file=filename.js

const params = new URLSearchParams(window.location.search);
const fileToLoad = params.get("file");

if (fileToLoad) {
  window.addEventListener("load", () => {
    window.addEventListener("preloaderComplete", () => {
      // Wait two animation frames to ensure layout is stable before loading
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fetch(`./codes/${fileToLoad}`)
            .then((response) => response.text())
            .then((code) => {
              const activeTabName = document.querySelector(".tab.active")?.childNodes[0]?.nodeValue?.trim() || "Tab 1";
              loadTemplateCode(activeTabName, code);

              // Resize canvas after code is loaded into the editor
              setTimeout(() => {
                const boardInstance = window.getBoardInstance();
                if (boardInstance) boardInstance.resizeCanvas();
              }, 150);
            })
            .catch((err) => console.error("Error loading file:", err));
        });
      });
    });
  });
}
