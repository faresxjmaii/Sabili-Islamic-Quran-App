import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: extensionRoot,
  plugins: [react()],
  build: {
    outDir: resolve(extensionRoot, '../dist-extension'),
    emptyOutDir: true,
    rollupOptions: {
      input: 'newtab.html',
    },
  },
});
