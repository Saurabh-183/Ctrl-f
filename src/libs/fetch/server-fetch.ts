// lib/fetch/server-fetch.ts
import 'server-only'
import { cookies } from 'next/headers'

import type { ApiResult } from '@/libs/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_BASE_URL is missing in environment variables')
}

/**
 * Standard backend response envelope
 */
export type BackendResponse<T> = {
  status: number
  message: string
  data: T
}

export async function serverFetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const token = cookies().get('accessToken')?.value

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      cache: options.cache ?? 'no-store'
    })

    const json = (await res.json().catch(() => null)) as BackendResponse<T> | null

    console.log('json: ', json)

    // ❌ Backend error
    if (!res.ok) {
      return {
        success: false,
        error: {
          message: json?.message || 'Request failed',
          status: res.status
        }
      }
    }

    // ✅ Success
    return {
      success: true,
      data: json!.data,
      status: json!.status,
      message: json!.message
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Network error'
      }
    }
  }
}
