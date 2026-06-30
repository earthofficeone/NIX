const INTERVAL_MS = 10 * 60 * 1000
const PING_TIMEOUT_MS = 30_000

function resolveHealthUrl(): string {
  const apiBase = import.meta.env.VITE_API_URL as string | undefined
  if (apiBase) {
    return `${apiBase.replace(/\/$/, '')}/health`
  }
  return '/api/health'
}

async function pingBackend(): Promise<void> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS)

  try {
    await fetch(resolveHealthUrl(), {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    })
  } catch {
    // Silent — cold start or offline; next ping will retry.
  } finally {
    clearTimeout(timeoutId)
  }
}

export function startBackendKeepAlive(): () => void {
  void pingBackend()

  const intervalId = window.setInterval(() => {
    void pingBackend()
  }, INTERVAL_MS)

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      void pingBackend()
    }
  }

  document.addEventListener('visibilitychange', handleVisibility)

  return () => {
    clearInterval(intervalId)
    document.removeEventListener('visibilitychange', handleVisibility)
  }
}
