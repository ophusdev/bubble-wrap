export interface Point {
  x: number;
  y: number;
}

// A fast drag only reports a point every few dozen pixels, enough to jump over
// a bubble, so the stretch between two reports gets walked too.
export function pointsAlong(from: Point, to: Point, step: number): Point[] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const count = Math.max(1, Math.ceil(Math.hypot(dx, dy) / step));
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 1) / count;
    return { x: from.x + dx * t, y: from.y + dy * t };
  });
}
