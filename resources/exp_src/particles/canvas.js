
function Canvas(id){
	this.canvas = document.getElementById(id);
	this.ctx = this.canvas.getContext('2d');
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.fill_color = "#FFF";
	this.stroke_color = "#000";
}
Canvas.prototype={
	center: function(){
		return $V([this.width/2,this.height/2]);
	},
	randomCoordinate: function(){
		var r1 = (Math.random()<0.5?-Math.random():Math.random());
		var r2 = (Math.random()<0.5?-Math.random():Math.random());
		var c = this.center();
		return c.add([c.elementAt(1)*r1/2,c.elementAt(2)*r2/2]);
	},
	isInside: function(p){
		return (p.elementAt(1)>0 && p.elementAt(2)>0 && p.elementAt(1) < this.width && p.elementAt(2) < this.height);
	},
	clear: function(){
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.fillStyle = this.fill_color;
		this.ctx.fillRect(0,0,this.width,this.height);
		this.ctx.restore();
	},
	circle: function(p,r){
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.strokeStyle = this.stroke_color;
		this.ctx.moveTo(p.elementAt(1)+r,p.elementAt(2));
		this.ctx.arc(p.elementAt(1), p.elementAt(2), r, 0, 2*PI, false);
		this.ctx.stroke();
		this.ctx.restore();
	},
	line: function(x1,x2){
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.strokeStyle = this.stroke_color;
		this.ctx.moveTo(x1.elementAt(1),x1.elementAt(2));
		this.ctx.lineTo(x2.elementAt(1),x2.elementAt(2));
		this.ctx.stroke();
		this.ctx.restore();
	},
	ellipse: function(a,b,r){
		var a_b = a.subtract(b);
		var q = a_b.scale( 1+(r/a_b.euclidLength()) );

		var a1 = b.add(q);
		var b1 = a.subtract(q);
		
		var a_a1 = a.subtract(a1);
		var a_a11 = a_a1.elementAt(1);
		var a_a12 = a_a1.elementAt(2);
		
		var b_b1 = b.subtract(b1);
		var b_b11 = b_b1.elementAt(1);
		var b_b12 = b_b1.elementAt(2);
		
		var c1 = b1.add([-1.2*b_b12,1.2*b_b11]);
		var c2 = a1.add([1.2*a_a12,-1.2*a_a11]);
		var c3 = a1.add([-1.2*a_a12,1.2*a_a11]);
		var c4 = b1.add([1.2*b_b12,-1.2*b_b11]);
		
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.fillStyle = this.fill_color;
		this.ctx.moveTo(b1.elementAt(1),b1.elementAt(2));
		this.ctx.bezierCurveTo(c1.elementAt(1),c1.elementAt(2),c2.elementAt(1),c2.elementAt(2)  ,a1.elementAt(1),a1.elementAt(2));
		this.ctx.bezierCurveTo(c3.elementAt(1),c3.elementAt(2),c4.elementAt(1),c4.elementAt(2)  ,b1.elementAt(1),b1.elementAt(2));
		this.ctx.fill();
		this.ctx.strokeStyle = this.stroke_color;
		this.ctx.stroke();
		this.ctx.restore();
	}
};
