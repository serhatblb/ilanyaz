'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import SectorSelect from '@/components/SectorSelect'
import EmlakForm, { type EmlakData } from '@/components/EmlakForm'
import GaleriForm, { type GaleriData } from '@/components/GaleriForm'
import OutputPanel from '@/components/OutputPanel'
import UsageBar from '@/components/UsageBar'
import LoginModal from '@/components/LoginModal'
import ThemeToggle from '@/components/ThemeToggle'
import {
  getGuestUsageCount,
  incrementGuestUsage,
  canGuestGenerate,
} from '@/lib/usage'

function DashboardContent() {
  const searchParams = useSearchParams()
  const initialSector = searchParams.get('sector') as 'emlak' | 'galeri' | null

  const [sector, setSector] = useState<'emlak' | 'galeri' | null>(initialSector)
  const [loading, setLoading] = useState(false)
  const [outputs, setOutputs] = useState<Record<string, string>>({})
  const [loginModal, setLoginModal] = useState<'copy' | 'limit' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [guestUsage, setGuestUsage] = useState(0)

  const { data: session } = useSession()
  const isLoggedIn = !!session?.user
  // @ts-expect-error — session tipini genişlettik
  const userId = session?.user?.id ?? null

  useEffect(() => {
    setGuestUsage(getGuestUsageCount())
  }, [])

  const handleGenerate = async (data: EmlakData | GaleriData) => {
    if (!sector) return

    if (!isLoggedIn && !canGuestGenerate()) {
      setLoginModal('limit')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector, data, userId }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.code === 'LIMIT_REACHED') {
          setLoginModal('limit')
          return
        }
        setError(json.error || 'Bir hata oluştu.')
        return
      }

      setOutputs(json.outputs)

      if (!isLoggedIn) {
        incrementGuestUsage()
        setGuestUsage(getGuestUsageCount())
      }
    } catch {
      setError('Sunucu hatası. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (_text: string) => {
    if (!isLoggedIn) setLoginModal('copy')
  }

  if (!sector) {
    return <SectorSelect onSelect={setSector} />
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <button
          onClick={() => { setSector(null); setOutputs({}) }}
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          ← Geri
        </button>
        <span className="text-[var(--accent)] font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
          İlanYaz<span className="text-[var(--foreground)]">.ai</span>
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isLoggedIn ? (
            <Link href="/profile" className="flex items-center gap-2 group">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Profil"
                  width={32}
                  height={32}
                  className="rounded-full ring-2 group-hover:ring-[var(--accent)] transition-all"
                  style={{ ringColor: 'var(--border)' }}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                >
                  {session?.user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </Link>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={{ background: 'var(--accent)', color: '#000' }}
            >
              Google ile Giriş
            </button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <UsageBar used={guestUsage} isLoggedIn={isLoggedIn} />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'Syne, sans-serif' }}>
            {sector === 'emlak' ? '🏠 Emlak İlanı' : '🚗 Araç İlanı'}
          </h1>
          <button
            onClick={() => { setSector(null); setOutputs({}) }}
            className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            Sektör değiştir
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-5">
              {sector === 'emlak' ? 'Mülk Bilgileri' : 'Araç Bilgileri'}
            </h2>
            {sector === 'emlak' ? (
              <EmlakForm onSubmit={handleGenerate} loading={loading} />
            ) : (
              <GaleriForm onSubmit={handleGenerate} loading={loading} />
            )}
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Çıktı */}
          <div>
            {Object.keys(outputs).length > 0 ? (
              <OutputPanel outputs={outputs} sector={sector} onCopy={handleCopy} isLoggedIn={isLoggedIn} />
            ) : (
              <div className="bg-[var(--surface)] border border-[var(--border)] border-dashed rounded-2xl p-12 text-center">
                <div className="text-4xl mb-4">✨</div>
                <p className="text-[var(--muted)] text-sm">
                  Formu doldurup &ldquo;İlan Metni Oluştur&rdquo; butonuna basın
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {loginModal && (
        <LoginModal reason={loginModal} onClose={() => setLoginModal(null)} />
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <DashboardContent />
    </Suspense>
  )
}
