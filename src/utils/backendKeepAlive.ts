const INTERVAL_MS = 10 * 60 * 1000
const PING_TIMEOUT_MS = 30_000
const LOG_PREFIX = '[nix-keep-alive]'
const KEEP_ALIVE_HEADER = 'X-Keep-Alive-Source'
const KEEP_ALIVE_SOURCE = 'nix-frontend'

export type KeepAliveReason = 'bootstrap' | 'interval' | 'visibility'

function resolveHealthUrl(): string {
  const apiBase = import.meta.env.VITE_API_URL as string | undefined
  if (apiBase) {
    return `${apiBase.replace(/\/$/, '')}/health`
  }
  return '/api/health'
}

function log(message: string, details?: Record<string, unknown>) {
  if (details) {
    console.info(LOG_PREFIX, message, details)
    return
  }
  console.info(LOG_PREFIX, message)
}

async function pingBackend(reason: KeepAliveReason): Promise<void> {
  const url = resolveHealthUrl()
  const startedAt = performance.now()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS)

  log('ping start', { reason, url })

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        [KEEP_ALIVE_HEADER]: KEEP_ALIVE_SOURCE,
      },
    })

    const durationMs = Math.round(performance.now() - startedAt)

    if (res.ok) {
      log('ping ok', { reason, status: res.status, durationMs })
      return
    }

    log('ping failed', { reason, status: res.status, durationMs })
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt)
    const message = error instanceof Error ? error.message : 'unknown error'
    const timedOut = error instanceof DOMException && error.name === 'AbortError'

    log('ping error', {
      reason,
      durationMs,
      timedOut,
      message,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

export function startBackendKeepAlive(): () => void {
  const healthUrl = resolveHealthUrl()
  const intervalMinutes = INTERVAL_MS / 60_000

  log('started', {
    healthUrl,
    intervalMinutes,
    triggers: ['bootstrap', `every ${intervalMinutes} min`, 'tab/app visible'],
  })

  void pingBackend('bootstrap')

  const intervalId = window.setInterval(() => {
    void pingBackend('interval')
  }, INTERVAL_MS)

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      void pingBackend('visibility')
    }
  }

  document.addEventListener('visibilitychange', handleVisibility)

  return () => {
    clearInterval(intervalId)
    document.removeEventListener('visibilitychange', handleVisibility)
    log('stopped')
  }
}
