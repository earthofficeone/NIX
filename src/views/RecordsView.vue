<script setup lang="ts">
import { computed, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import TransactionCard from '@/components/transaction/TransactionCard.vue'
import { useTransactionStore } from '@/stores/transactions'
import { formatDate, monthKey } from '@/utils/format'

const txStore = useTransactionStore()
const selectedMonth = ref(monthKey())

const groups = computed(() => txStore.dailyGroups(selectedMonth.value))

function shiftMonth(delta: number) {
  const [y, m] = selectedMonth.value.split('-').map(Number)
  const d = new Date(y!, m! - 1 + delta, 1)
  selectedMonth.value = monthKey(d)
}

const monthLabel = computed(() => {
  const [y, m] = selectedMonth.value.split('-').map(Number)
  return new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(
    new Date(y!, m! - 1, 1),
  )
})
</script>

<template>
  <MainLayout title="บันทึกประจำวัน" subtitle="รายรับ · รายจ่าย">
    <div class="month-picker lux-card">
      <button type="button" class="month-picker__arrow" @click="shiftMonth(-1)">‹</button>
      <span class="month-picker__label">{{ monthLabel }}</span>
      <button type="button" class="month-picker__arrow" @click="shiftMonth(1)">›</button>
    </div>

    <div v-if="groups.length" class="groups">
      <section v-for="[date, items] in groups" :key="date" class="day-group">
        <h2 class="day-group__date">{{ formatDate(date) }}</h2>
        <div class="day-group__list">
          <TransactionCard v-for="t in items" :key="t.id" :transaction="t" />
        </div>
      </section>
    </div>
    <p v-else class="empty lux-card">ยังไม่มีบันทึกในเดือนนี้ — กด + เพื่อเพิ่มรายการ</p>
  </MainLayout>
</template>

<style scoped lang="scss">
.month-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  margin-bottom: 1.25rem;
}

.month-picker__arrow {
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid rgba(201, 169, 110, 0.2);
  border-radius: 50%;
  background: transparent;
  color: var(--Primary-Color);
  font-size: 1.25rem;
  cursor: pointer;
}

.month-picker__label {
  font-size: 1rem;
  letter-spacing: 0.06em;
  color: #f5f0e8;
}

.day-group {
  margin-bottom: 1.5rem;

  &__date {
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--Primary-Color);
    margin: 0 0 0.65rem;
    font-weight: 400;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }
}

.empty {
  text-align: center;
  padding: 2.5rem 1.5rem;
  color: rgba(245, 240, 232, 0.4);
  font-size: 0.9rem;
}
</style>
