// Created with Open Animation Lab

// ===== ABSCHNITT 1: BOARD UND VARIABLEN =====
let board = new Board(1280, 720);

// Konstanten
const STAGE_WIDTH = 1280;
const STAGE_HEIGHT = 720;
const CENTER_X = STAGE_WIDTH / 2;
const CENTER_Y = STAGE_HEIGHT / 2;
const ANGLE_RADIUS = 60;

// Arrays für dynamisch erstellte Elemente
let kontrollKreise = [];
let kontrollLinien = [];
let grenzflaechenKurvenpunkte = [];

// Winkel-Labels
let einfallswinkelLabel = null;
let brechungswinkelLabel = null;
let reflexionswinkelLabel = null;

// Grenzflächen-Punkte Definition
let grenzflaechenPunkte = [
  [-5, CENTER_Y, 350, CENTER_Y + 70],
  [STAGE_WIDTH + 5, CENTER_Y, STAGE_WIDTH - 350, CENTER_Y + 70],
  [STAGE_WIDTH + 2, STAGE_HEIGHT],
  [-5, STAGE_HEIGHT],
  [-5, CENTER_Y],
];

// ===== ABSCHNITT 2: OBJEKTE =====

// UI-Elemente
let brechungsindexStepper = new NumericStepper(
  1,
  1,
  10,
  0.1,
  100,
  "Arial",
  20,
  ",",
);
brechungsindexStepper.x = 1130;
brechungsindexStepper.y = 35;

let brechungsindexText = new Text(
  "Brechungsindex n<sub>2</sub>",
  "Arial",
  22,
  0x444444,
  "right",
);
brechungsindexText.x = 1120;
brechungsindexText.y = 24;

// Taschenlampe
let taschenlampe =
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
taschenlampe.setRotationPoint(14, 3);
taschenlampe.x = 80 - 13;
taschenlampe.y = 40;
taschenlampe.setDragging(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

// Lichtstrahlen
let lichtstrahl = new Line(
  80,
  40,
  STAGE_WIDTH - 20,
  STAGE_HEIGHT - 20,
  0xff6600,
  3,
);
lichtstrahl.x = 0;
lichtstrahl.y = 0;

let gebrochenerStrahl = new Line(
  CENTER_X,
  CENTER_Y,
  CENTER_X + 100,
  CENTER_Y + 100,
  0xff6600,
  3,
);
gebrochenerStrahl.visible = false;
gebrochenerStrahl.setAlpha(0.9);

let reflektierterStrahl = new Line(
  CENTER_X,
  CENTER_Y,
  CENTER_X - 100,
  CENTER_Y - 100,
  0xff6600,
  3,
);
reflektierterStrahl.visible = false;
reflektierterStrahl.setAlpha(0.9);

// Grenzfläche
let grenzflaeche = new LinePath([[0, 0]], 0x0066ff, 3);
grenzflaeche.setFillColor(0xe6f2ff);
grenzflaeche.setAlpha(0.5);

// Normale
let normaleLinie = new Line(
  CENTER_X,
  CENTER_Y,
  CENTER_X + 100,
  CENTER_Y,
  0x444444,
  2,
);
normaleLinie.visible = false;
normaleLinie.setStrokeDash([5, 5]);
normaleLinie.setAlpha(0.8);

// Interaktive Punkte
let lichtstrahlEndpunkt = new Circle(10, 0xff0000);
lichtstrahlEndpunkt.x = STAGE_WIDTH - 20;
lichtstrahlEndpunkt.y = STAGE_HEIGHT - 20;
lichtstrahlEndpunkt.setBorder(0x880000, 2);
lichtstrahlEndpunkt.setDragging(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

let schnittpunktKreis = new Circle(12, 0xffff00);
schnittpunktKreis.setBorder(0x888800, 3);
schnittpunktKreis.visible = false;

// ===== ABSCHNITT 3: FUNKTIONEN =====

function berechneVerlaengerteLinie(start, punkt) {
  const dx = punkt.x - start.x;
  const dy = punkt.y - start.y;

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

  const steigung = dy / dx;
  const achsenabschnitt = start.y - steigung * start.x;

  let endpunkte = [];

  if (dx > 0) {
    const yRechts = steigung * STAGE_WIDTH + achsenabschnitt;
    if (yRechts >= 0 && yRechts <= STAGE_HEIGHT) {
      endpunkte.push({ x: STAGE_WIDTH, y: yRechts });
    }
  }

  if (dx < 0) {
    const yLinks = achsenabschnitt;
    if (yLinks >= 0 && yLinks <= STAGE_HEIGHT) {
      endpunkte.push({ x: 0, y: yLinks });
    }
  }

  if (dy > 0) {
    const xUnten = (STAGE_HEIGHT - achsenabschnitt) / steigung;
    if (xUnten >= 0 && xUnten <= STAGE_WIDTH) {
      endpunkte.push({ x: xUnten, y: STAGE_HEIGHT });
    }
  }

  if (dy < 0) {
    const xOben = -achsenabschnitt / steigung;
    if (xOben >= 0 && xOben <= STAGE_WIDTH) {
      endpunkte.push({ x: xOben, y: 0 });
    }
  }

  if (endpunkte.length > 0) {
    return {
      endX: endpunkte[0].x,
      endY: endpunkte[0].y,
    };
  }

  return {
    endX: punkt.x,
    endY: punkt.y,
  };
}

function aktualisiereTaschenlampenRotation() {
  const dx = lichtstrahlEndpunkt.x - (taschenlampe.x + 13);
  const dy = lichtstrahlEndpunkt.y - taschenlampe.y;

  let winkelRad = Math.atan2(dy, dx);
  let winkelGrad = winkelRad * (180 / Math.PI);

  winkelGrad -= 90;
  taschenlampe.rotation = winkelGrad + 180;
}

function berechneCubicFunction(p0, p1, c0, c1) {
  const steigungStart = (c0.y - p0.y) / (c0.x - p0.x);
  const steigungEnde = (p1.y - c1.y) / (p1.x - c1.x);

  const xSpanne = p1.x - p0.x;
  const a =
    (2 * (p0.y - p1.y) + xSpanne * (steigungStart + steigungEnde)) /
    (xSpanne * xSpanne * xSpanne);
  const b =
    (3 * (p1.y - p0.y) - xSpanne * (2 * steigungStart + steigungEnde)) /
    (xSpanne * xSpanne);
  const c = steigungStart;
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

function berechneSchnittpunkt(cubic, lineStart, lineEnd) {
  const dx = lineEnd.x - lineStart.x;
  if (Math.abs(dx) < 0.0001) {
    const x = lineStart.x;
    const y = cubic.evaluate(x);
    const minY = Math.min(lineStart.y, lineEnd.y);
    const maxY = Math.max(lineStart.y, lineEnd.y);
    if (
      y >= minY &&
      y <= maxY &&
      x >= cubic.x0 &&
      x <= grenzflaechenPunkte[1][0]
    ) {
      return [{ x: x, y: y }];
    }
    return [];
  }

  const steigung = (lineEnd.y - lineStart.y) / dx;
  const achsenabschnitt = lineStart.y - steigung * lineStart.x;

  function newton(x0, maxIter = 20) {
    let x = x0;
    for (let i = 0; i < maxIter; i++) {
      const fx = cubic.evaluate(x) - (steigung * x + achsenabschnitt);
      const dfx = cubic.derivative(x) - steigung;
      if (Math.abs(dfx) < 0.0001) break;
      const xNew = x - fx / dfx;
      if (Math.abs(xNew - x) < 0.0001) break;
      x = xNew;
    }
    return x;
  }

  const minX = Math.min(cubic.x0, grenzflaechenPunkte[1][0]);
  const maxX = Math.max(cubic.x0, grenzflaechenPunkte[1][0]);
  const startPunkte = [
    minX,
    minX + (maxX - minX) * 0.25,
    minX + (maxX - minX) * 0.5,
    minX + (maxX - minX) * 0.75,
    maxX,
  ];

  let schnittpunkte = [];
  for (let start of startPunkte) {
    const x = newton(start);
    const y = cubic.evaluate(x);

    const aufKurve = x >= minX && x <= maxX;
    const yAufLinie = steigung * x + achsenabschnitt;
    const genauigkeit = Math.abs(y - yAufLinie) < 1;

    if (aufKurve && genauigkeit) {
      let istNeu = true;
      for (let p of schnittpunkte) {
        if (Math.abs(p.x - x) < 1) {
          istNeu = false;
          break;
        }
      }
      if (istNeu) {
        schnittpunkte.push({ x: x, y: y });
      }
    }
  }

  return schnittpunkte;
}

function berechneNormale(cubic, schnittpunkt) {
  const kurvenSteigung = cubic.derivative(schnittpunkt.x);

  let normaleSteigung;
  if (Math.abs(kurvenSteigung) < 0.0001) {
    return {
      steigung: Infinity,
      startX: schnittpunkt.x,
      startY: 0,
      endX: schnittpunkt.x,
      endY: STAGE_HEIGHT,
    };
  } else {
    normaleSteigung = -1 / kurvenSteigung;
  }

  let punkte = [];

  const y1 = schnittpunkt.y + normaleSteigung * (0 - schnittpunkt.x);
  if (y1 >= 0 && y1 <= STAGE_HEIGHT) {
    punkte.push({ x: 0, y: y1 });
  }

  const y2 = schnittpunkt.y + normaleSteigung * (STAGE_WIDTH - schnittpunkt.x);
  if (y2 >= 0 && y2 <= STAGE_HEIGHT) {
    punkte.push({ x: STAGE_WIDTH, y: y2 });
  }

  if (Math.abs(normaleSteigung) > 0.0001) {
    const x1 = schnittpunkt.x + (0 - schnittpunkt.y) / normaleSteigung;
    if (x1 >= 0 && x1 <= STAGE_WIDTH) {
      punkte.push({ x: x1, y: 0 });
    }
  }

  if (Math.abs(normaleSteigung) > 0.0001) {
    const x2 =
      schnittpunkt.x + (STAGE_HEIGHT - schnittpunkt.y) / normaleSteigung;
    if (x2 >= 0 && x2 <= STAGE_WIDTH) {
      punkte.push({ x: x2, y: STAGE_HEIGHT });
    }
  }

  if (punkte.length >= 2) {
    return {
      steigung: normaleSteigung,
      startX: punkte[0].x,
      startY: punkte[0].y,
      endX: punkte[1].x,
      endY: punkte[1].y,
    };
  }

  return null;
}

function berechneReflektiertenStrahl(schnittpunkt, einfallsStrahl, normale) {
  const dx1 = einfallsStrahl.endX - einfallsStrahl.startX;
  const dy1 = einfallsStrahl.endY - einfallsStrahl.startY;

  const einfallsLaenge = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const einfallsVektor = {
    x: dx1 / einfallsLaenge,
    y: dy1 / einfallsLaenge,
  };

  let normalenVektor = { x: 0, y: 0 };

  if (normale.steigung === Infinity) {
    normalenVektor.x = 0;
    normalenVektor.y = 1;
  } else {
    const tangentenSteigung = -1 / normale.steigung;

    const tangentLength = Math.sqrt(1 + tangentenSteigung * tangentenSteigung);
    const tangent = {
      x: 1 / tangentLength,
      y: tangentenSteigung / tangentLength,
    };

    normalenVektor.x = -tangent.y;
    normalenVektor.y = tangent.x;

    if (normalenVektor.y > 0) {
      normalenVektor.x = -normalenVektor.x;
      normalenVektor.y = -normalenVektor.y;
    }
  }

  const dotProduct =
    einfallsVektor.x * normalenVektor.x + einfallsVektor.y * normalenVektor.y;

  const reflexionsVektor = {
    x: einfallsVektor.x - 2 * dotProduct * normalenVektor.x,
    y: einfallsVektor.y - 2 * dotProduct * normalenVektor.y,
  };

  let endpunkte = [];

  if (reflexionsVektor.x > 0) {
    const tRechts = (STAGE_WIDTH - schnittpunkt.x) / reflexionsVektor.x;
    const yRechts = schnittpunkt.y + reflexionsVektor.y * tRechts;
    if (yRechts >= 0 && yRechts <= STAGE_HEIGHT && tRechts > 0) {
      endpunkte.push({ x: STAGE_WIDTH, y: yRechts });
    }
  }

  if (reflexionsVektor.x < 0) {
    const tLinks = (0 - schnittpunkt.x) / reflexionsVektor.x;
    const yLinks = schnittpunkt.y + reflexionsVektor.y * tLinks;
    if (yLinks >= 0 && yLinks <= STAGE_HEIGHT && tLinks > 0) {
      endpunkte.push({ x: 0, y: yLinks });
    }
  }

  if (reflexionsVektor.y > 0) {
    const tUnten = (STAGE_HEIGHT - schnittpunkt.y) / reflexionsVektor.y;
    const xUnten = schnittpunkt.x + reflexionsVektor.x * tUnten;
    if (xUnten >= 0 && xUnten <= STAGE_WIDTH && tUnten > 0) {
      endpunkte.push({ x: xUnten, y: STAGE_HEIGHT });
    }
  }

  if (reflexionsVektor.y < 0) {
    const tOben = (0 - schnittpunkt.y) / reflexionsVektor.y;
    const xOben = schnittpunkt.x + reflexionsVektor.x * tOben;
    if (xOben >= 0 && xOben <= STAGE_WIDTH && tOben > 0) {
      endpunkte.push({ x: xOben, y: 0 });
    }
  }

  if (endpunkte.length > 0) {
    return {
      startX: schnittpunkt.x,
      startY: schnittpunkt.y,
      endX: endpunkte[0].x,
      endY: endpunkte[0].y,
    };
  }

  return null;
}

function berechneGebrochenStrahl(
  schnittpunkt,
  einfallsStrahl,
  normale,
  n1,
  n2,
) {
  if (Math.abs(n1 - n2) < 0.0001) {
    const dx = einfallsStrahl.endX - einfallsStrahl.startX;
    const dy = einfallsStrahl.endY - einfallsStrahl.startY;

    const laenge = Math.sqrt(dx * dx + dy * dy);
    const richtungX = dx / laenge;
    const richtungY = dy / laenge;

    let endpunkte = [];

    if (richtungX > 0) {
      const tRechts = (STAGE_WIDTH - schnittpunkt.x) / richtungX;
      const yRechts = schnittpunkt.y + richtungY * tRechts;
      if (yRechts >= 0 && yRechts <= STAGE_HEIGHT && tRechts > 0) {
        endpunkte.push({ x: STAGE_WIDTH, y: yRechts });
      }
    }

    if (richtungX < 0) {
      const tLinks = (0 - schnittpunkt.x) / richtungX;
      const yLinks = schnittpunkt.y + richtungY * tLinks;
      if (yLinks >= 0 && yLinks <= STAGE_HEIGHT && tLinks > 0) {
        endpunkte.push({ x: 0, y: yLinks });
      }
    }

    if (richtungY > 0) {
      const tUnten = (STAGE_HEIGHT - schnittpunkt.y) / richtungY;
      const xUnten = schnittpunkt.x + richtungX * tUnten;
      if (xUnten >= 0 && xUnten <= STAGE_WIDTH && tUnten > 0) {
        endpunkte.push({ x: xUnten, y: STAGE_HEIGHT });
      }
    }

    if (richtungY < 0) {
      const tOben = (0 - schnittpunkt.y) / richtungY;
      const xOben = schnittpunkt.x + richtungX * tOben;
      if (xOben >= 0 && xOben <= STAGE_WIDTH && tOben > 0) {
        endpunkte.push({ x: xOben, y: 0 });
      }
    }

    if (endpunkte.length > 0) {
      return {
        startX: schnittpunkt.x,
        startY: schnittpunkt.y,
        endX: endpunkte[0].x,
        endY: endpunkte[0].y,
      };
    }
    return null;
  }

  const dx1 = einfallsStrahl.endX - einfallsStrahl.startX;
  const dy1 = einfallsStrahl.endY - einfallsStrahl.startY;

  const einfallsLaenge = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const incident = {
    x: dx1 / einfallsLaenge,
    y: dy1 / einfallsLaenge,
  };

  let normalRichtung = { x: 0, y: 0 };

  if (normale.steigung === Infinity) {
    normalRichtung.x = 1;
    normalRichtung.y = 0;
  } else {
    const tangentenSteigung = -1 / normale.steigung;

    const tangentLength = Math.sqrt(1 + tangentenSteigung * tangentenSteigung);
    const tangent = {
      x: 1 / tangentLength,
      y: tangentenSteigung / tangentLength,
    };

    const normal1 = { x: -tangent.y, y: tangent.x };
    const normal2 = { x: tangent.y, y: -tangent.x };

    if (normal1.y > 0) {
      normalRichtung = normal1;
    } else {
      normalRichtung = normal2;
    }
  }

  const dotProduct =
    incident.x * normalRichtung.x + incident.y * normalRichtung.y;

  if (dotProduct > 0) {
    normalRichtung.x = -normalRichtung.x;
    normalRichtung.y = -normalRichtung.y;
  }

  const cosTheta1 = -(
    incident.x * normalRichtung.x +
    incident.y * normalRichtung.y
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
    x: eta * incident.x + (eta * c - cosTheta2) * normalRichtung.x,
    y: eta * incident.y + (eta * c - cosTheta2) * normalRichtung.y,
  };

  let endpunkte = [];

  if (refracted.x > 0) {
    const tRechts = (STAGE_WIDTH - schnittpunkt.x) / refracted.x;
    const yRechts = schnittpunkt.y + refracted.y * tRechts;
    if (yRechts >= 0 && yRechts <= STAGE_HEIGHT && tRechts > 0) {
      endpunkte.push({ x: STAGE_WIDTH, y: yRechts });
    }
  }

  if (refracted.x < 0) {
    const tLinks = (0 - schnittpunkt.x) / refracted.x;
    const yLinks = schnittpunkt.y + refracted.y * tLinks;
    if (yLinks >= 0 && yLinks <= STAGE_HEIGHT && tLinks > 0) {
      endpunkte.push({ x: 0, y: yLinks });
    }
  }

  if (refracted.y > 0) {
    const tUnten = (STAGE_HEIGHT - schnittpunkt.y) / refracted.y;
    const xUnten = schnittpunkt.x + refracted.x * tUnten;
    if (xUnten >= 0 && xUnten <= STAGE_WIDTH && tUnten > 0) {
      endpunkte.push({ x: xUnten, y: STAGE_HEIGHT });
    }
  }

  if (refracted.y < 0) {
    const tOben = (0 - schnittpunkt.y) / refracted.y;
    const xOben = schnittpunkt.x + refracted.x * tOben;
    if (xOben >= 0 && xOben <= STAGE_WIDTH && tOben > 0) {
      endpunkte.push({ x: xOben, y: 0 });
    }
  }

  if (endpunkte.length > 0) {
    return {
      startX: schnittpunkt.x,
      startY: schnittpunkt.y,
      endX: endpunkte[0].x,
      endY: endpunkte[0].y,
    };
  }

  return null;
}

function aktualisiereEinfallsWinkelLabel(
  schnittpunkt,
  normale,
  einfallsStrahl,
) {
  if (!schnittpunkt || !normale || !einfallsStrahl) {
    if (einfallswinkelLabel) {
      einfallswinkelLabel.visible = false;
    }
    return;
  }

  let normalenVektor = { x: 0, y: 0 };

  if (normale.steigung === Infinity) {
    normalenVektor.x = 0;
    normalenVektor.y = -ANGLE_RADIUS;
  } else {
    const dx = normale.endX - normale.startX;
    const dy = normale.endY - normale.startY;

    const laenge = Math.sqrt(dx * dx + dy * dy);
    const normX = dx / laenge;
    const normY = dy / laenge;

    if (normY < 0) {
      normalenVektor.x = normX * ANGLE_RADIUS;
      normalenVektor.y = normY * ANGLE_RADIUS;
    } else {
      normalenVektor.x = -normX * ANGLE_RADIUS;
      normalenVektor.y = -normY * ANGLE_RADIUS;
    }
  }

  const einfallsDx = einfallsStrahl.startX - einfallsStrahl.endX;
  const einfallsDy = einfallsStrahl.startY - einfallsStrahl.endY;
  const einfallsLaenge = Math.sqrt(
    einfallsDx * einfallsDx + einfallsDy * einfallsDy,
  );

  const einfallsVektor = {
    x: (einfallsDx / einfallsLaenge) * ANGLE_RADIUS,
    y: (einfallsDy / einfallsLaenge) * ANGLE_RADIUS,
  };

  const arm1X = schnittpunkt.x + normalenVektor.x;
  const arm1Y = schnittpunkt.y + normalenVektor.y;
  const arm2X = schnittpunkt.x + einfallsVektor.x;
  const arm2Y = schnittpunkt.y + einfallsVektor.y;

  if (!einfallswinkelLabel) {
    einfallswinkelLabel = new AngleLabel(
      schnittpunkt.x,
      schnittpunkt.y,
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
    einfallswinkelLabel.setCenter(schnittpunkt.x, schnittpunkt.y);
    einfallswinkelLabel.setArm1(arm1X, arm1Y);
    einfallswinkelLabel.setArm2(arm2X, arm2Y);
    einfallswinkelLabel.visible = true;
  }
}

function aktualisiereBrechungsWinkelLabel(
  schnittpunkt,
  normale,
  gebrochenStrahl,
) {
  if (!schnittpunkt || !normale || !gebrochenStrahl) {
    if (brechungswinkelLabel) {
      brechungswinkelLabel.visible = false;
    }
    return;
  }

  let normalenVektor = { x: 0, y: 0 };

  if (normale.steigung === Infinity) {
    normalenVektor.x = 0;
    normalenVektor.y = ANGLE_RADIUS;
  } else {
    const dx = normale.endX - normale.startX;
    const dy = normale.endY - normale.startY;

    const laenge = Math.sqrt(dx * dx + dy * dy);
    const normX = dx / laenge;
    const normY = dy / laenge;

    if (normY > 0) {
      normalenVektor.x = normX * ANGLE_RADIUS;
      normalenVektor.y = normY * ANGLE_RADIUS;
    } else {
      normalenVektor.x = -normX * ANGLE_RADIUS;
      normalenVektor.y = -normY * ANGLE_RADIUS;
    }
  }

  const gebrochenDx = gebrochenStrahl.endX - gebrochenStrahl.startX;
  const gebrochenDy = gebrochenStrahl.endY - gebrochenStrahl.startY;
  const gebrochenLaenge = Math.sqrt(
    gebrochenDx * gebrochenDx + gebrochenDy * gebrochenDy,
  );

  const gebrochenVektor = {
    x: (gebrochenDx / gebrochenLaenge) * ANGLE_RADIUS,
    y: (gebrochenDy / gebrochenLaenge) * ANGLE_RADIUS,
  };

  const arm1X = schnittpunkt.x + normalenVektor.x;
  const arm1Y = schnittpunkt.y + normalenVektor.y;
  const arm2X = schnittpunkt.x + gebrochenVektor.x;
  const arm2Y = schnittpunkt.y + gebrochenVektor.y;

  if (!brechungswinkelLabel) {
    brechungswinkelLabel = new AngleLabel(
      schnittpunkt.x,
      schnittpunkt.y,
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
    brechungswinkelLabel.setCenter(schnittpunkt.x, schnittpunkt.y);
    brechungswinkelLabel.setArm1(arm1X, arm1Y);
    brechungswinkelLabel.setArm2(arm2X, arm2Y);
    brechungswinkelLabel.visible = true;
  }
}

function aktualisiereReflexionsWinkelLabel(
  schnittpunkt,
  normale,
  reflektierterStrahl,
) {
  if (!schnittpunkt || !normale || !reflektierterStrahl) {
    if (reflexionswinkelLabel) {
      reflexionswinkelLabel.visible = false;
    }
    return;
  }

  let normalenVektor = { x: 0, y: 0 };

  if (normale.steigung === Infinity) {
    normalenVektor.x = 0;
    normalenVektor.y = -ANGLE_RADIUS;
  } else {
    const dx = normale.endX - normale.startX;
    const dy = normale.endY - normale.startY;

    const laenge = Math.sqrt(dx * dx + dy * dy);
    const normX = dx / laenge;
    const normY = dy / laenge;

    if (normY < 0) {
      normalenVektor.x = normX * ANGLE_RADIUS;
      normalenVektor.y = normY * ANGLE_RADIUS;
    } else {
      normalenVektor.x = -normX * ANGLE_RADIUS;
      normalenVektor.y = -normY * ANGLE_RADIUS;
    }
  }

  const reflektiertDx = reflektierterStrahl.endX - reflektierterStrahl.startX;
  const reflektiertDy = reflektierterStrahl.endY - reflektierterStrahl.startY;
  const reflektiertLaenge = Math.sqrt(
    reflektiertDx * reflektiertDx + reflektiertDy * reflektiertDy,
  );

  const reflektiertVektor = {
    x: (reflektiertDx / reflektiertLaenge) * ANGLE_RADIUS,
    y: (reflektiertDy / reflektiertLaenge) * ANGLE_RADIUS,
  };

  const arm1X = schnittpunkt.x + normalenVektor.x;
  const arm1Y = schnittpunkt.y + normalenVektor.y;
  const arm2X = schnittpunkt.x + reflektiertVektor.x;
  const arm2Y = schnittpunkt.y + reflektiertVektor.y;

  if (!reflexionswinkelLabel) {
    reflexionswinkelLabel = new AngleLabel(
      schnittpunkt.x,
      schnittpunkt.y,
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
    reflexionswinkelLabel.setCenter(schnittpunkt.x, schnittpunkt.y);
    reflexionswinkelLabel.setArm1(arm1X, arm1Y);
    reflexionswinkelLabel.setArm2(arm2X, arm2Y);
    reflexionswinkelLabel.visible = true;
  }
}

function zeichneGrenzflaeche(cubic) {
  grenzflaechenKurvenpunkte = [];
  const startX = cubic.x0;
  const endX = grenzflaechenPunkte[1][0];

  for (let x = startX; x <= endX; x += 2) {
    let y = cubic.evaluate(x);
    grenzflaechenKurvenpunkte.push([x, y]);
  }

  grenzflaechenKurvenpunkte.push([endX, cubic.evaluate(endX)]);

  if (grenzflaechenKurvenpunkte.length > 0) {
    const ersterPunkt = grenzflaechenKurvenpunkte[0];
    grenzflaechenKurvenpunkte.unshift([ersterPunkt[0], 10000]);

    const letzterPunkt =
      grenzflaechenKurvenpunkte[grenzflaechenKurvenpunkte.length - 1];
    grenzflaechenKurvenpunkte.push([letzterPunkt[0], 10000]);
    grenzflaechenKurvenpunkte.push([ersterPunkt[0], 10000]);
  }

  if (grenzflaeche && grenzflaechenKurvenpunkte.length > 0) {
    grenzflaeche.setPoints(grenzflaechenKurvenpunkte);
  }
}

function aktualisiereBerechnung() {
  const p0 = { x: grenzflaechenPunkte[0][0], y: grenzflaechenPunkte[0][1] };
  const c0 = { x: grenzflaechenPunkte[0][2], y: grenzflaechenPunkte[0][3] };
  const p1 = { x: grenzflaechenPunkte[1][0], y: grenzflaechenPunkte[1][1] };
  const c1 = { x: grenzflaechenPunkte[1][2], y: grenzflaechenPunkte[1][3] };

  const cubic = berechneCubicFunction(p0, p1, c0, c1);

  zeichneGrenzflaeche(cubic);

  const lineStart = { x: taschenlampe.x + 13, y: taschenlampe.y };
  const lineEnd = berechneVerlaengerteLinie(lineStart, lichtstrahlEndpunkt);

  lichtstrahl.setStart(lineStart.x, lineStart.y);
  lichtstrahl.setEnd(lineEnd.endX, lineEnd.endY);

  const schnittpunkte = berechneSchnittpunkt(
    cubic,
    lineStart,
    lichtstrahlEndpunkt,
  );

  if (schnittpunkte.length > 0) {
    schnittpunktKreis.x = schnittpunkte[0].x;
    schnittpunktKreis.y = schnittpunkte[0].y;
    schnittpunktKreis.visible = true;

    const normale = berechneNormale(cubic, schnittpunkte[0]);
    if (normale) {
      normaleLinie.setStart(normale.startX, normale.startY);
      normaleLinie.setEnd(normale.endX, normale.endY);
      normaleLinie.visible = true;

      const einfallsStrahl = {
        startX: lineStart.x,
        startY: lineStart.y,
        endX: schnittpunkte[0].x,
        endY: schnittpunkte[0].y,
      };

      const n1 = 1;
      const n2 = brechungsindexStepper.value;

      const reflektierteDaten = berechneReflektiertenStrahl(
        schnittpunkte[0],
        einfallsStrahl,
        normale,
      );

      if (reflektierteDaten) {
        reflektierterStrahl.setStart(
          reflektierteDaten.startX,
          reflektierteDaten.startY,
        );
        reflektierterStrahl.setEnd(
          reflektierteDaten.endX,
          reflektierteDaten.endY,
        );
        reflektierterStrahl.visible = true;

        aktualisiereEinfallsWinkelLabel(
          schnittpunkte[0],
          normale,
          einfallsStrahl,
        );
        aktualisiereReflexionsWinkelLabel(
          schnittpunkte[0],
          normale,
          reflektierteDaten,
        );
      } else {
        reflektierterStrahl.visible = false;
        if (einfallswinkelLabel) {
          einfallswinkelLabel.visible = false;
        }
        if (reflexionswinkelLabel) {
          reflexionswinkelLabel.visible = false;
        }
      }

      const gebrochenStrahl = berechneGebrochenStrahl(
        schnittpunkte[0],
        einfallsStrahl,
        normale,
        n1,
        n2,
      );

      if (gebrochenStrahl) {
        gebrochenerStrahl.setStart(
          gebrochenStrahl.startX,
          gebrochenStrahl.startY,
        );
        gebrochenerStrahl.setEnd(gebrochenStrahl.endX, gebrochenStrahl.endY);
        gebrochenerStrahl.visible = true;

        aktualisiereBrechungsWinkelLabel(
          schnittpunkte[0],
          normale,
          gebrochenStrahl,
        );
      } else {
        gebrochenerStrahl.visible = false;
        if (brechungswinkelLabel) {
          brechungswinkelLabel.visible = false;
        }
      }
    } else {
      normaleLinie.visible = false;
      gebrochenerStrahl.visible = false;
      reflektierterStrahl.visible = false;
      if (einfallswinkelLabel) {
        einfallswinkelLabel.visible = false;
      }
      if (brechungswinkelLabel) {
        brechungswinkelLabel.visible = false;
      }
      if (reflexionswinkelLabel) {
        reflexionswinkelLabel.visible = false;
      }
    }

    for (let i = 1; i < schnittpunkte.length; i++) {
      let extraKreis = new Circle(8, 0xffaa00);
      extraKreis.x = schnittpunkte[i].x;
      extraKreis.y = schnittpunkte[i].y;
      extraKreis.setBorder(0x885500, 2);
      setTimeout(function () {
        extraKreis.remove();
      }, 100);
    }
  } else {
    schnittpunktKreis.visible = false;
    normaleLinie.visible = false;
    gebrochenerStrahl.visible = false;
    reflektierterStrahl.visible = false;
    if (einfallswinkelLabel) {
      einfallswinkelLabel.visible = false;
    }
    if (brechungswinkelLabel) {
      brechungswinkelLabel.visible = false;
    }
    if (reflexionswinkelLabel) {
      reflexionswinkelLabel.visible = false;
    }
  }

  aktualisiereTaschenlampenRotation();
}

function entferneAlleElemente() {
  kontrollKreise.forEach(function (kreis) {
    if (kreis) kreis.remove();
  });
  kontrollLinien.forEach(function (linie) {
    if (linie) linie.remove();
  });

  kontrollKreise = [];
  kontrollLinien = [];
}

function erstelleKontrollpunkt(x, y, index) {
  let kreis = new Circle(12, 0x66cc66);
  kreis.x = x;
  kreis.y = y;
  kreis.setBorder(0x4a8b4a, 2);
  kreis.setDragging(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

  kreis.onDrag(function () {
    aktualisiereKontrollpunkt(kreis, index);
  });

  return kreis;
}

function aktualisiereKontrollpunkt(kreis, index) {
  grenzflaechenPunkte[index][2] = kreis.x;
  grenzflaechenPunkte[index][3] = kreis.y;

  if (kontrollLinien[index]) {
    kontrollLinien[index].setEnd(kreis.x, kreis.y);
  }

  aktualisiereBerechnung();
}

function erstelleVisuelleElemente() {
  entferneAlleElemente();

  for (let i = 0; i < grenzflaechenPunkte.length; i++) {
    const punkt = grenzflaechenPunkte[i];
    if (punkt.length === 4) {
      let linie = new Line(punkt[0], punkt[1], punkt[2], punkt[3], 0x999999, 1);
      kontrollLinien.push(linie);
    } else {
      kontrollLinien.push(null);
    }
  }

  for (let i = 0; i < grenzflaechenPunkte.length; i++) {
    const punkt = grenzflaechenPunkte[i];
    if (punkt.length === 4) {
      let kontrollKreis = erstelleKontrollpunkt(punkt[2], punkt[3], i);
      kontrollKreise.push(kontrollKreis);
    } else {
      kontrollKreise.push(null);
    }
  }
}

// Event-Handler Funktionen
function handleTaschenlampeDrag() {
  aktualisiereBerechnung();
}

function handleLichtstrahlEndpunktDrag() {
  aktualisiereBerechnung();
}

function handleBrechungsindexChange(value) {
  aktualisiereBerechnung();
}

// ===== ABSCHNITT 4: EVENT LISTENER =====

taschenlampe.onDrag(handleTaschenlampeDrag);
lichtstrahlEndpunkt.onDrag(handleLichtstrahlEndpunktDrag);
brechungsindexStepper.onChange(handleBrechungsindexChange);

// Initialisierung
erstelleVisuelleElemente();
aktualisiereBerechnung();
