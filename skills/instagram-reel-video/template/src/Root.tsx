import { Composition } from "remotion";
import { CampfireReel } from "./Campfire/CampfireReel";
import { TOTAL_FRAMES } from "./Campfire/timing";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CampfireReel"
      component={CampfireReel}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
