import type { Resource } from 'solid-js'
import type { ArchiveListItem, ArchiveListPage } from '~/types'
import { HiSolidCalendarDays } from 'solid-icons/hi'
import { createMemo, For, Show } from 'solid-js'
import { ResourceBoundary } from '~/components/ui/ResourceBoundary'
import { ResultItem } from '~/components/ui/ResultItem'
import { scoreToNumber } from '~/lib/wordle'
import { DashboardActionLink } from './DashboardActionLink'
import { DashboardSectionCard } from './DashboardSectionCard'

interface DashboardRecentWordlesProps {
  archive: Resource<ArchiveListPage>
}

const RECENT_WORDLES_LIMIT = 6

export function recentResultTone(wordle: ArchiveListItem) {
  if (!wordle.viewer_entry?.score)
    return 'default'

  const viewerScore = scoreToNumber(wordle.viewer_entry.score)
  const bestScore = wordle.summary?.best_score
    ? scoreToNumber(wordle.summary.best_score)
    : Number.NaN

  if (wordle.participant_count <= 1 || !Number.isFinite(bestScore)) {
    if (viewerScore <= 3)
      return 'win'
    if (viewerScore <= 4)
      return 'tie'
    return 'loss'
  }

  if (viewerScore === bestScore)
    return 'win'
  if (viewerScore === 7)
    return 'loss'
  if (viewerScore - bestScore <= 1)
    return 'tie'
  return 'loss'
}

export function DashboardRecentWordles(props: DashboardRecentWordlesProps) {
  const recentPlayed = createMemo(() =>
    [...(props.archive()?.items ?? [])]
      .filter(wordle => wordle.viewer_has_played)
      .sort((left, right) => {
        const leftCreatedAt = left.viewer_entry?.created_at ?? ''
        const rightCreatedAt = right.viewer_entry?.created_at ?? ''
        return (
          new Date(rightCreatedAt).getTime() - new Date(leftCreatedAt).getTime()
        )
      })
      .slice(0, RECENT_WORDLES_LIMIT),
  )

  return (
    <DashboardSectionCard
      title="Your Recent Wordles"
      icon={<HiSolidCalendarDays class="size-5" />}
      action={(
        <DashboardActionLink to="/lookup" search={{ view: 'list' }}>
          View all
        </DashboardActionLink>
      )}
    >
      <ResourceBoundary data={props.archive}>
        {() => (
          <div class="space-y-3">
            <Show
              when={recentPlayed().length > 0}
              fallback={(
                <p class="py-4 text-center text-gray-500 dark:text-gray-400">
                  No Wordles submitted yet.
                </p>
              )}
            >
              <For each={recentPlayed()}>
                {entry => (
                  <ResultItem
                    wordleId={entry.wordle_id}
                    result={recentResultTone(entry)}
                    date={entry.viewer_entry?.created_at ?? ''}
                    userScore={entry.viewer_entry?.score ?? null}
                  />
                )}
              </For>
            </Show>
          </div>
        )}
      </ResourceBoundary>
    </DashboardSectionCard>
  )
}
