'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

export default function FloatingWidgets() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const j = await res.json()
      if (!res.ok) { setErrMsg(j.error); setStatus('error'); return }
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setErrMsg('Sunucu hatası')
      setStatus('error')
    }
  }

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-colors"
  const inputStyle = { background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }

  return (
    <>
      {/* Floating butonlar */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-40">

        {/* Profil ikonu */}
        {session?.user && (
          <Link href="/profile"
            className="flex items-center justify-center w-11 h-11 rounded-full shadow-lg ring-2 ring-[var(--border)] hover:ring-[var(--accent)] transition-all overflow-hidden"
            title="Profilim">
            {session.user.image ? (
              <Image src={session.user.image} alt="Profil" width={44} height={44} className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base font-bold"
                style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                {session.user.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </Link>
        )}

        {/* İletişim butonu */}
        <button
          onClick={() => { setOpen(true); setStatus('idle') }}
          className="flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95"
          style={{ background: 'var(--accent)', color: '#000', boxShadow: 'var(--glow)' }}
          title="Soru & Öneri"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* İletişim modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border shadow-2xl p-6 z-10 mb-20 sm:mb-0"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <button onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-xl leading-none hover:text-[var(--foreground)] transition-colors"
              style={{ color: 'var(--muted)' }}>×</button>

            {status === 'sent' ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--foreground)' }}>
                  Mesajın Alındı!
                </h3>
                <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>En kısa sürede dönüş yapacağız.</p>
                <button onClick={() => setStatus('idle')} className="text-xs underline" style={{ color: 'var(--accent)' }}>
                  Yeni mesaj gönder
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--foreground)' }}>
                  Soru & Öneri
                </h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input type="text" placeholder="Ad Soyad" required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className={inputCls} style={inputStyle} />
                  <input type="email" placeholder="E-posta" required value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className={inputCls} style={inputStyle} />
                  <textarea placeholder="Mesajınız…" required rows={3} value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className={`${inputCls} resize-none`} style={inputStyle} />
                  {errMsg && <p className="text-xs" style={{ color: '#ef4444' }}>{errMsg}</p>}
                  <button type="submit" disabled={status === 'sending'}
                    className="w-full py-2.5 text-sm font-bold rounded-xl transition-all"
                    style={{ background: 'var(--accent)', color: '#000', opacity: status === 'sending' ? 0.7 : 1 }}>
                    {status === 'sending' ? 'Gönderiliyor…' : 'Gönder →'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
