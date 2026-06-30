import { request, type RequestOptions } from '@/api/http'

export const healthApi = {
  check(options?: RequestOptions) {
    return request<{ status: string }>('/health', options)
  },
}
