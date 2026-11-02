import {
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { DISPLAY, INK, LIME } from "./theme";

// One word that slides up out of a blur at frame `at`; `hl` wipes a lime box behind it.
export const Word: React.FC<{
  readonly children: React.ReactNode;
  readonly at: number;
  readonly hl?: boolean;
  readonly hlAt?: number;
}> = ({ children, at, hl, hlAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 200 }, durationInFrames: 10 });
  const h = hl
    ? spring({ frame: frame - (hlAt ?? at + 4), fps, config: { damping: 200 }, durationInFrames: 10 })
    : 0;
  // Highlighted words land with an elastic pop.
  const pop = hl ? spring({ frame: frame - (hlAt ?? at + 4), fps, config: { damping: 8, stiffness: 180 } }) : 1;
  const scale = hl ? interpolate(pop, [0, 1], [0.85, 1]) : 1;

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        opacity: p,
        transform: `translateY(${(1 - p) * 28}px) scale(${scale})`,
        filter: `blur(${(1 - p) * 10}px)`,
        padding: hl ? "0 0.12em" : 0,
        margin: hl ? "0 -0.12em" : 0,
      }}
    >
      {hl ? (
        <span
          style={{
            position: "absolute",
            inset: "0.06em 0 0 0",
            backgroundColor: LIME,
            borderRadius: 14,
            transform: `scaleX(${h})`,
            transformOrigin: "left",
          }}
        />
      ) : null}
      <span style={{ position: "relative", color: interpolateColors(h, [0, 1], ["#ffffff", INK]) }}>
        {children}
      </span>
    </span>
  );
};

export const Heading: React.FC<{ readonly children: React.ReactNode; readonly size?: number }> = ({
  children,
  size = 98,
}) => (
  <div
    style={{
      fontFamily: DISPLAY,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.14,
      display: "flex",
      flexWrap: "wrap",
      columnGap: "0.28em",
      color: "white",
    }}
  >
    {children}
  </div>
);

// Outlined section number, like "01".
export const BigNumber: React.FC<{ readonly children: string; readonly at: number }> = ({ children, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 14 } });
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: 210,
        lineHeight: 1,
        color: "transparent",
        WebkitTextStroke: `4px ${LIME}`,
        opacity: interpolate(p, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
        transform: `scale(${interpolate(p, [0, 1], [0.7, 1])})`,
        transformOrigin: "left center",
        marginBottom: 40,
      }}
    >
      {children}
    </div>
  );
};

// Pop-in helper for small elements (chips, checks, buttons).
export const usePop = (at: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping: 12 } });
};
