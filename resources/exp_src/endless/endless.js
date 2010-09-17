
var Vector = new Class({
	
	initialize: function(x, y){
		this.x = x;
		this.y = y;
	},
	
	num: function(param){
		return (typeof(param) == 'number');
	},
	
	add: function (B) {
		var num = this.num(B);
		return new FastVector(this.x + (num ? B : B.x), this.y + (num ? B : B.y));
	},
	length: function() {
		return this.squaredLength().sqrt();
	},
	multiply: function(B) {
		var num = this.num(B);
		return new FastVector(this.x * (num ? B : B.x), this.y * (num ? B : B.y));
	},
	
	squaredLength: function() {
		return (this.x * this.x) + (this.y * this.y);
	},
	
	subtract: function(B) {
		var num = this.num(B);
		return new FastVector(this.x - (num ? B : B.x), this.y - (num ? B : B.y));
	},
	
	toString: function() {
		return "["+this.x+","+this.y+"]";
	}
	
});

var Constraint = new Class({
	initialize: function(){
		this.canvas = canvas;
		this.p1 = p1;
		this.p2 = p2;
		this.rest_length = rl || p1.getCurrent().subtract(p2.getCurrent()).length();
		this.squared_rest_length = this.rest_length * this.rest_length;
	},
	
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
});

var Point = new Class({
	
	initialize: function(canvas, x, y){
		this.canvas = canvas;
		this.current = this.previous = new Vector(x, y);

		this.mass = this.inv_mass = 1;

		this.force = new Vector(0.0,0.5).multiply(0.05 * 0.05);
		this.radius = 3;
	},
	
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
	
});

var Rope = new Class({
	
});

var Bridge = new Class({
	
});

var Pit = new Class({
	
	max: Infinity,
	
	speed: 10,
	
	current: 0,
	
	sprites: [],
	
	initialize: function(mask, container){
		mask = this.mask = document.id(mask);
		container = this.container = document.id(container);
		this.height = parseInt(mask.getStyle('height'), 10);
		this.width = parseInt(container.getStyle('width'), 10);
		
		this.populate();
	},
	
	update: function(){
		var height = this.height;
		
		this.mask.setStyle('height', (this.height += this.speed));
		window.scrollBy(0, this.speed);
		
		if (Math.random() < 0.02) this.addSprite();
		if (this.height > this.max) return true;
	},
	
	populate: function(){
		var height = this.height;
		for (var i = height; (i -= 10) > 0;)
			if (Math.random() < 0.1)
				this.addSprite(i - 50);
	},
	
	addSprite: function(height){
		if (height == null) height = this.height;
		
		var current = this.current;
			position = this.sprites[current] = {
			'left':  $random(0, 250) + ($random(0, 1) ? 0 : 550),
			'top': height + 100
		};
		
		this.current = (current + 1) % 10;
		
		new Element('div', {
			'class': 'sprite',
			'styles': position
		}).inject(this.container, 'top');
	}
	
});

var pit = new Pit('pit-mask', 'pit'),
	timer;
document.addEvent('keyup', function(event){
	if (event.key == 'g'){
		if (timer) timer = clearInterval(timer);
		else timer = pit.update.periodical(30, pit);
	}
}).fireEvent('keyup', {key:'g'});





