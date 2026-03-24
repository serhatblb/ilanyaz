// Kayıtsız kullanıcı limiti: localStorage'da tutulan sayaç
export const FREE_LIMIT = 3
export const REGISTERED_LIMIT = 10

export function getGuestUsageCount(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('ilanyaz_usage') || '0', 10)
}

export function incrementGuestUsage(): void {
  if (typeof window === 'undefined') return
  const current = getGuestUsageCount()
  localStorage.setItem('ilanyaz_usage', String(current + 1))
}

export function canGuestGenerate(): boolean {
  return getGuestUsageCount() < FREE_LIMIT
}

export function getRemainingGuestCount(): number {
  return Math.max(0, FREE_LIMIT - getGuestUsageCount())
}
