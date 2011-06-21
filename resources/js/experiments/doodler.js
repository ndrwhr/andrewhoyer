(function(){

// Constants:
var FRAME_RATE = 16,
    JITTER = 2.5,
    LINES = 4;

var Helpers = {

    bind: function(fn, binding){
        var self = binding;
        return function(){
            return fn.call(self);
        };
    },

    periodical: function(fn, binding, duration){
        return setInterval(Helpers.bind(fn, binding), duration || FRAME_RATE);
    },

    random: function(min, max){
        return Math.random() * (max - min) + min;
    },

    shiftPoint: function(point){
        return [
            point[0] + Helpers.random(-JITTER, JITTER),
            point[1] + Helpers.random(-JITTER, JITTER)
        ];
    }

};

var Doodle = function(canvas){
    this.width = canvas.width;
    this.height = canvas.height;
    this.id = canvas.getAttribute('id');
    this.context = canvas.getContext('2d');
    this.points = Experiments.get(this.id);
    this.tempPaths = [[],[],[],[]];
    this.active = false;
    this.timer = null;

    this.context.fillStyle = 'rgba(0,0,0,0.05)';
    this.context.strokeStyle = 'rgba(0,0,0,0.15)';
};

Doodle.prototype = {

    allPointsDrawn: function(){
        return (this.tempPaths[0].length == this.points.length);
    },

    noPointsDrawn: function(){
        return (!this.tempPaths[0].length);
    },

    update: function(){
        this.clear();
        this.tempPaths.forEach(this.drawLine, this);
    },

    forwards: function(callback){
        // don't draw forwards if we're already done going forwards.
        if (this.allPointsDrawn()) return;

        this.stop();

        this.timer = Helpers.periodical(function(){
            var tempPaths = this.tempPaths;

            tempPaths.forEach(function(tempPath){
                tempPath.push(Helpers.shiftPoint(this.points[tempPath.length]));
            }, this);

            this.update();

            if (this.allPointsDrawn()){
                this.stop();
                if (callback) callback.call(this);
            }
        }, this);
    },

    reverse: function(){
        if (this.noPointsDrawn()) return;

        this.stop();

        this.timer = Helpers.periodical(function(){
            var tempPaths = this.tempPaths;

            tempPaths.forEach(function(tempPath){
                tempPath.pop();
            });

            this.update();

            if (!tempPaths[0].length) this.stop();
        }, this);
    },

    stop: function(){
        this.timer = clearInterval(this.timer);
    },

    clear: function(){
        this.context.clearRect(0, 0, this.width, this.height);
    },

    drawEverything: function(){
        this.tempPaths.forEach(function(){
            this.drawLine(this.points.map(function(point){
                return Helpers.shiftPoint(point);
            }));
        }, this);
    },

    drawLine: function(line){
        var context = this.context;

        context.beginPath();

        line.forEach(function(point, index){
            context[index ? 'lineTo' : 'moveTo'](point[0], point[1]);
        });

        context.stroke();
    }

};

// convert node list into an array.
var canvases = [].slice.call(document.querySelectorAll('.experiments li canvas'), 0),
    doodles = [];

canvases.forEach(function(canvas, index){
    var doodle = new Doodle(canvas);
    doodles.push(doodle);

    if (Modernizr.touch){

        // Don't add canvas interaction on mobile devices,
        // just draw the pretty pictures.
        doodle.drawEverything();

    } else {

        canvas.addEventListener('mouseover', function(){
            doodle.forwards();
        }, false);

        canvas.addEventListener('mouseout', function(){
            doodle.reverse();
        }, false);
    }

});

})();
