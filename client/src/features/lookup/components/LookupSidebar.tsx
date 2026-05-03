import type { ArchiveListItem } from '~/types'
import { HiSolidMagnifyingGlass, HiSolidPaperAirplane } from 'solid-icons/hi'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { formatDate } from '~/lib/utils'
import { scoreLabel, scoreToNumber, wordleIdToDate } from '~/lib/wordle'

type SortOption = 'newest' | 'oldest' | 'most-played' | 'your-best'
type ArchiveFilter = 'all' | 'played' | 'unplayed'

const FILTER_OPTIONS = [
  ['all', 'All', 'Show all Wordles'],
  ['played', 'Yours', 'Show Wordles you have played'],
  ['unplayed', 'Open', 'Show Wordles you have not played'],
] as const

interface LookupSidebarProps {
  wordles: ArchiveListItem[]
  isLoaded: boolean
  selectedWordleId?: number
  onSelectWordle: (wordleId: number) => void
}

export function LookupSidebar(props: LookupSidebarProps) {
  const [inputValue, setInputValue] = createSignal('')
  const [sortBy, setSortBy] = createSignal<SortOption>('newest')
  const [filterBy, setFilterBy] = createSignal<ArchiveFilter>('all')

  const hasPlayedWordles = createMemo(() =>
    props.wordles.some(wordle => wordle.viewer_has_played),
  )

  const filteredWordles = createMemo(() => {
    const filter = filterBy()
    const term = inputValue().trim()

    return props.wordles
      .filter((wordle) => {
        if (filter === 'played') {
          return wordle.viewer_has_played
        }
        if (filter === 'unplayed') {
          return !wordle.viewer_has_played
        }
        return true
      })
      .filter(wordle =>
        term ? wordle.wordle_id.toString().includes(term) : true,
      )
  })

  const sortedWordles = createMemo(() => {
    const items = [...filteredWordles()]

    switch (sortBy()) {
      case 'oldest':
        return items.sort((a, b) => a.wordle_id - b.wordle_id)
      case 'most-played':
        return items.sort((a, b) => {
          if (a.participant_count !== b.participant_count) {
            return b.participant_count - a.participant_count
          }
          return b.wordle_id - a.wordle_id
        })
      case 'your-best':
        return items.sort((a, b) => {
          const aPlayed = !!a.viewer_entry
          const bPlayed = !!b.viewer_entry
          if (aPlayed !== bPlayed) {
            return aPlayed ? -1 : 1
          }
          if (a.viewer_entry && b.viewer_entry) {
            const scoreDiff
              = scoreToNumber(a.viewer_entry.score)
                - scoreToNumber(b.viewer_entry.score)
            if (scoreDiff !== 0) {
              return scoreDiff
            }
          }
          return b.wordle_id - a.wordle_id
        })
      case 'newest':
        return items.sort((a, b) => b.wordle_id - a.wordle_id)
    }
  })

  const handleManualSearch = () => {
    const id = Number.parseInt(inputValue().trim(), 10)
    if (!Number.isNaN(id) && id > 0) {
      props.onSelectWordle(id)
      setInputValue('')
    }
  }

  return (
    <aside class="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div class="space-y-2 border-b border-gray-200 p-3 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
            <HiSolidMagnifyingGlass class="size-4" />
            Archive
          </h2>
          <span class="text-xs text-gray-400">{sortedWordles().length}</span>
        </div>

        <div class="relative">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- htmlFor with dynamic input */}
          <label for="wordle-search" class="sr-only">
            Search by Wordle number
          </label>
          <input
            id="wordle-search"
            type="number"
            placeholder="Go to #..."
            class="w-full rounded-md border border-gray-300 bg-gray-50 py-1.5 pr-9 pl-3 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            value={inputValue()}
            onInput={e => setInputValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleManualSearch()
              }
            }}
          />
          <button
            type="button"
            onClick={handleManualSearch}
            disabled={!inputValue().trim()}
            aria-label="Jump to Wordle"
            class="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-gray-400 hover:text-indigo-500 disabled:cursor-not-allowed disabled:text-gray-300 dark:disabled:text-gray-600"
          >
            <HiSolidPaperAirplane class="size-3.5" />
          </button>
        </div>

        <div class="flex items-center gap-2">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- htmlFor with dynamic select */}
          <label for="wordle-sort" class="sr-only">
            Sort order
          </label>
          <select
            id="wordle-sort"
            class="flex-1 rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            value={sortBy()}
            onChange={e => setSortBy(e.currentTarget.value as SortOption)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most-played">Most played</option>
            <Show when={hasPlayedWordles()}>
              <option value="your-best">Your best</option>
            </Show>
          </select>

          <div
            class="flex overflow-hidden rounded-md border border-gray-300 dark:border-gray-600"
            role="group"
            aria-label="Filter archive"
          >
            <For each={FILTER_OPTIONS}>
              {([value, label, ariaLabel]) => (
                <button
                  type="button"
                  aria-label={ariaLabel}
                  aria-pressed={filterBy() === value}
                  onClick={() => setFilterBy(value)}
                  class={`px-2 py-0.5 text-xs font-medium transition-colors ${
                    filterBy() === value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              )}
            </For>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <Show
          when={props.isLoaded}
          fallback={<div class="p-3 text-xs text-gray-400">Loading...</div>}
        >
          <For
            each={sortedWordles()}
            fallback={<div class="p-3 text-xs text-gray-500">No matches.</div>}
          >
            {wordle => (
              <button
                type="button"
                aria-pressed={props.selectedWordleId === wordle.wordle_id}
                onClick={() => props.onSelectWordle(wordle.wordle_id)}
                class={`block w-full border-b border-gray-100 px-3 py-2 text-left transition-colors dark:border-gray-700/50 ${
                  props.selectedWordleId === wordle.wordle_id
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="font-mono text-sm font-semibold">
                      #
                      {wordle.wordle_id}
                    </div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(
                        wordleIdToDate(wordle.wordle_id),
                        { day: '2-digit', month: 'short', year: 'numeric' },
                      )}
                    </div>
                  </div>

                  <div class="text-right text-xs">
                    <div class="text-gray-500 dark:text-gray-400">
                      {wordle.participant_count}
                      {' '}
                      played
                    </div>
                    <Show
                      when={wordle.viewer_entry}
                      fallback={(
                        <div class="font-medium text-amber-600 dark:text-amber-400">
                          Unplayed
                        </div>
                      )}
                    >
                      {entry => (
                        <div class="font-semibold text-emerald-600 dark:text-emerald-400">
                          You:
                          {' '}
                          {scoreLabel(entry().score)}
                        </div>
                      )}
                    </Show>
                  </div>
                </div>

                <Show when={wordle.summary}>
                  {summary => (
                    <div class="mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                      <span>
                        Best:
                        {' '}
                        {scoreLabel(summary().best_score)}
                      </span>
                      <span>
                        {summary().solved_count}
                        {' '}
                        solved,
                        {' '}
                        {summary().failed_count}
                        {' '}
                        failed
                      </span>
                    </div>
                  )}
                </Show>
              </button>
            )}
          </For>
        </Show>
      </div>
    </aside>
  )
}
