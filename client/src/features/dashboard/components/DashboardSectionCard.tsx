import type { JSX } from 'solid-js'

interface DashboardSectionCardProps {
  title: string
  subtitle?: string
  icon: JSX.Element
  action?: JSX.Element
  children: JSX.Element
}

export function DashboardSectionCard(props: DashboardSectionCardProps) {
  return (
    <section class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg shadow-slate-900/5 transition-colors duration-200 dark:border-gray-700 dark:bg-gray-800">
      <div class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4">
          <div class="min-w-0">
            <h2 class="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white">
              {props.icon}
              {props.title}
            </h2>
            {props.subtitle && (
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {props.subtitle}
              </p>
            )}
          </div>
          {props.action ? <div class="sm:justify-self-end">{props.action}</div> : null}
        </div>
      </div>
      <div class="p-6">{props.children}</div>
    </section>
  )
}
