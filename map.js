var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//window.addEventListener('resize', setResolution, false);

ctx.lineWidth = 1;

var res = canvas.width/50;

function setResolution() {
	res = Math.floor(canvas.width/100);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

var noCircles = 1;
var circles = [];

var coords = [];


for (var x = 0; x < canvas.width; x+=res) {
	var tempC = []
	for (var y = 0; y < canvas.height; y+=res) {
		tempC.push(Math.random()*10);
	}
	coords.push(tempC);
}


var inCoords;
var outCoords;

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
ctx.fillStyle ='#000000'

function drawTop() {
	ctx.clearRect(0,0,canvas.width, canvas.height)
	//drawRects();
	for (var c = 4; c < 10; c++) {
		
		ctx.beginPath();
		for (var x = 0; x < coords.length-1; x++) {
			for (var y = 0; y < coords[0].length-1; y++) {
				var sum = 8*step(coords[x][y], c)+4*step(coords[x+1][y], c)+2*step(coords[x+1][y+1], c)+step(coords[x][y+1], c)
				var ax = res*(c-coords[x][y])/(coords[x+1][y]-coords[x][y]);
				var ay = res*((c-coords[x][y])/(coords[x][y+1]-coords[x][y]));
				var by = res*((c-coords[x+1][y])/(coords[x+1][y+1]-coords[x+1][y]));
				var cx = res*((c-coords[x][y+1])/(coords[x+1][y+1]-coords[x][y+1]));
				
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
				
				//ctx.fillText(''+ sum, x*res+res/2, y*res+res/2)
				
			}
		}
		if (c > 7) {
			ctx.fillStyle = 'red';
			ctx.fill();
		}
		ctx.stroke();
		ctx.closePath();
	}
}
drawTop();
window.onclick = function(e) {
	switch (e.which) {
    case 1:
    	if (coords[Math.floor(e.x/res)][Math.floor(e.y/res)] < 10) {
	    	coords[Math.floor(e.x/res)][Math.floor(e.y/res)]++;
	    }
      	break;
    case 3:
    	if (coords[Math.floor(e.x/res)][Math.floor(e.y/res)] > 0) {
	        coords[Math.floor(e.x/res)][Math.floor(e.y/res)]--;
	    }
    	break;
  	}
	drawTop()
}

/*window.onmousemove = function(e) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	ctx.rect(res*Math.floor(e.x/res), res*Math.floor(e.y/res), res, res);
	ctx.fill();
	ctx.closePath();
}*/

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