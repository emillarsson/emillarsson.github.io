(function(global){
  var module = global.noise = {};

  function Grad(x, y, z) {
    this.x = x; this.y = y; this.z = z;
  }
  
  Grad.prototype.dot2 = function(x, y) {
    return this.x*x + this.y*y;
  };

  Grad.prototype.dot3 = function(x, y, z) {
    return this.x*x + this.y*y + this.z*z;
  };

  var grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
               new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
               new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];

  var p = [151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  // To remove the need for index wrapping, double the permutation table length
  var perm = new Array(512);
  var gradP = new Array(512);

  // This isn't a very good seeding function, but it works ok. It supports 2^16
  // different seed values. Write something better if you need more seeds.
  module.seed = function(seed) {
    if(seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if(seed < 256) {
      seed |= seed << 8;
    }

    for(var i = 0; i < 256; i++) {
      var v;
      if (i & 1) {
        v = p[i] ^ (seed & 255);
      } else {
        v = p[i] ^ ((seed>>8) & 255);
      }

      perm[i] = perm[i + 256] = v;
      gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
  };

  module.seed(0);

  /*
  for(var i=0; i<256; i++) {
    perm[i] = perm[i + 256] = p[i];
    gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
  }*/

  // Skewing and unskewing factors for 2, 3, and 4 dimensions
  var F2 = 0.5*(Math.sqrt(3)-1);
  var G2 = (3-Math.sqrt(3))/6;

  var F3 = 1/3;
  var G3 = 1/6;

  // 2D simplex noise
  module.simplex2 = function(xin, yin) {
    var n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin)*F2; // Hairy factor for 2D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var t = (i+j)*G2;
    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin-j+t;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if(x0>y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      i1=1; j1=0;
    } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      i1=0; j1=1;
    }
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
    var y2 = y0 - 1 + 2 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    i &= 255;
    j &= 255;
    var gi0 = gradP[i+perm[j]];
    var gi1 = gradP[i+i1+perm[j+j1]];
    var gi2 = gradP[i+1+perm[j+1]];
    // Calculate the contribution from the three corners
    var t0 = 0.5 - x0*x0-y0*y0;
    if(t0<0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot2(x0, y0);  // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.5 - x1*x1-y1*y1;
    if(t1<0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot2(x1, y1);
    }
    var t2 = 0.5 - x2*x2-y2*y2;
    if(t2<0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot2(x2, y2);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70 * (n0 + n1 + n2);
  };

})(this);
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

var res = Math.floor(canvas.width/150);

var noCircles = 1;
var circles = [];

var coords = [];

noise.seed(Math.random());
for (var x = 0; x < canvas.width; x+=res) {
	var tempC = []
	for (var y = 0; y < canvas.height; y+=res) {
		tempC.push(noise.simplex2(x/1000,y/1000)*4+2 + noise.simplex2(x/400,y/400)*5+ noise.simplex2(x/150,y/150)*2 + noise.simplex2(x/70,y/70));
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


var waterLevel = 2
var waterColour = '#5997f9'
canvas.backGround = waterColour
var landscapeColours = ['#f2df8c', '#a1c972', '#538752', '#7c6a59', '#deeae7']
var maxLevel = 8;
ctx.fillStyle ='#333333'
fill = true;
function drawTop() {
	ctx.fillStyle = waterColour;
	ctx.fillRect(0,0,canvas.width, canvas.height)
	
	for (var c = waterLevel; c < maxLevel; c++) {
		if (c == waterLevel) {
			ctx.fillStyle = waterColour;
		} else {
			ctx.fillStyle = landscapeColours[c-waterLevel-1];
		}
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
			//ctx.fillStyle = 'hsl(0,0%,'+ (30 + 70*(10-c)/10) +'%)';
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

//coordValues();
drawTop();
