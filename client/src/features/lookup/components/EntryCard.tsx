import { HiSolidCalendar, HiSolidPlay, HiSolidXMark } from 'solid-icons/hi'
import { Show } from 'solid-js'
import { formatDate } from '~/lib/utils'
import { getWordlePlayUrl } from '~/lib/wordle'

export function EntryCard(props: {
  title: string
  entry: { score: string, created_at: string } | null
  emptyText: string
  wordleId?: number
  showPlayButton?: boolean
}) {
  return (
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">
          {props.title}
        </h2>
      </div>
      <div class="p-6">
        <Show
          when={props.entry}
          fallback={(
            <div class="space-y-4 text-center text-gray-500 dark:text-gray-400">
              <HiSolidXMark class="mx-auto size-10 text-gray-400 dark:text-gray-500" />
              <Show
                when={props.wordleId && props.showPlayButton}
                fallback={<p>{props.emptyText}</p>}
              >
                <a
                  href={getWordlePlayUrl(props.wordleId!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  <HiSolidPlay class="size-4" />
                  Play this Wordle
                </a>
              </Show>
            </div>
          )}
        >
          <div class="space-y-4">
            <div class="text-center">
              <div
                class={`text-4xl font-bold ${
                  props.entry!.score === 'X' ? 'text-red-600' : 'text-green-600'
                }`}
              >
                <Show
                  when={props.entry!.score !== 'X'}
                  fallback={<HiSolidXMark class="mx-auto size-10" />}
                >
                  {props.entry!.score}
                </Show>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {props.entry!.score === 'X' ? 'Failed' : 'Guesses'}
              </div>
            </div>
            <div class="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <HiSolidCalendar class="size-4" />
              <span>
                Submitted on
                {` ${formatDate(props.entry!.created_at)}`}
              </span>
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}
