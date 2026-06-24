import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import router from '@/router'

export async function initNativeShell() {
  if (!Capacitor.isNativePlatform()) return

  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await SplashScreen.hide()
  } catch {
    // Plugins may be unavailable in web preview
  }

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back()
      return
    }

    const route = router.currentRoute.value
    if (route.meta.requiresAuth && route.name !== 'dashboard') {
      void router.push({ name: 'dashboard' })
      return
    }

    if (route.meta.guest) {
      App.exitApp()
    }
  })
}
