
function Tree(canvas_id,standalone){
	// initialize the tree.
	this.canvas = new Canvas(this,canvas_id);
	this.ctx = this.canvas.ctx;
	this.ctx.strokeStyle = 'black';
	this.ctx.lineCap = 'round';

	this.max_ratio = 3;
	this.min_ratio = 1.41;
	this.ratio = (this.min_ratio);
	
	this.max_angle = Math.PI/2;
	this.angle = Math.PI/5;
	
	this.max_order = 10;
	//this.order_colors = Gradient("e4d700","f64d2b",this.max_order+1);
	this.order_colors = Gradient("#D4E576","#126845",this.max_order+1);
	this.start_length = this.canvas.height/3.25;
	this.start_width = 15;
	
	
	this.previous = {x:0,y:0};
	
	// actually initialize the canvas
	this.draw();
	if(!standalone) 
		this.canvas.blur();
}

Tree.prototype = {
	update: function(pos){
		this.canvas.clear();
		this.updateAngle(pos);
		this.updateRatio(pos);
		this.draw();
	},
	updateAngle: function(pos){
		var x = -Math.abs(pos.x - (this.canvas.width/2)),
			y = (pos.y - (this.canvas.height-this.start_length));
		this.angle = (Math.PI/2) - Math.atan(y/x);
	},
	updateRatio: function(pos){
		var x = pos.x - (this.canvas.width/2),
			y = pos.y - (this.canvas.height-this.start_length),
			d = Math.min(1,Math.sqrt((x*x)+(y*y))/(this.canvas.width/2));
		this.ratio = ((this.max_ratio-this.min_ratio)*(1-d)) + this.min_ratio;
	},
	draw: function(){
		
		// draw the trunk of the tree.
		this.ctx.save();

			this.ctx.translate(this.canvas.width/2,this.canvas.height);

			//actually draw the trunk.
			this.ctx.strokeStyle = this.order_colors[0];
			this.drawBranch(this.start_length,this.start_width);		
			
			this.ctx.save();
				this.ctx.translate(0,-this.start_length);
				this.drawBranches(1);
			this.ctx.restore();		
			
		this.ctx.restore();
	},
	drawBranch: function(length, width){
		this.ctx.lineWidth = (!width || width<1)?1:width;
		this.ctx.beginPath();  
		this.ctx.moveTo(0,0);
		this.ctx.lineTo(0,-length);
		this.ctx.stroke();
	},
	drawBranches: function(order){

		var ratio = Math.pow(this.ratio,order),
			new_length = this.start_length/ratio,
			new_width = this.start_width/ratio;
		
		
		if(new_length < 3 || order > this.max_order){
			return;
		}
		
		this.ctx.strokeStyle = this.order_colors[Math.floor(order)];
		//this.ctx.strokeStyle = this.order_colors[8];
		
		//draw the right branch
		this.ctx.save();
			this.ctx.rotate(this.angle);
		
			this.drawBranch(new_length,new_width);
		
			this.ctx.save();
				this.ctx.translate(0,-new_length);
				this.drawBranches(order+1);
			this.ctx.restore();
			
		this.ctx.restore();
		
		
		//draw the left branch
		this.ctx.save();
			this.ctx.rotate(-this.angle);
		
			this.drawBranch(new_length,new_width);
		
			this.ctx.save();
				this.ctx.translate(0,-new_length);
				this.drawBranches(order+1)
			this.ctx.restore();
		
		this.ctx.restore();
	}
};
