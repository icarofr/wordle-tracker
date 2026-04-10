// filepath: /Users/user/projects/wordle-tracker/solidjs_phx/client/src/routes/login.tsx
import { createFileRoute } from '@tanstack/solid-router'
import { LoginPage } from '~/features/auth/LoginPage'
import { authGuards } from '~/lib/authGuards'

export const Route = createFileRoute('/login')({
  beforeLoad: authGuards.requireGuest,
  component: LoginPage,
})
