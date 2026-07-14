<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'
import MonthCalendar from '@/components/calendar/MonthCalendar.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import TransactionCard from '@/components/transaction/TransactionCard.vue'
import { useTransactionStore } from '@/stores/transactions'
import { formatDate, monthKey, todayISO } from '@/utils/format'
import { isDateInMonth } from '@/utils/calendar'

const txStore = useTransactionStore()
const selectedMonth = ref(monthKey())
const selectedDay = ref<string | null>(null)
const viewMode = ref<'day' | 'month'>('month')

const recordCounts = computed(() => txStore.recordCountByDate(selectedMonth.value))

const monthGroups = computed(() => txStore.dailyGroups(selectedMonth.value))

const dayTransactions = computed(() => {
  if (!selectedDay.value) return []
  return txStore.transactionsForDate(selectedDay.value)
})

const selectedDayLabel = computed(() => {
  if (!selectedDay.value) return ''
  return formatDate(selectedDay.value)
})

const monthLabel = computed(() => {
  const [y, m] = selectedMonth.value.split('-').map(Number)
  return new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(
    new Date(y!, m! - 1, 1),
  )
})

const listTitle = computed(() => {
  if (viewMode.value === 'month') return `ทั้งเดือน · ${monthLabel.value}`
  return selectedDayLabel.value
})

function defaultDayForMonth(month: string): string | null {
  const today = todayISO()
  if (isDateInMonth(today, month)) return today
  return null
}

function syncSelectedDay(month: string) {
  if (viewMode.value === 'month') {
    selectedDay.value = null
    return
  }
  if (selectedDay.value && isDateInMonth(selectedDay.value, month)) return
  selectedDay.value = defaultDayForMonth(month)
}

function shiftMonth(delta: number) {
  const [y, m] = selectedMonth.value.split('-').map(Number)
  const d = new Date(y!, m! - 1 + delta, 1)
  selectedMonth.value = monthKey(d)
}

function selectDay(date: string) {
  viewMode.value = 'day'
  selectedDay.value = date
}

function showMonthView() {
  viewMode.value = 'month'
  selectedDay.value = null
}

function showDayView() {
  viewMode.value = 'day'
  if (!selectedDay.value) {
    selectedDay.value = defaultDayForMonth(selectedMonth.value)
  }
}

onMounted(() => {
  syncSelectedDay(selectedMonth.value)
  txStore.fetchList(selectedMonth.value)
})

watch(selectedMonth, (month) => {
  syncSelectedDay(month)
  txStore.fetchList(month)
})
</script>

<template>
  <MainLayout title="บันทึกประจำวัน" subtitle="รายรับ · รายจ่าย">
    <p v-if="txStore.loading" class="loading-hint">กำลังโหลด...</p>

    <div class="month-picker lux-card">
      <button type="button" class="month-picker__arrow" aria-label="เดือนก่อนหน้า" @click="shiftMonth(-1)">
        <ChevronLeft :size="20" :stroke-width="1.75" aria-hidden="true" />
      </button>
      <span class="month-picker__label">{{ monthLabel }}</span>
      <button type="button" class="month-picker__arrow" aria-label="เดือนถัดไป" @click="shiftMonth(1)">
        <ChevronRight :size="20" :stroke-width="1.75" aria-hidden="true" />
      </button>
    </div>

    <MonthCalendar
      :month="selectedMonth"
      :selected-date="viewMode === 'day' ? selectedDay : null"
      :record-counts="recordCounts"
      @select="selectDay"
    />

    <div class="view-toggle" role="tablist" aria-label="มุมมองรายการ">
      <button
        type="button"
        class="view-toggle__btn"
        :class="{ 'view-toggle__btn--active': viewMode === 'month' }"
        role="tab"
        :aria-selected="viewMode === 'month'"
        @click="showMonthView"
      >
        ทั้งเดือน
      </button>
      <button
        type="button"
        class="view-toggle__btn"
        :class="{ 'view-toggle__btn--active': viewMode === 'day' }"
        role="tab"
        :aria-selected="viewMode === 'day'"
        @click="showDayView"
      >
        รายวัน
      </button>
    </div>

    <section v-if="viewMode === 'month'" class="day-records">
      <h2 class="day-records__title">{{ listTitle }}</h2>

      <div v-if="monthGroups.length" class="groups">
        <section v-for="[date, items] in monthGroups" :key="date" class="day-group">
          <h3 class="day-group__date">{{ formatDate(date) }}</h3>
          <div class="day-group__list">
            <TransactionCard v-for="t in items" :key="t.id" :transaction="t" />
          </div>
        </section>
      </div>
      <p v-else class="empty lux-card">ยังไม่มีบันทึกในเดือนนี้ — กด + เพื่อเพิ่มรายการ</p>
    </section>

    <section v-else-if="selectedDay" class="day-records">
      <h2 class="day-records__title">{{ listTitle }}</h2>

      <div v-if="dayTransactions.length" class="day-records__list">
        <TransactionCard v-for="t in dayTransactions" :key="t.id" :transaction="t" />
      </div>
      <p v-else class="empty lux-card">ไม่มีบันทึกในวันนี้ — กด + เพื่อเพิ่มรายการ</p>
    </section>

    <p v-else class="empty lux-card">เลือกวันจากปฏิทินเพื่อดูรายการ</p>
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
  border: 1px solid var(--Border-Color);
  border-radius: 50%;
  background: transparent;
  color: var(--Primary-Color);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.month-picker__label {
  font-size: 1rem;
  letter-spacing: 0.06em;
  color: var(--Text-Color);
}

.day-records {
  &__title {
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--Label-Color);
    margin: 0 0 0.75rem;
    font-weight: 400;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }
}

.view-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  padding: 0.25rem;
  margin-bottom: 1.25rem;
  border-radius: 9999px;
  border: 1px solid var(--Card-Border);
  background: var(--Input-Background);
}

.view-toggle__btn {
  padding: 0.55rem 0.75rem;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: var(--Muted-Color);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;

  &--active {
    background: var(--Item-Selected);
    color: var(--Primary-Color);
  }
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
  padding: 2rem 1.5rem;
  color: var(--Subtle-Color);
  font-size: 0.9rem;
}

.loading-hint {
  text-align: center;
  color: var(--Hint-Color);
  font-size: 0.85rem;
  margin: 0 0 1rem;
}
</style>
