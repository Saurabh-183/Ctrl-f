'use client'

import { useSearchParams, useRouter } from 'next/navigation'

import { Box, Button, Typography } from '@mui/material'

const ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_LIST_FETCH_FAILED: 'Unable to fetch product. Please try again later.',
  CATEGORY_LIST_FETCH_FAILED: 'Unable to fetch category list.',
  UNAUTHORIZED: 'You are not authorized. Please login again.',
  DEFAULT: 'Something went wrong. Please try again.'
}

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const code = searchParams.get('code') || 'DEFAULT'
  const from = searchParams.get('from') || '/'

  console.log('from: ', from)
  const message = ERROR_MESSAGES[code] || ERROR_MESSAGES.DEFAULT

  const handleRetry = () => {
    router.push(from)
  }

  return (
    <Box
      minHeight='100%'
      display='flex'
      alignItems='center'
      justifyContent='center'
      px={2}
      bgcolor='background.default'
    >
      <Box
        maxWidth={420}
        width='100%'
        textAlign='center'
        p={{ xs: 3, sm: 4 }}
        borderRadius={2}
        border='1px solid'
        borderColor='divider'
        bgcolor='background.paper'
      >
        <Typography variant='h5' fontWeight={700} gutterBottom>
          Oops!
        </Typography>

        <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
          {message}
        </Typography>

        <Box mt={4} display='flex' gap={2} justifyContent='center' flexWrap='wrap'>
          <Button variant='contained' onClick={handleRetry} size='medium'>
            Retry
          </Button>

          <Button variant='outlined' onClick={() => router.push('/')} size='medium'>
            Go Home
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
