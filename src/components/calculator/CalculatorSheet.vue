<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import CalculatorKeypad from '@/components/calculator/CalculatorKeypad.vue'
import type { CalcOperator } from '@/composables/useCalculator'

const open = defineModel<boolean>({ default: false })

defineProps<{
  display: string
  liveResult?: string
}>()

const emit = defineEmits<{
  digit: [value: string]
  operator: [op: CalcOperator]
  equals: []
  backspace: []
  clear: []
  done: []
}>()

function close() {
  open.value = false
  emit('done')
}

watch(open, (visible) => {
  document.body.style.overflow = visible ? 'hidden' : ''
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="calc-sheet">
      <div v-if="open" class="calc-sheet" role="dialog" aria-modal="true" aria-label="แป้นตัวเลข">
        <button type="button" class="calc-sheet__backdrop" aria-label="ปิด" @click="close" />

        <div class="calc-sheet__panel" @mousedown.prevent>
          <div class="calc-sheet__handle" aria-hidden="true" />

          <header class="calc-sheet__header">
            <div class="calc-sheet__summary">
              <p class="calc-sheet__expression">{{ display || '0' }}</p>
              <p v-if="liveResult" class="calc-sheet__preview">= {{ liveResult }}</p>
            </div>
            <button type="button" class="calc-sheet__done" @click="close">เสร็จ</button>
          </header>

          <CalculatorKeypad
            class="calc-sheet__keypad"
            @digit="emit('digit', $event)"
            @operator="emit('operator', $event)"
            @equals="emit('equals')"
            @backspace="emit('backspace')"
            @clear="emit('clear')"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.calc-sheet {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.calc-sheet__backdrop {
  position: absolute;
  inset: 0;
  border: none;
  padding: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.calc-sheet__panel {
  position: relative;
  z-index: 1;
  margin: 0 auto;
  width: 100%;
  max-width: 480px;
  padding: 0.5rem 1rem calc(1rem + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, #1a1a1a 0%, #121212 100%);
  border-top: 1px solid rgba(201, 169, 110, 0.28);
  border-radius: 1.25rem 1.25rem 0 0;
  box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.5);
}

.calc-sheet__handle {
  width: 2.5rem;
  height: 4px;
  margin: 0.35rem auto 0.75rem;
  border-radius: 2px;
  background: rgba(201, 169, 110, 0.35);
}

.calc-sheet__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.calc-sheet__summary {
  flex: 1;
  min-width: 0;
  text-align: right;
}

.calc-sheet__expression {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 300;
  color: #f5f0e8;
  letter-spacing: 0.03em;
  word-break: break-all;
  line-height: 1.35;
}

.calc-sheet__preview {
  margin: 0.35rem 0 0;
  font-size: 1.1rem;
  color: var(--Primary-Color);
  font-weight: 300;
}

.calc-sheet__done {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 9999px;
  background: linear-gradient(135deg, #d4b87a 0%, #a8894a 100%);
  color: #1a1510;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}

.calc-sheet__keypad {
  :deep(.key) {
    min-height: 3rem;
  }
}

.calc-sheet-enter-active,
.calc-sheet-leave-active {
  transition: opacity 0.28s ease;
}

.calc-sheet-enter-active .calc-sheet__panel,
.calc-sheet-leave-active .calc-sheet__panel {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}

.calc-sheet-enter-active .calc-sheet__backdrop,
.calc-sheet-leave-active .calc-sheet__backdrop {
  transition: opacity 0.28s ease;
}

.calc-sheet-enter-from .calc-sheet__panel,
.calc-sheet-leave-to .calc-sheet__panel {
  transform: translateY(100%);
}

.calc-sheet-enter-from .calc-sheet__backdrop,
.calc-sheet-leave-to .calc-sheet__backdrop {
  opacity: 0;
}
</style>
