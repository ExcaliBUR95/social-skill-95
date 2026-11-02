import { loadFont as loadUnbounded } from "@remotion/google-fonts/Unbounded";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";

export const DISPLAY = loadUnbounded("normal", { weights: ["800"], subsets: ["cyrillic", "latin"] }).fontFamily;
export const BODY = loadManrope("normal", { weights: ["600", "800"], subsets: ["cyrillic", "latin"] }).fontFamily;

export const LIME = "#c6ff3d";
export const INK = "#0a0a10";
