'use client'

import { useState } from 'react'

interface OutputPanelProps {
  outputs: Record<string, string>
  sector: 'emlak' | 'galeri'
  onCopy: (text: string) => void
  isLoggedIn: boolean
}

const TABS_EMLAK = [
  { key: 'sahibinden', label: 'Sahibinden' },
  { key: 'hepsiemlak', label: 'Hepsiemlak' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'instagram', label: 'Instagram' },
]

const TABS_GALERI = [
  { key: 'sahibinden', label: 'Sahibinden' },
  { key: 'arabam', label: 'Arabam.com' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'instagram', label: 'Instagram' },
]

export default function OutputPanel({ outputs, sector, onCopy, isLoggedIn }: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)

  const tabs = sector === 'galeri' ? TABS_GALERI : TABS_EMLAK
  const currentTab = tabs[activeTab]
  const currentText = outputs[currentTab.key] || ''

  const handleCopy = () => {
    if (!isLoggedIn) {
      onCopy(currentText)
      return
    }
    navigator.clipboard.writeText(currentText)
    setCopied(currentTab.key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[var(--border)]">
        {tabs.map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(i)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === i
                ? 'text-[var(--accent)] border-b-2 border-[var(--accent)] bg-[var(--surface)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="bg-[var(--background)] rounded-xl p-4 min-h-48 text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
          {currentText || <span className="text-[var(--muted)]">İlan metni burada görünecek...</span>}
        </div>

        {currentText && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-[var(--muted)]">{currentText.length} karakter</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-black text-sm font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
            >
              {copied === currentTab.key ? (
                <>✓ Kopyalandı</>
              ) : (
                <>📋 Kopyala</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
