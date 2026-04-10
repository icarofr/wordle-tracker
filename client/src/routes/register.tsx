// filepath: /Users/user/projects/wordle-tracker/solidjs_phx/client/src/routes/register.tsx
import { createFileRoute } from '@tanstack/solid-router'
import { RegisterPage } from '~/features/auth/RegisterPage'
import { authGuards } from '~/lib/authGuards'

export const Route = createFileRoute('/register')({
  beforeLoad: authGuards.requireGuest,
  component: RegisterPage,
})
