///////////////////////////
//         GAME          //
///////////////////////////


var Game={};

Game.pizzaClicks = 0;
disableDisplay('shop');
disableDisplay('ingredientShop')
disableDisplay('staffShop')
disableDisplay('buildingShop')
disableDisplay('researchShop')
disableDisplay('explorationShop')
disableDisplay('upgradesBox')
disableDisplay('dough')
disableDisplay('pizzaPerSecondDiv')
///////////////////////////
//       TOOLTIP         //
///////////////////////////

Game.tooltipTitle = Get('tooltipTitleText');
Game.tooltipPrice = Get('tooltipPriceText');
Game.tooltipDesc = Get('tooltipDescText');
Game.tooltipPizza = Get('tooltipPizzasText');
Game.Tooltip = function(title, price, desc) { 
    if (price <= Game.pizzas) {
        Game.tooltipPrice.style.color = '#5cf731';
    } else {
        Game.tooltipPrice.style.color = '#f90404';
    }
    if (title.length != 0 && price > 0){
        Game.tooltipPizza.innerHTML = 'Pizzas:&nbsp';
    } else {
        Game.tooltipPizza.innerHTML = '';
    }
    Game.tooltipTitle.innerHTML = title;
    if (price > 0) {
        Game.tooltipPrice.innerHTML = price.toLocaleString();
    } else {
        Game.tooltipPrice.innerHTML = '';
    }
    Game.tooltipDesc.innerHTML = desc;
}










///////////////////////////
// PIZZA
///////////////////////////

Game.pizzas = 0;
Game.clickAmount = 1;
Game.clickAllowed = false;
Game.lifetime_pizzas = Game.pizzas;
Get('pizza').innerHTML = Math.ceil(Game.pizzas).toLocaleString();

Game.pizzaButton = Get('pizzaButton');
Game.ClickPizza = function() {
    if (Game.pizzaClicks == 0) {
        Game.Upgrades['Ingredients'].unlock();
        disableDisplay('pizzaButton');
        enableDisplay('upgradesBox');
        Game.pizzaClicks++;
    }
    if (!Game.clickAllowed) {return;}
    
    if (Game.currentDough.name == 'Wheat dough') {
        var item = Game.Items['Wheat'];
        if (Game.Upgrades['Water Pipeline'].bought==0) {
            var item2 = Game.Items['Water'];
            if (item.noItems >= Game.clickAmount && item2.noItems >= Game.clickAmount) {
                item.noItems -= Game.clickAmount;
                item.update();
                item2.noItems -= Game.clickAmount;
                item2.update();
                Game.pizzaClick(Game.clickAmount);
                Game.pizzaClicks++;
            } 
        } else {
            if (item.noItems >= Game.clickAmount) {
                item.noItems -= Game.clickAmount;
                item.update();
                Game.pizzaClick(Game.clickAmount);
                Game.pizzaClicks++;
            }   
        }
        Game.CheckItems();
        Game.CheckUpgrades();
        
    } else if (Game.currentDough.name == 'Sourdough'){
        Game.pizzaClick(Game.clickAmount);
        Game.pizzaClicks++;
    }    
}
AddEvent(Game.pizzaButton, 'click', Game.ClickPizza);

Game.pizzaClick = function(number) {
    Game.pizzas += number;  
    Game.lifetime_pizzas += number;
    Get('pizza').innerHTML = Math.floor(Game.pizzas).toLocaleString();
    
    if (Game.pizzas == 20) {Game.Upgrades['Water Pipeline'].unlock();}
    if (Game.pizzas == 50000) {Game.Upgrades['Sourdough'].unlock();}

}


Game.CheckItems = function() {
    if (Game.pizzas > Game.nextItem.price*0.5) {
        Game.nextItem.unlock();
    }
}

Game.CheckUpgrades = function() {
    if (Game.pizzaClicks == 100) {Game.Upgrades['Pizzaclicker'].unlock();}
}






///////////////////////////
//         DOUGH         //
///////////////////////////

Game.doughByLevel = [];
Game.doughLevel = -1;
Game.currentDough = null;
Game.doughsN = 0;

Game.Dough = function(name, desc, doughFunction) {
    this.name = name;
    this.desc = desc;
    this.level = Game.doughsN;
    
    Game.doughByLevel[this.level] = this;
    Game.doughsN++;
    
    this.doughFunction = doughFunction;
}

new Game.Dough('Wheat dough', 'Just your plain ol&#39 dough');
new Game.Dough('Sourdough', 'Oh yeah, now we&#39 talking!');
new Game.Dough('Cookie dough', 'I&#39m not sure this is a thing..');

Game.DoughDiv = {
    element : Get('dough'),
    title : Get('doughTitle'),
    desc : Get('doughDesc'),
    // image?
    
    SetDough : function() {
        this.title.innerHTML = Game.doughByLevel[Game.doughLevel].name;
        this.desc.innerHTML = Game.doughByLevel[Game.doughLevel].desc;
    }
}

function doughLevelUp() {
    Game.doughLevel++;
    Game.DoughDiv.SetDough();
    Game.currentDough = Game.doughByLevel[Game.doughLevel];
}












///////////////////////////
// STORE
///////////////////////////

// STORE ITEMS
Game.Items = [];
Game.ItemsById = [];
Game.nextItem = null;
Game.itemsN = 0;

Game.Item = function(name, desc, price, type, pizzaFunction, buyFunction) {
    this.id = Game.itemsN;
    this.name = name;
	this.desc = desc;
	this.price = price;
	this.pizzaFunction = pizzaFunction;
    this.buyFunction = buyFunction;
    this.type = type;
	this.unlocked = 0;
    this.noItems = 0;
    this.ppsBoost = 1; // 1 = 100% of normal pps
    
	Game.Items[this.name] = this;
	Game.ItemsById[this.id] = this;
	Game.itemsN++;
    
    /* TODO: Unlocking due to building, last item bought etc */
    this.checkUnlocked = function() {
        if (Game.lifetime_pizzas > this.price*0.5 && this.unlocked == 0) {
            this.unlocked = 1;
            Game.ItemDivsById[this.id].unlock();
        }
    }
    this.unlock = function() {
        Game.ItemDivsById[this.id].unlock();
    }
    this.update = function() {
        Game.ItemDivsById[this.id].update();
    }
    this.buy = function() {
        if (Game.pizzas >= this.price) {
            Game.pizzaClick(-this.price)
            this.noItems++;
            if (this.buyFunction) this.buyFunction(); 
            this.price *= 1.15;
            Game.ItemDivsById[this.id].update();
            if (Game.ItemsById[this.id+1] && Game.nextItem == this) {
                Game.nextItem = Game.ItemsById[this.id+1];
            }
        }
    }
    this.checkPPS = function() {
        if (this.pizzaFunction) {
            return this.pizzaFunction();
        } else {
            return 0;
        }
    }
    this.addPPS = function(amount) {
        this.ppsBoost += amount;
    }
	return this;
}

new Game.Item('Water', 'Refreshing.', 0, 'ingredient', null, function() {if (this.noItems == 20) Game.ItemDivs['Wheat'].unlock();});
new Game.Item('Wheat', 'Wheat the fuck.', 0, 'ingredient', null, function() {if (this.noItems == 20) Game.UpgradesById[1].unlock();});

new Game.Item('Baker', 'A lovely baker.', 15, 'staff', function() {return this.noItems*this.ppsBoost*0.1;}, function() {if (this.noItems == 1) Game.Upgrades['Bakers bake'].unlock()});
new Game.Item('Italian', 'A lovely italian.', 100, 'staff', function() {return this.noItems*this.ppsBoost*1;}, function() {if (this.noItems == 1) {Game.Upgrades['Italiaano'].unlock()}});

// Initialising chain of items
Game.nextItem = Game.ItemsById[0];
Game.ItemDivs = [];
Game.ItemDivsById = [];

Game.ItemDiv = function(itemID, name) {
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
    
    if (Game.ItemsById[this.id].price > 0) {
        this.price = document.createElement('div');
        this.price.className = 'textLeft';
        this.price.innerHTML = Game.ItemsById[this.id].price.toLocaleString();
        this.button.appendChild(this.price);
    }
    
    this.noItems = document.createElement('div');
    this.noItems.className = 'textRight';
    this.noItems.innerHTML = Game.ItemsById[this.id].noItems;
    this.button.appendChild(this.noItems);
    
    
    
    
    Game.ItemDivs[this.name] = this;
    Game.ItemDivsById[this.id] = this;
    
    AddEvent(this.button, 'click', Game.ItemsById[this.id].buy.bind(Game.ItemsById[this.id]));
    AddEvent(this.button, 'mouseover', Game.Tooltip.bind(Game.ItemsById[this.id], Game.ItemsById[this.id].name, Game.ItemsById[this.id].price, Game.ItemsById[this.id].desc))
    AddEvent(this.button, 'mouseout', function() {Game.Tooltip('','','');})
    
    this.removeEvents = function() {
        var old_element = this.button;
        this.button = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(this.button, old_element);
        AddEvent(this.button, 'mouseover', Game.Tooltip.bind(Game.ItemsById[this.id], Game.ItemsById[this.id].name, Game.ItemsById[this.id].price, Game.ItemsById[this.id].desc))
        AddEvent(this.button, 'mouseout', function() {Game.Tooltip('','','');})
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
        this.noItems.innerHTML = Game.ItemsById[this.id].noItems;
        if (this.price) {
            this.price.innerHTML = Game.ItemsById[this.id].price.toFixed(0);
        }
    }
    
    

}

Game.CreateItemDivs = function() {
    for (var i = 0; i < Game.itemsN; i++) {
        var item = new Game.ItemDiv(i, Game.ItemsById[i].name);
        item.disable();
    }
}

Game.CheckPPS = function(fps) {
    if (Game.itemsN > 0) {
        var amount = 0;
        for (var i = 0; i < Game.itemsN; i++) {
            amount += Game.ItemsById[i].checkPPS();
        }
        Game.pizzaClick(amount/fps);
        Get('pizzaPerSecond').innerHTML = amount.toFixed(1);
    }
}











///////////////////////////
// UPGRADES
///////////////////////////

Game.upgradesToRebuild = 1;
Game.Upgrades = [];
Game.UpgradesById = [];
Game.UpgradesN = 0;
Game.UpgradeDivs = [];
Game.UpgradesOwned = 0;

Game.RebuildUpgrades = function() {
    for (var item in Game.Upgrades) {
        if (item.unlocked == 0 && Game.pizzas >= item.price) {
            item.unlocked = 1;
            item.enable();
        }
    }
}

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
                Game.UpgradeDivsById[this.id].unlock();
            }
        }
    }
    
    this.unlock = function() {
        if (this.bought==1) return;
        this.unlocked = 1;
        Game.UpgradeDivsById[this.id].unlock();
    }
    this.buy = function() { 
        
        if (Game.pizzas >= this.price) {
            if (this.buyFunction) this.buyFunction(); 
            this.bought = 1;
            Game.pizzaClick(-this.price)
            Game.UpgradeDivsById[this.id].disable();
        }
    }
    this.setPrice = function(price) {
        this.price = price;
    }
	return this;
}

new Game.Upgrade('Ingredients', 'Pizzas are not made out of thin air, buddy!', 0, function() {
    enableDisplay('shop');enableDisplay('ingredientShop'); Game.ItemDivs['Water'].unlock();
});
new Game.Upgrade('Wheat Dough', 'Wheat and water makes the best dough!', 0, function() {
    enableDisplay('dough'); 
    enableDisplay('pizzaButton'); 
    Game.clickAllowed = true;});

new Game.Upgrade('Water Pipeline', 'Install a water pipeline for endless supply!', 50, function() {
    enableDisplay('staffShop'); 
    enableDisplay('Baker');
    enableDisplay('pizzaPerSecondDiv')
    Game.ItemDivs['Water'].noItems.innerHTML = ''; Game.ItemDivs['Water'].removeEvents();
});

new Game.Upgrade('Bakers bake', 'The bakers bake <b>twice</b> as many pizzas!', 500, function() {
    Game.Items['Baker'].addPPS(1);
    Game.Upgrades['Bakers gonna bake'].unlock();
});
new Game.Upgrade('Pizzaclicker', 'Increase pizzas per click!', 5000, function() {Game.clickAmount=2;});
new Game.Upgrade('Italiaano', 'what u gonna do', 10000, function() {Game.Items['Italian'].addPPS(1);});
new Game.Upgrade('Bakers gonna bake', 'Inspire the bakers to bake <b>twice</b> as many pizzas!', 10000, function() { Game.Items['Baker'].addPPS(1);});
new Game.Upgrade('Sourdough', 'Mhm, fermentation...', 100000, function() {
    doughLevelUp();
    Game.Upgrades['Cookie dough'].unlock();
});
new Game.Upgrade('Cookie dough', 'Ehh, I think this is the wrong clicker.', 1000000, function() {
    doughLevelUp();
});


Game.UpgradeDivsById = [];
Game.UpgradeDivs = [];
Game.UpgradeDiv = function(upgradeID) {
    this.id = upgradeID
    this.enabled = 1;
    this.div = document.createElement('div');
    this.div.innerHTML = this.id.toLocaleString();
    this.div.className = "upgrade";
    this.div.id = 'upgrade'+this.id;
    this.div.style.display = '';
    Get('upgrades').appendChild(this.div);
    
    Game.UpgradeDivs[this.id] = this.div;
    Game.UpgradeDivsById[this.id]=this;
    
    AddEvent(this.div, 'click', Game.UpgradesById[this.id].buy.bind(Game.UpgradesById[this.id]));
    AddEvent(this.div, 'mouseover', Game.Tooltip.bind(Game.UpgradeDivs[this.id], Game.UpgradesById[this.id].name, Game.UpgradesById[this.id].price, Game.UpgradesById[this.id].desc))
    AddEvent(this.div, 'mouseout', function() {Game.Tooltip('','','');})
    this.unlock = function() {
        this.div.style.display = '';
        this.enabled = 1;
    }
    this.disable = function() {
        this.div.style.display = 'none';
        this.enabled = 0;
    }

}

Game.CreateUpgradeDivs = function() {
    for (var i = 0; i < Game.UpgradesN; i++) {
        var u = new Game.UpgradeDiv(i);
        u.disable();
        
    }
}










///////////////////////////
//   INITIALISE GAME     //
///////////////////////////

doughLevelUp();
Game.CreateItemDivs();
Game.CreateUpgradeDivs();













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








///////////////////////////
// MAIN LOOP - 100 FPS
///////////////////////////

window.setInterval(function(){
    var globalBoost = 1
    Game.CheckPPS(100);
}, 10);




///////////////////////////
// TESTING FUNCTIONS
///////////////////////////



