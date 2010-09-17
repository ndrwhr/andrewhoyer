

var PI = Math.PI;

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
		this.ctx.fillStyle = this.stroke_color;
		this.ctx.moveTo(p.elementAt(1)+r,p.elementAt(2));
		this.ctx.arc(p.elementAt(1), p.elementAt(2), r, 0, 2*PI, false);
		this.ctx.fill();
		this.ctx.restore();
	},
	line: function(x1,x2,width){
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.strokeStyle = this.stroke_color;
		this.ctx.lineWidth = width || 1;
		this.ctx.lineCap = 'round';
		this.ctx.moveTo(x1.elementAt(1),x1.elementAt(2));
		this.ctx.lineTo(x2.elementAt(1),x2.elementAt(2));
		this.ctx.stroke();
		this.ctx.restore();
	}
};
