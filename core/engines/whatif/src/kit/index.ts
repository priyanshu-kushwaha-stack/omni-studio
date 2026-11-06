// The what-if kit. Scenes import from here or from the module paths ("@whatif/kit/rig/Figure").
export * from "./theme";
export * from "./timeline";
export * from "./world/clock";
export * from "./rig/pose";
export { Figure, type Brows, type FigureProps, type Mouth } from "./rig/Figure";
export { EXPRESSIONS, type Expression } from "./rig/expressions";
export { Layer, Stage, Finish, camTransform, toScreen, waveRadius, type Camera } from "./stage/Stage";
export { LookContext, useLook, layerBlur, type Look, type Glow } from "./stage/Look";
export { MOODS, moodLook, type MoodName } from "./stage/moods";
export { barHeight, BARS_FULL, BARS_SLIDE } from "./stage/bars";
export { PauseBars } from "./stage/PauseBars";
export { wide, medium, closeUp, insert, drift, ForegroundHead } from "./stage/shots";
export { FastMove } from "./stage/motion";
export { Tag } from "./ui/Tag";
export { Flip } from "./ui/Flip";
export { SourceTag } from "./ui/SourceTag";
export { sourceLabel } from "./ui/source";
export { DrawLine } from "./ui/DrawLine";
