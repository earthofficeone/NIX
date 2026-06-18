<script setup lang="ts">
import { ChartPie, ClipboardList } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'dashboard', label: 'สรุป', icon: ChartPie },
  { name: 'records', label: 'บันทึก', icon: ClipboardList },
] as const

function go(name: string) {
  router.push({ name })
}
</script>

<template>
  <nav class="bottom-nav lux-card">
    <button
      v-for="tab in tabs"
      :key="tab.name"
      type="button"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': route.name === tab.name }"
      @click="go(tab.name)"
    >
      <component :is="tab.icon" class="bottom-nav__icon" :size="20" :stroke-width="1.75" />
      <span class="bottom-nav__label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 0.65rem 1rem calc(0.65rem + env(safe-area-inset-bottom));
  border-radius: 1.25rem 1.25rem 0 0;
  z-index: 50;
}

.bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.4rem;
  border: none;
  background: transparent;
  color: var(--Muted-Color);
  cursor: pointer;
  transition: color 0.2s;

  &--active {
    color: var(--Primary-Color);
  }
}

.bottom-nav__icon {
  display: block;
}

.bottom-nav__label {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
</style>
