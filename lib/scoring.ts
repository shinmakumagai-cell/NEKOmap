import { createClient } from '@/lib/supabase'

export const TITLES = [
  { minSpots: 0, title: '猫見習い', emoji: '🐱' },
  { minSpots: 5, title: '猫好き', emoji: '😺' },
  { minSpots: 10, title: '猫マニア', emoji: '😸' },
  { minSpots: 15, title: '猫ジャイアン', emoji: '💪' },
  { minSpots: 20, title: '猫タイタン', emoji: '⚡' },
  { minSpots: 25, title: 'キャッツマン', emoji: '🦸' },
  { minSpots: 30, title: 'バーミヤン', emoji: '🔥' },
  { minSpots: 35, title: '猫マスター', emoji: '👑' },
] as const

export function getTitleForSpots(spotsCount: number) {
  return [...TITLES].reverse().find((t) => spotsCount >= t.minSpots) ?? TITLES[0]
}

export function calculateScore(spotsCount: number, catsCount: number, commentsCount: number) {
  return spotsCount * 5 + catsCount * 3 + commentsCount * 1
}

export async function updateUserScore(userId: string) {
  const supabase = createClient()

  const [spotsRes, catsRes, commentsRes] = await Promise.all([
    supabase.from('spots').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('cats').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  const spotsCount = spotsRes.count ?? 0
  const catsCount = catsRes.count ?? 0
  const commentsCount = commentsRes.count ?? 0
  const score = calculateScore(spotsCount, catsCount, commentsCount)
  const { title } = getTitleForSpots(spotsCount)

  await supabase.from('regional_scores').upsert(
    {
      user_id: userId,
      region: '全国',
      spots_count: spotsCount,
      cats_count: catsCount,
      comments_count: commentsCount,
      total_score: score,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,region' }
  )

  // プレミアムユーザーのみ称号をプロフィールに反映
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', userId)
    .single()

  if (profile?.is_premium) {
    await supabase.from('profiles').update({ title }).eq('id', userId)
  }
}
