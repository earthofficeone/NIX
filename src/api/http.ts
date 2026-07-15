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

export type RequestOptions = RequestInit & {
  timeoutMs?: number
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = REQUEST_TIMEOUT_MS, ...fetchOptions } = options
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      ...fetchOptions,
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

  let body: ApiEnvelope<T>
  try {
    const text = await res.text()
    body = text ? (JSON.parse(text) as ApiEnvelope<T>) : {}
  } catch {
    throw new ApiError(
      res.ok ? 'ตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง' : 'ไม่สามารถเข้าสู่ระบบได้ — ตรวจสอบการเชื่อมต่อ',
      res.status || 0,
    )
  }

  if (!res.ok) {
    throw new ApiError(body.error || 'เกิดข้อผิดพลาด', res.status)
  }
  return body.data as T
}
