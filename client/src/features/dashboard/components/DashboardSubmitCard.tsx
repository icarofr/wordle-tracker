import { HiSolidAdjustmentsVertical } from 'solid-icons/hi'
import { Button } from '~/components/ui/Button'
import { DashboardSectionCard } from './DashboardSectionCard'

interface DashboardSubmitCardProps {
  isPending: boolean
  value: string
  onInput: (value: string) => void
  onSubmit: (event: Event) => void
}

export function DashboardSubmitCard(props: DashboardSubmitCardProps) {
  return (
    <DashboardSectionCard
      title="Submit Your Wordle"
      subtitle="Paste today's share text and let the rest of the dashboard catch up."
      icon={<HiSolidAdjustmentsVertical class="size-5" />}
    >
      <form onSubmit={e => props.onSubmit(e)} class="space-y-4">
        <textarea
          id="wordle_input"
          placeholder="Paste your Wordle or WordleReplay result here..."
          value={props.value}
          onInput={event => props.onInput(event.currentTarget.value)}
          rows={4}
          class="mt-1 flex min-h-[136px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
        />
        <Button
          type="submit"
          size="lg"
          loading={props.isPending}
          disabled={!props.value.trim()}
          class="w-full justify-center"
        >
          Submit Wordle
        </Button>
        <p class="text-xs/5 text-gray-500 dark:text-gray-400">
          Supports official Wordle and WordleReplay formats. Duplicate
          submissions are blocked automatically.
        </p>
      </form>
    </DashboardSectionCard>
  )
}
