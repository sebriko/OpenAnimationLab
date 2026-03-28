// Created with Open Animation Lab
// Open Source – CC BY 4.0

// Hauptzeichenfläche mit 1280x720 Pixel
let board = new Board(1280, 720);

// Koordinatensystem: Breite 1100px, Höhe 300px, horizontal zentriert bei x=90
let coordSys = new CoordinateSystem(0, 1100, 300, 300, 0x444444, 20, 8, 1);
coordSys.x = 90;
coordSys.y = 360;

// Wellenparameter
let A = 120; // Amplitude in Pixeln (maximale Auslenkung)
let k = 0.02; // Wellenzahl k = 2π/λ
let omega = 0.03; // Kreisfrequenz ω = 2π/T
let phase = 0; // Aktuelle Phase der Welle (wird für Animation kontinuierlich erhöht)
let deltaTime = 1;

// Berechnet die Wellenpunkte basierend auf y(x,t) = A * sin(kx - ωt)
function createWavePoints() {
  let points = [];
  for (let x = 0; x <= 1100; x += 4) {
    let y = -A * Math.sin(k * x - phase);
    points.push([x, y]);
  }
  return points;
}

// Wellenlinie erstellen und zentrieren
let wavePath = new LinePath(createWavePoints(), 0x0066cc, 3);
wavePath.x = 90;
wavePath.y = 360;
board.addChild(wavePath);

// Hauptformel der Wellengleichung
let formula = new MathForm("y(x,t) = A \sin(kx - \omega t)");
formula.x = 350;
formula.y = 50;
formula.setScale(1.8);

// Zusätzliche Formeln rechts
let formulaK = new MathForm("k = \frac{2\pi}{\lambda}");
formulaK.x = 750;
formulaK.y = 30;
formulaK.setScale(1.4);

let formulaOmega = new MathForm("\omega = \frac{2\pi}{T}");
formulaOmega.x = 750;
formulaOmega.y = 80;
formulaOmega.setScale(1.4);

// Slider für Amplitude A (Wertebereich 1-50)
let sliderA = new ButtonSlider(20, 150, 120, 1, 50, 200);
sliderA.enableValueDisplay();
sliderA.setValueDisplayFont("Arial", 20);
sliderA.x = 150;
sliderA.y = 620;

let labelA = new Text("Amplitude A", "Arial", 20, 0x333333, "left");
labelA.x = 150;
labelA.y = 590;

sliderA.onChange((e) => {
  A = e.value;
  wavePath.setPoints(createWavePoints());
});

// Slider für Wellenzahl k (Slider-Wert wird durch 1000 geteilt)
let sliderK = new ButtonSlider(5, 50, 20, 1, 50, 200);
sliderK.enableValueDisplay();
sliderK.setValueDisplayFont("Arial", 20);
sliderK.x = 450;
sliderK.y = 620;

let labelK = new Text("Wellenzahl k", "Arial", 20, 0x333333, "left");
labelK.x = 450;
labelK.y = 590;

sliderK.onChange((e) => {
  k = e.value * 0.001;
  wavePath.setPoints(createWavePoints());
});

// Slider für Kreisfrequenz ω (Slider-Wert wird durch 1000 geteilt)
let sliderOmega = new ButtonSlider(0, 100, 30, 1, 50, 200);
sliderOmega.enableValueDisplay();
sliderOmega.setValueDisplayFont("Arial", 20);
sliderOmega.x = 750;
sliderOmega.y = 620;

let labelOmega = new Text("Frequenz ω", "Arial", 20, 0x333333, "left");
labelOmega.x = 750;
labelOmega.y = 590;

sliderOmega.onChange((e) => {
  omega = e.value * 0.001;
});

// Animation mit Timer
let isPlaying = false;
let myTimer = new Timer();
myTimer.onUpdate(() => {
  if (isPlaying) {
    // Phase kontinuierlich erhöhen
    phase += omega * deltaTime;

    // Phase im Bereich [0, 2π] halten
    if (phase > 2 * Math.PI) {
      phase -= 2 * Math.PI;
    }

    wavePath.setPoints(createWavePoints());
  }
});

// Play/Pause Button
let playButton = new Button("Play", 100, 35, "Arial", 20);
playButton.x = 1120;
playButton.y = 610;

playButton.onClick(() => {
  isPlaying = !isPlaying;
  if (isPlaying) {
    myTimer.start();
    playButton.setText("Pause");
  } else {
    playButton.setText("Play");
  }
});
