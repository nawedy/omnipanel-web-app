import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true, // Enable DTS generation for proper TypeScript support
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@omnipanel/types', '@omnipanel/config'],
  treeshake: true,
})