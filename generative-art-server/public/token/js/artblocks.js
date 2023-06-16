
function randomHash(nChar) {
    // convert number of characters to number of bytes
    var nBytes = Math.ceil(nChar = (+nChar || 8) / 2);

    // create a typed array of that many bytes
    var u = new Uint8Array(nBytes);

    // populate it with crypto-random values
    window.crypto.getRandomValues(u);

    // convert it to an Array of Strings (e.g. "01", "AF", ..)
    var zpad = function (str) {
        return '00'.slice(str.length) + str
    };
    var a = Array.prototype.map.call(u, function (x) {
        return zpad(x.toString(16))
    });

    // Array of String to String
    var str = a.join('').toUpperCase();
    // and snip off the excess digit if we want an odd number
    if (nChar % 2) str = str.slice(1);

    // return what we made
    return str;
}

// tokenData will be injected
let tokenData = {"hash":"0x"+randomHash(64),"tokenId":"61012305230532"};  
//let tokenData = {"hash":"0x"+"A0611121111135B353015285144C3D866ADCF3FF07FF3E7AB2192B41F010FFFF","tokenId":"61012305230532"};


let seed = parseInt(tokenData.hash.slice(0, 16), 16);
let dim;
let faceData = [];


// Generative Properties

// labeled ints
let leftSilhouetteStyle;
let rightSilhouetteStyle;
let colorSortStyle; // currently unused
let colorBlendStyle;
let numKnots;
let backgroundStyle;
let backgroundLightness;


// labeled booleans
let leftFlipped;
let rightFlipped;
let rotate90;
let faceLines;
let connectLines;
let attached;
let opposites;
let weaveLines;



// unlabeled ranges
let faceSimilarity;
let rootHue;
let bgSaturation;
let bgBrightness;
let hueDifference;
let lineSaturation;
let lineBrightness;
let rowEntropy;
let attachmentMultiplier;
let edgeBoldness;
let connectBoldness;
let rightStrength;
let colorAdjustFactor;
let spacingMultiplier;

/*
Global Variable creation from random seed
*/

function generateUnlabeledVariable(numMin, numMax, power) {
  if (numMin == numMax) {return numMin}
  if (numMax == 0) {numMax = -0.00000001}
  let initialRandom = range(numMin, numMax);
  return ((initialRandom/numMax) ** power) * numMax;
}

function generateLabeledVariable(numMin, numMax, weights) {
    let i;

    for (i = 0; i < weights.length; i++) {
      weights[i] += weights[i - 1] || 0;
    }
    
    let randomTry = rnd() * weights[weights.length - 1];
    
    for (i = 0; i < weights.length; i++) {
      if (weights[i] > randomTry) {
        break;
      }
    }
  
    return numMin + i;
}

function initializeVariables() {
  
  //Labeled variables. Each possible discrete value will have a corresponding label, e.g. "Style 1"
  leftSilhouetteStyle = generateLabeledVariable(0, 2, [2500, 2500, 2500]);
  rightSilhouetteStyle = generateLabeledVariable(0, 2, [2500, 2500, 2500]);
  colorSortStyle = generateLabeledVariable(0, 3, [2500, 2500, 2500, 2500]);
  //colorBlendStyle = generateLabeledVariable(0, 5, [2500, 2500, 2500, 2500, 2500, 2500]);
  colorBlendStyle = 0;
  backgroundStyle = generateLabeledVariable(0, 3, [2500, 2500, 2500, 2500]);
  //backgroundStyle = 2;
  backgroundLightness = generateLabeledVariable(0, 3, [1000, 1000, 500000, 1000]);
  
  //Labeled variables (boolean).
  numKnots = generateLabeledVariable(0, 3, [7500, 1200, 800, 500]);
  leftFlipped = generateLabeledVariable(0, 1, [9000, 1000]);
  rightFlipped = generateLabeledVariable(0, 1, [9000, 1000]);
  rotate90 = generateLabeledVariable(0, 1, [9200, 800]);
  faceLines = generateLabeledVariable(0, 1, [500, 9500]);
  //connectLines = generateLabeledVariable(0, 1, [300, 9700]);
  connectLines = 1;
  attached = generateLabeledVariable(0, 1, [4000, 6000]);
  opposites = generateLabeledVariable(0, 1, [8000, 2000]);
  weaveLines = generateLabeledVariable(0, 1, [5000, 5000]);

  //Unlabeled variables. Each property will simply be represented by a number. Properties may have an exponential distribution.
  faceSimilarity = generateUnlabeledVariable(1, 1, 1);
  rootHue = generateUnlabeledVariable(0, 360, 1); // hue is up to 360


  switch (backgroundLightness) {
    case 0:
      bgBrightness = generateUnlabeledVariable(0, 5, 1); // brightness is up to 100
      bgSaturation = generateUnlabeledVariable(30, 70, 1); // saturation is up to 100
      break;
    case 1:
      bgBrightness = generateUnlabeledVariable(5, 10, 1); // brightness is up to 100
      bgSaturation = generateUnlabeledVariable(50, 100, 1); // saturation is up to 100
      break;
    case 2:
      bgBrightness = generateUnlabeledVariable(95, 100, 1); // brightness is up to 100
      bgSaturation = generateUnlabeledVariable(50, 100, 1); // saturation is up to 100
      break;
    case 3:
      bgBrightness = generateUnlabeledVariable(98, 100, 1); // brightness is up to 100
      bgSaturation = generateUnlabeledVariable(20, 50, 1); // saturation is up to 100
      break;
    default:
      bgBrightness = generateUnlabeledVariable(0, 5, 1); // brightness is up to 100
      bgSaturation = generateUnlabeledVariable(0, 10, 1); // saturation is up to 100
      break;
  }
  hueDifference = generateUnlabeledVariable(0, 15, 2); // this can be up to 360, but should be <= 90
  //hueDifference = 0;
  if (opposites) {
    hueDifference = 35;
  }
  lineSaturation = generateUnlabeledVariable(90, 100, 1); // saturation is up to 100
  lineBrightness = generateUnlabeledVariable(90, 100, 1); // brightness is up to 100
  rowEntropy = generateUnlabeledVariable(0.0, 1.0, 1); // 0.0 = all row colors the same, 1.0 = all row colors randomly shuffled
  if (attached) {
    attachmentMultiplier = generateUnlabeledVariable(0.0, 1.0, 0.20); // 0 = normal distance, 1 = extreme closeness 
  } else {
    attachmentMultiplier = generateUnlabeledVariable(0.0, 1.0, 2); // 0 = normal distance, 1 = extreme distance 
  }
  
  if (attached) {
    connectBoldness = 1.0;
    edgeBoldness = generateUnlabeledVariable(0.4, 1.0, 1);
  } else {
    connectBoldness = generateUnlabeledVariable(0.1, 0.3, 1);
    edgeBoldness = 1.0;
  }
  rightStrength = 0.5;
  colorAdjustFactor = rangeFloor(6, 20) * (6  - (opposites * 5)); // if opposites, then adjust colors less
  spacingMultiplier = generateUnlabeledVariable(0.008, 0.022, 1);
  
}
// -----------------------------------------------------------------------------------------------------


  function gradientLine(ctx, x1, y1, x2, y2, c1, c2, lineWidth) {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, c1);
    gradient.addColorStop(1, c2);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }


// -----------------------------------------------------------------------------------------------------
/*
P5.js required functions
*/
function setup() {
  initializeVariables();
  dim = Math.min(windowWidth, windowHeight);
  createCanvas(dim, dim);
  faceData = createFaceData();  
  drawFace(0, 0, dim);

}

function draw() {

}
// -----------------------------------------------------------------------------------------------------





// -----------------------------------------------------------------------------------------------------
/*
  Project-specific drawing functions
*/
function createFaceData() {
  let allFaceData = [];  
  let faceArray0 = [10, 14, 18, 21, 22, 24, 25, 26, 27, 28, 29, 30, 30, 31, 32, 32, 33, 34, 35, 36, 36, 37, 37, 38, 39, 39, 40, 40, 41, 41, 42, 42, 43, 43, 43, 43, 44, 44, 44, 44, 45, 45, 45, 45, 45, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 45, 45, 45, 45, 45, 44, 44, 44, 43, 43, 43, 42, 41, 41, 40, 40, 39, 39, 38, 38, 38, 38, 38, 38, 38, 38, 38, 39, 39, 39, 40, 40, 41, 41, 42, 42, 43, 44, 44, 45, 46, 46, 47, 48, 49, 49, 50, 51, 52, 52, 53, 54, 55, 56, 56, 57, 58, 59, 60, 60, 61, 62, 62, 62, 62, 61, 61, 60, 60, 59, 57, 56, 52, 51, 50, 50, 50, 50, 51, 51, 51, 52, 52, 53, 54, 55, 55, 55, 55, 55, 54, 54, 53, 53, 52, 51, 50, 48, 47, 47, 47, 48, 49, 49, 50, 51, 51, 51, 51, 51, 50, 50, 49, 48, 46, 44, 44, 43, 43, 43, 43, 43, 43, 44, 44, 43, 43, 43, 43, 42, 42, 41, 41, 40, 39, 37, 35, 28, 24, 20, 17];

  // eventually this will use different data  
  let faceArray1 = [25, 28, 29, 27, 26, 26, 26, 26, 27, 26, 26, 25, 23, 22, 23, 25, 26, 27, 28, 29, 30, 30, 31, 31, 32, 32, 33, 33, 34, 35, 36, 36, 37, 37, 38, 38, 39, 39, 39, 40, 40, 40, 41, 41, 41, 41, 42, 42, 42, 42, 43, 43, 43, 43, 43, 43, 42, 42, 41, 40, 40, 39, 39, 38, 37, 36, 35, 34, 34, 33, 35, 37, 34, 33, 33, 34, 36, 34, 35, 35, 36, 36, 37, 37, 38, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 49, 50, 51, 52, 53, 54, 56, 57, 58, 59, 60, 60, 61, 61, 62, 62, 62, 62, 61, 61, 61, 61, 59, 58, 57, 56, 53, 51, 49, 47, 46, 45, 45, 45, 45, 45, 45, 45, 46, 46, 46, 47, 47, 48, 48, 49, 50, 49, 48, 48, 47, 45, 43, 41, 42, 43, 45, 46, 47, 46, 45, 45, 44, 43, 43, 42, 42, 41, 41, 40, 40, 40, 39, 39, 40, 40, 40, 41, 41, 41, 41, 41, 41, 41, 41, 41, 40, 40, 40, 39, 39, 39, 38, 37, 37, 36, 33, 30, 28, 23, 12];

  // eventually this will use different data  
  let faceArray2 = [29, 29, 29, 28, 28, 27, 28, 28, 29, 29, 29, 30, 30, 31, 32, 32, 33, 34, 35, 36, 36, 37, 37, 38, 39, 39, 40, 40, 41, 41, 42, 42, 43, 43, 43, 43, 44, 44, 44, 44, 45, 45, 45, 45, 45, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 45, 45, 45, 45, 45, 44, 44, 44, 43, 43, 43, 42, 41, 41, 40, 40, 39, 39, 38, 38, 38, 38, 38, 38, 38, 38, 38, 39, 39, 39, 40, 40, 41, 41, 42, 42, 43, 44, 44, 45, 46, 46, 47, 48, 49, 49, 50, 51, 52, 52, 53, 54, 55, 56, 56, 57, 58, 59, 60, 60, 61, 62, 62, 62, 62, 61, 61, 60, 60, 59, 57, 56, 52, 51, 50, 50, 50, 50, 51, 51, 51, 52, 52, 53, 54, 55, 55, 55, 55, 55, 54, 54, 53, 53, 52, 51, 50, 48, 47, 47, 47, 48, 49, 49, 50, 51, 51, 51, 51, 51, 50, 50, 49, 48, 46, 44, 44, 43, 43, 43, 43, 43, 43, 44, 44, 43, 43, 43, 43, 42, 42, 41, 41, 40, 39, 37, 35, 28, 24, 20, 17];

  // eventually this will use different data  
  let faceArray3 = [10, 14, 18, 21, 22, 24, 25, 26, 27, 28, 29, 30, 30, 31, 32, 32, 33, 34, 35, 36, 36, 37, 37, 38, 39, 39, 40, 40, 41, 41, 42, 42, 43, 43, 43, 43, 44, 44, 44, 44, 45, 45, 45, 45, 45, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 45, 45, 45, 45, 45, 44, 44, 44, 43, 43, 43, 42, 41, 41, 40, 40, 39, 39, 38, 38, 38, 38, 38, 38, 38, 38, 38, 39, 39, 39, 40, 40, 41, 41, 42, 42, 43, 44, 44, 45, 46, 46, 47, 48, 49, 49, 50, 51, 52, 52, 53, 54, 55, 56, 56, 57, 58, 59, 60, 60, 61, 62, 62, 62, 62, 61, 61, 60, 60, 59, 57, 56, 52, 51, 50, 50, 50, 50, 51, 51, 51, 52, 52, 53, 54, 55, 55, 55, 55, 55, 54, 54, 53, 53, 52, 51, 50, 48, 47, 47, 47, 48, 49, 49, 50, 51, 51, 51, 51, 51, 50, 50, 49, 48, 46, 44, 44, 43, 43, 43, 43, 43, 43, 44, 44, 43, 43, 43, 43, 42, 42, 41, 41, 40, 39, 37, 35, 28, 24, 20, 17];
  
  allFaceData.push(faceArray0);
  allFaceData.push(faceArray1);
  allFaceData.push(faceArray2);
  //allFaceData.push(faceArray3);
  
  return allFaceData;
}

function drawFace(regX, regY, imageDim) {
  
  push();
  translate(regX, regY);
  
  let leftArray = [];
  let rightArray = [];
  
  leftArray = [...faceData[leftSilhouetteStyle]];
  rightArray = [...faceData[rightSilhouetteStyle]];
   
   
  if (leftFlipped) {
    leftArray.reverse();
  }
  if (rightFlipped) {
    rightArray.reverse();
  }
  
  let spacing = spacingMultiplier * imageDim;
  let numLines = Math.round((imageDim) / spacing);
  let endYArray = Array.from(Array(numLines).keys()); // fill an array with 0 to numLines

  let unattachedDistanceMin = 0.00;
  let unattachedDistanceMax = -0.06;
  let attachedDistanceMin = -0.04;
  let attachedDistanceMax = 0.40;
  let faceDistance;
  console.log("attached: " + attached);
  if (attached) {
    faceDistance = map(attachmentMultiplier, 0, 1, attachedDistanceMax, attachedDistanceMin);
  } else {
    faceDistance = map(attachmentMultiplier, 0, 1, unattachedDistanceMax, unattachedDistanceMin);
  }
  if (faceDistance >= 0.20) {    
    numKnots = 0;
    rowEntropy = range(0, 0.5);
  }
  if (faceDistance >= 0.30) {
    connectLines = false;
    rowEntropy = 0;
  }

  let startX = imageDim * faceDistance;
  let endX = imageDim - (imageDim * faceDistance);
  
  let stretchFactor = 0.65 + range(0, rowEntropy * 1.25); 
  let faceDepthMultiplier = imageDim * range(0.005, 0.0065);
  let leftShear = imageDim * range(-0.0010, 0.0010);
  let rightShear = -leftShear;
  if (leftFlipped != rightFlipped) {
    leftShear *= -1;
  }
  
  colorMode(HSB);

  hueDifference *= (rnd() < 0.5 ? -1 : 1);
  let leftHue = rootHue + hueDifference;
  let rightHue = rootHue - hueDifference;
  let leftBaseColor = color(leftHue, lineSaturation, lineBrightness);
  let rightBaseColor = color(rightHue, lineSaturation, lineBrightness);
  let backgroundColor1 = color(rootHue + range(-30,30), bgSaturation  + range(-30,30), bgBrightness);
  let backgroundColor2 = color(rootHue + range(-30,30), bgSaturation  + range(-30,30), bgBrightness);
  let shadowColor = color(0,0,0,0.2);
  
  colorMode(RGB);
  let bgStrokeColor = lerpColor(leftBaseColor, rightBaseColor, 0.5);
  console.log(bgStrokeColor);
  colorMode(HSB);

  shuffleArrayEntropy(endYArray, rowEntropy);
  
  angleMode(DEGREES);
  
  if (rotate90) {
    translate(imageDim, 0);
    rotate(90);
  }
  
  // ------ Draw Background Content ------
  
  let bgWeaveWidth = spacing * 2;
  
      let currentBeginTargetX;
      let currentBeginTargetY;
      let currentBeginStretchX;
      let currentBeginStretchY;
      let currentEndTargetX;
      let currentEndTargetY;
      let currentEndStretchX;
      let currentEndStretchY;
      let curBGWeaveWidth;
      let bgStrokeDensity;

  
  noFill();
  switch (backgroundStyle) {
    case 0: // top-down gradient
      setGradient(0, 0, imageDim, imageDim, backgroundColor1, backgroundColor2, "Y", range(1,3));
      break;
    case 1: // bottom-top gradient
      setGradient(0, 0, imageDim, imageDim, backgroundColor2, backgroundColor1, "Y", range(1,3));
      break;
    case 2: // Dense crazy ribbons behind faces
      bgStrokeDensity = rangeFloor(10,400);

      setGradient(0, 0, imageDim, imageDim, backgroundColor1, backgroundColor2, "Y", range(1,3));
      for (let j = 0; j < bgStrokeDensity; j++) {
        let bgWeaveWidthVariation = range(0.1,5);
        let curAlpha = generateUnlabeledVariable(0.0,0.1,1);
        colorMode(HSL);
        let curBGWeaveColor = color(hue(bgStrokeColor) + rangeFloor(-2, 5) * 20, saturation(bgStrokeColor) * 1, range(50,95), curAlpha);
        colorMode(HSB);
        console.log(curBGWeaveColor);
        let curStretchAdjust = range(-spacing*40, spacing*40);
        let curStretch = imageDim * range(0.01,0.3);
        strokeWeight(bgWeaveWidth * bgWeaveWidthVariation);
        curBGWeaveWidth = bgWeaveWidth * range(-0.25, 4);
        currentBeginTargetX = rnd() < 0.5 ? range(0,imageDim) : rangeFloor(0,2) * imageDim;
        currentBeginTargetY = currentBeginTargetX % imageDim == 0 ? range(0,imageDim/2) : 0;
        currentBeginStretchX = currentBeginTargetX + curStretchAdjust;
        currentBeginStretchY = currentBeginTargetY + curStretch;
        currentEndTargetX = rnd() < 0.5 ? range(0,imageDim) : rangeFloor(0,2) * imageDim;
        currentEndTargetY = currentEndTargetX % imageDim == 0 ? range(imageDim/2, imageDim) : imageDim;
        currentEndStretchX = currentEndTargetX - curStretchAdjust;
        currentEndStretchY = currentEndTargetY - curStretch;
        strokeWeight(curBGWeaveWidth);
        stroke(curBGWeaveColor);
        bezier(
          currentBeginTargetX,
          currentBeginTargetY,
          currentBeginStretchX,
          currentBeginStretchY,
          currentEndStretchX,
          currentEndStretchY,
          currentEndTargetX,
          currentEndTargetY
        ); 
      }
      break;
    case 3: // less crazy lines behind faces
      bgStrokeDensity = rangeFloor(10, 80);
      colorMode(HSL);
      backgroundColor1 = color(hue(backgroundColor1) + range(-40, 40), saturation(backgroundColor1), bgBrightness * 0.8);
      backgroundColor2 = color(hue(backgroundColor2) + range(-40, 40), saturation(backgroundColor2), bgBrightness * 0.8);
      colorMode(HSB);
      setGradient(0, 0, imageDim, imageDim, backgroundColor2, backgroundColor1, "Y", range(1,3));
      for (let j = 0; j < bgStrokeDensity; j++) {
        let bgWeaveWidthVariation = range(0.1,20);
        let curAlpha = generateUnlabeledVariable(0.0,0.15,1);
        colorMode(HSL);
        let curBGWeaveColor = color(hue(bgStrokeColor) + rangeFloor(-10, 20) * 5, saturation(bgStrokeColor) * 1, range(50,95), curAlpha);
        colorMode(HSB);
        console.log(curBGWeaveColor);
        let curStretchAdjust = 0;
        let curStretch = imageDim * range(0.01,0.3);
        strokeWeight(bgWeaveWidth * bgWeaveWidthVariation);
        curBGWeaveWidth = bgWeaveWidth * range(-0.25, 4);
        currentBeginTargetX = rnd() < 0.5 ? range(0,imageDim) : rangeFloor(0,2) * imageDim;
        currentBeginTargetY = currentBeginTargetX % imageDim == 0 ? range(0,imageDim/2) : 0;
        currentBeginStretchX = currentBeginTargetX + curStretchAdjust;
        currentBeginStretchY = currentBeginTargetY + curStretch;
        currentEndTargetX = rnd() < 0.5 ? range(0,imageDim) : rangeFloor(0,2) * imageDim;
        currentEndTargetY = currentEndTargetX % imageDim == 0 ? range(imageDim/2, imageDim) : imageDim;
        currentEndStretchX = currentEndTargetX - curStretchAdjust;
        currentEndStretchY = currentEndTargetY - curStretch;
        strokeWeight(curBGWeaveWidth);
        stroke(curBGWeaveColor);
        bezier(
          currentBeginTargetX,
          currentBeginTargetY,
          currentBeginStretchX,
          currentBeginStretchY,
          currentEndStretchX,
          currentEndStretchY,
          currentEndTargetX,
          currentEndTargetY
        );
      }
      break;
    case 4: // ????
      break;
    case 5: // ????
      break;
    default: // ????
      break;
  }

      
  // ------ Draw Foreground Content ------
  
  // if weaving lines, draw the foreground in 2 passes so that the accent lines can weave randomly in between the lines

  let weaveColor;
  let passes = weaveLines + 1; // 2 passes if weaveLines is true, 1 if not
  let weaveCounter = 0;

  noFill(); 

  for (let currentPass = 0; currentPass < passes; currentPass++) {
    console.log("currentPass: " + currentPass);
  
    for (let i = currentPass; i < numLines; i+= passes) {
      console.log("line: " + i);
      let curIndex;
      let leftFaceX;
      let leftFaceY;
      let rightFaceY;
      let rightFaceX;
      let stretch1;
      let leftColor;
      let rightColor;
      let curColor;
      let leftEdgeColor;
      let rightEdgeColor;
      let connectColor;
      let greenAdjust;
      let blueAdjust;
      let redAdjust;
      
      if (weaveLines) {
        curIndex = Math.round(endYArray[i] / numLines * leftArray.length);
        leftFaceX = startX + (leftArray[curIndex] * faceDepthMultiplier) + (leftShear * endYArray[i]);
        //leftFaceY = (spacing / 2) + (endYArray[i] * spacing);
        leftFaceY = (spacing / 2) + (endYArray[i] * spacing);
      } else {
        curIndex = Math.round(i / numLines * leftArray.length);  
        leftFaceX = startX + (leftArray[curIndex] * faceDepthMultiplier) + (leftShear * i);
        leftFaceY = (spacing / 2) + (i * spacing);
      }
      rightFaceY = (endYArray[i] * spacing);
      rightFaceX = Math.round(imageDim - startX - (rightArray[Math.round(endYArray[i] * (leftArray.length / numLines))] * faceDepthMultiplier) + (rightShear * endYArray[i]));
      stretch1 = (rightFaceX - leftFaceX) * stretchFactor;

      leftColor = color(leftHue, lineSaturation, lineBrightness);
      rightColor = color(rightHue, lineSaturation, lineBrightness);
      greenAdjust = range(-colorAdjustFactor * 0.5, colorAdjustFactor);
      blueAdjust = range(-colorAdjustFactor, colorAdjustFactor * 1.8);
      redAdjust = range(-colorAdjustFactor * 0.5, colorAdjustFactor);


      colorMode(HSB);

      leftColor.setGreen(green(leftColor) + greenAdjust);
      leftColor.setBlue(blue(leftColor) + blueAdjust);
      leftColor.setRed(red(leftColor) + redAdjust);
      rightColor.setGreen(green(rightColor) + greenAdjust);
      rightColor.setBlue(blue(rightColor) + blueAdjust);
      rightColor.setRed(red(rightColor) + redAdjust);

      switch(colorBlendStyle) {
        case 0: // 2 edge colors and connector is midpoint color
          connectColor = lerpColor(leftBaseColor, rightBaseColor, rightStrength);
          //connectColor = lerpColor(leftColor, rightColor, rightStrength);
          leftEdgeColor = leftColor;
          rightEdgeColor = rightColor;
          break;
        case 1: // left edge color overpowers connect color
          connectColor = leftColor;
          leftEdgeColor = leftColor;
          rightEdgeColor = rightColor;
          break;
        case 2: // right edge color overpowers connect color
          connectColor = rightColor;
          leftEdgeColor = leftColor;
          rightEdgeColor = rightColor;
          break;
        case 3: // both edges are the same color (left)
          connectColor = leftColor;
          leftEdgeColor = leftColor;
          rightEdgeColor = leftColor;
          break;
        case 4: // both edges are the same color (right)
          connectColor = rightColor;
          leftEdgeColor = rightColor;
          rightEdgeColor = rightColor;
          break;
        case 5: // all the same color (mix of left and right)
          connectColor = lerpColor(leftColor, rightColor, rightStrength);
          rightColor = connectColor;
          leftColor = connectColor;
          break;        
        default:
          connectColor = lerpColor(leftColor, rightColor, rightStrength);
          leftEdgeColor = leftColor;
          rightEdgeColor = rightColor;
          break;        
      }

      colorMode(RGB);
      
      let tempColor = connectColor;
      //connectColor = lerpColor(backgroundColor1, tempColor, connectBoldness);
      //connectColor = lerpColor(backgroundColor1, tempColor, 0.5);
      leftEdgeColor = lerpColor(backgroundColor1, leftEdgeColor, edgeBoldness);
      rightEdgeColor = lerpColor(backgroundColor1, rightEdgeColor, edgeBoldness);
      
      weaveColor = connectColor;
      //weaveColor = leftColor;
      //weaveColor.setRed(red(weaveColor) + redAdjust);
      //weaveColor = lerpColor(weaveColor, color(180,100,40), 0.2);


      colorMode(HSB);

      stroke(connectColor);
      strokeWeight(imageDim * 0.0015);
      noFill();

      let percentFromMiddle = Math.abs(numLines / 2 - i) / (numLines / 2);
      if (connectLines && (attached || (percentFromMiddle < attachmentMultiplier))) {
        if (numKnots == 0) {
          let currentRightTargetX = rightFaceX;
          let currentLeftTargetX = leftFaceX;
          let currentRightTargetY = rightFaceY;
          let currentLeftTargetY = leftFaceY;
          bezier(
            currentLeftTargetX,
            currentLeftTargetY,
            currentLeftTargetX + stretch1,
            currentLeftTargetY,
            currentRightTargetX - stretch1,
            currentRightTargetY,
            currentRightTargetX,
            currentRightTargetY
          );
        } else { 
          let targetAssetNum = Math.round(range(1, numKnots));
          let targetLineNum = Math.round(targetAssetNum * (numLines / (numKnots + 1)));
          let targetLeftX = startX + (leftArray[targetLineNum] * faceDepthMultiplier) + (leftShear * targetLineNum);
          let targetRightX = Math.round(imageDim - startX - (rightArray[targetLineNum] * faceDepthMultiplier) + (rightShear * targetLineNum));
          let stretch2 = ((targetRightX - targetLeftX) * 0.1 * stretchFactor) * range(1 - (rowEntropy * 0.2), 1 + (rowEntropy * 0.2));
          let targetX = ((targetLeftX + targetRightX) / 2) + (range(-stretch2, stretch2) * rowEntropy * 0.5);      
          let targetY = (imageDim / (numKnots + 1)) * targetAssetNum;


          beginShape();
          vertex(leftFaceX, leftFaceY); 
          bezierVertex(targetX + stretch2, leftFaceY, targetX + stretch2, targetY - (stretch2 * (leftFaceY / imageDim / 2)), targetX, targetY);
          bezierVertex(targetX - stretch2, targetY + (stretch2 * (leftFaceY / imageDim / 2)),  targetX - stretch2, rightFaceY, rightFaceX, rightFaceY); 
          vertex(rightFaceX, rightFaceY);
          endShape();


        }
      }    

      stroke(connectColor);

      if (connectLines && faceLines) {      
        strokeWeight(spacing * 8/16);
        line(leftFaceX - (spacing * 6/8), leftFaceY, leftFaceX + (spacing * -6/8), leftFaceY);
        line(rightFaceX - (spacing * -6/8), rightFaceY, rightFaceX + (spacing * 6/8), rightFaceY);
        strokeWeight(spacing * 7/16);    
        line(leftFaceX - (spacing * 5/8), leftFaceY, leftFaceX  + (spacing * -5/8), leftFaceY);
        line(rightFaceX - (spacing * -5/8), rightFaceY, rightFaceX + (spacing * 5/8), rightFaceY);
        strokeWeight(spacing * 6/16);    
        line(leftFaceX - (spacing * 4/8), leftFaceY, leftFaceX  + (spacing * -4/8), leftFaceY);
        line(rightFaceX - (spacing * -4/8), rightFaceY, rightFaceX + (spacing * 4/8), rightFaceY);
        strokeWeight(spacing * 5/16);    
        line(leftFaceX - (spacing * 3/8), leftFaceY, leftFaceX  + (spacing * -3/8), leftFaceY);
        line(rightFaceX - (spacing * -3/8), rightFaceY, rightFaceX + (spacing * 3/8), rightFaceY);
        strokeWeight(spacing * 4/16);
        line(leftFaceX - (spacing * 2/8), leftFaceY, leftFaceX + (spacing * -2/8), leftFaceY);
        line(rightFaceX - (spacing * -2/8), rightFaceY, rightFaceX + (spacing * 2/8), rightFaceY);
        strokeWeight(spacing * 5/32);    
        line(leftFaceX - (spacing * 2/16), leftFaceY, leftFaceX  + (spacing * -2/16), leftFaceY);
        line(rightFaceX - (spacing * -2/16), rightFaceY, rightFaceX + (spacing * 2/16), rightFaceY);
        strokeWeight(spacing * 3/32);    
        line(leftFaceX - (spacing * 1/16), leftFaceY, leftFaceX  + (spacing * -1/16), leftFaceY);
        line(rightFaceX - (spacing * -1/16), rightFaceY, rightFaceX + (spacing * 1/16), rightFaceY);
        strokeWeight(spacing * 1/32);    
        line(leftFaceX - (spacing * 0/16), leftFaceY, leftFaceX  + (spacing * -2/16), leftFaceY);
        line(rightFaceX - (spacing * -2/16), rightFaceY, rightFaceX + (spacing * 0/16), rightFaceY);
      }

      let gradientMultiple = attached ? 1 : 1.0;

      if (faceLines) {
        let stretch3 = (rightFaceX - leftFaceX) * stretchFactor;

        // left face shadow
        gradientLine(drawingContext, Math.round(leftFaceX - (spacing * 13/16)), leftFaceY + (spacing/4), 0, leftFaceY + (spacing/4), shadowColor, shadowColor, spacing/2);
        //setGradient(Math.round(leftFaceX - (spacing * 13/16)), leftFaceY - (spacing/4) + (spacing/4), Math.round(leftFaceX - (spacing * 13/16)), spacing/2, shadowColor, shadowColor, "Xrl", gradientMultiple);
        // left face lines
        gradientLine(drawingContext, Math.round(leftFaceX - (spacing * 13/16)), leftFaceY, 0, leftFaceY, connectColor, leftEdgeColor, spacing/2);
        //setGradient(Math.round(leftFaceX - (spacing * 13/16)), leftFaceY - (spacing/4), Math.round(leftFaceX - (spacing * 13/16)), spacing/2, connectColor, leftEdgeColor, "Xrl", gradientMultiple);

        if (weaveLines) {
          let curAlpha = generateUnlabeledVariable(0.0,0.1,3);
          let weaveWidth = spacing / 4;
          let weaveVariation = 0.6;
          let curWeaveColor = color(hue(weaveColor) + range(35,50), saturation(weaveColor) * 1, brightness(weaveColor) * 1, curAlpha);
          let curShadowColor = color(hue(shadowColor), saturation(shadowColor), brightness(shadowColor), alpha(shadowColor) * curAlpha);
          if (rnd() < 0.2 && (leftFaceY < imageDim * 0.10 || leftFaceY > imageDim * 0.90)) {
            curAlpha = generateUnlabeledVariable(0.8,1.0,1);
            curWeaveColor = color(hue(weaveColor) + range(25,40), saturation(weaveColor) * 1, brightness(weaveColor) * 1, curAlpha);
          }

          
          // weave shadow
          //setGradient(Math.round(leftFaceY + (spacing/4) + (spacing/16)), 0, spacing/8, imageDim, shadowColor, shadowColor, "Xrl", gradientMultiple);  
          // weave lines
          //setGradient(Math.round(leftFaceY + (spacing/4)), 0, spacing/8, imageDim, curWeaveColor, curWeaveColor, "Xrl", gradientMultiple);
          
          let currentBeginTargetX;
          let currentBeginTargetY;
          let currentBeginStretchX;
          let currentBeginStretchY;
          let currentEndTargetX;
          let currentEndTargetY;
          let currentEndStretchX;
          let currentEndStretchY;
          let curIndex2 = Math.round(endYArray[rangeFloor(0,numLines)] / numLines * leftArray.length);
          let curLeftX = startX + (leftArray[curIndex2] * faceDepthMultiplier) + (leftShear * endYArray[curIndex2]);
          let curRightX = Math.round(imageDim - startX - (rightArray[Math.round(endYArray[curIndex2] * (leftArray.length / numLines))] * faceDepthMultiplier) + (rightShear * endYArray[curIndex2]));
          //let curSideX = rnd() < 0.5 ? curLeftX : curRightX;
          let curSideX = Math.round(leftFaceY + (spacing/4));
          let otherSideX = rnd() < 0.5 ? curRightX : curLeftX;
          let weaveStyle = rangeFloor(0,2);
          let startLeft = curSideX < imageDim;
          console.log("weaveStyle: " + weaveStyle);
          
          switch (weaveStyle) {              
            case 0: // straight vertical lines
              currentBeginTargetX = curSideX;
              currentBeginTargetY = 0;
              currentBeginStretchX = curSideX;
              currentBeginStretchY = 0 + stretch3;
              currentEndStretchX = curSideX;
              currentEndStretchY = imageDim - stretch3;
              currentEndTargetX = curSideX;
              currentEndTargetY = imageDim;
              break;
            case 1: // slightly curvy vertical lines
              let curStretchAdjust = range(-spacing*40, spacing*40);
              currentBeginTargetX = curSideX;
              currentBeginTargetY = 0;
              currentBeginStretchX = curSideX + curStretchAdjust;
              currentBeginStretchY = 0 + stretch3;
              currentEndStretchX = curSideX - curStretchAdjust;
              currentEndStretchY = imageDim - stretch3;
              currentEndTargetX = curSideX;
              currentEndTargetY = imageDim;
              break;              
            case 6:
              currentBeginTargetX = curSideX;
              currentBeginTargetY = imageDim;
              currentBeginStretchX = curSideX;
              currentBeginStretchY = imageDim - stretch3;
              currentEndStretchX = rightFaceX - stretch3;
              currentEndStretchY = rightFaceY;
              currentEndTargetX = rightFaceX;
              currentEndTargetY = rightFaceY;
              break;
            case 7:
              currentBeginTargetX = curSideX;
              currentBeginTargetY = imageDim;
              currentBeginStretchX = curSideX;
              currentBeginStretchY = imageDim - stretch3;
              currentEndStretchX = leftFaceX + stretch3;
              currentEndStretchY = leftFaceY;
              currentEndTargetX = leftFaceX;
              currentEndTargetY = leftFaceY;
              break;
            case 8:
              currentBeginTargetX = curSideX;
              currentBeginTargetY = 0;
              currentBeginStretchX = curSideX;
              currentBeginStretchY = 0 + stretch3;
              currentEndStretchX = rightFaceX - stretch3;
              currentEndStretchY = rightFaceY;
              currentEndTargetX = rightFaceX;
              currentEndTargetY = rightFaceY;
              break;
            case 9:
              currentBeginTargetX = curSideX;
              currentBeginTargetY = 0;
              currentBeginStretchX = curSideX;
              currentBeginStretchY = 0 + stretch3;
              currentEndStretchX = leftFaceX + stretch3;
              currentEndStretchY = leftFaceY;
              currentEndTargetX = leftFaceX;
              currentEndTargetY = leftFaceY;
              break;
            case 10:
              currentBeginTargetX = curSideX;
              currentBeginTargetY = 0;
              currentBeginStretchX = curSideX;
              currentBeginStretchY = 0 + stretch3;
              currentEndStretchX = otherSideX;
              currentEndStretchY = imageDim - stretch3;
              currentEndTargetX = otherSideX;
              currentEndTargetY = imageDim;
              break;
            case 11:
              currentBeginTargetX = curSideX;
              currentBeginTargetY = 0;
              currentBeginStretchX = curSideX;
              currentBeginStretchY = 0 + stretch3;
              currentEndStretchX = otherSideX;
              currentEndStretchY = imageDim - stretch3;
              currentEndTargetX = otherSideX;
              currentEndTargetY = imageDim;
              break;
            default:
              currentBeginTargetX = curSideX;
              currentBeginTargetY = 0;
              currentBeginStretchX = curSideX;
              currentBeginStretchY = 0 + stretch3;
              currentEndStretchX = otherSideX;
              currentEndStretchY = imageDim - stretch3;
              currentEndTargetX = otherSideX;
              currentEndTargetY = imageDim;
              break;
          }
          //let currentTopTargetX = i * spacing;
          
          //strokeWeight(spacing/4);
          strokeWeight(weaveWidth + ((weaveWidth) * range(-0.50 * weaveVariation, 10 * weaveVariation)));
          stroke(curShadowColor);
          noFill();
          
          /*
          // weave shadow
          bezier(
            currentBeginTargetX + (spacing / 16),
            currentBeginTargetY,
            currentBeginStretchX + (spacing / 16),
            currentBeginStretchY,
            currentEndStretchX + (spacing / 16),
            currentEndStretchY,
            currentEndTargetX + (spacing / 16),
            currentEndTargetY
          );
          
          // weave
          stroke(curWeaveColor);
          bezier(
            currentBeginTargetX,
            currentBeginTargetY,
            currentBeginStretchX,
            currentBeginStretchY,
            currentEndStretchX,
            currentEndStretchY,
            currentEndTargetX,
            currentEndTargetY
          );
          */

        
        } 
        

        // right face shadows
        gradientLine(drawingContext, Math.round(rightFaceX + (spacing * 13/16)), rightFaceY + (spacing/4), imageDim, rightFaceY + (spacing/4), shadowColor, shadowColor, spacing/2);
        //setGradient(Math.round(rightFaceX + (spacing * 13/16)), rightFaceY - (spacing/4) + (spacing/4), Math.round(imageDim - rightFaceX - (spacing * 13/16)), spacing/2, shadowColor, shadowColor, "Xlr", gradientMultiple);
        // right face lines
        gradientLine(drawingContext, Math.round(rightFaceX + (spacing * 13/16)), rightFaceY, imageDim, rightFaceY, connectColor, leftEdgeColor, spacing/2);
        //setGradient(Math.round(rightFaceX + (spacing * 13/16)), rightFaceY - (spacing/4), Math.round(imageDim - rightFaceX - (spacing * 13/16)), spacing/2, connectColor, rightEdgeColor, "Xlr", gradientMultiple);
        weaveCounter++;
        console.log("weaveCounter: " + weaveCounter);
           
      }
    }    
  }
  
  pop();
}
// -----------------------------------------------------------------------------------------------------





// -----------------------------------------------------------------------------------------------------
/*
  Project-specific helper functions
*/

function setGradient(x, y, w, h, c1, c2, axis, power) {
  noFill();
  strokeWeight(1);
  colorMode(RGB);
  if (axis == "Y") { // Top to bottom gradient
    for (let i = y; i <= y + h; i++) {
      var inter = map(i, y, y + h, 0, 1);
      var c = lerpColor(c1, c2, Math.pow(inter, power));
      stroke(c);
      line(x, i, x + w, i);
    }
  } else if (axis == "Xlr") { // Left to right gradient
    for (let j = x; j <= x + w; j++) {
      var inter2 = map(j, x, x + w, 0, 1);
      var d = lerpColor(c1, c2, Math.pow(inter2, power));
      //var d = lerpColor(c1, c2, inter2);
      stroke(d);
      line(j, y, j, y + h);
    }
  } else if (axis == "Xrl") { // Right to left gradient
    for (let k = x; k >= x - w; k--) {
      var inter3 = map(k, x, x - w, 0, 1);
      var d = lerpColor(c1, c2, Math.pow(inter3, power));
      //var d = lerpColor(c1, c2, inter3);
      stroke(d);
      line(k, y, k, y + h);
    }
  }
  colorMode(HSB);
}


// shuffle the items in an array based on the amount of entropy. 0 = no shuffle, 1 = completely shuffled
function shuffleArrayEntropy(array, entropy) {
  for (let i = 0; i < array.length; i++) {
    let minIndex = i - Math.round(i * entropy);
    let maxIndex = i + Math.round((array.length - 1 - i) * entropy);
    const j = Math.round(range(minIndex, maxIndex));
    [array[i], array[j]] = [array[j], array[i]];

  }
}

function jiggleArray(array, jiggleAmount, jitter) {
  let curJiggle = range(-jiggleAmount, jiggleAmount);
  for (let i = 0; i < array.length; i++) {
    curJiggle += range(-jitter, jitter);
    array[i] += curJiggle;
  }
}
// -----------------------------------------------------------------------------------------------------





// -----------------------------------------------------------------------------------------------------
/*
  General helper functions
*/

function rnd () {
  seed ^= seed << 13
  seed ^= seed >> 17
  seed ^= seed << 5
  
  let result = (((seed < 0) ? ~seed + 1 : seed) % 1000) / 1000
  return result
}

function range (min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }

  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('Expected all arguments to be numbers');
  }

  return rnd() * (max - min) + min;
}

function rangeFloor (min, max) {
  if (max === undefined) {
    max = min
    min = 0
  }

  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('Expected all arguments to be numbers')
  }

  return Math.floor(range(min, max))
}
// -----------------------------------------------------------------------------------------------------



