<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRef } from 'vue'
import { ArrowLeft, Image, MoreHorizontal, Paperclip, Trash2 } from '@lucide/vue'
import { useRouter } from 'vue-router'
import FormatToolbar from '@/components/notes/FormatToolbar.vue'
import NoteBlockItem from '@/components/notes/NoteBlockItem.vue'
import { focusBlock, useNoteEditor } from '@/composables/useNoteEditor'
import { useBlockReorder } from '@/composables/useBlockReorder'
import { useRichText } from '@/composables/useRichText'
import type { NoteBlockType } from '@/types'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const noteId = toRef(() => props.id)

const {
  title,
  blocks,
  loading,
  saveStatus,
  ready,
  loadNote,
  updateBlockContent,
  updateBlockFile,
  updateBlockType,
  handleEnter,
  handleBackspace,
  insertBlockAfter,
  removeBlock,
  insertImageFromFile,
  convertBlock,
  moveBlock,
  deleteNote,
  clearTimers,
} = useNoteEditor(noteId)

const { draggingIndex, dragOverIndex, onHandlePointerDown } = useBlockReorder(moveBlock)

const { toolbar, registerEditor, hideToolbar, applyFormat } = useRichText()

const showMenu = ref(false)
const focusBlockId = ref<string | undefined>()

const saveLabel = computed(() => {
  if (saveStatus.value === 'saving') return 'กำลังบันทึก...'
  if (saveStatus.value === 'saved') return 'บันทึกแล้ว'
  if (saveStatus.value === 'error') return 'บันทึกไม่สำเร็จ'
  return ''
})

onMounted(async () => {
  const ok = await loadNote()
  if (!ok) {
    router.replace({ name: 'notes' })
    return
  }
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  clearTimers()
  document.removeEventListener('click', onDocClick)
})

function goBack() {
  router.push({ name: 'notes' })
}

async function onEnter(index: number) {
  const blockId = handleEnter(index)
  focusBlockId.value = blockId
  await focusBlock(blockId)
}

async function onBackspace(index: number) {
  const blockId = handleBackspace(index)
  focusBlockId.value = blockId
  await focusBlock(blockId)
}

function onTypeChange(index: number, type: NoteBlockType) {
  updateBlockType(index, type)
}

function onEditorFocus(el: HTMLElement) {
  registerEditor(el)
}

async function onPasteImage(index: number, file: File) {
  const blockId = await insertImageFromFile(index, file)
  focusBlockId.value = blockId
  await focusBlock(blockId)
}

async function onInsert(index: number, type: NoteBlockType) {
  const blockId = insertBlockAfter(index, type)
  focusBlockId.value = blockId
  await focusBlock(blockId)
}

async function onConvert(index: number, type: NoteBlockType) {
  const blockId = convertBlock(index, type)
  focusBlockId.value = blockId
  await focusBlock(blockId)
}

function onRemove(index: number) {
  const blockId = removeBlock(index)
  focusBlockId.value = blockId
  void focusBlock(blockId)
}

function onBlockHandlePointerDown(index: number, e: PointerEvent) {
  onHandlePointerDown(index, e)
}

function appendBlock(type: NoteBlockType) {
  const lastIndex = Math.max(0, blocks.value.length - 1)
  void onInsert(lastIndex, type)
}

function toggleMenu() {
  showMenu.value = !showMenu.value
}

async function confirmDelete() {
  showMenu.value = false
  const ok = await deleteNote()
  if (ok) router.push({ name: 'notes' })
}

function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.note-editor__menu')) {
    showMenu.value = false
  }
  if (!target.closest('.text-block__editor') && !target.closest('.format-toolbar') && !target.closest('.slash-menu')) {
    hideToolbar()
  }
}
</script>

<template>
  <div class="note-editor min-h-screen">
    <header class="note-editor__header">
      <button type="button" class="note-editor__back" aria-label="กลับ" @click="goBack">
        <ArrowLeft :size="22" :stroke-width="1.75" />
      </button>

      <span v-if="saveLabel" class="note-editor__status">{{ saveLabel }}</span>

      <div class="note-editor__menu">
        <button type="button" class="note-editor__menu-btn" aria-label="ตัวเลือก" @click.stop="toggleMenu">
          <MoreHorizontal :size="22" :stroke-width="1.75" />
        </button>
        <div v-if="showMenu" class="note-editor__dropdown lux-card">
          <button type="button" class="note-editor__dropdown-item note-editor__dropdown-item--danger" @click="confirmDelete">
            <Trash2 :size="16" :stroke-width="1.75" />
            ลบโน๊ต
          </button>
        </div>
      </div>
    </header>

    <main v-if="!loading && ready" class="note-editor__body">
      <input
        v-model="title"
        type="text"
        class="note-editor__title"
        placeholder="ไม่มีชื่อ"
        aria-label="ชื่อโน๊ต"
      />

      <div class="note-editor__attach-bar">
        <button type="button" class="note-editor__attach-btn" @click="appendBlock('image')">
          <Image :size="16" :stroke-width="1.75" />
          รูปภาพ
        </button>
        <button type="button" class="note-editor__attach-btn" @click="appendBlock('file')">
          <Paperclip :size="16" :stroke-width="1.75" />
          ไฟล์
        </button>
      </div>

      <div class="note-editor__blocks">
        <NoteBlockItem
          v-for="(block, index) in blocks"
          :key="block.id"
          :block="block"
          :index="index"
          :blocks="blocks"
          :autofocus="focusBlockId === block.id"
          :dragging="draggingIndex === index"
          :drag-over="dragOverIndex === index"
          @enter="onEnter"
          @backspace="onBackspace"
          @update="updateBlockContent"
          @type-change="onTypeChange"
          @focus="onEditorFocus"
          @paste-image="onPasteImage"
          @file-update="updateBlockFile"
          @remove="onRemove"
          @insert="onInsert"
          @convert="onConvert"
          @handle-pointer-down="onBlockHandlePointerDown"
        />
      </div>
    </main>

    <p v-else class="note-editor__loading">กำลังโหลด...</p>

    <FormatToolbar
      v-if="toolbar.visible"
      :top="toolbar.top"
      :left="toolbar.left"
      @format="applyFormat"
    />
  </div>
</template>

<style scoped lang="scss">
.note-editor {
  position: relative;
  max-width: 480px;
  margin: 0 auto;
  padding: 0 1.25rem calc(2rem + env(safe-area-inset-bottom));

  &__header {
    position: sticky;
    top: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1rem 0 0.75rem;
    background: var(--App-Background, var(--Background-Color));
  }

  &__back,
  &__menu-btn {
    width: 2.5rem;
    height: 2.5rem;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--Text-Color);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: var(--Item-Hover);
    }
  }

  &__status {
    flex: 1;
    text-align: center;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--Muted-Color);
  }

  &__menu {
    position: relative;
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 0.35rem);
    right: 0;
    min-width: 10rem;
    padding: 0.35rem;
    z-index: 40;
  }

  &__dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: none;
    border-radius: 0.65rem;
    background: transparent;
    color: var(--Text-Color);
    font-size: 0.85rem;
    cursor: pointer;

    &:hover {
      background: var(--Item-Hover);
    }

    &--danger {
      color: var(--Danger-Text);
    }
  }

  &__body {
    padding-top: 0.5rem;
  }

  &__title {
    width: 100%;
    margin: 0 0 0.75rem;
    padding: 0.25rem 0;
    border: none;
    background: transparent;
    font-size: 1.75rem;
    font-weight: 500;
    line-height: 1.25;
    color: var(--Text-Color);
    outline: none;

    &::placeholder {
      color: var(--Placeholder-Color);
    }
  }

  &__attach-bar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  &__attach-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.45rem 0.75rem;
    border: 1px solid var(--Card-Border);
    border-radius: 9999px;
    background: transparent;
    color: var(--Muted-Color);
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;

    &:hover {
      border-color: var(--Primary-Color);
      color: var(--Primary-Color);
    }
  }

  &__blocks {
    min-height: 50vh;
  }

  &__loading {
    text-align: center;
    color: var(--Hint-Color);
    padding: 3rem 0;
  }
}
</style>
