import { vec2 } from "gl-matrix";
import Browser from "./utils/Browser";

const CANVAS_SIZE = 100;
const PADDING = 2;

const VIEW_BOX = [
  -(CANVAS_SIZE / 2) - PADDING,
  -(CANVAS_SIZE / 2) - PADDING,
  CANVAS_SIZE + PADDING * 2,
  CANVAS_SIZE + PADDING * 2,
].join(" ");

interface ExperimentOptions {
  el: HTMLElement;
}

interface Position {
  top: number;
  height: number;
}

export default class Experiment {
  private svg: SVGSVGElement;
  private pathEl: SVGPathElement;
  private transitionLength: number;
  private drawn: boolean;
  private position: Position;

  constructor({ el }: ExperimentOptions) {
    this.svg = el.querySelector("svg") as SVGSVGElement;
    this.svg.setAttribute("viewBox", VIEW_BOX);

    const rawPoints: [number, number][] = JSON.parse(
      this.svg.getAttribute("data-points") || "[]"
    );
    this.svg.removeAttribute("data-points");

    const { max, min } = rawPoints.reduce(
      (acc, point) => ({
        min: vec2.min(vec2.create(), acc.min, point),
        max: vec2.max(vec2.create(), acc.max, point),
      }),
      {
        max: vec2.fromValues(-Infinity, -Infinity),
        min: vec2.fromValues(Infinity, Infinity),
      }
    );

    const rawSize = vec2.subtract(vec2.create(), max, min);
    const scaleFactor = 2 - Math.max(...rawSize);

    const path = rawPoints.reduce((acc, point) => {
      const x = point[0] * scaleFactor * CANVAS_SIZE;
      const y = point[1] * scaleFactor * CANVAS_SIZE;
      return `${acc} ${x} ${y} `;
    }, "M");

    this.pathEl = this.svg.querySelector("path") as SVGPathElement;
    this.pathEl.setAttribute("d", path);

    this.transitionLength = rawPoints.length * (1000 / 60);
    this.drawn = false;
    this.position = { top: 0, height: 0 };

    Browser.addScrollListener(this.onScroll.bind(this));
    Browser.addResizeListener(this.onResize.bind(this));

    this.onResize();
  }

  private onScroll(): void {
    this.drawIfVisible();
  }

  private onResize(): void {
    const rect = this.svg.getBoundingClientRect();
    this.position = {
      top: rect.top + Browser.getScrollPosition()[1],
      height: rect.height,
    };

    this.drawIfVisible();
  }

  private drawIfVisible(): void {
    if (this.drawn) return;

    const viewportTop = Browser.getScrollPosition()[1];
    const viewportHeight = document.documentElement.clientHeight;
    const viewportBottom = viewportTop + viewportHeight;
    const elMid = this.position.top + this.position.height / 2;

    if (viewportBottom >= elMid && elMid >= viewportTop) {
      this.svg.classList.add("experiment__canvas-svg--visible");
      this.draw();
    }
  }

  private draw(): void {
    this.drawn = true;

    const length = this.pathEl.getTotalLength();

    this.pathEl.style.transition = "none";
    this.pathEl.style.strokeDasharray = `${length} ${length}`;
    this.pathEl.style.strokeDashoffset = `${length}`;

    this.pathEl.getBoundingClientRect();

    this.pathEl.style.transition = `stroke-dashoffset ${this.transitionLength}ms ease-in-out`;
    this.pathEl.style.strokeDashoffset = "0";
  }
}
