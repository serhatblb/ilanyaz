'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [name, setName] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // @ts-expect-error — session tipini genişlettik
  const plan: string = session?.user?.plan ?? 'registered'
  // @ts-expect-error
  const usageCount: number = session?.user?.usageCount ?? 0

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
  }, [session])

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/')
  }, [status, router])

  if (status === 'loading' || !session?.user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    )
  }

  const handleSave = async () => {
    if (!name.trim() || name.trim() === session.user?.name) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const j = await res.json()
        setError(j.error || 'Hata oluştu')
        return
      }
      await update({ name })
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Sunucu hatası')
    } finally {
      setSaving(false)
    }
  }

  const planLabel: Record<string, { label: string; color: string }> = {
    guest:      { label: 'Misafir',  color: 'var(--muted)' },
    registered: { label: 'Ücretsiz', color: 'var(--accent)' },
    pro:        { label: 'Pro ⚡',   color: '#f59e0b' },
  }
  const planInfo = planLabel[plan] ?? planLabel.registered
  const usageLimit = plan === 'pro' ? null : plan === 'registered' ? 10 : 3

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <Link href="/dashboard" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          ← Dashboard
        </Link>
        <span className="text-[var(--accent)] font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
          İlanYaz<span className="text-[var(--foreground)]">.ai</span>
        </span>
        <ThemeToggle />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Avatar + isim */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-5">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt="Profil fotoğrafı"
                width={96}
                height={96}
                className="rounded-full ring-4"
                style={{ ringColor: 'var(--accent)' }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
                style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
              >
                {name.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ background: 'var(--accent)', color: '#000' }}
              title="Google ile bağlı"
            >
              G
            </div>
          </div>

          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{session.user.email}</p>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-semibold mt-1"
            style={{ background: 'var(--accent-muted)', color: planInfo.color }}
          >
            {planInfo.label}
          </span>
        </div>

        {/* Kart: İsim düzenleme */}
        <div
          className="rounded-2xl border p-6 mb-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground-secondary)' }}>
            Profil Bilgileri
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>Ad Soyad</label>
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                  style={{
                    background: 'var(--background)',
                    borderColor: 'var(--accent)',
                    color: 'var(--foreground)',
                  }}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                />
              ) : (
                <p className="text-sm py-2.5 px-1" style={{ color: 'var(--foreground)' }}>
                  {session.user.name || '—'}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>E-posta</label>
              <p className="text-sm py-2.5 px-1" style={{ color: 'var(--foreground-secondary)' }}>
                {session.user.email}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-xs mt-3" style={{ color: '#ef4444' }}>{error}</p>
          )}
          {saved && (
            <p className="text-xs mt-3" style={{ color: 'var(--accent)' }}>✓ Kaydedildi</p>
          )}

          <div className="flex gap-2 mt-5">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold rounded-xl transition-all"
                  style={{ background: 'var(--accent)', color: '#000', opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
                <button
                  onClick={() => { setEditing(false); setName(session.user?.name || '') }}
                  className="px-4 py-2 text-sm rounded-xl transition-all"
                  style={{ background: 'var(--surface2)', color: 'var(--muted)' }}
                >
                  İptal
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 text-sm rounded-xl transition-all border"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground-secondary)' }}
              >
                İsmi Düzenle
              </button>
            )}
          </div>
        </div>

        {/* Kart: Kullanım */}
        <div
          className="rounded-2xl border p-6 mb-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground-secondary)' }}>
            Kullanım
          </h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--muted)' }}>Bu ay oluşturulan ilan</span>
            <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              {usageCount}{usageLimit ? ` / ${usageLimit}` : ''}
            </span>
          </div>
          {usageLimit && (
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (usageCount / usageLimit) * 100)}%`,
                  background: usageCount >= usageLimit ? '#ef4444' : 'var(--accent)',
                }}
              />
            </div>
          )}
          {plan !== 'pro' && (
            <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
              Pro plana geçerek sınırsız ilan oluşturabilirsiniz.
            </p>
          )}
        </div>

        {/* Çıkış */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full py-3 text-sm rounded-xl border transition-all"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  )
}
