// Created with Open Animation Lab
// Open Source – CC BY 4.0

let board = new Board(1280, 720);
let points = [];
let amplitude = 150;
let wavelength = 0.01;
let centerY = 360;
let circleX = 200;
let startX = circleX + amplitude + 50; // Kurve beginnt rechts vom Kreis mit Abstand
let endX = 1230;
let phase = 0;

function createCurve() {
  points = [];
  for (let x = startX; x <= endX; x += 5) {
    let y = centerY + amplitude * Math.sin(wavelength * (x - startX));
    points.push([x, y]);
  }
}

createCurve();

let linePath = new LinePath(points, 0xff0000, 3);

// Kreis mit Radius = Amplitude
let myCircle = new Circle(amplitude, 0x33ccff, 0.3);
myCircle.x = circleX;
myCircle.y = centerY;
myCircle.setBorder(0x333333, 2);

// Rotierender Pfeil (vom Mittelpunkt zum Rand)
let myArrow = new Arrow(0, 0, amplitude, 0, 0x333333, 3, 20, 10);
myArrow.x = circleX;
myArrow.y = centerY;

// Hilfslinie vom Pfeilende zur Kurve
let helpLine = new Line(0, 0, startX - circleX, 0, 0x00ff00, 2);
helpLine.x = circleX;
helpLine.y = centerY;

// Funktion zum Aktualisieren der Hilfslinie
function updateHelpLine() {
  let arrowEndX = amplitude * Math.cos(phase);
  let arrowEndY = amplitude * Math.sin(phase);
  let curveX = startX + phase / wavelength;
  let curveY = centerY + amplitude * Math.sin(phase);

  helpLine.setStart(arrowEndX, arrowEndY);
  helpLine.setEnd(curveX - circleX, curveY - centerY);
}

// Initial die Hilfslinie korrekt setzen
updateHelpLine();

// Wellenlängen-Slider
let wavelengthBeschriftung = new Text(
  "Wellenlänge",
  "Arial",
  20,
  0x444444,
  "left",
);
wavelengthBeschriftung.x = 100;
wavelengthBeschriftung.y = 20;

let wavelengthSlider = new ButtonSlider(0, 100, 50, 1, 50, 200);
wavelengthSlider.enableValueDisplay();
wavelengthSlider.onChange((e) => {
  wavelength = e.value * 0.0002;
  createCurve();
  linePath.setPoints(points);

  // Phase zurücksetzen, wenn Wellenlänge geändert wird
  phase = 0;
  updateHelpLine();
});
wavelengthSlider.x = 100;
wavelengthSlider.y = 50;

// Amplitude-Slider
let amplitudeBeschriftung = new Text(
  "Amplitude",
  "Arial",
  20,
  0x444444,
  "left",
);
amplitudeBeschriftung.x = 450;
amplitudeBeschriftung.y = 20;

let amplitudeSlider = new ButtonSlider(50, 250, 150, 1, 50, 200);
amplitudeSlider.enableValueDisplay();
amplitudeSlider.onChange((e) => {
  amplitude = e.value;

  // Kreis und Pfeil anpassen
  myCircle.setRadius(amplitude);
  let arrowEndX = amplitude * Math.cos(phase);
  let arrowEndY = amplitude * Math.sin(phase);
  myArrow.setEnd(arrowEndX, arrowEndY);

  // StartX neu berechnen, damit Kurve rechts vom Kreis bleibt
  startX = circleX + amplitude + 50;

  // Kurve neu erstellen
  createCurve();
  linePath.setPoints(points);

  // Hilfslinie aktualisieren
  updateHelpLine();
});
amplitudeSlider.x = 450;
amplitudeSlider.y = 50;

// Button zum Starten/Stoppen der Rotation
let isRotating = false;
let myButton = new Button("Start", 100, 40, "Arial", 20);
myButton.x = 1150;
myButton.y = 650;
myButton.onClick(toggleRotation);

function toggleRotation() {
  isRotating = !isRotating;
  if (isRotating) {
    myButton.setText("Stopp");
    myTimer.start();
  } else {
    myButton.setText("Start");
    myTimer.stop();
  }
}

// Timer für Animation
let myTimer = new Timer();
myTimer.onUpdate(handleProgress);

function handleProgress() {
  phase += 0.02;

  // Maximale Phase berechnen (entspricht dem Ende der sichtbaren Kurve)
  let maxPhase = wavelength * (endX - startX);

  // Phase zurücksetzen, wenn Ende der Kurve erreicht ist
  if (phase > maxPhase) {
    phase = 0;
  }

  // Pfeil rotieren
  let arrowEndX = amplitude * Math.cos(phase);
  let arrowEndY = amplitude * Math.sin(phase);
  myArrow.setEnd(arrowEndX, arrowEndY);

  // Hilfslinie aktualisieren
  updateHelpLine();
}
