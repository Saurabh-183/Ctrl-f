export function getUserInfo() {
  if (typeof document === 'undefined') return null
  const cookie = document.cookie.split('; ').find(row => row.startsWith('userInfo='))

  if (!cookie) return null

  try {
    return JSON.parse(decodeURIComponent(cookie.split('=')[1]))
  } catch {
    return null
  }
}
