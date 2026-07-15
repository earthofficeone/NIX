<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MonthCalendar from '@/components/calendar/MonthCalendar.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import NoteCard from '@/components/notes/NoteCard.vue'
import { useNoteStore } from '@/stores/notes'
import type { Note } from '@/types'
import { isDateInMonth } from '@/utils/calendar'
import { dateKeyFromISO, formatDate, formatGroupDate, monthKey, todayISO } from '@/utils/format'

const router = useRouter()
const noteStore = useNoteStore()

const filterMode = ref<'all' | 'day'>('all')
const selectedMonth = ref(monthKey())
const selectedDay = ref<string | null>(null)

onMounted(() => noteStore.fetchList())

const noteCounts = computed(() => {
  const map = new Map<string, number>()
  for (const note of noteStore.sortedNotes) {
    const date = dateKeyFromISO(note.createdAt)
    map.set(date, (map.get(date) ?? 0) + 1)
  }
  return map
})

const monthLabel = computed(() => {
  const [y, m] = selectedMonth.value.split('-').map(Number)
  return new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(
    new Date(y!, m! - 1, 1),
  )
})

const filteredNotes = computed(() => {
  if (filterMode.value === 'all') return noteStore.sortedNotes
  if (!selectedDay.value) return noteStore.sortedNotes
  return noteStore.sortedNotes.filter(
    (note) => dateKeyFromISO(note.createdAt) === selectedDay.value,
  )
})

const groupedNotes = computed(() => {
  const map = new Map<string, Note[]>()
  for (const note of filteredNotes.value) {
    const key = dateKeyFromISO(note.createdAt)
    const list = map.get(key) ?? []
    list.push(note)
    map.set(key, list)
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
})

const hasNotes = computed(() => noteStore.sortedNotes.length > 0)
const hasFilteredNotes = computed(() => filteredNotes.value.length > 0)

const listSubtitle = computed(() => {
  if (filterMode.value === 'all') return 'ทั้งหมด'
  if (!selectedDay.value) return 'ทั้งหมด'
  return formatDate(selectedDay.value)
})

function openNote(id: string) {
  router.push({ name: 'note-editor', params: { id } })
}

async function createNote() {
  const note = await noteStore.create()
  if (note) openNote(note.id)
}

function shiftMonth(delta: number) {
  const [y, m] = selectedMonth.value.split('-').map(Number)
  const d = new Date(y!, m! - 1 + delta, 1)
  selectedMonth.value = monthKey(d)

  if (filterMode.value === 'day' && selectedDay.value && !isDateInMonth(selectedDay.value, selectedMonth.value)) {
    showAll()
  }
}

function selectDay(date: string) {
  filterMode.value = 'day'
  selectedDay.value = date
}

function showDayView() {
  filterMode.value = 'day'
  if (selectedDay.value) return
  const today = todayISO()
  if (isDateInMonth(today, selectedMonth.value)) {
    selectedDay.value = today
  }
}

function showAll() {
  filterMode.value = 'all'
  selectedDay.value = null
}
</script>

<template>
  <MainLayout title="โน๊ต" subtitle="จดบันทึกแบบ Notion">
    <p v-if="noteStore.loading" class="loading-hint">กำลังโหลด...</p>
    <p v-else-if="noteStore.error" class="error-hint">{{ noteStore.error }}</p>

    <template v-if="hasNotes && !noteStore.loading">
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
        :selected-date="filterMode === 'day' ? selectedDay : null"
        :record-counts="noteCounts"
        @select="selectDay"
      />

      <div class="view-toggle" role="tablist" aria-label="ตัวกรองวันที่สร้าง">
        <button
          type="button"
          class="view-toggle__btn"
          :class="{ 'view-toggle__btn--active': filterMode === 'all' }"
          role="tab"
          :aria-selected="filterMode === 'all'"
          @click="showAll"
        >
          ทั้งหมด
        </button>
        <button
          type="button"
          class="view-toggle__btn"
          :class="{ 'view-toggle__btn--active': filterMode === 'day' }"
          role="tab"
          :aria-selected="filterMode === 'day'"
          @click="showDayView"
        >
          รายวัน
        </button>
      </div>

      <p class="notes-filter-status">แสดง: {{ listSubtitle }}</p>
    </template>

    <section v-if="hasFilteredNotes" class="notes-section">
      <div v-for="[dateKey, notes] in groupedNotes" :key="dateKey" class="notes-group">
        <h2 class="notes-group__title">{{ formatGroupDate(dateKey) }}</h2>
        <div class="notes-table">
          <div class="notes-table__head">
            <span class="notes-table__head-col">หัวข้อ</span>
            <span class="notes-table__head-col">รายละเอียด</span>
          </div>
          <div class="notes-list">
            <button
              v-for="note in notes"
              :key="note.id"
              type="button"
              class="notes-list__item"
              @click="openNote(note.id)"
            >
              <NoteCard
                :note="note"
                :title="noteStore.noteDisplayTitle(note)"
                :preview="noteStore.notePreview(note)"
              />
            </button>
          </div>
        </div>
      </div>
    </section>

    <div v-else-if="hasNotes && !noteStore.loading" class="empty lux-card">
      <p class="empty__title">ไม่พบโน๊ตในวันที่เลือก</p>
      <p class="empty__hint">ลองเลือกวันอื่นจากปฏิทิน หรือกด "ทั้งหมด"</p>
    </div>

    <div v-else-if="!noteStore.loading" class="empty lux-card">
      <p class="empty__title">ยังไม่มีโน๊ต</p>
      <p class="empty__hint">กด + เพื่อสร้างโน๊ตใหม่ แล้วเริ่มเขียนได้ทันที</p>
      <button type="button" class="lux-btn lux-btn--gold" @click="createNote">สร้างโน๊ตแรก</button>
    </div>
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

.view-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  padding: 0.25rem;
  margin-bottom: 0.75rem;
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

.notes-filter-status {
  margin: 0 0 1rem;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--Label-Color);
  text-align: center;
}

.notes-section {
  margin-bottom: 1rem;
}

.notes-group {
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }

  &__title {
    margin: 0 0 0.65rem;
    padding: 0 0.25rem;
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    color: var(--Primary-Color);
  }
}

.notes-table {
  &__head {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 0.75rem;
    padding: 0 1rem 0.5rem;
    margin-bottom: 0.35rem;
  }

  &__head-col {
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--Label-Color);
  }
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;

  &__item {
    padding: 0;
    border: none;
    background: transparent;
    text-align: left;
    width: 100%;
    cursor: pointer;
  }
}

.empty {
  text-align: center;
  padding: 2.5rem 1.5rem;

  &__title {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    color: var(--Text-Color);
  }

  &__hint {
    margin: 0 0 1.25rem;
    font-size: 0.9rem;
    color: var(--Subtle-Color);
    line-height: 1.5;
  }
}

.loading-hint,
.error-hint {
  text-align: center;
  font-size: 0.85rem;
  margin: 0 0 1rem;
}

.loading-hint {
  color: var(--Hint-Color);
}

.error-hint {
  color: var(--Danger-Text);
}
</style>
