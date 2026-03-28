// Created with Open Animation Lab
// ═══════════════════════════════════════════════════════════════════
// RLC-WECHSELSTROMKREIS: Impedanz, Phasenverschiebung und Resonanz
// ═══════════════════════════════════════════════════════════════════
// Open Source – CC BY 4.0

let board = new Board(1280, 720);

const colors = {
  bg: 0xf5f5f5,
  primary: 0x0066cc,
  voltage: 0x0000ff,
  resistor: 0x00aa00,
  inductor: 0xff00ff,
  capacitor: 0x00ffff,
  current: 0xff0000,
  grid: 0xcccccc,
  dark: 0x444444,
  white: 0xffffff,
};

let U0 = 12;
let f = 50;
let R = 100;
let L = 0.2;
let C = 10e-6;
let hasR = true;
let hasL = true;
let hasC = true;
let phase = 0;
let waveSpeed = 0.05;
let isPlaying = false;

const T_TOTAL = 0.04;
const scaleU = 140 / 24;
const scaleI = 140 / 0.12;

// ───────────────────────────────────────────────────────────────────
// HILFSFUNKTION: Europäisches Komma
// ───────────────────────────────────────────────────────────────────

function fmt(value, decimals) {
  return value.toFixed(decimals).replace(".", ",");
}

function getOmega() {
  return 2 * Math.PI * f;
}
function getXL() {
  return hasL ? getOmega() * L : 0;
}
function getXC() {
  return hasC ? 1 / (getOmega() * C) : 0;
}
function getX() {
  return getXL() - getXC();
}
function getZ() {
  let Reff = hasR ? R : 0;
  let X = getX();
  return Math.sqrt(Reff * Reff + X * X);
}
function getPhi() {
  let Reff = hasR ? R : 0;
  let X = getX();
  if (Reff === 0 && X === 0) return 0;
  if (Reff === 0) return X > 0 ? Math.PI / 2 : -Math.PI / 2;
  return Math.atan2(X, Reff);
}
function getI0() {
  let Z = getZ();
  if (Z === 0) return 0;
  return U0 / Z;
}
function getVisiblePeriods() {
  return f * T_TOTAL;
}

// ───────────────────────────────────────────────────────────────────
// STEUERUNG: CHECKBOXEN (−20px in X)
// ───────────────────────────────────────────────────────────────────

let checkL = new Checkbox(true, 18, "L", "Arial", 22, colors.inductor);
checkL.x = 60;
checkL.y = 20;

let checkC = new Checkbox(true, 18, "C", "Arial", 22, colors.capacitor);
checkC.x = 120;
checkC.y = 20;

let checkR = new Checkbox(true, 18, "R", "Arial", 22, colors.resistor);
checkR.x = 180;
checkR.y = 20;

checkL.onClick(function (e) {
  hasL = e.value;
  inductorRect.visible = hasL;
  updateDisplay();
});

checkC.onClick(function (e) {
  hasC = e.value;
  capPlate1.visible = hasC;
  capPlate2.visible = hasC;
  wireBridge.visible = !hasC;
  updateDisplay();
});

checkR.onClick(function (e) {
  hasR = e.value;
  resistorRect.visible = hasR;
  updateDisplay();
});

// ───────────────────────────────────────────────────────────────────
// BEREICH 1: SCHALTPLAN
// ───────────────────────────────────────────────────────────────────

let wire1 = new Line(70, 100, 220, 100, colors.dark, 2);
let wire2 = new Line(70, 100, 70, 240, colors.dark, 2);
let wire3a = new Line(70, 240, 140, 240, colors.dark, 2);
let wire3b = new Line(150, 240, 220, 240, colors.dark, 2);

let wireBridge = new Line(140, 240, 150, 240, colors.dark, 2);
wireBridge.visible = false;

let wire4 = new Line(220, 100, 220, 240, colors.dark, 2);

let resistorRect = new Rectangle(50, 20, colors.white);
resistorRect.setBorder(colors.resistor, 2);
resistorRect.x = 120;
resistorRect.y = 90;

let inductorRect = new Rectangle(20, 50, colors.inductor);
inductorRect.setBorder(colors.inductor, 2);
inductorRect.x = 210;
inductorRect.y = 145;

let capPlate1 = new Line(140, 226, 140, 254, colors.capacitor, 3);
let capPlate2 = new Line(150, 226, 150, 254, colors.capacitor, 3);

let sourceCircle = new Circle(20, colors.white);
sourceCircle.setBorder(colors.dark, 2);
sourceCircle.x = 70;
sourceCircle.y = 170;

let sourceTilde = new Text("~", "Arial", 26, colors.dark, "center");
sourceTilde.x = 70;
sourceTilde.y = 145;

// ───────────────────────────────────────────────────────────────────
// BEREICH 3: ZEIGERDIAGRAMM
// ───────────────────────────────────────────────────────────────────

let phasorCenterX = 230;
let phasorCenterY = 490;

let phasorCoordSystem = new CoordinateSystem(
  168,
  168,
  168,
  168,
  colors.dark,
  26,
  12,
  1,
);
phasorCoordSystem.x = phasorCenterX;
phasorCoordSystem.y = phasorCenterY;

let labelRe = new Text("Re(U)", "Arial", 22, colors.dark, "left");
labelRe.x = phasorCenterX + 105;
labelRe.y = phasorCenterY + 5;

let labelIm = new Text("Im(U)", "Arial", 22, colors.dark, "center");
labelIm.x = phasorCenterX - 40;
labelIm.y = phasorCenterY - 168;

let arrowUR = new Arrow(
  phasorCenterX,
  phasorCenterY,
  phasorCenterX + 70,
  phasorCenterY,
  colors.resistor,
  2,
  26,
  12,
);
let arrowUL = new Arrow(
  phasorCenterX,
  phasorCenterY,
  phasorCenterX,
  phasorCenterY - 70,
  colors.inductor,
  2,
  26,
  12,
);
let arrowUC = new Arrow(
  phasorCenterX,
  phasorCenterY,
  phasorCenterX,
  phasorCenterY + 70,
  colors.capacitor,
  2,
  26,
  12,
);
let arrowU = new Arrow(
  phasorCenterX,
  phasorCenterY,
  phasorCenterX + 112,
  phasorCenterY,
  colors.voltage,
  2,
  26,
  12,
);
let arrowI = new Arrow(
  phasorCenterX,
  phasorCenterY,
  phasorCenterX + 84,
  phasorCenterY,
  colors.current,
  2,
  26,
  12,
);

let phaseAngle = new AngleLabel(
  phasorCenterX,
  phasorCenterY,
  phasorCenterX + 84,
  phasorCenterY,
  phasorCenterX + 112,
  phasorCenterY - 42,
  35,
  "φ",
  "Arial",
  22,
  colors.dark,
  1,
  colors.dark,
);

// ───────────────────────────────────────────────────────────────────
// BEREICH 4: ZEITVERLAUF
// ───────────────────────────────────────────────────────────────────

let waveCenterX = 450;
let waveCenterY = 490;

let waveCoordSystem = new CoordinateSystem(
  0,
  750,
  168,
  168,
  colors.dark,
  26,
  12,
  1,
);
waveCoordSystem.x = waveCenterX;
waveCoordSystem.y = waveCenterY;

let labelT = new Text("t", "Arial", 22, colors.dark, "left");
labelT.x = waveCenterX + 735;
labelT.y = waveCenterY + 5;

let labelUIP = new Text("U, I", "Arial", 22, colors.dark, "left");
labelUIP.x = waveCenterX + 5;
labelUIP.y = waveCenterY - 168;

let timeAxisLabel = new Text("40 ms", "Arial", 22, colors.dark, "center");
timeAxisLabel.x = waveCenterX + 770;
timeAxisLabel.y = waveCenterY + 30;

let voltageWave = new LinePath(
  [
    [0, 0],
    [10, 0],
  ],
  colors.voltage,
  2,
);
voltageWave.x = waveCenterX;
voltageWave.y = waveCenterY;

let currentWave = new LinePath(
  [
    [0, 0],
    [10, 0],
  ],
  colors.current,
  2,
);
currentWave.x = waveCenterX;
currentWave.y = waveCenterY;

let voltageRWave = new LinePath(
  [
    [0, 0],
    [10, 0],
  ],
  colors.resistor,
  1,
);
voltageRWave.x = waveCenterX;
voltageRWave.y = waveCenterY;
voltageRWave.setAlpha(0.5);

let voltageMarker = new Circle(6, colors.voltage);
voltageMarker.x = waveCenterX;
voltageMarker.y = waveCenterY;

let currentMarker = new Circle(6, colors.current);
currentMarker.x = waveCenterX;
currentMarker.y = waveCenterY;

let phaseLineU = new Line(0, 0, 0, 0, colors.dark, 1.5);
let phaseLineI = new Line(0, 0, 0, 0, colors.dark, 1.5);
let phaseArrowLeft = new Arrow(0, 0, 0, 0, colors.dark, 1.5, 16, 10);
let phaseArrowRight = new Arrow(0, 0, 0, 0, colors.dark, 1.5, 16, 10);

let phaseLabel = new Text("φ", "Arial", 22, colors.dark, "center");
phaseLabel.x = waveCenterX;
phaseLabel.y = waveCenterY - 210;

let connectionLineI = new Line(0, 0, 0, 0, colors.current, 1);
connectionLineI.setAlpha(0.5);

let connectionLineU = new Line(0, 0, 0, 0, colors.voltage, 1);
connectionLineU.setAlpha(0.5);

// ───────────────────────────────────────────────────────────────────
// STEUERUNG: SLIDER
// sliderSpacing: 52 → 62 (+10px vertikal)
// sliderUfX:    300 → 290 (−10px links)
// sliderRCLX:   640 (unverändert)
// ───────────────────────────────────────────────────────────────────

let sliderStartY = 30;
let sliderSpacing = 62; // war 52, +10px

// ── U und f: −10px (290, war 300) ──
let sliderUfX = 290;

let labelU = new Text("U:", "Arial", 22, colors.voltage, "left");
labelU.x = sliderUfX;
labelU.y = sliderStartY;

let sliderU = new ButtonSlider(1, 24, 12, 1, 50, 200);
sliderU.x = sliderUfX + 30;
sliderU.y = sliderStartY - 7;

let valueU = new Text("12 V", "Arial", 22, colors.dark, "left");
valueU.x = sliderUfX + 260;
valueU.y = sliderStartY;

sliderU.onChange(function (e) {
  U0 = e.value;
  valueU.setText(fmt(U0, 0) + " V");
  updateDisplay();
});

let labelF = new Text("f:", "Arial", 22, colors.dark, "left");
labelF.x = sliderUfX;
labelF.y = sliderStartY + sliderSpacing;

let sliderF = new ButtonSlider(1, 200, 50, 1, 50, 200);
sliderF.x = sliderUfX + 30;
sliderF.y = sliderStartY + sliderSpacing - 7;

let valueF = new Text("50 Hz", "Arial", 22, colors.dark, "left");
valueF.x = sliderUfX + 260;
valueF.y = sliderStartY + sliderSpacing;

sliderF.onChange(function (e) {
  f = e.value;
  valueF.setText(fmt(f, 0) + " Hz");
  updateDisplay();
});

// ── R, C, L: unverändert bei 640 ──
let sliderRCLX = 640;

let labelRSlider = new Text("R:", "Arial", 22, colors.resistor, "left");
labelRSlider.x = sliderRCLX;
labelRSlider.y = sliderStartY;

let sliderR = new ButtonSlider(1, 1000, 100, 1, 50, 200);
sliderR.x = sliderRCLX + 30;
sliderR.y = sliderStartY - 7;

let valueR = new Text("100 Ω", "Arial", 22, colors.dark, "left");
valueR.x = sliderRCLX + 260;
valueR.y = sliderStartY;

sliderR.onChange(function (e) {
  R = e.value;
  valueR.setText(fmt(R, 0) + " Ω");
  updateDisplay();
});

let labelCSlider = new Text("C:", "Arial", 22, colors.capacitor, "left");
labelCSlider.x = sliderRCLX;
labelCSlider.y = sliderStartY + sliderSpacing;

let sliderC = new ButtonSlider(1, 100, 10, 1, 50, 200);
sliderC.x = sliderRCLX + 30;
sliderC.y = sliderStartY + sliderSpacing - 7;

let valueC = new Text("10 µF", "Arial", 22, colors.dark, "left");
valueC.x = sliderRCLX + 260;
valueC.y = sliderStartY + sliderSpacing;

sliderC.onChange(function (e) {
  C = e.value * 1e-6;
  valueC.setText(fmt(e.value, 0) + " µF");
  updateDisplay();
});

let labelLSlider = new Text("L:", "Arial", 22, colors.inductor, "left");
labelLSlider.x = sliderRCLX;
labelLSlider.y = sliderStartY + 2 * sliderSpacing;

let sliderL = new ButtonSlider(10, 1000, 200, 10, 50, 200);
sliderL.x = sliderRCLX + 30;
sliderL.y = sliderStartY + 2 * sliderSpacing - 7;

let valueL = new Text("200 mH", "Arial", 22, colors.dark, "left");
valueL.x = sliderRCLX + 260;
valueL.y = sliderStartY + 2 * sliderSpacing;

sliderL.onChange(function (e) {
  L = e.value / 1000;
  valueL.setText(fmt(e.value, 0) + " mH");
  updateDisplay();
});

// ───────────────────────────────────────────────────────────────────
// ANZEIGE: BERECHNETE WERTE
// ───────────────────────────────────────────────────────────────────

let calcTitle = new Text("Berechnete Werte:", "Arial", 22, colors.dark, "left");
calcTitle.x = 1030;
calcTitle.y = 25;

let calcXL = new Text("X_L = 62,8 Ω", "Arial", 22, colors.inductor, "left");
calcXL.x = 1030;
calcXL.y = 55;

let calcXC = new Text("X_C = 318,3 Ω", "Arial", 22, colors.capacitor, "left");
calcXC.x = 1030;
calcXC.y = 85;

let calcZ = new Text("Z = 271,8 Ω", "Arial", 22, colors.dark, "left");
calcZ.x = 1030;
calcZ.y = 115;

let calcPhi = new Text("φ = -70,0°", "Arial", 22, colors.voltage, "left");
calcPhi.x = 1030;
calcPhi.y = 145;

let calcI = new Text("I = 44,2 mA", "Arial", 22, colors.current, "left");
calcI.x = 1030;
calcI.y = 175;

let calcRes = new Text("Resonanz: 112,5 Hz", "Arial", 22, colors.dark, "left");
calcRes.x = 1030;
calcRes.y = 205;

// ───────────────────────────────────────────────────────────────────
// PLAY/PAUSE & RESET
// ───────────────────────────────────────────────────────────────────

let playButton = new Button("Start", 80, 35, "Arial", 22);
playButton.x = 1090;
playButton.y = 660;

playButton.onClick(function () {
  isPlaying = !isPlaying;
  if (isPlaying) {
    playButton.setText("Pause");
    timer.start();
  } else {
    playButton.setText("Start");
  }
});

let resetButton = new Button("Reset", 80, 35, "Arial", 22);
resetButton.x = 1180;
resetButton.y = 660;

resetButton.onClick(function () {
  phase = 0;
  updateDisplay();
});

// ───────────────────────────────────────────────────────────────────
// UPDATE-FUNKTIONEN
// ───────────────────────────────────────────────────────────────────

function updateDisplay() {
  updateCalculatedValues();
  updatePhasorDiagram();
  updateWaveforms();
}

function updateCalculatedValues() {
  let XL = getXL();
  let XC = getXC();
  let Z = getZ();
  let phi = getPhi();
  let I0_val = getI0();

  calcXL.setText("X<sub>L</sub> = " + fmt(XL, 1) + " Ω");
  calcXC.setText("X<sub>C</sub> = " + fmt(XC, 1) + " Ω");
  calcZ.setText("Z = " + fmt(Z, 1) + " Ω");
  calcPhi.setText("φ = " + fmt((phi * 180) / Math.PI, 1) + "°");
  calcI.setText("I = " + fmt(I0_val * 1000, 1) + " mA");

  if (hasL && hasC && L > 0 && C > 0) {
    let fRes = 1 / (2 * Math.PI * Math.sqrt(L * C));
    calcRes.setText("Resonanz: " + fmt(fRes, 1) + " Hz");
    calcRes.visible = true;
  } else {
    calcRes.visible = false;
  }
}

function updatePhasorDiagram() {
  let I0_val = getI0();
  let phi = getPhi();
  let XL = getXL();
  let XC = getXC();
  let Reff = hasR ? R : 0;

  let phasorPhase = phase + Math.PI;

  let UR = I0_val * Reff;
  let URlen = UR * scaleU;
  if (hasR && UR > 0.01) {
    arrowUR.setEnd(
      phasorCenterX + URlen * Math.cos(phasorPhase),
      phasorCenterY + URlen * Math.sin(phasorPhase),
    );
    arrowUR.visible = true;
  } else {
    arrowUR.visible = false;
  }

  let UL = I0_val * XL;
  let ULlen = UL * scaleU;
  if (hasL && UL > 0.01) {
    arrowUL.setEnd(
      phasorCenterX + ULlen * Math.cos(phasorPhase + Math.PI / 2),
      phasorCenterY + ULlen * Math.sin(phasorPhase + Math.PI / 2),
    );
    arrowUL.visible = true;
  } else {
    arrowUL.visible = false;
  }

  let UC = I0_val * XC;
  let UClen = UC * scaleU;
  if (hasC && UC > 0.01) {
    arrowUC.setEnd(
      phasorCenterX + UClen * Math.cos(phasorPhase - Math.PI / 2),
      phasorCenterY + UClen * Math.sin(phasorPhase - Math.PI / 2),
    );
    arrowUC.visible = true;
  } else {
    arrowUC.visible = false;
  }

  let Ulen = U0 * scaleU;
  arrowU.setEnd(
    phasorCenterX + Ulen * Math.cos(phasorPhase + phi),
    phasorCenterY + Ulen * Math.sin(phasorPhase + phi),
  );

  let Ilen = I0_val * scaleI;
  let Ix = Ilen * Math.cos(phasorPhase);
  let Iy = Ilen * Math.sin(phasorPhase);
  arrowI.setEnd(phasorCenterX + Ix, phasorCenterY + Iy);

  if (Math.abs(phi) > 0.01) {
    phaseAngle.setArm1(phasorCenterX + Ix, phasorCenterY + Iy);
    phaseAngle.setArm2(
      phasorCenterX + Ulen * Math.cos(phasorPhase + phi),
      phasorCenterY + Ulen * Math.sin(phasorPhase + phi),
    );
    phaseAngle.visible = true;
  } else {
    phaseAngle.visible = false;
  }
}

function updateWaveforms() {
  let I0_val = getI0();
  let phi = getPhi();
  let Reff = hasR ? R : 0;
  let omega = getOmega();

  let voltagePoints = [];
  let currentPoints = [];
  let voltageRPoints = [];
  let waveLength = 730;

  for (let x = 0; x <= waveLength; x += 3) {
    let t = (x / waveLength) * T_TOTAL;
    let angle = omega * t + phase;

    voltagePoints.push([x, -(U0 * Math.sin(angle + phi)) * scaleU]);
    currentPoints.push([x, -(I0_val * Math.sin(angle)) * scaleI]);
    if (hasR)
      voltageRPoints.push([x, -(I0_val * Reff * Math.sin(angle)) * scaleU]);
  }

  voltageWave.setPoints(voltagePoints);
  currentWave.setPoints(currentPoints);

  if (hasR && voltageRPoints.length > 1) {
    voltageRWave.setPoints(voltageRPoints);
    voltageRWave.visible = true;
  } else {
    voltageRWave.visible = false;
  }

  let voltageMarkerY = waveCenterY - U0 * Math.sin(phase + phi) * scaleU;
  let currentMarkerY = waveCenterY - I0_val * Math.sin(phase) * scaleI;

  voltageMarker.x = waveCenterX;
  voltageMarker.y = voltageMarkerY;
  currentMarker.x = waveCenterX;
  currentMarker.y = currentMarkerY;

  // Phasenverschiebungs-Anzeige
  let pixelsPerSecond = waveLength / T_TOTAL;
  let T = 1 / f;
  let timeDiff = Math.abs(phi) / omega;
  let phaseDiffPixels = timeDiff * pixelsPerSecond;

  let tImax = (Math.PI / 2 - phase) / omega;
  while (tImax < 0) tImax += T;
  while (tImax >= T) tImax -= T;

  // Prüfe ob das Strom-Maximum im sichtbaren Zeitfenster liegt
  if (tImax > T_TOTAL) {
    phaseLineU.visible = false;
    phaseLineI.visible = false;
    phaseArrowLeft.visible = false;
    phaseArrowRight.visible = false;
    phaseLabel.visible = false;
    // Verbindungslinien trotzdem aktualisieren
    updateConnectionLines(phi, I0_val);
    return;
  }

  let xImax = tImax * pixelsPerSecond;
  let tUmax = tImax - phi / omega;
  let xUmax = tUmax * pixelsPerSecond;
  let fullPeriodPixels = T * pixelsPerSecond;

  if (xUmax < 0 && xImax + fullPeriodPixels < waveLength) {
    xUmax += fullPeriodPixels;
    xImax += fullPeriodPixels;
  } else if (xUmax >= waveLength && xImax - fullPeriodPixels >= 0) {
    xUmax -= fullPeriodPixels;
    xImax -= fullPeriodPixels;
  }
  if (xUmax < 0) {
    xUmax += fullPeriodPixels;
    xImax += fullPeriodPixels;
  }
  if (xUmax >= waveLength) {
    xUmax -= fullPeriodPixels;
    xImax -= fullPeriodPixels;
  }
  if (xImax < 0) {
    xImax += fullPeriodPixels;
    xUmax += fullPeriodPixels;
  }
  if (xImax >= waveLength) {
    xImax -= fullPeriodPixels;
    xUmax -= fullPeriodPixels;
  }

  // Finale Sichtbarkeitsprüfung: Beide Maxima müssen im Bereich [0, waveLength] liegen
  if (xImax < 0 || xImax > waveLength || xUmax < 0 || xUmax > waveLength) {
    phaseLineU.visible = false;
    phaseLineI.visible = false;
    phaseArrowLeft.visible = false;
    phaseArrowRight.visible = false;
    phaseLabel.visible = false;
    updateConnectionLines(phi, I0_val);
    return;
  }

  let yUmax = waveCenterY - U0 * scaleU;
  let yImax = waveCenterY - I0_val * scaleI;
  let lineExtension = 25;
  let arrowY = Math.min(yUmax, yImax) - lineExtension;
  let lineTop = arrowY - 4;

  phaseLineU.setStart(waveCenterX + xUmax, yUmax);
  phaseLineU.setEnd(waveCenterX + xUmax, lineTop);
  phaseLineI.setStart(waveCenterX + xImax, yImax);
  phaseLineI.setEnd(waveCenterX + xImax, lineTop);

  let xLeft = Math.min(xUmax, xImax);
  let xRight = Math.max(xUmax, xImax);
  let xCenter = (xLeft + xRight) / 2;
  let minGapForInnerArrows = 20;

  if (Math.abs(phi) < 0.01) {
    phaseLineU.visible = false;
    phaseLineI.visible = false;
    phaseArrowLeft.visible = false;
    phaseArrowRight.visible = false;
    phaseLabel.visible = false;
  } else if (phaseDiffPixels < minGapForInnerArrows) {
    phaseLineU.visible = true;
    phaseLineI.visible = true;
    phaseArrowLeft.visible = true;
    phaseArrowRight.visible = true;
    phaseLabel.visible = true;
    let outerOffset = 25;
    phaseArrowLeft.setStart(waveCenterX + xLeft - outerOffset, arrowY);
    phaseArrowLeft.setEnd(waveCenterX + xLeft, arrowY);
    phaseArrowRight.setStart(waveCenterX + xRight + outerOffset, arrowY);
    phaseArrowRight.setEnd(waveCenterX + xRight, arrowY);
    phaseLabel.x = waveCenterX + xRight + outerOffset / 2;
    phaseLabel.y = arrowY - 40;
  } else {
    phaseLineU.visible = true;
    phaseLineI.visible = true;
    phaseArrowLeft.visible = true;
    phaseArrowRight.visible = true;
    phaseLabel.visible = true;
    phaseArrowLeft.setStart(waveCenterX + xCenter, arrowY);
    phaseArrowLeft.setEnd(waveCenterX + xLeft, arrowY);
    phaseArrowRight.setStart(waveCenterX + xCenter, arrowY);
    phaseArrowRight.setEnd(waveCenterX + xRight, arrowY);
    phaseLabel.x = waveCenterX + xCenter;
    phaseLabel.y = arrowY - 40;
  }

  // Verbindungslinien
  updateConnectionLines(phi, I0_val);
}

function updateConnectionLines(phi, I0_val) {
  let phasorPhase = phase + Math.PI;
  let Ilen = I0_val * scaleI;
  let currentMarkerY = waveCenterY - I0_val * Math.sin(phase) * scaleI;
  let voltageMarkerY = waveCenterY - U0 * Math.sin(phase + phi) * scaleU;

  connectionLineI.setStart(
    phasorCenterX + Ilen * Math.cos(phasorPhase),
    phasorCenterY + Ilen * Math.sin(phasorPhase),
  );
  connectionLineI.setEnd(waveCenterX, currentMarkerY);

  let Ulen = U0 * scaleU;
  connectionLineU.setStart(
    phasorCenterX + Ulen * Math.cos(phasorPhase + phi),
    phasorCenterY + Ulen * Math.sin(phasorPhase + phi),
  );
  connectionLineU.setEnd(waveCenterX, voltageMarkerY);
}

// ───────────────────────────────────────────────────────────────────
// ANIMATION
// ───────────────────────────────────────────────────────────────────

let timer = new Timer();

timer.onUpdate(function () {
  if (isPlaying) {
    phase += waveSpeed;
    if (phase > 2 * Math.PI) phase -= 2 * Math.PI;
    updatePhasorDiagram();
    updateWaveforms();
  }
});

updateDisplay();
