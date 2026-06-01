<script setup lang="ts">
import { ref } from 'vue'

const model = defineModel<string | undefined>()

const preview = ref(model.value)
const fileInput = ref<HTMLInputElement | null>(null)

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return
  if (file.size > 3 * 1024 * 1024) {
    alert('รูปภาพต้องไม่เกิน 3 MB')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    const result = reader.result as string
    preview.value = result
    model.value = result
  }
  reader.readAsDataURL(file)
}

function remove() {
  preview.value = undefined
  model.value = undefined
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="upload">
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
    <div v-if="preview" class="upload__preview">
      <img :src="preview" alt="แนบรูป" />
      <button type="button" class="upload__remove" aria-label="ลบรูป" @click="remove">×</button>
    </div>
    <button v-else type="button" class="upload__trigger" @click="fileInput?.click()">
      <span class="upload__icon">📎</span>
      <span>แนบรูปสลิป / ใบเสร็จ</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.hidden {
  display: none;
}

.upload__trigger {
  width: 100%;
  padding: 1rem;
  border: 1px dashed rgba(201, 169, 110, 0.3);
  border-radius: 0.75rem;
  background: transparent;
  color: rgba(245, 240, 232, 0.6);
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
}

.upload__icon {
  font-size: 1.1rem;
}

.upload__preview {
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(201, 169, 110, 0.2);

  img {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
    display: block;
  }
}

.upload__remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1;
}
</style>
