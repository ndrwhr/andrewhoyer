
function Carpet(canvas_id,standalone){
	// initialize the tree.
	this.canvas = new Canvas(this,canvas_id);
	this.ctx = this.canvas.ctx;
	this.fillStyle = "black";
	
	
	this.base_width = Math.min(this.canvas.width, this.canvas.height) * 0.8;
	this.x_offset = (this.canvas.width - this.base_width) / 2;
	this.y_offset = (this.canvas.height - this.base_width) / 2;
	
	this.max_order = 5;
	this.min_order = 0;
	this.desired_order = 2.5;
	
	this.order_colors = Gradient("#043342","#258dc9",(this.max_order+1)*10);
	
	var i;
	this.widths = [this.base_width];
	this.steps = [0];
	this.num_dots = [0];
	for(i=1; i<=this.max_order; i++){
		this.widths[i] = this.widths[i-1]/3;
		this.steps[i] = this.widths[i]*3;
		this.num_dots[i] = Math.pow(3,i-1);
	}
	
	// actually initialize the canvas
	this.draw();
	if(!standalone) 
		this.canvas.blur();
}

Carpet.prototype = {
	
	update: function(pos){
		
		//first get the desired order.
		var x = Math.abs(pos.x-(this.canvas.half_width)),
			y = Math.abs(pos.y-(this.canvas.half_height)),	
			dist = Math.min(1,(Math.sqrt((x*x) + (y*y)))/((this.base_width/2)));
		
		this.desired_order = ((this.max_order-this.min_order)*dist)+this.min_order;
		this.desired_order = Math.min(this.max_order,this.desired_order);
		
		// actually draw.
		this.canvas.clear();
		this.draw();
	},
	
	drawDots: function(order,width,offset){
		var i, j, x, y;
		x = this.widths[order];
		y = this.widths[order];
		
		width = width || this.widths[order];
		offset = offset || 0;
		
		for(i=0; i<this.num_dots[order]; i++){
			x = this.widths[order];
			for(j=0; j<this.num_dots[order]; j++){
				this.ctx.fillRect(x+offset,y+offset,width,width);
				x += this.steps[order];
			}
			y += this.steps[order];
		}
		
	},
	
	draw: function(){
		var whole = Math.floor(this.desired_order),
			frac = this.desired_order-whole;
		
		this.ctx.save();
		
			this.ctx.fillStyle = this.order_colors[Math.floor(this.desired_order*10)];
			this.ctx.translate(this.x_offset, this.y_offset);
			this.ctx.fillRect(0,0,this.base_width,this.base_width);
			
			this.ctx.fillStyle = "white";
			
			// draw the fractional component.
			if(frac != 0){
				var new_width = this.widths[whole+1]*frac,
					offset = (this.widths[whole+1]-new_width)/2;
				this.drawDots(whole+1,new_width,offset);
			}
		
			// draw all the other levels.
			while(whole>0){
				this.drawDots(whole);
				whole--;
			}
		
		this.ctx.restore();
	}
	
};
