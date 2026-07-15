<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import SlashCommandMenu from '@/components/notes/SlashCommandMenu.vue'
import type { NoteBlock, NoteBlockType } from '@/types'
import { headingClass, isTextBlockType, filterSlashCommands, type SlashCommand } from '@/utils/slashCommands'
import { isEmptyHtml, sanitizeHtml } from '@/utils/noteContent'

const props = defineProps<{
  block: NoteBlock
  index: number
  listNumber?: number
  autofocus?: boolean
}>()

const emit = defineEmits<{
  enter: [index: number]
  backspace: [index: number]
  update: [index: number, content: string]
  typeChange: [index: number, type: NoteBlockType]
  focus: [el: HTMLElement]
  pasteImage: [index: number, file: File]
  convert: [index: number, type: NoteBlockType]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const slashVisible = ref(false)
const slashFilter = ref('')
const slashActiveIndex = ref(0)
const slashPos = ref({ top: 0, left: 0 })

let composing = false

const filteredCommands = computed(() => filterSlashCommands(slashFilter.value))
const editorTypeClass = computed(() => headingClass(props.block.type))

function syncFromDom() {
  const el = editorRef.value
  if (!el) return
  emit('update', props.index, sanitizeHtml(el.innerHTML))
}

function getTextBeforeCaret(): string {
  const sel = window.getSelection()
  const el = editorRef.value
  if (!sel?.rangeCount || !el) return ''
  const range = sel.getRangeAt(0)
  const preRange = range.cloneRange()
  preRange.selectNodeContents(el)
  preRange.setEnd(range.endContainer, range.endOffset)
  return preRange.toString()
}

function getCaretRect(): DOMRect | null {
  const sel = window.getSelection()
  if (!sel?.rangeCount) return null
  const range = sel.getRangeAt(0).cloneRange()
  range.collapse(false)
  const rects = range.getClientRects()
  if (rects.length > 0) return rects[0] ?? null

  const marker = document.createElement('span')
  marker.textContent = '\u200b'
  range.insertNode(marker)
  const rect = marker.getBoundingClientRect()
  marker.remove()
  return rect
}

function updateSlashMenu() {
  const text = getTextBeforeCaret()
  const match = text.match(/(?:^|\s)\/([^\s/]*)$/)
  if (!match) {
    slashVisible.value = false
    slashFilter.value = ''
    return
  }

  slashFilter.value = match[1] ?? ''
  slashActiveIndex.value = 0
  slashVisible.value = true

  const rect = getCaretRect()
  if (rect) {
    slashPos.value = {
      top: rect.bottom + 6,
      left: Math.min(rect.left, window.innerWidth - 300),
    }
  }
}

function closeSlashMenu() {
  slashVisible.value = false
  slashFilter.value = ''
  slashActiveIndex.value = 0
}

function removeSlashQuery() {
  const el = editorRef.value
  if (!el) return
  const text = el.textContent ?? ''
  el.textContent = text.replace(/\/[^\s/]*$/, '')
  const range = document.createRange()
  const sel = window.getSelection()
  range.selectNodeContents(el)
  range.collapse(false)
  sel?.removeAllRanges()
  sel?.addRange(range)
  syncFromDom()
}

function applySlashCommand(cmd: SlashCommand) {
  removeSlashQuery()
  closeSlashMenu()

  if (cmd.blockType === 'image' || cmd.blockType === 'file') {
    emit('convert', props.index, cmd.blockType)
    return
  }

  if (cmd.blockType !== props.block.type) {
    emit('typeChange', props.index, cmd.blockType)
  }

  nextTick(() => editorRef.value?.focus())
}

function onInput() {
  if (composing) return
  syncFromDom()
  updateSlashMenu()
}

function onCompositionStart() {
  composing = true
}

function onCompositionEnd() {
  composing = false
  syncFromDom()
  updateSlashMenu()
}

function onFocus() {
  const el = editorRef.value
  if (el) emit('focus', el)
}

function onKeydown(e: KeyboardEvent) {
  if (slashVisible.value && filteredCommands.value.length) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      slashActiveIndex.value = (slashActiveIndex.value + 1) % filteredCommands.value.length
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      slashActiveIndex.value =
        (slashActiveIndex.value - 1 + filteredCommands.value.length) %
        filteredCommands.value.length
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = filteredCommands.value[slashActiveIndex.value]
      if (cmd) applySlashCommand(cmd)
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      closeSlashMenu()
      return
    }
  }

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    closeSlashMenu()
    emit('enter', props.index)
    return
  }

  if (e.key === 'Backspace' && isEmptyHtml(props.block.content) && !slashVisible.value) {
    e.preventDefault()
    emit('backspace', props.index)
  }
}

function detectBlockType(text: string): NoteBlockType | null {
  if (text.startsWith('# ')) return 'heading1'
  if (text.startsWith('## ')) return 'heading2'
  if (text.startsWith('### ')) return 'heading3'
  if (text.startsWith('- ')) return 'bullet'
  if (text.startsWith('1. ')) return 'numbered'
  return null
}

function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (items) {
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) emit('pasteImage', props.index, file)
        return
      }
    }
  }

  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') ?? ''
  document.execCommand('insertText', false, text)
  syncFromDom()
  updateSlashMenu()
}

watch(
  () => props.block.content,
  (content) => {
    const el = editorRef.value
    if (!el || document.activeElement === el) return
    if (sanitizeHtml(el.innerHTML) === sanitizeHtml(content)) return
    el.innerHTML = content || ''
  },
)

watch(
  () => props.block.content,
  (content) => {
    if (!isTextBlockType(props.block.type)) return
    const plain = content.replace(/<[^>]+>/g, '')
    const detected = detectBlockType(plain)
    if (detected && detected !== props.block.type) {
      const stripped = plain.replace(/^(#{1,3}\s|[-] |1\. )/, '')
      emit('typeChange', props.index, detected)
      emit('update', props.index, stripped)
      nextTick(() => {
        if (editorRef.value) editorRef.value.textContent = stripped
      })
    }
  },
)

watch(filteredCommands, (cmds) => {
  if (slashActiveIndex.value >= cmds.length) {
    slashActiveIndex.value = Math.max(0, cmds.length - 1)
  }
})

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = props.block.content || ''
  }
  if (props.autofocus) editorRef.value?.focus()
})

watch(
  () => props.autofocus,
  (focus) => {
    if (focus) nextTick(() => editorRef.value?.focus())
  },
)

defineExpose({
  focus: () => editorRef.value?.focus(),
})
</script>

<template>
  <div class="text-block" :class="`text-block--${block.type}`">
    <span v-if="block.type === 'bullet'" class="text-block__bullet" aria-hidden="true">•</span>
    <span v-else-if="block.type === 'numbered'" class="text-block__bullet" aria-hidden="true">
      {{ listNumber ?? 1 }}.
    </span>
    <div
      ref="editorRef"
      :data-block-id="block.id"
      class="text-block__editor"
      :class="[
        `text-block__editor--${editorTypeClass}`,
        { 'text-block__editor--code': block.type === 'code', 'text-block__editor--quote': block.type === 'quote' },
      ]"
      contenteditable="true"
      role="textbox"
      :aria-label="block.type.startsWith('heading') ? 'หัวข้อ' : 'ย่อหน้า'"
      :data-placeholder="index === 0 ? 'พิมพ์ / เพื่อเลือกบล็อก...' : 'พิมพ์ / ...'"
      @input="onInput"
      @focus="onFocus"
      @keydown="onKeydown"
      @paste="onPaste"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
    />

    <SlashCommandMenu
      v-if="slashVisible"
      :commands="filteredCommands"
      :active-index="slashActiveIndex"
      :top="slashPos.top"
      :left="slashPos.left"
      @select="applySlashCommand"
    />
  </div>
</template>

<style scoped lang="scss">
.text-block {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.15rem;
  position: relative;

  &__bullet {
    flex-shrink: 0;
    width: 1.5rem;
    padding-top: 0.45rem;
    text-align: right;
    color: var(--Muted-Color);
    font-size: 0.95rem;
    line-height: 1.4;
  }

  &__editor {
    flex: 1;
    min-height: 1.75rem;
    padding: 0.35rem 0;
    outline: none;
    color: var(--Text-Color);
    font-size: 1rem;
    line-height: 1.55;
    word-break: break-word;

    &:empty::before {
      content: attr(data-placeholder);
      color: var(--Placeholder-Color);
      pointer-events: none;
    }

    &--heading1 {
      font-size: 1.75rem;
      font-weight: 600;
      line-height: 1.25;
    }

    &--heading2 {
      font-size: 1.45rem;
      font-weight: 600;
      line-height: 1.3;
    }

    &--heading3 {
      font-size: 1.2rem;
      font-weight: 600;
      line-height: 1.35;
    }

    &--heading4 {
      font-size: 1.05rem;
      font-weight: 600;
      line-height: 1.4;
    }

    &--code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9rem;
      background: var(--Input-Background);
      border-radius: 0.55rem;
      padding: 0.65rem 0.75rem;
      margin: 0.15rem 0;
    }

    &--quote {
      border-left: 3px solid var(--Primary-Color);
      padding-left: 0.85rem;
      color: var(--Muted-Color);
      font-style: italic;
    }

    :deep(b),
    :deep(strong) {
      font-weight: 700;
    }

    :deep(i),
    :deep(em) {
      font-style: italic;
    }

    :deep(u) {
      text-decoration: underline;
    }

    :deep(s),
    :deep(strike) {
      text-decoration: line-through;
    }

    :deep(code) {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.92em;
      background: var(--Input-Background);
      border-radius: 0.35rem;
      padding: 0.1rem 0.35rem;
    }

    :deep(a) {
      color: var(--Primary-Color);
      text-decoration: underline;
    }
  }
}
</style>
