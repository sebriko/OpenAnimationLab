// Created with Open Animation Lab
// Open Source – CC BY 4.0

// ==================== SECTION 1: VARIABLES ====================
let board = new Board(1280, 720, 0xe8e8e8);

// Position and dimension variables
let diagramPositionX = 1000;
let diagramPositionY = 550;

// Data points for curves
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

// Arrays for clouds
let allClouds = [];

// Physical parameters
let velocityKmh = 150; // km/h from the table
let mass = 750; // kg from the table (weight)
let airDensity = 1.225; // kg/m³ (standard atmosphere at sea level)
let wingArea = 15; // m² (estimated for small aircraft)

// Conversions and derived values
let velocityMs = velocityKmh / 3.6; // m/s
let dynamicPressure = 0.5 * airDensity * velocityMs * velocityMs; // Pa

// Motion parameters for animation
let velocityX = 0; // Relative velocity change (start at 0)
let velocityY = 0;
let currentLiftForce = 0;
let currentDragForce = 0;
let timeStep = 0.016;

// Animation and FPS tracking
let lastTime = Date.now();
let frameCounter = 0;
let lastFPSUpdate = Date.now();
let currentFPS = 60;
let debugCounter = 0;

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

let aircraft = new SimpleSVG(
  `<svg xml:space="preserve" viewBox="0 0 102.05 19.93"><path d="M.583 10.804C.314 7.948-.675 4.83.76 2.438 1.616 1.013 3.035.039 5.112 0c4.75-.018 6.155 5.326 7.67 9.2l28.547-.896s2.363-5.512 16.766-5.928c14.404-.416 17.228 5.872 17.228 5.872s25.643.37 26.698 5.977c1.054 5.607-26.699 5.442-26.699 5.442s-22.854.605-34.256-.004c-12.522-.669-37.406-4-37.406-4-2.277-.86-2.78-1.701-3.077-4.859z" fill="#b3b3b3"/></svg>`,
);
aircraft.x = 135;
aircraft.y = 265;
aircraft.setScale(8.25, 8.25);
aircraft.setAlpha(0.5);
aircraft.setRotationPoint(320, 100);

let wing = new SimpleSVG(
  `<svg xml:space="preserve" viewBox="0 0 99.46 12.48"><path d="M0 12.31S43.099-1.579 70.855.148C91.309 1.421 99.44 4.895 99.463 8.264c.036 5.133-25.212 4.142-25.212 4.142z" fill="#666"/></svg>`,
);
wing.x = 390;
wing.y = 340;
wing.setScale(3.75, 3.75);
wing.setAlpha(0.5);

let horizontal = new Line(285, 370, 885, 370, 0x555555, 3);
horizontal.x = 0;
horizontal.y = 0;

let horizontal2 = new Line(285, 370, 885, 370, 0x555555, 3);
horizontal2.x = 0;
horizontal2.y = 0;

aircraftGroup.addChild(aircraft);
aircraftGroup.addChild(wing);
aircraftGroup.addChild(horizontal2);
aircraftGroup.setRotationPoint(630, 370);
aircraftGroup.x = 0;
aircraftGroup.y = 0;

// Diagram curves (invisible, only for calculations)
let liftCurve = new SplinePath(liftPoints, 0x2233ff, 2);
liftCurve.x = diagramPositionX;
liftCurve.y = diagramPositionY;
liftCurve.visible = false;

let dragCurve = new SplinePath(dragPoints, 0xff3300, 2);
dragCurve.x = diagramPositionX;
dragCurve.y = diagramPositionY;
dragCurve.visible = false;

// UI elements
let angleSlider = new ButtonSlider(-10, 20, 0, 0.1, 75, 300);
angleSlider.enableValueDisplay();
angleSlider.x = 830;
angleSlider.y = 80;
angleSlider.setDisplayCommaType("comma");

angleSlider.setValueDisplayFont("Arial", 30);

let angleLabel = new Text("Angle of Attack α", "Arial", 35, 0x444444, "left");
angleLabel.x = 830;
angleLabel.y = 20;

// Force arrows
let liftArrow = new Arrow(0, 0, 0, -200, 0x2233ff, 3, 26, 12);
liftArrow.x = 630;
liftArrow.y = 370;

let dragArrow = new Arrow(0, 0, -50, 0, 0xff3300, 3, 26, 12);
dragArrow.x = 630;
dragArrow.y = 370;

let resultantArrow = new Arrow(0, 0, -50, -200, 0x006600, 3, 30, 15);
resultantArrow.x = 630;
resultantArrow.y = 370;

let vectorRectangle = new Rectangle(50, 200, 0x006600);
vectorRectangle.x = 630;
vectorRectangle.y = 370;
vectorRectangle.setAlpha(0.2);

const angleDisplay = new AngleLabel(
  630,
  370,
  630 - 30,
  370,
  630 + 50,
  370 - 50,
  200,
  "α",
  "Arial",
  35,
  0x444444,
  1,
  0x444444,
);

// Force labels
const liftLabel = new LineLabel(630, 370, 630, 170, "F<sub>L</sub>", -25);
liftLabel.setFontSize(35);
liftLabel.setTextColor(0x444444);
liftLabel.setFlipSide(true);

const dragLabel = new LineLabel(630, 370, 580, 370, "F<sub>D</sub>", -25);
dragLabel.setFontSize(35);
dragLabel.setTextColor(0x444444);
dragLabel.setFlipSide(true);

const resultantLabel = new LineLabel(630, 370, 580, 170, "F<sub>R</sub>", 20);
resultantLabel.setFontSize(35);
resultantLabel.setTextColor(0x444444);
resultantLabel.setFlipSide(false);

resultantLabel.setDistance(30);

// Animation timer
let animationTimer = new Timer();
animationTimer.start();

// ==================== SECTION 3: FUNCTIONS ====================

function updateAngle(e) {
  let angleValue = angleSlider.value;
  aircraftGroup.rotation = -angleValue;

  // Read coefficients from curves
  let liftCoefficient = -liftCurve.getY(angleValue * 10) / 100; // Normalized to approx. 0-2
  let dragCoefficient = -dragCurve.getY(angleValue * 10) / 100; // Normalized to approx. 0-0.5

  // Physically correct force calculation: F = 0.5 * ρ * v² * A * C
  currentLiftForce = dynamicPressure * wingArea * liftCoefficient; // Newton
  currentDragForce = dynamicPressure * wingArea * dragCoefficient; // Newton

  // Arrow display (scaled for visualization)
  let scalingFactor = 0.01; // Scaling for visual representation
  let liftArrowLength = -currentLiftForce * scalingFactor;
  let dragArrowLength = -currentDragForce * scalingFactor;

  liftArrow.setEnd(0, liftArrowLength);
  dragArrow.setEnd(dragArrowLength, 0);

  // Update lift label
  liftLabel.setStart(630, 370);
  liftLabel.setEnd(630, 370 + liftArrowLength);

  // Update drag label
  dragLabel.setStart(630, 370);
  dragLabel.setEnd(630 + dragArrowLength, 370);

  let resultantX = dragArrowLength;
  let resultantY = liftArrowLength;

  resultantArrow.setEnd(resultantX, resultantY);

  // Update resultant label
  resultantLabel.setStart(630, 370);
  resultantLabel.setEnd(630 + resultantX, 370 + resultantY);

  let rectangleWidth = Math.abs(dragArrowLength);
  let rectangleHeight = Math.abs(liftArrowLength);

  vectorRectangle.width = rectangleWidth;
  vectorRectangle.height = rectangleHeight;

  if (dragArrowLength >= 0 && liftArrowLength >= 0) {
    vectorRectangle.x = 630;
    vectorRectangle.y = 370;
  } else if (dragArrowLength < 0 && liftArrowLength >= 0) {
    vectorRectangle.x = 630 + dragArrowLength;
    vectorRectangle.y = 370;
  } else if (dragArrowLength >= 0 && liftArrowLength < 0) {
    vectorRectangle.x = 630;
    vectorRectangle.y = 370 + liftArrowLength;
  } else {
    vectorRectangle.x = 630 + dragArrowLength;
    vectorRectangle.y = 370 + liftArrowLength;
  }

  // Update angle arm points
  // Arm 1: Horizontal to the right
  angleDisplay.setArm1(630 + 100, 370);

  // Arm 2: Rotated by angle α (angle in degrees to radians)
  let angleRad = (angleValue * Math.PI) / 180;
  let armLength = 100;
  angleDisplay.setArm2(
    630 + armLength * Math.cos(angleRad),
    370 - armLength * Math.sin(angleRad),
  );
}

function updatePhysics() {
  // Update velocity and dynamic pressure
  velocityMs = velocityKmh / 3.6;
  dynamicPressure = 0.5 * airDensity * velocityMs * velocityMs;

  // Update forces with new values
  updateAngle();
}

function wrapCloud(cloud) {
  let cloudWidth = 250;
  let cloudHeight = 100;

  if (cloud.x > 1280 + cloudWidth) {
    cloud.x = -cloudWidth;
  } else if (cloud.x < -cloudWidth) {
    cloud.x = 1280 + cloudWidth;
  }

  if (cloud.y > 720 + cloudHeight) {
    cloud.y = -cloudHeight;
  } else if (cloud.y < -cloudHeight) {
    cloud.y = 720 + cloudHeight;
  }
}

// Animation update handler
function animationUpdateHandler(progress) {
  let currentTime = Date.now();
  let deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  deltaTime = Math.min(deltaTime, 0.033);

  // Physically correct acceleration: a = F / m
  let accelerationX = -currentDragForce / mass; // m/s²
  let accelerationY = currentLiftForce / mass - 9.81; // m/s² (with gravity)

  // Integration of acceleration for velocity change
  let animationScaling = 0.5;
  velocityX += accelerationX * deltaTime * animationScaling;
  velocityY += accelerationY * deltaTime * animationScaling;

  // Limit velocity change
  let maxVelocityChange = 10;
  velocityX = Math.max(
    -maxVelocityChange,
    Math.min(maxVelocityChange, velocityX),
  );
  velocityY = Math.max(
    -maxVelocityChange,
    Math.min(maxVelocityChange, velocityY),
  );

  // IMPORTANT: Base flight velocity is now dynamically calculated from velocityKmh
  // Scaling factor adjusted for better visibility of velocity differences
  let velocityScaling = 1.0; // Adjustable for visual representation
  let baseVelocityPixels = velocityKmh * velocityScaling;

  for (let i = 0; i < allClouds.length; i++) {
    let cloud = allClouds[i];
    // Clouds must move LEFT (negative) for forward motion of aircraft
    cloud.x -= (baseVelocityPixels - velocityX * 60) * deltaTime;
    cloud.y += velocityY * deltaTime * 25; // Increased from 10 to 25 for stronger lift effect
    wrapCloud(cloud);
  }

  frameCounter++;
  debugCounter++;

  if (debugCounter >= 60) {
    let now = Date.now();
    let elapsedTime = (now - lastFPSUpdate) / 1000;
    currentFPS = Math.round(frameCounter / elapsedTime);

    debugCounter = 0;
    frameCounter = 0;
    lastFPSUpdate = now;
  }
}

// ==================== SECTION 4: EVENT LISTENERS ====================

// Add angle slider onChange handler
angleSlider.onChange(updateAngle);

// Animation timer onUpdate handler
animationTimer.onUpdate(animationUpdateHandler);

// Initial call to updateAngle
updateAngle();
