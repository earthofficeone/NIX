import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, ApiError } from '@/api/client'
import type { MonthSummary, Transaction, TransactionType } from '@/types'
import { monthKey, todayISO } from '@/utils/format'

export const useTransactionStore = defineStore('transactions', () => {
  const items = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loadedMonth = ref<string | null>(null)

  const userTransactions = computed(() =>
    [...items.value].sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    ),
  )

  function summaryForMonth(key: string): MonthSummary {
    const list = userTransactions.value.filter((t) => t.date.startsWith(key))
    const income = list.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = list.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return {
      income,
      expense,
      balance: income - expense,
      count: list.length,
    }
  }

  function dailyGroups(month: string) {
    const map = new Map<string, Transaction[]>()
    for (const t of userTransactions.value) {
      if (!t.date.startsWith(month)) continue
      const list = map.get(t.date) ?? []
      list.push(t)
      map.set(t.date, list)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }

  function recordCountByDate(month: string) {
    const map = new Map<string, number>()
    for (const t of userTransactions.value) {
      if (!t.date.startsWith(month)) continue
      map.set(t.date, (map.get(t.date) ?? 0) + 1)
    }
    return map
  }

  function transactionsForDate(date: string) {
    return userTransactions.value
      .filter((t) => t.date === date)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  function categoryBreakdown(month: string) {
    const expenses = userTransactions.value.filter(
      (t) => t.date.startsWith(month) && t.type === 'expense',
    )
    const map = new Map<string, number>()
    for (const t of expenses) {
      const label = t.title.trim() || 'อื่นๆ'
      map.set(label, (map.get(label) ?? 0) + t.amount)
    }
    return [...map.entries()]
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total)
  }

  function getById(id: string) {
    return userTransactions.value.find((t) => t.id === id)
  }

  async function fetchList(month?: string) {
    loading.value = true
    error.value = null
    try {
      items.value = await api.transactions.list(month)
      loadedMonth.value = month ?? null
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'โหลดรายการไม่สำเร็จ'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string): Promise<Transaction | null> {
    const cached = getById(id)
    if (cached) return cached
    try {
      const tx = await api.transactions.get(id)
      const idx = items.value.findIndex((t) => t.id === id)
      if (idx === -1) items.value.push(tx)
      else items.value[idx] = tx
      return tx
    } catch {
      return null
    }
  }

  async function create(payload: {
    type: TransactionType
    amount: number
    title: string
    note: string
    image?: string
    date?: string
  }): Promise<Transaction | null> {
    try {
      const tx = await api.transactions.create({
        type: payload.type,
        amount: payload.amount,
        title: payload.title,
        note: payload.note,
        image: payload.image,
        date: payload.date ?? todayISO(),
      })
      items.value.unshift(tx)
      return tx
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'บันทึกไม่สำเร็จ'
      return null
    }
  }

  async function update(
    id: string,
    payload: Partial<Pick<Transaction, 'type' | 'amount' | 'title' | 'note' | 'image' | 'date'>>,
  ): Promise<boolean> {
    const existing = getById(id)
    if (!existing) return false
    try {
      const tx = await api.transactions.update(id, {
        type: payload.type ?? existing.type,
        amount: payload.amount ?? existing.amount,
        title: payload.title ?? existing.title,
        note: payload.note ?? existing.note,
        image: payload.image !== undefined ? payload.image : existing.image,
        date: payload.date ?? existing.date,
      })
      const idx = items.value.findIndex((t) => t.id === id)
      if (idx !== -1) items.value[idx] = tx
      return true
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'แก้ไขไม่สำเร็จ'
      return false
    }
  }

  async function remove(id: string): Promise<boolean> {
    try {
      await api.transactions.delete(id)
      items.value = items.value.filter((t) => t.id !== id)
      return true
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'ลบไม่สำเร็จ'
      return false
    }
  }

  function recent(limit = 5) {
    return userTransactions.value.slice(0, limit)
  }

  function clear() {
    items.value = []
    loadedMonth.value = null
  }

  return {
    items,
    loading,
    error,
    loadedMonth,
    userTransactions,
    summaryForMonth,
    dailyGroups,
    recordCountByDate,
    transactionsForDate,
    categoryBreakdown,
    getById,
    fetchList,
    fetchById,
    create,
    update,
    remove,
    recent,
    clear,
    monthKey,
  }
})
