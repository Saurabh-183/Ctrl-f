'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className='flex min-h-[60vh] items-center justify-center'>
      <div className='text-center'>
        <h2 className='text-lg font-semibold text-red-600'>Something went wrong</h2>
        <p className='mt-2 text-sm text-gray-500'>{error.message}</p>
        <button onClick={reset} className='mt-4 rounded bg-red-600 px-4 py-2 text-white'>
          Try again
        </button>
      </div>
    </div>
  )
}
