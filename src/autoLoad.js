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
              loadTemplateCode(fileToLoad, code);

              // Resize canvas after code is loaded into the editor
              setTimeout(() => {
                if (
                  window.Board &&
                  Board.getInstance &&
                  typeof Board.getInstance === "function"
                ) {
                  const boardInstance = Board.getInstance();
                  if (
                    boardInstance &&
                    typeof boardInstance.resizeCanvas === "function"
                  ) {
                    boardInstance.resizeCanvas();
                  }
                }
              }, 150);
            })
            .catch((err) => console.error("Error loading file:", err));
        });
      });
    });
  });
}
