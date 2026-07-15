<script setup lang="ts">
import { CalendarDays, ChevronLeft, ChevronRight, X } from '@lucide/vue'
import { computed, onMounted, onUnmounted, watch } from 'vue'
import MonthCalendar from '@/components/calendar/MonthCalendar.vue'
import { monthKey } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    open: boolean
    month: string
    selectedDate: string | null
    recordCounts: Map<string, number>
    title?: string
    clearLabel?: string
  }>(),
  {
    title: 'เลือกวันที่',
    clearLabel: 'ทั้งหมด',
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:month': [value: string]
  select: [date: string]
  clear: []
}>()

const monthLabel = computed(() => {
  const [y, m] = props.month.split('-').map(Number)
  return new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(
    new Date(y!, m! - 1, 1),
  )
})

function close() {
  emit('update:open', false)
}

function shiftMonth(delta: number) {
  const [y, m] = props.month.split('-').map(Number)
  const d = new Date(y!, m! - 1 + delta, 1)
  emit('update:month', monthKey(d))
}

function onSelect(date: string) {
  emit('select', date)
  close()
}

function onClear() {
  emit('clear')
  close()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) close()
}

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
)

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="date-filter-popup" role="dialog" aria-modal="true" :aria-label="title">
      <button type="button" class="date-filter-popup__backdrop" aria-label="ปิด" @click="close" />

      <div class="date-filter-popup__sheet lux-card">
        <header class="date-filter-popup__header">
          <div class="date-filter-popup__title-wrap">
            <CalendarDays :size="18" :stroke-width="1.75" aria-hidden="true" />
            <h2 class="date-filter-popup__title">{{ title }}</h2>
          </div>
          <button type="button" class="date-filter-popup__close" aria-label="ปิด" @click="close">
            <X :size="20" :stroke-width="1.75" />
          </button>
        </header>

        <div class="date-filter-popup__month">
          <button type="button" class="date-filter-popup__arrow" aria-label="เดือนก่อนหน้า" @click="shiftMonth(-1)">
            <ChevronLeft :size="20" :stroke-width="1.75" aria-hidden="true" />
          </button>
          <span class="date-filter-popup__month-label">{{ monthLabel }}</span>
          <button type="button" class="date-filter-popup__arrow" aria-label="เดือนถัดไป" @click="shiftMonth(1)">
            <ChevronRight :size="20" :stroke-width="1.75" aria-hidden="true" />
          </button>
        </div>

        <MonthCalendar
          :month="month"
          :selected-date="selectedDate"
          :record-counts="recordCounts"
          @select="onSelect"
        />

        <button type="button" class="date-filter-popup__all lux-btn lux-btn--ghost lux-btn--full" @click="onClear">
          {{ clearLabel }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.date-filter-popup {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));

  &__backdrop {
    position: absolute;
    inset: 0;
    border: none;
    background: rgba(0, 0, 0, 0.55);
    cursor: pointer;
  }

  &__sheet {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 420px;
    max-height: min(90vh, 640px);
    overflow-y: auto;
    padding: 1rem 1rem 1.15rem;
    border-radius: 1.25rem;
    animation: sheet-up 0.22s ease;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.85rem;
  }

  &__title-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--Primary-Color);
  }

  &__title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--Text-Color);
  }

  &__close {
    width: 2.25rem;
    height: 2.25rem;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--Muted-Color);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: var(--Item-Hover);
      color: var(--Text-Color);
    }
  }

  &__month {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  &__arrow {
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

  &__month-label {
    font-size: 0.95rem;
    letter-spacing: 0.06em;
    color: var(--Text-Color);
  }

  &__all {
    margin-top: 0.25rem;
  }
}

:deep(.month-calendar) {
  margin-bottom: 0.85rem;
  box-shadow: none;
  border: 1px solid var(--Card-Border);
}

@keyframes sheet-up {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 480px) {
  .date-filter-popup {
    align-items: center;
  }
}
</style>
