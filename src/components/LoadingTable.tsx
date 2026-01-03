export default function LoadingTable({ rows = 5 }) {
  return (
    <div className='p-4 space-y-4'>
      {/* Header */}
      <div className='flex justify-between items-center space-x-2'>
        <div className='h-10 w-64 rounded bg-gray-200 animate-pulse' />
        <div className='flex gap-2'>
          <div className='h-10 w-24 rounded bg-gray-200 animate-pulse' />
          <div className='h-10 w-24 rounded bg-gray-200 animate-pulse' />
        </div>
      </div>

      {/* Table rows */}
      <div className='space-y-2'>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className='h-12 w-full rounded bg-gray-200 animate-pulse' />
        ))}
      </div>

      {/* Pagination */}
      <div className='flex justify-end gap-2 mt-2'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='h-8 w-8 rounded bg-gray-200 animate-pulse' />
        ))}
      </div>
    </div>
  )
}
