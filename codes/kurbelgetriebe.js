// Created with Open Animation Lab

// ========== ABSCHNITT 1: Board und Variablen ==========
let board = new Board(1280, 720);

// Geometrische Variablen
let radius = 200;
let kurbelbreite = 30;
let kurbellaenge = radius + kurbelbreite;
let kolbenhoehe = 80;
let kolbenbreite = 300;
let achsenradius = 7;
let winkel = 0;
let pleuelbreite = 30;
let pleuellaenge = 430;
let mittelpunktX = 340;
let mittelpunktY = 360;
let pleuellaengeEffektiv = pleuellaenge - kurbelbreite;

// Berechnete Positionen
let maxKolbenX =
  mittelpunktX +
  radius +
  Math.sqrt(pleuellaengeEffektiv * pleuellaengeEffektiv);
let minKolbenX =
  mittelpunktX -
  radius +
  Math.sqrt(pleuellaengeEffektiv * pleuellaengeEffektiv);

// Punkte für den Zylinder
let points = [
  [minKolbenX - kolbenhoehe / 2, mittelpunktY - kolbenbreite / 2],
  [maxKolbenX + kolbenhoehe / 2, mittelpunktY - kolbenbreite / 2],
  [maxKolbenX + kolbenhoehe / 2, mittelpunktY + kolbenbreite / 2],
  [minKolbenX - kolbenhoehe / 2, mittelpunktY + kolbenbreite / 2],
];

// Animation Status
let isPlaying = false;

// ========== ABSCHNITT 2: Objekte ==========

// Kurbelweg (Kreis)
let kurbelweg = new Circle(radius, 0xffffff);
kurbelweg.x = mittelpunktX;
kurbelweg.y = mittelpunktY;
kurbelweg.setBorder(0x333333, 1);

// Zylinder (LinePath)
let linePath = new LinePath(points, 0x444444, 2);

// Kurbel
let kurbel = new Rectangle(kurbellaenge, 30, 0x99ff99);
kurbel.x = mittelpunktX;
kurbel.y = mittelpunktY;
kurbel.setBorder(0x333333, 1);
kurbel.setRoundedCorners(10);
kurbel.setRotationPoint(kurbelbreite / 2, kurbelbreite / 2);
kurbel.setTransformationPoint(kurbelbreite / 2, kurbelbreite / 2);

// Kurbelachse
let kurbelachse = new Circle(achsenradius, 0xffffff);
kurbelachse.x = mittelpunktX;
kurbelachse.y = mittelpunktY;
kurbelachse.setBorder(0x333333, 1);

// Kolben
let kolben = new Rectangle(kolbenbreite, kolbenhoehe, 0xe099d7);
kolben.setBorder(0x333333, 1);
kolben.setRoundedCorners(10);
kolben.setRotationPoint(kolbenbreite / 2, kolbenhoehe / 2);
kolben.setTransformationPoint(kolbenbreite / 2, kolbenhoehe / 2);
kolben.rotation = 90;

// Pleuel
let pleuel = new Rectangle(pleuellaenge, 30, 0x00ff99);
pleuel.setBorder(0x333333, 1);
pleuel.setRoundedCorners(10);
pleuel.setRotationPoint(pleuelbreite / 2, pleuelbreite / 2);
pleuel.setTransformationPoint(pleuelbreite / 2, pleuelbreite / 2);

// Pleuelachse
let pleuelachse = new Circle(achsenradius, 0xffffff);
pleuelachse.x = mittelpunktX;
pleuelachse.y = mittelpunktY;
pleuelachse.setBorder(0x333333, 1);

// Kolbenachse
let kolbenachse = new Circle(achsenradius, 0xffffff);
kolbenachse.setBorder(0x333333, 1);

// UI Elemente
let labelAngleSlider = new Text("Winkel", "Arial", 20, 0x444444, "left");
labelAngleSlider.x = 950;
labelAngleSlider.y = 20;

let angleSlider = new ButtonSlider(0, 360, 0, 1, 50, 200);
angleSlider.enableValueDisplay();
angleSlider.setThumbShape("triangle-A");
angleSlider.x = 950;
angleSlider.y = 50;

let labelRadiusSlider = new Text("Radius", "Arial", 20, 0x444444, "left");
labelRadiusSlider.x = 600;
labelRadiusSlider.y = 590;

let radiusSlider = new ButtonSlider(0, 300, radius, 1, 50, 200);
radiusSlider.enableValueDisplay();
radiusSlider.x = 600;
radiusSlider.y = 620;

let labelLengthSlider = new Text("Länge Pleuel", "Arial", 20, 0x444444, "left");
labelLengthSlider.x = 950;
labelLengthSlider.y = 590;

let lengthSlider = new ButtonSlider(100, 500, pleuellaengeEffektiv, 1, 50, 200);
lengthSlider.enableValueDisplay();
lengthSlider.x = 950;
lengthSlider.y = 620;

let myButton = new Button("Play", 100, 30, "Arial", 20);
myButton.x = 800;
myButton.y = 60;

let myTimer = new Timer();

// ========== ABSCHNITT 3: Funktionen ==========

function updateRadius(newRadius) {
  radius = newRadius;
  kurbellaenge = radius + kurbelbreite;

  // Kurbelweg (Kreis) aktualisieren
  kurbelweg.setRadius(radius);

  // Kurbel aktualisieren - Breite ändern
  kurbel.setWidth(kurbellaenge);

  // Zylinder-Grenzen neu berechnen
  maxKolbenX =
    mittelpunktX +
    radius +
    Math.sqrt(pleuellaengeEffektiv * pleuellaengeEffektiv);
  minKolbenX =
    mittelpunktX -
    radius +
    Math.sqrt(pleuellaengeEffektiv * pleuellaengeEffektiv);

  // LinePath aktualisieren - neue Punkte setzen
  points = [
    [minKolbenX - kolbenhoehe / 2, mittelpunktY - kolbenbreite / 2],
    [maxKolbenX + kolbenhoehe / 2, mittelpunktY - kolbenbreite / 2],
    [maxKolbenX + kolbenhoehe / 2, mittelpunktY + kolbenbreite / 2],
    [minKolbenX - kolbenhoehe / 2, mittelpunktY + kolbenbreite / 2],
  ];
  linePath.setPoints(points);

  // Zeichnung mit aktuellem Winkel aktualisieren
  draw(winkel);
}

function updatePleuelLength(newLength) {
  pleuellaengeEffektiv = newLength;
  pleuellaenge = pleuellaengeEffektiv + kurbelbreite;

  // Pleuel-Rechteck aktualisieren
  pleuel.setWidth(pleuellaenge);

  // Zylinder-Grenzen neu berechnen
  maxKolbenX =
    mittelpunktX +
    radius +
    Math.sqrt(pleuellaengeEffektiv * pleuellaengeEffektiv);
  minKolbenX =
    mittelpunktX -
    radius +
    Math.sqrt(pleuellaengeEffektiv * pleuellaengeEffektiv);

  // LinePath aktualisieren - neue Punkte setzen
  points = [
    [minKolbenX - kolbenhoehe / 2, mittelpunktY - kolbenbreite / 2],
    [maxKolbenX + kolbenhoehe / 2, mittelpunktY - kolbenbreite / 2],
    [maxKolbenX + kolbenhoehe / 2, mittelpunktY + kolbenbreite / 2],
    [minKolbenX - kolbenhoehe / 2, mittelpunktY + kolbenbreite / 2],
  ];
  linePath.setPoints(points);

  // Zeichnung mit aktuellem Winkel aktualisieren
  draw(winkel);
}

function draw(newWinkel) {
  winkel = newWinkel;
  kurbel.rotation = winkel;

  // Winkel in Bogenmaß umrechnen
  let winkelRad = (winkel * Math.PI) / 180;

  // Position des Kurbelendes berechnen (dort wo das Pleuel ansetzt)
  let kurbelEndeX = mittelpunktX + radius * Math.cos(winkelRad);
  let kurbelEndeY = mittelpunktY + radius * Math.sin(winkelRad);

  // Pleuel positionieren
  pleuel.x = kurbelEndeX;
  pleuel.y = kurbelEndeY;

  // Berechnung der Pleuelneigung
  // Das Pleuel muss so geneigt werden, dass das andere Ende horizontal über der Mittelachse liegt
  // Die Y-Position des Kolbens ist fest (horizontal über der Mittelachse)
  let kolbenY = 360; // Mittelachse

  // Die X-Position des Kolbens berechnen wir mit dem Satz des Pythagoras
  // Das Pleuel hat eine feste Länge (pleuellaenge)
  let vertikalerAbstand = kolbenY - kurbelEndeY;
  let horizontalerAbstand = Math.sqrt(
    pleuellaengeEffektiv * pleuellaengeEffektiv -
      vertikalerAbstand * vertikalerAbstand,
  );
  let kolbenX = kurbelEndeX + horizontalerAbstand;

  // Pleuelwinkel berechnen
  let pleuelWinkel =
    (Math.atan2(kolbenY - kurbelEndeY, kolbenX - kurbelEndeX) * 180) / Math.PI;
  pleuel.rotation = pleuelWinkel;

  // Kolben positionieren
  kolben.x = kolbenX;
  kolben.y = kolbenY;

  kolbenachse.x = kolbenX;
  kolbenachse.y = kolbenY;

  // Pleuelachse am Kurbelende positionieren
  pleuelachse.x = kurbelEndeX;
  pleuelachse.y = kurbelEndeY;
}

// Event-Handler Funktionen
function onAngleSliderChange(e) {
  draw(e.value);
  // Wenn der Slider manuell bewegt wird, aktualisiere auch die winkel Variable
  winkel = e.value;
}

function onRadiusSliderChange(e) {
  updateRadius(e.value);
}

function onLengthSliderChange(e) {
  updatePleuelLength(e.value);
}

function onButtonClick() {
  if (isPlaying) {
    // Pausieren
    myTimer.pause();
    myButton.setText("Play");
    isPlaying = false;
  } else {
    // Abspielen
    myTimer.start();
    myButton.setText("Pause");
    isPlaying = true;
  }
}

function onTimerUpdate(progress) {
  // Der Progress geht von 0 bis 1, wir wollen von 0 bis 360 Grad
  let neuerWinkel = (winkel + 2) % 360; // 2 Grad pro Frame
  draw(neuerWinkel);

  // Slider-Position aktualisieren
  angleSlider.setValue(neuerWinkel);
}

// ========== ABSCHNITT 4: Event-Listener ==========

angleSlider.onChange(onAngleSliderChange);
radiusSlider.onChange(onRadiusSliderChange);
lengthSlider.onChange(onLengthSliderChange);
myButton.onClick(onButtonClick);
myTimer.onUpdate(onTimerUpdate);

// Initiale Zeichnung
draw(winkel);
