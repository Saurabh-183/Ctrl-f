// libs/api.ts
import { cookies } from 'next/headers'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

export async function apiGet<T>(endpoint: string): Promise<T> {
  try {
    const token = cookies().get('accessToken')?.value

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      cache: 'no-store'
    })

    let json: any

    try {
      json = await res.json()
    } catch {
      throw new Error('Invalid JSON response from server')
    }

    // Handle backend errors
    if (!res.ok) {
      throw new Error(json?.message || `GET ${endpoint} failed`)
    }

    return json
  } catch (error: any) {
    console.error('API GET Error:', error)
    throw new Error(error?.message || 'Something went wrong')
  }
}

export async function apiPost<T>(endpoint: string, body: any): Promise<T> {
  try {
    const token = cookies().get('accessToken')?.value

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body
    })

    let json: any

    try {
      json = await res.json()
    } catch {
      throw new Error('Invalid JSON response from server')
    }

    if (!res.ok) {
      throw new Error(json?.message || `POST ${endpoint} failed`)
    }

    return json
  } catch (error: any) {
    console.error('API POST Error:', error)
    throw new Error(error?.message || 'Something went wrong')
  }
}
