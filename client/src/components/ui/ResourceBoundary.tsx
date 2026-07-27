import type { JSX, Resource } from 'solid-js'
import { Match, Switch } from 'solid-js'

interface ResourceBoundaryProps<T> {
  data: Resource<T>
  children: (data: T) => JSX.Element
  loadingFallback?: JSX.Element
  errorFallback?: (error: Error) => JSX.Element
}

export function ResourceBoundary<T>(props: ResourceBoundaryProps<T>) {
  const defaultLoading = (
    <p class="py-4 text-center text-gray-500 dark:text-gray-400">Loading...</p>
  )
  const defaultError = (err: Error) => (
    <p class="py-4 text-center text-red-500">
      Error:
      {err.message}
    </p>
  )

  return (
    <Switch>
      <Match when={props.data.loading}>
        {props.loadingFallback ?? defaultLoading}
      </Match>
      <Match when={props.data.error as unknown}>
        {(() => {
          const raw: unknown = props.data.error
          const err = raw instanceof Error ? raw : new Error(String(raw ?? 'Unknown error'))
          return props.errorFallback
            ? props.errorFallback(err)
            : defaultError(err)
        })()}
      </Match>
      <Match when={props.data() != null}>
        {props.children(props.data()!)}
      </Match>
    </Switch>
  )
}
