// Created with Open Animation Lab
// ═══════════════════════════════════════════════════════════════════
// DOPPELPENDEL - CHAOTISCHE SCHWINGUNGEN
// Interaktive Simulation eines Doppelpendels mit Phasendiagramm
// ═══════════════════════════════════════════════════════════════════
// Open Source – CC BY 4.0

let board = new Board(1280, 720);

// ───────────────────────────────────────────────────────────────────
// FARBPALETTE
// ───────────────────────────────────────────────────────────────────

const colors = {
  bg: 0xf5f5f5,
  dark: 0x333333,
  white: 0xffffff,
  grid: 0xcccccc,
  arm1: 0x0066cc, // Blau für erstes Glied
  arm2: 0xcc3300, // Rot für zweites Glied
  mass1: 0x0055aa, // Dunkelblau für erste Masse
  mass2: 0xaa2200, // Dunkelrot für zweite Masse
  pivot: 0x444444, // Grau für Aufhängung
  trail: 0x666666, // Grau für Spur
  grabHandle: 0x88cc88, // Grün für Anfasspunkte
};

// ───────────────────────────────────────────────────────────────────
// PHYSIKALISCHE PARAMETER
// ───────────────────────────────────────────────────────────────────

// Pendellängen (in Pixel für Anzeige)
let L1 = 150; // Länge des ersten Glieds
let L2 = 150; // Länge des zweiten Glieds

// Massen (in kg - beeinflusst die Dynamik)
let m1 = 2.0; // Masse am Ende von Glied 1
let m2 = 2.0; // Masse am Ende von Glied 2

// Gravitationskonstante (skaliert für visuelle Darstellung)
let g = 500; // Gravitation in Pixel/s²

// Dämpfung
let damping = 0.0; // Dämpfungsfaktor (0 = keine Dämpfung)

// Winkel (in Radiant) - gemessen von der Senkrechten
// V-Form: Erstes Pendel 45° nach rechts unten, zweites 45° nach rechts oben
let theta1 = Math.PI / 4; // Winkel des ersten Glieds (45° nach rechts unten)
let theta2 = (3 * Math.PI) / 4; // Winkel des zweiten Glieds (135° = zeigt nach rechts oben für V-Form)

// Winkelgeschwindigkeiten
let omega1 = 0; // Winkelgeschwindigkeit Glied 1
let omega2 = 0; // Winkelgeschwindigkeit Glied 2

// Aufhängepunkt
let pivotX = 340;
let pivotY = 370;

// Simulationszustand
let isRunning = false;
let isDragging = false;
let dragTarget = null; // 'mass1', 'mass2', 'arm1', 'arm2'
let dragOffset = { x: 0, y: 0 };

// Zeitschritt für Simulation
let dt = 1 / 60;
let time = 0;

// Kurvendaten für das Diagramm
let maxDataPoints = 600; // 10 Sekunden bei 60 fps
let theta1History = [];
let theta2History = [];
let timeHistory = [];

// Spur des zweiten Pendels
let trailPoints = [];
let maxTrailPoints = 500;

// Startwerte speichern für Reset
let initialTheta1 = theta1;
let initialTheta2 = theta2;

// ───────────────────────────────────────────────────────────────────
// HILFSFUNKTIONEN
// ───────────────────────────────────────────────────────────────────

// Formatiert eine Zahl mit deutschem Dezimalkomma
function formatNumber(value, decimals) {
  return value.toFixed(decimals).replace(".", ",");
}

// Winkel in Grad umrechnen
function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

// Normalisiert Winkel auf -π bis π
function normalizeAngle(angle) {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

// Berechnet die Positionen der Massen
function calculatePositions() {
  let x1 = pivotX + L1 * Math.sin(theta1);
  let y1 = pivotY + L1 * Math.cos(theta1);

  let x2 = x1 + L2 * Math.sin(theta2);
  let y2 = y1 + L2 * Math.cos(theta2);

  return { x1, y1, x2, y2 };
}

// Berechnet Winkelbeschleunigungen mit den Lagrange-Gleichungen
function calculateAccelerations() {
  let M = m1 + m2;
  let cosD = Math.cos(theta1 - theta2);
  let sinD = Math.sin(theta1 - theta2);

  // Nenner der Gleichungen
  let denom = M * L1 - m2 * L1 * cosD * cosD;

  // Beschleunigung für theta1
  let alpha1 =
    (m2 * L1 * omega1 * omega1 * sinD * cosD +
      m2 * g * Math.sin(theta2) * cosD +
      m2 * L2 * omega2 * omega2 * sinD -
      M * g * Math.sin(theta1)) /
    denom;

  // Beschleunigung für theta2
  let alpha2 =
    (-m2 * L2 * omega2 * omega2 * sinD * cosD +
      M * g * Math.sin(theta1) * cosD -
      M * L1 * omega1 * omega1 * sinD -
      M * g * Math.sin(theta2)) /
    ((L2 * denom) / L1);

  // Dämpfung hinzufügen
  alpha1 -= damping * omega1;
  alpha2 -= damping * omega2;

  return { alpha1, alpha2 };
}

// Runge-Kutta 4. Ordnung für bessere Genauigkeit
function rungeKuttaStep(dt) {
  // Zustand: [theta1, omega1, theta2, omega2]

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

  // Aktualisieren
  theta1 += (dt * (k1.dth1 + 2 * k2.dth1 + 2 * k3.dth1 + k4.dth1)) / 6;
  omega1 += (dt * (k1.dom1 + 2 * k2.dom1 + 2 * k3.dom1 + k4.dom1)) / 6;
  theta2 += (dt * (k1.dth2 + 2 * k2.dth2 + 2 * k3.dth2 + k4.dth2)) / 6;
  omega2 += (dt * (k1.dom2 + 2 * k2.dom2 + 2 * k3.dom2 + k4.dom2)) / 6;
}

// ───────────────────────────────────────────────────────────────────
// STEUERUNG: SLIDER (OBEN IN EINER REIHE)
// ───────────────────────────────────────────────────────────────────

let sliderY = 20;
let sliderWidth = 160;
let sliderSpacing = 200;
let sliderStartX = 40;

// Länge 1
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

// Länge 2
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

// Masse 1
let labelM1 = new Text("m<sub>1</sub>:", "Arial", 20, colors.dark, "left");
labelM1.x = sliderStartX + 2 * sliderSpacing;
labelM1.y = sliderY - 3;

let valueM1 = new Text("2,0 kg", "Arial", 20, colors.dark, "left");
valueM1.x = sliderStartX + 2 * sliderSpacing;
valueM1.y = sliderY + 80;

let sliderM1 = new ButtonSlider(0.5, 5, 2, 0.5, 50, sliderWidth);
sliderM1.x = sliderStartX + 2 * sliderSpacing;
sliderM1.y = sliderY + 25;

sliderM1.onChange(function (e) {
  m1 = e.value;
  valueM1.setText(formatNumber(m1, 1) + " kg");
});

// Masse 2
let labelM2 = new Text("m<sub>2</sub>:", "Arial", 20, colors.dark, "left");
labelM2.x = sliderStartX + 3 * sliderSpacing;
labelM2.y = sliderY - 3;

let valueM2 = new Text("2,0 kg", "Arial", 20, colors.dark, "left");
valueM2.x = sliderStartX + 3 * sliderSpacing;
valueM2.y = sliderY + 80;

let sliderM2 = new ButtonSlider(0.5, 5, 2, 0.5, 50, sliderWidth);
sliderM2.x = sliderStartX + 3 * sliderSpacing;
sliderM2.y = sliderY + 25;

sliderM2.onChange(function (e) {
  m2 = e.value;
  valueM2.setText(formatNumber(m2, 1) + " kg");
});

// Gravitation
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

// Dämpfung
let labelDamp = new Text("Dämpfung:", "Arial", 20, colors.dark, "left");
labelDamp.x = sliderStartX + 5 * sliderSpacing;
labelDamp.y = sliderY - 3;

let valueDamp = new Text("0,0", "Arial", 20, colors.dark, "left");
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
// BEREICH 1: PENDEL-VISUALISIERUNG (links)
// ───────────────────────────────────────────────────────────────────

// Aufhängepunkt
let pivotCircle = new Circle(8, colors.pivot);
pivotCircle.x = pivotX;
pivotCircle.y = pivotY;

// Befestigung (Decke)
let ceiling = new Rectangle(200, 10, colors.dark);
ceiling.x = pivotX - 100;
ceiling.y = pivotY - 50;

let ceilingLine = new Line(pivotX, pivotY - 40, pivotX, pivotY, colors.dark, 2);

// Erstes Pendelglied (Stab)
let arm1 = new Line(pivotX, pivotY, pivotX, pivotY + L1, colors.arm1, 4);

// Erste Masse
let mass1Circle = new Circle(20, colors.mass1);
mass1Circle.setBorder(colors.dark, 2);

// Zweites Pendelglied (Stab)
let arm2 = new Line(0, 0, 0, 0, colors.arm2, 4);

// Zweite Masse
let mass2Circle = new Circle(20, colors.mass2);
mass2Circle.setBorder(colors.dark, 2);

// Spur der zweiten Masse
let trail = new LinePath(
  [
    [0, 0],
    [1, 1],
  ],
  colors.trail,
  1,
);
trail.setAlpha(0.5);

// Winkelmarkierungen
// Vertikale Referenzlinie für theta1 (gestrichelt)
let refLine1 = new Line(pivotX, pivotY, pivotX, pivotY + 80, colors.grid, 1);
refLine1.setStrokeDash([4, 4]);

// Winkel theta1 (vom Lot zum ersten Glied)
let angleLabel1 = new AngleLabel(
  pivotX,
  pivotY, // Zentrum
  pivotX,
  pivotY + 60, // Arm 1 (Lot nach unten)
  pivotX + 60,
  pivotY, // Arm 2 (wird dynamisch gesetzt)
  35, // Radius
  "θ₁", // Label
  "Arial",
  20,
  colors.arm1, // Schrift
  1,
  colors.arm1, // Linie
);

// Vertikale Referenzlinie für theta2 (gestrichelt, wird dynamisch positioniert)
let refLine2 = new Line(0, 0, 0, 80, colors.grid, 1);
refLine2.setStrokeDash([4, 4]);

// Winkel theta2 (vom Lot zum zweiten Glied)
let angleLabel2 = new AngleLabel(
  0,
  0, // Zentrum (wird dynamisch gesetzt)
  0,
  60, // Arm 1 (Lot nach unten)
  60,
  0, // Arm 2 (wird dynamisch gesetzt)
  35, // Radius
  "θ₂", // Label
  "Arial",
  20,
  colors.arm2, // Schrift
  1,
  colors.arm2, // Linie
);

// Unsichtbare größere Kreise für besseres Anfassen
let grabArea1 = new Circle(35, 0x000000);
grabArea1.setAlpha(0.0);

let grabArea2 = new Circle(35, 0x000000);
grabArea2.setAlpha(0.0);

// ───────────────────────────────────────────────────────────────────
// BEREICH 2: WINKEL-ZEIT-DIAGRAMM (rechts, schmaler)
// ───────────────────────────────────────────────────────────────────

let graphX = 770;
let graphY = 350;
let graphWidth = 400;
let graphHeight = 280;

// Koordinatensystem
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

// Achsenbeschriftungen
let labelT = new Text("t (s)", "Arial", 20, colors.dark, "left");
labelT.x = graphX + graphWidth + 10;
labelT.y = graphY - 5;

let labelTheta = new Text("θ (°)", "Arial", 20, colors.dark, "left");
labelTheta.x = graphX - 60;
labelTheta.y = graphY - graphHeight / 2 - 35;

// Skalenbeschriftung y-Achse
let labelPlus180 = new Text("+180°", "Arial", 20, colors.dark, "right");
labelPlus180.x = graphX - 80;
labelPlus180.y = graphY - graphHeight / 2;

let labelMinus180 = new Text("-180°", "Arial", 20, colors.dark, "right");
labelMinus180.x = graphX - 80;
labelMinus180.y = graphY + graphHeight / 2 - 35;

let label0 = new Text("0°", "Arial", 20, colors.dark, "right");
label0.x = graphX - 40;
label0.y = graphY - 20;

// Kurve für theta1
let curveTheta1 = new LinePath([[0, 0]], colors.arm1, 2);
curveTheta1.x = graphX;
curveTheta1.y = graphY;

// Kurve für theta2
let curveTheta2 = new LinePath([[0, 0]], colors.arm2, 2);
curveTheta2.x = graphX;
curveTheta2.y = graphY;

// ───────────────────────────────────────────────────────────────────
// AKTUELLE WERTE ANZEIGE (neues Layout: Winkel und Omega nebeneinander)
// ───────────────────────────────────────────────────────────────────

let infoX = 700;
let infoY = 570;
let omegaOffsetX = 150;

let infoTitle = new Text("Aktuelle Werte:", "Arial", 20, colors.dark, "left");
infoTitle.x = infoX;
infoTitle.y = infoY;

let infoTime = new Text("t = 0,00 s", "Arial", 20, colors.dark, "left");
infoTime.x = infoX;
infoTime.y = infoY + 30;

// Zeile 1: θ₁ und ω₁ nebeneinander
let infoTheta1 = new Text("θ₁ = 45,0°", "Arial", 20, colors.arm1, "left");
infoTheta1.x = infoX;
infoTheta1.y = infoY + 55;

let infoOmega1 = new Text("ω₁ = 0,00 rad/s", "Arial", 20, colors.arm1, "left");
infoOmega1.x = infoX + omegaOffsetX;
infoOmega1.y = infoY + 55;

// Zeile 2: θ₂ und ω₂ nebeneinander
let infoTheta2 = new Text("θ₂ = 135,0°", "Arial", 20, colors.arm2, "left");
infoTheta2.x = infoX;
infoTheta2.y = infoY + 80;

let infoOmega2 = new Text("ω₂ = 0,00 rad/s", "Arial", 20, colors.arm2, "left");
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
// MAUS-INTERAKTION
// ───────────────────────────────────────────────────────────────────

// Funktion zum Berechnen des Winkels von einem Punkt relativ zum Pivot
function calculateAngleFromMouse(mouseX, mouseY, pivotPosX, pivotPosY) {
  let dx = mouseX - pivotPosX;
  let dy = mouseY - pivotPosY;
  return Math.atan2(dx, dy); // Winkel von der Senkrechten
}

// Dragging für erste Masse mit setDragging
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
    // Winkel aus aktueller Position des Grab-Bereichs berechnen
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

// Dragging für zweite Masse mit setDragging
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
    // Position von Masse 1 berechnen
    let x1 = pivotX + L1 * Math.sin(theta1);
    let y1 = pivotY + L1 * Math.cos(theta1);
    // Winkel aus aktueller Position des Grab-Bereichs relativ zu Masse 1
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
// UPDATE-FUNKTIONEN
// ───────────────────────────────────────────────────────────────────

function updateDisplay() {
  let pos = calculatePositions();

  // Erstes Glied
  arm1.setStart(pivotX, pivotY);
  arm1.setEnd(pos.x1, pos.y1);

  // Erste Masse
  mass1Circle.x = pos.x1;
  mass1Circle.y = pos.y1;
  grabArea1.x = pos.x1;
  grabArea1.y = pos.y1;

  // Zweites Glied
  arm2.setStart(pos.x1, pos.y1);
  arm2.setEnd(pos.x2, pos.y2);

  // Zweite Masse
  mass2Circle.x = pos.x2;
  mass2Circle.y = pos.y2;
  grabArea2.x = pos.x2;
  grabArea2.y = pos.y2;

  // Winkelmarkierung theta1 aktualisieren
  // Arm1 des AngleLabel zeigt nach unten (Lot), Arm2 zeigt zur Masse
  angleLabel1.setCenter(pivotX, pivotY);
  angleLabel1.setArm1(pivotX, pivotY + 60); // Lot nach unten
  angleLabel1.setArm2(pos.x1, pos.y1); // Richtung erste Masse

  // Referenzlinie für theta2 positionieren (vom Gelenk nach unten)
  refLine2.setStart(pos.x1, pos.y1);
  refLine2.setEnd(pos.x1, pos.y1 + 80);

  // Winkelmarkierung theta2 aktualisieren
  angleLabel2.setCenter(pos.x1, pos.y1);
  angleLabel2.setArm1(pos.x1, pos.y1 + 60); // Lot nach unten
  angleLabel2.setArm2(pos.x2, pos.y2); // Richtung zweite Masse

  // Info-Texte aktualisieren
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
  // Kurvendaten aktualisieren
  let tMax = 10; // 10 Sekunden Anzeige
  let pixelsPerSecond = graphWidth / tMax;
  let degreesPerPixel = 180 / (graphHeight / 2);

  // Punkte für Kurven erstellen
  let points1 = [];
  let points2 = [];

  for (let i = 0; i < theta1History.length; i++) {
    let x = timeHistory[i] * pixelsPerSecond;
    // Winkel auf -180 bis +180 normalisieren
    let angle1 = toDegrees(normalizeAngle(theta1History[i]));
    let angle2 = toDegrees(normalizeAngle(theta2History[i]));

    let y1 = (-angle1 / 180) * (graphHeight / 2); // Negativ weil y nach unten wächst
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

  // Neuen Punkt hinzufügen
  trailPoints.push([pos.x2, pos.y2]);

  // Alte Punkte entfernen
  if (trailPoints.length > maxTrailPoints) {
    trailPoints.shift();
  }

  // Trail aktualisieren
  if (trailPoints.length > 1) {
    trail.setPoints(trailPoints);
  }
}

function resetSimulation() {
  time = 0;
  theta1 = initialTheta1; // V-Form Startposition
  theta2 = initialTheta2;
  omega1 = 0;
  omega2 = 0;

  theta1History = [];
  theta2History = [];
  timeHistory = [];
  trailPoints = [];

  isRunning = false;
  playButton.setText("Start");

  // Kurven zurücksetzen
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
    // Mehrere kleine Schritte für Stabilität
    let subSteps = 4;
    let subDt = dt / subSteps;

    for (let i = 0; i < subSteps; i++) {
      rungeKuttaStep(subDt);
    }

    time += dt;

    // Daten für Diagramm speichern
    theta1History.push(theta1);
    theta2History.push(theta2);
    timeHistory.push(time);

    // Alte Daten entfernen wenn zu viele
    if (theta1History.length > maxDataPoints) {
      theta1History.shift();
      theta2History.shift();
      timeHistory.shift();
      // Zeit anpassen für kontinuierliches Scrollen
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

// Initiale Anzeige
updateDisplay();
