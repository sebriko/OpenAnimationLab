const projectTemplates = {
  categories: [
    {
      name: "General",
      description:
        "The 16:9 format has proven to be the best in many contexts. Note: Animations are optimally scaled regardless of the originally set pixel values.",
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
        "Basic geometric shapes like rectangles, circles and polygons. Complete animations can be composed from these elements.",
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
        "You can interact with animations through these elements. Note: These elements are always in the foreground.",
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

// Add heading
paramTable.setTitle("System Parameters");

// Dezimaltrennzeichen auf Komma setzen
paramTable.setDecimalSeparator(",");

// Wertbegrenzungen setzen
paramTable.setValueLimits("Geschwindigkeit", 0, 100);
paramTable.setValueLimits("Temperatur", -50, 150);

// Event listener for changes
paramTable.onChange(function(event) {
    console.log("Parameter changed:", event.parameterName, "->", event.newValue);
});

// Change value programmatically
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
let amplitude = 150;  // Height of the curve
let frequency = 0.01; // Frequency of waves
let centerY = 360;    // Center line (half board height)
let startX = 50;
let endX = 1230;

// Calculate points for the sine curve
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

// Stage dimensions
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

// Visual elements for the points
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

// Add drag functionality
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

// Center for both arrows
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

// Toggle button for Long Arc
let longArcButton = new Button("Langer Bogen: AUS", 180, 40, 0x3498db);
longArcButton.x = 50;
longArcButton.y = 140;

// Status variable for Long Arc
let isLongArc = false;

// Toggle function for Long Arc
function toggleLongArc() {
    isLongArc = !isLongArc;
    angleLabel.setLongArc(isLongArc);
    longArcButton.setText(isLongArc ? "Langer Bogen: AN" : "Langer Bogen: AUS");
    longArcButton.setBackgroundColor(isLongArc ? 0x27ae60 : 0x3498db);
}
longArcButton.onClick(toggleLongArc);

// Update function for dynamic angle change
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
let centerX2 = 150;  // New X position for the second arrow pair
let centerY2 = 450;  // New Y position for the second arrow pair

let arrow3 = new Arrow(centerX2, centerY2, centerX2 + 150, centerY2, 0xff5555, 3, 20, 10);
// Pfeil 2: vertikal nach oben (90 Grad)
let arrow4 = new Arrow(centerX2, centerY2, centerX2, centerY2 - 150, 0x5555ff, 3, 20, 10);

// Create the AngleLabel with a point for the 90-degree angle
const angleLabel2 = new AngleLabel(
    centerX2, centerY2,           // Scheitelpunkt (neue Position)
    centerX2 + 150, centerY2,     // Ende Pfeil 1
    centerX2, centerY2 - 150,     // Ende Pfeil 2
    60,                           // Radius
    "•",                          // Punkt als Markierung
    "Arial",                      // Schriftart
    36,                           // Font size
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

// Event handler for start point
function onStartDrag() {
    updateLine();
}

// Event handler for end point
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
// Start point for both vectors
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

// Note: SVG is usually more suitable. With PNGs, there is the problem that the total code becomes too large for AI processing.

let myPNG = new SimplePNG("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABECAIAAADGJao+AAAAwklEQVR4Xu3UgQbDMBRA0bc03f//b7N0VuqJEmwoc+KqNEkDh9b+2HuJu1KNO4f+AQCAAAAQAAACAEAAAAgAAAEAIAAABACAAAAQAAACAEAAAAgAAAEAIAAAANReamRLlPWYfNH0klxcPs+cP3NxWF+vi3lb7pa2R+vx6tHOtuN1O+a5lY3HzgM5ya/GM5N7ZjfPq7/5yS8IgAAAEAAAAgBAAAAIAAABACAAAAQAgAAAEAAAAgBAAAAIAAABACAAAIw322gDIPvtlmUAAAAASUVORK5CYII=");

myPNG.x = 400;
myPNG.y = 300;`,
        },
      ],
    },
    {
      name: "Tips",
      description: "Useful techniques and best practices.",
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
    // Value 0-100 is mapped to board width 50-1230 (with margin for the ball)
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

// Create the original elements
let myCircle = new Circle(100, 0x33ccff); 
myCircle.x = 640;
myCircle.y = 360;
myCircle.setBorder(0x333333, 1);

let myRect = new Rectangle(200, 150, 0x99ff99);
myRect.x = 240;
myRect.y = 110;
myRect.setBorder(0x333333, 1);

// Inner group for the elements (this will be scaled)
let innerGroup = new Group();
innerGroup.addChild(myCircle);
innerGroup.addChild(myRect);

// Outer group for the mask
let myGroup = new Group();
myGroup.addChild(innerGroup);
myGroup.setMask(260, 130, 350, 250);

// The window (remains unchanged)
let myWindow = new Rectangle(350, 250);
myWindow.x = 260;
myWindow.y = 130;
myWindow.setBorder(0x333333, 1);

// Timer for the zoom animation
let myTimer = new Timer(2000);
// Scaling from 1.0 to 1.5 (50% enlargement)
myTimer.addAnimation(innerGroup, "scale", 1.0, 1.5);
myTimer.setEasing("ease-in-out");


let myButton = new Button("Start", 100, 30, "Arial", 20);
myButton.x = 700;
myButton.y = 300;

myButton.onClick(function() {myTimer.start();})`,
        },
        {
          image: "rotation-point.png",
          title: "Change Rotation Points",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);

// The following example shows how to move the rotation point of an object. By default, this point is at 0,0, i.e. the top-left corner of the object

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

let myText = new Text("Triangular buttons can be used well for processes 🔔", 'Arial', 36, 0x444444, 'left')


`,
        },
      ],
    },
    {
      name: "Projects",
      description:
        "Complete example projects from physics and technology. These templates show complex interactions and visualizations.",
      templates: [
        {
          image: "airfoil.png",
          title: "Forces on Airfoil",
          code: `// Created with Open Animation Lab

// ==================== ABSCHNITT 1: VARIABLEN ====================
let board = new Board(1280, 720, 0xE8E8E8);

// Positions- und Dimensionsvariablen
let diagrammPositionX = 1000;
let diagrammPositionY = 550;

// Data points for curves
let auftriebsPunkte = [
  [-100, 100],
  [0, -120],
  [100, -200],
  [200, -160]
];

let widerstandsPunkte = [
  [-100, -50],
  [0, -20],
  [100, -30],
  [200, -60]
];

let polarPunkte = [];

// Arrays for interactive elements
let auftriebsKreise = [];
let widerstandsKreise = [];
let polarKreise = [];
let polarLabels = [];
let alleWolken = [];
let labelTexte = ["-10°", "0°", "10°", "20°"];

// Physikalische Parameter
let geschwindigkeitKmh = 150;  // km/h aus der Tabelle
let masse = 750;  // kg aus der Tabelle (Gewicht)
let luftdichte = 1.225;  // kg/m³ (Standardatmosphäre auf Meereshöhe)
let fluegelflaeche = 15;  // m² (estimated for small aircraft)

// Umrechnungen und abgeleitete Werte
let geschwindigkeitMs = geschwindigkeitKmh / 3.6;  // m/s
let staudruck = 0.5 * luftdichte * geschwindigkeitMs * geschwindigkeitMs;  // Pa

// Movement parameters for animation
let geschwindigkeitX = 0;  // Relative velocity change (start at 0)
let geschwindigkeitY = 0;
let aktuelleAuftriebskraft = 0;
let aktuelleWiderstandskraft = 0;
let zeitSchritt = 0.016;
let zeigtPolardiagramm = false;

// Animation und FPS-Tracking
let letzteZeit = Date.now();
let bildZaehler = 0;
let letzteFPSAktualisierung = Date.now();
let aktuelleFPS = 60;
let debugZaehler = 0;

// Variable for parameter table (will be filled later)
let paramTable;

// ==================== ABSCHNITT 2: OBJEKTE ====================

// Hintergrund
let himmel = new Rectangle(1280, 720, 0xAAD4FF);
himmel.x = 0;
himmel.y = 0;

let hintergrundGruppe = new Group();
hintergrundGruppe.addChild(himmel);

// Wolken
let wolke1 = new SimpleSVG(\`<svg viewBox="0 0 210 297"><ellipse cx="36.03" cy="19.16" rx="28.07" ry="13.47" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="52.91" cy="17.83" rx="14.98" ry="6.45" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="70.93" cy="22.95" rx="7.97" ry="4.36" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="20.1" cy="9.86" rx="13.65" ry="6.45" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="58.41" cy="25.22" rx="11.38" ry="3.98" fill="#fff" stroke="#fff" stroke-width=".26"/><ellipse cx="24.09" cy="27.31" rx="21.43" ry="6.45" fill="#fff" stroke="#fff" stroke-width=".26"/></svg>\`);
wolke1.setScale(3.5, 3.5);
wolke1.x = -150;
wolke1.y = 100;

let wolke2 = new SimpleSVG(\`<svg viewBox="0 0 43.13 15.82"><g transform="translate(-29.833 -211.523)" fill="#fff" stroke="#fff" stroke-width=".26"><ellipse cx="44.57" cy="218.48" rx="14.6" ry="6.83"/><ellipse cx="55.76" cy="223.98" rx="17.07" ry="3.22"/></g></svg>\`);
wolke2.setScale(3.5, 3.5);
wolke2.x = 640;
wolke2.y = 300;

let wolke3 = new SimpleSVG(\`<svg viewBox="0 0 67.4 22.64"><g transform="translate(-67.385 -165.626)" fill="#fff" stroke="#fff" stroke-width=".26"><ellipse cx="104.69" cy="174.1" rx="26.55" ry="8.35"/><ellipse cx="85.91" cy="174.67" rx="15.36" ry="5.88"/><ellipse cx="116.26" cy="179.98" rx="18.4" ry="3.22"/><ellipse cx="92.17" cy="180.36" rx="24.66" ry="7.78"/></g></svg>\`);
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

let flugzeug = new SimpleSVG(\`<svg xml:space="preserve" viewBox="0 0 102.05 19.93"><path d="M.583 10.804C.314 7.948-.675 4.83.76 2.438 1.616 1.013 3.035.039 5.112 0c4.75-.018 6.155 5.326 7.67 9.2l28.547-.896s2.363-5.512 16.766-5.928c14.404-.416 17.228 5.872 17.228 5.872s25.643.37 26.698 5.977c1.054 5.607-26.699 5.442-26.699 5.442s-22.854.605-34.256-.004c-12.522-.669-37.406-4-37.406-4-2.277-.86-2.78-1.701-3.077-4.859z" fill="#b3b3b3"/></svg>\`);
flugzeug.x = 300;
flugzeug.y = 300;
flugzeug.setScale(5.5, 5.5);
flugzeug.setAlpha(0.5);
flugzeug.setRotationPoint(320, 100);

let tragflaeche = new SimpleSVG(\`<svg xml:space="preserve" viewBox="0 0 99.46 12.48"><path d="M0 12.31S43.099-1.579 70.855.148C91.309 1.421 99.44 4.895 99.463 8.264c.036 5.133-25.212 4.142-25.212 4.142z" fill="#666"/></svg>\`);
tragflaeche.x = 470;
tragflaeche.y = 350;
tragflaeche.setScale(2.5, 2.5);
tragflaeche.setAlpha(0.5);

let horizontale = new Line(400, 370, 800, 370, 0x555555, 2);
horizontale.x = 0;
horizontale.y = 0;

let horizontale2 = new Line(400, 370, 800, 370, 0x555555, 2);
horizontale2.x = 0;
horizontale2.y = 0;

flugzeugGruppe.addChild(flugzeug);
flugzeugGruppe.addChild(tragflaeche);
flugzeugGruppe.addChild(horizontale2);
flugzeugGruppe.setRotationPoint(630, 370);
flugzeugGruppe.x = 0;
flugzeugGruppe.y = 0;

// Diagramm-Kurven
berechnePolarPunkte();

let auftriebsKurve = new SplinePath(auftriebsPunkte, 0x2233ff, 2);
auftriebsKurve.x = diagrammPositionX;
auftriebsKurve.y = diagrammPositionY;

let widerstandsKurve = new SplinePath(widerstandsPunkte, 0xff3300, 2);
widerstandsKurve.x = diagrammPositionX;
widerstandsKurve.y = diagrammPositionY;

let polarKurve = new SplinePath(polarPunkte, 0x006600, 2);
polarKurve.x = diagrammPositionX;
polarKurve.y = diagrammPositionY;
polarKurve.visible = false;

// Koordinatensystem und Achsenbeschriftungen
let koordinatenSystem = new CoordinateSystem(150, 250, 250, 150, 0x444444, 20, 9, 1);
koordinatenSystem.x = diagrammPositionX;
koordinatenSystem.y = diagrammPositionY;

let achseBeschriftungRechts = new Ruler("right", [5,10,15,20], 50, 50, 0x444444, 1, 10, 21, 0x444444, true, 0, "");
achseBeschriftungRechts.x = diagrammPositionX;
achseBeschriftungRechts.y = diagrammPositionY;

let polarBeschriftungRechts = new Ruler("right", [0.2,0.4], 90, 90, 0x444444, 1, 10, 21, 0x444444, true, 1, ",");
polarBeschriftungRechts.x = diagrammPositionX;
polarBeschriftungRechts.y = diagrammPositionY;
polarBeschriftungRechts.visible = false;

let achseBeschriftungLinks = new Ruler("left", [-5,-10], 50, 50, 0x444444, 1, 10, 21, 0x444444, true, 0, "");
achseBeschriftungLinks.x = diagrammPositionX;
achseBeschriftungLinks.y = diagrammPositionY;

let polarBeschriftungLinks = new Ruler("left", [0.2], 90, 90, 0x444444, 1, 10, 21, 0x444444, true, 1, ",");
polarBeschriftungLinks.x = diagrammPositionX;
polarBeschriftungLinks.y = diagrammPositionY;
polarBeschriftungLinks.visible = false;

let achseBeschriftungUnten = new Ruler("bottom", [-0.5], 90, 90, 0x444444, 1, 10, 21, 0x444444, true, 1, ",");
achseBeschriftungUnten.x = diagrammPositionX;
achseBeschriftungUnten.y = diagrammPositionY;

let achseBeschriftungOben = new Ruler("top", [0.5,1], 90, 90, 0x444444, 1, 10, 21, 0x444444, true, 1, ",");
achseBeschriftungOben.x = diagrammPositionX;
achseBeschriftungOben.y = diagrammPositionY;

// Axis labels for normal diagram
let caAchseBeschriftung = new Text("C<sub>a</sub>", 'Arial', 22, 0x2233ff, 'center');
caAchseBeschriftung.x = diagrammPositionX - 50;
caAchseBeschriftung.y = diagrammPositionY - 270;

let cwAchseBeschriftung = new Text("C<sub>w</sub>", 'Arial', 22, 0xff3300, 'center');
cwAchseBeschriftung.x = diagrammPositionX - 50;
cwAchseBeschriftung.y = diagrammPositionY - 250;

// NEW: Degree labels for X-axis
let gradBeschriftung = new Text("Winkel", 'Arial', 22, 0x444444, 'center');
gradBeschriftung.x = diagrammPositionX + 160;
gradBeschriftung.y = diagrammPositionY + 30;

// Axis labels for polar diagram
let caPolarBeschriftung = new Text("C<sub>a</sub>", 'Arial', 22, 0x006600, 'center');
caPolarBeschriftung.x = diagrammPositionX - 50;
caPolarBeschriftung.y = diagrammPositionY - 250;
caPolarBeschriftung.visible = false;

let cwPolarBeschriftung = new Text("C<sub>w</sub>", 'Arial', 22, 0x006600, 'center');
cwPolarBeschriftung.x = diagrammPositionX + 210;
cwPolarBeschriftung.y = diagrammPositionY + 10;
cwPolarBeschriftung.visible = false;

// Create interactive circles for lift curve
for (let i = 0; i < 4; i++) {
  let kreis = new Circle(8, 0x2233ff);
  kreis.x = diagrammPositionX + auftriebsPunkte[i][0];
  kreis.y = diagrammPositionY + auftriebsPunkte[i][1];
  kreis.setBorder(0x333333, 1);
  kreis.setDragging(
    diagrammPositionX + auftriebsPunkte[i][0], 
    diagrammPositionY - 200, 
    diagrammPositionX + auftriebsPunkte[i][0], 
    diagrammPositionY + 200
  );
  auftriebsKreise.push(kreis);
}

// Create interactive circles for drag curve
for (let i = 0; i < 4; i++) {
  let kreis = new Circle(8, 0xff3300);
  kreis.x = diagrammPositionX + widerstandsPunkte[i][0];
  kreis.y = diagrammPositionY + widerstandsPunkte[i][1];
  kreis.setBorder(0x333333, 1);
  kreis.setDragging(
    diagrammPositionX + widerstandsPunkte[i][0], 
    diagrammPositionY - 200, 
    diagrammPositionX + widerstandsPunkte[i][0], 
    diagrammPositionY + 200
  );
  widerstandsKreise.push(kreis);
}

// Create circles for polar diagram
for (let i = 0; i < polarPunkte.length; i++) {
  let kreis = new Circle(8, 0x006600);
  kreis.x = diagrammPositionX + polarPunkte[i][0];
  kreis.y = diagrammPositionY + polarPunkte[i][1];
  kreis.setBorder(0x333333, 1);
  kreis.visible = false;
  polarKreise.push(kreis);
}

// Create PointLabels for polar diagram points
for (let i = 0; i < 4; i++) {
  let offsetX = -30 + (i / 3) * 30;  // von -30 bis 0
  let offsetY = 0 - (i / 3) * 30;    // von 0 bis -40

  let label = new PointLabel(
    diagrammPositionX + polarPunkte[i][0], 
    diagrammPositionY + polarPunkte[i][1], 
    labelTexte[i], 
    offsetX, 
    offsetY
  );
  label.setFontSize(16);
  label.visible = false;  // Initial ausblenden!
  polarLabels.push(label);
}

// UI-Elemente
let winkelRegler = new ButtonSlider(-10, 20, 0, 0.1, 50, 200, "");
winkelRegler.enableValueDisplay((value, str) => str.replace(".", ","));
winkelRegler.x = 950;
winkelRegler.y = 50;

let winkelBeschriftung = new Text("Anstellwinkel α", 'Arial', 20, 0x444444, 'left');
winkelBeschriftung.x = 950;
winkelBeschriftung.y = 20;

// Kraft-Pfeile
let auftriebsPfeil = new Arrow(0, 0, 0, -200, 0x2233ff, 2, 26, 12);
auftriebsPfeil.x = 630;
auftriebsPfeil.y = 370;

let widerstandsPfeil = new Arrow(0, 0, -50, 0, 0xff3300, 2, 26, 12);
widerstandsPfeil.x = 630;
widerstandsPfeil.y = 370;

let resultierendePfeil = new Arrow(0, 0, -50, -200, 0x006600, 2, 30, 15);
resultierendePfeil.x = 630;
resultierendePfeil.y = 370;

let vektorRechteck = new Rectangle(50, 200, 0x006600);
vektorRechteck.x = 630;
vektorRechteck.y = 370;
vektorRechteck.setAlpha(0.2);

const angle = new AngleLabel(630, 370, 630-30, 370, 630+50, 370-50, 100, "α", "Arial", 20, 0x444444, 1, 0x444444);

// Kraft-Labels
const auftriebsLabel = new LineLabel(630, 370, 630, 170, "F<sub>a</sub>", 20);
auftriebsLabel.setFontSize(20);
auftriebsLabel.setTextColor(0x444444);
auftriebsLabel.setFlipSide(true);

const widerstandsLabel = new LineLabel(630, 370, 580, 370, "F<sub>w</sub>", 20);
widerstandsLabel.setFontSize(20);
widerstandsLabel.setTextColor(0x444444);
widerstandsLabel.setFlipSide(true);

const resultierendeLabel = new LineLabel(630, 370, 580, 170, "F<sub>res</sub>", 20);
resultierendeLabel.setFontSize(20);
resultierendeLabel.setTextColor(0x444444);
resultierendeLabel.setFlipSide(false);

// Checkbox
let polardiagrammCheckbox = new Checkbox(false, 20, "Polardiagramm", "Arial", 20);
polardiagrammCheckbox.x = 1000;
polardiagrammCheckbox.y = 200;

// Animations-Timer
let animationsTimer = new Timer();
animationsTimer.start();

// Tabelle erstellen
paramTable = new ParameterTable([    
  { name: "Geschwindigkeit [km/h] (100 – 1000)", value: 150 },    
  { name: "Anstellwinkel (-10 – 20)", value: 0 },    
  { name: "Gewicht [kg] (100 – 3000)", value: 750 }], 
   400, 'Arial', 14, 0x333333);

// Position setzen
paramTable.x = 20;
paramTable.y = 540;

// Add heading
paramTable.setTitle("System Parameters");

// Dezimaltrennzeichen auf Komma setzen
paramTable.setDecimalSeparator(",");

// Wertbegrenzungen setzen
paramTable.setValueLimits("Geschwindigkeit [km/h] (100 – 1000)", 100, 1000);
paramTable.setValueLimits("Anstellwinkel (-10 – 20)", -10, 20);
paramTable.setValueLimits("Gewicht [kg] (100 – 3000)", 100, 3000);

// Initiale Werte setzen
paramTable.setValue("Geschwindigkeit [km/h] (100 – 1000)", geschwindigkeitKmh);
paramTable.setValue("Gewicht [kg] (100 – 3000)", masse);

// ==================== ABSCHNITT 3: FUNKTIONEN ====================

function berechnePolarPunkte() {
  polarPunkte = [];
  for (let i = 0; i < widerstandsPunkte.length && i < auftriebsPunkte.length; i++) {
    polarPunkte.push([
      -widerstandsPunkte[i][1] * 5/2,
      auftriebsPunkte[i][1]
    ]);
  }
}

function aktualisierePolarKurve() {
  berechnePolarPunkte();
  polarKurve.setPoints(polarPunkte);
  aktualisierePolarKreise();
  aktualisierePolarLabels();
}

function aktualisierePolarKreise() {
  for (let i = 0; i < polarKreise.length && i < polarPunkte.length; i++) {
    polarKreise[i].x = diagrammPositionX + polarPunkte[i][0];
    polarKreise[i].y = diagrammPositionY + polarPunkte[i][1];
  }
}

function aktualisierePolarLabels() {
  for (let i = 0; i < polarLabels.length && i < polarPunkte.length; i++) {
    polarLabels[i].setPoint(
      diagrammPositionX + polarPunkte[i][0], 
      diagrammPositionY + polarPunkte[i][1]
    );
  }
}

function aktualisiereWinkel(e) {
  let winkel = winkelRegler.value;
  flugzeugGruppe.rotation = -winkel;
  
  // Synchronisiere mit Parametertabelle (nur wenn sie existiert)
  if (paramTable) {
    paramTable.setValue("Anstellwinkel (-10 – 20)", winkel);
  }
  
  if (!zeigtPolardiagramm) {
    auftriebsKurve.markAt(winkel*10, 0x333333, 5);
    auftriebsKurve.showGuideLines(winkel*10, 0x333333, 2);
    widerstandsKurve.markAt(winkel*10, 0x333333, 5);
    widerstandsKurve.showGuideLines(winkel*10, 0x333333, 2);
  } else {
    // For polar diagram: Determine Y values from both curves
    let auftriebsY = auftriebsKurve.getY(winkel*10);
    let widerstandsY = widerstandsKurve.getY(winkel*10);
    
    // Markiere den Punkt im Polardiagramm
    polarKurve.markAtXY(-widerstandsY * 5/2, auftriebsY, 0x333333, 5);
    polarKurve.showGuideLinesAtXY(-widerstandsY * 5/2, auftriebsY, 0x333333, 2);
  }
  
  // Beiwerte aus den Kurven ablesen
  let auftriebsBeiwert = -auftriebsKurve.getY(winkel*10) / 100;  // Normierung auf ca. 0-2
  let widerstandsBeiwert = -widerstandsKurve.getY(winkel*10) / 100;  // Normierung auf ca. 0-0.5
  
  // Physikalisch korrekte Kraftberechnung: F = 0.5 * ρ * v² * A * C
  aktuelleAuftriebskraft = staudruck * fluegelflaeche * auftriebsBeiwert;  // Newton
  aktuelleWiderstandskraft = staudruck * fluegelflaeche * widerstandsBeiwert;  // Newton
  
  // Arrow representation (scaled for display)
  let skalierungsFaktor = 0.01;  // Scaling for visual representation
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
  let winkelRad = winkel * Math.PI / 180;
  let armLaenge = 100;
  angle.setArm2(630 + armLaenge * Math.cos(winkelRad), 370 - armLaenge * Math.sin(winkelRad));
  
  aktualisierePolarKreise();
  aktualisierePolarLabels();
}

function aktualisierePhysik() {
  // Aktualisiere Geschwindigkeit und Staudruck
  geschwindigkeitMs = geschwindigkeitKmh / 3.6;
  staudruck = 0.5 * luftdichte * geschwindigkeitMs * geschwindigkeitMs;
  
  // Update forces with new values
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

// Drag handler for lift circles
function erstelleAuftriebsDragHandler(index) {
  return function() {
    auftriebsPunkte[index] = [auftriebsKreise[index].x - diagrammPositionX, auftriebsKreise[index].y - diagrammPositionY];
    auftriebsKurve.setPoints(auftriebsPunkte);
    aktualisierePolarKurve();
    aktualisiereWinkel();
  };
}

// Drag handler for drag circles
function erstelleWiderstandsDragHandler(index) {
  return function() {
    widerstandsPunkte[index] = [widerstandsKreise[index].x - diagrammPositionX, widerstandsKreise[index].y - diagrammPositionY];
    widerstandsKurve.setPoints(widerstandsPunkte);
    aktualisierePolarKurve();
    aktualisiereWinkel();
  };
}

// Polardiagramm-Checkbox Handler
function polardiagrammCheckboxHandler(event) { 
  zeigtPolardiagramm = event.value;
  console.log("Checkbox Status:", event.value);
  
  if (zeigtPolardiagramm) {
    polarKurve.visible = true;
    
    for (let kreis of polarKreise) {
      kreis.visible = true;
    }
    
    // Zeige die Polar-Labels
    for (let label of polarLabels) {
      label.visible = true;
    }
    
    polarBeschriftungRechts.visible = true;
    polarBeschriftungLinks.visible = true;
    
    auftriebsKurve.visible = false;
    widerstandsKurve.visible = false;
    
    for (let kreis of auftriebsKreise) {
      kreis.visible = false;
    }
    
    for (let kreis of widerstandsKreise) {
      kreis.visible = false;
    }
    
    achseBeschriftungRechts.visible = false;
    achseBeschriftungLinks.visible = false;
    
    // Achsenbeschriftungen umschalten
    caAchseBeschriftung.visible = false;
    cwAchseBeschriftung.visible = false;
    gradBeschriftung.visible = false;  // NEU: Grad ausblenden
    caPolarBeschriftung.visible = true;
    cwPolarBeschriftung.visible = true;
    
  } else {
    polarKurve.visible = false;
    
    for (let kreis of polarKreise) {
      kreis.visible = false;
    }
    
    // Verstecke die Polar-Labels
    for (let label of polarLabels) {
     label.visible = false;
    }
    
    polarBeschriftungRechts.visible = false;
    polarBeschriftungLinks.visible = false;
    
    auftriebsKurve.visible = true;
    widerstandsKurve.visible = true;
    
    for (let kreis of auftriebsKreise) {
      kreis.visible = true;
    }
    
    for (let kreis of widerstandsKreise) {
      kreis.visible = true;
    }
    
    achseBeschriftungRechts.visible = true;
    achseBeschriftungLinks.visible = true;
    
    // Achsenbeschriftungen umschalten
    caAchseBeschriftung.visible = true;
    cwAchseBeschriftung.visible = true;
    gradBeschriftung.visible = true;  // NEU: Grad einblenden
    caPolarBeschriftung.visible = false;
    cwPolarBeschriftung.visible = false;
  }
  
  aktualisiereWinkel();
}

// Animationsupdate-Handler
function animationsUpdateHandler(fortschritt) {
  let aktuelleZeit = Date.now();
  let deltaZeit = (aktuelleZeit - letzteZeit) / 1000;
  letzteZeit = aktuelleZeit;
  
  deltaZeit = Math.min(deltaZeit, 0.033);
  
  // Physikalisch korrekte Beschleunigung: a = F / m
  let beschleunigungX = -aktuelleWiderstandskraft / masse;  // m/s²
  let beschleunigungY = aktuelleAuftriebskraft / masse - 9.81;  // m/s² (mit Gravitation)
  
  // Integration of acceleration for velocity change
  let animationsSkalierung = 0.5;
  geschwindigkeitX += beschleunigungX * deltaZeit * animationsSkalierung;
  geschwindigkeitY += beschleunigungY * deltaZeit * animationsSkalierung;
  
  // Limit velocity change
  let maxGeschwindigkeitsAenderung = 10;
  geschwindigkeitX = Math.max(-maxGeschwindigkeitsAenderung, Math.min(maxGeschwindigkeitsAenderung, geschwindigkeitX));
  geschwindigkeitY = Math.max(-maxGeschwindigkeitsAenderung, Math.min(maxGeschwindigkeitsAenderung, geschwindigkeitY));
  
  // WICHTIG: Basis-Fluggeschwindigkeit wird jetzt dynamisch aus geschwindigkeitKmh berechnet
  // Scaling factor adjusted for better visibility of velocity differences
  let geschwindigkeitsSkalierung = 1.0;  // Adjustable for visual representation
  let basisGeschwindigkeitPixel = geschwindigkeitKmh * geschwindigkeitsSkalierung;
  
  for (let i = 0; i < alleWolken.length; i++) {
    let wolke = alleWolken[i];
    // Clouds must move LEFT (negative) for forward movement of aircraft
    wolke.x -= (basisGeschwindigkeitPixel - geschwindigkeitX * 60) * deltaZeit;
    wolke.y += geschwindigkeitY * deltaZeit * 25;  // Increased from 10 to 25 for stronger lift effect
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

// Parameter-Tabellen-Handler
function parameterTabelleHandler(event) {
    console.log("Parameter changed:", event.parameterName, "->", event.newValue);
    
    if (event.parameterName === "Gewicht [kg] (100 – 3000)") {
        masse = event.newValue;
        aktualisierePhysik();
    } else if (event.parameterName === "Geschwindigkeit [km/h] (100 – 1000)") {
        geschwindigkeitKmh = event.newValue;
        aktualisierePhysik();
    } else if (event.parameterName === "Anstellwinkel (-10 – 20)") {
        winkelRegler.setValue(event.newValue);
    }
}

// ==================== ABSCHNITT 4: EVENTLISTENER ====================

// Add angle slider onChange handler
winkelRegler.onChange(aktualisiereWinkel);

// Drag handler for lift circles setzen
for (let i = 0; i < auftriebsKreise.length; i++) {
  auftriebsKreise[i].onDrag(erstelleAuftriebsDragHandler(i));
}

// Drag handler for drag circles setzen
for (let i = 0; i < widerstandsKreise.length; i++) {
  widerstandsKreise[i].onDrag(erstelleWiderstandsDragHandler(i));
}

// Polardiagramm-Checkbox onClick Handler
polardiagrammCheckbox.onClick(polardiagrammCheckboxHandler);

// Animations-Timer onUpdate Handler
animationsTimer.onUpdate(animationsUpdateHandler);

// Event listener for parameter table
paramTable.onChange(parameterTabelleHandler);

// Initialer Aufruf von aktualisiereWinkel nach Erstellung der Tabelle
aktualisiereWinkel();


`,
        },
        {
          image: "refraction-law.png",
          title: "Brechnungsgesetz",
          code: `// Created with Open Animation Lab
		  
// ===== ABSCHNITT 1: BOARD UND VARIABLEN =====
let board = new Board(1280, 720);

// Konstanten
const STAGE_WIDTH = 1280;
const STAGE_HEIGHT = 720;
const CENTER_X = STAGE_WIDTH / 2;
const CENTER_Y = STAGE_HEIGHT / 2;
const ANGLE_RADIUS = 60;

// Arrays for dynamically created elements
let kontrollKreise = [];
let kontrollLinien = [];
let grenzflaechenKurvenpunkte = [];

// Winkel-Labels
let einfallswinkelLabel = null;
let brechungswinkelLabel = null;
let reflexionswinkelLabel = null;

// Interface points definition
let grenzflaechenPunkte = [
    [-5, CENTER_Y, 350, CENTER_Y + 70],
    [STAGE_WIDTH + 5, CENTER_Y, STAGE_WIDTH - 350, CENTER_Y + 70],
    [STAGE_WIDTH + 2, STAGE_HEIGHT],
    [-5, STAGE_HEIGHT],
    [-5, CENTER_Y]
];

// ===== ABSCHNITT 2: OBJEKTE =====

// UI-Elemente
let brechungsindexStepper = new NumericStepper(1, 1, 10, 0.1, 100, "Arial", 20, ",");
brechungsindexStepper.x = 1130;
brechungsindexStepper.y = 50;

let brechungsindexText = new Text("Brechungsindex n<sub>2</sub>", 'Arial', 22, 0x444444, 'right');
brechungsindexText.x = 880;
brechungsindexText.y = 39;

// Taschenlampe
let taschenlampe = new SimpleSVG(\`<svg width="26" height="75" viewBox="37 10 26 75" xmlns="http://www.w3.org/2000/svg">
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
</svg>\`);
taschenlampe.setRotationPoint(14, 3);
taschenlampe.x = 80 - 13;
taschenlampe.y = 40;
taschenlampe.setDragging(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

// Lichtstrahlen
let lichtstrahl = new Line(80, 40, STAGE_WIDTH - 20, STAGE_HEIGHT - 20, 0xFF6600, 3);
lichtstrahl.x = 0;
lichtstrahl.y = 0;

let gebrochenerStrahl = new Line(CENTER_X, CENTER_Y, CENTER_X + 100, CENTER_Y + 100, 0xFF6600, 3);
gebrochenerStrahl.visible = false;
gebrochenerStrahl.setAlpha(0.9);

let reflektierterStrahl = new Line(CENTER_X, CENTER_Y, CENTER_X - 100, CENTER_Y - 100, 0xFF6600, 3);
reflektierterStrahl.visible = false;
reflektierterStrahl.setAlpha(0.9);

// Interface
let grenzflaeche = new LinePath([[0, 0]], 0x0066ff, 3);
grenzflaeche.setFillColor(0xE6F2FF);
grenzflaeche.setAlpha(0.5);

// Normale
let normaleLinie = new Line(CENTER_X, CENTER_Y, CENTER_X + 100, CENTER_Y, 0x444444, 2);
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
            endY: dy > 0 ? STAGE_HEIGHT : 0
        };
    }
    
    if (Math.abs(dy) < 0.001) {
        return {
            endX: dx > 0 ? STAGE_WIDTH : 0,
            endY: start.y
        };
    }
    
    const steigung = dy / dx;
    const achsenabschnitt = start.y - steigung * start.x;
    
    let endpunkte = [];
    
    if (dx > 0) {
        const yRechts = steigung * STAGE_WIDTH + achsenabschnitt;
        if (yRechts >= 0 && yRechts <= STAGE_HEIGHT) {
            endpunkte.push({x: STAGE_WIDTH, y: yRechts});
        }
    }
    
    if (dx < 0) {
        const yLinks = achsenabschnitt;
        if (yLinks >= 0 && yLinks <= STAGE_HEIGHT) {
            endpunkte.push({x: 0, y: yLinks});
        }
    }
    
    if (dy > 0) {
        const xUnten = (STAGE_HEIGHT - achsenabschnitt) / steigung;
        if (xUnten >= 0 && xUnten <= STAGE_WIDTH) {
            endpunkte.push({x: xUnten, y: STAGE_HEIGHT});
        }
    }
    
    if (dy < 0) {
        const xOben = -achsenabschnitt / steigung;
        if (xOben >= 0 && xOben <= STAGE_WIDTH) {
            endpunkte.push({x: xOben, y: 0});
        }
    }
    
    if (endpunkte.length > 0) {
        return {
            endX: endpunkte[0].x,
            endY: endpunkte[0].y
        };
    }
    
    return {
        endX: punkt.x,
        endY: punkt.y
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
    const a = (2 * (p0.y - p1.y) + xSpanne * (steigungStart + steigungEnde)) / (xSpanne * xSpanne * xSpanne);
    const b = (3 * (p1.y - p0.y) - xSpanne * (2 * steigungStart + steigungEnde)) / (xSpanne * xSpanne);
    const c = steigungStart;
    const d = p0.y;
    
    return {
        a: a,
        b: b,
        c: c,
        d: d,
        x0: p0.x,
        evaluate: function(x) {
            const t = x - this.x0;
            return this.a * t * t * t + this.b * t * t + this.c * t + this.d;
        },
        derivative: function(x) {
            const t = x - this.x0;
            return 3 * this.a * t * t + 2 * this.b * t + this.c;
        }
    };
}

function berechneSchnittpunkt(cubic, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    if (Math.abs(dx) < 0.0001) {
        const x = lineStart.x;
        const y = cubic.evaluate(x);
        const minY = Math.min(lineStart.y, lineEnd.y);
        const maxY = Math.max(lineStart.y, lineEnd.y);
        if (y >= minY && y <= maxY && x >= cubic.x0 && x <= grenzflaechenPunkte[1][0]) {
            return [{x: x, y: y}];
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
        maxX
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
                schnittpunkte.push({x: x, y: y});
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
            endY: STAGE_HEIGHT
        };
    } else {
        normaleSteigung = -1 / kurvenSteigung;
    }
    
    let punkte = [];
    
    const y1 = schnittpunkt.y + normaleSteigung * (0 - schnittpunkt.x);
    if (y1 >= 0 && y1 <= STAGE_HEIGHT) {
        punkte.push({x: 0, y: y1});
    }
    
    const y2 = schnittpunkt.y + normaleSteigung * (STAGE_WIDTH - schnittpunkt.x);
    if (y2 >= 0 && y2 <= STAGE_HEIGHT) {
        punkte.push({x: STAGE_WIDTH, y: y2});
    }
    
    if (Math.abs(normaleSteigung) > 0.0001) {
        const x1 = schnittpunkt.x + (0 - schnittpunkt.y) / normaleSteigung;
        if (x1 >= 0 && x1 <= STAGE_WIDTH) {
            punkte.push({x: x1, y: 0});
        }
    }
    
    if (Math.abs(normaleSteigung) > 0.0001) {
        const x2 = schnittpunkt.x + (STAGE_HEIGHT - schnittpunkt.y) / normaleSteigung;
        if (x2 >= 0 && x2 <= STAGE_WIDTH) {
            punkte.push({x: x2, y: STAGE_HEIGHT});
        }
    }
    
    if (punkte.length >= 2) {
        return {
            steigung: normaleSteigung,
            startX: punkte[0].x,
            startY: punkte[0].y,
            endX: punkte[1].x,
            endY: punkte[1].y
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
        y: dy1 / einfallsLaenge
    };
    
    let normalenVektor = {x: 0, y: 0};
    
    if (normale.steigung === Infinity) {
        normalenVektor.x = 0;
        normalenVektor.y = 1;
    } else {
        const tangentenSteigung = -1 / normale.steigung;
        
        const tangentLength = Math.sqrt(1 + tangentenSteigung * tangentenSteigung);
        const tangent = {
            x: 1 / tangentLength,
            y: tangentenSteigung / tangentLength
        };
        
        normalenVektor.x = -tangent.y;
        normalenVektor.y = tangent.x;
        
        if (normalenVektor.y > 0) {
            normalenVektor.x = -normalenVektor.x;
            normalenVektor.y = -normalenVektor.y;
        }
    }
    
    const dotProduct = einfallsVektor.x * normalenVektor.x + einfallsVektor.y * normalenVektor.y;
    
    const reflexionsVektor = {
        x: einfallsVektor.x - 2 * dotProduct * normalenVektor.x,
        y: einfallsVektor.y - 2 * dotProduct * normalenVektor.y
    };
    
    let endpunkte = [];
    
    if (reflexionsVektor.x > 0) {
        const tRechts = (STAGE_WIDTH - schnittpunkt.x) / reflexionsVektor.x;
        const yRechts = schnittpunkt.y + reflexionsVektor.y * tRechts;
        if (yRechts >= 0 && yRechts <= STAGE_HEIGHT && tRechts > 0) {
            endpunkte.push({x: STAGE_WIDTH, y: yRechts});
        }
    }
    
    if (reflexionsVektor.x < 0) {
        const tLinks = (0 - schnittpunkt.x) / reflexionsVektor.x;
        const yLinks = schnittpunkt.y + reflexionsVektor.y * tLinks;
        if (yLinks >= 0 && yLinks <= STAGE_HEIGHT && tLinks > 0) {
            endpunkte.push({x: 0, y: yLinks});
        }
    }
    
    if (reflexionsVektor.y > 0) {
        const tUnten = (STAGE_HEIGHT - schnittpunkt.y) / reflexionsVektor.y;
        const xUnten = schnittpunkt.x + reflexionsVektor.x * tUnten;
        if (xUnten >= 0 && xUnten <= STAGE_WIDTH && tUnten > 0) {
            endpunkte.push({x: xUnten, y: STAGE_HEIGHT});
        }
    }
    
    if (reflexionsVektor.y < 0) {
        const tOben = (0 - schnittpunkt.y) / reflexionsVektor.y;
        const xOben = schnittpunkt.x + reflexionsVektor.x * tOben;
        if (xOben >= 0 && xOben <= STAGE_WIDTH && tOben > 0) {
            endpunkte.push({x: xOben, y: 0});
        }
    }
    
    if (endpunkte.length > 0) {
        return {
            startX: schnittpunkt.x,
            startY: schnittpunkt.y,
            endX: endpunkte[0].x,
            endY: endpunkte[0].y
        };
    }
    
    return null;
}

function berechneGebrochenStrahl(schnittpunkt, einfallsStrahl, normale, n1, n2) {
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
                endpunkte.push({x: STAGE_WIDTH, y: yRechts});
            }
        }
        
        if (richtungX < 0) {
            const tLinks = (0 - schnittpunkt.x) / richtungX;
            const yLinks = schnittpunkt.y + richtungY * tLinks;
            if (yLinks >= 0 && yLinks <= STAGE_HEIGHT && tLinks > 0) {
                endpunkte.push({x: 0, y: yLinks});
            }
        }
        
        if (richtungY > 0) {
            const tUnten = (STAGE_HEIGHT - schnittpunkt.y) / richtungY;
            const xUnten = schnittpunkt.x + richtungX * tUnten;
            if (xUnten >= 0 && xUnten <= STAGE_WIDTH && tUnten > 0) {
                endpunkte.push({x: xUnten, y: STAGE_HEIGHT});
            }
        }
        
        if (richtungY < 0) {
            const tOben = (0 - schnittpunkt.y) / richtungY;
            const xOben = schnittpunkt.x + richtungX * tOben;
            if (xOben >= 0 && xOben <= STAGE_WIDTH && tOben > 0) {
                endpunkte.push({x: xOben, y: 0});
            }
        }
        
        if (endpunkte.length > 0) {
            return {
                startX: schnittpunkt.x,
                startY: schnittpunkt.y,
                endX: endpunkte[0].x,
                endY: endpunkte[0].y
            };
        }
        return null;
    }
    
    const dx1 = einfallsStrahl.endX - einfallsStrahl.startX;
    const dy1 = einfallsStrahl.endY - einfallsStrahl.startY;
    
    const einfallsLaenge = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const incident = {
        x: dx1 / einfallsLaenge,
        y: dy1 / einfallsLaenge
    };
    
    let normalRichtung = {x: 0, y: 0};
    
    if (normale.steigung === Infinity) {
        normalRichtung.x = 1;
        normalRichtung.y = 0;
    } else {
        const tangentenSteigung = -1 / normale.steigung;
        
        const tangentLength = Math.sqrt(1 + tangentenSteigung * tangentenSteigung);
        const tangent = {
            x: 1 / tangentLength,
            y: tangentenSteigung / tangentLength
        };
        
        const normal1 = {x: -tangent.y, y: tangent.x};
        const normal2 = {x: tangent.y, y: -tangent.x};
        
        if (normal1.y > 0) {
            normalRichtung = normal1;
        } else {
            normalRichtung = normal2;
        }
    }
    
    const dotProduct = incident.x * normalRichtung.x + incident.y * normalRichtung.y;
    
    if (dotProduct > 0) {
        normalRichtung.x = -normalRichtung.x;
        normalRichtung.y = -normalRichtung.y;
    }
    
    const cosTheta1 = -(incident.x * normalRichtung.x + incident.y * normalRichtung.y);
    
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
        y: eta * incident.y + (eta * c - cosTheta2) * normalRichtung.y
    };
    
    let endpunkte = [];
    
    if (refracted.x > 0) {
        const tRechts = (STAGE_WIDTH - schnittpunkt.x) / refracted.x;
        const yRechts = schnittpunkt.y + refracted.y * tRechts;
        if (yRechts >= 0 && yRechts <= STAGE_HEIGHT && tRechts > 0) {
            endpunkte.push({x: STAGE_WIDTH, y: yRechts});
        }
    }
    
    if (refracted.x < 0) {
        const tLinks = (0 - schnittpunkt.x) / refracted.x;
        const yLinks = schnittpunkt.y + refracted.y * tLinks;
        if (yLinks >= 0 && yLinks <= STAGE_HEIGHT && tLinks > 0) {
            endpunkte.push({x: 0, y: yLinks});
        }
    }
    
    if (refracted.y > 0) {
        const tUnten = (STAGE_HEIGHT - schnittpunkt.y) / refracted.y;
        const xUnten = schnittpunkt.x + refracted.x * tUnten;
        if (xUnten >= 0 && xUnten <= STAGE_WIDTH && tUnten > 0) {
            endpunkte.push({x: xUnten, y: STAGE_HEIGHT});
        }
    }
    
    if (refracted.y < 0) {
        const tOben = (0 - schnittpunkt.y) / refracted.y;
        const xOben = schnittpunkt.x + refracted.x * tOben;
        if (xOben >= 0 && xOben <= STAGE_WIDTH && tOben > 0) {
            endpunkte.push({x: xOben, y: 0});
        }
    }
    
    if (endpunkte.length > 0) {
        return {
            startX: schnittpunkt.x,
            startY: schnittpunkt.y,
            endX: endpunkte[0].x,
            endY: endpunkte[0].y
        };
    }
    
    return null;
}

function aktualisiereEinfallsWinkelLabel(schnittpunkt, normale, einfallsStrahl) {
    if (!schnittpunkt || !normale || !einfallsStrahl) {
        if (einfallswinkelLabel) {
            einfallswinkelLabel.visible = false;
        }
        return;
    }
    
    let normalenVektor = {x: 0, y: 0};
    
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
    const einfallsLaenge = Math.sqrt(einfallsDx * einfallsDx + einfallsDy * einfallsDy);
    
    const einfallsVektor = {
        x: (einfallsDx / einfallsLaenge) * ANGLE_RADIUS,
        y: (einfallsDy / einfallsLaenge) * ANGLE_RADIUS
    };
    
    const arm1X = schnittpunkt.x + normalenVektor.x;
    const arm1Y = schnittpunkt.y + normalenVektor.y;
    const arm2X = schnittpunkt.x + einfallsVektor.x;
    const arm2Y = schnittpunkt.y + einfallsVektor.y;
    
    if (!einfallswinkelLabel) {
        einfallswinkelLabel = new AngleLabel(
            schnittpunkt.x, schnittpunkt.y,
            arm1X, arm1Y,
            arm2X, arm2Y,
            ANGLE_RADIUS,
            "α",
            "Arial", 18,
            0x444444,
            2,
            0x444444
        );
    } else {
        einfallswinkelLabel.setCenter(schnittpunkt.x, schnittpunkt.y);
        einfallswinkelLabel.setArm1(arm1X, arm1Y);
        einfallswinkelLabel.setArm2(arm2X, arm2Y);
        einfallswinkelLabel.visible = true;
    }
}

function aktualisiereBrechungsWinkelLabel(schnittpunkt, normale, gebrochenStrahl) {
    if (!schnittpunkt || !normale || !gebrochenStrahl) {
        if (brechungswinkelLabel) {
            brechungswinkelLabel.visible = false;
        }
        return;
    }
    
    let normalenVektor = {x: 0, y: 0};
    
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
    const gebrochenLaenge = Math.sqrt(gebrochenDx * gebrochenDx + gebrochenDy * gebrochenDy);
    
    const gebrochenVektor = {
        x: (gebrochenDx / gebrochenLaenge) * ANGLE_RADIUS,
        y: (gebrochenDy / gebrochenLaenge) * ANGLE_RADIUS
    };
    
    const arm1X = schnittpunkt.x + normalenVektor.x;
    const arm1Y = schnittpunkt.y + normalenVektor.y;
    const arm2X = schnittpunkt.x + gebrochenVektor.x;
    const arm2Y = schnittpunkt.y + gebrochenVektor.y;
    
    if (!brechungswinkelLabel) {
        brechungswinkelLabel = new AngleLabel(
            schnittpunkt.x, schnittpunkt.y,
            arm1X, arm1Y,
            arm2X, arm2Y,
            ANGLE_RADIUS,
            "β",
            "Arial", 18,
            0x444444,
            2,
            0x444444
        );
    } else {
        brechungswinkelLabel.setCenter(schnittpunkt.x, schnittpunkt.y);
        brechungswinkelLabel.setArm1(arm1X, arm1Y);
        brechungswinkelLabel.setArm2(arm2X, arm2Y);
        brechungswinkelLabel.visible = true;
    }
}

function aktualisiereReflexionsWinkelLabel(schnittpunkt, normale, reflektierterStrahl) {
    if (!schnittpunkt || !normale || !reflektierterStrahl) {
        if (reflexionswinkelLabel) {
            reflexionswinkelLabel.visible = false;
        }
        return;
    }
    
    let normalenVektor = {x: 0, y: 0};
    
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
    const reflektiertLaenge = Math.sqrt(reflektiertDx * reflektiertDx + reflektiertDy * reflektiertDy);
    
    const reflektiertVektor = {
        x: (reflektiertDx / reflektiertLaenge) * ANGLE_RADIUS,
        y: (reflektiertDy / reflektiertLaenge) * ANGLE_RADIUS
    };
    
    const arm1X = schnittpunkt.x + normalenVektor.x;
    const arm1Y = schnittpunkt.y + normalenVektor.y;
    const arm2X = schnittpunkt.x + reflektiertVektor.x;
    const arm2Y = schnittpunkt.y + reflektiertVektor.y;
    
    if (!reflexionswinkelLabel) {
        reflexionswinkelLabel = new AngleLabel(
            schnittpunkt.x, schnittpunkt.y,
            arm1X, arm1Y,
            arm2X, arm2Y,
            ANGLE_RADIUS,
            "α'",
            "Arial", 18,
            0x444444,
            2,
            0x444444
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
        
        const letzterPunkt = grenzflaechenKurvenpunkte[grenzflaechenKurvenpunkte.length - 1];
        grenzflaechenKurvenpunkte.push([letzterPunkt[0], 10000]);
        grenzflaechenKurvenpunkte.push([ersterPunkt[0], 10000]);
    }
    
    if (grenzflaeche && grenzflaechenKurvenpunkte.length > 0) {
        grenzflaeche.setPoints(grenzflaechenKurvenpunkte);
    }
}

function aktualisiereBerechnung() {
    const p0 = {x: grenzflaechenPunkte[0][0], y: grenzflaechenPunkte[0][1]};
    const c0 = {x: grenzflaechenPunkte[0][2], y: grenzflaechenPunkte[0][3]};
    const p1 = {x: grenzflaechenPunkte[1][0], y: grenzflaechenPunkte[1][1]};
    const c1 = {x: grenzflaechenPunkte[1][2], y: grenzflaechenPunkte[1][3]};
    
    const cubic = berechneCubicFunction(p0, p1, c0, c1);
    
    zeichneGrenzflaeche(cubic);
    
    const lineStart = {x: taschenlampe.x + 13, y: taschenlampe.y};
    const lineEnd = berechneVerlaengerteLinie(lineStart, lichtstrahlEndpunkt);
    
    lichtstrahl.setStart(lineStart.x, lineStart.y);
    lichtstrahl.setEnd(lineEnd.endX, lineEnd.endY);
    
    const schnittpunkte = berechneSchnittpunkt(cubic, lineStart, lichtstrahlEndpunkt);
    
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
                endY: schnittpunkte[0].y
            };
            
            const n1 = 1;
            const n2 = brechungsindexStepper.value;
            
            const reflektierteDaten = berechneReflektiertenStrahl(
                schnittpunkte[0],
                einfallsStrahl,
                normale
            );
            
            if (reflektierteDaten) {
                reflektierterStrahl.setStart(reflektierteDaten.startX, reflektierteDaten.startY);
                reflektierterStrahl.setEnd(reflektierteDaten.endX, reflektierteDaten.endY);
                reflektierterStrahl.visible = true;
                
                aktualisiereEinfallsWinkelLabel(schnittpunkte[0], normale, einfallsStrahl);
                aktualisiereReflexionsWinkelLabel(schnittpunkte[0], normale, reflektierteDaten);
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
                n2
            );
            
            if (gebrochenStrahl) {
                gebrochenerStrahl.setStart(gebrochenStrahl.startX, gebrochenStrahl.startY);
                gebrochenerStrahl.setEnd(gebrochenStrahl.endX, gebrochenStrahl.endY);
                gebrochenerStrahl.visible = true;
                
                aktualisiereBrechungsWinkelLabel(schnittpunkte[0], normale, gebrochenStrahl);
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
            setTimeout(function() { extraKreis.remove(); }, 100);
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
    kontrollKreise.forEach(function(kreis) { if (kreis) kreis.remove(); });
    kontrollLinien.forEach(function(linie) { if (linie) linie.remove(); });
    
    kontrollKreise = [];
    kontrollLinien = [];
}

function erstelleKontrollpunkt(x, y, index) {
    let kreis = new Circle(12, 0x66CC66);
    kreis.x = x;
    kreis.y = y;
    kreis.setBorder(0x4A8B4A, 2);
    kreis.setDragging(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    
    kreis.onDrag(function() {
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


`,
        },
        {
          image: "gearbox.png",
          title: "Kurbelgetriebe",
          code: `// Created with Open Animation Lab

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
let maxKolbenX = mittelpunktX + radius + Math.sqrt(pleuellaengeEffektiv * pleuellaengeEffektiv);
let minKolbenX = mittelpunktX - radius + Math.sqrt(pleuellaengeEffektiv * pleuellaengeEffektiv);

// Points for the cylinder
let points = [
  [minKolbenX - kolbenhoehe/2, mittelpunktY - kolbenbreite/2],  
  [maxKolbenX + kolbenhoehe/2, mittelpunktY - kolbenbreite/2], 
  [maxKolbenX + kolbenhoehe/2, mittelpunktY + kolbenbreite/2],
  [minKolbenX - kolbenhoehe/2, mittelpunktY + kolbenbreite/2]
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
kurbel.setRotationPoint(kurbelbreite/2, kurbelbreite/2);
kurbel.setTransformationPoint(kurbelbreite/2, kurbelbreite/2);

// Kurbelachse
let kurbelachse = new Circle(achsenradius, 0xffffff); 
kurbelachse.x = mittelpunktX;
kurbelachse.y = mittelpunktY;
kurbelachse.setBorder(0x333333, 1);

// Kolben
let kolben = new Rectangle(kolbenbreite, kolbenhoehe, 0xE099D7);
kolben.setBorder(0x333333, 1);
kolben.setRoundedCorners(10); 
kolben.setRotationPoint(kolbenbreite/2, kolbenhoehe/2);
kolben.setTransformationPoint(kolbenbreite/2, kolbenhoehe/2);
kolben.rotation = 90;

// Pleuel
let pleuel = new Rectangle(pleuellaenge, 30, 0x00ff99);
pleuel.setBorder(0x333333, 1);
pleuel.setRoundedCorners(10);
pleuel.setRotationPoint(pleuelbreite/2, pleuelbreite/2);
pleuel.setTransformationPoint(pleuelbreite/2, pleuelbreite/2);

// Pleuelachse
let pleuelachse = new Circle(achsenradius, 0xffffff); 
pleuelachse.x = mittelpunktX;
pleuelachse.y = mittelpunktY;
pleuelachse.setBorder(0x333333, 1);

// Kolbenachse
let kolbenachse = new Circle(achsenradius, 0xffffff); 
kolbenachse.setBorder(0x333333, 1);

// UI Elemente
let labelAngleSlider = new Text("Winkel", 'Arial', 20, 0x444444, 'left');
labelAngleSlider.x = 950;
labelAngleSlider.y = 20;

let angleSlider = new ButtonSlider(0, 360, 0, 1, 50, 200);
angleSlider.enableValueDisplay();
angleSlider.setThumbShape("triangle-A");
angleSlider.x = 950;
angleSlider.y = 50;

let labelRadiusSlider = new Text("Radius", 'Arial', 20, 0x444444, 'left');
labelRadiusSlider.x = 600;
labelRadiusSlider.y = 590;

let radiusSlider = new ButtonSlider(0, 300, radius, 1, 50, 200);
radiusSlider.enableValueDisplay();
radiusSlider.x = 600;
radiusSlider.y = 620;

let labelLengthSlider = new Text("Length Connecting Rod", 'Arial', 20, 0x444444, 'left');
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
  
  // Update crank - change width
  kurbel.setWidth(kurbellaenge);
  
  // Zylinder-Grenzen neu berechnen
  maxKolbenX = mittelpunktX + radius + Math.sqrt(pleuellaengeEffektiv * pleuellaengeEffektiv);
  minKolbenX = mittelpunktX - radius + Math.sqrt(pleuellaengeEffektiv * pleuellaengeEffektiv);
  
  // LinePath aktualisieren - neue Punkte setzen
  points = [
    [minKolbenX - kolbenhoehe/2, mittelpunktY - kolbenbreite/2],  
    [maxKolbenX + kolbenhoehe/2, mittelpunktY - kolbenbreite/2], 
    [maxKolbenX + kolbenhoehe/2, mittelpunktY + kolbenbreite/2],
    [minKolbenX - kolbenhoehe/2, mittelpunktY + kolbenbreite/2]
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
  maxKolbenX = mittelpunktX + radius + Math.sqrt(pleuellaengeEffektiv * pleuellaengeEffektiv);
  minKolbenX = mittelpunktX - radius + Math.sqrt(pleuellaengeEffektiv * pleuellaengeEffektiv);
  
  // LinePath aktualisieren - neue Punkte setzen
  points = [
    [minKolbenX - kolbenhoehe/2, mittelpunktY - kolbenbreite/2],  
    [maxKolbenX + kolbenhoehe/2, mittelpunktY - kolbenbreite/2], 
    [maxKolbenX + kolbenhoehe/2, mittelpunktY + kolbenbreite/2],
    [minKolbenX - kolbenhoehe/2, mittelpunktY + kolbenbreite/2]
  ];
  linePath.setPoints(points);
  
  // Zeichnung mit aktuellem Winkel aktualisieren
  draw(winkel);
}

function draw(newWinkel) {
  winkel = newWinkel;
  kurbel.rotation = winkel;
  
  // Convert angle to radians
  let winkelRad = winkel * Math.PI / 180;
  
  // Position des Kurbelendes berechnen (dort wo das Pleuel ansetzt)
  let kurbelEndeX = mittelpunktX + radius * Math.cos(winkelRad);
  let kurbelEndeY = mittelpunktY + radius * Math.sin(winkelRad);
  
  // Pleuel positionieren
  pleuel.x = kurbelEndeX;
  pleuel.y = kurbelEndeY;
  
  // Berechnung der Pleuelneigung
  // The connecting rod must be tilted so that the other end lies horizontally above the center axis
  // The Y position of the piston is fixed (horizontally above the center axis)
  let kolbenY = 360; // Mittelachse
  
  // Die X-Position des Kolbens berechnen wir mit dem Satz des Pythagoras
  // The connecting rod has a fixed length (pleuellaenge)
  let vertikalerAbstand = kolbenY - kurbelEndeY;
  let horizontalerAbstand = Math.sqrt(pleuellaengeEffektiv * pleuellaengeEffektiv - vertikalerAbstand * vertikalerAbstand);
  let kolbenX = kurbelEndeX + horizontalerAbstand;
  
  // Pleuelwinkel berechnen
  let pleuelWinkel = Math.atan2(kolbenY - kurbelEndeY, kolbenX - kurbelEndeX) * 180 / Math.PI;
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


`,
        },

        {
          image: "wind-turbine.png",
          title: "Forces on Rotor",
          code: `// Created with Open Animation Lab

// ===== ABSCHNITT 1: BOARD UND VARIABLEN =====

let board = new Board(1280, 720);

// Konstanten und globale Variablen
let centerX = 640;
let centerY = 360;
let radius = 150;
let arrowLength = 100; // Length of gravitational arrows
let tangentialArrowLength = 80; // Length of tangential arrows (slightly shorter)
let centrifugalArrowLength = 90; // Length of centrifugal force arrows (fixed)
let isAnimating = false;

// UI-Variablen
let checkboxStartX = 970;
let checkboxStartY = 100;
let checkboxSpacing = 50;

// ===== ABSCHNITT 2: OBJEKTE =====

// Hintergrund
let himmel = new Rectangle(1280, 720, 0xAAD4FF);
himmel.x = 0;
himmel.y = 0;

// SVG-Elemente
let mySVG = new SimpleSVG(\`<svg xml:space="preserve" viewBox="0 0 432.79 46.67"><path d="M.358 46.326h432.087v-14.71S181.467 21.504 123.549.36C73.905 10.471.896 28.32.896 28.32z" fill="#fff" stroke="#000" stroke-width=".69"/></svg>\`);
mySVG.setTransformationPoint(0, 35)
mySVG.setRotationPoint(0, 35)

let mySVG2 = new SimpleSVG(\`<svg xml:space="preserve" viewBox="0 0 432.79 46.67"><path d="M.358 46.326h432.087v-14.71S181.467 21.504 123.549.36C73.905 10.471.896 28.32.896 28.32z" fill="#fff" stroke="#000" stroke-width=".69"/></svg>\`);
mySVG2.setTransformationPoint(0, 35)
mySVG2.setRotationPoint(0, 35)
mySVG2.rotation = 120;

let mySVG3 = new SimpleSVG(\`<svg xml:space="preserve" viewBox="0 0 432.79 46.67"><path d="M.358 46.326h432.087v-14.71S181.467 21.504 123.549.36C73.905 10.471.896 28.32.896 28.32z" fill="#fff" stroke="#000" stroke-width=".69"/></svg>\`);
mySVG3.setTransformationPoint(0, 35)
mySVG3.setRotationPoint(0, 35)
mySVG3.rotation = -120;

// Zentraler Kreis
let myCircle = new Circle(30, 0xffffff); 
myCircle.x = 0;
myCircle.y = 0;
myCircle.setBorder(0x333333, 1);

// Group for rotating elements
let myGroup = new Group();
myGroup.addChild(mySVG);
myGroup.addChild(mySVG2);
myGroup.addChild(mySVG3);
myGroup.addChild(myCircle);
myGroup.rotation = 90;
myGroup.x = 640;
myGroup.y = 360;
myGroup.setRotationPoint(0, 0)
myGroup.setScale(0.75)

// UI-Elemente
let myButton = new Button("Start", 100, 30, "Arial", 20);
myButton.x = 1100;
myButton.y = 30;

let myTimer = new Timer(9000);  // Increased to 9000ms (3x slower)
myTimer.start();
myTimer.pause();

// Gravitationspfeile
let vectorGravitation1 = new Arrow(0, 0, 0, 0, 0x0000FF, 2, 26, 12);
vectorGravitation1.x = 0;
vectorGravitation1.y = 0;

let vectorGravitation2 = new Arrow(0, 0, 0, 0, 0x0000FF, 2, 26, 12);
vectorGravitation2.x = 0;
vectorGravitation2.y = 0;

let vectorGravitation3 = new Arrow(0, 0, 0, 0, 0x0000FF, 2, 26, 12);
vectorGravitation3.x = 0;
vectorGravitation3.y = 0;

// Tangentialpfeile
let vectorTangential1 = new Arrow(0, 0, 0, 0, 0x555555, 2, 26, 12);
vectorTangential1.x = 0;
vectorTangential1.y = 0;

let vectorTangential2 = new Arrow(0, 0, 0, 0, 0x555555, 2, 26, 12);
vectorTangential2.x = 0;
vectorTangential2.y = 0;

let vectorTangential3 = new Arrow(0, 0, 0, 0, 0x555555, 2, 26, 12);
vectorTangential3.x = 0;
vectorTangential3.y = 0;

// Fliehkraftpfeile
let vectorCentrifugal1 = new Arrow(0, 0, 0, 0, 0x8B008B, 2, 26, 12);
vectorCentrifugal1.x = 0;
vectorCentrifugal1.y = 0;
vectorCentrifugal1.visible = false; // Startwert: unsichtbar

let vectorCentrifugal2 = new Arrow(0, 0, 0, 0, 0x8B008B, 2, 26, 12);
vectorCentrifugal2.x = 0;
vectorCentrifugal2.y = 0;
vectorCentrifugal2.visible = false; // Startwert: unsichtbar

let vectorCentrifugal3 = new Arrow(0, 0, 0, 0, 0x8B008B, 2, 26, 12);
vectorCentrifugal3.x = 0;
vectorCentrifugal3.y = 0;
vectorCentrifugal3.visible = false; // Startwert: unsichtbar

// Parallelograms for FG + FU = FRes
let parallelogram1 = new Parallelogram(0, 0, 0, 0, 0, 0, 0x00AA00);
parallelogram1.setAlpha(0.3);
parallelogram1.visible = false; // Startwert: unsichtbar

let parallelogram2 = new Parallelogram(0, 0, 0, 0, 0, 0, 0x00AA00);
parallelogram2.setAlpha(0.3);
parallelogram2.visible = false; // Startwert: unsichtbar

let parallelogram3 = new Parallelogram(0, 0, 0, 0, 0, 0, 0x00AA00);
parallelogram3.setAlpha(0.3);
parallelogram3.visible = false; // Startwert: unsichtbar

// Resultierende Pfeile
let resultantArrow1 = new Arrow(0, 0, 0, 0, 0x00AA00, 2, 26, 12);
resultantArrow1.x = 0;
resultantArrow1.y = 0;
resultantArrow1.visible = false; // Startwert: unsichtbar

let resultantArrow2 = new Arrow(0, 0, 0, 0, 0x00AA00, 2, 26, 12);
resultantArrow2.x = 0;
resultantArrow2.y = 0;
resultantArrow2.visible = false; // Startwert: unsichtbar

let resultantArrow3 = new Arrow(0, 0, 0, 0, 0x00AA00, 2, 26, 12);
resultantArrow3.x = 0;
resultantArrow3.y = 0;
resultantArrow3.visible = false; // Startwert: unsichtbar

// Parallelograms for FRes + FF = FGes
let parallelogramTotal1 = new Parallelogram(0, 0, 0, 0, 0, 0, 0xFF6600);
parallelogramTotal1.setAlpha(0.3);
parallelogramTotal1.visible = false; // Startwert: unsichtbar

let parallelogramTotal2 = new Parallelogram(0, 0, 0, 0, 0, 0, 0xFF6600);
parallelogramTotal2.setAlpha(0.3);
parallelogramTotal2.visible = false; // Startwert: unsichtbar

let parallelogramTotal3 = new Parallelogram(0, 0, 0, 0, 0, 0, 0xFF6600);
parallelogramTotal3.setAlpha(0.3);
parallelogramTotal3.visible = false; // Startwert: unsichtbar

// Gesamtkraftpfeile
let totalForceArrow1 = new Arrow(0, 0, 0, 0, 0xFF6600, 2, 26, 12);
totalForceArrow1.x = 0;
totalForceArrow1.y = 0;
totalForceArrow1.visible = false; // Startwert: unsichtbar

let totalForceArrow2 = new Arrow(0, 0, 0, 0, 0xFF6600, 2, 26, 12);
totalForceArrow2.x = 0;
totalForceArrow2.y = 0;
totalForceArrow2.visible = false; // Startwert: unsichtbar

let totalForceArrow3 = new Arrow(0, 0, 0, 0, 0xFF6600, 2, 26, 12);
totalForceArrow3.x = 0;
totalForceArrow3.y = 0;
totalForceArrow3.visible = false; // Startwert: unsichtbar

// Antriebskraftpfeile (gelb)
let driveForceArrow1 = new Arrow(0, 0, 0, 0, 0xFFFF00, 2, 26, 12);
driveForceArrow1.x = 0;
driveForceArrow1.y = 0;
driveForceArrow1.visible = false; // Startwert: unsichtbar

let driveForceArrow2 = new Arrow(0, 0, 0, 0, 0xFFFF00, 2, 26, 12);
driveForceArrow2.x = 0;
driveForceArrow2.y = 0;
driveForceArrow2.visible = false; // Startwert: unsichtbar

let driveForceArrow3 = new Arrow(0, 0, 0, 0, 0xFFFF00, 2, 26, 12);
driveForceArrow3.x = 0;
driveForceArrow3.y = 0;
driveForceArrow3.visible = false; // Startwert: unsichtbar

// Gestrichelte Linien von FGes zu FAnt
let dashedLine1 = new Line(0, 0, 0, 0, 0x555555, 2);
dashedLine1.setStrokeDash([7, 7]);
dashedLine1.x = 0;
dashedLine1.y = 0;
dashedLine1.visible = false; // Startwert: unsichtbar

let dashedLine2 = new Line(0, 0, 0, 0, 0x555555, 2);
dashedLine2.setStrokeDash([7, 7]);
dashedLine2.x = 0;
dashedLine2.y = 0;
dashedLine2.visible = false; // Startwert: unsichtbar

let dashedLine3 = new Line(0, 0, 0, 0, 0x555555, 2);
dashedLine3.setStrokeDash([7, 7]);
dashedLine3.x = 0;
dashedLine3.y = 0;
dashedLine3.visible = false; // Startwert: unsichtbar

// Beschriftungen - Gravitationspfeile
let labelGravity1 = new LineLabel(0, 0, 0, 0, "F<sub>G</sub>", 20);
labelGravity1.setFontSize(20);

let labelGravity2 = new LineLabel(0, 0, 0, 0, "F<sub>G</sub>", 20);
labelGravity2.setFontSize(20);

let labelGravity3 = new LineLabel(0, 0, 0, 0, "F<sub>G</sub>", 20);
labelGravity3.setFontSize(20);

// Beschriftungen - Umfangskraft
let labelTangential1 = new LineLabel(0, 0, 0, 0, "F<sub>U</sub>", 20);
labelTangential1.setFontSize(20);

let labelTangential2 = new LineLabel(0, 0, 0, 0, "F<sub>U</sub>", 20);
labelTangential2.setFontSize(20);

let labelTangential3 = new LineLabel(0, 0, 0, 0, "F<sub>U</sub>", 20);
labelTangential3.setFontSize(20);

// Beschriftungen - Fliehkraft
let labelCentrifugal1 = new LineLabel(0, 0, 0, 0, "F<sub>F</sub>", 20);
labelCentrifugal1.setFontSize(20);
labelCentrifugal1.visible = false; // Startwert: unsichtbar

let labelCentrifugal2 = new LineLabel(0, 0, 0, 0, "F<sub>F</sub>", 20);
labelCentrifugal2.setFontSize(20);
labelCentrifugal2.visible = false; // Startwert: unsichtbar

let labelCentrifugal3 = new LineLabel(0, 0, 0, 0, "F<sub>F</sub>", 20);
labelCentrifugal3.setFontSize(20);
labelCentrifugal3.visible = false; // Startwert: unsichtbar

// Beschriftungen - Resultierende Kraft
let labelResultant1 = new LineLabel(0, 0, 0, 0, "F<sub>Res</sub>", 20);
labelResultant1.setFontSize(20);
labelResultant1.visible = false; // Startwert: unsichtbar

let labelResultant2 = new LineLabel(0, 0, 0, 0, "F<sub>Res</sub>", 20);
labelResultant2.setFontSize(20);
labelResultant2.visible = false; // Startwert: unsichtbar

let labelResultant3 = new LineLabel(0, 0, 0, 0, "F<sub>Res</sub>", 20);
labelResultant3.setFontSize(20);
labelResultant3.visible = false; // Startwert: unsichtbar

// Beschriftungen - Gesamtkraft
let labelTotal1 = new LineLabel(0, 0, 0, 0, "F<sub>Ges</sub>", 20);
labelTotal1.setFontSize(20);
labelTotal1.visible = false; // Startwert: unsichtbar

let labelTotal2 = new LineLabel(0, 0, 0, 0, "F<sub>Ges</sub>", 20);
labelTotal2.setFontSize(20);
labelTotal2.visible = false; // Startwert: unsichtbar

let labelTotal3 = new LineLabel(0, 0, 0, 0, "F<sub>Ges</sub>", 20);
labelTotal3.setFontSize(20);
labelTotal3.visible = false; // Startwert: unsichtbar

// Beschriftungen - Antriebskraft
let labelDrive1 = new LineLabel(0, 0, 0, 0, "F<sub>Ant</sub>", 20);
labelDrive1.setFontSize(20);
labelDrive1.visible = false; // Startwert: unsichtbar

let labelDrive2 = new LineLabel(0, 0, 0, 0, "F<sub>Ant</sub>", 20);
labelDrive2.setFontSize(20);
labelDrive2.visible = false; // Startwert: unsichtbar

let labelDrive3 = new LineLabel(0, 0, 0, 0, "F<sub>Ant</sub>", 20);
labelDrive3.setFontSize(20);
labelDrive3.visible = false; // Startwert: unsichtbar

// Checkboxes - only Gravity and Tangential are enabled by default
let checkboxGravity = new Checkbox(true, 20, "Gravitationskraft (F<sub>G</sub>)", "Arial", 20, 0x0000FF);
checkboxGravity.x = checkboxStartX;
checkboxGravity.y = checkboxStartY;

let checkboxTangential = new Checkbox(true, 20, "Umfangskraft (F<sub>U</sub>)", "Arial", 20, 0x555555);
checkboxTangential.x = checkboxStartX;
checkboxTangential.y = checkboxStartY + checkboxSpacing;

let checkboxCentrifugal = new Checkbox(false, 20, "Fliehkraft (F<sub>F</sub>)", "Arial", 20, 0x8B008B);
checkboxCentrifugal.x = checkboxStartX;
checkboxCentrifugal.y = checkboxStartY + checkboxSpacing * 2;

let checkboxResultant = new Checkbox(false, 20, "Resultierende Kraft (F<sub>Res</sub>)", "Arial", 20, 0x00AA00);
checkboxResultant.x = checkboxStartX;
checkboxResultant.y = checkboxStartY + checkboxSpacing * 3;

let checkboxTotal = new Checkbox(false, 20, "Gesamtkraft (F<sub>Ges</sub>)", "Arial", 16, 0xFF6600);
checkboxTotal.x = checkboxStartX;
checkboxTotal.y = checkboxStartY + checkboxSpacing * 4;

let checkboxDrive = new Checkbox(false, 20, "Antriebskraft (F<sub>Ant</sub>)", "Arial", 20, 0xFFFF00);
checkboxDrive.x = checkboxStartX;
checkboxDrive.y = checkboxStartY + checkboxSpacing * 5;

let checkboxParallelograms = new Checkbox(false, 20, "Parallelogramme", "Arial", 20, 0x444444);
checkboxParallelograms.x = checkboxStartX;
checkboxParallelograms.y = checkboxStartY + checkboxSpacing * 6;

let checkboxDashedLines = new Checkbox(false, 20, "Verbindungslinien", "Arial", 20, 0x555555);
checkboxDashedLines.x = checkboxStartX;
checkboxDashedLines.y = checkboxStartY + checkboxSpacing * 7;

// ===== ABSCHNITT 3: FUNKTIONEN =====

// Hilfsfunktionen für Pfeil-Berechnungen
function updateArrowPosition(arrow, angle, offset) {
    // Winkel in Radiant umrechnen (mit Offset)
    let radians = (angle + offset) * Math.PI / 180;
    
    // Startpunkt des Pfeils (rotiert um den Mittelpunkt)
    let startX = centerX + radius * Math.cos(radians);
    let startY = centerY + radius * Math.sin(radians);
    
    // Endpunkt zeigt IMMER senkrecht nach unten (90 Grad = π/2)
    let gravityRadians = Math.PI / 2; // Immer 90 Grad (nach unten)
    let endX = startX + arrowLength * Math.cos(gravityRadians);
    let endY = startY + arrowLength * Math.sin(gravityRadians);
    
    // Pfeil aktualisieren
    arrow.setStart(startX, startY);
    arrow.setEnd(endX, endY);
}

function updateTangentialArrowPosition(arrow, angle, offset) {
    // Winkel in Radiant umrechnen (mit Offset)
    let radians = (angle + offset) * Math.PI / 180;
    
    // Startpunkt des Pfeils (rotiert um den Mittelpunkt)
    let startX = centerX + radius * Math.cos(radians);
    let startY = centerY + radius * Math.sin(radians);
    
    // Endpunkt zeigt tangential zur Rotation (90 Grad zur radialen Richtung)
    let tangentialRadians = radians + (Math.PI / 2); // 90 Grad hinzufügen
    let endX = startX + tangentialArrowLength * Math.cos(tangentialRadians);
    let endY = startY + tangentialArrowLength * Math.sin(tangentialRadians);
    
    // Pfeil aktualisieren
    arrow.setStart(startX, startY);
    arrow.setEnd(endX, endY);
}

function updateCentrifugalArrowPosition(arrow, angle, offset) {
    // Winkel in Radiant umrechnen (mit Offset)
    let radians = (angle + offset) * Math.PI / 180;
    
    // Startpunkt des Pfeils (rotiert um den Mittelpunkt)
    let startX = centerX + radius * Math.cos(radians);
    let startY = centerY + radius * Math.sin(radians);
    
    // Endpunkt zeigt radial nach außen
    let endX = startX + centrifugalArrowLength * Math.cos(radians);
    let endY = startY + centrifugalArrowLength * Math.sin(radians);
    
    // Pfeil aktualisieren
    arrow.setStart(startX, startY);
    arrow.setEnd(endX, endY);
}

// Funktion für Antriebskraft (tangentiale Komponente der Gesamtkraft)
function updateDriveForceArrow(driveArrow, totalArrow, angle, offset) {
    // Winkel in Radiant umrechnen (mit Offset)
    let radians = (angle + offset) * Math.PI / 180;
    
    // Startpunkt (auf dem Kreis)
    let startX = centerX + radius * Math.cos(radians);
    let startY = centerY + radius * Math.sin(radians);
    
    // Gesamtkraftvektor
    let totalStartX = totalArrow.startX;
    let totalStartY = totalArrow.startY;
    let totalEndX = totalArrow.endX;
    let totalEndY = totalArrow.endY;
 
    
    // Gesamtkraftvektor relativ zum Startpunkt
    let totalVectorX = totalEndX - totalStartX;
    let totalVectorY = totalEndY - totalStartY;
    
    // Tangentiale Richtung (90 Grad zur radialen Richtung)
    let tangentialRadians = radians + (Math.PI / 2);
    let tangentialUnitX = Math.cos(tangentialRadians);
    let tangentialUnitY = Math.sin(tangentialRadians);
    
    // Projektion der Gesamtkraft auf die tangentiale Richtung
    let dotProduct = totalVectorX * tangentialUnitX + totalVectorY * tangentialUnitY;
    
    // Tangentiale Komponente
    let tangentialComponentX = dotProduct * tangentialUnitX;
    let tangentialComponentY = dotProduct * tangentialUnitY;
    
    // Endpunkt der Antriebskraft
    let endX = startX + tangentialComponentX;
    let endY = startY + tangentialComponentY;
    
    // Antriebskraftpfeil aktualisieren
    driveArrow.setStart(startX, startY);
    driveArrow.setEnd(endX, endY);
}

// Funktionen für Parallelogramme
function updateParallelogram(parallelogram, angle, offset) {
    // Winkel in Radiant umrechnen (mit Offset)
    let radians = (angle + offset) * Math.PI / 180;
    
    // Gemeinsamer Startpunkt (auf dem Kreis)
    let startX = centerX + radius * Math.cos(radians);
    let startY = centerY + radius * Math.sin(radians);
    
    // Gravitationsvektor - zeigt IMMER nach unten
    let gravityRadians = Math.PI / 2; // Immer 90 Grad (nach unten)
    let gravEndX = startX + arrowLength * Math.cos(gravityRadians);
    let gravEndY = startY + arrowLength * Math.sin(gravityRadians);
    
    // Tangentialvektor - Endpunkt in absoluten Koordinaten
    let tangentialRadians = radians + (Math.PI / 2);
    let tangEndX = startX + tangentialArrowLength * Math.cos(tangentialRadians);
    let tangEndY = startY + tangentialArrowLength * Math.sin(tangentialRadians);
    
    // Parallelogramm aktualisieren - mit absoluten Koordinaten
    parallelogram.setOrigin(startX, startY);
    parallelogram.setVector1(gravEndX, gravEndY);
    parallelogram.setVector2(tangEndX, tangEndY);
  
}

function updateResultantArrow(resultantArrow, parallelogram, angle, offset) {
    // Winkel in Radiant umrechnen (mit Offset)
    let radians = (angle + offset) * Math.PI / 180;
    
    // Startpunkt des resultierenden Pfeils
    let startX = centerX + radius * Math.cos(radians);
    let startY = centerY + radius * Math.sin(radians);
    
    // Endpunkt des resultierenden Pfeils vom Parallelogramm holen
    let resultantEndpoint = parallelogram.getResultantEndpoint();
    
    // Resultierenden Pfeil aktualisieren
    resultantArrow.setStart(startX, startY);
    resultantArrow.setEnd(resultantEndpoint.x, resultantEndpoint.y);
}

function updateTotalParallelogram(parallelogramTotal, parallelogramResultant, angle, offset) {
    // Winkel in Radiant umrechnen (mit Offset)
    let radians = (angle + offset) * Math.PI / 180;
    
    // Gemeinsamer Startpunkt (auf dem Kreis)
    let startX = centerX + radius * Math.cos(radians);
    let startY = centerY + radius * Math.sin(radians);
    
    // Endpunkt der resultierenden Kraft (FRes)
    let resultantEndpoint = parallelogramResultant.getResultantEndpoint();
    
    // Endpunkt der Fliehkraft (FF)
    let centrifugalEndX = startX + centrifugalArrowLength * Math.cos(radians);
    let centrifugalEndY = startY + centrifugalArrowLength * Math.sin(radians);
    
    // Parallelogramm für Gesamtkraft aktualisieren
    parallelogramTotal.setOrigin(startX, startY);
    parallelogramTotal.setVector1(resultantEndpoint.x, resultantEndpoint.y);
    parallelogramTotal.setVector2(centrifugalEndX, centrifugalEndY);
}

function updateTotalForceArrow(totalForceArrow, parallelogramTotal, angle, offset) {
    // Winkel in Radiant umrechnen (mit Offset)
    let radians = (angle + offset) * Math.PI / 180;
    
    // Startpunkt des Gesamtkraftpfeils
    let startX = centerX + radius * Math.cos(radians);
    let startY = centerY + radius * Math.sin(radians);
    
    // Endpunkt des Gesamtkraftpfeils vom Parallelogramm holen
    let totalEndpoint = parallelogramTotal.getResultantEndpoint();
    
    // Gesamtkraftpfeil aktualisieren
    totalForceArrow.setStart(startX, startY);
    totalForceArrow.setEnd(totalEndpoint.x, totalEndpoint.y);
}

// Neue Funktion für gestrichelte Linien
function updateDashedLine(dashedLine, totalArrow, driveArrow) {
    // Linie vom Ende der Gesamtkraft zum Ende der Antriebskraft
    dashedLine.setStart(totalArrow.endX, totalArrow.endY);
    dashedLine.setEnd(driveArrow.endX, driveArrow.endY);
}

// Funktionen für Beschriftungen
function updateGravityLabelPosition(label, angle, offset) {
    let radians = (angle + offset) * Math.PI / 180;
    let startX = centerX + radius * Math.cos(radians);
    let startY = centerY + radius * Math.sin(radians);
    let gravityRadians = Math.PI / 2;
    let endX = startX + arrowLength * Math.cos(gravityRadians);
    let endY = startY + arrowLength * Math.sin(gravityRadians);
    
    label.setStart(startX, startY);
    label.setEnd(endX, endY);
}

function updateTangentialLabelPosition(label, angle, offset) {
    let radians = (angle + offset) * Math.PI / 180;
    let startX = centerX + radius * Math.cos(radians);
    let startY = centerY + radius * Math.sin(radians);
    let tangentialRadians = radians + (Math.PI / 2);
    let endX = startX + tangentialArrowLength * Math.cos(tangentialRadians);
    let endY = startY + tangentialArrowLength * Math.sin(tangentialRadians);
    
    label.setStart(startX, startY);
    label.setEnd(endX, endY);
}

function updateCentrifugalLabelPosition(label, angle, offset) {
    let radians = (angle + offset) * Math.PI / 180;
    let startX = centerX + radius * Math.cos(radians);
    let startY = centerY + radius * Math.sin(radians);
    let endX = startX + centrifugalArrowLength * Math.cos(radians);
    let endY = startY + centrifugalArrowLength * Math.sin(radians);
    
    label.setStart(startX, startY);
    label.setEnd(endX, endY);
}

function updateResultantLabelPosition(label, parallelogram, angle, offset) {
    let radians = (angle + offset) * Math.PI / 180;
    let startX = centerX + radius * Math.cos(radians);
    let startY = centerY + radius * Math.sin(radians);
    let resultantEndpoint = parallelogram.getResultantEndpoint();
    
    label.setStart(startX, startY);
    label.setEnd(resultantEndpoint.x, resultantEndpoint.y);
}

function updateTotalLabelPosition(label, parallelogramTotal, angle, offset) {
    let radians = (angle + offset) * Math.PI / 180;
    let startX = centerX + radius * Math.cos(radians);
    let startY = centerY + radius * Math.sin(radians);
    let totalEndpoint = parallelogramTotal.getResultantEndpoint();
    
    label.setStart(startX, startY);
    label.setEnd(totalEndpoint.x, totalEndpoint.y);
}

function updateDriveLabelPosition(label, driveArrow, angle, offset) {
    label.setStart(driveArrow.startX, driveArrow.startY);
    label.setEnd(driveArrow.endX, driveArrow.endY);
}

function updateParallelogramVisibility() {
    // Check if parallelogram checkbox is active
    let parallelogramsEnabled = checkboxParallelograms.checked;
    
    // Parallelograms for FG + FU = FRes
    // Visible when: Parallelogram checkbox active AND all three forces (FG, FU and FRes) visible
    let gravityVisible = checkboxGravity.checked;
    let tangentialVisible = checkboxTangential.checked;
    let resultantVisible = checkboxResultant.checked;
    let resultantParallelogramsVisible = parallelogramsEnabled && gravityVisible && tangentialVisible && resultantVisible;
    
    parallelogram1.visible = resultantParallelogramsVisible;
    parallelogram2.visible = resultantParallelogramsVisible;
    parallelogram3.visible = resultantParallelogramsVisible;
    
    // Parallelograms for FRes + FF = FGes
    // Visible when: Parallelogram checkbox active AND all three forces (FRes, FF and FGes) visible
    let centrifugalVisible = checkboxCentrifugal.checked;
    let totalVisible = checkboxTotal.checked;
    let totalParallelogramsVisible = parallelogramsEnabled && resultantVisible && centrifugalVisible && totalVisible;
    
    parallelogramTotal1.visible = totalParallelogramsVisible;
    parallelogramTotal2.visible = totalParallelogramsVisible;
    parallelogramTotal3.visible = totalParallelogramsVisible;
}

// New function for line visibility
function updateDashedLinesVisibility() {
    // Lines are visible when: Checkbox active AND both forces (FGes and FAnt) visible
    let linesEnabled = checkboxDashedLines.checked;
    let totalVisible = checkboxTotal.checked;
    let driveVisible = checkboxDrive.checked;
    let linesVisible = linesEnabled && totalVisible && driveVisible;
    
    dashedLine1.visible = linesVisible;
    dashedLine2.visible = linesVisible;
    dashedLine3.visible = linesVisible;
}

// Initialisierungsfunktion
function initializePositions() {
    // Pfeile initialisieren
    updateArrowPosition(vectorGravitation1, 90, 0);
    updateArrowPosition(vectorGravitation2, 90, 120);
    updateArrowPosition(vectorGravitation3, 90, 240);

    updateTangentialArrowPosition(vectorTangential1, 90, 0);
    updateTangentialArrowPosition(vectorTangential2, 90, 120);
    updateTangentialArrowPosition(vectorTangential3, 90, 240);

    updateCentrifugalArrowPosition(vectorCentrifugal1, 90, 0);
    updateCentrifugalArrowPosition(vectorCentrifugal2, 90, 120);
    updateCentrifugalArrowPosition(vectorCentrifugal3, 90, 240);

    // Parallelogramme initialisieren
    updateParallelogram(parallelogram1, 90, 0);
    updateParallelogram(parallelogram2, 90, 120);
    updateParallelogram(parallelogram3, 90, 240);

    updateResultantArrow(resultantArrow1, parallelogram1, 90, 0);
    updateResultantArrow(resultantArrow2, parallelogram2, 90, 120);
    updateResultantArrow(resultantArrow3, parallelogram3, 90, 240);

    updateTotalParallelogram(parallelogramTotal1, parallelogram1, 90, 0);
    updateTotalParallelogram(parallelogramTotal2, parallelogram2, 90, 120);
    updateTotalParallelogram(parallelogramTotal3, parallelogram3, 90, 240);

    updateTotalForceArrow(totalForceArrow1, parallelogramTotal1, 90, 0);
    updateTotalForceArrow(totalForceArrow2, parallelogramTotal2, 90, 120);
    updateTotalForceArrow(totalForceArrow3, parallelogramTotal3, 90, 240);

    // Antriebskraft initialisieren
    updateDriveForceArrow(driveForceArrow1, totalForceArrow1, 90, 0);
    updateDriveForceArrow(driveForceArrow2, totalForceArrow2, 90, 120);
    updateDriveForceArrow(driveForceArrow3, totalForceArrow3, 90, 240);

    // Gestrichelte Linien initialisieren
    updateDashedLine(dashedLine1, totalForceArrow1, driveForceArrow1);
    updateDashedLine(dashedLine2, totalForceArrow2, driveForceArrow2);
    updateDashedLine(dashedLine3, totalForceArrow3, driveForceArrow3);

    // Beschriftungen initialisieren
    updateGravityLabelPosition(labelGravity1, 90, 0);
    updateGravityLabelPosition(labelGravity2, 90, 120);
    updateGravityLabelPosition(labelGravity3, 90, 240);

    updateTangentialLabelPosition(labelTangential1, 90, 0);
    updateTangentialLabelPosition(labelTangential2, 90, 120);
    updateTangentialLabelPosition(labelTangential3, 90, 240);

    updateCentrifugalLabelPosition(labelCentrifugal1, 90, 0);
    updateCentrifugalLabelPosition(labelCentrifugal2, 90, 120);
    updateCentrifugalLabelPosition(labelCentrifugal3, 90, 240);

    updateResultantLabelPosition(labelResultant1, parallelogram1, 90, 0);
    updateResultantLabelPosition(labelResultant2, parallelogram2, 90, 120);
    updateResultantLabelPosition(labelResultant3, parallelogram3, 90, 240);

    updateTotalLabelPosition(labelTotal1, parallelogramTotal1, 90, 0);
    updateTotalLabelPosition(labelTotal2, parallelogramTotal2, 90, 120);
    updateTotalLabelPosition(labelTotal3, parallelogramTotal3, 90, 240);

    updateDriveLabelPosition(labelDrive1, driveForceArrow1, 90, 0);
    updateDriveLabelPosition(labelDrive2, driveForceArrow2, 90, 120);
    updateDriveLabelPosition(labelDrive3, driveForceArrow3, 90, 240);
    
    // Parallelogramm-Sichtbarkeit initialisieren
    updateParallelogramVisibility();
    
    // Linien-Sichtbarkeit initialisieren
    updateDashedLinesVisibility();
}


function updateAnimation(progress) {
    // Die Gruppe um 360 Grad drehen
    myGroup.rotation = 90 + (progress * 360);
    
    // Aktueller Winkel
    let currentAngle = 90 + (progress * 360);
    
    // Alle Elemente aktualisieren
    updateArrowPosition(vectorGravitation1, currentAngle, 0);
    updateArrowPosition(vectorGravitation2, currentAngle, 120);
    updateArrowPosition(vectorGravitation3, currentAngle, 240);
    
    updateTangentialArrowPosition(vectorTangential1, currentAngle, 0);
    updateTangentialArrowPosition(vectorTangential2, currentAngle, 120);
    updateTangentialArrowPosition(vectorTangential3, currentAngle, 240);
    
    updateCentrifugalArrowPosition(vectorCentrifugal1, currentAngle, 0);
    updateCentrifugalArrowPosition(vectorCentrifugal2, currentAngle, 120);
    updateCentrifugalArrowPosition(vectorCentrifugal3, currentAngle, 240);
    
    updateParallelogram(parallelogram1, currentAngle, 0);
    updateParallelogram(parallelogram2, currentAngle, 120);
    updateParallelogram(parallelogram3, currentAngle, 240);
    
    updateResultantArrow(resultantArrow1, parallelogram1, currentAngle, 0);
    updateResultantArrow(resultantArrow2, parallelogram2, currentAngle, 120);
    updateResultantArrow(resultantArrow3, parallelogram3, currentAngle, 240);
    
    updateTotalParallelogram(parallelogramTotal1, parallelogram1, currentAngle, 0);
    updateTotalParallelogram(parallelogramTotal2, parallelogram2, currentAngle, 120);
    updateTotalParallelogram(parallelogramTotal3, parallelogram3, currentAngle, 240);
    
    updateTotalForceArrow(totalForceArrow1, parallelogramTotal1, currentAngle, 0);
    updateTotalForceArrow(totalForceArrow2, parallelogramTotal2, currentAngle, 120);
    updateTotalForceArrow(totalForceArrow3, parallelogramTotal3, currentAngle, 240);
    
    updateDriveForceArrow(driveForceArrow1, totalForceArrow1, currentAngle, 0);
    updateDriveForceArrow(driveForceArrow2, totalForceArrow2, currentAngle, 120);
    updateDriveForceArrow(driveForceArrow3, totalForceArrow3, currentAngle, 240);
    
    // Gestrichelte Linien aktualisieren
    updateDashedLine(dashedLine1, totalForceArrow1, driveForceArrow1);
    updateDashedLine(dashedLine2, totalForceArrow2, driveForceArrow2);
    updateDashedLine(dashedLine3, totalForceArrow3, driveForceArrow3);
    
    updateGravityLabelPosition(labelGravity1, currentAngle, 0);
    updateGravityLabelPosition(labelGravity2, currentAngle, 120);
    updateGravityLabelPosition(labelGravity3, currentAngle, 240);
    
    updateTangentialLabelPosition(labelTangential1, currentAngle, 0);
    updateTangentialLabelPosition(labelTangential2, currentAngle, 120);
    updateTangentialLabelPosition(labelTangential3, currentAngle, 240);
    
    updateCentrifugalLabelPosition(labelCentrifugal1, currentAngle, 0);
    updateCentrifugalLabelPosition(labelCentrifugal2, currentAngle, 120);
    updateCentrifugalLabelPosition(labelCentrifugal3, currentAngle, 240);
    
    updateResultantLabelPosition(labelResultant1, parallelogram1, currentAngle, 0);
    updateResultantLabelPosition(labelResultant2, parallelogram2, currentAngle, 120);
    updateResultantLabelPosition(labelResultant3, parallelogram3, currentAngle, 240);
    
    updateTotalLabelPosition(labelTotal1, parallelogramTotal1, currentAngle, 0);
    updateTotalLabelPosition(labelTotal2, parallelogramTotal2, currentAngle, 120);
    updateTotalLabelPosition(labelTotal3, parallelogramTotal3, currentAngle, 240);
    
    updateDriveLabelPosition(labelDrive1, driveForceArrow1, currentAngle, 0);
    updateDriveLabelPosition(labelDrive2, driveForceArrow2, currentAngle, 120);
    updateDriveLabelPosition(labelDrive3, driveForceArrow3, currentAngle, 240);
}

function completeAnimation() {
    // Rotation auf den Endwert setzen
    myGroup.rotation = 90;
    
    // All elements back to start position
    initializePositions();
    
    // Reset status
    isAnimating = false;
    myButton.setText("Start");
}

function handleButtonClick() {
    if (!isAnimating) {
        // Animation starten
        myTimer.reset();
        myTimer.start();
        isAnimating = true;
        myButton.setText("Pause");
    } else {
        // Animation pausieren oder fortsetzen
        if (myTimer.isPaused()) {
            myTimer.resume();
            myButton.setText("Start");
        } else {
            myTimer.pause();
            myButton.setText("Start");
        }
    }
}

function handleGravityCheckbox(event) {
    vectorGravitation1.visible = event.value;
    vectorGravitation2.visible = event.value;
    vectorGravitation3.visible = event.value;
    labelGravity1.visible = event.value;
    labelGravity2.visible = event.value;
    labelGravity3.visible = event.value;
    
    // Parallelogramm-Sichtbarkeit aktualisieren
    updateParallelogramVisibility();
}

function handleTangentialCheckbox(event) {
    vectorTangential1.visible = event.value;
    vectorTangential2.visible = event.value;
    vectorTangential3.visible = event.value;
    labelTangential1.visible = event.value;
    labelTangential2.visible = event.value;
    labelTangential3.visible = event.value;
    
    // Parallelogramm-Sichtbarkeit aktualisieren
    updateParallelogramVisibility();
}

function handleCentrifugalCheckbox(event) {
    vectorCentrifugal1.visible = event.value;
    vectorCentrifugal2.visible = event.value;
    vectorCentrifugal3.visible = event.value;
    labelCentrifugal1.visible = event.value;
    labelCentrifugal2.visible = event.value;
    labelCentrifugal3.visible = event.value;
    
    // Parallelogramm-Sichtbarkeit aktualisieren
    updateParallelogramVisibility();
}

function handleResultantCheckbox(event) {
    resultantArrow1.visible = event.value;
    resultantArrow2.visible = event.value;
    resultantArrow3.visible = event.value;
    labelResultant1.visible = event.value;
    labelResultant2.visible = event.value;
    labelResultant3.visible = event.value;
    
    // Parallelogramm-Sichtbarkeit aktualisieren
    updateParallelogramVisibility();
}

function handleTotalCheckbox(event) {
    totalForceArrow1.visible = event.value;
    totalForceArrow2.visible = event.value;
    totalForceArrow3.visible = event.value;
    labelTotal1.visible = event.value;
    labelTotal2.visible = event.value;
    labelTotal3.visible = event.value;
    
    // Linien-Sichtbarkeit aktualisieren
    updateDashedLinesVisibility();
}

function handleDriveCheckbox(event) {
    driveForceArrow1.visible = event.value;
    driveForceArrow2.visible = event.value;
    driveForceArrow3.visible = event.value;
    labelDrive1.visible = event.value;
    labelDrive2.visible = event.value;
    labelDrive3.visible = event.value;
    
    // Linien-Sichtbarkeit aktualisieren
    updateDashedLinesVisibility();
}

function handleParallelogramsCheckbox(event) {
    // Parallelogramm-Sichtbarkeit aktualisieren
    updateParallelogramVisibility();
}

function handleDashedLinesCheckbox(event) {
    // Linien-Sichtbarkeit aktualisieren
    updateDashedLinesVisibility();
}

// ===== ABSCHNITT 4: EVENT LISTENER =====

// Timer-Event-Listener
myTimer.onUpdate(updateAnimation);
myTimer.onComplete(completeAnimation);

// Button-Event-Listener
myButton.onClick(handleButtonClick);

// Checkbox-Event-Listener
checkboxGravity.onClick(handleGravityCheckbox);
checkboxTangential.onClick(handleTangentialCheckbox);
checkboxCentrifugal.onClick(handleCentrifugalCheckbox);
checkboxResultant.onClick(handleResultantCheckbox);
checkboxTotal.onClick(handleTotalCheckbox);
checkboxDrive.onClick(handleDriveCheckbox);
checkboxParallelograms.onClick(handleParallelogramsCheckbox);
checkboxDashedLines.onClick(handleDashedLinesCheckbox);

// ===== INITIALISIERUNG =====

// Alle Positionen initialisieren
initializePositions();

		
		
		



`,
        },
      ],
    },
  ],
};
