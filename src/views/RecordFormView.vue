<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CalculatorKeypad from '@/components/calculator/CalculatorKeypad.vue'
import TypeToggle from '@/components/transaction/TypeToggle.vue'
import ImageUpload from '@/components/transaction/ImageUpload.vue'
import { useCalculator } from '@/composables/useCalculator'
import { useTransactionStore } from '@/stores/transactions'
import type { TransactionType } from '@/types'
import { todayISO } from '@/utils/format'

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

const { display, numericValue, appendDigit, backspace, clear, setValue } = useCalculator()

onMounted(() => {
  if (!recordId.value) return
  const existing = txStore.getById(recordId.value)
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

function save() {
  if (numericValue.value <= 0) {
    alert('กรุณากรอกจำนวนเงิน')
    return
  }
  const payload = {
    type: type.value,
    amount: numericValue.value,
    title: title.value,
    note: note.value,
    image: image.value,
    date: date.value,
  }
  if (isEdit.value && recordId.value) {
    txStore.update(recordId.value, payload)
  } else {
    txStore.create(payload)
  }
  router.push({ name: 'records' })
}

function removeRecord() {
  if (!recordId.value) return
  if (!confirm('ลบรายการนี้?')) return
  txStore.remove(recordId.value)
  router.push({ name: 'records' })
}

function cancel() {
  router.back()
}
</script>

<template>
  <div class="form-page">
    <header class="form-page__header">
      <button type="button" class="form-page__back" @click="cancel">‹ กลับ</button>
      <h1 class="lux-title">{{ isEdit ? 'แก้ไขรายการ' : 'บันทึกใหม่' }}</h1>
    </header>

    <div class="form-page__body">
      <TypeToggle v-model="type" />

      <div class="amount-block lux-card">
        <span class="lux-label">จำนวนเงิน (฿)</span>
        <div
          class="lux-amount-display"
          :class="type === 'income' ? 'lux-amount-display--income' : 'lux-amount-display--expense'"
        >
          {{ display }}
        </div>
        <CalculatorKeypad
          @digit="appendDigit"
          @backspace="backspace"
          @clear="clear"
        />
      </div>

      <div class="fields">
        <div class="field">
          <label class="lux-label" for="title">หัวข้อ</label>
          <input id="title" v-model="title" type="text" class="lux-input" placeholder="เช่น อาหาร, เงินเดือน" />
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
        <ImageUpload v-model="image" />
      </div>

      <button type="button" class="lux-btn lux-btn--gold lux-btn--full" @click="save">
        {{ isEdit ? 'บันทึกการแก้ไข' : 'บันทึกรายการ' }}
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
</style>
