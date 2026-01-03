// src/app/api/employees/route.ts
import { NextResponse } from 'next/server'

import { serverFetch } from '@/libs/fetch/server-fetch'

export async function GET() {
  const result = await serverFetch<{
    status: number
    message: string
    data: any[]
  }>('/employee/employee-list')

  if (!result.success) {
    return NextResponse.json({ message: result.error.message }, { status: result.error.status || 500 })
  }

  // Return only employees array
  return NextResponse.json(result.data.data)
}
