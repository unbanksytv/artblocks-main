let colors;

function setup() {
    createCanvas(800, 800);
    colors = [color(255, 255, 255), color(255, 0, 0), color(0, 255, 0), color(0, 0, 255), color(255, 255, 0)];
    noLoop();
}

function draw() {
    background(220);
    drawRect(0, 0, width, height, 4);
}

function drawRect(x, y, w, h, depth) {
    if (depth > 0) {
        if (random() < 0.5) {
            let newW = random(w);
            fill(random(colors));
            rect(x, y, newW, h);
            fill(random(colors));
            rect(x + newW, y, w - newW, h);
            drawRect(x, y, newW, h, depth - 1);
            drawRect(x + newW, y, w - newW, h, depth - 1);
        } else {
            let newH = random(h);
            fill(random(colors));
            rect(x, y, w, newH);
            fill(random(colors));
            rect(x, y + newH, w, h - newH);
            drawRect(x, y, w, newH, depth - 1);
            drawRect(x, y + newH, w, h - newH, depth - 1);
        }
    } else {
        fill(random(colors));
        rect(x, y, w, h);
    }
}

function mousePressed() {
    redraw();
}
