import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@heroui/react': path.resolve(__dirname, './src/__tests__/mocks/heroui-react.tsx'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});
