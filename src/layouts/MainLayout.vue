<script setup lang="ts">
import { Plus } from '@lucide/vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import { useRoute, useRouter } from 'vue-router'

defineProps<{
  title: string
  subtitle?: string
}>()

const route = useRoute()
const router = useRouter()

const hideNav = () => route.name === 'add-record' || route.name === 'edit-record'

function goAdd() {
  router.push({ name: 'add-record' })
}
</script>

<template>
  <div class="min-h-screen pb-22">
    <div class="max-w-[480px] m-auto pt-6 px-5 pb-8">
      <AppHeader :title="title" :subtitle="subtitle" show-logout />
      <slot />
    </div>
    <button v-if="!hideNav()" type="button" class="lux-fab" aria-label="เพิ่มรายการ" @click="goAdd">
      <Plus :size="28" :stroke-width="2" aria-hidden="true" />
    </button>
    <BottomNav v-if="!hideNav()" />
  </div>
</template>
