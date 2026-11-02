import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Check, Confetti } from "../shared/Effects";
import { BODY, DISPLAY, INK, LIME } from "../shared/theme";
import { BigNumber, Heading, usePop, Word } from "../shared/Words";
import { cue } from "./timing";

const RED = "#ff4d5e";

export const Sfx: React.FC<{ readonly name: string; readonly at: number; readonly volume?: number }> = ({
  name,
  at,
  volume = 0.5,
}) => <Audio from={at} src={staticFile(`sfx-gen/${name}.wav`)} volume={volume} />;

// Every scene fades up and out over its last frames; content starts at `top`.
const Shell: React.FC<{ readonly children: React.ReactNode; readonly top: number }> = ({ children, top }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ padding: `${top}px 96px 0`, opacity: out, transform: `translateY(${(1 - out) * -40}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

const Pill: React.FC<{ readonly children: React.ReactNode; readonly at: number }> = ({ children, at }) => {
  const p = usePop(at);
  return (
    <div
      style={{
        alignSelf: "flex-start",
        backgroundColor: LIME,
        color: INK,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: 28,
        padding: "12px 24px",
        borderRadius: 40,
        marginBottom: 34,
        transform: `scale(${p})`,
        transformOrigin: "left center",
      }}
    >
      {children}
    </div>
  );
};

const Badge: React.FC<{ readonly n: number; readonly at: number; readonly glowAt?: number }> = ({ n, at, glowAt }) => {
  const frame = useCurrentFrame();
  const p = usePop(at);
  const lit = glowAt !== undefined && frame >= glowAt;
  const glow = lit ? 0.5 + 0.5 * Math.sin((frame - glowAt) / 4) : 0;
  return (
    <div
      style={{
        width: 104,
        height: 104,
        borderRadius: 24,
        border: `4px solid ${LIME}`,
        backgroundColor: lit ? LIME : "transparent",
        color: lit ? INK : LIME,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${p * (1 + glow * 0.08)})`,
        boxShadow: `0 0 ${40 * glow}px ${LIME}`,
      }}
    >
      {n}
    </div>
  );
};

// The title is fully on screen at frame 0 so the first frame works as the thumbnail.
export const IntroScene: React.FC = () => {
  const at = cue("intro", "Три");
  const label = usePop(cue("intro", "важная"));
  return (
    <Shell top={250}>
      <Pill at={-20}>СКИЛЛ ДЛЯ НЕЙРОСЕТИ CLAUDE</Pill>
      <Heading size={104}>
        <Word at={-20}>Claude</Word>
        <Word at={-20}>теперь</Word>
        <Word at={-20} hl hlAt={-20}>
          ведёт
        </Word>
        <Word at={-20} hl hlAt={-20}>
          Instagram
        </Word>
      </Heading>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 56 }}>
        <Badge n={1} at={at} />
        <Badge n={2} at={at + 5} />
        <Badge n={3} at={at + 10} glowAt={cue("intro", "третья")} />
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 38, color: "white", marginLeft: 8, opacity: label, transform: `translateX(${(1 - label) * 30}px)` }}>
          ← самая
          <br />
          важная
        </div>
      </div>
      {[0, 5, 10].map((d) => (
        <Sfx key={d} name="click" at={at + d} volume={0.5} />
      ))}
      <Sfx name="ding" at={cue("intro", "третья")} volume={0.25} />
    </Shell>
  );
};

const Tag: React.FC<{ readonly children: string; readonly at: number }> = ({ children, at }) => {
  const p = usePop(at);
  return (
    <div
      style={{
        padding: "10px 22px",
        borderRadius: 18,
        border: `2px solid ${LIME}`,
        backgroundColor: "rgba(198,255,61,0.08)",
        fontFamily: BODY,
        fontWeight: 800,
        fontSize: 36,
        color: LIME,
        opacity: Math.min(1, p * 2),
        transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`,
      }}
    >
      {children}
    </div>
  );
};

export const Scene01: React.FC = () => (
  <Shell top={290}>
    <BigNumber at={cue("s01", "Первое")}>01</BigNumber>
    <Heading>
      <Word at={cue("s01", "Пишет")}>Пишет</Word>
      <Word at={cue("s01", "сценарии")}>сценарии</Word>
      <Word at={cue("s01", "рилс")}>рилс</Word>
      <Word at={cue("s01", "по")} hl hlAt={cue("s01", "секундам")}>
        по
      </Word>
      <Word at={cue("s01", "секундам")} hl>
        секундам
      </Word>
    </Heading>
    <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
      <Tag at={cue("s01", "хук")}>хук</Tag>
      <Tag at={cue("s01", "пауза")}>пауза</Tag>
      <Tag at={cue("s01", "призыв")}>призыв</Tag>
    </div>
    <Sfx name="click" at={cue("s01", "хук")} />
    <Sfx name="click" at={cue("s01", "пауза")} />
    <Sfx name="click" at={cue("s01", "призыв")} />
  </Shell>
);

export const Scene02: React.FC = () => (
  <Shell top={290}>
    <BigNumber at={cue("s02", "Второе")}>02</BigNumber>
    <Heading>
      <Word at={cue("s02", "Делает")}>Делает</Word>
      <Word at={cue("s02", "карусели")}>карусели</Word>
      <Word at={cue("s02", "под")}>под</Word>
      <Word at={cue("s02", "сохранения")} hl>
        сохранения,
      </Word>
      <Word at={cue("s02", "а")}>а не</Word>
      <Word at={cue("s02", "под", 1)}>под</Word>
      <Word at={cue("s02", "лайки")}>лайки</Word>
    </Heading>
    <Sfx name="pop" at={cue("s02", "сохранения")} volume={0.35} />
  </Shell>
);

export const AlgoScene: React.FC = () => (
  <Shell top={400}>
    <Heading size={84}>
      <Word at={cue("algo", "знает")}>Знает,</Word>
      <Word at={cue("algo", "что", 1)}>что</Word>
      <Word at={cue("algo", "считает")}>считает</Word>
      <Word at={cue("algo", "алгоритм")} hl>
        алгоритм
      </Word>
    </Heading>
    <div style={{ marginTop: 20 }}>
      <Check at={cue("algo", "Досмотры")}>Досмотры</Check>
      <Check at={cue("algo", "Репосты")}>Репосты</Check>
      <Check at={cue("algo", "Сохранения")}>Сохранения</Check>
    </div>
    <Sfx name="click" at={cue("algo", "Досмотры")} />
    <Sfx name="click" at={cue("algo", "Репосты")} />
    <Sfx name="click" at={cue("algo", "Сохранения")} />
  </Shell>
);

const DownArrow: React.FC<{ readonly at: number }> = ({ at }) => {
  const p = usePop(at);
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: "inline-block",
        color: RED,
        opacity: Math.min(1, p * 2),
        transform: `translateY(${(1 - p) * -40 + Math.max(0, Math.sin((frame - at) / 4)) * 8}px)`,
      }}
    >
      ↓
    </span>
  );
};

export const Scene03: React.FC = () => (
  <Shell top={290}>
    <BigNumber at={cue("s03", "третье")}>03</BigNumber>
    <Heading>
      <Word at={cue("s03", "Без")}>Без</Word>
      <Word at={cue("s03", "ботов")}>ботов</Word>
      <Word at={cue("s03", "и", 1)}>и</Word>
      <Word at={cue("s03", "накрутки")}>накрутки,</Word>
      <Word at={cue("s03", "которые")}>которые</Word>
      <Word at={cue("s03", "режут")} hl>
        режут
      </Word>
      <Word at={cue("s03", "охваты")} hl>
        охваты
      </Word>
      <DownArrow at={cue("s03", "охваты") + 6} />
    </Heading>
    <Sfx name="whoosh" at={cue("s03", "Без")} volume={0.3} />
    <Sfx name="pop" at={cue("s03", "охваты") + 6} volume={0.4} />
  </Shell>
);

export const InstallScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flipAt = cue("install", "Одна");
  const doneAt = cue("install", "Клоде");
  const flip = spring({ frame: frame - flipAt, fps, config: { damping: 10 } });
  const appear = usePop(0);
  const value = frame < flipAt ? "0" : "1";
  const load = interpolate(frame, [cue("install", "Установка"), doneAt], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 2),
  });
  const done = usePop(doneAt);
  return (
    <Shell top={400}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, opacity: appear }}>
        <span
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 280,
            lineHeight: 1,
            color: value === "0" ? "#5d7a2a" : LIME,
            display: "inline-block",
            transform: `scale(${frame < flipAt ? 1 : interpolate(flip, [0, 1], [1.4, 1])})`,
            transformOrigin: "left bottom",
          }}
        >
          {value}
        </span>
        <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 104, color: "white" }}>мин</span>
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 54, color: "white", display: "flex", gap: "0.3em", marginTop: 20 }}>
        <Word at={cue("install", "Установка")}>на установку</Word>
        <Word at={cue("install", "Прямо")} hl hlAt={doneAt}>
          в Claude
        </Word>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 46, opacity: appear }}>
        <div style={{ width: 640, height: 22, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
          <div style={{ width: `${load * 100}%`, height: "100%", backgroundColor: LIME, borderRadius: 11 }} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 38, color: LIME, width: 120 }}>
          {done > 0.05 ? "✓" : `${Math.round(load * 100)}%`}
        </div>
      </div>
      <Confetti at={doneAt} x={560} y={900} />
      <Sfx name="ding" at={flipAt} volume={0.35} />
      <Sfx name="pop" at={doneAt} volume={0.5} />
    </Shell>
  );
};

// Proof by demonstration: this very video is the example.
export const MadeByScene: React.FC = () => {
  const free = usePop(cue("madeby", "Без"));
  return (
    <Shell top={300}>
      <Pill at={cue("madeby", "Кстати")}>КСТАТИ</Pill>
      <Heading size={92}>
        <Word at={cue("madeby", "Это")}>Это</Word>
        <Word at={cue("madeby", "видео")}>видео</Word>
        <Word at={cue("madeby", "сделал")}>сделал</Word>
        <Word at={cue("madeby", "Клод")} hl>
          Claude
        </Word>
      </Heading>
      <div style={{ marginTop: 14 }}>
        <Check at={cue("madeby", "Озвучку")}>Озвучка</Check>
        <Check at={cue("madeby", "Анимацию")}>Анимация</Check>
        <Check at={cue("madeby", "звук")}>Звук</Check>
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: 40,
          color: "white",
          opacity: free,
          transform: `translateY(${(1 - free) * 20}px)`,
        }}
      >
        Без сторонних сервисов
        <br />
        и <span style={{ color: LIME }}>лишних подписок</span>
      </div>
      <Sfx name="click" at={cue("madeby", "Озвучку")} />
      <Sfx name="click" at={cue("madeby", "Анимацию")} />
      <Sfx name="click" at={cue("madeby", "звук")} />
      <Sfx name="ding" at={cue("madeby", "Без")} volume={0.25} />
    </Shell>
  );
};

export const QuestionScene: React.FC = () => (
  <Shell top={480}>
    <Heading size={88}>
      <Word at={cue("question", "Хочешь")}>Хочешь</Word>
      <Word at={cue("question", "себе")}>себе</Word>
      <Word at={cue("question", "такого")}>такого</Word>
      <Word at={cue("question", "помощника")} hl>
        помощника?
      </Word>
    </Heading>
  </Shell>
);

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const btn = usePop(cue("cta", "Пришлю"));
  const pulse = btn > 0.95 ? 1 + 0.035 * Math.sin(frame / 4) : btn;
  const nudge = Math.max(0, Math.sin(frame / 3.5)) * 14;
  const credit = usePop(cue("cta", "инструкцию") + 4);
  return (
    <Shell top={440}>
      <Heading size={84}>
        <Word at={cue("cta", "Пиши")}>Пиши</Word>
        <Word at={cue("cta", "Клод")} hl>
          claude
        </Word>
        <Word at={cue("cta", "в")}>в</Word>
        <Word at={cue("cta", "комментариях")}>комментариях</Word>
      </Heading>
      <div
        style={{
          alignSelf: "flex-start",
          marginTop: 44,
          backgroundColor: LIME,
          color: INK,
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: 42,
          padding: "22px 40px",
          borderRadius: 60,
          transform: `scale(${pulse})`,
          transformOrigin: "left center",
          boxShadow: `0 0 ${30 * btn}px rgba(198,255,61,0.5)`,
        }}
      >
        Пришлю ссылку и инструкцию{" "}
        <span style={{ display: "inline-block", transform: `translateX(${nudge}px)` }}>→</span>
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 34, color: "rgba(255,255,255,0.75)", marginTop: 30, opacity: credit }}>
        Автор видео: <span style={{ color: "white" }}>@el.caramba.dev</span>
      </div>
      <Sfx name="pop" at={cue("cta", "Клод")} volume={0.4} />
      <Sfx name="click" at={cue("cta", "Пришлю")} />
    </Shell>
  );
};
