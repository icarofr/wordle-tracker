import { Link, useNavigate } from '@tanstack/solid-router'
import { HiSolidLockClosed } from 'solid-icons/hi'
import { createEffect, createSignal } from 'solid-js'
import { Button } from '~/components/ui/Button'
import { Checkbox } from '~/components/ui/Checkbox'
import { FormInput } from '~/components/ui/FormInput'
import { ApiError, authApi } from '~/lib/api'
import { login, useAuth } from '~/lib/auth'
import { showToast } from '~/lib/toast'

export function LoginPage() {
  const navigate = useNavigate()
  // We get `isAuthenticated` to reactively trigger navigation.
  const { isAuthenticated } = useAuth()

  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [rememberMe, setRememberMe] = createSignal(false)

  // --- Reactive Navigation ---
  // This effect runs whenever the `isAuthenticated` status changes.
  // When it becomes `true`, we know the login was successful and we can navigate.
  createEffect(() => {
    if (isAuthenticated()) {
      void navigate({ to: '/dashboard' })
    }
  })

  const [isPending, setIsPending] = createSignal(false)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    if (!email() || !password()) {
      if (!email())
        showToast('Email is required', 'error')
      if (!password())
        showToast('Password is required', 'error')
      return
    }

    setIsPending(true)
    try {
      const response = await authApi.login({
        email: email(),
        password: password(),
        remember_me: rememberMe(),
      })
      login(response.token)
      showToast('Successfully signed in!', 'success')
    }
    catch (e) {
      if (e instanceof ApiError && e.fields && e.fields.length > 0) {
        e.fields.forEach(({ field, detail }) => {
          showToast(`${field}: ${detail}`, 'error')
        })
      }
      else {
        showToast(e instanceof Error ? e.message : 'Unable to sign in', 'error')
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
          <HiSolidLockClosed class="size-6 text-white" />
        </div>
        <h2 class="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Sign in to your account
        </h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={(e) => { void handleSubmit(e) }} class="space-y-6">
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
            autocomplete="current-password"
            required
          />

          <Checkbox
            id="remember-me"
            name="remember_me"
            checked={rememberMe()}
            onChange={e => setRememberMe(e.currentTarget.checked)}
            label="Remember me"
          />

          <Button
            type="submit"
            class="w-full"
            loading={isPending()}
            disabled={isPending()}
          >
            Sign in
          </Button>
        </form>

        <p class="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?
          {' '}
          <Link
            to="/register"
            class="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Create one here
          </Link>
        </p>
      </div>
    </div>
  )
}
