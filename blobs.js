var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', setResolution, false);

ctx.lineWidth = 2;

var res = Math.floor(canvas.width/200);

function setResolution() {
	res = Math.floor(canvas.width/200);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

var noCircles = 20;
var circles = [];

function Circle(x, y, r, vx, vy) {
	if (x-r<=0) x+=r;
	if (y-r<=0) y+=r;
	if (x+r>=canvas.width) x-=r;
	if (y+r>= canvas.height) y-=r;
	this.x = x;
	this.y = y;
	this.r = r;
	this.vx = 0;
	this.vy = 0;
	this.update = function() {
		this.x += this.vx;
		this.y += this.vy;
		
	};
	this.reward = function(x,y) {
		return Math.pow(this.r, 2)/(Math.pow(this.x-x,2)+Math.pow(this.y-y,2));
	}
	this.distance = function(x,y) {
		return Math.sqrt(Math.pow(this.x-x,2)+Math.pow(this.y-y,2));
	};
	this.addVelocity = function(v, phi) {
		this.vx += v*Math.cos(phi);
		this.vy += v*Math.sin(phi);
	}
}

for (var i = 0; i < noCircles; i++) {
	circles.push(new Circle(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*40+5, 3*(Math.random()-0.5), 3*(Math.random()-0.5)));
}



window.setInterval(function() {
	coordValues();
	ctx.beginPath();
	ctx.rect(0,0,canvas.width, canvas.height);
	ctx.fillStyle = 'black'; //'rgba(242, 120, 125, 1)';
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	for (var i = 0; i < 0; i++) {
		ctx.moveTo(circles[i].x+circles[i].r, circles[i].y);
		ctx.arc(circles[i].x, circles[i].y, circles[i].r, 0,2*Math.PI);
	}
	ctx.fillStyle = 'rgba(95, 198, 148, 1)';
	ctx.fill();
	ctx.closePath();
	
	for (var x = 0; x < coords.length; x++) {
		for (var y = 0; y < coords[0].length; y++) {
			ctx.beginPath();
			ctx.rect(x*res, y*res, res,res);
			ctx.fillStyle = 'rgba(255, 255, 255, ' + coords[x][y] + ')';
			ctx.fill();
			ctx.closePath();
		}
	}
	applyForces();
	updateCircles();
}, 10);

function applyForces() {
	var c1, c2, phi, dist;
	for (var i = 0; i < noCircles-1; i++) {
		for (var j = i+1; j < noCircles; j++) {
			c1 = circles[i];
			c2 = circles[j];
			phi = Math.atan2(c2.y-c1.y, c2.x-c1.x);
			dist = c1.distance(c2.x, c2.y) + 100;
			c1.addVelocity(200*c2.r/Math.pow(dist,2), phi);
			c2.addVelocity(200*c1.r/Math.pow(dist,2), phi+Math.PI);
		}
	}
}

var coords = [];

for (var x = 0; x < canvas.width; x+=res) {
	var tempC = []
	for (var y = 0; y < canvas.height; y+=res) {
		tempC.push(0);
	}
	coords.push(tempC);
}


var inCoords;
var outCoords;

function coordValues() {
	inCoords = [];
	outCoords = [];
	for (var x = 0; x < coords.length; x++) {
		for (var y = 0; y < coords[0].length; y++) {
			var sum = 0;
			for (var i = 0; i < noCircles; i++) {
				sum += circles[i].reward(x*res,y*res);
			}
			if (sum >= 1) {
				inCoords.push({x,y,sum})
			} else {
				outCoords.push({x,y,sum})
			}
			coords[x][y] = sum;
		}
	}
}

function findRects() {
	inCoords = [];
	outCoords = [];
	for (var x = 0; x < canvas.width; x+=res) {
		for (var y = 0; y < canvas.height; y+=res) {
			var sum = 0;
			for (var i = 0; i < noCircles; i++) {
				sum += circles[i].reward(x,y);
			}
			if (sum >= 1) {
				inCoords.push({x,y,sum})
			} else {
				outCoords.push({x,y,sum})
			}
		}
	}

}

function updateCircles() {
	for (var i = 0; i < noCircles; i++) {
		circles[i].update();
	}
}