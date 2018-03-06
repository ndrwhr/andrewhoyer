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

// Helper to get scroll position since cross browser is a mess:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
const getScrollTop = () => (
  window.pageYOffset ||
  document.documentElement.scrollTop ||
  document.body.scrollTop ||
  0
);

export default class ExperimentSketch {
  constructor({ svg }) {
    this.svg = svg;

    svg.setAttribute('viewBox', VIEW_BOX);

    const rawPoints = JSON.parse(svg.getAttribute('data-points'));
    const { minX, maxX, minY, maxY } = rawPoints.reduce((acc, [x, y]) => ({
      minX: Math.min(acc.minX || 0, x),
      maxX: Math.max(acc.maxX || 0, x),
      minY: Math.min(acc.minY || 0, y),
      maxY: Math.max(acc.maxY || 0, y),
    }), {});

    // Find out which dimension is closest to filling the full size of the
    // SVG and use that to scale the data so that the drawing will take up
    // as much space as possible.
    const rawWidth = maxX - minX;
    const rawHeight = maxY - minY;
    const scaleFactor = 2 - Math.max(rawWidth, rawHeight);

    const path = rawPoints.reduce((acc, point) => {
      const x = point[0] * scaleFactor * CANVAS_SIZE;
      const y = point[1] * scaleFactor * CANVAS_SIZE;
      return `${acc} ${x} ${y} `;
    }, 'M');
    this.pathEl = svg.querySelector('path');
    this.pathEl.setAttribute('d', path);

    // Figure out how long the animation should take.
    this.transitionLength = rawPoints.length * (1000 / 60);

    this.drawn = false;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    window.addEventListener('scroll', () => requestAnimationFrame(this.onScroll));
    window.addEventListener('resize', () => requestAnimationFrame(this.onResize));

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
      top: rect.top + getScrollTop(),
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

    const viewportTop = getScrollTop();
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
    this.pathEl.style.transition = this.pathEl.style.transition = 'none';
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
