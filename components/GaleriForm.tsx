'use client'

import { useState } from 'react'

export interface GaleriData {
  marka: string
  model: string
  yil: string
  km: string
  renk: string
  vites: string
  yakit: string
  kasaTipi: string
  hasar: string
  fiyat: string
  ozellikler: string[]
}

const OZELLIKLER = [
  'Sunroof', 'Deri Koltuk', 'Geri Görüş Kamerası', 'Navigasyon',
  'Start/Stop', 'Isıtmalı Koltuk', 'Xenon Far', 'Park Sensörü',
  'Klima', 'Cruise Control'
]

interface GaleriFormProps {
  onSubmit: (data: GaleriData) => void
  loading: boolean
}

export default function GaleriForm({ onSubmit, loading }: GaleriFormProps) {
  const [data, setData] = useState<GaleriData>({
    marka: '',
    model: '',
    yil: '',
    km: '',
    renk: '',
    vites: '',
    yakit: '',
    kasaTipi: '',
    hasar: '',
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
      {/* Marka + Model */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Marka</label>
          <input
            type="text"
            value={data.marka}
            onChange={e => setData(prev => ({ ...prev, marka: e.target.value }))}
            placeholder="BMW, Mercedes..."
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Model</label>
          <input
            type="text"
            value={data.model}
            onChange={e => setData(prev => ({ ...prev, model: e.target.value }))}
            placeholder="320i, C200..."
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Yıl + KM */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Yıl</label>
          <input
            type="number"
            value={data.yil}
            onChange={e => setData(prev => ({ ...prev, yil: e.target.value }))}
            placeholder="2020"
            className={inputClass}
            required
            min="1990"
            max="2025"
          />
        </div>
        <div>
          <label className={labelClass}>Kilometre</label>
          <input
            type="number"
            value={data.km}
            onChange={e => setData(prev => ({ ...prev, km: e.target.value }))}
            placeholder="45000"
            className={inputClass}
            required
            min="0"
          />
        </div>
      </div>

      {/* Renk + Vites */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Renk</label>
          <input
            type="text"
            value={data.renk}
            onChange={e => setData(prev => ({ ...prev, renk: e.target.value }))}
            placeholder="Siyah, Beyaz..."
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Vites</label>
          <select
            value={data.vites}
            onChange={e => setData(prev => ({ ...prev, vites: e.target.value }))}
            className={inputClass}
            required
          >
            <option value="">Seçin</option>
            {['Manuel', 'Otomatik', 'Yarı Otomatik'].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Yakıt + Kasa */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Yakıt</label>
          <select
            value={data.yakit}
            onChange={e => setData(prev => ({ ...prev, yakit: e.target.value }))}
            className={inputClass}
            required
          >
            <option value="">Seçin</option>
            {['Benzin', 'Dizel', 'Hibrit', 'Elektrik', 'LPG'].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Kasa Tipi</label>
          <select
            value={data.kasaTipi}
            onChange={e => setData(prev => ({ ...prev, kasaTipi: e.target.value }))}
            className={inputClass}
            required
          >
            <option value="">Seçin</option>
            {['Sedan', 'Hatchback', 'SUV', 'Crossover', 'Pickup', 'Minivan'].map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hasar + Fiyat */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Hasar Durumu</label>
          <select
            value={data.hasar}
            onChange={e => setData(prev => ({ ...prev, hasar: e.target.value }))}
            className={inputClass}
            required
          >
            <option value="">Seçin</option>
            {['Hasarsız', 'Boyalı', 'Değişen Var', 'Ağır Hasarlı'].map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Fiyat (₺)</label>
          <input
            type="text"
            value={data.fiyat}
            onChange={e => setData(prev => ({ ...prev, fiyat: e.target.value }))}
            placeholder="850.000"
            className={inputClass}
            required
          />
        </div>
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
