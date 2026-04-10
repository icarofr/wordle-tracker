import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'

interface CheckboxProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Checkbox(props: CheckboxProps) {
  const [local, others] = splitProps(props, ['label', 'error', 'class'])

  return (
    <div class="flex items-center space-x-2">
      <input
        {...others}
        type="checkbox"
        class={`size-4 rounded-sm border-gray-300 bg-white text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 ${
          local.class || ''
        }`}
      />
      {local.label && (
        <label
          for={others.id}
          class="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          {local.label}
        </label>
      )}
      {local.error && (
        <p class="text-sm text-red-600 dark:text-red-400">{local.error}</p>
      )}
    </div>
  )
}
