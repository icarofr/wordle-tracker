import { For, Show } from 'solid-js'
import { PageHeader } from '~/components/ui/PageHeader'
import { ResourceBoundary } from '~/components/ui/ResourceBoundary'
import { LeaderboardItem } from './components/LeaderboardItem'
import { useLeaderboardPageData } from './hooks/useLeaderboardPageData'

export function LeaderboardPage() {
  const pageData = useLeaderboardPageData()

  return (
    <div class="container mx-auto px-4 py-8">
      <PageHeader
        title="Leaderboard"
        subtitle="See how the whole cohort stacks up across shared Wordles."
      />

      <ResourceBoundary data={pageData.data}>
        {data => (
          <Show
            when={data.items.length > 0}
            fallback={(
              <div class="py-16 text-center text-gray-500 dark:text-gray-400">
                No leaderboard data available.
              </div>
            )}
          >
            <div class="space-y-4">
              <div class="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {data.shared_wordles > 0
                  ? `Rankings are based on ${data.shared_wordles} Wordle${data.shared_wordles === 1 ? '' : 's'} played by everyone in the cohort.`
                  : 'No fully shared Wordles yet. The cohort list is shown below, and rankings will settle once everyone has played the same puzzles.'}
              </div>

              <For each={data.items}>
                {(entry, index) => (
                  <LeaderboardItem
                    entry={entry}
                    rank={index() + 1}
                    isCurrentUser={pageData.currentUser()?.id === entry.player.id}
                  />
                )}
              </For>
            </div>
          </Show>
        )}
      </ResourceBoundary>
    </div>
  )
}
