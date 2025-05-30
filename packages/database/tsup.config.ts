import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Disable DTS generation temporarily
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@omnipanel/types', '@omnipanel/config', '@supabase/supabase-js'],
  treeshake: true,
})