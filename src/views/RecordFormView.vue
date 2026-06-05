<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CalculatorSheet from '@/components/calculator/CalculatorSheet.vue'
import TypeToggle from '@/components/transaction/TypeToggle.vue'
import ImageUpload from '@/components/transaction/ImageUpload.vue'
import { useCalculator, type CalcOperator } from '@/composables/useCalculator'
import { useCalculatorKeyboard } from '@/composables/useCalculatorKeyboard'
import type { SlipQrParseResult } from '@/composables/useSlipQr'
import { useTransactionStore } from '@/stores/transactions'
import type { TransactionType } from '@/types'
import { formatCurrency, todayISO } from '@/utils/format'

const props = defineProps<{ id?: string }>()

const route = useRoute()
const router = useRouter()
const txStore = useTransactionStore()

const isEdit = computed(() => !!props.id)
const recordId = computed(() => props.id ?? (route.params.id as string | undefined))

const type = ref<TransactionType>('expense')
const title = ref('')
const note = ref('')
const date = ref(todayISO())
const image = ref<string | undefined>()

const saving = ref(false)
const loadingRecord = ref(false)

const calc = useCalculator()
const {
  display,
  displayText,
  liveResult,
  numericValue,
  appendDigit,
  setOperator,
  equals,
  backspace,
  clear,
  setValue,
  handleCalculatorKey,
  onAmountBlur,
  onAmountKeydown,
} = calc

const amountInputId = 'amount'
const amountInputRef = ref<HTMLInputElement | null>(null)
const keyboardOpen = ref(false)

useCalculatorKeyboard(handleCalculatorKey, {
  enabled: () => keyboardOpen.value && !saving.value && !loadingRecord.value,
  amountInputId,
})

function openKeyboard() {
  keyboardOpen.value = true
  amountInputRef.value?.focus()
}

function onSheetDone() {
  onAmountBlur()
  amountInputRef.value?.blur()
}

onMounted(async () => {
  if (!recordId.value) return
  loadingRecord.value = true
  const existing = await txStore.fetchById(recordId.value)
  loadingRecord.value = false
  if (!existing) {
    router.replace({ name: 'records' })
    return
  }
  type.value = existing.type
  title.value = existing.title
  note.value = existing.note
  date.value = existing.date
  image.value = existing.image
  setValue(String(existing.amount))
})

async function save() {
  if (display.value && /[+−×÷]/.test(display.value)) {
    equals()
  }
  if (numericValue.value <= 0) {
    alert('กรุณากรอกจำนวนเงิน')
    return
  }
  saving.value = true
  const payload = {
    type: type.value,
    amount: numericValue.value,
    title: title.value,
    note: note.value,
    image: image.value || '',
    date: date.value,
  }
  let ok = false
  if (isEdit.value && recordId.value) {
    ok = await txStore.update(recordId.value, payload)
  } else {
    ok = (await txStore.create(payload)) !== null
  }
  saving.value = false
  if (ok) router.push({ name: 'records' })
  else if (txStore.error) alert(txStore.error)
}

async function removeRecord() {
  if (!recordId.value) return
  if (!confirm('ลบรายการนี้?')) return
  saving.value = true
  const ok = await txStore.remove(recordId.value)
  saving.value = false
  if (ok) router.push({ name: 'records' })
}

function cancel() {
  router.back()
}

function onKeypadDigit(d: string) {
  appendDigit(d)
}

function onKeypadOperator(op: CalcOperator) {
  setOperator(op)
}

function onKeypadEquals() {
  equals()
}

function onKeypadBackspace() {
  backspace()
}

function onKeypadClear() {
  clear()
}

function onSlipParsed(result: SlipQrParseResult) {
  if (result.status !== 'success') return

  if (result.amount != null && result.amount > 0) {
    setValue(String(result.amount))
  }
  if (result.title && !title.value.trim()) {
    title.value = result.title
  }
  if (result.note && !note.value.trim()) {
    note.value = result.note
  }
}
</script>

<template>
  <div class="form-page" :class="{ 'form-page--keyboard': keyboardOpen }">
    <header class="form-page__header">
      <button
        type="button"
        class="form-page__back flex items-center gap-1 hover:scale-105"
        @click="cancel"
      >
        <span class="text-lg">‹</span> กลับ
      </button>
      <h1 class="lux-title">{{ isEdit ? 'แก้ไขรายการ' : 'บันทึกใหม่' }}</h1>
    </header>

    <div class="form-page__body">
      <TypeToggle v-model="type" />

      <div class="amount-block lux-card">
        <span class="lux-label">จำนวนเงิน (฿)</span>
        <input
          :id="amountInputId"
          ref="amountInputRef"
          type="text"
          readonly
          inputmode="none"
          autocomplete="off"
          class="lux-amount-input lux-amount-input--tap lux-amount-input--expr"
          :class="type === 'income' ? 'lux-amount-input--income' : 'lux-amount-input--expense'"
          placeholder="0"
          :value="displayText"
          @click="openKeyboard"
          @focus="openKeyboard"
          @keydown="onAmountKeydown"
        />
        <p v-if="liveResult && !keyboardOpen" class="amount-preview">
          = {{ formatCurrency(numericValue) }}
        </p>
      </div>

      <CalculatorSheet
        v-model="keyboardOpen"
        :display="displayText"
        :live-result="liveResult ? formatCurrency(numericValue) : undefined"
        @digit="onKeypadDigit"
        @operator="onKeypadOperator"
        @equals="onKeypadEquals"
        @backspace="onKeypadBackspace"
        @clear="onKeypadClear"
        @done="onSheetDone"
      />

      <div class="fields">
        <div class="field">
          <label class="lux-label" for="title">หัวข้อ</label>
          <input
            id="title"
            v-model="title"
            type="text"
            class="lux-input"
            placeholder="เช่น อาหาร, เงินเดือน"
          />
        </div>
        <div class="field">
          <label class="lux-label" for="note">รายละเอียด</label>
          <textarea
            id="note"
            v-model="note"
            class="lux-input lux-textarea"
            rows="3"
            placeholder="บันทึกเพิ่มเติม..."
          />
        </div>
        <div class="field">
          <label class="lux-label" for="date">วันที่</label>
          <input id="date" v-model="date" type="date" class="lux-input" />
        </div>
        <ImageUpload v-model="image" @parsed="onSlipParsed" />
      </div>

      <p v-if="loadingRecord" class="form-hint">กำลังโหลดรายการ...</p>

      <button
        type="button"
        class="lux-btn lux-btn--gold lux-btn--full"
        :disabled="saving || loadingRecord"
        @click="save"
      >
        {{ saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'บันทึกรายการ' }}
      </button>
      <button
        v-if="isEdit"
        type="button"
        class="lux-btn lux-btn--ghost lux-btn--full form-page__delete"
        @click="removeRecord"
      >
        ลบรายการ
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.form-page {
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 2.5rem;
  transition: padding-bottom 0.32s ease;

  &--keyboard {
    padding-bottom: 1rem;
  }
}

.form-page__header {
  margin-bottom: 1.5rem;
}

.form-page__back {
  border: none;
  background: transparent;
  color: var(--Primary-Color);
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  padding: 0;
  margin-bottom: 0.5rem;
}

.form-page__body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.amount-block {
  padding: 1.25rem;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lux-textarea {
  resize: vertical;
  min-height: 4rem;
  font-family: inherit;
}

.form-page__delete {
  margin-top: 0.5rem;
  color: #e08a8a !important;
  border-color: rgba(196, 92, 92, 0.35) !important;
}

input[type='date'] {
  color-scheme: dark;
}

.amount-keyboard-hint {
  margin: 0 0 0.5rem;
  font-size: 0.65rem;
  letter-spacing: 0.04em;
  color: rgba(245, 240, 232, 0.35);
}

.lux-amount-input--expr {
  font-size: 1.5rem;
  letter-spacing: 0.04em;
}

.amount-preview {
  margin: 0.35rem 0 0.75rem;
  text-align: right;
  font-size: 0.85rem;
  color: var(--Primary-Color);
  letter-spacing: 0.02em;
}

.form-hint {
  text-align: center;
  color: rgba(245, 240, 232, 0.45);
  font-size: 0.85rem;
  margin: 0;
}
</style>
