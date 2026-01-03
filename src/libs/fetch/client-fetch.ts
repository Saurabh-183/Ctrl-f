// src/lib/fetch/client-fetch.ts
'use client'

import type { ApiResult } from '@/libs/types/api'

export async function clientFetch<T>(url: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    const json = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        error: {
          message: json?.message || 'Request failed',
          status: res.status
        }
      }
    }

    return { success: true, data: json }
  } catch {
    return {
      success: false,
      error: { message: 'Network error' }
    }
  }
}
