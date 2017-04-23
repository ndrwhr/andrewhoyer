(function(){

function populateBackground(){
    const NS = 'http://www.w3.org/2000/svg';
    const container = document.querySelector('.background');

    /**
     * Helper function for getting a random color on a gradient.
     */
    const getRandomColor = (function(){
        const numSteps = 32;

        const leftColor = _.sample([
            [0x00, 0x00, 0x8B],
            [0x18, 0x13, 0x72],
            [0x2F, 0x4F, 0x4F],
            [0x4C, 0x00, 0x84],
            [0x2C, 0x3E, 0x50],
            [0x9F, 0x1D, 0x35],
            [0x12, 0x35, 0x24],
            [0x01, 0x79, 0x6F],
        ]);
        const rightColor = _.sample([
            [0xeb, 0x8b, 0x2c],
            [0x1d, 0xc5, 0x67],
            [0x16, 0xa0, 0x85],
            [0xf3, 0x9c, 0x12],
            [0x8e, 0x44, 0xad],
            [0xea, 0x61, 0x53],
            [0xff, 0x62, 0x3f],
            [0x84, 0xce, 0xed],
            [0xdd, 0x6e, 0x93],
            [0x00, 0xfa, 0x9a],
            [0x7b, 0x68, 0xee],
            [0xff, 0xa0, 0x76],
            [0xff, 0xb5, 0xc0],
            [0xff, 0x66, 0xb4],
            [0xfa, 0xda, 0x5e],
            [0xff, 0xd8, 0x00],
        ]);

        function rgbToString(rgb){
            return 'rgb(' + rgb.map(Math.floor, Math).join(',') + ')';
        }

        const delta = _.times(3, function(index){
            return (rightColor[index] - leftColor[index]) / numSteps;
        });

        const gradient = [rgbToString(leftColor)];
        _.times(numSteps - 2, function(currentStep){
            return _.times(3, function(componentIndex){
                return leftColor[componentIndex] +
                        (delta[componentIndex] * currentStep);
            });
        }).forEach(function(color){
            gradient.push(rgbToString(color));
        });
        gradient.push(rgbToString(rightColor));

        return function(){
            return _.sample(gradient);
        };
    })();

    /**
     * Helper function that creates a single polygon with the provided points.
     *
     * @param {Array.<number>} points An array of clockwise [X, Y] pairs.
     */
    function addTriangle(points){
        const polygon = document.createElementNS(NS, 'polygon');

        polygon.setAttribute('points', points.map(function(point){
            return point.join(',');
        }).join(' '));

        polygon.setAttribute('fill', getRandomColor());

        polygon.addEventListener('mouseover', function(){
            polygon.classList.add('visible');
            setTimeout(function(){
                polygon.classList.remove('visible');
            }, 200);
        });

        container.appendChild(polygon);
    }

    const dimension = 150;
    const stepSize = 10;
    const numPoints = dimension / stepSize;
    const maxRandomOffset = 3.5;

    // Generate a grid of points where each point is shifted randomly by
    // a random amount.
    const points = _.times(numPoints + 1, function(rowIndex){
        return _.times(numPoints + 1, function(colIndex){
            // If we're dealing with the first or last column, don't
            // adjust the point's x value.
            const xOffset = _.inRange(colIndex, 1, numPoints) ?
                    _.random(-maxRandomOffset, maxRandomOffset, true) : 0;
            // Similarly, if we're dealing with the first or last row,
            // don't adjust the point's y value.
            const yOffset = _.inRange(rowIndex, 1, numPoints) ?
                    _.random(-maxRandomOffset, maxRandomOffset, true) : 0;

            return [
                (colIndex * stepSize) + xOffset,
                (rowIndex * stepSize) + yOffset,
            ];
        });
    });

    // Divide the grid up into triangles.
    points.slice(0, -1).forEach(function(row, rowIndex){
        row.slice(0, -1).forEach(function(point, colIndex){
            if (_.random(0, 1)){
                // Add a triangle in the top left and bottom right.
                addTriangle([
                    point,
                    row[colIndex + 1],
                    points[rowIndex + 1][colIndex],
                ]);
                addTriangle([
                    row[colIndex + 1],
                    points[rowIndex + 1][colIndex + 1],
                    points[rowIndex + 1][colIndex],
                ]);
            } else {
                // Add a triangle in the top right and bottom left.
                addTriangle([
                    point,
                    row[colIndex + 1],
                    points[rowIndex + 1][colIndex + 1],
                ]);
                addTriangle([
                    point,
                    points[rowIndex + 1][colIndex],
                    points[rowIndex + 1][colIndex + 1],
                ]);
            }
        });
    });
}

window.addEventListener('DOMContentLoaded', function(){
    populateBackground();

    setTimeout(function(){
        document.body.classList.add('site--ready');
    }, 200);
});

})();