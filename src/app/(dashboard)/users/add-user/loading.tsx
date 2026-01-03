export default function Loading() {
  return (
    <div className='p-6 space-y-6'>
      {/* Page Title Skeleton */}
      <div className='h-6 w-48 animate-pulse rounded bg-gray-200'></div>

      {/* User Info */}
      <div className='space-y-4 p-4 border rounded-md bg-white'>
        <div className='h-5 w-32 animate-pulse rounded bg-gray-200'></div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2'>
          <div className='h-10 w-full animate-pulse rounded bg-gray-200'></div>
          <div className='h-10 w-full animate-pulse rounded bg-gray-200'></div>
        </div>
      </div>

      {/* Personal Information */}
      <div className='space-y-4 p-4 border rounded-md bg-white'>
        <div className='h-5 w-40 animate-pulse rounded bg-gray-200'></div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2'>
          <div className='h-10 w-full animate-pulse rounded bg-gray-200'></div>
          <div className='h-10 w-full animate-pulse rounded bg-gray-200'></div>
          <div className='h-10 w-full animate-pulse rounded bg-gray-200'></div>
          <div className='h-10 w-full animate-pulse rounded bg-gray-200'></div>
          <div className='h-10 w-full animate-pulse rounded bg-gray-200'></div>
          <div className='h-10 w-full animate-pulse rounded bg-gray-200'></div>
        </div>
      </div>

      {/* Role Management */}
      <div className='space-y-4 p-4 border rounded-md bg-white'>
        <div className='h-5 w-36 animate-pulse rounded bg-gray-200'></div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2'>
          <div className='h-10 w-full animate-pulse rounded bg-gray-200'></div>
          <div className='h-10 w-full animate-pulse rounded bg-gray-200'></div>
        </div>
      </div>

      {/* Submit Button */}
      <div className='h-10 w-32 animate-pulse rounded bg-gray-200'></div>
    </div>
  )
}
