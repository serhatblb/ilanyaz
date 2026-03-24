import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createServiceClient } from '@/lib/supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      const supabase = createServiceClient()
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!existing) {
        await supabase.from('users').insert({
          email: user.email,
          name: user.name || '',
          plan: 'registered',
        })
      }

      return true
    },

    async session({ session }) {
      if (!session.user?.email) return session

      const supabase = createServiceClient()
      const { data: dbUser } = await supabase
        .from('users')
        .select('id, plan, usage_count, avatar_url')
        .eq('email', session.user.email)
        .single()

      if (dbUser) {
        // @ts-expect-error — session tipini genişletiyoruz
        session.user.id = dbUser.id
        // @ts-expect-error
        session.user.plan = dbUser.plan
        // @ts-expect-error
        session.user.usageCount = dbUser.usage_count
        if (dbUser.avatar_url) session.user.image = dbUser.avatar_url
      }

      return session
    },
  },
  pages: {
    signIn: '/',
  },
}
