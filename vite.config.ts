import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    Components({
      dts: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // Vite's default ('modules') floors at safari14/chrome87, which predates
    // container queries and dvh units — both of which the responsive system
    // emits. These are the first versions that support them:
    // container queries (Chrome 105, Firefox 110, Safari 16) and
    // dvh units (Chrome 108, Firefox 101, Safari 15.4).
    target: ['chrome111', 'edge111', 'firefox110', 'safari16.4']
  },
  css: {
    preprocessorOptions: {
      sass: {
        // Makes the responsive mixins (+mobile, +down(lg), +container, fluid()…)
        // available in every SFC style block without an import.
        loadPaths: [
          fileURLToPath(new URL('./src/assets/styles', import.meta.url))
        ],
        additionalData: '@use "responsive" as *\n'
      }
    }
  },
  server: {
    port: 5189
  },
  test: {
    environment: 'jsdom'
  }
})
