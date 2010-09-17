
function Canvas(fthis,id){
	var that = this;
	
	this.elem = $(id);
	this.ctx = this.elem.getContext('2d');
	
	this.width = this.elem.width;
	this.height = this.elem.height;
	
	this.half_width = this.width/2;
	this.half_height = this.height/2;
	
	this.clear = function(){
		this.ctx.clearRect(0,0,this.width,this.height);
	};
	
	this.blur = function(msg){
		var bar_h = this.height/3,
			bar_w = this.width/12,
			bar_s = bar_w/3;
		msg = msg || "mouse over to begin";
		this.ctx.save();
			this.ctx.fillStyle = "rgba(0,0,0,0.05)";
			this.ctx.fillRect(0,0,this.width,this.height);
			
			//draw a bar behind the message.
			this.ctx.fillStyle = "rgba(255,255,255,0.90)";
			this.ctx.fillRect(0,(this.height/2)-13,this.width,26);
		
			// draw some text at the top:
			this.ctx.fillStyle = "rgba(0,0,0,0.6)";
			this.ctx.textAlign = "center";
			this.ctx.textBaseline = "middle";
			this.ctx.font = "bold 14px sans-serif";
			this.ctx.fillText(msg,this.width/2,this.height/2);
		
		this.ctx.restore();
	};
	
	//be sure to remove any old events...
	this.elem.removeEvents();
	
	//then reset the events so that the proper update function is called.
	this.elem.addEvents({
		'mousemove': function(e){
			var elem_loc = this.getPosition();
			fthis.update({
				x: e.page.x - elem_loc.x,
				y: e.page.y - elem_loc.y
			});
		},
		'mouseout':function(e){
			// set the canvas to display message about being paused.
			//that.blur();
		}
	});
};
