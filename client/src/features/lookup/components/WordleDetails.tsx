import type { Resource } from 'solid-js'
import type { ArchiveWordle } from '~/types'
import { HiSolidArrowLeft, HiSolidLockClosed } from 'solid-icons/hi'
import { createMemo, Match, Show, Switch } from 'solid-js'
import { formatDate } from '~/lib/utils'
import { scoreLabel, wordleIdToDate } from '~/lib/wordle'
import { EntryCard } from './EntryCard'
import { WordleStandings } from './WordleStandings'

interface WordleDetailsProps {
  wordleId: number
  data: Resource<ArchiveWordle>
  onRetry: () => void
  onBackToArchive?: () => void
}

export function WordleDetails(props: WordleDetailsProps) {
  const resolvedData = createMemo(() => {
    switch (props.data.state) {
      case 'unresolved':
      case 'pending':
      case 'errored':
        return undefined
      case 'ready':
      case 'refreshing':
        return props.data.latest
    }
  })

  const bestScore = createMemo(() => {
    const standings = resolvedData()?.standings ?? []
    return standings.length > 0 ? standings[0].entry.score : undefined
  })

  const leadersCount = createMemo(() => {
    const score = bestScore()
    if (!score)
      return 0
    return resolvedData()?.standings.filter(s => s.entry.score === score).length ?? 0
  })

  const isRefreshing = createMemo(() => props.data.state === 'refreshing')

  return (
    <div>
      <div class="mb-4 md:hidden">
        <button
          type="button"
          onClick={() => props.onBackToArchive?.()}
          class="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <HiSolidArrowLeft class="size-4" />
          Back to Archive
        </button>
      </div>

      <Switch>
        <Match when={resolvedData()}>
          {data => (
            <div class="space-y-6" aria-busy={isRefreshing()}>
              <Show when={isRefreshing()}>
                <div class="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-200">
                  Loading Wordle #
                  {props.wordleId}
                  ...
                </div>
              </Show>

              <div class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div class="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                        Wordle #
                        {data().wordle_id}
                      </h2>
                      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(wordleIdToDate(data().wordle_id), {
                          weekday: 'short',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <span
                      class={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        data().viewer_has_played
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}
                    >
                      {data().viewer_has_played ? 'Standings revealed' : 'Locked until you play'}
                    </span>
                  </div>
                </div>

                <div class="grid gap-4 p-6 md:grid-cols-3">
                  <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                    <div class="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">Played</div>
                    <div class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{data().played_count}</div>
                    <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      of
                      {data().total_users}
                      {' '}
                      players
                    </div>
                  </div>
                  <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                    <div class="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">Waiting</div>
                    <div class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{data().pending_count}</div>
                    <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">still to submit</div>
                  </div>
                  <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                    <div class="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">Best score</div>
                    <div class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                      <Show when={bestScore()} fallback="—">{score => scoreLabel(score())}</Show>
                    </div>
                    <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <Show when={bestScore()} fallback="Play to unlock standings">
                        {leadersCount()}
                        {' '}
                        {leadersCount() === 1 ? 'leader' : 'leaders'}
                      </Show>
                    </div>
                  </div>
                </div>

                <div class="px-6 pb-6">
                  <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                    {data().viewer_has_played
                      ? data().pending_count === 0
                        ? 'Everyone has played — full standings are visible.'
                        : `${data().pending_count} player${data().pending_count === 1 ? '' : 's'} still to submit.`
                      : `Play this Wordle to unlock the full standings. ${data().played_count} of ${data().total_users} players have submitted so far.`}
                  </div>
                </div>
              </div>

              <EntryCard
                title="Your Entry"
                entry={data().viewer_entry ?? null}
                emptyText="You have not submitted this Wordle yet."
                wordleId={props.wordleId}
                showPlayButton={true}
              />

              <Show
                when={data().viewer_has_played}
                fallback={(
                  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div class="flex items-start gap-3">
                      <HiSolidLockClosed class="mt-0.5 size-5 text-amber-500" />
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Standings are locked</h3>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Once you submit this Wordle, you will unlock the full standings and the list of players still waiting.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              >
                <WordleStandings data={data()} />
              </Show>
            </div>
          )}
        </Match>
        <Match when={props.data.state === 'errored'}>
          <div class="space-y-3 py-8 text-center">
            <p class="text-red-500">
              Failed to load Wordle #
              {props.wordleId}
              .
            </p>
            <button
              type="button"
              onClick={() => props.onRetry()}
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </Match>
        <Match when={props.data.state === 'pending'}>
          <p class="py-4 text-center text-gray-500 dark:text-gray-400">Loading...</p>
        </Match>
      </Switch>
    </div>
  )
}
