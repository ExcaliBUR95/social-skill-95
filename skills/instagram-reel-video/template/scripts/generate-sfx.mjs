// Synthesizes every sound effect and ambience from scratch (no samples):
// whoosh, click, pop, ding, frog croak, poof, campfire loop, night ambience loop.
// Writes 16-bit mono WAVs to public/sfx-gen/. Run: node scripts/generate-sfx.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const SR = 44100;
const outDir = path.resolve(import.meta.dirname, "..", "public", "sfx-gen");
mkdirSync(outDir, { recursive: true });

// Deterministic PRNG so every run produces identical files.
let seed = 1234567;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rand() * 2 - 1;

const writeWav = (name, samples, peak = 0.9) => {
  let max = 0;
  for (const s of samples) max = Math.max(max, Math.abs(s));
  const gain = max > 0 ? peak / max : 1;
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s * gain)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(data.length, 40);
  writeFileSync(path.join(outDir, `${name}.wav`), Buffer.concat([h, data]));
  console.log(`${name}.wav  ${(samples.length / SR).toFixed(2)}s`);
};

const buffer = (seconds) => new Float32Array(Math.round(seconds * SR));

// State-variable filter; returns a per-sample function (input, cutoffHz, q) → {low, band, high}.
const svf = () => {
  let low = 0;
  let band = 0;
  return (x, fc, q = 0.7) => {
    const f = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6)) / SR);
    low += f * band;
    const high = x - low - band / q;
    band += f * high;
    return { low, band, high };
  };
};

// Whoosh: band-passed noise sweeping up then down.
{
  const out = buffer(0.55);
  const filt = svf();
  for (let i = 0; i < out.length; i++) {
    const t = i / out.length;
    const env = Math.sin(Math.PI * t) ** 2;
    const fc = 400 + 2600 * Math.sin(Math.PI * Math.min(1, t * 1.2));
    out[i] = filt(noise(), fc, 1.2).band * env;
  }
  writeWav("whoosh", out, 0.8);
}

// Click: tiny noise tick plus a short tonal blip.
{
  const out = buffer(0.06);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] = noise() * Math.exp(-t / 0.002) * 0.6 + Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-t / 0.008);
  }
  writeWav("click", out, 0.7);
}

// Pop: sine with a fast downward pitch glide.
{
  const out = buffer(0.14);
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    phase += (2 * Math.PI * (300 + 700 * Math.exp(-t / 0.02))) / SR;
    out[i] = Math.sin(phase) * Math.exp(-t / 0.04) * Math.min(1, t / 0.002);
  }
  writeWav("pop", out, 0.8);
}

// Ding: bell-like inharmonic partials with long decay.
{
  const out = buffer(1.3);
  const partials = [[1320, 1, 0.5], [1320 * 2.76, 0.45, 0.25], [1320 * 5.4, 0.25, 0.12]];
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    let s = 0;
    for (const [f, a, d] of partials) s += a * Math.sin(2 * Math.PI * f * t) * Math.exp(-t / d);
    out[i] = s * Math.min(1, t / 0.003);
  }
  writeWav("ding", out, 0.7);
}

// Frog croak "ква-а": a low pulse train (glottal ~32 Hz) exciting two formants, in two bursts.
const croak = (seconds, bursts) => {
  const out = buffer(seconds);
  const f1 = svf();
  const f2 = svf();
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const burst = bursts.find(([s, d]) => t >= s && t < s + d);
    let src = 0;
    if (burst) {
      const local = (t - burst[0]) / burst[1];
      const rate = 34 - 8 * local;
      phase += rate / SR;
      if (phase >= 1) phase -= 1;
      // Each glottal pulse is a short decaying click.
      src = Math.exp(-phase / 0.12) * (0.8 + 0.2 * noise()) * Math.sin(Math.PI * Math.min(1, local * 6)) * (1 - local * 0.5);
    }
    const a = f1(src, 420, 6).band;
    const b = f2(src, 1150, 5).band;
    out[i] = a + 0.6 * b;
  }
  return out;
};
writeWav("croak", croak(0.75, [[0.02, 0.2], [0.3, 0.38]]), 0.9);

// Poof: dark noise puff with a falling filter, plus a few sparkly chimes.
{
  const out = buffer(0.7);
  const filt = svf();
  const sparkles = [0.08, 0.15, 0.22, 0.3].map((s) => [s, 2500 + rand() * 2500]);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.01) * Math.exp(-t / 0.18);
    let s = filt(noise(), 3000 * Math.exp(-t / 0.15) + 250, 0.8).low * env;
    for (const [st, f] of sparkles) {
      if (t >= st) s += 0.12 * Math.sin(2 * Math.PI * f * (t - st)) * Math.exp(-(t - st) / 0.05);
    }
    out[i] = s;
  }
  writeWav("poof", out, 0.8);
}

// Campfire loop: soft roar + hiss + random crackles and occasional bigger pops.
{
  const seconds = 20;
  const out = buffer(seconds);
  const roar = svf();
  const hiss = svf();
  let brown = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    brown = brown * 0.995 + noise() * 0.05;
    const flicker = 0.75 + 0.25 * Math.sin(2 * Math.PI * 0.31 * t) * Math.sin(2 * Math.PI * 0.53 * t + 1);
    out[i] = roar(brown, 180, 0.6).low * 2.2 * flicker + hiss(noise(), 5000, 0.7).band * 0.035 * flicker;
  }
  const addCrackle = (start, amp, decay, tone) => {
    const n = Math.round(decay * 8 * SR);
    const filt = svf();
    for (let k = 0; k < n && start + k < out.length; k++) {
      const env = Math.exp(-k / (decay * SR));
      out[start + k] += filt(noise(), tone, 2.5).band * env * amp;
    }
  };
  let t = 0;
  while (t < seconds - 0.2) {
    t += -Math.log(1 - rand()) / 9; // ~9 crackles per second
    addCrackle(Math.round(t * SR), 0.25 + rand() * 0.6, 0.0015 + rand() * 0.004, 1500 + rand() * 4000);
    if (rand() < 0.1) addCrackle(Math.round(t * SR), 1.2 + rand(), 0.006 + rand() * 0.008, 900 + rand() * 1500);
  }
  // Crossfade the tail into the head so the loop has no seam.
  const fade = Math.round(0.5 * SR);
  for (let k = 0; k < fade; k++) {
    const w = k / fade;
    out[k] = out[k] * w + out[out.length - fade + k] * (1 - w);
  }
  writeWav("campfire-loop", out.subarray(0, out.length - fade), 0.85);
}

// Night ambience loop: three crickets, slow wind, and a couple of distant frogs.
{
  const seconds = 20;
  const out = buffer(seconds);
  const wind = svf();
  let brown = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    brown = brown * 0.998 + noise() * 0.03;
    const gust = 0.55 + 0.45 * Math.sin(2 * Math.PI * 0.07 * t) * Math.sin(2 * Math.PI * 0.11 * t + 2);
    out[i] = wind(brown, 420 + 260 * gust, 0.7).low * 1.4 * gust;
  }
  const crickets = [[4300, 0.62, 0.0], [4750, 0.81, 0.27], [5150, 0.97, 0.55]];
  for (const [freq, period, offset] of crickets) {
    for (let c = offset; c < seconds - 0.2; c += period * (0.9 + rand() * 0.2)) {
      for (let p = 0; p < 4; p++) {
        const start = Math.round((c + p * 0.028) * SR);
        const n = Math.round(0.016 * SR);
        for (let k = 0; k < n && start + k < out.length; k++) {
          out[start + k] += 0.05 * Math.sin((2 * Math.PI * freq * k) / SR) * Math.sin((Math.PI * k) / n);
        }
      }
    }
  }
  for (const at of [3.2, 11.7]) {
    const c = croak(0.75, [[0.02, 0.16], [0.24, 0.22]]);
    const start = Math.round(at * SR);
    for (let k = 0; k < c.length; k++) out[start + k] += c[k] * 0.06;
  }
  const fade = Math.round(0.5 * SR);
  for (let k = 0; k < fade; k++) {
    const w = k / fade;
    out[k] = out[k] * w + out[out.length - fade + k] * (1 - w);
  }
  writeWav("night-loop", out.subarray(0, out.length - fade), 0.8);
}
