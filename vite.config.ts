/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project under /pitching-plan/. Use that base for
// production builds, but keep the dev server at root.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/pitching-plan/' : '/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
  },
}));
