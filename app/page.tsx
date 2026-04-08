import { createServerSupabaseClient } from '@/lib/supabase-server'
import dynamic from 'next/dynamic'
import AdBanner from '@/components/AdBanner'
import { Spot } from '@/types'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default async function HomePage() {
  const supabase = createServerSupabaseClient()

  const { data: spots } = await supabase
    .from('spots')
    .select('*, profiles(username, is_premium, marker_type, marker_photo_url), cats(*), comments(count)')
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()
  let isPremium = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single()
    isPremium = profile?.is_premium ?? false
  }

  return (
    <div className="h-full">
      <MapView spots={(spots as Spot[]) ?? []} />
      <AdBanner isPremium={isPremium} />
    </div>
  )
}
