
let moreColors = true; // false - use 1 color palette; true - combine 3 color changes
let size = 10;
let overlap = 550; //550 for full landscape - lower for quicker render but might show blank space
let depth = 400;
let water = 6;
let treeLine = -70;
let terrRange, terrHeight, rez1, rez2, cam, seed, sw, alph;
let distort = true;
let shiftColor = true;
let hsbMode = false;
let iter = 0; // re-sampling times; 0 = no tile sampling;
let tileVariance = 3.9; // 1 = tiles all same size; 3.9 means tiles can get 3x bigger
let rotating = false;
let chance = 0.5; // out of 1; higher chance = more whitespace 0.5 default; sometimes stopping & restarting gets different results;

let rez3 = 0.4;
let noiseFactor = 0;
let table, palette;
let sF, bg, img, canv, canv2, canv3, canvas2, numImages, img1,img2,img3;

function preload() {
  table = loadTable("colors.csv", "csv", "header");
}

function setup() {
  pixelDensity(1);
  alph = random(30,90);
  let fullAlph = random(4);
  if (fullAlph<1){alph = 100}
  sw = floor(random(1.99));
  terrRange = random(60, 180);
  terrHeight = random(-15, 5);
  rez1 = random(0.002, 0.02); //bumpy terrain
  rez2 = random(0.001, 0.009); //gradual elevation
  canv = createCanvas(700, 500);
  canv2 = createGraphics(width, height, WEBGL);
  canv.mousePressed(setup);
  noLoop();
  canv2.colorMode(HSB, 360, 100, 100, 100);
  cam = canv2.createCamera();
  let saveButton = createButton("save jpg");
  saveButton.position(10, height + 25);
  saveButton.mousePressed(saveArt);
  let repeatButton = createButton("repeat view");
  repeatButton.position(100, height + 25);
  repeatButton.mousePressed(multipleImages);
  seed = millis() * 10000; //to vary noise
  cam.camera(0,random(-80,-500),random(-50,-300),random(-50,50),random(-100,250),0,0,1,0);
  //cam.camera(0,-250,-400,0,0,0,0,1,0); //overview
  canv2.background(220, 100, 100);
  let squareDivision = size/floor(random(1,2.9));
  for (x = -overlap-width/2; x < width/2 + overlap; x += squareDivision) {
    for (z = -overlap-depth/2; z < depth/2 + overlap; z += squareDivision) {
      let yn1 =
        (noise(x * rez1 + seed, z * rez1 + seed)-0.5) * terrRange //bumpy noise
      let yn2 =
        (noise(x * rez2 + seed, z * rez2 + seed)-0.5) * terrRange * 2 //gradual elevation
      y = yn1 + yn2 + terrHeight;
      h = noise(
        (x + overlap) * rez1 + 10000,
        (z + overlap) * rez1 + seed + 10000
      ); //noise for grass color
      if (y > water) {
        canv2.fill(random(230, 245), 100, random(50, 90),alph);  //water colors
        y = water;
        canv2.noStroke();
      } else {
        //canv2.noStroke();
        canv2.stroke(0,0,0);
          canv2.strokeWeight(sw);
        canv2.fill(
          h * 50 + 110 + random(-5, 5),
          h * 30 + 90 + random(-5, 5),
          h * 85 + 35 + random(-5, 5),
          alph   //grass colors
        );
      }
      canv2.push();
      canv2.translate(x, y, z);
      if (y > treeLine) {
        canv2.box(size, size * 3, size); //grass or water
        canv2.translate(0, size, 0);
      }
      canv2.fill(random(180, 220), random(10, 30), random(30, 50),alph); //stone colors
      canv2.box(size, size * 4, size); //stones
      let treeChance =
        random(-2, 2) +
        noise(
          (x + overlap) * rez1 + 20000,
          (z + overlap) * rez1 + seed + 20000
        ) *
          14;
      if (y < water && y > treeLine && treeChance > 9.5) {
        let treeSize = random(0.5, 1.2) * size;
  canv2.translate(0, -treeSize*4, 0);
  canv2.fill(0, random(70, 80), random(20, 40),alph); //trunk color
  canv2.noStroke();
  canv2.cylinder(treeSize / 3, treeSize * 2);
  canv2.stroke(0.5);
  canv2.strokeWeight(sw);
  canv2.translate(-treeSize, -treeSize, -treeSize);
  let treeColor = random (2);
        if (treeColor<1){
  canv2.fill(random(110, 130), random(70, 100), random(20, 40),alph)} //green leaves
  else {
  canv2.fill(random(40), 100, random(80,90),alph)} //fall leaves
  // fill in the tree:
  for (i=0;i<2;i++){
  for (j=0;j<3;j++){
    for (k=0;k<3;k++){
      canv2.box(treeSize);
      canv2.translate(0,0,treeSize)
    }
    canv2.translate(treeSize,0,-treeSize*3)
  } canv2.translate(-treeSize*3,-treeSize,0)
  }
  canv2.translate(treeSize,0,treeSize);
  canv2.box(treeSize)  
      }
      canv2.pop();
  }
  }
  multipleImages();
}

function multipleImages(){
  numImages = 0;
  canvas2 = createGraphics(width, height);
  img1 = createGraphics(width, height);
  img2 = createGraphics(width, height);
  img3 = createGraphics(width, height);  
  colorChange()
}

function colorChange(){
  canv3 = createGraphics(width,height);
  canv3.clear();
  canv3.image(canv2, 0, 0);
  let shiftFactor = null;
  shiftFactor = floor(random(2,20)); // 2-20; low means more color merging - broad swaths; high results in detail / noisy;
  sF = 360 / shiftFactor;
  bg = null;
  bg = color(random(100));
  palette = null;
  palette = floor(random(676)); // 39 test
  let blurAmt = null;
  blurAmt = random(2, 5); //2 def - smaller is less blur
  let posterAmt = null;
  posterAmt = random(5, 15); //2 to 255; 13 def - lower is more posterized
  let posterGo = null;
  posterGo = random(2);
  if (distort == true) {
    canv3.filter(BLUR, blurAmt);
    if (posterGo < 1){
    canv3.filter(POSTERIZE, posterAmt)}
  }

  if (shiftColor == true) {
    if (hsbMode == true) {
      canv3.colorMode(HSB, 360, 128, 100, 255);
      bg*=0.5;
    }
    else {canv3.colorMode(RGB,255,255,255,255)}
    canv3.loadPixels();
    for (x = 0; x < width; x++) {
      for (y = 0; y < height; y++) {
        let col = canv3.get(x, y);
        let col2;
        let pos = (x + y * width) * 4;
        huey = hue(col);
        let dec = huey / sF - floor(huey / sF);
        if (dec < 0.2) {
          col2 = 0;
        } else if (dec < 0.4) {
          col2 = 1;
        } else if (dec < 0.6) {
          col2 = 2;
        } else if (dec < 0.8) {
          col2 = 3;
        } else {
          col2 = 4;
        }
        canv3.pixels[pos + 0] = table.get(palette, col2 * 3);
        canv3.pixels[pos + 1] = table.get(palette, col2 * 3 + 1);
        canv3.pixels[pos + 2] = table.get(palette, col2 * 3 + 2);
      }
    }
    canv3.updatePixels();
  }

  if (moreColors == true){
if (numImages==2){
    img3 = canv3;
    clear();
    loadPixels();
  for (x=0;x<width;x++){
    for (y=0;y<height;y++){
      let col1 = img1.get(x,y);
      let col2 = img2.get(x,y);
      let col3 = img3.get(x,y);
      let pix = (x + y * width) * 4;
      pixels[pix] = (col1[0]+col2[0]+col3[0])/3;
      pixels[pix+1] = (col1[1]+col2[1]+col3[1])/3;
      pixels[pix+2] = (col1[2]+col2[2]+col3[2])/3;
      pixels[pix+3] = 255;
    }
  }
  updatePixels();
}
  else if (numImages==1){
    img2 = canv3;
    numImages++;
   colorChange()
  }
  else if (numImages==0){
    img1 = canv3;
    numImages++;
    colorChange()
  }
  }
  else {
    image(canv3,0,0)
  }
  
  //if (iter == 0){image(img, 0, 0)}
if (iter>0 && numImages == 2){
  let tileWidth = random(20, width / 6);
  let tileHeight = random(20, height / 6);
  let frame = 20;
  let padding = random(0, 20);
  let tilesAcross = floor((width - frame * 2) / (tileWidth + padding));
  let tilesDown = floor((height - frame * 2) / (tileHeight + padding));
  canvas2.clear();
  if (iter > 0) {
    canvas2.background(bg);
  }
  canvas2.angleMode(DEGREES);
  canvas2.noFill();
  canvas2.stroke(bg);
  canvas2.strokeWeight(padding);
  let extraWidth = round(
    (width - (tilesAcross * (tileWidth + padding) + frame * 2 - padding)) / 2
  );
  let extraHeight = round(
    (height - (tilesDown * (tileHeight + padding) + frame * 2 - padding)) / 2
  );

  for (k = 0; k < iter; k++) {
    for (i = tilesAcross; i > -1; i--) {
      for (j = tilesDown; j > -1; j--) {
        let showRand = noise(i * rez3 + noiseFactor, j * rez3 + noiseFactor);
        if (showRand > chance) {
          let tileXsize = floor(random(1, tileVariance));
          let tileYsize = floor(random(1, tileVariance));
          tileXend = tileWidth * tileXsize + (tileXsize - 1) * padding;
          tileYend = tileHeight * tileYsize + (tileYsize - 1) * padding;
          tile = get(
            floor(random(width - tileXend)),
            floor(random(height - tileYend)),
            tileXend,
            tileYend
          );
          let x = i * (tileWidth + padding) + frame + extraWidth;
          let y = j * (tileHeight + padding) + frame + extraHeight;
          canvas2.push();
          canvas2.translate(x + tileWidth / 2, y + tileHeight / 2);
          if (rotating == true) {
            let tilerot = random(6);
            if (tilerot < 0.5) {
              canvas2.rotate(45);
            } else if (tilerot < 1) {
              canvas2.rotate(-45);
            } else if (tilerot < 2) {
              canvas2.rotate(180);
            } else if (tilerot < 3) {
              canvas2.rotate(-90);
            } else if (tilerot < 4) {
              canvas2.rotate(90);
            }
          }
          canvas2.rect(
            -tileWidth / 2 - padding / 2,
            -tileHeight / 2 - padding / 2,
            tileXend + padding,
            tileYend + padding
          );
          canvas2.image(tile, -tileWidth / 2, -tileHeight / 2);
          canvas2.pop();
        }
      }
    }
  }
  canvas2.fill(bg);
  canvas2.noStroke();
  if (iter > 0) {
    canvas2.rect(width - frame - extraWidth, 0, width, height);
    canvas2.rect(0, height - frame - extraHeight, width, height);
    canvas2.rect(0, 0, frame + extraWidth, height);
    canvas2.rect(0, 0, width, frame + extraHeight);
  }
  let finalFilter = null;
  finalFilter = random(2.5);
  if (finalFilter < 1){
  canvas2.filter(BLUR, 1); // 1 to 5
  canvas2.filter(POSTERIZE, 5)} // 2 to 5
  canvas2.fill(bg)
  clear();
  image(canvas2,0,0)
}
}

function saveArt() {
  save("myCanvas.jpg");
}
