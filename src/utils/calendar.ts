import { todayISO } from '@/utils/format'

export interface CalendarCell {
  date: string | null
  day: number | null
  isToday: boolean
  recordCount: number
}

const WEEKDAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'] as const

export function weekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS
}

export function buildMonthCalendar(month: string, recordCounts: Map<string, number>): CalendarCell[] {
  const [year, monthNum] = month.split('-').map(Number)
  const firstDay = new Date(year!, monthNum! - 1, 1)
  const daysInMonth = new Date(year!, monthNum!, 0).getDate()
  const startWeekday = firstDay.getDay()
  const today = todayISO()

  const cells: CalendarCell[] = []

  for (let i = 0; i < startWeekday; i++) {
    cells.push({ date: null, day: null, isToday: false, recordCount: 0 })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({
      date,
      day,
      isToday: date === today,
      recordCount: recordCounts.get(date) ?? 0,
    })
  }

  return cells
}

export function isDateInMonth(date: string, month: string): boolean {
  return date.startsWith(month)
}
