import random from 'lodash/random';
import range from 'lodash/range';
import sampleSize from 'lodash/sampleSize';

import Clock from './utils/clock';

const WIDTH = 100;
const HEIGHT = 100;
const NUM_LINES = 8;

const createSVGElement = (type) => (
  document.createElementNS('http://www.w3.org/2000/svg', type)
);

const createLine = (x1, y1, x2, y2) => {
  const line = createSVGElement('line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  return line;
};

export default class Background {
  constructor() {
    const backgroundSVG = document.querySelector('.site__background');
    const gridGroup = createSVGElement('g');
    gridGroup.classList.add('site__background-grid');
    range(NUM_LINES + 1).forEach(function(index) {
      const position = index * (WIDTH / NUM_LINES);
      gridGroup.appendChild(createLine(0, position, WIDTH, position))
      gridGroup.appendChild(createLine(position, 0, position, HEIGHT))
    });
    backgroundSVG.appendChild(gridGroup);

    const NUM_SHAPE_GRID_CELLS = 6;
    const SHAPE_GRID_OFFSET = WIDTH / NUM_SHAPE_GRID_CELLS ;
    const MAX_RANDOM_OFFSET = SHAPE_GRID_OFFSET / 5;
    const MAX_NUM_FILLED_CELLS = Math.floor(0.6 * (NUM_SHAPE_GRID_CELLS * NUM_SHAPE_GRID_CELLS));

    const SHAPE_COORDS = range(NUM_SHAPE_GRID_CELLS).reduce(function(acc, colIndex) {
      range(NUM_SHAPE_GRID_CELLS).map(function(rowIndex) {
        acc.push([
          (colIndex * SHAPE_GRID_OFFSET) +
            random(-MAX_RANDOM_OFFSET, MAX_RANDOM_OFFSET, true),
          (rowIndex * SHAPE_GRID_OFFSET) +
            random(-MAX_RANDOM_OFFSET, MAX_RANDOM_OFFSET, true),
        ]);
      });
      return acc;
    }, []);

    const simpleShapes = createSVGElement('g');
    simpleShapes.classList.add('site__background-shapes');
    sampleSize(SHAPE_COORDS, MAX_NUM_FILLED_CELLS).forEach(function(coords) {
      if (Math.random() < 0.5){
        const circle = createSVGElement('circle');
        circle.setAttribute('cx', coords[0]);
        circle.setAttribute('cy', coords[1]);
        circle.setAttribute('r', random(1, 5, true));
        simpleShapes.appendChild(circle);
      } else {
        const rect = createSVGElement('rect');
        const size = random(2, 5, true) * 2;
        rect.setAttribute('x', coords[0] -  (size / 2));
        rect.setAttribute('y', coords[1] - (size / 2));
        rect.setAttribute('width', size);
        rect.setAttribute('height', size);
        simpleShapes.appendChild(rect);
      }
    });

    backgroundSVG.appendChild(simpleShapes);
  }
}
