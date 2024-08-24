import { defineConfig } from 'vite'
import { node } from '@liuli-util/vite-plugin-node'

export default defineConfig({
  plugins: [
    node({
      entry: ['./src/index.ts', './src/experimental.ts'],
      dts: true,
    }),
  ],
})
