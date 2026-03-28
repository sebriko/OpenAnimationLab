// Created with Open Animation Lab
// ═══════════════════════════════════════════════════════════════════
// DOUBLE PENDULUM - CHAOTIC OSCILLATIONS
// Interactive simulation of a double pendulum with phase diagram
// ═══════════════════════════════════════════════════════════════════
// Open Source – CC BY 4.0

let board = new Board(1280, 720);

// ───────────────────────────────────────────────────────────────────
// COLOR PALETTE
// ───────────────────────────────────────────────────────────────────

const colors = {
  bg: 0xf5f5f5,
  dark: 0x333333,
  white: 0xffffff,
  grid: 0xcccccc,
  arm1: 0x0066cc, // Blue for first link
  arm2: 0xcc3300, // Red for second link
  mass1: 0x0055aa, // Dark blue for first mass
  mass2: 0xaa2200, // Dark red for second mass
  pivot: 0x444444, // Gray for pivot point
  trail: 0x666666, // Gray for trail
  grabHandle: 0x88cc88, // Green for grab handles
};

// ───────────────────────────────────────────────────────────────────
// PHYSICAL PARAMETERS
// ───────────────────────────────────────────────────────────────────

// Pendulum lengths (in pixels for display)
let L1 = 150; // Length of first link
let L2 = 150; // Length of second link

// Masses (in kg - affects dynamics)
let m1 = 2.0; // Mass at end of link 1
let m2 = 2.0; // Mass at end of link 2

// Gravitational constant (scaled for visual representation)
let g = 500; // Gravity in pixels/s²

// Damping
let damping = 0.0; // Damping factor (0 = no damping)

// Angles (in radians) - measured from vertical
// V-shape: First pendulum 45° down-right, second 45° up-right
let theta1 = Math.PI / 4; // Angle of first link (45° down-right)
let theta2 = (3 * Math.PI) / 4; // Angle of second link (135° = points up-right for V-shape)

// Angular velocities
let omega1 = 0; // Angular velocity link 1
let omega2 = 0; // Angular velocity link 2

// Pivot point
let pivotX = 340;
let pivotY = 370;

// Simulation state
let isRunning = false;
let isDragging = false;
let dragTarget = null; // 'mass1', 'mass2', 'arm1', 'arm2'
let dragOffset = { x: 0, y: 0 };

// Time step for simulation
let dt = 1 / 60;
let time = 0;

// Curve data for diagram
let maxDataPoints = 600; // 10 seconds at 60 fps
let theta1History = [];
let theta2History = [];
let timeHistory = [];

// Trail of second pendulum
let trailPoints = [];
let maxTrailPoints = 500;

// Store initial values for reset
let initialTheta1 = theta1;
let initialTheta2 = theta2;

// ───────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ───────────────────────────────────────────────────────────────────

// Formats a number with specified decimals
function formatNumber(value, decimals) {
  return value.toFixed(decimals);
}

// Convert angle to degrees
function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

// Normalize angle to -π to π
function normalizeAngle(angle) {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

// Calculate positions of masses
function calculatePositions() {
  let x1 = pivotX + L1 * Math.sin(theta1);
  let y1 = pivotY + L1 * Math.cos(theta1);

  let x2 = x1 + L2 * Math.sin(theta2);
  let y2 = y1 + L2 * Math.cos(theta2);

  return { x1, y1, x2, y2 };
}

// Calculate angular accelerations using Lagrange equations
function calculateAccelerations() {
  let M = m1 + m2;
  let cosD = Math.cos(theta1 - theta2);
  let sinD = Math.sin(theta1 - theta2);

  // Denominator of equations
  let denom = M * L1 - m2 * L1 * cosD * cosD;

  // Acceleration for theta1
  let alpha1 =
    (m2 * L1 * omega1 * omega1 * sinD * cosD +
      m2 * g * Math.sin(theta2) * cosD +
      m2 * L2 * omega2 * omega2 * sinD -
      M * g * Math.sin(theta1)) /
    denom;

  // Acceleration for theta2
  let alpha2 =
    (-m2 * L2 * omega2 * omega2 * sinD * cosD +
      M * g * Math.sin(theta1) * cosD -
      M * L1 * omega1 * omega1 * sinD -
      M * g * Math.sin(theta2)) /
    ((L2 * denom) / L1);

  // Add damping
  alpha1 -= damping * omega1;
  alpha2 -= damping * omega2;

  return { alpha1, alpha2 };
}

// Runge-Kutta 4th order for better accuracy
function rungeKuttaStep(dt) {
  // State: [theta1, omega1, theta2, omega2]

  function derivatives(th1, om1, th2, om2) {
    let M = m1 + m2;
    let cosD = Math.cos(th1 - th2);
    let sinD = Math.sin(th1 - th2);

    let denom = M * L1 - m2 * L1 * cosD * cosD;

    let alpha1 =
      (m2 * L1 * om1 * om1 * sinD * cosD +
        m2 * g * Math.sin(th2) * cosD +
        m2 * L2 * om2 * om2 * sinD -
        M * g * Math.sin(th1)) /
      denom;

    let alpha2 =
      (-m2 * L2 * om2 * om2 * sinD * cosD +
        M * g * Math.sin(th1) * cosD -
        M * L1 * om1 * om1 * sinD -
        M * g * Math.sin(th2)) /
      ((L2 * denom) / L1);

    alpha1 -= damping * om1;
    alpha2 -= damping * om2;

    return { dth1: om1, dom1: alpha1, dth2: om2, dom2: alpha2 };
  }

  // k1
  let k1 = derivatives(theta1, omega1, theta2, omega2);

  // k2
  let k2 = derivatives(
    theta1 + 0.5 * dt * k1.dth1,
    omega1 + 0.5 * dt * k1.dom1,
    theta2 + 0.5 * dt * k1.dth2,
    omega2 + 0.5 * dt * k1.dom2,
  );

  // k3
  let k3 = derivatives(
    theta1 + 0.5 * dt * k2.dth1,
    omega1 + 0.5 * dt * k2.dom1,
    theta2 + 0.5 * dt * k2.dth2,
    omega2 + 0.5 * dt * k2.dom2,
  );

  // k4
  let k4 = derivatives(
    theta1 + dt * k3.dth1,
    omega1 + dt * k3.dom1,
    theta2 + dt * k3.dth2,
    omega2 + dt * k3.dom2,
  );

  // Update
  theta1 += (dt * (k1.dth1 + 2 * k2.dth1 + 2 * k3.dth1 + k4.dth1)) / 6;
  omega1 += (dt * (k1.dom1 + 2 * k2.dom1 + 2 * k3.dom1 + k4.dom1)) / 6;
  theta2 += (dt * (k1.dth2 + 2 * k2.dth2 + 2 * k3.dth2 + k4.dth2)) / 6;
  omega2 += (dt * (k1.dom2 + 2 * k2.dom2 + 2 * k3.dom2 + k4.dom2)) / 6;
}

// ───────────────────────────────────────────────────────────────────
// CONTROLS: SLIDERS (TOP ROW)
// ───────────────────────────────────────────────────────────────────

let sliderY = 20;
let sliderWidth = 160;
let sliderSpacing = 200;
let sliderStartX = 40;

// Length 1
let labelL1 = new Text("L<sub>1</sub>:", "Arial", 20, colors.dark, "left");
labelL1.x = sliderStartX;
labelL1.y = sliderY - 3;

let valueL1 = new Text("150 px", "Arial", 20, colors.dark, "left");
valueL1.x = sliderStartX;
valueL1.y = sliderY + 80;

let sliderL1 = new ButtonSlider(50, 200, 150, 10, 50, sliderWidth);
sliderL1.x = sliderStartX;
sliderL1.y = sliderY + 25;

sliderL1.onChange(function (e) {
  L1 = e.value;
  valueL1.setText(formatNumber(L1, 0) + " px");
  if (!isRunning) updateDisplay();
});

// Length 2
let labelL2 = new Text("L<sub>2</sub>:", "Arial", 20, colors.dark, "left");
labelL2.x = sliderStartX + sliderSpacing;
labelL2.y = sliderY - 3;

let valueL2 = new Text("150 px", "Arial", 20, colors.dark, "left");
valueL2.x = sliderStartX + sliderSpacing;
valueL2.y = sliderY + 80;

let sliderL2 = new ButtonSlider(50, 200, 150, 10, 50, sliderWidth);
sliderL2.x = sliderStartX + sliderSpacing;
sliderL2.y = sliderY + 25;

sliderL2.onChange(function (e) {
  L2 = e.value;
  valueL2.setText(formatNumber(L2, 0) + " px");
  if (!isRunning) updateDisplay();
});

// Mass 1
let labelM1 = new Text("m<sub>1</sub>:", "Arial", 20, colors.dark, "left");
labelM1.x = sliderStartX + 2 * sliderSpacing;
labelM1.y = sliderY - 3;

let valueM1 = new Text("2.0 kg", "Arial", 20, colors.dark, "left");
valueM1.x = sliderStartX + 2 * sliderSpacing;
valueM1.y = sliderY + 80;

let sliderM1 = new ButtonSlider(0.5, 5, 2, 0.5, 50, sliderWidth);
sliderM1.x = sliderStartX + 2 * sliderSpacing;
sliderM1.y = sliderY + 25;

sliderM1.onChange(function (e) {
  m1 = e.value;
  valueM1.setText(formatNumber(m1, 1) + " kg");
});

// Mass 2
let labelM2 = new Text("m<sub>2</sub>:", "Arial", 20, colors.dark, "left");
labelM2.x = sliderStartX + 3 * sliderSpacing;
labelM2.y = sliderY - 3;

let valueM2 = new Text("2.0 kg", "Arial", 20, colors.dark, "left");
valueM2.x = sliderStartX + 3 * sliderSpacing;
valueM2.y = sliderY + 80;

let sliderM2 = new ButtonSlider(0.5, 5, 2, 0.5, 50, sliderWidth);
sliderM2.x = sliderStartX + 3 * sliderSpacing;
sliderM2.y = sliderY + 25;

sliderM2.onChange(function (e) {
  m2 = e.value;
  valueM2.setText(formatNumber(m2, 1) + " kg");
});

// Gravity
let labelG = new Text("g:", "Arial", 20, colors.dark, "left");
labelG.x = sliderStartX + 4 * sliderSpacing;
labelG.y = sliderY - 3;

let valueG = new Text("500 px/s²", "Arial", 20, colors.dark, "left");
valueG.x = sliderStartX + 4 * sliderSpacing;
valueG.y = sliderY + 80;

let sliderG = new ButtonSlider(100, 1000, 500, 50, 50, sliderWidth);
sliderG.x = sliderStartX + 4 * sliderSpacing;
sliderG.y = sliderY + 25;

sliderG.onChange(function (e) {
  g = e.value;
  valueG.setText(formatNumber(g, 0) + " px/s²");
});

// Damping
let labelDamp = new Text("Damping:", "Arial", 20, colors.dark, "left");
labelDamp.x = sliderStartX + 5 * sliderSpacing;
labelDamp.y = sliderY - 3;

let valueDamp = new Text("0.0", "Arial", 20, colors.dark, "left");
valueDamp.x = sliderStartX + 5 * sliderSpacing;
valueDamp.y = sliderY + 80;

let sliderDamp = new ButtonSlider(0, 2, 0, 0.1, 50, sliderWidth);
sliderDamp.x = sliderStartX + 5 * sliderSpacing;
sliderDamp.y = sliderY + 25;

sliderDamp.onChange(function (e) {
  damping = e.value;
  valueDamp.setText(formatNumber(damping, 1));
});

// ───────────────────────────────────────────────────────────────────
// AREA 1: PENDULUM VISUALIZATION (left)
// ───────────────────────────────────────────────────────────────────

// Pivot point
let pivotCircle = new Circle(8, colors.pivot);
pivotCircle.x = pivotX;
pivotCircle.y = pivotY;

// Mount (ceiling)
let ceiling = new Rectangle(200, 10, colors.dark);
ceiling.x = pivotX - 100;
ceiling.y = pivotY - 50;

let ceilingLine = new Line(pivotX, pivotY - 40, pivotX, pivotY, colors.dark, 2);

// First pendulum link (rod)
let arm1 = new Line(pivotX, pivotY, pivotX, pivotY + L1, colors.arm1, 4);

// First mass
let mass1Circle = new Circle(20, colors.mass1);
mass1Circle.setBorder(colors.dark, 2);

// Second pendulum link (rod)
let arm2 = new Line(0, 0, 0, 0, colors.arm2, 4);

// Second mass
let mass2Circle = new Circle(20, colors.mass2);
mass2Circle.setBorder(colors.dark, 2);

// Trail of second mass
let trail = new LinePath(
  [
    [0, 0],
    [1, 1],
  ],
  colors.trail,
  1,
);
trail.setAlpha(0.5);

// Angle markers
// Vertical reference line for theta1 (dashed)
let refLine1 = new Line(pivotX, pivotY, pivotX, pivotY + 80, colors.grid, 1);
refLine1.setStrokeDash([4, 4]);

// Angle theta1 (from vertical to first link)
let angleLabel1 = new AngleLabel(
  pivotX,
  pivotY, // Center
  pivotX,
  pivotY + 60, // Arm 1 (vertical down)
  pivotX + 60,
  pivotY, // Arm 2 (set dynamically)
  35, // Radius
  "θ₁", // Label
  "Arial",
  20,
  colors.arm1, // Font
  1,
  colors.arm1, // Line
);

// Vertical reference line for theta2 (dashed, positioned dynamically)
let refLine2 = new Line(0, 0, 0, 80, colors.grid, 1);
refLine2.setStrokeDash([4, 4]);

// Angle theta2 (from vertical to second link)
let angleLabel2 = new AngleLabel(
  0,
  0, // Center (set dynamically)
  0,
  60, // Arm 1 (vertical down)
  60,
  0, // Arm 2 (set dynamically)
  35, // Radius
  "θ₂", // Label
  "Arial",
  20,
  colors.arm2, // Font
  1,
  colors.arm2, // Line
);

// Invisible larger circles for better grabbing
let grabArea1 = new Circle(35, 0x000000);
grabArea1.setAlpha(0.0);

let grabArea2 = new Circle(35, 0x000000);
grabArea2.setAlpha(0.0);

// ───────────────────────────────────────────────────────────────────
// AREA 2: ANGLE-TIME DIAGRAM (right, narrower)
// ───────────────────────────────────────────────────────────────────

let graphX = 770;
let graphY = 350;
let graphWidth = 400;
let graphHeight = 280;

// Coordinate system
let coordSystem = new CoordinateSystem(
  0,
  graphWidth + 20,
  graphHeight / 2,
  graphHeight / 2,
  colors.dark,
  10,
  6,
  1,
);
coordSystem.x = graphX;
coordSystem.y = graphY;

// Axis labels
let labelT = new Text("t (s)", "Arial", 20, colors.dark, "left");
labelT.x = graphX + graphWidth + 10;
labelT.y = graphY - 5;

let labelTheta = new Text("θ (°)", "Arial", 20, colors.dark, "left");
labelTheta.x = graphX - 60;
labelTheta.y = graphY - graphHeight / 2 - 35;

// Y-axis scale labels
let labelPlus180 = new Text("+180°", "Arial", 20, colors.dark, "right");
labelPlus180.x = graphX - 80;
labelPlus180.y = graphY - graphHeight / 2;

let labelMinus180 = new Text("-180°", "Arial", 20, colors.dark, "right");
labelMinus180.x = graphX - 80;
labelMinus180.y = graphY + graphHeight / 2 - 35;

let label0 = new Text("0°", "Arial", 20, colors.dark, "right");
label0.x = graphX - 40;
label0.y = graphY - 20;

// Curve for theta1
let curveTheta1 = new LinePath([[0, 0]], colors.arm1, 2);
curveTheta1.x = graphX;
curveTheta1.y = graphY;

// Curve for theta2
let curveTheta2 = new LinePath([[0, 0]], colors.arm2, 2);
curveTheta2.x = graphX;
curveTheta2.y = graphY;

// ───────────────────────────────────────────────────────────────────
// CURRENT VALUES DISPLAY (new layout: angle and omega side by side)
// ───────────────────────────────────────────────────────────────────

let infoX = 700;
let infoY = 570;
let omegaOffsetX = 150;

let infoTitle = new Text("Current Values:", "Arial", 20, colors.dark, "left");
infoTitle.x = infoX;
infoTitle.y = infoY;

let infoTime = new Text("t = 0.00 s", "Arial", 20, colors.dark, "left");
infoTime.x = infoX;
infoTime.y = infoY + 30;

// Row 1: θ₁ and ω₁ side by side
let infoTheta1 = new Text("θ₁ = 45.0°", "Arial", 20, colors.arm1, "left");
infoTheta1.x = infoX;
infoTheta1.y = infoY + 55;

let infoOmega1 = new Text("ω₁ = 0.00 rad/s", "Arial", 20, colors.arm1, "left");
infoOmega1.x = infoX + omegaOffsetX;
infoOmega1.y = infoY + 55;

// Row 2: θ₂ and ω₂ side by side
let infoTheta2 = new Text("θ₂ = 135.0°", "Arial", 20, colors.arm2, "left");
infoTheta2.x = infoX;
infoTheta2.y = infoY + 80;

let infoOmega2 = new Text("ω₂ = 0.00 rad/s", "Arial", 20, colors.arm2, "left");
infoOmega2.x = infoX + omegaOffsetX;
infoOmega2.y = infoY + 80;

// ───────────────────────────────────────────────────────────────────
// BUTTONS
// ───────────────────────────────────────────────────────────────────

let playButton = new Button("Start", 100, 40, "Arial", 20);
playButton.x = 1280 - 220 - 20;
playButton.y = 720 - 40 - 30;

playButton.onClick(function () {
  if (!isDragging) {
    isRunning = !isRunning;
    playButton.setText(isRunning ? "Pause" : "Start");
    if (isRunning) {
      timer.start();
    }
  }
});

let resetButton = new Button("Reset", 100, 40, "Arial", 20);
resetButton.x = 1280 - 110 - 20;
resetButton.y = 720 - 40 - 30;

resetButton.onClick(function () {
  resetSimulation();
});

// ───────────────────────────────────────────────────────────────────
// MOUSE INTERACTION
// ───────────────────────────────────────────────────────────────────

// Function to calculate angle from mouse position relative to pivot
function calculateAngleFromMouse(mouseX, mouseY, pivotPosX, pivotPosY) {
  let dx = mouseX - pivotPosX;
  let dy = mouseY - pivotPosY;
  return Math.atan2(dx, dy); // Angle from vertical
}

// Dragging for first mass with setDragging
grabArea1.setDragging(0, 0, 1280, 720);

grabArea1.onDragStart(function () {
  if (!isRunning) {
    isDragging = true;
    dragTarget = "mass1";
    playButton.setText("Start");
  }
});

grabArea1.onDrag(function () {
  if (isDragging && dragTarget === "mass1") {
    // Calculate angle from current grab area position
    theta1 = calculateAngleFromMouse(grabArea1.x, grabArea1.y, pivotX, pivotY);
    omega1 = 0;
    omega2 = 0;
    updateDisplay();
  }
});

grabArea1.onDragEnd(function () {
  isDragging = false;
  dragTarget = null;
});

// Dragging for second mass with setDragging
grabArea2.setDragging(0, 0, 1280, 720);

grabArea2.onDragStart(function () {
  if (!isRunning) {
    isDragging = true;
    dragTarget = "mass2";
    playButton.setText("Start");
  }
});

grabArea2.onDrag(function () {
  if (isDragging && dragTarget === "mass2") {
    // Calculate position of mass 1
    let x1 = pivotX + L1 * Math.sin(theta1);
    let y1 = pivotY + L1 * Math.cos(theta1);
    // Calculate angle from current grab area position relative to mass 1
    theta2 = calculateAngleFromMouse(grabArea2.x, grabArea2.y, x1, y1);
    omega1 = 0;
    omega2 = 0;
    updateDisplay();
  }
});

grabArea2.onDragEnd(function () {
  isDragging = false;
  dragTarget = null;
});

// ───────────────────────────────────────────────────────────────────
// UPDATE FUNCTIONS
// ───────────────────────────────────────────────────────────────────

function updateDisplay() {
  let pos = calculatePositions();

  // First link
  arm1.setStart(pivotX, pivotY);
  arm1.setEnd(pos.x1, pos.y1);

  // First mass
  mass1Circle.x = pos.x1;
  mass1Circle.y = pos.y1;
  grabArea1.x = pos.x1;
  grabArea1.y = pos.y1;

  // Second link
  arm2.setStart(pos.x1, pos.y1);
  arm2.setEnd(pos.x2, pos.y2);

  // Second mass
  mass2Circle.x = pos.x2;
  mass2Circle.y = pos.y2;
  grabArea2.x = pos.x2;
  grabArea2.y = pos.y2;

  // Update theta1 angle marker
  // Arm1 of AngleLabel points down (vertical), Arm2 points to mass
  angleLabel1.setCenter(pivotX, pivotY);
  angleLabel1.setArm1(pivotX, pivotY + 60); // Vertical down
  angleLabel1.setArm2(pos.x1, pos.y1); // Direction to first mass

  // Position reference line for theta2 (from joint downward)
  refLine2.setStart(pos.x1, pos.y1);
  refLine2.setEnd(pos.x1, pos.y1 + 80);

  // Update theta2 angle marker
  angleLabel2.setCenter(pos.x1, pos.y1);
  angleLabel2.setArm1(pos.x1, pos.y1 + 60); // Vertical down
  angleLabel2.setArm2(pos.x2, pos.y2); // Direction to second mass

  // Update info texts
  infoTime.setText("t = " + formatNumber(time, 2) + " s");
  infoTheta1.setText(
    "θ₁ = " + formatNumber(toDegrees(normalizeAngle(theta1)), 1) + "°",
  );
  infoTheta2.setText(
    "θ₂ = " + formatNumber(toDegrees(normalizeAngle(theta2)), 1) + "°",
  );
  infoOmega1.setText("ω₁ = " + formatNumber(omega1, 2) + " rad/s");
  infoOmega2.setText("ω₂ = " + formatNumber(omega2, 2) + " rad/s");
}

function updateCurves() {
  // Update curve data
  let tMax = 10; // 10 seconds display
  let pixelsPerSecond = graphWidth / tMax;
  let degreesPerPixel = 180 / (graphHeight / 2);

  // Create points for curves
  let points1 = [];
  let points2 = [];

  for (let i = 0; i < theta1History.length; i++) {
    let x = timeHistory[i] * pixelsPerSecond;
    // Normalize angle to -180 to +180
    let angle1 = toDegrees(normalizeAngle(theta1History[i]));
    let angle2 = toDegrees(normalizeAngle(theta2History[i]));

    let y1 = (-angle1 / 180) * (graphHeight / 2); // Negative because y grows downward
    let y2 = (-angle2 / 180) * (graphHeight / 2);

    points1.push([x, y1]);
    points2.push([x, y2]);
  }

  if (points1.length > 1) {
    curveTheta1.setPoints(points1);
    curveTheta2.setPoints(points2);
  }
}

function updateTrail() {
  let pos = calculatePositions();

  // Add new point
  trailPoints.push([pos.x2, pos.y2]);

  // Remove old points
  if (trailPoints.length > maxTrailPoints) {
    trailPoints.shift();
  }

  // Update trail
  if (trailPoints.length > 1) {
    trail.setPoints(trailPoints);
  }
}

function resetSimulation() {
  time = 0;
  theta1 = initialTheta1; // V-shape starting position
  theta2 = initialTheta2;
  omega1 = 0;
  omega2 = 0;

  theta1History = [];
  theta2History = [];
  timeHistory = [];
  trailPoints = [];

  isRunning = false;
  playButton.setText("Start");

  // Reset curves
  curveTheta1.setPoints([[0, 0]]);
  curveTheta2.setPoints([[0, 0]]);
  trail.setPoints([
    [0, 0],
    [1, 1],
  ]);

  updateDisplay();
}

// ───────────────────────────────────────────────────────────────────
// ANIMATION
// ───────────────────────────────────────────────────────────────────

let timer = new Timer();

timer.onUpdate(function () {
  if (isRunning && !isDragging) {
    // Multiple small steps for stability
    let subSteps = 4;
    let subDt = dt / subSteps;

    for (let i = 0; i < subSteps; i++) {
      rungeKuttaStep(subDt);
    }

    time += dt;

    // Store data for diagram
    theta1History.push(theta1);
    theta2History.push(theta2);
    timeHistory.push(time);

    // Remove old data if too many
    if (theta1History.length > maxDataPoints) {
      theta1History.shift();
      theta2History.shift();
      timeHistory.shift();
      // Adjust time for continuous scrolling
      let tOffset = timeHistory[0];
      for (let i = 0; i < timeHistory.length; i++) {
        timeHistory[i] -= tOffset;
      }
      time -= tOffset;
    }

    updateDisplay();
    updateCurves();
    updateTrail();
  }
});

// Initial display
updateDisplay();
