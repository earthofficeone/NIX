<script setup lang="ts">
import ThemeToggle from '@/components/layout/ThemeToggle.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

defineProps<{
  title: string
  subtitle?: string
  showLogout?: boolean
}>()

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="header">
    <div>
      <p v-if="subtitle" class="lux-subtitle">{{ subtitle }}</p>
      <h1 class="lux-title">{{ title }}</h1>
    </div>
    <div class="header__actions">
      <ThemeToggle />
      <button v-if="showLogout" type="button" class="header__logout" @click="logout">ออก</button>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header__logout {
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--Card-Border);
  border-radius: 9999px;
  background: transparent;
  color: var(--Hint-Color);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    color: var(--Primary-Color);
    border-color: var(--Primary-Color);
  }
}
</style>
