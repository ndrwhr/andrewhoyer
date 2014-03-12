(function(){

/**
 * A helper function that returns a random number in the range of [min, max).
 */
function rand(min, max){
    return Math.floor(Math.random() * (max - min) + min);
}

var Gradient = function(options){ this.initialize(options || {}); };

Gradient.prototype = {
    initialize: function(options){
        var numSteps = options.numSteps;
        var left = this.hexToRGB_(options.left);
        var right = this.hexToRGB_(options.right);

        var delta = ['r', 'g', 'b'].reduce(function(acc, key){
            acc[key] = ((right[key] - left[key]) / numSteps);
            return acc;
        }, {});

        this.colors_ = [this.RGBtoHex_(left)];
        for (var i = 0; i < numSteps - 2; i++){
            ['r', 'g', 'b'].forEach(function(key){
                left[key] += delta[key];
            });
            this.colors_.push(this.RGBtoHex_(left));
        }
        this.colors_.push(this.RGBtoHex_(right));
    },

    randomColor: function(){
        return this.colors_[rand(0, this.colors_.length)]
    },

    hexToRGB_: function(hex){
        hex = hex.replace('#', '');

        return {
            r: parseInt(hex.substr(0, 2), 16),
            g: parseInt(hex.substr(2, 2), 16),
            b: parseInt(hex.substr(4, 2), 16)
        };
    },

    RGBtoHex_: function(rgb){
        return ['r', 'g', 'b'].reduce(function(acc, key){
            var value = Math.floor(rgb[key]).toString(16);

            if (value.length < 2) value = '0' + value;

            return acc + value;
        }, '#');
    }
};

Gradient.LIGHT_COLORS = ['#EB8B2C', '#1DC567', '#16A085', '#F39C12', '#8E44AD', '#EA6153',
    '#FF623F', '#84CEED', '#DD6E93', '#00FA9A', '#7B68EE', '#FFA076', '#FFB5C0', '#FF66B4',
    '#FADA5E', '#FFD800'];

Gradient.DARK_COLORS = ['#00008B', '#181372', '#2F4F4F', '#4C0084', '#2C3E50', '#9F1D35',
    '#123524', '#01796F'];

Gradient.createRandom = function(numSteps){
    var left = Gradient.DARK_COLORS[rand(0, Gradient.DARK_COLORS.length)];
    var right = Gradient.LIGHT_COLORS[rand(0, Gradient.DARK_COLORS.length)];

    return new Gradient({
        left: left,
        right: right,
        numSteps: numSteps
    });
};

var PolygonGrid = function(options){ this.initialize(options || {}); };

PolygonGrid.prototype = {
    initialize: function(options){
        this.height_ = 100;
        this.width_ = 100;

        this.gradient_ = options.gradient;

        this.ns_ = 'http://www.w3.org/2000/svg';
        this.svg_ = options.svg;
        this.svg_.setAttribute('xmlns', this.ns_);
        this.svg_.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        this.svg_.setAttribute('version', '1.1');
        this.svg_.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        this.svg_.setAttribute('viewBox', '0 0 ' + this.width_ + ' ' + this.height_);
        this.svg_.setAttribute('height', options.elementHeight + 'px');

        this.draw_();
    },

    draw_: function(){
        var width = 100;
        var height = 100;
        var step = 10;
        var randomOffset = 3;
        var points = [];
        var i, j, index, xOffset, yOffset;
        for (i = 0; i <= height; i += step){
            index = Math.floor(i / step);
            points[index] = [];
            for (j = 0; j <= width; j += step){
                xOffset = (j === 0 || j + step > width) ? 0 : randomOffset;
                yOffset = (i === 0 || i + step > height) ? 0 : randomOffset;

                points[index].push([
                    j + rand(-xOffset, xOffset),
                    i + rand(-yOffset, yOffset)
                ]);
            }
        }

        points.slice(0, -1).forEach(function(row, rIndex){
            row.slice(0, -1).forEach(function(point, pIndex){
                if (Math.round(Math.random())){
                    this.addTriangle_(point, row[pIndex + 1], points[rIndex + 1][pIndex]);
                    this.addTriangle_(row[pIndex + 1], points[rIndex + 1][pIndex + 1],
                        points[rIndex + 1][pIndex]);
                } else {
                    this.addTriangle_(point, row[pIndex + 1], points[rIndex + 1][pIndex + 1]);
                    this.addTriangle_(point, points[rIndex + 1][pIndex],
                        points[rIndex + 1][pIndex + 1]);
                }
            }, this);
        }, this);
    },

    addTriangle_: function(p1, p2, p3){
        var polygon = document.createElementNS(this.ns_, 'polygon');
        polygon.setAttribute('points', [p1, p2, p3].map(function(point){
            return point.join(',');
        }).join(' '));
        polygon.setAttribute('fill', this.gradient_.randomColor());

        polygon.addEventListener('mouseover', function(){
            polygon.classList.add('show');

            setTimeout(function(){
                polygon.classList.remove('show');
            }, 200);
        });

        polygon.addEventListener('click', function(evt){
            evt.preventDefault();
            polygon.setAttribute('fill', this.gradient_.randomColor());
        }.bind(this));

        this.svg_.appendChild(polygon);
    }
};

window.addEventListener('DOMContentLoaded', function(){
    var me = document.querySelector('header .me');
    var gradient = Gradient.createRandom(32);
    var headerSVG = document.querySelector('header svg');
    var footerSVG = document.querySelector('footer svg');
    var headerFooterHeight = Math.floor(window.innerHeight * 0.85);

    new PolygonGrid({
        gradient: gradient,
        svg: headerSVG,
        elementHeight: headerFooterHeight
    });

    new PolygonGrid({
        gradient: gradient,
        svg: footerSVG,
        elementHeight: headerFooterHeight
    });

    setTimeout(function(){
        headerSVG.classList.add('show');
        setTimeout(function(){
            me.classList.add('show');
        }, 300);
    }, 300);


    // Get a copy of request animation frame (Modernizr will return the proper prefixed function).
    var requestAnimFrame = (Modernizr.prefixed('requestAnimationFrame', window) ||
        function(callback){ window.setTimeout(callback, 1000/60); });

    // Set up a helper function that will choose the best available CSS3 property to shift
    // and element vertically. Namely, if CSS3 3d transforms are supported, use them, otherwise
    // fall back to using 2d transforms.
    var transformProperty = Modernizr.prefixed('transform');
    var shiftElement = (Modernizr.csstransforms3d ? function(el, y){
        el.style[transformProperty] = 'translate3d(0, ' + y + 'px, 0)';
    } : function(el, y){
        el.style[transformProperty] = 'translate(0, ' + y + 'px)';
    });

    window.addEventListener('scroll', function(){
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        if (scrollTop < headerFooterHeight){
            requestAnimFrame(function(){
                // Cap the scroll percentage to avoid bounce weirdness on osx.
                var percent = Math.max((scrollTop / headerFooterHeight), 0);

                shiftElement(headerSVG, percent * 200);
                shiftElement(me, -percent * 75);
            });
        }
    });
});

})();