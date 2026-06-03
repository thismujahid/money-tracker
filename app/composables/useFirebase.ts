import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const useFirebase = () => {
  const config = useRuntimeConfig()
  // Check if configuration is present
  const isFirebaseConfigured = !!(
    config.public.firebaseApiKey &&
    config.public.firebaseProjectId
  )

  let app = null
  let auth = null
  let db = null

  if (isFirebaseConfigured) {
    try {
      const firebaseConfig = {
        apiKey: config.public.firebaseApiKey,
        authDomain: config.public.firebaseAuthDomain,
        projectId: config.public.firebaseProjectId,
        storageBucket: config.public.firebaseStorageBucket,
        messagingSenderId: config.public.firebaseMessagingSenderId,
        appId: config.public.firebaseAppId,
      }

      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
      auth = getAuth(app)
      db = getFirestore(app)
    } catch (e) {
      console.error('خطأ أثناء تهيئة Firebase SDK:', e)
    }
  }

  return {
    isFirebaseConfigured,
    app,
    auth,
    db
  }
}
