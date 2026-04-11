import { RegionalScore } from '@/types'
import PremiumBadge from './PremiumBadge'
import { TITLES } from '@/lib/scoring'

type Props = {
  scores: RegionalScore[]
  currentUserId?: string
  isPremium?: boolean
}

function getTitleInfo(title: string | null | undefined) {
  if (!title) return null
  return TITLES.find((t) => t.title === title) ?? null
}

export default function LeaderboardTable({ scores, currentUserId, isPremium }: Props) {
  if (scores.length === 0) {
    return (
      <p className={`text-sm text-center py-8 ${isPremium ? 'text-gray-500' : 'text-gray-400'}`}>
        まだランキングデータがありません
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {scores.map((score, index) => {
        const isCurrentUser = score.user_id === currentUserId
        const rank = index + 1
        const rankDisplay =
          rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`

        // トップ3の特別スタイル（プレミアム時）
        const isTop3 = rank <= 3 && isPremium

        let cardStyle = ''
        if (isPremium) {
          if (isCurrentUser) {
            cardStyle = 'bg-amber-900/30 border border-amber-500/50'
          } else if (rank === 1) {
            cardStyle = 'bg-gradient-to-r from-amber-900/40 to-amber-800/20 border border-amber-600/30'
          } else if (rank === 2) {
            cardStyle = 'bg-gradient-to-r from-gray-700/40 to-gray-600/20 border border-gray-500/30'
          } else if (rank === 3) {
            cardStyle = 'bg-gradient-to-r from-orange-900/30 to-orange-800/20 border border-orange-600/20'
          } else {
            cardStyle = 'bg-gray-800/50 border border-gray-700/50'
          }
        } else {
          cardStyle = isCurrentUser
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-gray-50'
        }

        return (
          <div
            key={score.id}
            className={`flex items-center gap-3 p-3 rounded-xl ${cardStyle}`}
          >
            <span className={`text-lg w-8 text-center font-bold ${
              isPremium
                ? isTop3 ? 'text-amber-300' : 'text-gray-500'
                : 'text-gray-600'
            }`}>
              {rankDisplay}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-medium truncate ${
                  isPremium ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  {score.profiles?.username ?? '匿名'}
                </span>
                {score.profiles?.is_premium && <PremiumBadge />}
              </div>
              {score.profiles?.title && (
                <p className={`text-xs ${isPremium ? 'text-amber-400/70' : 'text-gray-400'}`}>
                  {getTitleInfo(score.profiles.title)?.emoji ?? ''} {score.profiles.title}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${
                isPremium
                  ? isTop3 ? 'text-amber-300' : 'text-gray-300'
                  : 'text-gray-700'
              }`}>
                {score.total_score}pt
              </p>
              <p className={`text-xs ${isPremium ? 'text-gray-500' : 'text-gray-400'}`}>
                {score.spots_count}スポット
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
