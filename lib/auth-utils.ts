export function getFirebaseToken(): string | null {
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('firebase-token='))
  return tokenCookie ? tokenCookie.split('=')[1] : null
}

export function clearFirebaseToken(): void {
  document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
}