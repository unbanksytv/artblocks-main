var COLOR_01 = [243,200,71]; // yellow
var COLOR_02 = [183,106,79]; // green
var COLOR_03 = [223,152,130]; // light green
var COLOR_04 = [80,127,188]; // teal

function setup() {
	var size = 800;
	createCanvas(size, size);
	background.apply(null, COLOR_04);
	noLoop();
	stroke(255);
	angleMode(DEGREES);
}

function draw() {
	translate(width/2, height/2);
	rotate(45/2);
	branchComponent(100, 8, 60);
}

function branch(len, angle, gen) {
	line(0, 0, 0, -len);
	translate(0, -len);
	len *= 0.7;
	angle = random(angle-30, angle+20);

	if (len > 2) {
		push();
		rotate(angle);
		branch(len, angle, gen);
		pop();

		push();
		rotate(-angle);
		branch(len, angle, gen);
		pop();
	}
}

function branchComponent(len, amount, angle) {
	stroke.apply(null, COLOR_03);
	var increment = 360/amount;
	var rotAmount;

	for (var i = 0; i < amount; i++) {
		push();
		rotAmount = -180 + increment * i
		rotate(random(rotAmount - 60, rotAmount));
		branch(len, angle, 1);
		pop();
	}
}