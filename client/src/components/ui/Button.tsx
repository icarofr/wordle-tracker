import type { JSX } from 'solid-js'
import { CgSpinner } from 'solid-icons/cg'
import { mergeProps, splitProps } from 'solid-js'

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
} as const

const SIZES = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
} as const

export function Button(props: ButtonProps) {
  const merged = mergeProps({ variant: 'primary' as const, size: 'md' as const }, props)
  const [local, others] = splitProps(merged, [
    'variant',
    'size',
    'loading',
    'class',
    'children',
  ])

  return (
    <button
      {...others}
      disabled={others.disabled || local.loading}
      class={`relative rounded-md font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
        VARIANTS[local.variant]
      } ${SIZES[local.size]} ${local.class || ''}`}
    >
      {local.loading && (
        <CgSpinner class="absolute top-1/2 left-1/2 size-4 -translate-1/2 animate-spin text-current" />
      )}
      <span class={local.loading ? 'opacity-0' : ''}>{local.children}</span>
    </button>
  )
}
