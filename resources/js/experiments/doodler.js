(function(){

    // Constants:
    var FRAME_RATE = 16,
        JITTER = 2.5;

    var Helpers = {
        random: function(min, max){
            return Math.random() * (max - min) + min;
        },

        shiftPoint: function(point){
            return [
                point[0] + Helpers.random(-JITTER, JITTER),
                point[1] + Helpers.random(-JITTER, JITTER)
            ];
        },

        drawDots: function(context, points){
            points.forEach(function(point){
                context.beginPath();
                context.arc(point[0], point[1], 1, 0, 2 * Math.PI);
                context.fill();
            });
        },

        drawLines: function(context, points){
            context.beginPath();
            points.forEach(function(point, index){
                context[index ? 'lineTo' : 'moveTo'](point[0], point[1]);
            });
            context.stroke();
        }
    };

    // convert node list into an array.
    var canvases = [].slice.call(document.querySelectorAll('.experiments li canvas'), 0);

    canvases.forEach(function(canvas, index){
        var id = canvas.getAttribute('id'),
            points = Experiments.get(id),
            context = canvas.getContext('2d'),
            tempPaths = [[],[],[],[]];

        if (!points) return;

        context.fillStyle = 'rgba(0,0,0,0.05)';
        context.strokeStyle = 'rgba(0,0,0,0.15)';

        if (Modernizr.touch){

            // Don't add canvas interaction on mobile devices.
            tempPaths.forEach(function(){
                Helpers.drawLines(context, points.map(function(point){
                    return Helpers.shiftPoint(point);
                }));
            });

        } else {

            var timer;

            var update = function(){
                context.clearRect(0, 0, canvas.width, canvas.height);

                tempPaths.forEach(function(tempPath){
                    Helpers.drawLines(context, tempPath);
                });

                Helpers.drawDots(context, points);
            };

            canvas.addEventListener('mouseover', function(){

                timer = clearInterval(timer);
                timer = setInterval(function(){
                    tempPaths.forEach(function(tempPath){
                        tempPath.push(Helpers.shiftPoint(points[tempPath.length]));
                    });

                    update();

                    if (tempPaths[0].length == points.length)
                        timer = clearInterval(timer);
                }, FRAME_RATE);

            }, false);

            canvas.addEventListener('mouseout', function(){

                timer = clearInterval(timer);
                timer = setInterval(function(){
                    tempPaths.forEach(function(tempPath){
                        tempPath.pop();
                    });

                    update();

                    if (!tempPaths[0].length)
                        timer = clearInterval(timer);
                }, FRAME_RATE);

            }, false);
        }

        Helpers.drawDots(context, points);

    });

})();
