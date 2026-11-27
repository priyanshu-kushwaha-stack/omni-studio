import path from 'node:path';
import {defineConfig} from 'vitest/config';

const here = path.dirname(new URL(import.meta.url).pathname);
const nm = (p: string) => path.join(here, 'node_modules', p);

// The pilot's files are imported by the parity tests; they live outside this package, so pin their bare imports
// to this package's node_modules.
export default defineConfig({
  resolve: {alias: {remotion: nm('remotion'), react: nm('react'), 'react-dom': nm('react-dom'), '@suppose/kit': path.join(here, 'src/index.ts')}},
  test: {include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'], setupFiles: ['tests/setup.ts']},
});
