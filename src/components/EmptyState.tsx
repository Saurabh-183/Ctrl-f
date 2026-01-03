// components/EmptyState.tsx

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  title = 'No data found',
  description = 'There is nothing to show here yet.',
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className='flex min-h-[60vh] items-center justify-center px-4'>
      <div className='w-full max-w-md rounded-lg border border-gray-200 bg-gray-50 p-6 text-center'>
        <h2 className='mb-2 text-lg font-semibold text-gray-800'>{title}</h2>
        <p className='mb-4 text-sm text-gray-500'>{description}</p>

        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className='rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
