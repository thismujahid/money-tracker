// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: false,

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@primevue/nuxt-module',
    '@vite-pwa/nuxt'
  ],

  primevue: {
    options: {
      theme: 'none'
    }
  },

  css: [
    'primeicons/primeicons.css',
    '~/assets/css/main.css'
  ],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'دفتر المصاريف',
      short_name: 'دفتر المصاريف',
      description: 'برنامج حديث لتتبع مصاريفك وديونك بتصميم ذهبي عصري',
      theme_color: '#0a0e17',
      background_color: '#05070c',
      display: 'standalone',
      orientation: 'portrait',
      dir: 'rtl',
      lang: 'ar',
      icons: [
        {
          src: 'icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    devOptions: {
      enabled: false // Turned off by default in dev to prevent caching conflicts, but active on build
    }
  },

  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || '',
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
      ]
    }
  },
  app: {
    head: {
      title: 'دفتر المصاريف | تتبع مصاريفك وديونك',
      meta: [
        { name: 'description', content: 'برنامج حديث لتتبع المصاريف والديون بتصميم ذهبي عصري' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'manifest',  href: '/manifest.json' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;700;800&family=Outfit:wght@300;400;500;600;700&display=swap' }
      ]
    }
  }
})
