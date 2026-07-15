import { onMounted, onUnmounted, ref } from 'vue'

export type FormatCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'link'
  | 'code'
  | 'clear'
  | 'color'

export interface ToolbarState {
  visible: boolean
  top: number
  left: number
}

const toolbar = ref<ToolbarState>({ visible: false, top: 0, left: 0 })
let activeRoot: HTMLElement | null = null

function hideToolbar() {
  toolbar.value = { ...toolbar.value, visible: false }
  activeRoot = null
}

function updateToolbarPosition() {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || !selection.rangeCount) {
    hideToolbar()
    return
  }

  const range = selection.getRangeAt(0)
  const node = range.commonAncestorContainer
  const el = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement
  if (!el || !activeRoot?.contains(el)) {
    hideToolbar()
    return
  }

  const rect = range.getBoundingClientRect()
  if (!rect.width && !rect.height) {
    hideToolbar()
    return
  }

  toolbar.value = {
    visible: true,
    top: Math.max(8, rect.top - 52 + window.scrollY),
    left: Math.min(window.innerWidth - 180, Math.max(8, rect.left + rect.width / 2 - 90 + window.scrollX)),
  }
}

function onSelectionChange() {
  if (!activeRoot) return
  updateToolbarPosition()
}

export function useRichText() {
  function registerEditor(el: HTMLElement | null) {
    activeRoot = el
    updateToolbarPosition()
  }

  function applyFormat(command: FormatCommand, value?: string) {
    if (!activeRoot) return
    activeRoot.focus()

    switch (command) {
      case 'bold':
        document.execCommand('bold')
        break
      case 'italic':
        document.execCommand('italic')
        break
      case 'underline':
        document.execCommand('underline')
        break
      case 'strikeThrough':
        document.execCommand('strikeThrough')
        break
      case 'link': {
        const url = value ?? window.prompt('ลิงก์ URL', 'https://')?.trim()
        if (!url) return
        document.execCommand('createLink', false, url)
        break
      }
      case 'code': {
        const selection = window.getSelection()
        if (!selection?.rangeCount) return
        const text = selection.toString()
        if (!text) return
        document.execCommand('insertHTML', false, `<code>${text}</code>`)
        break
      }
      case 'clear':
        document.execCommand('removeFormat')
        break
      case 'color':
        if (value) document.execCommand('foreColor', false, value)
        break
    }

    updateToolbarPosition()
    activeRoot.dispatchEvent(new Event('input', { bubbles: true }))
  }

  onMounted(() => {
    document.addEventListener('selectionchange', onSelectionChange)
  })

  onUnmounted(() => {
    document.removeEventListener('selectionchange', onSelectionChange)
    hideToolbar()
  })

  return {
    toolbar,
    registerEditor,
    hideToolbar,
    applyFormat,
  }
}
