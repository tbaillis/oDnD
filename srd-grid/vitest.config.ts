import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'test/**/*.test.ts',
      'test/**/*.spec.ts',
      'mcp-server/test/**/*.test.ts',
      'mcp-server/test/**/*.spec.ts'
    ],
  },
})
