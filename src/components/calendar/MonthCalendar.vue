<script setup lang="ts">
import { computed } from 'vue'
import { buildMonthCalendar, weekdayLabels } from '@/utils/calendar'

const props = defineProps<{
  month: string
  selectedDate: string | null
  recordCounts: Map<string, number>
}>()

const emit = defineEmits<{
  select: [date: string]
}>()

const weekdays = weekdayLabels()

const cells = computed(() => buildMonthCalendar(props.month, props.recordCounts))

function handleSelect(date: string) {
  emit('select', date)
}

function isSelected(date: string) {
  return props.selectedDate === date
}
</script>

<template>
  <section class="month-calendar lux-card" aria-label="ปฏิทินรายเดือน">
    <div class="month-calendar__weekdays" role="row">
      <span
        v-for="label in weekdays"
        :key="label"
        class="month-calendar__weekday"
        role="columnheader"
      >
        {{ label }}
      </span>
    </div>

    <div class="month-calendar__grid" role="grid">
      <template v-for="(cell, index) in cells" :key="cell.date ?? `empty-${index}`">
        <span v-if="!cell.date" class="month-calendar__cell month-calendar__cell--empty" />

        <button
          v-else
          type="button"
          class="month-calendar__cell month-calendar__cell--day"
          :class="{
            'month-calendar__cell--selected': isSelected(cell.date),
            'month-calendar__cell--today': cell.isToday,
            'month-calendar__cell--has-records': cell.recordCount > 0,
          }"
          role="gridcell"
          :aria-selected="isSelected(cell.date)"
          :aria-label="`${cell.day} ${cell.recordCount > 0 ? `มี ${cell.recordCount} รายการ` : 'ไม่มีรายการ'}`"
          @click="handleSelect(cell.date)"
        >
          <span class="month-calendar__day">{{ cell.day }}</span>
          <span v-if="cell.recordCount > 0" class="month-calendar__dot" aria-hidden="true" />
        </button>
      </template>
    </div>
  </section>
</template>

<style scoped lang="scss">
.month-calendar {
  padding: 1rem 0.85rem 1.1rem;
  margin-bottom: 1.25rem;
}

.month-calendar__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.month-calendar__weekday {
  text-align: center;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--Label-Color);
}

.month-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.month-calendar__cell {
  aspect-ratio: 1;
  min-height: 2.5rem;
  border-radius: 0.65rem;
}

.month-calendar__cell--empty {
  display: block;
}

.month-calendar__cell--day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  padding: 0.2rem;
  border: 1px solid transparent;
  background: transparent;
  color: var(--Text-Color);
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: var(--Item-Hover);
  }

  &--today:not(&--selected) {
    border-color: var(--Card-Border);
  }

  &--selected {
    background: var(--Item-Selected);
    border-color: var(--Primary-Color);
    color: var(--Primary-Color);
  }

  &--has-records:not(&--selected) .month-calendar__day {
    font-weight: 500;
  }
}

.month-calendar__day {
  font-size: 0.85rem;
  line-height: 1;
}

.month-calendar__dot {
  width: 0.3rem;
  height: 0.3rem;
  border-radius: 50%;
  background: var(--Primary-Color);
}

.month-calendar__cell--selected .month-calendar__dot {
  background: currentColor;
}
</style>
