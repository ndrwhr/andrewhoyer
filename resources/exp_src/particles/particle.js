
function Particle(x,old_x) {
	this.x = x;
	this.old_x = old_x;
	this.a;
}
Particle.prototype = {
	update: function(){
		var temp_x = this.x;
		if(decay){
			this.x = this.a.scale(DT*DT).add( temp_x.scale(1.99).subtract(this.old_x.scale(0.99)));
		}else{
			this.x = this.a.scale(DT*DT).add( temp_x.scale(2).subtract(this.old_x) );
		}
		this.old_x = temp_x;
		var x = this.x.elementAt(1);
		var y = this.x.elementAt(2);
		
		if(x > canvas.width || x < 0){
			this.x.setElement(1,this.old_x.elementAt(1));
			this.old_x.setElement(1,x);
		}
		if(y > canvas.height || y < 0){
			this.x.setElement(2,this.old_x.elementAt(2));
			this.old_x.setElement(2,y);
		}
		
	},
	getPosition: function(){
		return this.x;
	},
	setAcceleration:function(a){
		this.a = a;
	},
	draw: function(){
		canvas.ellipse(this.x,this.old_x,PR);
	}
};


