let tabCounter = 1;
let tabContents = {};
let tabObjects = {};
let tabScrollPositions = {};
let currentTabName;
let isTabSwitching = false;
let customProjectTemplates = null;

let templatesLoadedPromise = null;
let templatesLoadedResolve = null;

function initializeTemplatesPromise() {
  templatesLoadedPromise = new Promise((resolve) => {
    templatesLoadedResolve = resolve;
  });
}

initializeTemplatesPromise();

function hasURLParameter(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has(paramName);
}

function getURLParameter(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function hasAnyTabWithCode() {
  for (const [tabName, content] of Object.entries(tabContents)) {
    if (content && content.trim().length > 0) {
      return true;
    }
  }
  return false;
}

function tabHasCode(tabName) {
  return tabContents[tabName] && tabContents[tabName].trim().length > 0;
}

window.addEventListener("beforeunload", function (event) {
  if (hasAnyTabWithCode()) {
    event.preventDefault();
    event.returnValue = "";
    return "";
  }
});

function monitorTemplatesLoading() {
  let checkCount = 0;
  const maxChecks = 100;

  const checkTemplates = () => {
    checkCount++;

    const templatesAvailable =
      (typeof projectTemplates !== "undefined" && projectTemplates) ||
      (typeof window.projectTemplates !== "undefined" &&
        window.projectTemplates) ||
      customProjectTemplates ||
      window.customProjectTemplates;

    if (templatesAvailable) {
      if (templatesLoadedResolve) {
        templatesLoadedResolve(true);
      }
      return;
    }

    if (checkCount < maxChecks) {
      setTimeout(checkTemplates, 100);
    } else {
      console.warn("[Templates] Not found after maximum attempts");
      if (templatesLoadedResolve) {
        templatesLoadedResolve(false);
      }
    }
  };

  checkTemplates();
}

function switchTab(tabName) {
  if (currentTabName === tabName) {
    return;
  }

  const canvasContainer = document.getElementById("canvas-container");
  if (canvasContainer) {
    canvasContainer.style.display = "none";
    canvasContainer.style.visibility = "hidden";
  }

  if (isTabSwitching) return;
  isTabSwitching = true;

  try {
    requestAnimationFrame(() => {
      performTabSwitch(tabName);
      isTabSwitching = false;
    });
  } catch (error) {
    console.error("Error during tab switch:", error);
    isTabSwitching = false;
  }
}

function performTabSwitch(tabName) {
  saveCurrentTabContent();

  currentTabName = tabName;

  hideAllViews();
  showCanvas();

  const tabObject = tabObjects[tabName];

  if (tabObject?.formOpen) {
    showFormView(tabName, tabObject);
  } else if (tabObject?.showPreview) {
    showPreviewTable(tabName);
  } else {
    showCodeEditorView(tabName);
  }

  updateTabsUI(tabName);
  updatePreviewVisibility(tabName);

  if (typeof setupSearchForm === "function") {
    setupSearchForm();
  }
}

function saveCurrentTabContent() {
  const activeTab = document.querySelector(".tab.active");
  if (activeTab && editor) {
    const activeTabName = activeTab.getAttribute("data-tab");
    if (activeTabName && editor.getValue) {
      const currentContent = editor.getValue();
      if (tabContents[activeTabName] !== currentContent) {
        tabContents[activeTabName] = currentContent;
      }
      if (editor.getScrollInfo) {
        const scrollInfo = editor.getScrollInfo();
        tabScrollPositions[activeTabName] = {
          left: scrollInfo.left,
          top: scrollInfo.top,
        };
      }
    }
  }
}

function hideAllViews() {
  const elementsToHide = [
    document.querySelector("form"),
    editor?.getWrapperElement?.(),
    document.getElementById("preview-table"),
    document.getElementById("left-actions"),
    document.getElementById("right-actions"),
  ].filter(Boolean);

  elementsToHide.forEach((element) => {
    if (element) element.style.display = "none";
  });

  document.querySelectorAll(".textarea-container").forEach((container) => {
    container.style.display = "none";
  });
}

function showCanvas() {
  const canvasContainer = document.getElementById("canvas-container");
  if (canvasContainer) {
    canvasContainer.style.display = "block";
    canvasContainer.style.visibility = "visible";
  }
}

function showFormView(tabName, tabObject) {
  const formElement = document.querySelector("form");
  if (formElement && tabObject.formData) {
    formElement.style.display = "block";

    setTimeout(() => {
      if (typeof generateFormFromJSON === "function") {
        generateFormFromJSON(JSON.stringify(tabObject.formData));
      }
    }, 0);

    loadTabContent(tabName);
  }
}

function showCodeEditorView(tabName) {
  if (editor?.getWrapperElement) {
    editor.getWrapperElement().style.display = "block";

    if (tabContents[tabName]) {
      loadTabContent(tabName);
    } else {
      editor.setValue("");

      setTimeout(() => showPreviewTable(tabName), 0);

      if (tabObjects[tabName]) {
        tabObjects[tabName].showPreview = true;
      }
    }
  }
}

function loadTabContent(tabName) {
  if (tabContents[tabName] && editor?.setValue) {
    editor.setValue(tabContents[tabName]);

    setTimeout(() => {
      if (tabScrollPositions[tabName] && editor.scrollTo) {
        editor.scrollTo(
          tabScrollPositions[tabName].left,
          tabScrollPositions[tabName].top,
        );
      }

      if (typeof runCode === "function") {
        runCode();
      }
    }, 0);
  }
}

function updateTabsUI(tabName) {
  const allTabs = document.querySelectorAll(".tab");
  let targetTab = null;

  allTabs.forEach((tab) => {
    const isTarget = tab.getAttribute("data-tab") === tabName;
    tab.classList.toggle("active", isTarget);
    if (isTarget) targetTab = tab;
  });

  return targetTab;
}

const updatePreviewVisibility = debounce(function (tabName) {
  const containers = document.querySelectorAll(".preview-container");
  const activePreview = document.getElementById("preview-" + tabName);

  containers.forEach((container) => {
    container.style.display = container === activePreview ? "block" : "none";
  });
}, 50);

function addTab() {
  const formElement = document.querySelector("form");
  if (formElement) formElement.style.display = "none";

  if (editor?.getWrapperElement) {
    editor.getWrapperElement().style.display = "block";
  }

  const tabName = "Tab " + tabCounter++;

  const newTab = createTabElement(tabName);

  const tabsContainer = document.querySelector(".tabs");
  const plusTab = document.querySelector(".plus-tab");
  if (tabsContainer && plusTab) {
    tabsContainer.insertBefore(newTab, plusTab);
  }

  tabObjects[tabName] = {
    formOpen: false,
    formData: null,
    showPreview: true,
  };

  createPreviewContainer(tabName);

  switchTab(tabName);
}

function createTabElement(tabName) {
  const newTab = document.createElement("div");
  newTab.classList.add("tab");
  newTab.setAttribute("data-tab", tabName);

  const connector = document.createElement("div");
  connector.classList.add("tab-connector");
  newTab.appendChild(connector);

  const closeButton = document.createElement("span");
  closeButton.classList.add("close-tab");
  closeButton.textContent = "✖";
  closeButton.onclick = (event) => {
    event.stopPropagation();
    closeTab(tabName);
  };

  newTab.textContent = tabName + " ";
  newTab.appendChild(closeButton);
  newTab.onclick = () => switchTab(tabName);

  return newTab;
}

function createPreviewContainer(tabName) {
  const previewContainer = document.createElement("div");
  previewContainer.id = "preview-" + tabName;
  previewContainer.classList.add("preview-container");
  previewContainer.style.display = "none";

  const previewElement = document.getElementById("preview");
  if (previewElement) {
    previewElement.appendChild(previewContainer);
  }
}

function closeTab(tabName) {
  const tabElement = document.querySelector(`.tab[data-tab='${tabName}']`);
  if (!tabElement) return;

  const tabObject = tabObjects[tabName];
  const isShowingPreview = tabObject && tabObject.showPreview;

  if (!isShowingPreview && tabHasCode(tabName)) {
    const confirmMessage = getTranslation(
      "confirm_close_tab",
      "This tab contains code. Are you sure you want to close it? All unsaved changes will be lost.",
    );

    if (!confirm(confirmMessage)) {
      return;
    }
  }

  const wasActive = tabElement.classList.contains("active");

  tabElement.remove();
  delete tabContents[tabName];
  delete tabObjects[tabName];
  delete tabScrollPositions[tabName];

  const previewContainer = document.getElementById("preview-" + tabName);
  if (previewContainer) {
    previewContainer.remove();
  }

  if (wasActive) {
    const remainingTabs = document.querySelectorAll(".tab");
    if (remainingTabs.length > 0) {
      switchTab(remainingTabs[0].getAttribute("data-tab"));
    } else if (editor?.setValue) {
      editor.setValue("");
    }
  }
}

async function showPreviewTable(tabName) {
  const canvas = document.querySelector("#canvas-container");
  if (canvas) {
    canvas.style.visibility = "hidden";
    canvas.style.display = "none";
  }

  const leftActions = document.getElementById("left-actions");
  const rightActions = document.getElementById("right-actions");
  if (leftActions) leftActions.style.display = "none";
  if (rightActions) rightActions.style.display = "none";

  const existingContainer = document.getElementById("preview-table");
  if (existingContainer) {
    existingContainer.remove();
  }

  if (editor?.getWrapperElement) {
    editor.getWrapperElement().style.display = "none";
  }

  try {
    await templatesLoadedPromise;
    createPreviewTableContent(tabName);
  } catch (error) {
    console.error("Error waiting for templates:", error);
    createPreviewTableContent(tabName);
  }
}

function createPreviewTableContent(tabName) {
  const container = document.createElement("div");
  container.id = "preview-table";
  container.classList.add("preview-table", "form-container");

  container.style.overflow = "auto";
  container.style.padding = "20px";
  container.style.boxSizing = "border-box";
  container.style.display = "flex";
  container.style.flexDirection = "column";

  const templatesAvailable =
    (typeof projectTemplates !== "undefined" && projectTemplates) ||
    (typeof window.projectTemplates !== "undefined" &&
      window.projectTemplates) ||
    customProjectTemplates ||
    window.customProjectTemplates;

  if (templatesAvailable) {
    renderProjectTemplatesWithCollapsibleCategories(container, tabName);

    const loadButton = createLoadTemplatesButton(tabName);
    container.appendChild(loadButton);
  } else {
    const noTemplatesMessage = document.createElement("div");
    noTemplatesMessage.textContent = getTranslation(
      "no_templates_available",
      "No templates available",
    );
    noTemplatesMessage.style.textAlign = "center";
    noTemplatesMessage.style.marginTop = "50px";
    noTemplatesMessage.style.color = "var(--text-light)";
    container.appendChild(noTemplatesMessage);

    const retryButton = document.createElement("button");
    retryButton.className = "form-button";
    retryButton.textContent = getTranslation(
      "retry_load_templates",
      "Retry Loading Templates",
    );
    retryButton.style.marginTop = "20px";
    retryButton.onclick = () => {
      initializeTemplatesPromise();
      monitorTemplatesLoading();
      showPreviewTable(tabName);
    };

    const buttonContainer = document.createElement("div");
    buttonContainer.style.textAlign = "center";
    buttonContainer.appendChild(retryButton);
    container.appendChild(buttonContainer);

    const loadButton = createLoadTemplatesButton(tabName);
    container.appendChild(loadButton);
  }

  const isPortraitMode =
    window.innerWidth <= 768 ||
    (window.innerHeight > window.innerWidth && window.innerWidth <= 1024);

  if (isPortraitMode) {
    const previewElement = document.getElementById("preview");
    if (previewElement) {
      container.style.position = "relative";
      container.style.width = "100%";
      container.style.height = "auto";
      container.style.minHeight = "400px";
      container.style.backgroundColor = "var(--bg-light)";

      previewElement.insertBefore(container, previewElement.firstChild);
    }
  } else {
    const editorContent = document.querySelector(".editor-content");
    if (editorContent) {
      editorContent.insertBefore(container, editorContent.firstChild);
    }
  }
}

function createLoadTemplatesButton(tabName) {
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "load-templates-container";
  buttonContainer.style.marginTop = "30px";
  buttonContainer.style.paddingTop = "20px";
  buttonContainer.style.borderTop = "1px solid var(--border-light)";
  buttonContainer.style.textAlign = "center";

  const buttonRow = document.createElement("div");
  buttonRow.className = "template-button-row";
  buttonRow.style.display = "flex";
  buttonRow.style.gap = "10px";
  buttonRow.style.justifyContent = "center";
  buttonRow.style.marginBottom = "10px";

  const loadButton = document.createElement("button");
  loadButton.className = "form-button template-action-button";
  loadButton.textContent = getTranslation(
    "load_custom_templates",
    "Load Templates",
  );
  loadButton.setAttribute("data-i18n-key", "load_custom_templates");

  const saveButton = document.createElement("button");
  saveButton.className = "form-button template-action-button";
  saveButton.textContent = getTranslation(
    "save_current_templates",
    "Save Templates",
  );
  saveButton.setAttribute("data-i18n-key", "save_current_templates");

  const organizerButton = document.createElement("button");
  organizerButton.className = "form-button template-action-button";
  organizerButton.textContent = getTranslation(
    "template_organizer",
    "Template Organizer",
  );
  organizerButton.setAttribute("data-i18n-key", "template_organizer");

  loadButton.addEventListener("click", () => {
    loadExternalTemplates(tabName);
  });

  saveButton.addEventListener("click", () => {
    saveCurrentTemplates();
  });

  organizerButton.addEventListener("click", () => {
    if (window.templateOrganizer) {
      window.templateOrganizer.openOrganizer();
    }
  });

  buttonRow.appendChild(loadButton);
  buttonRow.appendChild(saveButton);
  buttonRow.appendChild(organizerButton);

  const statusText = document.createElement("div");
  statusText.id = "template-load-status";
  statusText.style.marginTop = "10px";
  statusText.style.fontSize = "12px";
  statusText.style.color = "var(--text-light)";

  if (customProjectTemplates) {
    statusText.textContent = getTranslation(
      "custom_templates_loaded",
      "Custom templates loaded",
    );
    statusText.style.color = "var(--success-color, #28a745)";
  }

  buttonContainer.appendChild(buttonRow);
  buttonContainer.appendChild(statusText);

  return buttonContainer;
}

function renderProjectTemplatesWithCollapsibleCategories(container, tabName) {
  const templatesToUse =
    window.customProjectTemplates ||
    customProjectTemplates ||
    window.projectTemplates ||
    projectTemplates;

  if (!templatesToUse) {
    console.warn("[Templates] No templates found to render");
    return;
  }

  while (
    container.firstChild &&
    container.firstChild.id !== "template-load-status"
  ) {
    container.removeChild(container.firstChild);
  }

  if (templatesToUse.categories && Array.isArray(templatesToUse.categories)) {
    templatesToUse.categories.forEach((category, index) => {
      const categoryGroup = createCollapsibleCategoryGroup(
        category.name,
        category.templates,
        tabName,
        index === 0,
        category.description,
      );
      container.appendChild(categoryGroup);
    });
  } else if (Array.isArray(templatesToUse)) {
    const categoryOrder = [
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
    ];
    const categories = {};

    templatesToUse.forEach((template) => {
      if (!categories[template.category]) {
        categories[template.category] = [];
      }
      categories[template.category].push(template);
    });

    categoryOrder.forEach((categoryName, index) => {
      if (!categories[categoryName]) return;

      const categoryGroup = createCollapsibleCategoryGroup(
        categoryName,
        categories[categoryName],
        tabName,
        index === 0,
      );
      container.appendChild(categoryGroup);
    });

    Object.keys(categories).forEach((categoryName) => {
      if (!categoryOrder.includes(categoryName)) {
        const categoryGroup = createCollapsibleCategoryGroup(
          categoryName,
          categories[categoryName],
          tabName,
          false,
        );
        container.appendChild(categoryGroup);
      }
    });
  }
}

function createCollapsibleCategoryGroup(
  categoryName,
  templates,
  tabName,
  startExpanded = false,
  description = null,
) {
  const groupContainer = document.createElement("div");
  groupContainer.className = "parameter-group template-category-group";

  const headerContainer = document.createElement("div");
  headerContainer.className = "group-header";

  const toggleIcon = document.createElement("span");
  toggleIcon.innerHTML = "▼";
  toggleIcon.className = "group-header-icon";

  const headerTitle = document.createElement("h3");
  headerTitle.textContent = getCategoryTranslation(categoryName);
  headerTitle.setAttribute("data-i18n-category", categoryName);
  headerTitle.style.margin = "0";

  headerContainer.appendChild(toggleIcon);
  headerContainer.appendChild(headerTitle);

  const contentContainer = document.createElement("div");
  contentContainer.className = "group-fields template-category-content";

  if (!startExpanded) {
    contentContainer.classList.add("collapsed");
    toggleIcon.classList.add("collapsed");
  }

  if (description) {
    const descriptionElement = document.createElement("div");
    descriptionElement.className = "category-description";

    descriptionElement.textContent = description;

    Object.assign(descriptionElement.style, {
      padding: "0",
      margin: "0",
      fontSize: "14px",
      lineHeight: "1.5",
      color: "var(--text-light, #666)",
      fontStyle: "italic",
    });

    contentContainer.appendChild(descriptionElement);
  }

  const templateGrid = document.createElement("div");
  templateGrid.className = "category-container template-grid";
  templateGrid.style.display = "grid";
  templateGrid.style.gridTemplateColumns =
    "repeat(auto-fit, minmax(150px, 1fr))";
  templateGrid.style.gap = "15px";
  templateGrid.style.padding = "0";
  templateGrid.style.marginTop = "5px";

  templates.forEach((template) => {
    const templateItem = createEnhancedTemplateItem(template, tabName);
    templateGrid.appendChild(templateItem);
  });

  contentContainer.appendChild(templateGrid);

  headerContainer.addEventListener("click", () => {
    const isCurrentlyCollapsed =
      contentContainer.classList.contains("collapsed");

    const allTemplateGroups =
      headerContainer
        .closest(".preview-table")
        ?.querySelectorAll(".template-category-group") || [];
    allTemplateGroups.forEach((group) => {
      const otherContentContainer = group.querySelector(
        ".template-category-content",
      );
      const otherToggleIcon = group.querySelector(".group-header-icon");

      if (
        otherContentContainer &&
        otherToggleIcon &&
        otherContentContainer !== contentContainer
      ) {
        otherContentContainer.classList.add("collapsed");
        otherToggleIcon.classList.add("collapsed");
      }
    });

    if (isCurrentlyCollapsed) {
      contentContainer.classList.remove("collapsed");
      toggleIcon.classList.remove("collapsed");

      setTimeout(() => {
        headerContainer.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 150);
    } else {
      contentContainer.classList.add("collapsed");
      toggleIcon.classList.add("collapsed");
    }
  });

  groupContainer.appendChild(headerContainer);
  groupContainer.appendChild(contentContainer);

  return groupContainer;
}

function createEnhancedTemplateItem(template, tabName) {
  const item = document.createElement("div");
  item.classList.add("preview-item", "enhanced-template-item");

  item.style.transition = "all 0.2s ease";
  item.style.borderRadius = "8px";
  item.style.overflow = "hidden";
  item.style.cursor = "pointer";

  const img = document.createElement("img");

  if (template.imageData) {
    img.src = template.imageData;
    img.alt = template.title;
  } else if (template.image) {
    img.src = "./src/images/" + template.image;
    img.alt = template.title;

    img.onerror = function () {
      this.src = "./src/images/fallback.png";
      this.onerror = null;
    };
  } else {
    img.src = "./src/images/fallback.png";
    img.alt = template.title || "No image";
  }

  img.style.width = "100%";
  img.style.height = "120px";
  img.style.objectFit = "cover";
  img.style.display = "block";

  const titleContainer = document.createElement("div");

  titleContainer.textContent = template.title;
  titleContainer.style.padding = "10px";
  titleContainer.style.textAlign = "center";
  titleContainer.style.fontSize = "14px";
  titleContainer.style.fontWeight = "500";
  titleContainer.style.color = "var(--text-light)";
  titleContainer.style.backgroundColor = "var(--bg-lighter)";
  titleContainer.style.opacity = "0.8";
  titleContainer.style.borderTop = "1px solid var(--border-light)";

  item.appendChild(img);
  item.appendChild(titleContainer);

  item.addEventListener("mouseenter", () => {
    item.style.transform = "translateY(-2px)";
    item.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    titleContainer.style.backgroundColor = "var(--bg-medium)";
  });

  item.addEventListener("mouseleave", () => {
    item.style.transform = "translateY(0)";
    item.style.boxShadow = "none";
    titleContainer.style.backgroundColor = "var(--bg-lighter)";
  });

  item.addEventListener("click", () => {
    loadTemplateCode(tabName, template.code);
  });

  return item;
}

function loadExternalTemplates(tabName) {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".js";
  fileInput.style.display = "none";

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const originalProjectTemplates = window.projectTemplates;

        let loadedTemplates = null;

        try {
          delete window.projectTemplates;
          (1, eval)(e.target.result);

          if (window.projectTemplates) {
            loadedTemplates = window.projectTemplates;
          }
        } catch (evalError) {}

        if (!loadedTemplates) {
          try {
            const func = new Function(
              e.target.result +
                '\nreturn typeof projectTemplates !== "undefined" ? projectTemplates : null;',
            );
            const result = func();
            if (result) {
              loadedTemplates = result;
            }
          } catch (funcError) {}
        }

        if (!loadedTemplates) {
          try {
            const match = e.target.result.match(
              /projectTemplates\s*=\s*(\[[\s\S]*?\]|\{[\s\S]*?\});/,
            );
            if (match && match[1]) {
              loadedTemplates = eval("(" + match[1] + ")");
            }
          } catch (regexError) {}
        }

        let templateCount = 0;
        if (loadedTemplates) {
          if (
            loadedTemplates.categories &&
            Array.isArray(loadedTemplates.categories)
          ) {
            templateCount = loadedTemplates.categories.reduce(
              (count, cat) => count + cat.templates.length,
              0,
            );
          } else if (Array.isArray(loadedTemplates)) {
            templateCount = loadedTemplates.length;
          }
        }

        if (templateCount > 0) {
          customProjectTemplates = loadedTemplates;

          window.projectTemplates = originalProjectTemplates;

          const statusText = document.getElementById("template-load-status");
          if (statusText) {
            statusText.textContent =
              getTranslation(
                "custom_templates_loaded",
                "Custom templates loaded successfully!",
              ) + ` (${templateCount} templates)`;
            statusText.style.color = "var(--success-color, #28a745)";
          }

          showPreviewTable(tabName);
        } else {
          throw new Error("No valid projectTemplates found in file");
        }
      } catch (error) {
        console.error("Error loading templates:", error);

        const statusText = document.getElementById("template-load-status");
        if (statusText) {
          statusText.textContent =
            getTranslation("template_load_error", "Error loading templates: ") +
            error.message;
          statusText.style.color = "var(--error-color, #dc3545)";
        }

        if (
          window.projectTemplates === undefined &&
          originalProjectTemplates !== undefined
        ) {
          window.projectTemplates = originalProjectTemplates;
        }
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      const statusText = document.getElementById("template-load-status");
      if (statusText) {
        statusText.textContent = getTranslation(
          "file_read_error",
          "Error reading file",
        );
        statusText.style.color = "var(--error-color, #dc3545)";
      }
    };

    reader.readAsText(file);
  });

  fileInput.click();
}

function findTemplateByImageName(imageName) {
  const templatesToSearch =
    window.customProjectTemplates ||
    customProjectTemplates ||
    window.projectTemplates ||
    projectTemplates;

  if (!templatesToSearch) {
    return null;
  }

  const normalizedImageName = imageName
    .toLowerCase()
    .replace(/\.(jpg|jpeg|png|gif|webp)$/i, "");

  let foundTemplate = null;
  let checkedCount = 0;

  if (
    templatesToSearch.categories &&
    Array.isArray(templatesToSearch.categories)
  ) {
    for (const category of templatesToSearch.categories) {
      for (const template of category.templates) {
        checkedCount++;
        if (template.image) {
          const templateImageName = template.image
            .split("/")
            .pop()
            .toLowerCase()
            .replace(/\.(jpg|jpeg|png|gif|webp)$/i, "");
          if (templateImageName === normalizedImageName) {
            foundTemplate = template;
            break;
          }
        }
      }
      if (foundTemplate) break;
    }
  } else if (Array.isArray(templatesToSearch)) {
    for (const template of templatesToSearch) {
      checkedCount++;
      if (template.image) {
        const templateImageName = template.image
          .split("/")
          .pop()
          .toLowerCase()
          .replace(/\.(jpg|jpeg|png|gif|webp)$/i, "");

        if (templateImageName === normalizedImageName) {
          foundTemplate = template;
          break;
        }
      }
    }
  }

  return foundTemplate;
}

function getTranslation(key, defaultText) {
  if (typeof window.i18n !== "undefined" && window.i18n.translate) {
    return window.i18n.translate(key) || defaultText;
  }
  return defaultText;
}

function getCategoryTranslation(categoryName) {
  if (typeof window.i18n !== "undefined" && window.i18n.translateCategory) {
    return window.i18n.translateCategory(categoryName);
  }
  return categoryName;
}

function loadTemplateCode(tabName, code) {
  const previewTable = document.getElementById("preview-table");
  if (previewTable) previewTable.remove();

  const fullCode = code.trim() + "\n";

  if (editor?.setValue) {
    editor.setValue(fullCode);

    setTimeout(() => {
      if (editor.refresh) editor.refresh();
    }, 1);
  }

  if (editor?.getWrapperElement) {
    const wrapper = editor.getWrapperElement();
    wrapper.style.display = "block";
    wrapper.style.visibility = "visible";
  }

  tabContents[tabName] = fullCode;

  setTimeout(() => {
    if (typeof runCode === "function") {
      runCode();
    }
    if (typeof resizeEditor === "function") {
      resizeEditor();
    }

    if (editor?.setCursor && editor?.focus) {
      editor.setCursor({ line: 0, ch: 0 });

      if (editor.scrollTo) {
        editor.scrollTo(0, 0);
      }

      if (editor.scrollIntoView) {
        editor.scrollIntoView({ line: 0, ch: 0 });
      }

      editor.focus();
    }
  }, 50);

  if (tabObjects[tabName]) {
    tabObjects[tabName].showPreview = false;
  }
}

function editTabName(event, tab) {
  try {
    event.stopPropagation();
    const currentName = tab.childNodes[0].nodeValue?.trim() || "";
    const input = document.createElement("input");

    input.value = currentName;
    Object.assign(input.style, {
      width: "80px",
      margin: "0",
      padding: "2px",
      border: "1px solid #ccc",
    });

    input.onblur = () => saveTabName(input, tab);
    input.onkeydown = (e) => {
      if (e.key === "Enter") {
        saveTabName(input, tab);
      }
    };

    const closeButton = tab.querySelector(".close-tab");
    tab.textContent = "";
    tab.appendChild(input);
    if (closeButton) tab.appendChild(closeButton);
    input.focus();
  } catch (error) {
    console.error("Error editing tab name:", error);
  }
}

function saveTabName(input, tab) {
  try {
    const newName = input.value.trim();
    const closeButton = tab.querySelector(".close-tab");
    tab.textContent = newName;
    if (closeButton) tab.appendChild(closeButton);
    tab.setAttribute("data-name", newName);
  } catch (error) {
    console.error("Error saving tab name:", error);
  }
}

document.addEventListener("languageChanged", (event) => {
  const templateCategoryHeaders = document.querySelectorAll(
    "[data-i18n-category]",
  );
  templateCategoryHeaders.forEach((header) => {
    const categoryName = header.getAttribute("data-i18n-category");
    if (categoryName && window.i18n) {
      header.textContent = window.i18n.translateCategory(categoryName);
    }
  });

  const loadButton = document.querySelector(
    '[data-i18n-key="load_custom_templates"]',
  );
  if (loadButton) {
    loadButton.textContent = getTranslation(
      "load_custom_templates",
      "Load Templates",
    );
  }

  const saveButton = document.querySelector(
    '[data-i18n-key="save_current_templates"]',
  );
  if (saveButton) {
    saveButton.textContent = getTranslation(
      "save_current_templates",
      "Save Templates",
    );
  }

  const organizerButton = document.querySelector(
    '[data-i18n-key="template_organizer"]',
  );
  if (organizerButton) {
    organizerButton.textContent = getTranslation(
      "template_organizer",
      "Template Organizer",
    );
  }

  const statusText = document.getElementById("template-load-status");
  if (statusText && customProjectTemplates) {
    statusText.textContent = getTranslation(
      "custom_templates_loaded",
      "Custom templates loaded",
    );
  }

  const noTemplatesMessage = document.querySelector(
    '.preview-table div[style*="text-align: center"]',
  );
  if (
    noTemplatesMessage &&
    !document.querySelector(".template-category-group")
  ) {
    noTemplatesMessage.textContent = getTranslation(
      "no_templates_available",
      "No templates available",
    );
  }
});

document.querySelector(".tabs")?.addEventListener("dblclick", (e) => {
  try {
    const tab = e.target;
    if (
      tab.classList.contains("tab") &&
      !tab.contains(document.querySelector("input"))
    ) {
      editTabName(e, tab);
    }
  } catch (error) {
    console.error("Error in tab double-click handler:", error);
  }
});

function saveCurrentTemplates() {
  try {
    const templatesToSave =
      window.customProjectTemplates ||
      customProjectTemplates ||
      window.projectTemplates ||
      projectTemplates;

    if (!templatesToSave) {
      throw new Error("No templates found to save");
    }

    let jsonContent = "const projectTemplates = {\n";

    jsonContent += "  categories: [\n";

    templatesToSave.categories.forEach((category, catIndex) => {
      jsonContent += "    {\n";
      jsonContent += `      name: '${category.name}',\n`;
      if (category.description) {
        jsonContent += `      description: '${category.description.replace(/'/g, "\\'")}',\n`;
      }
      jsonContent += "      templates: [\n";

      category.templates.forEach((template, tempIndex) => {
        jsonContent += "        {\n";

        if (template.imageData) {
          jsonContent += "          imageData: `" + template.imageData + "`,\n";
        } else if (template.image) {
          jsonContent += `          image: '${template.image}',\n`;
        }

        jsonContent += `          title: '${template.title.replace(/'/g, "\\'")}',\n`;

        const escapedCode = template.code
          .replace(/`/g, "\\`")
          .replace(/\$/g, "\\$");
        jsonContent += "          code: `" + escapedCode + "`\n";

        jsonContent += "        }";
        if (tempIndex < category.templates.length - 1) {
          jsonContent += ",";
        }
        jsonContent += "\n";
      });

      jsonContent += "      ]\n";
      jsonContent += "    }";
      if (catIndex < templatesToSave.categories.length - 1) {
        jsonContent += ",";
      }
      jsonContent += "\n";
    });

    jsonContent += "  ]\n";
    jsonContent += "};";

    const blob = new Blob([jsonContent], { type: "application/javascript" });

    const downloadLink = document.createElement("a");
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    downloadLink.download = `ProjectTemplates_${timestamp}.js`;
    downloadLink.href = URL.createObjectURL(blob);

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    URL.revokeObjectURL(downloadLink.href);

    const statusText = document.getElementById("template-load-status");
    if (statusText) {
      const templateCount = templatesToSave.categories
        ? templatesToSave.categories.reduce(
            (count, cat) => count + cat.templates.length,
            0,
          )
        : templatesToSave.length;

      statusText.textContent =
        getTranslation(
          "templates_saved_successfully",
          "Templates saved successfully!",
        ) + ` (${templateCount} templates)`;
      statusText.style.color = "var(--success-color, #28a745)";

      setTimeout(() => {
        if (customProjectTemplates) {
          statusText.textContent = getTranslation(
            "custom_templates_loaded",
            "Custom templates loaded",
          );
          statusText.style.color = "var(--success-color, #28a745)";
        } else {
          statusText.textContent = "";
        }
      }, 3000);
    }
  } catch (error) {
    console.error("Error saving templates:", error);

    const statusText = document.getElementById("template-load-status");
    if (statusText) {
      statusText.textContent =
        getTranslation("template_save_error", "Error saving templates: ") +
        error.message;
      statusText.style.color = "var(--error-color, #dc3545)";
    }
  }
}

function loadCode(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const activeTab = document.querySelector(".tab.active");
      const activeTabName = activeTab
        ? activeTab.getAttribute("data-tab")
        : null;

      if (activeTabName) {
        if (tabObjects[activeTabName]) {
          tabObjects[activeTabName].showPreview = false;
          tabObjects[activeTabName].formOpen = false;
        }

        loadTemplateCode(activeTabName, e.target.result);
      }
    };
    reader.readAsText(file);
  }
}

function createTemplateItem(template, tabName) {
  const item = document.createElement("div");
  item.className = "template-item";

  const img = document.createElement("img");

  if (template.imageData) {
    img.src = template.imageData;
    img.alt = template.title;
  } else if (template.image) {
    img.src = "./src/images/" + template.image;
    img.alt = template.title;

    img.onerror = function () {
      this.src = "./src/images/fallback.png";
      this.onerror = null;
    };
  } else {
    img.src = "./src/images/fallback.png";
    img.alt = template.title || "No image";
  }

  const title = document.createElement("div");
  title.className = "template-item-title";
  title.textContent = template.title;

  item.appendChild(img);
  item.appendChild(title);

  item.addEventListener("click", () => {
    if (typeof loadTemplateCode === "function") {
      loadTemplateCode(tabName, template.code);
    }
  });

  return item;
}

document.addEventListener("DOMContentLoaded", () => {
  monitorTemplatesLoading();
});

if (
  document.readyState === "interactive" ||
  document.readyState === "complete"
) {
  monitorTemplatesLoading();
}

window.notifyTemplatesLoaded = function () {
  if (templatesLoadedResolve) {
    templatesLoadedResolve(true);
  }
};
