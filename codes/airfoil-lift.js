// Created with Open Animation Lab
// Open Source – CC BY 4.0

// ==================== SECTION 1: VARIABLES ====================
let board = new Board(1280, 720, 0xe8e8e8);

// Position and size variables
let chartPosX = 1000;
let chartPosY = 550;

// Data points for curves
// Note: In aerodynamics, the common notation is:
// - C_L = lift coefficient (Auftriebsbeiwert)
// - C_D = drag coefficient (Widerstandsbeiwert)
// This animation keeps the original curve shapes; only labels/terms are translated.
let liftPoints = [
  [-100, 100],
  [0, -120],
  [100, -200],
  [200, -160],
];

let dragPoints = [
  [-100, -50],
  [0, -20],
  [100, -30],
  [200, -60],
];

let polarPoints = [];

// Arrays for interactive elements
let liftHandles = [];
let dragHandles = [];
let polarHandles = [];
let polarPointLabels = [];
let allClouds = [];
let pointLabelTexts = ["-10°", "0°", "10°", "20°"];

// Physical parameters
let airspeedKmh = 150; // km/h (from the table)
let mass = 750; // kg (weight/mass value from the table)
let airDensity = 1.225; // kg/m³ (ISA sea level standard)
let wingArea = 15; // m² (estimated for a small aircraft)

// Unit conversions and derived values
let airspeedMs = airspeedKmh / 3.6; // m/s
let dynamicPressure = 0.5 * airDensity * airspeedMs * airspeedMs; // Pa (N/m²)

// Motion parameters for the animation
let velocityDeltaX = 0; // relative change in velocity (starts at 0)
let velocityDeltaY = 0;
let currentLiftForce = 0;
let currentDragForce = 0;
let timeStep = 0.016;
let showPolarDiagram = false;

// Animation and FPS tracking
let lastTime = Date.now();
let frameCounter = 0;
let lastFpsUpdate = Date.now();
let currentFps = 60;
let debugCounter = 0;

// Variable for the parameter table (filled later)
let paramTable;

// ==================== SECTION 2: OBJECTS ====================

// Background
let sky = new Rectangle(1280, 720, 0xaad4ff);
sky.x = 0;
sky.y = 0;

let backgroundGroup = new Group();
backgroundGroup.addChild(sky);

// Clouds
let cloud1 = new SimpleSVG(
  `<svg viewBox="0 0 210 297"><ellipse cx="36.03" cy="19.16" rx="28.07" ry="13.47" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="52.91" cy="17.83" rx="14.98" ry="6.45" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="70.93" cy="22.95" rx="7.97" ry="4.36" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="20.1" cy="9.86" rx="13.65" ry="6.45" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="58.41" cy="25.22" rx="11.38" ry="3.98" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="24.09" cy="27.31" rx="21.43" ry="6.45" fill="#fff" stroke="#fff" stroke-width=".26"/></svg>`,
);
cloud1.setScale(3.5, 3.5);
cloud1.x = -150;
cloud1.y = 100;

let cloud2 = new SimpleSVG(
  `<svg viewBox="0 0 43.13 15.82"><g transform="translate(-29.833 -211.523)" fill="#fff" stroke="#fff" stroke-width=".26"><ellipse cx="44.57" cy="218.48" rx="14.6" ry="6.83"/><ellipse cx="55.76" cy="223.98" rx="17.07" ry="3.22"/></g></svg>`,
);
cloud2.setScale(3.5, 3.5);
cloud2.x = 640;
cloud2.y = 300;

let cloud3 = new SimpleSVG(
  `<svg viewBox="0 0 67.4 22.64"><g transform="translate(-67.385 -165.626)" fill="#fff" stroke="#fff" stroke-width=".26"><ellipse cx="104.69" cy="174.1" rx="26.55" ry="8.35"/><ellipse cx="85.91" cy="174.67" rx="15.36" ry="5.88"/><ellipse cx="116.26" cy="179.98" rx="18.4" ry="3.22"/><ellipse cx="92.17" cy="180.36" rx="24.66" ry="7.78"/></g></svg>`,
);
cloud3.setScale(3.5, 3.5);
cloud3.x = 1200;
cloud3.y = 720;

backgroundGroup.addChild(cloud1);
backgroundGroup.addChild(cloud2);
backgroundGroup.addChild(cloud3);
backgroundGroup.setMask(0, 0, 1280, 720);

allClouds = [cloud1, cloud2, cloud3];

// Aircraft
let aircraftGroup = new Group();

let aircraftBody = new SimpleSVG(
  `<svg xml:space="preserve" viewBox="0 0 102.05 19.93"><path d="M.583 10.804C.314 7.948-.675 4.83.76 2.438 1.616 1.013 3.035.039 5.112 0c4.75-.018 6.155 5.326 7.67 9.2l28.547-.896s2.363-5.512 16.766-5.928c14.404-.416 17.228 5.872 17.228 5.872s25.643.37 26.698 5.977c1.054 5.607-26.699 5.442-26.699 5.442s-22.854.605-34.256-.004c-12.522-.669-37.406-4-37.406-4-2.277-.86-2.78-1.701-3.077-4.859z" fill="#b3b3b3"/></svg>`,
);
aircraftBody.x = 300;
aircraftBody.y = 300;
aircraftBody.setScale(5.5, 5.5);
aircraftBody.setAlpha(0.5);
aircraftBody.setRotationPoint(320, 100);

let wing = new SimpleSVG(
  `<svg xml:space="preserve" viewBox="0 0 99.46 12.48"><path d="M0 12.31S43.099-1.579 70.855.148C91.309 1.421 99.44 4.895 99.463 8.264c.036 5.133-25.212 4.142-25.212 4.142z" fill="#666"/></svg>`,
);
wing.x = 470;
wing.y = 350;
wing.setScale(2.5, 2.5);
wing.setAlpha(0.5);

let referenceLine = new Line(400, 370, 800, 370, 0x555555, 2);
referenceLine.x = 0;
referenceLine.y = 0;

let referenceLine2 = new Line(400, 370, 800, 370, 0x555555, 2);
referenceLine2.x = 0;
referenceLine2.y = 0;

aircraftGroup.addChild(aircraftBody);
aircraftGroup.addChild(wing);
aircraftGroup.addChild(referenceLine2);
aircraftGroup.setRotationPoint(630, 370);
aircraftGroup.x = 0;
aircraftGroup.y = 0;

// Chart curves
computePolarPoints();

let liftCurve = new SplinePath(liftPoints, 0x2233ff, 2);
liftCurve.x = chartPosX;
liftCurve.y = chartPosY;

let dragCurve = new SplinePath(dragPoints, 0xff3300, 2);
dragCurve.x = chartPosX;
dragCurve.y = chartPosY;

let polarCurve = new SplinePath(polarPoints, 0x006600, 2);
polarCurve.x = chartPosX;
polarCurve.y = chartPosY;
polarCurve.visible = false;

// Coordinate system and axis tick labels
let coordinateSystem = new CoordinateSystem(
  150,
  250,
  250,
  150,
  0x444444,
  20,
  9,
  1,
);
coordinateSystem.x = chartPosX;
coordinateSystem.y = chartPosY;

let rightAxisRuler = new Ruler(
  "right",
  [5, 10, 15, 20],
  50,
  50,
  0x444444,
  1,
  10,
  21,
  0x444444,
  true,
  0,
  "",
);
rightAxisRuler.x = chartPosX;
rightAxisRuler.y = chartPosY;

let polarRightAxisRuler = new Ruler(
  "right",
  [0.2, 0.4],
  90,
  90,
  0x444444,
  1,
  10,
  21,
  0x444444,
  true,
  1,
  ",",
);
polarRightAxisRuler.x = chartPosX;
polarRightAxisRuler.y = chartPosY;
polarRightAxisRuler.visible = false;

let leftAxisRuler = new Ruler(
  "left",
  [-5, -10],
  50,
  50,
  0x444444,
  1,
  10,
  21,
  0x444444,
  true,
  0,
  "",
);
leftAxisRuler.x = chartPosX;
leftAxisRuler.y = chartPosY;

let polarLeftAxisRuler = new Ruler(
  "left",
  [0.2],
  90,
  90,
  0x444444,
  1,
  10,
  21,
  0x444444,
  true,
  1,
  ",",
);
polarLeftAxisRuler.x = chartPosX;
polarLeftAxisRuler.y = chartPosY;
polarLeftAxisRuler.visible = false;

let bottomAxisRuler = new Ruler(
  "bottom",
  [-0.5],
  90,
  90,
  0x444444,
  1,
  10,
  21,
  0x444444,
  true,
  1,
  ",",
);
bottomAxisRuler.x = chartPosX;
bottomAxisRuler.y = chartPosY;

let topAxisRuler = new Ruler(
  "top",
  [0.5, 1],
  90,
  90,
  0x444444,
  1,
  10,
  21,
  0x444444,
  true,
  1,
  ",",
);
topAxisRuler.x = chartPosX;
topAxisRuler.y = chartPosY;

// Axis labels for the normal diagram
let clAxisLabel = new Text("C<sub>L</sub>", "Arial", 22, 0x2233ff, "center");
clAxisLabel.x = chartPosX - 50;
clAxisLabel.y = chartPosY - 270;

let cdAxisLabel = new Text("C<sub>D</sub>", "Arial", 22, 0xff3300, "center");
cdAxisLabel.x = chartPosX - 50;
cdAxisLabel.y = chartPosY - 250;

// NEW: degree label for x-axis
let angleAxisLabel = new Text("Angle", "Arial", 22, 0x444444, "center");
angleAxisLabel.x = chartPosX + 160;
angleAxisLabel.y = chartPosY + 30;

// Axis labels for the polar diagram
let clPolarAxisLabel = new Text(
  "C<sub>L</sub>",
  "Arial",
  22,
  0x006600,
  "center",
);
clPolarAxisLabel.x = chartPosX - 50;
clPolarAxisLabel.y = chartPosY - 250;
clPolarAxisLabel.visible = false;

let cdPolarAxisLabel = new Text(
  "C<sub>D</sub>",
  "Arial",
  22,
  0x006600,
  "center",
);
cdPolarAxisLabel.x = chartPosX + 210;
cdPolarAxisLabel.y = chartPosY + 10;
cdPolarAxisLabel.visible = false;

// Create interactive handles for the lift curve
for (let i = 0; i < 4; i++) {
  let handle = new Circle(8, 0x2233ff);
  handle.x = chartPosX + liftPoints[i][0];
  handle.y = chartPosY + liftPoints[i][1];
  handle.setBorder(0x333333, 1);
  handle.setDragging(
    chartPosX + liftPoints[i][0],
    chartPosY - 200,
    chartPosX + liftPoints[i][0],
    chartPosY + 200,
  );
  liftHandles.push(handle);
}

// Create interactive handles for the drag curve
for (let i = 0; i < 4; i++) {
  let handle = new Circle(8, 0xff3300);
  handle.x = chartPosX + dragPoints[i][0];
  handle.y = chartPosY + dragPoints[i][1];
  handle.setBorder(0x333333, 1);
  handle.setDragging(
    chartPosX + dragPoints[i][0],
    chartPosY - 200,
    chartPosX + dragPoints[i][0],
    chartPosY + 200,
  );
  dragHandles.push(handle);
}

// Create handles for the polar diagram
for (let i = 0; i < polarPoints.length; i++) {
  let handle = new Circle(8, 0x006600);
  handle.x = chartPosX + polarPoints[i][0];
  handle.y = chartPosY + polarPoints[i][1];
  handle.setBorder(0x333333, 1);
  handle.visible = false;
  polarHandles.push(handle);
}

// Create PointLabels for the polar points
for (let i = 0; i < 4; i++) {
  let offsetX = -30 + (i / 3) * 30; // -30 .. 0
  let offsetY = 0 - (i / 3) * 30; // 0 .. -30

  let label = new PointLabel(
    chartPosX + polarPoints[i][0],
    chartPosY + polarPoints[i][1],
    pointLabelTexts[i],
    offsetX,
    offsetY,
  );
  label.setFontSize(16);
  label.visible = false;
  polarPointLabels.push(label);
}

// UI elements
let aoaSlider = new ButtonSlider(-10, 20, 0, 0.1, 50, 200, "");
aoaSlider.enableValueDisplay();
aoaSlider.x = 950;
aoaSlider.y = 50;
aoaSlider.setDisplayCommaType("comma"); // keeps decimal comma display as before

let aoaLabel = new Text("Angle of attack α", "Arial", 20, 0x444444, "left");
aoaLabel.x = 950;
aoaLabel.y = 20;

// Force arrows
let liftArrow = new Arrow(0, 0, 0, -200, 0x2233ff, 2, 26, 12);
liftArrow.x = 630;
liftArrow.y = 370;

let dragArrow = new Arrow(0, 0, -50, 0, 0xff3300, 2, 26, 12);
dragArrow.x = 630;
dragArrow.y = 370;

let resultantArrow = new Arrow(0, 0, -50, -200, 0x006600, 2, 30, 15);
resultantArrow.x = 630;
resultantArrow.y = 370;

let vectorRectangle = new Rectangle(50, 200, 0x006600);
vectorRectangle.x = 630;
vectorRectangle.y = 370;
vectorRectangle.setAlpha(0.2);

const angleLabel = new AngleLabel(
  630,
  370,
  630 - 30,
  370,
  630 + 50,
  370 - 50,
  100,
  "α",
  "Arial",
  20,
  0x444444,
  1,
  0x444444,
);

// Force labels
const liftForceLabel = new LineLabel(630, 370, 630, 170, "F<sub>L</sub>", 20);
liftForceLabel.setFontSize(20);
liftForceLabel.setTextColor(0x444444);
liftForceLabel.setFlipSide(true);

const dragForceLabel = new LineLabel(630, 370, 580, 370, "F<sub>D</sub>", 20);
dragForceLabel.setFontSize(20);
dragForceLabel.setTextColor(0x444444);
dragForceLabel.setFlipSide(true);

const resultantForceLabel = new LineLabel(
  630,
  370,
  580,
  170,
  "F<sub>res</sub>",
  20,
);
resultantForceLabel.setFontSize(20);
resultantForceLabel.setTextColor(0x444444);
resultantForceLabel.setFlipSide(false);

// Checkbox
let polarDiagramCheckbox = new Checkbox(
  false,
  20,
  "Polar diagram",
  "Arial",
  20,
);
polarDiagramCheckbox.x = 1000;
polarDiagramCheckbox.y = 200;

// Animation timer
let animationTimer = new Timer();
animationTimer.start();

// Create table
paramTable = new ParameterTable(
  [
    { name: "Airspeed [km/h] (100 – 1000)", value: 150 },
    { name: "Angle of attack (-10 – 20)", value: 0 },
    { name: "Mass [kg] (100 – 3000)", value: 750 },
  ],
  400,
  "Arial",
  14,
  0x333333,
);

// Set position
paramTable.x = 20;
paramTable.y = 540;

// Add title
paramTable.setTitle("System parameters");

// Set decimal separator to comma (visual formatting only)
paramTable.setDecimalSeparator(",");

// Set value limits
paramTable.setValueLimits("Airspeed [km/h] (100 – 1000)", 100, 1000);
paramTable.setValueLimits("Angle of attack (-10 – 20)", -10, 20);
paramTable.setValueLimits("Mass [kg] (100 – 3000)", 100, 3000);

// Set initial values
paramTable.setValue("Airspeed [km/h] (100 – 1000)", airspeedKmh);
paramTable.setValue("Mass [kg] (100 – 3000)", mass);

// ==================== SECTION 3: FUNCTIONS ====================

function computePolarPoints() {
  polarPoints = [];
  for (let i = 0; i < dragPoints.length && i < liftPoints.length; i++) {
    polarPoints.push([(-dragPoints[i][1] * 5) / 2, liftPoints[i][1]]);
  }
}

function updatePolarCurve() {
  computePolarPoints();
  polarCurve.setPoints(polarPoints);
  updatePolarHandles();
  updatePolarPointLabels();
}

function updatePolarHandles() {
  for (let i = 0; i < polarHandles.length && i < polarPoints.length; i++) {
    polarHandles[i].x = chartPosX + polarPoints[i][0];
    polarHandles[i].y = chartPosY + polarPoints[i][1];
  }
}

function updatePolarPointLabels() {
  for (let i = 0; i < polarPointLabels.length && i < polarPoints.length; i++) {
    polarPointLabels[i].setPoint(
      chartPosX + polarPoints[i][0],
      chartPosY + polarPoints[i][1],
    );
  }
}

function updateAngle(/* e */) {
  let aoaDeg = aoaSlider.value;

  // Convention here: rotating the aircraft group opposite to the slider sign
  aircraftGroup.rotation = -aoaDeg;

  // Sync with parameter table (if it exists)
  if (paramTable) {
    paramTable.setValue("Angle of attack (-10 – 20)", aoaDeg);
  }

  if (!showPolarDiagram) {
    liftCurve.markAt(aoaDeg * 10, 0x333333, 5);
    liftCurve.showGuideLines(aoaDeg * 10, 0x333333, 2);
    dragCurve.markAt(aoaDeg * 10, 0x333333, 5);
    dragCurve.showGuideLines(aoaDeg * 10, 0x333333, 2);
  } else {
    // Polar diagram: get Y values from both curves
    let liftY = liftCurve.getY(aoaDeg * 10);
    let dragY = dragCurve.getY(aoaDeg * 10);

    // Mark point in polar diagram
    polarCurve.markAtXY((-dragY * 5) / 2, liftY, 0x333333, 5);
    polarCurve.showGuideLinesAtXY((-dragY * 5) / 2, liftY, 0x333333, 2);
  }

  // Read coefficients from curves
  // Example: if liftCurve.getY(...) = -120 => C_L ~ 1.2
  let liftCoefficient = -liftCurve.getY(aoaDeg * 10) / 100;
  let dragCoefficient = -dragCurve.getY(aoaDeg * 10) / 100;

  // Aerodynamic forces: F = q * S * C
  // q = dynamic pressure, S = wing area, C = coefficient
  currentLiftForce = dynamicPressure * wingArea * liftCoefficient; // N
  currentDragForce = dynamicPressure * wingArea * dragCoefficient; // N

  // Arrow rendering (scaled for display)
  let displayScale = 0.01;
  let liftArrowLen = -currentLiftForce * displayScale;
  let dragArrowLen = -currentDragForce * displayScale;

  liftArrow.setEnd(0, liftArrowLen);
  dragArrow.setEnd(dragArrowLen, 0);

  // Update lift label geometry
  liftForceLabel.setStart(630, 370);
  liftForceLabel.setEnd(630, 370 + liftArrowLen);

  // Update drag label geometry
  dragForceLabel.setStart(630, 370);
  dragForceLabel.setEnd(630 + dragArrowLen, 370);

  let resultantX = dragArrowLen;
  let resultantY = liftArrowLen;

  resultantArrow.setEnd(resultantX, resultantY);

  // Update resultant label geometry
  resultantForceLabel.setStart(630, 370);
  resultantForceLabel.setEnd(630 + resultantX, 370 + resultantY);

  let rectW = Math.abs(dragArrowLen);
  let rectH = Math.abs(liftArrowLen);

  vectorRectangle.width = rectW;
  vectorRectangle.height = rectH;

  if (dragArrowLen >= 0 && liftArrowLen >= 0) {
    vectorRectangle.x = 630;
    vectorRectangle.y = 370;
  } else if (dragArrowLen < 0 && liftArrowLen >= 0) {
    vectorRectangle.x = 630 + dragArrowLen;
    vectorRectangle.y = 370;
  } else if (dragArrowLen >= 0 && liftArrowLen < 0) {
    vectorRectangle.x = 630;
    vectorRectangle.y = 370 + liftArrowLen;
  } else {
    vectorRectangle.x = 630 + dragArrowLen;
    vectorRectangle.y = 370 + liftArrowLen;
  }

  // Update angle arms
  // Arm 1: horizontal to the right
  angleLabel.setArm1(630 + 100, 370);

  // Arm 2: rotated by α (degrees -> radians)
  let aoaRad = (aoaDeg * Math.PI) / 180;
  let armLen = 100;
  angleLabel.setArm2(
    630 + armLen * Math.cos(aoaRad),
    370 - armLen * Math.sin(aoaRad),
  );

  updatePolarHandles();
  updatePolarPointLabels();
}

function updatePhysics() {
  // Update speed and dynamic pressure
  airspeedMs = airspeedKmh / 3.6;
  dynamicPressure = 0.5 * airDensity * airspeedMs * airspeedMs;

  // Recompute forces with the new values
  updateAngle();
}

function wrapCloud(cloud) {
  let cloudW = 250;
  let cloudH = 100;

  if (cloud.x > 1280 + cloudW) {
    cloud.x = -cloudW;
  } else if (cloud.x < -cloudW) {
    cloud.x = 1280 + cloudW;
  }

  if (cloud.y > 720 + cloudH) {
    cloud.y = -cloudH;
  } else if (cloud.y < -cloudH) {
    cloud.y = 720 + cloudH;
  }
}

// Drag handler for lift curve handles
function createLiftDragHandler(index) {
  return function () {
    liftPoints[index] = [
      liftHandles[index].x - chartPosX,
      liftHandles[index].y - chartPosY,
    ];
    liftCurve.setPoints(liftPoints);
    updatePolarCurve();
    updateAngle();
  };
}

// Drag handler for drag curve handles
function createDragDragHandler(index) {
  return function () {
    dragPoints[index] = [
      dragHandles[index].x - chartPosX,
      dragHandles[index].y - chartPosY,
    ];
    dragCurve.setPoints(dragPoints);
    updatePolarCurve();
    updateAngle();
  };
}

// Polar diagram checkbox handler
function polarDiagramCheckboxHandler(event) {
  showPolarDiagram = event.value;
  console.log("Checkbox state:", event.value);

  if (showPolarDiagram) {
    polarCurve.visible = true;

    for (let h of polarHandles) h.visible = true;

    // Show polar point labels
    for (let lbl of polarPointLabels) lbl.visible = true;

    polarRightAxisRuler.visible = true;
    polarLeftAxisRuler.visible = true;

    liftCurve.visible = false;
    dragCurve.visible = false;

    for (let h of liftHandles) h.visible = false;
    for (let h of dragHandles) h.visible = false;

    rightAxisRuler.visible = false;
    leftAxisRuler.visible = false;

    // Toggle axis labels
    clAxisLabel.visible = false;
    cdAxisLabel.visible = false;
    angleAxisLabel.visible = false;

    clPolarAxisLabel.visible = true;
    cdPolarAxisLabel.visible = true;
  } else {
    polarCurve.visible = false;

    for (let h of polarHandles) h.visible = false;

    // Hide polar point labels
    for (let lbl of polarPointLabels) lbl.visible = false;

    polarRightAxisRuler.visible = false;
    polarLeftAxisRuler.visible = false;

    liftCurve.visible = true;
    dragCurve.visible = true;

    for (let h of liftHandles) h.visible = true;
    for (let h of dragHandles) h.visible = true;

    rightAxisRuler.visible = true;
    leftAxisRuler.visible = true;

    // Toggle axis labels
    clAxisLabel.visible = true;
    cdAxisLabel.visible = true;
    angleAxisLabel.visible = true;

    clPolarAxisLabel.visible = false;
    cdPolarAxisLabel.visible = false;
  }

  updateAngle();
}

// Animation update handler
function animationUpdateHandler(/* progress */) {
  let now = Date.now();
  let dt = (now - lastTime) / 1000;
  lastTime = now;

  dt = Math.min(dt, 0.033);

  // Physics: a = F / m
  let ax = -currentDragForce / mass; // m/s²
  let ay = currentLiftForce / mass - 9.81; // m/s² (incl. gravity)

  // Integrate acceleration to relative velocity change
  let animationScale = 0.5;
  velocityDeltaX += ax * dt * animationScale;
  velocityDeltaY += ay * dt * animationScale;

  // Clamp relative velocity change
  let maxDelta = 10;
  velocityDeltaX = Math.max(-maxDelta, Math.min(maxDelta, velocityDeltaX));
  velocityDeltaY = Math.max(-maxDelta, Math.min(maxDelta, velocityDeltaY));

  // Base forward speed now derived from airspeedKmh
  let speedScalePx = 1.0; // tune for visuals
  let baseSpeedPx = airspeedKmh * speedScalePx;

  for (let i = 0; i < allClouds.length; i++) {
    let cloud = allClouds[i];
    // Clouds move LEFT for forward aircraft motion
    cloud.x -= (baseSpeedPx - velocityDeltaX * 60) * dt;
    cloud.y += velocityDeltaY * dt * 25;
    wrapCloud(cloud);
  }

  frameCounter++;
  debugCounter++;

  if (debugCounter >= 60) {
    let t = Date.now();
    let elapsed = (t - lastFpsUpdate) / 1000;
    currentFps = Math.round(frameCounter / elapsed);

    debugCounter = 0;
    frameCounter = 0;
    lastFpsUpdate = t;
  }
}

// Parameter table handler
function parameterTableHandler(event) {
  console.log("Parameter changed:", event.parameterName, "->", event.newValue);

  if (event.parameterName === "Mass [kg] (100 – 3000)") {
    mass = event.newValue;
    updatePhysics();
  } else if (event.parameterName === "Airspeed [km/h] (100 – 1000)") {
    airspeedKmh = event.newValue;
    updatePhysics();
  } else if (event.parameterName === "Angle of attack (-10 – 20)") {
    aoaSlider.setValue(event.newValue);
  }
}

// ==================== SECTION 4: EVENT LISTENERS ====================

// Slider onChange
aoaSlider.onChange(updateAngle);

// Drag handlers for lift handles
for (let i = 0; i < liftHandles.length; i++) {
  liftHandles[i].onDrag(createLiftDragHandler(i));
}

// Drag handlers for drag handles
for (let i = 0; i < dragHandles.length; i++) {
  dragHandles[i].onDrag(createDragDragHandler(i));
}

// Checkbox onClick
polarDiagramCheckbox.onClick(polarDiagramCheckboxHandler);

// Animation timer onUpdate
animationTimer.onUpdate(animationUpdateHandler);

// Parameter table onChange
paramTable.onChange(parameterTableHandler);

// Initial call
updateAngle();
