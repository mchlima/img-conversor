import wasm from 'vite-plugin-wasm'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: false,
  nitro: { preset: 'static' },

  modules: ['@nuxt/ui', '@nuxtjs/i18n', '@nuxt/eslint'],

  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'pt-BR', name: 'Português (Brasil)', file: 'pt-BR.json' },
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    langDir: 'i18n/locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'en',
    },
  },

  vite: {
    plugins: [wasm()],
    optimizeDeps: {
      exclude: ['@jsquash/webp'],
    },
  },

  build: {
    transpile: ['@jsquash/webp'],
  },

  css: ['~/tailwind.css'],
  devtools: { enabled: true },
})
