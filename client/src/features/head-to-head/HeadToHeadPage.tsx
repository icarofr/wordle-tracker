import type { RecentMatch } from '~/types'
import { createMemo, For, Show } from 'solid-js'
import {
  DistributionChart,
  transformDistribution,
} from '~/components/ui/DistributionChart'
import { PageHeader } from '~/components/ui/PageHeader'
import { ResourceBoundary } from '~/components/ui/ResourceBoundary'
import { ResultItem } from '~/components/ui/ResultItem'
import { HeadToHeadHero } from './components/HeadToHeadHero'
import { OpponentSelector } from './components/OpponentSelector'
import { StatsComparison } from './components/StatsComparison'
import { useHeadToHeadPageData } from './hooks/useHeadToHeadPageData'
import { selectedOpponentId } from './opponent'

const RECENT_MATCHES_LIMIT = 5

export function HeadToHeadPage() {
  const pageData = useHeadToHeadPageData()
  const hasSelectedOpponent = createMemo(() => selectedOpponentId() !== undefined)

  return (
    <div class="container mx-auto overflow-x-hidden px-4 py-8">
      <PageHeader
        title="Head to Head"
        subtitle="See how your stats stack up against your rival."
      />

      <div class="mx-auto mb-8 max-w-4xl">
        <OpponentSelector />
      </div>

      <Show
        when={hasSelectedOpponent()}
        fallback={(
          <div class="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Choose an opponent above to compare results.
          </div>
        )}
      >
        <Show
          when={pageData.hasOpponent()}
          fallback={<div>The selected opponent is no longer available.</div>}
        >
          <ResourceBoundary data={pageData.headToHeadData}>
            {(headToHeadData) => {
              const recentMatches = headToHeadData.recent_matches ?? []

              return (
                <div class="space-y-8">
                  <HeadToHeadHero
                    currentUser={pageData.currentUser()}
                    opponent={pageData.opponent()}
                    h2hRecord={headToHeadData.record}
                  />

                  <StatsComparison
                    userStats={headToHeadData.stats.self}
                    opponentStats={headToHeadData.stats.opponent}
                  />

                  <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Recent Clashes */}
                    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Clashes
                      </h3>
                      <Show
                        when={recentMatches.length > 0}
                        fallback={(
                          <div class="py-8 text-center">
                            <p class="text-gray-500 dark:text-gray-400">
                              No shared games yet!
                            </p>
                          </div>
                        )}
                      >
                        <div class="space-y-3">
                          <For each={recentMatches.slice(0, RECENT_MATCHES_LIMIT)}>
                            {(match: RecentMatch) => (
                              <ResultItem
                                wordleId={match.wordle_id}
                                result={match.result}
                                date={match.played_at}
                                userScore={match.self_score}
                                opponentScore={match.opponent_score}
                              />
                            )}
                          </For>
                        </div>
                      </Show>
                    </div>

                    {/* Combined Distribution Charts */}
                    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Score Distribution
                      </h3>
                      <div class="space-y-6">
                        <DistributionChart
                          distribution={transformDistribution(
                            headToHeadData.stats.self.distribution,
                          )}
                          total={headToHeadData.stats.self.games}
                          color="blue"
                          title={pageData.currentUser()?.name ?? 'You'}
                        />
                        <DistributionChart
                          distribution={transformDistribution(
                            headToHeadData.stats.opponent.distribution,
                          )}
                          total={headToHeadData.stats.opponent.games}
                          color="green"
                          title={pageData.opponent()?.name ?? 'Opponent'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            }}
          </ResourceBoundary>
        </Show>
      </Show>
    </div>
  )
}
