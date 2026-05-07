import { createFileRoute } from '@tanstack/solid-router'
import { LandingPage } from '~/features/auth/LandingPage'
import { authGuards } from '~/lib/authGuards'

export const Route = createFileRoute('/')({
  beforeLoad: authGuards.requireGuest,
  component: LandingPage,
})
