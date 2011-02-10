
(function(){

// Extend a few natives to help me out:
var helpers = {
    round: function(number){
        return Math.round(number * 10) / 10;
    },
    translate: function(vector){
        return 'translate(' + vector.x + 'px,' + vector.y + 'px)';
    },
    rotate: function(value){
        return 'rotate(' + value + 'deg)';
    }
};

document.id = document.getElementById;

var methods = {
    transform: function(translation, rotation){
        translation = helpers.translate(translation);
        rotation = rotation ? helpers.rotate(rotation) : '';
        
        this.style.WebkitTransform = translation + ' ' + rotation;
        
        return this;
    },
    
    opacity: function(value){
        this.style.opacity = value;
        return this;
    },
    
    position: function(position){
        this.style.left = position.x + 'px';
        this.style.top = position.y + 'px';
        return this;
    },
    
    color: function(color){
        this.style.color = color;
        return this;
    },
    
    show: function(){
        this.style.display = '';
        return this;
    },
    
    hide: function(){
        this.style.display = 'none';
        return this;
    }
};

for (var method in methods)
    HTMLElement.prototype[method] = methods[method];

Array.prototype.random = function(){
    return this[Math.floor(Math.random() * this.length)];
};

if (!Function.prototype.bind){
    Function.prototype.bind = function (bind){
        var self = this;
        return function(){
            return self.apply(bind, arguments);
        };
    };
}

})();

var Vector = function(x, y){
    this.x = x || 0;
    this.y = y || 0;
};

Vector.random = function(min, max){
    return new Vector(Generator.random(min, max), Generator.random(min, max));
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

var Generator = {
    
    letters: '!\"\',.0123456789?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
    
    random: function(min, max){
        min = min || 0;
        max = max || 1;
        return Math.random() * (max - min) + min;
    },
    
    randomInt: function(min, max){
        return Math.floor(this.random(min, max));
    },
    
    randomLetter: function(color){
        var element = document.createElement('div');
        element.innerText = this.letters[this.randomInt(0, this.letters.length)];
        return element.color(color);
    },
    
    bool: function(bias){
        return !!Math.round(this.random() + (bias || 0));
    },
    
    gradient: function(stop1, stop2){
        var regex = /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/i,
            steps, diff, i, j;
        
        // convert stops to integer values.
        var stops = [stop1, stop2].map(function(stop){
            return regex.exec(stop).slice(1).map(function(color){
                return parseInt(color, 16);
            });
        });
        
        for (diff = i = 0; i < 3; i++)
            diff = Math.max(diff, Math.abs(stops[0][i] - stops[1][i]));
        
        for (steps = [], i = 0; i < diff + 1; i++){
            var step = [];
            
            for (j = 0; j < 3; j++){
                var value = stops[0][j] + (i * ((stops[1][j] - stops[0][j]) / diff));
                value = Math.round(value).toString(16);
                step.push(value.length < 2 ? '0' + value : value);
            }
            
            steps.push('#' + step.join(''));
        }
        
        return steps;
    }
    
};

var Cursor = function(element, container){
    this.element = element;
    this.container = container;
    
    this.radius = 0.18;
    
    this.offset = this.calcOffset();
    
    this.move({
        pageX: -100,
        pageY: -100
    });
    
    document.addEventListener('mousemove', this.move.bind(this));
};

Cursor.prototype = {
    
    calcOffset: function(){
        return new Vector(this.element.clientWidth, this.element.clientHeight).scale(0.5);
    },
    
    move: function(event){
        var container = this.container,
            position = new Vector(event.pageX, event.pageY);
        
        this.scaled = position.subtract(container.position).divide(container.size);
        
        this.element.transform(position.subtract(this.offset));
    },
    
    adjustParticle: function(particle){
        var position = this.scaled,
            diff = particle.current.subtract(position),
            distance = diff.length();
        
        if (distance < this.radius)
            particle.current = position.add(diff.scale(this.radius / distance));
    }
    
};

var Drop = function(element, container, current, previous){
    this.element = element;
    this.container = container;
    this.current = current;
    this.previous = previous;
    
    this.rotation = Generator.randomInt(0, 360);
    this.rotation_step = Generator.randomInt(-20, 20);
    
    this.style();
    
    container.appendChild(element);
};

Drop.prototype = {
    
    reset: function(){
        var element = this.element.hide();
        this.previous = this.current = new Vector(Generator.random());
    },
    
    update: function(acceleration){
        var temp = this.current;
        
        this.current = this.current.scale(2).subtract(this.previous).add(acceleration);
        this.previous = temp;
        
        this.rotation += this.rotation_step;
        
        this.style();
        
        return this;
    },
    
    remove: function(){
        this.container.removeChild(this.element);
    },
    
    style: function(){
        var element = this.element,
            current = this.current,
            location = current.multiply(this.container.size);
        
        element.opacity(Math.max(0, Math.min(1, 1.5 - current.y)));
        element.transform(location, this.rotation).show();
    },
    
    visible: function(){
        return this.current.y < 1.5;
    }
    
};

var Cloud = function(container){
    this.container = container;
    this.colors = Generator.gradient('#999999', '#cccccc');
    this.puff_radius = 45;
    this.puff_particles = 25;
    this.centers = [
        [ 25, 120], [ 85, 120], [145, 125], [195, 125],
        [250, 120], [320, 120], [380, 125], [440, 120],
        [ 80,  80], [145,  70], [220,  70], [280,  70],
        [360,  80], [200,  45], [280,  50]
    ];
    
    this.generate();
};

Cloud.prototype = {
    
    generate: function(){
        var fragment = document.createDocumentFragment(),
            centers = this.centers;
        
        centers.forEach(function(center){
            center = new Vector(center[0], center[1]);
            fragment.appendChild(this.generatePuff(center));
        }, this);
        
        this.container.appendChild(fragment);
    },
    
    generatePuff: function(center){
        var element = document.createElement('div'),
            radius = this.puff_radius,
            count = this.puff_particles;
        
        while (count--){
            var rotation = Generator.randomInt(0, 360),
                postion;
            
            do {
                position = Vector.random(-radius, radius);
            } while(position.length() > radius);
            
            element.appendChild(this.generateParticle(position, rotation));
        }
        
        return element.position(center);
    },
    
    generateParticle: function(position, rotation){
        var letter = Generator.randomLetter(this.colors.random());
        return letter.transform(position, rotation);
    }
    
};

var Rain = function(container, particle_counter, current_gravity, cursor){
    this.container = container;
    this.particle_counter = particle_counter;
    this.current_gravity = current_gravity;
    this.cursor = cursor;
    this.colors = Generator.gradient('#6795B5', '#aaaaaa');
    this.gravity = this.base_gravity = new Vector(0, 0.0025);
    this.drop_limit = this.base_drop_limit = 50;
    this.drops = [];
};

Rain.prototype = {
    
    update: function(){
        this.adjustCount();
        
        var drops = this.drops,
            limit = drops.length,
            drop;
        
        for (var i = 0; i < limit; i++){
            drop = drops[i].update(this.gravity);
            if (!drop.visible()) drop.reset();
            else this.cursor.adjustParticle(drop);
        }
        
        this.particle_counter.innerHTML = limit;
    },
    
    adjustCount: function(){
        var drops = this.drops,
            length = drops.length,
            limit = this.drop_limit;
        
        if (length < limit && Generator.bool(0.25))
            drops.push(this.createDrop());
        else if (drops.length > limit)
            drops.pop().remove();
    },
    
    createDrop: function(){
        var current = new Vector(Generator.random()),
            previous = current.add(Vector.random(-0.0075, 0.0075)),
            element = Generator.randomLetter(this.colors.random());
        
        return new Drop(element, this.container, current, previous);
    },
    
    changeCount: function(value){
        this.drop_limit = Math.floor(this.base_drop_limit * value);
    },
    
    changeGravity: function(value){
        this.current_gravity.innerHTML = Math.round(value * 100) + '%';
        this.gravity = this.base_gravity.scale(value);
    }
    
};

var Simulation = function(){
    var container = this.container = document.id('rain'),
        counter = document.id('active-particles'),
        gravity = document.id('current-gravity'),
        cursor = document.id('cursor'),
        cloud = document.id('cloud');
    
    window.addEventListener('resize', this.resize.bind(this));
    this.resize();
    
    this.rain = new Rain(container, counter, gravity, new Cursor(cursor, container));
    this.cloud = new Cloud(cloud);
    
    this.initControls();
    this.run();
};

Simulation.prototype = {
    
    resize: function(){
        var container = this.container;
        container.size = new Vector(container.clientWidth, container.clientHeight);
        container.position = new Vector(container.offsetLeft, container.offsetTop);
    },
    
    initControls: function(){
        var gravity = document.id('gravity'),
            particles = document.id('particles'),
            rain = this.rain;
        
        gravity.addEventListener('change', function(){
            rain.changeGravity(gravity.value);
        });
        
        particles.addEventListener('change', function(){
            rain.changeCount(particles.value);
        });
    },
    
    run: function(){
        this.rain.update();
        setTimeout(this.run.bind(this), 75);
    }
    
};

document.addEventListener('DOMContentLoaded', function(){
    new Simulation();
});
