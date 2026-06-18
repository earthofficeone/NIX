import { request } from '@/api/http'

export interface AuthResponse {
  token: string
  user: import('@/types').User
}

export interface MessageResponse {
  message: string
}

export const authApi = {
  register(body: { name: string; email: string; password: string }) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  login(body: { email: string; password: string }) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  me() {
    return request<import('@/types').User>('/auth/me')
  },

  forgotPassword(body: { email: string }) {
    return request<MessageResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(body),
      timeoutMs: 45_000,
    })
  },

  resetPassword(body: { email: string; code: string; password: string }) {
    return request<MessageResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
}
