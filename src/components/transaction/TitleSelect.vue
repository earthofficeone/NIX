<script setup lang="ts">
import { Check, ChevronDown, Pencil, X } from '@lucide/vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useTitlePresets } from '@/composables/useTitlePresets'
import type { RecordTitle, TransactionType } from '@/types'

const props = defineProps<{
  transactionType: TransactionType
  inputId?: string
}>()

const model = defineModel<string>({ default: '' })

const { titles, loading, error, update, remove, ensure } = useTitlePresets(
  computed(() => props.transactionType),
)

const open = ref(false)
const managing = ref(false)
const editingId = ref<string | null>(null)
const editName = ref('')
const activeIndex = ref(-1)
const savingTitle = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const filteredTitles = computed(() => {
  const query = model.value.trim().toLowerCase()
  if (!query) return titles.value
  return titles.value.filter((title) => title.name.toLowerCase().includes(query))
})

const panelLabel = computed(() => {
  const query = model.value.trim()
  if (!query) return 'หัวข้อทั้งหมด'
  return `ผลการค้นหา (${filteredTitles.value.length})`
})

const canSaveNew = computed(() => {
  const query = model.value.trim()
  if (!query) return false
  return !titles.value.some((title) => title.name === query)
})

watch(
  () => model.value,
  () => {
    if (!managing.value && !editingId.value) {
      open.value = true
      activeIndex.value = -1
    }
  },
)

function toggleOpen() {
  open.value = !open.value
  if (open.value) {
    activeIndex.value = -1
    inputRef.value?.focus()
  } else {
    managing.value = false
    cancelEdit()
  }
}

function selectTitle(title: RecordTitle) {
  if (managing.value || editingId.value) return
  model.value = title.name
  open.value = false
  activeIndex.value = -1
}

function onInputFocus() {
  open.value = true
  activeIndex.value = -1
}

async function handleSaveNew() {
  const query = model.value.trim()
  if (!query || !canSaveNew.value || savingTitle.value) return

  savingTitle.value = true
  await ensure(query)
  savingTitle.value = false
  open.value = false
  activeIndex.value = -1
}

function onInputKeydown(event: KeyboardEvent) {
  if (managing.value || editingId.value) return

  const list = filteredTitles.value

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    open.value = true
    if (list.length === 0) return
    activeIndex.value = activeIndex.value < list.length - 1 ? activeIndex.value + 1 : 0
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    open.value = true
    if (list.length === 0) return
    activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : list.length - 1
    return
  }

  if (event.key === 'Enter' && open.value) {
    const selected = activeIndex.value >= 0 ? list[activeIndex.value] : undefined
    if (selected) {
      event.preventDefault()
      selectTitle(selected)
      return
    }
    if (canSaveNew.value) {
      event.preventDefault()
      handleSaveNew()
    }
    return
  }

  if (event.key === 'Escape') {
    open.value = false
    activeIndex.value = -1
  }
}

function isActive(index: number) {
  return activeIndex.value === index
}

function startEdit(title: RecordTitle, event: Event) {
  event.stopPropagation()
  editingId.value = title.id
  editName.value = title.name
  activeIndex.value = -1
}

function cancelEdit() {
  editingId.value = null
  editName.value = ''
}

async function saveEdit(title: RecordTitle, event: Event) {
  event.stopPropagation()
  if (!editingId.value) return

  const trimmed = editName.value.trim()
  if (!trimmed) return

  const previousName = title.name
  const updated = await update(title.id, trimmed)
  if (updated) {
    if (model.value === previousName) model.value = updated.name
    cancelEdit()
  }
}

async function handleRemove(title: RecordTitle, event: Event) {
  event.stopPropagation()
  if (!confirm(`ลบหัวข้อ "${title.name}"?`)) return
  if (model.value === title.name) model.value = ''
  await remove(title.id)
}

function onDocumentClick(event: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    open.value = false
    managing.value = false
    cancelEdit()
    activeIndex.value = -1
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="rootRef" class="title-select" :class="{ 'title-select--open': open }">
    <div class="title-select__field">
      <input
        :id="inputId"
        ref="inputRef"
        v-model="model"
        type="text"
        class="title-select__input lux-input"
        placeholder="พิมพ์หรือเลือกหัวข้อ..."
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="open"
        :aria-controls="inputId ? `${inputId}-listbox` : undefined"
        @focus="onInputFocus"
        @keydown="onInputKeydown"
      />
      <button
        v-if="canSaveNew"
        type="button"
        class="title-select__save"
        :disabled="savingTitle"
        @click.stop="handleSaveNew"
      >
        {{ savingTitle ? '...' : 'บันทึก' }}
      </button>
      <button
        type="button"
        class="title-select__toggle"
        aria-label="แสดงหัวข้อทั้งหมด"
        :aria-expanded="open"
        @click.stop="toggleOpen"
      >
        <ChevronDown :size="18" :stroke-width="1.75" aria-hidden="true" />
      </button>
    </div>

    <div v-if="open" class="title-select__panel lux-card">
      <div class="title-select__panel-head">
        <span class="title-select__panel-title">{{ panelLabel }}</span>
        <button
          type="button"
          class="title-select__manage-btn"
          :class="{ 'title-select__manage-btn--active': managing }"
          @click.stop="managing = !managing"
        >
          {{ managing ? 'เสร็จสิ้น' : 'จัดการ' }}
        </button>
      </div>

      <p v-if="loading" class="title-select__hint">กำลังโหลด...</p>
      <p v-else-if="error" class="title-select__error">{{ error }}</p>

      <ul
        v-else
        :id="inputId ? `${inputId}-listbox` : undefined"
        class="title-select__list"
        role="listbox"
      >
        <li v-if="filteredTitles.length === 0" class="title-select__empty">
          {{ model.trim() ? 'ไม่พบหัวข้อที่ตรงกัน' : 'ยังไม่มีหัวข้อ' }}
        </li>
        <li
          v-for="(title, index) in filteredTitles"
          :key="title.id"
          class="title-select__item"
          :class="{
            'title-select__item--selected': model === title.name,
            'title-select__item--active': isActive(index),
          }"
          role="option"
          :aria-selected="model === title.name"
          @mousedown.prevent="selectTitle(title)"
        >
          <template v-if="editingId === title.id">
            <input
              v-model="editName"
              type="text"
              class="title-select__edit-input"
              @click.stop
              @keydown.enter.prevent="saveEdit(title, $event)"
              @keydown.escape.prevent="cancelEdit"
            />
            <div class="title-select__edit-actions">
              <button
                type="button"
                class="title-select__edit-save"
                aria-label="บันทึก"
                @click="saveEdit(title, $event)"
              >
                <Check :size="14" :stroke-width="2" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="title-select__edit-cancel"
                aria-label="ยกเลิก"
                @click.stop="cancelEdit"
              >
                <X :size="14" :stroke-width="2" aria-hidden="true" />
              </button>
            </div>
          </template>
          <template v-else>
            <span class="title-select__item-label">{{ title.name }}</span>
            <div v-if="managing" class="title-select__item-actions">
              <button
                type="button"
                class="title-select__edit"
                aria-label="แก้ไขหัวข้อ"
                @click="startEdit(title, $event)"
              >
                <Pencil :size="14" :stroke-width="1.75" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="title-select__delete"
                aria-label="ลบหัวข้อ"
                @click="handleRemove(title, $event)"
              >
                <X :size="14" :stroke-width="2" aria-hidden="true" />
              </button>
            </div>
          </template>
        </li>
      </ul>

      <button
        v-if="canSaveNew && !loading && !error"
        type="button"
        class="title-select__save title-select__save--panel"
        :disabled="savingTitle"
        @click.stop="handleSaveNew"
      >
        {{ savingTitle ? 'กำลังบันทึก...' : `บันทึก "${model.trim()}" เป็นหัวข้อใหม่` }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.title-select {
  position: relative;
}

.title-select__field {
  position: relative;
  display: flex;
  align-items: stretch;
}

.title-select__input {
  flex: 1;
  min-width: 0;
  padding-right: 5.5rem;
}

.title-select__save {
  position: absolute;
  top: 50%;
  right: 2.5rem;
  transform: translateY(-50%);
  padding: 0.35rem 0.65rem;
  border: 1px solid rgba(201, 169, 110, 0.35);
  border-radius: 0.45rem;
  background: rgba(201, 169, 110, 0.12);
  color: var(--Primary-Color);
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: rgba(201, 169, 110, 0.22);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--panel {
    position: static;
    transform: none;
    width: 100%;
    padding: 0.65rem 0.75rem;
    font-size: 0.8rem;
  }
}

.title-select__toggle {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 2.5rem;
  border: none;
  background: transparent;
  color: var(--Primary-Color);
  cursor: pointer;
  border-radius: 0 0.75rem 0.75rem 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, background 0.2s ease;

  &:hover {
    background: rgba(201, 169, 110, 0.08);
  }
}

.title-select--open .title-select__toggle {
  transform: rotate(180deg);
}

.title-select__panel {
  position: absolute;
  top: calc(100% + 0.35rem);
  left: 0;
  right: 0;
  z-index: 30;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.title-select__panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.title-select__panel-title {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--Muted-Color);
}

.title-select__manage-btn {
  border: none;
  background: transparent;
  color: var(--Primary-Color);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  padding: 0.15rem 0.35rem;

  &--active {
    color: var(--Success-Color);
  }
}

.title-select__hint,
.title-select__error {
  margin: 0;
  padding: 0.65rem 0.75rem;
  font-size: 0.85rem;
  text-align: center;
}

.title-select__hint {
  color: var(--Hint-Color);
}

.title-select__error {
  color: #e08a8a;
}

.title-select__list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 11rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title-select__empty {
  padding: 0.65rem 0.75rem;
  font-size: 0.85rem;
  color: var(--Hint-Color);
  text-align: center;
}

.title-select__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.55rem;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--Item-Hover);
  }

  &--selected {
    background: var(--Item-Selected);
    color: var(--Primary-Color);
  }

  &--active {
    background: var(--Item-Active);
    outline: 1px solid var(--Card-Border);
  }
}

.title-select__item-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-select__item-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.title-select__edit,
.title-select__delete,
.title-select__edit-save,
.title-select__edit-cancel {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.title-select__edit {
  background: rgba(201, 169, 110, 0.18);
  color: var(--Primary-Color);

  &:hover {
    background: rgba(201, 169, 110, 0.32);
  }
}

.title-select__delete {
  background: rgba(196, 92, 92, 0.18);
  color: #e08a8a;

  &:hover {
    background: rgba(196, 92, 92, 0.32);
  }
}

.title-select__edit-input {
  flex: 1;
  min-width: 0;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--Card-Border);
  border-radius: 0.45rem;
  background: var(--Input-Background);
  color: var(--Text-Color);
  font-size: 0.9rem;
  outline: none;

  &:focus {
    border-color: rgba(201, 169, 110, 0.55);
  }
}

.title-select__edit-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.title-select__edit-save {
  background: rgba(107, 157, 122, 0.22);
  color: var(--Success-Color);
}

.title-select__edit-cancel {
  background: rgba(196, 92, 92, 0.18);
  color: #e08a8a;
}
</style>
