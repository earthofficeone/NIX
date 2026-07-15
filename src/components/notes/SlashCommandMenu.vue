<script setup lang="ts">
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Image,
  List,
  ListOrdered,
  Paperclip,
  Quote,
  Type,
} from '@lucide/vue'
import { computed } from 'vue'
import type { SlashCommand } from '@/utils/slashCommands'

const props = defineProps<{
  commands: SlashCommand[]
  activeIndex: number
  top: number
  left: number
}>()

const emit = defineEmits<{
  select: [command: SlashCommand]
}>()

const iconMap = {
  text: Type,
  heading1: Heading1,
  heading2: Heading2,
  heading3: Heading3,
  heading4: Heading4,
  bullet: List,
  numbered: ListOrdered,
  code: Code,
  quote: Quote,
  image: Image,
  file: Paperclip,
} as const

const grouped = computed(() => {
  const groups: { key: string; label: string; items: SlashCommand[] }[] = [
    { key: 'basic', label: 'พื้นฐาน', items: [] },
    { key: 'list', label: 'รายการ', items: [] },
    { key: 'media', label: 'สื่อ', items: [] },
  ]
  for (const cmd of props.commands) {
    const group = groups.find((g) => g.key === cmd.group)
    group?.items.push(cmd)
  }
  return groups.filter((g) => g.items.length > 0)
})

function flatIndex(cmd: SlashCommand): number {
  return props.commands.indexOf(cmd)
}

function pick(cmd: SlashCommand) {
  emit('select', cmd)
}
</script>

<template>
  <div
    class="slash-menu lux-card"
    :style="{ top: `${top}px`, left: `${left}px` }"
    role="listbox"
    @mousedown.prevent
  >
    <template v-for="group in grouped" :key="group.key">
      <p class="slash-menu__group">{{ group.label }}</p>
      <button
        v-for="cmd in group.items"
        :key="cmd.id"
        type="button"
        class="slash-menu__item"
        :class="{ 'slash-menu__item--active': flatIndex(cmd) === activeIndex }"
        role="option"
        :aria-selected="flatIndex(cmd) === activeIndex"
        @click="pick(cmd)"
      >
        <span class="slash-menu__icon" aria-hidden="true">
          <component :is="iconMap[cmd.id as keyof typeof iconMap] ?? Type" :size="18" :stroke-width="1.75" />
        </span>
        <span class="slash-menu__text">
          <span class="slash-menu__label">{{ cmd.label }}</span>
          <span class="slash-menu__desc">{{ cmd.description }}</span>
        </span>
      </button>
    </template>

    <p v-if="!commands.length" class="slash-menu__empty">ไม่พบคำสั่ง</p>
  </div>
</template>

<style scoped lang="scss">
.slash-menu {
  position: fixed;
  z-index: 70;
  width: min(18rem, calc(100vw - 2rem));
  max-height: 18rem;
  overflow-y: auto;
  padding: 0.35rem;
  border-radius: 0.85rem;
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.32);

  &__group {
    margin: 0.35rem 0.5rem 0.25rem;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--Muted-Color);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    padding: 0.55rem 0.6rem;
    border: none;
    border-radius: 0.55rem;
    background: transparent;
    color: var(--Text-Color);
    cursor: pointer;
    text-align: left;

    &:hover,
    &--active {
      background: var(--Item-Selected);
    }
  }

  &__icon {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 0.45rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--Input-Background);
    color: var(--Primary-Color);
  }

  &__text {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  &__label {
    font-size: 0.88rem;
    color: var(--Text-Color);
  }

  &__desc {
    font-size: 0.68rem;
    color: var(--Muted-Color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__empty {
    margin: 0.5rem;
    font-size: 0.8rem;
    color: var(--Muted-Color);
    text-align: center;
  }
}
</style>
