import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// GitHub Pages has no SPA rewrite; it serves 404.html for unknown paths, keeping the URL so the router can boot.
function emitSpa404Fallback() {
  let outDir

  return {
    name: 'emit-spa-404-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
    }
  }
}

// Puts the site copy behind a base64 string table so `curl | grep` no longer returns it. Strings are
// decoded at runtime, so the rendered DOM still exposes everything — this only defeats scraping the file.
function obfuscateContentStrings() {
  return {
    name: 'obfuscate-content-strings',
    apply: 'build',
    enforce: 'post',
    async generateBundle(_options, bundle) {
      const { default: obfuscator } = await import('javascript-obfuscator')

      for (const chunk of Object.values(bundle)) {
        const isOwnCode =
          chunk.type === 'chunk' && Object.keys(chunk.modules).some((id) => id.includes('/src/'))
        if (!isOwnCode) continue

        chunk.code = obfuscator
          .obfuscate(chunk.code, {
            compact: true,
            identifierNamesGenerator: 'mangled',
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 1,
            // Vite's preload helper caches its chunk->CSS map via a self-reference in a default
            // parameter; renaming it silently empties the map and lazy routes load without styles.
            reservedNames: ['^__vite__'],
            // Off deliberately: these are the transforms that wreck runtime speed and break Vue.
            controlFlowFlattening: false,
            deadCodeInjection: false,
            selfDefending: false,
            debugProtection: false,
            splitStrings: false,
          })
          .getObfuscatedCode()
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueDevTools(),
    emitSpa404Fallback(),
    loadEnv(mode, process.cwd(), '').VITE_OBFUSCATE === 'true' && obfuscateContentStrings(),
  ],
  build: {
    // One stylesheet instead of per-route chunks: obfuscating the entry breaks Vite's runtime CSS
    // injection, and at 8.8 kB gzipped total the whole sheet is cheaper than a fetch per route.
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       additionalData: `
  //         @import "@/assets/scss/main.scss";
  //       `
  //     }
  //   }
  // }
  base: '/Psihoterapeut/', // IMPORTANT for GitHub Pages
}))
