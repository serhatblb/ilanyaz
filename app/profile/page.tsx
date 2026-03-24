'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
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
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    setAvatarError(null)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd })
      const j = await res.json()
      if (!res.ok) { setAvatarError(j.error); return }
      await update({ image: j.url })
    } catch {
      setAvatarError('Yükleme başarısız')
    } finally {
      setAvatarUploading(false)
    }
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
          <div className="relative mb-5 group cursor-pointer" onClick={() => fileRef.current?.click()} title="Fotoğrafı değiştir">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt="Profil fotoğrafı"
                width={96}
                height={96}
                className="rounded-full ring-4 ring-[var(--accent)]"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
                style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
              >
                {name.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              {avatarUploading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                  <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                  <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          {avatarError && <p className="text-xs mb-2" style={{ color: '#ef4444' }}>{avatarError}</p>}

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
          className="w-full py-3 text-sm font-medium rounded-xl border transition-all hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 active:scale-[0.98]"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  )
}
