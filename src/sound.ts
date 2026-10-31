const POP_FILES = 8;

let pops: AudioBuffer[] = [];

// Created on the first pop: browsers only allow audio after a user gesture.
let audio: AudioContext | null = null;

export async function loadSound() {
  // an offline context because it's fine to create one before any gesture
  const decoder = new OfflineAudioContext(1, 1, 44100);
  const loading = Array.from({ length: POP_FILES }, async (_, i) => {
    const response = await fetch(`${import.meta.env.BASE_URL}pops/pop-${i + 1}.wav`);
    return decoder.decodeAudioData(await response.arrayBuffer());
  });
  // a file that fails to load just leaves fewer pops to pick from
  const results = await Promise.allSettled(loading);
  pops = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
}

export function playPop() {
  audio ??= new AudioContext();
  if (audio.state === "suspended") void audio.resume();
  const buffer = pops[Math.floor(Math.random() * pops.length)];
  if (!buffer) return;
  const source = new AudioBufferSourceNode(audio, {
    buffer,
    playbackRate: 0.92 + Math.random() * 0.16,
  });
  const gain = new GainNode(audio, { gain: 0.7 + Math.random() * 0.3 });
  source.connect(gain).connect(audio.destination);
  source.start();
}

// A touchscreen press doesn't count as a gesture, lifting the finger does.
// Without this the first tap would leave the audio suspended.
export function resumeSound() {
  if (audio?.state === "suspended") void audio.resume();
}
