import { defineConfig } from 'vitest/config'
import { config } from 'dotenv'

config({ path: '.dev.vars' })

export default defineConfig({
  test: {
    env: {
      ...process.env,
    },
  },
})
