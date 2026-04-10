import type { Toast } from '../../lib/toast'
import {
  HiSolidCheckCircle,
  HiSolidExclamationCircle,
  HiSolidInformationCircle,
  HiSolidXMark,
} from 'solid-icons/hi'
import {

  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
} from 'solid-js'
import { removeToast, toasts } from '../../lib/toast'

const toastConfig = {
  success: {
    styles:
      'bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-600 text-green-900 dark:text-green-100',
    icon: HiSolidCheckCircle,
    progress: 'bg-green-500 dark:bg-green-400',
  },
  error: {
    styles:
      'bg-red-100 dark:bg-red-800 border-red-300 dark:border-red-600 text-red-900 dark:text-red-100',
    icon: HiSolidExclamationCircle,
    progress: 'bg-red-500 dark:bg-red-400',
  },
  warning: {
    styles:
      'bg-yellow-100 dark:bg-yellow-800 border-yellow-300 dark:border-yellow-600 text-yellow-900 dark:text-yellow-100',
    icon: HiSolidExclamationCircle,
    progress: 'bg-yellow-500 dark:bg-yellow-400',
  },
  info: {
    styles:
      'bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600 text-blue-900 dark:text-blue-100',
    icon: HiSolidInformationCircle,
    progress: 'bg-blue-500 dark:bg-blue-400',
  },
  default: {
    styles:
      'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100',
    icon: HiSolidInformationCircle,
    progress: 'bg-gray-500 dark:bg-gray-400',
  },
}

function ToastItem(props: { toast: Toast }) {
  const [isClosing, setIsClosing] = createSignal(false)

  let timeoutId: number

  const handleClose = () => {
    setIsClosing(true)
  }

  onMount(() => {
    if (props.toast.duration != null && props.toast.duration > 0) {
      timeoutId = setTimeout(() => {
        handleClose()
      }, props.toast.duration)
    }
  })

  onCleanup(() => {
    clearTimeout(timeoutId)
  })

  const onAnimationEnd = () => {
    if (isClosing()) {
      removeToast(props.toast.id)
    }
  }

  const config = createMemo(() => toastConfig[props.toast.type] || toastConfig.default)

  return (
    <div
      class={`relative flex transform cursor-pointer items-start overflow-hidden rounded-lg border p-4 shadow-lg
        backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]
        ${config().styles}`}
      classList={{ 'toast-exit': isClosing() }}
      role="button"
      tabIndex={0}
      onAnimationEnd={onAnimationEnd}
      onClick={handleClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ')
          handleClose()
      }}
    >
      {props.toast.duration != null && props.toast.duration > 0 && !isClosing() && (
        <div class="absolute inset-x-0 bottom-0 h-1 bg-black/10 dark:bg-white/10">
          <div
            class={`h-full ${config().progress}`}
            style={{
              animation: `shrink-width ${props.toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <div class="mr-3 shrink-0">
        {(() => {
          const Icon = config().icon
          return <Icon class="size-5" />
        })()}
      </div>
      <div class="flex-1 text-sm font-medium">
        {props.toast.message}
        {props.toast.action && (
          <button
            type="button"
            class="ml-2 font-semibold underline transition-opacity hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation()
              props.toast.action!.onClick()
              handleClose()
            }}
          >
            {props.toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label="Close notification"
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
        }}
        class="ml-3 shrink-0 rounded-md p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
      >
        <HiSolidXMark class="size-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  return (
    <div class="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] space-y-2">
      <For each={toasts()}>{toast => <ToastItem toast={toast} />}</For>
    </div>
  )
}
