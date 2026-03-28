// Created with Open Animation Lab

// ===== SECTION 1: BOARD AND VARIABLES =====
let board = new Board(1280, 720);

// Constants
const STAGE_WIDTH = 1280;
const STAGE_HEIGHT = 720;
const CENTER_X = STAGE_WIDTH / 2;
const CENTER_Y = STAGE_HEIGHT / 2;
const ANGLE_RADIUS = 60;

// Arrays for dynamically created elements
let controlCircles = [];
let controlLines = [];
let surfaceCurvePoints = [];

// Angle labels
let incidentAngleLabel = null;
let refractedAngleLabel = null;
let reflectedAngleLabel = null;

// Surface points definition
let surfacePoints = [
  [-5, CENTER_Y, 350, CENTER_Y + 70],
  [STAGE_WIDTH + 5, CENTER_Y, STAGE_WIDTH - 350, CENTER_Y + 70],
  [STAGE_WIDTH + 2, STAGE_HEIGHT],
  [-5, STAGE_HEIGHT],
  [-5, CENTER_Y],
];

// ===== SECTION 2: OBJECTS =====

// UI elements
let refractiveIndexStepper = new NumericStepper(
  1,
  1,
  10,
  0.1,
  100,
  "Arial",
  20,
  ".",
);
refractiveIndexStepper.x = 1130;
refractiveIndexStepper.y = 35;

let refractiveIndexText = new Text(
  "Refractive index n<sub>2</sub>",
  "Arial",
  22,
  0x444444,
  "right",
);
refractiveIndexText.x = 1120;
refractiveIndexText.y = 24;

// Flashlight
let flashlight =
  new SimpleSVG(`<svg width="26" height="75" viewBox="37 10 26 75" xmlns="http://www.w3.org/2000/svg">
  <path d="M 40 35 L 40 80 A 10 3 0 0 0 60 80 L 60 35 A 10 3 0 0 1 40 35 Z" fill="#5A6875" stroke="#4A5560" stroke-width="1"/>
  <rect x="43" y="40" width="14" height="2" fill="#4A5560" opacity="0.2"/>
  <rect x="43" y="46" width="14" height="2" fill="#4A5560" opacity="0.2"/>
  <rect x="43" y="52" width="14" height="2" fill="#4A5560" opacity="0.2"/>
  <rect x="43" y="58" width="14" height="2" fill="#4A5560" opacity="0.2"/>
  <rect x="43" y="64" width="14" height="2" fill="#4A5560" opacity="0.2"/>
  <rect x="43" y="70" width="14" height="2" fill="#4A5560" opacity="0.2"/>
  <rect x="43" y="76" width="14" height="2" fill="#4A5560" opacity="0.2"/>
  <path d="M 40 35 A 10 3 0 0 0 60 35 L 63 15 A 13 3 0 0 0 37 15 L 40 35 Z" fill="#6B7885" stroke="#4A5560" stroke-width="1"/>
  <ellipse cx="50" cy="15" rx="13" ry="3" fill="#B8D4E3" stroke="#4A5560" stroke-width="1"/>
  <ellipse cx="48" cy="14" rx="6" ry="1.5" fill="#FFFFFF" opacity="0.4"/>
  <rect x="46" y="55" width="8" height="6" rx="1" fill="#8B6969" stroke="#4A5560" stroke-width="0.5"/>
</svg>`);
flashlight.setRotationPoint(14, 3);
flashlight.x = 80 - 13;
flashlight.y = 40;
flashlight.setDragging(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

// Light rays
let lightRay = new Line(
  80,
  40,
  STAGE_WIDTH - 20,
  STAGE_HEIGHT - 20,
  0xff6600,
  3,
);
lightRay.x = 0;
lightRay.y = 0;

let refractedRay = new Line(
  CENTER_X,
  CENTER_Y,
  CENTER_X + 100,
  CENTER_Y + 100,
  0xff6600,
  3,
);
refractedRay.visible = false;
refractedRay.setAlpha(0.9);

let reflectedRay = new Line(
  CENTER_X,
  CENTER_Y,
  CENTER_X - 100,
  CENTER_Y - 100,
  0xff6600,
  3,
);
reflectedRay.visible = false;
reflectedRay.setAlpha(0.9);

// Interface surface
let interfaceSurface = new LinePath([[0, 0]], 0x0066ff, 3);
interfaceSurface.setFillColor(0xe6f2ff);
interfaceSurface.setAlpha(0.5);

// Normal line
let normalLine = new Line(
  CENTER_X,
  CENTER_Y,
  CENTER_X + 100,
  CENTER_Y,
  0x444444,
  2,
);
normalLine.visible = false;
normalLine.setStrokeDash([5, 5]);
normalLine.setAlpha(0.8);

// Interactive points
let lightRayEndpoint = new Circle(10, 0xff0000);
lightRayEndpoint.x = STAGE_WIDTH - 20;
lightRayEndpoint.y = STAGE_HEIGHT - 20;
lightRayEndpoint.setBorder(0x880000, 2);
lightRayEndpoint.setDragging(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

let intersectionCircle = new Circle(12, 0xffff00);
intersectionCircle.setBorder(0x888800, 3);
intersectionCircle.visible = false;

// ===== SECTION 3: FUNCTIONS =====

function calculateExtendedLine(start, point) {
  const dx = point.x - start.x;
  const dy = point.y - start.y;

  if (Math.abs(dx) < 0.001) {
    return {
      endX: start.x,
      endY: dy > 0 ? STAGE_HEIGHT : 0,
    };
  }

  if (Math.abs(dy) < 0.001) {
    return {
      endX: dx > 0 ? STAGE_WIDTH : 0,
      endY: start.y,
    };
  }

  const slope = dy / dx;
  const intercept = start.y - slope * start.x;

  let endpoints = [];

  if (dx > 0) {
    const yRight = slope * STAGE_WIDTH + intercept;
    if (yRight >= 0 && yRight <= STAGE_HEIGHT) {
      endpoints.push({ x: STAGE_WIDTH, y: yRight });
    }
  }

  if (dx < 0) {
    const yLeft = intercept;
    if (yLeft >= 0 && yLeft <= STAGE_HEIGHT) {
      endpoints.push({ x: 0, y: yLeft });
    }
  }

  if (dy > 0) {
    const xBottom = (STAGE_HEIGHT - intercept) / slope;
    if (xBottom >= 0 && xBottom <= STAGE_WIDTH) {
      endpoints.push({ x: xBottom, y: STAGE_HEIGHT });
    }
  }

  if (dy < 0) {
    const xTop = -intercept / slope;
    if (xTop >= 0 && xTop <= STAGE_WIDTH) {
      endpoints.push({ x: xTop, y: 0 });
    }
  }

  if (endpoints.length > 0) {
    return {
      endX: endpoints[0].x,
      endY: endpoints[0].y,
    };
  }

  return {
    endX: point.x,
    endY: point.y,
  };
}

function updateFlashlightRotation() {
  const dx = lightRayEndpoint.x - (flashlight.x + 13);
  const dy = lightRayEndpoint.y - flashlight.y;

  let angleRad = Math.atan2(dy, dx);
  let angleDeg = angleRad * (180 / Math.PI);

  angleDeg -= 90;
  flashlight.rotation = angleDeg + 180;
}

function calculateCubicFunction(p0, p1, c0, c1) {
  const slopeStart = (c0.y - p0.y) / (c0.x - p0.x);
  const slopeEnd = (p1.y - c1.y) / (p1.x - c1.x);

  const xSpan = p1.x - p0.x;
  const a =
    (2 * (p0.y - p1.y) + xSpan * (slopeStart + slopeEnd)) /
    (xSpan * xSpan * xSpan);
  const b =
    (3 * (p1.y - p0.y) - xSpan * (2 * slopeStart + slopeEnd)) / (xSpan * xSpan);
  const c = slopeStart;
  const d = p0.y;

  return {
    a: a,
    b: b,
    c: c,
    d: d,
    x0: p0.x,
    evaluate: function (x) {
      const t = x - this.x0;
      return this.a * t * t * t + this.b * t * t + this.c * t + this.d;
    },
    derivative: function (x) {
      const t = x - this.x0;
      return 3 * this.a * t * t + 2 * this.b * t + this.c;
    },
  };
}

function calculateIntersection(cubic, lineStart, lineEnd) {
  const dx = lineEnd.x - lineStart.x;
  if (Math.abs(dx) < 0.0001) {
    const x = lineStart.x;
    const y = cubic.evaluate(x);
    const minY = Math.min(lineStart.y, lineEnd.y);
    const maxY = Math.max(lineStart.y, lineEnd.y);
    if (y >= minY && y <= maxY && x >= cubic.x0 && x <= surfacePoints[1][0]) {
      return [{ x: x, y: y }];
    }
    return [];
  }

  const slope = (lineEnd.y - lineStart.y) / dx;
  const intercept = lineStart.y - slope * lineStart.x;

  function newton(x0, maxIter = 20) {
    let x = x0;
    for (let i = 0; i < maxIter; i++) {
      const fx = cubic.evaluate(x) - (slope * x + intercept);
      const dfx = cubic.derivative(x) - slope;
      if (Math.abs(dfx) < 0.0001) break;
      const xNew = x - fx / dfx;
      if (Math.abs(xNew - x) < 0.0001) break;
      x = xNew;
    }
    return x;
  }

  const minX = Math.min(cubic.x0, surfacePoints[1][0]);
  const maxX = Math.max(cubic.x0, surfacePoints[1][0]);
  const startPoints = [
    minX,
    minX + (maxX - minX) * 0.25,
    minX + (maxX - minX) * 0.5,
    minX + (maxX - minX) * 0.75,
    maxX,
  ];

  let intersections = [];
  for (let start of startPoints) {
    const x = newton(start);
    const y = cubic.evaluate(x);

    const onCurve = x >= minX && x <= maxX;
    const yOnLine = slope * x + intercept;
    const accuracy = Math.abs(y - yOnLine) < 1;

    if (onCurve && accuracy) {
      let isNew = true;
      for (let p of intersections) {
        if (Math.abs(p.x - x) < 1) {
          isNew = false;
          break;
        }
      }
      if (isNew) {
        intersections.push({ x: x, y: y });
      }
    }
  }

  return intersections;
}

function calculateNormal(cubic, intersection) {
  const curveSlope = cubic.derivative(intersection.x);

  let normalSlope;
  if (Math.abs(curveSlope) < 0.0001) {
    return {
      slope: Infinity,
      startX: intersection.x,
      startY: 0,
      endX: intersection.x,
      endY: STAGE_HEIGHT,
    };
  } else {
    normalSlope = -1 / curveSlope;
  }

  let points = [];

  const y1 = intersection.y + normalSlope * (0 - intersection.x);
  if (y1 >= 0 && y1 <= STAGE_HEIGHT) {
    points.push({ x: 0, y: y1 });
  }

  const y2 = intersection.y + normalSlope * (STAGE_WIDTH - intersection.x);
  if (y2 >= 0 && y2 <= STAGE_HEIGHT) {
    points.push({ x: STAGE_WIDTH, y: y2 });
  }

  if (Math.abs(normalSlope) > 0.0001) {
    const x1 = intersection.x + (0 - intersection.y) / normalSlope;
    if (x1 >= 0 && x1 <= STAGE_WIDTH) {
      points.push({ x: x1, y: 0 });
    }
  }

  if (Math.abs(normalSlope) > 0.0001) {
    const x2 = intersection.x + (STAGE_HEIGHT - intersection.y) / normalSlope;
    if (x2 >= 0 && x2 <= STAGE_WIDTH) {
      points.push({ x: x2, y: STAGE_HEIGHT });
    }
  }

  if (points.length >= 2) {
    return {
      slope: normalSlope,
      startX: points[0].x,
      startY: points[0].y,
      endX: points[1].x,
      endY: points[1].y,
    };
  }

  return null;
}

function calculateReflectedRay(intersection, incidentRay, normal) {
  const dx1 = incidentRay.endX - incidentRay.startX;
  const dy1 = incidentRay.endY - incidentRay.startY;

  const incidentLength = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const incidentVector = {
    x: dx1 / incidentLength,
    y: dy1 / incidentLength,
  };

  let normalVector = { x: 0, y: 0 };

  if (normal.slope === Infinity) {
    normalVector.x = 0;
    normalVector.y = 1;
  } else {
    const tangentSlope = -1 / normal.slope;

    const tangentLength = Math.sqrt(1 + tangentSlope * tangentSlope);
    const tangent = {
      x: 1 / tangentLength,
      y: tangentSlope / tangentLength,
    };

    normalVector.x = -tangent.y;
    normalVector.y = tangent.x;

    if (normalVector.y > 0) {
      normalVector.x = -normalVector.x;
      normalVector.y = -normalVector.y;
    }
  }

  const dotProduct =
    incidentVector.x * normalVector.x + incidentVector.y * normalVector.y;

  const reflectionVector = {
    x: incidentVector.x - 2 * dotProduct * normalVector.x,
    y: incidentVector.y - 2 * dotProduct * normalVector.y,
  };

  let endpoints = [];

  if (reflectionVector.x > 0) {
    const tRight = (STAGE_WIDTH - intersection.x) / reflectionVector.x;
    const yRight = intersection.y + reflectionVector.y * tRight;
    if (yRight >= 0 && yRight <= STAGE_HEIGHT && tRight > 0) {
      endpoints.push({ x: STAGE_WIDTH, y: yRight });
    }
  }

  if (reflectionVector.x < 0) {
    const tLeft = (0 - intersection.x) / reflectionVector.x;
    const yLeft = intersection.y + reflectionVector.y * tLeft;
    if (yLeft >= 0 && yLeft <= STAGE_HEIGHT && tLeft > 0) {
      endpoints.push({ x: 0, y: yLeft });
    }
  }

  if (reflectionVector.y > 0) {
    const tBottom = (STAGE_HEIGHT - intersection.y) / reflectionVector.y;
    const xBottom = intersection.x + reflectionVector.x * tBottom;
    if (xBottom >= 0 && xBottom <= STAGE_WIDTH && tBottom > 0) {
      endpoints.push({ x: xBottom, y: STAGE_HEIGHT });
    }
  }

  if (reflectionVector.y < 0) {
    const tTop = (0 - intersection.y) / reflectionVector.y;
    const xTop = intersection.x + reflectionVector.x * tTop;
    if (xTop >= 0 && xTop <= STAGE_WIDTH && tTop > 0) {
      endpoints.push({ x: xTop, y: 0 });
    }
  }

  if (endpoints.length > 0) {
    return {
      startX: intersection.x,
      startY: intersection.y,
      endX: endpoints[0].x,
      endY: endpoints[0].y,
    };
  }

  return null;
}

function calculateRefractedRay(intersection, incidentRay, normal, n1, n2) {
  if (Math.abs(n1 - n2) < 0.0001) {
    const dx = incidentRay.endX - incidentRay.startX;
    const dy = incidentRay.endY - incidentRay.startY;

    const length = Math.sqrt(dx * dx + dy * dy);
    const directionX = dx / length;
    const directionY = dy / length;

    let endpoints = [];

    if (directionX > 0) {
      const tRight = (STAGE_WIDTH - intersection.x) / directionX;
      const yRight = intersection.y + directionY * tRight;
      if (yRight >= 0 && yRight <= STAGE_HEIGHT && tRight > 0) {
        endpoints.push({ x: STAGE_WIDTH, y: yRight });
      }
    }

    if (directionX < 0) {
      const tLeft = (0 - intersection.x) / directionX;
      const yLeft = intersection.y + directionY * tLeft;
      if (yLeft >= 0 && yLeft <= STAGE_HEIGHT && tLeft > 0) {
        endpoints.push({ x: 0, y: yLeft });
      }
    }

    if (directionY > 0) {
      const tBottom = (STAGE_HEIGHT - intersection.y) / directionY;
      const xBottom = intersection.x + directionX * tBottom;
      if (xBottom >= 0 && xBottom <= STAGE_WIDTH && tBottom > 0) {
        endpoints.push({ x: xBottom, y: STAGE_HEIGHT });
      }
    }

    if (directionY < 0) {
      const tTop = (0 - intersection.y) / directionY;
      const xTop = intersection.x + directionX * tTop;
      if (xTop >= 0 && xTop <= STAGE_WIDTH && tTop > 0) {
        endpoints.push({ x: xTop, y: 0 });
      }
    }

    if (endpoints.length > 0) {
      return {
        startX: intersection.x,
        startY: intersection.y,
        endX: endpoints[0].x,
        endY: endpoints[0].y,
      };
    }
    return null;
  }

  const dx1 = incidentRay.endX - incidentRay.startX;
  const dy1 = incidentRay.endY - incidentRay.startY;

  const incidentLength = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const incident = {
    x: dx1 / incidentLength,
    y: dy1 / incidentLength,
  };

  let normalDirection = { x: 0, y: 0 };

  if (normal.slope === Infinity) {
    normalDirection.x = 1;
    normalDirection.y = 0;
  } else {
    const tangentSlope = -1 / normal.slope;

    const tangentLength = Math.sqrt(1 + tangentSlope * tangentSlope);
    const tangent = {
      x: 1 / tangentLength,
      y: tangentSlope / tangentLength,
    };

    const normal1 = { x: -tangent.y, y: tangent.x };
    const normal2 = { x: tangent.y, y: -tangent.x };

    if (normal1.y > 0) {
      normalDirection = normal1;
    } else {
      normalDirection = normal2;
    }
  }

  const dotProduct =
    incident.x * normalDirection.x + incident.y * normalDirection.y;

  if (dotProduct > 0) {
    normalDirection.x = -normalDirection.x;
    normalDirection.y = -normalDirection.y;
  }

  const cosTheta1 = -(
    incident.x * normalDirection.x +
    incident.y * normalDirection.y
  );

  const sinTheta1 = Math.sqrt(Math.max(0, 1 - cosTheta1 * cosTheta1));
  const sinTheta2 = (n1 / n2) * sinTheta1;

  if (sinTheta2 > 1) {
    return null;
  }

  const cosTheta2 = Math.sqrt(1 - sinTheta2 * sinTheta2);

  const eta = n1 / n2;
  const c = cosTheta1;

  const refracted = {
    x: eta * incident.x + (eta * c - cosTheta2) * normalDirection.x,
    y: eta * incident.y + (eta * c - cosTheta2) * normalDirection.y,
  };

  let endpoints = [];

  if (refracted.x > 0) {
    const tRight = (STAGE_WIDTH - intersection.x) / refracted.x;
    const yRight = intersection.y + refracted.y * tRight;
    if (yRight >= 0 && yRight <= STAGE_HEIGHT && tRight > 0) {
      endpoints.push({ x: STAGE_WIDTH, y: yRight });
    }
  }

  if (refracted.x < 0) {
    const tLeft = (0 - intersection.x) / refracted.x;
    const yLeft = intersection.y + refracted.y * tLeft;
    if (yLeft >= 0 && yLeft <= STAGE_HEIGHT && tLeft > 0) {
      endpoints.push({ x: 0, y: yLeft });
    }
  }

  if (refracted.y > 0) {
    const tBottom = (STAGE_HEIGHT - intersection.y) / refracted.y;
    const xBottom = intersection.x + refracted.x * tBottom;
    if (xBottom >= 0 && xBottom <= STAGE_WIDTH && tBottom > 0) {
      endpoints.push({ x: xBottom, y: STAGE_HEIGHT });
    }
  }

  if (refracted.y < 0) {
    const tTop = (0 - intersection.y) / refracted.y;
    const xTop = intersection.x + refracted.x * tTop;
    if (xTop >= 0 && xTop <= STAGE_WIDTH && tTop > 0) {
      endpoints.push({ x: xTop, y: 0 });
    }
  }

  if (endpoints.length > 0) {
    return {
      startX: intersection.x,
      startY: intersection.y,
      endX: endpoints[0].x,
      endY: endpoints[0].y,
    };
  }

  return null;
}

function updateIncidentAngleLabel(intersection, normal, incidentRay) {
  if (!intersection || !normal || !incidentRay) {
    if (incidentAngleLabel) {
      incidentAngleLabel.visible = false;
    }
    return;
  }

  let normalVector = { x: 0, y: 0 };

  if (normal.slope === Infinity) {
    normalVector.x = 0;
    normalVector.y = -ANGLE_RADIUS;
  } else {
    const dx = normal.endX - normal.startX;
    const dy = normal.endY - normal.startY;

    const length = Math.sqrt(dx * dx + dy * dy);
    const normX = dx / length;
    const normY = dy / length;

    if (normY < 0) {
      normalVector.x = normX * ANGLE_RADIUS;
      normalVector.y = normY * ANGLE_RADIUS;
    } else {
      normalVector.x = -normX * ANGLE_RADIUS;
      normalVector.y = -normY * ANGLE_RADIUS;
    }
  }

  const incidentDx = incidentRay.startX - incidentRay.endX;
  const incidentDy = incidentRay.startY - incidentRay.endY;
  const incidentLength = Math.sqrt(
    incidentDx * incidentDx + incidentDy * incidentDy,
  );

  const incidentVector = {
    x: (incidentDx / incidentLength) * ANGLE_RADIUS,
    y: (incidentDy / incidentLength) * ANGLE_RADIUS,
  };

  const arm1X = intersection.x + normalVector.x;
  const arm1Y = intersection.y + normalVector.y;
  const arm2X = intersection.x + incidentVector.x;
  const arm2Y = intersection.y + incidentVector.y;

  if (!incidentAngleLabel) {
    incidentAngleLabel = new AngleLabel(
      intersection.x,
      intersection.y,
      arm1X,
      arm1Y,
      arm2X,
      arm2Y,
      ANGLE_RADIUS,
      "α",
      "Arial",
      18,
      0x444444,
      2,
      0x444444,
    );
  } else {
    incidentAngleLabel.setCenter(intersection.x, intersection.y);
    incidentAngleLabel.setArm1(arm1X, arm1Y);
    incidentAngleLabel.setArm2(arm2X, arm2Y);
    incidentAngleLabel.visible = true;
  }
}

function updateRefractedAngleLabel(intersection, normal, refractedRayData) {
  if (!intersection || !normal || !refractedRayData) {
    if (refractedAngleLabel) {
      refractedAngleLabel.visible = false;
    }
    return;
  }

  let normalVector = { x: 0, y: 0 };

  if (normal.slope === Infinity) {
    normalVector.x = 0;
    normalVector.y = ANGLE_RADIUS;
  } else {
    const dx = normal.endX - normal.startX;
    const dy = normal.endY - normal.startY;

    const length = Math.sqrt(dx * dx + dy * dy);
    const normX = dx / length;
    const normY = dy / length;

    if (normY > 0) {
      normalVector.x = normX * ANGLE_RADIUS;
      normalVector.y = normY * ANGLE_RADIUS;
    } else {
      normalVector.x = -normX * ANGLE_RADIUS;
      normalVector.y = -normY * ANGLE_RADIUS;
    }
  }

  const refractedDx = refractedRayData.endX - refractedRayData.startX;
  const refractedDy = refractedRayData.endY - refractedRayData.startY;
  const refractedLength = Math.sqrt(
    refractedDx * refractedDx + refractedDy * refractedDy,
  );

  const refractedVector = {
    x: (refractedDx / refractedLength) * ANGLE_RADIUS,
    y: (refractedDy / refractedLength) * ANGLE_RADIUS,
  };

  const arm1X = intersection.x + normalVector.x;
  const arm1Y = intersection.y + normalVector.y;
  const arm2X = intersection.x + refractedVector.x;
  const arm2Y = intersection.y + refractedVector.y;

  if (!refractedAngleLabel) {
    refractedAngleLabel = new AngleLabel(
      intersection.x,
      intersection.y,
      arm1X,
      arm1Y,
      arm2X,
      arm2Y,
      ANGLE_RADIUS,
      "β",
      "Arial",
      18,
      0x444444,
      2,
      0x444444,
    );
  } else {
    refractedAngleLabel.setCenter(intersection.x, intersection.y);
    refractedAngleLabel.setArm1(arm1X, arm1Y);
    refractedAngleLabel.setArm2(arm2X, arm2Y);
    refractedAngleLabel.visible = true;
  }
}

function updateReflectedAngleLabel(intersection, normal, reflectedRayData) {
  if (!intersection || !normal || !reflectedRayData) {
    if (reflectedAngleLabel) {
      reflectedAngleLabel.visible = false;
    }
    return;
  }

  let normalVector = { x: 0, y: 0 };

  if (normal.slope === Infinity) {
    normalVector.x = 0;
    normalVector.y = -ANGLE_RADIUS;
  } else {
    const dx = normal.endX - normal.startX;
    const dy = normal.endY - normal.startY;

    const length = Math.sqrt(dx * dx + dy * dy);
    const normX = dx / length;
    const normY = dy / length;

    if (normY < 0) {
      normalVector.x = normX * ANGLE_RADIUS;
      normalVector.y = normY * ANGLE_RADIUS;
    } else {
      normalVector.x = -normX * ANGLE_RADIUS;
      normalVector.y = -normY * ANGLE_RADIUS;
    }
  }

  const reflectedDx = reflectedRayData.endX - reflectedRayData.startX;
  const reflectedDy = reflectedRayData.endY - reflectedRayData.startY;
  const reflectedLength = Math.sqrt(
    reflectedDx * reflectedDx + reflectedDy * reflectedDy,
  );

  const reflectedVector = {
    x: (reflectedDx / reflectedLength) * ANGLE_RADIUS,
    y: (reflectedDy / reflectedLength) * ANGLE_RADIUS,
  };

  const arm1X = intersection.x + normalVector.x;
  const arm1Y = intersection.y + normalVector.y;
  const arm2X = intersection.x + reflectedVector.x;
  const arm2Y = intersection.y + reflectedVector.y;

  if (!reflectedAngleLabel) {
    reflectedAngleLabel = new AngleLabel(
      intersection.x,
      intersection.y,
      arm1X,
      arm1Y,
      arm2X,
      arm2Y,
      ANGLE_RADIUS,
      "α'",
      "Arial",
      18,
      0x444444,
      2,
      0x444444,
    );
  } else {
    reflectedAngleLabel.setCenter(intersection.x, intersection.y);
    reflectedAngleLabel.setArm1(arm1X, arm1Y);
    reflectedAngleLabel.setArm2(arm2X, arm2Y);
    reflectedAngleLabel.visible = true;
  }
}

function drawInterfaceSurface(cubic) {
  surfaceCurvePoints = [];
  const startX = cubic.x0;
  const endX = surfacePoints[1][0];

  for (let x = startX; x <= endX; x += 2) {
    let y = cubic.evaluate(x);
    surfaceCurvePoints.push([x, y]);
  }

  surfaceCurvePoints.push([endX, cubic.evaluate(endX)]);

  if (surfaceCurvePoints.length > 0) {
    const firstPoint = surfaceCurvePoints[0];
    surfaceCurvePoints.unshift([firstPoint[0], 10000]);

    const lastPoint = surfaceCurvePoints[surfaceCurvePoints.length - 1];
    surfaceCurvePoints.push([lastPoint[0], 10000]);
    surfaceCurvePoints.push([firstPoint[0], 10000]);
  }

  if (interfaceSurface && surfaceCurvePoints.length > 0) {
    interfaceSurface.setPoints(surfaceCurvePoints);
  }
}

function updateCalculation() {
  const p0 = { x: surfacePoints[0][0], y: surfacePoints[0][1] };
  const c0 = { x: surfacePoints[0][2], y: surfacePoints[0][3] };
  const p1 = { x: surfacePoints[1][0], y: surfacePoints[1][1] };
  const c1 = { x: surfacePoints[1][2], y: surfacePoints[1][3] };

  const cubic = calculateCubicFunction(p0, p1, c0, c1);

  drawInterfaceSurface(cubic);

  const lineStart = { x: flashlight.x + 13, y: flashlight.y };
  const lineEnd = calculateExtendedLine(lineStart, lightRayEndpoint);

  lightRay.setStart(lineStart.x, lineStart.y);
  lightRay.setEnd(lineEnd.endX, lineEnd.endY);

  const intersections = calculateIntersection(
    cubic,
    lineStart,
    lightRayEndpoint,
  );

  if (intersections.length > 0) {
    intersectionCircle.x = intersections[0].x;
    intersectionCircle.y = intersections[0].y;
    intersectionCircle.visible = true;

    const normal = calculateNormal(cubic, intersections[0]);
    if (normal) {
      normalLine.setStart(normal.startX, normal.startY);
      normalLine.setEnd(normal.endX, normal.endY);
      normalLine.visible = true;

      const incidentRay = {
        startX: lineStart.x,
        startY: lineStart.y,
        endX: intersections[0].x,
        endY: intersections[0].y,
      };

      const n1 = 1;
      const n2 = refractiveIndexStepper.value;

      const reflectedData = calculateReflectedRay(
        intersections[0],
        incidentRay,
        normal,
      );

      if (reflectedData) {
        reflectedRay.setStart(reflectedData.startX, reflectedData.startY);
        reflectedRay.setEnd(reflectedData.endX, reflectedData.endY);
        reflectedRay.visible = true;

        updateIncidentAngleLabel(intersections[0], normal, incidentRay);
        updateReflectedAngleLabel(intersections[0], normal, reflectedData);
      } else {
        reflectedRay.visible = false;
        if (incidentAngleLabel) {
          incidentAngleLabel.visible = false;
        }
        if (reflectedAngleLabel) {
          reflectedAngleLabel.visible = false;
        }
      }

      const refractedData = calculateRefractedRay(
        intersections[0],
        incidentRay,
        normal,
        n1,
        n2,
      );

      if (refractedData) {
        refractedRay.setStart(refractedData.startX, refractedData.startY);
        refractedRay.setEnd(refractedData.endX, refractedData.endY);
        refractedRay.visible = true;

        updateRefractedAngleLabel(intersections[0], normal, refractedData);
      } else {
        refractedRay.visible = false;
        if (refractedAngleLabel) {
          refractedAngleLabel.visible = false;
        }
      }
    } else {
      normalLine.visible = false;
      refractedRay.visible = false;
      reflectedRay.visible = false;
      if (incidentAngleLabel) {
        incidentAngleLabel.visible = false;
      }
      if (refractedAngleLabel) {
        refractedAngleLabel.visible = false;
      }
      if (reflectedAngleLabel) {
        reflectedAngleLabel.visible = false;
      }
    }

    for (let i = 1; i < intersections.length; i++) {
      let extraCircle = new Circle(8, 0xffaa00);
      extraCircle.x = intersections[i].x;
      extraCircle.y = intersections[i].y;
      extraCircle.setBorder(0x885500, 2);
      setTimeout(function () {
        extraCircle.remove();
      }, 100);
    }
  } else {
    intersectionCircle.visible = false;
    normalLine.visible = false;
    refractedRay.visible = false;
    reflectedRay.visible = false;
    if (incidentAngleLabel) {
      incidentAngleLabel.visible = false;
    }
    if (refractedAngleLabel) {
      refractedAngleLabel.visible = false;
    }
    if (reflectedAngleLabel) {
      reflectedAngleLabel.visible = false;
    }
  }

  updateFlashlightRotation();
}

function removeAllElements() {
  controlCircles.forEach(function (circle) {
    if (circle) circle.remove();
  });
  controlLines.forEach(function (line) {
    if (line) line.remove();
  });

  controlCircles = [];
  controlLines = [];
}

function createControlPoint(x, y, index) {
  let circle = new Circle(12, 0x66cc66);
  circle.x = x;
  circle.y = y;
  circle.setBorder(0x4a8b4a, 2);
  circle.setDragging(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

  circle.onDrag(function () {
    updateControlPoint(circle, index);
  });

  return circle;
}

function updateControlPoint(circle, index) {
  surfacePoints[index][2] = circle.x;
  surfacePoints[index][3] = circle.y;

  if (controlLines[index]) {
    controlLines[index].setEnd(circle.x, circle.y);
  }

  updateCalculation();
}

function createVisualElements() {
  removeAllElements();

  for (let i = 0; i < surfacePoints.length; i++) {
    const point = surfacePoints[i];
    if (point.length === 4) {
      let line = new Line(point[0], point[1], point[2], point[3], 0x999999, 1);
      controlLines.push(line);
    } else {
      controlLines.push(null);
    }
  }

  for (let i = 0; i < surfacePoints.length; i++) {
    const point = surfacePoints[i];
    if (point.length === 4) {
      let controlCircle = createControlPoint(point[2], point[3], i);
      controlCircles.push(controlCircle);
    } else {
      controlCircles.push(null);
    }
  }
}

// Event handler functions
function handleFlashlightDrag() {
  updateCalculation();
}

function handleLightRayEndpointDrag() {
  updateCalculation();
}

function handleRefractiveIndexChange(value) {
  updateCalculation();
}

// ===== SECTION 4: EVENT LISTENERS =====

flashlight.onDrag(handleFlashlightDrag);
lightRayEndpoint.onDrag(handleLightRayEndpointDrag);
refractiveIndexStepper.onChange(handleRefractiveIndexChange);

// Initialization
createVisualElements();
updateCalculation();
