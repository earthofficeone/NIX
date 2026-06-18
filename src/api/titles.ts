import { request } from '@/api/http'
import type { RecordTitle } from '@/types'

export const titlesApi = {
  list(type: string) {
    return request<RecordTitle[]>(`/titles?type=${encodeURIComponent(type)}`)
  },

  create(body: { type: string; name: string }) {
    return request<RecordTitle>('/titles', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  update(id: string, body: { name: string }) {
    return request<RecordTitle>(`/titles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },

  delete(id: string) {
    return request<{ ok: boolean }>(`/titles/${id}`, { method: 'DELETE' })
  },
}
