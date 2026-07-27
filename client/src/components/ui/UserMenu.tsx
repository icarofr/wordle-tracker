import { HiSolidChevronDown } from 'solid-icons/hi'
import {
  createEffect,
  createSignal,
  Match,
  onCleanup,
  Show,
  Switch,
} from 'solid-js'

import { useUserAvatar } from '~/hooks/useUserAvatar'
import { logout, useAuth } from '~/lib/auth'
import { getAvatarUrl } from '~/lib/avatar'
import { showToast } from '~/lib/toast'
import { AvatarSelector } from './AvatarSelector'

export function UserMenu() {
  const auth = useAuth()
  const { currentAvatar, updateAvatar, isUpdating } = useUserAvatar()

  // State is now fully encapsulated within this component
  const [isOpen, setIsOpen] = createSignal(false)
  const [view, setView] = createSignal<'main' | 'avatar'>('main')

  let menuContainerRef: HTMLDivElement | undefined

  createEffect(() => {
    if (!isOpen())
      return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef && !menuContainerRef.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape')
        setIsOpen(false)
    }
    document.addEventListener('click', handleClickOutside, true)
    document.addEventListener('keydown', handleKeyDown)
    onCleanup(() => {
      document.removeEventListener('click', handleClickOutside, true)
      document.removeEventListener('keydown', handleKeyDown)
    })
  })

  // When the menu closes, always reset the internal view to 'main'.
  createEffect(() => {
    if (!isOpen()) {
      setView('main')
    }
  })

  const handleLogout = () => {
    setIsOpen(false)
    void logout()
    showToast('You have been signed out.', 'info')
  }

  const handleAvatarSelect = (id: string) => {
    void updateAvatar(id)
    setView('main')
  }

  return (
    <div ref={menuContainerRef} class="relative">
      <button
        type="button"
        class="-m-1.5 flex items-center gap-2 rounded-lg p-1.5 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen())}
      >
        <img
          loading="lazy"
          decoding="async"
          class="size-8 rounded-full ring-2 ring-white dark:ring-gray-800"
          src={getAvatarUrl(currentAvatar())}
          alt="User Avatar"
          width={32}
          height={32}
        />
        <span class="hidden sm:flex sm:items-center">
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {auth.user()?.name || 'User'}
          </span>
          <HiSolidChevronDown
            class={`ml-2 size-4 text-gray-600 transition-transform duration-200 dark:text-gray-400 ${
              isOpen() ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>

      <Show when={isOpen()}>
        <div class="absolute right-0 z-10 mt-2.5 w-64 origin-top-right rounded-lg border border-gray-100 bg-white py-2 shadow-lg ring-1 ring-gray-200 sm:w-72 dark:border-gray-700 dark:bg-gray-800 dark:ring-gray-700">
          <Switch>
            <Match when={view() === 'avatar'}>
              <AvatarSelector
                currentAvatar={currentAvatar()}
                onSelect={handleAvatarSelect}
                onBack={() => setView('main')}
              />
            </Match>
            <Match when={view() === 'main'}>
              <div class="pt-1">
                <div class="border-b border-gray-100 px-3 pb-2 dark:border-gray-700">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {auth.user()?.name || 'User'}
                  </p>
                  <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                    {auth.user()?.email || 'user@example.com'}
                  </p>
                </div>
                <div class="mt-1">
                  <button
                    type="button"
                    onClick={() => setView('avatar')}
                    class="flex w-full items-center px-3 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-700"
                    disabled={isUpdating()}
                  >
                    <span class="mr-2">👤</span>
                    Change Avatar
                    <Show when={isUpdating()}>
                      <span class="ml-auto text-xs">Updating...</span>
                    </Show>
                  </button>
                  <div class="my-1 border-t border-gray-100 dark:border-gray-700" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    class="flex w-full items-center px-3 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <span class="mr-2">🚪</span>
                    Sign out
                  </button>
                </div>
              </div>
            </Match>
          </Switch>
        </div>
      </Show>
    </div>
  )
}
