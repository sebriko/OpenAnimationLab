const projectTemplates = {
  categories: [
    {
      name: "General",
      description:
        "The 16:9 format has proven to be the best in many contexts. Note: Animations are optimally scaled regardless of the originally set pixel values.",
      templates: [
        {
          image: "blank.png",
          title: "Blank 16:9",
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
          title: "Smooth curve (SplinePath)",
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
          title: "Polyline (LinePath)",
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
          title: "Number field (NumericStepper)",
          code: `// Created with Open Animation Lab\n
let board = new Board(1280, 720);

let myStepper = new NumericStepper(50, 0, 100, 0.1, 100, "Arial", 20);
myStepper.x = 100;
myStepper.y = 100;`,
        },
        {
          image: "buttonSlider.png",
          title: "Slider (ButtonSlider)",
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
          title: "Value table (ParameterTable)",
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
          title: "Coordinate system (CoordinateSystem)",
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
          title: "Formula (MathForm)",
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
          title: "Mathematical curve",
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
          title: "Bézier curve (BezierPath)",
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
          title: "Angle label (AngleLabel)",
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
          image: "length-label.png",
          title: "Length label (LengthLabel)",
          code: `// Created with Open Animation Lab
let board = new Board(1280, 720);

// Plate with width and height
let plate = new Rectangle(400, 200, 0xdfeaf5, 0x333333, 2);
plate.x = 120;
plate.y = 160;

// Length label: start, end, distance of the dimension line, text
// Negative distance = dimension line on the other side
let width = new LengthLabel(120, 160, 520, 160, -40, "<i>b</i> = 4.0 m", "Arial", 22, 0x444444, 1, 0x444444);
let height = new LengthLabel(520, 160, 520, 360, -40, "<i>h</i> = 2.0 m", "Arial", 22, 0x444444, 1, 0x444444);

// Slider for the width
let sliderText = new Text("Width of the plate", "Arial", 20, 0x444444);
sliderText.x = 110;
sliderText.y = 500;
let slider = new ButtonSlider(1, 6, 4, 0.1, 40, 300);
slider.x = 120;
slider.y = 540;

function changeWidth() {
    let b = slider.value;
    let right = 120 + b * 100;
    plate.setWidth(b * 100);
    width.setEnd(right, 160);
    width.setText("<i>b</i> = " + b.toFixed(1) + " m");
    height.setPoints(right, 160, right, 360);
}
slider.onChange(changeWidth);

// Slanted line: text parallel to the dimension line
let start = new Circle(10, 0xc0392b);
start.x = 800;
start.y = 520;
start.setDragging(0, 0, 1280, 720);
let end = new Circle(10, 0xc0392b);
end.x = 1150;
end.y = 300;
end.setDragging(0, 0, 1280, 720);
let segment = new Line(800, 520, 1150, 300, 0x333333, 2);
let s = new LengthLabel(800, 520, 1150, 300, 30, "", "Arial", 22, 0xc0392b, 1, 0xc0392b);
s.setTextAlongLine(true);

function segmentAendrn() {
    segment.setStart(start.x, start.y);
    segment.setEnd(end.x, end.y);
    s.setPoints(start.x, start.y, end.x, end.y);
    s.setText("<i>s</i> = " + Math.round(s.getLength()) + " px");
}
start.onDrag(segmentAendrn);
end.onDrag(segmentAendrn);
segmentAendrn();

// Short lengths: arrowheads from outside, text beside them
let gap = new LengthLabel(800, 160, 812, 160, -30, "<i>d</i> = 1 mm", "Arial", 22, 0x444444, 1, 0x444444);
gap.setExternalLabel(true);
let part1 = new Rectangle(100, 60, 0xcfd8dc, 0x333333, 1);
part1.x = 700;
part1.y = 160;
let part2 = new Rectangle(100, 60, 0xcfd8dc, 0x333333, 1);
part2.x = 812;
part2.y = 160;
`,
        },
        {
          image: "line-label.png",
          title: "Line label (LineLabel)",
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
          title: "Point label (PointLabel)",
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
        "This tool can embed your images and sounds directly in the code.",
      templates: [
        {
          image: "guitar.png",
          title: "SVG image (SimpleSVG)",
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
          title: "PNG image (SimplePNG)",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);

// Note: SVG is usually more suitable. With PNGs, there is the problem that the total code becomes too large for AI processing.

let myPNG = new SimplePNG("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABECAIAAADGJao+AAAAwklEQVR4Xu3UgQbDMBRA0bc03f//b7N0VuqJEmwoc+KqNEkDh9b+2HuJu1KNO4f+AQCAAAAQAAACAEAAAAgAAAEAIAAABACAAAAQAAACAEAAAAgAAAEAIAAAANReamRLlPWYfNH0klxcPs+cP3NxWF+vi3lb7pa2R+vx6tHOtuN1O+a5lY3HzgM5ya/GM5N7ZjfPq7/5yS8IgAAAEAAAAgBAAAAIAAABACAAAAQAgAAAEAAAAgBAAAAIAAABACAAAIw322gDIPvtlmUAAAAASUVORK5CYII=");

myPNG.x = 400;
myPNG.y = 300;`,
        },
        {
          image: "mp3.png",
          title: "Sound (SimpleMP3)",
          code: `// Created with Open Animation Lab

let board = new Board(1280, 720);

// Embed your own sound: click the green i in front of the line with new SimpleMP3,
// "Select MP3 file", OK. Short sounds work best (under 300 KB).
// Only use your own sounds or sounds you may use freely, and name the source here.
// Source of this sound: made in the Open Animation Lab (free to use).

let ping = new SimpleMP3("data:audio/mpeg;base64,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");
ping.volume = 0.8;

let bell = new Circle(90, 0xffcc33);
bell.x = 640;
bell.y = 280;
bell.setBorder(0x333333, 3);

// Never show something important by sound alone – the note appears in the picture too.
let note = new Text("♪", "Arial", 90, 0x333333);
note.x = 790;
note.y = 150;
note.visible = false;

let button = new Button("Ping!", 200, 60, "Arial", 26);
button.x = 540;
button.y = 460;
button.onClick(playSound);

let soundOn = new Checkbox(true, 26, "Sound on", "Arial", 22);
soundOn.x = 560;
soundOn.y = 560;
soundOn.onClick(toggleSound);

ping.onEnded(finished);

function playSound() {
  note.visible = true;
  ping.restart(); // from the start, even if the sound is still playing
}

function finished() {
  note.visible = false;
}

function toggleSound(event) {
  ping.muted = !event.value;
}

// Note: browsers only play sound after the first click on the page.
// So it is best to start the sound with a button.`,
        },
      ],
    },
    {
      name: "Tips",
      description: "Useful techniques and best practices.",
      templates: [
        {
          image: "grouping.png",
          title: "Grouping (Group)",
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
          title: "Masking groups",
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
          title: "Subscript and superscript labels",
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
          title: "Ball follows slider",
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
          title: "Interactive mathematical curve",
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
          title: "Show and hide objects",
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
          title: "Zoom inside masks",
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
          title: "Change rotation points",
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
          title: "Several formulas",
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
          title: "Marking spline curves",
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
          title: "Drag and drop",
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
          title: "Slider types",
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
    }
  ],
};
