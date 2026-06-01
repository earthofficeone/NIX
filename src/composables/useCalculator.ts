import { computed, ref } from 'vue'

export type CalcOperator = '+' | '-' | '×' | '÷'

const OP_SYMBOL: Record<CalcOperator, string> = {
  '+': '+',
  '-': '−',
  '×': '×',
  '÷': '÷',
}

function formatAmount(n: number): string {
  if (!Number.isFinite(n)) return '0'
  const rounded = Math.round(n * 100) / 100
  const s = String(rounded)
  if (s.length > 14) return rounded.toExponential(4)
  return s
}

/** ลบช่องว่างและแปลงสัญลักษณ์ก่อนคำนวณ */
function normalizeExpression(expr: string): string {
  return expr
    .replace(/\s+/g, '')
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
}

function charToOp(ch: string): CalcOperator | null {
  switch (ch) {
    case '+':
      return '+'
    case '-':
      return '-'
    case '*':
      return '×'
    case '/':
      return '÷'
    default:
      return null
  }
}

function applyOp(a: number, b: number, op: CalcOperator): number {
  switch (op) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '×':
      return a * b
    case '÷':
      return b === 0 ? 0 : a / b
  }
}

/** คำนวณซ้ายไปขวา: 400 - 300 + 500 = 600 */
export function evaluateExpression(expr: string): number {
  const normalized = normalizeExpression(expr)
  if (!normalized || normalized === '') return 0

  const tokens: (number | string)[] = []
  let num = ''

  for (const ch of normalized) {
    if ((ch >= '0' && ch <= '9') || ch === '.') {
      num += ch
      continue
    }
    if ('+-*/'.includes(ch)) {
      if (num !== '') {
        tokens.push(parseFloat(num))
        num = ''
      }
      tokens.push(ch)
    }
  }
  if (num !== '') tokens.push(parseFloat(num))

  // ตัดเครื่องหมายท้ายสุด เช่น "400-300+"
  while (tokens.length > 0 && typeof tokens[tokens.length - 1] === 'string') {
    tokens.pop()
  }

  if (tokens.length === 0) return 0
  const first = tokens[0]
  if (typeof first !== 'number' || !Number.isFinite(first)) return 0

  let result = first
  for (let i = 1; i < tokens.length; i += 2) {
    const opCh = tokens[i]
    const b = tokens[i + 1]
    if (typeof opCh !== 'string' || typeof b !== 'number' || !Number.isFinite(b)) break
    const op = charToOp(opCh)
    if (!op) break
    result = applyOp(result, b, op)
  }
  return result
}

function hasOperator(expr: string): boolean {
  return /[+−×÷]/.test(expr)
}

function endsWithOperator(expr: string): boolean {
  return /[+−×÷]\s*$/.test(expr.trimEnd())
}

function lastNumberPart(expr: string): string {
  const parts = expr.trimEnd().split(/\s*[+−×÷]\s*/)
  return parts[parts.length - 1] ?? ''
}

export function sanitizeExpressionInput(raw: string): string {
  let s = raw.replace(/,/g, '.')
  s = s.replace(/[*]/g, '×').replace(/\//g, '÷').replace(/-/g, '−')
  s = s.replace(/[^\d.+−×÷\s]/g, '')
  return s.trimStart()
}

const KEY_TO_OP: Record<string, CalcOperator> = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷',
}

const CODE_TO_OP: Record<string, CalcOperator> = {
  NumpadAdd: '+',
  NumpadSubtract: '-',
  NumpadMultiply: '×',
  NumpadDivide: '÷',
}

export function useCalculator(initial = '0') {
  /** นิพจน์ทั้งหมดในบรรทัดเดียว เช่น "400 − 300 + 500" */
  const display = ref(initial === '0' ? '' : String(initial))

  const liveResult = computed(() => {
    if (!display.value || !hasOperator(display.value)) return ''
    return formatAmount(evaluateExpression(display.value))
  })

  const numericValue = computed(() => {
    if (!display.value || display.value.trim() === '') return 0
    if (hasOperator(display.value)) {
      return evaluateExpression(display.value)
    }
    const n = parseFloat(normalizeExpression(display.value).replace(/[*]/g, ''))
    return Number.isFinite(n) ? n : 0
  })

  /** แสดงใน input — ว่างแสดง placeholder */
  const displayText = computed(() => display.value || '0')

  function appendDigit(digit: string) {
    let expr = display.value

    if (!expr || expr === '0') {
      if (digit === '.') {
        display.value = '0.'
        return
      }
      display.value = digit
      return
    }

    if (endsWithOperator(expr)) {
      display.value = expr.trimEnd() + (digit === '.' ? '0.' : digit)
      return
    }

    const lastNum = lastNumberPart(expr)
    if (digit === '.' && lastNum.includes('.')) return
    if (expr.replace(/[^\d]/g, '').length >= 24) return

    display.value = expr + digit
  }

  function setOperator(op: CalcOperator) {
    let expr = display.value.trim()
    const sym = OP_SYMBOL[op]

    if (!expr || expr === '0') {
      display.value = `0 ${sym} `
      return
    }

    if (endsWithOperator(expr)) {
      display.value = expr.replace(/\s*[+−×÷]\s*$/, ` ${sym} `)
      return
    }

    display.value = `${expr} ${sym} `
  }

  function equals() {
    if (!display.value || !hasOperator(display.value)) return
    display.value = formatAmount(evaluateExpression(display.value))
  }

  function backspace() {
    const expr = display.value
    if (!expr || expr.length === 0) {
      display.value = ''
      return
    }
    display.value = expr.slice(0, -1)
  }

  function clear() {
    display.value = ''
  }

  function setValue(value: string | number) {
    const n = typeof value === 'number' ? value : parseFloat(String(value))
    display.value = !Number.isFinite(n) || n === 0 ? '' : formatAmount(n)
  }

  function handleCalculatorKey(e: KeyboardEvent): boolean {
    if (e.metaKey || e.ctrlKey || e.altKey) return false

    const { key, code } = e

    if (/^[0-9]$/.test(key) || /^Numpad[0-9]$/.test(code)) {
      appendDigit(key.length === 1 ? key : code.slice(-1))
      return true
    }

    if (key === '.' || key === ',' || code === 'NumpadDecimal' || code === 'Comma') {
      appendDigit('.')
      return true
    }

    const op = KEY_TO_OP[key] ?? CODE_TO_OP[code]
    if (op) {
      setOperator(op)
      return true
    }

    if (key === 'Enter' || key === '=' || code === 'NumpadEnter') {
      equals()
      return true
    }

    if (key === 'Backspace' || key === 'Delete') {
      backspace()
      return true
    }

    if (key === 'Escape' || key === 'c' || key === 'C') {
      clear()
      return true
    }

    return false
  }

  function onAmountInput(raw: string) {
    display.value = sanitizeExpressionInput(raw)
  }

  function onAmountBlur() {
    if (!display.value || display.value.trim() === '') return
    if (endsWithOperator(display.value)) {
      display.value = display.value.trimEnd().replace(/\s*[+−×÷]\s*$/, '')
    }
    if (hasOperator(display.value)) {
      display.value = formatAmount(evaluateExpression(display.value))
    } else {
      display.value = formatAmount(numericValue.value)
    }
  }

  function onAmountKeydown(e: KeyboardEvent) {
    if (handleCalculatorKey(e)) e.preventDefault()
  }

  function onAmountPaste(e: ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData?.getData('text') ?? ''
    const sanitized = sanitizeExpressionInput(text)
    if (sanitized) display.value = sanitized
  }

  return {
    display,
    displayText,
    liveResult,
    numericValue,
    appendDigit,
    setOperator,
    equals,
    backspace,
    clear,
    setValue,
    handleCalculatorKey,
    onAmountInput,
    onAmountBlur,
    onAmountKeydown,
    onAmountPaste,
    evaluateExpression,
  }
}
