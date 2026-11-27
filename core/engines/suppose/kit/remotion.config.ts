import path from 'node:path';
import {Config} from '@remotion/cli/config';

const kit = process.cwd();
Config.setVideoImageFormat('jpeg');
Config.overrideWebpackConfig((c) => ({
  ...c,
  resolve: {
    ...c.resolve,
    alias: {...(c.resolve?.alias ?? {}), '@suppose/kit': path.join(kit, 'src/index.ts')},
    modules: [path.join(kit, 'node_modules'), 'node_modules'],
  },
}));
