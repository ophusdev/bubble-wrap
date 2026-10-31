import { describe, expect, it } from "vitest";
import { freshGame, type Game, isFinished, nextSheet, pop, randomIntact, TOTAL } from "./game";

const always = (value: number) => () => value;

const allPopped = (): Game => ({
  ...freshGame(),
  pops: TOTAL,
  popped: new Set(Array.from({ length: TOTAL }, (_, i) => i)),
});

describe("pop", () => {
  it("pops an intact bubble and counts it", () => {
    const game = pop(freshGame(), 3);
    expect(game?.pops).toBe(1);
    expect(game?.popped.has(3)).toBe(true);
  });

  it("ignores a bubble that is already popped", () => {
    const game = pop(freshGame(), 3);
    if (!game) throw new Error("first pop was ignored");
    expect(pop(game, 3)).toBeNull();
  });

  it("leaves the previous state alone", () => {
    const before = freshGame();
    pop(before, 3);
    expect(before).toEqual(freshGame());
  });
});

describe("isFinished", () => {
  it("waits for the last bubble", () => {
    const almost = allPopped();
    expect(isFinished(almost)).toBe(true);
    const popped = new Set(almost.popped);
    popped.delete(0);
    expect(isFinished({ ...almost, popped })).toBe(false);
  });
});

describe("nextSheet", () => {
  it("brings the bubbles back and keeps the count", () => {
    expect(nextSheet(allPopped())).toEqual({ pops: TOTAL, sheetNo: 2, popped: new Set() });
  });
});

describe("randomIntact", () => {
  it("can pick every intact bubble, first to last", () => {
    const game = { ...freshGame(), popped: new Set([0, TOTAL - 1]) };
    expect(randomIntact(game, always(0))).toBe(1);
    expect(randomIntact(game, always(0.999_999))).toBe(TOTAL - 2);
  });

  it("has nothing to pick on a finished sheet", () => {
    expect(randomIntact(allPopped(), Math.random)).toBeNull();
  });
});
