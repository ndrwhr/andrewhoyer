import { vec2 } from 'gl-matrix';

const listeners = new Set();

let details = {
  acceleration: vec2.create(),
  // scrollPosition: vec2.create(),
  // scrollVelocity: vec2.create(),
  // scrollAcceleration: vec2.create(),
  // windowVelocity: vec2.create(),
  // windowAcceleration: vec2.create(),
  // deviceAcceleration: vec2.create(),
};

let previousScrollY;
let previousTime;

// TODO: get scroll speed and acceleration for this frame:
// scrollCurrentPosition = $window.scrollTop();
// scrollCurrentSpeed = (scrollCurrentPosition - scrollPrevPosition) / dt;
// scrollAcceleration = (scrollCurrentSpeed - scrollPrevSpeed) / dt;
// scrollPrevPosition = scrollCurrentPosition;
// scrollPrevSpeed = scrollCurrentSpeed;

(function step(time){
  if (!previousTime) previousTime = time;
  const dt = time - previousTime ;
  previousTime = time;

  for (let listener of listeners) {
    listener(dt, details);
  }

  requestAnimationFrame(step);
})();

export default {
  addListener(callback) {
    listeners.add(callback);
  },
};
