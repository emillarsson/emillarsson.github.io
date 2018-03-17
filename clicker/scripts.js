///////////////////////////
//         GAME          //
///////////////////////////

var Game={};

Game.randomSeed = Math.ceil(Math.random()*100000);
Math.seed = Game.randomSeed;
Game.pizzaClicks = 0;

Game.ingredientsEnabled = 0;
disableDisplay('ingredientShop')
Game.staffEnabled = 0;
disableDisplay('staffShop')
Game.buildingsEnabled = 0;
disableDisplay('buildingShop')
Game.itemsEnabled = 0;
disableDisplay('itemsBox')
Game.upgradesEnabled = 0;
disableDisplay('upgradesBox')
Game.doughEnabled = 0;
disableDisplay('dough')
Game.pizzaPerSecondEnabled = 0;
disableDisplay('pizzaPerSecondDiv')
disableDisplay('tooltip');



///////////////////////////
//       TOOLTIP         //
///////////////////////////

var tooltipBox = Get('tooltip');
var tooltipTitle = Get('tooltipTitleText');
var tooltipPrice = Get('tooltipPriceText');
var tooltipDesc = Get('tooltipDescText');
var tooltipPizza = Get('tooltipPizzasText');


function SetTooltip(title, price, desc) { 
    enableDisplay('tooltip');
    if (price <= Game.pizzas) {
        tooltipPrice.style.color = '#5cf731';
    } else {
        tooltipPrice.style.color = '#af0800';
    }
    if (title.length != 0 && price > 0){
        tooltipPizza.innerHTML = 'Cost:&nbsp';
    } else {
        tooltipPizza.innerHTML = '';
    }
    tooltipTitle.innerHTML = title;
    if (price > 0) {
        tooltipPrice.innerHTML = Math.floor(price).toLocaleString();
    } else {
        tooltipPrice.innerHTML = '';
    }
    tooltipDesc.innerHTML = desc;
}










///////////////////////////
//         PIZZA
///////////////////////////
Game.pizzas = 10000000;
Game.pizzaButtonEnabled = 1;
Game.clickAmount = 10;
Game.clickAllowed = false;
Game.lifetime_pizzas = Game.pizzas;
setPizza();
var pizzaButton = Get('pizzaButton');

function setPizza() {
    Get('pizza').innerHTML = Math.floor(Game.pizzas).toLocaleString();
}
function ClickPizza() {
    if (Game.pizzaClicks == 0) {
        Game.Upgrades['Ingredients'].unlock();
        Game.pizzaButtonEnabled = 0;
        disableDisplay('pizzaButton');
        
        Game.upgradesEnabled = 1;
        enableDisplay('upgradesBox');
        Game.pizzaClicks++;
        
    }
    if (!Game.clickAllowed) {return;}
    pizzaClick(Game.clickAmount);
    Game.pizzaClicks++;
    CheckClickUpgrades();
}
AddEvent(pizzaButton, 'click', ClickPizza);

function pizzaClick(number) {
    if (number > 0) {
        number = CheckDough(number);
    }
    Game.pizzas += number;  
    Game.lifetime_pizzas += number;
    setPizza();
    if (!Game.clickAllowed) {return;}
    if (Game.pizzas >= 20) {Game.Upgrades['Water Pipeline'].unlock();}
    if (Game.pizzas >= Game.ItemsById[Game.nextItem].price*0.5) {Game.ItemsById[Game.nextItem].unlock();}
    if (Game.pizzas >= 100) {Game.Upgrades['Sourdough'].unlock();}
    if (Game.pizzas >= 5000) {Game.Upgrades['Buildings'].unlock();}
}

function CheckClickUpgrades() {
    if (Game.pizzaClicks == 100) {Game.Upgrades['Pizza Slicer'].unlock();}
    else if (Game.pizzaClicks == 500) {Game.Upgrades['Pizza Bottom'].unlock();}
    else if (Game.pizzaClicks == 2000) {Game.Upgrades['Pizza Spinning'].unlock();} 
}


function AddIngredient(amount) {
    Game.ItemsById[Game.currentIngredient].noItems+=amount;
    Game.ItemsById[Game.currentIngredient].update();
}


///////////////////////////
//         DOUGH         //
///////////////////////////

Game.doughLevel = -1;
Game.currentDough = null;
var doughByLevel = [];
var doughsN = 0;

function Dough(name, desc, doughFunction) {
    this.name = name;
    this.desc = desc;
    this.level = doughsN;
    
    doughByLevel[this.level] = this;
    doughsN++;
    
    this.doughFunction = doughFunction;
}

new Dough('Wheat Dough', 'Just your plain ol&#39 dough');
new Dough('Sourdough', 'Oh yeah, now we&#39 talking!');
new Dough('Cookie Dough', 'Combining the best of two worlds, I guess.');

var DoughDiv = {
    element : Get('dough'),
    title : Get('doughTitle'),
    desc : Get('doughDesc'),
    // image?
    
    SetDough : function() {
        this.title.innerHTML = doughByLevel[Game.doughLevel].name;
        this.desc.innerHTML = doughByLevel[Game.doughLevel].desc;
    }
}

function doughLevelUp() {
    Game.doughLevel++;
    DoughDiv.SetDough();
    Game.currentDough = doughByLevel[Game.doughLevel];
}

// Dough logic
function CheckDough(number) {
    if (Game.currentDough.name == 'Wheat Dough') {
        var item = Game.Items['Wheat'];
        if (Game.Upgrades['Water Pipeline'].bought==0) {
            var item2 = Game.Items['Water'];
            if (item.noItems >= number && item2.noItems >= number) {
                item.noItems -= number;
                item.update();
                item2.noItems -= number;
                item2.update();
                return number;
            }
        } else if (item.noItems >= number) {
            item.noItems -= number;
            item.update();
            return number;   
        }
    } 
    else if (Game.currentDough.name == 'Sourdough') {
        //pizzaClick(Game.clickAmount);
        
        return number*2;
    } else if (Game.currentDough.name == 'Cookie Dough') {
        return number*4;
    }
    return 0;
}









///////////////////////////
//         STORE
///////////////////////////

// GENERAL STORE ITEMS
Game.Items = [];
Game.ItemsById = [];
Game.nextItem = 3;
Game.itemsN = 0;
Game.currentIngredient = 0;

Game.Ingredient = function(name, desc, price, intervalFunction, clickFunction) {
    this.id = Game.itemsN;
    this.name = name;
	this.desc = desc;
	this.price = price;
	this.intervalFunction = intervalFunction;
    this.clickFunction = clickFunction;
    this.type = 'ingredient';
	this.unlocked = 0;
    this.enabled = 1;
    this.automated = 0;
    this.noItems = 0;
    this.boost = 1; // 1 = 100% of normal pps
    this.ps = 0;
	Game.Items[this.name] = this;
	Game.ItemsById[this.id] = this;
	Game.itemsN++;
  
    this.unlock = function() {
        this.unlocked = 1;
        ItemDivsById[this.id].unlock();
        Game.currentIngredient = this.id;
        this.update();
    }
    this.update = function() {
        if (this.automated == 1) {
            ItemDivsById[this.id].button.firstChild.removeChild(ItemDivsById[this.id].noItems);
            ItemDivsById[this.id].button.firstChild.removeChild(ItemDivsById[this.id].PS);
            ItemDivsById[this.id].removeEvents();
        }
        ItemDivsById[this.id].update();
    }
    this.clickItem = function() {
        if (this.clickFunction) this.clickFunction(); 
        
        this.update();
       
    }
    this.runItem = function(fps) {
        if (this.intervalFunction) this.intervalFunction(fps);
        ItemDivsById[this.id].update();
    }
    
	return this;
}
Game.Staff = function(name, desc, price, intervalFunction, clickFunction) {
    this.id = Game.itemsN;
    this.name = name;
	this.desc = desc;
	this.price = price;
	this.intervalFunction = intervalFunction;
    this.clickFunction = clickFunction;
    this.type = 'staff';
	this.unlocked = 0;
    this.enabled = 1;
    this.noItems = 0;
    this.boost = 1; // 1 = 100% of normal pps
    this.pps = 0;
	Game.Items[this.name] = this;
	Game.ItemsById[this.id] = this;
	Game.itemsN++;
  
    this.unlock = function() {
        if (this.unlocked == 0) {
            this.unlocked = 1;
            ItemDivsById[this.id].unlock();
        }
    }
    this.update = function() {
        ItemDivsById[this.id].update();
        this.pps = this.noItems*this.boost;
    }
    this.clickItem = function() {
        if (Game.pizzas >= this.price) {
            pizzaClick(-this.price)
            this.noItems++;
            if (this.clickFunction) this.clickFunction(); 
            this.price *= 1.15;   
        }
        ItemDivsById[this.id].update();
        if (Game.ItemsById[this.id+1] && Game.nextItem == this.id) {                
            Game.nextItem = this.id+1;
        }
        this.update();
    }
    this.runItem = function(fps) {
        if (this.intervalFunction) this.intervalFunction(fps);
    }
    this.addBoost = function(amount) {
        this.boost += amount;
        this.update();
    }
	return this;
}
Game.Building = function(name, desc, price, intervalFunction, clickFunction) {
    this.id = Game.itemsN;
    this.name = name;
	this.desc = desc;
	this.price = price;
	this.intervalFunction = intervalFunction;
    this.clickFunction = clickFunction;
    this.type = 'building';
	this.unlocked = 0;
    this.enabled = 1;
    this.noItems = 0;
    this.boost = 1; // 1 = 100% of normal pps
    
	Game.Items[this.name] = this;
	Game.ItemsById[this.id] = this;
	Game.itemsN++;
  
    this.unlock = function() {
        this.unlocked = 1;
        ItemDivsById[this.id].unlock();
    }
    this.update = function() {
        ItemDivsById[this.id].update();
    }
    this.clickItem = function() {
        if (Game.pizzas >= this.price) {
            pizzaClick(-this.price)
            this.noItems++;
            if (this.clickFunction) this.clickFunction(); 
            this.price *= 1.5;   
        }

        ItemDivsById[this.id].update();
        if (Game.ItemsById[this.id+1] && Game.nextItem == this.id) {                
            Game.nextItem = this.id+1;
        }
    }
    this.runItem = function(fps) {
        if (this.intervalFunction) this.intervalFunction(fps);
    }
    this.addBoost = function(amount) {
        this.boost += amount;
        this.update();
    }
	return this;
}





new Game.Ingredient('Water', 'Refreshing.', 0, null, function() {this.noItems+=10000;if (this.noItems >= 20) Game.Items['Wheat'].unlock();});

new Game.Ingredient('Wheat', 'Wheat the fuck.', 0, function(seconds) {
    this.ps=Game.Items['Farmer'].pps;
    this.noItems+=this.ps*seconds;}, function() {this.noItems+=10000;if (this.noItems >= 20) Game.Upgrades['Wheat Dough'].unlock();});
new Game.Ingredient('Fungus', 'Very swell!', 0, function(seconds) {this.ps=Game.Items['Farmer'].pps/4;
    this.noItems+=this.ps*seconds;}, function() {this.noItems+=10000;});


new Game.Staff('Farmer', 'A farmer gets you wheat.', 10, null,function() {
    if (this.noItems==1) {Game.Items['Baker'].unlock();}
    else if (this.noItems==10) {Game.Upgrades['Farmville'].unlock();}});

new Game.Staff('Baker', 'A lovely baker.', 15, function(seconds) {pizzaClick(this.noItems*this.boost*0.1*seconds);}, function() {if (this.noItems == 1) {Game.Upgrades['Bakers bake'].unlock(); enableDisplay('pizzaPerSecondDiv');
    Game.pizzaPerSecondEnabled=1;}});

new Game.Staff('Italian', 'A lovely italian.', 100, function(seconds) {pizzaClick(this.noItems*this.boost*1*seconds);}, function() {if (this.noItems == 1) {Game.Upgrades['Italiaano'].unlock()}});


new Game.Building('Pizza joint', 'Pizza joints produces more pizzas for every <b>fifth</b> baker!', 10000, function(seconds) {
    pizzaClick((this.noItems*5 + Math.floor(Game.Items['Baker'].noItems/5))*this.boost*seconds);}, function() {if (this.noItems == 1) {Game.Upgrades['Drive In'].unlock()}});

new Game.Staff('Explorer', 'Helps exloring!', 100000, null, function() {if (this.noItems==1) {Game.Upgrades['Binoculars'].unlock();}});

new Game.Staff('Engineer', 'A researcher!', 500000, null, function() {if (this.noItems==1) {Game.itemsEnabled = 1;
enableDisplay('itemsBox')}});

// Initialising chain of items
var ItemDivs = [];
var ItemDivsById = [];

function IngredientDiv(itemID, name) {
    this.name = name;
    this.id = itemID;
    this.enabled = 0;
    
    //this.div.className = Game.ItemsById[this.id].type;
    this.button = document.createElement('button');
    this.button.className = 'ingredientButton';
    this.button.id = this.name;
    
    Get(Game.ItemsById[this.id].type + 'Shop').appendChild(this.button);
    
    this.horizon = document.createElement('div');
    this.horizon.className = 'ingredientBlock';
    this.button.appendChild(this.horizon);
    
    this.image = document.createElement('img');
    this.image.className = 'ingredientImage';
    this.image.src = '../' + this.name + '.png';   
    this.horizon.appendChild(this.image);
    
    
    
    this.noItems = document.createElement('div');
    this.noItems.className = 'ingredientAmount';
    this.noItems.innerHTML = Game.ItemsById[this.id].noItems;
    this.horizon.appendChild(this.noItems);
    
    this.PS = document.createElement('div');
    this.PS.className = 'ingredientPerSecond';
    this.PS.innerHTML = '+' + Game.ItemsById[this.id].noItems;
    this.horizon.appendChild(this.PS);
    
    
    ItemDivs[this.name] = this;
    ItemDivsById[this.id] = this;
    
    AddEvent(this.button, 'click', Game.ItemsById[this.id].clickItem.bind(Game.ItemsById[this.id]));

    this.removeEvents = function() {
        var old_element = this.button;
        this.button = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(this.button, old_element);
    }
    this.unlock = function() {
        enableDisplay(this.button.id);
        this.enabled = 1;
    }
    this.disable = function() {
        disableDisplay(this.button.id);
        this.enabled = 0;
    }
    
    this.update = function() {
        this.noItems.innerHTML = Game.ItemsById[this.id].noItems.toLocaleString(undefined, {maximumFractionDigits: 0});
        
        this.PS.innerHTML = '+' + Game.ItemsById[this.id].ps.toLocaleString(undefined, {maximumFractionDigits: 0});
        if (this.price) {
            this.price.innerHTML = Game.ItemsById[this.id].price.toFixed(0);
        }
        if (Game.ItemsById[this.id].unlocked && this.enabled==0) {
            this.unlock();
        }
    }
}

function ItemDiv(itemID, name) {
    this.name = name;
    this.id = itemID;
    this.enabled = 0;
    
    //this.div.className = Game.ItemsById[this.id].type;
    this.button = document.createElement('button');
    this.button.className = 'containerButton';
    this.button.id = this.name;
    
    Get(Game.ItemsById[this.id].type + 'Shop').appendChild(this.button);
    
    this.title = document.createElement('div');
    this.title.className = 'buttonTitle';
    this.title.innerHTML = Game.ItemsById[this.id].name;
    this.button.appendChild(this.title);
    
    this.noItems = document.createElement('div');
    this.noItems.className = 'textRight';
    this.noItems.innerHTML = Game.ItemsById[this.id].noItems;
    this.button.appendChild(this.noItems);
    
    /*if (Game.ItemsById[this.id].price > 0) {
        this.price = document.createElement('div');
        this.price.className = 'textLeft';
        this.price.innerHTML = Game.ItemsById[this.id].price.toLocaleString();
        this.button.appendChild(this.price);
    }*/
    
    ItemDivs[this.name] = this;
    ItemDivsById[this.id] = this;
    
    AddEvent(this.button, 'click', Game.ItemsById[this.id].clickItem.bind(Game.ItemsById[this.id]));
    /*AddEvent(this.button, 'mouseover', SetTooltip.bind(Game.ItemsById[this.id], Game.ItemsById[this.id].name, Game.ItemsById[this.id].price, Game.ItemsById[this.id].desc))
    AddEvent(this.button, 'mouseout', function() {SetTooltip('','','');})
    */
    this.removeEvents = function() {
        var old_element = this.button;
        this.button = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(this.button, old_element);
    }
    this.unlock = function() {
        enableDisplay(this.button.id);
        this.enabled = 1;
    }
    this.disable = function() {
        disableDisplay(this.button.id);
        this.enabled = 0;
    }
    
    this.update = function() {
        this.noItems.innerHTML = Game.ItemsById[this.id].noItems.toLocaleString(undefined, {maximumFractionDigits: 0});
        if (this.price) {
            this.price.innerHTML = Game.ItemsById[this.id].price.toFixed(0);
        }
        if (Game.ItemsById[this.id].unlocked && this.enabled==0) {
            this.unlock();
        }
    }
}

Game.CreateItemDivs = function() {
    for (var i = 0; i < Game.itemsN; i++) {
        if (Game.ItemsById[i].type == 'ingredient') {
            var item = new IngredientDiv(i, Game.ItemsById[i].name);
        } else {
            var item = new ItemDiv(i, Game.ItemsById[i].name);
        }
        item.disable();
       
    }
}

var pizzaPerSecond = 0;
Game.RunItems = function(seconds) {
    var delta = Game.pizzas;
    for (var i = 0; i < Game.itemsN; i++) {
        if (Game.ItemsById[i].unlocked) {
            Game.ItemsById[i].runItem(seconds);
        }
    }
    delta = Game.pizzas - delta;
    //pizzaClick(amount/fps);
    Get('pizzaPerSecond').innerHTML = (delta/seconds).toFixed(1);
    pizzaPerSecond = delta/seconds;
}












///////////////////////////
//       UPGRADES
///////////////////////////

Game.upgradesToRebuild = 1;
Game.Upgrades = [];
Game.UpgradesById = [];
Game.UpgradesN = 0;

Game.UpgradesOwned = 0;

Game.Upgrade=function(name, desc, price, buyFunction, unlockFunction) {
    this.id = Game.UpgradesN;
    this.name = name;
	this.desc = desc;
	this.price = price;
	this.buyFunction = buyFunction;
    this.unlockFunction = unlockFunction;
	this.unlocked = 0;
	this.bought = 0;
	this.type = 'upgrade';
	Game.Upgrades[this.name] = this;
	Game.UpgradesById[this.id]=this;
	Game.UpgradesN++;
    
    /* TODO: Unlocking due to building, last item bought etc */
    this.CheckUnlocked = function() {
        if (this.bought == 0) {
            if (this.unlockFunction) {
                this.unlockFunction();
            } else {
                UpgradeDivsById[this.id].unlock();
            }
        }
    }
    
    this.unlock = function() {
        if (this.bought==1) return;
        this.unlocked = 1;
        this.update();
    }
    this.buy = function() { 
        if (Game.pizzas >= this.price) {
            if (this.buyFunction) this.buyFunction(); 
            this.bought = 1;
            pizzaClick(-this.price)
            this.update();
        }
    }
    this.setPrice = function(price) {
        this.price = price;
    }
    
    this.update = function() {
        UpgradeDivsById[this.id].update();
        if (this.bought == 1) {
            //if (this.buyFunction) this.buyFunction(); 
        }
    }
	return this;
}


new Game.Upgrade('Ingredients', 'Pizzas are not made out of thin air, buddy!', 0, function() {
    enableDisplay('ingredientShop'); 
    Game.ingredientsEnabled=1;
    Game.Items['Water'].unlock();
});
new Game.Upgrade('Wheat Dough', 'Wheat and water makes the best dough!', 0, function() {
    enableDisplay('dough'); 
    Game.doughEnabled=1;
    enableDisplay('pizzaButton'); 
    Game.pizzaButtonEnabled=1;
    Game.clickAllowed = true;});
new Game.Upgrade('Water Pipeline', 'Install a water pipeline for endless supply!', 20, function() {
    Game.Items['Water'].automated = 1;
    Game.Items['Water'].update();
    
    Game.Upgrades['Staffing'].unlock();
});
new Game.Upgrade('Staffing', 'Unlock staff shop.', 10, function() {
    enableDisplay('staffShop'); 
    Game.staffEnabled=1;
});

new Game.Upgrade('Farmville', 'The farmers are <b>twice</b> as effective!', 100, function() {
    Game.Items['Farmer'].addBoost(1);   
});
new Game.Upgrade('Bakers bake', 'The bakers bake <b>twice</b> as many pizzas!', 500, function() {
    Game.Items['Baker'].addBoost(1);
    Game.Upgrades['Bakers gonna bake'].unlock();
});
new Game.Upgrade('Buildings', 'Unlock buildings.', 10, function() {
    enableDisplay('buildingShop');
    Game.buildingsEnabled=1;
});

new Game.Upgrade('Drive In', 'Get your pizzas without having to make eye contact!', 20000, function() {Game.Items['Pizza joint'].addBoost(1);});


new Game.Upgrade('Pizza Slicer', 'Increase pizzas per click!', 5000, function() {
    Game.clickAmount=2;
});
new Game.Upgrade('Pizza Bottom', 'Increase pizzas per click!', 50000, function() {
    Game.clickAmount=5;
});
new Game.Upgrade('Pizza Spinning', 'Increase pizzas per click!', 500000, function() {
    Game.clickAmount=10;
});

new Game.Upgrade('Italiaano', 'eyyy what u gonna do', 10000, function() {
    Game.Items['Italian'].addBoost(1);
});
new Game.Upgrade('Bakers gonna bake', 'Inspire the bakers to bake <b>twice</b> as many pizzas!', 10000, function() { 
    Game.Items['Baker'].addBoost(1);
});
new Game.Upgrade('Binoculars', 'Time to explore the universe', 150000, function() {
    Game.solarSystemEnabled = true;
});

// DOUGH UPGRADES
new Game.Upgrade('Sourdough', 'Mhm, fermentation...', 1000, function() {
    doughLevelUp();
    Game.Items['Farmer'].desc = 'Farmers gets you fungus!';
    Game.Upgrades['Cookie dough'].unlock();
    Game.Items['Fungus'].unlock();
});
new Game.Upgrade('Cookie dough', 'Ehh, I think this is the wrong clicker.', 1000000, function() {
    doughLevelUp();
});


var UpgradeDivsById = [];
var UpgradeDivs = [];
function UpgradeDiv(upgradeID) {
    this.id = upgradeID
    this.enabled = 1;
    this.div = document.createElement('div');
    this.div.innerHTML = this.id.toLocaleString();
    this.div.className = "upgrade";
    this.div.id = 'upgrade'+this.id;
    this.div.style.display = '';
    Get('upgrades').appendChild(this.div);
    
    UpgradeDivs[this.id] = this.div;
    UpgradeDivsById[this.id]=this;
    
    AddEvent(this.div, 'click', Game.UpgradesById[this.id].buy.bind(Game.UpgradesById[this.id]));
    AddEvent(this.div, 'mouseover', SetTooltip.bind(UpgradeDivs[this.id], Game.UpgradesById[this.id].name, Game.UpgradesById[this.id].price, Game.UpgradesById[this.id].desc))
    AddEvent(this.div, 'mouseout', function() {SetTooltip('','','');})
    
    this.update = function() {
        if (Game.UpgradesById[this.id].bought == 1) {
            this.div.style.display = 'none';
            this.enabled = 0;
        }
        else if (Game.UpgradesById[this.id].unlocked == 1){
            this.div.style.display = '';
            this.enabled = 1;
        }  else {
            this.div.style.display = 'none';
        }
    }

}

function CreateUpgradeDivs() {
    for (var i = 0; i < Game.UpgradesN; i++) {
        var u = new UpgradeDiv(i);
        u.update();
    }
}





//////////////////////////
//        ITEMS         //
//////////////////////////


var ItemDivsById = [];
var UpgradeDivs = [];
function UpgradeDiv(upgradeID) {
    this.id = upgradeID
    this.enabled = 1;
    this.div = document.createElement('div');
    this.div.innerHTML = this.id.toLocaleString();
    this.div.className = "upgrade";
    this.div.id = 'upgrade'+this.id;
    this.div.style.display = '';
    Get('upgrades').appendChild(this.div);
    
    UpgradeDivs[this.id] = this.div;
    UpgradeDivsById[this.id]=this;
    
    AddEvent(this.div, 'click', Game.UpgradesById[this.id].buy.bind(Game.UpgradesById[this.id]));
    AddEvent(this.div, 'mouseover', SetTooltip.bind(UpgradeDivs[this.id], Game.UpgradesById[this.id].name, Game.UpgradesById[this.id].price, Game.UpgradesById[this.id].desc))
    AddEvent(this.div, 'mouseout', function() {SetTooltip('','','');})
    
    this.update = function() {
        if (Game.UpgradesById[this.id].bought == 1) {
            this.div.style.display = 'none';
            this.enabled = 0;
        }
        else if (Game.UpgradesById[this.id].unlocked == 1){
            this.div.style.display = '';
            this.enabled = 1;
        }  else {
            this.div.style.display = 'none';
        }
    }

}

function CreateUpgradeDivs() {
    for (var i = 0; i < Game.UpgradesN; i++) {
        var u = new UpgradeDiv(i);
        u.update();
    }
}




//////////////////////////
//        PLANETS       //
//////////////////////////

Game.starsSeed = Game.randomSeed;
Game.planetSeed = Game.randomSeed;

var starPos = [];
function setupStars() {
    var r, x, y, size;
    for (var i = 0; i < 2000; i++) {
        r = Math.seededRandom(0,2000, Game.starsSeed);
        x = r.number;
        r = Math.seededRandom(0,2000, r.seed);
        y = r.number;
        r = Math.seededRandom(0.2,1, r.seed);
        size = r.number;
        Game.starsSeed = r.seed;
        starPos.push({x:x, y:y, size:size});
    }
}

var solarSystemsById = [];
Game.solarSystemEnabled = false;
Game.currentSolarSystem = 0;
Game.currentPlanet = 2;
Game.noSolarSystems = 0;

var moon = function(seed, planetSize) {
    var r = Math.seededRandom(6,12,seed);
    this.size = r.number;
    r = Math.seededRandom(40,1000,r.seed);
    this.orbit = r.number;
    this.velocity = 0.1*Math.sqrt(planetSize/this.orbit);
    r = Math.seededRandom(0,2*Math.PI,r.seed);
    this.startOffset = r.number;
    this.offset = this.startOffset;
    r = Math.seededRandom(50,80,r.seed);
    this.colour = 'hsl(0,0%,'+Math.floor(r.number)+'%)';
    this.shadow = 'hsl(0,0%,'+(Math.floor(r.number)-30)+'%)';
    Game.planetSeed=r.seed;
    
    this.update = function(time) {
        this.offset = this.velocity*time + this.startOffset;
    }
}

var planet = function(seed, sunSize) {
    var r = Math.seededRandom(0,4,seed);
    this.noMoons = r.number;
    r = Math.seededRandom(8,20,r.seed);
    this.size = r.number;
    
    Game.planetSeed = r.seed;
    
    this.moons = [];
    this.largestOrbit = 0;
    for (var i = 0; i < this.noMoons; i++) {
        this.moons[i] = new moon(Game.planetSeed, this.size);
        if (this.moons[i].orbit > this.largestOrbit) {
            this.largestOrbit = this.moons[i].orbit;
        }
    }
    
    r = Math.seededRandom(40,2000,Game.planetSeed);
    this.orbit = r.number;
    this.velocity = 0.1*Math.sqrt(sunSize/this.orbit);
    r = Math.seededRandom(0,2*Math.PI,r.seed);
    this.startOffset = r.number;
    this.offset = this.startOffset;
    r = Math.seededRandom(0,250,r.seed);
    this.colour = 'hsl('+Math.floor(r.number)+',30%,50%)';
    this.shadow = 'hsl('+Math.floor(r.number)+',30%,20%)';
    Game.planetSeed=r.seed;
    
    this.update = function(time, updateMoons) {
        this.offset = this.velocity*time + this.startOffset;
        if (updateMoons) {
            for (var i = 0; i < this.noMoons; i++) {
                this.moons[i].update(time);   
            }
        }
    }
    
}

var solarSystem = function(seed) {
    var r = Math.seededRandom(0,10,seed);
    this.noPlanets = r.number;
    r = Math.seededRandom(70,71,r.seed);
    var colour = 'hsl('+Math.floor(r.number)+',100%,100%)';
    r = Math.seededRandom(10,30,r.seed);
    var size = r.number;
    this.sun = {size:size, colour: colour};
    Game.planetSeed=r.seed;
    this.planets = [];
    this.largestOrbit = 0;
    for (var i = 0; i < this.noPlanets; i++) {
        this.planets[i] = new planet(Game.planetSeed, this.sun.size);
        if (this.planets[i].orbit > this.largestOrbit) {
            this.largestOrbit = this.planets[i].orbit;
        }

    }
    this.getLargestOrbit = function() {
        if (Game.currentPlanet==0) {
            return this.largestOrbit;
        } else {
            return this.planets[Game.currentPlanet-1].largestOrbit;
        }
    }
    this.update = function(time) {
        if (Game.currentPlanet > 0) {
            this.planets[Game.currentPlanet-1].update(time, true);
        } else {
            for (var i = 0; i < this.noPlanets; i++) {
                this.planets[i].update(time, false);
            }
        }
    }
    Game.noSolarSystems++;
}

// Hyfsade startseeds: 5, 10
function setupSolarSystems() {
    for (var k = 0; k < 1; k++) {
        solarSystemsById[k] = new solarSystem(2);
    }
}



//////////////////////////
//        DRAWING       //
//////////////////////////

var canvas = Get('canvas');
var canvasStars = Get('canvasStars')
var ctx = canvas.getContext('2d');
var ctxStars = canvasStars.getContext('2d');

var drawScale = 1;
var largestScale = 2000;
function updateCanvas() {
    canvas.width = window.innerWidth-603;
    canvasStars.width = canvas.width;
    canvas.height = window.innerHeight;
    canvasStars.height = canvas.height;
    if (canvas.width < canvas.height) {
        var l = canvas.width;
    } else {
        l = canvas.height;
    }
    //Offset
    if (Game.currentPlanet==0) {
        l-=40;
    } else {
        l-=150;
    }
    drawScale = 0.5*l/solarSystemsById[Game.currentSolarSystem].getLargestOrbit();
}

function drawStars() {
    ctxStars.clearRect(0, 0, canvasStars.width, canvasStars.height);
    ctxStars.beginPath();
    for (var star in starPos) {
        star = starPos[star];
        ctxStars.moveTo(star.x, star.y);
        ctxStars.arc(star.x, star.y, star.size, 0, 2*Math.PI, false);
    }
    ctxStars.fillStyle = '#FFFFFF';//'#6859c6';
    ctxStars.fill();
}

function drawSolarSystem() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    var ss = solarSystemsById[Game.currentSolarSystem];
    
    // currentPlanet: 0 means the sun
    if (Game.currentPlanet == 0) {
        for (var i = 0; i < ss.noPlanets; i++) {
            var planet = ss.planets[i];
            ctx.moveTo(canvas.width/2+drawScale*planet.orbit, canvas.height/2);
            ctx.arc(canvas.width/2, canvas.height/2, drawScale*planet.orbit, 0, 2*Math.PI); 
        }
        ctx.strokeStyle = '#777777';
        ctx.lineWidth = 0.5;
        ctx.stroke();   
        
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height/2);
        ctx.arc(canvas.width/2, canvas.height/2, ss.sun.size*drawScale, 0, 2*Math.PI);
        ctx.fillStyle = ss.sun.colour;
        ctx.fill();
        for (i = 0; i < ss.noPlanets; i++) {
            planet = ss.planets[i];
            var pos = [canvas.width/2+drawScale*planet.orbit*Math.cos(planet.offset),
                       canvas.height/2+drawScale*planet.orbit*Math.sin(planet.offset)];
            ctx.beginPath();
            ctx.moveTo(pos[0], pos[1]);
            ctx.arc(pos[0], pos[1], drawScale*planet.size, 0, 2*Math.PI);
            ctx.fillStyle = planet.colour;
            ctx.fill();
            
        }
        
    } else {
        var planet = ss.planets[Game.currentPlanet-1];
        var moon;
        for (var i = 0; i < planet.noMoons; i++) {
            moon = planet.moons[i];
            ctx.moveTo(canvas.width/2+drawScale*moon.orbit, canvas.height/2);
            ctx.arc(canvas.width/2, canvas.height/2, drawScale*moon.orbit, 0, 2*Math.PI); 
        }
        ctx.strokeStyle = '#777777';
        ctx.lineWidth = 0.5;
        ctx.stroke();  
        
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height/2);
        ctx.arc(canvas.width/2, canvas.height/2, 2*planet.size*drawScale, planet.offset+0.5*Math.PI, planet.offset+1.5*Math.PI);
        ctx.fillStyle = planet.colour;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, 2*drawScale*planet.size, planet.offset+1.5*Math.PI, planet.offset+0.5*Math.PI);
        //ctx.ellipse(canvas.width/2, canvas.height/2, 2*drawScale*planet.size, drawScale*planet.size, Math.acos(Math.cos(planet.offset))+0.5*Math.PI, 0, 2*Math.PI);
        ctx.fillStyle = planet.shadow;
        ctx.fill();
        for (i = 0; i < planet.noMoons; i++) {
            moon = planet.moons[i];
            var pos = [canvas.width/2+drawScale*moon.orbit*Math.cos(moon.offset),
                       canvas.height/2+drawScale*moon.orbit*Math.sin(moon.offset)];
            ctx.beginPath();
            ctx.moveTo(pos[0], pos[1]);
            ctx.arc(pos[0], pos[1], drawScale*moon.size, planet.offset+0.5*Math.PI, planet.offset+1.5*Math.PI);
            ctx.fillStyle = moon.colour;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(pos[0], pos[1], drawScale*moon.size, planet.offset+1.5*Math.PI, planet.offset+0.5*Math.PI);
            ctx.fillStyle = moon.shadow;
            ctx.fill();
        }
    }
    
    
    
    
}

function draw() {
    if (Game.solarSystemEnabled) {
        drawStars();
        drawSolarSystem();
    }
}

var focusPlanet = null;



///////////////////////////
//   INITIALISE GAME     //
///////////////////////////

doughLevelUp();
Game.CreateItemDivs();
CreateUpgradeDivs();













///////////////////////////
//   General functions   
///////////////////////////

function enableDisplay(id) {
    document.getElementById(id).style.display = "";
}
function disableDisplay(id) {
    document.getElementById(id).style.display = "none";
}
function toggleDisplay(id) {
    if (document.getElementById(id).style.display == "none") {
        document.getElementById(id).style.display = "";
    } else {
        document.getElementById(id).style.display = "none"
    }
}

function Get(what) {return document.getElementById(what);}


function AddEvent(html_element, event_name, event_function){
	html_element.addEventListener(event_name, event_function, true);
}

function RemoveEvent(html_element, event_name, event_function) {
    html_element.removeEventListener(event_name, event_function, false);
}


function print(input) {
    console.log(input);
}





///////////////////////////
// MAIN LOOP - 100 FPS
///////////////////////////
var steps = 0;
Game.timeElapsed = 0;
window.setInterval(function(){
    Game.RunItems(0.01);
    steps++;
    Game.timeElapsed+=0.01;
    if (steps==10) {
        solarSystemsById[Game.currentSolarSystem].update(Game.timeElapsed);
        draw();
        steps=0;
    }
    /*if (steps==100) {
        document.title = Math.floor(Game.pizzas).toLocaleString() + ' PIZZAS';
        steps=0;
    }*/
}, 10);




///////////////////////////
// TESTING FUNCTIONS
///////////////////////////

var startTime = new Date();
var lastFocusTime = startTime.getTime();

window.onfocus=function() {
    var dateTime = new Date();
    var deltaSeconds = (dateTime.getTime()-lastFocusTime)/1000;
    Game.RunItems(deltaSeconds);
    Game.timeElapsed+=deltaSeconds;
}
window.onblur=function() {
    var dateTime = new Date();
    lastFocusTime = dateTime.getTime();
    //disableDisplay('tooltip');
}


window.onmousemove=function(e) {
    if (e.target.className == 'upgrade') {
        var id = e.target.id.replace('upgrade','');
        //print(Game.UpgradesById[id]);
    } else if (e.target.className == 'containerButton' || e.target.className == 'ingredientButton') {
        var el = Game.Items[e.target.id];
        SetTooltip(el.name,el.price,el.desc);
    } else if (e.target.id == 'canvas') {
        
    } else {
        SetTooltip('','','');
        //disableDisplay('tooltip');
    }
};

window.onclick = function(e) {
    if (e.target.className == 'containerButton') {
        var el = Game.Items[e.target.id];
        SetTooltip(el.name,el.price,el.desc);
    } else if (e.target.id == 'canvas' && Game.solarSystemEnabled) {
        if (Game.currentPlanet == 0) {
            Game.currentPlanet = 2;
        } else if (Game.currentPlanet == 2) {
            Game.currentPlanet = 0;
        }
        updateCanvas();
    }
}


Math.seededRandom = function(min, max, seed) {
    max = max || 1;
    min = min || 0;
    
    seed = (seed * 9301 + 49297) % 233280;
    var rnd = seed / 233280;
 
    return {number:min + rnd * (max - min), seed: seed};
}

window.onresize = function(e) {
    updateCanvas();
    draw();
}

window.onbeforeunload = function() {
    localStorage.clear();
    localStorage.setItem('game', JSON.stringify(Game));
}

function init() {
    setupStars();
    setupSolarSystems();
    updateCanvas();
    drawStars();
}



window.onload = function() {
    var g = JSON.parse(localStorage.getItem('game'));
    //g = null;
    if (g != null) {
        Game.timeElapsed=g.timeElapsed;
        Game.randomSeed = g.randomSeed;
        Math.seed = g.randomSeed;
        Game.starsSeed = g.randomSeed;
        Game.planetSeed = g.randomSeed;
        Game.pizzas = g.pizzas;
        setPizza();
        Game.pizzaClicks = g.pizzaClicks;
        Game.clickAmount = g.clickAmount;
        Game.clickAllowed = g.clickAllowed;
        Game.lifetime_pizzas = g.lifetime_pizzas;
        Game.doughLevel = g.doughLevel;
        Game.currentDough = g.currentDough;
        DoughDiv.SetDough();
        Game.nextItem = g.nextItem;
        Game.currentIngredient = g.currentIngredient;
        for (var i = 0; i < Game.itemsN; i++) {
            for (var item in g['ItemsById'][i]) {
                Game.ItemsById[i][item] = g['ItemsById'][i][item];
            }
            Game.ItemsById[i].update();
        }
        for (var i = 0; i < Game.UpgradesN; i++) {
            for (var item in g['UpgradesById'][i]) {
                Game.UpgradesById[i][item] = g['UpgradesById'][i][item];
            }
            Game.UpgradesById[i].update();
        }
        Game.solarSystemEnabled=g.solarSystemEnabled;
        Game.currentSolarSystem=g.currentSolarSystem;
        Game.currentPlanet=2;//g.currentPlanet;
        Game.noSolarSystems=g.noSolarSystems;
        
        Game.ingredientsEnabled = g.ingredientsEnabled;
        if (Game.ingredientsEnabled==1) enableDisplay('ingredientShop');
        Game.staffEnabled=g.staffEnabled;
        if (Game.staffEnabled==1) enableDisplay('staffShop');
        Game.buildingsEnabled=g.buildingsEnabled;
        if (Game.buildingsEnabled==1) enableDisplay('buildingShop');
        Game.itemsEnabled=g.itemsEnabled;
        if (Game.itemsEnabled==1) enableDisplay('itemsBox');
        Game.upgradesEnabled=g.upgradesEnabled;
        if (Game.upgradesEnabled==1) enableDisplay('upgradesBox');
        Game.doughEnabled=g.doughEnabled;
        if (Game.doughEnabled==1) enableDisplay('dough');
        Game.pizzaPerSecondEnabled=g.pizzaPerSecondEnabled;
        if (Game.pizzaPerSecondEnabled==1) enableDisplay('pizzaPerSecondDiv');
        Game.pizzaButtonEnabled=g.pizzaButtonEnabled;
        if (Game.pizzaButtonEnabled==1) {
            enableDisplay('pizzaButton');
        } else {
            disableDisplay('pizzaButton');
        }
    }
    var _lsTotal=0,_xLen,_x;for(_x in localStorage){_xLen= ((localStorage[_x].length + _x.length)* 2);_lsTotal+=_xLen; console.log(_x.substr(0,50)+" = "+ (_xLen/1024).toFixed(2)+" KB")};console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");
    init();
    
}
