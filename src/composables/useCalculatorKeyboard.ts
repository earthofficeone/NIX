import { onMounted, onUnmounted } from 'vue'

function isOtherFormField(target: EventTarget | null, amountInputId?: string): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  if (amountInputId && target.id === amountInputId) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return target.isContentEditable
}

export function useCalculatorKeyboard(
  handleKey: (e: KeyboardEvent) => boolean,
  options?: { enabled?: () => boolean; amountInputId?: string },
) {
  function onKeydown(e: KeyboardEvent) {
    if (options?.enabled && !options.enabled()) return
    if (isOtherFormField(e.target, options?.amountInputId)) return
    if (handleKey(e)) e.preventDefault()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}
