
window.addEvent('domready',function(){
	
	// setup the "lightbox" kinda stuff:
	$(document.body).adopt(
			(new Element('div',{id:'background'})).setStyle('height',(window.getScrollSize()).y),
			(new Element('div',{id:'showcase'})).adopt(
					(new Element('div',{id:'canvas_wrapper'})).adopt(
							(new Element('canvas',{id:'showcase_canvas',width:800}))
						).appendText('click anywhere to close')
				)
		);
	
	// do the rest of the setup stuff.
	var i,f,
		fractals = [
			{	name: 'cantor',
				constructor: Cantor,
				width:800,
				height: 480 },
			{	name: 'pythagoras',
				constructor: Pythagoras,
				width:800,
				height:530 },
			{	name: 'koch',
				constructor: Koch,
				width:800,
				height:340 },
			{	name: 'tree',
				constructor: Tree,
				width:680,
				height:550 },
			{	name: 'carpet',
				constructor: Carpet,
				width:550,
				height:550 },
		],
		Showcase = function(){
			var duration = {duration:'short'},
				background = $('background'),
				showcase = $('showcase'),
				background_opacities = {o:[0,0.4],c:[0.4,0]},
				showcase_opacities = {o:[0,1],c:[1,0]},
				open_styles = {'opacity':0,'display':'block'},
				close_styles = {'display':'none'};

			background.setStyles(close_styles);
			showcase.setStyles(close_styles);

			this.open = function(){
				var bfx = new Fx.Morph(background,duration),
					sfx = new Fx.Morph(showcase,duration);
				$(background).setStyles(open_styles);
				$(showcase).setStyles(open_styles);
				bfx.start({'opacity':background_opacities.o});
				sfx.start({'opacity':showcase_opacities.o});
			};
			this.close = function(){
				var bfx = new Fx.Morph(background,duration),
					sfx = new Fx.Morph(showcase,duration);
				bfx.start({'opacity':background_opacities.c});
				sfx.start({'opacity':showcase_opacities.c});
				sfx.addEvent('complete',function(){showcase.setStyles(close_styles);});
				bfx.addEvent('complete',function(){background.setStyles(close_styles);})
			};
			return this;
		}();

	$('background').addEvent('click',Showcase.close);
	$('showcase').addEvent('click',Showcase.close);
	
	// setup th rest of the fractal stuff.
	for(i=0; i<fractals.length; i++){
		f = fractals[i];
		
		// actually instantiate each fractal.
		f.instance = new f.constructor(f.name+"_canvas");
		
		// set the onclick event for each fractal.
		$(f.name+"_canvas").addEvent('click',(function(f){
			
			return function(e){
				var top = Math.max(0,((window.innerHeight-(f.height+25))/2));
				$('canvas_wrapper').setStyles({'width':f.width,'top':((window.getScroll()).y+top)});
				$('showcase_canvas').set({'width':f.width,'height':f.height});
				new f.constructor('showcase_canvas',true);
				Showcase.open();
			};
			
		})(f));
		
	}// end for
});