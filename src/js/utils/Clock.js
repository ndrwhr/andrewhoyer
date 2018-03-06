import { vec2 } from 'gl-matrix';

import { getScrollPosition, getWindowPosition } from './Browser';

const listeners = new Set();

let disableWindowAcceleration = false;

let previousTime;

let previousScrollPosition;
let previousScrollVelocity;

let previousWindowPosition;
let previousWindowVelocity;

const clampVec2 = (out, a, sMin, sMax) => {
  out[0] = Math.max(sMin, Math.min(sMax, a[0]));
  out[1] = Math.max(sMin, Math.min(sMax, a[1]));
  return out;
};

const step = (time) => {
  if (!previousTime) previousTime = time;
  const dt = time - previousTime ;
  previousTime = time;

  // If this is the first iteration of the loop don't do anything since we
  // don't know how big of a time step passed.
  if (!dt) {
    requestAnimationFrame(step);
    return;
  }

  // Calculate the acceleration due to scrolling.
  const currentScrollPosition = getScrollPosition();
  const currentScrollVelocity = vec2.scale(
    vec2.create(),
    vec2.subtract(vec2.create(), currentScrollPosition, previousScrollPosition),
    1 / dt
  );
  const scrollAcceleration = vec2.scale(
    vec2.create(),
    vec2.subtract(vec2.create(), currentScrollVelocity, previousScrollVelocity),
    1 / dt
  );
  previousScrollPosition = currentScrollPosition;
  previousScrollVelocity = currentScrollVelocity;

  let windowAcceleration = vec2.create();
  if (!disableWindowAcceleration) {
    const currentWindowPosition = getWindowPosition();
    const currentWindowVelocity = vec2.scale(
      vec2.create(),
      vec2.subtract(vec2.create(), currentWindowPosition, previousWindowPosition),
      1 / dt
    );
    windowAcceleration = vec2.scale(
      vec2.create(),
      vec2.subtract(vec2.create(), currentWindowVelocity, previousWindowVelocity),
      -1 / dt
    );

    previousWindowPosition = currentWindowPosition;
    previousWindowVelocity = currentWindowVelocity;
  }

  const details = {
    // The current acceleration caused by the user scrolling (px/ms/ms).
    scrollAcceleration,

    // The current acceleration caused by the user dragging the browser
    // around (px/ms/ms).
    windowAcceleration,
  };

  for (let listener of listeners) {
    listener(dt, details);
  }

  requestAnimationFrame(step);
};

window.addEventListener('resize', (() => {
  let resizeTimout = null;

  return () => {
    disableWindowAcceleration = true;

    if (resizeTimout) clearTimeout(resizeTimout);
    resizeTimout = setTimeout(() => {
      previousWindowPosition = getWindowPosition();
      previousWindowVelocity = vec2.create();

      disableWindowAcceleration = false;
    });
  };
})());

export const addClockListener = (callback) => {
  listeners.add(callback);
};

export const startClock = () => {
  previousScrollPosition = getScrollPosition();
  previousScrollVelocity = vec2.create();

  previousWindowPosition = getWindowPosition();
  previousWindowVelocity = vec2.create();
  requestAnimationFrame(step);
};
