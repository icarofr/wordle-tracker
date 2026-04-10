import { createRouter, RouterProvider } from '@tanstack/solid-router'
import { ErrorBoundary } from 'solid-js'
import { render } from 'solid-js/web'
import { ToastContainer } from './components/ui/Toast'
import { AuthProvider } from './lib/auth'
import { routeTree } from './routeTree.gen'
import './styles.css'

async function enableMocking() {
  if (import.meta.env.VITE_MOCK_API === 'true') {
    const { worker } = await import('./test/msw/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
    localStorage.setItem('auth_token', 'mock-token-showcase')
  }
}

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router
  }
}

interface AppCrashFallbackProps {
  error: Error
  reset: () => void
}

function AppCrashFallback(props: AppCrashFallbackProps) {
  return (
    <div class="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 class="text-2xl font-bold text-gray-900">Something went wrong</h1>
      <p class="max-w-md text-gray-600">{props.error.message}</p>
      <button
        type="button"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary fallback={(err: Error, reset) => <AppCrashFallback error={err} reset={reset} />}>
      <AuthProvider />
      <RouterProvider router={router} />
      <ToastContainer />
    </ErrorBoundary>
  )
}

const rootElement = document.getElementById('app')
if (rootElement) {
  void enableMocking().then(() => {
    render(() => <App />, rootElement)
  })
}
