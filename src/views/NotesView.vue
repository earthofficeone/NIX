<script setup lang="ts">
import { CalendarDays } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import DateFilterPopup from '@/components/calendar/DateFilterPopup.vue'
import NoteCard from '@/components/notes/NoteCard.vue'
import { useNoteStore } from '@/stores/notes'
import type { Note } from '@/types'
import { dateKeyFromISO, formatDate, formatGroupDate, monthKey } from '@/utils/format'

const router = useRouter()
const noteStore = useNoteStore()

const popupOpen = ref(false)
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

const filteredNotes = computed(() => {
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

const filterLabel = computed(() => {
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

function selectDay(date: string) {
  selectedDay.value = date
}

function clearFilter() {
  selectedDay.value = null
}
</script>

<template>
  <MainLayout title="โน๊ต" subtitle="จดบันทึกแบบ Notion">
    <p v-if="noteStore.loading" class="loading-hint">กำลังโหลด...</p>
    <p v-else-if="noteStore.error" class="error-hint">{{ noteStore.error }}</p>

    <div class="notes-filter-bar">
      <button type="button" class="notes-filter-btn lux-card" @click="popupOpen = true">
        <CalendarDays :size="18" :stroke-width="1.75" aria-hidden="true" />
        <span class="notes-filter-btn__text">
          <span class="notes-filter-btn__label">วันที่สร้าง</span>
          <span class="notes-filter-btn__value">{{ filterLabel }}</span>
        </span>
      </button>
    </div>

    <DateFilterPopup
      v-model:open="popupOpen"
      v-model:month="selectedMonth"
      :selected-date="selectedDay"
      :record-counts="noteCounts"
      title="เลือกวันที่สร้าง"
      clear-label="ทั้งหมด"
      @select="selectDay"
      @clear="clearFilter"
    />

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
      <p class="empty__hint">ลองเลือกวันอื่น หรือกด "ทั้งหมด" ใน popup</p>
    </div>

    <div v-else-if="!noteStore.loading" class="empty lux-card">
      <p class="empty__title">ยังไม่มีโน๊ต</p>
      <p class="empty__hint">กด + เพื่อสร้างโน๊ตใหม่ แล้วเริ่มเขียนได้ทันที</p>
      <button type="button" class="lux-btn lux-btn--gold" @click="createNote">สร้างโน๊ตแรก</button>
    </div>
  </MainLayout>
</template>

<style scoped lang="scss">
.notes-filter-bar {
  margin-bottom: 1rem;
}

.notes-filter-btn {
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
