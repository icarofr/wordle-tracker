import type { JSX } from 'solid-js'
import { createSignal } from 'solid-js'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface AuthenticatedLayoutProps {
  children: JSX.Element
}

export function AuthenticatedLayout(props: AuthenticatedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = createSignal(false)

  // The `onMount` hook for refetching is removed.
  // Data fetching logic is now fully contained and managed
  // reactively within the `useAuth` store.

  return (
    <div class="min-h-screen bg-gray-50 transition-colors dark:bg-gray-800">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div class="md:pl-72">
        <Topbar onMobileMenuClick={() => setSidebarOpen(true)} />

        <main class="min-h-screen bg-gray-50 py-6 dark:bg-gray-800">
          <div class="px-4 sm:px-6 lg:px-8">{props.children}</div>
        </main>
      </div>
    </div>
  )
}
