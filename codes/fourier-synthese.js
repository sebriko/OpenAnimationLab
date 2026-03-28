// Created with Open Animation Lab
// ═══════════════════════════════════════════════════════════════════
// FOURIER-SYNTHESE: Wie Sinuswellen komplexe Formen erschaffen
// ═══════════════════════════════════════════════════════════════════
// Open Source – CC BY 4.0

let board = new Board(1280, 720);

// ─────────────────────────────────────────────────────────────────
// FARBPALETTE
// ─────────────────────────────────────────────────────────────────
const green = 0x2d6b3f;
const black = 0x333333;

// ─────────────────────────────────────────────────────────────────
// GLOBALE PARAMETER
// ─────────────────────────────────────────────────────────────────
let numHarmonics = 5;
let waveSpeed = 0.02;
let phase = 0;
let waveType = "square";
let isPlaying = true;

// Wellenform-Punkte speichern
let resultWavePoints = [
  [0, 0],
  [1, 0],
];

// Fourier-Koeffizienten je nach Wellenform
function getCoefficient(n, type) {
  if (type === "square") {
    return n % 2 === 1 ? 4 / (Math.PI * n) : 0;
  } else if (type === "sawtooth") {
    return (2 * Math.pow(-1, n + 1)) / (Math.PI * n);
  } else if (type === "triangle") {
    return n % 2 === 1
      ? (8 * Math.pow(-1, (n - 1) / 2)) / (Math.PI * Math.PI * n * n)
      : 0;
  }
  return 0;
}

// ─────────────────────────────────────────────────────────────────
// STEUERUNG – Play/Pause und Reset rechts unten
// ─────────────────────────────────────────────────────────────────

let playButton = new Button("Pause", 100, 35, "Arial", 22);
playButton.x = 1040;
playButton.y = 655;
board.addChild(playButton);

playButton.onClick(function () {
  isPlaying = !isPlaying;
  if (isPlaying) {
    playButton.setText("Pause");
  } else {
    playButton.setText("Play");
  }
});

let resetButton = new Button("Reset", 100, 35, "Arial", 22);
resetButton.x = 1150;
resetButton.y = 655;
board.addChild(resetButton);

resetButton.onClick(function () {
  phase = 0;
  resultWavePoints = [
    [0, 0],
    [1, 0],
  ];
});

// ─────────────────────────────────────────────────────────────────
// EPIZYKEL-BEREICH (links)
// ─────────────────────────────────────────────────────────────────
let epicycleGroup = new Group();
epicycleGroup.x = 250;
epicycleGroup.y = 270;
board.addChild(epicycleGroup);

// Kreise und Radius-Linien für Epizykel
let circles = [];
let radiusMarkers = [];

for (let i = 0; i < 15; i++) {
  let circle = new Circle(10);
  circle.setBorder(green, 1);
  circle.setAlpha(0);
  circles.push(circle);
  epicycleGroup.addChild(circle);

  let marker = new Line(0, 0, 10, 0, green, 1);
  marker.setAlpha(0);
  radiusMarkers.push(marker);
  epicycleGroup.addChild(marker);
}

// Verbindungslinie zur Wellenform
let connectionLine = new Line(0, 0, 270, 0, green, 1);
connectionLine.setStrokeDash([5, 5]);
connectionLine.setAlpha(0.6);
epicycleGroup.addChild(connectionLine);

// Punkt am Ende der Epizykel
let epicyclePoint = new Circle(5, green);
epicycleGroup.addChild(epicyclePoint);

// ─────────────────────────────────────────────────────────────────
// WELLENFORM-BEREICH (rechts)
// ─────────────────────────────────────────────────────────────────
let waveGroup = new Group();
waveGroup.x = 520;
waveGroup.y = 270;
board.addChild(waveGroup);

// Koordinatensystem für die Wellenform
let coordSystem = new CoordinateSystem(0, 700, 150, 150, black, 10, 6, 1);
waveGroup.addChild(coordSystem);

// Resultierende Wellenform
let resultWave = new LinePath(
  [
    [0, 0],
    [10, 0],
  ],
  green,
  1,
);
waveGroup.addChild(resultWave);

// ─────────────────────────────────────────────────────────────────
// STEUERUNG – Slider
// ─────────────────────────────────────────────────────────────────

// Harmonische Slider
let labelHarmonics = new Text(
  "Anzahl Harmonische:",
  "Arial",
  22,
  black,
  "right",
);
labelHarmonics.x = 20;
labelHarmonics.y = 570;
board.addChild(labelHarmonics);

let sliderHarmonics = new ButtonSlider(1, 15, 5, 1, 50, 200);
sliderHarmonics.x = 250;
sliderHarmonics.y = 560;
board.addChild(sliderHarmonics);

let harmonicValue = new Text("N = 5", "Arial", 22, green, "left");
harmonicValue.x = 480;
harmonicValue.y = 570;
board.addChild(harmonicValue);

sliderHarmonics.onChange(function (e) {
  numHarmonics = Math.round(e.value);
  harmonicValue.setText("N = " + numHarmonics);
});

// Geschwindigkeits-Slider
let labelSpeed = new Text("Geschwindigkeit:", "Arial", 22, black, "right");
labelSpeed.x = 20;
labelSpeed.y = 640;
board.addChild(labelSpeed);

let sliderSpeed = new ButtonSlider(1, 100, 20, 1, 50, 200);
sliderSpeed.x = 250;
sliderSpeed.y = 630;
board.addChild(sliderSpeed);

sliderSpeed.onChange(function (e) {
  waveSpeed = e.value * 0.001;
});

// ─────────────────────────────────────────────────────────────────
// Wellenform-Auswahl – RadioButtons
// ─────────────────────────────────────────────────────────────────
let labelWaveType = new Text("Wellenform:", "Arial", 22, black, "left");
labelWaveType.x = 820;
labelWaveType.y = 545;
board.addChild(labelWaveType);

let radioSquare = new RadioButton(
  "waveType",
  true,
  18,
  "Rechteck",
  "Arial",
  22,
  black,
);
radioSquare.x = 820;
radioSquare.y = 580;
board.addChild(radioSquare);

let radioSawtooth = new RadioButton(
  "waveType",
  false,
  18,
  "Saegezahn",
  "Arial",
  22,
  black,
);
radioSawtooth.x = 820;
radioSawtooth.y = 615;
board.addChild(radioSawtooth);

let radioTriangle = new RadioButton(
  "waveType",
  false,
  18,
  "Dreieck",
  "Arial",
  22,
  black,
);
radioTriangle.x = 820;
radioTriangle.y = 650;
board.addChild(radioTriangle);

radioSquare.onClick(function () {
  waveType = "square";
  resultWavePoints = [
    [0, 0],
    [1, 0],
  ];
});

radioSawtooth.onClick(function () {
  waveType = "sawtooth";
  resultWavePoints = [
    [0, 0],
    [1, 0],
  ];
});

radioTriangle.onClick(function () {
  waveType = "triangle";
  resultWavePoints = [
    [0, 0],
    [1, 0],
  ];
});

// ─────────────────────────────────────────────────────────────────
// HAUPTANIMATION
// ─────────────────────────────────────────────────────────────────
let timer = new Timer();

timer.onUpdate(function () {
  if (!isPlaying) return;

  phase += waveSpeed;

  let amplitude = 90;
  let x = 0;
  let y = 0;

  // Epizykel berechnen
  for (let i = 0; i < 15; i++) {
    let n = i + 1;
    let coeff = getCoefficient(n, waveType);
    let radius = Math.abs(coeff) * amplitude;

    if (i < numHarmonics && radius > 0.5) {
      circles[i].x = x;
      circles[i].y = y;
      circles[i].setRadius(radius);
      circles[i].setAlpha(0.4);

      let angle = n * phase;
      if (coeff < 0) {
        angle = angle + Math.PI;
      }

      let nextX = x + radius * Math.cos(angle);
      let nextY = y + radius * Math.sin(angle);

      radiusMarkers[i].setStart(x, y);
      radiusMarkers[i].setEnd(nextX, nextY);
      radiusMarkers[i].setAlpha(0.8);

      x = nextX;
      y = nextY;
    } else {
      circles[i].setAlpha(0);
      radiusMarkers[i].setAlpha(0);
    }
  }

  // Endpunkt
  epicyclePoint.x = x;
  epicyclePoint.y = y;

  // Verbindungslinie
  connectionLine.setStart(x, y);
  connectionLine.setEnd(270, y);

  // Wellenform aktualisieren
  resultWavePoints.unshift([0, y]);

  let newPoints = [];
  for (let i = 0; i < resultWavePoints.length; i++) {
    let px = i * 2;
    if (px <= 680) {
      newPoints.push([px, resultWavePoints[i][1]]);
    }
  }
  resultWavePoints = newPoints;

  if (resultWavePoints.length >= 2) {
    resultWave.setPoints(resultWavePoints);
  }
});

timer.start();
