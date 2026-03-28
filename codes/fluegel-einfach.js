// Created with Open Animation Lab
// Open Source – CC BY 4.0

// ==================== ABSCHNITT 1: VARIABLEN ====================
let board = new Board(1280, 720, 0xe8e8e8);

// Positions- und Dimensionsvariablen
let diagrammPositionX = 1000;
let diagrammPositionY = 550;

// Datenpunkte für Kurven
let auftriebsPunkte = [
  [-100, 100],
  [0, -120],
  [100, -200],
  [200, -160],
];

let widerstandsPunkte = [
  [-100, -50],
  [0, -20],
  [100, -30],
  [200, -60],
];

let polarPunkte = [];

// Arrays für Wolken
let alleWolken = [];

// Physikalische Parameter
let geschwindigkeitKmh = 150; // km/h aus der Tabelle
let masse = 750; // kg aus der Tabelle (Gewicht)
let luftdichte = 1.225; // kg/m³ (Standardatmosphäre auf Meereshöhe)
let fluegelflaeche = 15; // m² (geschätzt für kleines Flugzeug)

// Umrechnungen und abgeleitete Werte
let geschwindigkeitMs = geschwindigkeitKmh / 3.6; // m/s
let staudruck = 0.5 * luftdichte * geschwindigkeitMs * geschwindigkeitMs; // Pa

// Bewegungsparameter für die Animation
let geschwindigkeitX = 0; // Relative Geschwindigkeitsänderung (Start bei 0)
let geschwindigkeitY = 0;
let aktuelleAuftriebskraft = 0;
let aktuelleWiderstandskraft = 0;
let zeitSchritt = 0.016;

// Animation und FPS-Tracking
let letzteZeit = Date.now();
let bildZaehler = 0;
let letzteFPSAktualisierung = Date.now();
let aktuelleFPS = 60;
let debugZaehler = 0;

// ==================== ABSCHNITT 2: OBJEKTE ====================

// Hintergrund
let himmel = new Rectangle(1280, 720, 0xaad4ff);
himmel.x = 0;
himmel.y = 0;

let hintergrundGruppe = new Group();
hintergrundGruppe.addChild(himmel);

// Wolken
let wolke1 = new SimpleSVG(
  `<svg viewBox="0 0 210 297"><ellipse cx="36.03" cy="19.16" rx="28.07" ry="13.47" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="52.91" cy="17.83" rx="14.98" ry="6.45" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="70.93" cy="22.95" rx="7.97" ry="4.36" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="20.1" cy="9.86" rx="13.65" ry="6.45" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="58.41" cy="25.22" rx="11.38" ry="3.98" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="24.09" cy="27.31" rx="21.43" ry="6.45" fill="#fff" stroke="#fff" stroke-width=".26"/></svg>`,
);
wolke1.setScale(3.5, 3.5);
wolke1.x = -150;
wolke1.y = 100;

let wolke2 = new SimpleSVG(
  `<svg viewBox="0 0 43.13 15.82"><g transform="translate(-29.833 -211.523)" fill="#fff" stroke="#fff" stroke-width=".26"><ellipse cx="44.57" cy="218.48" rx="14.6" ry="6.83"/><ellipse cx="55.76" cy="223.98" rx="17.07" ry="3.22"/></g></svg>`,
);
wolke2.setScale(3.5, 3.5);
wolke2.x = 640;
wolke2.y = 300;

let wolke3 = new SimpleSVG(
  `<svg viewBox="0 0 67.4 22.64"><g transform="translate(-67.385 -165.626)" fill="#fff" stroke="#fff" stroke-width=".26"><ellipse cx="104.69" cy="174.1" rx="26.55" ry="8.35"/><ellipse cx="85.91" cy="174.67" rx="15.36" ry="5.88"/><ellipse cx="116.26" cy="179.98" rx="18.4" ry="3.22"/><ellipse cx="92.17" cy="180.36" rx="24.66" ry="7.78"/></g></svg>`,
);
wolke3.setScale(3.5, 3.5);
wolke3.x = 1200;
wolke3.y = 720;

hintergrundGruppe.addChild(wolke1);
hintergrundGruppe.addChild(wolke2);
hintergrundGruppe.addChild(wolke3);
hintergrundGruppe.setMask(0, 0, 1280, 720);

alleWolken = [wolke1, wolke2, wolke3];

// Flugzeug
let flugzeugGruppe = new Group();

let flugzeug = new SimpleSVG(
  `<svg xml:space="preserve" viewBox="0 0 102.05 19.93"><path d="M.583 10.804C.314 7.948-.675 4.83.76 2.438 1.616 1.013 3.035.039 5.112 0c4.75-.018 6.155 5.326 7.67 9.2l28.547-.896s2.363-5.512 16.766-5.928c14.404-.416 17.228 5.872 17.228 5.872s25.643.37 26.698 5.977c1.054 5.607-26.699 5.442-26.699 5.442s-22.854.605-34.256-.004c-12.522-.669-37.406-4-37.406-4-2.277-.86-2.78-1.701-3.077-4.859z" fill="#b3b3b3"/></svg>`,
);
flugzeug.x = 135;
flugzeug.y = 265;
flugzeug.setScale(8.25, 8.25);
flugzeug.setAlpha(0.5);
flugzeug.setRotationPoint(320, 100);

let tragflaeche = new SimpleSVG(
  `<svg xml:space="preserve" viewBox="0 0 99.46 12.48"><path d="M0 12.31S43.099-1.579 70.855.148C91.309 1.421 99.44 4.895 99.463 8.264c.036 5.133-25.212 4.142-25.212 4.142z" fill="#666"/></svg>`,
);
tragflaeche.x = 390;
tragflaeche.y = 340;
tragflaeche.setScale(3.75, 3.75);
tragflaeche.setAlpha(0.5);

let horizontale = new Line(285, 370, 885, 370, 0x555555, 3);
horizontale.x = 0;
horizontale.y = 0;

let horizontale2 = new Line(285, 370, 885, 370, 0x555555, 3);
horizontale2.x = 0;
horizontale2.y = 0;

flugzeugGruppe.addChild(flugzeug);
flugzeugGruppe.addChild(tragflaeche);
flugzeugGruppe.addChild(horizontale2);
flugzeugGruppe.setRotationPoint(630, 370);
flugzeugGruppe.x = 0;
flugzeugGruppe.y = 0;

// Diagramm-Kurven (unsichtbar, nur für Berechnungen)
let auftriebsKurve = new SplinePath(auftriebsPunkte, 0x2233ff, 2);
auftriebsKurve.x = diagrammPositionX;
auftriebsKurve.y = diagrammPositionY;
auftriebsKurve.visible = false;

let widerstandsKurve = new SplinePath(widerstandsPunkte, 0xff3300, 2);
widerstandsKurve.x = diagrammPositionX;
widerstandsKurve.y = diagrammPositionY;
widerstandsKurve.visible = false;

// UI-Elemente
let winkelRegler = new ButtonSlider(-10, 20, 0, 0.1, 75, 300);
winkelRegler.enableValueDisplay();
winkelRegler.x = 830;
winkelRegler.y = 80;
winkelRegler.setDisplayCommaType("comma");

winkelRegler.setValueDisplayFont("Arial", 30);

let winkelBeschriftung = new Text(
  "Anstellwinkel α",
  "Arial",
  35,
  0x444444,
  "left",
);
winkelBeschriftung.x = 830;
winkelBeschriftung.y = 20;

// Kraft-Pfeile
let auftriebsPfeil = new Arrow(0, 0, 0, -200, 0x2233ff, 3, 26, 12);
auftriebsPfeil.x = 630;
auftriebsPfeil.y = 370;

let widerstandsPfeil = new Arrow(0, 0, -50, 0, 0xff3300, 3, 26, 12);
widerstandsPfeil.x = 630;
widerstandsPfeil.y = 370;

let resultierendePfeil = new Arrow(0, 0, -50, -200, 0x006600, 3, 30, 15);
resultierendePfeil.x = 630;
resultierendePfeil.y = 370;

let vektorRechteck = new Rectangle(50, 200, 0x006600);
vektorRechteck.x = 630;
vektorRechteck.y = 370;
vektorRechteck.setAlpha(0.2);

const angle = new AngleLabel(
  630,
  370,
  630 - 30,
  370,
  630 + 50,
  370 - 50,
  200,
  "α",
  "Arial",
  35,
  0x444444,
  1,
  0x444444,
);

// Kraft-Labels
const auftriebsLabel = new LineLabel(630, 370, 630, 170, "F<sub>a</sub>", -25);
auftriebsLabel.setFontSize(35);
auftriebsLabel.setTextColor(0x444444);
auftriebsLabel.setFlipSide(true);

const widerstandsLabel = new LineLabel(
  630,
  370,
  580,
  370,
  "F<sub>w</sub>",
  -25,
);
widerstandsLabel.setFontSize(35);
widerstandsLabel.setTextColor(0x444444);
widerstandsLabel.setFlipSide(true);

const resultierendeLabel = new LineLabel(
  630,
  370,
  580,
  170,
  "F<sub>res</sub>",
  20,
);
resultierendeLabel.setFontSize(35);
resultierendeLabel.setTextColor(0x444444);
resultierendeLabel.setFlipSide(false);

resultierendeLabel.setDistance(30);

// Animations-Timer
let animationsTimer = new Timer();
animationsTimer.start();

// ==================== ABSCHNITT 3: FUNKTIONEN ====================

function aktualisiereWinkel(e) {
  let winkel = winkelRegler.value;
  flugzeugGruppe.rotation = -winkel;

  // Beiwerte aus den Kurven ablesen
  let auftriebsBeiwert = -auftriebsKurve.getY(winkel * 10) / 100; // Normierung auf ca. 0-2
  let widerstandsBeiwert = -widerstandsKurve.getY(winkel * 10) / 100; // Normierung auf ca. 0-0.5

  // Physikalisch korrekte Kraftberechnung: F = 0.5 * ρ * v² * A * C
  aktuelleAuftriebskraft = staudruck * fluegelflaeche * auftriebsBeiwert; // Newton
  aktuelleWiderstandskraft = staudruck * fluegelflaeche * widerstandsBeiwert; // Newton

  // Pfeildarstellung (skaliert für die Anzeige)
  let skalierungsFaktor = 0.01; // Skalierung für die visuelle Darstellung
  let auftriebsPfeilLaenge = -aktuelleAuftriebskraft * skalierungsFaktor;
  let widerstandsPfeilLaenge = -aktuelleWiderstandskraft * skalierungsFaktor;

  auftriebsPfeil.setEnd(0, auftriebsPfeilLaenge);
  widerstandsPfeil.setEnd(widerstandsPfeilLaenge, 0);

  // Aktualisiere das Auftriebslabel
  auftriebsLabel.setStart(630, 370);
  auftriebsLabel.setEnd(630, 370 + auftriebsPfeilLaenge);

  // Aktualisiere das Widerstandslabel
  widerstandsLabel.setStart(630, 370);
  widerstandsLabel.setEnd(630 + widerstandsPfeilLaenge, 370);

  let resultierendeX = widerstandsPfeilLaenge;
  let resultierendeY = auftriebsPfeilLaenge;

  resultierendePfeil.setEnd(resultierendeX, resultierendeY);

  // Aktualisiere das resultierende Label
  resultierendeLabel.setStart(630, 370);
  resultierendeLabel.setEnd(630 + resultierendeX, 370 + resultierendeY);

  let rechteckBreite = Math.abs(widerstandsPfeilLaenge);
  let rechteckHoehe = Math.abs(auftriebsPfeilLaenge);

  vektorRechteck.width = rechteckBreite;
  vektorRechteck.height = rechteckHoehe;

  if (widerstandsPfeilLaenge >= 0 && auftriebsPfeilLaenge >= 0) {
    vektorRechteck.x = 630;
    vektorRechteck.y = 370;
  } else if (widerstandsPfeilLaenge < 0 && auftriebsPfeilLaenge >= 0) {
    vektorRechteck.x = 630 + widerstandsPfeilLaenge;
    vektorRechteck.y = 370;
  } else if (widerstandsPfeilLaenge >= 0 && auftriebsPfeilLaenge < 0) {
    vektorRechteck.x = 630;
    vektorRechteck.y = 370 + auftriebsPfeilLaenge;
  } else {
    vektorRechteck.x = 630 + widerstandsPfeilLaenge;
    vektorRechteck.y = 370 + auftriebsPfeilLaenge;
  }

  // Aktualisiere die Armpunkte des Winkels
  // Arm 1: Horizontal nach rechts
  angle.setArm1(630 + 100, 370);

  // Arm 2: Um Winkel α gedreht (Winkel in Grad zu Radiant)
  let winkelRad = (winkel * Math.PI) / 180;
  let armLaenge = 100;
  angle.setArm2(
    630 + armLaenge * Math.cos(winkelRad),
    370 - armLaenge * Math.sin(winkelRad),
  );
}

function aktualisierePhysik() {
  // Aktualisiere Geschwindigkeit und Staudruck
  geschwindigkeitMs = geschwindigkeitKmh / 3.6;
  staudruck = 0.5 * luftdichte * geschwindigkeitMs * geschwindigkeitMs;

  // Aktualisiere die Kräfte mit den neuen Werten
  aktualisiereWinkel();
}

function wolkeUmwickeln(wolke) {
  let wolkenBreite = 250;
  let wolkenHoehe = 100;

  if (wolke.x > 1280 + wolkenBreite) {
    wolke.x = -wolkenBreite;
  } else if (wolke.x < -wolkenBreite) {
    wolke.x = 1280 + wolkenBreite;
  }

  if (wolke.y > 720 + wolkenHoehe) {
    wolke.y = -wolkenHoehe;
  } else if (wolke.y < -wolkenHoehe) {
    wolke.y = 720 + wolkenHoehe;
  }
}

// Animationsupdate-Handler
function animationsUpdateHandler(fortschritt) {
  let aktuelleZeit = Date.now();
  let deltaZeit = (aktuelleZeit - letzteZeit) / 1000;
  letzteZeit = aktuelleZeit;

  deltaZeit = Math.min(deltaZeit, 0.033);

  // Physikalisch korrekte Beschleunigung: a = F / m
  let beschleunigungX = -aktuelleWiderstandskraft / masse; // m/s²
  let beschleunigungY = aktuelleAuftriebskraft / masse - 9.81; // m/s² (mit Gravitation)

  // Integration der Beschleunigung für die Geschwindigkeitsänderung
  let animationsSkalierung = 0.5;
  geschwindigkeitX += beschleunigungX * deltaZeit * animationsSkalierung;
  geschwindigkeitY += beschleunigungY * deltaZeit * animationsSkalierung;

  // Begrenzung der Geschwindigkeitsänderung
  let maxGeschwindigkeitsAenderung = 10;
  geschwindigkeitX = Math.max(
    -maxGeschwindigkeitsAenderung,
    Math.min(maxGeschwindigkeitsAenderung, geschwindigkeitX),
  );
  geschwindigkeitY = Math.max(
    -maxGeschwindigkeitsAenderung,
    Math.min(maxGeschwindigkeitsAenderung, geschwindigkeitY),
  );

  // WICHTIG: Basis-Fluggeschwindigkeit wird jetzt dynamisch aus geschwindigkeitKmh berechnet
  // Skalierungsfaktor angepasst für bessere Sichtbarkeit der Geschwindigkeitsunterschiede
  let geschwindigkeitsSkalierung = 1.0; // Anpassbar für visuelle Darstellung
  let basisGeschwindigkeitPixel =
    geschwindigkeitKmh * geschwindigkeitsSkalierung;

  for (let i = 0; i < alleWolken.length; i++) {
    let wolke = alleWolken[i];
    // Wolken müssen nach LINKS (negativ) für Vorwärtsbewegung des Flugzeugs
    wolke.x -= (basisGeschwindigkeitPixel - geschwindigkeitX * 60) * deltaZeit;
    wolke.y += geschwindigkeitY * deltaZeit * 25; // Erhöht von 10 auf 25 für stärkeren Auftriebseffekt
    wolkeUmwickeln(wolke);
  }

  bildZaehler++;
  debugZaehler++;

  if (debugZaehler >= 60) {
    let jetzt = Date.now();
    let vergangeneZeit = (jetzt - letzteFPSAktualisierung) / 1000;
    aktuelleFPS = Math.round(bildZaehler / vergangeneZeit);

    debugZaehler = 0;
    bildZaehler = 0;
    letzteFPSAktualisierung = jetzt;
  }
}

// ==================== ABSCHNITT 4: EVENTLISTENER ====================

// Winkel-Regler onChange Handler hinzufügen
winkelRegler.onChange(aktualisiereWinkel);

// Animations-Timer onUpdate Handler
animationsTimer.onUpdate(animationsUpdateHandler);

// Initialer Aufruf von aktualisiereWinkel
aktualisiereWinkel();
