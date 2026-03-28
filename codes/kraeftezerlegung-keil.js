// Created with Open Animation Lab
// Open Source – CC BY 4.0

// ============ ABSCHNITT 1: VARIABLEN ============
let board = new Board(1280, 720);
// Weitere Variablen
let wedgeAngle = 30;
let wedgeHeight = 350;
let centerX = 640;
let centerY = 400;
let angleRad = (30 * Math.PI) / 180;
let halfBase = Math.tan(angleRad / 2) * wedgeHeight;
// ============ ABSCHNITT 2: OBJEKTE ============
// Rechteck (Hintergrund)
let myRect = new Rectangle(1282, 500, 0x99ff99);
myRect.x = -1;
myRect.y = 360;
myRect.setBorder(0x333333, 1);
// Keil-Pfad
let points = calculateWedgePoints(wedgeAngle, wedgeHeight, centerX, centerY);
let wedgePath = new LinePath(points, 0x444444, 1);
wedgePath.setFillColor(0xffffff);
// Labels
let labelForceSlider = new Text("Kraft F in N", "Arial", 20, 0x444444, "left");
labelForceSlider.x = 950;
labelForceSlider.y = 20;
let labelAngleSlider = new Text(
  "Winkel β in Grad",
  "Arial",
  20,
  0x444444,
  "left",
);
labelAngleSlider.x = 950;
labelAngleSlider.y = 130;
// Slider
let forceLengthSlider = new ButtonSlider(0, 100, 50, 1, 50, 200);
forceLengthSlider.enableValueDisplay();
forceLengthSlider.x = 950;
forceLengthSlider.y = 50;
let wedgeAngleSlider = new ButtonSlider(5, 90, 30, 1, 50, 200);
wedgeAngleSlider.enableValueDisplay();
wedgeAngleSlider.x = 950;
wedgeAngleSlider.y = 160;

// Wirkungslinien (gestrichelt)
// Wirkungslinie 1: direkt auf der linken Wangenkraft
let wirkunglinie1 = new Line(
  centerX,
  centerY - 50,
  centerX - 200,
  centerY - 250,
  0x888888,
  1,
);
wirkunglinie1.setStrokeDash([5, 5]);

// Wirkungslinie 2: direkt auf der rechten Wangenkraft
let wirkunglinie2 = new Line(
  centerX,
  centerY - 50,
  centerX + 200,
  centerY - 250,
  0x888888,
  1,
);
wirkunglinie2.setStrokeDash([5, 5]);

// Wirkungslinie 3: parallel zur rechten Wangenkraft, durch Endpunkt der Hauptkraft
let wirkunglinie3 = new Line(
  centerX,
  centerY + 50,
  centerX + 200,
  centerY - 150,
  0x888888,
  1,
);
wirkunglinie3.setStrokeDash([5, 5]);

// Wirkungslinie 4: parallel zur linken Wangenkraft, durch Endpunkt der Hauptkraft
let wirkunglinie4 = new Line(
  centerX,
  centerY + 50,
  centerX - 200,
  centerY - 150,
  0x888888,
  1,
);
wirkunglinie4.setStrokeDash([5, 5]);

// Pfeile (Kraftvektoren)
let mainForceVector = new Arrow(
  centerX,
  centerY - 50,
  centerX,
  centerY + 50,
  0xff5555,
  2,
  26,
  12,
);
mainForceVector.x = 0;
mainForceVector.y = 0;
let leftWallForceVector = new Arrow(
  centerX,
  centerY - 50,
  centerX - 100,
  centerY - 150,
  0x5555ff,
  2,
  26,
  12,
);
leftWallForceVector.x = 0;
leftWallForceVector.y = 0;
let rightWallForceVector = new Arrow(
  centerX,
  centerY - 50,
  centerX + 100,
  centerY - 150,
  0x5555ff,
  2,
  26,
  12,
);
rightWallForceVector.x = 0;
rightWallForceVector.y = 0;

// Winkelbeschriftung (Keilwinkel β)
const angle = new AngleLabel(
  centerX,
  centerY + wedgeHeight / 2,
  centerX - halfBase,
  centerY - wedgeHeight / 2,
  centerX + halfBase,
  centerY - wedgeHeight / 2,
  100,
  "β",
  "Arial",
  20,
  0x444444,
  1,
  0x444444,
);

// Rechte-Winkel-Markierungen (Kraftvektor ⊥ Keilseite)
let rightAngleLeft = new AngleLabel(
  centerX,
  centerY - 50,
  centerX - 50,
  centerY - 50,
  centerX - 50,
  centerY - 100,
  30,
  "•",
  "Arial",
  12,
  0x444444,
  1,
  0x444444,
);
// Rechte Seite
let rightAngleRight = new AngleLabel(
  centerX,
  centerY - 50,
  centerX + 50,
  centerY - 50,
  centerX + 50,
  centerY - 100,
  30,
  "•",
  "Arial",
  12,
  0x444444,
  1,
  0x444444,
);

// ============ ABSCHNITT 3: FUNKTIONEN ============
function calculateWedgePoints(angle, height, centerX, centerY) {
  let angleRad = (angle * Math.PI) / 180;
  let halfBase = Math.tan(angleRad / 2) * height;

  return [
    [centerX - halfBase, centerY - height / 2],
    [centerX + halfBase, centerY - height / 2],
    [centerX, centerY + height / 2],
    [centerX - halfBase, centerY - height / 2],
  ];
}

function updateRightAngleMarkers(mainForceLength) {
  let halfAngleRad = ((wedgeAngle / 2) * Math.PI) / 180;

  // Die Keilseiten gehen von Spitze (centerX, centerY+height/2) zu den oberen Ecken.
  // Linke Keilseite: Richtung von Spitze nach links oben
  // Richtungsvektor linke Seite (normiert):
  let leftWallDirX = -Math.sin(halfAngleRad);
  let leftWallDirY = -Math.cos(halfAngleRad);

  // Rechte Keilseite: Richtung von Spitze nach rechts oben
  let rightWallDirX = Math.sin(halfAngleRad);
  let rightWallDirY = -Math.cos(halfAngleRad);

  // Kraftvektoren stehen orthogonal auf den Keilseiten
  // Linker Kraftvektor: Richtung (nach links-oben, orthogonal zur linken Wand)
  let leftForceDirX = -Math.cos(halfAngleRad);
  let leftForceDirY = Math.sin(halfAngleRad);

  // Rechter Kraftvektor: Richtung (nach rechts-oben, orthogonal zur rechten Wand)
  let rightForceDirX = Math.cos(halfAngleRad);
  let rightForceDirY = Math.sin(halfAngleRad);

  // Schnittpunkt der Kraftvektoren mit den Keilseiten berechnen
  // Der Kraftvektor startet bei (centerX, centerY - 50) und geht in Richtung leftForceDir.
  // Die linke Keilseite geht von Spitze (centerX, centerY + wedgeHeight/2) in Richtung leftWallDir.
  // Parametrische Schnittberechnung:
  // Startpunkt Kraftvektor: P = (centerX, centerY - 50)
  // Richtung Kraftvektor: d1 = (leftForceDirX, leftForceDirY) [negativ, da vom Start weg]
  // Startpunkt Keilseite: Q = (centerX, centerY + wedgeHeight/2) (Spitze)
  // Richtung Keilseite: d2 = (leftWallDirX, leftWallDirY)

  // Linke Seite: Finde Schnittpunkt
  let forceStartX = centerX;
  let forceStartY = centerY - 50;
  let spitzeX = centerX;
  let spitzeY = centerY + wedgeHeight / 2;

  // Linker Schnittpunkt: Kraftlinie vom Start in Richtung (-leftForceDirX, -leftForceDirY)
  // trifft linke Keilseite von Spitze in Richtung (leftWallDirX, leftWallDirY)
  // P + t * d_force = Q + s * d_wall
  // Löse für t und s:
  let leftIntersection = lineIntersection(
    forceStartX,
    forceStartY,
    -leftForceDirX,
    -leftForceDirY,
    spitzeX,
    spitzeY,
    leftWallDirX,
    leftWallDirY,
  );

  let rightIntersection = lineIntersection(
    forceStartX,
    forceStartY,
    -rightForceDirX,
    -rightForceDirY,
    spitzeX,
    spitzeY,
    rightWallDirX,
    rightWallDirY,
  );

  if (leftIntersection) {
    let ix = leftIntersection.x;
    let iy = leftIntersection.y;
    // Arm1: entlang der Keilseite (Richtung zur Spitze)
    let arm1X = ix + leftWallDirX * 30; // Richtung weg von Spitze (invertiert)
    let arm1Y = iy + leftWallDirY * 30;
    // Arm2: entlang des Kraftvektors (Richtung weg von Wand)
    let arm2X = ix + leftForceDirX * 30;
    let arm2Y = iy + leftForceDirY * 30;

    rightAngleLeft.setCenter(ix, iy);
    rightAngleLeft.setArm1(arm1X, arm1Y);
    rightAngleLeft.setArm2(arm2X, arm2Y);
  }

  if (rightIntersection) {
    let ix = rightIntersection.x;
    let iy = rightIntersection.y;
    // Arm1: entlang der Keilseite
    let arm1X = ix + rightWallDirX * 30;
    let arm1Y = iy + rightWallDirY * 30;
    // Arm2: entlang des Kraftvektors
    let arm2X = ix + rightForceDirX * 30;
    let arm2Y = iy + rightForceDirY * 30;

    rightAngleRight.setCenter(ix, iy);
    rightAngleRight.setArm1(arm1X, arm1Y);
    rightAngleRight.setArm2(arm2X, arm2Y);
  }
}

function lineIntersection(px, py, dx1, dy1, qx, qy, dx2, dy2) {
  // Löse: P + t * d1 = Q + s * d2
  // t * dx1 - s * dx2 = qx - px
  // t * dy1 - s * dy2 = qy - py
  let det = dx1 * -dy2 - dy1 * -dx2;
  if (Math.abs(det) < 0.0001) return null;

  let diffX = qx - px;
  let diffY = qy - py;

  let t = (diffX * -dy2 - diffY * -dx2) / det;

  return {
    x: px + t * dx1,
    y: py + t * dy1,
  };
}

function updateMainForce(e) {
  let vectorLength = forceLengthSlider.value * 3 + 1;
  mainForceVector.setEnd(centerX, centerY - 50 + vectorLength);
  updateWallForces(vectorLength);
  updateWirkungslinien(vectorLength);
  updateRightAngleMarkers(vectorLength);
}

function updateWedgeAngle(e) {
  wedgeAngle = wedgeAngleSlider.value;
  let newPoints = calculateWedgePoints(
    wedgeAngle,
    wedgeHeight,
    centerX,
    centerY,
  );
  wedgePath.setPoints(newPoints);

  let vectorLength = forceLengthSlider.value * 3 + 1;
  updateWallForces(vectorLength);
  updateWirkungslinien(vectorLength);
  updateRightAngleMarkers(vectorLength);

  angle.setArm1(newPoints[0][0], newPoints[0][1]);
  angle.setArm2(newPoints[1][0], newPoints[1][1]);
}

function updateWallForces(mainForceLength) {
  let halfAngleRad = ((wedgeAngle / 2) * Math.PI) / 180;
  let wallForceLength = mainForceLength / (2 * Math.sin(halfAngleRad));

  let leftAngle = -halfAngleRad;
  let rightAngle = Math.PI + halfAngleRad;

  let leftEndX = centerX - wallForceLength * Math.cos(leftAngle);
  let leftEndY = centerY - 50 - wallForceLength * Math.sin(leftAngle);

  let rightEndX = centerX - wallForceLength * Math.cos(rightAngle);
  let rightEndY = centerY - 50 - wallForceLength * Math.sin(rightAngle);

  leftWallForceVector.setEnd(leftEndX, leftEndY);
  rightWallForceVector.setEnd(rightEndX, rightEndY);
}

function updateWirkungslinien(mainForceLength) {
  let halfAngleRad = ((wedgeAngle / 2) * Math.PI) / 180;

  // Sehr große Länge für die Wirkungslinien (größer als die Bühne)
  let lineLength = 1500;

  let leftAngle = -halfAngleRad;
  let rightAngle = Math.PI + halfAngleRad;

  // Endpunkt der Hauptkraft
  let mainForceEndY = centerY - 50 + mainForceLength;

  // Wirkungslinie 1: direkt auf der linken Wangenkraft (in beide Richtungen verlängert)
  let line1StartX = centerX + lineLength * Math.cos(leftAngle);
  let line1StartY = centerY - 50 + lineLength * Math.sin(leftAngle);
  let line1EndX = centerX - lineLength * Math.cos(leftAngle);
  let line1EndY = centerY - 50 - lineLength * Math.sin(leftAngle);
  wirkunglinie1.setStart(line1StartX, line1StartY);
  wirkunglinie1.setEnd(line1EndX, line1EndY);

  // Wirkungslinie 2: direkt auf der rechten Wangenkraft (in beide Richtungen verlängert)
  let line2StartX = centerX + lineLength * Math.cos(rightAngle);
  let line2StartY = centerY - 50 + lineLength * Math.sin(rightAngle);
  let line2EndX = centerX - lineLength * Math.cos(rightAngle);
  let line2EndY = centerY - 50 - lineLength * Math.sin(rightAngle);
  wirkunglinie2.setStart(line2StartX, line2StartY);
  wirkunglinie2.setEnd(line2EndX, line2EndY);

  // Wirkungslinie 3: parallel zur RECHTEN Wangenkraft, durch Endpunkt der Hauptkraft
  let line3StartX = centerX - lineLength * Math.cos(rightAngle);
  let line3StartY = mainForceEndY - lineLength * Math.sin(rightAngle);
  let line3EndX = centerX + lineLength * Math.cos(rightAngle);
  let line3EndY = mainForceEndY + lineLength * Math.sin(rightAngle);
  wirkunglinie3.setStart(line3StartX, line3StartY);
  wirkunglinie3.setEnd(line3EndX, line3EndY);

  // Wirkungslinie 4: parallel zur LINKEN Wangenkraft, durch Endpunkt der Hauptkraft
  let line4StartX = centerX - lineLength * Math.cos(leftAngle);
  let line4StartY = mainForceEndY - lineLength * Math.sin(leftAngle);
  let line4EndX = centerX + lineLength * Math.cos(leftAngle);
  let line4EndY = mainForceEndY + lineLength * Math.sin(leftAngle);
  wirkunglinie4.setStart(line4StartX, line4StartY);
  wirkunglinie4.setEnd(line4EndX, line4EndY);
}

// ============ ABSCHNITT 4: EVENTLISTENER ============
forceLengthSlider.onChange(updateMainForce);
wedgeAngleSlider.onChange(updateWedgeAngle);
// Initiale Aktualisierung
updateMainForce();
