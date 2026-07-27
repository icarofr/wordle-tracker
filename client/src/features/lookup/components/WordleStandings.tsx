import type { ArchiveWordle } from '~/types'
import { HiSolidChartBar, HiSolidUserGroup } from 'solid-icons/hi'
import { For, Show } from 'solid-js'
import { getAvatarUrl } from '~/lib/avatar'
import { formatDate } from '~/lib/utils'
import { scoreLabel } from '~/lib/wordle'

interface WordleStandingsProps {
  data: ArchiveWordle
}

export function WordleStandings(props: WordleStandingsProps) {
  return (
    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <div class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <HiSolidChartBar class="size-5" />
            Standings
          </h3>
        </div>

        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <For each={props.data.standings}>
            {(standing, index) => (
              <div class="flex items-center gap-4 px-6 py-4">
                <div class="w-8 text-sm font-semibold text-gray-400 dark:text-gray-500">
                  #
                  {index() + 1}
                </div>

                <img
                  loading="lazy"
                  decoding="async"
                  src={getAvatarUrl(standing.user.avatar)}
                  alt={standing.user.name}
                  width={40}
                  height={40}
                  class="size-10 rounded-full border border-gray-200 dark:border-gray-700"
                />

                <div class="min-w-0 flex-1">
                  <div class="truncate font-medium text-gray-900 dark:text-white">
                    {standing.user.name}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Submitted
                    {' '}
                    {formatDate(standing.entry.created_at, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div
                  class={`text-lg font-semibold ${
                    standing.entry.score === 'X'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {scoreLabel(standing.entry.score)}
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <HiSolidUserGroup class="size-5" />
            Not Yet Played
          </h3>
        </div>

        <div class="p-6">
          <Show
            when={props.data.waiting_players.length > 0}
            fallback={(
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Everyone has already submitted this Wordle.
              </p>
            )}
          >
            <div class="space-y-3">
              <For each={props.data.waiting_players}>
                {player => (
                  <div class="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={getAvatarUrl(player.avatar)}
                      alt={player.name}
                      width={36}
                      height={36}
                      class="size-9 rounded-full border border-gray-200 dark:border-gray-700"
                    />
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {player.name}
                    </span>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}
