var planetsById = [];
var planets = [];
var noPlanets = 0;

var moons = [];
var moonsById = [];
var noMoons = 0;
var timeElapsed = Math.random()*30000000000;
var startScale = 5000000000;
var pixelScale = startScale;

var strokeColour = '#FFFFFF';
var Planet = function(name, colour, minRadius, realRadius, distance, orbitTime, ring) {
    this.name = name;
    this.colour = colour;
    this.minRadius = minRadius;
    this.realRadius = realRadius;
    this.radius = this.realRadius/pixelScale;
    this.realDistance = distance;
    this.distance = this.realDistance/pixelScale;
    this.orbitTime = orbitTime;
    if (ring) this.ring = ring;
    planetsById[noPlanets] = this;
    planets[this.name] = this;
    noPlanets++;
    this.pos = [sunPos[0]+this.distance, sunPos[1]];
    this.update = function() {
        this.radius = this.realRadius/pixelScale;
        if (this.radius < this.minRadius) this.radius = this.minRadius;
        this.distance = this.realDistance/pixelScale;
        this.pos = [sunPos[0]+this.distance*Math.cos(2*Math.PI*timeElapsed/this.orbitTime), sunPos[1]+this.distance*Math.sin(2*Math.PI*timeElapsed/this.orbitTime)];
    }
    this.stroke = function() {
        ctxBg.moveTo(sunPos[0]+this.distance, sunPos[1]);
        ctxBg.arc(sunPos[0], sunPos[1], this.distance, 0, 2*Math.PI, false);
        ctxBg.lineWidth = 0.2;
        ctxBg.strokeStyle = strokeColour;
    }
    this.fill = function() {
        if (this.ring) {
            ctxPlanets.beginPath();
            ctxPlanets.moveTo(this.pos[0]+this.ring.distance/pixelScale, this.pos[1]);
            ctxPlanets.arc(this.pos[0], this.pos[1], this.ring.distance/pixelScale, 0, 2*Math.PI, false);
            ctxPlanets.lineWidth = this.ring.width/pixelScale;
            ctxPlanets.strokeStyle = '#897852';
            ctxPlanets.stroke();
        }
        ctxPlanets.beginPath();
        ctxPlanets.moveTo(this.pos[0], this.pos[1]);
        ctxPlanets.arc(this.pos[0], this.pos[1], this.radius, 0, 2*Math.PI, false);
        ctxPlanets.fillStyle = this.colour;
        ctxPlanets.fill();
        
        
    }
}

function initPlanets() {
    new Planet('Mercury', '#93837e', 1, 4879, 57909050, 7600522);
    
    new Planet('Venus','#c8a560', 2, 12104, 108208000, 19414166);
    
    new Planet('Earth','#5883dc', 2, 12756, 149598023, 31536000);
    new Moon('Moon', '#888888', planets['Earth'], 2, 1737.1, 384399, 2360592, 1);
    
    new Planet('Mars','#b66036', 1.5, 6794, 227939134, 59356800);
    
    
    new Planet('Jupiter','#b67862', 8, 69911, 778567158, 374080032);
    new Moon('Ganymede', '#888888', planets['Jupiter'], 1,5262.4,1070412,618157,1);
    new Moon('Callisto', '#888888', planets['Jupiter'], 1,4820.6,1882709,1441929,1);
    new Moon('Io', '#888888', planets['Jupiter'], 0.5,3660,421700,152850,1);
    new Moon('Europa', '#888888', planets['Jupiter'], 0.5,3121.6	,671034,306823,1);
    
    
    new Planet('Saturn','#dcb35b', 7, 58232, 1433537000, 928959105, {distance: 96040, width:43080});
    new Moon('Titan', '#888888', planets['Saturn'], 1,26,1377684,1);
    
    new Planet('Uranus','#5bb6dc', 5, 51118, 2875031718, 2649670488);
    new Moon('Titania', '#888888', planets['Uranus'], 0.5,18,752187,1);
    
    new Planet('Neptune','#3a5ec4', 5, 49528, 4504449781, 5197132800);
    new Moon('Triton', '#888888', planets['Neptune'], 0.5,18,507772,-1);
}

var Moon = function(name, colour, planet, minRadius, realRadius, distance, orbitTime, retrograde) {
    this.name = name;
    this.colour = colour;
    this.planet = planet;
    this.minRadius = minRadius;
    this.realRadius = realRadius;
    this.radius = this.realRadius/pixelScale;
    this.realDistance = distance;
    this.distance = this.realDistance/pixelScale;
    this.orbitTime = orbitTime;
    this.retrograde = retrograde;
    moons[this.name] = this;
    moonsById[noMoons] = this;
    noMoons++;
    this.pos = [this.planet.pos[0]+this.distance, this.planet.pos[1]];
    this.update = function() {
        this.radius = this.realRadius/pixelScale;
        if (this.radius < this.minRadius) this.radius = this.minRadius;
        this.distance = this.realDistance/pixelScale;
        this.pos = [this.planet.pos[0]+this.distance*Math.cos(this.retrograde*2*Math.PI*timeElapsed/this.orbitTime), this.planet.pos[1]+this.distance*Math.sin(this.retrograde*2*Math.PI*timeElapsed/this.orbitTime)];
    }
    this.stroke = function() {
        if (this.distance < this.planet.radius) {return;}
        ctxPlanets.beginPath();
        ctxPlanets.moveTo(this.planet.pos[0]+this.distance, this.planet.pos[1]);
        ctxPlanets.arc(this.planet.pos[0], this.planet.pos[1], this.distance, 0, 2*Math.PI, false);
        ctxPlanets.lineWidth = 0.2;
        ctxPlanets.strokeStyle = strokeColour;
        ctxPlanets.stroke();
    }
    this.fill = function() {
        if (this.distance < this.planet.radius) {return;}
        ctxPlanets.beginPath();
        ctxPlanets.moveTo(this.pos[0], this.pos[1]);
        ctxPlanets.arc(this.pos[0], this.pos[1], this.radius, 0, 2*Math.PI, false);
        ctxPlanets.fillStyle = this.colour;
        ctxPlanets.fill();
    }
}


var sunPos;
function setPositions() {
    if (document.body.clientHeight < document.body.clientWidth) {
        smallestScreenSize = document.body.clientHeight/2;
    } else {
        smallestScreenSize = document.body.clientWidth/2;
    }
    sunPos = [smallestScreenSize+xOffset, smallestScreenSize+yOffset];
}

function update() {
    setPositions();
    pixelScale = startScale/(resolution*smallestScreenSize);
    ruler.innerHTML = (100*pixelScale).toFixed(0);
    for (var i = 0; i < noPlanets; i++) {
        planetsById[i].update(); 
    }
    for (var j = 0; j < noMoons; j++) {
        moonsById[j].update(); 
    }
    updateBackground();
}

function draw() {
    ctxPlanets.clearRect(0, 0, canvasPlanets.width, canvasPlanets.height);
    ctxPlanets.beginPath();
    ctxPlanets.moveTo(sunPos[0], sunPos[1]);
    ctxPlanets.arc(sunPos[0], sunPos[1], 695700/pixelScale, 0, 2*Math.PI, false);
    ctxPlanets.fillStyle = '#FFFFFF';
    ctxPlanets.fill();
    for (var j = 0; j < noMoons; j++) {
        moonsById[j].stroke();
        moonsById[j].fill(); 
    }
    for (var i = 0; i < noPlanets; i++) {
        planetsById[i].fill(); 
    }

}


function updateBackground() {
    ctxBg.clearRect(0, 0, canvasBg.width, canvasBg.height);
    ctxBg.beginPath();
    for (var i = 0; i < noPlanets; i++) {
        planetsById[i].stroke(); 
    }
    ctxBg.stroke();
}

function setCanvas() {
    canvasBg = document.getElementById('background');
    canvasBg.width = smallestScreenSize*2;
    canvasBg.height = smallestScreenSize*2;
    ctxBg = canvasBg.getContext('2d');
    
    updateBackground();
    
    canvasPlanets = document.getElementById('planets');
    canvasPlanets.width = smallestScreenSize*2;
    canvasPlanets.height = smallestScreenSize*2;
    ctxPlanets = canvasPlanets.getContext('2d');
}

var fps = 0.006;

var canvasBg, canvasPlanets, ctxBg, ctxPlanets;
var slider, ruler;
var smallestScreenSize;
var resolution = 1;

function init() {
    slider = document.getElementById('timeSlider');
    ruler = document.getElementById('ruler')
    setCanvas();
    setPositions();
    initPlanets();
    setCanvas();
    setPositions();
}

init();

var xOffset = 0 
var yOffset = 0;
var mouseDown = false;
var lastDown = [0,0];
window.onmousedown = function(e) {
    mouseDown = true;
    lastDown = [e.screenX, e.screenY];
}
window.onmouseup = function(e) {
    mouseDown = false
}

window.onmousemove = function(e) {
    if (mouseDown && e.target.id=='planets') {
        xOffset += e.screenX - lastDown[0];
        yOffset += e.screenY - lastDown[1];
        lastDown = [e.screenX, e.screenY];
    }
}
window.onwheel = function(e) {
    var oldRes = resolution;
    var zoom = 0.97;

    if (e.deltaY > 0) {
        zoom = 1/zoom;
    }
    resolution *= zoom;

    if (resolution < 1) {
        resolution = 1;
        return;
    }     
    
    var dx = (e.layerX-smallestScreenSize-xOffset)*(zoom-1),
        dy = (e.layerY-smallestScreenSize-yOffset)*(zoom-1);
    
    xOffset -= dx;
    yOffset -= dy;
}

window.onresize = function(e) {
    setPositions();
    setCanvas();
}

window.setInterval(function(){
    timeElapsed += 0.01*slider.value;
    update();
    draw();
}, 10);

function print(output) {
    console.log(output);
}