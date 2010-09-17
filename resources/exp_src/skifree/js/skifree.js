var Hill = new new Class({
	
	intialize: function(){
		this.element = document.id('skifree-hill');
	},
	
	addSprite: function(sprite){
		
	}
	
});

var Sprite = new Class({
	
	initialize: function(x, y, className){
		this.x = x;
		thix.y = y;
		this.className;
	},
	
	display: function(){
		new Element('div', {
			'class': this.className,
			'styles': {
				'top': this.y,
				'left': this.x
			}
		});
	}
	
});


