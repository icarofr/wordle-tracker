import { HiSolidArrowLeft } from 'solid-icons/hi'
import { For } from 'solid-js'
import { getAvatarUrl } from '~/lib/avatar'

const AVATAR_COUNT = 25
const AVATAR_IDS = Array.from({ length: AVATAR_COUNT }, (_, i) =>
  String(i + 1).padStart(2, '0'))

interface AvatarSelectorProps {
  currentAvatar: string
  onSelect: (avatarId: string) => void
  onBack: () => void
}

export function AvatarSelector(props: AvatarSelectorProps) {
  return (
    <div>
      <div class="flex items-center justify-between border-b border-gray-100 px-3 py-2 dark:border-gray-700">
        <button
          type="button"
          onClick={() => props.onBack()}
          class="rounded-md p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Back to menu"
        >
          <HiSolidArrowLeft class="size-4" />
        </button>
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Choose Avatar
        </p>
        <div class="w-6" />
      </div>
      <div class="grid grid-cols-5 gap-2 p-3">
        <For each={AVATAR_IDS}>
          {id => (
            <button
              type="button"
              onClick={() => props.onSelect(id)}
              class="aspect-square rounded-full transition-transform hover:scale-110 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white focus:outline-none dark:focus:ring-offset-gray-800"
            >
              <img
                loading="lazy"
                decoding="async"
                src={getAvatarUrl(id)}
                alt={`Avatar ${id}`}
                width={48}
                height={48}
                class={`size-full rounded-full border-2 ${
                  props.currentAvatar === id
                    ? 'border-indigo-600'
                    : 'border-transparent'
                }`}
              />
            </button>
          )}
        </For>
      </div>
    </div>
  )
}
