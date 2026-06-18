<script setup lang="ts">
import type { TransactionType } from '@/types'

const model = defineModel<TransactionType>({ required: true })
</script>

<template>
  <div class="toggle">
    <button
      type="button"
      class="toggle__btn"
      :class="{ 'toggle__btn--active toggle__btn--income': model === 'income' }"
      @click="model = 'income'"
    >
      รายรับ
    </button>
    <button
      type="button"
      class="toggle__btn"
      :class="{ 'toggle__btn--active toggle__btn--expense': model === 'expense' }"
      @click="model = 'expense'"
    >
      รายจ่าย
    </button>
  </div>
</template>

<style scoped lang="scss">
.toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  padding: 0.25rem;
  background: var(--Input-Background);
  border-radius: 9999px;
  border: 1px solid var(--Border-Color);
}

.toggle__btn {
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: var(--Muted-Color);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s;

  &--active.toggle__btn--income {
    background: var(--Success-Badge-Bg);
    color: var(--Success-Text);
  }

  &--active.toggle__btn--expense {
    background: var(--Danger-Badge-Bg);
    color: var(--Danger-Text);
  }
}
</style>
