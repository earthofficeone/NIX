const BASE = import.meta.env.VITE_API_URL || '/api'

const TOKEN_KEY = 'nix_token'

interface ApiEnvelope<T> {
  data?: T
  error?: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

const REQUEST_TIMEOUT_MS = 15_000

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new ApiError('เซิร์ฟเวอร์ไม่ตอบสนอง กรุณาลองใหม่อีกครั้ง', 408)
    }
    throw new ApiError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 0)
  } finally {
    clearTimeout(timeoutId)
  }

  const body = (await res.json()) as ApiEnvelope<T>
  if (!res.ok) {
    throw new ApiError(body.error || 'เกิดข้อผิดพลาด', res.status)
  }
  return body.data as T
}
