import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.svg'],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep SVG files with descriptive names
          if (assetInfo.name && assetInfo.name.endsWith('.svg')) {
            return `assets/[name]-[hash].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`;
        }
      }
    }
  }
})
