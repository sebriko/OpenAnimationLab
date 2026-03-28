// Created with Open Animation Lab
// Open Source – CC BY 4.0
// Free Fall & Projectile Motion – Trajectory with Velocity Vector Decomposition

// ==================== SECTION 1: VARIABLES ====================
let board = new Board(1280, 720, 0xe8e8e8);

// Physical constants
let g = 9.81; // m/s² gravitational acceleration

// Launch parameters
let launchAngleDeg = 45;
let launchSpeed = 20; // m/s
let launchHeight = 0;

// Scaling: pixels per meter
let scaling = 8; // px/m

// Coordinate origin (launch point on stage)
let originX = 190;
let originY = 580;

// Simulation time
let tMax = 0;
let timeStep = 0.02;
let currentTime = 0;
let isPlaying = false;
let animationSpeed = 1.0;

// Calculated values
let v0x = 0;
let v0y = 0;
let range = 0;
let maxHeight = 0;
let flightTime = 0;

// Trajectory points
let trajectoryPoints = [];

// Colors
let colorBackground = 0xaad4ff;
let colorGround = 0x88bb66;
let colorGroundDark = 0x6b9950;
let colorTrajectory = 0x888888;
let colorTotal = 0x333333;
let colorHorizontal = 0x2233ff;
let colorVertical = 0xff3300;
let colorObject = 0xff6600;

// ==================== SECTION 2: OBJECTS ====================

// --- Background ---
let sky = new Rectangle(1280, 720, colorBackground);
sky.x = 0;
sky.y = 0;

// Ground
let ground = new Rectangle(1280, 150, colorGround);
ground.x = 0;
ground.y = originY;

let groundLine = new Line(0, originY, 1280, originY, colorGroundDark, 2);

// --- Coordinate system ---
let coordinateSystem = new CoordinateSystem(
  0,
  1000,
  540,
  0,
  0x666666,
  20,
  10,
  1,
);
coordinateSystem.x = originX;
coordinateSystem.y = originY;

// Axis labels
let xAxisLabel = new Text("x [m]", "Arial", 20, 0x444444, "left");
xAxisLabel.x = originX + 1010;
xAxisLabel.y = originY + 5;

let yAxisLabel = new Text("y [m]", "Arial", 20, 0x444444, "left");
yAxisLabel.x = originX - 75;
yAxisLabel.y = originY - 550;

// Tick marks X-axis
let xTickMarks = new Ruler(
  "right",
  [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
  scaling * 10,
  0,
  0x666666,
  1,
  8,
  20,
  0x444444,
  true,
  0,
  "",
);
xTickMarks.x = originX;
xTickMarks.y = originY;

// Tick marks Y-axis
let yTickMarks = new Ruler(
  "top",
  [10, 20, 30, 40, 50, 60, 70],
  scaling * 10,
  0,
  0x666666,
  1,
  8,
  20,
  0x444444,
  true,
  0,
  "",
);
yTickMarks.x = originX;
yTickMarks.y = originY;

// --- Trajectory ---
let trajectory = new LinePath(
  [
    [0, 0],
    [1, 0],
  ],
  colorTrajectory,
  2,
);
trajectory.x = originX;
trajectory.y = originY;

// Dashed guide lines
let heightLine = new Line(0, 0, 100, 0, 0x999999, 1);
heightLine.setStrokeDash([5, 5]);
heightLine.visible = false;

let rangeLine = new Line(0, 0, 0, 100, 0x999999, 1);
rangeLine.setStrokeDash([5, 5]);
rangeLine.visible = false;

// --- Projectile (Ball) ---
let ball = new Circle(12, colorObject);
ball.x = originX;
ball.y = originY;
ball.setBorder(0x333333, 1);

// --- Velocity vectors ---
let vectorScaling = 8;

// Total velocity v
let arrowTotal = new Arrow(0, 0, 100, -100, colorTotal, 2, 14, 8);
arrowTotal.x = originX;
arrowTotal.y = originY;

// Horizontal component vx
let arrowHorizontal = new Arrow(0, 0, 100, 0, colorHorizontal, 2, 12, 7);
arrowHorizontal.x = originX;
arrowHorizontal.y = originY;

// Vertical component vy
let arrowVertical = new Arrow(0, 0, 0, -100, colorVertical, 2, 12, 7);
arrowVertical.x = originX;
arrowVertical.y = originY;

// Vector rectangle (force parallelogram)
let vectorRectangle = new Rectangle(100, 100, colorTotal);
vectorRectangle.x = originX;
vectorRectangle.y = originY;
vectorRectangle.setAlpha(0.1);

// --- Vector labels ---
let labelV = new LineLabel(0, 0, 100, -100, "v", 20);
labelV.setFontSize(20);
labelV.setTextColor(colorTotal);

let labelVx = new LineLabel(0, 0, 100, 0, "v<sub>x</sub>", 15);
labelVx.setFontSize(20);
labelVx.setTextColor(colorHorizontal);

let labelVy = new LineLabel(0, 0, 0, -100, "v<sub>y</sub>", 15);
labelVy.setFontSize(20);
labelVy.setTextColor(colorVertical);
labelVy.setFlipSide(true);

// Angle marker
let angleArc = new AngleLabel(
  originX,
  originY,
  originX + 100,
  originY,
  originX + 70,
  originY - 70,
  50,
  "α",
  "Arial",
  20,
  0x444444,
  1,
  0x444444,
);

// --- UI elements ---

// Mode selection (positioned at top)
let modeFreeFall = new RadioButton(
  "mode",
  false,
  20,
  "Free Fall (α = 0°, only v<sub>y</sub>)",
  "Arial",
  20,
  0x444444,
);
modeFreeFall.x = 600;
modeFreeFall.y = 20;

let modeHorizontalThrow = new RadioButton(
  "mode",
  false,
  20,
  "Horizontal Throw (α = 0°)",
  "Arial",
  20,
  0x444444,
);
modeHorizontalThrow.x = 600;
modeHorizontalThrow.y = 60;

let modeProjectileMotion = new RadioButton(
  "mode",
  true,
  20,
  "Projectile Motion (adjustable)",
  "Arial",
  20,
  0x444444,
);
modeProjectileMotion.x = 600;
modeProjectileMotion.y = 100;

let modeVerticalThrow = new RadioButton(
  "mode",
  false,
  20,
  "Vertical Throw (α = 90°)",
  "Arial",
  20,
  0x444444,
);
modeVerticalThrow.x = 600;
modeVerticalThrow.y = 140;

// Launch angle slider
let angleLabel = new Text(
  "Launch angle α in degrees",
  "Arial",
  20,
  0x444444,
  "left",
);
angleLabel.x = 950;
angleLabel.y = 20;

let angleSlider = new ButtonSlider(0, 90, launchAngleDeg, 1, 50, 200, "°");
angleSlider.enableValueDisplay();
angleSlider.x = 950;
angleSlider.y = 50;

// Launch speed slider
let speedLabel = new Text(
  "Speed v<sub>0</sub> in m/s",
  "Arial",
  20,
  0x444444,
  "left",
);
speedLabel.x = 950;
speedLabel.y = 120;

let speedSlider = new ButtonSlider(1, 40, launchSpeed, 0.5, 50, 200, " m/s");
speedSlider.enableValueDisplay();
speedSlider.x = 950;
speedSlider.y = 150;

// Time slider
let timeLabel = new Text("Time t in s", "Arial", 20, 0x444444, "left");
timeLabel.x = 950;
timeLabel.y = 220;

let timeSlider = new ButtonSlider(0, 5, 0, 0.01, 50, 200, "triangle-A");
timeSlider.enableValueDisplay();
timeSlider.setDisplayCommaType("dot");
timeSlider.x = 950;
timeSlider.y = 250;

// Play/Pause button
let playButton = new Button("Play", 100, 35, "Arial", 20);
playButton.x = 620;
playButton.y = 200;

// Reset button
let resetButton = new Button("Reset", 100, 35, "Arial", 20);
resetButton.x = 740;
resetButton.y = 200;

// Timer for animation
let animTimer = new Timer();

// ==================== SECTION 3: FUNCTIONS ====================

function calculatePhysics() {
  let angleRad = (launchAngleDeg * Math.PI) / 180;
  v0x = launchSpeed * Math.cos(angleRad);
  v0y = launchSpeed * Math.sin(angleRad);

  // Flight time until y = 0
  flightTime = (v0y + Math.sqrt(v0y * v0y + 2 * g * launchHeight)) / g;

  // Range
  range = v0x * flightTime;

  // Maximum height
  let tMaxHeight = v0y / g;
  maxHeight =
    launchHeight + v0y * tMaxHeight - 0.5 * g * tMaxHeight * tMaxHeight;
  if (maxHeight < 0) maxHeight = 0;

  tMax = flightTime;
}

function calculateTrajectory() {
  trajectoryPoints = [];
  let steps = 200;
  let dt = tMax / steps;

  for (let i = 0; i <= steps; i++) {
    let t = i * dt;
    let x = v0x * t;
    let y = launchHeight + v0y * t - 0.5 * g * t * t;

    if (y < 0) {
      let tImpact = tMax;
      let xEnd = v0x * tImpact;
      trajectoryPoints.push([xEnd * scaling, 0]);
      break;
    }

    trajectoryPoints.push([x * scaling, -y * scaling]);
  }

  if (trajectoryPoints.length < 2) {
    trajectoryPoints = [
      [0, 0],
      [1, 0],
    ];
  }

  trajectory.setPoints(trajectoryPoints);
}

function updatePosition(t) {
  if (t > tMax) t = tMax;
  if (t < 0) t = 0;

  currentTime = t;

  // Calculate position
  let x = v0x * t;
  let y = launchHeight + v0y * t - 0.5 * g * t * t;
  if (y < 0) y = 0;

  // Velocity components
  let vx = v0x;
  let vy = v0y - g * t;

  // Ball position (pixels)
  let ballPxX = originX + x * scaling;
  let ballPxY = originY - y * scaling;

  ball.x = ballPxX;
  ball.y = ballPxY;

  // Vectors (pixels)
  let vxPx = vx * vectorScaling;
  let vyPx = -vy * vectorScaling;

  // Check if angle is 90° (purely vertical motion)
  let isVertical = launchAngleDeg === 90;

  // Total vector
  arrowTotal.x = ballPxX;
  arrowTotal.y = ballPxY;
  arrowTotal.setEnd(vxPx, vyPx);

  // Horizontal component – hide at 90°
  arrowHorizontal.visible = !isVertical;
  arrowHorizontal.x = ballPxX;
  arrowHorizontal.y = ballPxY;
  arrowHorizontal.setEnd(vxPx, 0);

  // Vertical component – start directly at ball for 90°
  if (isVertical) {
    arrowVertical.x = ballPxX;
  } else {
    arrowVertical.x = ballPxX + vxPx;
  }
  arrowVertical.y = ballPxY;
  arrowVertical.setEnd(0, vyPx);

  // Vector rectangle – hide at 90°
  vectorRectangle.visible = !isVertical;
  let rectW = Math.abs(vxPx);
  let rectH = Math.abs(vyPx);
  vectorRectangle.setWidth(Math.max(rectW, 1));
  vectorRectangle.setHeight(Math.max(rectH, 1));

  if (vyPx < 0) {
    vectorRectangle.x = ballPxX;
    vectorRectangle.y = ballPxY + vyPx;
  } else {
    vectorRectangle.x = ballPxX;
    vectorRectangle.y = ballPxY;
  }

  // Update labels
  labelV.setStart(ballPxX, ballPxY);
  labelV.setEnd(ballPxX + vxPx, ballPxY + vyPx);

  // vx label – hide at 90°
  labelVx.visible = !isVertical;
  labelVx.setStart(ballPxX, ballPxY);
  labelVx.setEnd(ballPxX + vxPx, ballPxY);

  // vy label – adjust FlipSide at 90° (since directly at ball)
  if (isVertical) {
    labelVy.setStart(ballPxX, ballPxY);
    labelVy.setEnd(ballPxX, ballPxY + vyPx);
  } else {
    labelVy.setStart(ballPxX + vxPx, ballPxY);
    labelVy.setEnd(ballPxX + vxPx, ballPxY + vyPx);
  }

  // Angle arc – hide at 90°
  angleArc.visible = !isVertical;
  let armLength = 50;
  angleArc.setCenter(ballPxX, ballPxY);
  angleArc.setArm1(ballPxX + armLength, ballPxY);
  angleArc.setArm2(ballPxX + vxPx, ballPxY + vyPx);

  // Guide lines
  if (maxHeight > 0.1) {
    let maxHeightPx = maxHeight * scaling;
    let tMaxH = v0y / g;
    let xAtMaxH = v0x * tMaxH;

    heightLine.setStart(originX, originY - maxHeightPx);
    heightLine.setEnd(originX + xAtMaxH * scaling, originY - maxHeightPx);
    heightLine.visible = true;
  } else {
    heightLine.visible = false;
  }

  if (range > 0.1) {
    rangeLine.setStart(originX + range * scaling, originY);
    rangeLine.setEnd(originX + range * scaling, originY - maxHeight * scaling);
    rangeLine.visible = true;
  } else {
    rangeLine.visible = false;
  }

  // Synchronize slider
  timeSlider.setValue(Math.min(t, 5));
}

function updateAll() {
  calculatePhysics();
  calculateTrajectory();
  updatePosition(currentTime);
}

// ==================== Event handlers ====================

function onAngleSliderChange(e) {
  launchAngleDeg = e.value;
  currentTime = 0;
  updateAll();
}

function onSpeedSliderChange(e) {
  launchSpeed = e.value;
  currentTime = 0;
  updateAll();
}

function onTimeSliderChange(e) {
  currentTime = e.value;
  if (currentTime > tMax) currentTime = tMax;
  updatePosition(currentTime);
}

function onPlayClick() {
  if (isPlaying) {
    animTimer.pause();
    playButton.setText("Play");
    isPlaying = false;
  } else {
    if (currentTime >= tMax - 0.01) {
      currentTime = 0;
    }
    animTimer.start();
    playButton.setText("Pause");
    isPlaying = true;
  }
}

function onResetClick() {
  animTimer.pause();
  playButton.setText("Play");
  isPlaying = false;
  currentTime = 0;
  updateAll();
}

function onTimerUpdate(progress) {
  if (!isPlaying) return;

  currentTime += timeStep * animationSpeed;

  if (currentTime >= tMax) {
    currentTime = tMax;
    animTimer.pause();
    playButton.setText("Play");
    isPlaying = false;
  }

  updatePosition(currentTime);
}

// Mode handlers
function onModeFreeFall() {
  launchHeight = 30;
  launchAngleDeg = 90;
  launchSpeed = 0.1;
  angleSlider.setValue(90);
  speedSlider.setValue(0.1);
  currentTime = 0;
  updateAll();
}

function onModeHorizontalThrow() {
  launchHeight = 30;
  launchAngleDeg = 0;
  launchSpeed = 20;
  angleSlider.setValue(0);
  speedSlider.setValue(20);
  currentTime = 0;
  updateAll();
}

function onModeProjectileMotion() {
  launchHeight = 0;
  launchAngleDeg = 45;
  launchSpeed = 20;
  angleSlider.setValue(45);
  speedSlider.setValue(20);
  currentTime = 0;
  updateAll();
}

function onModeVerticalThrow() {
  launchHeight = 0;
  launchAngleDeg = 90;
  launchSpeed = 20;
  angleSlider.setValue(90);
  speedSlider.setValue(20);
  currentTime = 0;
  updateAll();
}

// ==================== SECTION 4: EVENT LISTENERS ====================

angleSlider.onChange(onAngleSliderChange);
speedSlider.onChange(onSpeedSliderChange);
timeSlider.onChange(onTimeSliderChange);
playButton.onClick(onPlayClick);
resetButton.onClick(onResetClick);
animTimer.onUpdate(onTimerUpdate);

modeFreeFall.onClick(onModeFreeFall);
modeHorizontalThrow.onClick(onModeHorizontalThrow);
modeProjectileMotion.onClick(onModeProjectileMotion);
modeVerticalThrow.onClick(onModeVerticalThrow);

// Initial call
updateAll();
