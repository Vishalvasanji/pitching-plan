/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages serves under /pitching-plan/ (the deploy workflow sets
// GITHUB_PAGES). Everywhere else — local dev and Vercel — serve from the root.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/pitching-plan/' : '/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
