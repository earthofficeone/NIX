import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types'
import { loadJson, saveJson } from '@/utils/storage'

const USERS_KEY = 'nix_users'
const SESSION_KEY = 'nix_session'

export const useAuthStore = defineStore('auth', () => {
  const users = ref<User[]>(loadJson<User[]>(USERS_KEY, []))
  const sessionUserId = ref<string | null>(loadJson<string | null>(SESSION_KEY, null))

  const currentUser = computed(() =>
    users.value.find((u) => u.id === sessionUserId.value) ?? null,
  )

  const isAuthenticated = computed(() => !!currentUser.value)

  function persistUsers() {
    saveJson(USERS_KEY, users.value)
  }

  function persistSession() {
    saveJson(SESSION_KEY, sessionUserId.value)
  }

  function register(name: string, email: string, password: string): string | null {
    const normalized = email.trim().toLowerCase()
    if (users.value.some((u) => u.email === normalized)) {
      return 'อีเมลนี้ถูกใช้งานแล้ว'
    }
    const user: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalized,
      password,
      createdAt: new Date().toISOString(),
    }
    users.value.push(user)
    persistUsers()
    sessionUserId.value = user.id
    persistSession()
    return null
  }

  function login(email: string, password: string): string | null {
    const normalized = email.trim().toLowerCase()
    const user = users.value.find((u) => u.email === normalized && u.password === password)
    if (!user) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
    sessionUserId.value = user.id
    persistSession()
    return null
  }

  function logout() {
    sessionUserId.value = null
    persistSession()
  }

  return {
    currentUser,
    isAuthenticated,
    register,
    login,
    logout,
  }
})
