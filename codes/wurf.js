// Created with Open Animation Lab
// Open Source – CC BY 4.0
// Freier Fall & Schräger Wurf – Bahnkurve mit Geschwindigkeitsvektor-Zerlegung

// ==================== ABSCHNITT 1: VARIABLEN ====================
let board = new Board(1280, 720, 0xe8e8e8);

// Physikalische Konstanten
let g = 9.81; // m/s² Erdbeschleunigung

// Startparameter
let abwurfWinkelGrad = 45;
let abwurfGeschwindigkeit = 20; // m/s
let abwurfHoehe = 0;

// Skalierung: Pixel pro Meter
let skalierung = 8; // px/m

// Koordinatenursprung (Abwurfpunkt auf der Bühne)
let ursprungX = 190;
let ursprungY = 580;

// Simulationszeit
let tMax = 0;
let zeitSchritt = 0.02;
let aktuelleZeit = 0;
let istAbspielend = false;
let animationsGeschwindigkeit = 1.0;

// Berechnete Werte
let v0x = 0;
let v0y = 0;
let wurfweite = 0;
let maxHoehe = 0;
let flugzeit = 0;

// Bahnkurve-Punkte
let bahnPunkte = [];

// Farben
let farbeHintergrund = 0xaad4ff;
let farbeBoden = 0x88bb66;
let farbeBodenDunkel = 0x6b9950;
let farbeBahnkurve = 0x888888;
let farbeGesamt = 0x333333;
let farbeHorizontal = 0x2233ff;
let farbeVertikal = 0xff3300;
let farbeObjekt = 0xff6600;

// ==================== ABSCHNITT 2: OBJEKTE ====================

// --- Hintergrund ---
let himmel = new Rectangle(1280, 720, farbeHintergrund);
himmel.x = 0;
himmel.y = 0;

// Boden
let boden = new Rectangle(1280, 150, farbeBoden);
boden.x = 0;
boden.y = ursprungY;

let bodenLinie = new Line(0, ursprungY, 1280, ursprungY, farbeBodenDunkel, 2);

// --- Koordinatensystem ---
let koordinatenSystem = new CoordinateSystem(
  0,
  1000,
  540,
  0,
  0x666666,
  20,
  10,
  1,
);
koordinatenSystem.x = ursprungX;
koordinatenSystem.y = ursprungY;

// Achsenbeschriftungen
let xAchseBeschriftung = new Text("x [m]", "Arial", 20, 0x444444, "left");
xAchseBeschriftung.x = ursprungX + 1010;
xAchseBeschriftung.y = ursprungY + 5;

let yAchseBeschriftung = new Text("y [m]", "Arial", 20, 0x444444, "left");
yAchseBeschriftung.x = ursprungX - 75;
yAchseBeschriftung.y = ursprungY - 550;

// Teilstriche X-Achse
let xTeilstriche = new Ruler(
  "right",
  [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
  skalierung * 10,
  0,
  0x666666,
  1,
  8,
  20,
  0x444444,
  true,
  0,
  "",
);
xTeilstriche.x = ursprungX;
xTeilstriche.y = ursprungY;

// Teilstriche Y-Achse
let yTeilstriche = new Ruler(
  "top",
  [10, 20, 30, 40, 50, 60, 70],
  skalierung * 10,
  0,
  0x666666,
  1,
  8,
  20,
  0x444444,
  true,
  0,
  "",
);
yTeilstriche.x = ursprungX;
yTeilstriche.y = ursprungY;

// --- Bahnkurve ---
let bahnkurve = new LinePath(
  [
    [0, 0],
    [1, 0],
  ],
  farbeBahnkurve,
  2,
);
bahnkurve.x = ursprungX;
bahnkurve.y = ursprungY;

// Gestrichelte Hilfslinien
let hoehenLinie = new Line(0, 0, 100, 0, 0x999999, 1);
hoehenLinie.setStrokeDash([5, 5]);
hoehenLinie.visible = false;

let weitenLinie = new Line(0, 0, 0, 100, 0x999999, 1);
weitenLinie.setStrokeDash([5, 5]);
weitenLinie.visible = false;

// --- Wurfkörper (Ball) ---
let ball = new Circle(12, farbeObjekt);
ball.x = ursprungX;
ball.y = ursprungY;
ball.setBorder(0x333333, 1);

// --- Geschwindigkeitsvektoren ---
let vektorSkalierung = 8;

// Gesamtgeschwindigkeit v
let pfeilGesamt = new Arrow(0, 0, 100, -100, farbeGesamt, 2, 14, 8);
pfeilGesamt.x = ursprungX;
pfeilGesamt.y = ursprungY;

// Horizontale Komponente vx
let pfeilHorizontal = new Arrow(0, 0, 100, 0, farbeHorizontal, 2, 12, 7);
pfeilHorizontal.x = ursprungX;
pfeilHorizontal.y = ursprungY;

// Vertikale Komponente vy
let pfeilVertikal = new Arrow(0, 0, 0, -100, farbeVertikal, 2, 12, 7);
pfeilVertikal.x = ursprungX;
pfeilVertikal.y = ursprungY;

// Vektorrechteck (Kräfteparallelogramm)
let vektorRechteck = new Rectangle(100, 100, farbeGesamt);
vektorRechteck.x = ursprungX;
vektorRechteck.y = ursprungY;
vektorRechteck.setAlpha(0.1);

// --- Vektor-Labels ---
let labelV = new LineLabel(0, 0, 100, -100, "v", 20);
labelV.setFontSize(20);
labelV.setTextColor(farbeGesamt);

let labelVx = new LineLabel(0, 0, 100, 0, "v<sub>x</sub>", 15);
labelVx.setFontSize(20);
labelVx.setTextColor(farbeHorizontal);

let labelVy = new LineLabel(0, 0, 0, -100, "v<sub>y</sub>", 15);
labelVy.setFontSize(20);
labelVy.setTextColor(farbeVertikal);
labelVy.setFlipSide(true);

// Winkel-Markierung
let winkelBogen = new AngleLabel(
  ursprungX,
  ursprungY,
  ursprungX + 100,
  ursprungY,
  ursprungX + 70,
  ursprungY - 70,
  50,
  "α",
  "Arial",
  20,
  0x444444,
  1,
  0x444444,
);

// --- UI-Elemente ---

// Modus-Auswahl (oben positioniert)
let modusFreierFall = new RadioButton(
  "modus",
  false,
  20,
  "Freier Fall (α = 0°, nur v<sub>y</sub>)",
  "Arial",
  20,
  0x444444,
);
modusFreierFall.x = 600;
modusFreierFall.y = 20;

let modusHorizontalerWurf = new RadioButton(
  "modus",
  false,
  20,
  "Horizontaler Wurf (α = 0°)",
  "Arial",
  20,
  0x444444,
);
modusHorizontalerWurf.x = 600;
modusHorizontalerWurf.y = 60;

let modusSchraegerWurf = new RadioButton(
  "modus",
  true,
  20,
  "Schräger Wurf (frei wählbar)",
  "Arial",
  20,
  0x444444,
);
modusSchraegerWurf.x = 600;
modusSchraegerWurf.y = 100;

let modusSenkrechterWurf = new RadioButton(
  "modus",
  false,
  20,
  "Senkrechter Wurf (α = 90°)",
  "Arial",
  20,
  0x444444,
);
modusSenkrechterWurf.x = 600;
modusSenkrechterWurf.y = 140;

// Abwurfwinkel-Slider
let winkelLabel = new Text(
  "Abwurfwinkel α in Grad",
  "Arial",
  20,
  0x444444,
  "left",
);
winkelLabel.x = 950;
winkelLabel.y = 20;

let winkelSlider = new ButtonSlider(0, 90, abwurfWinkelGrad, 1, 50, 200, "°");
winkelSlider.enableValueDisplay();
winkelSlider.x = 950;
winkelSlider.y = 50;

// Abwurfgeschwindigkeit-Slider
let geschwindigkeitLabel = new Text(
  "Geschwindigkeit v<sub>0</sub> in m/s",
  "Arial",
  20,
  0x444444,
  "left",
);
geschwindigkeitLabel.x = 950;
geschwindigkeitLabel.y = 120;

let geschwindigkeitSlider = new ButtonSlider(
  1,
  40,
  abwurfGeschwindigkeit,
  0.5,
  50,
  200,
  " m/s",
);
geschwindigkeitSlider.enableValueDisplay();
geschwindigkeitSlider.x = 950;
geschwindigkeitSlider.y = 150;

// Zeit-Slider
let zeitLabel = new Text("Zeit t in s", "Arial", 20, 0x444444, "left");
zeitLabel.x = 950;
zeitLabel.y = 220;

let zeitSlider = new ButtonSlider(0, 5, 0, 0.01, 50, 200, "triangle-A");
zeitSlider.enableValueDisplay();
zeitSlider.setDisplayCommaType("comma");
zeitSlider.x = 950;
zeitSlider.y = 250;

// Play/Pause-Button
let playButton = new Button("Play", 100, 35, "Arial", 20);
playButton.x = 620;
playButton.y = 200;

// Reset-Button
let resetButton = new Button("Reset", 100, 35, "Arial", 20);
resetButton.x = 740;
resetButton.y = 200;

// Timer für Animation
let animTimer = new Timer();

// ==================== ABSCHNITT 3: FUNKTIONEN ====================

function berechnePhysik() {
  let winkelRad = (abwurfWinkelGrad * Math.PI) / 180;
  v0x = abwurfGeschwindigkeit * Math.cos(winkelRad);
  v0y = abwurfGeschwindigkeit * Math.sin(winkelRad);

  // Flugzeit bis y = 0
  flugzeit = (v0y + Math.sqrt(v0y * v0y + 2 * g * abwurfHoehe)) / g;

  // Wurfweite
  wurfweite = v0x * flugzeit;

  // Maximale Höhe
  let tMaxHoehe = v0y / g;
  maxHoehe = abwurfHoehe + v0y * tMaxHoehe - 0.5 * g * tMaxHoehe * tMaxHoehe;
  if (maxHoehe < 0) maxHoehe = 0;

  tMax = flugzeit;
}

function berechneBahnkurve() {
  bahnPunkte = [];
  let schritte = 200;
  let dt = tMax / schritte;

  for (let i = 0; i <= schritte; i++) {
    let t = i * dt;
    let x = v0x * t;
    let y = abwurfHoehe + v0y * t - 0.5 * g * t * t;

    if (y < 0) {
      let tAufprall = tMax;
      let xEnd = v0x * tAufprall;
      bahnPunkte.push([xEnd * skalierung, 0]);
      break;
    }

    bahnPunkte.push([x * skalierung, -y * skalierung]);
  }

  if (bahnPunkte.length < 2) {
    bahnPunkte = [
      [0, 0],
      [1, 0],
    ];
  }

  bahnkurve.setPoints(bahnPunkte);
}

function aktualisierePosition(t) {
  if (t > tMax) t = tMax;
  if (t < 0) t = 0;

  aktuelleZeit = t;

  // Position berechnen
  let x = v0x * t;
  let y = abwurfHoehe + v0y * t - 0.5 * g * t * t;
  if (y < 0) y = 0;

  // Geschwindigkeitskomponenten
  let vx = v0x;
  let vy = v0y - g * t;

  // Ball-Position (Pixel)
  let ballPxX = ursprungX + x * skalierung;
  let ballPxY = ursprungY - y * skalierung;

  ball.x = ballPxX;
  ball.y = ballPxY;

  // Vektoren (Pixel)
  let vxPx = vx * vektorSkalierung;
  let vyPx = -vy * vektorSkalierung;

  // Prüfe ob Winkel 90° ist (rein vertikale Bewegung)
  let istSenkrecht = abwurfWinkelGrad === 90;

  // Gesamtvektor
  pfeilGesamt.x = ballPxX;
  pfeilGesamt.y = ballPxY;
  pfeilGesamt.setEnd(vxPx, vyPx);

  // Horizontale Komponente – bei 90° ausblenden
  pfeilHorizontal.visible = !istSenkrecht;
  pfeilHorizontal.x = ballPxX;
  pfeilHorizontal.y = ballPxY;
  pfeilHorizontal.setEnd(vxPx, 0);

  // Vertikale Komponente - bei 90° direkt am Ball starten
  if (istSenkrecht) {
    pfeilVertikal.x = ballPxX;
  } else {
    pfeilVertikal.x = ballPxX + vxPx;
  }
  pfeilVertikal.y = ballPxY;
  pfeilVertikal.setEnd(0, vyPx);

  // Vektorrechteck – bei 90° ausblenden
  vektorRechteck.visible = !istSenkrecht;
  let rectW = Math.abs(vxPx);
  let rectH = Math.abs(vyPx);
  vektorRechteck.setWidth(Math.max(rectW, 1));
  vektorRechteck.setHeight(Math.max(rectH, 1));

  if (vyPx < 0) {
    vektorRechteck.x = ballPxX;
    vektorRechteck.y = ballPxY + vyPx;
  } else {
    vektorRechteck.x = ballPxX;
    vektorRechteck.y = ballPxY;
  }

  // Labels aktualisieren
  labelV.setStart(ballPxX, ballPxY);
  labelV.setEnd(ballPxX + vxPx, ballPxY + vyPx);

  // vx-Label bei 90° ausblenden
  labelVx.visible = !istSenkrecht;
  labelVx.setStart(ballPxX, ballPxY);
  labelVx.setEnd(ballPxX + vxPx, ballPxY);

  // vy-Label bei 90° FlipSide anpassen (da direkt am Ball)
  if (istSenkrecht) {
    labelVy.setStart(ballPxX, ballPxY);
    labelVy.setEnd(ballPxX, ballPxY + vyPx);
  } else {
    labelVy.setStart(ballPxX + vxPx, ballPxY);
    labelVy.setEnd(ballPxX + vxPx, ballPxY + vyPx);
  }

  // Winkelbogen bei 90° ausblenden
  winkelBogen.visible = !istSenkrecht;
  let armLaenge = 50;
  winkelBogen.setCenter(ballPxX, ballPxY);
  winkelBogen.setArm1(ballPxX + armLaenge, ballPxY);
  winkelBogen.setArm2(ballPxX + vxPx, ballPxY + vyPx);

  // Hilfslinien
  if (maxHoehe > 0.1) {
    let maxHoehePx = maxHoehe * skalierung;
    let tMaxH = v0y / g;
    let xBeiMaxH = v0x * tMaxH;

    hoehenLinie.setStart(ursprungX, ursprungY - maxHoehePx);
    hoehenLinie.setEnd(
      ursprungX + xBeiMaxH * skalierung,
      ursprungY - maxHoehePx,
    );
    hoehenLinie.visible = true;
  } else {
    hoehenLinie.visible = false;
  }

  if (wurfweite > 0.1) {
    weitenLinie.setStart(ursprungX + wurfweite * skalierung, ursprungY);
    weitenLinie.setEnd(
      ursprungX + wurfweite * skalierung,
      ursprungY - maxHoehe * skalierung,
    );
    weitenLinie.visible = true;
  } else {
    weitenLinie.visible = false;
  }

  // Slider synchronisieren
  zeitSlider.setValue(Math.min(t, 5));
}

function aktualisiereAlles() {
  berechnePhysik();
  berechneBahnkurve();
  aktualisierePosition(aktuelleZeit);
}

// ==================== Event-Handler ====================

function onWinkelSliderChange(e) {
  abwurfWinkelGrad = e.value;
  aktuelleZeit = 0;
  aktualisiereAlles();
}

function onGeschwindigkeitSliderChange(e) {
  abwurfGeschwindigkeit = e.value;
  aktuelleZeit = 0;
  aktualisiereAlles();
}

function onZeitSliderChange(e) {
  aktuelleZeit = e.value;
  if (aktuelleZeit > tMax) aktuelleZeit = tMax;
  aktualisierePosition(aktuelleZeit);
}

function onPlayClick() {
  if (istAbspielend) {
    animTimer.pause();
    playButton.setText("Play");
    istAbspielend = false;
  } else {
    if (aktuelleZeit >= tMax - 0.01) {
      aktuelleZeit = 0;
    }
    animTimer.start();
    playButton.setText("Pause");
    istAbspielend = true;
  }
}

function onResetClick() {
  animTimer.pause();
  playButton.setText("Play");
  istAbspielend = false;
  aktuelleZeit = 0;
  aktualisiereAlles();
}

function onTimerUpdate(fortschritt) {
  if (!istAbspielend) return;

  aktuelleZeit += zeitSchritt * animationsGeschwindigkeit;

  if (aktuelleZeit >= tMax) {
    aktuelleZeit = tMax;
    animTimer.pause();
    playButton.setText("Play");
    istAbspielend = false;
  }

  aktualisierePosition(aktuelleZeit);
}

// Modus-Handler
function onModusFreierFall() {
  abwurfHoehe = 30;
  abwurfWinkelGrad = 90;
  abwurfGeschwindigkeit = 0.1;
  winkelSlider.setValue(90);
  geschwindigkeitSlider.setValue(0.1);
  aktuelleZeit = 0;
  aktualisiereAlles();
}

function onModusHorizontalerWurf() {
  abwurfHoehe = 30;
  abwurfWinkelGrad = 0;
  abwurfGeschwindigkeit = 20;
  winkelSlider.setValue(0);
  geschwindigkeitSlider.setValue(20);
  aktuelleZeit = 0;
  aktualisiereAlles();
}

function onModusSchraegerWurf() {
  abwurfHoehe = 0;
  abwurfWinkelGrad = 45;
  abwurfGeschwindigkeit = 20;
  winkelSlider.setValue(45);
  geschwindigkeitSlider.setValue(20);
  aktuelleZeit = 0;
  aktualisiereAlles();
}

function onModusSenkrechterWurf() {
  abwurfHoehe = 0;
  abwurfWinkelGrad = 90;
  abwurfGeschwindigkeit = 20;
  winkelSlider.setValue(90);
  geschwindigkeitSlider.setValue(20);
  aktuelleZeit = 0;
  aktualisiereAlles();
}

// ==================== ABSCHNITT 4: EVENTLISTENER ====================

winkelSlider.onChange(onWinkelSliderChange);
geschwindigkeitSlider.onChange(onGeschwindigkeitSliderChange);
zeitSlider.onChange(onZeitSliderChange);
playButton.onClick(onPlayClick);
resetButton.onClick(onResetClick);
animTimer.onUpdate(onTimerUpdate);

modusFreierFall.onClick(onModusFreierFall);
modusHorizontalerWurf.onClick(onModusHorizontalerWurf);
modusSchraegerWurf.onClick(onModusSchraegerWurf);
modusSenkrechterWurf.onClick(onModusSenkrechterWurf);

// Initialer Aufruf
aktualisiereAlles();
