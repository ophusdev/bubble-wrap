export const COLS = 8;
export const ROWS = 8;
export const TOTAL = COLS * ROWS;

export interface Game {
  pops: number;
  sheetNo: number;
  popped: ReadonlySet<number>;
}

export const freshGame = (): Game => ({ pops: 0, sheetNo: 1, popped: new Set() });

// Returns null when the bubble is already popped.
export function pop(game: Game, bubble: number): Game | null {
  if (game.popped.has(bubble)) return null;
  return { ...game, pops: game.pops + 1, popped: new Set(game.popped).add(bubble) };
}

export const isFinished = (game: Game) => game.popped.size === TOTAL;

export const nextSheet = (game: Game): Game => ({
  ...game,
  sheetNo: game.sheetNo + 1,
  popped: new Set(),
});

export function randomIntact(game: Game, random: () => number): number | null {
  const intact = Array.from({ length: TOTAL }, (_, i) => i).filter((i) => !game.popped.has(i));
  return intact[Math.floor(random() * intact.length)] ?? null;
}
