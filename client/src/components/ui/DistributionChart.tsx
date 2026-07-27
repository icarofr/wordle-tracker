import { For } from 'solid-js'

// This helper function was used in your parent page, so it belongs with its component.
export function transformDistribution(distribution: Record<string, number>) {
  return Object.entries(distribution).map(([label, count]) => ({
    label: label === 'fail' ? 'X' : label,
    count,
  }))
}

interface ChartBar {
  label: string
  count: number
}

interface DistributionChartProps {
  title: string
  distribution: ChartBar[]
  total: number
  color: 'blue' | 'green' | 'indigo'
}

const CHART_COLOR_STYLES = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  indigo: 'bg-indigo-600 dark:bg-indigo-500',
} as const

export function DistributionChart(props: DistributionChartProps) {
  return (
    <div>
      <h4 class="mb-3 text-base font-semibold text-gray-800 dark:text-gray-200">
        {props.title}
      </h4>
      <div class="space-y-1 text-sm">
        <For each={props.distribution}>
          {(bar) => {
            const percentage
              = props.total > 0 ? (bar.count / props.total) * 100 : 0

            return (
              <div class="flex items-center gap-3">
                <span class="w-4 text-right font-mono text-gray-500 dark:text-gray-400">
                  {bar.label}
                </span>

                {/* Bar Container */}
                {/* FIX: Added `w-full` here. This is the critical fix for the iOS 16/Safari rendering bug.
                  It prevents the flex item from collapsing to zero width.
                */}
                <div class="flex h-5 w-full flex-1 items-center rounded-sm bg-gray-200 dark:bg-gray-700">
                  <div
                    class={`flex h-full items-center justify-end rounded-sm pr-2 text-xs text-white ${
                      CHART_COLOR_STYLES[props.color]
                    }`}
                    style={{ width: `${percentage}%` }}
                  >
                    {/* Only show count if the bar is wide enough */}
                    {percentage > 10 && bar.count > 0 ? bar.count : ''}
                  </div>
                </div>

                <span class="w-8 text-right font-semibold text-gray-600 dark:text-gray-300">
                  {Math.round(percentage)}
                  %
                </span>
              </div>
            )
          }}
        </For>
      </div>
    </div>
  )
}
