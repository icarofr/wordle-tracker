import { Link } from '@tanstack/solid-router'
import { Show } from 'solid-js'
import { formatDate } from '~/lib/utils'
import { scoreLabel } from '~/lib/wordle'
import { ResultBadge } from './ResultBadge'

export interface ResultItemProps {
  wordleId: number
  result: string
  date: string | Date
  userScore: string | number | null
  opponentScore?: string | number | null
}

function scoreColor(score: string | number) {
  return score === 'X'
    ? 'text-rose-600 dark:text-rose-400'
    : 'text-emerald-600 dark:text-emerald-400'
}

function rowClasses(result: string) {
  switch (result.toLowerCase()) {
    case 'win':
      return 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700/50'
    case 'loss':
      return 'bg-rose-50 dark:bg-rose-900/40 border-rose-300 dark:border-rose-700/50'
    case 'tie':
      return 'bg-amber-50 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700/50'
    case 'waiting':
      return 'bg-sky-50 dark:bg-sky-900/40 border-sky-300 dark:border-sky-700/50'
    default:
      return 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/50'
  }
}

export function ResultItem(props: ResultItemProps) {
  return (
    <Link
      to="/lookup"
      search={{ wordleId: props.wordleId }}
      aria-label={`Open Wordle ${props.wordleId} in archive`}
      class={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors hover:border-blue-300 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:hover:border-blue-500 ${rowClasses(
        props.result,
      )}`}
    >
      <ResultBadge tone={props.result} />

      <span class="text-sm font-bold text-gray-800 tabular-nums dark:text-gray-200">
        #
        {props.wordleId}
      </span>

      <span class="ml-auto flex items-center gap-2 text-sm tabular-nums">
        <Show when={props.userScore != null}>
          <span class={`font-bold ${scoreColor(props.userScore!)}`}>
            {scoreLabel(String(props.userScore))}
          </span>
        </Show>

        <Show when={props.opponentScore != null}>
          <span class="text-xs text-gray-400 dark:text-gray-500">vs</span>
          <span class={`font-bold ${scoreColor(props.opponentScore!)}`}>
            {scoreLabel(String(props.opponentScore))}
          </span>
        </Show>

        <span class="w-14 text-right text-xs text-gray-400 dark:text-gray-500">
          {formatDate(
            props.date,
            { day: '2-digit', month: '2-digit' },
            'fr-FR',
          )}
        </span>
      </span>
    </Link>
  )
}
