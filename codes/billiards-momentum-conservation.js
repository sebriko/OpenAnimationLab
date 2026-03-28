// Created with Open Animation Lab
// Billiard Simulation demonstrating conservation of momentum
// Open Source – CC BY 4.0

let board = new Board(1280, 720);

// ==================== CONSTANTS ====================
const TABLE_X = 140;
const TABLE_Y = 90;
const TABLE_WIDTH = 1000;
const TABLE_HEIGHT = 550;
const BALL_RADIUS = 22;
let friction = 0.018;
const MIN_VELOCITY = 0.15; // Threshold for static friction - balls stop when slower
const MASS = 1;

// ==================== BILLIARD TABLE ====================
let table = new Rectangle(TABLE_WIDTH, TABLE_HEIGHT, 0x0d6b3d);
table.x = TABLE_X;
table.y = TABLE_Y;
table.setBorder(0x5c3317, 14);

// ==================== BALLS ====================
let balls = [];

// White ball (cue ball)
let whiteBall = new Circle(BALL_RADIUS, 0xffffff);
whiteBall.x = TABLE_X + 180;
whiteBall.y = TABLE_Y + TABLE_HEIGHT / 2;
whiteBall.setBorder(0xaaaaaa, 2);
whiteBall.vx = 0;
whiteBall.vy = 0;
whiteBall.mass = MASS;
balls.push(whiteBall);

// Colored balls in triangular formation
let ballColors = [0xff0000, 0xffcc00, 0x0066ff, 0xff6600, 0x9900cc, 0x00cc66];
let startX = TABLE_X + 680;
let startY = TABLE_Y + TABLE_HEIGHT / 2;
let spacing = BALL_RADIUS * 2.3;

let ballIndex = 0;
for (let row = 0; row < 3; row++) {
  for (let col = 0; col <= row; col++) {
    if (ballIndex < ballColors.length) {
      let ball = new Circle(BALL_RADIUS, ballColors[ballIndex]);
      ball.x = startX + row * spacing * 0.866;
      ball.y = startY + (col - row / 2) * spacing;
      ball.setBorder(0x333333, 2);
      ball.vx = 0;
      ball.vy = 0;
      ball.mass = MASS;
      balls.push(ball);
      ballIndex++;
    }
  }
}

// ==================== ARROWS FOR IMPULSES ====================
let arrows = [];
for (let i = 0; i < balls.length; i++) {
  let arrow = new Arrow(0, 0, 100, 100, 0x222222, 2, 26, 12);
  arrow.visible = false;
  arrows.push(arrow);
}

// Aim arrow (for the shot direction)
let aimArrow = new Arrow(0, 0, 100, 0, 0x222222, 2, 26, 12);
aimArrow.visible = false;

// ==================== UI ELEMENTS ====================

// Hint text – top left
let hinweisText = new Text(
  "Press and drag the mouse over the white circle.",
  "Arial",
  22,
  0x666666,
);
hinweisText.x = 20;
hinweisText.y = 20;

// Buttons – top right
let startButton = new Button("Take shot", 180, 40, "Arial", 22);
startButton.x = 1280 - 180 - 170 - 20;
startButton.y = 20;

let resetButton = new Button("Reset", 160, 40, "Arial", 22);
resetButton.x = 1280 - 160 - 20;
resetButton.y = 20;

// Friction stepper – bottom right
let frictionLabel = new Text("Rolling friction μ:", "Arial", 22, 0x333333);
frictionLabel.x = 1280 - 270 - 50;
frictionLabel.y = 720 - 40 - 20;

let frictionStepper = new NumericStepper(
  friction,
  0,
  0.02,
  0.001,
  100,
  "Arial",
  22,
  ".",
);
frictionStepper.x = 1280 - 110 - 20;
frictionStepper.y = 720 - 40 - 13;

frictionStepper.onChange(function (event) {
  friction = event.newValue;
});

// ==================== STATE VARIABLES ====================
let isSimulating = false;
let isDragging = false;
let aimVx = 0;
let aimVy = 0;

// ==================== MOUSE INTERACTION ====================
board.onMouseDown(function (e) {
  if (isSimulating) return;

  let dx = e.x - whiteBall.x;
  let dy = e.y - whiteBall.y;
  let dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < BALL_RADIUS + 10) {
    isDragging = true;
    aimArrow.visible = true;
    aimArrow.setStart(whiteBall.x, whiteBall.y);
    aimArrow.setEnd(e.x, e.y);
  }
});

board.onMouseMove(function (e) {
  if (!isDragging) return;

  aimArrow.setStart(whiteBall.x, whiteBall.y);
  aimArrow.setEnd(e.x, e.y);
});

board.onMouseUp(function (e) {
  if (!isDragging) return;
  isDragging = false;

  aimVx = (e.x - whiteBall.x) * 0.06;
  aimVy = (e.y - whiteBall.y) * 0.06;

  aimArrow.setStart(whiteBall.x, whiteBall.y);
  aimArrow.setEnd(e.x, e.y);
});

// ==================== BUTTON HANDLER ====================
startButton.onClick(function () {
  if (isSimulating) return;
  if (aimVx === 0 && aimVy === 0) return;

  whiteBall.vx = aimVx;
  whiteBall.vy = aimVy;

  isSimulating = true;
  aimArrow.visible = false;
});

resetButton.onClick(function () {
  isSimulating = false;
  isDragging = false;
  aimVx = 0;
  aimVy = 0;

  whiteBall.x = TABLE_X + 180;
  whiteBall.y = TABLE_Y + TABLE_HEIGHT / 2;
  whiteBall.vx = 0;
  whiteBall.vy = 0;

  ballIndex = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col <= row; col++) {
      if (ballIndex < ballColors.length) {
        let ball = balls[ballIndex + 1];
        ball.x = startX + row * spacing * 0.866;
        ball.y = startY + (col - row / 2) * spacing;
        ball.vx = 0;
        ball.vy = 0;
        ballIndex++;
      }
    }
  }

  aimArrow.visible = false;
  for (let arrow of arrows) {
    arrow.visible = false;
  }
});

// ==================== PHYSICS FUNCTIONS ====================
function checkBallCollision(ball1, ball2) {
  let dx = ball2.x - ball1.x;
  let dy = ball2.y - ball1.y;
  let dist = Math.sqrt(dx * dx + dy * dy);
  let minDist = BALL_RADIUS * 2;

  if (dist < minDist && dist > 0) {
    let nx = dx / dist;
    let ny = dy / dist;

    let dvx = ball1.vx - ball2.vx;
    let dvy = ball1.vy - ball2.vy;

    let dvn = dvx * nx + dvy * ny;

    if (dvn > 0) {
      ball1.vx -= dvn * nx;
      ball1.vy -= dvn * ny;
      ball2.vx += dvn * nx;
      ball2.vy += dvn * ny;

      let overlap = minDist - dist;
      ball1.x -= (overlap / 2) * nx;
      ball1.y -= (overlap / 2) * ny;
      ball2.x += (overlap / 2) * nx;
      ball2.y += (overlap / 2) * ny;
    }
  }
}

function checkWallCollision(ball) {
  let left = TABLE_X + BALL_RADIUS;
  let right = TABLE_X + TABLE_WIDTH - BALL_RADIUS;
  let top = TABLE_Y + BALL_RADIUS;
  let bottom = TABLE_Y + TABLE_HEIGHT - BALL_RADIUS;

  if (ball.x < left) {
    ball.x = left;
    ball.vx = -ball.vx;
  }
  if (ball.x > right) {
    ball.x = right;
    ball.vx = -ball.vx;
  }
  if (ball.y < top) {
    ball.y = top;
    ball.vy = -ball.vy;
  }
  if (ball.y > bottom) {
    ball.y = bottom;
    ball.vy = -ball.vy;
  }
}

function applyFriction(ball) {
  if (friction <= 0) return;
  ball.vx *= 1 - friction;
  ball.vy *= 1 - friction;
}

function updateArrows() {
  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];
    let arrow = arrows[i];

    let speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (speed > MIN_VELOCITY) {
      arrow.visible = true;
      let scale = 25;
      arrow.setStart(ball.x, ball.y);
      arrow.setEnd(ball.x + ball.vx * scale, ball.y + ball.vy * scale);
    } else {
      arrow.visible = false;
    }
  }
}

// ==================== MAIN TIMER ====================
let timer = new Timer();
timer.start();

timer.onUpdate(function () {
  if (!isSimulating) {
    updateArrows();
    return;
  }

  let allStopped = true;

  for (let ball of balls) {
    ball.x += ball.vx;
    ball.y += ball.vy;

    applyFriction(ball);

    // Static friction: if velocity falls below threshold, ball stops immediately
    let speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (speed < MIN_VELOCITY) {
      ball.vx = 0;
      ball.vy = 0;
    } else {
      allStopped = false;
    }

    checkWallCollision(ball);
  }

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      checkBallCollision(balls[i], balls[j]);
    }
  }

  updateArrows();

  if (allStopped) {
    isSimulating = false;
  }
});
