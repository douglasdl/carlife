import { defineConfig } from 'vite'
import { cpSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        en: resolve(__dirname, 'en/index.html'),
        pt: resolve(__dirname, 'pt/index.html')
      },
      output: {
        assetFileNames: assetInfo => {
          const name = assetInfo.name || ''
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) {
            return 'assets/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  plugins: [
    {
      name: 'copy-static-dirs',
      closeBundle () {
        const copyDir = (from, to) => {
          mkdirSync(to, { recursive: true })
          cpSync(from, to, { recursive: true })
        }
        mkdirSync(resolve(__dirname, 'dist/scripts'), { recursive: true })
        cpSync(
          resolve(__dirname, 'scripts/main.js'),
          resolve(__dirname, 'dist/scripts/main.js')
        )
        copyDir(resolve(__dirname, 'styles'), resolve(__dirname, 'dist/styles'))
        copyDir(
          resolve(__dirname, 'public/assets'),
          resolve(__dirname, 'dist/assets')
        )
      }
    }
  ],
  server: {
    port: 3001,
    open: true
  }
})
