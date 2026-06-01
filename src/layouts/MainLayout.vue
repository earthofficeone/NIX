<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import { useRoute, useRouter } from 'vue-router'

defineProps<{
  title: string
  subtitle?: string
}>()

const route = useRoute()
const router = useRouter()

const hideNav = () =>
  route.name === 'add-record' || route.name === 'edit-record'

function goAdd() {
  router.push({ name: 'add-record' })
}
</script>

<template>
  <div class="main-layout">
    <div class="main-layout__inner">
      <AppHeader :title="title" :subtitle="subtitle" show-logout />
      <slot />
    </div>
    <button
      v-if="!hideNav()"
      type="button"
      class="lux-fab"
      aria-label="เพิ่มรายการ"
      @click="goAdd"
    >
      +
    </button>
    <BottomNav v-if="!hideNav()" />
  </div>
</template>

<style scoped lang="scss">
.main-layout {
  min-height: 100vh;
  padding-bottom: 5.5rem;
}

.main-layout__inner {
  max-width: 480px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 2rem;
}
</style>
