'use client'

interface PricingModalProps {
  onClose: () => void
}

export default function PricingModal({ onClose }: PricingModalProps) {
  const handleCheckout = async (plan: 'pro' | 'enterprise') => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 max-w-2xl w-full z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#888] hover:text-white text-xl">×</button>

        <h2 className="text-2xl font-bold text-white mb-2 text-center" style={{ fontFamily: 'Syne, sans-serif' }}>
          Pro&apos;ya Geç
        </h2>
        <p className="text-center text-[#888] text-sm mb-8">Sınırsız ilan, firma imzası ve daha fazlası</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pro */}
          <div className="p-6 bg-[#0f0f0f] border border-[#e8ff5a] rounded-2xl">
            <div className="text-[#e8ff5a] text-sm font-medium mb-2">Pro</div>
            <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>₺199</div>
            <div className="text-xs text-[#888] mb-5">/ ay</div>
            <ul className="space-y-2 text-sm text-[#ccc] mb-6">
              <li>✓ Sınırsız ilan</li>
              <li>✓ Firma imzası</li>
              <li>✓ Galeri formu</li>
              <li>✓ İlan geçmişi</li>
            </ul>
            <button
              onClick={() => handleCheckout('pro')}
              className="w-full py-3 bg-[#e8ff5a] text-black font-bold rounded-xl hover:bg-[#d4eb3e] transition-colors text-sm"
            >
              Pro&apos;ya Geç
            </button>
          </div>

          {/* Enterprise */}
          <div className="p-6 bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl">
            <div className="text-[#888] text-sm font-medium mb-2">Kurumsal</div>
            <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>₺499</div>
            <div className="text-xs text-[#888] mb-5">/ ay</div>
            <ul className="space-y-2 text-sm text-[#ccc] mb-6">
              <li>✓ Pro dahil her şey</li>
              <li>✓ Çok kullanıcı</li>
              <li>✓ Öncelik destek</li>
              <li>✓ Özel entegrasyon</li>
            </ul>
            <button
              onClick={() => handleCheckout('enterprise')}
              className="w-full py-3 border border-[#444] text-white font-bold rounded-xl hover:border-white transition-colors text-sm"
            >
              Kurumsal&apos;a Geç
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
