// Created with Open Animation Lab
// Wasserglas-Simulation mit schwimmenden Eiswürfeln
// Demonstration von Auftrieb und Wellenphysik
// Open Source – CC BY 4.0

let board = new Board(1280, 720);

// ==================== KONSTANTEN ====================
const GLASS_X = 440;
const GLASS_Y = 150; // 50 Pixel nach oben
const GLASS_WIDTH = 400;
const GLASS_HEIGHT = 500;
const GLASS_THICKNESS = 8;
const WATER_COLOR = 0x99d4ff; // Hellblau
const ICE_COLOR = 0xd4f1f9;
const ICE_DENSITY = 0.917; // Eis schwimmt zu ~92% unter Wasser
const GRAVITY = 0.5; // Erhöht für schnelleres Fallen
const WATER_DAMPING = 0.97;
const WAVE_SPEED = 0.12;
const SURFACE_POINTS = 50; // Anzahl Punkte für die Wasseroberfläche
const ICE_MARGIN = 5; // Abstand zum Glasrand
const MAX_ICE_CUBES = 12; // Maximale Anzahl Eiswürfel

// Wasserpegel (Höhe des Wassers von unten)
let baseWaterLevel = 320;

// ==================== HINTERGRUND ====================
let background = new Rectangle(1280, 720, 0xffffff);
background.x = 0;
background.y = 0;

// ==================== INNERE GRENZEN DES GLASES ====================
const WATER_LEFT = GLASS_X + GLASS_THICKNESS;
const WATER_RIGHT = GLASS_X + GLASS_WIDTH - GLASS_THICKNESS;
const WATER_BOTTOM = GLASS_Y + GLASS_HEIGHT - GLASS_THICKNESS;
const WATER_WIDTH = WATER_RIGHT - WATER_LEFT;
const WATER_TOP_BASE = WATER_BOTTOM - baseWaterLevel;

// ==================== WASSER-OBERFLÄCHENPHYSIK ====================
let surfaceHeights = [];
let surfaceVelocities = [];

for (let i = 0; i < SURFACE_POINTS; i++) {
  surfaceHeights.push(0);
  surfaceVelocities.push(0);
}

// Wasserkörper als gefüllter LinePath
function createWaterPoints() {
  let points = [];

  // Unten links starten
  points.push([WATER_LEFT, WATER_BOTTOM]);

  // Oberfläche von links nach rechts (mit Welleneffekt)
  for (let i = 0; i < SURFACE_POINTS; i++) {
    let x = WATER_LEFT + (i / (SURFACE_POINTS - 1)) * WATER_WIDTH;
    let y = WATER_TOP_BASE + surfaceHeights[i];
    points.push([x, y]);
  }

  // Unten rechts
  points.push([WATER_RIGHT, WATER_BOTTOM]);

  return points;
}

let waterBody = new LinePath(createWaterPoints(), 0x66b8e0, 0);
waterBody.setFillColor(WATER_COLOR);
waterBody.setAlpha(0.8);
waterBody.closePath();

// ==================== GLAS (Seitenansicht) ====================
// Linke Glaswand
let glassLeft = new Rectangle(GLASS_THICKNESS, GLASS_HEIGHT, 0xb8d4e8);
glassLeft.x = GLASS_X;
glassLeft.y = GLASS_Y;
glassLeft.setAlpha(0.5);
glassLeft.setBorder(0x8ab4d0, 2);

// Rechte Glaswand
let glassRight = new Rectangle(GLASS_THICKNESS, GLASS_HEIGHT, 0xb8d4e8);
glassRight.x = GLASS_X + GLASS_WIDTH - GLASS_THICKNESS;
glassRight.y = GLASS_Y;
glassRight.setAlpha(0.5);
glassRight.setBorder(0x8ab4d0, 2);

// Glasboden
let glassBottom = new Rectangle(GLASS_WIDTH, GLASS_THICKNESS, 0xb8d4e8);
glassBottom.x = GLASS_X;
glassBottom.y = GLASS_Y + GLASS_HEIGHT - GLASS_THICKNESS;
glassBottom.setAlpha(0.5);
glassBottom.setBorder(0x8ab4d0, 2);

// ==================== EISWÜRFEL ====================
let iceCubes = [];
const ICE_SIZE = 55;
const ICE_CORNER_RADIUS = 8;

function createIceCube(x) {
  if (iceCubes.length >= MAX_ICE_CUBES) {
    return null;
  }

  let cube = {
    element: new Rectangle(ICE_SIZE, ICE_SIZE, ICE_COLOR),
    x: x,
    y: 20,
    vy: 0,
    vx: (Math.random() - 0.5) * 0.5,
    width: ICE_SIZE,
    height: ICE_SIZE,
    inWater: false,
    floating: false,
    rotation: (Math.random() - 0.5) * 8,
    angularVel: 0,
  };

  cube.element.x = cube.x;
  cube.element.y = cube.y;
  cube.element.setBorder(0x9ec8db, 2);
  cube.element.setAlpha(0.9);
  cube.element.setRoundedCorners(ICE_CORNER_RADIUS);
  cube.element.setRotationPoint(ICE_SIZE / 2, ICE_SIZE / 2);
  cube.element.rotation = cube.rotation;

  // Farbverlauf für 3D-Effekt
  cube.element.setGradient("linear", [
    { offset: 0, color: "#e8faff" },
    { offset: 0.3, color: "#d4f1f9" },
    { offset: 0.7, color: "#b8e4f0" },
    { offset: 1, color: "#a0d8e8" },
  ]);

  iceCubes.push(cube);
  return cube;
}

// ==================== WELLEN-PHYSIK ====================
function getWaterSurfaceAt(x) {
  let relX = x - WATER_LEFT;
  if (relX < 0) relX = 0;
  if (relX > WATER_WIDTH) relX = WATER_WIDTH;

  let index = (relX / WATER_WIDTH) * (SURFACE_POINTS - 1);
  let i = Math.floor(index);
  let frac = index - i;

  if (i >= SURFACE_POINTS - 1) {
    return WATER_TOP_BASE + surfaceHeights[SURFACE_POINTS - 1];
  }

  let h = surfaceHeights[i] * (1 - frac) + surfaceHeights[i + 1] * frac;
  return WATER_TOP_BASE + h;
}

function createSplash(x, intensity) {
  let relX = x - WATER_LEFT;
  let centerIndex = Math.round((relX / WATER_WIDTH) * (SURFACE_POINTS - 1));

  // Begrenzte Reichweite des Splash
  let splashWidth = 6;
  for (
    let i = Math.max(0, centerIndex - splashWidth);
    i <= Math.min(SURFACE_POINTS - 1, centerIndex + splashWidth);
    i++
  ) {
    let dist = Math.abs(i - centerIndex);
    let factor = Math.cos(((dist / splashWidth) * Math.PI) / 2);
    factor = factor * factor;
    surfaceVelocities[i] += intensity * factor;
  }
}

function updateWaterShape() {
  let points = createWaterPoints();
  waterBody.setPoints(points);
}

// ==================== UI ELEMENTE ====================

let resetButton = new Button("Zurücksetzen", 160, 40, "Arial", 22);
resetButton.x = 20;
resetButton.y = 20;

let addIceButton = new Button("+ Eiswürfel", 160, 40, "Arial", 22);
addIceButton.x = 200;
addIceButton.y = 20;

let countText = new Text("Eiswürfel: 0 / 12", "Arial", 22, 0x444444);
countText.x = 20;
countText.y = 70;

// ==================== EVENT HANDLER ====================
board.onMouseDown(function (e) {
  if (iceCubes.length >= MAX_ICE_CUBES) {
    return;
  }

  // Nur im Bereich über dem Glas und oberhalb des Wassers
  // Mit 5 Pixel Abstand zu den Rändern
  if (
    e.x > WATER_LEFT + ICE_MARGIN &&
    e.x < WATER_RIGHT - ICE_MARGIN - ICE_SIZE
  ) {
    let waterSurface = getWaterSurfaceAt(e.x);
    if (e.y < waterSurface - 10) {
      let newCube = createIceCube(e.x - ICE_SIZE / 2);
      if (newCube) {
        newCube.y = e.y;
        countText.setText("Eiswürfel: " + iceCubes.length + " / 12");
      }
    }
  }
});

addIceButton.onClick(function () {
  if (iceCubes.length >= MAX_ICE_CUBES) {
    return;
  }

  // Mit 5 Pixel Abstand zu den Rändern
  let minX = WATER_LEFT + ICE_MARGIN;
  let maxX = WATER_RIGHT - ICE_MARGIN - ICE_SIZE;
  let randomX = minX + Math.random() * (maxX - minX);
  let newCube = createIceCube(randomX);
  if (newCube) {
    countText.setText("Eiswürfel: " + iceCubes.length + " / 12");
  }
});

resetButton.onClick(function () {
  // Entferne alle Eiswürfel
  for (let cube of iceCubes) {
    cube.element.visible = false;
  }
  iceCubes = [];

  // Wasser zurücksetzen
  for (let i = 0; i < SURFACE_POINTS; i++) {
    surfaceHeights[i] = 0;
    surfaceVelocities[i] = 0;
  }

  countText.setText("Eiswürfel: 0 / 12");
});

// ==================== ANIMATIONS-TIMER ====================
let timer = new Timer();
timer.start();

timer.onUpdate(function () {
  // Wellen aktualisieren
  for (let i = 0; i < SURFACE_POINTS; i++) {
    let left = i > 0 ? surfaceHeights[i - 1] : surfaceHeights[i];
    let right =
      i < SURFACE_POINTS - 1 ? surfaceHeights[i + 1] : surfaceHeights[i];
    let current = surfaceHeights[i];

    let springForce = -current * 0.02;
    let neighborForce = WAVE_SPEED * (left + right - 2 * current);

    surfaceVelocities[i] += springForce + neighborForce;
    surfaceVelocities[i] *= WATER_DAMPING;
  }

  for (let i = 0; i < SURFACE_POINTS; i++) {
    surfaceHeights[i] += surfaceVelocities[i];
  }

  surfaceHeights[0] *= 0.85;
  surfaceHeights[SURFACE_POINTS - 1] *= 0.85;

  // Wasserform aktualisieren
  updateWaterShape();

  // Eiswürfel aktualisieren
  for (let cube of iceCubes) {
    let cubeBottom = cube.y + cube.height;
    let cubeCenterX = cube.x + cube.width / 2;
    let cubeLeft = cube.x;
    let cubeRight = cube.x + cube.width;

    let waterSurfaceLeft = getWaterSurfaceAt(cubeLeft);
    let waterSurfaceRight = getWaterSurfaceAt(cubeRight);
    let waterSurfaceCenter = getWaterSurfaceAt(cubeCenterX);
    let avgWaterSurface =
      (waterSurfaceLeft + waterSurfaceCenter + waterSurfaceRight) / 3;

    cube.vy += GRAVITY;

    if (
      cubeBottom > avgWaterSurface &&
      cubeRight > WATER_LEFT &&
      cubeLeft < WATER_RIGHT
    ) {
      let submergedDepth = Math.min(cubeBottom - avgWaterSurface, cube.height);
      let submergedRatio = submergedDepth / cube.height;

      let buoyancy = submergedRatio * GRAVITY * (1 / ICE_DENSITY) * 1.1;
      cube.vy -= buoyancy;
      cube.vy *= 0.92;
      cube.vx *= 0.97;

      if (!cube.inWater && cube.vy > 1) {
        createSplash(cubeCenterX, cube.vy * 0.8);
        cube.inWater = true;
      }

      if (Math.abs(cube.vy) > 0.3) {
        createSplash(cubeCenterX, cube.vy * 0.03);
      }

      let tiltForce = (waterSurfaceRight - waterSurfaceLeft) * 0.01;
      cube.angularVel += tiltForce;
      cube.angularVel *= 0.98;

      cube.floating = submergedRatio > 0.3;
    } else {
      cube.inWater = false;
      cube.floating = false;
    }

    // Kollision mit Wänden - mit 5 Pixel Abstand
    if (cube.x < WATER_LEFT + ICE_MARGIN) {
      cube.x = WATER_LEFT + ICE_MARGIN;
      cube.vx = Math.abs(cube.vx) * 0.5;
    }
    if (cube.x + cube.width > WATER_RIGHT - ICE_MARGIN) {
      cube.x = WATER_RIGHT - ICE_MARGIN - cube.width;
      cube.vx = -Math.abs(cube.vx) * 0.5;
    }
    if (cubeBottom > WATER_BOTTOM) {
      cube.y = WATER_BOTTOM - cube.height;
      cube.vy = -Math.abs(cube.vy) * 0.3;
    }
    if (cube.y < 0) {
      cube.y = 0;
      cube.vy = Math.abs(cube.vy) * 0.5;
    }

    cube.y += cube.vy;
    cube.x += cube.vx;
    cube.rotation += cube.angularVel;
    cube.angularVel *= 0.99;

    cube.element.x = cube.x;
    cube.element.y = cube.y;
    cube.element.rotation = cube.rotation;
  }
});

// ==================== GLAS-VORDERSEITE (für Tiefeneffekt) ====================
let glassFrontLeft = new Rectangle(GLASS_THICKNESS / 2, GLASS_HEIGHT, 0xd8ecf8);
glassFrontLeft.x = GLASS_X;
glassFrontLeft.y = GLASS_Y;
glassFrontLeft.setAlpha(0.25);

let glassFrontRight = new Rectangle(
  GLASS_THICKNESS / 2,
  GLASS_HEIGHT,
  0xd8ecf8,
);
glassFrontRight.x = GLASS_X + GLASS_WIDTH - GLASS_THICKNESS / 2;
glassFrontRight.y = GLASS_Y;
glassFrontRight.setAlpha(0.25);
