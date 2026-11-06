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
