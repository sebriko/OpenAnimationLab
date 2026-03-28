class ColorPicker {
  constructor(containerId, initialValue = "0xFFFFFF", onChange = null) {
    this.container = document.getElementById(containerId);
    this.initialColor = initialValue;
    this.onChange = onChange;
    this.storedRGB = [255, 255, 255];

    this.redInput = null;
    this.greenInput = null;
    this.blueInput = null;
    this.brightnessSlider = null;
    this.colorPreview = null;
    this.colorCode = null;

    this.initialize();
  }

  initialize() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = "color-picker-container";
      document.body.appendChild(this.container);
    }

    this.container.innerHTML = "";
    this.createUI();
    this.setColorFromHex(this.initialColor);
    this.setupEventListeners();
  }

  createUI() {
    this.container.style.padding = "15px";
    this.container.style.border = "1px solid var(--border-light, #444)";
    this.container.style.backgroundColor = "var(--bg-lighter, #2a2a2a)";
    this.container.style.borderRadius = "4px";
    this.container.style.display = "flex";
    this.container.style.flexDirection = "column";
    this.container.style.gap = "15px";

    const colorInputsRow = document.createElement("div");
    colorInputsRow.style.display = "grid";
    colorInputsRow.style.gridTemplateColumns = "auto 1fr auto 1fr auto 1fr";
    colorInputsRow.style.gap = "10px";
    colorInputsRow.style.alignItems = "center";

    const redLabel = document.createElement("label");
    redLabel.textContent = "R:";
    this.redInput = document.createElement("input");
    this.redInput.type = "number";
    this.redInput.min = "0";
    this.redInput.max = "255";
    this.redInput.value = "255";
    this.styleInput(this.redInput);

    const greenLabel = document.createElement("label");
    greenLabel.textContent = "G:";
    this.greenInput = document.createElement("input");
    this.greenInput.type = "number";
    this.greenInput.min = "0";
    this.greenInput.max = "255";
    this.greenInput.value = "255";
    this.styleInput(this.greenInput);

    const blueLabel = document.createElement("label");
    blueLabel.textContent = "B:";
    this.blueInput = document.createElement("input");
    this.blueInput.type = "number";
    this.blueInput.min = "0";
    this.blueInput.max = "255";
    this.blueInput.value = "255";
    this.styleInput(this.blueInput);

    colorInputsRow.appendChild(redLabel);
    colorInputsRow.appendChild(this.redInput);
    colorInputsRow.appendChild(greenLabel);
    colorInputsRow.appendChild(this.greenInput);
    colorInputsRow.appendChild(blueLabel);
    colorInputsRow.appendChild(this.blueInput);

    this.container.appendChild(colorInputsRow);

    const brightnessContainer = document.createElement("div");
    brightnessContainer.style.display = "flex";
    brightnessContainer.style.flexDirection = "column";
    brightnessContainer.style.gap = "8px";

    const brightnessLabel = document.createElement("label");
    brightnessLabel.textContent = "Helligkeit";

    const brightnessSliderContainer = document.createElement("div");
    brightnessSliderContainer.style.display = "flex";
    brightnessSliderContainer.style.alignItems = "center";
    brightnessSliderContainer.style.gap = "10px";

    this.brightnessSlider = document.createElement("input");
    this.brightnessSlider.type = "range";
    this.brightnessSlider.min = "0";
    this.brightnessSlider.max = "100";
    this.brightnessSlider.value = "50";
    this.brightnessSlider.style.flex = "1";

    const brightnessValue = document.createElement("span");
    brightnessValue.textContent = "50%";
    brightnessValue.style.minWidth = "40px";
    brightnessValue.style.textAlign = "right";

    brightnessSliderContainer.appendChild(this.brightnessSlider);
    brightnessSliderContainer.appendChild(brightnessValue);

    brightnessContainer.appendChild(brightnessLabel);
    brightnessContainer.appendChild(brightnessSliderContainer);

    this.container.appendChild(brightnessContainer);

    const previewContainer = document.createElement("div");
    previewContainer.style.display = "flex";
    previewContainer.style.flexDirection = "column";
    previewContainer.style.gap = "10px";

    this.colorPreview = document.createElement("div");
    this.colorPreview.style.height = "30px";
    this.colorPreview.style.width = "100%";
    this.colorPreview.style.backgroundColor = "#FFFFFF";
    this.colorPreview.style.border = "1px solid var(--border-light, #444)";
    this.colorPreview.style.borderRadius = "4px";

    this.colorCode = document.createElement("div");
    this.colorCode.textContent = "0xFFFFFF";
    this.colorCode.style.textAlign = "center";
    this.colorCode.style.fontFamily = "monospace";

    previewContainer.appendChild(this.colorPreview);
    previewContainer.appendChild(this.colorCode);

    this.container.appendChild(previewContainer);
  }

  setupEventListeners() {
    this.redInput.addEventListener("input", () => this.updateColor());
    this.greenInput.addEventListener("input", () => this.updateColor());
    this.blueInput.addEventListener("input", () => this.updateColor());

    this.brightnessSlider.addEventListener("input", (e) => {
      const value = e.target.value;
      this.updateFromSlider(value);

      const brightnessValue = e.target.nextElementSibling;
      if (brightnessValue) {
        brightnessValue.textContent = `${value}%`;
      }
    });
  }

  updateColor() {
    this.storedRGB = [
      parseInt(this.redInput.value) || 0,
      parseInt(this.greenInput.value) || 0,
      parseInt(this.blueInput.value) || 0,
    ];

    this.applyColor(...this.storedRGB);

    const hsl = this.rgbToHsl(...this.storedRGB);
    this.brightnessSlider.value = hsl[2];

    this.notifyChange();
  }

  updateFromSlider(sliderValue) {
    let hsl = this.rgbToHsl(...this.storedRGB);
    hsl[2] = sliderValue;

    let rgb = this.hslToRgb(hsl[0], hsl[1] / 100, hsl[2] / 100);

    this.redInput.value = rgb[0];
    this.greenInput.value = rgb[1];
    this.blueInput.value = rgb[2];

    this.applyColor(rgb[0], rgb[1], rgb[2]);

    this.notifyChange();
  }

  applyColor(r, g, b) {
    const colorHex = this.rgbToHex(r, g, b);
    this.colorPreview.style.backgroundColor = this.toSharpHex(colorHex);
    this.colorCode.textContent = colorHex;
  }

  toSharpHex(hex) {
    return hex.replace(/^0x/, "#");
  }

  rgbToHex(r, g, b) {
    return (
      "0x" +
      this.componentToHex(r) +
      this.componentToHex(g) +
      this.componentToHex(b)
    );
  }

  componentToHex(c) {
    const hex = Math.max(0, Math.min(255, c)).toString(16).toUpperCase();
    return hex.length === 1 ? "0" + hex : hex;
  }

  rgbToHsl(r, g, b) {
    ((r /= 255), (g /= 255), (b /= 255));
    let max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;
    let d = max - min;

    if (d === 0) {
      h = 0;
      s = 0;
    } else {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h *= 60;
    }
    return [h, s * 100, l * 100];
  }

  hslToRgb(h, s, l) {
    let r, g, b;

    function hueToRgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    if (s === 0) {
      r = g = b = l;
    } else {
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hueToRgb(p, q, h / 360 + 1 / 3);
      g = hueToRgb(p, q, h / 360);
      b = hueToRgb(p, q, h / 360 - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  setColorFromHex(hexValue) {
    let colorValue = hexValue.trim();
    if (colorValue.startsWith("0x")) {
      colorValue = colorValue.slice(2);
    } else if (colorValue.startsWith("#")) {
      colorValue = colorValue.slice(1);
    }

    if (/^[0-9A-Fa-f]{6}$/.test(colorValue)) {
      let r = parseInt(colorValue.substr(0, 2), 16);
      let g = parseInt(colorValue.substr(2, 2), 16);
      let b = parseInt(colorValue.substr(4, 2), 16);

      this.redInput.value = r;
      this.greenInput.value = g;
      this.blueInput.value = b;

      this.storedRGB = [r, g, b];
      this.applyColor(r, g, b);

      const hsl = this.rgbToHsl(r, g, b);
      this.brightnessSlider.value = hsl[2];
    }
  }

  getColorHex() {
    return this.colorCode.textContent;
  }

  notifyChange() {
    if (typeof this.onChange === "function") {
      this.onChange(this.getColorHex());
    }
  }

  styleInput(input) {
    input.style.width = "100%";
    input.style.padding = "8px";
    input.style.border = "1px solid #ccc";
    input.style.borderRadius = "4px";
    input.style.boxSizing = "border-box";
    input.style.backgroundColor = "var(--bg-dark)";
    input.style.color = "var(--text-light)";
  }
}
