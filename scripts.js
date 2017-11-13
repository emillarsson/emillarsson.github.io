
///////////////////////////
// PIZZA
///////////////////////////

var pizzas = 10;
document.getElementById("pizza").innerHTML = Math.ceil(pizzas).toLocaleString();

function pizzaClick(number) {
    if (number > 0 && dough > 0) {
        pizzas = pizzas + number;    
        document.getElementById("pizza").innerHTML = Math.ceil(pizzas).toLocaleString();
        doughClick(-number);
    } else if (number < 0) {
        pizzas = pizzas + number;    
        document.getElementById("pizza").innerHTML = Math.ceil(pizzas).toLocaleString();
    } 
    
}

var dough = 10000;
document.getElementById("dough").innerHTML = Math.ceil(dough).toLocaleString();

function doughClick(number) {
    
    dough = dough + number;
    
    document.getElementById("dough").innerHTML = Math.ceil(dough).toLocaleString();
}



///////////////////////////
// BAKER
///////////////////////////

var bakers = 0;
document.getElementById("bakers").innerHTML = Math.ceil(bakers).toLocaleString();
var bakerCost = 10;
document.getElementById("bakerCost").innerHTML = Math.ceil(bakerCost).toLocaleString();
bakerLevel = 1;

function hireBakerClick(number) {
    if (pizzas >= bakerCost) {
        pizzaClick(-bakerCost);
        if (bakers == 0) {
            enableID("btnHireBaker2");
        }
        bakers = bakers + 1;
        bakerCost = bakerCost + bakerCost;
        document.getElementById("bakerCost").innerHTML = Math.ceil(bakerCost).toLocaleString();
        document.getElementById("bakers").innerHTML = Math.ceil(bakers).toLocaleString();
    }
    
}

function upgradeBaker() {
    bakerLevel = bakerLevel + 1;
}

///////////////////////////
// BAKER2
///////////////////////////

var baker2ButtonText = "Hire Baker2. Cost:"
var bakers2 = 0;
var baker2Cost = 20;
var baker2Level = 1;

document.getElementById("btnHireBaker2").style.display = "none";


function hireBaker2Click(number) {
    if (pizzas > baker2Cost) {
        pizzaClick(-baker2Cost);
        bakers2 = bakers2 + 1;
        baker2Cost = baker2Cost + baker2Cost;
        updateBaker2();
    }
    
}

function updateBaker2() {
    document.getElementById("baker2Cost").innerHTML = Math.ceil(baker2Cost).toLocaleString();
    document.getElementById("bakers2").innerHTML = Math.ceil(bakers2).toLocaleString();
}
///////////////////////////
// Interval functions
///////////////////////////

function updateBakers(globalUpgrade) {
    pizzaClick(0.01*bakers*bakerLevel*globalUpgrade);
}

function updateBakers2(globalUpgrade) {
    if (pizzas > baker2Cost*0.75) {
        document.getElementById("baker2LeftText").innerHTML = baker2ButtonText;
        document.getElementById("baker2RightText").innerHTML = "Bakers2: ";
        updateBaker2();
    }
    pizzaClick(0.01*bakers2*baker2Level*globalUpgrade);
}



///////////////////////////
// General functions
///////////////////////////
function enableID(id) {
    document.getElementById(id).style.display = "block";
}


///////////////////////////
// MAIN LOOP - 100 FPS
///////////////////////////

window.setInterval(function(){
    var globalUpgrade = 1
    updateBakers(globalUpgrade);
    updateBakers2(globalUpgrade);
}, 10);




///////////////////////////
// TESTING FUNCTIONS
///////////////////////////

function toggleTest() {
    if (document.getElementById("test").style.display == "none") {
        document.getElementById("test").style.display = "block";
    } else {
        document.getElementById("test").style.display = "none"
    }
}


var dClock = 0;
function sinOpacity(){
    dClock = dClock+.1;
    
    document.getElementById("sinTest").style.opacity = Math.sin(dClock);
}