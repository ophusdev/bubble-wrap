import { describe, expect, it } from "vitest";
import { pointsAlong } from "./drag";

describe("pointsAlong", () => {
  it("walks the line in steps, ending on the target", () => {
    expect(pointsAlong({ x: 0, y: 0 }, { x: 30, y: 0 }, 10)).toEqual([
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 30, y: 0 },
    ]);
  });

  it("never steps further than asked", () => {
    const points = pointsAlong({ x: 0, y: 0 }, { x: 25, y: 0 }, 10);
    expect(points).toHaveLength(3);
    expect(points.at(-1)).toEqual({ x: 25, y: 0 });
  });

  it("follows diagonals", () => {
    expect(pointsAlong({ x: 0, y: 0 }, { x: 30, y: 40 }, 25)).toEqual([
      { x: 15, y: 20 },
      { x: 30, y: 40 },
    ]);
  });

  it("still checks the target on a short move", () => {
    expect(pointsAlong({ x: 5, y: 5 }, { x: 6, y: 5 }, 10)).toEqual([{ x: 6, y: 5 }]);
  });

  it("copes with no movement", () => {
    expect(pointsAlong({ x: 5, y: 5 }, { x: 5, y: 5 }, 10)).toEqual([{ x: 5, y: 5 }]);
  });
});
