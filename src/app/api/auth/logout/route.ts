import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  cookies().delete('accessToken')
  cookies().delete('userInfo')

  return NextResponse.json({ success: true, message: 'Logged out successfully' })
}
