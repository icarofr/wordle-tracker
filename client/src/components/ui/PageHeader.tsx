interface PageHeaderProps {
  title: string
  subtitle: string
}

export function PageHeader(props: PageHeaderProps) {
  return (
    <div class="mb-6 text-center">
      <h1 class="mb-1 text-3xl font-bold text-gray-900 dark:text-white">
        {props.title}
      </h1>
      <p class="text-sm text-gray-600 dark:text-gray-400">{props.subtitle}</p>
    </div>
  )
}
