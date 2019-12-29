let canvas, ctx;

let scl = 10;
let speedLimit = 0.9 * scl;
let friction = 0.75;
let roboto;
let particles = [];
let oldDate = '';
let textStringArgs = [ 0, 0, 2 * scl ];
let timeStringParts = [ 'Hour', 'Minute', 'Second' ].map(n => `get${n}s`);
let textString = '';
let textBounds = {};
let points = {};
let textPoints = [];
let order = [];

function preload() {
	roboto = loadFont('https://alca.tv/static/codepen/pens/common/RobotoMono-Bold.ttf');
}

function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	ctx = canvas.drawingContext;

	for(let i = 0; i < 180 * scl; i++) {
		let p = new Particle();
		p.applyForce(p5.Vector.random2D().mult(random(1 * scl, 2 * scl)));
		particles.push(p);
	}

	textBounds = roboto.textBounds('0', ...textStringArgs);

	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ':' ].forEach(renderCharacter);
}

function draw() {
	ctx.clearRect(0, 0, width, height);
	fill(255);
	translate(width / 2, height / 2);

	let changed = getDate();

	ctx.beginPath();

	particles.forEach((p, i) => {
		let index = floor(map(i, 0, particles.length, 0, textPoints.length));
		let textPoint = textPoints[index % textPoints.length];

		p	.draw()
			.attractTo(textPoint)
			.update();
	});

	ctx.fillStyle = 'hsl(210, 100%, 50%)';
	ctx.fill();

	if(changed) { // Rotate the particles
		for(let i = 0; i < particles.length * 0.333; i++) {
			let p = particles.pop();
			p.applyForce(-18 * scl, -10 * scl);
			particles.unshift(p);
		}
	}
}

function renderCharacter(c) {
	let pts = roboto.textToPoints(c + '', ...textStringArgs, { sampleFactor: 0.875 })
		.map(n => createVector(n.x, n.y)
					.add(-textBounds.w * 0.5, textBounds.h * 0.5)
					.sub(8 * textBounds.w * 0.5 + textBounds.advance * 7)
					.mult(scl)
			);
	pts[0].z = -1; // First
	pts[pts.length - 1].z = 1; // Last
	points[c] = pts;
}

function getDate() {
	let date = new Date();
	if(oldDate.toString() === date.toString()) {
		return false;
	}
	oldDate = date;
	textString = timeStringParts
			.map(n => date[n]())
			.map(n => `0${n}`.slice(-2))
			.join(':')
			.split('');
	textPoints = [].concat(...textString.map((n, i) => {
			let offset = (i * textBounds.w * textBounds.advance) * scl;
			return points[n].map(p => p.copy().add(offset, 0));
		}));
	return true;
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

class Particle {
	constructor() {
		this.pos = createVector();
		this.vel = createVector();
		this.acc = createVector();
	}
	applyForce(...args) {
		this.acc.add(...args);
		return this;
	}
	attractTo(vec) {
		if(vec === undefined) {
			return this;
		}
		let v = vec	.copy()
					.sub(this.pos)
					.limit(speedLimit);
		this.applyForce(v);
		return this;
	}
	update() {
		let { pos, vel, acc } = this;
		vel.add(acc);
		acc.set(0, 0);
		vel.mult(friction);
		pos.add(vel);
		return this;
	}
	draw() {
		let { pos: { x, y } } = this;
		ctx.moveTo(x + 3, y);
		ctx.arc(x, y, 3, 0, TAU);
		return this;
	}
}
