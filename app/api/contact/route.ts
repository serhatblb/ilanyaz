import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const { name, email, message } = await req.json()

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Geçersiz e-posta' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('contact_messages').insert({
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  })

  if (error) {
    return NextResponse.json({ error: 'Gönderilemedi, tekrar deneyin' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
