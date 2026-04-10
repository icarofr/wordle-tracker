import { For, Show } from 'solid-js'
import { useOpponentSelector } from '../opponent'

export function OpponentSelector() {
  const {
    opponents,
    selectedOpponent,
    selectedOpponentId,
    setSelectedOpponentId,
    showSelector,
  } = useOpponentSelector()

  return (
    <section class="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-indigo-900/60 dark:bg-gray-900/60">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-1">
          <p class="text-xs font-semibold tracking-[0.18em] text-indigo-600 uppercase dark:text-indigo-300">
            Matchup
          </p>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Choose your rival
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Switch opponents here without bouncing up to the navbar.
          </p>
        </div>

        <div class="w-full max-w-sm">
          <Show
            when={showSelector()}
            fallback={(
              <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <Show
                  when={selectedOpponent()}
                  fallback="No opponents available yet."
                >
                  {opponent => `Only one rival is available right now: ${opponent().name}.`}
                </Show>
              </div>
            )}
          >
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Opponent
              <select
                id="head-to-head-opponent"
                class="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                value={selectedOpponentId() ?? ''}
                onChange={(e) => {
                  const value = Number.parseInt(e.currentTarget.value, 10)
                  if (!Number.isNaN(value)) {
                    setSelectedOpponentId(value)
                  }
                }}
              >
                <option value="" disabled>
                  Select opponent
                </option>
                <For each={opponents()}>
                  {opp => <option value={opp.id}>{opp.name}</option>}
                </For>
              </select>
            </label>
          </Show>
        </div>
      </div>
    </section>
  )
}
