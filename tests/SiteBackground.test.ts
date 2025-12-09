import { describe, it, expect, beforeEach, vi } from "vitest";

describe("SiteBackground", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = "";
  });

  it("should not throw when SVG element is not found", async () => {
    const { default: SiteBackground } = await import(
      "../src/scripts/SiteBackground"
    );

    expect(() => new SiteBackground()).not.toThrow();
  });

  it("should create grid and shapes when SVG element exists", async () => {
    document.body.innerHTML = `
      <svg class="site__background" viewBox="0 0 100 100"></svg>
    `;

    const { default: SiteBackground } = await import(
      "../src/scripts/SiteBackground"
    );

    new SiteBackground();

    const svg = document.querySelector(".site__background");
    expect(svg).not.toBeNull();

    // Check that grid was created
    const gridGroup = svg?.querySelector(".site__background-grid");
    expect(gridGroup).not.toBeNull();

    // Check that shapes were created
    const shapesGroup = svg?.querySelector(".site__background-shapes");
    expect(shapesGroup).not.toBeNull();
  });

  it("should create grid lines", async () => {
    document.body.innerHTML = `
      <svg class="site__background" viewBox="0 0 100 100"></svg>
    `;

    const { default: SiteBackground } = await import(
      "../src/scripts/SiteBackground"
    );

    new SiteBackground();

    const svg = document.querySelector(".site__background");
    const lines = svg?.querySelectorAll(".site__background-grid line");

    // Should have lines for both horizontal and vertical directions
    // 20 grid lines + 1 = 21 lines per direction, 2 directions = 42 lines
    expect(lines?.length).toBe(42);
  });

  it("should create shape wrappers with polygons", async () => {
    document.body.innerHTML = `
      <svg class="site__background" viewBox="0 0 100 100"></svg>
    `;

    const { default: SiteBackground } = await import(
      "../src/scripts/SiteBackground"
    );

    new SiteBackground();

    const svg = document.querySelector(".site__background");
    const shapeWrappers = svg?.querySelectorAll(
      ".site__background-shape-wrapper"
    );
    const polygons = svg?.querySelectorAll(
      ".site__background-shape-wrapper polygon"
    );

    // Should have created some shapes (70% of total spots)
    expect(shapeWrappers?.length).toBeGreaterThan(0);
    expect(polygons?.length).toBeGreaterThan(0);
    expect(shapeWrappers?.length).toBe(polygons?.length);
  });

  it("should set animation properties on polygons", async () => {
    document.body.innerHTML = `
      <svg class="site__background" viewBox="0 0 100 100"></svg>
    `;

    const { default: SiteBackground } = await import(
      "../src/scripts/SiteBackground"
    );

    new SiteBackground();

    const svg = document.querySelector(".site__background");
    const polygon = svg?.querySelector(
      ".site__background-shape-wrapper polygon"
    ) as SVGPolygonElement;

    expect(polygon).not.toBeNull();
    expect(polygon?.style.animationDuration).toMatch(/^\d+s$/);
    expect(["alternate", "alternate-reverse"]).toContain(
      polygon?.style.animationDirection
    );
  });
});
