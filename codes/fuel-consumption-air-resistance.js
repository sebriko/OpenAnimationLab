// Created with Educational Animation Editor
// Open Source – CC BY 4.0

let board = new Board(1280, 720);

// ==============================
// Headings / Labels
// ==============================

let myText = new Text("Fuel price:", "Arial", 20, 0x000000, "left");
myText.x = 680;
myText.y = 100;

let myText2 = new Text("Fuel energy", "Arial", 20, 0x000000, "left");
myText2.x = 10;
myText2.y = 10;

let myText3 = new Text("At the gas station", "Arial", 20, 0x000000, "left");
myText3.x = 650;
myText3.y = 10;

let myText4 = new Text("The vehicle", "Arial", 20, 0x000000, "left");
myText4.x = 10;
myText4.y = 370;

let myText5 = new Text("Calculation example", "Arial", 20, 0x000000, "left");
myText5.x = 650;
myText5.y = 370;

// ==============================
// Vehicle selection
// ==============================

let myDropdown = new Dropdown(
  ["Sports car", "Mid-size car", "SUV"],
  200,
  50,
  "Arial",
  20,
);
myDropdown.x = 100;
myDropdown.y = 430;

// Vehicle parameter table
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

paramTable2.x = 100;
paramTable2.y = 500;

paramTable2.setTitle("Vehicle parameters");
paramTable2.setDecimalSeparator(",");

// Change vehicle parameters depending on selection
function handleChange(event) {
  console.log("Selected: " + event.detail.value);

  switch (event.detail.value) {
    case "Sports car":
      paramTable2.setValue("C<sub>w</sub>", 0.36);
      paramTable2.setValue("A [m²]", 1.98);
      paramTable2.setValue("m [kg]", 1500);
      break;
    case "Mid-size car":
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

  // Recalculate after vehicle change
  calculateAll();
}

myDropdown.onChange(handleChange);

// ==============================
// Layout lines
// ==============================

let myLine = new Line(640, 0, 640, 720, 0x555555, 2);
let myLine2 = new Line(0, 360, 1280, 360, 0x555555, 2);

// ==============================
// Fuel price input
// ==============================

let myStepperFuelPrice = new NumericStepper(
  189,
  100,
  300,
  1,
  100,
  "Arial",
  20,
  ",",
);
myStepperFuelPrice.x = 700;
myStepperFuelPrice.y = 150;

let myTextFuelUnit = new Text("ct/l", "Arial", 20, 0x000000, "left");
myTextFuelUnit.x = 820;
myTextFuelUnit.y = 155;

// ==============================
// Fuel properties table
// ==============================

const paramTable = new ParameterTable(
  [
    { name: "Heating value (kWh/kg)", value: 12 },
    { name: "Density (kg/m³)", value: 740 },
    { name: "Mass per liter (kg)", value: 0.74, editable: false },
    { name: "Energy per liter (kWh)", value: 8.88, editable: false },
    { name: "Energy per liter (η=0.25)", value: 2.22, editable: false },
  ],
  450,
  "Arial",
  14,
  0x333333,
);

paramTable.x = 100;
paramTable.y = 70;

paramTable.setTitle("Fuel properties");
paramTable.setDecimalSeparator(",");

// Calculate dependent fuel values
function calculateDependentValues() {
  const heatingValue = paramTable.getValue("Heating value (kWh/kg)");
  const density = paramTable.getValue("Density (kg/m³)");

  // Mass per liter (1 liter = 0.001 m³)
  const massPerLiter = density * 0.001;
  paramTable.setValue("Mass per liter (kg)", massPerLiter);

  // Energy per liter
  const energyPerLiter = heatingValue * massPerLiter;
  paramTable.setValue("Energy per liter (kWh)", energyPerLiter);

  // Energy per liter with efficiency η = 0.25
  const energyPerLiterEta = energyPerLiter * 0.25;
  paramTable.setValue("Energy per liter (η=0.25)", energyPerLiterEta);
}

paramTable.onChange(function (event) {
  if (
    event.parameterName === "Heating value (kWh/kg)" ||
    event.parameterName === "Density (kg/m³)"
  ) {
    calculateDependentValues();
    calculateAll();
  }
});

calculateDependentValues();

// ==============================
// Speed & distance
// ==============================

let myTextSpeed = new Text("Speed:", "Arial", 20, 0x000000, "left");
myTextSpeed.x = 680;
myTextSpeed.y = 450;

let myStepperSpeed = new NumericStepper(200, 0, 250, 10, 100, "Arial", 20, ",");
myStepperSpeed.x = 700;
myStepperSpeed.y = 500;

let myTextSpeedUnit = new Text("km/h", "Arial", 20, 0x000000, "left");
myTextSpeedUnit.x = 820;
myTextSpeedUnit.y = 505;

let myTextDistance = new Text("Distance:", "Arial", 20, 0x000000, "left");
myTextDistance.x = 680;
myTextDistance.y = 550;

let myStepperDistance = new NumericStepper(
  200,
  10,
  1000,
  10,
  100,
  "Arial",
  20,
  ",",
);
myStepperDistance.x = 700;
myStepperDistance.y = 600;

let myTextDistanceUnit = new Text("km", "Arial", 20, 0x000000, "left");
myTextDistanceUnit.x = 820;
myTextDistanceUnit.y = 605;

// ==============================
// Gas station calculation
// ==============================

let myTextRefuel = new Text("Refuel amount:", "Arial", 20, 0x000000, "left");
myTextRefuel.x = 680;
myTextRefuel.y = 200;

let myStepperRefuel = new NumericStepper(50, 1, 100, 5, 100, "Arial", 20, ",");
myStepperRefuel.x = 700;
myStepperRefuel.y = 250;

let myTextRefuelUnit = new Text("liters", "Arial", 20, 0x000000, "left");
myTextRefuelUnit.x = 820;
myTextRefuelUnit.y = 255;

// Result table: refueling
const paramTableGasStation = new ParameterTable(
  [
    { name: "Cost (€)", value: 0, editable: false },
    { name: "Total energy (kWh)", value: 0, editable: false },
  ],
  300,
  "Arial",
  14,
  0x333333,
);

paramTableGasStation.x = 920;
paramTableGasStation.y = 70;
paramTableGasStation.setTitle("Refueling result");
paramTableGasStation.setDecimalSeparator(",");

// ==============================
// Result table: air resistance
// ==============================

const paramTableResult = new ParameterTable(
  [
    { name: "c<sub>w</sub>·ρ·A/2", value: 0, editable: false },
    { name: "v (m/s)", value: 0, editable: false },
    { name: "F<sub>air</sub> (N)", value: 0, editable: false },
    { name: "P<sub>air</sub> (kW)", value: 0, editable: false },
    { name: "E<sub>air</sub> (kWh)", value: 0, editable: false },
    { name: "Fuel consumption (l)", value: 0, editable: false },
    { name: "Cost (€)", value: 0, editable: false },
  ],
  300,
  "Arial",
  14,
  0x333333,
);

paramTableResult.x = 920;
paramTableResult.y = 380;
paramTableResult.setTitle("Air resistance result");
paramTableResult.setDecimalSeparator(",");

// ==============================
// Main calculation
// ==============================

function calculateAll() {
  const fuelPrice = myStepperFuelPrice.value; // ct/l
  const refuelAmount = myStepperRefuel.value; // liters
  const speed = myStepperSpeed.value; // km/h
  const distance = myStepperDistance.value; // km

  const cw = paramTable2.getValue("C<sub>w</sub>");
  const A = paramTable2.getValue("A [m²]");
  const energyPerLiterEta = paramTable.getValue("Energy per liter (η=0.25)");

  const rho = 1.2; // air density kg/m³

  // Refueling
  const refuelCost = ((fuelPrice + 0.9) / 100) * refuelAmount;
  paramTableGasStation.setValue("Cost (€)", Math.round(refuelCost * 100) / 100);

  const totalEnergy = energyPerLiterEta * refuelAmount;
  paramTableGasStation.setValue(
    "Total energy (kWh)",
    Math.round(totalEnergy * 100) / 100,
  );

  // Air resistance
  const factor = (cw * rho * A) / 2;
  paramTableResult.setValue(
    "c<sub>w</sub>·ρ·A/2",
    Math.round(factor * 1000) / 1000,
  );

  const v_ms = speed / 3.6;
  paramTableResult.setValue("v (m/s)", Math.round(v_ms * 100) / 100);

  const F_air = factor * v_ms * v_ms;
  paramTableResult.setValue("F<sub>air</sub> (N)", Math.round(F_air * 10) / 10);

  const P_air = (F_air * v_ms) / 1000;
  paramTableResult.setValue(
    "P<sub>air</sub> (kW)",
    Math.round(P_air * 100) / 100,
  );

  const time_h = distance / speed;
  const E_air = P_air * time_h;
  paramTableResult.setValue(
    "E<sub>air</sub> (kWh)",
    Math.round(E_air * 100) / 100,
  );

  const consumption = E_air / energyPerLiterEta;
  paramTableResult.setValue(
    "Fuel consumption (l)",
    Math.round(consumption * 100) / 100,
  );

  const tripCost = (consumption / 100) * (fuelPrice + 0.9);
  paramTableResult.setValue("Cost (€)", Math.round(tripCost * 100) / 100);
}

// ==============================
// Event listeners
// ==============================

myStepperFuelPrice.onChange(calculateAll);
myStepperRefuel.onChange(calculateAll);
myStepperSpeed.onChange(calculateAll);
myStepperDistance.onChange(calculateAll);
paramTable2.onChange(calculateAll);

// Initial calculation
calculateAll();
