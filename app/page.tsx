"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

function ContactForm() {
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
      setErrMsg('Sunucu hatası, tekrar deneyin')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="text-center py-12 rounded-2xl border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)', fontFamily: 'Syne, sans-serif' }}>
          Mesajın Alındı!
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>En kısa sürede dönüş yapacağız.</p>
        <button onClick={() => setStatus('idle')}
          className="mt-6 text-xs underline" style={{ color: 'var(--accent)' }}>
          Yeni mesaj gönder
        </button>
      </div>
    )
  }

  const inputStyle = {
    background: 'var(--background)',
    borderColor: 'var(--border)',
    color: 'var(--foreground)',
  }

  return (
    <form onSubmit={handleSubmit}
      className="rounded-2xl border p-8 space-y-4"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>Ad Soyad</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ahmet Yılmaz"
            required
            className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-[var(--accent)] transition-colors"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>E-posta</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="ahmet@mail.com"
            required
            className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-[var(--accent)] transition-colors"
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>Mesaj</label>
        <textarea
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder="Soru veya önerinizi yazın…"
          required
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-[var(--accent)] transition-colors resize-none"
          style={inputStyle}
        />
      </div>
      {status === 'error' && (
        <p className="text-xs" style={{ color: '#ef4444' }}>{errMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full py-3 text-sm font-bold rounded-xl transition-all"
        style={{ background: 'var(--accent)', color: '#000', opacity: status === 'sending' ? 0.7 : 1 }}
      >
        {status === 'sending' ? 'Gönderiliyor…' : 'Gönder →'}
      </button>
    </form>
  )
}

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col overflow-x-hidden">

      {/* Arka plan ışıma efekti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px]"
          style={{ background: 'var(--accent)' }} />
        <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px]"
          style={{ background: '#4f8ef7' }} />
      </div>

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
        <span className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
          <span style={{ color: 'var(--accent)' }}>İlanYaz</span>
          <span className="text-[var(--foreground)]">.ai</span>
        </span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session?.user ? (
            <Link href="/dashboard"
              className="px-4 py-2 text-sm font-semibold rounded-xl transition-all"
              style={{ background: 'var(--accent)', color: '#000' }}>
              Dashboard →
            </Link>
          ) : (
            <>
              <button
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                Giriş Yap
              </button>
              <Link href="/dashboard"
                className="px-4 py-2 text-sm font-semibold rounded-xl transition-all"
                style={{ background: 'var(--accent)', color: '#000' }}>
                Ücretsiz Dene →
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border"
          style={{
            background: 'var(--accent-muted)',
            borderColor: 'var(--accent)',
            color: 'var(--accent-text)'
          }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
          Yapay Zeka Destekli · Türkiye&apos;nin İlan Yazma Aracı
        </div>

        {/* Başlık */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--foreground)' }}>
          İlan yazmak için<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #4f8ef7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            30 saniye yeterli.
          </span>
        </h1>

        <p className="text-lg max-w-lg mb-10 leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
          Sahibinden, Hepsiemlak, WhatsApp ve Instagram için
          ayrı ayrı optimize edilmiş profesyonel metinler —
          saniyeler içinde.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20 items-center">
          <Link href="/dashboard"
            className="px-8 py-4 text-base font-bold rounded-2xl transition-all hover:scale-[1.03] hover:shadow-lg"
            style={{ background: 'var(--accent)', color: '#000', boxShadow: 'var(--glow)' }}>
            Hemen Dene — Ücretsiz
          </Link>
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--muted)' }}>
            <span className="flex items-center gap-1">
              <span style={{ color: 'var(--accent)' }}>✓</span> Kayıt gerekmez
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span style={{ color: 'var(--accent)' }}>✓</span> 3 ilan ücretsiz
            </span>
          </div>
        </div>

        {/* Sektör Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl w-full">
          {[
            {
              href: '/dashboard?sector=emlak',
              emoji: '🏠',
              title: 'Emlak İlanı',
              desc: 'Konut, dükkan, arsa — satılık & kiralık. Sahibinden ve Hepsiemlak için optimize.',
              cta: 'Emlak ilanı oluştur'
            },
            {
              href: '/dashboard?sector=galeri',
              emoji: '🚗',
              title: 'Araç İlanı',
              desc: '2. el araç satışları. Sahibinden ve Arabam.com için profesyonel format.',
              cta: 'Araç ilanı oluştur'
            }
          ].map(card => (
            <Link key={card.href} href={card.href}
              className="group p-6 rounded-2xl border text-left transition-all hover:scale-[1.02]"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <div className="text-4xl mb-4">{card.emoji}</div>
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--foreground)' }}>
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted)' }}>
                {card.desc}
              </p>
              <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                {card.cta} →
              </span>
            </Link>
          ))}
        </div>
      </main>

      {/* Stats bar */}
      <div className="relative border-y border-[var(--border-subtle)] py-8 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { val: '30sn', label: 'Ortalama üretim süresi' },
            { val: '4', label: 'Platform için optimize' },
            { val: '%100', label: 'Türkçe & yerel' },
          ].map(s => (
            <div key={s.val}>
              <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--accent)' }}>
                {s.val}
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fiyatlandırma */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--foreground)' }}>
              Basit Fiyatlandırma
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Kredi kartı gerekmez, istediğin zaman iptal</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: 'Ücretsiz', price: '₺0', sub: 'Kayıt gerekmez',
                items: ['3 ilan oluşturma', '4 platform formatı', 'Kopyalama için giriş'],
                accent: false
              },
              {
                name: 'Kayıtlı', price: '₺0', sub: 'Google ile giriş',
                items: ['10 ilan/ay', '4 platform formatı', 'İlan geçmişi'],
                accent: false
              },
              {
                name: 'Pro', price: '₺199', sub: '/ ay',
                items: ['Sınırsız ilan', 'Firma imzası', 'Galeri formu', 'Öncelik destek'],
                accent: true
              },
            ].map(plan => (
              <div key={plan.name}
                className="p-6 rounded-2xl border relative"
                style={{
                  background: plan.accent ? 'var(--surface2)' : 'var(--surface)',
                  borderColor: plan.accent ? 'var(--accent)' : 'var(--border)',
                  boxShadow: plan.accent ? 'var(--glow)' : 'none'
                }}>
                {plan.accent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: 'var(--accent)', color: '#000' }}>
                    Popüler
                  </div>
                )}
                <div className="text-sm font-medium mb-1" style={{ color: plan.accent ? 'var(--accent)' : 'var(--muted)' }}>
                  {plan.name}
                </div>
                <div className="text-3xl font-bold mb-0.5" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--foreground)' }}>
                  {plan.price}
                </div>
                <div className="text-xs mb-5" style={{ color: 'var(--muted)' }}>{plan.sub}</div>
                <ul className="space-y-2">
                  {plan.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                      <span style={{ color: 'var(--accent)' }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* İletişim */}
      <section className="relative py-20 px-6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--foreground)' }}>
              Soru veya Önerin mi Var?
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Sana en kısa sürede dönüş yaparız</p>
          </div>
          <ContactForm />
        </div>
      </section>

      <footer className="relative border-t border-[var(--border-subtle)] py-6 px-6 text-center text-xs"
        style={{ color: 'var(--muted)' }}>
        © 2025 İlanYaz.ai · Tüm hakları saklıdır
      </footer>
    </div>
  );
}
