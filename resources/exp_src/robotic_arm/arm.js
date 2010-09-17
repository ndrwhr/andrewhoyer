/* CONSTANTS */
var pi = Math.PI;
var ARM_LENGTH;
var RADIUS1, RADIUS2, RADIUS3;

/* VARIABLES */
var canvas_width, canvas_height;
var Xcenter, Ycetner;
var main_ctx, timeout = null;
var desired_pos, delta_thetas,final_thetas;
var mainArm, secondArm;

function init(){
	canvas = document.getElementById('canvas');
	canvas_width = canvas.width;
	canvas_height = canvas.height;
	Xcenter = canvas_width/2;
	Ycenter = canvas_height/2;
	
	ARM_LENGTH = canvas_width/4;
	RADIUS1 = canvas_width/20;
	RADIUS2 = canvas_width/30;
	RADIUS3 = RADIUS2*0.7;
	
	main_ctx = canvas.getContext('2d');
	
	drawCircle(main_ctx);
	initArms(main_ctx);
	redrawArms(main_ctx, $V([Math.random()*2*pi,Math.random()*2*pi]) );
}

function initArms(){
	mainArm = new Arm(ARM_LENGTH,RADIUS1,RADIUS2);
	mainArm.setBase(0,0);
	secondArm = new Arm(ARM_LENGTH,RADIUS2,RADIUS3);
	secondArm.setBase(mainArm.getPosX(),mainArm.getPosY());
}
function redrawArms(ctx,thetas){
	drawCircle(ctx);
	mainArm.setAngle(thetas.elementAt(1));
	mainArm.drawArm(ctx);

	secondArm.setBase(mainArm.getPosX(),mainArm.getPosY());
	secondArm.setAngle(thetas.elementAt(2));
	secondArm.drawArm(ctx);
}
function drawCircle(ctx){
	ctx.save();
	ctx.clearRect(0,0,canvas_width,canvas_height);
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = "#FFFFFF";
	ctx.arc(Xcenter,Ycenter,ARM_LENGTH*2,0,2*pi,true);
	ctx.fill();

	ctx.beginPath();
	ctx.strokeStyle = "#999999";
	ctx.moveTo(Xcenter+ARM_LENGTH*2,Ycenter);
	ctx.arc(Xcenter,Ycenter,ARM_LENGTH*2,0,2*pi,true);
	ctx.stroke();
	ctx.restore();
	ctx.restore()
}
function drawTarget(P,ctx){
	ctx.save();
	ctx.beginPath();
	ctx.strokeStyle = "#4444dd";
	ctx.arc(P.elementAt(1),P.elementAt(2),RADIUS3/2,0,2*pi,true);
	ctx.stroke();
	ctx.restore();
}

function calcPos(t){
	var x = Math.cos(t.elementAt(1)) + Math.cos(t.elementAt(2));
	var y = Math.sin(t.elementAt(1)) + Math.sin(t.elementAt(2));
	return $V([ARM_LENGTH*x,ARM_LENGTH*y]);
}
function calcJacobian(t){
	var f1 = -ARM_LENGTH*Math.sin(t.elementAt(1));
	var f2 = -ARM_LENGTH*Math.sin(t.elementAt(2));
	var f3 =  ARM_LENGTH*Math.cos(t.elementAt(1));
	var f4 =  ARM_LENGTH*Math.cos(t.elementAt(2));
	return $M([[f1,f2],[f3,f4]]);
}
function calcThetas(position, theta){
	var n = 40;
	for(var i=0; i<n; i++){
		var f = calcPos(theta).subtract(position).scale(-1);
		var J = calcJacobian(theta);
		var s = J.solve(f);
		theta = theta.add(s);
		if(s.length() < (1e-6))
			break;
	}
	return unwrapAngles(theta);
}

//the arm object
function Arm(arm_length,width1,width2){
	this.x;
	this.y;
	this.length = arm_length; 
	this.width1 = width1; 
	this.width2 = width2;
	this.angle;
	
	this.setBase = function(x,y){
		this.x = x;
		this.y = y;
	}
	this.setAngle = function(angle){
		this.angle = angle;
	}
	this.getPosX = function(){
		return this.length*Math.cos(this.angle);
	}
	this.getPosY = function(){
		return this.length*Math.sin(this.angle);
	}
	this.drawArm = function(ctx){
		ctx.save();
		ctx.translate((Xcenter)+this.x,(Ycenter)+this.y);
		ctx.rotate(this.angle);
		
		ctx.beginPath();
		ctx.fillStyle = "#999999";
		ctx.arc(0,0,this.width1,pi/2,-pi/2,true);
		ctx.lineTo(this.length,-this.width2);
		ctx.arc(this.length,0,this.width2,-pi/2,pi/2,true);
		ctx.fill();
		
		ctx.beginPath();
		ctx.lineWidth = 2;
		
		//draw the main joint
		ctx.arc(0,0,this.width1, 0, 2*pi,true);
		ctx.stroke();
		ctx.beginPath();
		ctx.fillStyle = "#000000";
		ctx.arc(0,0,this.width1/1.5, 0, 2*pi,true);
		ctx.fill();
		ctx.beginPath();
		
		//draw the lines connecting the joints
		ctx.moveTo(0,this.width1);
		ctx.lineTo(this.length,this.width2);
		ctx.moveTo(0,-this.width1);
		ctx.lineTo(this.length,-this.width2);
		
		//draw the end of the arm
		ctx.moveTo(this.length+this.width2,0);
		ctx.arc(this.length,0,this.width2,0,2*pi,true);
				
		ctx.stroke();
		
		ctx.restore();
	}
}

function animate(count,num_steps){
	if(count>=num_steps){
		//stop the animation.
		clearTimeout(timeout);
		timeout = null;
		//cheating a little by drawing the final position exactly
		redrawArms(main_ctx, final_thetas);
		drawTarget(calcActualCoords(desired_pos),main_ctx);
		return;
	}
	var new_thetas = $V([mainArm.angle,secondArm.angle]).add(delta_thetas);
	redrawArms(main_ctx, new_thetas);
	drawTarget(calcActualCoords(desired_pos),main_ctx);
	timeout = setTimeout('animate('+ (count+1) +','+ num_steps+')',5);
	return;
}

/* INPUT CODE */
function withinBoundingCircle(V){
	return (V.length() < ARM_LENGTH*2);
}
function calcRelativeCoords(P){
	var x = P.elementAt(1);
	var y = P.elementAt(2);
	return $V([x-Xcenter-0.5, y-Ycenter-0.5])
}
function calcActualCoords(P){
	var x = P.elementAt(1);
	var y = P.elementAt(2);
	return $V([x+Xcenter+0.5, y+Ycenter+0.5])
}
function unwrapAngles(thetas){
	var t1, t2;
	if(Math.abs(thetas.elementAt(1)) >= 2*pi){
		a = Math.floor(thetas.elementAt(1)/(2*pi));
		t1 = thetas.elementAt(1)-a*2*pi;
	}else{
		t1 = thetas.elementAt(1);
	}
	
	if(Math.abs(thetas.elementAt(2)) >= 2*pi){
		a = Math.floor(thetas.elementAt(2)/(2*pi));
		t2 = thetas.elementAt(2)-a*2*pi;
	}else{
		t2 = thetas.elementAt(2);
	}
	return $V([t1,t2]);
}


function getMouseCoords(event){
	if(event == null){
		event = window.event; 
	}
	if(event == null){
		return null; 
	}
	if(event.pageX || event.pageY){
		return {x:event.pageX, y:event.pageY};
	}
	return null;
}
document.onmousedown = function(event){
	var mouseCoords; 
	mouseCoords = getMouseCoords(event); 
	if(mouseCoords == null){
		return; 
	}
	
	if(timeout != null){
		clearTimeout(timeout);
		timeout = null;
	}
	
	var actual_pos = $V([mouseCoords.x, mouseCoords.y]);
	desired_pos = calcRelativeCoords(actual_pos);
	
	if( withinBoundingCircle(desired_pos) ){
		var curr_thetas = $V([mainArm.angle,secondArm.angle]);
		var curr_pos = calcPos(curr_thetas);
		
		var distance_vector = desired_pos.subtract(curr_pos);
		var total_distance = distance_vector.length();
		
		if(total_distance>1){
			var num_segments = Math.round(total_distance/25);
			var count, start_pos = curr_pos;
			var thetas0 = curr_thetas, thetas1;
			var positions0 = curr_pos, positions1;
			
			//calculate several points along the line between the two points
			for(count=1; count<=num_segments; count++){
				positions1 = start_pos.add(distance_vector.scale(count/num_segments));
				thetas1 = calcThetas(positions1, thetas0);
				thetas0 = thetas1;
			}
			//if more than 1 step was required, then animate.
			if(num_segments >= 1){
				thetas1 = unwrapAngles(thetas1);
				final_thetas = thetas1;
				delta_thetas = thetas1.subtract(curr_thetas).scale(1/Math.round(0.5*total_distance));
				animate(0,(0.5*total_distance));
			}
		}
	}
	
}
/*
//some helpful debug function
function outpl(str){
	document.getElementById("debug_output").innerHTML += str + "<br>";
}
function clearOutput(){
	document.getElementById("debug_output").innerHTML = "";
}
*/