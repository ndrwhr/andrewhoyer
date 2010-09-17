(function(){

var mst_offset = 7 * 3600 * 1000;

var leadingZeros = function(num){
	return num < 10 ? '0' + num : '' + num;
};

Array.implement({
	
	collect: function(prop){
		return this.map(function(item){
			return item[prop];
		});
	},
	
	toLowerCase: function(){
		return this.map(function(item){
			return item.toLowerCase ? item.toLowerCase() : item;
		});
	}
	
});

Date.implement({
	
	getFullDate: function(){
		return [this.getNamedMonth(), this.getDate(), this.getFullYear()].join(' ');
	},
	
	getNamedMonth: function(){
		return 'January February March April May June July August September October November December'.split(' ')[this.getMonth()];
	}
	
});

var TagCloud = new Class({
	
	initialize: function(container, threshold){
		this.container = container = document.id(container);
		
		var links = this.links = [],
			cloud = this.cloud = [],
			min = Infinity,
			max = -Infinity;
		
		SomethingADay.tags.ids.each(function(id){
			var count = SomethingADay.tags.map[id].length,
				log = count.log();
			
			if (count <= threshold) return;
			
			min = log.min(min);
			max = log.max(max);
			
			cloud.push({
				'id': id,
				'count': count
			});
		});
		
		cloud.sort(function(tag1, tag2){
			return tag2.count - tag1.count || tag2.id.length - tag1.id.length;
		});
		
		cloud.each(function(tag){
			var scale = (tag.count.log() - min) / (max - min),
				link = this.tag(tag.id, scale);
			
			links.push(link.inject(container.appendText(' '), 'bottom'));
		}, this);
		
	},
	
	tag: function(value, scale){
		var max_font = 2.0,
			min_font = 1.0;
		
		value = value.clean();
		
		return new Element('a', {
			'text': value,
			'class': Links.randomColor(),
			'styles': { 'font-size': (max_font * scale) + min_font + 'em' },
			'title': value
		});
	},
	
	eachLink: function(fn, bind){
		this.links.each(fn, bind || this);
	}
	
});

var Graph = new Class({
	
	initialize: function(id){
		this.element = document.id(id);
		
		var types = this.types = [];
		
		types.push({
			legend: 'Length of Something',
			color: '7acf6f',
			alt_color: 'dddddd',
			line: 4,
			alt_line: 2,
			fn: function(something){
				return something.body.length;
			}
		});
		
		types.push({
			legend: 'Number of Tags',
			color: 'e0e562',
			alt_color: 'bbbbbb',
			line: 2,
			fn: function(something){
				return something.tags.length;
			}
		});
		
		this.plot();
	},
	
	plot: function(tag){
		var types = this.types.slice();
		
		if (tag){
			
			types.each(function(type){
				if (type.alt_color) type.color = type.alt_color;
				if (type.alt_line) type.line = type.alt_line;
			});
			
			types.push({
				legend: 'Tag%3A+' + tag.replace(/\s/g, '+'),
				color: ['f3a271', '7acf6f', 'F08080','75c9ab','db98d7', 'e0e562'].getRandom(),
				line: 4,
				fn: function(something){
					return something.tags.toLowerCase().contains(tag) ? 1 : 0;
				}
			});
		}
		
		types.each(function(type){
			type.max = -Infinity;
			type.min = Infinity;
			type.current = 0;
			type.data = [];
		});
		
		this.element.src = this.encode(types);
	},
	
	encode: function(types){
		types = this.calculate(types);
		
		var parts = [
				"http://chart.apis.google.com/chart?cht=lc",
				"chs=750x200", // size
				"chxt=x,y", //labels
				"chdlp=b", // legend position
				"chxl=0:|Jan|Feb|Mar|Apr|May|June|Jul|Aug|Sept|Oct|Nov|Dec|1:|a+little|a+lot" // x-axis
			];
		
		var legends = types.collect('legend').map(function(legend){
			return legend.replace(/\s+/gi,'+');
		}).join('|');
		
		var data = types.collect('data').map(function(d){
			return d.join(',');
		}).join('|');
		
		parts.push("chls=" + types.collect('line').join('|'));
		parts.push("chco=" + types.collect('color').join(','));
		parts.push("chdl=" + legends);
		parts.push("chd=t:" + data);
		
		return parts.join('&');
	},
	
	calculate: function(types){
		var somethings = SomethingADay.somethings,
			index = 0,
			something;
		
		somethings.ids.each(function(id){
			something = somethings.map[id];
			
			if (index && index % 4 == 0){
				var value;
				types.each(function(type){
					value = type.current / 7;
					type.max = value.max(type.max);
					type.min = value.min(type.min);
					type.data.push(value);
					type.current = 0;
				});
			} else {
				types.each(function(type){
					type.current += type.fn(something);
				});
			}
			
			index++;
		}, this);
		
		return this.scale(types);
	},
	
	scale: function(types){
		var min, max, diff;
		
		types.each(function(type){
			max = type.max;
			min = type.min;
			diff = max - min;
			
			type.data = type.data.map(function(value){
				return diff ? (99 * (value - min) / diff).round() : 0;
			});
		});
		
		return types;
	}
	
});

var SomethingsController = new Class({
	
	initialize: function(id){
		this.somethings = SomethingADay.somethings;
		
		this.element = new Element('ul').inject(document.id(id));
		
		this.displayRandom();
		
		document.id('read-random').addEvent('click', this.displayRandom.bind(this));
		
		document.id('read-all-asc').addEvent('click', function(){
			this.displayAll(true);
		}.bind(this));
		
		document.id('read-all-desc').addEvent('click', function(){
			this.displayAll(false);
		}.bind(this));
	},
	
	renderSomething: function(something){
		// var date = '<span>' + new Date(something.date).getFullDate().toLowerCase() + '</span>',
		var date = '<span>' + new Date(something.date - mst_offset).getFullDate().toLowerCase() + '</span>',
			body = '<p class=\'body\'>' + something.body.replace(/\n/, '<br/><br/>') + '</p>',
			tags = '<p class=\'tags\'>' + something.tags.join(", ") + '</p>';
		
		return new Element('li', {
			'class': something.type,
			'html': date + body + tags
		});
	},
	
	displayAll: function(ascending){
		this.element.set('html', '');
		
		var location = ascending ? 'bottom' : 'top';
		
		this.somethings.ids.each(function(id){
			this.renderSomething(this.somethings.map[id]).inject(this.element, location);
		}, this);
	},
	
	displayRandom: function(){
		var somethings = this.somethings;
		
		this.element.set('html', '');
		
		for (var i = 5; i--;)
			this.renderSomething(somethings.map[somethings.ids.getRandom()]).inject(this.element,'bottom');
	},
	
	displayTagged: function(tag){
		this.element.set('html', '');
		
		SomethingADay.tags.map[tag].each(function(id){
			this.renderSomething(this.somethings.map[id]).inject(this.element,'bottom');
		}, this);
	}
	
});

document.addEvent('domready', function(){
	var tagcloud = new TagCloud('sad-tag-cloud', 1);
	
	var graph = new Graph('chart-1');
	
	var controller = new SomethingsController('something-wrapper');
	
	tagcloud.eachLink(function(link){
		var tag = link.get('title');
		
		link.addEvent('click', function(){
			controller.displayTagged(tag);
			graph.plot(tag);
		});
		
	});
	
});

})();
