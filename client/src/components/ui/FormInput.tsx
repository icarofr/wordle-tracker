import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FormInput(props: InputProps) {
  const [local, others] = splitProps(props, ['label', 'error', 'class'])

  return (
    <div class="grid gap-2">
      <label
        for={others.id}
        class="block text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        {local.label}
      </label>
      <input
        {...others}
        class={`block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 ${
          local.class || ''
        }`}
      />
      {local.error && (
        <p class="text-sm text-red-600 dark:text-red-400">{local.error}</p>
      )}
    </div>
  )
}
