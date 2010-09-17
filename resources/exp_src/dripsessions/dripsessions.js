
var canvas;
var end_radius = 10;
var line_width = end_radius*2;
var drips;

function init(){
	canvas = new Canvas('canvas');
	drips = new Array();
	setInterval(run, 50);
}
function run(){
	var ndrips = new Array();
	var dlen = drips.length;
	for(var i=0; i<dlen; i++){
		if(drips[i].update()){
			ndrips.push(drips[i]);
		}
	}
	drips = ndrips;
}
function clear_and_stop(){
	stopDemo();
	drips = new Array();
	canvas.clear();
	
}

function Drip(p){
	this.l = Math.random()*(canvas.height/2);
	this.w = Math.random()*(end_radius/4)+1;
	this.x = p;
	this.fy = p.elementAt(2)+this.l;
}
Drip.prototype.update = function(){
	this.w = Math.random()<0.5?this.w/1.01:this.w;
	this.x = this.x.add( [ (Math.random()<0.1?0.2:0) , Math.random()+0.5]);
	if(this.w < 0.5 || !canvas.isInside(this.x) || this.x.elementAt(2)>this.fy){
		return false;
	}else{
		canvas.circle(this.x,this.w);
		return true;	
	}
}

function getMouseCoords(event){
	if(event == null){
		event = window.event;
	}
	if(event!=null &&(event.pageX || event.pageY)){
		return $V([event.pageX,event.pageY]);
	}
	return null;
}
document.onmousedown = function(event){
	var mc = getMouseCoords(event);
	if(mc != null && canvas.isInside(mc)){
		var previous_pos = mc;
		canvas.circle(previous_pos,end_radius);
		document.onmousemove = function(event){
			var nmc = getMouseCoords(event);
			if(nmc != null && canvas.isInside(nmc)){
				canvas.line(previous_pos, nmc,line_width);
				if(Math.random()<0.3){
					drips.push(new Drip(nmc));
				}
			}
			previous_pos = nmc;
		}
	}
}
document.onmouseup = function(event){
	document.onmousemove = function(){};
}


/*DEMO CODE*/

//this code shouldnt have to change too much from the original drip sessions

var demo_running = false;
var demo_top = 20; var demo_left = 50;
var demo_timer = null;

function demo(){
	if(!demo_running){
		demo_running = true;
		document.getElementById('demo_button').value = 'Stop Demo';
		document.getElementById('demo_button').onclick = function onclick(event){ stopDemo() };
		previous_x = listen[0][0]+demo_left;
		previous_y = listen[0][1]+demo_top;
		performDemo(1,0,15);
	}
}
function stopDemo(){
	if(demo_timer == null){
		return;
	}else{
		clearTimeout(demo_timer);
		demo_timer = null;
	}
	demo_running = false;
	document.getElementById('demo_button').value = 'Demo';
	document.getElementById('demo_button').onclick = function onclick(event){ demo() };
	return;
}
function performDemo(index,arr_num,delay){
	var arr = selectArray(arr_num);
	if(index>=arr.length){
		arr_num++;
		arr = selectArray(arr_num);
		if (arr != null){
			setTimeout("performDemo("+1+","+arr_num+","+delay+")",400);
		}else{
			stopDemo();
		}
		return;
	}
	var previous = $V([arr[index-1][0]+demo_left,arr[index-1][1]+demo_top]);
	var current = $V([arr[index][0]+demo_left,arr[index][1]+demo_top]);
	canvas.line(previous,current,line_width);
	if(Math.random() < 0.3){
		drips.push(new Drip(current));
	}
	demo_timer = setTimeout('performDemo('+(index+1)+','+arr_num+','+delay+')', delay);
}
function selectArray(arr_num){
	switch(arr_num){
		case 0: arr = listen; break;
		case 1: arr = listen_dot; break;
		case 2: arr = listen_cross; break;
		default: arr = null; break;
	}
	return arr;
}

//coordinates for nice drawing!
var listen = [[65,178],[72,176],[80,172],[91,166],[98,162],[105,157],[112,152],[123,141],[131,132],[137,125],[142,119],[148,111],[155,102],[161,94],[167,85],[173,76],[178,67],[183,56],[187,47],[190,36],[192,25],[189,19],[189,19],[182,18],[178,19],[173,20],[163,26],[154,33],[150,37],[149,38],[145,43],[139,50],[135,55],[129,63],[127,66],[125,69],[116,81],[112,87],[108,93],[103,101],[98,109],[95,115],[91,122],[86,129],[82,136],[77,143],[73,150],[69,156],[63,166],[60,171],[55,180],[52,186],[48,193],[44,200],[37,211],[34,217],[30,227],[27,233],[24,240],[21,249],[19,256],[17,264],[17,270],[20,274],[23,276],[30,279],[40,281],[48,280],[57,277],[66,272],[73,268],[80,263],[92,254],[102,243],[109,234],[119,221],[125,212],[133,203],[131,209],[122,223],[115,233],[108,243],[103,253],[100,263],[95,270],[97,272],[104,275],[110,277],[117,278],[124,278],[128,277],[132,276],[142,270],[144,268],[148,265],[151,261],[155,257],[160,249],[166,241],[170,234],[174,227],[178,220],[182,213],[186,207],[188,205],[187,208],[184,213],[185,220],[187,228],[195,236],[200,242],[206,253],[208,261],[209,269],[208,273],[206,275],[201,278],[189,282],[180,283],[170,283],[166,282],[161,280],[156,277],[153,274],[154,275],[153,274],[156,277],[161,280],[166,282],[170,283],[180,283],[189,282],[201,278],[206,277],[208,277],[210,276],[216,274],[223,272],[227,270],[233,268],[239,264],[246,257],[249,252],[255,240],[260,230],[264,222],[270,210],[272,206],[277,196],[281,188],[285,179],[288,172],[294,162],[302,151],[313,140],[320,135],[313,140],[302,151],[294,162],[288,172],[285,179],[281,188],[277,196],[272,206],[270,210],[264,222],[260,230],[255,240],[249,252],[247,267],[247,271],[252,276],[256,278],[262,279],[273,280],[281,279],[287,277],[289,276],[294,274],[298,271],[301,269],[307,265],[309,263],[318,254],[323,249],[328,242],[336,234],[344,236],[354,235],[363,233],[369,232],[377,226],[381,220],[383,212],[383,209],[379,207],[381,208],[375,205],[368,204],[358,205],[349,210],[343,215],[341,218],[333,229],[329,236],[328,242],[324,248],[325,251],[325,256],[325,261],[326,265],[328,269],[334,273],[343,275],[348,275],[356,275],[360,274],[369,272],[378,267],[382,264],[392,257],[395,254],[402,248],[406,243],[410,239],[416,231],[422,222],[428,211],[433,201],[428,211],[422,222],[416,231],[412,239],[408,247],[405,253],[400,265],[397,272],[394,280],[397,272],[400,265],[405,253],[408,247],[411,242],[412,240],[417,233],[426,224],[428,223],[439,215],[447,210],[450,208],[457,204],[463,201],[472,197],[483,193],[481,195],[475,205],[471,212],[467,219],[461,232],[457,241],[454,247],[451,253],[447,263],[444,272],[444,273],[444,282],[450,282],[455,281],[463,277],[471,272],[477,267],[481,263],[489,254],[492,251],[501,242]];
var listen_dot = [[159,169],[154,161],[152,164],[153,168],[157,168],[160,163]];
var listen_cross = [[242,200],[242,200],[242,200],[249,201],[260,201],[273,200],[285,200],[294,199],[311,195],[322,192],[335,187]];





