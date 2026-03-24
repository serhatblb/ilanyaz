import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('avatar') as File | null

  if (!file || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Geçersiz dosya' }, { status: 400 })
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Dosya 2MB\'dan küçük olmalı' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${session.user.email.replace('@', '_').replace('.', '_')}.${ext}`

  const buffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: 'Yükleme başarısız' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

  await supabase.from('users').update({ avatar_url: publicUrl }).eq('email', session.user.email)

  return NextResponse.json({ url: publicUrl })
}
