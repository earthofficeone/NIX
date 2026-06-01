import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, ApiError, getToken, setToken } from '@/api/client'
import { useTransactionStore } from '@/stores/transactions'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const ready = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!currentUser.value)

  async function init() {
    ready.value = false
    if (!getToken()) {
      currentUser.value = null
      ready.value = true
      return
    }
    try {
      currentUser.value = await api.getMe()
    } catch {
      setToken(null)
      currentUser.value = null
    } finally {
      ready.value = true
    }
  }

  async function register(name: string, email: string, password: string): Promise<string | null> {
    loading.value = true
    try {
      const res = await api.register({ name, email, password })
      setToken(res.token)
      currentUser.value = res.user
      return null
    } catch (e) {
      if (e instanceof ApiError) return e.message
      return 'ไม่สามารถสมัครสมาชิกได้'
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string): Promise<string | null> {
    loading.value = true
    try {
      const res = await api.login({ email, password })
      setToken(res.token)
      currentUser.value = res.user
      return null
    } catch (e) {
      if (e instanceof ApiError) return e.message
      return 'ไม่สามารถเข้าสู่ระบบได้'
    } finally {
      loading.value = false
    }
  }

  function logout() {
    setToken(null)
    currentUser.value = null
    useTransactionStore().clear()
  }

  return {
    currentUser,
    isAuthenticated,
    ready,
    loading,
    init,
    register,
    login,
    logout,
  }
})
