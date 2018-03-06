import { vec2 } from 'gl-matrix';

// Helper to get scroll position since cross browser is a mess:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
export const getScrollPosition = () => (
  vec2.fromValues(
    window.pageXOffset ||
    document.documentElement.scrollLeft ||
    document.body.scrollLeft ||
    0,
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  )
);

export const getWindowPosition = () => (
  vec2.fromValues(window.screenX, window.screenY)
);
