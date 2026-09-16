const projectTemplates = {
  categories: [
    {
      name: "General",
      description:
        "Das 16:9-Format hat sich in vielen Zusammenhang als das beste herausgellt. Hinweis: Animationen werden unabhängig von der ursprünglich eingestellten Pixelwert optimal skaliert.",
      templates: [
        {
          image: "blank.png",
          title: "Blanko 16:9",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);`,
        },
      ],
    },
    {
      name: "Geometry",
      description:
        "Geometrische Grundformen wie Rechtecke, Kreise und Polygone. Aus diesen Elementen können komplette Animationen zusammengesetzt werden.",
      templates: [
        {
          image: "rectangle.png",
          title: "Rectangle",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let myRect = new Rectangle(800, 500, 0x99ff99);
myRect.x = 240;
myRect.y = 110;
myRect.setBorder(0x333333, 1);`,
        },
        {
          image: "circle.png",
          title: "Circle",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let myCircle = new Circle(250, 0x33ccff); 
myCircle.x = 640;
myCircle.y = 360;
myCircle.setBorder(0x333333, 1);`,
        },
        {
          image: "triangle.png",
          title: "Polygon",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);

const triangle = new Polygon(3, 300, 0xFFA6FF);

triangle.setBorder(0x333333, 2)

triangle.x = 640;
triangle.y = 420;`,
        },
        {
          image: "example4.png",
          title: "SplinePath",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let points = [
  [100, 300],
  [200, 200],
  [300, 400],
  [400, 250],
  [500, 350]
];

let spline = new SplinePath(points, 0xff0000, 2);`,
        },
        {
          image: "lineCurve.png",
          title: "LinePath",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let points = [
  [100, 300],
  [200, 200],
  [300, 400],
  [400, 250],
  [500, 350]
];

let linePath = new LinePath(points, 0xff0000, 3);`,
        },
        {
          image: "line.png",
          title: "Line",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let myLine = new Line(400, 200, 800, 500, 0x555555, 2);
myLine.x = 0;
myLine.y = 0;`,
        },
      ],
    },
    {
      name: "UI",
      description:
        "Über diese Elemente kann man mit Animationen interagieren. Hinweis: Diese Elemente befinden sich immer im Vordergrund.",
      templates: [
        {
          image: "button.png",
          title: "Button",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let myButton = new Button("Test", 100, 40, "Arial", 20);
myButton.x = 30;
myButton.y = 30;`,
        },
        {
          image: "checkbox.png",
          title: "Checkbox",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let myCheckbox = new Checkbox(true, 20, "My Checkbox", "Arial", 20);
myCheckbox.x = 100;
myCheckbox.y = 100;`,
        },
        {
          image: "stepper.png",
          title: "Stepper",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let myStepper = new NumericStepper(50, 0, 100, 0.1, 100, "Arial", 20);
myStepper.x = 100;
myStepper.y = 100;`,
        },
        {
          image: "buttonSlider.png",
          title: "ButtonSlider",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let mySlider = new ButtonSlider(0, 100, 50, 1, 50, 200);

mySlider.enableSnap([10, 20, 30])

mySlider.enableValueDisplay()

mySlider.x = 100;
mySlider.y = 100;`,
        },
        {
          image: "radiobutton.png",
          title: "RadioButton",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let myRadioButton = new RadioButton("myGroup", false, 20, "My RadioButton", "Arial", 20, 0x000000)

myRadioButton.x = 100;
myRadioButton.y = 100;

let myRadioButton2 = new RadioButton("myGroup", true, 20, "My RadioButton", "Arial", 20, 0x000000);

myRadioButton2.x = 100;
myRadioButton2.y = 150;`,
        },
		{
          image: "dropdown.png",
          title: "Dropdown",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);


let myDropdown = new Dropdown(["Option 1","Option 2","Option 3"], 200, 50, "Arial", 20);
myDropdown.x = 300;
myDropdown.y = 200;

myDropdown.onChange(handleChange); 

function handleChange(event) { console.log("Selected: " + event.detail.value); }`,
        },		
        {
          image: "text.png",
          title: "Text",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);


let myText = new Text("Text", 'Arial', 36, 0x000000, 'left')

myText.x = 500;
myText.y = 300;


let myText2 = new Text("CO<sup>2</sup>", 'Arial', 36, 0x0000ff, 'left')

myText2.x = 600;
myText2.y = 400;


let myText3 = new Text("Hallo Welt", 'Arial', 46, 0xff00ff, 'left')

myText3.x = 700;
myText3.y = 200;`,
        },
        {
          image: "paramtable.png",
          title: "ParameterTable",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);

// Tabelle erstellen
const paramTable = new ParameterTable([    
  { name: "Geschwindigkeit", value: 50 },    
  { name: "Temperatur", value: 23.5 },    
  { name: "Druck", value: 1013.25 }], 
   400, 'Arial', 14, 0x333333);

// Position setzen
paramTable.x = 100;
paramTable.y = 50;

// Überschrift hinzufügen
paramTable.setTitle("Systemparameter");

// Dezimaltrennzeichen auf Komma setzen
paramTable.setDecimalSeparator(",");

// Wertbegrenzungen setzen
paramTable.setValueLimits("Geschwindigkeit", 0, 100);
paramTable.setValueLimits("Temperatur", -50, 150);

// Event-Listener für Änderungen
paramTable.onChange(function(event) {
    console.log("Parameter geändert:", event.parameterName, "->", event.newValue);
});

// Wert programmatisch ändern
paramTable.setValue("Temperatur", 25.0);

`,
        },
      ],
    },
    {
      name: "Math",
      description:
        "Mathematische Visualisierungen wie Koordinatensysteme, Pfeile, Formeln und mathematische Kurven.",
      templates: [
        {
          image: "coordinateSystem.png",
          title: "Coordinate System",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);

let myCoordinateSystem = new CoordinateSystem(200, 200, 200, 200, 0x444444, 20, 9, 1);

myCoordinateSystem.x = 500;
myCoordinateSystem.y = 350;

let myRuler = new Ruler("right", [2, 4, 6], 50, 50, 0x444444, 1, 10, 21, 0x444444, true);

myRuler.x = 500;
myRuler.y = 350;`,
        },
        {
          image: "arrow.png",
          title: "Arrow",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let myArrow = new Arrow(400, 200, 800, 500, 0x555555, 2, 26, 12);
myArrow.x = 0;
myArrow.y = 0;`,
        },
        {
          image: "mathForm.png",
          title: "MathForm",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);

let myForm = new MathForm("\\int_0^\\infty e^{-x} \\, dx = 1");

myForm.x = 220;
myForm.y = 260;

myForm.setScale(2);


let myForm2 = new MathForm("$$\\int_0^\\infty e^{-x} \, dx = 1$$");

myForm2.x = 620;
myForm2.y = 260;

myForm2.setScale(2);`,
        },
        {
          image: "mathcurve.png",
          title: "Mathematische Kurve",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

// Sinuskurve generieren
let points = [];
let amplitude = 150;  // Höhe der Kurve
let frequency = 0.01; // Häufigkeit der Wellen
let centerY = 360;    // Mittellinie (halbe Board-Höhe)
let startX = 50;
let endX = 1230;

// Punkte für die Sinuskurve berechnen
for (let x = startX; x <= endX; x += 5) {
  let y = centerY + amplitude * Math.sin(frequency * x);
  points.push([x, y]);
}

let linePath = new LinePath(points, 0xff0000, 3);
board.addChild(linePath);`,
        },
        {
          image: "bezier.png",
          title: "BezierPath",
          code: `// Created with Open Animation Lab
let board = new Board(1280, 720);

let myText = new Text("Tipp: Eine Spline-Kurve ist meist einfacher in der Handhabung 🔔", 'Arial', 36, 0x444444, 'left')

// Bühnen-Dimensionen
const stageWidth = 1280;
const stageHeight = 720;
const centerX = stageWidth / 2;
const centerY = stageHeight / 2;

// Einfache Bezier-Kurve mit Start- und Endpunkt plus Steuerpunkten
// Format: [x, y, kontrollX, kontrollY]
let punkte = [
    // Startpunkt mit Steuerpunkt
    [centerX - 200, centerY, centerX - 100, centerY - 150],
    // Endpunkt mit Steuerpunkt  
    [centerX + 200, centerY, centerX + 100, centerY + 150]
];

// Bezier-Pfad erstellen
const bezierPfad = new BezierPath(punkte, 0x444444, 7);

// Visuelle Elemente für die Punkte
let startPunkt = new Circle(12, 0x0066ff);
startPunkt.x = punkte[0][0];
startPunkt.y = punkte[0][1];
startPunkt.setBorder(0x003366, 2);

let startKontroll = new Circle(10, 0xffaa00);
startKontroll.x = punkte[0][2];
startKontroll.y = punkte[0][3];
startKontroll.setBorder(0x996600, 2);

let endPunkt = new Circle(12, 0x0066ff);
endPunkt.x = punkte[1][0];
endPunkt.y = punkte[1][1];
endPunkt.setBorder(0x003366, 2);

let endKontroll = new Circle(10, 0xffaa00);
endKontroll.x = punkte[1][2];
endKontroll.y = punkte[1][3];
endKontroll.setBorder(0x996600, 2);

// Hilfslinien von Punkten zu Steuerpunkten
let startLinie = new Line(punkte[0][0], punkte[0][1], punkte[0][2], punkte[0][3], 0x999999, 2);
let endLinie = new Line(punkte[1][0], punkte[1][1], punkte[1][2], punkte[1][3], 0x999999, 2);

// Drag-Funktionalität hinzufügen
startPunkt.setDragging(0, 0, stageWidth, stageHeight);
startKontroll.setDragging(0, 0, stageWidth, stageHeight);
endPunkt.setDragging(0, 0, stageWidth, stageHeight);
endKontroll.setDragging(0, 0, stageWidth, stageHeight);

// Update-Funktionen
startPunkt.onDrag(function() {
    punkte[0][0] = startPunkt.x;
    punkte[0][1] = startPunkt.y;
    startLinie.setStart(startPunkt.x, startPunkt.y);
    bezierPfad.setPoints(punkte);
});

startKontroll.onDrag(function() {
    punkte[0][2] = startKontroll.x;
    punkte[0][3] = startKontroll.y;
    startLinie.setEnd(startKontroll.x, startKontroll.y);
    bezierPfad.setPoints(punkte);
});

endPunkt.onDrag(function() {
    punkte[1][0] = endPunkt.x;
    punkte[1][1] = endPunkt.y;
    endLinie.setStart(endPunkt.x, endPunkt.y);
    bezierPfad.setPoints(punkte);
});

endKontroll.onDrag(function() {
    punkte[1][2] = endKontroll.x;
    punkte[1][3] = endKontroll.y;
    endLinie.setEnd(endKontroll.x, endKontroll.y);
    bezierPfad.setPoints(punkte);
});
`,
        },
        {
          image: "angleLabel.png",
          title: "Winkelmarkierung",
          code: `// Demo: AngleLabel zwischen zwei Pfeilen
let board = new Board(800, 600);

// Zentrum für beide Pfeile
let centerX = 400;
let centerY = 300;

// Erstelle zwei Pfeile vom gleichen Ursprung
let arrow1 = new Arrow(centerX, centerY, centerX + 150, centerY - 100, 0xff5555, 3, 20, 10);
let arrow2 = new Arrow(centerX, centerY, centerX + 180, centerY + 50, 0x5555ff, 3, 20, 10);

// Erstelle das AngleLabel zwischen den beiden Pfeilen
const angleLabel = new AngleLabel(
    centerX, centerY,
    centerX + 150, centerY - 100,
    centerX + 180, centerY + 50,
    80,
    "α",
    "Arial",
    24,
    0x444444,
    2,
    0x888888
);

// Optional: Slider zum Anpassen des Winkels
let labelAngleSlider = new Text("Winkel α anpassen", 'Arial', 18, 0x444444, 'left');
labelAngleSlider.x = 50;
labelAngleSlider.y = 20;

let angleSlider = new ButtonSlider(0, 360, 90, 1, 40, 200);
angleSlider.enableValueDisplay();
angleSlider.x = 50;
angleSlider.y = 50;

// Toggle-Button für Long Arc
let longArcButton = new Button("Langer Bogen: AUS", 180, 40, 0x3498db);
longArcButton.x = 50;
longArcButton.y = 140;

// Status-Variable für Long Arc
let isLongArc = false;

// Toggle-Funktion für Long Arc
function toggleLongArc() {
    isLongArc = !isLongArc;
    angleLabel.setLongArc(isLongArc);
    longArcButton.setText(isLongArc ? "Langer Bogen: AN" : "Langer Bogen: AUS");
    longArcButton.setBackgroundColor(isLongArc ? 0x27ae60 : 0x3498db);
}
longArcButton.onClick(toggleLongArc);

// Update-Funktion für dynamische Winkeländerung
function updateAngle(e) {
    let angle = angleSlider.value * Math.PI / 180;
    let newX = centerX + 180 * Math.cos(angle);
    let newY = centerY + 180 * Math.sin(angle);
    
    // Aktualisiere Position des zweiten Pfeils
    arrow2.setEnd(newX, newY);
    
    // Aktualisiere das AngleLabel
    angleLabel.setArm2(newX, newY);
}
angleSlider.onChange(updateAngle);

// ZWEITES PFEILPAAR AN NEUER POSITION
let centerX2 = 150;  // Neue X-Position für das zweite Pfeilpaar
let centerY2 = 450;  // Neue Y-Position für das zweite Pfeilpaar

let arrow3 = new Arrow(centerX2, centerY2, centerX2 + 150, centerY2, 0xff5555, 3, 20, 10);
// Pfeil 2: vertikal nach oben (90 Grad)
let arrow4 = new Arrow(centerX2, centerY2, centerX2, centerY2 - 150, 0x5555ff, 3, 20, 10);

// Erstelle das AngleLabel mit einem Punkt für den 90-Grad-Winkel
const angleLabel2 = new AngleLabel(
    centerX2, centerY2,           // Scheitelpunkt (neue Position)
    centerX2 + 150, centerY2,     // Ende Pfeil 1
    centerX2, centerY2 - 150,     // Ende Pfeil 2
    60,                           // Radius
    "•",                          // Punkt als Markierung
    "Arial",                      // Schriftart
    36,                           // Schriftgröße
    0x444444,                     // Farbe
    0,                            // Keine Bogenlinie
    0x888888                      // Bogenfarbe (wird nicht verwendet)
);
`,
        },
        {
          image: "line-label.png",
          title: "Linienbezeichnung",
          code: `// Created with Open Animation Lab
let board = new Board(1280, 720);

// Linie erstellen
let myLine = new Line(400, 200, 800, 500, 0x555555, 2);
myLine.x = 0;
myLine.y = 0;

// Beschriftung erstellen
const label1 = new LineLabel(400, 200, 800, 500, "15 cm", 40);
label1.setFontSize(26);

// Startpunkt-Kreis (rot)
let startCircle = new Circle(12, 0xff3333);
startCircle.x = 400;
startCircle.y = 200;
startCircle.setBorder(0x333333, 2);
startCircle.setDragging(0, 0, 1280, 720);

// Endpunkt-Kreis (blau)
let endCircle = new Circle(12, 0x3333ff);
endCircle.x = 800;
endCircle.y = 500;
endCircle.setBorder(0x333333, 2);
endCircle.setDragging(0, 0, 1280, 720);

// Funktion zur Berechnung der Distanz
function calculateDistance(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let distance = Math.sqrt(dx * dx + dy * dy);
    // Umrechnung in cm (angenommen 1 Pixel = 0.1 cm)
    return (distance * 0.1).toFixed(1) + " cm";
}

// Funktion zum Aktualisieren der Linie und Beschriftung
function updateLine() {
    // Linie aktualisieren
    myLine.setStart(startCircle.x, startCircle.y);
    myLine.setEnd(endCircle.x, endCircle.y);
    
    // Beschriftung aktualisieren
    label1.setStart(startCircle.x, startCircle.y);
    label1.setEnd(endCircle.x, endCircle.y);
    
    // Neue Distanz berechnen und als Text setzen
    let newDistance = calculateDistance(startCircle.x, startCircle.y, endCircle.x, endCircle.y);
    label1.setText(newDistance);
}

// Event-Handler für Startpunkt
function onStartDrag() {
    updateLine();
}

// Event-Handler für Endpunkt
function onEndDrag() {
    updateLine();
}

// Event-Handler zuweisen
startCircle.onDrag(onStartDrag);
endCircle.onDrag(onEndDrag);

// Initiale Aktualisierung
updateLine();
`,
        },
        {
          image: "parallelogram.png",
          title: "Parallelogram",
          code: `// Created with Open Animation Lab
		  
let board = new Board(1280, 720);
// Startpunkt für beide Vektoren
let startX = 300;
let startY = 300;
// Erster Vektor (Pfeil 1)
let vector1EndX = 600;
let vector1EndY = 400;
// Zweiter Vektor (Pfeil 2)
let vector2EndX = 400;
let vector2EndY = 500;
// Erster Pfeil (Vektor 1)
let arrow1 = new Arrow(startX, startY, vector1EndX, vector1EndY, 0xFF0000, 3, 30, 15);
arrow1.x = 0;
arrow1.y = 0;
// Zweiter Pfeil (Vektor 2)
let arrow2 = new Arrow(startX, startY, vector2EndX, vector2EndY, 0x00FF00, 3, 30, 15);
arrow2.x = 0;
arrow2.y = 0;
// Parallelogramm mit den beiden Vektoren
let parallelogram1 = new Parallelogram(
    startX, startY,
    vector1EndX, vector1EndY,
    vector2EndX, vector2EndY,
    0x0000FF
);
parallelogram1.setAlpha(0.3);
// Resultierender Kraftvektor (blauer Pfeil)
let resultantEndpoint = parallelogram1.getResultantEndpoint();
let resultantArrow = new Arrow(
    startX, startY,
    resultantEndpoint.x, resultantEndpoint.y,
    0x0000FF,
    3,
    30,
    15
);

`,
        },
        {
          image: "point-label.png",
          title: "Point label",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);

const label1 = new PointLabel(400, 200, "A Circle", 30, 40);
label1.setFontSize(26);

let firstCircle = new Circle(12, 0xff3333);
firstCircle.x = 400;
firstCircle.y = 200;
firstCircle.setBorder(0x333333, 2);


let secondCircle = new Circle(12, 0x3333ff);
secondCircle.x = 800;
secondCircle.y = 500;
secondCircle.setBorder(0x333333, 2);

const label2 = new PointLabel(800, 500, "Another Circle", 30, -40);
label2.setFontSize(26);
`,
        },
      ],
    },
    {
      name: "Images",
      description:
        "Dieses Tool kann Ihre Bilder direkt in den Code integrieren.",
      templates: [
        {
          image: "guitar.png",
          title: "SVG example",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);
  
// Source of the image https://pixabay.com/de/users/denny_sam-49824692/

let mySVG = new SimpleSVG(\`<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 500 500"><defs><style>.cls-1{fill:#ffb61b}.cls-2{fill:#221820}.cls-3{fill:#fff}.cls-4{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:2.06px}</style></defs><path d="M379.69 302.6c-24.07-25.61-5.73-42.51-43.25-79s-101.51 12.1-101.51 12.1-62.73 50.17-36.58 95.47 47 31.65 66 61.25-7 60.72 35.44 95.91 112.9-24.44 112.9-24.44 75.04-53.65 51.31-103.45-60.25-32.22-84.31-57.84z" class="cls-1"/><circle cx="302.92" cy="318.47" r="35" class="cls-2" transform="rotate(-51.4 302.963 318.483)"/><path d="m312.1 427.649 87.7-68.321 11.178 14.35-87.699 68.32z" class="cls-2"/><path d="m342.884 410.408 35.01-27.274 4.64 5.956-35.01 27.274z" class="cls-3"/><path d="m270.47 238.28-41.89 32.63-105.84-159.28 25.52-18.35z" class="cls-2"/><path d="M122.74 111.62a13.92 13.92 0 0 0-6.82-6.86c-5-2.28-12.94 2.79-21.65-6.13S50.71 52.94 48.12 42.8s10.11-23.36 23-32.71S100.13-.59 106.3 4.77s35 52.59 37.54 60.11-3.28 13.4-.91 19.28a32.73 32.73 0 0 0 5.33 9.12Z" class="cls-1"/><path d="M125.82 56.88a7.1 7.1 0 1 1-10-1.24 7.09 7.09 0 0 1 10 1.24zM106.08 69.39a7.1 7.1 0 1 1-10-1.24 7.1 7.1 0 0 1 10 1.24zM84 48.26c9.23 2.44 7.74 14.49-1.81 14.59C73 60.41 74.5 48.37 84 48.26ZM104 33.54c9.23 2.44 7.74 14.48-1.81 14.59C93 45.69 94.5 33.64 104 33.54Z" class="cls-3"/><path d="M373.85 391.09 140.52 93.54M364.14 399.23 133.05 99.08M354.83 407 124.02 106.16" class="cls-4"/></svg>\`);
mySVG.x = 100;
mySVG.y = 100;

// Hint: Freeware tools like LibreCAD and Inkscape can be used to create and export nice technical drawings as SVGs 👌

// Hint: Sometimes it's necessary to clean the SVG code using an SVG optimizer like https://optimize.svgomg.net`,
        },
        {
          image: "png.png",
          title: "PNG example",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);

// Hinweis: Meist eignet sich eine SVG besser. Bei PNGs gibt das Problem, dass der Gesamtcode zu groß für eine KI-Bearbeitung wird.

let myPNG = new SimplePNG("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABECAIAAADGJao+AAAAwklEQVR4Xu3UgQbDMBRA0bc03f//b7N0VuqJEmwoc+KqNEkDh9b+2HuJu1KNO4f+AQCAAAAQAAACAEAAAAgAAAEAIAAABACAAAAQAAACAEAAAAgAAAEAIAAAANReamRLlPWYfNH0klxcPs+cP3NxWF+vi3lb7pa2R+vx6tHOtuN1O+a5lY3HzgM5ya/GM5N7ZjfPq7/5yS8IgAAAEAAAAgBAAAAIAAABACAAAAQAgAAAEAAAAgBAAAAIAAABACAAAIw322gDIPvtlmUAAAAASUVORK5CYII=");

myPNG.x = 400;
myPNG.y = 300;`,
        },
      ],
    },
    {
      name: "Tips",
      description: "Nützliche Techniken und Best Practices.",
      templates: [
        {
          image: "grouping.png",
          title: "Grouping",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let myCircle = new Circle(100, 0x33ccff); 
myCircle.x = 640;
myCircle.y = 360;
myCircle.setBorder(0x333333, 1);

let myRect = new Rectangle(200, 150, 0x99ff99);
myRect.x = 240;
myRect.y = 110;
myRect.setBorder(0x333333, 1);

let myGroup = new Group();
myGroup.addChild(myCircle);
myGroup.addChild(myRect);
myGroup.visible = true;`,
        },
        {
          image: "mask.png",
          title: "Masking von Gruppen",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let myCircle = new Circle(100, 0x33ccff); 
myCircle.x = 640;
myCircle.y = 360;
myCircle.setBorder(0x333333, 1);

let myRect = new Rectangle(200, 150, 0x99ff99);
myRect.x = 240;
myRect.y = 110;
myRect.setBorder(0x333333, 1);

let myGroup = new Group();
myGroup.addChild(myCircle);
myGroup.addChild(myRect);

myGroup.setMask(260, 130, 350, 250)

let myWindow = new Rectangle(350, 250);
myWindow.x = 260;
myWindow.y = 130;
myWindow.setBorder(0x333333, 1);`,
        },
        {
          image: "sub.png",
          title: "Tief-/Hochgestellte Label",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);


let myText = new Text("You can also use subscript and superscript characters in some elements.", 'Arial', 36, 0x444444, 'left')

let myCheckbox = new Checkbox(true, 20, "CO<sub>2</sub>", "Arial", 20);
myCheckbox.x = 100;
myCheckbox.y = 200;

let myRadioButton = new RadioButton("myGroup", false, 20, "H<sub>2</sub>O", "Arial", 20, 0x000000)

myRadioButton.x = 300;
myRadioButton.y = 200;

let myRadioButton2 = new RadioButton("myGroup", true, 20, "O<sub>2</sub>", "Arial", 20, 0x000000);

myRadioButton2.x = 300;
myRadioButton2.y = 250;`,
        },
        {
          image: "timer.png",
          title: "Timer",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let myCircle = new Circle(250, 0xff88ff); 
myCircle.y = 360;
myCircle.setBorder(0x333333, 1);


let myTimer = new Timer(1500);
myTimer.addAnimation(myCircle, "x", 100, 900);
myTimer.setEasing("bounce");
myTimer.start();`,
        },
        {
          image: "timer2.png",
          title: "Timer 2",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);

let planet = new Circle(35, 0x4169E1);
planet.setBorder(0x1E90FF, 2);

let angle = 0;

let myTimer = new Timer();
myTimer.start();

myTimer.onUpdate(handleProgress);

function handleProgress() {
  
    angle += 0.01;
  
    planet.x = 640 + Math.cos(angle) * 250;
    planet.y = 360 + Math.sin(angle) * 250;

}`,
        },

        {
          image: "click.png",
          title: "Click event",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);

let myText = new Text("Please click on the circle and look at the message panel 🔔", 'Arial', 36, 0x444444, 'left')

myText.x = 10;
myText.y = 10;

let myCircle = new Circle(250, 0x33ccff); 
myCircle.x = 640;
myCircle.y = 360;
myCircle.setBorder(0x333333, 1);

function sendMessage() {
  console.log("Hallo World")
}

myCircle.onClick(sendMessage);`,
        },
        {
          image: "regler-ball.png",
          title: "Ball folgt Regler",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let mySlider = new ButtonSlider(0, 100, 50, 1, 50, 200);
mySlider.enableValueDisplay()
mySlider.x = 100;
mySlider.y = 100;

let myCircle = new Circle(50, 0x33ccff); 
myCircle.x = 640;
myCircle.y = 360;
myCircle.setBorder(0x333333, 1);

// Ball bewegt sich basierend auf dem Regler-Wert
mySlider.onChange(e => {
    console.log(e.value);
    // Ball Position basierend auf Regler-Wert setzen
    // Wert 0-100 wird auf Board-Breite 50-1230 gemappt (mit Rand für den Ball)
    myCircle.x = 50 + (e.value / 100) * (1280 - 100);
})`,
        },
        {
          image: "interactive-mathcurve.png",
          title: "Interaktive mathematische Kurve",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let points = [];
let amplitude = 150;
let frequency = 0.01; 
let centerY = 360;  
let startX = 50;
let endX = 1230;

function createCurce() {
for (let x = startX; x <= endX; x += 5) {
  let y = centerY + amplitude * Math.sin(frequency * x);
  points.push([x, y]);
}
}

createCurce();

let linePath = new LinePath(points, 0xff0000, 3);
board.addChild(linePath);

let mySlider = new ButtonSlider(0, 100, 50, 1, 50, 200);

mySlider.enableValueDisplay()

mySlider.onChange(e => { 
  points = [];
  frequency = e.value*0.0002; createCurce();
  linePath.setPoints(points)
}
)

mySlider.x = 100;
mySlider.y = 100;`,
        },
        {
          image: "visibility.png",
          title: "Objekte un/sichtbar machen",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let myCheckbox = new Checkbox(true, 20, "My Checkbox", "Arial", 20, 0x000000);
myCheckbox.x = 100;
myCheckbox.y = 100;

let myRect = new Rectangle(700, 500, 0x99ff99);
myRect.x = 340;
myRect.y = 110;
myRect.setBorder(0x333333, 1);

myCheckbox.onClick(function(e) { 
    myRect.visible = e.value;
});`,
        },
        {
          image: "mask.png",
          title: "Zoom innerhalb von Masken",
          code: `// Created with Open Animation Lab
let board = new Board(1280, 720);

// Erstelle die ursprünglichen Elemente
let myCircle = new Circle(100, 0x33ccff); 
myCircle.x = 640;
myCircle.y = 360;
myCircle.setBorder(0x333333, 1);

let myRect = new Rectangle(200, 150, 0x99ff99);
myRect.x = 240;
myRect.y = 110;
myRect.setBorder(0x333333, 1);

// Innere Gruppe für die Elemente (diese wird skaliert)
let innerGroup = new Group();
innerGroup.addChild(myCircle);
innerGroup.addChild(myRect);

// Äußere Gruppe für die Maske
let myGroup = new Group();
myGroup.addChild(innerGroup);
myGroup.setMask(260, 130, 350, 250);

// Das Fenster (bleibt unverändert)
let myWindow = new Rectangle(350, 250);
myWindow.x = 260;
myWindow.y = 130;
myWindow.setBorder(0x333333, 1);

// Timer für die Zoom-Animation
let myTimer = new Timer(2000);
// Skalierung von 1.0 auf 1.5 (50% Vergrößerung)
myTimer.addAnimation(innerGroup, "scale", 1.0, 1.5);
myTimer.setEasing("ease-in-out");


let myButton = new Button("Start", 100, 30, "Arial", 20);
myButton.x = 700;
myButton.y = 300;

myButton.onClick(function() {myTimer.start();})`,
        },
        {
          image: "rotation-point.png",
          title: "Rotationspunkte verändern",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);

// Das folgende Beispiel zeigt, wie man den Rotationspunkt eines Objekts verschieben kann. Standardmäßig befindet sich dieser Punkt bei 0,0, also der linken oberen Ecke des Objekts

let myRect = new Rectangle(800, 300, 0x99ff99);
myRect.x = 240;
myRect.y = 280;
myRect.setBorder(0x333333, 1);

myRect.setRotationPoint(400, 0)

myRect.rotation = 20;

let myCircle = new Circle(20, 0x33ccff); 
myCircle.x = 240+400;
myCircle.y = 280;
myCircle.setBorder(0x333333, 1);`,
        },
        {
          image: "formulars.png",
          title: "Math Formulars",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);
let formula1 = new MathForm("a^2 + b^2 = c^2");
formula1.x = 150;
formula1.y = 100;
formula1.setScale(1.5);
let formula2 = new MathForm("E = mc^2");
formula2.x = 590;
formula2.y = 100;
formula2.setScale(1.5);
let formula3 = new MathForm("F = ma");
formula3.x = 950;
formula3.y = 100;
formula3.setScale(1.5);
let formula4 = new MathForm("x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}");
formula4.x = 150;
formula4.y = 250;
formula4.setScale(1.5);
let formula5 = new MathForm("A = \\pi r^2");
formula5.x = 590;
formula5.y = 250;
formula5.setScale(1.5);
let formula6 = new MathForm("e^{i\\pi} + 1 = 0");
formula6.x = 950;
formula6.y = 250;
formula6.setScale(1.5);
let formula7 = new MathForm("V = \\frac{4}{3}\\pi r^3");
formula7.x = 150;
formula7.y = 400;
formula7.setScale(1.5);
let formula8 = new MathForm("\\sin^2 x + \\cos^2 x = 1");
formula8.x = 590;
formula8.y = 400;
formula8.setScale(1.5);
let formula9 = new MathForm("v = v_0 + at");
formula9.x = 950;
formula9.y = 400;
formula9.setScale(1.5);
let formula10 = new MathForm("\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}");
formula10.x = 150;
formula10.y = 550;
formula10.setScale(1.5);
let formula11 = new MathForm("P = \\frac{U^2}{R}");
formula11.x = 590;
formula11.y = 550;
formula11.setScale(1.5);
let formula12 = new MathForm("s = ut + \\frac{1}{2}at^2");
formula12.x = 950;
formula12.y = 550;
formula12.setScale(1.5);`,
        },
        {
          image: "marking.png",
          title: "Markierung von Spline-Kurven",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);

let myCoordinateSystem = new CoordinateSystem(0, 450, 300, 0, 0x444444, 20, 12, 1);
myCoordinateSystem.x = 400;
myCoordinateSystem.y = 500;

let myPoints = [
   [0, 0],        
   [100, -150],   
   [200, -50],    
   [300, -220],   
   [400, -100]    
];

let spline = new SplinePath(myPoints, 0xff0000, 2);
board.addChild(spline);
spline.x = 400;
spline.y = 500;

spline.markAt(0, 0x333333, 5);

let mySlider = new ButtonSlider(0, 100, 0, 1, 50, 200);
mySlider.enableValueDisplay();
mySlider.x = 100;
mySlider.y = 100;
mySlider.onChange(e => {
   let xPosition = (e.value / 100) * 400;
   spline.markAt(xPosition, 0x333333, 5);
  spline.showGuideLines(xPosition, 0x333333, 2);
});
`,
        },
        {
          image: "drag-drop.png",
          title: "Drag&Drop",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);

let myCircle = new Circle(50, 0x33ccff);
myCircle.x = 640;
myCircle.y = 360;
myCircle.setBorder(0x333333, 1);

let minX = 200;  // Left boundary
let maxX = 1080; // Right boundary
let minY = 200;  // Top boundary  
let maxY = 520;  // Bottom boundary

myCircle.setDragging(minX, minY, maxX, maxY);
// Define the interactivity function
function interaktivity() {
   console.log("Circle is being moved!");
   console.log("Current X position: " + myCircle.x);
   console.log("Current Y position: " + myCircle.y);
}
myCircle.onDrag(interaktivity);
`,
        },
        {
          image: "slider-types.png",
          title: "Slider-Typen",
          code: `// Created with Open Animation Lab
let board = new Board(1280, 720);

// Horizontale Slider mit verschiedenen Thumb-Shapes
// Triangle-A
let sliderTriangleA = new ButtonSlider(0, 100, 50, 1, 50, 200);
sliderTriangleA.enableValueDisplay();
sliderTriangleA.setThumbShape("triangle-A");
sliderTriangleA.x = 150-90;
sliderTriangleA.y = 150+50;

// Triangle-B
let sliderTriangleB = new ButtonSlider(0, 100, 50, 1, 50, 200);
sliderTriangleB.enableValueDisplay();
sliderTriangleB.setThumbShape("triangle-B");
sliderTriangleB.x = 450-90;
sliderTriangleB.y = 150+50;

// Circle
let sliderCircle = new ButtonSlider(0, 100, 50, 1, 50, 200);
sliderCircle.enableValueDisplay();
sliderCircle.setThumbShape("circle");
sliderCircle.x = 750-90;
sliderCircle.y = 150+50;

// Rectangle
let sliderRectangle = new ButtonSlider(0, 100, 50, 1, 50, 200);
sliderRectangle.enableValueDisplay();
sliderRectangle.setThumbShape("rectangle");
sliderRectangle.x = 1050-90;
sliderRectangle.y = 150+50;

// Vertikale Slider mit verschiedenen Thumb-Shapes
// Triangle-A vertikal
let sliderTriangleAVert = new ButtonSlider(0, 100, 50, 1, 50, 200);
sliderTriangleAVert.enableValueDisplay();
sliderTriangleAVert.setThumbShape("triangle-A");
sliderTriangleAVert.setVertical();
sliderTriangleAVert.x = 150;
sliderTriangleAVert.y = 350;

// Triangle-B vertikal
let sliderTriangleBVert = new ButtonSlider(0, 100, 50, 1, 50, 200);
sliderTriangleBVert.enableValueDisplay();
sliderTriangleBVert.setThumbShape("triangle-B");
sliderTriangleBVert.setVertical();
sliderTriangleBVert.x = 450;
sliderTriangleBVert.y = 350;

// Circle vertikal
let sliderCircleVert = new ButtonSlider(0, 100, 50, 1, 50, 200);
sliderCircleVert.enableValueDisplay();
sliderCircleVert.setThumbShape("circle");
sliderCircleVert.setVertical();
sliderCircleVert.x = 750;
sliderCircleVert.y = 350;

// Rectangle vertikal
let sliderRectangleVert = new ButtonSlider(0, 100, 50, 1, 50, 200);
sliderRectangleVert.enableValueDisplay();
sliderRectangleVert.setThumbShape("rectangle");
sliderRectangleVert.setVertical();
sliderRectangleVert.x = 1050;
sliderRectangleVert.y = 350;

let myText = new Text("Dreieckige Buttons können gut für Abläufe eingesetzt werden 🔔", 'Arial', 36, 0x444444, 'left')


`,
        },
      ],
    }
  ],
};
