<script setup lang="ts">
import { computed, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import TransactionCard from '@/components/transaction/TransactionCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useTransactionStore } from '@/stores/transactions'
import { formatCurrency, monthKey } from '@/utils/format'

const auth = useAuthStore()
const txStore = useTransactionStore()

const selectedMonth = ref(monthKey())

const summary = computed(() => txStore.summaryForMonth(selectedMonth.value))
const breakdown = computed(() => txStore.categoryBreakdown(selectedMonth.value))
const recent = computed(() => txStore.recent(5))

const maxExpense = computed(() => {
  const max = Math.max(...breakdown.value.map((b) => b.total), 1)
  return max
})

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
  <MainLayout
    :title="`สวัสดี, ${auth.currentUser?.name ?? 'คุณ'}`"
    subtitle="สรุปรายเดือน"
  >
    <div class="month-picker lux-card">
      <button type="button" class="month-picker__arrow" @click="shiftMonth(-1)">‹</button>
      <span class="month-picker__label">{{ monthLabel }}</span>
      <button type="button" class="month-picker__arrow" @click="shiftMonth(1)">›</button>
    </div>

    <div class="stats-grid">
      <div class="stat lux-card stat--income">
        <span class="stat__label">รายรับ</span>
        <span class="stat__value">{{ formatCurrency(summary.income) }}</span>
      </div>
      <div class="stat lux-card stat--expense">
        <span class="stat__label">รายจ่าย</span>
        <span class="stat__value">{{ formatCurrency(summary.expense) }}</span>
      </div>
    </div>

    <div class="balance lux-card">
      <span class="balance__label">คงเหลือสุทธิ</span>
      <span class="balance__value" :class="{ 'balance__value--neg': summary.balance < 0 }">
        {{ formatCurrency(summary.balance) }}
      </span>
      <span class="balance__meta">{{ summary.count }} รายการในเดือนนี้</span>
    </div>

    <section v-if="breakdown.length" class="section">
      <h2 class="section__title">รายจ่ายตามหมวด</h2>
      <div class="breakdown lux-card">
        <div v-for="item in breakdown" :key="item.label" class="breakdown__row">
          <div class="breakdown__head">
            <span>{{ item.label }}</span>
            <span>{{ formatCurrency(item.total) }}</span>
          </div>
          <div class="breakdown__bar">
            <div
              class="breakdown__fill"
              :style="{ width: `${(item.total / maxExpense) * 100}%` }"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section__title">รายการล่าสุด</h2>
      <div v-if="recent.length" class="tx-list">
        <TransactionCard v-for="t in recent" :key="t.id" :transaction="t" />
      </div>
      <p v-else class="empty">ยังไม่มีรายการในเดือนนี้</p>
    </section>
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
  line-height: 1;

  &:hover {
    background: rgba(201, 169, 110, 0.1);
  }
}

.month-picker__label {
  font-size: 1rem;
  letter-spacing: 0.06em;
  color: #f5f0e8;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.stat {
  padding: 1rem;
  text-align: center;

  &__label {
    display: block;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(245, 240, 232, 0.45);
    margin-bottom: 0.35rem;
  }

  &__value {
    font-size: 1.1rem;
    font-weight: 300;
  }

  &--income .stat__value {
    color: #8ec49a;
  }

  &--expense .stat__value {
    color: #e08a8a;
  }
}

.balance {
  padding: 1.25rem;
  text-align: center;
  margin-bottom: 1.5rem;

  &__label {
    display: block;
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(245, 240, 232, 0.45);
    margin-bottom: 0.5rem;
  }

  &__value {
    display: block;
    font-size: 2rem;
    font-weight: 300;
    color: var(--Primary-Color);
    letter-spacing: 0.02em;

    &--neg {
      color: #e08a8a;
    }
  }

  &__meta {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: rgba(245, 240, 232, 0.4);
  }
}

.section {
  margin-bottom: 1.5rem;

  &__title {
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(245, 240, 232, 0.45);
    margin: 0 0 0.75rem;
    font-weight: 400;
  }
}

.breakdown {
  padding: 1rem 1.1rem;

  &__row {
    margin-bottom: 0.85rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__head {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #f5f0e8;
    margin-bottom: 0.35rem;
  }

  &__bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, #a8894a, #d4b87a);
    border-radius: 2px;
    transition: width 0.4s ease;
  }
}

.tx-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.empty {
  text-align: center;
  color: rgba(245, 240, 232, 0.35);
  font-size: 0.9rem;
  padding: 2rem;
}
</style>
