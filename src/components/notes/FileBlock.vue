<script setup lang="ts">
import { Download, FileText, Paperclip, Trash2 } from '@lucide/vue'
import { ref } from 'vue'
import type { NoteBlock } from '@/types'
import { formatFileSize } from '@/utils/noteContent'
import { readAttachmentFile } from '@/utils/noteFiles'

const props = defineProps<{
  block: NoteBlock
  index: number
}>()

const emit = defineEmits<{
  update: [
    index: number,
    payload: { content: string; fileName: string; fileMime: string; fileSize: number },
  ]
  remove: [index: number]
  enter: [index: number]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const error = ref<string | null>(null)

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  error.value = null
  try {
    const dataUrl = await readAttachmentFile(file)
    emit('update', props.index, {
      content: dataUrl,
      fileName: file.name,
      fileMime: file.type || 'application/octet-stream',
      fileSize: file.size,
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'แนบไฟล์ไม่สำเร็จ'
  }
  if (fileInput.value) fileInput.value.value = ''
}

function pickFile() {
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
  <div class="file-block" tabindex="0" :data-block-id="block.id" @keydown="onKeydown">
    <input
      ref="fileInput"
      type="file"
      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,image/*"
      class="hidden"
      @change="onFileChange"
    />

    <div v-if="block.content" class="file-block__card lux-card">
      <div class="file-block__icon" aria-hidden="true">
        <FileText :size="22" :stroke-width="1.75" />
      </div>
      <div class="file-block__meta">
        <p class="file-block__name">{{ block.fileName || 'ไฟล์แนบ' }}</p>
        <p v-if="block.fileSize" class="file-block__size">{{ formatFileSize(block.fileSize) }}</p>
      </div>
      <a
        class="file-block__download"
        :href="block.content"
        :download="block.fileName || 'attachment'"
        aria-label="ดาวน์โหลดไฟล์"
      >
        <Download :size="18" :stroke-width="1.75" />
      </a>
      <button type="button" class="file-block__remove" aria-label="ลบไฟล์" @click="remove">
        <Trash2 :size="16" :stroke-width="1.75" />
      </button>
    </div>

    <div v-else class="file-block__empty">
      <button type="button" class="file-block__upload" @click="pickFile">
        <Paperclip :size="20" :stroke-width="1.75" />
        <span>แนบไฟล์</span>
      </button>
      <button type="button" class="file-block__cancel" aria-label="ลบบล็อกไฟล์" @click="remove">
        <Trash2 :size="16" :stroke-width="1.75" />
        ลบ
      </button>
    </div>

    <p v-if="error" class="file-block__error">{{ error }}</p>
  </div>
</template>

<style scoped lang="scss">
.hidden {
  display: none;
}

.file-block {
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

  &__card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
  }

  &__icon {
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.65rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--Input-Background);
    color: var(--Primary-Color);
  }

  &__meta {
    flex: 1;
    min-width: 0;
  }

  &__name {
    margin: 0;
    font-size: 0.9rem;
    color: var(--Text-Color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__size {
    margin: 0.15rem 0 0;
    font-size: 0.7rem;
    color: var(--Muted-Color);
  }

  &__download,
  &__remove {
    flex-shrink: 0;
    width: 2.25rem;
    height: 2.25rem;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--Text-Color);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;

    &:hover {
      background: var(--Item-Hover);
      color: var(--Primary-Color);
    }
  }

  &__remove:hover {
    color: var(--Danger-Text);
  }

  &__error {
    margin: 0.35rem 0 0;
    font-size: 0.75rem;
    color: var(--Danger-Text);
  }
}
</style>
