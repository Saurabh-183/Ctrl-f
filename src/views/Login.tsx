'use client'

import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import Image from 'next/image'

import { toast } from 'react-toastify'

import { Box, Button, Typography, IconButton, InputAdornment, CircularProgress } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
        credentials: 'include'
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Login successful!')

        const expiryTime = Date.now() + 12 * 60 * 60 * 1000 // 12 hours

        localStorage.setItem('tokenExpiry', expiryTime.toString())

        router.push('/')
      } else {
        toast.error(data?.error || 'Invalid credentials')
      }
    } catch (err) {
      console.error('🔥 Login error:', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      className='flex flex-col justify-center items-center min-h-screen bg-backgroundPaper p-6'
      sx={{ width: '100%' }}
    >
      <Box
        component='form'
        onSubmit={handleLogin}
        className='flex flex-col gap-5 w-full sm:w-[380px] bg-white shadow-md rounded-2xl p-8'
      >
        <div className='flex justify-between border-b'>
          <Typography variant='h5' className='text-center text-2xl font-bold'>
            Login
          </Typography>
          <Box className='flex justify-center mb-2'>
            <Image src='/logo.svg' alt='Company Logo' width={93} height={48} priority />
          </Box>
        </div>

        <CustomTextField
          label='Email or Username'
          fullWidth
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='Enter your email or username'
        />

        <CustomTextField
          label='Password'
          fullWidth
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder='••••••••'
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  <i className={showPassword ? 'tabler-eye' : 'tabler-eye-off'} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {/* <FormControlLabel control={<Checkbox />} label='Remember me' /> */}

        <Button variant='contained' fullWidth type='submit' disabled={loading}>
          {loading ? <CircularProgress size={22} color='inherit' /> : 'Login'}
        </Button>
      </Box>
    </Box>
  )
}

export default LoginPage
