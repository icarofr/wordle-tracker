import type { User, WordleStats } from '~/types'

import { useAvatarSrc } from '~/hooks/useAvatarSrc'

interface PlayerStatsCardProps {
  user: User | undefined
  stats: WordleStats | undefined
  color: 'blue' | 'green'
  defaultName: string
}

const COLOR_CLASSES = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-600 dark:text-green-400',
  },
} as const

export function PlayerStatsCard(props: PlayerStatsCardProps) {
  const avatarSrc = useAvatarSrc(() => props.user)

  return (
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-lg transition-shadow duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <div class="mb-4 flex items-center">
        <div
          class={`size-10 ${COLOR_CLASSES[props.color].bg} mr-3 flex items-center justify-center overflow-hidden rounded-full`}
        >
          <img
            loading="lazy"
            decoding="async"
            src={avatarSrc()}
            alt={props.user?.name || props.defaultName}
            width={40}
            height={40}
            class="size-full rounded-full object-cover"
          />
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {props.user?.name || props.defaultName}
        </h2>
      </div>
      <div class="grid grid-cols-2 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {props.stats?.games ?? 0}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Games</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {props.stats?.win_percentage ?? 0}
            %
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Win Rate</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {props.stats?.average_score ?? 0}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {props.stats?.wins ?? 0}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Wins</div>
        </div>
      </div>
    </div>
  )
}
