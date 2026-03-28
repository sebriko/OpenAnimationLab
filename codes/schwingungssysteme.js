// Created with Open Animation Lab
// ═══════════════════════════════════════════════════════════════════
// GEDÄMPFTE UND UNGEDÄMPFTE SCHWINGUNGEN
// Vergleich von Feder-Masse-Systemen mit und ohne Dämpfung
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
  undamped: 0x0066cc, // Blau für ungedämpfte Schwingung
  damped: 0xcc3300, // Rot für gedämpfte Schwingung
  spring: 0x666666, // Grau für die Feder
  mass: 0x888888, // Masse
  envelope: 0xcc3300, // Einhüllende
};

// ───────────────────────────────────────────────────────────────────
// GLOBALE PARAMETER
// ───────────────────────────────────────────────────────────────────

let amplitude = 80; // Amplitude in Pixel
let frequency = 0.5; // Frequenz in Hz
let damping = 0.3; // Dämpfungskonstante (nur für gedämpfte)
let time = 0;
let dt = 1 / 60; // Zeitschritt
let isPlaying = false;

// Physikalische Positionen
let restPosition = 400; // Ruhelage der Massen (y-Koordinate)
let springTopY = 130; // Oberer Befestigungspunkt der Feder

// ───────────────────────────────────────────────────────────────────
// HILFSFUNKTIONEN
// ───────────────────────────────────────────────────────────────────

// Formatiert eine Zahl mit deutschem Dezimalkomma
function formatNumber(value, decimals) {
  return value.toFixed(decimals).replace(".", ",");
}

// Erzeugt Zickzack-Punkte für eine Feder
function createSpringPoints(startX, startY, endY, coils) {
  let points = [];
  let springLength = endY - startY;
  let coilHeight = springLength / coils;
  let coilWidth = 15;

  // Oberer gerader Teil
  points.push([startX, startY]);
  points.push([startX, startY + 10]);

  // Zickzack-Teil
  for (let i = 0; i < coils; i++) {
    let y1 = startY + 10 + i * coilHeight + coilHeight * 0.25;
    let y2 = startY + 10 + i * coilHeight + coilHeight * 0.75;

    if (i % 2 === 0) {
      points.push([startX + coilWidth, y1]);
      points.push([startX - coilWidth, y2]);
    } else {
      points.push([startX - coilWidth, y1]);
      points.push([startX + coilWidth, y2]);
    }
  }

  return points;
}

// Berechnet die ungedämpfte Auslenkung (Start bei -A = obere Lage)
function getUndampedDisplacement(t) {
  let omega = 2 * Math.PI * frequency;
  return -amplitude * Math.cos(omega * t);
}

// Berechnet die gedämpfte Auslenkung (Start bei -A = obere Lage)
function getDampedDisplacement(t) {
  let omega = 2 * Math.PI * frequency;
  let decay = Math.exp(-damping * t);
  return -amplitude * decay * Math.cos(omega * t);
}

// Berechnet das dynamische Delta basierend auf der Frequenz
function getDynamicDelta() {
  // Basis-Delta bei Frequenz 0.5 Hz ist 3 Pixel
  // Bei Frequenz 2.0 Hz soll es 3x kleiner sein (also 1 Pixel)
  // Lineare Interpolation: delta = baseDelta / (1 + (f - 0.5) * 2/1.5)
  // Vereinfacht: delta = baseDelta * 0.5 / max(frequency, 0.5)
  let baseDelta = 3;
  let referencFreq = 0.5;

  if (frequency <= referencFreq) {
    return baseDelta;
  }

  // Bei 2.0 Hz: delta = 3 * 0.5 / 2.0 = 0.75 ≈ 1 (also ca. 3x kleiner)
  return (baseDelta * referencFreq) / frequency;
}

// ───────────────────────────────────────────────────────────────────
// BEREICH 1: UNGEDÄMPFTE SCHWINGUNG (links)
// ───────────────────────────────────────────────────────────────────

// Befestigung oben
let mount1 = new Rectangle(80, 10, colors.dark);
mount1.x = 90;
mount1.y = springTopY - 5;

// Feder (ungedämpft) - wird als LinePath gezeichnet
let spring1Points = createSpringPoints(130, springTopY, restPosition - 25, 8);
let spring1 = new LinePath(spring1Points, colors.spring, 2);

// Masse (ungedämpft)
let mass1 = new Rectangle(60, 50, colors.undamped);
mass1.setBorder(colors.dark, 2);
mass1.x = 100;
mass1.y = restPosition - 25;

// Ruhelage-Markierung (gestrichelt)
let restLine1 = new Line(70, restPosition, 190, restPosition, colors.grid, 1);
restLine1.setStrokeDash([5, 5]);

// ───────────────────────────────────────────────────────────────────
// BEREICH 2: GEDÄMPFTE SCHWINGUNG (mitte-links)
// ───────────────────────────────────────────────────────────────────

// Befestigung oben
let mount2 = new Rectangle(80, 10, colors.dark);
mount2.x = 290;
mount2.y = springTopY - 5;

// Feder (gedämpft)
let spring2Points = createSpringPoints(330, springTopY, restPosition - 25, 8);
let spring2 = new LinePath(spring2Points, colors.spring, 2);

// Masse (gedämpft)
let mass2 = new Rectangle(60, 50, colors.damped);
mass2.setBorder(colors.dark, 2);
mass2.x = 300;
mass2.y = restPosition - 25;

// Ruhelage-Markierung
let restLine2 = new Line(270, restPosition, 390, restPosition, colors.grid, 1);
restLine2.setStrokeDash([5, 5]);

// ───────────────────────────────────────────────────────────────────
// BEREICH 3: KURVENDIAGRAMM (rechts)
// ───────────────────────────────────────────────────────────────────

let graphX = 480;
let graphY = 400;
let graphWidth = 700;
let graphHeight = 280;

// Koordinatensystem
let coordSystem = new CoordinateSystem(
  0,
  graphWidth,
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
let labelT = new Text("t", "Arial", 20, colors.dark, "left");
labelT.x = graphX + graphWidth + 5;
labelT.y = graphY + 5;

let labelY = new Text("y(t)", "Arial", 20, colors.dark, "left");
labelY.x = graphX - 50;
labelY.y = graphY - graphHeight / 2 - 20;

// Skalenbeschriftung für y-Achse
let labelPlus = new Text("+A", "Arial", 20, colors.dark, "right");
labelPlus.x = graphX - 40;
labelPlus.y = graphY - graphHeight / 2 + amplitude - 8;

let labelMinus = new Text("-A", "Arial", 20, colors.dark, "right");
labelMinus.x = graphX - 40;
labelMinus.y = graphY + graphHeight / 2 - amplitude - 8;

// Kurve für ungedämpfte Schwingung
let curveUndamped = new LinePath(
  [
    [0, 0],
    [10, 0],
  ],
  colors.undamped,
  2,
);
curveUndamped.x = graphX;
curveUndamped.y = graphY;

// Kurve für gedämpfte Schwingung
let curveDamped = new LinePath(
  [
    [0, 0],
    [10, 0],
  ],
  colors.damped,
  2,
);
curveDamped.x = graphX;
curveDamped.y = graphY;

// Einhüllende für gedämpfte Schwingung (obere)
let envelopeUpper = new LinePath(
  [
    [0, 0],
    [10, 0],
  ],
  colors.envelope,
  1,
);
envelopeUpper.x = graphX;
envelopeUpper.y = graphY;
envelopeUpper.setAlpha(0.5);

// Einhüllende (untere)
let envelopeLower = new LinePath(
  [
    [0, 0],
    [10, 0],
  ],
  colors.envelope,
  1,
);
envelopeLower.x = graphX;
envelopeLower.y = graphY;
envelopeLower.setAlpha(0.5);

// Marker für aktuelle Position auf den Kurven
let markerUndamped = new Circle(6, colors.undamped);
markerUndamped.x = graphX;
markerUndamped.y = graphY;

let markerDamped = new Circle(6, colors.damped);
markerDamped.x = graphX;
markerDamped.y = graphY;

// ───────────────────────────────────────────────────────────────────
// VERBINDUNGSLINIEN: Masse zu Kurve
// ───────────────────────────────────────────────────────────────────

let connectionLine1 = new Line(0, 0, 0, 0, colors.undamped, 1);
connectionLine1.setStrokeDash([5, 5]);
connectionLine1.setAlpha(0.7);

let connectionLine2 = new Line(0, 0, 0, 0, colors.damped, 1);
connectionLine2.setStrokeDash([5, 5]);
connectionLine2.setAlpha(0.7);

// ───────────────────────────────────────────────────────────────────
// LEGENDE
// ───────────────────────────────────────────────────────────────────

let legendX = 500;
let legendY = 645;

let legendLine1 = new Line(
  legendX,
  legendY,
  legendX + 30,
  legendY,
  colors.undamped,
  2,
);
let legendText1 = new Text(
  "Ungedämpft: y(t) = -A·cos(ωt)",
  "Arial",
  20,
  colors.undamped,
  "left",
);
legendText1.x = legendX + 40;
legendText1.y = legendY - 23;

let legendLine2 = new Line(
  legendX,
  legendY + 25,
  legendX + 30,
  legendY + 25,
  colors.damped,
  2,
);
let legendText2 = new Text(
  "Gedämpft: y(t) = -A·e<sup>-δt</sup>·cos(ωt)",
  "Arial",
  20,
  colors.damped,
  "left",
);
legendText2.x = legendX + 40;
legendText2.y = legendY + 2;

// ───────────────────────────────────────────────────────────────────
// STEUERUNG: SLIDER (alle 3 nebeneinander, 80px nach links)
// ───────────────────────────────────────────────────────────────────

let sliderBaseX = 380; // Basis-Position (30px nach links)
let sliderSpacing = 310; // Abstand zwischen den Slidern (30px mehr)
let sliderY = 20; // Y-Position für alle Slider

// Amplitude (erste Spalte)
let labelAmp = new Text("Amplitude A:", "Arial", 20, colors.dark, "left");
labelAmp.x = sliderBaseX;
labelAmp.y = sliderY;

let valueAmp = new Text("80 px", "Arial", 20, colors.dark, "left");
valueAmp.x = sliderBaseX + 220;
valueAmp.y = sliderY + 40;

let sliderAmp = new ButtonSlider(20, 120, 80, 5, 50, 200);
sliderAmp.x = sliderBaseX;
sliderAmp.y = sliderY + 30;

sliderAmp.onChange(function (e) {
  amplitude = e.value;
  valueAmp.setText(formatNumber(amplitude, 0) + " px");
  updateDisplay();
});

// Frequenz (zweite Spalte)
let labelFreq = new Text("Frequenz f:", "Arial", 20, colors.dark, "left");
labelFreq.x = sliderBaseX + sliderSpacing;
labelFreq.y = sliderY;

let valueFreq = new Text("0,5 Hz", "Arial", 20, colors.dark, "left");
valueFreq.x = sliderBaseX + sliderSpacing + 220;
valueFreq.y = sliderY + 40;

let sliderFreq = new ButtonSlider(0.1, 2, 0.5, 0.1, 50, 200);
sliderFreq.x = sliderBaseX + sliderSpacing;
sliderFreq.y = sliderY + 30;

sliderFreq.onChange(function (e) {
  frequency = e.value;
  valueFreq.setText(formatNumber(frequency, 1) + " Hz");
  updateDisplay();
});

// Dämpfung (dritte Spalte)
let labelDamp = new Text("Dämpfung δ:", "Arial", 20, colors.damped, "left");
labelDamp.x = sliderBaseX + 2 * sliderSpacing;
labelDamp.y = sliderY;

let valueDamp = new Text("0,3", "Arial", 20, colors.dark, "left");
valueDamp.x = sliderBaseX + 2 * sliderSpacing + 220;
valueDamp.y = sliderY + 40;

let sliderDamp = new ButtonSlider(0, 2, 0.3, 0.1, 50, 200);
sliderDamp.x = sliderBaseX + 2 * sliderSpacing;
sliderDamp.y = sliderY + 30;

sliderDamp.onChange(function (e) {
  damping = e.value;
  valueDamp.setText(formatNumber(damping, 1));
  updateDisplay();
});

// ───────────────────────────────────────────────────────────────────
// PLAY/PAUSE UND RESET BUTTONS
// ───────────────────────────────────────────────────────────────────

let playButton = new Button("Start", 90, 40, "Arial", 20);
playButton.x = 1030;
playButton.y = 640;

playButton.onClick(function () {
  isPlaying = !isPlaying;
  if (isPlaying) {
    playButton.setText("Pause");
    timer.start();
  } else {
    playButton.setText("Start");
  }
});

let resetButton = new Button("Reset", 80, 40, "Arial", 20);
resetButton.x = 1140;
resetButton.y = 640;

resetButton.onClick(function () {
  time = 0;
  updateDisplay();
});

// ───────────────────────────────────────────────────────────────────
// BERECHNETE WERTE ANZEIGE
// ───────────────────────────────────────────────────────────────────

let calcTitle = new Text("Aktuelle Werte:", "Arial", 20, colors.dark, "left");
calcTitle.x = 40;
calcTitle.y = 550;

let calcTime = new Text("t = 0,00 s", "Arial", 20, colors.dark, "left");
calcTime.x = 40;
calcTime.y = 575;

let calcY1 = new Text("y₁ = -80,0 px", "Arial", 20, colors.undamped, "left");
calcY1.x = 40;
calcY1.y = 600;

let calcY2 = new Text("y₂ = -80,0 px", "Arial", 20, colors.damped, "left");
calcY2.x = 40;
calcY2.y = 625;

let calcPeriod = new Text("T = 2,00 s", "Arial", 20, colors.dark, "left");
calcPeriod.x = 40;
calcPeriod.y = 650;

// ───────────────────────────────────────────────────────────────────
// UPDATE-FUNKTIONEN
// ───────────────────────────────────────────────────────────────────

function updateDisplay() {
  updateMassPositions();
  updateCurves();
  updateCalculatedValues();
}

function updateMassPositions() {
  // Aktuelle Auslenkungen
  let y1 = getUndampedDisplacement(time);
  let y2 = getDampedDisplacement(time);

  // Positionen der Massen (y ist nach unten positiv, Auslenkung nach unten = positiv)
  let mass1Y = restPosition - 25 + y1;
  let mass2Y = restPosition - 25 + y2;

  // Massen positionieren
  mass1.y = mass1Y;
  mass2.y = mass2Y;

  // Federn aktualisieren
  let spring1NewPoints = createSpringPoints(130, springTopY, mass1Y, 8);
  spring1.setPoints(spring1NewPoints);

  let spring2NewPoints = createSpringPoints(330, springTopY, mass2Y, 8);
  spring2.setPoints(spring2NewPoints);

  // Zeitspanne für das Diagramm
  let tMax = 10;
  let pixelsPerSecond = graphWidth / tMax;

  // Marker-Position auf der x-Achse (wandert mit der Zeit nach rechts)
  let markerX = graphX + time * pixelsPerSecond;

  // Marker-Position auf der y-Achse (gleiche Berechnung wie Kurve)
  // KORRIGIERT: Jetzt mit negativem Vorzeichen wie die Kurven
  let omega = 2 * Math.PI * frequency;
  let curveY1 = -amplitude * Math.cos(omega * time);
  let decay = Math.exp(-damping * time);
  let curveY2 = -amplitude * decay * Math.cos(omega * time);

  let markerY1 = graphY + curveY1;
  let markerY2 = graphY + curveY2;

  // Mitte der Massen (für die Verbindungslinie)
  let mass1CenterY = mass1Y + 25;
  let mass2CenterY = mass2Y + 25;

  // Waagerechte Verbindungslinien (gleiche Y-Koordinate)
  connectionLine1.setStart(160, mass1CenterY);
  connectionLine1.setEnd(markerX, mass1CenterY);

  connectionLine2.setStart(360, mass2CenterY);
  connectionLine2.setEnd(markerX, mass2CenterY);

  // Marker auf den Kurven (wandern nach rechts)
  markerUndamped.x = markerX;
  markerUndamped.y = markerY1;

  markerDamped.x = markerX;
  markerDamped.y = markerY2;
}

function updateCurves() {
  let pointsUndamped = [];
  let pointsDamped = [];
  let pointsEnvUpper = [];
  let pointsEnvLower = [];

  // Zeitspanne: 10 Sekunden auf der x-Achse
  let tMax = 10;
  let pixelsPerSecond = graphWidth / tMax;

  // Dynamisches Delta basierend auf Frequenz
  let deltaX = getDynamicDelta();

  for (let x = 0; x <= graphWidth; x += deltaX) {
    let t = x / pixelsPerSecond;

    // KORRIGIERT: Ungedämpfte Kurve mit negativem Vorzeichen (Minimum bei t=0)
    let omega = 2 * Math.PI * frequency;
    let y1 = -amplitude * Math.cos(omega * t);
    pointsUndamped.push([x, y1]);

    // KORRIGIERT: Gedämpfte Kurve mit negativem Vorzeichen (Minimum bei t=0)
    let decay = Math.exp(-damping * t);
    let y2 = -amplitude * decay * Math.cos(omega * t);
    pointsDamped.push([x, y2]);

    // Einhüllende
    let envelope = amplitude * decay;
    pointsEnvUpper.push([x, envelope]);
    pointsEnvLower.push([x, -envelope]);
  }

  curveUndamped.setPoints(pointsUndamped);
  curveDamped.setPoints(pointsDamped);
  envelopeUpper.setPoints(pointsEnvUpper);
  envelopeLower.setPoints(pointsEnvLower);

  // Einhüllende nur anzeigen wenn Dämpfung > 0
  envelopeUpper.visible = damping > 0.01;
  envelopeLower.visible = damping > 0.01;
}

function updateCalculatedValues() {
  let y1 = getUndampedDisplacement(time);
  let y2 = getDampedDisplacement(time);
  let period = 1 / frequency;

  calcTime.setText("t = " + formatNumber(time, 2) + " s");
  calcY1.setText("y₁ = " + formatNumber(y1, 1) + " px");
  calcY2.setText("y₂ = " + formatNumber(y2, 1) + " px");
  calcPeriod.setText("T = " + formatNumber(period, 2) + " s");
}

// ───────────────────────────────────────────────────────────────────
// ANIMATION
// ───────────────────────────────────────────────────────────────────

let timer = new Timer();

// Zeitspanne für das Diagramm
let tMax = 10;

timer.onUpdate(function () {
  if (isPlaying) {
    time += dt;

    // Animation stoppen wenn Ende des Diagramms erreicht
    if (time >= tMax) {
      time = tMax;
      isPlaying = false;
      playButton.setText("Start");
    }

    updateMassPositions();
    updateCalculatedValues();
  }
});

// Initiale Anzeige
updateDisplay();
