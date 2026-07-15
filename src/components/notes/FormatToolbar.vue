<script setup lang="ts">
import { Bold, Code, Italic, Link, Strikethrough, Type, Underline } from '@lucide/vue'
import type { FormatCommand } from '@/composables/useRichText'

defineProps<{
  top: number
  left: number
}>()

const emit = defineEmits<{
  format: [command: FormatCommand, value?: string]
}>()

const colors = [
  { label: 'ทอง', value: '#c9a96e' },
  { label: 'แดง', value: '#e08a8a' },
  { label: 'ฟ้า', value: '#7eb8da' },
  { label: 'เขียว', value: '#8bc9a0' },
  { label: 'ค่าเริ่มต้น', value: 'inherit' },
]

function run(command: FormatCommand, value?: string) {
  emit('format', command, value)
}
</script>

<template>
  <div class="format-toolbar lux-card" :style="{ top: `${top}px`, left: `${left}px` }" @mousedown.prevent>
    <div class="format-toolbar__row">
      <button type="button" class="format-toolbar__btn" title="ตัวหนา" @click="run('bold')">
        <Bold :size="16" :stroke-width="2" />
      </button>
      <button type="button" class="format-toolbar__btn" title="ตัวเอียง" @click="run('italic')">
        <Italic :size="16" :stroke-width="2" />
      </button>
      <button type="button" class="format-toolbar__btn" title="ขีดเส้นใต้" @click="run('underline')">
        <Underline :size="16" :stroke-width="2" />
      </button>
      <button type="button" class="format-toolbar__btn" title="ขีดฆ่า" @click="run('strikeThrough')">
        <Strikethrough :size="16" :stroke-width="2" />
      </button>
      <button type="button" class="format-toolbar__btn" title="ลิงก์" @click="run('link')">
        <Link :size="16" :stroke-width="2" />
      </button>
      <button type="button" class="format-toolbar__btn" title="โค้ด" @click="run('code')">
        <Code :size="16" :stroke-width="2" />
      </button>
      <button type="button" class="format-toolbar__btn" title="ล้างรูปแบบ" @click="run('clear')">
        <Type :size="16" :stroke-width="2" />
      </button>
    </div>
    <div class="format-toolbar__colors">
      <button
        v-for="color in colors"
        :key="color.value"
        type="button"
        class="format-toolbar__color"
        :title="color.label"
        :style="{ background: color.value === 'inherit' ? 'var(--Text-Color)' : color.value }"
        @click="run('color', color.value)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.format-toolbar {
  position: absolute;
  z-index: 60;
  padding: 0.4rem 0.45rem;
  border-radius: 0.85rem;
  min-width: 11rem;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);

  &__row {
    display: flex;
    gap: 0.15rem;
    margin-bottom: 0.35rem;
  }

  &__btn {
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 0.45rem;
    background: transparent;
    color: var(--Text-Color);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: var(--Item-Hover);
      color: var(--Primary-Color);
    }
  }

  &__colors {
    display: flex;
    gap: 0.35rem;
    padding-top: 0.15rem;
    border-top: 1px solid var(--Card-Border);
  }

  &__color {
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 50%;
    border: 1px solid var(--Card-Border);
    cursor: pointer;
    padding: 0;
  }
}
</style>
