import { vec2 } from 'gl-matrix';

import Browser from './utils/Browser';

const CANVAS_SIZE = 100;

// The data is stored normalized over the range [-0.5, 0.5] so that we can
// easily change the size of the drawing without having to re-center.
const PADDING = 2;
const VIEW_BOX = [
 - (CANVAS_SIZE / 2) - PADDING,
 - (CANVAS_SIZE / 2) - PADDING,
 CANVAS_SIZE + (PADDING * 2),
 CANVAS_SIZE + (PADDING * 2),
].join(' ');

export default class Experiment {
  constructor({ el }) {
    this.svg = el.querySelector('svg');
    this.svg.setAttribute('viewBox', VIEW_BOX);

    const rawPoints = JSON.parse(this.svg.getAttribute('data-points'));
    this.svg.removeAttribute('data-points');

    const { max, min } = rawPoints.reduce((acc, point) => ({
      min: vec2.min(vec2.create(), acc.min, point),
      max: vec2.max(vec2.create(), acc.max, point),
    }), {
      max: vec2.fromValues(-Infinity, -Infinity),
      min: vec2.fromValues(Infinity, Infinity),
    });

    // Find out which dimension is closest to filling the full size of the
    // SVG and use that to scale the data so that the drawing will take up
    // as much space as possible.
    const rawSize = vec2.subtract(vec2.create(), max, min);
    const scaleFactor = 2 - Math.max(...rawSize);

    const path = rawPoints.reduce((acc, point) => {
      const x = point[0] * scaleFactor * CANVAS_SIZE;
      const y = point[1] * scaleFactor * CANVAS_SIZE;
      return `${acc} ${x} ${y} `;
    }, 'M');
    this.pathEl = this.svg.querySelector('path');
    this.pathEl.setAttribute('d', path);

    // Figure out how long the animation should take.
    this.transitionLength = rawPoints.length * (1000 / 60);

    this.drawn = false;

    Browser.addScrollListener(this.onScroll.bind(this));
    Browser.addResizeListener(this.onResize.bind(this));

    // Just call the onResize handler to get things started.
    this.onResize();
  }

  /**
   * Called whenever the user scrolls.
   */
  onScroll() {
    this.drawIfVisible();
  }

  /**
   * Called whenever the user resizes their browser. This method saves the
   * position of the svg on the page so that we can detect when it is visible
   * and kick of the drawing animation.
   */
  onResize() {
    const rect = this.svg.getBoundingClientRect();
    this.position = {
      top: rect.top + Browser.getScrollPosition()[1],
      height: rect.height
    };

    this.drawIfVisible();
  }

  /**
   * This method will kick off the drawing animation and add a visible class
   * to the svg element if it is currently visible to the user (meaning not
   * scrolled off screen).
   */
  drawIfVisible() {
    // Don't even bother checking the scroll position and what not if the
    // experiment has already started drawing.
    if (this.drawn) return;

    const viewportTop = Browser.getScrollPosition()[1];
    const viewportHeight = document.documentElement.clientHeight;
    const viewportBottom = viewportTop + viewportHeight;
    const elMid = this.position.top + (this.position.height / 2);

    if (viewportBottom >= elMid && elMid >= viewportTop){
      this.svg.classList.add('experiment__canvas-svg--visible');
      this.draw();
    }
  }

  draw() {
    this.drawn = true;

    // Animate the line segment using Jake Archibald's awesome technique:
    // http://jakearchibald.com/2013/animated-line-drawing-svg/

    const length = this.pathEl.getTotalLength();

    // Clear any previous transition
    this.pathEl.style.transition = 'none';
    // Set up the starting positions
    this.pathEl.style.strokeDasharray = length + ' ' + length;
    this.pathEl.style.strokeDashoffset = length;
    // Trigger a layout so styles are calculated & the browser
    // picks up the starting position before animating
    this.pathEl.getBoundingClientRect();
    // Define our transition
    this.pathEl.style.transition = this.pathEl.style.transition =
      'stroke-dashoffset ' + this.transitionLength + 'ms ease-in-out';
    // Go!
    this.pathEl.style.strokeDashoffset = '0';
  }
}
