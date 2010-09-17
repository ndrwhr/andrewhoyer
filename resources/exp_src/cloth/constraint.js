
var Constraint = function(canvas, p1, p2, rl){
	this.canvas = canvas;
	this.p1 = p1;
	this.p2 = p2;
	this.rest_length = rl || p1.getCurrent().subtract(p2.getCurrent()).length();
	this.squared_rest_length = this.rest_length * this.rest_length;
};

Constraint.prototype = {
	draw: function(){
		this.canvas.line(this.p1.getCurrent(), this.p2.getCurrent());
	},
	
	satisfy: function(){
		var p1 = this.p1.getCurrent();
		var p2 = this.p2.getCurrent();
		var delta = p2.subtract(p1);
		
		var p1_im = this.p1.inv_mass;
		var p2_im = this.p2.inv_mass;
		
		var d = delta.squaredLength();
		
		var diff = (d - this.squared_rest_length) / ((this.squared_rest_length + d) * (p1_im + p2_im));
		
		if (p1_im != 0){
			this.p1.setCurrent(p1.add(delta.multiply(p1_im * diff)));
		}
		
		if (p2_im != 0){
			this.p2.setCurrent( p2.subtract(delta.multiply(p2_im*diff)) );
		}
	}
};
