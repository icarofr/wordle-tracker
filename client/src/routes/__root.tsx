import { createRootRouteWithContext, Outlet } from '@tanstack/solid-router'

export const Route = createRootRouteWithContext()({
  component: RootComponent,
})

function RootComponent() {
  return <Outlet />
}
