import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path so it works seamlessly on GitHub Pages (e.g. username.github.io/gitlist/)
  base: './',
  server: {
    port: 3000,
    open: true
  }
});
