import { RegionalScore } from '@/types'
import PremiumBadge from './PremiumBadge'
import { TITLES } from '@/lib/scoring'

type Props = {
  scores: RegionalScore[]
  currentUserId?: string
}

function getTitleInfo(title: string | null | undefined) {
  if (!title) return null
  return TITLES.find((t) => t.title === title) ?? null
}

export default function LeaderboardTable({ scores, currentUserId }: Props) {
  if (scores.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
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

        return (
          <div
            key={score.id}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              isCurrentUser ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
            }`}
          >
            <span className="text-lg w-8 text-center font-bold text-gray-600">
              {rankDisplay}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-800 truncate">
                  {score.profiles?.username ?? '匿名'}
                </span>
                {score.profiles?.is_premium && <PremiumBadge />}
              </div>
              {score.profiles?.title && (
                <p className="text-xs text-gray-400">
                  {getTitleInfo(score.profiles.title)?.emoji ?? ''} {score.profiles.title}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-700">{score.total_score}pt</p>
              <p className="text-xs text-gray-400">
                {score.spots_count}S · {score.cats_count}C · {score.comments_count}コメ
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
