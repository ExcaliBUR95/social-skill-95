import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BODY, INK, LIME } from "../shared/theme";
import { CampfireStrip, CROAK_AT, flicker, POOF_AT } from "./Campfire";
import {
  AlgoScene,
  CtaScene,
  InstallScene,
  IntroScene,
  MadeByScene,
  QuestionScene,
  Scene01,
  Scene02,
  Scene03,
  Sfx,
} from "./Scenes";
import { g, scene, SCENES } from "./timing";

const SCENE_COMPONENTS: Record<string, React.FC> = {
  intro: IntroScene,
  s01: Scene01,
  s02: Scene02,
  algo: AlgoScene,
  s03: Scene03,
  install: InstallScene,
  madeby: MadeByScene,
  question: QuestionScene,
  cta: CtaScene,
};

// Camera punch-ins land on the key words; shakes land on impacts.
const PUNCHES = [
  g("intro", "ведёт"),
  g("intro", "Инстаграм"),
  g("intro", "третья"),
  g("s01", "секундам"),
  g("s02", "сохранения"),
  g("algo", "алгоритм"),
  g("s03", "охваты"),
  g("install", "Одна"),
  g("madeby", "Клод"),
  g("question", "помощника"),
  g("cta", "Клод"),
];
const SHAKES = [CROAK_AT + 9, g("s03", "режут"), g("install", "Клоде")];

const Camera: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  let zoom = 0;
  for (const p of PUNCHES) {
    zoom += interpolate(frame - p, [0, 3, 16], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  }
  let dx = 0;
  let dy = 0;
  for (const s of SHAKES) {
    const t = frame - s;
    if (t < 0 || t > 18) continue;
    const amp = 12 * Math.exp(-t / 5);
    dx += Math.sin(t * 2.7) * amp;
    dy += Math.cos(t * 3.3) * amp;
  }
  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${1 + zoom * 0.04})`, transformOrigin: "50% 40%" }}>
      {children}
    </AbsoluteFill>
  );
};

// Night sky: brand purple glow on top, twinkling stars, warm firelight from below, vignette.
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const f = flicker(frame);
  const px = 32 + Math.sin(frame / 90) * 6;
  const py = 22 + Math.cos(frame / 110) * 4;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: INK,
        backgroundImage: [
          `radial-gradient(circle 620px at ${px}% ${py}%, rgba(80,32,190,0.5), transparent)`,
          `radial-gradient(ellipse 900px 700px at 59% 82%, rgba(255,110,40,${0.22 * f}), transparent)`,
        ].join(", "),
      }}
    >
      {new Array(46).fill(0).map((_, i) => {
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / (20 + random(`t${i}`) * 30) + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: random(`x${i}`) * 1080,
              top: random(`y${i}`) * 1150,
              width: 2 + random(`s${i}`) * 3,
              height: 2 + random(`s${i}`) * 3,
              borderRadius: 3,
              backgroundColor: "white",
              opacity: tw * 0.55,
            }}
          />
        );
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 65% at 50% 45%, transparent 55%, rgba(0,0,0,0.55))" }} />
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(frame / (durationInFrames - 1)) * 100}%`, backgroundColor: LIME }} />
  );
};

// "ФИШКА 1/3" tracker: an unfinished checklist keeps people watching.
const TRACK_STEPS = [scene("s01").from, scene("s02").from, scene("s03").from];
const TRACK_END = scene("install").from;

const Tracker: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = TRACK_STEPS[0];
  if (frame < start - 2 || frame > TRACK_END) return null;
  const appear = spring({ frame: frame - start, fps, config: { damping: 200 }, durationInFrames: 10 });
  const out = interpolate(frame, [TRACK_END - 8, TRACK_END], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const current = TRACK_STEPS.filter((s) => frame >= s).length;
  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        top: 170,
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity: appear * out,
        fontFamily: BODY,
        fontWeight: 800,
        fontSize: 30,
        letterSpacing: 2,
        color: "rgba(255,255,255,0.8)",
      }}
    >
      ФИШКА {current}/3
      {TRACK_STEPS.map((s) => {
        const fill = spring({ frame: frame - s, fps, config: { damping: 200 }, durationInFrames: 12 });
        return (
          <div key={s} style={{ width: 70, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
            <div style={{ width: `${fill * 100}%`, height: "100%", backgroundColor: LIME }} />
          </div>
        );
      })}
    </div>
  );
};

const AuthorMark: React.FC = () => (
  <div
    style={{
      position: "absolute",
      right: 80,
      top: 96,
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontFamily: BODY,
      fontWeight: 700,
      fontSize: 30,
      color: "rgba(255,255,255,0.75)",
    }}
  >
    <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: LIME }} />
    @el.caramba.dev
  </div>
);

export const CampfireReel: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Camera>
        {SCENES.map((s) => {
          const Scene = SCENE_COMPONENTS[s.id];
          return (
            <Sequence key={s.id} name={s.id} from={s.from} durationInFrames={s.durationInFrames}>
              <Scene />
            </Sequence>
          );
        })}
        <CampfireStrip />
      </Camera>
      <Tracker />
      <AuthorMark />
      <ProgressBar />

      {/* Ambience runs under everything; all of it is synthesized by scripts/generate-sfx.mjs */}
      <Audio src={staticFile("sfx-gen/night-loop.wav")} loop volume={0.22} />
      <Audio src={staticFile("sfx-gen/campfire-loop.wav")} loop volume={0.32} />
      <Sfx name="croak" at={CROAK_AT} volume={0.7} />
      <Sfx name="poof" at={POOF_AT} volume={0.6} />
      {SCENES.map((s) => (
        <Audio key={s.id} from={s.from + s.delay} src={staticFile(s.file)} volume={0.8} />
      ))}
      {SCENES.slice(1).map((s) => (
        <Sfx key={`whoosh-${s.id}`} name="whoosh" at={s.from - 4} volume={0.3} />
      ))}
    </AbsoluteFill>
  );
};
