import { ref, unref, watch, type MaybeRef } from 'vue'
import { api, ApiError } from '@/api/client'
import type { RecordTitle, TransactionType } from '@/types'

export function useTitlePresets(transactionType: MaybeRef<TransactionType>) {
  const titles = ref<RecordTitle[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTitles() {
    loading.value = true
    error.value = null
    try {
      titles.value = await api.titles.list(unref(transactionType))
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'โหลดหัวข้อไม่สำเร็จ'
      titles.value = []
    } finally {
      loading.value = false
    }
  }

  watch(() => unref(transactionType), fetchTitles, { immediate: true })

  async function add(name: string): Promise<RecordTitle | null> {
    const trimmed = name.trim()
    if (!trimmed) return null

    const existing = titles.value.find((item) => item.name === trimmed)
    if (existing) return existing

    try {
      const created = await api.titles.create({ type: unref(transactionType), name: trimmed })
      titles.value = [...titles.value, created].sort((a, b) => a.name.localeCompare(b.name, 'th'))
      return created
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        await fetchTitles()
        return titles.value.find((item) => item.name === trimmed) ?? null
      }
      return null
    }
  }

  async function update(id: string, name: string): Promise<RecordTitle | null> {
    const trimmed = name.trim()
    if (!trimmed) return null

    const duplicate = titles.value.find((item) => item.id !== id && item.name === trimmed)
    if (duplicate) return duplicate

    try {
      const updated = await api.titles.update(id, { name: trimmed })
      titles.value = titles.value
        .map((item) => (item.id === id ? updated : item))
        .sort((a, b) => a.name.localeCompare(b.name, 'th'))
      return updated
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        await fetchTitles()
        return titles.value.find((item) => item.name === trimmed) ?? null
      }
      return null
    }
  }

  async function remove(id: string): Promise<boolean> {
    try {
      await api.titles.delete(id)
      titles.value = titles.value.filter((item) => item.id !== id)
      return true
    } catch {
      return false
    }
  }

  async function ensure(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (titles.value.some((item) => item.name === trimmed)) return
    await add(trimmed)
  }

  return { titles, loading, error, fetchTitles, add, update, remove, ensure }
}
