'use client'

import { useState } from 'react'

export interface EmlakData {
  sehir: string
  ilce: string
  tip: 'Satılık' | 'Kiralık'
  odaSayisi: string
  metrekare: string
  kat: string
  binaYasi: string
  fiyat: string
  ozellikler: string[]
}

const OZELLIKLER = [
  'Asansör', 'Otopark', 'Balkon', 'Eşyalı', 'Güvenlik', 'Havuz',
  'Spor Salonu', 'Merkezi Isıtma', 'Doğalgaz', 'Amerikan Mutfak',
  'Site İçi', 'Metro Yakını'
]

interface EmlakFormProps {
  onSubmit: (data: EmlakData) => void
  loading: boolean
}

export default function EmlakForm({ onSubmit, loading }: EmlakFormProps) {
  const [data, setData] = useState<EmlakData>({
    sehir: '',
    ilce: '',
    tip: 'Satılık',
    odaSayisi: '',
    metrekare: '',
    kat: '',
    binaYasi: '',
    fiyat: '',
    ozellikler: [],
  })

  const handleOzellik = (o: string) => {
    setData(prev => ({
      ...prev,
      ozellikler: prev.ozellikler.includes(o)
        ? prev.ozellikler.filter(x => x !== o)
        : [...prev.ozellikler, o]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(data)
  }

  const inputClass = "w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors text-sm"
  const labelClass = "block text-sm text-[var(--muted)] mb-1.5"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tip Toggle */}
      <div>
        <label className={labelClass}>İlan Tipi</label>
        <div className="flex gap-2">
          {(['Satılık', 'Kiralık'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setData(prev => ({ ...prev, tip: t }))}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                data.tip === t
                  ? 'bg-[var(--accent)] text-black'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:border-[#444]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Şehir + İlçe */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Şehir</label>
          <select
            value={data.sehir}
            onChange={e => setData(prev => ({ ...prev, sehir: e.target.value }))}
            className={inputClass}
            required
          >
            <option value="">Seçin</option>
            {['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Diğer'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>İlçe</label>
          <input
            type="text"
            value={data.ilce}
            onChange={e => setData(prev => ({ ...prev, ilce: e.target.value }))}
            placeholder="Kadıköy, Moda..."
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Oda + m² */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Oda Sayısı</label>
          <select
            value={data.odaSayisi}
            onChange={e => setData(prev => ({ ...prev, odaSayisi: e.target.value }))}
            className={inputClass}
            required
          >
            <option value="">Seçin</option>
            {['1+1', '2+1', '3+1', '4+1', '5+1', 'Villa', 'Dükkan'].map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Metrekare (m²)</label>
          <input
            type="number"
            value={data.metrekare}
            onChange={e => setData(prev => ({ ...prev, metrekare: e.target.value }))}
            placeholder="120"
            className={inputClass}
            required
            min="1"
          />
        </div>
      </div>

      {/* Kat + Bina Yaşı */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Kat (ör: 3/7)</label>
          <input
            type="text"
            value={data.kat}
            onChange={e => setData(prev => ({ ...prev, kat: e.target.value }))}
            placeholder="3/7"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Bina Yaşı</label>
          <select
            value={data.binaYasi}
            onChange={e => setData(prev => ({ ...prev, binaYasi: e.target.value }))}
            className={inputClass}
            required
          >
            <option value="">Seçin</option>
            {['0-5 yıl', '5-10 yıl', '10-20 yıl', '20+ yıl'].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fiyat */}
      <div>
        <label className={labelClass}>Fiyat (₺)</label>
        <input
          type="text"
          value={data.fiyat}
          onChange={e => setData(prev => ({ ...prev, fiyat: e.target.value }))}
          placeholder="2.500.000"
          className={inputClass}
          required
        />
      </div>

      {/* Özellikler */}
      <div>
        <label className={labelClass}>Özellikler</label>
        <div className="flex flex-wrap gap-2">
          {OZELLIKLER.map(o => (
            <button
              key={o}
              type="button"
              onClick={() => handleOzellik(o)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                data.ozellikler.includes(o)
                  ? 'bg-[var(--accent)] text-black'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:border-[#444]'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-[var(--accent)] text-black font-bold rounded-xl hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            İlan Oluşturuluyor...
          </span>
        ) : 'İlan Metni Oluştur'}
      </button>
    </form>
  )
}
