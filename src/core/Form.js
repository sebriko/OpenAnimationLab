// ===== UTILITY FUNCTIONS =====

let svgoOptimize;

async function loadSVGO() {
  if (!svgoOptimize) {
    try {
      const svgo =
        await import("https://cdn.jsdelivr.net/npm/svgo@3.0.2/dist/svgo.browser.js");
      svgoOptimize = svgo.optimize;
    } catch (error) {
      console.warn("Failed to load SVGO:", error);
      svgoOptimize = false;
    }
  }
  return svgoOptimize;
}

const svgoConfig = {
  plugins: [
    "preset-default",
    { name: "removeViewBox", active: false },
    { name: "removeDimensions", active: true },
    { name: "removeXMLNS", active: false },
    { name: "sortAttrs", active: true },
    { name: "removeComments", active: true },
    { name: "removeMetadata", active: true },
    { name: "removeTitle", active: true },
    { name: "removeDesc", active: true },
    { name: "removeUselessDefs", active: true },
    { name: "removeEditorsNSData", active: true },
    { name: "removeEmptyAttrs", active: true },
    { name: "removeHiddenElems", active: true },
    { name: "removeEmptyText", active: true },
    { name: "removeEmptyContainers", active: true },
    { name: "removeUnusedNS", active: true },
    { name: "cleanupIds", active: true },
    { name: "minifyStyles", active: true },
    { name: "convertStyleToAttrs", active: true },
    { name: "convertColors", active: true },
    { name: "convertPathData", active: true },
    { name: "convertTransform", active: true },
    { name: "removeUnknownsAndDefaults", active: true },
    { name: "removeNonInheritableGroupAttrs", active: true },
    { name: "removeUselessStrokeAndFill", active: true },
    { name: "removeUnusedNS", active: true },
    {
      name: "cleanupNumericValues",
      active: true,
      params: { floatPrecision: 2 },
    },
    { name: "moveElemsAttrsToGroup", active: true },
    { name: "moveGroupAttrsToElems", active: true },
    { name: "collapseGroups", active: true },
    { name: "mergePaths", active: true },
  ],
};

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function optimizeSVG(svgContent) {
  try {
    const svgoFunction = await loadSVGO();
    if (svgoFunction) {
      const result = svgoFunction(svgContent, svgoConfig);
      return result.data;
    } else {
      console.warn("SVGO not available, returning original SVG");
      return svgContent;
    }
  } catch (error) {
    console.warn("SVG optimization failed:", error);
    return svgContent;
  }
}

function fileToBase64(file, includeDataUrl = false) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (includeDataUrl) {
        resolve(reader.result);
      } else {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function addDataUrlPrefix(base64String, mimeType = "model/gltf-binary") {
  if (base64String.startsWith("data:")) {
    return base64String;
  }
  return `data:${mimeType};base64,${base64String}`;
}

function isImageFile(file) {
  const imageTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
  ];
  return (
    imageTypes.includes(file.type) ||
    file.name.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp)$/)
  );
}

function getTranslation(key, lang = null) {
  if (window.i18n) {
    if (lang) {
      const translations = window.i18n.translations[lang];
      return translations && translations[key] ? translations[key] : key;
    }
    return window.i18n.translate(key, key);
  }
  return key;
}

function translateSerializationInfo(infoObject) {
  if (!infoObject || !window.i18n) return infoObject;

  if (typeof infoObject === "object" && !Array.isArray(infoObject)) {
    const currentLanguage = window.i18n.currentLanguage || "en";
    return infoObject[currentLanguage] || infoObject.en || infoObject;
  }

  if (typeof infoObject === "string") {
    return window.i18n.translate(infoObject, infoObject);
  }

  return infoObject;
}

function getLocalizedName(nameObject) {
  if (!nameObject) return "";

  if (
    typeof nameObject === "object" &&
    !Array.isArray(nameObject) &&
    window.i18n
  ) {
    const currentLanguage = window.i18n.currentLanguage || "en";
    return nameObject[currentLanguage] || nameObject.en || nameObject;
  }

  if (typeof nameObject === "string") {
    return nameObject;
  }

  return nameObject;
}

function getLocalizedExample(exampleObject) {
  if (!exampleObject) return "";

  if (
    typeof exampleObject === "object" &&
    !Array.isArray(exampleObject) &&
    window.i18n
  ) {
    const currentLanguage = window.i18n.currentLanguage || "en";
    return exampleObject[currentLanguage] || exampleObject.en || exampleObject;
  }

  if (typeof exampleObject === "string") {
    return exampleObject;
  }

  return exampleObject;
}

function isJavaScriptExpression(value) {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();

  if (
    trimmed === "true" ||
    trimmed === "false" ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return false;
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return false;
  }

  if (/^0x[0-9A-Fa-f]+$/i.test(trimmed)) {
    return false;
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith("`") && trimmed.endsWith("`"))
  ) {
    return false;
  }

  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    return false;
  }

  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmed)) {
    return true;
  }

  if (
    /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*|\[[^\]]+\])+$/.test(
      trimmed,
    )
  ) {
    return true;
  }

  if (/\(.*\)/.test(trimmed)) {
    return true;
  }

  if (/[+\-*/%]/.test(trimmed)) {
    return true;
  }

  if (/[&|!]/.test(trimmed)) {
    return true;
  }

  if (/[<>=]/.test(trimmed)) {
    return true;
  }

  if (/\?.*:/.test(trimmed)) {
    return true;
  }

  if (/^new\s+/.test(trimmed)) {
    return true;
  }

  return false;
}

function isVariableName(value) {
  if (typeof value !== "string") return false;
  return (
    /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value) &&
    !["true", "false", "null", "undefined"].includes(value)
  );
}

function inferDataTypeFromName(paramName) {
  if (paramName.includes("points") || paramName.includes("vertices")) {
    return "matrix";
  }

  if (
    paramName === "values" ||
    paramName.includes("values") ||
    paramName.includes("options")
  ) {
    return "array";
  }

  if (paramName === "svgString" || paramName.includes("svg")) {
    return "svg";
  }

  if (paramName === "x3dString" || paramName.includes("x3d")) {
    return "x3d";
  }

  if (paramName === "glbContent" || paramName.includes("glbContent")) {
    return "glb";
  }

  if (
    paramName === "pngContent" ||
    paramName.includes("pngContent") ||
    paramName === "imageContent" ||
    paramName.includes("imageContent") ||
    (paramName.includes("image") && paramName.includes("Content"))
  ) {
    return "png";
  }

  if (paramName.includes("color") || paramName.includes("Color")) {
    return "color";
  }

  if (
    paramName.includes("x") ||
    paramName.includes("y") ||
    paramName.includes("rotation") ||
    paramName.includes("base") ||
    paramName.includes("height") ||
    paramName.includes("width") ||
    paramName.includes("radius") ||
    paramName.includes("fontSize") ||
    paramName.includes("size") ||
    paramName.includes("thickness") ||
    paramName.includes("scale")
  ) {
    return "number";
  }

  if (
    paramName.includes("text") ||
    paramName.includes("font") ||
    paramName.includes("name") ||
    paramName.includes("url")
  ) {
    return "string";
  }

  return "string";
}

function formatLabel(key) {
  return key;
}

function tryParseSpecialValue(value) {
  if (!value || typeof value !== "string") return value;

  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (/^0x[0-9A-Fa-f]+$/i.test(trimmed)) return trimmed;

  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      console.warn("JSON-Parse-Fehler:", e);
      return value;
    }
  }

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;

  if (!isNaN(trimmed) && !isNaN(parseFloat(trimmed)) && !/^0x/i.test(trimmed)) {
    return parseFloat(trimmed);
  }

  return value;
}

function parseConstructorArgs(argsString) {
  if (!argsString.trim()) return [];

  const result = [];
  let current = "";
  let inString = false;
  let stringChar = "";
  let inObject = 0;
  let inArray = 0;
  let inTemplate = false;

  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];

    if (char === "`") {
      inTemplate = !inTemplate;
      current += char;
      continue;
    }

    if (
      !inTemplate &&
      (char === '"' || char === "'") &&
      (i === 0 || argsString[i - 1] !== "\\")
    ) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      current += char;
      continue;
    }

    if (!inString && !inTemplate) {
      if (char === "{") inObject++;
      if (char === "}") inObject--;
      if (char === "[") inArray++;
      if (char === "]") inArray--;
    }

    if (
      char === "," &&
      !inString &&
      !inTemplate &&
      inObject === 0 &&
      inArray === 0
    ) {
      const trimmed = current.trim();
      result.push({
        value: evaluateArgValue(trimmed),
        raw: trimmed,
        isExpression: isJavaScriptExpression(trimmed),
      });
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    const trimmed = current.trim();
    result.push({
      value: evaluateArgValue(trimmed),
      raw: trimmed,
      isExpression: isJavaScriptExpression(trimmed),
    });
  }

  return result;
}

function evaluateArgValue(value) {
  if (isJavaScriptExpression(value)) {
    return value;
  }

  if (value === "null") return null;
  if (value === "undefined") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;

  if (/^-?\d+(\.\d+)?$/.test(value)) return parseFloat(value);

  if (/^0x[0-9A-Fa-f]+$/i.test(value)) return value;

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.substring(1, value.length - 1);
  }

  if (value.startsWith("`") && value.endsWith("`")) {
    return value.substring(1, value.length - 1);
  }

  if (
    (value.startsWith("[") && value.endsWith("]")) ||
    (value.startsWith("{") && value.endsWith("}"))
  ) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  return value;
}

function processConstructorArgs(
  className,
  constructorArgs,
  serializationMap,
  variableName,
) {
  const args = parseConstructorArgs(constructorArgs);
  const resultJson = { constructor: {} };
  const constructorParams = Object.keys(serializationMap.constructor);

  constructorParams.forEach((paramKey, index) => {
    let paramName, paramInfo;

    if (typeof serializationMap.constructor[paramKey] === "object") {
      paramName = getLocalizedName(serializationMap.constructor[paramKey].name);
      paramInfo = serializationMap.constructor[paramKey].info;
    } else {
      paramName = serializationMap.constructor[paramKey];
      paramInfo = "";
    }

    const cleanParamName = paramName.startsWith("_")
      ? paramName.substring(1)
      : paramName;
    const arg = args[index] || { value: null, raw: null, isExpression: false };

    resultJson.constructor[cleanParamName] = {
      value: arg.isExpression ? arg.raw : arg.value,
      info: paramInfo,
      isExpression: arg.isExpression,
    };
  });

  return resultJson;
}

function formatConstructorArgument(key, val, isExpression = false) {
  if (val === null || val === undefined) {
    return "null";
  }

  if (isExpression) {
    return val;
  }

  const dataType = inferDataTypeFromName(key);

  switch (dataType) {
    case "svg":
      if (typeof val === "string") {
        let cleanedSvg = val.trim();

        if (
          (cleanedSvg.startsWith("`") && cleanedSvg.endsWith("`")) ||
          (cleanedSvg.startsWith('"') && cleanedSvg.endsWith('"')) ||
          (cleanedSvg.startsWith("'") && cleanedSvg.endsWith("'"))
        ) {
          cleanedSvg = cleanedSvg.substring(1, cleanedSvg.length - 1);
        }

        cleanedSvg = cleanedSvg.replace(/`/g, "\\`");

        return `\`${cleanedSvg}\``;
      } else {
        return `\`${String(val).replace(/`/g, "\\`")}\``;
      }

    case "x3d":
      if (typeof val === "string") {
        let cleanedX3d = val.trim();

        if (
          (cleanedX3d.startsWith("`") && cleanedX3d.endsWith("`")) ||
          (cleanedX3d.startsWith('"') && cleanedX3d.endsWith('"')) ||
          (cleanedX3d.startsWith("'") && cleanedX3d.endsWith("'"))
        ) {
          cleanedX3d = cleanedX3d.substring(1, cleanedX3d.length - 1);
        }

        cleanedX3d = cleanedX3d.replace(/`/g, "\\`");

        return `\`${cleanedX3d}\``;
      } else {
        return `\`${String(val).replace(/`/g, "\\`")}\``;
      }

    case "glb":
      if (typeof val === "string") {
        return `"${val.replace(/"/g, '\\"')}"`;
      } else {
        return `"${String(val).replace(/"/g, '\\"')}"`;
      }

    case "png":
      if (typeof val === "string") {
        return `"${val.replace(/"/g, '\\"')}"`;
      } else {
        return `"${String(val).replace(/"/g, '\\"')}"`;
      }

    case "color":
      return String(val);

    case "matrix":
    case "array":
      if (Array.isArray(val)) {
        return JSON.stringify(val);
      } else if (typeof val === "string" && val.trim().startsWith("[")) {
        return val;
      } else {
        return JSON.stringify(val);
      }

    case "number":
      return Number(val);

    default:
      if (typeof val === "string") {
        if (val === "true" || val === "false") {
          return val;
        } else if (val.trim().startsWith("[") && val.trim().endsWith("]")) {
          return val;
        } else {
          return `"${val.replace(/"/g, '\\"')}"`;
        }
      } else if (typeof val === "boolean") {
        return val.toString();
      } else if (Array.isArray(val)) {
        return JSON.stringify(val);
      } else {
        return val;
      }
  }
}

function updateConstructorLine(jsonInput) {
  const cursor = editor.getCursor();
  const scrollInfo = editor.getScrollInfo();
  const currentLine = editor.getLine(cursor.line);

  const fullStatementRegex =
    /^(\s*)(?:(let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*)?new\s+([A-Za-z0-9_]+)\s*\(/;
  const match = currentLine.match(fullStatementRegex);

  if (!match) {
    console.warn("Kein new-Statement in der aktuellen Zeile gefunden.");
    return;
  }

  const indentation = match[1] || "";
  const varKeyword = match[2] || "";
  const varName = match[3] || "";
  const className = match[4];

  const constructorArgs = [];
  const json =
    typeof jsonInput === "string" ? JSON.parse(jsonInput) : jsonInput;

  if (json.constructor) {
    for (const key of Object.keys(json.constructor)) {
      let val,
        isExpression = false;

      if (
        typeof json.constructor[key] === "object" &&
        json.constructor[key].value !== undefined
      ) {
        val = json.constructor[key].value;
        isExpression = json.constructor[key].isExpression || false;
      } else {
        val = json.constructor[key];
      }

      const formattedArg = formatConstructorArgument(key, val, isExpression);
      constructorArgs.push(formattedArg);
    }
  }

  // Trim trailing empty/null arguments so the generated call stays minimal.
  let lastNonEmptyIndex = -1;
  for (let i = constructorArgs.length - 1; i >= 0; i--) {
    const argStr = String(constructorArgs[i]).trim();
    if (
      argStr !== '""' &&
      argStr !== "''" &&
      argStr !== "" &&
      argStr !== "undefined" &&
      argStr !== "null"
    ) {
      lastNonEmptyIndex = i;
      break;
    }
  }

  const filteredArgs =
    lastNonEmptyIndex >= 0
      ? constructorArgs.slice(0, lastNonEmptyIndex + 1)
      : [];

  let newConstructor;
  if (varKeyword && varName) {
    newConstructor = `${varKeyword} ${varName} = new ${className}(${filteredArgs.join(", ")});`;
  } else {
    newConstructor = `new ${className}(${filteredArgs.join(", ")});`;
  }

  const allContent = editor.getValue();
  const lines = allContent.split("\n");

  let startLine = cursor.line;
  let endLine = cursor.line;

  let constructorContent = "";
  let openParens = 0;
  let foundStart = false;

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];

    if (!foundStart && line.includes("new " + className)) {
      foundStart = true;
      startLine = i;
    }

    if (foundStart) {
      constructorContent += line;

      for (let char of line) {
        if (char === "(") openParens++;
        if (char === ")") openParens--;
      }

      endLine = i;

      if (openParens === 0 && line.includes(";")) {
        break;
      }

      if (i < lines.length - 1) {
        constructorContent += "\n";
      }
    }
  }

  if (foundStart) {
    const finalConstructor = indentation + newConstructor;

    const newLines = [...lines];
    newLines.splice(startLine, endLine - startLine + 1, finalConstructor);

    const newContent = newLines.join("\n");

    if (newContent !== allContent) {
      editor.operation(() => {
        editor.setValue(newContent);
        editor.setCursor(startLine, finalConstructor.length);
        editor.scrollTo(scrollInfo.left, scrollInfo.top);
      });
    }
  }
}

// ===== MAIN FORM CLASS =====

class ParameterForm {
  constructor(jsonData, variableName = "") {
    this.data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    this.variableName = variableName;
    this.formElement = document.querySelector("form");
    this.scrollInfo = editor.getScrollInfo();

      this.container = null;
    this.groups = new Map();
  }

  render() {
    this.formElement.style.display = "flex";
    this.formElement.style.flexDirection = "column";
    this.formElement.style.height = "100%";
    this.formElement.style.overflow = "auto";

    editor.getWrapperElement().style.display = "none";

    tabObjects[currentTabName] = {
      formOpen: true,
      formData: this.data,
      scrollInfo: this.scrollInfo,
    };

    tabContents[currentTabName] = editor.getValue();

    this.formElement.innerHTML = "";
    this.container = this._createFormContainer();

    this._addParameterGroup(this.data.constructor || {}, "parameters", "form");
    this._addParameterGroup(
      this.data.setter || {},
      "additional",
      "form",
      this.variableName,
    );
    this._addParameterGroup(
      this.data.methods || {},
      "methods",
      "method",
      this.variableName,
    );

    this.formElement.appendChild(this.container);
    this.formElement.addEventListener("submit", (e) =>
      this._handleFormSubmit(e),
    );

    resizeEditor();
  }

  close(save = false) {
    editor.getWrapperElement().style.display = "block";
    this.formElement.style.display = "none";

    if (!save) {
      editor.setValue(tabContents[currentTabName]);
    }

    const savedScrollInfo = tabObjects[currentTabName]?.scrollInfo;
    if (savedScrollInfo) {
      setTimeout(() => {
        editor.scrollTo(savedScrollInfo.left, savedScrollInfo.top);
      }, 10);
    }

    tabObjects[currentTabName].formOpen = false;
  }

  save() {
    const newData = this._generateJSONFromForm();
    updateConstructorLine(newData);

    editor.getWrapperElement().style.display = "block";
    setTimeout(() => editor.refresh(), 1);

    this.formElement.style.display = "none";

    const savedScrollInfo = tabObjects[currentTabName]?.scrollInfo;
    if (savedScrollInfo) {
      setTimeout(() => {
        editor.scrollTo(savedScrollInfo.left, savedScrollInfo.top);
      }, 10);
    }

    tabObjects[currentTabName] = {
      formOpen: false,
      formData: newData,
    };

    tabContents[currentTabName] = editor.getValue();
    code = tabContents[currentTabName];

    if (typeof runCode === "function") {
      runCode();
    }
  }

  openSection(sectionTitle) {
    if (!this.container) {
      console.warn("Container not initialized yet in openSection");
      return;
    }

    const allGroups = this.container.querySelectorAll(".parameter-group");
    let targetGroup = null;

    allGroups.forEach((group) => {
      const header = group.querySelector(".group-header h3");
      if (header && header.textContent === sectionTitle) {
        targetGroup = group;
      }
    });

    if (!targetGroup) return;

    allGroups.forEach((group) => {
      const fieldsContainer = group.querySelector(".group-fields");
      const toggleIcon = group.querySelector(".group-header-icon");

      if (fieldsContainer && toggleIcon) {
        fieldsContainer.classList.add("collapsed");
        toggleIcon.classList.add("collapsed");
      }
    });

    const targetFields = targetGroup.querySelector(".group-fields");
    const targetIcon = targetGroup.querySelector(".group-header-icon");

    if (targetFields && targetIcon) {
      targetFields.classList.remove("collapsed");
      targetIcon.classList.remove("collapsed");
    }
  }

  _createFormContainer() {
    const container = document.createElement("div");
    container.className = "form-container";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "close-button";
    closeButton.innerHTML = "&times;";
    closeButton.onclick = () => this.close(false);

    container.appendChild(closeButton);
    return container;
  }

  _addParameterGroup(params, groupTitle, type = "form", variableName = "") {
    if (Object.keys(params).length === 0) return;

    const groupContainer = document.createElement("div");
    groupContainer.className = "parameter-group";

    const translatedTitle = getTranslation(groupTitle);

    const { headerContainer, fieldsContainer } =
      this._createGroupHeader(translatedTitle);

    Object.entries(params).forEach(([key, value]) => {
      const rowContainer = document.createElement("div");
      rowContainer.className = "row-container";

      if (type === "form" && groupTitle === "parameters") {
        const fieldBuilder = new FormFieldBuilder(key, value, "constructor");
        const { labelColumn, inputColumn } = fieldBuilder.build();
        rowContainer.appendChild(labelColumn);
        rowContainer.appendChild(inputColumn);
      } else if (type === "form" && groupTitle === "additional") {
        this._createSetterRow(rowContainer, key, value, variableName);
      } else if (type === "method") {
        this._createMethodRow(rowContainer, key, value, variableName);
      }

      fieldsContainer.appendChild(rowContainer);
    });

    if (groupTitle === "parameters") {
      this._addFormButtons(fieldsContainer);
    }

    groupContainer.appendChild(headerContainer);
    groupContainer.appendChild(fieldsContainer);
    this.container.appendChild(groupContainer);

    this.groups.set(translatedTitle, groupContainer);
  }

  _createGroupHeader(groupTitle) {
    const headerContainer = document.createElement("div");
    headerContainer.className = "group-header";

    const toggleIcon = document.createElement("span");
    toggleIcon.innerHTML = "▼";
    toggleIcon.className = "group-header-icon";

    const headerTitle = document.createElement("h3");
    headerTitle.textContent = groupTitle;
    headerTitle.style.margin = "0";

    headerContainer.appendChild(toggleIcon);
    headerContainer.appendChild(headerTitle);

    const fieldsContainer = document.createElement("div");
    fieldsContainer.className = "group-fields";

    fieldsContainer.classList.add("collapsed");
    toggleIcon.classList.add("collapsed");

    headerContainer.addEventListener("click", () => {
      const isCurrentlyCollapsed =
        fieldsContainer.classList.contains("collapsed");

      const allGroupsInForm =
        headerContainer
          .closest(".form-container")
          ?.querySelectorAll(".parameter-group") || [];
      allGroupsInForm.forEach((group) => {
        const otherFieldsContainer = group.querySelector(".group-fields");
        const otherToggleIcon = group.querySelector(".group-header-icon");

        if (
          otherFieldsContainer &&
          otherToggleIcon &&
          otherFieldsContainer !== fieldsContainer
        ) {
          otherFieldsContainer.classList.add("collapsed");
          otherToggleIcon.classList.add("collapsed");
        }
      });

      if (isCurrentlyCollapsed) {
        fieldsContainer.classList.remove("collapsed");
        toggleIcon.classList.remove("collapsed");
      } else {
        fieldsContainer.classList.add("collapsed");
        toggleIcon.classList.add("collapsed");
      }
    });

    return { headerContainer, fieldsContainer };
  }

  _createSetterRow(rowContainer, key, value, variableName) {
    const labelColumn = document.createElement("div");
    labelColumn.className = "label-column";

    const label = document.createElement("label");
    let labelText =
      value && typeof value === "object" && value.name
        ? getLocalizedName(value.name)
        : key;
    label.textContent = formatLabel(labelText);
    labelColumn.appendChild(label);

    if (value && typeof value === "object" && value.info) {
      const infoText = this._createInfoElement(
        translateSerializationInfo(value.info),
      );
      labelColumn.appendChild(infoText);
    }

    const methodExample = this._createMethodExample(key, value, variableName);
    const copyButton = UIComponents.createCopyButton(methodExample.textContent);

    rowContainer.appendChild(labelColumn);
    rowContainer.appendChild(methodExample);
    rowContainer.appendChild(copyButton);
  }

  _createMethodRow(rowContainer, key, value, variableName) {
    const labelColumn = document.createElement("div");
    labelColumn.className = "label-column";

    const label = document.createElement("label");
    label.textContent = key;
    labelColumn.appendChild(label);

    if (value && typeof value === "object" && value.info) {
      const infoText = this._createInfoElement(
        translateSerializationInfo(value.info),
      );
      labelColumn.appendChild(infoText);
    }

    const methodExample = this._createMethodExample(
      key,
      value,
      variableName,
      true,
    );

    const originalText =
      methodExample.getAttribute("data-original-text") ||
      methodExample.textContent;
    const copyButton = UIComponents.createCopyButton(originalText);

    rowContainer.appendChild(labelColumn);
    rowContainer.appendChild(methodExample);
    rowContainer.appendChild(copyButton);
  }

  _createInfoElement(info) {
    const infoText = document.createElement("div");
    infoText.className = "info-text";
    infoText.textContent = info;
    return infoText;
  }

  _createMethodExample(key, value, variableName, isMethod = false) {
    const methodExample = document.createElement("div");
    methodExample.className = "method-example";

    let exampleText = "";
    if (value && typeof value === "object" && value.example) {
      const localizedExample = getLocalizedExample(value.example);
      exampleText = variableName
        ? `${variableName}.${localizedExample}`
        : localizedExample;
    } else if (isMethod) {
      exampleText = variableName ? `${variableName}.${value}` : value;
    } else {
      const localizedName =
        value && value.name ? getLocalizedName(value.name) : key;
      exampleText = variableName
        ? `${variableName}.${localizedName}(value)`
        : `${localizedName}(value)`;
    }

    methodExample.setAttribute("data-original-text", exampleText);

    if (exampleText.includes("\n")) {
      methodExample.innerHTML = exampleText
        .split("\n")
        .map((line) => escapeHtml(line))
        .join("<br>");
    } else {
      methodExample.textContent = exampleText;
    }

    return methodExample;
  }

  _addFormButtons(fieldsContainer) {
    const buttonsRow = document.createElement("div");
    buttonsRow.className = "buttons-row";

    const cancelButton = UIComponents.createButton(getTranslation("cancel"));
    cancelButton.onclick = () => this.close(false);

    const saveButton = UIComponents.createButton(getTranslation("ok"));
    saveButton.onclick = () => this.save();

    buttonsRow.appendChild(cancelButton);
    buttonsRow.appendChild(saveButton);

    const emptyColumn = document.createElement("div");
    emptyColumn.className = "label-column";

    const buttonsColumn = document.createElement("div");
    buttonsColumn.className = "flex-column-gap";
    buttonsColumn.appendChild(buttonsRow);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "row-container";
    buttonsContainer.appendChild(emptyColumn);
    buttonsContainer.appendChild(buttonsColumn);

    fieldsContainer.appendChild(buttonsContainer);
  }

  _generateJSONFromForm() {
    const inputs = document.querySelectorAll(".form-input");
    const constructorData = {};

    const originalData = tabObjects[currentTabName]?.formData || {};
    const setterData = originalData.setter || {};
    const methodsData = originalData.methods || {};

    inputs.forEach((input) => {
      const key = input.name;
      let value = input.value;
      const isExpression = input.hasAttribute("data-is-expression");

      if (isExpression) {
        value = input.value;
      } else {
        const isColorField =
          key.toLowerCase().includes("color") ||
          key.toLowerCase().includes("farbe") ||
          /^0x[0-9A-Fa-f]+$/i.test(value);

        if (isColorField && value.trim().startsWith("0x")) {
          value = value.trim();
        } else if (input.type === "number") {
          value = parseFloat(value);
        } else {
          value = tryParseSpecialValue(value);
        }
      }

      if (input.dataset.group === "constructor") {
        const original = originalData.constructor?.[key];
        if (original && typeof original === "object" && original.info) {
          constructorData[key] = {
            value,
            info: original.info,
            isExpression: isExpression,
          };
        } else {
          constructorData[key] = value;
        }
      }
    });

    return {
      constructor: constructorData,
      setter: setterData,
      methods: methodsData,
    };
  }

  _handleFormSubmit(event) {
    event.preventDefault();
    this.save();
  }
}

// ===== UI COMPONENTS CLASS =====

class UIComponents {
  static createButton(text) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "form-button";
    button.textContent = text;
    return button;
  }

  static createCopyButton(textToCopy) {
    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = getTranslation("copy_button");
    copyButton.className = "copy-button";

    copyButton.onclick = function (event) {
      event.stopPropagation();

      let textToClipboard = textToCopy;

      // Convert <br> tags back to newlines before writing to clipboard.
      if (typeof textToCopy === "string" && textToCopy.includes("<br>")) {
        const temp = document.createElement("div");
        temp.innerHTML = textToCopy;

        const brElements = temp.getElementsByTagName("br");
        for (let i = brElements.length - 1; i >= 0; i--) {
          brElements[i].parentNode.replaceChild(
            document.createTextNode("\n"),
            brElements[i],
          );
        }

        textToClipboard = temp.textContent || temp.innerText || "";
      }

      textToClipboard = "\n" + textToClipboard + "\n";

      navigator.clipboard
        .writeText(textToClipboard)
        .then(() => {
          const originalText = this.textContent;
          this.textContent = getTranslation("copied");
          this.classList.add("success");

          setTimeout(() => {
            this.textContent = originalText;
            this.classList.remove("success");
          }, 1000);
        })
        .catch((err) => {
          console.error(getTranslation("error_copying"), err);
        });
    };

    return copyButton;
  }
}

// ===== FORM FIELD BUILDER CLASS =====

class FormFieldBuilder {
  constructor(key, value, group) {
    this.key = key;
    this.value = value;
    this.group = group;

    this.infoText = "";
    this.fieldValue = value;
    this.isExpression = false;

    if (value && typeof value === "object") {
      if (value.info !== undefined) {
        this.infoText = translateSerializationInfo(value.info);
      }
      if (value.value !== undefined) {
        this.fieldValue = value.value;
      }
      if (value.isExpression !== undefined) {
        this.isExpression = value.isExpression;
      }
      // isVariable was the legacy name for isExpression
      if (value.isVariable !== undefined) {
        this.isExpression = value.isVariable;
      }
    }

    this.dataType = inferDataTypeFromName(key);
    this.isVariableValue =
      this.fieldValue === null || this.fieldValue === undefined;
  }

  build() {
    const labelColumn = this._createLabelColumn();
    const inputColumn = this._createInputColumn();

    return { labelColumn, inputColumn };
  }

  _createLabelColumn() {
    const labelColumn = document.createElement("div");
    labelColumn.className = "label-column";

    const label = this._createFieldLabel();
    labelColumn.appendChild(label);

    if (this.infoText) {
      const infoElement = this._createInfoElement();
      labelColumn.appendChild(infoElement);
    }

    return labelColumn;
  }

  _createInputColumn() {
    const inputColumn = document.createElement("div");
    inputColumn.className = "flex-column-gap";

    const inputElement = this._createInput();
    inputColumn.appendChild(inputElement);

    return inputColumn;
  }

  _createFieldLabel() {
    const label = document.createElement("label");
    label.setAttribute("for", this.key);

    let labelText = this.key;
    if (this.value && typeof this.value === "object" && this.value.name) {
      labelText = getLocalizedName(this.value.name);
    }

    label.textContent = formatLabel(labelText);
    label.className = "field-label";
    return label;
  }

  _createInfoElement() {
    const infoText = document.createElement("div");
    infoText.className = "info-text";
    infoText.textContent = this.infoText;
    return infoText;
  }

  _createInput() {
    if (this.isExpression) {
      return new ExpressionInputBuilder(this).build();
    }

    const inputFactory = new InputFactory(this);
    return inputFactory.create();
  }
}

// ===== INPUT FACTORY CLASS =====

class InputFactory {
  constructor(fieldBuilder) {
    this.fieldBuilder = fieldBuilder;
  }

  create() {
    const { dataType, key, fieldValue, isVariableValue, group } =
      this.fieldBuilder;

    switch (dataType) {
      case "svg":
        return this._createSvgInput();
      case "x3d":
        return this._createX3dInput();
      case "glb":
        return this._createGlbInput();
      case "png":
        return this._createPngInput();
      case "color":
        return this._createColorInput();
      case "number":
        return this._createNumberInput();
      case "matrix":
        return this._createMatrixInput();
      case "array":
        return this._createArrayInput();
      default:
        return this._createTextInput();
    }
  }

  _createSvgInput() {
    const { key, fieldValue, isVariableValue, group } = this.fieldBuilder;
    return createSvgInput(key, isVariableValue ? "" : fieldValue, group);
  }

  _createX3dInput() {
    const { key, fieldValue, isVariableValue, group } = this.fieldBuilder;
    return createX3dInput(key, isVariableValue ? "" : fieldValue, group);
  }

  _createGlbInput() {
    const { key, fieldValue, isVariableValue, group } = this.fieldBuilder;
    return createGlbInput(key, isVariableValue ? "" : fieldValue, group);
  }

  _createPngInput() {
    const { key, fieldValue, isVariableValue, group } = this.fieldBuilder;
    return createPngInput(key, isVariableValue ? "" : fieldValue, group);
  }

  _createColorInput() {
    const { key, fieldValue, isVariableValue, group } = this.fieldBuilder;
    const colorValue = isVariableValue
      ? ""
      : typeof fieldValue === "string" &&
          fieldValue.toLowerCase().startsWith("0x")
        ? fieldValue
        : typeof fieldValue === "number"
          ? "0x" + fieldValue.toString(16).padStart(6, "0")
          : "";
    return createColorInput(key, colorValue, null, group);
  }

  _createNumberInput() {
    const { key, fieldValue, isVariableValue, group } = this.fieldBuilder;
    const numValue = isVariableValue
      ? 0
      : typeof fieldValue === "number"
        ? fieldValue
        : parseFloat(fieldValue) || 0;
    return createNumberInput(key, numValue, group);
  }

  _createMatrixInput() {
    const { key, fieldValue, isVariableValue, group } = this.fieldBuilder;
    let matrixValue;
    if (isVariableValue) {
      matrixValue = [[0, 0]];
    } else {
      try {
        if (typeof fieldValue === "string") {
          matrixValue = JSON.parse(fieldValue);
        } else if (Array.isArray(fieldValue)) {
          matrixValue = fieldValue;
        } else {
          matrixValue = [[0, 0]];
        }
      } catch (e) {
        console.warn("Fehler beim Parsen der Matrix:", e);
        matrixValue = [[0, 0]];
      }
    }
    return createMatrixInput(key, matrixValue, group);
  }

  _createArrayInput() {
    const { key, fieldValue, isVariableValue, group } = this.fieldBuilder;
    let arrayString = "";

    if (!isVariableValue) {
      if (Array.isArray(fieldValue)) {
        arrayString = JSON.stringify(fieldValue);
      } else if (typeof fieldValue === "string") {
        if (
          fieldValue.trim().startsWith("[") &&
          fieldValue.trim().endsWith("]")
        ) {
          arrayString = fieldValue;
        } else {
          arrayString = `[${fieldValue}]`;
        }
      } else {
        arrayString = JSON.stringify(fieldValue);
      }
    }

    return createTextInput(key, arrayString, group);
  }

  _createTextInput() {
    const { key, fieldValue, isVariableValue, group } = this.fieldBuilder;
    const strValue = isVariableValue
      ? ""
      : typeof fieldValue === "string"
        ? fieldValue
        : fieldValue !== null && fieldValue !== undefined
          ? fieldValue.toString()
          : "";
    return createTextInput(key, strValue, group);
  }
}

// ===== EXPRESSION INPUT BUILDER CLASS =====

class ExpressionInputBuilder {
  constructor(fieldBuilder) {
    this.fieldBuilder = fieldBuilder;
  }

  build() {
    const { dataType, key, fieldValue: expression, group } = this.fieldBuilder;

    const container = document.createElement("div");
    container.className = "variable-input-container";

    const input = this._createExpressionInput(expression);

    const inputRow = document.createElement("div");
    inputRow.className = "input-row";
    inputRow.appendChild(input);

    switch (dataType) {
      case "color":
        this._addColorHelper(inputRow, input, container);
        break;
      case "matrix":
        this._addMatrixHelper(inputRow, input, container);
        break;
      case "svg":
        this._addSvgHelper(inputRow, input, container);
        break;
      case "x3d":
        this._addX3dHelper(inputRow, input, container);
        break;
      case "glb":
        this._addGlbHelper(inputRow, input, container);
        break;
      case "png":
        this._addPngHelper(inputRow, input, container);
        break;
      default:
        container.appendChild(inputRow);
    }

    return container;
  }

  _createExpressionInput(expression) {
    const { key, group } = this.fieldBuilder;

    const input = document.createElement("input");
    input.type = "text";
    input.id = key;
    input.name = key;
    input.value = expression;
    input.setAttribute("data-original-value", expression);
    input.setAttribute("data-is-expression", "true");
    input.classList.add("form-input");
    if (group) input.setAttribute("data-group", group);

    return input;
  }

  _addColorHelper(inputRow, input, container) {
    const { key } = this.fieldBuilder;
    const colorButton = UIComponents.createButton(
      getTranslation("choose_color"),
    );
    inputRow.appendChild(colorButton);

    const pickerContainerId = `color-picker-${key}-variable`;
    const pickerContainer = document.createElement("div");
    pickerContainer.id = pickerContainerId;
    pickerContainer.style.display = "none";

    container.appendChild(inputRow);
    container.appendChild(pickerContainer);

    colorButton.addEventListener("click", () => {
      const isHidden = pickerContainer.style.display === "none";

      document
        .querySelectorAll('.variable-input-container [id^="color-picker-"]')
        .forEach((el) => (el.style.display = "none"));

      pickerContainer.style.display = isHidden ? "block" : "none";

      if (isHidden && !pickerContainer.hasAttribute("data-initialized")) {
        new ColorPicker(pickerContainerId, "0x000000", (newColor) => {
          input.value = newColor;
          input.removeAttribute("data-is-expression");
        });
        pickerContainer.setAttribute("data-initialized", "true");
      }
    });
  }

  _addMatrixHelper(inputRow, input, container) {
    const matrixButton = UIComponents.createButton(
      getTranslation("edit_matrix"),
    );
    inputRow.appendChild(matrixButton);

    const editorContainer = createMatrixEditorForVariable([[0, 0]], input);
    container.appendChild(inputRow);
    container.appendChild(editorContainer);

    matrixButton.addEventListener("click", () => {
      editorContainer.style.display =
        editorContainer.style.display === "none" ? "block" : "none";
    });
  }

  _addSvgHelper(inputRow, input, container) {
    const svgButton = UIComponents.createButton(getTranslation("svg_file"));
    inputRow.appendChild(svgButton);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".svg";
    fileInput.style.display = "none";

    svgButton.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (file && file.name.toLowerCase().endsWith(".svg")) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          let svgContent = e.target.result;
          const optimizedSvg = await optimizeSVG(svgContent);
          input.value = optimizedSvg
            .replace(/[\r\n]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          input.removeAttribute("data-is-expression");
        };
        reader.readAsText(file);
      }
    });

    container.appendChild(inputRow);
    container.appendChild(fileInput);
  }

  _addX3dHelper(inputRow, input, container) {
    const x3dButton = UIComponents.createButton(getTranslation("x3d_file"));
    inputRow.appendChild(x3dButton);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".x3d,.xml";
    fileInput.style.display = "none";

    x3dButton.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (
        file &&
        (file.name.toLowerCase().endsWith(".x3d") ||
          file.name.toLowerCase().endsWith(".xml"))
      ) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          let x3dContent = e.target.result;
          input.value = x3dContent
            .replace(/[\r\n]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          input.removeAttribute("data-is-expression");
        };
        reader.readAsText(file);
      }
    });

    container.appendChild(inputRow);
    container.appendChild(fileInput);
  }

  _addGlbHelper(inputRow, input, container) {
    const glbButton = UIComponents.createButton(getTranslation("glb_file"));
    inputRow.appendChild(glbButton);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".glb";
    fileInput.style.display = "none";

    glbButton.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (
        file &&
        (file.type === "model/gltf-binary" ||
          file.name.toLowerCase().endsWith(".glb"))
      ) {
        try {
          const result = await fileToBase64(file, true);
          input.value = result;
          input.removeAttribute("data-is-expression");
        } catch (error) {
          console.error("Error converting GLB to base64:", error);
        }
      }
    });

    container.appendChild(inputRow);
    container.appendChild(fileInput);
  }

  _addPngHelper(inputRow, input, container) {
    const pngButton = UIComponents.createButton(getTranslation("png_file"));
    inputRow.appendChild(pngButton);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";

    pngButton.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (file && isImageFile(file)) {
        try {
          const result = await fileToBase64(file, true);
          input.value = result;
          input.removeAttribute("data-is-expression");
        } catch (error) {
          console.error("Error converting image to base64:", error);
        }
      }
    });

    container.appendChild(inputRow);
    container.appendChild(fileInput);
  }
}

// ===== GLOBAL FUNCTIONS =====

const formElement = document.querySelector("form");
formElement.style.display = "none";

function generateFormFromJSON(jsonString, variableName) {
  const form = new ParameterForm(jsonString, variableName);
  form.render();
}

function createTextInput(key, value, group) {
  const input = document.createElement("input");
  input.type = "text";
  input.id = key;
  input.name = key;
  input.value = value;
  input.setAttribute("data-original-value", value);
  input.classList.add("form-input");
  if (group) input.setAttribute("data-group", group);
  return input;
}

function createNumberInput(key, value, group) {
  const input = document.createElement("input");
  input.type = "number";
  input.id = key;
  input.name = key;
  input.step =
    key.includes("radius") || key.includes("width") || key.includes("height")
      ? "10"
      : "1";
  input.value = value;
  input.setAttribute("data-original-value", value);
  input.classList.add("form-input");
  if (group) input.setAttribute("data-group", group);
  return input;
}

function createColorInput(key, value, parentFormId, group) {
  const container = document.createElement("div");
  container.className = "color-input-container flex-column-gap";

  const pickerContainerId = `color-picker-${key}-${parentFormId}`;
  const pickerContainer = document.createElement("div");
  pickerContainer.id = pickerContainerId;
  pickerContainer.style.display = "none";

  const input = document.createElement("input");
  input.type = "text";
  input.id = key;
  input.name = key;

  if (value !== "") {
    const hexColor = value.startsWith("0x")
      ? value.slice(2).padStart(6, "0")
      : value.padStart(6, "0");
    input.value = "0x" + hexColor;
  } else {
    input.value = "";
  }

  input.setAttribute("data-original-value", value);
  input.classList.add("form-input");
  if (group) input.setAttribute("data-group", group);

  const inputRow = document.createElement("div");
  inputRow.className = "input-row";
  inputRow.appendChild(input);

  const toggleButton = UIComponents.createButton(
    getTranslation("choose_color"),
  );
  inputRow.appendChild(toggleButton);

  container.appendChild(inputRow);
  container.appendChild(pickerContainer);

  toggleButton.addEventListener("click", () => {
    const isHidden = pickerContainer.style.display === "none";

    document
      .querySelectorAll('.color-input-container [id^="color-picker-"]')
      .forEach((el) => (el.style.display = "none"));

    pickerContainer.style.display = isHidden ? "block" : "none";

    if (isHidden && !pickerContainer.hasAttribute("data-initialized")) {
      const currentValue = input.value || "0x000000";
      new ColorPicker(pickerContainerId, currentValue, (newColor) => {
        input.value = newColor;
      });
      pickerContainer.setAttribute("data-initialized", "true");
    }
  });

  input.addEventListener("change", () => {
    if (pickerContainer.hasAttribute("data-initialized") && input.value) {
      new ColorPicker(pickerContainerId, input.value);
    }
  });

  return container;
}

function createMatrixInput(key, value, group) {
  const container = document.createElement("div");
  container.className = "matrix-input-container";

  const input = document.createElement("input");
  input.type = "text";
  input.id = key;
  input.name = key;
  input.value = JSON.stringify(value);
  input.setAttribute("data-original-value", JSON.stringify(value));
  input.classList.add("form-input", "matrix-input");
  if (group) input.setAttribute("data-group", group);

  const inputRow = document.createElement("div");
  inputRow.className = "input-row";
  inputRow.appendChild(input);

  const toggleButton = UIComponents.createButton(getTranslation("edit_matrix"));
  inputRow.appendChild(toggleButton);
  container.appendChild(inputRow);

  const editorContainer = createMatrixEditor(value, input);
  container.appendChild(editorContainer);

  toggleButton.addEventListener("click", () => {
    editorContainer.style.display =
      editorContainer.style.display === "none" ? "block" : "none";
  });

  return container;
}

function createMatrixEditor(value, input) {
  const editorContainer = document.createElement("div");
  editorContainer.className = "inline-matrix-editor";

  const rowContainer = document.createElement("div");
  rowContainer.style.display = "flex";
  rowContainer.style.alignItems = "center";
  rowContainer.style.gap = "10px";
  rowContainer.style.marginBottom = "15px";

  const rowLabel = document.createElement("label");
  rowLabel.textContent = getTranslation("number_of_points");

  const rowInput = document.createElement("input");
  rowInput.type = "number";
  rowInput.min = "1";
  rowInput.max = "10";
  rowInput.value = value.length;
  rowInput.style.width = "60px";

  rowContainer.appendChild(rowLabel);
  rowContainer.appendChild(rowInput);

  const matrixGrid = document.createElement("div");
  matrixGrid.className = "matrix-grid";

  const createGrid = (rows) => {
    matrixGrid.innerHTML = "";
    for (let i = 0; i < rows; i++) {
      const x = value[i] ? value[i][0] : 0;
      const y = value[i] ? value[i][1] : 0;

      ["number", "number"].forEach((type, idx) => {
        const inp = document.createElement("input");
        inp.type = type;
        inp.value = idx === 0 ? x : y;
        matrixGrid.appendChild(inp);
      });
    }
  };

  createGrid(value.length);

  const buttonsRow = document.createElement("div");
  buttonsRow.className = "buttons-row";

  const applyBtn = UIComponents.createButton(getTranslation("apply"));
  const closeBtn = UIComponents.createButton(getTranslation("close"));

  buttonsRow.appendChild(applyBtn);
  buttonsRow.appendChild(closeBtn);

  editorContainer.appendChild(rowContainer);
  editorContainer.appendChild(matrixGrid);
  editorContainer.appendChild(buttonsRow);

  rowInput.addEventListener("input", () =>
    createGrid(parseInt(rowInput.value) || 1),
  );

  applyBtn.addEventListener("click", () => {
    const rows = parseInt(rowInput.value) || 1;
    const matrix = [];
    const inputs = matrixGrid.querySelectorAll("input");

    for (let i = 0; i < rows; i++) {
      const x = parseFloat(inputs[i * 2].value) || 0;
      const y = parseFloat(inputs[i * 2 + 1].value) || 0;
      matrix.push([x, y]);
    }

    input.value = JSON.stringify(matrix);
    editorContainer.style.display = "none";
  });

  closeBtn.addEventListener("click", () => {
    editorContainer.style.display = "none";
  });

  return editorContainer;
}

function createMatrixEditorForVariable(defaultValue, input) {
  const editorContainer = document.createElement("div");
  editorContainer.className = "inline-matrix-editor";

  const rowContainer = document.createElement("div");
  rowContainer.style.display = "flex";
  rowContainer.style.alignItems = "center";
  rowContainer.style.gap = "10px";
  rowContainer.style.marginBottom = "15px";

  const rowLabel = document.createElement("label");
  rowLabel.textContent = getTranslation("number_of_points");

  const rowInput = document.createElement("input");
  rowInput.type = "number";
  rowInput.min = "1";
  rowInput.max = "10";
  rowInput.value = defaultValue.length;
  rowInput.style.width = "60px";

  rowContainer.appendChild(rowLabel);
  rowContainer.appendChild(rowInput);

  const matrixGrid = document.createElement("div");
  matrixGrid.className = "matrix-grid";

  const createGrid = (rows) => {
    matrixGrid.innerHTML = "";
    for (let i = 0; i < rows; i++) {
      const x = defaultValue[i] ? defaultValue[i][0] : 0;
      const y = defaultValue[i] ? defaultValue[i][1] : 0;

      ["number", "number"].forEach((type, idx) => {
        const inp = document.createElement("input");
        inp.type = type;
        inp.value = idx === 0 ? x : y;
        matrixGrid.appendChild(inp);
      });
    }
  };

  createGrid(defaultValue.length);

  const buttonsRow = document.createElement("div");
  buttonsRow.className = "buttons-row";

  const applyBtn = UIComponents.createButton(getTranslation("apply"));
  const closeBtn = UIComponents.createButton(getTranslation("close"));

  buttonsRow.appendChild(applyBtn);
  buttonsRow.appendChild(closeBtn);

  editorContainer.appendChild(rowContainer);
  editorContainer.appendChild(matrixGrid);
  editorContainer.appendChild(buttonsRow);

  rowInput.addEventListener("input", () =>
    createGrid(parseInt(rowInput.value) || 1),
  );

  applyBtn.addEventListener("click", () => {
    const rows = parseInt(rowInput.value) || 1;
    const matrix = [];
    const inputs = matrixGrid.querySelectorAll("input");

    for (let i = 0; i < rows; i++) {
      const x = parseFloat(inputs[i * 2].value) || 0;
      const y = parseFloat(inputs[i * 2 + 1].value) || 0;
      matrix.push([x, y]);
    }

    input.value = JSON.stringify(matrix);
    input.removeAttribute("data-is-expression");
    editorContainer.style.display = "none";
  });

  closeBtn.addEventListener("click", () => {
    editorContainer.style.display = "none";
  });

  return editorContainer;
}

function createSvgInput(key, value, group) {
  const container = document.createElement("div");
  container.className = "svg-input-container flex-column-gap";

  const input = document.createElement("input");
  input.type = "text";
  input.id = key;
  input.name = key;

  let cleanedValue = value || "";
  if (typeof cleanedValue === "string") {
    if (
      (cleanedValue.startsWith("`") && cleanedValue.endsWith("`")) ||
      (cleanedValue.startsWith('"') && cleanedValue.endsWith('"')) ||
      (cleanedValue.startsWith("'") && cleanedValue.endsWith("'"))
    ) {
      cleanedValue = cleanedValue.substring(1, cleanedValue.length - 1);
    }
  }

  input.value = cleanedValue;
  input.setAttribute("data-original-value", cleanedValue);
  input.classList.add("form-input");
  if (group) input.setAttribute("data-group", group);

  const inputRow = document.createElement("div");
  inputRow.className = "input-row";
  inputRow.appendChild(input);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".svg";
  fileInput.style.display = "none";

  const selectButton = UIComponents.createButton(
    getTranslation("select_svg_file"),
  );

  selectButton.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file && file.name.toLowerCase().endsWith(".svg")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        let svgContent = e.target.result;
        const optimizedSvg = await optimizeSVG(svgContent);
        input.value = optimizedSvg
          .replace(/[\r\n]+/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      };
      reader.readAsText(file);
    }
  });

  inputRow.appendChild(selectButton);
  container.appendChild(inputRow);
  container.appendChild(fileInput);

  return container;
}

function createX3dInput(key, value, group) {
  const container = document.createElement("div");
  container.className = "x3d-input-container flex-column-gap";

  const input = document.createElement("input");
  input.type = "text";
  input.id = key;
  input.name = key;

  let cleanedValue = value || "";
  if (typeof cleanedValue === "string") {
    if (
      (cleanedValue.startsWith("`") && cleanedValue.endsWith("`")) ||
      (cleanedValue.startsWith('"') && cleanedValue.endsWith('"')) ||
      (cleanedValue.startsWith("'") && cleanedValue.endsWith("'"))
    ) {
      cleanedValue = cleanedValue.substring(1, cleanedValue.length - 1);
    }
  }

  input.value = cleanedValue;
  input.setAttribute("data-original-value", cleanedValue);
  input.classList.add("form-input");
  if (group) input.setAttribute("data-group", group);

  const inputRow = document.createElement("div");
  inputRow.className = "input-row";
  inputRow.appendChild(input);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".x3d,.xml";
  fileInput.style.display = "none";

  const selectButton = UIComponents.createButton(
    getTranslation("select_x3d_file"),
  );

  selectButton.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (
      file &&
      (file.name.toLowerCase().endsWith(".x3d") ||
        file.name.toLowerCase().endsWith(".xml"))
    ) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        let x3dContent = e.target.result;
        input.value = x3dContent
          .replace(/[\r\n]+/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      };
      reader.readAsText(file);
    }
  });

  inputRow.appendChild(selectButton);
  container.appendChild(inputRow);
  container.appendChild(fileInput);

  return container;
}

function createGlbInput(key, value, group) {
  const container = document.createElement("div");
  container.className = "glb-input-container flex-column-gap";

  const input = document.createElement("input");
  input.type = "text";
  input.id = key;
  input.name = key;
  input.value = value || "";
  input.setAttribute("data-original-value", value || "");
  input.classList.add("form-input");
  input.placeholder = "Base64-encoded GLB content...";
  if (group) input.setAttribute("data-group", group);

  const inputRow = document.createElement("div");
  inputRow.className = "input-row";
  inputRow.appendChild(input);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".glb";
  fileInput.style.display = "none";

  const selectButton = UIComponents.createButton(
    getTranslation("select_glb_file"),
  );

  selectButton.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (
      file &&
      (file.type === "model/gltf-binary" ||
        file.name.toLowerCase().endsWith(".glb"))
    ) {
      try {
        const result = await fileToBase64(file, true);
        input.value = result;
      } catch (error) {
        console.error("Error converting GLB to base64:", error);
      }
    }
  });

  inputRow.appendChild(selectButton);
  container.appendChild(inputRow);
  container.appendChild(fileInput);

  return container;
}

function createPngInput(key, value, group) {
  const container = document.createElement("div");
  container.className = "png-input-container flex-column-gap";

  const input = document.createElement("input");
  input.type = "text";
  input.id = key;
  input.name = key;
  input.value = value || "";
  input.setAttribute("data-original-value", value || "");
  input.classList.add("form-input");
  input.placeholder = "Base64-encoded image content...";
  if (group) input.setAttribute("data-group", group);

  const inputRow = document.createElement("div");
  inputRow.className = "input-row";
  inputRow.appendChild(input);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";

  const selectButton = UIComponents.createButton(
    getTranslation("select_image_file"),
  );

  selectButton.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file && isImageFile(file)) {
      try {
        const result = await fileToBase64(file, true);
        input.value = result;
      } catch (error) {
        console.error("Error converting image to base64:", error);
      }
    }
  });

  inputRow.appendChild(selectButton);
  container.appendChild(inputRow);
  container.appendChild(fileInput);

  return container;
}

// ===== LANGUAGE CHANGE HANDLER =====

document.addEventListener("languageChanged", function () {
  const openForms = document.querySelectorAll(".form-container");
  openForms.forEach((form) => {
    const buttons = form.querySelectorAll("button");
    buttons.forEach((button) => {
      if (
        button.textContent === "Abbrechen" ||
        button.textContent === "Cancel"
      ) {
        button.textContent = getTranslation("cancel");
      } else if (button.textContent === "OK") {
        button.textContent = getTranslation("ok");
      } else if (
        button.textContent === "Kopieren" ||
        button.textContent === "Copy"
      ) {
        button.textContent = getTranslation("copy_button");
      } else if (
        button.textContent === "Farbe wählen" ||
        button.textContent === "Choose Color"
      ) {
        button.textContent = getTranslation("choose_color");
      } else if (
        button.textContent === "Matrix bearbeiten" ||
        button.textContent === "Edit Matrix"
      ) {
        button.textContent = getTranslation("edit_matrix");
      } else if (
        button.textContent === "SVG-Datei" ||
        button.textContent === "SVG File"
      ) {
        button.textContent = getTranslation("svg_file");
      } else if (
        button.textContent === "SVG-Datei auswählen" ||
        button.textContent === "Select SVG file"
      ) {
        button.textContent = getTranslation("select_svg_file");
      } else if (
        button.textContent === "X3D-Datei" ||
        button.textContent === "X3D File"
      ) {
        button.textContent = getTranslation("x3d_file");
      } else if (
        button.textContent === "X3D-Datei auswählen" ||
        button.textContent === "Select X3D file"
      ) {
        button.textContent = getTranslation("select_x3d_file");
      } else if (
        button.textContent === "GLB-Datei" ||
        button.textContent === "GLB File"
      ) {
        button.textContent = getTranslation("glb_file");
      } else if (
        button.textContent === "GLB-Datei auswählen" ||
        button.textContent === "Select GLB file"
      ) {
        button.textContent = getTranslation("select_glb_file");
      } else if (
        button.textContent === "PNG-Datei" ||
        button.textContent === "PNG File"
      ) {
        button.textContent = getTranslation("png_file");
      } else if (
        button.textContent === "Bilddatei auswählen" ||
        button.textContent === "Select image file"
      ) {
        button.textContent = getTranslation("select_image_file");
      } else if (
        button.textContent === "Übernehmen" ||
        button.textContent === "Apply"
      ) {
        button.textContent = getTranslation("apply");
      } else if (
        button.textContent === "Schließen" ||
        button.textContent === "Close"
      ) {
        button.textContent = getTranslation("close");
      }
    });

    const labels = form.querySelectorAll("label");
    labels.forEach((label) => {
      if (
        label.textContent === "Anzahl Punkte:" ||
        label.textContent === "Number of points:"
      ) {
        label.textContent = getTranslation("number_of_points");
      }
    });

      const groupHeaders = form.querySelectorAll(".group-header h3");
    groupHeaders.forEach((header) => {
      const currentText = header.textContent;

      let key = null;
      if (
        currentText === getTranslation("parameters", "en") ||
        currentText === getTranslation("parameters", "de")
      ) {
        key = "parameters";
      } else if (
        currentText === getTranslation("additional", "en") ||
        currentText === getTranslation("additional", "de")
      ) {
        key = "additional";
      } else if (
        currentText === getTranslation("methods", "en") ||
        currentText === getTranslation("methods", "de")
      ) {
        key = "methods";
      }

      if (key) {
        header.textContent = getTranslation(key);
      }
    });
  });
});

// ===== EXPORTS =====

window.processConstructorArgs = processConstructorArgs;
window.inferDataTypeFromName = inferDataTypeFromName;
window.getLocalizedName = getLocalizedName;
