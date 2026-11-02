import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DISPLAY, LIME } from "../shared/theme";
import { FROG_FRAMES, g, scene, WORD_STARTS } from "./timing";

// The campfire strip occupies the bottom of the frame; all coordinates below are in
// this SVG's own space (1080 × 760), placed at y = 1160 of the 1080 × 1920 video.
export const STRIP_TOP = 1160;
const FIRE_X = 640;
const FIRE_BASE = 400;

export const CROAK_AT = 10;
export const POOF_AT = 34;

// Fire brightness wobble shared by flames, glow and the light on the avatar and frog.
export const flicker = (frame: number) =>
  0.82 + 0.1 * Math.sin(frame / 3.1) + 0.08 * Math.sin(frame / 1.7 + 1.3);

const flame = (cx: number, base: number, w: number, h: number, frame: number, s: number) => {
  const sway = Math.sin(frame / 4 + s) * w * 0.25 + Math.sin(frame / 1.6 + s * 2) * w * 0.1;
  const hh = h * (0.88 + 0.1 * Math.sin(frame / 2.5 + s) + 0.06 * Math.sin(frame / 0.9 + s * 3));
  const tipX = cx + sway;
  return [
    `M${cx - w / 2},${base}`,
    `C${cx - w / 2},${base - hh * 0.45} ${cx + sway * 0.3 - w * 0.18},${base - hh * 0.72} ${tipX},${base - hh}`,
    `C${cx + sway * 0.3 + w * 0.18},${base - hh * 0.72} ${cx + w / 2},${base - hh * 0.45} ${cx + w / 2},${base}`,
    `Q${cx},${base + w * 0.22} ${cx - w / 2},${base}Z`,
  ].join(" ");
};

const Fire: React.FC = () => {
  const frame = useCurrentFrame();
  const f = flicker(frame);
  const layers: { color: string; tongues: [number, number, number][] }[] = [
    { color: "#ff4a1c", tongues: [[-46, 120, 210], [0, 150, 280], [44, 115, 200]] },
    { color: "#ff8a1f", tongues: [[-28, 95, 170], [6, 115, 220], [32, 85, 150]] },
    { color: "#ffd34d", tongues: [[-10, 70, 120], [12, 64, 105]] },
  ];
  return (
    <g>
      {/* Stones and logs */}
      {[-150, -95, -35, 35, 95, 150].map((dx, i) => (
        <ellipse key={dx} cx={FIRE_X + dx} cy={FIRE_BASE + 18 + Math.abs(dx) * -0.06} rx={34} ry={20} fill={i % 2 ? "#2a2526" : "#332c2b"} />
      ))}
      <rect x={FIRE_X - 120} y={FIRE_BASE - 12} width={240} height={30} rx={15} fill="#3b2414" transform={`rotate(12 ${FIRE_X} ${FIRE_BASE})`} />
      <rect x={FIRE_X - 120} y={FIRE_BASE - 12} width={240} height={30} rx={15} fill="#4a2c17" transform={`rotate(-14 ${FIRE_X} ${FIRE_BASE})`} />
      <ellipse cx={FIRE_X} cy={FIRE_BASE} rx={70} ry={18} fill="#ff7a1f" opacity={0.55 * f} />

      <g filter="url(#fireSoft)">
        {layers.map((layer, li) =>
          layer.tongues.map(([dx, w, h], ti) => (
            <path
              key={`${li}-${ti}`}
              d={flame(FIRE_X + dx, FIRE_BASE, w, h * f, frame, li * 3 + ti * 1.7)}
              fill={layer.color}
              opacity={0.92}
            />
          )),
        )}
      </g>

      {/* Embers drifting up */}
      {new Array(18).fill(0).map((_, i) => {
        const life = 46 + random(`life${i}`) * 30;
        const age = (frame + random(`off${i}`) * life) % life;
        const x = FIRE_X + (random(`x${i}`) - 0.5) * 90 + Math.sin(age / 7 + i) * 22;
        const y = FIRE_BASE - 120 - age * (3.5 + random(`v${i}`) * 2.5);
        return (
          <circle key={i} cx={x} cy={y} r={2.5 + random(`r${i}`) * 3} fill="#ffb347" opacity={(1 - age / life) * 0.9} />
        );
      })}
    </g>
  );
};

// ---------- Avatar: a hooded figure seen from behind, sitting on a log ----------

type Pose = {
  lU: number; lF: number; rU: number; rF: number;
  turn: number; tilt: number; slump: number; wave: number; shake: number;
};

const REST: Pose = { lU: -12, lF: -8, rU: 12, rF: 8, turn: 0, tilt: 0, slump: 0, wave: 0, shake: 0 };

const POSES = {
  rest: {},
  lookFrog: { turn: 14, tilt: 8 },
  flinch: { slump: -8, turn: 6, lU: -40, lF: -70, rU: 40, rF: 70 },
  point: { rU: 166, rF: -172, tilt: -4 },
  three: { rU: 172, rF: 178 },
  open: { lU: -62, lF: -128, rU: 62, rF: 128 },
  think: { rU: 140, rF: -70, tilt: 8 },
  punch: { rU: 176, rF: 179, slump: -4 },
  ready: { rU: 70, rF: 20 },
  no: { shake: 1, tilt: 4 },
  sad: { slump: 10, tilt: 14 },
  cheer: { lU: -150, lF: -168, rU: 150, rF: 168, slump: -10 },
  lookBack: { turn: 22, tilt: -6 },
  wave: { rU: 150, rF: 170, wave: 1, turn: 18 },
} satisfies Record<string, Partial<Pose>>;

type Key = { at: number; pose: keyof typeof POSES; dur?: number };

const KEYS: Key[] = [
  { at: 0, pose: "rest" },
  { at: CROAK_AT + 2, pose: "lookFrog", dur: 6 },
  { at: POOF_AT, pose: "flinch", dur: 4 },
  { at: POOF_AT + 8, pose: "rest", dur: 8 },

  { at: g("intro", "Клод"), pose: "point" },
  { at: g("intro", "Три"), pose: "three", dur: 6 },
  { at: g("intro", "третья"), pose: "point" },
  { at: g("intro", "важная") + 10, pose: "open" },

  { at: g("s01", "Первое"), pose: "point" },
  { at: g("s01", "Где") - 4, pose: "open" },
  { at: g("s01", "призыв"), pose: "punch", dur: 6 },
  { at: g("s01", "призыв") + 12, pose: "rest" },

  { at: g("s02", "Второе"), pose: "point" },
  { at: g("s02", "лайки") - 6, pose: "no", dur: 6 },
  { at: g("s02", "лайки") + 16, pose: "rest" },

  { at: scene("algo").from, pose: "think" },
  { at: g("algo", "алгоритм"), pose: "point", dur: 6 },
  { at: g("algo", "Досмотры") - 8, pose: "ready" },
  { at: g("algo", "Досмотры"), pose: "punch", dur: 5 },
  { at: g("algo", "Досмотры") + 12, pose: "ready" },
  { at: g("algo", "Репосты"), pose: "punch", dur: 5 },
  { at: g("algo", "Репосты") + 12, pose: "ready" },
  { at: g("algo", "Сохранения"), pose: "punch", dur: 5 },
  { at: g("algo", "Сохранения") + 14, pose: "rest" },

  { at: g("s03", "третье"), pose: "point" },
  { at: g("s03", "Без"), pose: "no", dur: 6 },
  { at: g("s03", "режут"), pose: "sad", dur: 10 },

  { at: scene("install").from, pose: "rest" },
  { at: g("install", "Одна"), pose: "point" },
  { at: g("install", "Клоде"), pose: "cheer", dur: 7 },
  { at: g("install", "Клоде") + 16, pose: "rest" },

  { at: g("madeby", "сделал"), pose: "point" },
  { at: g("madeby", "Озвучку"), pose: "punch", dur: 5 },
  { at: g("madeby", "Озвучку") + 10, pose: "ready" },
  { at: g("madeby", "Анимацию"), pose: "punch", dur: 5 },
  { at: g("madeby", "Анимацию") + 10, pose: "ready" },
  { at: g("madeby", "звук"), pose: "punch", dur: 5 },
  { at: g("madeby", "Без"), pose: "open" },

  { at: scene("question").from, pose: "lookBack", dur: 12 },
  { at: g("cta", "Пиши"), pose: "point" },
  { at: g("cta", "инструкцию") + 6, pose: "wave" },
];

const full = (name: keyof typeof POSES): Pose => ({ ...REST, ...POSES[name] });

const poseAt = (frame: number): Pose => {
  let p = full(KEYS[0].pose);
  for (const key of KEYS.slice(1)) {
    if (frame < key.at) break;
    const t = interpolate(frame, [key.at, key.at + (key.dur ?? 10)], [0, 1], {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const target = full(key.pose);
    const next = { ...p };
    for (const k of Object.keys(p) as (keyof Pose)[]) next[k] = p[k] + (target[k] - p[k]) * t;
    p = next;
  }
  return p;
};

const speechBeat = (frame: number) => {
  let beat = 0;
  for (const s of WORD_STARTS) {
    if (s > frame) break;
    beat = Math.max(beat, Math.exp(-(frame - s) / 4));
  }
  return beat;
};

const seg = (x: number, y: number, len: number, deg: number): [number, number] => {
  const r = (deg * Math.PI) / 180;
  return [x + len * Math.sin(r), y + len * Math.cos(r)];
};

const Avatar: React.FC = () => {
  const frame = useCurrentFrame();
  const p = poseAt(frame);
  const beat = speechBeat(frame);
  const f = flicker(frame);
  const breathe = Math.sin(frame / 16) * 2;
  const wave = Math.sin(frame / 3.2) * 22 * p.wave;
  const shake = Math.sin(frame / 2.2) * 8 * p.shake;

  const lSh: [number, number] = [104, 212];
  const rSh: [number, number] = [226, 212];
  const lEl = seg(...lSh, 82, p.lU);
  const lHand = seg(...lEl, 76, p.lF + beat * 8);
  const rEl = seg(...rSh, 82, p.rU);
  const rHand = seg(...rEl, 76, p.rF + wave - beat * 8);
  const arm = (a: [number, number], b: [number, number], c: [number, number]) => `M${a[0]},${a[1]} L${b[0]},${b[1]} L${c[0]},${c[1]}`;

  const headAngle = p.tilt + shake + beat * 3;

  return (
    <g transform={`translate(120 ${80 + p.slump - breathe})`}>
      {/* Arms are drawn behind the body, so lowered arms stay hidden in front of the figure */}
      <g stroke="#1d1d27" strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={arm(lSh, lEl, lHand)} />
        <path d={arm(rSh, rEl, rHand)} />
      </g>
      <circle cx={lHand[0]} cy={lHand[1]} r={17} fill="#22222d" />
      <circle cx={rHand[0]} cy={rHand[1]} r={17} fill="#22222d" />
      <circle cx={rHand[0] + 6} cy={rHand[1]} r={17} fill="#ff8a3d" opacity={0.18 * f} />

      <rect x={-20} y={392 + breathe} width={380} height={46} rx={23} fill="#2e1c10" />
      <rect x={-20} y={392 + breathe} width={380} height={10} rx={5} fill="#ff8a3d" opacity={0.18 * f} />
      <path d="M58,410 C46,300 60,226 98,202 C128,186 202,186 232,202 C270,226 284,300 272,410 Z" fill="url(#avatarBody)" />
      <path d="M58,410 C46,300 60,226 98,202 C128,186 202,186 232,202 C270,226 284,300 272,410 Z" fill="url(#avatarRim)" opacity={f} />

      <g transform={`rotate(${headAngle} 165 190) translate(${p.turn} 0)`}>
        <path d="M100,176 C90,98 122,46 165,46 C212,46 242,98 230,176 C210,192 120,192 100,176 Z" fill="url(#avatarBody)" />
        <path d="M100,176 C90,98 122,46 165,46 C212,46 242,98 230,176 C210,192 120,192 100,176 Z" fill="url(#avatarRim)" opacity={f} />
        {/* AI detail: a lime seam along the hood and a soft status light */}
        <path d="M165,50 C150,90 150,140 165,184" stroke={LIME} strokeWidth={3} fill="none" opacity={0.45} />
        <circle cx={165} cy={120} r={5} fill={LIME} opacity={0.35 + 0.35 * Math.sin(frame / 9)} />
      </g>
    </g>
  );
};

// ---------- Frog: the thumbnail star; croaks once and vanishes in a puff ----------

const Frog: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame > POOF_AT + 24) return null;
  const f = flicker(frame);

  // Throat sac follows the two croak bursts in the synthesized sound.
  const bump = (start: number, len: number) =>
    interpolate(frame, [start, start + len * 0.35, start + len], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sac = Math.max(bump(CROAK_AT, 7), bump(CROAK_AT + 9, 12));
  const kva = spring({ frame: frame - (CROAK_AT + 6), fps, config: { damping: 9 } });
  const gone = spring({ frame: frame - POOF_AT, fps, config: { damping: 200 }, durationInFrames: 8 });
  const scale = 1 - gone;
  const blink = frame % 70 > 66 ? 0.1 : 1;
  const puff = interpolate(frame, [POOF_AT, POOF_AT + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <g transform="translate(735 205) scale(1.25)">
      <ellipse cx={110} cy={200} rx={104} ry={24} fill="#2c2729" />
      <ellipse cx={110} cy={192} rx={90} ry={12} fill="#ff8a3d" opacity={0.14 * f} />
      <g transform={`translate(110 190) scale(${scale} ${scale * (1 - sac * 0.04)}) translate(-110 -190)`}>
        <ellipse cx={38} cy={168} rx={40} ry={24} fill="#3f8f2f" />
        <ellipse cx={182} cy={168} rx={40} ry={24} fill="#3f8f2f" />
        <ellipse cx={110} cy={128} rx={74} ry={60} fill="#5cb83c" />
        <ellipse cx={110} cy={150} rx={48} ry={34} fill="#c9e88a" />
        <ellipse cx={110} cy={146 + sac * 6} rx={10 + 40 * sac} ry={8 + 30 * sac} fill="#f6f2b8" opacity={sac > 0.02 ? 0.95 : 0} />
        <ellipse cx={78} cy={186} rx={20} ry={9} fill="#4ea433" />
        <ellipse cx={142} cy={186} rx={20} ry={9} fill="#4ea433" />
        {[78, 142].map((x) => (
          <g key={x}>
            <circle cx={x} cy={74} r={27} fill="#5cb83c" />
            <ellipse cx={x} cy={72} rx={19} ry={19 * blink} fill="white" />
            <ellipse cx={x - 4} cy={73} rx={9} ry={9 * blink} fill="#141414" />
            <circle cx={x - 7} cy={68} r={3} fill="white" opacity={blink} />
          </g>
        ))}
        <path d={`M84,114 Q110,${126 + sac * 6} 136,114`} stroke="#2d5a1e" strokeWidth={4} fill="none" strokeLinecap="round" />
        <ellipse cx={62} cy={112} rx={10} ry={6} fill="#ff8fa3" opacity={0.45} />
        <ellipse cx={158} cy={112} rx={10} ry={6} fill="#ff8fa3" opacity={0.45} />
        <ellipse cx={46} cy={120} rx={26} ry={52} fill="#ff8a3d" opacity={0.16 * f} />
      </g>

      {frame >= CROAK_AT + 6 && frame < POOF_AT + 4 ? (
        <text
          x={110}
          y={-20}
          textAnchor="middle"
          fontFamily={DISPLAY}
          fontWeight={800}
          fontSize={86}
          fill={LIME}
          transform={`rotate(-8 110 -40) scale(${kva * scale})`}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          КВА!
        </text>
      ) : null}

      {puff > 0 && puff < 1
        ? new Array(9).fill(0).map((_, i) => {
            const a = (i / 9) * Math.PI * 2;
            const d = 30 + puff * 110;
            return (
              <circle
                key={i}
                cx={110 + Math.cos(a) * d}
                cy={130 + Math.sin(a) * d * 0.7}
                r={26 + puff * 30}
                fill="#cfc8d8"
                opacity={(1 - puff) * 0.55}
              />
            );
          })
        : null}
      {puff > 0 && puff < 1
        ? [0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2 + 0.6;
            const d = 40 + puff * 150;
            return (
              <text key={i} x={110 + Math.cos(a) * d} y={130 + Math.sin(a) * d} fontSize={34} fill={LIME} opacity={1 - puff} textAnchor="middle">
                ✦
              </text>
            );
          })
        : null}
    </g>
  );
};

export const CampfireStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const f = flicker(frame);
  return (
    <svg
      viewBox="0 0 1080 760"
      style={{ position: "absolute", left: 0, top: STRIP_TOP, width: 1080, height: 760, overflow: "visible" }}
    >
      <defs>
        <radialGradient id="fireGlow">
          <stop offset="0%" stopColor="#ff8a2a" stopOpacity={0.55} />
          <stop offset="45%" stopColor="#ff5a1a" stopOpacity={0.18} />
          <stop offset="100%" stopColor="#ff5a1a" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#120d12" stopOpacity={0} />
          <stop offset="22%" stopColor="#120d12" />
          <stop offset="100%" stopColor="#050407" />
        </linearGradient>
        <linearGradient id="avatarBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0e0e15" />
          <stop offset="65%" stopColor="#181822" />
          <stop offset="100%" stopColor="#2a1a16" />
        </linearGradient>
        <linearGradient id="avatarRim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="78%" stopColor="#ff7a2a" stopOpacity={0} />
          <stop offset="100%" stopColor="#ff8a3d" stopOpacity={0.55} />
        </linearGradient>
        <filter id="fireSoft">
          <feGaussianBlur stdDeviation={2.2} />
        </filter>
      </defs>

      <rect x={-50} y={250} width={1180} height={560} fill="url(#ground)" />
      <ellipse cx={FIRE_X} cy={FIRE_BASE - 60} rx={560 * f} ry={420 * f} fill="url(#fireGlow)" />
      <ellipse cx={FIRE_X} cy={FIRE_BASE + 30} rx={360} ry={60} fill="#ff7a2a" opacity={0.12 * f} />

      <Fire />
      <Frog />
      <Avatar />
    </svg>
  );
};

export { FROG_FRAMES };
