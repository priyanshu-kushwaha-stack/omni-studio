import { CameraMotionBlur } from "@remotion/motion-blur";

/** Motion blur for fast moves (a sprint, a whip pan). Expensive: wrap only the frames that need it. */
export const FastMove: React.FC<{ on: boolean; children: React.ReactNode }> = ({ on, children }) =>
  on ? <CameraMotionBlur shutterAngle={180} samples={8}>{children}</CameraMotionBlur> : <>{children}</>;
