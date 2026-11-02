import voiceover from "../voiceover-campfire.json";

// The intro's title is on screen from frame 0 (it is the thumbnail); its voice waits
// until the frog has croaked and vanished. Other scenes start talking right after their entrance.
export const FROG_FRAMES = 46;
const DELAY: Record<string, number> = { intro: FROG_FRAMES };
const DEFAULT_DELAY = 8;
const TAIL = 10;

let offset = 0;
export const SCENES = voiceover.map((vo) => {
  const delay = DELAY[vo.id] ?? DEFAULT_DELAY;
  const durationInFrames = vo.audioFrames + delay + TAIL;
  const s = { ...vo, delay, from: offset, durationInFrames };
  offset += durationInFrames;
  return s;
});

export const TOTAL_FRAMES = offset;

export const scene = (id: string) => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};

// Scene-local frame at which the voice says `word` (nth occurrence, case-insensitive).
export const cue = (id: string, word: string, nth = 0): number => {
  const s = scene(id);
  const matches = s.words.filter((w) => w.text.toLowerCase() === word.toLowerCase());
  if (!matches[nth]) throw new Error(`Word "${word}" not found in scene ${id}`);
  return matches[nth].start + s.delay;
};

// Global frame at which the voice says `word` in scene `id`.
export const g = (id: string, word: string, nth = 0) => scene(id).from + cue(id, word, nth);

// Global frames of every spoken word, used to make the avatar move with the voice.
export const WORD_STARTS = SCENES.flatMap((s) => s.words.map((w) => s.from + s.delay + w.start));
