<script setup lang="ts">
import { CalendarDays } from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'
import DateFilterPopup from '@/components/calendar/DateFilterPopup.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import TransactionCard from '@/components/transaction/TransactionCard.vue'
import { useTransactionStore } from '@/stores/transactions'
import { formatDate, monthKey } from '@/utils/format'

const txStore = useTransactionStore()
const popupOpen = ref(false)
const selectedMonth = ref(monthKey())
const selectedDay = ref<string | null>(null)
const viewMode = ref<'day' | 'month'>('month')

const recordCounts = computed(() => txStore.recordCountByDate(selectedMonth.value))
const monthGroups = computed(() => txStore.dailyGroups(selectedMonth.value))

const dayTransactions = computed(() => {
  if (!selectedDay.value) return []
  return txStore.transactionsForDate(selectedDay.value)
})

const monthLabel = computed(() => {
  const [y, m] = selectedMonth.value.split('-').map(Number)
  return new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(
    new Date(y!, m! - 1, 1),
  )
})

const filterLabel = computed(() => {
  if (viewMode.value === 'day' && selectedDay.value) return formatDate(selectedDay.value)
  return `ทั้งเดือน · ${monthLabel.value}`
})

const listTitle = computed(() => filterLabel.value)

function selectDay(date: string) {
  const month = date.slice(0, 7)
  if (month !== selectedMonth.value) {
    selectedMonth.value = month
  }
  viewMode.value = 'day'
  selectedDay.value = date
}

function clearFilter() {
  viewMode.value = 'month'
  selectedDay.value = null
}

onMounted(() => txStore.fetchList(selectedMonth.value))

watch(selectedMonth, (month) => {
  txStore.fetchList(month)
})
</script>

<template>
  <MainLayout title="บันทึกประจำวัน" subtitle="รายรับ · รายจ่าย">
    <p v-if="txStore.loading" class="loading-hint">กำลังโหลด...</p>

    <div  class="records-filter-bar">
      <button type="button" class="records-filter-btn lux-card" @click="popupOpen = true">
        <CalendarDays :size="18" :stroke-width="1.75" aria-hidden="true" />
        <span class="records-filter-btn__text">
          <span class="records-filter-btn__label">วันที่บันทึก</span>
          <span class="records-filter-btn__value">{{ filterLabel }}</span>
        </span>
      </button>
    </div>

    <DateFilterPopup
      v-model:open="popupOpen"
      v-model:month="selectedMonth"
      :selected-date="viewMode === 'day' ? selectedDay : null"
      :record-counts="recordCounts"
      title="เลือกวันที่บันทึก"
      clear-label="ทั้งเดือน"
      @select="selectDay"
      @clear="clearFilter"
    />

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
  </MainLayout>
</template>

<style scoped lang="scss">
.records-filter-bar {
  margin-bottom: 1.25rem;
}

.records-filter-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1rem;
  border: none;
  color: var(--Primary-Color);
  cursor: pointer;
  text-align: left;

  &__text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  &__label {
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--Label-Color);
  }

  &__value {
    font-size: 0.95rem;
    color: var(--Text-Color);
  }
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
