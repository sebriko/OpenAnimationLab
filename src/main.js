// Keyboard shortcuts
document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault();
    saveCode();
    return false;
  }
  if (event.ctrlKey && event.key === "o") {
    event.preventDefault();
    document.getElementById("loadFile").click();
    return false;
  }
  if (event.ctrlKey && event.key === "Enter") {
    event.preventDefault();
    runCode();
    return false;
  }
});

document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener("preloaderComplete", function () {
    requestAnimationFrame(() => {
      // Resize canvas after layout has stabilized
      const boardInstance = window.getBoardInstance();
      if (boardInstance) boardInstance.resizeCanvas();

      // Load a pending template if one was queued before the preloader finished
      if (
        window._pendingTemplateLoad &&
        window._pendingTemplateLoad.shouldLoad
      ) {
        const template = window._pendingTemplateLoad.template;
        if (template) {
          const activeTab = document.querySelector(".tab.active");
          const activeTabName = activeTab
            ? activeTab.getAttribute("data-tab")
            : null;

          if (activeTabName && typeof loadTemplateCode === "function") {
            setTimeout(() => {
              loadTemplateCode(activeTabName, template.code);
              delete window._pendingTemplateLoad;
            }, 100);
          }
        }
      }

      resizeEditor();
    });
  });
});
