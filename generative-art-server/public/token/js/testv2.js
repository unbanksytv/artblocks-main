// Utility function to generate a random hexadecimal string
const getRandomHex = (size) => {
  let result = "0x";
  const hexRef = "0123456789abcdefABCDEF";

  for (let n = 0; n < size; n++) {
    result += hexRef[Math.floor(Math.random() * hexRef.length)];
  }
  return result;
};

// Generate a random hash and store it in the token data
const tokenData = {
  hash: getRandomHex(40),
};

// Utility function for random number generation
const random = (state) => {
  const [a, b, c, e] = state;
  const m = [32557, 19605, 62509, 22609];
  const f = 0 | (a[0] + m[0] * a);
  const g = 0 | (a[1] + m[0] * b + (m[1] * a + (f >>> 16)));
  const h = 0 | (a[2] + m[0] * c + m[1] * b + (m[2] * a + (g >>> 16)));
  state[0] = f;
  state[1] = g;
  state[2] = h;
  state[3] = a[3] + m[0] * e + (m[1] * c + m[2] * b) + (m[3] * a + (h >>> 16));
  const eps = 2 ** -32;
  const i = (e << 21) + (((e >> 2) ^ c) << 5) + (((c >> 2) ^ b) >> 11);
  return eps * (((i >>> (e >> 11)) | (i << (31 & -(e >> 11)))) >>> 0);
};

// Utility function for hashing
const hash32 = (data, seed = 0) => {
  const c = 16;
  const e = 65535;
  const f = 255;
  let g,
    j = 1540483477;
  let m = data.length;
  let n = seed ^ m;
  let o = 0;

  while (m >= 4) {
    g =
      (data[o] & f) |
      ((data[++o] & f) << 8) |
      ((data[++o] & f) << 16) |
      ((data[++o] & f) << 24);
    g = (g & e) * j + ((((g >>> c) * j) & e) << c);
    g ^= g >>> 24;
    g = (g & e) * j + ((((g >>> c) * j) & e) << c);
    n = ((n & e) * j + ((((n >>> c) * j) & e) << c)) ^ g;
    m -= 4;
    ++o;
  }

  switch (m) {
    case 3:
      n ^= (data[o + 2] & f) << c;
    case 2:
      n ^= (data[o + 1] & f) << 8;
    case 1:
      n ^= data[o] & f;
      n = (n & e) * j + ((((n >>> c) * j) & e) << c);
  }

  n ^= n >>> 13;
  n = (n & e) * j + ((((n >>> 16) * j) & e) << 16);
  n ^= n >>> 15;
  return n >>> 0;
};

// Set the random seed based on the token data hash
const setSeed = (hash) => {
  const state = new Uint16Array(4);
  const dv = new DataView(state.buffer);
  const bytes = [];
  for (let i = 2; i < hash.length; i += 2) {
    bytes.push(parseInt(hash.slice(i, i + 2), 16));
  }
  const seed1 = hash32(bytes, 1690382925);
  const seed2 = hash32(bytes, 72970470);
  dv.setUint32(0, seed1);
  dv.setUint32(4, seed2);
  return state;
};

// Generate a random number within a range
const randomRange = (min, max, state) => {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return random(state) * (max - min) + min;
};

// Shuffle an array randomly
const shuffleArray = (array) => {
  const shuffled = [...array];
  let currentIndex = array.length;
  while (currentIndex) {
    const randomIndex = Math.floor(random() * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex],
    ];
  }
  return shuffled;
};

// Utility functions for scaling and snapping
const rescale = (value, originalMin, originalMax, newMin, newMax) => {
  return newMin + ((value - originalMin) * (newMax - newMin)) / (originalMax - originalMin);
};

const snap = (value, step) => {
  return Math.floor(value / step) * step;
};

// Constants and variables
const numSectors = 10;
let canvas, canvasWidth, canvasHeight, widthRatio, leftX, rightX, topY, bottomY, spacing, z0, z1, z2, z3, z4, z5, z6, z7, sectionWidth, sectionHeight;
const drawingWidth = 2000;
const drawingHeight = 2400;
const V1 = 1;
const V2 = 2;
const V3 = 3;
const V4 = 4;
const V5 = 5;
const V6 = 6;
const V7 = 7;

function setup() {
  canvasWidth = 3000;
  canvasHeight = 2000;
  if (canvasHeight >= 1.2 * canvasWidth) {
    canvasWidth = canvasWidth;
    canvasHeight = 1.2 * canvasWidth;
  } else {
    canvasHeight = canvasHeight;
    canvasWidth = canvasHeight / 1.2;
  }

  canvasWidth = 3000;
  canvasHeight = 2000;

  widthRatio = canvasWidth / drawingWidth;

  canvas = createCanvas(canvasWidth, canvasHeight);
  colorMode(HSB, 360, 100, 100, 100);
  const state = setSeed(tokenData.hash);
  randomSeed(0);
  noiseSeed(0);

  leftX = -500;
  rightX = 2500;
  topY = -0.25 * drawingHeight;
  bottomY = 1.25 * drawingHeight;
  spacing = Math.floor(10);
  z0 = 2;
  z1 = 5;
  z2 = 10;
  z3 = 20;
  z4 = 40;
  z5 = 80;
  z6 = 160;
  z7 = 320;
  sectionWidth = drawingWidth / numSectors;
  sectionHeight = drawingHeight / numSectors;
}

function getWidth(value) {
  return (value === undefined) ? drawingWidth : drawingWidth * value;
}

function getHeight(value) {
  return (value === undefined) ? drawingHeight : drawingHeight * value;
}

function drawVertex(x, y) {
  vertex(x * widthRatio, y * widthRatio);
}

function setStrokeWeight(weight) {
  strokeWeight(weight * widthRatio);
}

function radiansToDegrees(angle) {
  return Math.PI * angle;
}

function shouldDraw(percentage) {
  return random() <= percentage;
}

function rescaleValue(value, originalMin, originalMax, newMin, newMax) {
  return rescale(value, originalMin, originalMax, newMin, newMax);
}

function snapToStep(value, step) {
  return snap(value, step);
}


function adjustFlow(flowArray, x, y, distance, strength) {
  for (let i = 0; i < flowArray.length; i++) {
    const column = flowArray[i];
    const h = leftX + spacing * i;
    
    for (let j = 0; j < column.length; j++) {
      const row = column[j];
      const v = topY + spacing * j;
      const d = dist(x, y, h, v);
      
      if (d < distance) {
        const adjustment = rescaleValue(d, 0, distance, strength, 0);
        row += adjustment;
      }
    }
  }
}

function adjustFlow2(flowArray, pointX, pointY, refX, refY, intensity) {
  const maxDistance = getWidth(1);
  const influenceLow = getWidth(0.25);
  const influenceMed = getWidth(0.18);
  const influenceHigh = getWidth(0.12);
  const influence = intensity === "low" ? influenceLow : intensity === "med" ? influenceMed : influenceHigh;

  for (let i = 0; i < flowArray.length; i++) {
    const x = leftX + spacing * i;

    for (let j = 0; j < flowArray[0].length; j++) {
      const y = topY + spacing * j;
      const distance = dist(pointX, pointY, x, y);
      const angleAdjustment = enableAdjustment ? pi(0.025) : pi(-0.025);
      const flowAdjustment = angleAdjustment * Math.sqrt(distance / maxDistance);

      if (distance < refX) {
        flowArray[i][j] += flowAdjustment;
      }
    }
  }
}

function flowPattern(flowArray, intensity, enableAdjustment) {
  const result = [];

  for (let x = leftX; x < rightX; x += spacing) {
    const column = [];

    for (let y = topY; y < bottomY; y += spacing) {
      let value = flowArray;

      if (enableAdjustment) {
        value = angle(x, y, getWidth(0.5), getHeight(0.4)) - pi(0.5);
        const distance = dist(x, y, getWidth(0.5), getHeight(0.5));
        value += rescaleValue(distance, 0, getWidth(1.5), 0, pi(1));
      }

      column.push(value);
    }

    result.push(column);
  }

  let iterations = 0;
  let angleOffset = 0;

  if (intensity === "none") {
    iterations = 0;
  } else if (intensity === "low") {
    iterations = 15;
    angleOffset = pi(0.1);
  } else if (intensity === "med") {
    iterations = 28;
    angleOffset = pi(0.25);
  } else {
    iterations = 45;
    angleOffset = pi(0.45);
  }

  if (enableAdjustment) {
    iterations = 0;
  }

  for (let i = 0; i < iterations; i++) {
    const xPos = randomRange(leftX, rightX);
    const yPos = randomRange(topY, bottomY);

    if (shouldDraw(0.7)) {
      const angleAdjustment = randomGaussian(0, angleOffset);
      const flowAdjustment = Math.max(getWidth(0.1), Math.abs(randomGaussian(getWidth(0.35), getWidth(0.15))));
      adjustFlow(result, xPos, yPos, flowAdjustment, angleAdjustment);
    } else {
      const flowAdjustment = shouldDraw(0.5);
      adjustFlow2(result, xPos, yPos, flowAdjustment, angleOffset);
    }
  }

  return result;
}

function flowLines(flowArray, positions, count, enableAdjustment, adjustStrength) {
  const numRows = flowArray.length;
  const numCols = flowArray[0].length;
  const stepSize = getWidth(0.007);
  const result = [];

  for (let i = 0; i < positions.length; i++) {
    const segment = [];
    const numSteps = Math.abs(randomGaussian(count, 0.25 * count));
    let xPos = positions[i][0];
    let yPos = positions[i][1];

    for (let step = 0; step < numSteps; step++) {
      segment.push([xPos, yPos]);

      const colIndex = Math.floor((xPos - leftX) / spacing);
      const rowIndex = Math.floor((yPos - topY) / spacing);

      let angleValue = enableAdjustment ? adjustStrength : flowArray[colIndex][rowIndex];

      if (enableAdjustment) {
        angleValue = snapToStep(angleValue, pi(0.2));
      }

      xPos += stepSize * cos(angleValue);
      yPos += stepSize * sin(angleValue);
    }

    result.push(segment);
  }

  return result;
}

function offset(x, y, angle, distance) {
  return [x + distance * cos(angle), y + distance * sin(angle)];
}

function angle(x1, y1, x2, y2) {
  const angle = atan2(y2 - y1, x2 - x1);
  return angle < 0 ? angle + pi(2) : angle;
}

function pointAngle(point1, point2) {
  return angle(point1[0], point1[1], point2[0], point2[1]);
}

function fatTop(points, distance) {
  const result = [];
  for (let i = 0; i < points.length - 1; i++) {
    const point1 = points[i];
    const point2 = points[i + 1];
    const angleValue = pointAngle(point1, point2);
    const x = point1[0];
    const y = point1[1];
    result.push(offset(x, y, angleValue - pi(0.5), distance));
  }
  const pointBefore = points[points.length - 2];
  const pointLast = points[points.length - 1];
  const angleLast = pointAngle(pointBefore, pointLast);
  const xLast = pointLast[0];
  const yLast = pointLast[1];
  result.push(offset(xLast, yLast, angleLast - pi(0.5), distance));
  return result;
}

function fatBot(points, distance) {
  const result = [];
  for (let i = 0; i < points.length - 1; i++) {
    const point1 = points[i];
    const point2 = points[i + 1];
    const angleValue = pointAngle(point1, point2);
    const x = point1[0];
    const y = point1[1];
    result.push(offset(x, y, angleValue + pi(0.5), distance));
  }
  const pointBefore = points[points.length - 2];
  const pointLast = points[points.length - 1];
  const angleLast = pointAngle(pointBefore, pointLast);
  const xLast = pointLast[0];
  const yLast = pointLast[1];
  result.push(offset(xLast, yLast, angleLast + pi(0.5), distance));
  return result;
}

function fat(points, distance) {
  const top = fatTop(points, distance);
  const bot = fatBot(points, distance);
  bot.reverse();
  return top.concat(bot);
}

function getSections(x, y, c) {
  const minX = Math.max(0, Math.floor((x - c) / sW));
  const maxX = Math.min(nScts - 1, Math.floor((x + c) / sW));
  const minY = Math.max(0, Math.floor((y - c) / sH));
  const maxY = Math.min(nScts - 1, Math.floor((y + c) / sH));
  const sections = [];
  for (let i = minX; i <= maxX; i++) {
    for (let j = minY; j <= maxY; j++) {
      sections.push([i, j]);
    }
  }
  return sections;
}

function collision(x, y, radius, flowArray, segment, checkSelf) {
  if (checkSelf && dist(x, y, getWidth(0.5), getHeight(0.4)) <= 1.3 * radius) {
    return true;
  }

  const sections = getSections(x, y, radius);
  for (const section of sections) {
    const [colIndex, rowIndex] = section;
    const elements = flowArray[colIndex][rowIndex];
    for (const element of elements) {
      const [elementX, elementY, elementRadius, elementSegment] = element;
      if (dist(x, y, elementX, elementY) <= radius + elementRadius && segment !== elementSegment) {
        return true;
      }
    }
  }

  return false;
}

function createSegments(flowArray, randomOffsets, distance, randomness, segmentCount, flowType, isFat, hasOverlap, isRandomized) {
  const sections = Array.from({ length: nScts }, () => Array.from({ length: nScts }, () => []));

  let margin = getWidth(0.03);
  if (flowType === "low") {
    margin = getWidth(0.07);
  }

  let interval = getWidth(0.01);
  if (flowType === "low") {
    interval = getWidth(0.02);
  } else if (flowType === "highAF") {
    interval = getWidth(0.007);
  }

  let points = [];
  for (let k = 0; k < randomOffsets.length; k++) {
    const offset = randomOffsets[k];
    for (let a = getWidth(-0.2); a < getWidth(1.2); a += interval) {
      const offsetX = randomGaussian(a, getWidth(0.005));
      const offsetY = randomGaussian(offset, margin);
      if (!hasOverlap || dist(offsetX, offsetY, getWidth(0.5), getHeight(0.4)) > getWidth(0.07)) {
        points.push([offsetX, offsetY]);
      }
    }
  }
  points = shuffle(points);

  const flowLines = flowLines(flowArray, points, distance, randomness, segmentCount);


  function createSegments(flowArray, randomOffsets, distance, randomness, segmentCount, flowType, isFat, hasOverlap, isRandomized) {
    const sectors = Array.from({ length: nScts }, () => Array.from({ length: nScts }, () => []));
  
    let margin = isFat() * (isRandomized ? 0.65 : 1);
    const minMargin = hasOverlap ? margin + getWidth(0.03) : getWidth(-0.1);
    const maxMargin = getWidth() - minMargin;
    const minHeight = getHeight() - (minMargin + getWidth(0.015));
  
    const result = [];
  
    for (let q = 0; q < flowLines.length; q++) {
      const flowLine = flowLines[q];
      const segmentId = q;
  
      let linePoints = [];
      let hasPoints = false;
      let pointIndex = 0;
  
      while (pointIndex < flowLine.length) {
        const [flowX, flowY] = flowLine[pointIndex];
  
        if (
          flowX >= minMargin &&
          flowX < maxMargin &&
          flowY >= minMargin &&
          flowY < minHeight &&
          (hasOverlap || !collision(flowX, flowY, margin, sectors, segmentId, hasOverlap))
        ) {
          const isFirstPoint = linePoints.length === 0;
  
          if (!isFirstPoint) {
            for (const sector of getSections(flowX, flowY, margin)) {
              const [colIndex, rowIndex] = sector;
              sectors[colIndex][rowIndex].push([flowX, flowY, margin, segmentId]);
            }
            linePoints.push([flowX, flowY]);
            hasPoints = true;
            pointIndex += 1;
          } else {
            const pointCount = Math.max(2, Math.floor(margin / getWidth(0.001)));
            let canAddSegment = true;
  
            for (let j = 1; j < pointCount; j++) {
              const nextPointIndex = pointIndex + j;
              if (nextPointIndex >= flowLine.length) {
                canAddSegment = false;
                break;
              }
              const [nextFlowX, nextFlowY] = flowLine[nextPointIndex];
              if (
                nextFlowX < minMargin ||
                nextFlowX >= maxMargin ||
                nextFlowY < minMargin ||
                nextFlowY >= minHeight ||
                (!hasOverlap && collision(nextFlowX, nextFlowY, margin, sectors, segmentId))
              ) {
                canAddSegment = false;
                break;
              }
            }
  
            if (canAddSegment) {
              hasPoints = true;
              for (let j = 0; j < pointCount; j++) {
                const [flowX, flowY] = flowLine[pointIndex];
                for (const sector of getSections(flowX, flowY, margin)) {
                  const [colIndex, rowIndex] = sector;
                  sectors[colIndex][rowIndex].push([flowX, flowY, margin, segmentId]);
                }
                linePoints.push([flowX, flowY]);
                pointIndex += 1;
              }
            } else {
              pointIndex += 1;
              linePoints = [];
            }
          }
        } else {
          if (hasPoints) {
            result.push({ points: linePoints, margin: margin, id: segmentId });
            hasPoints = false;
            linePoints = [];
          }
          pointIndex += 1;
        }
      }
  
      if (linePoints.length >= 2) {
        result.push({ points: linePoints, margin: margin, id: segmentId });
      }
    }
  
    return result;
  }
  
  function linearInterpolation(a, b, t) {
    return a * (1 - t) + b * t;
  }
  
  function curveLength(points) {
    if (points.length < 2) return 0;
    let length = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[i + 1];
      length += dist(x1, y1, x2, y2);
    }
    return length;
  }
  
  function lerpCurve(points, t, totalLength) {
    const start = points[0];
    const end = points[points.length - 1];
  
    if (t <= 0) return start;
    if (t >= 1) return end;
    if (points.length === 2) {
      const x = linearInterpolation(start[0], end[0], t);
      const y = linearInterpolation(start[1], end[1], t);
      return [x, y];
    }
  
    const targetLength = totalLength * t;
    let currentLength = 0;
  
    for (let i = 1; i < points.length; i++) {
      const [x1, y1] = points[i - 1];
      const [x2, y2] = points[i];
      const segmentLength = dist(x1, y1, x2, y2);
      const nextLength = currentLength + segmentLength;
  
      if (nextLength > targetLength) {
        const remainingLength = targetLength - currentLength;
        const tSegment = remainingLength / segmentLength;
        const x = linearInterpolation(x1, x2, tSegment);
        const y = linearInterpolation(y1, y2, tSegment);
        return [x, y];
      }
  
      currentLength = nextLength;
    }
  
    return end;
  }
  
  function weightedChoice(colors) {
    const randomValue = random();
    let cumulativeProb = 0;
    for (let i = 0; i < colors.length - 1; i += 2) {
      const color = colors[i];
      const probability = colors[i + 1];
      cumulativeProb += probability;
      if (randomValue < cumulativeProb) {
        return color;
      }
    }
    return colors[colors.length - 2];
  }
  
  function strokeSegment(color, segmentLength, noiseScale, vertexFunc) {
    stroke(color[0], color[1], color[2]);
    noFill();
    strokeWeight(getWidth(0.001));
  
    const numSteps = segmentLength / getWidth(4e-4);
    const noiseOffset = randomRange(0, 1e4);
  
    for (let step = 0; step < numSteps; step += 1) {
      const t = step / numSteps;
      beginShape();
  
      let amplitude = 0.013 * (1 - segmentLength / getWidth(1));
      const start = randomGaussian(2 * amplitude, amplitude);
      const end = randomGaussian(1 - 2 * amplitude, amplitude);
  
      for (let u = start; u < end; u += 0.01) {
        const noiseInput = 4 * (u * (segmentLength / getWidth(0.25))) + noiseOffset;
        const noiseValue = noise(noiseInput, 1.5 * t);
        const offset = t + 0.15 * (0.5 - noiseValue);
  
        const [x, y] = vertexFunc(u, offset);
        vertex(x, y);
      }
  
      endShape();
    }
  }
  
  function fillSegment(fillColor, isStroke, strokeColor, curve1, curve2, startT, endT, totalLength1, totalLength2) {
    fill(fillColor[0], fillColor[1], fillColor[2]);
    if (isStroke) {
      stroke(0, 0, 10);
      strokeWeight(getWidth(0.001));
    } else {
      stroke(strokeColor[0], strokeColor[1], strokeColor[2]);
      strokeWeight(getWidth(5e-4));
    }
  
    const curve1T = [];
    const curve2T = [];
  
    for (let t = startT; t < endT; t += 0.01) {
      curve1T.push(t);
      curve2T.unshift(t);
    }
    curve1T.push(endT);
  
    beginShape();
    for (const t of curve1T) {
      const [x, y] = lerpCurve(curve1, t, totalLength1);
      vertex(x, y);
    }
  
    curve1T.reverse();
    for (const t of curve1T) {
      const [x, y] = lerpCurve(curve2, t, totalLength2);
      vertex(x, y);
    }
  
    endShape(CLOSE);
  }
  
function pm1() {
  return z1;
}

function pm2() {
  return wc([z0, 0.15, z1, 0.25, z2, 0.35, z3, 0.2, z4, 0.05]);
}

function pm3() {
  return wc([z1, 0.1, z2, 0.2, z3, 0.2, z4, 0.3, z5, 0.12, z6, 0.08]);
}

function pm4() {
  return wc([
    z1,
    0.01,
    z2,
    0.03,
    z3,
    0.07,
    z4,
    0.24,
    z5,
    0.33,
    z6,
    0.25,
    z7,
    0.07,
  ]);
}

function pm5() {
  return wc([z3, 0.05, z4, 0.2, z5, 0.35, z6, 0.3, z7, 0.1]);
}

function pm6() {
  return wc([z5, 0.2, z6, 0.5, z7, 0.3]);
}

function pm7() {
  return z4;
}

function pSL(a) {
  const b = wc([w(0.002), 0.15, w(0.004), 0.4, w(0.008), 0.3, w(0.016), 0.15]);
  return a === V1 ? 0.5 * b : a === V2 ? 0.75 * b : a === V5 ? 1.25 * b : a >= V7 ? 2.5 * b : b;
}

function pNStps(a, b) {
  if (b) {
    return 16;
  } else {
    const minSteps = 1 / a;
    return Math.min(minSteps, wc([0, 0.2, 1, 0.1, 2, 0.15, 4, 0.4, 8, 0.12, 16, 0.03]));
  }
}

  


  const wht = [40, 2, 98];
  const dRed = [358, 64, 86];
  const red = [358, 80, 82];
  const tan = [25, 40, 88];
  const midTan = [25, 40, 60];
  const orng = [25, 78, 90];
  const pOrng = [25, 68, 93];
  const pYllw = [43, 60, 99];
  const yllw = [43, 90, 99];
  const pnk = [11, 35, 97];
  const pPnk = [12, 18, 97];
  const xGrn = [125, 55, 55];
  const grn = [170, 75, 65];
  const pGrn = [170, 35, 80];
  const ppGrn = [160, 15, 85];
  const pppGrn = [160, 10, 90];
  const ppYllwGrn = [125, 12, 90];
  const ppBlue = [200, 15, 90];
  const pBlue = [200, 35, 75];
  const blue = [210, 65, 55];
  const dBlue = [220, 65, 35];
  const ddBlue = [225, 65, 20];
  const bgrndDBlue = [225, 60, 25];
  const paleIndigo = [220, 35, 75];
  const lavender = [260, 14, 88];
  const pBrwn = [28, 42, 39];
  const brwn = [25, 45, 33];
  const dBrwn = [25, 45, 23];
  const ddBrwn = [25, 45, 13];
  const nwsprnt = [40, 12, 88];
  const bgrndNws = [40, 8, 92];
  const blk = [0, 0, 10];
  
  const pbcDefault = () => {
    return bgrndNws;
  };
  

  const pcLx = () => {
    return wc([
      dRed, 0.05,
      red, 0.03,
      nwsprnt, 0.12,
      orng, 0.02,
      pYllw, 0.06,
      yllw, 0.06,
      pnk, 0.03,
      grn, 0.04,
      ppGrn, 0.18,
      ddBlue, 0.02,
      dBlue, 0.05,
      blue, 0.05,
      pBlue, 0.03,
      brwn, 0.17,
      dBrwn, 0.09,
      ddBrwn, 0.03,
    ]);
  };
  
  const pcLxD1 = () => {
    return wc([
      dRed, 0.1,
      pYllw, 0.08,
      pnk, 0.13,
      grn, 0.2,
      ppGrn, 0.16,
      dBlue, 0.01,
      blue, 0.24,
      pBlue, 0.1,
      brwn, 0.02,
    ]);
  };
  
  const pcLxD2 = () => {
    return wc([
      dRed, 0.12,
      red, 0.1,
      nwsprnt, 0.04,
      orng, 0.05,
      pYllw, 0.1,
      yllw, 0.14,
      pnk, 0.11,
      grn, 0.13,
      ppGrn, 0.05,
      dBlue, 0.01,
      blue, 0.12,
      pBlue, 0.05,
    ]);
  };
  
  const makeLxD = () => {
    const a = [];
    const b = [
      0.6, 0.12, 0.1, 0.05, 0.03, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01
    ];
    for (let e = 0; e < 15; e++) {
      let c;
      if (e === 0) {
        c = pcLxD1();
      } else if (e === 1) {
        let a = c;
        while (a === c) {
          a = pcLxD2();
        }
        c = a;
      } else {
        c = pcLx();
      }
      a.push(c);
      a.push(b[e]);
    }
    return () => {
      return wc(a);
    };
  };
  
  const pbcLx = (a) => {
    if (a >= V6) {
      return wc([
        ddBlue, 0.19,
        bgrndNws, 0.3,
        ppGrn, 0.15,
        pBlue, 0.05,
        pnk, 0.1,
        blue, 0.1,
        grn, 0.05,
        dRed, 0.05,
        pYllw, 0.01
      ]);
    } else if (a >= V4) {
      return wc([
        bgrndNws, 0.6,
        pBlue, 0.15,
        pppGrn, 0.1,
        pPnk, 0.1,
        bgrndDBlue, 0.05
      ]);
    } else {
      return wc([bgrndNws, 0.9, bgrndDBlue, 0.07, pppGrn, 0.03]);
    }
  };
  
  const pcRad = () => {
    return wc([
      wht, 0.6,
      dRed, 0.05,
      red, 0.02,
      nwsprnt, 0.05,
      orng, 0.05,
      pYllw, 0.05,
      yllw, 0.03,
      ppGrn, 0.01,
      blue, 0.01,
      pBlue, 0.04,
      brwn, 0.09
    ]);
  };
  
  const pbcRad = () => {
    return bgrndNws;
  };
  
  const pcBaked = () => {
    return wc([
      wht, 0.2,
      pnk, 0.05,
      pPnk, 0.1,
      xGrn, 0.5,
      ppYllwGrn, 0.1,
      pBrwn, 0.05
    ]);
  };
  
  const pbcBaked = () => {
    return bgrndNws;
  };
  
  const pcCool = () => {
    return wc([
      nwsprnt, 0.13,
      pYllw, 0.01,
      lavender, 0.03,
      grn, 0.1,
      pppGrn, 0.04,
      ppGrn, 0.04,
      ddBlue, 0.11,
      dBlue, 0.15,
      blue, 0.25,
      pBlue, 0.1,
      brwn, 0.01,
      dBrwn, 0.04,
      ddBrwn, 0.02
    ]);
  };
  
  const pbcCool = (a) => {
    return a >= V6
      ? wc([bgrndNws, 0.5, bgrndDBlue, 0.3, pnk, 0.15, blue, 0.05])
      : wc([bgrndNws, 0.8, bgrndDBlue, 0.12, blue, 0.06, pPnk, 0.02]);
  };
  
  const pcBlack = () => {
    return wc([bgrndNws, 0.15, blk, 0.85]);
  };
  
  const pbcBlack = () => {
    return bgrndNws;
  };
  
  const pcPolitique = () => {
    return wc([wht, 0.58, dRed, 0.02, pYllw, 0.2, pnk, 0.15, blue, 0.05]);
  };
  
  const pbcPolitique = (a) => {
    return a >= V6
      ? wc([bgrndNws, 0.5, ppBlue, 0.5])
      : wc([bgrndNws, 0.8, ppBlue, 0.2]);
  };
  
  const pcVintage = () => {
    return wc([
      dRed, 0.07,
      red, 0.03,
      pOrng, 0.05,
      pYllw, 0.02,
      yllw, 0.15,
      brwn, 0.1,
      dBrwn, 0.58
    ]);
  };
  
  const pbcVintage = () => {
    return wc([nwsprnt, 0.7, pBlue, 0.2, wht, 0.1]);
  };
  
  const pcWhtMono = () => {
    return wht;
  };
  
  const pbcWhtMono = () => {
    return wc([
      dRed, 0.1,
      red, 0.1,
      nwsprnt, 0.01,
      orng, 0.1,
      pYllw, 0.04,
      yllw, 0.05,
      pnk, 0.1,
      grn, 0.1,
      ddBlue, 0.1,
      dBlue, 0.1,
      blue, 0.1,
      dBrwn, 0.02,
      ddBrwn, 0.02,
      blk, 0.09
    ]);
  };
  
  
  const pcAM = () => {
    return wc([
      [260, 20, 20], 0.77,
      [240, 30, 35], 0.03,
      [300, 10, 50], 0.05,
      [180, 20, 30], 0.06,
      [130, 20, 70], 0.05,
      [5, 10, 80], 0.02,
      [5, 40, 90], 0.01,
      [40, 25, 90], 0.01
    ]);
  };
  
  const palettes = {
    gm: [
      [[260, 20, 20], 0.77],
      [[240, 30, 35], 0.03],
      [[300, 10, 50], 0.05],
      [[180, 20, 30], 0.06],
      [[130, 20, 70], 0.05],
      [[5, 10, 80], 0.02],
      [[5, 40, 90], 0.01],
      [[40, 25, 90], 0.01]
    ],
    travelLifestyle: [
      [[0, 0, 13], 0.2],
      [[0, 0, 16], 0.48],
      [[0, 0, 19], 0.2],
      [[0, 0, 22], 0.1],
      [[0, 0, 25], 0.02]
    ],
    goodVibes: [[350, gssn(65, 4), gssn(85, 4)], 1],
    hipsterColors: [wht, 1],
    surfersLife: [
      [bgrndNws, 0.41],
      [[210, 72, 45], 0.15],
      [[210, 72, 30], 0.05],
      [[0, 40, 95], 0.07],
      [[6, 20, 95], 0.05],
      [[130, 50, 30], 0.2],
      [[32, 30, 99], 0.04],
      [[32, 30, 30], 0.03]
    ],
    laVieEnRose: [
      [[150, 8, 40], 0.5],
      [[160, 12, 25], 0.05],
      [[350, 60, 90], 0.05],
      [[350, 45, 80], 0.05],
      [[350, 80, 70], 0.05],
      [[6, 16, 100], 0.2],
      [[15, 26, 97], 0.1]
    ]
  };
  
  const backgroundColors = {
    gm: [260, 30, 30],
    travelLifestyle: [0, 0, 10],
    goodVibes: [225, 70, 20],
    hipsterColors: bgrndNws,
    surfersLife: [130, 20, 50],
    laVieEnRose: [150, 8, 30]
  };
  
  function pMnCl(a, b, e, f) {
    let g = a();
    if (f || e < w(0.015)) {
      return g;
    }
    while (g === b) {
      g = a();
    }
    return g;
  }
  
  function draw() {
    noLoop();
    backgrounds(40, 10, 90);
  
    const theme = wc([
      V1, 0.03,
      V2, 0.01,
      V3, 0.04,
      V5, 0.18,
      V6, 0.5,
      V7, 0.04,
      V4, 0.2
    ]);
  
    let detail = wc([
      "none", 0.15,
      "low", 0.2,
      "med", 0.45,
      "high", 0.2
    ]);
  
    if (V7 === theme) {
      detail = wc(["none", 0.4, "low", 0.3, "med", 0.3]);
    }
  
    const intensity = wc([
      pi(0.5),
      0.1,
      pi(0),
      0.1,
      pi(0.25),
      0.2,
      pi(0.75),
      0.2,
      pi(0.05),
      0.1,
      pi(0.95),
      0.1,
      pi(0.45),
      0.1,
      pi(0.55),
      0.1,
    ]);
  
    const backgrounds = backgroundColors[theme];
    backgrounds(backgrounds[0], backgrounds[1], backgrounds[2]);
    
    const palette = palettes[theme];
    const paletteBackground = palette[palette.length - 1];
    const colors = palette.slice(0, -1);
    
    for (const color of colors) {
      const margin = color.margin;
      if (color.points.length >= 2) {
        noStroke();
        const fillColor = pMnCl(getColor, backgrounds, margin, false);
        fill(fillColor[0], fillColor[1], fillColor[2]);
        // Draw shape based on the points in the color object
        // ...
      }
    }
  }
}