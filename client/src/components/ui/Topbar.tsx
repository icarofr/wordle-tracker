import {
  HiSolidAdjustmentsVertical,
  HiSolidBars3,
  HiSolidFire,
  HiSolidMoon,
  HiSolidSun,
  HiSolidTrophy,
} from 'solid-icons/hi'
import { createMemo, createResource } from 'solid-js'
import { wordleApi } from '~/lib/api'
import { useAuth } from '~/lib/auth'

import { useTheme } from '~/lib/theme'
import { UserMenu } from './UserMenu'

interface TopbarProps {
  onMobileMenuClick: (event: MouseEvent) => void
}

export function Topbar(props: TopbarProps) {
  const auth = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [userStats] = createResource(
    () => auth.user()?.id,
    async id => wordleApi.getUserStats(id),
  )

  const quickStats = createMemo(() => {
    const data = userStats()
    return {
      currentStreak: data?.current_streak ?? 0,
      winPercentage: data?.win_percentage ?? 0,
    }
  })

  return (
    <header class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/80 px-4 shadow-lg backdrop-blur-xl sm:gap-x-6 sm:px-6 lg:px-8 dark:border-gray-700 dark:bg-gray-900/80">
      <button
        type="button"
        class="-m-2.5 rounded-lg p-2.5 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 md:hidden dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={(e) => {
          e.stopPropagation()
          props.onMobileMenuClick(e)
        }}
        aria-label="Open sidebar"
      >
        <HiSolidBars3 class="size-6" />
      </button>

      <div
        class="h-6 w-px bg-gray-300 md:hidden dark:bg-gray-600"
        aria-hidden="true"
      />

      <div class="flex flex-1 items-center justify-between">
        <div class="flex items-center gap-6">
          <div class="hidden items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-1.5 lg:flex dark:border-gray-700 dark:bg-gray-800">
            <div class="flex items-center gap-1.5 text-xs">
              <HiSolidFire class="size-4 text-orange-500" />
              <span class="text-gray-600 dark:text-gray-400">Streak:</span>
              <span class="font-semibold text-gray-900 dark:text-white">
                {quickStats().currentStreak}
              </span>
            </div>
            <div class="h-4 w-px bg-gray-300 dark:bg-gray-600" aria-hidden="true" />
            <div class="flex items-center gap-1.5 text-xs">
              <HiSolidTrophy class="size-4 text-yellow-500" />
              <span class="text-gray-600 dark:text-gray-400">Win%:</span>
              <span class="font-semibold text-gray-900 dark:text-white">
                {quickStats().winPercentage.toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            class="rounded-lg p-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label={`Theme: ${theme()}. Click to cycle.`}
          >
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

          <UserMenu />
        </div>
      </div>
    </header>
  )
}
