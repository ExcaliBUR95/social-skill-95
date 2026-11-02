import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { BODY, INK, LIME } from "./theme";
import { usePop } from "./Words";

// Burst of paper bits from (x, y) at frame `at`, falling under gravity.
export const Confetti: React.FC<{ readonly at: number; readonly x: number; readonly y: number }> = ({ at, x, y }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 60) return null;
  const colors = [LIME, "#ffffff", "#8b5cf6", "#7fd3ff"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(48).fill(0).map((_, i) => {
        const angle = -Math.PI / 2 + (random(`a${i}`) - 0.5) * 2.4;
        const speed = 16 + random(`s${i}`) * 22;
        const px = x + Math.cos(angle) * speed * t;
        const py = y + Math.sin(angle) * speed * t + 0.9 * t * t;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: 14,
              height: 24,
              borderRadius: 3,
              backgroundColor: colors[i % colors.length],
              transform: `rotate(${t * (8 + random(`r${i}`) * 20)}deg)`,
              opacity: interpolate(t, [40, 60], [1, 0], { extrapolateLeft: "clamp" }),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Check: React.FC<{ readonly children: string; readonly at: number }> = ({ children, at }) => {
  const p = usePop(at);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        fontFamily: BODY,
        fontWeight: 600,
        fontSize: 46,
        color: "white",
        opacity: Math.min(1, p * 2),
        transform: `translateX(${(1 - p) * -30}px)`,
        marginTop: 26,
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 27,
          backgroundColor: LIME,
          color: INK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 34,
          fontWeight: 800,
          transform: `scale(${p})`,
        }}
      >
        ✓
      </div>
      {children}
    </div>
  );
};
