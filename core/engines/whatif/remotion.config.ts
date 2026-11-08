// Scenes import the shared kit as "@whatif/kit/...", from the engine's own examples or from a video folder in
// channels/<slug>/videos/<id>/scenes/. Packages always resolve from this engine's node_modules, so a video folder
// needs none of its own.
import path from "node:path";
import { Config } from "@remotion/cli/config";

const engine = path.resolve(process.cwd());

Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: { ...(config.resolve?.alias ?? {}), "@whatif/kit": path.join(engine, "src/kit") },
    modules: [path.join(engine, "node_modules"), ...(config.resolve?.modules ?? ["node_modules"])],
  },
}));

// A frame may wait up to 2 min for its assets. The 30 s default failed edit v6 at frame 4319 while other sessions
// loaded the Mac (load average 42, 2026-11-08).
Config.setDelayRenderTimeoutInMilliseconds(120_000);
