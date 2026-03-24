import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildPrompt, parseOutputs } from '@/lib/prompts'
import { createServiceClient } from '@/lib/supabase'

function getGemini() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
}

// IP bazlı rate limiting (in-memory, basit)
const ipRequests = new Map<string, { count: number; resetAt: number }>()
const IP_LIMIT_PER_MINUTE = 10
const IP_DAILY_LIMIT = 3

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const data = ipRequests.get(ip)

  if (!data || now > data.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }

  if (data.count >= IP_LIMIT_PER_MINUTE) return false
  data.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  // Rate limit kontrolü
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Çok fazla istek. Lütfen bir dakika bekleyin.' },
      { status: 429 }
    )
  }

  let body: { sector: string; data: Record<string, unknown>; userId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek formatı.' }, { status: 400 })
  }

  const { sector, data, userId } = body

  if (!sector || !data) {
    return NextResponse.json({ error: 'Sektör ve form verileri gereklidir.' }, { status: 400 })
  }

  // Kayıtlı kullanıcı için kullanım limiti kontrolü
  if (userId) {
    const supabase = createServiceClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('usage_count, usage_reset_at, plan')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 })
    }

    const now = new Date()
    const resetAt = user.usage_reset_at ? new Date(user.usage_reset_at) : null

    // Aylık reset
    if (!resetAt || now > resetAt) {
      await supabase
        .from('users')
        .update({
          usage_count: 0,
          usage_reset_at: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
        })
        .eq('id', userId)
      user.usage_count = 0
    }

    const limit = user.plan === 'pro' || user.plan === 'enterprise' ? Infinity : 10

    if (user.usage_count >= limit) {
      return NextResponse.json(
        { error: 'Aylık ilan limitinize ulaştınız.', code: 'LIMIT_REACHED' },
        { status: 403 }
      )
    }
  }

  // Prompt oluştur
  let prompt: string
  try {
    prompt = buildPrompt(sector, data)
  } catch {
    return NextResponse.json({ error: 'Geçersiz sektör.' }, { status: 400 })
  }

  // Gemini API çağrısı
  let responseText: string
  try {
    const model = getGemini().getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    responseText = result.response.text()
  } catch (err) {
    console.error('Gemini API hatası:', err)
    return NextResponse.json(
      { error: 'İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }

  const outputs = parseOutputs(responseText, sector)

  // Kayıtlı kullanıcı için: kullanımı kaydet ve sayacı artır
  if (userId) {
    const supabase = createServiceClient()

    await Promise.all([
      supabase.from('listings').insert({
        user_id: userId,
        sector,
        input_data: data,
        output_sahibinden: outputs['sahibinden'] || null,
        output_hepsiemlak: outputs['hepsiemlak'] || outputs['arabam'] || null,
        output_whatsapp: outputs['whatsapp'] || null,
        output_instagram: outputs['instagram'] || null,
      }),
      supabase.rpc('increment_usage', { user_id: userId })
    ])
  }

  return NextResponse.json({ outputs, sector })
}
