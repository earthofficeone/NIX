<script setup lang="ts">
import { ref } from 'vue'
import ImageLightbox from '@/components/transaction/ImageLightbox.vue'
import type { Transaction } from '@/types'
import { formatCurrency, formatShortDate } from '@/utils/format'
import { useRouter } from 'vue-router'

const props = defineProps<{ transaction: Transaction }>()

const router = useRouter()
const lightboxOpen = ref(false)

function goEdit(id: string) {
  router.push({ name: 'edit-record', params: { id } })
}

function openImage(e: Event) {
  e.stopPropagation()
  if (props.transaction.image) lightboxOpen.value = true
}
</script>

<template>
  <article class="tx-card lux-card" @click="goEdit(transaction.id)">
    <div class="tx-card__main">
      <button
        v-if="transaction.image"
        type="button"
        class="tx-card__thumb"
        aria-label="ดูรูปขยาย"
        @click="openImage"
      >
        <img :src="transaction.image" alt="" />
      </button>
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

    <ImageLightbox
      v-if="transaction.image"
      v-model="lightboxOpen"
      :src="transaction.image"
      :alt="transaction.title"
    />
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
  padding: 0;
  border: 1px solid rgba(201, 169, 110, 0.2);
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--Surface-Background);
  cursor: zoom-in;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &:hover {
    border-color: var(--Primary-Color);
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
    color: var(--Success-Text);
  }

  &--expense {
    color: var(--Danger-Text);
  }
}

.tx-card__title {
  font-size: 1rem;
  font-weight: 400;
  color: var(--Text-Color);
  margin: 0 0 0.2rem;
}

.tx-card__note {
  font-size: 0.8rem;
  color: var(--Muted-Color);
  margin: 0 0 0.35rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tx-card__date {
  font-size: 0.7rem;
  color: var(--Subtle-Color);
  letter-spacing: 0.06em;
}
</style>
