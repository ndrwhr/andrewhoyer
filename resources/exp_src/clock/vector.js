
// Super simple 2d vector class.
(function(){

var random = function(min, max){
    return Math.random() * (max - min) + min;
};

var Vector = this.Vector = function(x, y){
    this.x = x || 0;
    this.y = y || 0;
};

Vector.random = function(min, max){
    return new Vector(random(min, max), random(min, max));
};

Vector.prototype = {
    
    add: function(vector){
        return new Vector(this.x + vector.x, this.y + vector.y);
    },
    
    subtract: function(vector){
        return new Vector(this.x - vector.x, this.y - vector.y);
    },
    
    scale: function(value){
        return new Vector(this.x * value, this.y * value);
    },
    
    multiply: function(vector){
        return new Vector(this.x * vector.x, this.y * vector.y);
    },
    
    divide: function(vector){
        return new Vector(this.x / vector.x, this.y / vector.y);
    },
    
    length: function(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    
    toString: function(){
        return ['[',this.x, ',', this.y, ']'].join('');
    }
    
};

})();
