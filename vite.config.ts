/// <reference types="vitest" />
import { defineConfig, configDefaults } from 'vitest/config';
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
    // Dormant World Series test suites — excluded along with their source.
    exclude: [
      ...configDefaults.exclude,
      'src/test/availability.test.ts',
      'src/test/bracket.test.ts',
      'src/test/restRules.test.ts',
      'src/test/app.test.tsx',
    ],
  },
});
