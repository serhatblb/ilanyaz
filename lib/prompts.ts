export function buildPrompt(sector: string, data: Record<string, unknown>, firma?: string): string {
  const imza = firma ? `\n\nİletişim: ${firma}` : ''

  if (sector === 'emlak') {
    const ozellikler = Array.isArray(data.ozellikler) ? (data.ozellikler as string[]).join(', ') : ''
    return `Sen Türkiye'nin en iyi emlak ilan yazarısın.

Mülk Bilgileri:
- Tip: ${data.tip}
- Konum: ${data.sehir} / ${data.ilce}
- Daire: ${data.odaSayisi}, ${data.metrekare}m²
- Kat: ${data.kat}
- Bina Yaşı: ${data.binaYasi}
- Fiyat: ${data.fiyat}₺
- Özellikler: ${ozellikler}

Şu 4 format için ayrı ayrı yaz:

===SAHİBİNDEN===
[Sahibinden.com için profesyonel, SEO uyumlu, 200-300 kelime. Başlık dahil.${imza}]

===HEPSİEMLAK===
[Hepsiemlak için kurumsal ton, 150-250 kelime.${imza}]

===WHATSAPP===
[Samimi, emoji'li, 80-120 kelime WhatsApp mesajı.${imza}]

===İNSTAGRAM===
[Çekici caption, emoji bol, hashtag'ler ekle.${imza}]`
  }

  if (sector === 'galeri') {
    const ozellikler = Array.isArray(data.ozellikler) ? (data.ozellikler as string[]).join(', ') : ''
    return `Sen Türkiye'nin en iyi araç ilan yazarısın.

Araç Bilgileri:
- Marka/Model: ${data.marka} ${data.model}
- Yıl: ${data.yil}
- KM: ${data.km}
- Renk: ${data.renk}
- Vites: ${data.vites}
- Yakıt: ${data.yakit}
- Kasa: ${data.kasaTipi}
- Hasar: ${data.hasar}
- Fiyat: ${data.fiyat}₺
- Özellikler: ${ozellikler}

Şu 4 format için ayrı ayrı yaz:

===SAHİBİNDEN===
[Sahibinden.com araç ilanı, profesyonel, 200-300 kelime.${imza}]

===ARABAM===
[Arabam.com için uygun format, 150-200 kelime.${imza}]

===WHATSAPP===
[Kısa, net, emoji'li WhatsApp mesajı, 60-80 kelime.${imza}]

===İNSTAGRAM===
[Instagram caption, araç odaklı, hashtag dahil.${imza}]`
  }

  throw new Error('Geçersiz sektör')
}

export function parseOutputs(text: string, sector: string): Record<string, string> {
  const outputs: Record<string, string> = {}

  const sections = sector === 'galeri'
    ? ['SAHİBİNDEN', 'ARABAM', 'WHATSAPP', 'İNSTAGRAM']
    : ['SAHİBİNDEN', 'HEPSİEMLAK', 'WHATSAPP', 'İNSTAGRAM']

  // Gemini bazen ### === veya sadece === ile döndürüyor, her ikisini de yakala
  function findSection(t: string, name: string): number {
    const patterns = [
      `===${name}===`,
      `### ===${name}===`,
      `## ===${name}===`,
      `# ===${name}===`,
    ]
    for (const p of patterns) {
      const idx = t.indexOf(p)
      if (idx !== -1) return idx
    }
    return -1
  }

  function sectionEnd(t: string, idx: number, marker: string): number {
    const patterns = [
      `===${marker}===`,
      `### ===${marker}===`,
      `## ===${marker}===`,
      `# ===${marker}===`,
    ]
    for (const p of patterns) {
      const idx2 = t.indexOf(p)
      if (idx2 !== -1 && idx2 > idx) return idx2
    }
    return t.length
  }

  for (let i = 0; i < sections.length; i++) {
    const start = findSection(text, sections[i])
    if (start === -1) continue

    // İçeriğin başlangıcı: başlık satırının sonundan itibaren
    const lineEnd = text.indexOf('\n', start)
    const contentStart = lineEnd !== -1 ? lineEnd + 1 : start + sections[i].length + 6

    const end = sections[i + 1] ? sectionEnd(text, start + 1, sections[i + 1]) : text.length

    const key = sections[i].toLowerCase().replace(/i̇/g, 'i').replace('İ', 'i')
    outputs[key] = text.slice(contentStart, end)
      .replace(/^---\s*\n?/, '')  // Başındaki --- satırını temizle
      .replace(/\n?---\s*$/, '')  // Sonundaki --- satırını temizle
      .trim()
  }

  return outputs
}
