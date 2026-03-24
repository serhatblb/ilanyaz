'use client'

interface SectorSelectProps {
  onSelect: (sector: 'emlak' | 'galeri') => void
}

export default function SectorSelect({ onSelect }: SectorSelectProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[var(--foreground)] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
          Ne ilanı oluşturmak istiyorsunuz?
        </h1>
        <p className="text-[var(--muted)] text-lg">Aşağıdan sektörünüzü seçin</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
        <button
          onClick={() => onSelect('emlak')}
          className="group p-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-left hover:border-[var(--accent)] transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="text-5xl mb-5">🏠</div>
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Emlak İlanı
          </h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Konut, dükkan ve arsa ilanları.
            Sahibinden ve Hepsiemlak için optimize.
          </p>
          <div className="mt-5 text-[var(--accent)] text-sm font-medium">
            Emlak seç →
          </div>
        </button>

        <button
          onClick={() => onSelect('galeri')}
          className="group p-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-left hover:border-[var(--accent)] transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="text-5xl mb-5">🚗</div>
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Araç İlanı
          </h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            2. el araç satış ilanları.
            Sahibinden ve Arabam.com için optimize.
          </p>
          <div className="mt-5 text-[var(--accent)] text-sm font-medium">
            Galeri seç →
          </div>
        </button>
      </div>
    </div>
  )
}
