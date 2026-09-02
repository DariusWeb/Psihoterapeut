import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import oxlint from 'eslint-plugin-oxlint'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
    // Browser globals we actually use — extend when a new one is introduced, or no-undef flags it
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        crypto: 'readonly',
        URL: 'readonly',
        Event: 'readonly',
        console: 'readonly',
        MutationObserver: 'readonly',
        Intl: 'readonly',
      },
    },
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/.wrangler/**'],
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  ...oxlint.configs['flat/recommended'],
  skipFormatting,

  {
    name: 'app/component-naming',
    files: ['**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  {
    name: 'worker/runtime-globals',
    files: ['worker/**/*.js'],
    languageOptions: {
      globals: {
        Response: 'readonly',
        Request: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        URLSearchParams: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
      },
    },
  },

  // Build and tooling scripts run in Node, not the browser or the Workers runtime.
  {
    name: 'node/tooling-globals',
    files: ['vite.config.js', 'worker/test/**/*.js', 'worker/preflight.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
      },
    },
  },
]
