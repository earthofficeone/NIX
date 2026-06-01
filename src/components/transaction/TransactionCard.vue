<script setup lang="ts">
import type { Transaction } from '@/types'
import { formatCurrency, formatShortDate } from '@/utils/format'
import { useRouter } from 'vue-router'

defineProps<{ transaction: Transaction }>()

const router = useRouter()

function goEdit(id: string) {
  router.push({ name: 'edit-record', params: { id } })
}
</script>

<template>
  <article class="tx-card lux-card" @click="goEdit(transaction.id)">
    <div class="tx-card__main">
      <div v-if="transaction.image" class="tx-card__thumb">
        <img :src="transaction.image" alt="" />
      </div>
      <div class="tx-card__body">
        <div class="tx-card__row">
          <span class="lux-badge" :class="`lux-badge--${transaction.type}`">
            {{ transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย' }}
          </span>
          <span
            class="tx-card__amount"
            :class="transaction.type === 'income' ? 'tx-card__amount--income' : 'tx-card__amount--expense'"
          >
            {{ transaction.type === 'income' ? '+' : '−' }}{{ formatCurrency(transaction.amount) }}
          </span>
        </div>
        <h3 class="tx-card__title">{{ transaction.title }}</h3>
        <p v-if="transaction.note" class="tx-card__note">{{ transaction.note }}</p>
        <time class="tx-card__date">{{ formatShortDate(transaction.date) }}</time>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.tx-card {
  padding: 1rem 1.1rem;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;

  &:hover {
    border-color: rgba(201, 169, 110, 0.45);
    transform: translateX(2px);
  }
}

.tx-card__main {
  display: flex;
  gap: 0.85rem;
}

.tx-card__thumb {
  flex-shrink: 0;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.5rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.tx-card__body {
  flex: 1;
  min-width: 0;
}

.tx-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.tx-card__amount {
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.02em;

  &--income {
    color: #8ec49a;
  }

  &--expense {
    color: #e08a8a;
  }
}

.tx-card__title {
  font-size: 1rem;
  font-weight: 400;
  color: #f5f0e8;
  margin: 0 0 0.2rem;
}

.tx-card__note {
  font-size: 0.8rem;
  color: rgba(245, 240, 232, 0.5);
  margin: 0 0 0.35rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tx-card__date {
  font-size: 0.7rem;
  color: rgba(245, 240, 232, 0.4);
  letter-spacing: 0.06em;
}
</style>
