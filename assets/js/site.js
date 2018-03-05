(function(){

function createSVGElement(type) {
  return document.createElementNS('http://www.w3.org/2000/svg', type);
};

function createPhysicsWorld() {
  const bodies = [];
  const springs = [];

  const createBody = function(bodyDef) {
    const body = {
      mass: bodyDef.mass,
      current: bodyDef.current || vec2.create(),
      previous: bodyDef.current || vec2.create(),
      acceleration: vec2.create(),
      friction: bodyDef.friction,
      ref: bodyDef.ref,

      applyAcceleration: function(acceleration) {
        body.acceleration = vec2.add(
          vec2.create(),
          body.acceleration,
          acceleration,
        );
      },

      applyForce: function(force) {
        body.applyAcceleration(vec2.scale(vec2.create(), force, 1 / body.mass));
      },

      move: function(dt) {
        // Perform verlet integration to move the body.
        const delta = vec2.subtract(
          vec2.create(),
          vec2.scale(vec2.create(), body.current, 2 - body.friction),
          vec2.scale(vec2.create(), body.previous, 1 - body.friction)
        );
        const accel = vec2.scale(vec2.create(), body.acceleration, dt * dt);
        const newCurrent = vec2.add(vec2.create(), delta, accel);

        body.previous = body.current;
        body.current = newCurrent;

        // Reset the acceleration being applied to the body.
        body.acceleration = vec2.create();
      }
    };

    return body;
  };

  const createSpring = function(springDef) {
    const spring = {
      k: springDef.k,
      body: springDef.body,
      satisfy: function() {
        // The body should always be at 0, so we just have to scale its
        // position by the spring constant.
        const force = vec2.scale(vec2.create(), spring.body.current, -spring.k);
        spring.body.applyForce(force);
      },
    };

    return spring;
  }

  const world = {
    addBody: function(bodyDef) {
      const body = createBody(bodyDef);
      bodies.push(body);
      return body;
    },
    addSpring: function(springDef) {
      const spring = createSpring(springDef);
      springs.push(spring);
      return spring;
    },
    step: function(dt) {
      springs.forEach(function(spring) {
        spring.satisfy();
      });

      bodies.forEach(function(body) {
        body.move(dt);
      });
    },
  };


  // TODO: get scroll speed and acceleration for this frame:
  // scrollCurrentPosition = $window.scrollTop();
  // scrollCurrentSpeed = (scrollCurrentPosition - scrollPrevPosition) / dt;
  // scrollAcceleration = (scrollCurrentSpeed - scrollPrevSpeed) / dt;
  // scrollPrevPosition = scrollCurrentPosition;
  // scrollPrevSpeed = scrollCurrentSpeed;
  let previousScrollY = window.scrollY;
  window.addEventListener('scroll', function(e) {
    const scrollDelta = _.clamp(previousScrollY - window.scrollY, -0.75, 0.75);
    previousScrollY = window.scrollY;

    bodies.forEach(function(body) {
      body.current = vec2.add(vec2.create(), body.current, vec2.fromValues(0, scrollDelta));
    });
    // console.log(scrollDelta);
  });

  return world;
}

function initializeBackground(world) {
  const backgroundSVG = document.querySelector('.site__background');
  const WIDTH = 100;
  const HEIGHT = 100;
  const NUM_LINES = 8;

  const createLine = function(x1, y1, x2, y2) {
    const line = createSVGElement('line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    return line;
  };

  // Create the grid:
  const gridGroup = createSVGElement('g');
  gridGroup.classList.add('site__background-grid');
  _.range(NUM_LINES + 1).forEach(function(index) {
    const position = index * (WIDTH / NUM_LINES);
    gridGroup.appendChild(createLine(0, position, WIDTH, position))
    gridGroup.appendChild(createLine(position, 0, position, HEIGHT))
  });
  backgroundSVG.appendChild(gridGroup);

  const NUM_SHAPE_GRID_CELLS = 6;
  const SHAPE_GRID_OFFSET = WIDTH / NUM_SHAPE_GRID_CELLS ;
  const MAX_RANDOM_OFFSET = SHAPE_GRID_OFFSET / 5;
  const MAX_NUM_FILLED_CELLS = Math.floor(0.6 * (NUM_SHAPE_GRID_CELLS * NUM_SHAPE_GRID_CELLS));

  const SHAPE_COORDS = _.range(NUM_SHAPE_GRID_CELLS).reduce(function(acc, colIndex) {
    _.range(NUM_SHAPE_GRID_CELLS).map(function(rowIndex) {
      acc.push([
        (colIndex * SHAPE_GRID_OFFSET) +
          _.random(-MAX_RANDOM_OFFSET, MAX_RANDOM_OFFSET, true),
        (rowIndex * SHAPE_GRID_OFFSET) +
          _.random(-MAX_RANDOM_OFFSET, MAX_RANDOM_OFFSET, true),
      ]);
    });
    return acc;
  }, []);

  const simpleShapes = createSVGElement('g');
  simpleShapes.classList.add('site__background-shapes');
  _.sampleSize(SHAPE_COORDS, MAX_NUM_FILLED_CELLS).forEach(function(coords) {
    if (Math.random() < 0.5){
      const circle = createSVGElement('circle');
      circle.setAttribute('cx', coords[0]);
      circle.setAttribute('cy', coords[1]);
      circle.setAttribute('r', _.random(1, 5, true));
      simpleShapes.appendChild(circle);
    } else {
      const rect = createSVGElement('rect');
      const size = _.random(2, 5, true) * 2;
      rect.setAttribute('x', coords[0] -  (size / 2));
      rect.setAttribute('y', coords[1] - (size / 2));
      rect.setAttribute('width', size);
      rect.setAttribute('height', size);
      simpleShapes.appendChild(rect);
    }
  });

  backgroundSVG.appendChild(simpleShapes);

  return {
    step: function(dt) {

    }
  }
}

function initializeExperiments() {
  const world = createPhysicsWorld();

  const experimentEls = [].slice.call(document.querySelectorAll('.experiment'));
  if (!experimentEls.length) return;

  const bodies = experimentEls.map(function(el) {
    const experimentBackground = el.querySelector('.experiment__background');
    const body = world.addBody({
      mass: 1,
      friction: _.random(0.15, 0.2),
      current: vec2.fromValues(-15, -15),
      ref: experimentBackground,
    });

    world.addSpring({
      k: _.random(0.0001, 0.0003),
      body: body,
    });

    return body;
  });

  return {
    step: function(dt) {
      world.step(dt);

      bodies.forEach(function(body) {
        const el = body.ref;
        el.style.transform = `translate(${body.current[0]}px, ${body.current[1]}px)`;
      });
    },
  }
}

window.addEventListener('DOMContentLoaded', function(){
  const background = initializeBackground();
  const experiments = initializeExperiments();

  (function step() {
    background.step(16);
    experiments.step(16);

    requestAnimationFrame(step);
  })();
});

})();