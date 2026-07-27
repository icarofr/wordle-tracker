// Wordle #1 was published on 2021-06-20.
// Each subsequent wordle is +1 day.
const WORDLE_EPOCH = new Date('2021-06-19T00:00:00')

export function wordleIdToDate(wordleId: number): Date {
  const d = new Date(WORDLE_EPOCH)
  d.setDate(d.getDate() + wordleId)
  return d
}

function isToday(date: Date): boolean {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()
  )
}

export function getWordlePlayUrl(wordleId: number): string {
  const date = wordleIdToDate(wordleId)

  if (isToday(date)) {
    return 'https://www.nytimes.com/games/wordle/index.html'
  }

  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `https://wordlereplay.com/?date=${yyyy}-${mm}-${dd}`
}

export function scoreToNumber(score: string): number {
  return score === 'X' ? 7 : Number.parseInt(score, 10) || 0
}

export function scoreLabel(score: string): string {
  return score === 'X' ? 'X/6' : `${score}/6`
}
