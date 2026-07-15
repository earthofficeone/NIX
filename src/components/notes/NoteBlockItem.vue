<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { GripVertical } from '@lucide/vue'
import type { NoteBlock, NoteBlockType } from '@/types'
import { isTextBlockType, SLASH_COMMANDS, type SlashCommand } from '@/utils/slashCommands'
import FileBlock from '@/components/notes/FileBlock.vue'
import ImageBlock from '@/components/notes/ImageBlock.vue'
import SlashCommandMenu from '@/components/notes/SlashCommandMenu.vue'
import TextBlockEditor from '@/components/notes/TextBlockEditor.vue'

const props = defineProps<{
  block: NoteBlock
  index: number
  blocks: NoteBlock[]
  autofocus?: boolean
  dragging?: boolean
  dragOver?: boolean
}>()

const emit = defineEmits<{
  enter: [index: number]
  backspace: [index: number]
  update: [index: number, content: string]
  typeChange: [index: number, type: NoteBlockType]
  focus: [el: HTMLElement]
  pasteImage: [index: number, file: File]
  fileUpdate: [
    index: number,
    payload: { content: string; fileName: string; fileMime: string; fileSize: number },
  ]
  remove: [index: number]
  insert: [index: number, type: NoteBlockType]
  convert: [index: number, type: NoteBlockType]
  handlePointerDown: [index: number, event: PointerEvent]
  handlePointerUp: [index: number]
}>()

const menuOpen = ref(false)
const menuPos = ref({ top: 0, left: 0 })
let pressBecameDrag = false

const listNumber = computed(() => {
  if (props.block.type !== 'numbered') return 1
  let count = 0
  for (let i = props.index; i >= 0; i--) {
    const b = props.blocks[i]
    if (!b || b.type !== 'numbered') break
    count++
  }
  return count
})

function openMenuFromHandle(handle: HTMLElement) {
  if (menuOpen.value) {
    menuOpen.value = false
    return
  }
  const rect = handle.getBoundingClientRect()
  menuPos.value = {
    top: rect.bottom + 6,
    left: Math.min(rect.left, window.innerWidth - 300),
  }
  menuOpen.value = true
}

function openMenu(e: MouseEvent) {
  openMenuFromHandle(e.currentTarget as HTMLElement)
}

function closeMenu() {
  menuOpen.value = false
}

function onMenuSelect(cmd: SlashCommand) {
  closeMenu()
  emit('insert', props.index, cmd.blockType)
}

function onHandlePointerDown(e: PointerEvent) {
  pressBecameDrag = false
  emit('handlePointerDown', props.index, e)
}

function onHandlePointerUp(e: PointerEvent) {
  emit('handlePointerUp', props.index)
  if (pressBecameDrag || props.dragging) return
  openMenuFromHandle(e.currentTarget as HTMLElement)
}

watch(
  () => props.dragging,
  (dragging) => {
    if (dragging) {
      pressBecameDrag = true
      closeMenu()
    }
  },
)

function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.note-block-item__handle-wrap') && !target.closest('.slash-menu')) {
    closeMenu()
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

defineExpose({ openMenu, openMenuFromHandle, closeMenu })
</script>

<template>
  <div
    class="note-block-item"
    :class="{
      'note-block-item--dragging': dragging,
      'note-block-item--drag-over': dragOver && !dragging,
    }"
    :data-block-index="index"
  >
    <div class="note-block-item__row">
      <div class="note-block-item__handle-wrap">
        <button
          type="button"
          class="note-block-item__handle"
          aria-label="กดค้างเพื่อลาก แตะเพื่อเมนู"
          :aria-expanded="menuOpen"
          @pointerdown="onHandlePointerDown"
          @pointerup="onHandlePointerUp"
        >
          <GripVertical :size="18" :stroke-width="1.75" />
        </button>
      </div>

      <div class="note-block-item__content">
        <TextBlockEditor
          v-if="isTextBlockType(block.type)"
          :block="block"
          :index="index"
          :list-number="listNumber"
          :autofocus="autofocus"
          @enter="emit('enter', $event)"
          @backspace="emit('backspace', $event)"
          @update="(i, c) => emit('update', i, c)"
          @type-change="(i, t) => emit('typeChange', i, t)"
          @focus="emit('focus', $event)"
          @paste-image="(i, f) => emit('pasteImage', i, f)"
          @convert="(i, t) => emit('convert', i, t)"
        />

        <ImageBlock
          v-else-if="block.type === 'image'"
          :block="block"
          :index="index"
          @update="(i, c) => emit('update', i, c)"
          @remove="emit('remove', $event)"
          @enter="emit('enter', $event)"
        />

        <FileBlock
          v-else-if="block.type === 'file'"
          :block="block"
          :index="index"
          @update="(i, p) => emit('fileUpdate', i, p)"
          @remove="emit('remove', $event)"
          @enter="emit('enter', $event)"
        />
      </div>
    </div>

    <SlashCommandMenu
      v-if="menuOpen"
      :commands="SLASH_COMMANDS"
      :active-index="0"
      :top="menuPos.top"
      :left="menuPos.left"
      @select="onMenuSelect"
    />
  </div>
</template>

<style scoped lang="scss">
.note-block-item {
  position: relative;
  margin-bottom: 0.15rem;
  border-radius: 0.55rem;
  transition:
    opacity 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &--dragging {
    opacity: 0.45;
    transform: scale(0.98);
  }

  &--drag-over {
    box-shadow: 0 -2px 0 0 var(--Primary-Color);
  }

  &:hover .note-block-item__handle,
  &:focus-within .note-block-item__handle,
  .note-block-item__handle[aria-expanded='true'] {
    opacity: 1;
  }

  &__row {
    display: flex;
    align-items: flex-start;
    gap: 0.15rem;
  }

  &__handle-wrap {
    flex-shrink: 0;
    width: 1.75rem;
    padding-top: 0.3rem;
  }

  &__handle {
    width: 1.75rem;
    height: 1.75rem;
    border: none;
    border-radius: 0.4rem;
    background: transparent;
    color: var(--Muted-Color);
    cursor: grab;
    touch-action: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition:
      opacity 0.2s ease,
      background 0.2s ease,
      color 0.2s ease;

    &:active {
      cursor: grabbing;
    }

    &:hover,
    &[aria-expanded='true'] {
      background: var(--Item-Hover);
      color: var(--Primary-Color);
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }
}
</style>
