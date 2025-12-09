import { vec2 } from "gl-matrix";

type ScrollCallback = (position: vec2) => void;
type ResizeCallback = () => void;

const getScrollValues = (): vec2 =>
  vec2.fromValues(
    window.pageXOffset ||
      document.documentElement.scrollLeft ||
      document.body.scrollLeft ||
      0,
    window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
  );

const scrollListeners: ScrollCallback[] = [];
const resizeListeners: ResizeCallback[] = [];

let currentScrollPosition: vec2;

const Browser = {
  init(): void {
    currentScrollPosition = getScrollValues();

    window.addEventListener("scroll", () =>
      requestAnimationFrame(() => {
        currentScrollPosition = getScrollValues();
        scrollListeners.forEach((callback) => callback(currentScrollPosition));
      })
    );

    window.addEventListener("resize", () =>
      requestAnimationFrame(() => {
        resizeListeners.forEach((callback) => callback());
      })
    );
  },

  getScrollPosition(): vec2 {
    return currentScrollPosition;
  },

  addScrollListener(callback: ScrollCallback): void {
    scrollListeners.push(callback);
  },

  addResizeListener(callback: ResizeCallback): void {
    resizeListeners.push(callback);
  },
};

export default Browser;
