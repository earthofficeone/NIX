<script setup lang="ts">
import type { CalcOperator } from '@/composables/useCalculator'

const emit = defineEmits<{
  digit: [value: string]
  operator: [op: CalcOperator]
  equals: []
  backspace: []
  clear: []
}>()

const digitRows = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['0', '.'],
] as const

const operators: { key: CalcOperator; label: string }[] = [
  { key: '÷', label: '÷' },
  { key: '×', label: '×' },
  { key: '-', label: '−' },
  { key: '+', label: '+' },
]

function onDigit(key: string) {
  if (key === '⌫') emit('backspace')
  else emit('digit', key)
}
</script>

<template>
  <div class="keypad">
    <div class="keypad__row keypad__row--top">
      <button type="button" class="key key--action" title="ล้างทั้งหมด" @click="emit('clear')">
        C
      </button>
      <button
        type="button"
        class="key key--action"
        title="ลบทีละหลัก"
        @click="emit('backspace')"
      >
        ⌫
      </button>
      <button type="button" class="key key--equals" title="เท่ากับ" @click="emit('equals')">
        =
      </button>
    </div>

    <div class="keypad__body">
      <div class="keypad__digits">
        <div v-for="(row, i) in digitRows" :key="i" class="keypad__row">
          <button
            v-for="key in row"
            :key="key"
            type="button"
            class="key"
            :class="{ 'key--zero': key === '0' }"
            @click="onDigit(key)"
          >
            {{ key }}
          </button>
          <button
            v-if="i === digitRows.length - 1"
            type="button"
            class="key key--action"
            @click="emit('backspace')"
          >
            ⌫
          </button>
        </div>
      </div>

      <div class="keypad__ops">
        <button
          v-for="op in operators"
          :key="op.key"
          type="button"
          class="key key--op"
          @click="emit('operator', op.key)"
        >
          {{ op.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.keypad {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.keypad__body {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
}

.keypad__digits {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.keypad__row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;

  &--top {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.keypad__ops {
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  gap: 0.5rem;
}

.key {
  min-height: 2.75rem;
  border: 1px solid rgba(201, 169, 110, 0.15);
  border-radius: 0.75rem;
  background: rgba(0, 0, 0, 0.4);
  color: #f5f0e8;
  font-size: 1.25rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.15s;

  &:active {
    transform: scale(0.96);
    background: rgba(201, 169, 110, 0.15);
  }

  &--zero {
    grid-column: span 2;
  }

  &--action {
    color: var(--Primary-Color);
    font-size: 1rem;
  }

  &--op {
    min-width: 2.75rem;
    color: var(--Primary-Color);
    background: rgba(201, 169, 110, 0.08);
    border-color: rgba(201, 169, 110, 0.28);
    font-size: 1.35rem;
  }

  &--equals {
    color: #1a1510;
    background: linear-gradient(135deg, #d4b87a 0%, #a8894a 100%);
    border-color: transparent;
    font-weight: 500;
    font-size: 1.2rem;

    &:active {
      background: linear-gradient(135deg, #e0c88a 0%, #b89555 100%);
    }
  }
}
</style>
