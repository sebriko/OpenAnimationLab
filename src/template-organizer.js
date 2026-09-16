class TemplateOrganizer {
  constructor() {
    this.originalTemplates = null;
    this.workingTemplates = null;
    this.modalWindow = null;
    this.isDirty = false;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    setTimeout(() => {
      document.addEventListener("languageChanged", () => {
        this.updateTranslations();
      });
    }, 100);
  }

  openOrganizer() {
    this.loadTemplates();
    this.createModal();
    this.renderTemplates();
  }

  loadTemplates() {
    // Priority: 1. Organizer custom templates, 2. TabFunctions custom templates, 3. default templates
    let templatesToUse = null;

    if (
      window.customProjectTemplates &&
      (window.customProjectTemplates.categories ||
        Array.isArray(window.customProjectTemplates))
    ) {
      templatesToUse = window.customProjectTemplates;
    }
    else if (
      typeof customProjectTemplates !== "undefined" &&
      customProjectTemplates &&
      (customProjectTemplates.categories ||
        Array.isArray(customProjectTemplates))
    ) {
      templatesToUse = customProjectTemplates;
    }
    else if (window.projectTemplates) {
      templatesToUse = window.projectTemplates;
    }
    else if (typeof projectTemplates !== "undefined") {
      templatesToUse = projectTemplates;
    }

    if (!templatesToUse) {
      console.error("No templates found");
      const content = document.getElementById("template-organizer-content");
      if (content) {
        content.innerHTML =
          '<div style="text-align: center; padding: 50px; color: var(--text-light);">Keine Templates gefunden. Bitte stelle sicher, dass ProjectTemplates_de.js geladen wurde.</div>';
      }
      return;
    }

    this.originalTemplates = JSON.parse(JSON.stringify(templatesToUse));
    this.workingTemplates = JSON.parse(JSON.stringify(templatesToUse));
  }

  saveChanges() {
    if (!this.isDirty) {
      this.closeOrganizer();
      return;
    }

    if (
      typeof customProjectTemplates !== "undefined" &&
      customProjectTemplates &&
      (customProjectTemplates.categories ||
        Array.isArray(customProjectTemplates))
    ) {
      window.customProjectTemplates = JSON.parse(
        JSON.stringify(this.workingTemplates),
      );
      if (typeof window !== "undefined") {
        window.customProjectTemplates = JSON.parse(
          JSON.stringify(this.workingTemplates),
        );
      }
    } else {
      window.customProjectTemplates = JSON.parse(
        JSON.stringify(this.workingTemplates),
      );
    }

    if (typeof showPreviewTable === "function" && currentTabName) {
      const activeTab = document.querySelector(".tab.active");
      if (activeTab) {
        const tabName = activeTab.getAttribute("data-tab");
        if (tabObjects[tabName]?.showPreview) {
          showPreviewTable(tabName);
        }
      }
    }

    this.isDirty = false;
    this.closeOrganizer();

    this.showNotification(
      getTranslation("changes_saved", "Changes saved successfully!"),
    );
  }

  createModal() {
    if (this.modalWindow) {
      this.modalWindow.remove();
    }

    this.addStyles();

    const modal = document.createElement("div");
    modal.id = "template-organizer-modal";
    modal.className = "modal-window template-organizer-modal";

    modal.style.cssText = `
        position: fixed !important;
        top: -9999px !important;
        left: -9999px !important;
        visibility: hidden !important;
    `;

    modal.innerHTML = `
        <div class="modal-window-header" id="templateOrganizerHeader">
            <div class="modal-window-title">
                <span class="material-icons">folder_special</span>
                <span data-i18n="organize_templates">${getTranslation("organize_templates", "Template Organizer")}</span>
            </div>
            <button class="modal-window-close" onclick="templateOrganizer.closeOrganizer()">
                <span class="material-icons">close</span>
            </button>
        </div>
        <div class="modal-window-content">
            <div class="organizer-info">
                <span class="material-icons">info</span>
                <span data-i18n="organizer_info">${getTranslation("organizer_info", "Drag and drop templates and categories to reorganize them")}</span>
            </div>
            
            <div id="template-organizer-content" class="organizer-content">
            </div>
            
            <div class="organizer-actions">
                <button class="form-button secondary" onclick="templateOrganizer.closeOrganizer()">
                    <span data-i18n="cancel">${getTranslation("cancel", "Cancel")}</span>
                </button>
                <button class="form-button primary" onclick="templateOrganizer.saveChanges()">
                    <span data-i18n="save_changes">${getTranslation("save_changes", "Save Changes")}</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    this.modalWindow = modal;

    requestAnimationFrame(() => {
      modal.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            visibility: visible !important;
        `;

      requestAnimationFrame(() => {
        this.makeDraggable(
          modal,
          modal.querySelector("#templateOrganizerHeader"),
        );
      });
    });
  }

  renderTemplates() {
    const content = document.getElementById("template-organizer-content");
    if (!content) return;

    content.innerHTML = "";

    if (!this.workingTemplates) {
      content.innerHTML =
        '<div style="text-align: center; padding: 50px; color: var(--text-light);">Keine Templates verfügbar.</div>';
      return;
    }

    if (
      this.workingTemplates.categories &&
      Array.isArray(this.workingTemplates.categories)
    ) {
      this.workingTemplates.categories.forEach((category, index) => {
        const categoryElement = this.createCategoryElement(category, index);
        content.appendChild(categoryElement);
      });

      const addCategoryBtn = document.createElement("button");
      addCategoryBtn.className = "add-category-btn";
      addCategoryBtn.innerHTML = `
            <span class="material-icons">create_new_folder</span>
            <span data-i18n="add_category">${getTranslation("add_category", "Add Category")}</span>
        `;
      addCategoryBtn.onclick = () => this.addCategory();
      content.appendChild(addCategoryBtn);
    } else if (Array.isArray(this.workingTemplates)) {
      // Flat array structure: convert to hierarchical categories before rendering
      this.convertToHierarchical();
      this.renderTemplates();
      return;
    } else {
      content.innerHTML =
        '<div style="text-align: center; padding: 50px; color: var(--text-light);">Unbekanntes Template-Format.</div>';
      return;
    }

    this.initializeSortable();
  }

  convertToHierarchical() {
    if (!Array.isArray(this.workingTemplates)) return;

    const categories = {};

    this.workingTemplates.forEach((template) => {
      const categoryName = template.category || "Uncategorized";
      if (!categories[categoryName]) {
        categories[categoryName] = {
          name: categoryName,
          description: "",
          templates: [],
        };
      }
      categories[categoryName].templates.push(template);
    });

    this.workingTemplates = {
      categories: Object.values(categories),
    };
  }

  createCategoryElement(category, index) {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "organizer-category";
    categoryDiv.dataset.categoryIndex = index;

    const header = document.createElement("div");
    header.className = "category-header";

    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle material-icons";
    dragHandle.textContent = "drag_indicator";

    const nameSpan = document.createElement("span");
    nameSpan.className = "category-name";
    nameSpan.textContent = this.getCategoryDisplayName(category.name);
    nameSpan.dataset.originalName = category.name;

    const actions = document.createElement("div");
    actions.className = "category-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "icon-button";
    editBtn.innerHTML = '<span class="material-icons">edit</span>';
    editBtn.title = getTranslation("edit_category", "Edit Category");
    editBtn.onclick = (e) => {
      e.stopPropagation();
      this.editCategory(index);
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "icon-button";
    deleteBtn.innerHTML = '<span class="material-icons">delete</span>';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      this.deleteCategory(index);
    };

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    header.appendChild(dragHandle);
    header.appendChild(nameSpan);
    header.appendChild(actions);

    const templateContainer = document.createElement("div");
    templateContainer.className = "template-container sortable-templates";
    templateContainer.dataset.categoryIndex = index;

    category.templates.forEach((template, templateIndex) => {
      const templateElement = this.createTemplateElement(
        template,
        index,
        templateIndex,
      );
      templateContainer.appendChild(templateElement);
    });

    const addTemplateBtn = document.createElement("button");
    addTemplateBtn.className = "add-template-btn";
    addTemplateBtn.innerHTML = `
        <span class="material-icons">add</span>
        <span data-i18n="add_template">${getTranslation("add_template", "Add Template")}</span>
    `;
    addTemplateBtn.onclick = () => this.addTemplate(index);

    categoryDiv.appendChild(header);
    categoryDiv.appendChild(templateContainer);
    categoryDiv.appendChild(addTemplateBtn);

    return categoryDiv;
  }

  createTemplateElement(template, categoryIndex, templateIndex) {
    const templateDiv = document.createElement("div");
    templateDiv.className = "organizer-template";
    templateDiv.dataset.categoryIndex = categoryIndex;
    templateDiv.dataset.templateIndex = templateIndex;

    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle material-icons";
    dragHandle.textContent = "drag_indicator";

    const thumbnail = document.createElement("img");
    thumbnail.className = "template-thumbnail";

    if (template.imageData) {
      thumbnail.src = template.imageData;
      thumbnail.alt = this.getTemplateTitle(template);
    } else if (template.image) {
      thumbnail.src = "./src/images/" + template.image;
      thumbnail.alt = this.getTemplateTitle(template);

      thumbnail.onerror = function () {
        this.onerror = null;
        this.src = "./src/images/fallback.png";
      };
    } else {
      thumbnail.src = "./src/images/fallback.png";
      thumbnail.alt = this.getTemplateTitle(template);
    }

    const info = document.createElement("div");
    info.className = "template-info";

    const title = document.createElement("div");
    title.className = "template-title";
    title.textContent = this.getTemplateTitle(template);

    const imageName = document.createElement("div");
    imageName.className = "template-image-name";
    // Show embedded size in KB when image is stored as data URI
    if (template.imageData) {
      const sizeKB = Math.round(template.imageData.length / 1024);
      imageName.textContent = `${sizeKB} KB (embedded)`;
    } else {
      imageName.textContent = template.image || "No image";
    }

    info.appendChild(title);
    info.appendChild(imageName);

    const actions = document.createElement("div");
    actions.className = "template-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "icon-button";
    editBtn.innerHTML = '<span class="material-icons">edit</span>';
    editBtn.onclick = (e) => {
      e.stopPropagation();
      this.editTemplate(categoryIndex, templateIndex);
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "icon-button";
    deleteBtn.innerHTML = '<span class="material-icons">delete</span>';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      this.deleteTemplate(categoryIndex, templateIndex);
    };

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    templateDiv.appendChild(dragHandle);
    templateDiv.appendChild(thumbnail);
    templateDiv.appendChild(info);
    templateDiv.appendChild(actions);

    return templateDiv;
  }

  getCategoryDisplayName(name) {
    return getCategoryTranslation(name);
  }

  getTemplateTitle(template) {
    return template.title || "Untitled";
  }

  editCategory(categoryIndex) {
    const category = this.workingTemplates.categories[categoryIndex];
    if (!category) return;

    const modal = document.createElement("div");
    modal.className = "edit-modal";

    modal.innerHTML = `
        <div class="edit-modal-content large-modal">
            <div class="edit-modal-header">
                <h3>${getTranslation("edit_category", "Edit Category")}</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <span class="material-icons">close</span>
                </button>
            </div>
            <div class="edit-modal-body">
                <label>${getTranslation("category_name", "Category Name")}:</label>
                <input type="text" class="name-input" id="category-name-input" value="${category.name}">
                
                <label style="margin-top: 20px;">${getTranslation("description", "Description")}:</label>
                <textarea class="description-textarea large-textarea" id="category-description-input" rows="12">${category.description || ""}</textarea>
            </div>
            <div class="edit-modal-footer">
                <button class="form-button secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                    ${getTranslation("cancel", "Cancel")}
                </button>
                <button class="form-button primary" onclick="templateOrganizer.saveCategoryEdit(${categoryIndex})">
                    ${getTranslation("save", "Save")}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
      document.getElementById("category-name-input").focus();
    }, 100);
  }

  saveCategoryEdit(categoryIndex) {
    const nameInput = document.getElementById("category-name-input");
    const descriptionInput = document.getElementById(
      "category-description-input",
    );

    if (nameInput && descriptionInput) {
      const newName = nameInput.value.trim();
      const newDescription = descriptionInput.value.trim();

      if (newName) {
        this.workingTemplates.categories[categoryIndex].name = newName;

        if (newDescription) {
          this.workingTemplates.categories[categoryIndex].description =
            newDescription;
        } else {
          delete this.workingTemplates.categories[categoryIndex].description;
        }

        this.isDirty = true;
        nameInput.closest(".edit-modal").remove();
        this.renderTemplates();
      }
    }
  }

  saveCategoryDescription(categoryIndex) {
    const description = document
      .getElementById("description-input")
      .value.trim();

    if (description) {
      this.workingTemplates.categories[categoryIndex].description = description;
    } else {
      delete this.workingTemplates.categories[categoryIndex].description;
    }

    this.isDirty = true;
    document.querySelector(".description-editor-modal").remove();
  }

  addCategory() {
    const newCategory = {
      name: getTranslation("new_category", "New Category"),
      description: "",
      templates: [],
    };

    this.workingTemplates.categories.push(newCategory);
    this.isDirty = true;
    this.renderTemplates();
  }

  editTemplate(categoryIndex, templateIndex) {
    const template =
      this.workingTemplates.categories[categoryIndex].templates[templateIndex];
    if (!template) return;

    const modal = document.createElement("div");
    modal.className = "template-editor-modal";
    modal.innerHTML = `
        <div class="template-editor-content">
            <div class="template-editor-header">
                <h3>${getTranslation("edit_template", "Edit Template")}</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <span class="material-icons">close</span>
                </button>
            </div>
            <div class="template-editor-body">
                <label>${getTranslation("template_title", "Template Title")}:</label>
                <input type="text" class="title-input" value="${template.title || ""}" id="template-title-input">
                
                <label>${getTranslation("template_code", "Template Code")}:</label>
                <textarea class="code-textarea" id="template-code-editor">${template.code}</textarea>
                
                <label>${getTranslation("template_image", "Template Image")}:</label>
                <div class="image-upload-container">
                    <div class="current-image-preview" id="current-image-preview">
                        ${
                          template.imageData
                            ? `<img src="${template.imageData}" alt="Current image" style="max-width: 200px; max-height: 150px; border: 1px solid var(--border-light); border-radius: 4px;">`
                            : template.image
                              ? `<img src="./src/images/${template.image}" alt="Current image" style="max-width: 200px; max-height: 150px; border: 1px solid var(--border-light); border-radius: 4px;" onerror="this.src='./src/images/fallback.png'">`
                              : '<div style="padding: 20px; border: 2px dashed var(--border-light); border-radius: 4px; text-align: center; color: var(--text-light);">No image selected</div>'
                        }
                    </div>
                    <input type="file" accept="image/*" id="template-image-input" style="display: none;">
                    <div class="image-upload-buttons">
                        <button type="button" class="form-button secondary image-button" onclick="document.getElementById('template-image-input').click()">
                            <span class="material-icons">upload</span>
                            <span>${getTranslation("select_image", "Select Image")}</span>
                        </button>
                        <button type="button" class="form-button secondary image-button" onclick="templateOrganizer.removeTemplateImage(${categoryIndex}, ${templateIndex})" id="remove-image-btn" ${!template.imageData && !template.image ? 'style="display: none;"' : ""}>
                            <span class="material-icons">delete</span>
                            <span>${getTranslation("remove_image", "Remove Image")}</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="template-editor-footer">
                <button class="form-button secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                    ${getTranslation("cancel", "Cancel")}
                </button>
                <button class="form-button primary" onclick="templateOrganizer.saveTemplateEdit(${categoryIndex}, ${templateIndex})">
                    ${getTranslation("save", "Save")}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const fileInput = modal.querySelector("#template-image-input");
    fileInput.addEventListener("change", (e) => {
      this.handleImageUpload(e, categoryIndex, templateIndex);
    });
  }

  handleImageUpload(event, categoryIndex, templateIndex) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(
        getTranslation(
          "file_too_large",
          "File size too large. Please select an image smaller than 5MB.",
        ),
      );
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(
        getTranslation("select_image_file", "Please select an image file."),
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;

      const preview = document.getElementById("current-image-preview");
      if (preview) {
        preview.innerHTML = `<img src="${imageData}" alt="New image" style="max-width: 200px; max-height: 150px; border: 1px solid var(--border-light); border-radius: 4px;">`;
      }

      const removeBtn = document.getElementById("remove-image-btn");
      if (removeBtn) {
        removeBtn.style.display = "inline-flex";
      }

      this.workingTemplates.categories[categoryIndex].templates[
        templateIndex
      ].tempImageData = imageData;
    };

    reader.readAsDataURL(file);
  }

  removeTemplateImage(categoryIndex, templateIndex) {
    const template =
      this.workingTemplates.categories[categoryIndex].templates[templateIndex];

    delete template.imageData;
    delete template.image;
    delete template.tempImageData;

    const preview = document.getElementById("current-image-preview");
    if (preview) {
      preview.innerHTML =
        '<div style="padding: 20px; border: 2px dashed var(--border-light); border-radius: 4px; text-align: center; color: var(--text-light);">No image selected</div>';
    }

    const removeBtn = document.getElementById("remove-image-btn");
    if (removeBtn) {
      removeBtn.style.display = "none";
    }

    const fileInput = document.getElementById("template-image-input");
    if (fileInput) {
      fileInput.value = "";
    }
  }

  saveTemplateEdit(categoryIndex, templateIndex) {
    const titleInput = document.getElementById("template-title-input");
    const codeTextarea = document.getElementById("template-code-editor");

    if (titleInput && codeTextarea) {
      const template =
        this.workingTemplates.categories[categoryIndex].templates[
          templateIndex
        ];
      template.title = titleInput.value.trim();
      template.code = codeTextarea.value;

      if (template.tempImageData) {
        template.imageData = template.tempImageData;
        delete template.tempImageData;
        delete template.image;
      }

      this.isDirty = true;
      codeTextarea.closest(".template-editor-modal").remove();
      this.renderTemplates();
    }
  }

  addTemplate(categoryIndex) {
    const newTemplate = {
      title: getTranslation("new_template", "New Template"),
      code: "// New template code\nlet board = new Board(1280, 720);",
    };

    this.workingTemplates.categories[categoryIndex].templates.push(newTemplate);
    this.isDirty = true;
    this.renderTemplates();
  }

  deleteCategory(index) {
    if (
      confirm(
        getTranslation(
          "confirm_delete_category",
          "Are you sure you want to delete this category and all its templates?",
        ),
      )
    ) {
      this.workingTemplates.categories.splice(index, 1);
      this.isDirty = true;
      this.renderTemplates();
    }
  }

  deleteTemplate(categoryIndex, templateIndex) {
    if (
      confirm(
        getTranslation(
          "confirm_delete_template",
          "Are you sure you want to delete this template?",
        ),
      )
    ) {
      this.workingTemplates.categories[categoryIndex].templates.splice(
        templateIndex,
        1,
      );
      this.isDirty = true;
      this.renderTemplates();
    }
  }

  initializeSortable() {
    const categoriesContainer = document.getElementById(
      "template-organizer-content",
    );
    if (categoriesContainer && typeof Sortable !== "undefined") {
      Sortable.create(categoriesContainer, {
        handle: ".category-header",
        filter: ".icon-button",
        preventOnFilter: false,
        animation: 150,
        onEnd: (evt) => {
          this.reorderCategories(evt.oldIndex, evt.newIndex);
        },
      });
    }

    document.querySelectorAll(".sortable-templates").forEach((container) => {
      if (typeof Sortable !== "undefined") {
        Sortable.create(container, {
          group: "templates",
          handle: ".organizer-template",
          filter: ".icon-button",
          preventOnFilter: false,
          animation: 150,
          onEnd: (evt) => {
            const fromCategory = parseInt(evt.from.dataset.categoryIndex);
            const toCategory = parseInt(evt.to.dataset.categoryIndex);
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;

            this.moveTemplate(fromCategory, oldIndex, toCategory, newIndex);
          },
        });
      }
    });
  }

  reorderCategories(oldIndex, newIndex) {
    if (oldIndex === newIndex) return;

    const [removed] = this.workingTemplates.categories.splice(oldIndex, 1);
    this.workingTemplates.categories.splice(newIndex, 0, removed);

    this.isDirty = true;
    this.renderTemplates();
  }

  moveTemplate(fromCategory, fromIndex, toCategory, toIndex) {
    const template =
      this.workingTemplates.categories[fromCategory].templates[fromIndex];

    this.workingTemplates.categories[fromCategory].templates.splice(
      fromIndex,
      1,
    );

    this.workingTemplates.categories[toCategory].templates.splice(
      toIndex,
      0,
      template,
    );

    this.isDirty = true;
  }

  exportTemplates() {
    const dataStr = `const projectTemplates = ${JSON.stringify(this.workingTemplates, null, 2)};`;
    const blob = new Blob([dataStr], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ProjectTemplates_de.js";
    a.click();

    URL.revokeObjectURL(url);
  }

  importTemplates() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".js,.json";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let importedData;

          try {
            importedData = JSON.parse(e.target.result);
          } catch {
            // JSON parsing failed — try extracting as a JS variable assignment
            const match = e.target.result.match(
              /projectTemplates\s*=\s*(\{[\s\S]*?\});/,
            );
            if (match && match[1]) {
              try {
                importedData = JSON.parse(match[1]);
              } catch (jsonErr) {
                // Fallback for JS object literal format (unquoted keys, trailing commas)
                importedData = (new Function("return (" + match[1] + ")"))();
              }
            } else {
              throw new Error("Invalid file format");
            }
          }

          if (
            importedData &&
            (importedData.categories || Array.isArray(importedData))
          ) {
            this.workingTemplates = importedData;

            if (Array.isArray(this.workingTemplates)) {
              this.convertToHierarchical();
            }

            this.isDirty = true;
            this.renderTemplates();
          } else {
            throw new Error("Invalid template structure");
          }
        } catch (error) {
          alert(
            getTranslation("import_error", "Error importing templates: ") +
              error.message,
          );
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  closeOrganizer() {
    if (this.isDirty) {
      if (
        !confirm(
          getTranslation(
            "unsaved_changes",
            "You have unsaved changes. Are you sure you want to close?",
          ),
        )
      ) {
        return;
      }
    }

    if (this.modalWindow) {
      this.modalWindow.remove();
      this.modalWindow = null;
    }
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "organizer-notification";
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  makeDraggable(element, handle) {
    window.makeDraggable(element, handle, { mode: "transform" });
  }

  updateTranslations() {
    if (!this.modalWindow) return;

    this.modalWindow.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      element.textContent = getTranslation(key, element.textContent);
    });

    this.modalWindow.querySelectorAll(".category-name").forEach((element) => {
      const originalName = element.dataset.originalName;
      if (originalName) {
        element.textContent = this.getCategoryDisplayName(originalName);
      }
    });
  }

  addStyles() {
    if (document.getElementById("template-organizer-styles")) return;
    const link = document.createElement("link");
    link.id = "template-organizer-styles";
    link.rel = "stylesheet";
    link.href = "src/template-organizer.css";
    document.head.appendChild(link);
  }
}

// Globale Instanz erstellen
window.templateOrganizer = new TemplateOrganizer();

// Sortable.js dynamisch laden falls nicht vorhanden
if (typeof Sortable === "undefined") {
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js";
  script.onload = () => {};
  document.head.appendChild(script);
}

if (window.i18n && window.i18n.translations) {
  Object.assign(window.i18n.translations, {
    organize_templates: {
      en: "Organize Templates",
      de: "Vorlagen organisieren",
    },
    add_category: {
      en: "Add Category",
      de: "Kategorie hinzufügen",
    },
    export_templates: {
      en: "Export",
      de: "Exportieren",
    },
    import_templates: {
      en: "Import",
      de: "Importieren",
    },
    organizer_info: {
      en: "Drag and drop templates and categories to reorganize them",
      de: "Ziehen Sie Vorlagen und Kategorien per Drag & Drop, um sie neu zu organisieren",
    },
    save_changes: {
      en: "Apply Changes",
      de: "Änderungen übernehmen",
    },
    new_category: {
      en: "New Category",
      de: "Neue Kategorie",
    },
    add_template: {
      en: "Add Template",
      de: "Vorlage hinzufügen",
    },
    new_template: {
      en: "New Template",
      de: "Neue Vorlage",
    },
    edit_template: {
      en: "Edit Template",
      de: "Vorlage bearbeiten",
    },
    template_code: {
      en: "Template Code",
      de: "Vorlagen-Code",
    },
    template_title: {
      en: "Template Title",
      de: "Vorlagentitel",
    },
    template_image: {
      en: "Template Image",
      de: "Vorlagenbild",
    },
    select_image: {
      en: "Select Image",
      de: "Bild auswählen",
    },
    remove_image: {
      en: "Remove Image",
      de: "Bild entfernen",
    },
    file_too_large: {
      en: "File size too large. Please select an image smaller than 5MB.",
      de: "Datei zu groß. Bitte wählen Sie ein Bild kleiner als 5MB.",
    },
    select_image_file: {
      en: "Please select an image file.",
      de: "Bitte wählen Sie eine Bilddatei aus.",
    },
    image_filename: {
      en: "Image Filename",
      de: "Bilddateiname",
    },
    confirm_delete_category: {
      en: "Are you sure you want to delete this category and all its templates?",
      de: "Möchten Sie diese Kategorie und alle ihre Vorlagen wirklich löschen?",
    },
    confirm_delete_template: {
      en: "Are you sure you want to delete this template?",
      de: "Möchten Sie diese Vorlage wirklich löschen?",
    },
    import_error: {
      en: "Error importing templates: ",
      de: "Fehler beim Importieren der Vorlagen: ",
    },
    changes_saved: {
      en: "Changes saved successfully!",
      de: "Änderungen erfolgreich gespeichert!",
    },
    unsaved_changes: {
      en: "You have unsaved changes. Are you sure you want to close?",
      de: "Sie haben ungespeicherte Änderungen. Möchten Sie wirklich schließen?",
    },
    description: {
      en: "Description",
      de: "Beschreibung",
    },
    category_description_placeholder: {
      en: "Enter category description...",
      de: "Kategoriebeschreibung eingeben...",
    },
    edit_description: {
      en: "Edit Description",
      de: "Beschreibung bearbeiten",
    },
    edit_category: {
      en: "Edit Category",
      de: "Kategorie bearbeiten",
    },
    category_name: {
      en: "Category Name",
      de: "Kategoriename",
    },
    no_description: {
      en: "No description",
      de: "Keine Beschreibung",
    },
    edit_category_description: {
      en: "Edit Category Description",
      de: "Kategoriebeschreibung bearbeiten",
    },
    description_english: {
      en: "Description (English)",
      de: "Beschreibung (Englisch)",
    },
    description_german: {
      en: "Description (German)",
      de: "Beschreibung (Deutsch)",
    },
    description_info: {
      en: "Descriptions can be provided in multiple languages",
      de: "Beschreibungen können in mehreren Sprachen bereitgestellt werden",
    },
  });
}
