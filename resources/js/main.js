
var Links = new new Class({
	
	initialize: function(){
		this.colors = ['blue', 'orange', 'green', 'red', 'teal', 'purple', 'yellow'];
	},
	
	randomColor: function(){
		return this.colors.getRandom();
	},
	
	colorize: function(element){
		(element || document).getElements('a').each(function(link){
			link.addClass(this.randomColor());
		}, this);
	}
	
});

document.addEvent('domready', function(){
	Links.colorize();
});

