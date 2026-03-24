import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook doğrulama hatası.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { userId, plan } = session.metadata || {}

      if (userId && plan) {
        await supabase.from('users').update({ plan }).eq('id', userId)

        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: sub.id,
            plan,
            status: sub.status,
            current_period_end: new Date(((sub as unknown) as { current_period_end: number }).current_period_end * 1000).toISOString(),
          }, { onConflict: 'stripe_subscription_id' })
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', sub.id)

      // Kullanıcıyı registered planına düşür
      const { data: dbSub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', sub.id)
        .single()

      if (dbSub) {
        await supabase.from('users').update({ plan: 'registered' }).eq('id', dbSub.user_id)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string }
      if (invoice.subscription) {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', invoice.subscription)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
