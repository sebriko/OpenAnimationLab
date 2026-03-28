// Created with Open Animation Lab
// PID-Regler: Wasserstand-Regelung
// Open Source – CC BY 4.0

let board = new Board(1280, 720);

// ==================== KONSTANTEN ====================

const SVG_OFF_X = -2;
const SVG_OFF_Y = 70 + 20;

const WL = 115.43 + SVG_OFF_X;
const WR = 375.43 + SVG_OFF_X;
const WT = 63.33 + SVG_OFF_Y;
const WB = 543.33 + SVG_OFF_Y;
const WW = WR - WL;
const WH = WB - WT;

const INFLOW_PIPE_X = 136 + SVG_OFF_X;
const INFLOW_PIPE_Y = 69 + SVG_OFF_Y;

const OUTFLOW_EXIT_X = 459 + SVG_OFF_X;
const OUTFLOW_EXIT_Y = 527 + SVG_OFF_Y;
const OUTFLOW_PIPE_HALF_H = 15;

const WATER_COL = 0x3498db;
const BG_COL = 0xecf0f1;
const SOLL_COL = 0xe74c3c;
const IST_COL = 0x2980b9;
const INFLOW_COL = 0x5dade2;
const GREEN_COL = 0x27ae60;

const GX = 560 - 10; // 10px nach links
const GY = 350 - 60 + 20 + 5; // 5px nach unten
const GW = 690;
const GH = 330;
const GM_L = 55;
const GM_T = 10;
const GM_B = 25;
const GM_R = 15;
const PLOT_X = GX + GM_L;
const PLOT_Y = GY + GM_T;
const PLOT_W = GW - GM_L - GM_R;
const PLOT_H = GH - GM_T - GM_B;
const MAX_HIST = 500;

const FS = 22;

// ==================== HILFSFUNKTION ====================
function komma(zahl, stellen) {
  return zahl.toFixed(stellen).replace(".", ",");
}

// ==================== SIMULATIONSVARIABLEN ====================
let kp = 2.0;
let ki = 0;
let kd = 0;
let setpoint = 50;
let waterLevel = 10;
let integralSum = 0;
let lastError = 0;
let controlOutput = 0;
let disturbance = 50;
let running = true;
let frameCountAnimation = 0;

const INFLOW_SCALE = 0.0012;
const OUTFLOW_SCALE = 0.000025;

const MAX_FLOW_PX = 28;
const MAX_VOLUME_FLOW = 100 * INFLOW_SCALE;

let histSoll = [];
let histIst = [];

// ==================== TANK-SKALA ====================
for (let p = 0; p <= 100; p += 25) {
  let sy = WB - (p / 100) * WH;
  let tickLine = new Line(WL - 15, sy, WL, sy, 0xcccccc, 1);
  let tickLabel = new Text(p + "%", "Arial", 22, 0x444444, "right");
  tickLabel.x = WL - 32;
  tickLabel.y = sy - 22;
}

// ==================== WASSER ====================
let wH = Math.max((waterLevel / 100) * WH, 1);
let waterRect = new Rectangle(WW, wH, WATER_COL);
waterRect.x = WL;
waterRect.y = WB - wH;
waterRect.setAlpha(0.7);
waterRect.setGradient(
  "linear",
  [
    { offset: 0, color: "#5dade2" },
    { offset: 1, color: "#2e86c1" },
  ],
  90,
);

// ==================== ZUFLUSS-STRAHL ====================
let inflowStream = new Rectangle(10, 1, INFLOW_COL);
inflowStream.x = INFLOW_PIPE_X;
inflowStream.y = WT;
inflowStream.setAlpha(0.7);
inflowStream.setRoundedCorners(2);

// ==================== ABFLUSS ====================
let outflowShape = new LinePath(
  [[OUTFLOW_EXIT_X, OUTFLOW_EXIT_Y]],
  INFLOW_COL,
  0,
);
outflowShape.setAlpha(0.7);
outflowShape.setFillColor(INFLOW_COL);
outflowShape.closePath();

// ==================== SVG-BEHÄLTER ====================
let mySVG = new SimpleSVG(
  `<svg id="Ebene_1" data-name="Ebene 1" viewBox="0 0 459.8 563.83"><defs><style>.cls-1{fill:#f2f2f2;stroke:#555;stroke-miterlimit:10}</style></defs><path d="M161.47 69.12h-30V30.71c-.5-.12-1.12-.21-1.85-.21H.5V.5h129.11c17.86 0 31.85 11.86 31.85 27v41.62Zm222.96 443.51h74.87v30h-74.87z" class="cls-1"/><path d="M375.43 63.33v480h-260v-480h-20v500h300v-500h-20z" class="cls-1"/></svg>`,
);
mySVG.x = SVG_OFF_X;
mySVG.y = SVG_OFF_Y;

// ==================== SOLLWERT-LINIE ====================
let sollY = WB - (setpoint / 100) * WH;
let sollLine = new Line(WL - 30, sollY, WR + 30, sollY, SOLL_COL, 2);
sollLine.setStrokeDash([8, 5]);

let sollMarkerLabel = new Text("Soll", "Arial", FS, SOLL_COL);
sollMarkerLabel.x = WR + 35;
sollMarkerLabel.y = sollY - 22;

// ==================== BUTTONS ====================
let startPauseBtn = new Button("⏸ Pause", 130, 40, "Arial", FS);
startPauseBtn.x = 15;
startPauseBtn.y = 15;

let resetBtn = new Button("↺ Reset", 130, 40, "Arial", FS);
resetBtn.x = 160;
resetBtn.y = 15;

// ==================== REGLER ====================
// Sollwert und Störgröße jetzt links (ehemals CX)
let CX = 615;
let CY = 5;
let CX2 = CX + 350;
let SP = 84;

// Sollwert und Störgröße auf der LINKEN Position (CX)
let sollText = new Text(
  "Sollwert w = " + setpoint + " %",
  "Arial",
  FS,
  0x444444,
);
sollText.x = CX;
sollText.y = CY;

let sollSlider = new ButtonSlider(10, 90, setpoint, 1, 50, 240);
sollSlider.x = CX;
sollSlider.y = CY + 28;

let distText = new Text(
  "Abfluss (Störgröße) = " + disturbance + " %",
  "Arial",
  FS,
  0x444444,
);
distText.x = CX;
distText.y = CY + SP;

let distSlider = new ButtonSlider(0, 100, disturbance, 1, 50, 240);
distSlider.x = CX;
distSlider.y = CY + SP + 28;

// K-Regler auf der RECHTEN Position (CX2)
let kpText = new Text("K<sub>p</sub> = " + komma(kp, 1), "Arial", FS, 0x444444);
kpText.x = CX2;
kpText.y = CY;

let kpSlider = new ButtonSlider(0, 10, kp, 0.1, 50, 240);
kpSlider.x = CX2;
kpSlider.y = CY + 28;

let kiText = new Text("K<sub>i</sub> = " + komma(ki, 2), "Arial", FS, 0x444444);
kiText.x = CX2;
kiText.y = CY + SP;

let kiSlider = new ButtonSlider(0, 2, ki, 0.01, 50, 240);
kiSlider.x = CX2;
kiSlider.y = CY + SP + 28;

let kdText = new Text("K<sub>d</sub> = " + komma(kd, 1), "Arial", FS, 0x444444);
kdText.x = CX2;
kdText.y = CY + SP * 2;

let kdSlider = new ButtonSlider(0, 10, kd, 0.1, 50, 240);
kdSlider.x = CX2;
kdSlider.y = CY + SP * 2 + 28;

// ==================== GRAPH ====================

let coordSys = new CoordinateSystem(
  0,
  PLOT_W,
  PLOT_H + 28,
  0,
  0x444444,
  20,
  9,
  1,
);
coordSys.x = PLOT_X;
coordSys.y = PLOT_Y + PLOT_H;

let yRuler = new Ruler(
  "top",
  ["0%", "25%", "50%", "75%", "100%"],
  PLOT_H / 4,
  0,
  0x444444,
  1,
  8,
  22,
  0x444444,
  true,
  0,
  ".",
);
yRuler.x = PLOT_X;
yRuler.y = PLOT_Y + PLOT_H;

let xAxisLabel = new Text("Zeit", "Arial", FS, 0x444444);
xAxisLabel.x = PLOT_X + PLOT_W - 60;
xAxisLabel.y = PLOT_Y + PLOT_H + 3;

let yAxisLabel = new Text("Füllstand", "Arial", FS, 0x444444);
yAxisLabel.x = PLOT_X - 130;
yAxisLabel.y = PLOT_Y - 65;

for (let p = 25; p <= 75; p += 25) {
  let ly = PLOT_Y + PLOT_H - (p / 100) * PLOT_H;
  let gridLine = new Line(PLOT_X, ly, PLOT_X + PLOT_W, ly, 0xeeeeee, 1);
  gridLine.setStrokeDash([3, 3]);
}

let graphSollLine = new LinePath(
  [[PLOT_X, PLOT_Y + PLOT_H / 2]],
  SOLL_COL,
  1.5,
);
graphSollLine.setAlpha(0.7);

let graphIstLine = new LinePath([[PLOT_X, PLOT_Y + PLOT_H]], IST_COL, 2.5);

let legendRect = new Rectangle(160, 26, 0xffffff);
legendRect.x = PLOT_X + PLOT_W - 165;
legendRect.y = GY + 3;
legendRect.setAlpha(0.9);
legendRect.setRoundedCorners(3);

let legSollLine = new Line(
  PLOT_X + PLOT_W - 158,
  GY + 16,
  PLOT_X + PLOT_W - 135,
  GY + 16,
  SOLL_COL,
  2,
);
legSollLine.setStrokeDash([5, 3]);
let legSollText = new Text("Soll", "Arial", 22, SOLL_COL);
legSollText.x = PLOT_X + PLOT_W - 140;
legSollText.y = GY - 6;

let legIstLine = new Line(
  PLOT_X + PLOT_W - 80,
  GY + 16,
  PLOT_X + PLOT_W - 57,
  GY + 16,
  IST_COL,
  2.5,
);
let legIstText = new Text("Ist", "Arial", 22, IST_COL);
legIstText.x = PLOT_X + PLOT_W - 60;
legIstText.y = GY - 6;

// ==================== EVENT HANDLER ====================
startPauseBtn.onClick(function () {
  running = !running;
  if (running) {
    startPauseBtn.setText("⏸ Pause");
  } else {
    startPauseBtn.setText("▶ Start");
  }
});

resetBtn.onClick(function () {
  running = false;
  startPauseBtn.setText("▶ Start");
  waterLevel = 10;
  integralSum = 0;
  lastError = 0;
  controlOutput = 0;
  frameCountAnimation = 0;
  histSoll = [];
  histIst = [];
  updateGraph();
  updateVisuals();
});

// ==================== WASSERSTRAHL-BERECHNUNG ====================
const JET_STEPS = 20;
const JET_A_BIG = 0.8;
const JET_A_SMALL = 1.2;
const JET_STRETCH_MIN = 15;
const JET_STRETCH_MAX = 140;
const JET_BIG_EXTRA = 1.25;

function computeWaterJet(outflowPct) {
  let gap = (outflowPct / 100) * MAX_FLOW_PX;
  let normalized = outflowPct / 100;

  let pipeBottom = OUTFLOW_EXIT_Y + OUTFLOW_PIPE_HALF_H;
  let pipeTop = pipeBottom - gap;
  let pipeRight = OUTFLOW_EXIT_X;

  if (gap < 0.5) {
    let fixedBottom = OUTFLOW_EXIT_Y + OUTFLOW_PIPE_HALF_H;
    return [
      [OUTFLOW_EXIT_X, fixedBottom],
      [OUTFLOW_EXIT_X + 1, fixedBottom],
    ];
  }

  let jetWidth = gap;
  let jetEndFactor = Math.pow(1.8, normalized);
  let jetEndWidth = jetWidth * jetEndFactor;

  let stretch =
    JET_STRETCH_MIN + normalized * (JET_STRETCH_MAX - JET_STRETCH_MIN);
  let stretchBig = stretch * JET_BIG_EXTRA;

  let sharpness = Math.pow(normalized, 0.3);
  stretchBig *= sharpness;

  let targetY = OUTFLOW_EXIT_Y + 130;

  let dyBig = targetY - pipeTop;
  let tMaxBig = Math.sqrt(dyBig / (JET_A_BIG * Math.max(stretchBig, 0.01)));
  let bigPoints = [];
  for (let i = 0; i <= JET_STEPS; i++) {
    let t = (i / JET_STEPS) * tMaxBig;
    let x = pipeRight + t * stretchBig;
    let y = pipeTop + JET_A_BIG * t * t * Math.max(stretchBig, 0.01);
    bigPoints.push([x, y]);
  }

  let bigEndX = bigPoints[bigPoints.length - 1][0];
  let smallEndX = bigEndX - jetEndWidth;

  let dySmall = targetY - pipeBottom;
  let dxSmall = smallEndX - pipeRight;
  let smallPoints = [];
  for (let i = 0; i <= JET_STEPS; i++) {
    let t = i / JET_STEPS;
    let x = pipeRight + t * dxSmall;
    let y = pipeBottom + dySmall * t * t;
    smallPoints.push([x, y]);
  }

  let shape = [];
  for (let i = 0; i < bigPoints.length; i++) {
    shape.push(bigPoints[i]);
  }
  shape.push([smallEndX, targetY]);
  for (let i = smallPoints.length - 1; i >= 0; i--) {
    shape.push(smallPoints[i]);
  }

  return shape;
}

// ==================== VISUALISIERUNGS-UPDATE ====================
function updateVisuals() {
  let h = Math.max((waterLevel / 100) * WH, 1);
  waterRect.setHeight(h);
  waterRect.y = WB - h;

  let sY = WB - (setpoint / 100) * WH;
  sollLine.setStart(WL - 30, sY);
  sollLine.setEnd(WR + 30, sY);
  sollMarkerLabel.x = WR + 35;
  sollMarkerLabel.y = sY - 22;

  // Zufluss: komplett ausblenden wenn controlOutput praktisch 0 ist
  if (controlOutput < 0.5) {
    inflowStream.setWidth(0);
    inflowStream.setHeight(0);
  } else {
    let inflowThickness = (controlOutput / 100) * MAX_FLOW_PX;
    let streamTop = WT;
    let streamBottom = WB - h;
    let streamH = Math.max(streamBottom - streamTop, 0);

    inflowStream.setWidth(inflowThickness);
    inflowStream.x = INFLOW_PIPE_X - 4;
    inflowStream.setHeight(streamH);
    inflowStream.y = streamTop;
  }

  let actualOutflow = waterLevel * disturbance * OUTFLOW_SCALE;
  let outflowPct = (actualOutflow / MAX_VOLUME_FLOW) * 100;
  outflowPct = Math.min(outflowPct, 100);

  let corePts = computeWaterJet(outflowPct);
  outflowShape.setPoints(corePts);
  outflowShape.closePath();
  outflowShape.setFillColor(INFLOW_COL);
}

function updateSliderTexts() {
  sollText.setText("Sollwert w = " + setpoint + " %");
  kpText.setText("K<sub>p</sub> = " + komma(kp, 1));
  kiText.setText("K<sub>i</sub> = " + komma(ki, 2));
  kdText.setText("K<sub>d</sub> = " + komma(kd, 1));
  distText.setText("Abfluss (Störgröße) = " + disturbance + " %");
}

function updateGraph() {
  if (histIst.length < 2) {
    graphIstLine.setPoints([[PLOT_X, PLOT_Y + PLOT_H]]);
    graphSollLine.setPoints([[PLOT_X, PLOT_Y + PLOT_H / 2]]);
    return;
  }

  let sollPts = [];
  let istPts = [];
  let n = histIst.length;

  for (let i = 0; i < n; i++) {
    let px = PLOT_X + (i / MAX_HIST) * PLOT_W;
    let istPy = PLOT_Y + PLOT_H - (histIst[i] / 100) * PLOT_H;
    let sollPy = PLOT_Y + PLOT_H - (histSoll[i] / 100) * PLOT_H;
    istPts.push([px, istPy]);
    sollPts.push([px, sollPy]);
  }

  graphIstLine.setPoints(istPts);
  graphSollLine.setPoints(sollPts);
}

// ==================== ANIMATIONS-TIMER ====================
let timer = new Timer();
timer.start();

timer.onUpdate(function () {
  kp = kpSlider.value;
  ki = kiSlider.value;
  kd = kdSlider.value;
  setpoint = Math.round(sollSlider.value);
  disturbance = Math.round(distSlider.value);

  updateSliderTexts();

  if (!running) {
    updateVisuals();
    return;
  }

  // PID-Berechnung
  let error = setpoint - waterLevel;

  integralSum += error;
  integralSum = Math.max(-500, Math.min(500, integralSum));

  let derivative = error - lastError;
  lastError = error;

  let pTerm = kp * error;
  let iTerm = ki * integralSum;
  let dTerm = kd * derivative;

  controlOutput = pTerm + iTerm + dTerm;
  controlOutput = Math.max(0, Math.min(100, controlOutput));

  // Strecke (Wassertank)
  let inflow = controlOutput * INFLOW_SCALE;
  let outflow = waterLevel * disturbance * OUTFLOW_SCALE;

  waterLevel += inflow - outflow;
  waterLevel = Math.max(0, Math.min(100, waterLevel));

  updateVisuals();

  frameCountAnimation++;
  if (frameCountAnimation % 2 === 0) {
    histSoll.push(setpoint);
    histIst.push(waterLevel);

    if (histIst.length > MAX_HIST) {
      histSoll.shift();
      histIst.shift();
    }

    updateGraph();
  }
});
