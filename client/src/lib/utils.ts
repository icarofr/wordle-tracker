export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale: string = 'en-US',
): string {
  if (!date)
    return '\u2014'
  const d = new Date(date)
  if (Number.isNaN(d.getTime()) || d.getFullYear() < 2000)
    return '\u2014'
  return d.toLocaleDateString(
    locale,
    options ?? {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  )
}

export function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
