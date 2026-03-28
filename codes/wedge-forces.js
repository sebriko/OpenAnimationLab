// Created with Open Animation Lab
// Open Source – CC BY 4.0

// ============ SECTION 1: VARIABLES ============
let board = new Board(1280, 720);
// Additional variables
let wedgeAngle = 30;
let wedgeHeight = 350;
let centerX = 640;
let centerY = 400;
let angleRad = (30 * Math.PI) / 180;
let halfBase = Math.tan(angleRad / 2) * wedgeHeight;
// ============ SECTION 2: OBJECTS ============
// Rectangle (background)
let myRect = new Rectangle(1282, 500, 0x99ff99);
myRect.x = -1;
myRect.y = 360;
myRect.setBorder(0x333333, 1);
// Wedge path
let points = calculateWedgePoints(wedgeAngle, wedgeHeight, centerX, centerY);
let wedgePath = new LinePath(points, 0x444444, 1);
wedgePath.setFillColor(0xffffff);
// Labels
let labelForceSlider = new Text("Force F in N", "Arial", 20, 0x444444, "left");
labelForceSlider.x = 950;
labelForceSlider.y = 20;
let labelAngleSlider = new Text(
  "Angle β in degrees",
  "Arial",
  20,
  0x444444,
  "left",
);
labelAngleSlider.x = 950;
labelAngleSlider.y = 130;
// Sliders
let forceLengthSlider = new ButtonSlider(0, 100, 50, 1, 50, 200);
forceLengthSlider.enableValueDisplay();
forceLengthSlider.x = 950;
forceLengthSlider.y = 50;
let wedgeAngleSlider = new ButtonSlider(5, 90, 30, 1, 50, 200);
wedgeAngleSlider.enableValueDisplay();
wedgeAngleSlider.x = 950;
wedgeAngleSlider.y = 160;

// Lines of action (dashed)
// Line of action 1: along the left wall force
let lineOfAction1 = new Line(
  centerX,
  centerY - 50,
  centerX - 200,
  centerY - 250,
  0x888888,
  1,
);
lineOfAction1.setStrokeDash([5, 5]);

// Line of action 2: along the right wall force
let lineOfAction2 = new Line(
  centerX,
  centerY - 50,
  centerX + 200,
  centerY - 250,
  0x888888,
  1,
);
lineOfAction2.setStrokeDash([5, 5]);

// Line of action 3: parallel to right wall force, through endpoint of main force
let lineOfAction3 = new Line(
  centerX,
  centerY + 50,
  centerX + 200,
  centerY - 150,
  0x888888,
  1,
);
lineOfAction3.setStrokeDash([5, 5]);

// Line of action 4: parallel to left wall force, through endpoint of main force
let lineOfAction4 = new Line(
  centerX,
  centerY + 50,
  centerX - 200,
  centerY - 150,
  0x888888,
  1,
);
lineOfAction4.setStrokeDash([5, 5]);

// Arrows (force vectors)
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

// Angle label (wedge angle β)
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

// Right-angle markers (force vector ⊥ wedge side)
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
// Right side
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

// ============ SECTION 3: FUNCTIONS ============
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

  // The wedge sides go from the tip (centerX, centerY+height/2) to the upper corners.
  // Left wedge side: direction from tip to upper left
  // Direction vector left side (normalized):
  let leftWallDirX = -Math.sin(halfAngleRad);
  let leftWallDirY = -Math.cos(halfAngleRad);

  // Right wedge side: direction from tip to upper right
  let rightWallDirX = Math.sin(halfAngleRad);
  let rightWallDirY = -Math.cos(halfAngleRad);

  // Force vectors are orthogonal to the wedge sides
  // Left force vector: direction (upper left, orthogonal to left wall)
  let leftForceDirX = -Math.cos(halfAngleRad);
  let leftForceDirY = Math.sin(halfAngleRad);

  // Right force vector: direction (upper right, orthogonal to right wall)
  let rightForceDirX = Math.cos(halfAngleRad);
  let rightForceDirY = Math.sin(halfAngleRad);

  // Calculate intersection of force vectors with wedge sides
  // The force vector starts at (centerX, centerY - 50) and goes in direction leftForceDir.
  // The left wedge side goes from tip (centerX, centerY + wedgeHeight/2) in direction leftWallDir.
  // Parametric intersection calculation:
  // Force vector start point: P = (centerX, centerY - 50)
  // Force vector direction: d1 = (leftForceDirX, leftForceDirY) [negative, away from start]
  // Wedge side start point: Q = (centerX, centerY + wedgeHeight/2) (tip)
  // Wedge side direction: d2 = (leftWallDirX, leftWallDirY)

  // Left side: find intersection
  let forceStartX = centerX;
  let forceStartY = centerY - 50;
  let tipX = centerX;
  let tipY = centerY + wedgeHeight / 2;

  // Left intersection: force line from start in direction (-leftForceDirX, -leftForceDirY)
  // meets left wedge side from tip in direction (leftWallDirX, leftWallDirY)
  // P + t * d_force = Q + s * d_wall
  // Solve for t and s:
  let leftIntersection = lineIntersection(
    forceStartX,
    forceStartY,
    -leftForceDirX,
    -leftForceDirY,
    tipX,
    tipY,
    leftWallDirX,
    leftWallDirY,
  );

  let rightIntersection = lineIntersection(
    forceStartX,
    forceStartY,
    -rightForceDirX,
    -rightForceDirY,
    tipX,
    tipY,
    rightWallDirX,
    rightWallDirY,
  );

  if (leftIntersection) {
    let ix = leftIntersection.x;
    let iy = leftIntersection.y;
    // Arm1: along the wedge side (direction toward tip)
    let arm1X = ix + leftWallDirX * 30; // Direction away from tip (inverted)
    let arm1Y = iy + leftWallDirY * 30;
    // Arm2: along the force vector (direction away from wall)
    let arm2X = ix + leftForceDirX * 30;
    let arm2Y = iy + leftForceDirY * 30;

    rightAngleLeft.setCenter(ix, iy);
    rightAngleLeft.setArm1(arm1X, arm1Y);
    rightAngleLeft.setArm2(arm2X, arm2Y);
  }

  if (rightIntersection) {
    let ix = rightIntersection.x;
    let iy = rightIntersection.y;
    // Arm1: along the wedge side
    let arm1X = ix + rightWallDirX * 30;
    let arm1Y = iy + rightWallDirY * 30;
    // Arm2: along the force vector
    let arm2X = ix + rightForceDirX * 30;
    let arm2Y = iy + rightForceDirY * 30;

    rightAngleRight.setCenter(ix, iy);
    rightAngleRight.setArm1(arm1X, arm1Y);
    rightAngleRight.setArm2(arm2X, arm2Y);
  }
}

function lineIntersection(px, py, dx1, dy1, qx, qy, dx2, dy2) {
  // Solve: P + t * d1 = Q + s * d2
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
  updateLinesOfAction(vectorLength);
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
  updateLinesOfAction(vectorLength);
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

function updateLinesOfAction(mainForceLength) {
  let halfAngleRad = ((wedgeAngle / 2) * Math.PI) / 180;

  // Very large length for the lines of action (larger than the stage)
  let lineLength = 1500;

  let leftAngle = -halfAngleRad;
  let rightAngle = Math.PI + halfAngleRad;

  // Endpoint of the main force
  let mainForceEndY = centerY - 50 + mainForceLength;

  // Line of action 1: along the left wall force (extended in both directions)
  let line1StartX = centerX + lineLength * Math.cos(leftAngle);
  let line1StartY = centerY - 50 + lineLength * Math.sin(leftAngle);
  let line1EndX = centerX - lineLength * Math.cos(leftAngle);
  let line1EndY = centerY - 50 - lineLength * Math.sin(leftAngle);
  lineOfAction1.setStart(line1StartX, line1StartY);
  lineOfAction1.setEnd(line1EndX, line1EndY);

  // Line of action 2: along the right wall force (extended in both directions)
  let line2StartX = centerX + lineLength * Math.cos(rightAngle);
  let line2StartY = centerY - 50 + lineLength * Math.sin(rightAngle);
  let line2EndX = centerX - lineLength * Math.cos(rightAngle);
  let line2EndY = centerY - 50 - lineLength * Math.sin(rightAngle);
  lineOfAction2.setStart(line2StartX, line2StartY);
  lineOfAction2.setEnd(line2EndX, line2EndY);

  // Line of action 3: parallel to RIGHT wall force, through endpoint of main force
  let line3StartX = centerX - lineLength * Math.cos(rightAngle);
  let line3StartY = mainForceEndY - lineLength * Math.sin(rightAngle);
  let line3EndX = centerX + lineLength * Math.cos(rightAngle);
  let line3EndY = mainForceEndY + lineLength * Math.sin(rightAngle);
  lineOfAction3.setStart(line3StartX, line3StartY);
  lineOfAction3.setEnd(line3EndX, line3EndY);

  // Line of action 4: parallel to LEFT wall force, through endpoint of main force
  let line4StartX = centerX - lineLength * Math.cos(leftAngle);
  let line4StartY = mainForceEndY - lineLength * Math.sin(leftAngle);
  let line4EndX = centerX + lineLength * Math.cos(leftAngle);
  let line4EndY = mainForceEndY + lineLength * Math.sin(leftAngle);
  lineOfAction4.setStart(line4StartX, line4StartY);
  lineOfAction4.setEnd(line4EndX, line4EndY);
}

// ============ SECTION 4: EVENT LISTENERS ============
forceLengthSlider.onChange(updateMainForce);
wedgeAngleSlider.onChange(updateWedgeAngle);
// Initial update
updateMainForce();
