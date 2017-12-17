var planetsById = [];
var planets = [];
var noPlanets = 0;

var moons = [];
var moonsById = [];
var noMoons = 0;
var timeElapsed = Math.random()*300;

var Planet = function(name, colour, radius, distance, orbitTime) {
    this.name = name;
    this.colour = colour;
    this.radius = radius;
    this.distance = (smallestScreenSize-10)*distance/4504.3;
    this.orbitTime = orbitTime;
    planetsById[noPlanets] = this;
    planets[this.name] = this;
    noPlanets++;
    this.pos = [sunPos[0]+this.distance, sunPos[1]];
    this.updateDistance = function() {
        this.distance = (smallestScreenSize-10)*distance/4504.3;
    }
    this.update = function() {
        this.pos = [sunPos[0]+this.distance*Math.cos(2*Math.PI*timeElapsed/this.orbitTime), sunPos[1]+this.distance*Math.sin(2*Math.PI*timeElapsed/this.orbitTime)];
    }
    this.stroke = function() {
        ctxBg.moveTo(sunPos[0]+this.distance, sunPos[1]);
        ctxBg.arc(sunPos[0], sunPos[1], this.distance, 0, 2*Math.PI, false);
        ctxBg.lineWidth = 0.3;
        ctxBg.strokeStyle = '#FFFFFF';
    }
    this.fill = function() {
        ctxPlanets.beginPath();
        ctxPlanets.moveTo(this.pos[0], this.pos[1]);
        ctxPlanets.arc(this.pos[0], this.pos[1], this.radius, 0, 2*Math.PI, false);
        ctxPlanets.fillStyle = this.colour;
        ctxPlanets.fill();
    }
}

function initPlanets() {
    new Planet('Mercury', '#93837e', 1, 57.9, 0.48);
    new Planet('Venus','#c8a560', 2, 108.2, 1.23);
    new Planet('Earth','#5883dc', 2, 149.6, 2);
    new Planet('Mars','#b66036', 1.5, 227.9, 4);
    new Planet('Jupiter','#b67862', 10, 778.3, 24);
    new Moon('Ganymedes', '#888888', planets['Jupiter'], 1,25,20,1);
    new Moon('Callisto', '#888888', planets['Jupiter'], 1,30,14,1);
    new Moon('Io', '#888888', planets['Jupiter'], 0.5,18,6,1);
    new Moon('Europa', '#888888', planets['Jupiter'], 0.5,20,9,1);
    
    
    new Planet('Saturnus','#dcb35b', 8, 1429.4, 58);
    new Moon('Titan', '#888888', planets['Saturnus'], 1,26,15,1);
    
    new Planet('Uranus','#5bb6dc', 4, 2871, 168);
    new Moon('Titania', '#888888', planets['Uranus'], 0.5,18,6,1);
    
    new Planet('Neptune','#3a5ec4', 4, 4504.3, 330);
    new Moon('Triton', '#888888', planets['Neptune'], 0.5,18,6,-1);
}

var Moon = function(name, colour, planet, radius, distance, orbitTime, retrograde) {
    this.name = name;
    this.colour = colour;
    this.radius = radius;
    this.distance = distance;
    this.orbitTime = orbitTime;
    this.retrograde = retrograde;
    moons[this.name] = this;
    moonsById[noMoons] = this;
    noMoons++;
    this.pos = [planet.pos[0]+this.distance, planet.pos[1]];
    this.updateDistance = function() {
        this.distance = (smallestScreenSize-10)*distance/4504.3;
    }
    this.update = function() {
        this.pos = [planet.pos[0]+this.distance*Math.cos(this.retrograde*2*Math.PI*timeElapsed/this.orbitTime), planet.pos[1]+this.distance*Math.sin(this.retrograde*2*Math.PI*timeElapsed/this.orbitTime)];
    }
    this.stroke = function() {
        ctxPlanets.beginPath();
        ctxPlanets.moveTo(planet.pos[0]+this.distance, planet.pos[1]);
        ctxPlanets.arc(planet.pos[0], planet.pos[1], this.distance, 0, 2*Math.PI, false);
        ctxPlanets.lineWidth = 0.2;
        ctxPlanets.strokeStyle = '#FFFFFF';
        ctxPlanets.stroke();
    }
    this.fill = function() {
        ctxPlanets.beginPath();
        ctxPlanets.moveTo(this.pos[0], this.pos[1]);
        ctxPlanets.arc(this.pos[0], this.pos[1], this.radius, 0, 2*Math.PI, false);
        ctxPlanets.fillStyle = this.colour;
        ctxPlanets.fill();
    }
}


var sunPos;
var smallestScreenSize;
function setPositions() {
    
    if (document.body.clientHeight < document.body.clientWidth) {
        smallestScreenSize = document.body.clientHeight/2;
    } else {
        smallestScreenSize = document.body.clientWidth/2;
    }
    sunPos = [smallestScreenSize, smallestScreenSize];
    for (var i = 0; i < noPlanets; i++) {
        planetsById[i].updateDistance(); 
    }
}

function update() {
    for (var i = 0; i < noPlanets; i++) {
        planetsById[i].update(); 
    }
    for (var j = 0; j < noMoons; j++) {
        moonsById[j].update(); 
    }
}

function draw() {
    ctxPlanets.clearRect(0, 0, canvasPlanets.width, canvasPlanets.height);
    for (var i = 0; i < noPlanets; i++) {
        planetsById[i].fill(); 
    }
    for (var j = 0; j < noMoons; j++) {
        moonsById[j].stroke();
        moonsById[j].fill(); 
    }

}



function setCanvas() {
    canvasBg = document.getElementById('background');
    canvasBg.width = smallestScreenSize*2;
    canvasBg.height = smallestScreenSize*2;
    ctxBg = canvasBg.getContext('2d');
    
    ctxBg.clearRect(0, 0, canvasBg.width, canvasBg.height);
    ctxBg.beginPath();
    for (var i = 0; i < noPlanets; i++) {
        planetsById[i].stroke(); 
    }
    ctxBg.stroke();
    
    canvasPlanets = document.getElementById('planets');
    canvasPlanets.width = smallestScreenSize*2;
    canvasPlanets.height = smallestScreenSize*2;
    ctxPlanets = canvasPlanets.getContext('2d');
}

var fps = 0.006;

var canvasBg, canvasPlanets, ctxBg, ctxPlanets;
var dx = 0;

function init() {
    setCanvas();
    setPositions();
    initPlanets();
    setCanvas();
    setPositions();
}

init();

window.onwheel = function(e) {
    console.log(e.deltaX);
}

window.onresize = function(e) {
    setPositions();
    setCanvas();
    
}

window.setInterval(function(){
    timeElapsed += 0.02;
    update();
    draw();
}, 20);