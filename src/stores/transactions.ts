import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { MonthSummary, Transaction, TransactionType } from '@/types'
import { loadJson, saveJson } from '@/utils/storage'
import { monthKey, todayISO } from '@/utils/format'
import { useAuthStore } from './auth'

const TX_KEY = 'nix_transactions'

export const useTransactionStore = defineStore('transactions', () => {
  const all = ref<Transaction[]>(loadJson<Transaction[]>(TX_KEY, []))
  const auth = useAuthStore()

  watch(
    all,
    (val) => saveJson(TX_KEY, val),
    { deep: true },
  )

  const userTransactions = computed(() =>
    all.value
      .filter((t) => t.userId === auth.currentUser?.id)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
  )

  function summaryForMonth(key: string): MonthSummary {
    const items = userTransactions.value.filter((t) => t.date.startsWith(key))
    const income = items.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = items.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return {
      income,
      expense,
      balance: income - expense,
      count: items.length,
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
      .slice(0, 5)
  }

  function getById(id: string) {
    return userTransactions.value.find((t) => t.id === id)
  }

  function create(payload: {
    type: TransactionType
    amount: number
    title: string
    note: string
    image?: string
    date?: string
  }) {
    const userId = auth.currentUser?.id
    if (!userId) return null
    const now = new Date().toISOString()
    const tx: Transaction = {
      id: crypto.randomUUID(),
      userId,
      type: payload.type,
      amount: payload.amount,
      title: payload.title.trim() || (payload.type === 'income' ? 'รายรับ' : 'รายจ่าย'),
      note: payload.note.trim(),
      image: payload.image,
      date: payload.date ?? todayISO(),
      createdAt: now,
      updatedAt: now,
    }
    all.value.push(tx)
    return tx
  }

  function update(
    id: string,
    payload: Partial<Pick<Transaction, 'type' | 'amount' | 'title' | 'note' | 'image' | 'date'>>,
  ) {
    const idx = all.value.findIndex((t) => t.id === id)
    if (idx === -1) return false
    const existing = all.value[idx]
    if (!existing || existing.userId !== auth.currentUser?.id) return false
    all.value[idx] = {
      ...existing,
      ...payload,
      title: payload.title !== undefined ? payload.title.trim() : existing.title,
      note: payload.note !== undefined ? payload.note.trim() : existing.note,
      updatedAt: new Date().toISOString(),
    }
    return true
  }

  function remove(id: string) {
    const idx = all.value.findIndex((t) => t.id === id)
    if (idx === -1) return false
    const existing = all.value[idx]
    if (!existing || existing.userId !== auth.currentUser?.id) return false
    all.value.splice(idx, 1)
    return true
  }

  function recent(limit = 5) {
    return userTransactions.value.slice(0, limit)
  }

  return {
    userTransactions,
    summaryForMonth,
    dailyGroups,
    categoryBreakdown,
    getById,
    create,
    update,
    remove,
    recent,
    monthKey,
  }
})
