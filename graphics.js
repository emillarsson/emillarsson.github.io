var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var dots = [];
var no_dots = toInt(Math.random()*14+1)*2;

function toInt(n){ return Math.round(Number(n)); };

for (var i = 0; i < no_dots; i++) {
    dots.push([document.body.clientWidth/2, document.body.clientHeight/2,document.body.clientWidth/2, document.body.clientHeight/2, Math.pow(-1,i)])
}

var fromMiddle = 0;
function update(time, w) {
    for (var i = 0; i < no_dots; i++) {
        dots[i][2] = dots[i][0];
        dots[i][3] = dots[i][1];
        dots[i][0] += time*Math.sin(dots[i][4]*w*4 + i/no_dots*Math.PI*2);
        dots[i][1] += time*Math.cos(dots[i][4]*w*4 + i/no_dots*Math.PI*2);   
    }
    
    fromMiddle = Math.sqrt(Math.pow(dots[0][0]+dots[0][1],2)+Math.pow(document.body.clientHeight/2+document.body.clientWidth/2,2))/document.body.clientWidth/2;
    print(document.body.height);
}


function draw(t) {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    for (var i= 0; i < no_dots; i++) {
        ctx.moveTo(dots[i][2],dots[i][3]);
        ctx.lineTo(dots[i][0],dots[i][1]);
    }
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgb(200,200,120)';
    ctx.stroke();
   
}


var t = 0;
var w = 0;
var delta_w = 0.01;
var delta_t = 0.01;
var it = 150;
var n = 150;
window.setInterval(function(){
    t+=delta_t;
    w+=delta_t;
    it+=1;
    update(t, w);
    draw();
    if (it > n) {
        n = 0;
        delta_t = (0.5-Math.random())*0.2;
        delta_w += delta_t*0.0001;
    }
}, 5);



function print(output) {
    console.log(output);
}