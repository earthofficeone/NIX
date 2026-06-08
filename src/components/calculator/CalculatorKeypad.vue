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
  <div class="flex flex-col gap-2">
    <!-- main keypad -->
    <div class="grid grid-cols-[1fr_auto] gap-2">
      <!-- digits -->
      <div class="flex flex-col gap-2">
        <div v-for="(row, i) in digitRows" :key="i" class="grid grid-cols-3 gap-2">
          <button
            v-for="key in row"
            :key="key"
            type="button"
            @click="onDigit(key)"
            :class="[
              // base key
              'min-h-11 rounded-xl border border-(--Border-Color)',
              'bg-black/50 text-(--Text-Color) text-xl font-light',
              'cursor-pointer transition-all duration-150',
              'active:scale-95 active:bg-(--Border-Color)',

              // zero key
              key === '0' && 'col-span-2',
            ]"
          >
            {{ key }}
          </button>
        </div>
      </div>

      <!-- operators -->
      <div class="grid grid-rows-4 gap-2">
        <button
          v-for="op in operators"
          :key="op.key"
          type="button"
          @click="emit('operator', op.key)"
          class="min-h-11 min-w-11 rounded-xl border bg-(--Primary-Color)/5 text-(--Primary-Color) text-[1.35rem] font-light cursor-pointer transition-all duration-150 active:scale-95 active:bg-(--Border-Color)"
        >
          {{ op.label }}
        </button>
      </div>
    </div>

    <!-- actions -->
    <div class="grid grid-cols-3 gap-2">
      <!-- clear -->
      <button
        type="button"
        title="ล้างทั้งหมด"
        @click="emit('clear')"
        class="min-h-11 rounded-xl border border-(--Border-Color) bg-black/50 text-(--Primary-Color) text-base font-light cursor-pointer transition-all duration-150 active:scale-95 active:bg-(--Border-Color)"
      >
        C
      </button>

      <!-- backspace -->
      <button
        type="button"
        title="ลบทีละหลัก"
        @click="emit('backspace')"
        class="min-h-11 rounded-xl border border-(--Border-Color) bg-black/50 text-(--Primary-Color) text-base font-light cursor-pointer transition-all duration-150 active:scale-95 active:bg-(--Border-Color)"
      >
        ⌫
      </button>

      <!-- equals -->
      <button
        type="button"
        title="เท่ากับ"
        @click="emit('equals')"
        class="min-h-11 rounded-xl border border-transparent text-(--Text-Color) text-[1.2rem] font-medium bg-gradient-to-r from-(--Primary-Color) to-(--Primary-Color)/50 cursor-pointer transition-all duration-150 active:scale-95 active:bg-gradient-to-r from-(--Primary-Color)/50 to-(--Primary-Color)/100"
      >
        =
      </button>
    </div>
  </div>
</template>
