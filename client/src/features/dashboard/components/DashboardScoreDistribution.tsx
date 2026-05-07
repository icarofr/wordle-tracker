import type { Resource } from 'solid-js'
import type { WordleStats } from '~/types'
import { HiSolidChartBar } from 'solid-icons/hi'
import { DistributionChart, transformDistribution } from '~/components/ui/DistributionChart'
import { ResourceBoundary } from '~/components/ui/ResourceBoundary'
import { DashboardSectionCard } from './DashboardSectionCard'

interface DashboardScoreDistributionProps {
  stats: Resource<WordleStats>
}

export function DashboardScoreDistribution(props: DashboardScoreDistributionProps) {
  return (
    <DashboardSectionCard
      title="Score Distribution"
      subtitle="Your current distribution across recorded games."
      icon={<HiSolidChartBar class="size-5" />}
    >
      <ResourceBoundary data={props.stats}>
        {data => (
          <DistributionChart
            title=""
            distribution={transformDistribution(data.distribution)}
            total={data.games}
            color="indigo"
          />
        )}
      </ResourceBoundary>
    </DashboardSectionCard>
  )
}
