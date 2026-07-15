<script setup lang="ts">
import { Image, Trash2 } from '@lucide/vue'
import { ref } from 'vue'
import ImageLightbox from '@/components/transaction/ImageLightbox.vue'
import type { NoteBlock } from '@/types'
import { readImageFile } from '@/utils/noteFiles'

const props = defineProps<{
  block: NoteBlock
  index: number
}>()

const emit = defineEmits<{
  update: [index: number, content: string]
  remove: [index: number]
  enter: [index: number]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const lightboxOpen = ref(false)
const error = ref<string | null>(null)

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  error.value = null
  try {
    const dataUrl = await readImageFile(file)
    emit('update', props.index, dataUrl)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'อัปโหลดรูปไม่สำเร็จ'
  }
  if (fileInput.value) fileInput.value.value = ''
}

function pickImage() {
  fileInput.value?.click()
}

function remove() {
  emit('remove', props.index)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    emit('enter', props.index)
  }
}
</script>

<template>
  <div class="image-block" tabindex="0" :data-block-id="block.id" @keydown="onKeydown">
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />

    <div v-if="block.content" class="image-block__preview-wrap">
      <button type="button" class="image-block__preview" aria-label="ขยายรูป" @click="lightboxOpen = true">
        <img :src="block.content" alt="รูปในโน๊ต" />
      </button>
      <div class="image-block__actions">
        <button type="button" class="image-block__btn" @click="pickImage">เปลี่ยนรูป</button>
        <button type="button" class="image-block__btn image-block__btn--danger" @click="remove">
          <Trash2 :size="14" :stroke-width="1.75" />
          ลบ
        </button>
      </div>
    </div>

    <div v-else class="image-block__empty">
      <button type="button" class="image-block__upload" @click="pickImage">
        <Image :size="20" :stroke-width="1.75" />
        <span>แนบรูปภาพ</span>
      </button>
      <button type="button" class="image-block__cancel" aria-label="ลบบล็อกรูป" @click="remove">
        <Trash2 :size="16" :stroke-width="1.75" />
        ลบ
      </button>
    </div>

    <p v-if="error" class="image-block__error">{{ error }}</p>

    <ImageLightbox v-if="block.content" v-model="lightboxOpen" :src="block.content" alt="รูปในโน๊ต" />
  </div>
</template>

<style scoped lang="scss">
.hidden {
  display: none;
}

.image-block {
  margin: 0.5rem 0 0.75rem;
  outline: none;

  &__empty {
    display: flex;
    gap: 0.5rem;
    align-items: stretch;
  }

  &__upload {
    flex: 1;
    padding: 1.25rem;
    border: 1px dashed var(--Card-Border);
    border-radius: 0.85rem;
    background: transparent;
    color: var(--Muted-Color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.85rem;

    &:hover {
      border-color: var(--Primary-Color);
      color: var(--Primary-Color);
    }
  }

  &__cancel {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0 1rem;
    border: 1px solid var(--Card-Border);
    border-radius: 0.85rem;
    background: transparent;
    color: var(--Danger-Text);
    font-size: 0.78rem;
    cursor: pointer;

    &:hover {
      border-color: var(--Danger-Text);
      background: rgba(196, 92, 92, 0.08);
    }
  }

  &__preview-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__preview {
    padding: 0;
    border: 1px solid var(--Card-Border);
    border-radius: 0.85rem;
    overflow: hidden;
    cursor: zoom-in;
    background: var(--Input-Background);

    img {
      width: 100%;
      max-height: 320px;
      object-fit: contain;
      display: block;
    }
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
  }

  &__btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--Card-Border);
    border-radius: 0.55rem;
    background: transparent;
    color: var(--Text-Color);
    font-size: 0.75rem;
    cursor: pointer;

    &:hover {
      border-color: var(--Primary-Color);
      color: var(--Primary-Color);
    }

    &--danger:hover {
      border-color: var(--Danger-Text);
      color: var(--Danger-Text);
    }
  }

  &__error {
    margin: 0.35rem 0 0;
    font-size: 0.75rem;
    color: var(--Danger-Text);
  }
}
</style>
