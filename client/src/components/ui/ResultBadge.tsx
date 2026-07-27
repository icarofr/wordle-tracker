export type ResultTone = 'win' | 'loss' | 'tie' | 'waiting' | 'default'

interface ResultBadgeProps {
  tone: string
  size?: 'sm' | 'md'
}

export function normalizeTone(tone: string): ResultTone {
  switch (tone.toLowerCase()) {
    case 'win':
      return 'win'
    case 'loss':
      return 'loss'
    case 'tie':
      return 'tie'
    case 'waiting':
      return 'waiting'
    default:
      return 'default'
  }
}

export function labelForTone(tone: ResultTone) {
  switch (tone) {
    case 'win':
      return 'W'
    case 'loss':
      return 'L'
    case 'tie':
      return 'D'
    case 'waiting':
      return '?'
    case 'default':
      return '#'
  }
}

function classesForTone(tone: ResultTone) {
  switch (tone) {
    case 'win':
      return 'bg-emerald-600 text-white'
    case 'loss':
      return 'bg-rose-600 text-white'
    case 'tie':
      return 'bg-amber-600 text-white'
    case 'waiting':
      return 'bg-sky-600 text-white'
    case 'default':
      return 'bg-gray-600 text-white'
  }
}

export function ResultBadge(props: ResultBadgeProps) {
  const tone = () => normalizeTone(props.tone)
  const sizeClasses = () =>
    props.size === 'md'
      ? 'size-8 text-xs'
      : 'size-7 text-xs'

  return (
    <span
      class={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${sizeClasses()} ${classesForTone(
        tone(),
      )}`}
      aria-label={`Result: ${props.tone}`}
    >
      {labelForTone(tone())}
    </span>
  )
}
