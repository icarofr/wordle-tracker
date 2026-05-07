import type { LeaderboardEntry } from '~/types'
import { Show } from 'solid-js'
import { useAvatarSrc } from '~/hooks/useAvatarSrc'

interface LeaderboardItemProps {
  entry: LeaderboardEntry
  rank: number
  isCurrentUser: boolean
}

export function LeaderboardItem(props: LeaderboardItemProps) {
  const avatarSrc = useAvatarSrc(() => props.entry.player)

  const getRankIcon = () => {
    switch (props.rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return String(props.rank)
          .split('')
          .map((digit) => {
            switch (digit) {
              case '0':
                return '0️⃣'
              case '1':
                return '1️⃣'
              case '2':
                return '2️⃣'
              case '3':
                return '3️⃣'
              case '4':
                return '4️⃣'
              case '5':
                return '5️⃣'
              case '6':
                return '6️⃣'
              case '7':
                return '7️⃣'
              case '8':
                return '8️⃣'
              case '9':
                return '9️⃣'
              default:
                return digit
            }
          })
          .join('')
    }
  }

  const getBorderColor = () => {
    switch (props.rank) {
      case 1:
        return 'border-yellow-400'
      case 2:
        return 'border-gray-400'
      case 3:
        return 'border-amber-400'
      default:
        return 'border-gray-200 dark:border-gray-600'
    }
  }

  return (
    <div
      class={`rounded-lg border bg-white p-6 shadow-lg transition-all duration-200 hover:shadow-xl dark:bg-gray-800 ${
        props.isCurrentUser
          ? 'border-indigo-200 bg-indigo-50/50 ring-1 ring-indigo-100 dark:border-indigo-700 dark:bg-indigo-900/10 dark:ring-indigo-800'
          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
      }`}
    >
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div class="flex items-center space-x-4">
          <div
            class={`size-12 overflow-hidden rounded-full border-3 ${getBorderColor()}`}
          >
            <img
              loading="lazy"
              decoding="async"
              src={avatarSrc()}
              alt={props.entry.player.name}
              width={48}
              height={48}
              class="size-full object-cover"
            />
          </div>
          <div class="min-w-0">
            <h3 class="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
              <span class="mr-2 inline-flex min-w-7 justify-center text-xl leading-none">
                {getRankIcon()}
              </span>
              {props.entry.player.name}
              <Show when={props.isCurrentUser}>
                <span class="ml-2 inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  You
                </span>
              </Show>
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {props.entry.total_games}
              {' '}
              games played
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-4 text-center sm:space-x-6">
          <div>
            <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {props.entry.average_score.toFixed(2)}
            </div>
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
              Avg Score
            </div>
          </div>
          <div>
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {props.entry.win_percentage.toFixed(1)}
              %
            </div>
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
              Win Rate
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
