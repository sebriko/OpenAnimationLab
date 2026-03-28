// Created with Educational Animation Editor
// Open Source – CC BY 4.0

let board = new Board(1280, 720);

let myText = new Text("Benzinpreis:", "Arial", 20, 0x000000, "left");
myText.x = 680;
myText.y = 100;

let myText2 = new Text(
  "Energie des Kraftstoffs",
  "Arial",
  20,
  0x000000,
  "left",
);
myText2.x = 10;
myText2.y = 10;

let myText3 = new Text("An der Tankstelle", "Arial", 20, 0x000000, "left");
myText3.x = 650;
myText3.y = 10;

let myText4 = new Text("Das Fahrzeug", "Arial", 20, 0x000000, "left");
myText4.x = 10;
myText4.y = 370;

let myText5 = new Text("Berechnungsbeispiel", "Arial", 20, 0x000000, "left");
myText5.x = 650;
myText5.y = 370;

let myDropdown = new Dropdown(
  ["Sportwagen", "Mittelklasse", "SUV"],
  200,
  50,
  "Arial",
  20,
);
myDropdown.x = 100;
myDropdown.y = 430;

// Tabelle für Fahrzeugparameter erstellen
const paramTable2 = new ParameterTable(
  [
    { name: "C<sub>w</sub>", value: 0.36 },
    { name: "A [m²]", value: 1.98 },
    { name: "m [kg]", value: 1500, editable: false },
  ],
  450,
  "Arial",
  14,
  0x333333,
);

// Position setzen
paramTable2.x = 100;
paramTable2.y = 500;

// Überschrift hinzufügen
paramTable2.setTitle("Fahrzeugparameter");

// Dezimaltrennzeichen auf Komma setzen
paramTable2.setDecimalSeparator(",");

// Funktion zum Ändern der Fahrzeugparameter
function handleChange(event) {
  console.log("Selected: " + event.detail.value);

  // Je nach ausgewähltem Fahrzeugtyp die Parameter setzen
  switch (event.detail.value) {
    case "Sportwagen":
      paramTable2.setValue("C<sub>w</sub>", 0.36);
      paramTable2.setValue("A [m²]", 1.98);
      paramTable2.setValue("m [kg]", 1500);
      break;
    case "Mittelklasse":
      paramTable2.setValue("C<sub>w</sub>", 0.3);
      paramTable2.setValue("A [m²]", 2.19);
      paramTable2.setValue("m [kg]", 1300);
      break;
    case "SUV":
      paramTable2.setValue("C<sub>w</sub>", 0.4);
      paramTable2.setValue("A [m²]", 2.42);
      paramTable2.setValue("m [kg]", 2000);
      break;
  }
  // Nach Fahrzeugwechsel neu berechnen
  berechneAlles();
}

myDropdown.onChange(handleChange);

let myLine = new Line(640, 0, 640, 720, 0x555555, 2);
myLine.x = 0;
myLine.y = 0;

let myLine2 = new Line(0, 360, 1280, 360, 0x555555, 2);
myLine2.x = 0;
myLine2.y = 0;

let myStepperBenzinpreis = new NumericStepper(
  189,
  100,
  300,
  1,
  100,
  "Arial",
  20,
  ",",
);
myStepperBenzinpreis.x = 700;
myStepperBenzinpreis.y = 150;

let myTextBenzinpreisEinheit = new Text("ct/l", "Arial", 20, 0x000000, "left");
myTextBenzinpreisEinheit.x = 820;
myTextBenzinpreisEinheit.y = 155;

// Tabelle für Brennstoffeigenschaften erstellen
const paramTable = new ParameterTable(
  [
    { name: "Heizwert (kWh/kg)", value: 12 },
    { name: "Dichte (kg/m³)", value: 740 },
    { name: "Masse/Liter (kg)", value: 0.74, editable: false },
    { name: "Energie/Liter (kWh)", value: 8.88, editable: false },
    { name: "Energie/Liter (η=0,25)", value: 2.22, editable: false },
  ],
  450,
  "Arial",
  14,
  0x333333,
);

// Position setzen
paramTable.x = 100;
paramTable.y = 70;

// Überschrift hinzufügen
paramTable.setTitle("Brennstoffkennwerte");

// Dezimaltrennzeichen auf Komma setzen
paramTable.setDecimalSeparator(",");

// Funktion zur Berechnung der abhängigen Werte
function berechneAbhaengigeWerte() {
  const heizwert = paramTable.getValue("Heizwert (kWh/kg)");
  const dichte = paramTable.getValue("Dichte (kg/m³)");

  // Masse pro Liter berechnen (1 Liter = 0.001 m³)
  const masseProLiter = dichte * 0.001;
  paramTable.setValue("Masse/Liter (kg)", masseProLiter);

  // Energie pro Liter berechnen
  const energieProLiter = heizwert * masseProLiter;
  paramTable.setValue("Energie/Liter (kWh)", energieProLiter);

  // Energie pro Liter bei Wirkungsgrad η = 0,25
  const energieProLiterEta = energieProLiter * 0.25;
  paramTable.setValue("Energie/Liter (η=0,25)", energieProLiterEta);
}

// Event-Listener für Änderungen
paramTable.onChange(function (event) {
  // Nur bei Änderung der editierbaren Parameter neu berechnen
  if (
    event.parameterName === "Heizwert (kWh/kg)" ||
    event.parameterName === "Dichte (kg/m³)"
  ) {
    console.log(
      "Parameter geändert:",
      event.parameterName,
      "->",
      event.newValue,
    );
    berechneAbhaengigeWerte();
    berechneAlles();
  }
});

// Initiale Berechnung durchführen
berechneAbhaengigeWerte();

let myPNG = new SimplePNG(
  "data:image/png;base64,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",
);

myPNG.x = 1160;
myPNG.y = 20;

myPNG.setScale(0.5, 0.5);

let myTextGeschwindigkeit = new Text(
  "Geschwindigkeit:",
  "Arial",
  20,
  0x000000,
  "left",
);
myTextGeschwindigkeit.x = 680;
myTextGeschwindigkeit.y = 450;

let myStepperGeschwindigkeit = new NumericStepper(
  200,
  0,
  250,
  10,
  100,
  "Arial",
  20,
  ",",
);
myStepperGeschwindigkeit.x = 700;
myStepperGeschwindigkeit.y = 500;

let myTextGeschwindigkeitEinheit = new Text(
  "km/h",
  "Arial",
  20,
  0x000000,
  "left",
);
myTextGeschwindigkeitEinheit.x = 820;
myTextGeschwindigkeitEinheit.y = 505;

let myTextStrecke = new Text("Fahrstrecke:", "Arial", 20, 0x000000, "left");
myTextStrecke.x = 680;
myTextStrecke.y = 550;

let myStepperStrecke = new NumericStepper(
  200,
  10,
  1000,
  10,
  100,
  "Arial",
  20,
  ",",
);
myStepperStrecke.x = 700;
myStepperStrecke.y = 600;

let myTextStreckeEinheit = new Text("km", "Arial", 20, 0x000000, "left");
myTextStreckeEinheit.x = 820;
myTextStreckeEinheit.y = 605;

// =====================================================
// Tankstellen-Bereich (rechts oben)
// =====================================================

let myTextTanken = new Text("Tankmenge:", "Arial", 20, 0x000000, "left");
myTextTanken.x = 680;
myTextTanken.y = 200;

let myStepperTanken = new NumericStepper(50, 1, 100, 5, 100, "Arial", 20, ",");
myStepperTanken.x = 700;
myStepperTanken.y = 250;

let myTextTankenEinheit = new Text("Liter", "Arial", 20, 0x000000, "left");
myTextTankenEinheit.x = 820;
myTextTankenEinheit.y = 255;

// Ergebnis-Tabelle für Tankstelle
const paramTableTankstelle = new ParameterTable(
  [
    { name: "Kosten (€)", value: 0, editable: false },
    { name: "Energie gesamt (kWh)", value: 0, editable: false },
  ],
  300,
  "Arial",
  14,
  0x333333,
);

paramTableTankstelle.x = 920;
paramTableTankstelle.y = 70;
paramTableTankstelle.setTitle("Ergebnis Tanken");
paramTableTankstelle.setDecimalSeparator(",");

// =====================================================
// Ergebnis-Tabelle für Berechnungsbeispiel (rechts unten)
// =====================================================

const paramTableErgebnis = new ParameterTable(
  [
    { name: "c<sub>w</sub>·ρ·A/2", value: 0, editable: false },
    { name: "v (m/s)", value: 0, editable: false },
    { name: "F<sub>Luft</sub> (N)", value: 0, editable: false },
    { name: "P<sub>Luft</sub> (kW)", value: 0, editable: false },
    { name: "E<sub>Luft</sub> (kWh)", value: 0, editable: false },
    { name: "Verbrauch (l)", value: 0, editable: false },
    { name: "Kosten (€)", value: 0, editable: false },
  ],
  300,
  "Arial",
  14,
  0x333333,
);

paramTableErgebnis.x = 920;
paramTableErgebnis.y = 380;
paramTableErgebnis.setTitle("Ergebnis Luftwiderstand");
paramTableErgebnis.setDecimalSeparator(",");

// =====================================================
// Hauptberechnungsfunktion
// =====================================================

function berechneAlles() {
  // Werte aus den Eingabefeldern holen
  const benzinpreis = myStepperBenzinpreis.value; // ct/l
  const tankmenge = myStepperTanken.value; // Liter
  const geschwindigkeit = myStepperGeschwindigkeit.value; // km/h
  const strecke = myStepperStrecke.value; // km

  // Fahrzeugparameter
  const cw = paramTable2.getValue("C<sub>w</sub>");
  const A = paramTable2.getValue("A [m²]");

  // Kraftstoffparameter
  const energieProLiterEta = paramTable.getValue("Energie/Liter (η=0,25)");

  // Luftdichte (konstant)
  const rho = 1.2; // kg/m³

  // =====================================================
  // Tankstellen-Berechnung
  // =====================================================

  // Kosten = (Benzinpreis + 0.9) / 100 * Tankmenge
  // Das +0.9 kommt aus dem Excel (vermutlich für Rundung auf x,9 ct)
  const kostenTanken = ((benzinpreis + 0.9) / 100) * tankmenge;
  paramTableTankstelle.setValue(
    "Kosten (€)",
    Math.round(kostenTanken * 100) / 100,
  );

  // Energie = Energie pro Liter (mit Wirkungsgrad) * Tankmenge
  const energieGesamt = energieProLiterEta * tankmenge;
  paramTableTankstelle.setValue(
    "Energie gesamt (kWh)",
    Math.round(energieGesamt * 100) / 100,
  );

  // =====================================================
  // Luftwiderstand-Berechnung
  // =====================================================

  // Faktor: cw * rho * A / 2
  const faktor = (cw * rho * A) / 2;
  paramTableErgebnis.setValue(
    "c<sub>w</sub>·ρ·A/2",
    Math.round(faktor * 1000) / 1000,
  );

  // Geschwindigkeit in m/s umrechnen
  const v_ms = geschwindigkeit / 3.6;
  paramTableErgebnis.setValue("v (m/s)", Math.round(v_ms * 100) / 100);

  // Luftwiderstandskraft: F = faktor * v²
  const F_Luft = faktor * v_ms * v_ms;
  paramTableErgebnis.setValue(
    "F<sub>Luft</sub> (N)",
    Math.round(F_Luft * 10) / 10,
  );

  // Leistung: P = F * v (in kW)
  const P_Luft = (F_Luft * v_ms) / 1000;
  paramTableErgebnis.setValue(
    "P<sub>Luft</sub> (kW)",
    Math.round(P_Luft * 100) / 100,
  );

  // Energie für Strecke: E = P * t = P * (Strecke / Geschwindigkeit)
  // E = (Strecke / Geschwindigkeit_kmh) * P_kW
  const zeit_h = strecke / geschwindigkeit; // Zeit in Stunden
  const E_Luft = P_Luft * zeit_h;
  paramTableErgebnis.setValue(
    "E<sub>Luft</sub> (kWh)",
    Math.round(E_Luft * 100) / 100,
  );

  // Verbrauch in Litern = E_Luft / Energie pro Liter (mit Wirkungsgrad)
  const verbrauch = E_Luft / energieProLiterEta;
  paramTableErgebnis.setValue(
    "Verbrauch (l)",
    Math.round(verbrauch * 100) / 100,
  );

  // Kosten für die Strecke
  const kostenStrecke = (verbrauch / 100) * (benzinpreis + 0.9);
  paramTableErgebnis.setValue(
    "Kosten (€)",
    Math.round(kostenStrecke * 100) / 100,
  );
}

// =====================================================
// Event-Listener für alle Stepper
// =====================================================

myStepperBenzinpreis.onChange(function (event) {
  berechneAlles();
});

myStepperTanken.onChange(function (event) {
  berechneAlles();
});

myStepperGeschwindigkeit.onChange(function (event) {
  berechneAlles();
});

myStepperStrecke.onChange(function (event) {
  berechneAlles();
});

// Event-Listener für Fahrzeugparameter-Änderungen
paramTable2.onChange(function (event) {
  berechneAlles();
});

// =====================================================
// Initiale Berechnung
// =====================================================

berechneAlles();
