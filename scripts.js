var Game={};

Game.tooltipTitle = l('tooltipTitleText');
Game.tooltipPrice = l('tooltipPriceText');
Game.tooltipDesc = l('tooltipDescText');
Game.tooltipPizza = l('tooltipPizzasText');
Game.Tooltip = function(title, price, desc) { 
    if (price <= Game.pizzas) {
        Game.tooltipPrice.style.color = '#5cf731';
    } else {
        Game.tooltipPrice.style.color = '#f90404';
    }
    if (title.length != 0){
        Game.tooltipPizza.innerHTML = 'Pizzas:&nbsp';
    } else {
        Game.tooltipPizza.innerHTML = '';
    }
    Game.tooltipTitle.innerHTML = title;
    Game.tooltipPrice.innerHTML = price;
    Game.tooltipDesc.innerHTML = desc;
}
///////////////////////////
// PIZZA
///////////////////////////

Game.pizzas = 10000;
Game.lifetime_pizzas = Game.pizzas;
l('pizza').innerHTML = Math.ceil(Game.pizzas).toLocaleString();

Game.pizzaButton =l('pizzaButton');
Game.ClickPizza = function(event, amount) {
    Game.pizzaClick(1);
}
AddEvent(Game.pizzaButton, 'click', Game.ClickPizza);

Game.pizzaClick = function(number) {
     if (number > 0 && dough >= number) {
        Game.pizzas += number;  
        Game.lifetime_pizzas += number;
        l('pizza').innerHTML = Math.ceil(Game.pizzas).toLocaleString();
        doughClick(-number);
    } else if (number < 0) {
        Game.pizzas += number;    
        l('pizza').innerHTML = Math.ceil(Game.pizzas).toLocaleString();
    } 
}

///////////////////////////
// DOUGH
///////////////////////////

var dough = 100000;
l('dough').innerHTML = Math.ceil(dough).toLocaleString();

function doughClick(number) {
    if (number < 0)
    dough = dough + number;
    l('dough').innerHTML = Math.ceil(dough).toLocaleString();
}



///////////////////////////
// STORE
///////////////////////////

// STORE ITEMS
Game.Items = [];
Game.ItemsById = [];

Game.itemsN = 0;

Game.Item = function(name, desc, price, type, pizzaFunction) {
    this.id = Game.itemsN;
    this.name = name;
	this.desc = desc;
	this.price = price;
	this.pizzaFunction = pizzaFunction;
    this.type = type;
	this.unlocked = 0;
    this.noItems = 0;
    
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
    this.buy = function() {
        if (Game.pizzas >= this.price) {
            Game.pizzaClick(-this.price)
            if (this.buyFunction) this.buyFunction(); 
            this.noItems++;
            this.price *= 1.15;
            Game.ItemDivsById[this.id].update();
        }
    }
    this.checkPPS = function() {
        if (this.pizzaFunction) {
            return this.pizzaFunction();
        } else {
            return 0;
        }
    }
    this.getName = function() {
        return this.name;
    }
    this.getDesc = function() {
        return this.desc;
    }
    this.getPrice = function() {
        return this.price;
    }
	return this;
}

new Game.Item('Baker', 'A lovely baker.', 100, 'staff', function() {
    return this.noItems;
});
new Game.Item('Italian', 'A lovely italian.', 1000, 'staff');
Game.ItemDivs = [];
Game.ItemDivsById = [];

Game.ItemDiv = function(itemID) {
    this.id = itemID;
    this.enabled = 0;
    
    //this.div.className = Game.ItemsById[this.id].type;
    this.button = document.createElement('button');
    this.button.className = 'containerButton';
    this.button.id = Game.ItemsById[this.id].type+this.id;
    
    l(Game.ItemsById[this.id].type + 'Shop').appendChild(this.button);
    
    this.title = document.createElement('div');
    this.title.className = 'buttonTitle';
    this.title.innerHTML = Game.ItemsById[this.id].name;
    
    this.price = document.createElement('div');
    this.price.className = 'textLeft';
    this.price.innerHTML = Game.ItemsById[this.id].price;
    
    this.noItems = document.createElement('div');
    this.noItems.className = 'textRight';
    this.noItems.innerHTML = Game.ItemsById[this.id].noItems;
    
    this.button.appendChild(this.title);
    this.button.appendChild(this.price);
    this.button.appendChild(this.noItems);
    
    Game.ItemDivs[this.id] = this.div;
    Game.ItemDivsById[this.id] = this;
    
    AddEvent(this.button, 'click', Game.ItemsById[this.id].buy.bind(Game.ItemsById[this.id]));
    AddEvent(this.button, 'mouseover', Game.Tooltip.bind(Game.ItemsById[this.id], Game.ItemsById[this.id].getName(), Game.ItemsById[this.id].getPrice(), Game.ItemsById[this.id].getDesc()))
    AddEvent(this.button, 'mouseout', function() {Game.Tooltip('','','');})
    
    this.unlock = function() {
        toggleDisplay(this.button.id);
        this.enabled = 1;
    }
    this.disable = function() {
        toggleDisplay(this.button.id);
        this.enabled = 0;
    }
    
    this.update = function() {
        this.noItems.innerHTML = Game.ItemsById[this.id].noItems;
        this.price.innerHTML = Game.ItemsById[this.id].price.toFixed(0);
    }
    
    

}


Game.createItemDivs = function() {
    for (var i = 0; i < Game.itemsN; i++) {
        new Game.ItemDiv(i);
    }
}
Game.createItemDivs();


Game.CheckPPS = function(fps) {
    var amount = 0;
    for (var i = 0; i < Game.itemsN; i++) {
        amount += Game.ItemsById[i].checkPPS();
    }
    Game.pizzaClick(amount/fps);
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

Game.rebuildUpgrades = function() {
    for (var item in Game.Upgrades) {
        if (item.unlocked == 0 && Game.pizzas >= item.price) {
            item.unlocked = 1;
            item.enable();
        }
    }
}

Game.Upgrade=function(name, desc, price, buyFunction) {
    this.id = Game.UpgradesN;
    this.name = name;
	this.desc = desc;
	this.price = price;
	this.buyFunction = buyFunction;
	this.unlocked = 0;
	this.bought = 0;
	this.type = 'upgrade';
	Game.Upgrades[this.name] = this;
	Game.UpgradesById[this.id]=this;
	Game.UpgradesN++;
    
    /* TODO: Unlocking due to building, last item bought etc */
    this.checkUnlocked = function() {
        if (Game.lifetime_pizzas > this.price*0.5 && this.unlocked == 0) {
            this.unlocked = 1;
            Game.UpgradeDivsById[this.id].unlock();
        }
    }
    this.buy = function() {
        if (Game.pizzas >= price) {
            this.bought = 1;
            Game.pizzaClick(-this.price)
            if (this.buyFunction) this.buyFunction(); 
            Game.UpgradeDivsById[this.id].disable();
        }
    }
	return this;
}

new Game.Upgrade('Bakers bake', 'Makes the baker bake <b>&nbsp10%&nbsp</b> more pizzas!', 100, function() {
    Game.baker.boost *= 1.1;
});
new Game.Upgrade('Bakers gonna bake', 'Makes even moore pizzas', 100, function() {
    Game.baker.boost *= 1.1;
});
new Game.Upgrade('Italiaano', 'what u gonna do', 1000, function() {
    Game.italian.boost *= 1.1;
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
    this.div.style.display = 'none';
    l('upgrades').appendChild(this.div);
    
    Game.UpgradeDivs[this.id] = this.div;
    Game.UpgradeDivsById[this.id]=this;
    
    AddEvent(this.div, 'click', Game.UpgradesById[this.id].buy.bind(Game.UpgradesById[this.id]));
    AddEvent(this.div, 'mouseover', Game.Tooltip.bind(Game.UpgradeDivs[this.id], Game.UpgradesById[this.id].name, Game.UpgradesById[this.id].price, Game.UpgradesById[this.id].desc))
    AddEvent(this.div, 'mouseout', function() {Game.Tooltip('','','');})
    this.unlock = function() {
        toggleDisplay(this.div.id);
        this.enabled = 1;
    }
    this.disable = function() {
        toggleDisplay(this.div.id);
        this.enabled = 0;
    }

}

Game.createUpgradeDivs = function() {
    for (var i = 0; i < Game.UpgradesN; i++) {
        new Game.UpgradeDiv(i);
    }
}
Game.createUpgradeDivs();

Game.checkUpgrades = function() {
    for (var i = 0; i < Game.UpgradesN; i++) {
        Game.UpgradesById[i].checkUnlocked();
    }
}

///////////////////////////
// Interval functions
///////////////////////////




///////////////////////////
// General functions
///////////////////////////

function enableDisplay(id) {
    document.getElementById(id).style.display = "block";
}
function disableDisplay(id) {
    document.getElementById(id).style.display = "none";
}
function toggleDisplay(id) {
    if (document.getElementById(id).style.display == "none") {
        document.getElementById(id).style.display = "block";
    } else {
        document.getElementById(id).style.display = "none"
    }
}

function l(what) {return document.getElementById(what);}


function AddEvent(html_element, event_name, event_function){
	html_element.addEventListener(event_name, event_function, true);
}
///////////////////////////
// MAIN LOOP - 100 FPS
///////////////////////////

window.setInterval(function(){
    var globalBoost = 1
    Game.checkUpgrades();
    Game.CheckPPS(100);
}, 10);




///////////////////////////
// TESTING FUNCTIONS
///////////////////////////



