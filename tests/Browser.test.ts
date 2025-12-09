import { describe, it, expect, beforeEach, vi } from "vitest";
import { vec2 } from "gl-matrix";

describe("Browser", () => {
  beforeEach(() => {
    vi.resetModules();
    // Reset scroll position
    Object.defineProperty(window, "pageXOffset", { value: 0, writable: true });
    Object.defineProperty(window, "pageYOffset", { value: 0, writable: true });
  });

  it("should initialize with current scroll position", async () => {
    Object.defineProperty(window, "pageXOffset", { value: 100 });
    Object.defineProperty(window, "pageYOffset", { value: 200 });

    const { default: Browser } = await import("../src/scripts/utils/Browser");
    Browser.init();

    const position = Browser.getScrollPosition();
    expect(position[0]).toBe(100);
    expect(position[1]).toBe(200);
  });

  it("should add scroll listeners", async () => {
    const { default: Browser } = await import("../src/scripts/utils/Browser");
    Browser.init();

    const callback = vi.fn();
    Browser.addScrollListener(callback);

    // Trigger scroll event
    window.dispatchEvent(new Event("scroll"));

    // Wait for requestAnimationFrame
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(expect.any(Float32Array));
  });

  it("should add resize listeners", async () => {
    const { default: Browser } = await import("../src/scripts/utils/Browser");
    Browser.init();

    const callback = vi.fn();
    Browser.addResizeListener(callback);

    // Trigger resize event
    window.dispatchEvent(new Event("resize"));

    // Wait for requestAnimationFrame
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(callback).toHaveBeenCalled();
  });

  it("should return vec2 for scroll position", async () => {
    const { default: Browser } = await import("../src/scripts/utils/Browser");
    Browser.init();

    const position = Browser.getScrollPosition();
    expect(position).toBeInstanceOf(Float32Array);
    expect(position.length).toBe(2);
  });
});
