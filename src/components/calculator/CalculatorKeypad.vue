<script setup lang="ts">
const emit = defineEmits<{
  digit: [value: string]
  backspace: []
  clear: []
}>()

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
] as const
</script>

<template>
  <div class="keypad">
    <button type="button" class="key key--action" @click="emit('clear')">C</button>
    <div class="keypad-grid">
      <button
        v-for="key in keys.flat()"
        :key="key"
        type="button"
        class="key"
        :class="{ 'key--action': key === '⌫' || key === '.' }"
        @click="
          key === '⌫' ? emit('backspace') : key === '.' ? emit('digit', '.') : emit('digit', key)
        "
      >
        {{ key }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.keypad {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.keypad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.key {
  aspect-ratio: 1.6;
  border: 1px solid rgba(201, 169, 110, 0.15);
  border-radius: 0.75rem;
  background: rgba(0, 0, 0, 0.4);
  color: #f5f0e8;
  font-size: 1.35rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.15s;

  &:active {
    transform: scale(0.96);
    background: rgba(201, 169, 110, 0.15);
  }

  &--action {
    color: var(--Primary-Color);
    font-size: 1.1rem;
  }
}
</style>
