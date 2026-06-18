<template>
  <div class="min-h-screen flex items-center justify-center py-4 px-5 relative overflow-hidden">
    <div class="auth-layout__glow" />
    <div class="auth-layout__toggle">
      <ThemeToggle />
    </div>
    <div class="max-w-[400px] w-full relative z-10">
      <div class="text-center mb-10">
        <span class="text-[2.5rem] font-light tracking-wider text-(--Primary-Color) ml-[0.35rem]"
          >NIX</span
        >
        <p class="text-(--Subtle-Color) text-sm tracking-[3px] mt-2 uppercase">
          Private Ledger
        </p>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from '@/components/layout/ThemeToggle.vue'
</script>

<style scoped lang="scss">
.auth-layout__glow {
  position: absolute;
  top: -20%;
  left: 50%;
  width: 120%;
  height: 50%;
  pointer-events: none;
  transform: translateX(-50%);
  background: radial-gradient(ellipse, var(--Gradient-Glow) 0%, transparent 70%);
}

.auth-layout__toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 20;
}
</style>
