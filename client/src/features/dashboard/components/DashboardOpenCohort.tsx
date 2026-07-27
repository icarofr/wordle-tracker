import type { Resource } from 'solid-js'
import type { ArchiveListPage } from '~/types'
import { Link } from '@tanstack/solid-router'
import { HiSolidUserGroup } from 'solid-icons/hi'
import { createMemo, For, Show } from 'solid-js'
import { ResourceBoundary } from '~/components/ui/ResourceBoundary'
import { ResultBadge } from '~/components/ui/ResultBadge'
import { formatDate } from '~/lib/utils'
import { wordleIdToDate } from '~/lib/wordle'
import { DashboardActionLink } from './DashboardActionLink'
import { DashboardSectionCard } from './DashboardSectionCard'

interface DashboardOpenCohortProps {
  archive: Resource<ArchiveListPage>
}

const OPEN_COHORT_LIMIT = 6

export function DashboardOpenCohort(props: DashboardOpenCohortProps) {
  const openPreview = createMemo(() =>
    (props.archive()?.items ?? [])
      .filter(wordle => !wordle.viewer_has_played)
      .slice(0, OPEN_COHORT_LIMIT),
  )

  return (
    <DashboardSectionCard
      title="Open In Your Cohort"
      subtitle="Wordles other players have submitted that are still waiting on you."
      icon={<HiSolidUserGroup class="size-5" />}
      action={(
        <DashboardActionLink to="/lookup" search={{ view: 'list' }}>
          Browse archive
        </DashboardActionLink>
      )}
    >
      <ResourceBoundary data={props.archive}>
        {() => (
          <div class="space-y-3">
            <Show
              when={openPreview().length > 0}
              fallback={(
                <p class="py-4 text-center text-gray-500 dark:text-gray-400">
                  You are caught up with the current cohort activity.
                </p>
              )}
            >
              <For each={openPreview()}>
                {wordle => (
                  <Link
                    to="/lookup"
                    search={{ wordleId: wordle.wordle_id }}
                    class="flex cursor-pointer items-center justify-between rounded-lg border border-sky-300 bg-sky-50 px-4 py-3 transition-colors hover:shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none dark:border-sky-700/50 dark:bg-sky-900/40"
                  >
                    <div class="flex items-center gap-3">
                      <ResultBadge tone="waiting" size="md" />
                      <div>
                        <div class="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                          #
                          {wordle.wordle_id}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(wordleIdToDate(wordle.wordle_id), {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {wordle.participant_count}
                        {' '}
                        played
                      </div>
                      <div class="text-xs text-amber-600 dark:text-amber-400">
                        Waiting on you
                      </div>
                    </div>
                  </Link>
                )}
              </For>
            </Show>
          </div>
        )}
      </ResourceBoundary>
    </DashboardSectionCard>
  )
}
