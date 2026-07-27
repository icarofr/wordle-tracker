import type { HeadToHeadStats, User } from '~/types'
import { useAvatarSrc } from '~/hooks/useAvatarSrc'

interface HeadToHeadHeroProps {
  currentUser: User | undefined
  opponent: User | undefined
  h2hRecord: HeadToHeadStats['record']
}

export function HeadToHeadHero(props: HeadToHeadHeroProps) {
  const currentUserAvatarSrc = useAvatarSrc(() => props.currentUser)
  const opponentAvatarSrc = useAvatarSrc(() => props.opponent)

  const winPercentage = () => {
    const total = props.h2hRecord.total_games
    if (total === 0)
      return 50
    return (props.h2hRecord.wins / total) * 100
  }

  return (
    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-lg sm:p-6 dark:border-gray-700 dark:bg-gray-800">
      <div class="flex w-full items-center justify-between gap-2">
        {/* Current User */}
        <div class="flex shrink-0 flex-col items-center text-center">
          <div class="mb-1 flex size-10 items-center justify-center overflow-hidden rounded-full bg-blue-100 sm:size-16 dark:bg-blue-900">
            <img
              loading="lazy"
              decoding="async"
              src={currentUserAvatarSrc()}
              alt={props.currentUser?.name ?? 'You'}
              width={64}
              height={64}
              class="size-full rounded-full object-cover"
            />
          </div>
          <h2
            class="max-w-[60px] truncate text-xs font-semibold text-gray-900 sm:max-w-[100px] dark:text-white"
            title={props.currentUser?.name ?? 'You'}
          >
            {props.currentUser?.name ?? 'You'}
          </h2>
        </div>

        {/* Central Score */}
        <div class="min-w-0 flex-1 px-1 text-center">
          <div class="flex items-baseline justify-center gap-0.5 sm:gap-1">
            <span class="text-2xl font-bold text-green-500 tabular-nums sm:text-5xl">
              {props.h2hRecord.wins}
            </span>
            <span class="text-lg font-light text-gray-400 sm:text-4xl dark:text-gray-500">
              -
            </span>
            <span class="text-2xl font-bold text-gray-400 tabular-nums sm:text-5xl dark:text-gray-500">
              {props.h2hRecord.ties}
            </span>
            <span class="text-lg font-light text-gray-400 sm:text-4xl dark:text-gray-500">
              -
            </span>
            <span class="text-2xl font-bold text-red-500 tabular-nums sm:text-5xl">
              {props.h2hRecord.losses}
            </span>
          </div>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            W - T - L
          </p>
        </div>

        {/* Opponent */}
        <div class="flex shrink-0 flex-col items-center text-center">
          <div class="mb-1 flex size-10 items-center justify-center overflow-hidden rounded-full bg-green-100 sm:size-16 dark:bg-green-900">
            <img
              loading="lazy"
              decoding="async"
              src={opponentAvatarSrc()}
              alt={props.opponent?.name ?? 'Opponent'}
              width={64}
              height={64}
              class="size-full rounded-full object-cover"
            />
          </div>
          <h2
            class="max-w-[60px] truncate text-xs font-semibold text-gray-900 sm:max-w-[100px] dark:text-white"
            title={props.opponent?.name ?? 'Opponent'}
          >
            {props.opponent?.name ?? 'Opponent'}
          </h2>
        </div>
      </div>

      {/* Win Percentage Bar */}
      <div class="mt-6">
        <div class="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            class="h-2.5 rounded-full bg-green-500"
            style={{ width: `${winPercentage()}%` }}
          />
        </div>
      </div>
    </div>
  )
}
