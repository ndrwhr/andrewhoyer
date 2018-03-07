import { vec2 } from 'gl-matrix';
import random from 'lodash/random';
import range from 'lodash/range';
import sample from 'lodash/sample';
import shuffle from 'lodash/shuffle';

import Body from './physics/Body';
import Spring from './physics/Spring';
import { addClockListener } from './utils/Clock';

const WIDTH = 100;
const HEIGHT = 100;

const NUM_GRID_LINES = 10;

const SHAPE_SPOTS = (() => {
  const NUM_SHAPES_PER_ROW = 7;
  const NUM_SHAPE_SPOTS = NUM_SHAPES_PER_ROW * NUM_SHAPES_PER_ROW;

  const SHAPE_GRID_OFFSET = WIDTH / NUM_SHAPES_PER_ROW ;
  const MAX_RANDOM_OFFSET = SHAPE_GRID_OFFSET / 5;

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

const getRandomDirection = () => sample(['alternate', 'alternate-reverse']);

const createSVGElement = (type, attributes = {}) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', type);

  Object.keys(attributes).forEach((attr) => {
    el.setAttribute(attr, attributes[attr]);
  });

  return el;
};


const createShapeWrapper = ({ x, y } = {}) => {
  const g = createSVGElement('g', {
    transform: `translate(${x} ${y})`,
    'class': 'site__background-shape-wrapper',
  });
  return g;
};

const createCircle = ({ cx, cy, r, animationDuration }) => {
  const g = createShapeWrapper({
    x: cx,
    y: cy,
  });
  const circle = createSVGElement('circle', {
    cx: 0,
    cy: 0,
    r,
  });
  circle.style.animationDuration = `${animationDuration}s`;
  circle.style.animationDirection = getRandomDirection();

  g.appendChild(circle);
  return g;
};

const createSquare = ({ x, y, width, animationDuration }) => {
  const g = createShapeWrapper({ x, y });
  const rect = createSVGElement('rect', {
    x: -(width / 2),
    y: -(width / 2),
    height: width,
    width,
  });
  rect.style.animationDuration = `${animationDuration}s`;
  rect.style.animationDirection = getRandomDirection();
  g.appendChild(rect);
  return g;
}

export default class Background {
  constructor() {
    this.svg = document.querySelector('.site__background')

    this.shapes = [];

    this.drawGrid();
    this.drawShapes();

    addClockListener(this.tick.bind(this));
  }

  drawGrid() {
    const gridGroup = createSVGElement('g');
    gridGroup.classList.add('site__background-grid');
    range(NUM_GRID_LINES + 1).forEach(function(index) {
      const position = index * (WIDTH / NUM_GRID_LINES);
      gridGroup.appendChild(createSVGElement('line', {
        x1: 0,
        y1: position,
        x2: WIDTH,
        y2:position
      }));
      gridGroup.appendChild(createSVGElement('line', {
        x1: position,
        y1: 0,
        x2: position,
        y2: HEIGHT
      }));
    });
    this.svg.appendChild(gridGroup);
  }

  drawShapes() {
    const totalNumShapes = Math.floor(SHAPE_SPOTS.length * 0.9);

    const numCircles = Math.floor(totalNumShapes * 0.4);
    const numSquares = Math.floor(totalNumShapes * 0.4);
    const numSquiggles = totalNumShapes - numCircles - numSquares;

    SHAPE_SPOTS.slice(0, numCircles).forEach(([x, y]) => {
      this.shapes.push({
        x, y,
        el: createCircle({
          cx: x, cy: y,
          animationDuration: random(3, 10, true),
          r: random(2, 4),
        })
      });
    });

    SHAPE_SPOTS.slice(numCircles, numCircles + numSquares).forEach(([x, y]) => {
      this.shapes.push({
        x, y,
        el: createSquare({
          x: x, y: y,
          animationDuration: random(20, 40, true),
          width: random(4, 8),
        })
      });
    });

    const avgFriction = 0.05;
    const frictionDelta = avgFriction * 0.5;
    const avgK = 0.0001;
    const kDelta = avgK * 0.5;

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
