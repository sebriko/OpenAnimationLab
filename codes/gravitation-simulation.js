// Created with Open Animation Lab
// Gravitations-Simulation zur Demonstration der Gravitationskraft
// Open Source – CC BY 4.0

let board = new Board(1280, 720);

// ==================== KONSTANTEN ====================
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const G = 500; // Gravitationskonstante (skaliert für Visualisierung)
const MIN_DISTANCE = 5; // Minimaler Abstand zur Vermeidung von Singularitäten

// ==================== PLANETEN-DATEN ====================
let planets = [];
let trails = [];
let arrows = [];

// ==================== HINTERGRUND (Weltraum) ====================
let background = new Rectangle(CANVAS_WIDTH, CANVAS_HEIGHT, 0x0a0a20);
background.x = 0;
background.y = 0;

// Sterne als Dekoration
for (let i = 0; i < 100; i++) {
  let star = new Circle(Math.random() * 2 + 0.5, 0xffffff);
  star.x = Math.random() * CANVAS_WIDTH;
  star.y = Math.random() * CANVAS_HEIGHT;
  star.setAlpha(Math.random() * 0.5 + 0.3);
}

// ==================== UI PANEL ====================
let uiPanel = new Rectangle(280, 700, 0x1a1a2e);
uiPanel.x = 10;
uiPanel.y = 10;
uiPanel.setRoundedCorners(10);
uiPanel.setAlpha(0.95);

// Gravitationsgesetz

let myForm = new MathForm("$$F = \frac{G \cdot m_1 \cdot m_2}{r^2}$$");

myForm.setColor("#FFFFFF");

myForm.x = 40;
myForm.y = 25;

myForm.setScale(1.3);

// ==================== NEUE PLANETEN-EINSTELLUNGEN ====================
let settingsTitle = new Text(
  "Neuer Planet (per Klick):",
  "Arial",
  20,
  0xffffff,
  "left",
);
settingsTitle.x = 25;
settingsTitle.y = 125;

// Masse
let massLabel = new Text("Masse:", "Arial", 20, 0xffffff, "left");
massLabel.x = 25;
massLabel.y = 165;

let massStepper = new NumericStepper(50, 1, 500, 10, 110, "Arial", 20);
massStepper.x = 130;
massStepper.y = 172;

// Radius
let radiusLabel = new Text("Radius:", "Arial", 20, 0xffffff, "left");
radiusLabel.x = 25;
radiusLabel.y = 205;

let radiusStepper = new NumericStepper(20, 5, 80, 5, 110, "Arial", 20);
radiusStepper.x = 130;
radiusStepper.y = 212;

// Farbe
let colorLabel = new Text("Farbe:", "Arial", 20, 0xffffff, "left");
colorLabel.x = 25;
colorLabel.y = 245;

let colorOptions = [
  "Rot",
  "Orange",
  "Gelb",
  "Grün",
  "Blau",
  "Lila",
  "Weiß",
  "Cyan",
];
let colorValues = [
  0xff3333, 0xff9933, 0xffff33, 0x33ff33, 0x3333ff, 0x9933ff, 0xffffff,
  0x33ffff,
];
let colorDropdown = new Dropdown(colorOptions, 110, 34, "Arial", 20);
colorDropdown.x = 130;
colorDropdown.y = 250;

// ==================== SIMULATIONS-STEUERUNG ====================

// Start/Pause Button
let startButton = new Button("Simulation starten", 210, 40, "Arial", 20);
startButton.x = 30;
startButton.y = 340;

// Reset Button
let resetButton = new Button("Alles zurücksetzen", 210, 40, "Arial", 20);
resetButton.x = 30;
resetButton.y = 390;

// Flags sind jetzt immer aktiv
let showTrails = true;
let showArrows = true;
let enableMerge = true;

// ==================== INFO-ANZEIGE ====================

let planetCountText = new Text("Planeten: 0", "Arial", 20, 0xffffff, "left");
planetCountText.x = 25;
planetCountText.y = 550;

let hintText = new Text(
  "Klick = neuer Planet\nZiehen = Impuls setzen",
  "Arial",
  20,
  0xffffff,
  "left",
);
hintText.x = 25;
hintText.y = 590;

// ==================== ZUSTANDSVARIABLEN ====================
let isSimulating = false;
let isDragging = false;
let draggedPlanet = null;
let dragStartX = 0;
let dragStartY = 0;

// ==================== FUNKTIONEN ====================

function createPlanet(x, y, mass, radius, color) {
  let planet = new Circle(radius, color);
  planet.x = x;
  planet.y = y;

  // Gradient für 3D-Effekt
  planet.setGradient("radial", [
    { offset: 0.0, color: "#ffffff" },
    { offset: 0.3, color: colorToHex(color) },
    { offset: 1.0, color: colorToHex(darkenColor(color)) },
  ]);

  // Physik-Eigenschaften
  planet.vx = 0;
  planet.vy = 0;
  planet.mass = mass;
  planet.radius = radius;
  planet.color = color;

  planets.push(planet);

  // Bahnspur erstellen
  let trail = new LinePath([[x, y]], color, 2);
  trail.setAlpha(0.5);
  trail.visible = showTrails;
  trails.push(trail);

  // Impulspfeil erstellen
  let arrow = new Arrow(x, y, x, y, 0xffff00, 3, 15, 8);
  arrow.visible = false;
  arrows.push(arrow);

  updatePlanetCount();

  return planet;
}

function colorToHex(color) {
  return "#" + color.toString(16).padStart(6, "0");
}

function darkenColor(color) {
  let r = (color >> 16) & 0xff;
  let g = (color >> 8) & 0xff;
  let b = color & 0xff;
  r = Math.floor(r * 0.3);
  g = Math.floor(g * 0.3);
  b = Math.floor(b * 0.3);
  return (r << 16) | (g << 8) | b;
}

function updatePlanetCount() {
  planetCountText.setText("Planeten: " + planets.length);
}

function findPlanetAt(x, y) {
  for (let i = planets.length - 1; i >= 0; i--) {
    let p = planets[i];
    let dx = x - p.x;
    let dy = y - p.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < p.radius + 10) {
      return i;
    }
  }
  return -1;
}

function removePlanet(index) {
  // Planet unsichtbar machen und aus Array entfernen
  planets[index].visible = false;
  trails[index].visible = false;
  arrows[index].visible = false;

  planets.splice(index, 1);
  trails.splice(index, 1);
  arrows.splice(index, 1);

  updatePlanetCount();
}

function resetSimulation() {
  isSimulating = false;
  startButton.setText("Simulation starten");

  // Alle Planeten entfernen
  for (let p of planets) {
    p.visible = false;
  }
  for (let t of trails) {
    t.visible = false;
  }
  for (let a of arrows) {
    a.visible = false;
  }

  planets = [];
  trails = [];
  arrows = [];

  updatePlanetCount();
}

// ==================== PHYSIK ====================

function calculateGravity() {
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let p1 = planets[i];
      let p2 = planets[j];

      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      let distSq = dx * dx + dy * dy;
      let dist = Math.sqrt(distSq);

      if (dist < MIN_DISTANCE) dist = MIN_DISTANCE;

      // F = G * m1 * m2 / r²
      let force = (G * p1.mass * p2.mass) / (dist * dist);

      // Normalisierte Richtung
      let nx = dx / dist;
      let ny = dy / dist;

      // Beschleunigung = F / m
      let a1 = force / p1.mass;
      let a2 = force / p2.mass;

      p1.vx += a1 * nx * 0.016;
      p1.vy += a1 * ny * 0.016;
      p2.vx -= a2 * nx * 0.016;
      p2.vy -= a2 * ny * 0.016;
    }
  }
}

function checkCollisionsAndMerge() {
  if (!enableMerge) return;

  // Von hinten nach vorne durchgehen, um Indexprobleme beim Löschen zu vermeiden
  for (let i = planets.length - 1; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      if (i >= planets.length || j >= planets.length) continue;

      let p1 = planets[i];
      let p2 = planets[j];

      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      let minDist = p1.radius + p2.radius;

      if (dist < minDist * 0.8) {
        // Kollision! Planeten verschmelzen
        // Der größere Planet (nach Masse) absorbiert den kleineren
        let biggerIndex, smallerIndex;
        if (p1.mass >= p2.mass) {
          biggerIndex = i;
          smallerIndex = j;
        } else {
          biggerIndex = j;
          smallerIndex = i;
        }

        let bigger = planets[biggerIndex];
        let smaller = planets[smallerIndex];

        // Impulserhaltung: m1*v1 + m2*v2 = (m1+m2)*v_neu
        let totalMass = bigger.mass + smaller.mass;
        let newVx =
          (bigger.mass * bigger.vx + smaller.mass * smaller.vx) / totalMass;
        let newVy =
          (bigger.mass * bigger.vy + smaller.mass * smaller.vy) / totalMass;

        // Größeren Planeten aktualisieren
        bigger.vx = newVx;
        bigger.vy = newVy;
        bigger.mass = totalMass;

        // Neuer Radius basierend auf Volumenerhaltung (Fläche bei 2D)
        // A_neu = A1 + A2 -> r_neu = sqrt(r1² + r2²)
        let newRadius = Math.sqrt(
          bigger.radius * bigger.radius + smaller.radius * smaller.radius,
        );
        bigger.radius = newRadius;
        bigger.setRadius(newRadius);

        // Gradient neu setzen
        bigger.setGradient("radial", [
          { offset: 0.0, color: "#ffffff" },
          { offset: 0.3, color: colorToHex(bigger.color) },
          { offset: 1.0, color: colorToHex(darkenColor(bigger.color)) },
        ]);

        // Kleineren Planeten entfernen
        removePlanet(smallerIndex);

        // Index anpassen falls nötig
        if (smallerIndex < biggerIndex) {
          // biggerIndex wurde durch das Entfernen verschoben
          // aber wir haben bereits die Referenz 'bigger'
        }

        // Schleife abbrechen und neu starten
        return checkCollisionsAndMerge();
      }
    }
  }
}

function removeOutOfBoundsPlanets() {
  // Planeten entfernen, die zu weit außerhalb sind
  let margin = 200; // Toleranz außerhalb des sichtbaren Bereichs

  for (let i = planets.length - 1; i >= 0; i--) {
    let p = planets[i];

    if (
      p.x < -margin ||
      p.x > CANVAS_WIDTH + margin ||
      p.y < -margin ||
      p.y > CANVAS_HEIGHT + margin
    ) {
      removePlanet(i);
    }
  }
}

function updatePositions() {
  for (let i = 0; i < planets.length; i++) {
    let p = planets[i];

    p.x += p.vx;
    p.y += p.vy;
  }
}

function updateTrails() {
  for (let i = 0; i < planets.length; i++) {
    let p = planets[i];
    let trail = trails[i];

    if (showTrails && isSimulating) {
      trail.addPointEnd(p.x, p.y);
    }
  }
}

function updateArrows() {
  for (let i = 0; i < planets.length; i++) {
    let p = planets[i];
    let arrow = arrows[i];

    let speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);

    if (showArrows && speed > 0.1) {
      arrow.visible = true;
      let scale = 20;
      arrow.setStart(p.x, p.y);
      arrow.setEnd(p.x + p.vx * scale, p.y + p.vy * scale);
    } else {
      arrow.visible = false;
    }
  }
}

// ==================== EVENT HANDLER ====================

startButton.onClick(function () {
  isSimulating = !isSimulating;
  if (isSimulating) {
    startButton.setText("Simulation pausieren");
  } else {
    startButton.setText("Simulation starten");
  }
});

resetButton.onClick(function () {
  resetSimulation();
});

// ==================== MAUS-INTERAKTION ====================

// Zielpfeil für Impulsrichtung
let aimArrow = new Arrow(0, 0, 0, 0, 0xff0000, 4, 20, 12);
aimArrow.visible = false;

// Variable um zu tracken ob ein neuer Planet erstellt werden soll
let clickStartX = 0;
let clickStartY = 0;
let clickedOnPlanet = false;

board.onMouseDown(function (e) {
  // Nur im Simulationsbereich (rechts vom UI Panel)
  if (e.x < 300) return;

  clickStartX = e.x;
  clickStartY = e.y;

  let index = findPlanetAt(e.x, e.y);
  if (index >= 0) {
    // Auf einen bestehenden Planeten geklickt -> Impuls-Modus
    clickedOnPlanet = true;
    isDragging = true;
    draggedPlanet = planets[index];
    dragStartX = e.x;
    dragStartY = e.y;

    aimArrow.visible = true;
    aimArrow.setStart(draggedPlanet.x, draggedPlanet.y);
    aimArrow.setEnd(e.x, e.y);
  } else {
    // Leerer Bereich geklickt -> wird ein neuer Planet
    clickedOnPlanet = false;
  }
});

board.onMouseMove(function (e) {
  if (!isDragging || !draggedPlanet) return;

  aimArrow.setStart(draggedPlanet.x, draggedPlanet.y);
  aimArrow.setEnd(e.x, e.y);
});

board.onMouseUp(function (e) {
  // Nur im Simulationsbereich
  if (e.x < 300 && clickStartX < 300) return;

  if (isDragging && draggedPlanet) {
    // Impuls berechnen (proportional zur Zugstrecke)
    let dx = e.x - draggedPlanet.x;
    let dy = e.y - draggedPlanet.y;

    draggedPlanet.vx = dx * 0.05;
    draggedPlanet.vy = dy * 0.05;

    isDragging = false;
    draggedPlanet = null;
    aimArrow.visible = false;
  } else if (!clickedOnPlanet && e.x >= 300) {
    // Kurzer Klick auf leeren Bereich -> neuen Planeten erstellen
    let distMoved = Math.sqrt(
      Math.pow(e.x - clickStartX, 2) + Math.pow(e.y - clickStartY, 2),
    );

    // Nur wenn nicht gezogen wurde (Toleranz von 5px)
    if (distMoved < 5) {
      let mass = massStepper.value;
      let radius = radiusStepper.value;
      let colorIndex = colorDropdown.selectedIndex;
      let color = colorValues[colorIndex];

      createPlanet(e.x, e.y, mass, radius, color);
    }
  }

  clickedOnPlanet = false;
});

// ==================== HAUPT-TIMER ====================

let timer = new Timer();
timer.start();

timer.onUpdate(function () {
  if (isSimulating) {
    calculateGravity();
    checkCollisionsAndMerge();
    updatePositions();
    removeOutOfBoundsPlanets();
    updateTrails();

    // Automatisch zurücksetzen wenn keine Planeten mehr vorhanden sind
    if (planets.length === 0) {
      resetSimulation();
    }
  }

  updateArrows();
});

// ==================== BEISPIEL-PLANETEN ERSTELLEN ====================

// Sonne (großer, schwerer Planet in der Mitte)
let sun = createPlanet(750, 360, 300, 50, 0xffcc00);

// Kleiner Orbit-Planet
let planet1 = createPlanet(900, 360, 20, 15, 0x3399ff);
planet1.vy = 4; // Anfangsgeschwindigkeit für Umlaufbahn
