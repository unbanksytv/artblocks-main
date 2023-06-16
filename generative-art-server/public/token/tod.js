let timeOfDay = 'morning';
let colorModifiers = {
  'water': [230, 245, 50, 70],
  'grass': [50, 110, 30, 90, 85, 35],
  'stone': [180, 220, 10, 30, 30, 50],
  'trunk': [0, 70, 80, 20, 40],
  'leaves': [110, 130, 70, 100, 20, 40]
};
let terrRange, terrHeight, rez1, rez2, cam, seed;
let randomCameraAngle = true;
let overlap = 100;
let depth = 1000;
let water = 100;
let treeLine = 100;

function setup() {
  randomizeParameters();
  let canv = createCanvas(3000, 2000, WEBGL);
  canv.mousePressed(randomizeParameters);
  noLoop();
  colorMode(HSB, 360, 100, 100, 100);
  cam = createCamera();
  draw();
}

function draw() {
  let bg, brightnessModifier;
  switch(timeOfDay) {
    case 'morning': bg = [204, 153, 0]; brightnessModifier = 10; break;
    case 'afternoon': bg = [0, 76, 153]; brightnessModifier = 0; break;
    case 'evening': bg = [204, 102, 0]; brightnessModifier = -10; break;
    case 'night': bg = [0, 0, 51]; brightnessModifier = -20; break;
  }
  Object.keys(colorModifiers).forEach(type => {
    colorModifiers[type] = colorModifiers[type].map(value => value + brightnessModifier);
  });
  background(bg);
  setCameraAngle();
  drawTerrain();
}

function randomizeParameters() {
  terrRange = random(60, 180);
  terrHeight = random(-15, 5);
  rez1 = random(0.002, 0.02);
  rez2 = random(0.001, 0.009);
  seed = millis() * 10000;
}

function setCameraAngle() {
  if (randomCameraAngle) {
    cam.camera(0, random(-80, -500), random(-50, -300), random(-50, 50), random(-100, 250), 0, 0, 1, 0);
  } else {
    cam.camera(0, -350, -400, 0, 0, 0, 0, 1, 0);
  }
}

function drawTerrain() {
  for (x = -overlap - width / 2; x < width / 2 + overlap; x += 22) {
    for (z = -overlap - depth / 2; z < depth / 2 + overlap; z += 22) {
      drawTile(x, z);
    }
  }
}

function drawTile(x, z) {
  const [elevation, colorNoise] = calculateNoise(x, z);
  let tileType = elevation > water ? 'water' : 'grass';
  noStroke();
  fill(randomColor(tileType, colorNoise));
  drawBox(x, elevation > water ? water : elevation, z, tileType);
}

function calculateNoise(x, z) {
  let elevation = (noise(x * rez1 + seed, z * rez1 + seed) - 0.5) * terrRange + (noise(x * rez2 + seed, z * rez2 + seed) - 0.5) * terrRange * 2 + terrHeight;
  let colorNoise = noise((x + overlap) * rez1 + 10000, (z + overlap) * rez1 + seed + 10000);
  return [elevation, colorNoise];
}

function drawBox(x, y, z, type) {
  push();
  translate(x, y, z);
  box(33, 22, 11);
  if (type === 'grass') {
    translate(0, 22*3, 0);
    fill(randomColor('stone'));
    box(22, 22 * 5, 22);
  }
  pop();
  if (type === 'grass' && y > treeLine && calculateTreeChance(x, z) > 9.5) {
    makeTree();
  }
}

function makeTree() {
  let treeSize = random(0.5, 1.3) * size;
  push();
  translate(0, -treeSize*5, 0);
  fill(randomColor('trunk'));
  noStroke();
  cylinder(treeSize / 3, treeSize * 3);
  stroke(0,0,0);
  strokeWeight(sw);
  translate(-treeSize, -treeSize, -treeSize);
  fill(randomColor('leaves'));
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 9; j++) {
      box(treeSize);
      translate(0, 0, treeSize * (j % 3 == 2 ? -2 : 1));
    }
    translate(treeSize * (i == 0 ? 1 : -2), -treeSize, 0);
  }
  translate(treeSize, 0, treeSize);
  box(treeSize);
  pop();
}

function calculateTreeChance(x, z) {
  return random(-2, 2) + noise((x + overlap) * rez1 + 20000, (z + overlap) * rez1 + seed + 20000) * 14;
}

function randomColor(type, h) {
  let colorRange = colorModifiers[type];
  if (type === 'grass' || type === 'water') {
    return [h * colorRange[0] + colorRange[1] + random(-colorRange[1], colorRange[1]),
            h * colorRange[2] + colorRange[3] + random(-colorRange[3], colorRange[3]),
            h * colorRange[4] + colorRange[5] + random(-colorRange[5], colorRange[5]),
            100];
  } else {
    return [random(colorRange[0], colorRange[1]),
            random(colorRange[2], colorRange[3]),
            random(colorRange[4], colorRange[5])];
  }
}
