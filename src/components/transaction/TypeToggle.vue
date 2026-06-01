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
  background: rgba(0, 0, 0, 0.35);
  border-radius: 9999px;
  border: 1px solid rgba(201, 169, 110, 0.15);
}

.toggle__btn {
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: rgba(245, 240, 232, 0.5);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s;

  &--active.toggle__btn--income {
    background: rgba(107, 157, 122, 0.25);
    color: #8ec49a;
  }

  &--active.toggle__btn--expense {
    background: rgba(196, 92, 92, 0.25);
    color: #e08a8a;
  }
}
</style>
