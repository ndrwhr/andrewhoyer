import { describe, it, expect, beforeEach, vi } from "vitest";
import { vec2 } from "gl-matrix";

// Mock Browser module
vi.mock("../src/scripts/utils/Browser", () => ({
  default: {
    init: vi.fn(),
    getScrollPosition: vi.fn(() => vec2.fromValues(0, 0)),
    addScrollListener: vi.fn(),
    addResizeListener: vi.fn(),
  },
}));

describe("Experiment", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = "";
  });

  it("should set viewBox on SVG element", async () => {
    document.body.innerHTML = `
      <div class="experiment">
        <svg data-points="[[0,0],[1,0],[1,1]]">
          <path></path>
        </svg>
      </div>
    `;

    const { default: Experiment } = await import("../src/scripts/Experiment");
    const el = document.querySelector(".experiment") as HTMLElement;

    new Experiment({ el });

    const svg = el.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBe("-52 -52 104 104");
  });

  it("should create path from data-points", async () => {
    const points = [
      [0, 0],
      [0.5, 0],
      [0.5, 0.5],
    ];

    document.body.innerHTML = `
      <div class="experiment">
        <svg data-points='${JSON.stringify(points)}'>
          <path></path>
        </svg>
      </div>
    `;

    const { default: Experiment } = await import("../src/scripts/Experiment");
    const el = document.querySelector(".experiment") as HTMLElement;

    new Experiment({ el });

    const path = el.querySelector("path");
    const d = path?.getAttribute("d");

    // Path should start with M (moveto command)
    expect(d).toMatch(/^M/);
    // Path should contain coordinates
    expect(d).toContain("0");
  });

  it("should remove data-points attribute after parsing", async () => {
    document.body.innerHTML = `
      <div class="experiment">
        <svg data-points="[[0,0],[1,1]]">
          <path></path>
        </svg>
      </div>
    `;

    const { default: Experiment } = await import("../src/scripts/Experiment");
    const el = document.querySelector(".experiment") as HTMLElement;

    new Experiment({ el });

    const svg = el.querySelector("svg");
    expect(svg?.hasAttribute("data-points")).toBe(false);
  });

  it("should register scroll and resize listeners", async () => {
    document.body.innerHTML = `
      <div class="experiment">
        <svg data-points="[[0,0]]">
          <path></path>
        </svg>
      </div>
    `;

    const { default: Browser } = await import("../src/scripts/utils/Browser");
    const { default: Experiment } = await import("../src/scripts/Experiment");
    const el = document.querySelector(".experiment") as HTMLElement;

    new Experiment({ el });

    expect(Browser.addScrollListener).toHaveBeenCalled();
    expect(Browser.addResizeListener).toHaveBeenCalled();
  });

  it("should handle empty points array", async () => {
    document.body.innerHTML = `
      <div class="experiment">
        <svg data-points="[]">
          <path></path>
        </svg>
      </div>
    `;

    const { default: Experiment } = await import("../src/scripts/Experiment");
    const el = document.querySelector(".experiment") as HTMLElement;

    expect(() => new Experiment({ el })).not.toThrow();
  });

  it("should scale points correctly", async () => {
    // Points spanning from 0 to 0.5 in both dimensions
    const points = [
      [0, 0],
      [0.5, 0.5],
    ];

    document.body.innerHTML = `
      <div class="experiment">
        <svg data-points='${JSON.stringify(points)}'>
          <path></path>
        </svg>
      </div>
    `;

    const { default: Experiment } = await import("../src/scripts/Experiment");
    const el = document.querySelector(".experiment") as HTMLElement;

    new Experiment({ el });

    const path = el.querySelector("path");
    const d = path?.getAttribute("d");

    // The path should contain scaled coordinates
    // scaleFactor = 2 - max(0.5, 0.5) = 1.5
    // 0.5 * 1.5 * 100 = 75
    expect(d).toContain("75");
  });
});
