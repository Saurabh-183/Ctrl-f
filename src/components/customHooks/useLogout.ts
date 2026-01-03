'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { toast } from 'react-toastify'

export const useLogout = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      const data = await res.json()

      if (res.ok && data?.success) {
        toast.success(data.message || 'Logged out successfully!')
        router.push('/login')
      } else {
        toast.error(data?.message || 'Failed to log out.')
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return { handleLogout, loading }
}
