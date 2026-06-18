import { request } from '@/api/http'
import type { User } from '@/types'

export interface AuthResponse {
  token: string
  user: User
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
    return request<User>('/auth/me')
  },
}
