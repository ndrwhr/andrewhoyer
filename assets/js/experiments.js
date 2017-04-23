(function(){

var Experiment = function(options){ this.initialize(options || {}); };

Experiment.prototype = {
    /**
     * Initialize an experiment by binding to all necessary window event and properly configuring
     * the point data and it's canvas.
     *
     * @param {Object} options An object literal with the following values.
     *      @param {Element} el An experiment li element. The only thing assumed about this element
     *          is that it contains a single canvas element which has a data attribute of
     *          'data-points' which contains the point data for the current experiment.
     */
    initialize: function(options){
        this.el_ = options.el;

        this.svg_ = this.el_.querySelector('svg');
        this.size_ = 300;
        this.pathEl_ = this.svg_.querySelector('path')

        // Fetch and parse the point data off of the svg element. The data is stored normalize
        // (meaning values ranging from 0 to 1), so that I can easily change the size of the
        // drawing, so we much scale the data to fit on the svg.
        var rawPoints = JSON.parse(this.svg_.getAttribute('data-points'));
        this.pathData_ = rawPoints.map(function(point){
            // Rather than scaling the data to fill the whole svg, add some additional padding.
            var padding = 25;
            return [
                point[0] * (this.size_ - padding),
                point[1] * (this.size_ - padding)
            ];
        }, this).reduce(function(acc, point){
            return acc + point[0] + ' ' + point[1] + ' ';
        }, 'M');
        this.pathEl_.setAttribute('d', this.pathData_);

        // Figure out how long the animation should take.
        this.transitionLength_ = rawPoints.length * (1000 / 60);

        this.drawn_ = false;

        window.addEventListener('scroll', this.onScroll_.bind(this));
        window.addEventListener('resize', this.onResize_.bind(this));

        // Just call the onResize_ handler to get things started.
        this.onResize_();
    },

    /**
     * Called whenever the user scrolls.
     */
    onScroll_: function(){
        this.drawIfVisible_();
    },

    /**
     * Called whenever the user resizes their browser. This method caches the position of the
     * li on the page so that we can later detect if this experiments element is current visible.
     */
    onResize_: function(){
        var rect = this.el_.getBoundingClientRect();
        this.position_ = {
            top: rect.top + (document.body.scrollTop || document.documentElement.scrollTop),
            height: rect.height
        };

        this.drawIfVisible_();
    },

    /**
     * This method will kick off the drawing animation and add a 'visible' class to the experiments
     * element if it is currently visible to the user (meaning not scrolled off screen).
     */
    drawIfVisible_: function(){
        // Don't even bother checking the scroll position and what not if the experiment has
        // already started drawing.
        if (this.drawn_) return;

        var viewportTop = document.body.scrollTop || document.documentElement.scrollTop
        var viewportHeight = document.documentElement.clientHeight;
        var viewportBottom = viewportTop + viewportHeight;
        var elMid = this.position_.top + (this.position_.height / 2);

        if (viewportBottom >= elMid && elMid >= viewportTop){
            this.el_.classList.add('experiment--visible');
            this.draw_();
        }
    },

    draw_: function(){
        this.drawn_ = true;

        // Animate the line segment using Jake Archibald's awesome technique:
        // http://jakearchibald.com/2013/animated-line-drawing-svg/

        var length = this.pathEl_.getTotalLength();

        // Clear any previous transition
        this.pathEl_.style.transition = this.pathEl_.style.transition = 'none';
        // Set up the starting positions
        this.pathEl_.style.strokeDasharray = length + ' ' + length;
        this.pathEl_.style.strokeDashoffset = length;
        // Trigger a layout so styles are calculated & the browser
        // picks up the starting position before animating
        this.pathEl_.getBoundingClientRect();
        // Define our transition
        this.pathEl_.style.transition = this.pathEl_.style.transition =
            'stroke-dashoffset ' + this.transitionLength_ + 'ms ease-in-out';
        // Go!
        this.pathEl_.style.strokeDashoffset = '0';
    }
};

window.addEventListener('DOMContentLoaded', function(){
    [].forEach.call(document.querySelectorAll('.experiment'), function(li){
        new Experiment({
            el: li
        });
    });
});

})();
