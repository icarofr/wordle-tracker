import type { Resource } from 'solid-js'
import type { ArchiveListPage, WordleStats } from '~/types'
import {
  HiSolidCalendarDays,
  HiSolidFire,
  HiSolidSparkles,
  HiSolidTrophy,
} from 'solid-icons/hi'
import { createMemo } from 'solid-js'

interface DashboardOverviewProps {
  archive: Resource<ArchiveListPage>
  stats: Resource<WordleStats>
}

export function DashboardOverview(props: DashboardOverviewProps) {
  const trackedWordles = createMemo(() => props.archive()?.items.length ?? 0)
  const openWordles = createMemo(
    () =>
      props.archive()?.items.filter(wordle => !wordle.viewer_has_played).length ?? 0,
  )

  return (
    <div class="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
        <div class="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
          <HiSolidFire class="size-4 text-orange-500" />
          Current streak
        </div>
        <div class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          {props.stats()?.current_streak ?? '—'}
        </div>
        <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          consecutive wins in play
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
        <div class="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
          <HiSolidTrophy class="size-4 text-amber-500" />
          Win rate
        </div>
        <div class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          {props.stats()?.win_percentage != null
            ? `${props.stats()!.win_percentage.toFixed(1)}%`
            : '—'}
        </div>
        <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          across tracked submissions
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
        <div class="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
          <HiSolidCalendarDays class="size-4 text-sky-500" />
          Tracked
        </div>
        <div class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          {trackedWordles()}
        </div>
        <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Wordles currently in archive
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
        <div class="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
          <HiSolidSparkles class="size-4 text-indigo-500" />
          Open
        </div>
        <div class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          {openWordles()}
        </div>
        <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          puzzles still waiting on you
        </div>
      </div>
    </div>
  )
}
