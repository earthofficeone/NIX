import { computed, ref } from 'vue'

export function useCalculator(initial = '0') {
  const display = ref(initial)

  const numericValue = computed(() => {
    const n = parseFloat(display.value)
    return Number.isFinite(n) ? n : 0
  })

  function appendDigit(digit: string) {
    if (display.value === '0' && digit !== '.') {
      display.value = digit
      return
    }
    if (digit === '.' && display.value.includes('.')) return
    if (display.value.replace('.', '').length >= 12) return
    display.value += digit
  }

  function backspace() {
    if (display.value.length <= 1) {
      display.value = '0'
      return
    }
    display.value = display.value.slice(0, -1)
  }

  function clear() {
    display.value = '0'
  }

  function setValue(value: string | number) {
    const str = String(value)
    display.value = str === '' || str === 'NaN' ? '0' : str
  }

  return { display, numericValue, appendDigit, backspace, clear, setValue }
}
