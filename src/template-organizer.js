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
      this.addOrganizerButton();

      document.addEventListener("languageChanged", () => {
        this.updateTranslations();
      });
    }, 100);
  }

  addOrganizerButton() {}

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
              importedData = eval("(" + match[1] + ")");
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
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    handle.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);

    function dragStart(e) {
      if (e.target === handle || handle.contains(e.target)) {
          // Translate CSS transform origin to absolute position before dragging
        const transform = window.getComputedStyle(element).transform;
        if (transform && transform !== "none") {
          const rect = element.getBoundingClientRect();
          xOffset = rect.left + rect.width / 2 - window.innerWidth / 2;
          yOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
        }

        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        isDragging = true;
        handle.style.cursor = "grabbing";
      }
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();

        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        const rect = element.getBoundingClientRect();
        const minX = -window.innerWidth / 2 + rect.width / 2;
        const maxX = window.innerWidth / 2 - rect.width / 2;
        const minY = -window.innerHeight / 2 + rect.height / 2;
        const maxY = window.innerHeight / 2 - rect.height / 2;

        currentX = Math.max(minX, Math.min(currentX, maxX));
        currentY = Math.max(minY, Math.min(currentY, maxY));

        xOffset = currentX;
        yOffset = currentY;

        // Anwenden der Position
        element.style.transform = `translate(-50%, -50%) translate(${currentX}px, ${currentY}px)`;
      }
    }

    function dragEnd() {
      isDragging = false;
      handle.style.cursor = "move";
    }
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

    const style = document.createElement("style");
    style.id = "template-organizer-styles";
    style.textContent = `
        .template-organizer-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 550px;
            height: 90vh;
            max-height: 700px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            background: var(--bg-dark);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }

        .template-organizer-modal * {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        /* Ausnahmen: Eingabefelder und editierbare Elemente */
        .template-organizer-modal input,
        .template-organizer-modal textarea,
        .template-organizer-modal [contenteditable="true"] {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
        
        .template-organizer-modal .modal-window-content {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 0;
        }
        
        /* Info Bar */
        .organizer-info {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 20px;
            background: var(--info-bg, #e3f2fd);
            color: var(--info-color, #1976d2);
            font-size: 14px;
        }
        
        /* Content Area */
        .organizer-content {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: var(--bg-lighter);
        }
        
        /* Categories */
        .organizer-category {
            background: var(--bg-light);
            border: 1px solid var(--border-light);
            border-radius: 8px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        
        .category-header {
            display: flex;
            align-items: center;
            padding: 15px;
            background: var(--bg-medium);
            border-bottom: 1px solid var(--border-light);
            cursor: move;
        }
        
        .category-header .drag-handle {
            color: var(--text-light);
            margin-right: 10px;
            cursor: grab;
        }
        
        .category-header .drag-handle:active {
            cursor: grabbing;
        }
        
        .category-name {
            flex: 1;
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
            padding: 5px 10px;
            border-radius: 4px;
        }
        
        .category-actions {
            display: flex;
            gap: 5px;
        }
        
        /* Edit Modal - für Kategorie- und Template-Namen */
        .edit-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            
            /* Textauswahl deaktivieren */
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        .edit-modal * {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        /* Textauswahl nur in Inputs erlauben */
        .edit-modal input,
        .edit-modal textarea {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
        
        .edit-modal-content {
            background: var(--bg-light);
            border-radius: 8px;
            width: 90%;
            max-width: 400px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
            box-sizing: border-box;
        }
        
        /* Große Modal-Variante für Kategorie-Bearbeitung */
        .edit-modal-content.large-modal {
            max-width: 800px;
            max-height: 80vh;
        }
        
        .edit-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid var(--border-light);
        }
        
        .edit-modal-header h3 {
            margin: 0;
            color: var(--text-primary);
        }
        
        /* Edit Modal Body - Wichtige Änderung */
        .edit-modal-body {
            padding: 20px;
            overflow-y: auto;
            overflow-x: hidden;
            max-height: calc(90vh - 140px);
        }
        
        /* Große Modal-Variante - Body mit mehr Platz */
        .large-modal .edit-modal-body {
            flex: 1;
        }
        
        /* Alle Labels in Modals */
        .edit-modal-body label,
        .template-editor-body label {
            display: block;
            margin-bottom: 8px;
            color: var(--text-secondary);
            font-weight: 500;
            word-wrap: break-word; /* Lange Wörter umbrechen */
        }
        
        /* Input-Felder - Wichtige Änderungen */
        .name-input,
        .title-input,
        .image-input {
            width: 100%;
            max-width: 100%; /* Explizit setzen */
            padding: 10px;
            border: 1px solid var(--border-light);
            border-radius: 4px;
            background: var(--bg-lighter);
            color: var(--text-primary);
            font-size: 14px;
            box-sizing: border-box; /* Kritisch wichtig! */
            overflow: hidden; /* Kein Overflow bei langen Texten */
            text-overflow: ellipsis; /* ... bei zu langem Text */
        }
        
        .name-input:focus,
        .title-input:focus,
        .image-input:focus {
            outline: 2px solid var(--accent-color);
            outline-offset: -1px;
        }
        
        .edit-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 20px;
            border-top: 1px solid var(--border-light);
            flex-wrap: wrap; /* Buttons umbrechen wenn nötig */
        }
        
        /* Description Editor Modal */
        .description-editor-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            
            /* Textauswahl deaktivieren */
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        .description-editor-modal * {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        /* Textauswahl nur in Textareas erlauben */
        .description-editor-modal textarea {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
        
        .description-editor-content {
            background: var(--bg-light);
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
        }
        
        .description-editor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid var(--border-light);
        }
        
        .description-editor-header h3 {
            margin: 0;
            color: var(--text-primary);
        }
        
        .description-editor-body {
            padding: 20px;
        }
        
        .language-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 2px solid var(--border-light);
        }
        
        .lang-tab {
            padding: 10px 20px;
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            position: relative;
            transition: color 0.2s;
        }
        
        .lang-tab:hover {
            color: var(--text-primary);
        }
        
        .lang-tab.active {
            color: var(--accent-color);
        }
        
        .lang-tab.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--accent-color);
        }
        
        .description-tab-content label {
            display: block;
            margin-bottom: 8px;
            color: var(--text-secondary);
            font-weight: 500;
        }
        
        .description-editor-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 20px;
            border-top: 1px solid var(--border-light);
        }
        
        /* Templates Container */
        .template-container {
            padding: 15px;
            min-height: 80px;
            background: var(--bg-lighter);
        }
        
        .template-container:empty::before {
            content: attr(data-empty-text);
            display: block;
            text-align: center;
            color: var(--text-light);
            font-style: italic;
            padding: 20px;
        }
        
        /* Template Item */
        .organizer-template {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: var(--bg-light);
            border: 1px solid var(--border-light);
            border-radius: 6px;
            margin-bottom: 10px;
            cursor: move;
            transition: all 0.2s;
        }
        
        .organizer-template:hover {
            border-color: var(--accent-color);
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .organizer-template .drag-handle {
            color: var(--text-light);
            cursor: grab;
        }
        
        .template-thumbnail {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid var(--border-light);
        }
        
        .template-info {
            flex: 1;
        }
        
        .template-title {
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 5px;
            padding: 4px 8px;
            border-radius: 4px;
        }
        
        .template-image-name {
            font-size: 12px;
            color: var(--text-light);
        }
        
        .template-actions {
            display: flex;
            gap: 5px;
        }
        
        /* Icon Buttons */
        .icon-button {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: 1px solid transparent;
            border-radius: 4px;
            cursor: pointer;
            color: var(--text-secondary);
            transition: all 0.2s;
        }
        
        .icon-button:hover {
            background: var(--bg-lighter);
            border-color: var(--border-light);
            color: var(--text-primary);
        }
        
        .icon-button .material-icons {
            font-size: 18px;
        }
        
        /* Add Template Button */
        .add-template-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            width: 100%;
            padding: 10px;
            background: transparent;
            border: 2px dashed var(--border-light);
            border-radius: 6px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 10px;
        }
		
		.add-category-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 12px;
            background: transparent;
            border: 2px dashed var(--border-light);
            border-radius: 8px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 20px;
            font-size: 14px;
            font-weight: 500;
        }

        .add-category-btn:hover {
            border-color: var(--accent-color);
            color: var(--accent-color);
            background: var(--bg-lighter);
        }

        .add-category-btn .material-icons {
            font-size: 20px;
        }
        
        .add-template-btn:hover {
            border-color: var(--accent-color);
            color: var(--accent-color);
            background: var(--bg-lighter);
        }
        
        /* Actions Footer */
        .organizer-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 15px 20px;
            background: var(--bg-light);
            border-top: 1px solid var(--border-light);
        }
        
        /* Template Editor Modal */
        .template-editor-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            
            /* Textauswahl deaktivieren */
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        .template-editor-modal * {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        /* Textauswahl nur in Input und Textarea erlauben */
        .template-editor-modal input,
        .template-editor-modal textarea {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
        
        .template-editor-content {
            background: var(--bg-light);
            border-radius: 8px;
            width: 90%;
            max-width: 800px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
            box-sizing: border-box;
        }
        
        .template-editor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid var(--border-light);
        }
        
        .template-editor-header h3 {
            margin: 0;
            color: var(--text-primary);
        }
        
        /* Template Editor Body - Wichtige Änderung */
        .template-editor-body {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            overflow-x: hidden;
            max-height: calc(90vh - 140px);
        }
        
        .template-editor-body label {
            display: block;
            margin-bottom: 5px;
            color: var(--text-secondary);
            font-weight: 500;
        }
        
        .title-input {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--border-light);
            border-radius: 4px;
            background: var(--bg-lighter);
            color: var(--text-primary);
            font-size: 14px;
            margin-bottom: 20px;
        }
        
        /* Image Upload Container */
        .image-upload-container {
            margin-bottom: 20px;
        }
        
        .current-image-preview {
            margin-bottom: 10px;
        }
        
        /* Image Upload Buttons - NEUE STYLES für bessere Ausrichtung */
        .image-upload-buttons {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        
        /* Spezielle Styles für Image Buttons */
        .image-button {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 5px !important;
            padding: 8px 16px !important;
        }
        
        .image-button .material-icons {
            font-size: 18px !important;
            line-height: 1 !important;
            vertical-align: middle !important;
        }
        
        .image-button span:not(.material-icons) {
            line-height: 1 !important;
            vertical-align: middle !important;
        }
        
        /* Textarea - Wichtige Änderungen */
        .description-textarea,
        .code-textarea {
            width: 100%;
            max-width: 100%; /* Explizit setzen */
            padding: 10px;
            border: 1px solid var(--border-light);
            border-radius: 4px;
            background: var(--bg-lighter);
            color: var(--text-primary);
            font-family: inherit;
            font-size: 14px;
            resize: vertical;
            box-sizing: border-box; /* Kritisch wichtig! */
            overflow-y: auto; /* Nur vertikales Scrollen in der Textarea */
            overflow-x: hidden; /* Kein horizontales Scrollen */
            word-wrap: break-word; /* Lange Zeilen umbrechen */
        }
        
        /* Code Textarea spezifisch */
        .code-textarea {
            height: 300px;
            background: var(--bg-dark);
            font-family: 'Courier New', monospace;
            margin-bottom: 20px;
            white-space: pre-wrap; /* Code-Formatierung beibehalten aber umbrechen */
            word-break: break-all; /* Sehr lange Strings umbrechen */
        }
        
        /* Große Textarea für Kategorie-Beschreibung */
        .large-textarea {
            height: 300px;
        }
        
        .image-input {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--border-light);
            border-radius: 4px;
            background: var(--bg-lighter);
            color: var(--text-primary);
            font-size: 14px;
        }
        
        .template-editor-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 20px;
            border-top: 1px solid var(--border-light);
            flex-wrap: wrap; /* Buttons umbrechen wenn nötig */
        }
        
        .close-btn {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 5px;
        }
        
        .close-btn:hover {
            color: var(--text-primary);
        }
        
        .description-textarea {
            width: 100%;
            min-height: 100px;
            padding: 10px;
            border: 1px solid var(--border-light);
            border-radius: 4px;
            background: var(--bg-lighter);
            color: var(--text-primary);
            font-family: inherit;
            font-size: 14px;
            resize: vertical;
        }
        
        .description-textarea:focus {
            outline: 2px solid var(--accent-color);
            outline-offset: -1px;
        }
        
        /* Notification */
        .organizer-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color, #4CAF50);
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transform: translateX(400px);
            transition: transform 0.3s ease;
            z-index: 10002;
        }
        
        .organizer-notification.show {
            transform: translateX(0);
        }
        
        /* Sortable Ghost */
        .sortable-ghost {
            opacity: 0.4;
        }
        
        .sortable-drag {
            opacity: 0.9;
        }
        
        /* Dark Theme Support */
        .dark-theme .organizer-info {
            background: var(--info-bg-dark, #1e3a5f);
            color: var(--info-color-dark, #64b5f6);
        }
        
        /* Responsive - angepasst für kleinere Breite */
        @media (max-width: 600px) {
            .template-organizer-modal {
                width: 95%;
                height: 95vh;
            }
            
            .organizer-template {
                flex-wrap: wrap;
            }
            
            .template-thumbnail {
                width: 50px;
                height: 50px;
            }
            
            /* Große Modals auf kleinen Bildschirmen anpassen */
            .edit-modal-content.large-modal {
                max-width: 95%;
                max-height: 90vh;
            }
        }
    `;

    document.head.appendChild(style);
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
