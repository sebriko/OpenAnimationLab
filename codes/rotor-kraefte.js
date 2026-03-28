// Created with Open Animation Lab

// ===== ABSCHNITT 1: BOARD UND VARIABLEN =====

let board = new Board(1280, 720);

// Konstanten und globale Variablen
let centerX = 640;
let centerY = 360;
let radius = 150;
let arrowLength = 100; // Länge der Gravitationspfeile
let tangentialArrowLength = 80; // Länge der Tangentialpfeile (etwas kürzer)
let centrifugalArrowLength = 90; // Länge der Fliehkraftpfeile (fest)
let isAnimating = false;

// UI-Variablen
let checkboxStartX = 970;
let checkboxStartY = 100;
let checkboxSpacing = 50;

// ===== ABSCHNITT 2: OBJEKTE =====

// Hintergrund
let himmel = new Rectangle(1280, 720, 0xaad4ff);
himmel.x = 0;
himmel.y = 0;

// SVG-Elemente
let mySVG = new SimpleSVG(
  `<svg xml:space="preserve" viewBox="0 0 432.79 46.67"><path d="M.358 46.326h432.087v-14.71S181.467 21.504 123.549.36C73.905 10.471.896 28.32.896 28.32z" fill="#fff" stroke="#000" stroke-width=".69"/></svg>`,
);
mySVG.setTransformationPoint(0, 35);
mySVG.setRotationPoint(0, 35);

let mySVG2 = new SimpleSVG(
  `<svg xml:space="preserve" viewBox="0 0 432.79 46.67"><path d="M.358 46.326h432.087v-14.71S181.467 21.504 123.549.36C73.905 10.471.896 28.32.896 28.32z" fill="#fff" stroke="#000" stroke-width=".69"/></svg>`,
);
mySVG2.setTransformationPoint(0, 35);
mySVG2.setRotationPoint(0, 35);
mySVG2.rotation = 120;

let mySVG3 = new SimpleSVG(
  `<svg xml:space="preserve" viewBox="0 0 432.79 46.67"><path d="M.358 46.326h432.087v-14.71S181.467 21.504 123.549.36C73.905 10.471.896 28.32.896 28.32z" fill="#fff" stroke="#000" stroke-width=".69"/></svg>`,
);
mySVG3.setTransformationPoint(0, 35);
mySVG3.setRotationPoint(0, 35);
mySVG3.rotation = -120;

// Zentraler Kreis
let myCircle = new Circle(30, 0xffffff);
myCircle.x = 0;
myCircle.y = 0;
myCircle.setBorder(0x333333, 1);

// Gruppe für rotierende Elemente
let myGroup = new Group();
myGroup.addChild(mySVG);
myGroup.addChild(mySVG2);
myGroup.addChild(mySVG3);
myGroup.addChild(myCircle);
myGroup.rotation = 90;
myGroup.x = 640;
myGroup.y = 360;
myGroup.setRotationPoint(0, 0);
myGroup.setScale(0.75);

// UI-Elemente
let myButton = new Button("Start", 100, 30, "Arial", 20);
myButton.x = 1100;
myButton.y = 30;

let myTimer = new Timer(9000); // Auf 9000ms erhöht (3x langsamer)
myTimer.start();
myTimer.pause();

// Gravitationspfeile
let vectorGravitation1 = new Arrow(0, 0, 0, 0, 0x0000ff, 2, 26, 12);
vectorGravitation1.x = 0;
vectorGravitation1.y = 0;

let vectorGravitation2 = new Arrow(0, 0, 0, 0, 0x0000ff, 2, 26, 12);
vectorGravitation2.x = 0;
vectorGravitation2.y = 0;

let vectorGravitation3 = new Arrow(0, 0, 0, 0, 0x0000ff, 2, 26, 12);
vectorGravitation3.x = 0;
vectorGravitation3.y = 0;

// Tangentialpfeile
let vectorTangential1 = new Arrow(0, 0, 0, 0, 0x555555, 2, 26, 12);
vectorTangential1.x = 0;
vectorTangential1.y = 0;

let vectorTangential2 = new Arrow(0, 0, 0, 0, 0x555555, 2, 26, 12);
vectorTangential2.x = 0;
vectorTangential2.y = 0;

let vectorTangential3 = new Arrow(0, 0, 0, 0, 0x555555, 2, 26, 12);
vectorTangential3.x = 0;
vectorTangential3.y = 0;

// Fliehkraftpfeile
let vectorCentrifugal1 = new Arrow(0, 0, 0, 0, 0x8b008b, 2, 26, 12);
vectorCentrifugal1.x = 0;
vectorCentrifugal1.y = 0;
vectorCentrifugal1.visible = false; // Startwert: unsichtbar

let vectorCentrifugal2 = new Arrow(0, 0, 0, 0, 0x8b008b, 2, 26, 12);
vectorCentrifugal2.x = 0;
vectorCentrifugal2.y = 0;
vectorCentrifugal2.visible = false; // Startwert: unsichtbar

let vectorCentrifugal3 = new Arrow(0, 0, 0, 0, 0x8b008b, 2, 26, 12);
vectorCentrifugal3.x = 0;
vectorCentrifugal3.y = 0;
vectorCentrifugal3.visible = false; // Startwert: unsichtbar

// Parallelogramme für FG + FU = FRes
let parallelogram1 = new Parallelogram(0, 0, 0, 0, 0, 0, 0x00aa00);
parallelogram1.setAlpha(0.3);
parallelogram1.visible = false; // Startwert: unsichtbar

let parallelogram2 = new Parallelogram(0, 0, 0, 0, 0, 0, 0x00aa00);
parallelogram2.setAlpha(0.3);
parallelogram2.visible = false; // Startwert: unsichtbar

let parallelogram3 = new Parallelogram(0, 0, 0, 0, 0, 0, 0x00aa00);
parallelogram3.setAlpha(0.3);
parallelogram3.visible = false; // Startwert: unsichtbar

// Resultierende Pfeile
let resultantArrow1 = new Arrow(0, 0, 0, 0, 0x00aa00, 2, 26, 12);
resultantArrow1.x = 0;
resultantArrow1.y = 0;
resultantArrow1.visible = false; // Startwert: unsichtbar

let resultantArrow2 = new Arrow(0, 0, 0, 0, 0x00aa00, 2, 26, 12);
resultantArrow2.x = 0;
resultantArrow2.y = 0;
resultantArrow2.visible = false; // Startwert: unsichtbar

let resultantArrow3 = new Arrow(0, 0, 0, 0, 0x00aa00, 2, 26, 12);
resultantArrow3.x = 0;
resultantArrow3.y = 0;
resultantArrow3.visible = false; // Startwert: unsichtbar

// Parallelogramme für FRes + FF = FGes
let parallelogramTotal1 = new Parallelogram(0, 0, 0, 0, 0, 0, 0xff6600);
parallelogramTotal1.setAlpha(0.3);
parallelogramTotal1.visible = false; // Startwert: unsichtbar

let parallelogramTotal2 = new Parallelogram(0, 0, 0, 0, 0, 0, 0xff6600);
parallelogramTotal2.setAlpha(0.3);
parallelogramTotal2.visible = false; // Startwert: unsichtbar

let parallelogramTotal3 = new Parallelogram(0, 0, 0, 0, 0, 0, 0xff6600);
parallelogramTotal3.setAlpha(0.3);
parallelogramTotal3.visible = false; // Startwert: unsichtbar

// Gesamtkraftpfeile
let totalForceArrow1 = new Arrow(0, 0, 0, 0, 0xff6600, 2, 26, 12);
totalForceArrow1.x = 0;
totalForceArrow1.y = 0;
totalForceArrow1.visible = false; // Startwert: unsichtbar

let totalForceArrow2 = new Arrow(0, 0, 0, 0, 0xff6600, 2, 26, 12);
totalForceArrow2.x = 0;
totalForceArrow2.y = 0;
totalForceArrow2.visible = false; // Startwert: unsichtbar

let totalForceArrow3 = new Arrow(0, 0, 0, 0, 0xff6600, 2, 26, 12);
totalForceArrow3.x = 0;
totalForceArrow3.y = 0;
totalForceArrow3.visible = false; // Startwert: unsichtbar

// Antriebskraftpfeile (gelb)
let driveForceArrow1 = new Arrow(0, 0, 0, 0, 0xffff00, 2, 26, 12);
driveForceArrow1.x = 0;
driveForceArrow1.y = 0;
driveForceArrow1.visible = false; // Startwert: unsichtbar

let driveForceArrow2 = new Arrow(0, 0, 0, 0, 0xffff00, 2, 26, 12);
driveForceArrow2.x = 0;
driveForceArrow2.y = 0;
driveForceArrow2.visible = false; // Startwert: unsichtbar

let driveForceArrow3 = new Arrow(0, 0, 0, 0, 0xffff00, 2, 26, 12);
driveForceArrow3.x = 0;
driveForceArrow3.y = 0;
driveForceArrow3.visible = false; // Startwert: unsichtbar

// Gestrichelte Linien von FGes zu FAnt
let dashedLine1 = new Line(0, 0, 0, 0, 0x555555, 2);
dashedLine1.setStrokeDash([7, 7]);
dashedLine1.x = 0;
dashedLine1.y = 0;
dashedLine1.visible = false; // Startwert: unsichtbar

let dashedLine2 = new Line(0, 0, 0, 0, 0x555555, 2);
dashedLine2.setStrokeDash([7, 7]);
dashedLine2.x = 0;
dashedLine2.y = 0;
dashedLine2.visible = false; // Startwert: unsichtbar

let dashedLine3 = new Line(0, 0, 0, 0, 0x555555, 2);
dashedLine3.setStrokeDash([7, 7]);
dashedLine3.x = 0;
dashedLine3.y = 0;
dashedLine3.visible = false; // Startwert: unsichtbar

// Beschriftungen - Gravitationspfeile
let labelGravity1 = new LineLabel(0, 0, 0, 0, "F<sub>G</sub>", 20);
labelGravity1.setFontSize(20);

let labelGravity2 = new LineLabel(0, 0, 0, 0, "F<sub>G</sub>", 20);
labelGravity2.setFontSize(20);

let labelGravity3 = new LineLabel(0, 0, 0, 0, "F<sub>G</sub>", 20);
labelGravity3.setFontSize(20);

// Beschriftungen - Umfangskraft
let labelTangential1 = new LineLabel(0, 0, 0, 0, "F<sub>U</sub>", 20);
labelTangential1.setFontSize(20);

let labelTangential2 = new LineLabel(0, 0, 0, 0, "F<sub>U</sub>", 20);
labelTangential2.setFontSize(20);

let labelTangential3 = new LineLabel(0, 0, 0, 0, "F<sub>U</sub>", 20);
labelTangential3.setFontSize(20);

// Beschriftungen - Fliehkraft
let labelCentrifugal1 = new LineLabel(0, 0, 0, 0, "F<sub>F</sub>", 20);
labelCentrifugal1.setFontSize(20);
labelCentrifugal1.visible = false; // Startwert: unsichtbar

let labelCentrifugal2 = new LineLabel(0, 0, 0, 0, "F<sub>F</sub>", 20);
labelCentrifugal2.setFontSize(20);
labelCentrifugal2.visible = false; // Startwert: unsichtbar

let labelCentrifugal3 = new LineLabel(0, 0, 0, 0, "F<sub>F</sub>", 20);
labelCentrifugal3.setFontSize(20);
labelCentrifugal3.visible = false; // Startwert: unsichtbar

// Beschriftungen - Resultierende Kraft
let labelResultant1 = new LineLabel(0, 0, 0, 0, "F<sub>Res</sub>", 20);
labelResultant1.setFontSize(20);
labelResultant1.visible = false; // Startwert: unsichtbar

let labelResultant2 = new LineLabel(0, 0, 0, 0, "F<sub>Res</sub>", 20);
labelResultant2.setFontSize(20);
labelResultant2.visible = false; // Startwert: unsichtbar

let labelResultant3 = new LineLabel(0, 0, 0, 0, "F<sub>Res</sub>", 20);
labelResultant3.setFontSize(20);
labelResultant3.visible = false; // Startwert: unsichtbar

// Beschriftungen - Gesamtkraft
let labelTotal1 = new LineLabel(0, 0, 0, 0, "F<sub>Ges</sub>", 20);
labelTotal1.setFontSize(20);
labelTotal1.visible = false; // Startwert: unsichtbar

let labelTotal2 = new LineLabel(0, 0, 0, 0, "F<sub>Ges</sub>", 20);
labelTotal2.setFontSize(20);
labelTotal2.visible = false; // Startwert: unsichtbar

let labelTotal3 = new LineLabel(0, 0, 0, 0, "F<sub>Ges</sub>", 20);
labelTotal3.setFontSize(20);
labelTotal3.visible = false; // Startwert: unsichtbar

// Beschriftungen - Antriebskraft
let labelDrive1 = new LineLabel(0, 0, 0, 0, "F<sub>Ant</sub>", 20);
labelDrive1.setFontSize(20);
labelDrive1.visible = false; // Startwert: unsichtbar

let labelDrive2 = new LineLabel(0, 0, 0, 0, "F<sub>Ant</sub>", 20);
labelDrive2.setFontSize(20);
labelDrive2.visible = false; // Startwert: unsichtbar

let labelDrive3 = new LineLabel(0, 0, 0, 0, "F<sub>Ant</sub>", 20);
labelDrive3.setFontSize(20);
labelDrive3.visible = false; // Startwert: unsichtbar

// Checkboxen - nur Gravity und Tangential sind standardmäßig aktiviert
let checkboxGravity = new Checkbox(
  true,
  20,
  "Gravitationskraft (F<sub>G</sub>)",
  "Arial",
  20,
  0x0000ff,
);
checkboxGravity.x = checkboxStartX;
checkboxGravity.y = checkboxStartY;

let checkboxTangential = new Checkbox(
  true,
  20,
  "Umfangskraft (F<sub>U</sub>)",
  "Arial",
  20,
  0x555555,
);
checkboxTangential.x = checkboxStartX;
checkboxTangential.y = checkboxStartY + checkboxSpacing;

let checkboxCentrifugal = new Checkbox(
  false,
  20,
  "Fliehkraft (F<sub>F</sub>)",
  "Arial",
  20,
  0x8b008b,
);
checkboxCentrifugal.x = checkboxStartX;
checkboxCentrifugal.y = checkboxStartY + checkboxSpacing * 2;

let checkboxResultant = new Checkbox(
  false,
  20,
  "Resultierende Kraft (F<sub>Res</sub>)",
  "Arial",
  20,
  0x00aa00,
);
checkboxResultant.x = checkboxStartX;
checkboxResultant.y = checkboxStartY + checkboxSpacing * 3;

let checkboxTotal = new Checkbox(
  false,
  20,
  "Gesamtkraft (F<sub>Ges</sub>)",
  "Arial",
  16,
  0xff6600,
);
checkboxTotal.x = checkboxStartX;
checkboxTotal.y = checkboxStartY + checkboxSpacing * 4;

let checkboxDrive = new Checkbox(
  false,
  20,
  "Antriebskraft (F<sub>Ant</sub>)",
  "Arial",
  20,
  0xffff00,
);
checkboxDrive.x = checkboxStartX;
checkboxDrive.y = checkboxStartY + checkboxSpacing * 5;

let checkboxParallelograms = new Checkbox(
  false,
  20,
  "Parallelogramme",
  "Arial",
  20,
  0x444444,
);
checkboxParallelograms.x = checkboxStartX;
checkboxParallelograms.y = checkboxStartY + checkboxSpacing * 6;

let checkboxDashedLines = new Checkbox(
  false,
  20,
  "Verbindungslinien",
  "Arial",
  20,
  0x555555,
);
checkboxDashedLines.x = checkboxStartX;
checkboxDashedLines.y = checkboxStartY + checkboxSpacing * 7;

// ===== ABSCHNITT 3: FUNKTIONEN =====

// Hilfsfunktionen für Pfeil-Berechnungen
function updateArrowPosition(arrow, angle, offset) {
  // Winkel in Radiant umrechnen (mit Offset)
  let radians = ((angle + offset) * Math.PI) / 180;

  // Startpunkt des Pfeils (rotiert um den Mittelpunkt)
  let startX = centerX + radius * Math.cos(radians);
  let startY = centerY + radius * Math.sin(radians);

  // Endpunkt zeigt IMMER senkrecht nach unten (90 Grad = π/2)
  let gravityRadians = Math.PI / 2; // Immer 90 Grad (nach unten)
  let endX = startX + arrowLength * Math.cos(gravityRadians);
  let endY = startY + arrowLength * Math.sin(gravityRadians);

  // Pfeil aktualisieren
  arrow.setStart(startX, startY);
  arrow.setEnd(endX, endY);
}

function updateTangentialArrowPosition(arrow, angle, offset) {
  // Winkel in Radiant umrechnen (mit Offset)
  let radians = ((angle + offset) * Math.PI) / 180;

  // Startpunkt des Pfeils (rotiert um den Mittelpunkt)
  let startX = centerX + radius * Math.cos(radians);
  let startY = centerY + radius * Math.sin(radians);

  // Endpunkt zeigt tangential zur Rotation (90 Grad zur radialen Richtung)
  let tangentialRadians = radians + Math.PI / 2; // 90 Grad hinzufügen
  let endX = startX + tangentialArrowLength * Math.cos(tangentialRadians);
  let endY = startY + tangentialArrowLength * Math.sin(tangentialRadians);

  // Pfeil aktualisieren
  arrow.setStart(startX, startY);
  arrow.setEnd(endX, endY);
}

function updateCentrifugalArrowPosition(arrow, angle, offset) {
  // Winkel in Radiant umrechnen (mit Offset)
  let radians = ((angle + offset) * Math.PI) / 180;

  // Startpunkt des Pfeils (rotiert um den Mittelpunkt)
  let startX = centerX + radius * Math.cos(radians);
  let startY = centerY + radius * Math.sin(radians);

  // Endpunkt zeigt radial nach außen
  let endX = startX + centrifugalArrowLength * Math.cos(radians);
  let endY = startY + centrifugalArrowLength * Math.sin(radians);

  // Pfeil aktualisieren
  arrow.setStart(startX, startY);
  arrow.setEnd(endX, endY);
}

// Funktion für Antriebskraft (tangentiale Komponente der Gesamtkraft)
function updateDriveForceArrow(driveArrow, totalArrow, angle, offset) {
  // Winkel in Radiant umrechnen (mit Offset)
  let radians = ((angle + offset) * Math.PI) / 180;

  // Startpunkt (auf dem Kreis)
  let startX = centerX + radius * Math.cos(radians);
  let startY = centerY + radius * Math.sin(radians);

  // Gesamtkraftvektor
  let totalStartX = totalArrow.startX;
  let totalStartY = totalArrow.startY;
  let totalEndX = totalArrow.endX;
  let totalEndY = totalArrow.endY;

  // Gesamtkraftvektor relativ zum Startpunkt
  let totalVectorX = totalEndX - totalStartX;
  let totalVectorY = totalEndY - totalStartY;

  // Tangentiale Richtung (90 Grad zur radialen Richtung)
  let tangentialRadians = radians + Math.PI / 2;
  let tangentialUnitX = Math.cos(tangentialRadians);
  let tangentialUnitY = Math.sin(tangentialRadians);

  // Projektion der Gesamtkraft auf die tangentiale Richtung
  let dotProduct =
    totalVectorX * tangentialUnitX + totalVectorY * tangentialUnitY;

  // Tangentiale Komponente
  let tangentialComponentX = dotProduct * tangentialUnitX;
  let tangentialComponentY = dotProduct * tangentialUnitY;

  // Endpunkt der Antriebskraft
  let endX = startX + tangentialComponentX;
  let endY = startY + tangentialComponentY;

  // Antriebskraftpfeil aktualisieren
  driveArrow.setStart(startX, startY);
  driveArrow.setEnd(endX, endY);
}

// Funktionen für Parallelogramme
function updateParallelogram(parallelogram, angle, offset) {
  // Winkel in Radiant umrechnen (mit Offset)
  let radians = ((angle + offset) * Math.PI) / 180;

  // Gemeinsamer Startpunkt (auf dem Kreis)
  let startX = centerX + radius * Math.cos(radians);
  let startY = centerY + radius * Math.sin(radians);

  // Gravitationsvektor - zeigt IMMER nach unten
  let gravityRadians = Math.PI / 2; // Immer 90 Grad (nach unten)
  let gravEndX = startX + arrowLength * Math.cos(gravityRadians);
  let gravEndY = startY + arrowLength * Math.sin(gravityRadians);

  // Tangentialvektor - Endpunkt in absoluten Koordinaten
  let tangentialRadians = radians + Math.PI / 2;
  let tangEndX = startX + tangentialArrowLength * Math.cos(tangentialRadians);
  let tangEndY = startY + tangentialArrowLength * Math.sin(tangentialRadians);

  // Parallelogramm aktualisieren - mit absoluten Koordinaten
  parallelogram.setOrigin(startX, startY);
  parallelogram.setVector1(gravEndX, gravEndY);
  parallelogram.setVector2(tangEndX, tangEndY);
}

function updateResultantArrow(resultantArrow, parallelogram, angle, offset) {
  // Winkel in Radiant umrechnen (mit Offset)
  let radians = ((angle + offset) * Math.PI) / 180;

  // Startpunkt des resultierenden Pfeils
  let startX = centerX + radius * Math.cos(radians);
  let startY = centerY + radius * Math.sin(radians);

  // Endpunkt des resultierenden Pfeils vom Parallelogramm holen
  let resultantEndpoint = parallelogram.getResultantEndpoint();

  // Resultierenden Pfeil aktualisieren
  resultantArrow.setStart(startX, startY);
  resultantArrow.setEnd(resultantEndpoint.x, resultantEndpoint.y);
}

function updateTotalParallelogram(
  parallelogramTotal,
  parallelogramResultant,
  angle,
  offset,
) {
  // Winkel in Radiant umrechnen (mit Offset)
  let radians = ((angle + offset) * Math.PI) / 180;

  // Gemeinsamer Startpunkt (auf dem Kreis)
  let startX = centerX + radius * Math.cos(radians);
  let startY = centerY + radius * Math.sin(radians);

  // Endpunkt der resultierenden Kraft (FRes)
  let resultantEndpoint = parallelogramResultant.getResultantEndpoint();

  // Endpunkt der Fliehkraft (FF)
  let centrifugalEndX = startX + centrifugalArrowLength * Math.cos(radians);
  let centrifugalEndY = startY + centrifugalArrowLength * Math.sin(radians);

  // Parallelogramm für Gesamtkraft aktualisieren
  parallelogramTotal.setOrigin(startX, startY);
  parallelogramTotal.setVector1(resultantEndpoint.x, resultantEndpoint.y);
  parallelogramTotal.setVector2(centrifugalEndX, centrifugalEndY);
}

function updateTotalForceArrow(
  totalForceArrow,
  parallelogramTotal,
  angle,
  offset,
) {
  // Winkel in Radiant umrechnen (mit Offset)
  let radians = ((angle + offset) * Math.PI) / 180;

  // Startpunkt des Gesamtkraftpfeils
  let startX = centerX + radius * Math.cos(radians);
  let startY = centerY + radius * Math.sin(radians);

  // Endpunkt des Gesamtkraftpfeils vom Parallelogramm holen
  let totalEndpoint = parallelogramTotal.getResultantEndpoint();

  // Gesamtkraftpfeil aktualisieren
  totalForceArrow.setStart(startX, startY);
  totalForceArrow.setEnd(totalEndpoint.x, totalEndpoint.y);
}

// Neue Funktion für gestrichelte Linien
function updateDashedLine(dashedLine, totalArrow, driveArrow) {
  // Linie vom Ende der Gesamtkraft zum Ende der Antriebskraft
  dashedLine.setStart(totalArrow.endX, totalArrow.endY);
  dashedLine.setEnd(driveArrow.endX, driveArrow.endY);
}

// Funktionen für Beschriftungen
function updateGravityLabelPosition(label, angle, offset) {
  let radians = ((angle + offset) * Math.PI) / 180;
  let startX = centerX + radius * Math.cos(radians);
  let startY = centerY + radius * Math.sin(radians);
  let gravityRadians = Math.PI / 2;
  let endX = startX + arrowLength * Math.cos(gravityRadians);
  let endY = startY + arrowLength * Math.sin(gravityRadians);

  label.setStart(startX, startY);
  label.setEnd(endX, endY);
}

function updateTangentialLabelPosition(label, angle, offset) {
  let radians = ((angle + offset) * Math.PI) / 180;
  let startX = centerX + radius * Math.cos(radians);
  let startY = centerY + radius * Math.sin(radians);
  let tangentialRadians = radians + Math.PI / 2;
  let endX = startX + tangentialArrowLength * Math.cos(tangentialRadians);
  let endY = startY + tangentialArrowLength * Math.sin(tangentialRadians);

  label.setStart(startX, startY);
  label.setEnd(endX, endY);
}

function updateCentrifugalLabelPosition(label, angle, offset) {
  let radians = ((angle + offset) * Math.PI) / 180;
  let startX = centerX + radius * Math.cos(radians);
  let startY = centerY + radius * Math.sin(radians);
  let endX = startX + centrifugalArrowLength * Math.cos(radians);
  let endY = startY + centrifugalArrowLength * Math.sin(radians);

  label.setStart(startX, startY);
  label.setEnd(endX, endY);
}

function updateResultantLabelPosition(label, parallelogram, angle, offset) {
  let radians = ((angle + offset) * Math.PI) / 180;
  let startX = centerX + radius * Math.cos(radians);
  let startY = centerY + radius * Math.sin(radians);
  let resultantEndpoint = parallelogram.getResultantEndpoint();

  label.setStart(startX, startY);
  label.setEnd(resultantEndpoint.x, resultantEndpoint.y);
}

function updateTotalLabelPosition(label, parallelogramTotal, angle, offset) {
  let radians = ((angle + offset) * Math.PI) / 180;
  let startX = centerX + radius * Math.cos(radians);
  let startY = centerY + radius * Math.sin(radians);
  let totalEndpoint = parallelogramTotal.getResultantEndpoint();

  label.setStart(startX, startY);
  label.setEnd(totalEndpoint.x, totalEndpoint.y);
}

function updateDriveLabelPosition(label, driveArrow, angle, offset) {
  label.setStart(driveArrow.startX, driveArrow.startY);
  label.setEnd(driveArrow.endX, driveArrow.endY);
}

function updateParallelogramVisibility() {
  // Prüfe ob Parallelogramm-Checkbox aktiv ist
  let parallelogramsEnabled = checkboxParallelograms.checked;

  // Parallelogramme für FG + FU = FRes
  // Sichtbar wenn: Parallelogramm-Checkbox aktiv UND alle drei Kräfte (FG, FU und FRes) sichtbar
  let gravityVisible = checkboxGravity.checked;
  let tangentialVisible = checkboxTangential.checked;
  let resultantVisible = checkboxResultant.checked;
  let resultantParallelogramsVisible =
    parallelogramsEnabled &&
    gravityVisible &&
    tangentialVisible &&
    resultantVisible;

  parallelogram1.visible = resultantParallelogramsVisible;
  parallelogram2.visible = resultantParallelogramsVisible;
  parallelogram3.visible = resultantParallelogramsVisible;

  // Parallelogramme für FRes + FF = FGes
  // Sichtbar wenn: Parallelogramm-Checkbox aktiv UND alle drei Kräfte (FRes, FF und FGes) sichtbar
  let centrifugalVisible = checkboxCentrifugal.checked;
  let totalVisible = checkboxTotal.checked;
  let totalParallelogramsVisible =
    parallelogramsEnabled &&
    resultantVisible &&
    centrifugalVisible &&
    totalVisible;

  parallelogramTotal1.visible = totalParallelogramsVisible;
  parallelogramTotal2.visible = totalParallelogramsVisible;
  parallelogramTotal3.visible = totalParallelogramsVisible;
}

// Neue Funktion für Linien-Sichtbarkeit
function updateDashedLinesVisibility() {
  // Linien sind sichtbar wenn: Checkbox aktiv UND beide Kräfte (FGes und FAnt) sichtbar
  let linesEnabled = checkboxDashedLines.checked;
  let totalVisible = checkboxTotal.checked;
  let driveVisible = checkboxDrive.checked;
  let linesVisible = linesEnabled && totalVisible && driveVisible;

  dashedLine1.visible = linesVisible;
  dashedLine2.visible = linesVisible;
  dashedLine3.visible = linesVisible;
}

// Initialisierungsfunktion
function initializePositions() {
  // Pfeile initialisieren
  updateArrowPosition(vectorGravitation1, 90, 0);
  updateArrowPosition(vectorGravitation2, 90, 120);
  updateArrowPosition(vectorGravitation3, 90, 240);

  updateTangentialArrowPosition(vectorTangential1, 90, 0);
  updateTangentialArrowPosition(vectorTangential2, 90, 120);
  updateTangentialArrowPosition(vectorTangential3, 90, 240);

  updateCentrifugalArrowPosition(vectorCentrifugal1, 90, 0);
  updateCentrifugalArrowPosition(vectorCentrifugal2, 90, 120);
  updateCentrifugalArrowPosition(vectorCentrifugal3, 90, 240);

  // Parallelogramme initialisieren
  updateParallelogram(parallelogram1, 90, 0);
  updateParallelogram(parallelogram2, 90, 120);
  updateParallelogram(parallelogram3, 90, 240);

  updateResultantArrow(resultantArrow1, parallelogram1, 90, 0);
  updateResultantArrow(resultantArrow2, parallelogram2, 90, 120);
  updateResultantArrow(resultantArrow3, parallelogram3, 90, 240);

  updateTotalParallelogram(parallelogramTotal1, parallelogram1, 90, 0);
  updateTotalParallelogram(parallelogramTotal2, parallelogram2, 90, 120);
  updateTotalParallelogram(parallelogramTotal3, parallelogram3, 90, 240);

  updateTotalForceArrow(totalForceArrow1, parallelogramTotal1, 90, 0);
  updateTotalForceArrow(totalForceArrow2, parallelogramTotal2, 90, 120);
  updateTotalForceArrow(totalForceArrow3, parallelogramTotal3, 90, 240);

  // Antriebskraft initialisieren
  updateDriveForceArrow(driveForceArrow1, totalForceArrow1, 90, 0);
  updateDriveForceArrow(driveForceArrow2, totalForceArrow2, 90, 120);
  updateDriveForceArrow(driveForceArrow3, totalForceArrow3, 90, 240);

  // Gestrichelte Linien initialisieren
  updateDashedLine(dashedLine1, totalForceArrow1, driveForceArrow1);
  updateDashedLine(dashedLine2, totalForceArrow2, driveForceArrow2);
  updateDashedLine(dashedLine3, totalForceArrow3, driveForceArrow3);

  // Beschriftungen initialisieren
  updateGravityLabelPosition(labelGravity1, 90, 0);
  updateGravityLabelPosition(labelGravity2, 90, 120);
  updateGravityLabelPosition(labelGravity3, 90, 240);

  updateTangentialLabelPosition(labelTangential1, 90, 0);
  updateTangentialLabelPosition(labelTangential2, 90, 120);
  updateTangentialLabelPosition(labelTangential3, 90, 240);

  updateCentrifugalLabelPosition(labelCentrifugal1, 90, 0);
  updateCentrifugalLabelPosition(labelCentrifugal2, 90, 120);
  updateCentrifugalLabelPosition(labelCentrifugal3, 90, 240);

  updateResultantLabelPosition(labelResultant1, parallelogram1, 90, 0);
  updateResultantLabelPosition(labelResultant2, parallelogram2, 90, 120);
  updateResultantLabelPosition(labelResultant3, parallelogram3, 90, 240);

  updateTotalLabelPosition(labelTotal1, parallelogramTotal1, 90, 0);
  updateTotalLabelPosition(labelTotal2, parallelogramTotal2, 90, 120);
  updateTotalLabelPosition(labelTotal3, parallelogramTotal3, 90, 240);

  updateDriveLabelPosition(labelDrive1, driveForceArrow1, 90, 0);
  updateDriveLabelPosition(labelDrive2, driveForceArrow2, 90, 120);
  updateDriveLabelPosition(labelDrive3, driveForceArrow3, 90, 240);

  // Parallelogramm-Sichtbarkeit initialisieren
  updateParallelogramVisibility();

  // Linien-Sichtbarkeit initialisieren
  updateDashedLinesVisibility();
}

function updateAnimation(progress) {
  // Die Gruppe um 360 Grad drehen
  myGroup.rotation = 90 + progress * 360;

  // Aktueller Winkel
  let currentAngle = 90 + progress * 360;

  // Alle Elemente aktualisieren
  updateArrowPosition(vectorGravitation1, currentAngle, 0);
  updateArrowPosition(vectorGravitation2, currentAngle, 120);
  updateArrowPosition(vectorGravitation3, currentAngle, 240);

  updateTangentialArrowPosition(vectorTangential1, currentAngle, 0);
  updateTangentialArrowPosition(vectorTangential2, currentAngle, 120);
  updateTangentialArrowPosition(vectorTangential3, currentAngle, 240);

  updateCentrifugalArrowPosition(vectorCentrifugal1, currentAngle, 0);
  updateCentrifugalArrowPosition(vectorCentrifugal2, currentAngle, 120);
  updateCentrifugalArrowPosition(vectorCentrifugal3, currentAngle, 240);

  updateParallelogram(parallelogram1, currentAngle, 0);
  updateParallelogram(parallelogram2, currentAngle, 120);
  updateParallelogram(parallelogram3, currentAngle, 240);

  updateResultantArrow(resultantArrow1, parallelogram1, currentAngle, 0);
  updateResultantArrow(resultantArrow2, parallelogram2, currentAngle, 120);
  updateResultantArrow(resultantArrow3, parallelogram3, currentAngle, 240);

  updateTotalParallelogram(
    parallelogramTotal1,
    parallelogram1,
    currentAngle,
    0,
  );
  updateTotalParallelogram(
    parallelogramTotal2,
    parallelogram2,
    currentAngle,
    120,
  );
  updateTotalParallelogram(
    parallelogramTotal3,
    parallelogram3,
    currentAngle,
    240,
  );

  updateTotalForceArrow(totalForceArrow1, parallelogramTotal1, currentAngle, 0);
  updateTotalForceArrow(
    totalForceArrow2,
    parallelogramTotal2,
    currentAngle,
    120,
  );
  updateTotalForceArrow(
    totalForceArrow3,
    parallelogramTotal3,
    currentAngle,
    240,
  );

  updateDriveForceArrow(driveForceArrow1, totalForceArrow1, currentAngle, 0);
  updateDriveForceArrow(driveForceArrow2, totalForceArrow2, currentAngle, 120);
  updateDriveForceArrow(driveForceArrow3, totalForceArrow3, currentAngle, 240);

  // Gestrichelte Linien aktualisieren
  updateDashedLine(dashedLine1, totalForceArrow1, driveForceArrow1);
  updateDashedLine(dashedLine2, totalForceArrow2, driveForceArrow2);
  updateDashedLine(dashedLine3, totalForceArrow3, driveForceArrow3);

  updateGravityLabelPosition(labelGravity1, currentAngle, 0);
  updateGravityLabelPosition(labelGravity2, currentAngle, 120);
  updateGravityLabelPosition(labelGravity3, currentAngle, 240);

  updateTangentialLabelPosition(labelTangential1, currentAngle, 0);
  updateTangentialLabelPosition(labelTangential2, currentAngle, 120);
  updateTangentialLabelPosition(labelTangential3, currentAngle, 240);

  updateCentrifugalLabelPosition(labelCentrifugal1, currentAngle, 0);
  updateCentrifugalLabelPosition(labelCentrifugal2, currentAngle, 120);
  updateCentrifugalLabelPosition(labelCentrifugal3, currentAngle, 240);

  updateResultantLabelPosition(
    labelResultant1,
    parallelogram1,
    currentAngle,
    0,
  );
  updateResultantLabelPosition(
    labelResultant2,
    parallelogram2,
    currentAngle,
    120,
  );
  updateResultantLabelPosition(
    labelResultant3,
    parallelogram3,
    currentAngle,
    240,
  );

  updateTotalLabelPosition(labelTotal1, parallelogramTotal1, currentAngle, 0);
  updateTotalLabelPosition(labelTotal2, parallelogramTotal2, currentAngle, 120);
  updateTotalLabelPosition(labelTotal3, parallelogramTotal3, currentAngle, 240);

  updateDriveLabelPosition(labelDrive1, driveForceArrow1, currentAngle, 0);
  updateDriveLabelPosition(labelDrive2, driveForceArrow2, currentAngle, 120);
  updateDriveLabelPosition(labelDrive3, driveForceArrow3, currentAngle, 240);
}

function completeAnimation() {
  // Rotation auf den Endwert setzen
  myGroup.rotation = 90;

  // Alle Elemente zurück zur Startposition
  initializePositions();

  // Status zurücksetzen
  isAnimating = false;
  myButton.setText("Start");
}

function handleButtonClick() {
  if (!isAnimating) {
    // Animation starten
    myTimer.reset();
    myTimer.start();
    isAnimating = true;
    myButton.setText("Pause");
  } else {
    // Animation pausieren oder fortsetzen
    if (myTimer.isPaused()) {
      myTimer.resume();
      myButton.setText("Start");
    } else {
      myTimer.pause();
      myButton.setText("Start");
    }
  }
}

function handleGravityCheckbox(event) {
  vectorGravitation1.visible = event.value;
  vectorGravitation2.visible = event.value;
  vectorGravitation3.visible = event.value;
  labelGravity1.visible = event.value;
  labelGravity2.visible = event.value;
  labelGravity3.visible = event.value;

  // Parallelogramm-Sichtbarkeit aktualisieren
  updateParallelogramVisibility();
}

function handleTangentialCheckbox(event) {
  vectorTangential1.visible = event.value;
  vectorTangential2.visible = event.value;
  vectorTangential3.visible = event.value;
  labelTangential1.visible = event.value;
  labelTangential2.visible = event.value;
  labelTangential3.visible = event.value;

  // Parallelogramm-Sichtbarkeit aktualisieren
  updateParallelogramVisibility();
}

function handleCentrifugalCheckbox(event) {
  vectorCentrifugal1.visible = event.value;
  vectorCentrifugal2.visible = event.value;
  vectorCentrifugal3.visible = event.value;
  labelCentrifugal1.visible = event.value;
  labelCentrifugal2.visible = event.value;
  labelCentrifugal3.visible = event.value;

  // Parallelogramm-Sichtbarkeit aktualisieren
  updateParallelogramVisibility();
}

function handleResultantCheckbox(event) {
  resultantArrow1.visible = event.value;
  resultantArrow2.visible = event.value;
  resultantArrow3.visible = event.value;
  labelResultant1.visible = event.value;
  labelResultant2.visible = event.value;
  labelResultant3.visible = event.value;

  // Parallelogramm-Sichtbarkeit aktualisieren
  updateParallelogramVisibility();
}

function handleTotalCheckbox(event) {
  totalForceArrow1.visible = event.value;
  totalForceArrow2.visible = event.value;
  totalForceArrow3.visible = event.value;
  labelTotal1.visible = event.value;
  labelTotal2.visible = event.value;
  labelTotal3.visible = event.value;

  // Linien-Sichtbarkeit aktualisieren
  updateDashedLinesVisibility();
}

function handleDriveCheckbox(event) {
  driveForceArrow1.visible = event.value;
  driveForceArrow2.visible = event.value;
  driveForceArrow3.visible = event.value;
  labelDrive1.visible = event.value;
  labelDrive2.visible = event.value;
  labelDrive3.visible = event.value;

  // Linien-Sichtbarkeit aktualisieren
  updateDashedLinesVisibility();
}

function handleParallelogramsCheckbox(event) {
  // Parallelogramm-Sichtbarkeit aktualisieren
  updateParallelogramVisibility();
}

function handleDashedLinesCheckbox(event) {
  // Linien-Sichtbarkeit aktualisieren
  updateDashedLinesVisibility();
}

// ===== ABSCHNITT 4: EVENT LISTENER =====

// Timer-Event-Listener
myTimer.onUpdate(updateAnimation);
myTimer.onComplete(completeAnimation);

// Button-Event-Listener
myButton.onClick(handleButtonClick);

// Checkbox-Event-Listener
checkboxGravity.onClick(handleGravityCheckbox);
checkboxTangential.onClick(handleTangentialCheckbox);
checkboxCentrifugal.onClick(handleCentrifugalCheckbox);
checkboxResultant.onClick(handleResultantCheckbox);
checkboxTotal.onClick(handleTotalCheckbox);
checkboxDrive.onClick(handleDriveCheckbox);
checkboxParallelograms.onClick(handleParallelogramsCheckbox);
checkboxDashedLines.onClick(handleDashedLinesCheckbox);

// ===== INITIALISIERUNG =====

// Alle Positionen initialisieren
initializePositions();
