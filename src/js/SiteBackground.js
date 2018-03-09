import { vec2, mat2 } from 'gl-matrix';
import random from 'lodash/random';
import range from 'lodash/range';
import sample from 'lodash/sample';
import sampleSize from 'lodash/sampleSize';
import shuffle from 'lodash/shuffle';

import Body from './physics/Body';
import Spring from './physics/Spring';
import { addClockListener } from './utils/Clock';

const WIDTH = 100;
const HEIGHT = 100;

const NUM_GRID_LINES = 20;

const SHAPE_SPOTS = (() => {
  const NUM_SHAPES_PER_ROW = 7;
  const NUM_SHAPE_SPOTS = NUM_SHAPES_PER_ROW * NUM_SHAPES_PER_ROW;

  const SHAPE_GRID_OFFSET = WIDTH / NUM_SHAPES_PER_ROW ;
  const MAX_RANDOM_OFFSET = SHAPE_GRID_OFFSET / 3;

  // Generate a grid of possible locations that shapes can be so that we don't
  // have any overlapping shapes.
  const coords = range(NUM_SHAPES_PER_ROW + 1).reduce((acc, colIndex) => {
    range(NUM_SHAPES_PER_ROW + 1).forEach((rowIndex) => {
      acc.push([
        (colIndex * SHAPE_GRID_OFFSET) +
          random(-MAX_RANDOM_OFFSET, MAX_RANDOM_OFFSET, true),
        (rowIndex * SHAPE_GRID_OFFSET) +
          random(-MAX_RANDOM_OFFSET, MAX_RANDOM_OFFSET, true),
      ]);
    });
    return acc;
  }, []);

  return shuffle(coords);
})();

const createSVGElement = (type, attributes = {}) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', type);

  Object.keys(attributes).forEach((attr) => {
    el.setAttribute(attr, attributes[attr]);
  });

  return el;
};

const createRandomShape = (() => {
  const createShapeWrapper = (x, y) => {
    const g = createSVGElement('g', {
      transform: `translate(${x} ${y})`,
      'class': 'site__background-shape-wrapper',
    });
    return g;
  };

  const createRandomPolygon = () => {
    const n = sample([3, 3, 4, 4, 5, 6, 7, 20]);
    const radius = random(2, 4, true);
    const offsetAngle = random(-Math.PI * 2, Math.PI * 2);
    const points = [];

    const lerp = 2 * Math.PI / n;
    range(n).forEach((index) => {
      const angle = lerp * index;
      const vector = vec2.fromValues(0, -1);
      const rotationMatrix = mat2.fromRotation(mat2.create(), angle + offsetAngle);
      points.push(vec2.transformMat2(vec2.create(), vector, rotationMatrix));
    });

    const polygon = createSVGElement('polygon', {
      points: points.map(([x, y]) => `${x * radius},${y * radius}`).join(' '),
    });

    polygon.style.animationDuration = `${random(5, 30)}s`;
    polygon.style.animationDirection = sample([
      'alternate', 'alternate-reverse'
    ]);

    return polygon;
  };

  return (x, y) => {
    const wrapper = createShapeWrapper(x, y);
    wrapper.appendChild(createRandomPolygon());
    return wrapper;
  };
})();

export default class Background {
  constructor() {
    this.svg = document.querySelector('.site__background')

    this.shapes = [];

    this.drawGrid();
    this.drawShapes();

    // addClockListener(this.tick.bind(this));
  }

  drawGrid() {
    const gridGroup = createSVGElement('g');
    gridGroup.classList.add('site__background-grid');

    range(2).forEach((index) => {
      const lineGroup = createSVGElement('g', {
        transform: `rotate(${index * 90} 50 50)`,
      });

      range(NUM_GRID_LINES + 1).forEach(function(index) {
        const position = index * (WIDTH / NUM_GRID_LINES);
        lineGroup.appendChild(createSVGElement('line', {
          x1: 0,
          y1: position,
          x2: WIDTH,
          y2:position
        }));
      });

      gridGroup.appendChild(lineGroup);
    });

    this.svg.appendChild(gridGroup);
  }

  drawShapes() {
    const numShapes = Math.floor(SHAPE_SPOTS.length * 0.7);
    sampleSize(SHAPE_SPOTS, numShapes).forEach(([x, y]) => {
      this.shapes.push({
        x, y,
        el: createRandomShape(x, y),
      });
    });

    const avgFriction = 0.1;
    const frictionDelta = avgFriction * 0.3;
    const avgK = 0.0001;
    const kDelta = avgK * 0.3;

    const g = createSVGElement('g');
    g.classList.add('site__background-shapes');
    this.shapes.forEach((shape) => {
      const positionOffset = 0.1;
      const body = new Body({
        friction: random(avgFriction - frictionDelta, avgFriction + frictionDelta),
        current: vec2.fromValues(
          random(-positionOffset, positionOffset, true),
          random(-positionOffset, positionOffset, true)
        ),
      });
      const spring = new Spring({
        k: random(avgK - kDelta, avgK + kDelta),
        body,
      });

      shape.spring = spring;
      shape.body = body;

      g.appendChild(shape.el);
    });
    this.svg.appendChild(g);
  }

  tick(dt, { scrollAcceleration, windowAcceleration }) {
    const acceleration = vec2.add(
      vec2.create(),
      vec2.scale(vec2.create(), scrollAcceleration, 0.001),
      vec2.scale(vec2.create(), windowAcceleration, 0.01)
    );
    this.shapes.forEach((shape) => {
      shape.body.applyAcceleration(acceleration);
      shape.spring.satisfy();
      shape.body.move(dt);

      const x = shape.x + shape.body.current[0];
      const y = shape.y + shape.body.current[1];
      shape.el.setAttribute('transform', `translate(${x} ${y})`);
    });
  }
}
