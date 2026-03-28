// Created with Open Animation Lab
// Beruhigender Bildschirmschoner mit wellenförmigen Bewegungen
// Open Source – CC BY 4.0

let board = new Board(1280, 720);

// Hintergrund-Rechteck
let bgRect = new Rectangle(1280, 720, 0x001122);
bgRect.x = 0;
bgRect.y = 0;

// Array für die schwebenden Kreise
let circles = [];
let numCircles = 8;

// Hauptkreise erstellen - verschiedene Größen und Farben
for (let i = 0; i < numCircles; i++) {
  let size = 80 + Math.sin(i * 0.5) * 40;
  // Verschiedene Blau- und Türkistöne
  let colors = [
    0x2e86ab, 0x539fc5, 0x6ab7d8, 0x83cfeb, 0x4a90a4, 0x67aab9, 0x3d7ea6,
    0x5b9ebd,
  ];
  let color = colors[i % colors.length];

  let circle = new Circle(size, color);
  circle.alpha = 0.3;
  circle.setBorder(color, 2);

  // Startpositionen im Kreis anordnen
  let angle = (i / numCircles) * Math.PI * 2;
  circle.x = 640 + Math.cos(angle) * 200;
  circle.y = 360 + Math.sin(angle) * 150;

  // Speichere Index für Animation
  circle.index = i;
  circles.push(circle);
}

// Zusätzliche kleine Partikel für Tiefeneffekt
let particles = [];
let numParticles = 20;

for (let i = 0; i < numParticles; i++) {
  let particle = new Circle(5 + Math.random() * 10, 0xffffff);
  particle.alpha = 0.1 + Math.random() * 0.2;
  particle.x = Math.random() * 1280;
  particle.y = Math.random() * 720;
  // Speichere Startposition und Index
  particle.startY = particle.y;
  particle.index = i;
  particles.push(particle);
}

// Zentrale Atemkreise für Fokussierung
let breathCircle1 = new Circle(150, 0x4488ff);
breathCircle1.x = 640;
breathCircle1.y = 360;
breathCircle1.alpha = 0.1;

let breathCircle2 = new Circle(120, 0x66aaff);
breathCircle2.x = 640;
breathCircle2.y = 360;
breathCircle2.alpha = 0.15;

let breathCircle3 = new Circle(90, 0x88ccff);
breathCircle3.x = 640;
breathCircle3.y = 360;
breathCircle3.alpha = 0.2;

// Verbindungslinien zwischen Kreisen
let lines = [];
for (let i = 0; i < numCircles; i++) {
  let line = new Line(0, 0, 100, 100, 0xffffff, 1);
  line.alpha = 0.1;
  lines.push(line);
}

// Zusätzliche dekorative Elemente
let decorCircle1 = new Circle(200, 0x2e86ab);
decorCircle1.x = 200;
decorCircle1.y = 150;
decorCircle1.alpha = 0.05;

let decorCircle2 = new Circle(180, 0x539fc5);
decorCircle2.x = 1080;
decorCircle2.y = 570;
decorCircle2.alpha = 0.05;

// Zeitvariablen
let time = 0;
let breathPhase = 0;
let breathDuration = 4; // Sekunden pro Atemphase
let deltaTime = 0.016; // ~60 FPS

// Timer erstellen und starten
let mainTimer = new Timer();
mainTimer.start();

// Haupt-Animationsschleife
mainTimer.onUpdate(function () {
  time += deltaTime;

  // Hauptkreise in wellenförmiger Bewegung
  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];
    let angle = (i / numCircles) * Math.PI * 2 + time * 0.3;
    let radiusX = 250 + Math.sin(time * 0.2 + i) * 50;
    let radiusY = 180 + Math.cos(time * 0.15 + i) * 30;

    circle.x = 640 + Math.cos(angle) * radiusX;
    circle.y = 360 + Math.sin(angle) * radiusY;

    // Pulsierender Alpha-Effekt
    circle.alpha = 0.2 + Math.sin(time + i) * 0.15;

    // Sanfte Größenänderung
    let baseSize = 80 + Math.sin(i * 0.5) * 40;
    circle.radius = baseSize + Math.sin(time * 0.5 + i) * 10;
  }

  // Verbindungslinien aktualisieren
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let circle1 = circles[i];
    let circle2 = circles[(i + 1) % numCircles];

    line.x1 = circle1.x;
    line.y1 = circle1.y;
    line.x2 = circle2.x;
    line.y2 = circle2.y;

    // Linien-Alpha basierend auf Entfernung
    let dx = circle2.x - circle1.x;
    let dy = circle2.y - circle1.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    line.alpha = Math.max(0, 0.2 - distance / 1000);
  }

  // Partikel langsam schweben lassen
  for (let i = 0; i < particles.length; i++) {
    let particle = particles[i];
    particle.y -= 0.5;
    particle.x += Math.sin(time + particle.index) * 0.3;

    // Partikel wieder nach unten setzen, wenn sie oben rausfliegen
    if (particle.y < -10) {
      particle.y = 730;
      particle.x = Math.random() * 1280;
    }

    // Sanftes Flimmern
    particle.alpha = 0.1 + Math.sin(time * 2 + particle.index) * 0.05;
  }

  // Atemkreise Animation
  let breathScale = Math.sin(time * 0.25) * 0.5 + 1;
  breathCircle1.radius = 150 * breathScale;
  breathCircle1.alpha = 0.1 + Math.sin(time * 0.25) * 0.05;

  breathCircle2.radius = 120 * (breathScale * 0.9 + 0.1);
  breathCircle2.alpha = 0.15 + Math.sin(time * 0.25 + 0.5) * 0.05;

  breathCircle3.radius = 90 * (breathScale * 0.8 + 0.2);
  breathCircle3.alpha = 0.2 + Math.sin(time * 0.25 + 1) * 0.05;

  // Dekorative Kreise sanft animieren
  decorCircle1.radius = 200 + Math.sin(time * 0.3) * 20;
  decorCircle1.alpha = 0.03 + Math.sin(time * 0.4) * 0.02;

  decorCircle2.radius = 180 + Math.cos(time * 0.35) * 15;
  decorCircle2.alpha = 0.03 + Math.cos(time * 0.45) * 0.02;

  // Hintergrundfarbe subtil ändern (verschiedene Blautöne)
  let bgPhase = Math.sin(time * 0.1);
  if (bgPhase > 0.5) {
    bgRect.fillColor = 0x001122;
  } else if (bgPhase > 0) {
    bgRect.fillColor = 0x001533;
  } else if (bgPhase > -0.5) {
    bgRect.fillColor = 0x001844;
  } else {
    bgRect.fillColor = 0x001a55;
  }
});

// Zweiter Timer für langsamere Effekte
let slowTimer = new Timer();
slowTimer.start();
let slowTime = 0;

slowTimer.onUpdate(function () {
  slowTime += 0.05;

  // Langsame Rotation der dekorativen Elemente
  decorCircle1.x = 200 + Math.cos(slowTime * 0.1) * 50;
  decorCircle1.y = 150 + Math.sin(slowTime * 0.1) * 30;

  decorCircle2.x = 1080 + Math.sin(slowTime * 0.12) * 40;
  decorCircle2.y = 570 + Math.cos(slowTime * 0.12) * 25;
});
