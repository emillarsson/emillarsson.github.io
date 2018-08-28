
document.addEventListener('contextmenu', function(event) {event.preventDefault();});


var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var canvasMouse = document.getElementById('mouseCanvas');
var ctxMouse = canvasMouse.getContext('2d');
canvasMouse.width = canvas.width;
canvasMouse.height = canvas.height;


ctx.lineWidth = 1;

var res = canvas.width/150;

var noCircles = 1;
var circles = [];

var coords = [];


for (var x = 0; x < canvas.width; x+=res) {
	var tempC = []
	for (var y = 0; y < canvas.height; y+=res) {
		tempC.push(Math.random()*0);
	}
	coords.push(tempC);
}



ctx.font="10px Georgia";

var rectSize = 6
function drawRects() {
	for (var x = 0; x < coords.length; x++) {
		for (var y = 0; y < coords[0].length; y++) {
			ctx.beginPath();
			ctx.fillStyle = 'rgba(0,0,0, '+coords[x][y]/10+')';
			ctx.moveTo(x*res, y*res);
			ctx.rect(x*res-rectSize/2, y*res-rectSize/2, rectSize, rectSize);
			ctx.fill();
			ctx.closePath();
		}
	}
}
function step(x, c) {
	if (x > c) {
		return 1;
	} else {
		return 0;
	}
}

ctx.fillStyle ='#333333'
fill = true;
function drawTop() {
	ctx.clearRect(0,0,canvas.width, canvas.height)
	
	for (var c = 0; c < 10; c++) {
		
		ctx.beginPath();
		for (var x = 0; x < coords.length-1; x++) {
			for (var y = 0; y < coords[0].length-1; y++) {
				var sum = 8*step(coords[x][y], c)+4*step(coords[x+1][y], c)+2*step(coords[x+1][y+1], c)+step(coords[x][y+1], c)
				var ax = res*(c-coords[x][y])/(coords[x+1][y]-coords[x][y]);
				var ay = res*((c-coords[x][y])/(coords[x][y+1]-coords[x][y]));
				var by = res*((c-coords[x+1][y])/(coords[x+1][y+1]-coords[x+1][y]));
				var cx = res*((c-coords[x][y+1])/(coords[x+1][y+1]-coords[x][y+1]));

				if (fill) {
					switch(sum) {
						case 0: 
							break;
						case 1:
							ctx.moveTo(x*res+cx, y*res+res);
							ctx.lineTo(x*res, y*res+res);
							ctx.lineTo(x*res, y*res+ay);
							ctx.lineTo(x*res+cx, y*res+res);
							break;
						case 2:
							ctx.moveTo(x*res+cx, y*res+res);
							ctx.lineTo(x*res+res, y*res+by);
							ctx.lineTo(x*res+res, y*res+res);
							ctx.lineTo(x*res+cx, y*res+res);
							break;
						case 3:
							ctx.moveTo(x*res, y*res+ay);
							ctx.lineTo(x*res+res, y*res+by);
							ctx.lineTo(x*res+res, y*res+res);
							ctx.lineTo(x*res, y*res+res);
							ctx.lineTo(x*res, y*res+ay);
							break;
						case 4:
							ctx.moveTo(x*res+ax, y*res);
							ctx.lineTo(x*res+res, y*res);
							ctx.lineTo(x*res+res, y*res+by);
							ctx.lineTo(x*res+ax, y*res);
							break;
						case 5:
							ctx.moveTo(x*res+ax, y*res);
							ctx.lineTo(x*res+res, y*res);
							ctx.lineTo(x*res+res, y*res+by);
							ctx.lineTo(x*res+cx, y*res+res);
							ctx.lineTo(x*res, y*res+res);
							ctx.lineTo(x*res, y*res+ay);
							ctx.lineTo(x*res+ax, y*res);
							break;
						case 6:
							ctx.moveTo(x*res+ax, y*res);
							ctx.lineTo(x*res+cx, y*res+res);
							ctx.lineTo(x*res+res, y*res+res);
							ctx.lineTo(x*res+res, y*res);
							ctx.lineTo(x*res+ax, y*res);
							break;
						case 7:
							ctx.moveTo(x*res+ax, y*res);
							ctx.lineTo(x*res+res, y*res);
							ctx.lineTo(x*res+res, y*res+res);
							ctx.lineTo(x*res, y*res+res);
							ctx.lineTo(x*res, y*res+ay);
							ctx.lineTo(x*res+ax, y*res);
							break;
						case 8:
							ctx.moveTo(x*res+ax, y*res);
							ctx.lineTo(x*res, y*res+ay);
							ctx.lineTo(x*res, y*res);
							ctx.lineTo(x*res+ax, y*res);
							break;	
						case 9:
							ctx.moveTo(x*res, y*res);
							ctx.lineTo(x*res+ax, y*res);
							ctx.lineTo(x*res+cx, y*res+res);
							ctx.lineTo(x*res, y*res+res);
							ctx.lineTo(x*res, y*res);
							break;
						case 10:
							ctx.moveTo(x*res+ax, y*res);
							ctx.lineTo(x*res+res, y*res+by);
							ctx.lineTo(x*res+res, y*res+res);
							ctx.lineTo(x*res+cx, y*res+res);
							ctx.lineTo(x*res, y*res+ay);
							ctx.lineTo(x*res, y*res);
							ctx.lineTo(x*res+ax, y*res);
							break;
						case 11:
							ctx.moveTo(x*res+ax, y*res);
							ctx.lineTo(x*res+res, y*res+by);
							ctx.lineTo(x*res+res, y*res+res);
							ctx.lineTo(x*res, y*res+res);
							ctx.lineTo(x*res, y*res);
							ctx.lineTo(x*res+ax, y*res);
							break;
						case 12:
							ctx.moveTo(x*res, y*res);
							ctx.lineTo(x*res+res, y*res);
							ctx.lineTo(x*res+res, y*res+by);
							ctx.lineTo(x*res, y*res+ay);
							ctx.lineTo(x*res, y*res);
							break;
						case 13:
							ctx.moveTo(x*res, y*res);
							ctx.lineTo(x*res+res, y*res);
							ctx.lineTo(x*res+res, y*res+by);
							ctx.lineTo(x*res+cx, y*res+res);
							ctx.lineTo(x*res, y*res+res);
							ctx.lineTo(x*res, y*res);
							break;
						case 14:
							ctx.moveTo(x*res, y*res);
							ctx.lineTo(x*res+res, y*res);
							ctx.lineTo(x*res+res, y*res+res);
							ctx.lineTo(x*res+cx, y*res+res);
							ctx.lineTo(x*res, y*res+ay);
							ctx.lineTo(x*res, y*res);
							break;
						case 15: 
							ctx.moveTo(x*res, y*res);
							ctx.lineTo(x*res+res, y*res);
							ctx.lineTo(x*res+res, y*res+res);
							ctx.lineTo(x*res, y*res+res);
							ctx.lineTo(x*res, y*res);
							break;
					}
					
				} else {
					switch(sum) {
						case 0: case 15: 
							break;
						case 1: case 14:
							ctx.moveTo(x*res+cx, y*res+res);
							ctx.lineTo(x*res, y*res+ay);
							break;
						case 2: case 13:
							ctx.moveTo(x*res+cx, y*res+res);
							ctx.lineTo(x*res+res, y*res+by);
							break;
						case 3: case 12:
							ctx.moveTo(x*res, y*res+ay);
							ctx.lineTo(x*res+res, y*res+by);
							break;
						case 4: case 11:
							ctx.moveTo(x*res+ax, y*res);
							ctx.lineTo(x*res+res, y*res+by);
							break;
						case 5:
							ctx.moveTo(x*res+ax, y*res);
							ctx.lineTo(x*res, y*res+ay);
							ctx.moveTo(x*res+cx, y*res+res);
							ctx.lineTo(x*res+res, y*res+by);
							break;
						case 10:
							ctx.moveTo(x*res+ax, y*res);
							ctx.lineTo(x*res+res, y*res+by);
							ctx.moveTo(x*res, y*res+ay);
							ctx.lineTo(x*res+cx, y*res+res);
							break;
						case 6: case 9:
							ctx.moveTo(x*res+ax, y*res);
							ctx.lineTo(x*res+cx, y*res+res);
							break;
						case 7: case 8:
							ctx.moveTo(x*res+ax, y*res);
							ctx.lineTo(x*res, y*res+ay);
							break;
					}
				}
				
				//ctx.fillText(''+ sum, x*res+res/2, y*res+res/2)
				
			}
		}
		if (fill) {
			ctx.fillStyle = 'hsl(0,0%,'+ (30 + 70*(10-c)/10) +'%)';
			ctx.fill();
		} else {
			ctx.stroke();
		}	

		ctx.closePath();
	}
	//drawRects();
}



window.onmousedown = function(e) {
    if (e.srcElement.id.indexOf('mouseCanvas') != -1) {
        // switch (e.which) {
        // case 1:
        //     if (coords[Math.floor((e.x+res/2)/res)][Math.floor((e.y+res/2)/res)] < 10) {
        //         coords[Math.floor((e.x+res/2)/res)][Math.floor((e.y+res/2)/res)]++;
        //     }
        //     break;
        // case 3:
        //     if (coords[Math.floor(e.x/res)][Math.floor((e.y+res/2)/res)] > 0) {
        //         coords[Math.floor(e.x/res)][Math.floor((e.y+res/2)/res)]--;
        //     }
        //     break;
        // }
        heightClick(e.x, e.y, slider.value, e.which);
        drawTop();
    }
}


function heightClick(xc, yc, val, type) {
	for (var x = 0; x < coords.length; x++) {
		for (var y = 0; y < coords[0].length; y++) {
			var dist = Math.sqrt(Math.pow(xc-x*res,2)+Math.pow(yc-y*res,2));
			if (dist < val) {
				var sum = 10/dist;
				if (type == 1) {
					coords[x][y] += sum;
				} else if (type == 3) {
					coords[x][y] -= sum;
				}
			}
		}
	}
}
var slider = document.getElementById('brushSize');

ctxMouse.fillStyle = 'rgba(0,0,0,0.5)';


window.onmousemove = function(e) {
	ctxMouse.clearRect(0, 0, canvasMouse.width, canvasMouse.height);
	ctxMouse.beginPath();
	ctxMouse.arc(e.x, e.y, slider.value, 0, 2*Math.PI);
	

    ctxMouse.fill();
	ctxMouse.closePath();
}

noCircles = 50;
circles = [];

function Circle(x,y,r) {
	this.x = x;
	this.y = y;
	this.r = r;
	this.reward = function(x,y) {
		return Math.pow(this.r, 2)/(Math.pow(this.x-x,2)+Math.pow(this.y-y,2));
	}
}

for (var i = 0; i < noCircles; i++) {
	circles.push(new Circle(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*100+50));
}

function coordValues() {
	for (var x = 0; x < coords.length; x++) {
		for (var y = 0; y < coords[0].length; y++) {
			var sum = 0;
			for (var i = 0; i < circles.length; i++) {
				sum += circles[i].reward(x*res,y*res);
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

coordValues();
drawTop();
