import { Link, useNavigate } from '@tanstack/solid-router'
import { HiSolidUser } from 'solid-icons/hi'
import { createEffect, createSignal } from 'solid-js'
import { Button } from '~/components/ui/Button'
import { FormInput } from '~/components/ui/FormInput'
import { ApiError, authApi } from '~/lib/api'
import { markAuthenticated, useAuth } from '~/lib/auth'
import { showToast } from '~/lib/toast'

export function RegisterPage() {
  const navigate = useNavigate()
  // Get `isAuthenticated` to reactively trigger navigation
  const { isAuthenticated } = useAuth()

  const [name, setName] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')

  // --- Reactive Navigation ---
  // This effect triggers when `isAuthenticated` becomes true after a successful registration.
  createEffect(() => {
    if (isAuthenticated()) {
      void navigate({ to: '/dashboard' })
    }
  })

  const [isPending, setIsPending] = createSignal(false)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    const validationErrors: string[] = []
    if (!name())
      validationErrors.push('Name is required')
    if (!email())
      validationErrors.push('Email is required')
    if (!password())
      validationErrors.push('Password is required')
    else if (password().length < 8)
      validationErrors.push('Password must be at least 8 characters')

    if (validationErrors.length > 0) {
      validationErrors.forEach(error => showToast(error, 'error'))
      return
    }

    setIsPending(true)
    try {
      await authApi.register({
        name: name(),
        email: email(),
        password: password(),
      })
      await markAuthenticated()
      showToast('Account created successfully!', 'success')
    }
    catch (e) {
      if (e instanceof ApiError && e.fields && e.fields.length > 0) {
        e.fields.forEach(({ field, detail }) => {
          showToast(`${field}: ${detail}`, 'error')
        })
      }
      else {
        showToast(e instanceof Error ? e.message : 'Unable to create account', 'error')
      }
    }
    finally {
      setIsPending(false)
    }
  }

  return (
    <div class="flex min-h-screen flex-col justify-center bg-gray-50 px-6 py-12 lg:px-8 dark:bg-gray-900">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <div class="mx-auto flex size-10 items-center justify-center rounded-lg bg-indigo-600">
          <HiSolidUser class="size-6 text-white" />
        </div>
        <h2 class="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Create your account
        </h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={(e) => { void handleSubmit(e) }} class="space-y-6">
          <FormInput
            id="name"
            name="name"
            type="text"
            label="Full name"
            value={name()}
            onInput={e => setName(e.currentTarget.value)}
            autocomplete="name"
            required
          />

          <FormInput
            id="email"
            name="email"
            type="email"
            label="Email address"
            value={email()}
            onInput={e => setEmail(e.currentTarget.value)}
            autocomplete="email"
            required
          />

          <FormInput
            id="password"
            name="password"
            type="password"
            label="Password"
            value={password()}
            onInput={e => setPassword(e.currentTarget.value)}
            autocomplete="new-password"
            required
            placeholder="At least 8 characters"
          />

          <Button
            type="submit"
            class="w-full"
            loading={isPending()}
            disabled={isPending()}
          >
            Create account
          </Button>
        </form>

        <p class="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?
          {' '}
          <Link
            to="/login"
            class="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
