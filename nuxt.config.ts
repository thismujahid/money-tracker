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
      "name": "دفتر المصاريف",
      "short_name": "دفتر المصاريف",
      "description": "تتبع مصاريفك وديونك بسهولة مع دفتر المصاريف. قم بإدارة ميزانيتك، تتبع نفقاتك، وتذكير نفسك بالديون المستحقة. تطبيق بسيط وفعال لتنظيم أمورك المالية.",
      "theme_color": "#0a0e17",
      "background_color": "#05070c",
      "display": "standalone",
      "orientation": "portrait",
      "dir": "rtl",
      "lang": "ar",
      "start_url": "/",
      "id": "/?source=pwa",
      "icons": [
        {
          "src": "/icon.svg",
          "sizes": "any",
          "type": "image/svg+xml"
        },
        {
          "src": "/icons/icon-48x48.png",
          "sizes": "48x48",
          "type": "image/png"
        },
        {
          "src": "/icons/icon-72x72.png",
          "sizes": "72x72",
          "type": "image/png"
        },
        {
          "src": "/icons/icon-96x96.png",
          "sizes": "96x96",
          "type": "image/png"
        },
        {
          "src": "/icons/icon-128x128.png",
          "sizes": "128x128",
          "type": "image/png"
        },
        {
          "src": "/icons/icon-144x144.png",
          "sizes": "144x144",
          "type": "image/png"
        },
        {
          "src": "/icons/icon-152x152.png",
          "sizes": "152x152",
          "type": "image/png"
        },
        {
          "src": "/icons/icon-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "/icons/icon-256x256.png",
          "sizes": "256x256",
          "type": "image/png"
        },
        {
          "src": "/icons/icon-384x384.png",
          "sizes": "384x384",
          "type": "image/png"
        },
        {
          "src": "/icons/icon-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
        }
      ],
      "screenshots": [
        {
          "src": "/screenshot-desktop.png",
          "sizes": "1280x720",
          "type": "image/png",
          "form_factor": "wide",
          "label": "الواجهة الرئيسية للتطبيق على الكمبيوتر"
        },
        {
          "src": "/screenshot-mobile.png",
          "sizes": "390x844",
          "type": "image/png",
          "form_factor": "narrow",
          "label": "شاشة تتبع المصاريف والديون على الجوال"
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
      title: 'دفتر المصاريف',
      meta: [
        { name: 'description', content: 'تتبع مصاريفك وديونك وسجل كل حاجة بتصرفها أو بتستلفها خلال يومك بسهولة.' },
        // إعدادات الـ PWA للآيفون (iOS)
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'دفتر المصاريف' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        // الأيقونة الخاصة بالآيفون وآيباد (يفضل استخدام حجم 180x180 أو 192x192)
        { rel: 'apple-touch-icon', href: '/icons/icon-192x192.png' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;700;800&family=Outfit:wght@300;400;500;600;700&display=swap' }
      ]
    }
  }
})
