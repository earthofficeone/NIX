import { computed, ref } from 'vue'

export type ThemeMode = 'dark' | 'light'

const STORAGE_KEY = 'nix_theme'

const theme = ref<ThemeMode>('dark')

function applyTheme(mode: ThemeMode) {
  theme.value = mode
  document.documentElement.setAttribute('data-theme', mode)
  localStorage.setItem(STORAGE_KEY, mode)

  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute(
    'content',
    getComputedStyle(document.documentElement).getPropertyValue('--Meta-Theme-Color').trim() ||
      (mode === 'dark' ? '#121212' : '#f3ece2'),
  )
}

function readStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return 'dark'
}

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  function init() {
    applyTheme(readStoredTheme())
  }

  function setTheme(mode: ThemeMode) {
    applyTheme(mode)
  }

  function toggle() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return {
    theme,
    isDark,
    init,
    setTheme,
    toggle,
  }
}
