<script setup lang="ts">
import { Plus } from '@lucide/vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import { useNoteStore } from '@/stores/notes'
import { useRoute, useRouter } from 'vue-router'

defineProps<{
  title: string
  subtitle?: string
}>()

const route = useRoute()
const router = useRouter()
const noteStore = useNoteStore()

const hideNav = () =>
  route.name === 'add-record' || route.name === 'edit-record' || route.name === 'note-editor'

async function handleFab() {
  if (route.name === 'notes') {
    const note = await noteStore.create()
    if (note) router.push({ name: 'note-editor', params: { id: note.id } })
    return
  }
  router.push({ name: 'add-record' })
}
</script>

<template>
  <div class="min-h-screen pb-22">
    <div class="max-w-[480px] m-auto pt-12 px-5 pb-8">
      <AppHeader :title="title" :subtitle="subtitle" show-logout />
      <slot />
    </div>
    <button v-if="!hideNav()" type="button" class="lux-fab" aria-label="เพิ่มรายการ" @click="handleFab">
      <Plus :size="28" :stroke-width="2" aria-hidden="true" />
    </button>
    <BottomNav v-if="!hideNav()" />
  </div>
</template>
