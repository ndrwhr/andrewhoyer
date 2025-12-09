import { vec2, mat2 } from "gl-matrix";
import { random, range, sample, sampleSize } from "lodash-es";

const WIDTH = 100;
const HEIGHT = 100;
const NUM_GRID_LINES = 20;

interface ShapeSpot {
  x: number;
  y: number;
}

const SHAPE_SPOTS: ShapeSpot[] = (() => {
  const NUM_SHAPES_PER_ROW = 7;
  const SHAPE_GRID_OFFSET = WIDTH / NUM_SHAPES_PER_ROW;
  const MAX_RANDOM_OFFSET = SHAPE_GRID_OFFSET / 3;

  const coords: ShapeSpot[] = [];

  for (let colIndex = 0; colIndex <= NUM_SHAPES_PER_ROW; colIndex++) {
    for (let rowIndex = 0; rowIndex <= NUM_SHAPES_PER_ROW; rowIndex++) {
      coords.push({
        x:
          colIndex * SHAPE_GRID_OFFSET +
          random(-MAX_RANDOM_OFFSET, MAX_RANDOM_OFFSET, true),
        y:
          rowIndex * SHAPE_GRID_OFFSET +
          random(-MAX_RANDOM_OFFSET, MAX_RANDOM_OFFSET, true),
      });
    }
  }

  return coords;
})();

function createSVGElement<K extends keyof SVGElementTagNameMap>(
  type: K,
  attributes: Record<string, string | number> = {}
): SVGElementTagNameMap[K] {
  const el = document.createElementNS("http://www.w3.org/2000/svg", type);

  Object.entries(attributes).forEach(([attr, value]) => {
    el.setAttribute(attr, String(value));
  });

  return el;
}

function createShapeWrapper(x: number, y: number): SVGGElement {
  return createSVGElement("g", {
    transform: `translate(${x} ${y})`,
    class: "site__background-shape-wrapper",
  });
}

function createRandomPolygon(): SVGPolygonElement {
  const n = sample([3, 3, 4, 4, 5, 6, 7, 20]) ?? 4;
  const radius = random(2, 4, true);
  const offsetAngle = random(-Math.PI * 2, Math.PI * 2, true);
  const points: vec2[] = [];

  const lerp = (2 * Math.PI) / n;

  for (let i = 0; i < n; i++) {
    const angle = lerp * i;
    const vector = vec2.fromValues(0, -1);
    const rotationMatrix = mat2.fromRotation(mat2.create(), angle + offsetAngle);
    points.push(vec2.transformMat2(vec2.create(), vector, rotationMatrix));
  }

  const polygon = createSVGElement("polygon", {
    points: points.map(([px, py]) => `${px * radius},${py * radius}`).join(" "),
  });

  polygon.style.animationDuration = `${random(5, 30)}s`;
  polygon.style.animationDirection =
    sample(["alternate", "alternate-reverse"]) ?? "alternate";

  return polygon;
}

function createRandomShape(x: number, y: number): SVGGElement {
  const wrapper = createShapeWrapper(x, y);
  wrapper.appendChild(createRandomPolygon());
  return wrapper;
}

export default class SiteBackground {
  private svg: SVGSVGElement | null;

  constructor() {
    this.svg = document.querySelector(".site__background");

    if (this.svg) {
      this.drawGrid();
      this.drawShapes();
    }
  }

  private drawGrid(): void {
    if (!this.svg) return;

    const gridGroup = createSVGElement("g");
    gridGroup.classList.add("site__background-grid");

    for (let index = 0; index < 2; index++) {
      const lineGroup = createSVGElement("g", {
        transform: `rotate(${index * 90} 50 50)`,
      });

      for (let lineIndex = 0; lineIndex <= NUM_GRID_LINES; lineIndex++) {
        const position = lineIndex * (WIDTH / NUM_GRID_LINES);
        lineGroup.appendChild(
          createSVGElement("line", {
            x1: 0,
            y1: position,
            x2: WIDTH,
            y2: position,
          })
        );
      }

      gridGroup.appendChild(lineGroup);
    }

    this.svg.appendChild(gridGroup);
  }

  private drawShapes(): void {
    if (!this.svg) return;

    const numShapes = Math.floor(SHAPE_SPOTS.length * 0.7);
    const g = createSVGElement("g", {
      class: "site__background-shapes",
    });

    const selectedSpots = sampleSize(SHAPE_SPOTS, numShapes);
    selectedSpots.forEach(({ x, y }) => {
      g.appendChild(createRandomShape(x, y));
    });

    this.svg.appendChild(g);
  }
}
