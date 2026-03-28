// Created with Open Animation Lab
// Open Source – CC BY 4.0

// ========== SECTION 1: VARIABLES ==========
let board = new Board(1280, 720);

// Constants for the square and position
const squareSize = 350;
const centerX = board.width / 2 - 300;
const centerY = board.height / 2 - 50; // Shifted 50 pixels upward
const minX = centerX - squareSize / 2 - 35;
const maxX = centerX + squareSize / 2 - 35;
const minY = centerY - squareSize / 2;
const maxY = centerY + squareSize / 2;
const threshold = 5;

// Position tracking
let lastX = centerX;
let lastY = centerY;
let xHistory = [centerX, centerX, centerX, centerX, centerX];

// Graph constants
const GRAPH_START_X = 700;
const GRAPH_END_X = 1150;
const GRAPH_WIDTH = GRAPH_END_X - GRAPH_START_X;
const PIXELS_PER_UPDATE = 2;
const MAX_POINTS = Math.floor(GRAPH_WIDTH / PIXELS_PER_UPDATE);

// Smoothing parameters
const SMOOTHING_FACTOR = 0.3; // Exponential Moving Average Factor (0-1, smaller = smoother)
let smoothedVoltage = 1; // For exponential moving average

// Parameters for calculation
let conductorLength = 7;
let magneticFieldStrength = 0.7;

// ========== SECTION 2: OBJECTS ==========
// SVG magnet
let mySVG = new SimpleSVG(
  `<svg viewBox="0 0 465.15 528.44"><path d="M.526.528v52.738h411.36V264.22h52.739V.528h-52.739Z" fill="red" stroke-width="1.05" stroke="#2e2e2e"/><path d="M411.887 264.219v210.954H.527v52.738h464.098V264.219Z" fill="#0f0" stroke="#2e2e2e" stroke-width="1.05"/></svg>`,
);
mySVG.x = 403 - 300;
mySVG.y = 97 - 50; // Shifted 50 pixels upward

// Conductor circle
let myCircle = new Circle(30, 0x999999);
myCircle.x = 0;
myCircle.y = 0;
myCircle.setBorder(0x555555, 2);

// Red dot (current out)
let myPoint = new Circle(7, 0xff0000);
myPoint.x = 0;
myPoint.y = 0;

// Cross (current in)
let myLine = new Line(-20, -20, 20, 20, 0xff0000, 5);
myLine.x = 0;
myLine.y = 0;

let myLine2 = new Line(-20, 20, 20, -20, 0xff0000, 5);
myLine2.x = 0;
myLine2.y = 0;

let cross = new Group();
cross.addChild(myLine);
cross.addChild(myLine2);
cross.visible = false;

// Conductor group
let conductor = new Group();
conductor.addChild(myCircle);
conductor.addChild(cross);
conductor.addChild(myPoint);
conductor.x = centerX;
conductor.y = centerY;

// Initial visibility
cross.visible = false;
myPoint.visible = false;

// Add objects to board
board.addChild(mySVG);
board.addChild(conductor);

// Coordinate system
let myCoordinateSystem = new CoordinateSystem(
  0,
  500,
  250,
  250,
  0x444444,
  30,
  16,
  2,
);
myCoordinateSystem.x = 700;
myCoordinateSystem.y = 365 - 50; // Shifted 50 pixels upward

// Labels
let labelU = new Text("+U", "Arial", 36, 0x000000, "right");
labelU.x = 630;
labelU.y = 100 - 50; // Shifted 50 pixels upward

let labelU2 = new Text("-U", "Arial", 36, 0x000000, "right");
labelU2.x = 630;
labelU2.y = 560 - 50; // Shifted 50 pixels upward

let labelT = new Text("t", "Arial", 36, 0x000000, "left");
labelT.x = 1150;
labelT.y = 360 - 50; // Shifted 50 pixels upward

// Line path for graph
let linePath = new LinePath([], 0x0033aa, 2);

// Timer
let myTimer = new Timer(0, true, "");

// Add more objects to board
board.addChild(myCoordinateSystem);
board.addChild(linePath);

// Parameter table
const paramTable = new ParameterTable(
  [
    { name: "Conductor length l (1-10)", value: 7 },
    { name: "Magnetic field strength (0.5-1)", value: 0.7 },
    { name: "Voltage U", value: 0 },
  ],
  400,
  "Arial",
  14,
  0x333333,
);

paramTable.setValue("Voltage U", 0);
paramTable.x = 860;
paramTable.y = 540;
paramTable.setTitle("System Parameters");
paramTable.setDecimalSeparator(".");
paramTable.setValueLimits("Conductor length l (1-10)", 1, 10);
paramTable.setValueLimits("Magnetic field strength (0.5-1)", 0.5, 1);

// ========== SECTION 3: FUNCTIONS ==========
function interactivity() {
  let deltaX = conductor.x - lastX;
  let deltaY = conductor.y - lastY;

  if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        cross.visible = true;
        myPoint.visible = false;
      } else {
        cross.visible = false;
        myPoint.visible = true;
      }
    } else {
      cross.visible = false;
      myPoint.visible = false;
    }

    lastX = conductor.x;
    lastY = conductor.y;
  }
}

function movingAverage(values) {
  if (values.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }
  return sum / values.length;
}

function weightedMovingAverage(values) {
  if (values.length === 0) return 0;
  let sum = 0;
  let weightSum = 0;
  for (let i = 0; i < values.length; i++) {
    let weight = i + 1; // Newer values get more weight
    sum += values[i] * weight;
    weightSum += weight;
  }
  return sum / weightSum;
}

function refresh() {
  xHistory.push(conductor.x);
  xHistory.shift();

  let totalDelta = 0;
  for (let i = 1; i < xHistory.length; i++) {
    totalDelta += xHistory[i] - xHistory[i - 1];
  }
  let averageDelta = totalDelta / (xHistory.length - 1);

  let voltage = averageDelta;

  // SMOOTHING METHODS - choose one:
  smoothedVoltage =
    SMOOTHING_FACTOR * voltage + (1 - SMOOTHING_FACTOR) * smoothedVoltage;
  let finalVoltage = smoothedVoltage;

  // Calculate voltage with parameters
  // U = B * l * v (magnetic field * length * velocity)
  let parameterizedVoltage =
    finalVoltage * conductorLength * magneticFieldStrength;

  // Unsmoothed voltage for display (based on current value)
  let unsmoothedVoltage = voltage * conductorLength * magneticFieldStrength;

  // Display current voltage value in table (unsmoothed, rounded to 2 decimal places)
  paramTable.setValue("Voltage U", Math.round(unsmoothedVoltage * 100) / 100);

  // Scaling for the curve
  let scaledVoltage = parameterizedVoltage;

  let graphY = 365 - 50 - scaledVoltage; // Shifted 50 pixels upward

  if (linePath.points.length < MAX_POINTS) {
    let graphX = GRAPH_START_X + linePath.points.length * PIXELS_PER_UPDATE;
    linePath.addPointEnd(graphX, graphY);
  } else {
    linePath.removePointStart();

    linePath.addPointEnd(GRAPH_END_X, graphY);

    for (let i = 0; i < linePath.points.length; i++) {
      linePath.points[i][0] -= PIXELS_PER_UPDATE;
    }

    linePath.setPoints(linePath.points);
  }
}

function handleParameterChange(event) {
  // Update parameters when changed in the table
  if (event.parameterName === "Conductor length l (1-10)") {
    conductorLength = event.newValue;
  } else if (event.parameterName === "Magnetic field strength (0.5-1)") {
    magneticFieldStrength = event.newValue;
  }
}

// ========== SECTION 4: EVENT LISTENERS ==========
// Enable dragging functionality
conductor.setDragging(minX, minY, maxX, maxY);
conductor.onDrag(interactivity);

// Start timer and register update function
myTimer.start();
myTimer.onUpdate(refresh);

// Event listener for parameter changes
paramTable.onChange(handleParameterChange);
