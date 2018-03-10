import { vec2 } from 'gl-matrix';

// Helper to get scroll position since cross browser is a mess:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
const getScrollValues = () => (
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

const scrollListeners = [];
const resizeListeners = [];

let currentScrollPosition;

export default {
  init() {
    currentScrollPosition = getScrollValues();

    window.addEventListener('scroll', () => requestAnimationFrame(() => {
      currentScrollPosition = getScrollValues();
      scrollListeners.forEach(callback => callback(currentScrollPosition));
    }));

    window.addEventListener('resize', () => requestAnimationFrame(() => {
      resizeListeners.forEach(callback => callback());
    }));
  },

  getScrollPosition() {
    return currentScrollPosition;
  },

  addScrollListener(callback) {
    scrollListeners.push(callback);
  },

  addResizeListener(callback) {
    resizeListeners.push(callback)
  },
};
