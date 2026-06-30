import '@/assets/tailwind.css'
import '@/assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import { initNativeShell } from '@/composables/useNativeShell'
import { startBackendKeepAlive } from '@/utils/backendKeepAlive'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

useTheme().init()
void initNativeShell()
startBackendKeepAlive()

// Mount immediately — auth.init() runs in App.vue so a slow API never leaves a blank screen.
useAuthStore().init()

app.mount('#app')
