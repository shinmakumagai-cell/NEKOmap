import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MarkerSettings from '@/components/MarkerSettings'
import UsernameEdit from '@/components/UsernameEdit'
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
  const username = profile?.username ?? user.email ?? ''

  return (
    <div className={`min-h-full px-4 py-8 ${isPremium ? 'bg-gray-900' : ''}`}>
      <div className="max-w-sm mx-auto">
        <h2 className={`text-xl font-bold mb-6 ${isPremium ? 'text-white' : 'text-gray-800'}`}>
          {isPremium ? '⚙️ 設定' : '設定'}
        </h2>

        <div className="space-y-6">
          <div className={`rounded-2xl p-4 shadow-sm ${
            isPremium
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-100'
          }`}>
            <UsernameEdit currentUsername={username} isPremium={isPremium} />
          </div>

          <div className={`rounded-2xl p-4 shadow-sm ${
            isPremium
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-100'
          }`}>
            <MarkerSettings isPremium={isPremium} currentMarkerType={markerType} />
          </div>
        </div>
      </div>
    </div>
  )
}
