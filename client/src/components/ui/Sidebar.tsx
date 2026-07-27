import type { Accessor, Setter } from 'solid-js'
import { Link, useLocation } from '@tanstack/solid-router'
import {
  HiSolidCalendar,
  HiSolidHome,
  HiSolidTrophy,
  HiSolidUsers,
} from 'solid-icons/hi'
import { createEffect, For, onCleanup, Show } from 'solid-js'
import { classNames } from '~/lib/utils'

const navigation = [
  { name: 'Main page', href: '/dashboard', icon: HiSolidHome },
  { name: 'Head to Head', href: '/head-to-head', icon: HiSolidUsers },
  { name: 'Leaderboard', href: '/leaderboard', icon: HiSolidTrophy },
  { name: 'Wordle Archive', href: '/lookup', icon: HiSolidCalendar },
]

interface SidebarProps {
  sidebarOpen: Accessor<boolean>
  setSidebarOpen: Setter<boolean>
}

function NavItems(props: { onNavigate?: () => void, activeClass: string, inactiveClass: string, itemClass: string }) {
  const location = useLocation()

  return (
    <nav class="flex flex-1 flex-col">
      <ul class="flex flex-1 flex-col gap-y-7">
        <li>
          <ul class="-mx-2 space-y-1">
            <For each={navigation}>
              {item => (
                <li>
                  <Link
                    to={item.href}
                    onClick={props.onNavigate}
                    class={classNames(
                      location().pathname === item.href
                        ? props.activeClass
                        : props.inactiveClass,
                      props.itemClass,
                    )}
                  >
                    <item.icon class="size-6 shrink-0" />
                    {item.name}
                  </Link>
                </li>
              )}
            </For>
          </ul>
        </li>
      </ul>
    </nav>
  )
}

export function Sidebar(props: SidebarProps) {
  const close = () => props.setSidebarOpen(false)

  // Close on Escape
  createEffect(() => {
    if (!props.sidebarOpen())
      return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape')
        close()
    }
    document.addEventListener('keydown', onKeyDown)
    onCleanup(() => document.removeEventListener('keydown', onKeyDown))
  })

  return (
    <>
      {/* Mobile sidebar */}
      <Show when={props.sidebarOpen()}>
        <div class="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop — click to close */}
          <div
            class="animate-fade-in fixed inset-0 bg-black/50 backdrop-blur-sm"
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
            onClick={close}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ')
                close()
            }}
          />

          {/* Panel */}
          <div class="animate-slide-in fixed inset-y-0 left-0 flex w-80">
            <div class="relative flex w-full flex-col bg-white shadow-2xl ring-1 ring-black/10 dark:bg-slate-800 dark:ring-white/10">
              <div class="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
                <div class="flex h-16 shrink-0 items-center">
                  <Link
                    to="/"
                    onClick={close}
                    class="flex items-center gap-3 transition-opacity hover:opacity-80"
                  >
                    <img
                      src="/android-chrome-192x192.png"
                      alt="Wordle Tracker Logo"
                      width={32}
                      height={32}
                      class="size-8 rounded-sm shadow-sm"
                    />
                    <span class="text-lg font-semibold text-slate-900 dark:text-white">
                      Wordle Tracker
                    </span>
                  </Link>
                </div>
                <NavItems
                  onNavigate={close}
                  activeClass="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                  inactiveClass="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/80"
                  itemClass="group flex gap-x-3 rounded-md p-3 text-sm/6 font-semibold transition-colors duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* Desktop sidebar */}
      <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200 bg-white px-6 pb-4 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <div class="flex h-16 shrink-0 items-center">
            <Link
              to="/"
              class="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <img
                src="/favicon-32x32.png"
                alt="Wordle Tracker Logo"
                width={32}
                height={32}
                class="size-8 rounded-xs shadow-sm"
              />
              <span class="text-lg font-semibold text-slate-900 dark:text-white">
                Wordle Tracker
              </span>
            </Link>
          </div>
          <NavItems
            activeClass="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
            inactiveClass="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
            itemClass="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors duration-200"
          />
        </div>
      </div>
    </>
  )
}
