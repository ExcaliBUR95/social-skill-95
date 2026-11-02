---
name: instagram-reel-video
description: "Use when the user wants Claude to produce a finished vertical video (Instagram Reels, TikTok, Shorts) end to end: script, voiceover, animation, sound and MP4 render, with no third-party editors or paid voice services. Builds the video as code with Remotion, voices it offline with Piper TTS, and synthesizes all sound effects and ambience. Trigger on phrases like 'make a reel', 'render a video for Instagram', 'animated reel with voiceover', 'video for TikTok/Shorts', and Russian equivalents such as 'сделай рилс', 'сделай видео для инстаграма', 'видео с озвучкой', 'смонтируй ролик', 'анимированный рилс', 'видео для тиктока'. Pairs with the instagram-growth skill, which writes the script."
metadata:
  version: 1.0.0
---

# Instagram Reel Video

You produce a finished 1080×1920 reel as an MP4, entirely yourself: the script, the voice, the animation, the sound design and the render. Nothing is edited in a third-party app and no paid voice or stock-audio service is used. The `template/` folder next to this file is a complete working example (a "campfire" reel: a hooded AI avatar sits with its back to the viewer by a campfire, a frog croaks on the thumbnail and vanishes, bold kinetic text above). Start from it and change the content, not the plumbing.

**Language:** talk to the user in their language. The template's voice and on-screen text are Russian; switch the Piper voice model for other languages.

## Before you build

Ask only what you cannot infer:

1. **Topic and the one action** the viewer should take (comment a keyword, save, follow, visit the profile).
2. **Author handle** for the watermark and credit (the template shows `@el.caramba.dev`; replace it).
3. **Script.** If the user has none, write it with the `instagram-growth` skill's Reels structure, or follow the beat sheet below. Keep it 20–40 seconds spoken.
4. **Brand look** if they have one (colors, font). Otherwise keep the template's dark background, lime `#c6ff3d` highlights and the Unbounded/Manrope fonts.

## Toolchain (all free, official sources only)

| Tool | Get it from | Notes |
|---|---|---|
| Node.js 20+ | nodejs.org | |
| Remotion | `npm i` in the template (npm registry, remotion.dev) | Free for individuals and companies up to 3 people; larger companies need a license — check remotion.dev/license before commercial use |
| Piper TTS | github.com/rhasspy/piper/releases (Windows, macOS, Linux builds) | Unzip into `template/tools/piper/` |
| Piper voice | huggingface.co/rhasspy/piper-voices → `ru/ru_RU/denis/medium/` (`.onnx` + `.onnx.json`) into `tools/piper/voices/` | **Check each voice's MODEL_CARD license.** `denis` is CC0 (safe for commercial reels). `ruslan` is CC BY-NC-SA (non-commercial only) — do not use it for promotional content |
| ffmpeg (optional) | ffmpeg.org (official builds page) | Used to polish the voice (EQ, compression, loudness). Without it the raw voice is used. Remotion's bundled ffmpeg lacks these filters |

Never install unofficial wrappers of undocumented TTS endpoints. If the user asks for a voice service with an API key (ElevenLabs, Azure Speech), that is fine, but it is not needed.

## Pipeline

1. **Copy `template/`** to the user's chosen folder, then `npm i`.
2. **Install Piper and a voice** as in the table. On Windows set `"piper": "tools/piper/piper.exe"` in `scripts/voiceover-campfire.json` (or export `PIPER_EXE`, `PIPER_MODEL`, `FFMPEG` env vars).
3. **Write the voice script** in `scripts/voiceover-campfire.json`: one entry per scene, each split into short phrases (`segments`) with their own `length` (pace: lower is faster, 0.8 is energetic) and `gap` (pause after, seconds). Short phrases with deliberate pauses are what makes a TTS voice sound alive. Spell brand names the way the voice should say them (`"Клод"` for Claude).
4. **Generate audio:** `npm run sfx` (synthesizes whoosh, click, pop, ding, croak, poof, campfire and night-ambience loops into `public/sfx-gen/`), then `npm run voice` (writes `public/voiceover/campfire/*.wav` and `src/voiceover-campfire.json` with per-word timings).
5. **Edit the scenes** in `src/Campfire/Scenes.tsx` and the scene map in `CampfireReel.tsx`. Use `cue(sceneId, word)` to time every reveal, highlight, sound and gesture to the moment the voice says that word. Word timings are estimated from letter counts (Piper gives none), so they are close but not exact.
6. **Preview** with `npm run dev` (Remotion Studio) and keep it open while you work.
7. **Verify before rendering:** render stills of key frames (`npx remotion still CampfireReel f.png --frame=N --scale=0.4`), tile them into one contact sheet with ffmpeg `hstack`, and look at it. Check: frame 0 works as a thumbnail, no text overflows the right edge (long Russian words at 100px+ often do — drop to 84–92px), nothing important sits in the bottom ~250px or the right-edge icon column where Instagram's UI covers it, and key content is inside the center 1080×1350 (the 4:5 profile-grid crop).
8. **Render** `npm run render`, then check loudness with `ffmpeg -i out/reel.mp4 -af volumedetect -f null -`. Aim for max_volume below −1 dB; lower SFX or voice `volume` props if it peaks at 0 dB.
9. Tell the user plainly what you verified and what you could not (you cannot hear the audio — ask them to listen).

## Retention psychology (apply all of these)

- **Thumbnail = frame 0.** The title and the hero (here: the frog at the fire) are fully visible on the first frame; never fade in from black.
- **Pattern interrupt in the first second:** something unexpected moves or sounds (the frog's croak with a camera shake, a slammed "СТОП").
- **Open loop:** promise a count and flag the last item ("3 фишки — третья самая важная"), then pay it off.
- **Progress tracker** ("ФИШКА 1/3 → 3/3"): an unfinished checklist keeps people watching (Zeigarnik effect).
- **Motion every 1–2 seconds:** word-by-word reveals synced to the voice, elastic pops on highlighted words, camera punch-ins on key words, shakes on impacts, the avatar gesturing on every word.
- **Loss aversion** for the "don't do this" point (red ↓, a slumping avatar).
- **Low friction:** show how little effort the result costs (0 → 1 min counter, loading bar to ✓).
- **Proof by demonstration:** "this very video was made by Claude — voice, animation, sound". Keep claims honest: Claude itself is a subscription, so say "без сторонних сервисов и лишних подписок", never "без подписок".
- **One CTA that feeds the algorithm:** "Пиши <слово> в комментариях — пришлю ссылку" (comments + reciprocity) or "сохрани, чтобы не потерять" (saves).
- **Less text, not more:** one idea per scene, 3–7 words of headline, no speech bubbles or text clouds.

## Sound design

All sounds are synthesized by `scripts/generate-sfx.mjs` with a seeded random generator, so they are original and reproducible: no sample licenses to worry about. Ambience (night crickets + wind, campfire crackle) loops under the whole video at low volume (≈0.2–0.3); SFX accent transitions (whoosh), list items (click), highlights (pop) and payoffs (ding). To add a sound, add a synthesis block there rather than downloading one.

## Characters

- **Avatar** (`Avatar` in `Campfire.tsx`): seen from behind, so no lip sync is needed. Poses are joint angles blended between keyframes (`KEYS`) timed with `g(sceneId, word)`; a decaying "speech beat" on every spoken word adds a nod and small arm motion so it looks like it is talking.
- **Frog** (`Frog`): the thumbnail star. Its throat sac follows the two bursts of the synthesized croak (`CROAK_AT`), "КВА!" pops, then it vanishes in a puff (`POOF_AT`) and the narration starts (`FROG_FRAMES` delays the intro voice).

Swap either for another character the same way: SVG shapes plus pose keyframes. Do not recreate copyrighted characters.
