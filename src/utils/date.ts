// utils/date.ts
export const formatDate = (isoDate: string | null | undefined, showTime = true) => {
  if (!isoDate) return '-' // handle null or undefined

  const date = new Date(isoDate)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return showTime ? `${day}-${month}-${year} ${hours}:${minutes}` : `${day}-${month}-${year}`
}
