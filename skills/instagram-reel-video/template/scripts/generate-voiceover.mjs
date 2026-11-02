// Generates one voiceover WAV per scene with Piper (offline neural TTS), plus word timings,
// and writes src/voiceover.json for the composition.
// Each scene is synthesized as short phrases with their own pace and pauses, then glued together
// and processed (EQ, compression, loudness) so it sounds like a punchy reel voice.
// Text and settings live in scripts/voiceover-<name>.json.
// Run: node scripts/generate-voiceover.mjs <name>   (e.g. reel, campfire)
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const name = process.argv[2] ?? "reel";
const config = JSON.parse(readFileSync(path.join(root, "scripts", `voiceover-${name}.json`), "utf8"));
const { fps, defaults } = config;
// Tool paths may be absolute, relative to the project root, or a bare command found on PATH.
const tool = (p) => (p.includes("/") || p.includes("\\") ? path.resolve(root, p) : p);
const piper = tool(process.env.PIPER_EXE ?? config.piper);
const model = tool(process.env.PIPER_MODEL ?? config.model);
const ffmpeg = tool(process.env.FFMPEG ?? config.ffmpeg ?? "ffmpeg");
const outDir = path.join(root, "public", config.audioDir);
const tmpDir = path.join(root, ".voiceover-tmp");
rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

// Piper's settings are per process, so phrases are grouped by (length, noise, noiseW).
const jobs = config.scenes.flatMap((scene) =>
  scene.segments.map((seg, i) => ({
    ...defaults,
    ...seg,
    file: path.join(tmpDir, `${scene.id}-${i}.wav`),
  })),
);
const groups = Map.groupBy(jobs, (j) => `${j.length}|${j.noise}|${j.noiseW}`);
for (const group of groups.values()) {
  const { length, noise, noiseW } = group[0];
  const input = group.map((j) => JSON.stringify({ text: j.text, output_file: j.file })).join("\n") + "\n";
  execFileSync(
    piper,
    ["--model", model, "--json-input", "--sentence_silence", "0",
      "--length_scale", String(length), "--noise_scale", String(noise), "--noise_w", String(noiseW)],
    { input, stdio: ["pipe", "ignore", "ignore"] },
  );
}

// Piper writes 16-bit mono PCM WAV with a 44-byte header.
const readWav = (file) => {
  const buf = readFileSync(file);
  return { sampleRate: buf.readUInt32LE(24), pcm: buf.subarray(44) };
};
const wavHeader = (dataLength, sampleRate) => {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + dataLength, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(sampleRate, 24); h.writeUInt32LE(sampleRate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(dataLength, 40);
  return h;
};

const cleanWord = (w) => w.replace(/[^\p{L}\p{N}-]/gu, "");

const result = [];
let jobIndex = 0;
for (const scene of config.scenes) {
  const chunks = [];
  const words = [];
  let sampleRate = 22050;
  let t = 0;
  for (const _ of scene.segments) {
    const job = jobs[jobIndex++];
    const wav = readWav(job.file);
    sampleRate = wav.sampleRate;
    const dur = wav.pcm.length / 2 / sampleRate;

    // Piper gives no word timings: spread the phrase's words over its duration by letter count.
    const tokens = job.text.split(/\s+/).map(cleanWord).filter(Boolean);
    const weights = tokens.map((w) => w.length + 2);
    const total = weights.reduce((a, b) => a + b, 0);
    let acc = 0;
    for (const [i, w] of tokens.entries()) {
      const start = t + 0.03 + (acc / total) * dur * 0.94;
      acc += weights[i];
      const end = t + 0.03 + (acc / total) * dur * 0.94;
      words.push({ text: w, start: Math.round(start * fps), end: Math.round(end * fps) });
    }

    const gap = Buffer.alloc(Math.round(job.gap * sampleRate) * 2);
    chunks.push(wav.pcm, gap);
    t += dur + job.gap;
  }

  const pcm = Buffer.concat(chunks);
  const raw = path.join(tmpDir, `${scene.id}.wav`);
  writeFileSync(raw, Buffer.concat([wavHeader(pcm.length, sampleRate), pcm]));

  // Reel-style voice: cut rumble and mud, add presence, compress, normalize loudness.
  // Without a full ffmpeg build the raw voice is used as is.
  const file = path.join(outDir, `${scene.id}.wav`);
  try {
    execFileSync(ffmpeg, [
      "-v", "error", "-y", "-i", raw,
      "-af", [
        "highpass=f=80",
        "equalizer=f=250:t=q:w=1:g=-2",
        "equalizer=f=3500:t=q:w=1.2:g=3.5",
        "acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2",
        "loudnorm=I=-15:TP=-1.5:LRA=7",
      ].join(","),
      "-ar", "48000", file,
    ]);
  } catch {
    console.warn(`ffmpeg not available or missing filters — using unprocessed voice for ${scene.id}`);
    copyFileSync(raw, file);
  }

  result.push({
    id: scene.id,
    file: `${config.audioDir}/${scene.id}.wav`,
    audioFrames: Math.ceil(t * fps),
    words,
  });
  console.log(`${scene.id}: ${t.toFixed(2)}s, ${words.length} words`);
}
rmSync(tmpDir, { recursive: true, force: true });

writeFileSync(path.join(root, config.json), JSON.stringify(result, null, 2) + "\n");
console.log(`Wrote ${config.json}`);
