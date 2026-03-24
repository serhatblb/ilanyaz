'use client'

import { FREE_LIMIT, REGISTERED_LIMIT } from '@/lib/usage'

interface UsageBarProps {
  used: number
  isLoggedIn: boolean
}

export default function UsageBar({ used, isLoggedIn }: UsageBarProps) {
  const limit = isLoggedIn ? REGISTERED_LIMIT : FREE_LIMIT
  const remaining = Math.max(0, limit - used)
  const percent = Math.min(100, (used / limit) * 100)

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent)] rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-[var(--muted)] whitespace-nowrap">
        {remaining}/{limit} hak
      </span>
    </div>
  )
}
