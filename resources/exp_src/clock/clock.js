
(function(){

Array.slice = function(){
    var slice = Array.prototype.slice;
    return slice.apply(arguments[0], slice.call(arguments, 1));
};

var scaleTransform = Modernizr.csstransforms3d ? function(scale){
    return 'scale3d(' + [scale, scale, scale].join(',') + ')';
} : function(scale){
    return 'scale(' + scale + ')';
};

var methods = {
    
    rotate: function(value){
        this.style[CSS.transform] = 'rotate(' + (value * 360) + 'deg)';
    },
    
    scale: function(scale){
        this.style[CSS.transform] = scaleTransform(scale);
    },
    
    rotateXY: function(x, y){
        var rotate = 'rotateX(' + (x % 360) + 'deg) rotateY(' + (y % 360) + 'deg)';
        this.style[CSS.transform] = rotate;
    },
    
    position: function(x, y){
        this.style.left = x + 'px';
        this.style.top = y + 'px';
    },
    
    addClass: function(){
        var existing = this.className.split(' ');
        
        Array.slice(arguments).forEach(function(className){
            if (existing.indexOf(className) < 0) existing.push(className);
        });
        
        this.className = existing.join(' ');
    },
    
    removeClass: function(){
        var existing = this.className.split(' '),
            args = Array.slice(arguments);
        
        this.className = existing.filter(function(className){
            return args.indexOf(className) < 0;
        }).join(' ');
    }
    
};

for(var method in methods){
    HTMLElement.prototype[method] = methods[method];
}

document.addEvent = function(eventName, eventHandler){
    this.addEventListener(eventName, eventHandler, false);
};

document.addEvents = function(events){
    for (var eventName in events)
        this.addEvent(eventName, events[eventName]);
};

document.removeEvent = function(eventName, eventHandler){
    this.removeEventListener(eventName, eventHandler, false);
};

})(); // end prototype modifications.

var Helper = {
    cap: function(value, min, max){
        return Math.min(Math.max(value, min), max);
    },
    random: function(min, max){
        return Math.random() * (max - min) + min;
    }
};

var Cursor = function(){
    
    // binding an instance method...
    this.movement = this.movement.bind(this);
    
    var moveStart = this.moveStart.bind(this),
        moveEnd = this.moveEnd.bind(this);
    
    document.addEvents({
        'mousedown': moveStart('mousemove'),
        'touchstart': moveStart('touchmove'),
        'mouseup': moveEnd('mousemove'),
        'touchend': moveEnd('touchmove'),
        'touchcancel': moveEnd('touchmove')
    });
    
};

Cursor.prototype = {
    
    callbacks: [],
    
    moveStart: function(eventName){
        var movement = this.movement; // this has be statically bound...
        return (function(event){
            event.preventDefault();
            this.reset();
            document.addEvent(eventName, movement); // move on subsequent moves
        }).bind(this);
    },
    
    moveEnd: function(eventName){
        var movement = this.movement; // this has be statically bound...
        return (function(){
            document.removeEvent(eventName, movement);
            this.momentum();
        }).bind(this);
    },
    
    reset: function(){
        delete this.previous;
        this.stopMomentum();
    },
    
    movement: function(event, delta){
        if (!delta) delta = this.calculateDelta(event);
        this.callbacks.forEach(function(callback){
            callback(delta);
        });
    },
    
    calculateDelta: function(event){
        if (event.touches) event = event.touches[0];
        
        var position = new Vector(event.pageX, event.pageY);
        
        if (!this.previous) this.previous = position;
        
        var delta = position.subtract(this.previous);
        this.previous = position;
        
        return this.lastDelta = delta;
    },
    
    stopMomentum: function(){
        this.momentumTimer = clearTimeout(this.momentumTimer);
    },
    
    momentum: function(){
        var delta = this.lastDelta,
            damp = 0.94, delay = 30;
        
        if (this.momentumTimer) this.stopMomentum();
        
        var calcMomentum = (function(){
            if (delta.length() < 0.1) return;
            
            this.movement(null, (delta = delta.scale(damp)));
            
            this.momentumTimer = setTimeout(calcMomentum, delay);
        }).bind(this);
        
        calcMomentum();
    },
    
    addMovementListener: function(callback){
        this.callbacks.push(callback);
    }
    
};

var Clock = function(){
    this.elements = {
        container: document.querySelector('div.clock-container'),
        wrapper: document.querySelector('div.clock-wrapper'),
        clock: document.querySelector('div.clock'),
        hour: document.querySelector('div.hands div.hour'),
        minute: document.querySelector('div.hands div.minute'),
        second: document.querySelector('div.hands div.second')
    };
    
    this.tick();
    setInterval(this.tick.bind(this), 1000);
    
    this.initResize();
};

Clock.prototype = {
    
    tick: function(){
        var time = new Date(),
            seconds = time.getSeconds(),
            minutes = time.getMinutes() * 60,
            hours = (time.getHours() % 12) * 3600,
            elements = this.elements;
        
        elements.second.rotate(seconds / 60);
        elements.minute.rotate((minutes + seconds) / 3600);
        elements.hour.rotate((hours + minutes + seconds) / 43200);
    },
    
    initResize: function(){
        var container = this.elements.container,
            wrapper = this.elements.wrapper,
            clock = this.elements.clock;
        
        var resize = (function(){
            if (this.autopilot) this.autopilot();
            
            var width = container.clientWidth,
                height = container.clientHeight,
                dimension = Math.min(width, height);
            
            var x = (width / 2) - (clock.clientWidth / 2),
                y = (height / 2) - (clock.clientHeight / 2);
            
            wrapper.position(x, y);
            wrapper.scale(dimension / wrapper.clientWidth);
            clock.size = dimension;
            
            return resize;
        }).bind(this);
        
        window.addEventListener('resize', resize(), false);
    },
    
    makeInteractive: function(){
        this.init3d();
        this.initAutopilot();
        this.initInteraction();
        this.randomPerspective();
    },
    
    init3d: function(){
        var boxes = Array.slice(document.querySelectorAll('div.box'));
        
        boxes.forEach(function(box){
            ['top', 'right', 'bottom', 'left', 'back'].forEach(function(className){
                var side = document.createElement('div');
                side.className = className;
                box.appendChild(side);
            });
        });
    },
    
    initAutopilot: function(){
        var clock = this.elements.clock,
            randomPerspective = this.randomPerspective.bind(this),
            movementTimer, autopilotTimer;
        
        var autopilot = function(){
            
            clock.removeClass('autopilot');
            
            clearTimeout(movementTimer);
            clearInterval(autopilotTimer);
            
            movementTimer = setTimeout(function(){
                
                clock.addClass('autopilot');
                
                clearInterval(autopilotTimer);
                
                autopilotTimer = setInterval(randomPerspective, 2000);
                
            }, 5000);
            
            return autopilot;
        };
        
        this.autopilot = autopilot();
    },
    
    initInteraction: function(){
        new Cursor().addMovementListener((function(delta){
            this.autopilot();
            this.shiftPerspective(delta);
        }).bind(this));
    },
    
    shiftPerspective: function(shift){
        var width = this.elements.clock.size;
        this.updatePerspective(this.perspective.add(shift.scale(1 / width)));
    },
    
    randomPerspective: function(){
        var x = Helper.random(-0.20, 0.20),
            y = Helper.random(-0.10, 0.10);
        this.updatePerspective(new Vector(x, y));
    },
    
    updatePerspective: function(perspective){
        this.perspective = perspective;
        this.elements.clock.rotateXY(-perspective.y * 360, perspective.x * 360);
    }
    
};

document.addEvent('DOMContentLoaded', function(){
    var support = document.getElementById('support-message'),
        container = document.getElementById('clock');
    
    if (!Modernizr.csstransforms){
        container.addClass('not-supported');
        support.addClass('visible');
    } else {
        
        var clock = new Clock();
        if (Modernizr.csstransforms3d){
            clock.makeInteractive();
        } else {
            container.addClass('partially-supported');
            support.addClass('visible');
        }
    }
    
    document.getElementById('close-button').addEventListener('click', function(){
        support.style.display = 'none';
    }, false);
});
