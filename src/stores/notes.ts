import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, ApiError } from '@/api/client'
import type { Note, NoteBlock, NoteBlockType } from '@/types'
import { stripHtml } from '@/utils/noteContent'

type BlockMeta = Pick<NoteBlock, 'fileName' | 'fileMime' | 'fileSize'>

function createBlock(
  content = '',
  type: NoteBlockType = 'paragraph',
  meta?: BlockMeta,
): NoteBlock {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    ...meta,
  }
}

export function defaultBlocks(): NoteBlock[] {
  return [createBlock()]
}

export const useNoteStore = defineStore('notes', () => {
  const items = ref<Note[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sortedNotes = computed(() =>
    [...items.value].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  )

  function getById(id: string) {
    return items.value.find((n) => n.id === id)
  }

  function blockPreview(block: NoteBlock): string {
    if (block.type === 'image') return '[รูปภาพ]'
    if (block.type === 'file') return block.fileName?.trim() || '[ไฟล์]'
    if (block.type === 'code') return '[โค้ด]'
    if (block.type === 'quote') return '[คำคม]'
    if (block.type.startsWith('heading')) return stripHtml(block.content) || '[หัวข้อ]'
    return stripHtml(block.content)
  }

  function notePreview(note: Note): string {
    const text = note.blocks
      .map(blockPreview)
      .filter(Boolean)
      .join(' ')
    return text || 'โน๊ตว่าง'
  }

  function noteDisplayTitle(note: Note): string {
    return note.title.trim() || 'ไม่มีชื่อ'
  }

  async function fetchList() {
    loading.value = true
    error.value = null
    try {
      items.value = await api.notes.list()
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'โหลดโน๊ตไม่สำเร็จ'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string): Promise<Note | null> {
    const cached = getById(id)
    if (cached) return cached
    try {
      const note = await api.notes.get(id)
      const idx = items.value.findIndex((n) => n.id === id)
      if (idx === -1) items.value.unshift(note)
      else items.value[idx] = note
      return note
    } catch {
      return null
    }
  }

  async function create(payload?: { title?: string; blocks?: NoteBlock[] }): Promise<Note | null> {
    try {
      const note = await api.notes.create({
        title: payload?.title ?? '',
        blocks: payload?.blocks ?? defaultBlocks(),
      })
      items.value.unshift(note)
      return note
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'สร้างโน๊ตไม่สำเร็จ'
      return null
    }
  }

  async function update(
    id: string,
    payload: { title: string; blocks: NoteBlock[] },
  ): Promise<Note | null> {
    try {
      const note = await api.notes.update(id, payload)
      const idx = items.value.findIndex((n) => n.id === id)
      if (idx !== -1) items.value[idx] = note
      else items.value.unshift(note)
      return note
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'บันทึกโน๊ตไม่สำเร็จ'
      return null
    }
  }

  async function remove(id: string): Promise<boolean> {
    try {
      await api.notes.delete(id)
      items.value = items.value.filter((n) => n.id !== id)
      return true
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'ลบโน๊ตไม่สำเร็จ'
      return false
    }
  }

  function clear() {
    items.value = []
  }

  return {
    items,
    loading,
    error,
    sortedNotes,
    getById,
    notePreview,
    noteDisplayTitle,
    fetchList,
    fetchById,
    create,
    update,
    remove,
    clear,
    createBlock,
    defaultBlocks,
  }
})
