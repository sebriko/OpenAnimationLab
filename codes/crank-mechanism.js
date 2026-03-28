// Created with Open Animation Lab

// ========== SECTION 1: Board and Variables ==========
let board = new Board(1280, 720);

// Geometric variables
let radius = 200;
let crankWidth = 30;
let crankLength = radius + crankWidth;
let pistonHeight = 80;
let pistonWidth = 300;
let axisRadius = 7;
let angle = 0;
let connectingRodWidth = 30;
let connectingRodLength = 430;
let centerX = 340;
let centerY = 360;
let connectingRodEffectiveLength = connectingRodLength - crankWidth;

// Calculated positions
let maxPistonX =
  centerX +
  radius +
  Math.sqrt(connectingRodEffectiveLength * connectingRodEffectiveLength);
let minPistonX =
  centerX -
  radius +
  Math.sqrt(connectingRodEffectiveLength * connectingRodEffectiveLength);

// Points for the cylinder
let points = [
  [minPistonX - pistonHeight / 2, centerY - pistonWidth / 2],
  [maxPistonX + pistonHeight / 2, centerY - pistonWidth / 2],
  [maxPistonX + pistonHeight / 2, centerY + pistonWidth / 2],
  [minPistonX - pistonHeight / 2, centerY + pistonWidth / 2],
];

// Animation status
let isPlaying = false;

// ========== SECTION 2: Objects ==========

// Crank path (circle)
let crankPath = new Circle(radius, 0xffffff);
crankPath.x = centerX;
crankPath.y = centerY;
crankPath.setBorder(0x333333, 1);

// Cylinder (LinePath)
let linePath = new LinePath(points, 0x444444, 2);

// Crank
let crank = new Rectangle(crankLength, 30, 0x99ff99);
crank.x = centerX;
crank.y = centerY;
crank.setBorder(0x333333, 1);
crank.setRoundedCorners(10);
crank.setRotationPoint(crankWidth / 2, crankWidth / 2);
crank.setTransformationPoint(crankWidth / 2, crankWidth / 2);

// Crank axis
let crankAxis = new Circle(axisRadius, 0xffffff);
crankAxis.x = centerX;
crankAxis.y = centerY;
crankAxis.setBorder(0x333333, 1);

// Piston
let piston = new Rectangle(pistonWidth, pistonHeight, 0xe099d7);
piston.setBorder(0x333333, 1);
piston.setRoundedCorners(10);
piston.setRotationPoint(pistonWidth / 2, pistonHeight / 2);
piston.setTransformationPoint(pistonWidth / 2, pistonHeight / 2);
piston.rotation = 90;

// Connecting rod
let connectingRod = new Rectangle(connectingRodLength, 30, 0x00ff99);
connectingRod.setBorder(0x333333, 1);
connectingRod.setRoundedCorners(10);
connectingRod.setRotationPoint(connectingRodWidth / 2, connectingRodWidth / 2);
connectingRod.setTransformationPoint(
  connectingRodWidth / 2,
  connectingRodWidth / 2,
);

// Connecting rod axis
let connectingRodAxis = new Circle(axisRadius, 0xffffff);
connectingRodAxis.x = centerX;
connectingRodAxis.y = centerY;
connectingRodAxis.setBorder(0x333333, 1);

// Piston axis
let pistonAxis = new Circle(axisRadius, 0xffffff);
pistonAxis.setBorder(0x333333, 1);

// UI Elements
let labelAngleSlider = new Text("Angle", "Arial", 20, 0x444444, "left");
labelAngleSlider.x = 950;
labelAngleSlider.y = 20;

let angleSlider = new ButtonSlider(0, 360, 0, 1, 50, 200);
angleSlider.enableValueDisplay();
angleSlider.setThumbShape("triangle-A");
angleSlider.x = 950;
angleSlider.y = 50;

let labelRadiusSlider = new Text("Radius", "Arial", 20, 0x444444, "left");
labelRadiusSlider.x = 600;
labelRadiusSlider.y = 590;

let radiusSlider = new ButtonSlider(0, 300, radius, 1, 50, 200);
radiusSlider.enableValueDisplay();
radiusSlider.x = 600;
radiusSlider.y = 620;

let labelLengthSlider = new Text(
  "Connecting Rod Length",
  "Arial",
  20,
  0x444444,
  "left",
);
labelLengthSlider.x = 950;
labelLengthSlider.y = 590;

let lengthSlider = new ButtonSlider(
  100,
  500,
  connectingRodEffectiveLength,
  1,
  50,
  200,
);
lengthSlider.enableValueDisplay();
lengthSlider.x = 950;
lengthSlider.y = 620;

let myButton = new Button("Play", 100, 30, "Arial", 20);
myButton.x = 800;
myButton.y = 60;

let myTimer = new Timer();

// ========== SECTION 3: Functions ==========

function updateRadius(newRadius) {
  radius = newRadius;
  crankLength = radius + crankWidth;

  // Update crank path (circle)
  crankPath.setRadius(radius);

  // Update crank - change width
  crank.setWidth(crankLength);

  // Recalculate cylinder boundaries
  maxPistonX =
    centerX +
    radius +
    Math.sqrt(connectingRodEffectiveLength * connectingRodEffectiveLength);
  minPistonX =
    centerX -
    radius +
    Math.sqrt(connectingRodEffectiveLength * connectingRodEffectiveLength);

  // Update LinePath - set new points
  points = [
    [minPistonX - pistonHeight / 2, centerY - pistonWidth / 2],
    [maxPistonX + pistonHeight / 2, centerY - pistonWidth / 2],
    [maxPistonX + pistonHeight / 2, centerY + pistonWidth / 2],
    [minPistonX - pistonHeight / 2, centerY + pistonWidth / 2],
  ];
  linePath.setPoints(points);

  // Update drawing with current angle
  draw(angle);
}

function updateConnectingRodLength(newLength) {
  connectingRodEffectiveLength = newLength;
  connectingRodLength = connectingRodEffectiveLength + crankWidth;

  // Update connecting rod rectangle
  connectingRod.setWidth(connectingRodLength);

  // Recalculate cylinder boundaries
  maxPistonX =
    centerX +
    radius +
    Math.sqrt(connectingRodEffectiveLength * connectingRodEffectiveLength);
  minPistonX =
    centerX -
    radius +
    Math.sqrt(connectingRodEffectiveLength * connectingRodEffectiveLength);

  // Update LinePath - set new points
  points = [
    [minPistonX - pistonHeight / 2, centerY - pistonWidth / 2],
    [maxPistonX + pistonHeight / 2, centerY - pistonWidth / 2],
    [maxPistonX + pistonHeight / 2, centerY + pistonWidth / 2],
    [minPistonX - pistonHeight / 2, centerY + pistonWidth / 2],
  ];
  linePath.setPoints(points);

  // Update drawing with current angle
  draw(angle);
}

function draw(newAngle) {
  angle = newAngle;
  crank.rotation = angle;

  // Convert angle to radians
  let angleRad = (angle * Math.PI) / 180;

  // Calculate position of crank end (where the connecting rod attaches)
  let crankEndX = centerX + radius * Math.cos(angleRad);
  let crankEndY = centerY + radius * Math.sin(angleRad);

  // Position connecting rod
  connectingRod.x = crankEndX;
  connectingRod.y = crankEndY;

  // Calculate connecting rod inclination
  // The connecting rod must be inclined so that the other end lies horizontally above the center axis
  // The Y-position of the piston is fixed (horizontally above the center axis)
  let pistonY = 360; // Center axis

  // Calculate the X-position of the piston using the Pythagorean theorem
  // The connecting rod has a fixed length (connectingRodLength)
  let verticalDistance = pistonY - crankEndY;
  let horizontalDistance = Math.sqrt(
    connectingRodEffectiveLength * connectingRodEffectiveLength -
      verticalDistance * verticalDistance,
  );
  let pistonX = crankEndX + horizontalDistance;

  // Calculate connecting rod angle
  let connectingRodAngle =
    (Math.atan2(pistonY - crankEndY, pistonX - crankEndX) * 180) / Math.PI;
  connectingRod.rotation = connectingRodAngle;

  // Position piston
  piston.x = pistonX;
  piston.y = pistonY;

  pistonAxis.x = pistonX;
  pistonAxis.y = pistonY;

  // Position connecting rod axis at crank end
  connectingRodAxis.x = crankEndX;
  connectingRodAxis.y = crankEndY;
}

// Event handler functions
function onAngleSliderChange(e) {
  draw(e.value);
  // When the slider is moved manually, also update the angle variable
  angle = e.value;
}

function onRadiusSliderChange(e) {
  updateRadius(e.value);
}

function onLengthSliderChange(e) {
  updateConnectingRodLength(e.value);
}

function onButtonClick() {
  if (isPlaying) {
    // Pause
    myTimer.pause();
    myButton.setText("Play");
    isPlaying = false;
  } else {
    // Play
    myTimer.start();
    myButton.setText("Pause");
    isPlaying = true;
  }
}

function onTimerUpdate(progress) {
  // Progress goes from 0 to 1, we want from 0 to 360 degrees
  let newAngle = (angle + 2) % 360; // 2 degrees per frame
  draw(newAngle);

  // Update slider position
  angleSlider.setValue(newAngle);
}

// ========== SECTION 4: Event Listeners ==========

angleSlider.onChange(onAngleSliderChange);
radiusSlider.onChange(onRadiusSliderChange);
lengthSlider.onChange(onLengthSliderChange);
myButton.onClick(onButtonClick);
myTimer.onUpdate(onTimerUpdate);

// Initial drawing
draw(angle);
