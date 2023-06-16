let timeOfDay = 'morning';  // set the initial time of day
let additionalModifier;

// color modifiers for different objects
let colorModifiers = {
  'water': [230, 245, 50, 70],
  'grass': [50, 110, 30, 90, 85, 35],
  'stone': [180, 220, 10, 30, 30, 50],
  'trunk': [0, 70, 80, 20, 40],
  'leaves': [110, 130, 70, 100, 20, 40]
};

let terrRange, terrHeight, rez1, rez2, cam, seed;

// other variables...

// draw function
function draw() {
    // Modify the background color based on time of day
    switch(timeOfDay) {
      case 'morning':
        background(204, 153, 0); // Yellowish color for morning
        additionalModifier = 10; // makes color a bit brighter
        break;
      case 'afternoon':
        background(0, 76, 153); // Bluish color for afternoon
        additionalModifier = 0; // no change in color
        break;
      case 'evening':
        background(204, 102, 0); // Orange color for evening
        additionalModifier = -10;  // makes color a bit darker
        break;
      case 'night':
        background(0, 0, 51); // Dark color for night
        additionalModifier = -20;  // makes color much darker
        break;
    }
  
    setCameraAngle();
    background(220, 100, 100);
    drawTerrain();
  }


  
  function drawTerrain() {
    for (x = -overlap - width / 2; x < width / 2 + overlap; x += size) {
      for (z = -overlap - depth / 2; z < depth / 2 + overlap; z += size) {
        drawTile(x, z);
      }
    }
  }
  
  function drawTile(x, z) {
    let y = calculateElevation(x, z);
    let h = calculateColorNoise(x, z);
    
    if (y > water) {
      fill(randomColor('water'));
      y = water;
      noStroke();
    } else {
      stroke(0, 0, 0);
      strokeWeight(sw);
      fill(randomColor('grass', h));
    }
    
    push();
    drawBox(x, y, z);
    
    if (y < water && y > treeLine && calculateTreeChance(x, z) > 9.5) {
      makeTree();
    }
    pop();
  }
  
  function drawBox(x, y, z) {
    translate(x, y, z);
    box(size, size, size); //grass or water
    if (y > treeLine) {
      translate(0, size*3, 0);
    } else {
      translate(0, size*2, 0);
      fill(randomColor('stone'));
      box(size, size * 5, size); //stones
    }
  }
  
  function makeTree() {
    let treeSize = random(0.5, 1.3) * size;
    translate(0, -treeSize*5, 0);
    fill(randomColor('trunk')); //trunk color
    noStroke();
    cylinder(treeSize / 3, treeSize * 3);
    stroke(0,0,0);
    strokeWeight(sw);
    translate(-treeSize, -treeSize, -treeSize);
    fill(randomColor('leaves')); //green leaves
    //fill in tree:
    for (i=0;i<2;i++){
    for (j=0;j<3;j++){
      for (k=0;k<3;k++){
        box(treeSize);
        translate(0,0,treeSize)
      }
      translate(treeSize,0,-treeSize*3)
    } translate(-treeSize*3,-treeSize,0)
    }
    translate(treeSize,0,treeSize);
    box(treeSize) //cap on tree
  }
}

// additional helper functions
function randomizeParameters() {
    terrRange = random(60, 180);
    terrHeight = random(-15, 5);
    rez1 = random(0.002, 0.02); //bumpy terrain
    rez2 = random(0.001, 0.009); //gradual elevation
    seed = millis() * 10000;  //to vary noise
  }

  function setCameraAngle() {
    if (randomCameraAngle) {
      cam.camera(0, random(-80, -500), random(-50, -300), random(-50, 50), random(-100, 250), 0, 0, 1, 0);
    } else {
      cam.camera(0, -350, -400, 0, 0, 0, 0, 1, 0); //high overview
    }
  }
  
  function calculateElevation(x, z) {
    let yn1 = (noise(x * rez1 + seed, z * rez1 + seed) - 0.5) * terrRange; //bumpy noise
    let yn2 = (noise(x * rez2 + seed, z * rez2 + seed) - 0.5) * terrRange * 2; //gradual elevation
    return yn1 + yn2 + terrHeight;
  }
  
  function calculateColorNoise(x, z) {
    return noise((x + overlap) * rez1 + 10000, (z + overlap) * rez1 + seed + 10000);
  }

  function calculateTreeChance(x, z) {
    return random(-2, 2) +
    noise((x + overlap) * rez1 + 20000, (z + overlap) * rez1 + seed + 20000) * 14;
  }
  

function randomColor(type, h) {
  let colorRange = colorModifiers[type];
  if (type === 'grass' || type === 'water') {
    let additionalModifier;
    // Change color based on time of day
    switch(timeOfDay) {
      case 'morning':
        additionalModifier = 10;  // makes color a bit brighter
        break;
      case 'afternoon':
        additionalModifier = 0; // no change in color
        break;
      case 'evening':
        additionalModifier = -10;  // makes color a bit darker
        break;
      case 'night':
        additionalModifier = -20;  // makes color much darker
        break;
    }
    return [h * colorRange[0] + colorRange[1] + random(-colorRange[1], colorRange[1]) + additionalModifier,
      h * colorRange[2] + colorRange[3] + random(-colorRange[3], colorRange[3]),
      h * colorRange[4] + colorRange[5] + random(-colorRange[5], colorRange[5]),
      100];
  } else {
    // for stone, trunk, leaves color
    return [random(colorRange[0], colorRange[1]), random(colorRange[2], colorRange[3]), random(colorRange[4], colorRange[5])];
  }
}
