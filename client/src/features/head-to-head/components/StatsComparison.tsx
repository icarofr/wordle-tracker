import type { WordleStats } from '~/types'
import { For } from 'solid-js'

interface StatsComparisonProps {
  userStats: WordleStats | undefined
  opponentStats: WordleStats | undefined
}

function StatRow(props: {
  label: string
  userValue: number | string
  opponentValue: number | string
  userBar: number
  opponentBar: number
}) {
  return (
    <div class="flex items-center justify-between gap-4 py-2">
      <div class="text-lg font-bold text-blue-500">{props.userValue}</div>
      <div class="flex-1 text-center">
        <div class="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          {props.label}
        </div>
        <div class="flex items-center">
          <div class="h-2 flex-1 rounded-l-full bg-gray-200 dark:bg-gray-700">
            <div
              class="float-right h-2 rounded-l-full bg-blue-500"
              style={{ width: `${props.userBar}%` }}
            />
          </div>
          <div class="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          <div class="h-2 flex-1 rounded-r-full bg-gray-200 dark:bg-gray-700">
            <div
              class="h-2 rounded-r-full bg-green-500"
              style={{ width: `${props.opponentBar}%` }}
            />
          </div>
        </div>
      </div>
      <div class="text-lg font-bold text-green-500">{props.opponentValue}</div>
    </div>
  )
}

export function calculateComparisonBar(
  userValue: number,
  opponentValue: number,
  higherIsWorse?: boolean,
): { userBar: number, opponentBar: number } {
  const total = userValue + opponentValue
  let userBar = total > 0 ? (userValue / total) * 100 : 50
  let opponentBar = total > 0 ? (opponentValue / total) * 100 : 50

  if (higherIsWorse && total > 0) {
    userBar = (opponentValue / total) * 100
    opponentBar = (userValue / total) * 100
  }

  return { userBar, opponentBar }
}

export function StatsComparison(props: StatsComparisonProps) {
  const statsToCompare = () => [
    {
      label: 'Win Rate',
      user: props.userStats?.win_percentage ?? 0,
      opponent: props.opponentStats?.win_percentage ?? 0,
      suffix: '%',
    },
    {
      label: 'Avg. Score',
      user: props.userStats?.average_score ?? 0,
      opponent: props.opponentStats?.average_score ?? 0,
      higherIsWorse: true,
    },
    {
      label: 'Current Streak',
      user: props.userStats?.current_streak ?? 0,
      opponent: props.opponentStats?.current_streak ?? 0,
    },
    {
      label: 'Max Streak',
      user: props.userStats?.max_streak ?? 0,
      opponent: props.opponentStats?.max_streak ?? 0,
    },
  ]

  return (
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <h3 class="mb-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
        Stats Comparison
      </h3>
      <div class="space-y-4">
        <For each={statsToCompare()}>
          {(stat) => {
            const { userBar, opponentBar } = calculateComparisonBar(
              stat.user,
              stat.opponent,
              stat.higherIsWorse,
            )

            return (
              <StatRow
                label={stat.label}
                userValue={`${stat.user}${stat.suffix ?? ''}`}
                opponentValue={`${stat.opponent}${stat.suffix ?? ''}`}
                userBar={userBar}
                opponentBar={opponentBar}
              />
            )
          }}
        </For>
      </div>
    </div>
  )
}
