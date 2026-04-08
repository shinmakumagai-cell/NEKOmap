import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MarkerSettings from '@/components/MarkerSettings'
import { MarkerType } from '@/types'

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, username, marker_type')
    .eq('id', user.id)
    .single()

  const isPremium = profile?.is_premium ?? false
  const markerType = (profile?.marker_type ?? 'default') as MarkerType

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">設定</h2>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">ユーザー名</p>
          <p className="text-gray-800 font-medium">{profile?.username ?? user.email}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <MarkerSettings isPremium={isPremium} currentMarkerType={markerType} />
        </div>
      </div>
    </div>
  )
}
