type CapacitorWindow = Window & {
  Capacitor?: {
    isNativePlatform?: () => boolean
  }
}

/** True inside Capacitor APK/IPA — no @capacitor/core import (safe for Netlify web build). */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  return (window as CapacitorWindow).Capacitor?.isNativePlatform?.() === true
}
