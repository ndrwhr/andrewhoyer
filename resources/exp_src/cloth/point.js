
var Point = function(canvas, x, y){
	this.canvas = canvas;
	this.current = this.previous = new FastVector(x, y);
	
	this.mass = this.inv_mass = 1;
	
	this.force = new FastVector(0.0,0.5).multiply(0.05 * 0.05);
	this.radius = 3;
};

Point.prototype = {
	
	setCurrent: function(p) {
		this.current = p;
	},
	
	setPrevious: function(p) {
		this.previous = p;
	},
	
	getCurrent: function() {
		return this.current;
	},
	
	getPrevious: function() {
		return this.previous;
	},
	
	move: function() {
		if (this.inv_mass!=0){
			var new_pos = this.current.multiply(1.99).subtract(this.previous.multiply(0.99)).add(this.force);
			new_pos.x = (new_pos.x < 0) ? 0 : ((new_pos.x > 1) ? 1 : new_pos.x);
			new_pos.y = (new_pos.y < 0) ? 0 : ((new_pos.y > 1) ? 1 : new_pos.y);
			this.previous = this.current;
			this.current = new_pos;
		}
	},
	
	draw: function() {
		this.canvas.circle(this.current, this.radius);
	}
	
};
