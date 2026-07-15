import { onUnmounted, ref } from 'vue'

const LONG_PRESS_MS = 450
const MOVE_THRESHOLD_PX = 8

export function useBlockReorder(onReorder: (from: number, to: number) => void) {
  const draggingIndex = ref<number | null>(null)
  const dragOverIndex = ref<number | null>(null)

  let pressTimer: ReturnType<typeof setTimeout> | null = null
  let activeIndex: number | null = null
  let startY = 0

  function clearPressTimer() {
    if (pressTimer) {
      clearTimeout(pressTimer)
      pressTimer = null
    }
  }

  function indexFromPoint(clientY: number): number | null {
    const x = Math.min(window.innerWidth - 8, Math.max(8, window.innerWidth / 2))
    const hit = document.elementFromPoint(x, clientY)
    const row = hit?.closest<HTMLElement>('[data-block-index]')
    if (!row) return null
    const index = Number(row.dataset.blockIndex)
    return Number.isFinite(index) ? index : null
  }

  function finishDrag() {
    if (draggingIndex.value !== null && dragOverIndex.value !== null) {
      onReorder(draggingIndex.value, dragOverIndex.value)
    }
    draggingIndex.value = null
    dragOverIndex.value = null
  }

  function cleanupListeners() {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
  }

  function onPointerMove(e: PointerEvent) {
    if (activeIndex === null) return

    if (draggingIndex.value === null) {
      if (Math.abs(e.clientY - startY) > MOVE_THRESHOLD_PX) {
        clearPressTimer()
      }
      return
    }

    e.preventDefault()
    const over = indexFromPoint(e.clientY)
    if (over !== null) dragOverIndex.value = over
  }

  function onPointerUp() {
    clearPressTimer()

    if (draggingIndex.value !== null) {
      finishDrag()
    }

    activeIndex = null
    cleanupListeners()
  }

  function onHandlePointerDown(index: number, e: PointerEvent) {
    if (e.button !== 0) return

    activeIndex = index
    startY = e.clientY

    clearPressTimer()
    pressTimer = setTimeout(() => {
      draggingIndex.value = index
      dragOverIndex.value = index
      if (navigator.vibrate) navigator.vibrate(20)
    }, LONG_PRESS_MS)

    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  onUnmounted(() => {
    clearPressTimer()
    cleanupListeners()
  })

  return {
    draggingIndex,
    dragOverIndex,
    onHandlePointerDown,
  }
}
