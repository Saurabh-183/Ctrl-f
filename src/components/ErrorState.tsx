// components/ErrorState.tsx

type ErrorStateProps = {
  title?: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  actionLabel,
  onAction
}: ErrorStateProps) {
  return (
    <div className='flex min-h-[60vh] items-center justify-center px-4'>
      <div className='w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center'>
        <h2 className='mb-2 text-lg font-semibold text-red-700'>{title}</h2>

        <p className='mb-4 text-sm text-red-600'>{message}</p>

        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className='rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700'
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
