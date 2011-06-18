(function(){

var canvases = document.querySelectorAll('.experiments li canvas');

var random = function(min, max){
    return Math.random() * (max - min) + min;
};

var offset = 3;

var jitter = function(point){
    return [point[0] + random(-offset, offset), point[1] + random(-offset, offset)];
};

var drawPoints = function(context, points){
    points.forEach(function(point){
        context.beginPath();
        context.arc(point[0], point[1], 1, 0, 2 * Math.PI);
        context.fill();
    });
};

var drawLines = function(context, points){
    context.beginPath();
    points.forEach(function(point, index){
        context[index ? 'lineTo' : 'moveTo'](point[0], point[1]);
    });
    context.stroke();
};

[].forEach.call(canvases, function(canvas, index){
    var scribble = ((index % 2) == 0);
    
    var id = canvas.getAttribute('id'),
        points = Experiments.get(id || 'css-clock');
    
    if (!points) return;
    
    var context = context = canvas.getContext('2d');
    
    context.fillStyle = 'rgba(0,0,0,0.05)';
    context.strokeStyle = 'rgba(0,0,0,0.15)';
    
    var tempPaths = [[],[],[],[]],
        timer;

    drawPoints(context, points);

    canvas.addEventListener('mouseover', function(){
        timer = clearInterval(timer);

        timer = setInterval(function(){
            tempPaths.forEach(function(tempPath){
                tempPath.push(jitter(points[tempPath.length]));
            });
            
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            tempPaths.forEach(function(tempPath){
                drawLines(context, tempPath);
            });
            
            drawPoints(context, points);
            if (tempPaths[0].length == points.length)
                timer = clearInterval(timer);
        }, 16);
    }, false);

    canvas.addEventListener('mouseout', function(){
        timer = clearInterval(timer);

        timer = setInterval(function(){
            tempPaths.forEach(function(tempPath){
                tempPath.pop();
            });
            context.clearRect(0, 0, canvas.width, canvas.height);
            tempPaths.forEach(function(tempPath){
                drawLines(context, tempPath);
            });
            drawPoints(context, points);
            if (!tempPaths[0].length)
                timer = clearInterval(timer);
        }, 16);
    }, false);
});

})();