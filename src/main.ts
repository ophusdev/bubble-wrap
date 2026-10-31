import { COLS, freshGame, isFinished, nextSheet, pop, ROWS, randomIntact, TOTAL } from "./game";
import { loadSound, playPop, resumeSound } from "./sound";

const NEW_SHEET_DELAY_MS = 600;

const SLIDE_IN: Keyframe[] = [
  { opacity: 0, transform: "translateY(30px)" },
  { opacity: 1, transform: "translateY(0)" },
];

function required<T>(value: T | null, what: string): T {
  if (value === null) throw new Error(`Missing ${what}`);
  return value;
}

const element = (id: string) => required(document.getElementById(id), `#${id}`);

const ui = {
  pops: element("pops"),
  sheetNo: element("sheet-no"),
  sheet: element("sheet"),
  mute: element("mute"),
  muteLabel: element("mute-label"),
  reset: element("reset"),
  resetDialog: required(document.querySelector("dialog"), "dialog"),
  confirmReset: element("confirm-reset"),
};

const count = new Intl.NumberFormat("en");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let game = freshGame();
let muted = false;
let pendingSheet = 0;

const bubbles = Array.from({ length: TOTAL }, (_, i) => {
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.addEventListener("pointerdown", (e) => {
    if (e.button === 0) popBubble(i);
  });
  return bubble;
});

function buildSheet() {
  for (let r = 0; r < ROWS; r++) {
    const row = document.createElement("div");
    row.className = "row";
    row.append(...bubbles.slice(r * COLS, (r + 1) * COLS));
    ui.sheet.append(row);
  }
}

function showCounters() {
  ui.pops.textContent = count.format(game.pops);
  ui.sheetNo.textContent = count.format(game.sheetNo);
  document.title = `${count.format(game.pops)} popped · Bubble Wrap`;
}

function showFreshSheet() {
  for (const bubble of bubbles) bubble.classList.remove("popped");
  if (!reducedMotion.matches) ui.sheet.animate(SLIDE_IN, { duration: 350, easing: "ease-out" });
  showCounters();
}

function dealNextSheet() {
  game = nextSheet(game);
  showFreshSheet();
}

function resetStats() {
  window.clearTimeout(pendingSheet);
  game = freshGame();
  showFreshSheet();
}

function popBubble(i: number) {
  const popped = pop(game, i);
  if (!popped) return;
  game = popped;
  bubbles[i]?.classList.add("popped");
  if (!muted) playPop();
  showCounters();
  if (isFinished(game)) pendingSheet = window.setTimeout(dealNextSheet, NEW_SHEET_DELAY_MS);
}

// Space always pops, even with focus on a button: closing the dialog puts focus
// back on Reset, and Space must not open it again. Inside the dialog it's left
// to the dialog's buttons.
const isPopKey = (e: KeyboardEvent) => e.code === "Space" && !ui.resetDialog.open;

window.addEventListener("keydown", (e) => {
  if (!isPopKey(e)) return;
  e.preventDefault();
  if (e.repeat) return;
  const bubble = randomIntact(game, Math.random);
  if (bubble !== null) popBubble(bubble);
});

// buttons fire on keyup for Space
window.addEventListener("keyup", (e) => {
  if (isPopKey(e)) e.preventDefault();
});

window.addEventListener("pointerup", resumeSound);

ui.mute.addEventListener("click", () => {
  muted = !muted;
  ui.mute.dataset.muted = String(muted);
  ui.muteLabel.textContent = muted ? "Sound off" : "Sound on";
});

ui.reset.addEventListener("click", () => ui.resetDialog.showModal());

ui.resetDialog.addEventListener("submit", (e) => {
  if (e.submitter === ui.confirmReset) resetStats();
});

document.documentElement.style.setProperty("--cols", String(COLS));
document.documentElement.style.setProperty("--rows", String(ROWS));
buildSheet();
showCounters();
void loadSound();
