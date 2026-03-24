import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
}

export async function POST(req: NextRequest) {
  let body: { plan: string; userId: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  const { plan, userId } = body

  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  const priceId = plan === 'pro'
    ? process.env.STRIPE_PRO_PRICE_ID
    : process.env.STRIPE_ENTERPRISE_PRICE_ID

  if (!priceId) {
    return NextResponse.json({ error: 'Geçersiz plan.' }, { status: 400 })
  }

  // Kullanıcının Stripe customer ID'sini al veya oluştur
  const supabase = createServiceClient()
  const { data: user } = await supabase
    .from('users')
    .select('email, stripe_customer_id')
    .eq('id', userId)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 })
  }

  const stripe = getStripe()
  let customerId = user.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email })
    customerId = customer.id
    await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', userId)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard`,
    metadata: { userId, plan },
  })

  return NextResponse.json({ url: session.url })
}
