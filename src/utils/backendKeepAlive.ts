import { api } from '@/api/client'

const INTERVAL_MS = 10 * 60 * 1000
const PING_TIMEOUT_MS = 30_000
const LOG_PREFIX = '[nix-keep-alive]'

export type KeepAliveReason = 'bootstrap' | 'interval' | 'visibility'

function log(message: string, details?: Record<string, unknown>) {
  if (details) {
    console.info(LOG_PREFIX, message, details)
    return
  }
  console.info(LOG_PREFIX, message)
}

async function pingBackend(reason: KeepAliveReason): Promise<void> {
  const startedAt = performance.now()

  log('ping start', { reason })

  try {
    await api.health.check({ timeoutMs: PING_TIMEOUT_MS })
    const durationMs = Math.round(performance.now() - startedAt)
    log('ping ok', { reason, durationMs })
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt)
    const message = error instanceof Error ? error.message : 'unknown error'
    const timedOut = error instanceof Error && message.includes('ไม่ตอบสนอง')

    log('ping error', {
      reason,
      durationMs,
      timedOut,
      message,
    })
  }
}

export function startBackendKeepAlive(): () => void {
  const intervalMinutes = INTERVAL_MS / 60_000

  log('started', {
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
