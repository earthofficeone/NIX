<script setup lang="ts">
import { Sun, Moon } from '@lucide/vue'
import { useTheme } from '@/composables/useTheme'

const { theme, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'"
    @click="toggle"
  >
    <Sun v-if="theme === 'dark'" :size="18" :stroke-width="1.75" aria-hidden="true" />
    <Moon v-else :size="18" :stroke-width="1.75" aria-hidden="true" />
  </button>
</template>

<style scoped lang="scss">
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 1px solid var(--Card-Border);
  border-radius: 9999px;
  background: transparent;
  color: var(--Muted-Color);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s,
    background 0.2s;

  &:hover {
    color: var(--Primary-Color);
    border-color: var(--Primary-Color);
    background: var(--Ghost-Hover);
  }
}
</style>
