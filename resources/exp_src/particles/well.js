
function Well(x,M,R){
	this.x = x;
	this.M = M;
	this.R = R;
}
Well.prototype = {
	getAcceleration: function(pos){
		var r = pos.subtract(this.x);
		var r_len = r.euclidLength();
		return r.scale(-this.M/(r_len*r_len/2));
	},
	isInside: function(pos){
		return (pos.subtract(this.x).euclidLength()-this.R)<1;
	},
	draw:function(){
		canvas.circle(this.x, this.R);
		canvas.circle(this.x, this.R-2);
	}
};
