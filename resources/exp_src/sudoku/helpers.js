function Gradient(stop1_hex, stop2_hex, num){
	// stop1 and stop2 must be strings that rep hex color vals.
	stop1_hex = stop1_hex.replace("#","").toUpperCase();
	stop2_hex = stop2_hex.replace("#","").toUpperCase();
	
	var stops = new Array(num),
		stop1_rgb = {r:0,g:0,b:0},
		stop2_rgb = {r:0,g:0,b:0},
		steps = {r:0,g:0,b:0},
		i,r,g,b;
	
	//parse the two input strings into rgb values
	stop1_rgb.r = parseInt(stop1_hex.substr(0,2),16);
	stop1_rgb.g = parseInt(stop1_hex.substr(2,2),16);
	stop1_rgb.b = parseInt(stop1_hex.substr(4,2),16);
	
	stop2_rgb.r = parseInt(stop2_hex.substr(0,2),16);
	stop2_rgb.g = parseInt(stop2_hex.substr(2,2),16);
	stop2_rgb.b = parseInt(stop2_hex.substr(4,2),16);
	
	steps.r = (stop2_rgb.r - stop1_rgb.r)/num;
	steps.g = (stop2_rgb.g - stop1_rgb.g)/num;
	steps.b = (stop2_rgb.b - stop1_rgb.b)/num;
	
	stops[0] = "#"+stop1_hex;
	
	for(i=1; i<num-1; i++){
		r = Math.round(stop1_rgb.r+(i*steps.r)).toString(16);
		g = Math.round(stop1_rgb.g+(i*steps.g)).toString(16);
		b = Math.round(stop1_rgb.b+(i*steps.b)).toString(16);
		
		r = (r.length != 2)?"0"+r:r;
		g = (g.length != 2)?"0"+g:g;
		b = (b.length != 2)?"0"+b:b;
		
		stops[i] = "#"+(r+g+b).toUpperCase();
	}
	
	stops[num-1] = "#"+stop2_hex;
	return stops;
}


var Set = function(set){
	this.set = 0;
	this.length = 0;
	if (set instanceof Array){
		this.add(set);
	}else if (set){
		this.set = set;
		this.length = this.calcLength();
	}
};
Set.prototype = {
	clear: function(args){
		this.set = 0;
		this.length = 0;
		if (args) this.add(args);
		return this;
	},
	
	add: function(args){
		args = (args instanceof Array) ? args : [args];
		args.each(function(num){
			if (this.contains(num)) return;
			this.set |= 1 << (num - 1);
			this.length++;
		}, this);
		
		return this;
	},
	
	remove: function(args){
		args = (args instanceof Array) ? args : [args];
		args.each(function(num){
			if (!this.contains(num)) return;
			this.set &= ~(1 << (num - 1));
			this.length--;
		}, this);
		
		return this;
	},
	
	contains: function(num){
		return !!(this.set & 1 << (num - 1));
	},
	
	union: function(other, inplace){
		return this.finish(this.set | other.set, inplace)
	},
	
	intersection: function(other, inplace){
		return this.finish(this.set & other.set, inplace)
	},
	
	difference: function(other, inplace){
		return this.finish(this.set & (~other.set), inplace);
	},
	
	equals: function(other){
		return (this.set == other.set);
	},
	
	calcLength: function(){
		return this.toArray().length;
	},
	
	finish: function(set, inplace){
		if (inplace){
			this.set = set;
			this.length = this.calcLength();
			return this;
		} else return new Set(set);
	},
	
	toString: function(sep){
		return this.toArray().join(sep || "");
	},
	
	toArray: function(){
		var set = this.set,
			array = [];
			
		for (var i = 0; set; i++, set >>= 1)
			if(set & 1 == 1) array.push(i + 1);
		
		return array;
	}
};