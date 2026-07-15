import { request } from '@/api/http'
import type { Note, NoteBlock } from '@/types'

export type NotePayload = {
  title: string
  blocks: NoteBlock[]
}

export const notesApi = {
  list() {
    return request<Note[]>('/notes')
  },

  get(id: string) {
    return request<Note>(`/notes/${id}`)
  },

  create(body: NotePayload) {
    return request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  update(id: string, body: NotePayload) {
    return request<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },

  delete(id: string) {
    return request<{ ok: boolean }>(`/notes/${id}`, { method: 'DELETE' })
  },
}
