
function Cantor(canvas_id,standalone){
	// initialize the tree.
	this.canvas = new Canvas(this,canvas_id);
	this.ctx = this.canvas.ctx;
	this.fillStyle = "black";
	
	this.max_order = 7;
	
	this.order_colors = Gradient("#258dc9","#043342",this.max_order);
	
	this.min_gap = 0.03;
	this.max_gap = 0.5;
	this.gap = 0.3;
	this.min_width = 0.15;
	this.left_width = this.right_width = (1-this.gap)/2;
	
	this.base_width = this.canvas.width*0.8;
	this.base_offset = (this.canvas.width - this.base_width)/2;
	this.base_height = this.canvas.height - (2*this.base_offset);
	
	this.bar_height = (2*this.base_height)/((3*this.max_order)-1);
	this.bar_offset = this.bar_height + (0.5*this.bar_height);
	
	// actually initialize the canvas
	this.draw();
	if(!standalone) 
		this.canvas.blur();
}

Cantor.prototype = {
	update: function(pos){
		this.canvas.clear();
		this.updateGap(pos);
		this.draw();
	},
	updateGap: function(pos){
		var x,y,half_gap;
		
		y = Math.max(0,  Math.min(1,(pos.y-this.base_offset)/(this.base_height))  );
		this.gap = ((this.max_gap-this.min_gap)*y) + this.min_gap;
		
		half_gap = this.gap/2;
		
		x = Math.max(0,Math.min(1,(pos.x-this.base_offset)/(this.base_width)));
		
		if(pos.x < this.canvas.half_width){
			// we're on the left side.
			this.left_width = Math.max(this.min_width,x-half_gap);
			this.right_width = 1-this.gap-this.left_width;
		}else{
			// we're on the right side.
			this.right_width = 1-Math.min(1-this.min_width,x+half_gap);
			this.left_width = 1-this.gap-this.right_width;
		}
	},
	draw: function(){
		this.ctx.save();
			// draw the base bar
			this.ctx.fillStyle = this.order_colors[0];
			this.ctx.translate(this.base_offset,this.base_offset);
			this.ctx.fillRect(0,0,this.base_width,this.bar_height);
			this.drawBars(this.base_width,1);
		this.ctx.restore();
		
	},
	drawBars: function(prev_width, order){
		var left_width = this.left_width*prev_width,
			mid_width = this.gap*prev_width,
			right_width = this.right_width*prev_width;
			
		if(order >= this.max_order ){
			return;
		}
		
		this.ctx.fillStyle = this.order_colors[order];
		// draw the left
		this.ctx.save();
			this.ctx.translate(0,this.bar_offset);
			this.ctx.fillRect(0,0,left_width,this.bar_height);
			this.drawBars(left_width,order+1);
		this.ctx.restore();
		
		// draw the right
		this.ctx.save();
			this.ctx.translate(left_width+mid_width,this.bar_offset);
			this.ctx.fillRect(0,0,right_width,this.bar_height);
			this.drawBars(right_width,order+1);
		this.ctx.restore();
	}
};
