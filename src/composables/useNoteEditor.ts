import { nextTick, ref, watch, type Ref } from 'vue'
import type { NoteBlock, NoteBlockType } from '@/types'
import { isEmptyHtml } from '@/utils/noteContent'
import { readImageFile } from '@/utils/noteFiles'
import { isTextBlockType } from '@/utils/slashCommands'
import { defaultBlocks, useNoteStore } from '@/stores/notes'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useNoteEditor(noteId: Ref<string>) {
  const noteStore = useNoteStore()

  const title = ref('')
  const blocks = ref<NoteBlock[]>(defaultBlocks())
  const loading = ref(true)
  const saveStatus = ref<SaveStatus>('idle')
  const ready = ref(false)

  let saveTimer: ReturnType<typeof setTimeout> | null = null
  let savedTimer: ReturnType<typeof setTimeout> | null = null

  function clearTimers() {
    if (saveTimer) clearTimeout(saveTimer)
    if (savedTimer) clearTimeout(savedTimer)
  }

  async function loadNote() {
    loading.value = true
    ready.value = false
    const note = await noteStore.fetchById(noteId.value)
    if (!note) {
      loading.value = false
      return false
    }
    title.value = note.title
    blocks.value = note.blocks.length ? [...note.blocks] : defaultBlocks()
    loading.value = false
    ready.value = true
    return true
  }

  async function persist() {
    if (!ready.value) return

    saveStatus.value = 'saving'
    const updated = await noteStore.update(noteId.value, {
      title: title.value,
      blocks: blocks.value,
    })
    saveStatus.value = updated ? 'saved' : 'error'

    if (savedTimer) clearTimeout(savedTimer)
    savedTimer = setTimeout(() => {
      if (saveStatus.value === 'saved') saveStatus.value = 'idle'
    }, 2000)
  }

  function scheduleSave() {
    if (!ready.value) return
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      void persist()
    }, 600)
  }

  function addBlockAfter(index: number, type: NoteBlockType = 'paragraph') {
    const block = noteStore.createBlock('', type)
    blocks.value.splice(index + 1, 0, block)
    scheduleSave()
    return block.id
  }

  function insertBlockAfter(index: number, type: NoteBlockType) {
    return addBlockAfter(index, type)
  }

  function removeBlock(index: number) {
    if (blocks.value.length <= 1) {
      blocks.value[0] = noteStore.createBlock()
      scheduleSave()
      return blocks.value[0]?.id
    }
    blocks.value.splice(index, 1)
    scheduleSave()
    return blocks.value[Math.max(0, index - 1)]?.id
  }

  function updateBlockContent(index: number, content: string) {
    const block = blocks.value[index]
    if (!block) return
    block.content = content
    scheduleSave()
  }

  function updateBlockFile(
    index: number,
    payload: { content: string; fileName: string; fileMime: string; fileSize: number },
  ) {
    const block = blocks.value[index]
    if (!block) return
    block.content = payload.content
    block.fileName = payload.fileName
    block.fileMime = payload.fileMime
    block.fileSize = payload.fileSize
    scheduleSave()
  }

  function updateBlockType(index: number, type: NoteBlockType) {
    const block = blocks.value[index]
    if (!block) return
    block.type = type
    scheduleSave()
  }

  function handleEnter(index: number): string | undefined {
    const block = blocks.value[index]
    if (block && (block.type === 'image' || block.type === 'file')) {
      return addBlockAfter(index, 'paragraph')
    }
    return addBlockAfter(index)
  }

  function convertBlock(index: number, type: NoteBlockType): string | undefined {
    const block = blocks.value[index]
    if (!block) return undefined
    block.type = type
    block.content = ''
    delete block.fileName
    delete block.fileMime
    delete block.fileSize
    scheduleSave()
    return block.id
  }

  function handleBackspace(index: number): string | undefined {
    const block = blocks.value[index]
    if (!block) return undefined
    if (block.type === 'image' || block.type === 'file') return undefined
    if (!isEmptyHtml(block.content)) return undefined
    return removeBlock(index)
  }

  async function insertImageFromFile(index: number, file: File): Promise<string | undefined> {
    try {
      const dataUrl = await readImageFile(file)
      const blockId = addBlockAfter(index, 'image')
      const newIndex = blocks.value.findIndex((b) => b.id === blockId)
      if (newIndex !== -1) updateBlockContent(newIndex, dataUrl)
      return blockId
    } catch {
      return undefined
    }
  }

  function moveBlock(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= blocks.value.length || to >= blocks.value.length) {
      return
    }
    const list = [...blocks.value]
    const [item] = list.splice(from, 1)
    if (!item) return
    list.splice(to, 0, item)
    blocks.value = list
    scheduleSave()
  }

  async function deleteNote(): Promise<boolean> {
    clearTimers()
    return noteStore.remove(noteId.value)
  }

  watch([title, blocks], scheduleSave, { deep: true })

  return {
    title,
    blocks,
    loading,
    saveStatus,
    ready,
    loadNote,
    persist,
    scheduleSave,
    addBlockAfter,
    insertBlockAfter,
    removeBlock,
    updateBlockContent,
    updateBlockFile,
    updateBlockType,
    handleEnter,
    handleBackspace,
    insertImageFromFile,
    convertBlock,
    moveBlock,
    deleteNote,
    clearTimers,
    isTextBlockType,
  }
}

export async function focusBlock(blockId?: string) {
  if (!blockId) return
  await nextTick()
  const el = document.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`)
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    el.focus()
    return
  }
  if (el?.hasAttribute('contenteditable')) {
    el.focus()
    return
  }
  el?.focus()
}
