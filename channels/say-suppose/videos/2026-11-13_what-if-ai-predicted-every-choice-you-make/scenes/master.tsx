/**
 * The film's master gain (G4, 2026-11-25). Every <Audio> in scenes/ imports this one instead of Remotion's, so the
 * whole mix is lifted in code and the one 1920x1080 render G4 watches reaches the channel target (-14 ±1 LUFS) with
 * no mux after it. whatif_render's limiter (alimiter 0.84) catches the peaks the lift makes.
 *
 * The v3 mix measured -20.2 LUFS; scenes/master.py measured +6.4 dB as the lift on the G3 watch copy; +6.0 here leaves the limiter room, so the true
 * peak stays under -1 dBTP (+6.4 measured exactly -1.00 on the audio pass).
 */
import React from "react";
import { Audio as RemotionAudio } from "remotion";

export const MASTER = 10 ** (6.0 / 20);

type Props = React.ComponentProps<typeof RemotionAudio>;

export const Audio: React.FC<Props> = ({ volume, ...rest }) => {
  const v = typeof volume === "function" ? (f: number) => MASTER * volume(f) : MASTER * (volume ?? 1);
  return <RemotionAudio {...rest} volume={v} />;
};
