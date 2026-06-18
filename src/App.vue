<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div v-if="!auth.ready" class="min-h-screen flex items-center justify-center">
    <p class="text-(--Hint-Color) text-sm tracking-[0.12em] uppercase">กำลังโหลด...</p>
  </div>
  <RouterView v-else />
</template>

<style scoped></style>
