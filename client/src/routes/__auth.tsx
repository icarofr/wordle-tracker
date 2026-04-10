import { createFileRoute, Outlet } from '@tanstack/solid-router'
import { ImSpinner11 } from 'solid-icons/im'
import { ErrorBoundary, Suspense } from 'solid-js'
import { AuthenticatedLayout } from '~/components/ui/AuthenticatedLayout'
import { syncSelectedOpponent } from '~/features/head-to-head/opponent'
import { userApi } from '~/lib/api'
import { authStore } from '~/lib/auth'
import { authGuards } from '~/lib/authGuards'
import { consumePreload, preload, PRELOAD_KEYS } from '~/lib/preload'

export const Route = createFileRoute('/__auth')({
  beforeLoad: authGuards.requireAuth,
  loader: async () => {
    // Preload users at the auth layout level — every child route needs them
    const users = await consumePreload(PRELOAD_KEYS.users, userApi.getUsers)
    preload(PRELOAD_KEYS.users, async () => Promise.resolve(users))

    const currentUserId = authStore.user()?.id
    syncSelectedOpponent(
      users.filter((u: { id: number }) => u.id !== currentUserId),
      currentUserId,
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthenticatedLayout>
      <ErrorBoundary fallback={(err: unknown, reset) => (
        <div class="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Something went wrong</h2>
          <p class="text-gray-500 dark:text-gray-400">{err instanceof Error ? err.message : 'An unexpected error occurred'}</p>
          <button
            type="button"
            onClick={reset}
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Try again
          </button>
        </div>
      )}
      >
        <Suspense fallback={<ImSpinner11 class="m-auto animate-spin text-4xl" />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </AuthenticatedLayout>
  )
}
