<script setup lang="ts">
import { Capacitor } from '@capacitor/core'
import { Camera, Image, Paperclip } from '@lucide/vue'
import { computed, nextTick, ref, watch } from 'vue'
import ImageLightbox from '@/components/transaction/ImageLightbox.vue'
import { parseSlipFromDataUrl, type SlipQrParseResult } from '@/composables/useSlipQr'

const model = defineModel<string | undefined>()

const emit = defineEmits<{
  parsed: [result: SlipQrParseResult]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const lightboxOpen = ref(false)
const parsing = ref(false)
const parseMessage = ref<string | null>(null)
const captureMode = ref<'environment' | undefined>(undefined)

const hasImage = computed(() => !!model.value)
const isNativeApp = Capacitor.isNativePlatform()

const parseMessageClass = computed(() => {
  if (!parseMessage.value) return ''
  if (parseMessage.value.includes('สำเร็จ')) return 'upload__status--ok'
  if (parseMessage.value.includes('ไม่พบ')) return 'upload__status--muted'
  return 'upload__status--warn'
})

watch(
  () => model.value,
  (value) => {
    if (fileInput.value && !value) fileInput.value.value = ''
    if (!value) parseMessage.value = null
  },
)

function statusMessage(result: SlipQrParseResult): string {
  if (result.status === 'success') {
    if (result.amount != null && result.amount > 0) {
      return 'อ่าน QR สำเร็จ — กรุณาตรวจข้อมูลก่อนบันทึก'
    }
    if (result.kind === 'slip_verify') {
      return 'อ่าน QR สลิปสำเร็จ — เติมเลขอ้างอิงแล้ว กรุณากรอกจำนวนเงินจากสลิป'
    }
    return 'อ่าน QR สำเร็จ — กรุณากรอกจำนวนเงินและตรวจข้อมูลก่อนบันทึก'
  }
  if (result.status === 'no_qr') {
    return 'ไม่พบ QR บนรูป — กรอกข้อมูลเองได้'
  }
  return 'พบ QR แต่อ่านไม่ได้ — กรอกข้อมูลเองได้'
}

async function readQrFromDataUrl(dataUrl: string) {
  parsing.value = true
  parseMessage.value = 'กำลังอ่าน QR...'
  try {
    const result = await parseSlipFromDataUrl(dataUrl)
    emit('parsed', result)
    parseMessage.value = statusMessage(result)
  } catch {
    parseMessage.value = 'อ่าน QR ไม่สำเร็จ — กรอกข้อมูลเองได้'
  } finally {
    parsing.value = false
  }
}

function pickImage(mode?: 'camera' | 'gallery') {
  captureMode.value = mode === 'camera' ? 'environment' : undefined
  void nextTick(() => fileInput.value?.click())
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('กรุณาเลือกไฟล์รูปภาพ')
    return
  }
  if (file.size > 3 * 1024 * 1024) {
    alert('รูปภาพต้องไม่เกิน 3 MB')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    const dataUrl = reader.result as string
    model.value = dataUrl
    void readQrFromDataUrl(dataUrl)
  }
  reader.readAsDataURL(file)
  if (fileInput.value) fileInput.value.value = ''
}

function remove() {
  model.value = undefined
  parseMessage.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function openLightbox() {
  if (model.value) lightboxOpen.value = true
}
</script>

<template>
  <div class="upload">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      :capture="captureMode"
      class="hidden"
      @change="onFileChange"
    />

    <p class="upload__hint">แนบได้ 1 รูปต่อรายการ (สลิป / ใบเสร็จ) — อ่าน QR อัตโนมัติ ไม่มีค่าใช้จ่าย</p>

    <p
      v-if="parseMessage"
      class="upload__status"
      :class="parseMessageClass"
      role="status"
    >
      {{ parsing ? 'กำลังอ่าน QR...' : parseMessage }}
    </p>

    <div v-if="hasImage" class="upload__preview-wrap">
      <button type="button" class="upload__preview" aria-label="ขยายรูป" @click="openLightbox">
        <img :src="model" alt="รูปแนบ" />
        <span class="upload__zoom">แตะเพื่อขยาย</span>
      </button>
      <div class="upload__actions">
        <button type="button" class="upload__btn" @click="pickImage('gallery')">เปลี่ยนรูป</button>
        <button type="button" class="upload__btn upload__btn--danger" @click="remove">ลบรูป</button>
      </div>
    </div>

    <div v-else-if="isNativeApp" class="upload__native-actions">
      <button type="button" class="upload__trigger upload__trigger--half" @click="pickImage('gallery')">
        <Image class="upload__icon" :size="18" :stroke-width="1.75" aria-hidden="true" />
        <span>เลือกจากอัลบั้ม</span>
      </button>
      <button type="button" class="upload__trigger upload__trigger--half" @click="pickImage('camera')">
        <Camera class="upload__icon" :size="18" :stroke-width="1.75" aria-hidden="true" />
        <span>ถ่ายรูป</span>
      </button>
    </div>

    <button v-else type="button" class="upload__trigger" @click="pickImage('gallery')">
      <Paperclip class="upload__icon" :size="18" :stroke-width="1.75" aria-hidden="true" />
      <span>แนบรูปสลิป / ใบเสร็จ</span>
    </button>

    <ImageLightbox v-if="model" v-model="lightboxOpen" :src="model" alt="รูปแนบ" />
  </div>
</template>

<style scoped lang="scss">
.hidden {
  display: none;
}

.upload__hint {
  margin: 0 0 0.5rem;
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  color: var(--Subtle-Color);
}

.upload__status {
  margin: 0 0 0.5rem;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  line-height: 1.4;

  &--ok {
    color: var(--Primary-Color);
  }

  &--muted {
    color: var(--Hint-Color);
  }

  &--warn {
    color: #d4a574;
  }
}

.upload__trigger {
  width: 100%;
  padding: 1rem;
  border: 1px dashed rgba(201, 169, 110, 0.3);
  border-radius: 0.75rem;
  background: transparent;
  color: var(--Muted-Color);
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--Primary-Color);
    color: var(--Primary-Color);
  }

  &--half {
    flex: 1;
    min-width: 0;
    padding: 0.85rem 0.5rem;
    font-size: 0.78rem;
  }
}

.upload__native-actions {
  display: flex;
  gap: 0.5rem;
}

.upload__icon {
  flex-shrink: 0;
}

.upload__preview-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.upload__preview {
  position: relative;
  padding: 0;
  border: 1px solid rgba(201, 169, 110, 0.25);
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(--Input-Background);
  cursor: zoom-in;

  img {
    width: 100%;
    max-height: 220px;
    object-fit: cover;
    display: block;
  }

  &:hover .upload__zoom {
    opacity: 1;
  }
}

.upload__zoom {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--Surface-Overlay);
  color: var(--Text-Color);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  opacity: 0;
  transition: opacity 0.2s;
}

.upload__actions {
  display: flex;
  gap: 0.5rem;
}

.upload__btn {
  flex: 1;
  padding: 0.55rem 0.75rem;
  border: 1px solid rgba(201, 169, 110, 0.25);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--Text-Color);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  cursor: pointer;

  &:hover {
    border-color: var(--Primary-Color);
    color: var(--Primary-Color);
  }

  &--danger:hover {
    border-color: rgba(196, 92, 92, 0.5);
    color: #e08a8a;
  }
}
</style>
