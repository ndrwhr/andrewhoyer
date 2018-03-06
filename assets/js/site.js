(function(){

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

      }
    };

    return body;
  };

  const createSpring = function(springDef) {
    const spring = {
      k: springDef.k,
      body: springDef.body,
      satisfy: function() {


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

      ref: experimentBackground,
    });

    world.addSpring({

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
