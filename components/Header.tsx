import { createServerSupabaseClient } from '@/lib/supabase-server'
import HeaderClient from './HeaderClient'

const ADMIN_EMAIL = 'shinmakumagai@gmail.com'

export default async function Header() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isPremium = false
  let username = null
  let title = null
  const isAdmin = user?.email === ADMIN_EMAIL

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, username, title')
      .eq('id', user.id)
      .single()
    isPremium = profile?.is_premium ?? false
    username = profile?.username ?? user.email
    title = profile?.title ?? null
  }

  return (
    <HeaderClient
      user={user ? { email: user.email ?? '', username, isPremium, title, isAdmin } : null}
    />
  )
}
