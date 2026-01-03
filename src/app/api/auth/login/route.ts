import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface PermissionType {
  permissionId: number
  permissionName: string
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const authRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!authRes.ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const authData = await authRes.json()

    const profileRes = await fetch(`${BASE_URL}/admin/user-profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.accessToken}`
      }
    })

    if (!profileRes.ok) {
      console.error('Failed to fetch user profile:', profileRes.statusText)

return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
    }

    const profileData = await profileRes.json()
    const userProfile = profileData.userProfile

    cookies().set({
      name: 'accessToken',
      value: authData.accessToken,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60
    })

    cookies().set({
      name: 'userInfo',
      value: JSON.stringify({
        id: userProfile.id,
        name: `${userProfile.firstName?.trim() || ''} ${userProfile.lastName?.trim() || ''}`,
        email: userProfile.email?.trim(),
        mobile: userProfile.mobile,
        roleId: userProfile.userRole,
        department: userProfile.department,
        companyId: userProfile.company?.[0]?.companyId || authData.companyId,
        companyName: userProfile.company?.[0]?.companyName || '',
        permissions: userProfile.permission?.map((p: PermissionType) => p.permissionName) || [],
        profileUrl: userProfile.profileUrlString
      }),
      httpOnly: false,
      sameSite: 'lax',
      secure: false,
      path: '/'
    })

    return NextResponse.json({
      success: true,
      token: authData.accessToken,
      user: userProfile,
      expiresIn: Date.now() + 12 * 60 * 60 * 1000
    })
  } catch (error: any) {
    console.error('Login error:', error)

return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
