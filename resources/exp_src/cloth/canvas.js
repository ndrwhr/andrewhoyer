
(function(){

var two_pi = Math.PI * 2;

var Canvas = this.Canvas = function(canvas){
	this.canvas = canvas;
	this.ctx = this.canvas.getContext('2d');
	this.ctx.fillStyle = this.ctx.strokeStyle = 'black';
	
	this.width = this.canvas.width;
	this.height = this.canvas.height;
};

Canvas.prototype={
	adjust: function(pos) {
		var location = this.canvas.getPosition(),
			lx = location.x,
			ly = location.y,
			px = pos.x,
			py = pos.y;
		
		var inside = (px > lx && px < lx + this.width && py > ly && py < ly + this.height);
		
		return inside ? new FastVector((pos.x - lx) / this.canvas.width, (pos.y - ly) / this.canvas.height) : null;
	},
	
	clear: function(){
		this.ctx.clearRect(0, 0, this.width, this.height);
	},
	
	circle: function(p, r){
		x = p.x * this.width;
		y = p.y * this.height;
		this.ctx.beginPath();
		this.ctx.moveTo(x + r, y);
		this.ctx.arc(x, y, r, 0, two_pi, false);
		this.ctx.fill();
	},
	
	line: function(x1, x2){
		this.ctx.beginPath();
		this.ctx.moveTo(x1.x * this.width, x1.y * this.height);
		this.ctx.lineTo(x2.x * this.width, x2.y * this.height);
		this.ctx.stroke();
	}
};
	
})();
