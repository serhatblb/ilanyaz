import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { authOptions } from '@/lib/auth'

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await req.json()
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Geçersiz isim' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('users')
    .update({ name: name.trim() })
    .eq('email', session.user.email)

  if (error) {
    return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
