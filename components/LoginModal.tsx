'use client'

import { signIn } from 'next-auth/react'

interface LoginModalProps {
  onClose: () => void
  reason: 'copy' | 'limit'
}

export default function LoginModal({ onClose, reason }: LoginModalProps) {
  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 max-w-md w-full text-center z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--foreground)] text-xl"
        >
          ×
        </button>

        <div className="text-5xl mb-5">
          {reason === 'copy' ? '🔒' : '⚡'}
        </div>

        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
          {reason === 'copy' ? 'Kopyalamak için giriş yapın' : 'Ücretsiz limitiniz doldu'}
        </h2>

        <p className="text-[var(--muted)] mb-8 text-sm leading-relaxed">
          {reason === 'copy'
            ? 'Google hesabınızla giriş yaparak metni kopyalayabilir ve aylık 10 ilan hakkı kazanabilirsiniz.'
            : '3 ücretsiz ilanınızı kullandınız. Devam etmek için giriş yapın — aylık 10 ilan hakkı tamamen ücretsiz!'}
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google ile Giriş Yap
        </button>

        <p className="mt-4 text-xs text-[var(--muted)]">
          Giriş yaparak gizlilik politikamızı kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  )
}
