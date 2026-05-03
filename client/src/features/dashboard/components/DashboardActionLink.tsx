import type { JSX } from 'solid-js'
import type { LookupSearch } from '~/types'
import { Link } from '@tanstack/solid-router'

interface DashboardActionLinkProps {
  to: string
  search?: LookupSearch
  children: JSX.Element
}

export function DashboardActionLink(props: DashboardActionLinkProps) {
  return (
    <Link
      to={props.to}
      search={props.search}
      class="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md p-0.5 text-sm font-medium whitespace-nowrap text-indigo-600 transition-colors hover:text-indigo-500 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none dark:text-indigo-400 dark:hover:text-indigo-300"
    >
      {props.children}
    </Link>
  )
}
