import { Link } from '@tanstack/solid-router'
import {
  HiSolidAdjustmentsVertical,
  HiSolidLightBulb,
  HiSolidMoon,
  HiSolidSun,
} from 'solid-icons/hi'
import { useTheme } from '../../lib/theme'

export function LandingPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div class="relative flex min-h-screen flex-col items-center justify-center px-4">
      {/* Theme toggle in top-right corner */}
      <div class="absolute top-4 right-4 md:top-6 md:right-6">
        <button
          type="button"
          onClick={toggleTheme}
          class="rounded-lg border border-gray-200 bg-white/80 p-3 text-gray-600 shadow-sm backdrop-blur-sm transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          title={`Current theme: ${theme()}. Click to cycle through: light → dark → system → light`}
        >
          <span class="sr-only">Toggle theme</span>
          {theme() === 'dark'
            ? (
                <HiSolidMoon class="size-5" />
              )
            : theme() === 'light'
              ? (
                  <HiSolidSun class="size-5" />
                )
              : (
                  <HiSolidAdjustmentsVertical class="size-5" />
                )}
        </button>
      </div>

      <div class="max-w-md space-y-8 text-center">
        <div class="space-y-4">
          <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-indigo-600">
            <HiSolidLightBulb class="size-8 text-white" />
          </div>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Wordle Tracker
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Track your Wordle progress and compete with friends
          </p>
        </div>

        <div class="space-y-4">
          <Link
            to="/register"
            class="block w-full rounded-md bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            class="block w-full rounded-md bg-gray-200 px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            Sign In
          </Link>
        </div>

        <div class="border-t border-gray-200 pt-8 dark:border-gray-700">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Built with SolidJS, TanStack Router, and Go
          </p>
        </div>
      </div>
    </div>
  )
}
