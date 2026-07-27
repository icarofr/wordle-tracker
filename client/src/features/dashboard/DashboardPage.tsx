import { PageHeader } from '~/components/ui/PageHeader'
import { DashboardOpenCohort } from './components/DashboardOpenCohort'
import { DashboardOverview } from './components/DashboardOverview'
import { DashboardRecentWordles } from './components/DashboardRecentWordles'
import { DashboardScoreDistribution } from './components/DashboardScoreDistribution'
import { DashboardSubmitCard } from './components/DashboardSubmitCard'
import { useDashboardPageData } from './hooks/useDashboardPageData'

export function DashboardPage() {
  const pageData = useDashboardPageData()

  return (
    <div class="container mx-auto px-4 py-8">
      <PageHeader
        title="Dashboard"
        subtitle="Submit today's puzzle, catch up with open cohort games, and review your recent form."
      />

      <DashboardOverview archive={pageData.archive} stats={pageData.stats} />

      <div class="grid gap-6 xl:grid-cols-2 xl:items-start">
        <div class="flex min-w-0 flex-col gap-6">
          <DashboardSubmitCard
            isPending={pageData.submitAction.isPending()}
            value={pageData.wordleInput()}
            onInput={pageData.setWordleInput}
            onSubmit={pageData.handleSubmit}
          />
          <DashboardRecentWordles archive={pageData.archive} />
        </div>

        <div class="flex min-w-0 flex-col gap-6">
          <DashboardOpenCohort archive={pageData.archive} />
          <DashboardScoreDistribution stats={pageData.stats} />
        </div>
      </div>
    </div>
  )
}
