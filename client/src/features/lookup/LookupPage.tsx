import type { JSX } from 'solid-js'
import { HiSolidCursorArrowRays } from 'solid-icons/hi'
import { Show } from 'solid-js'
import { PageHeader } from '~/components/ui/PageHeader'
import { LookupSidebar } from './components/LookupSidebar'
import { WordleDetails } from './components/WordleDetails'
import { useLookupPageData } from './hooks/useLookupPageData'

function MainContent(props: { children: JSX.Element }) {
  return (
    <main class="min-h-128 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-8 lg:h-[calc(100vh-14rem)] lg:overflow-y-auto dark:border-gray-700 dark:bg-gray-800">
      {props.children}
    </main>
  )
}

function NoWordleSelected() {
  return (
    <div class="flex h-full flex-col items-center justify-center p-8 text-center">
      <HiSolidCursorArrowRays class="mb-4 size-16 text-gray-300 dark:text-gray-600" />
      <h3 class="text-xl font-medium text-gray-800 dark:text-gray-200">
        Select a Wordle
      </h3>
      <p class="mt-2 text-gray-500 dark:text-gray-400">
        Choose a game from the archive to see the cohort summary.
      </p>
    </div>
  )
}

export function LookupPage() {
  const pageData = useLookupPageData()

  return (
    <div class="container mx-auto px-4 py-8">
      <PageHeader
        title="Wordle Archive"
        subtitle="Browse every tracked Wordle and open the full cohort view for any puzzle."
      />

      <div class="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <div
          class="min-h-0 lg:h-[calc(100vh-14rem)]"
          classList={{
            'hidden':
              !pageData.isBrowsingArchive() && !!pageData.selectedWordleId(),
            'lg:block': true,
          }}
        >
          <LookupSidebar
            wordles={pageData.archiveItems()}
            isLoaded={pageData.isLoaded()}
            selectedWordleId={pageData.selectedWordleId()}
            onSelectWordle={pageData.selectWordle}
          />
        </div>

        <div
          class="min-h-0"
          classList={{
            'hidden':
              pageData.isBrowsingArchive() || !pageData.selectedWordleId(),
            'lg:block': true,
          }}
        >
          <MainContent>
            <Show
              when={pageData.selectedWordleId()}
              fallback={<NoWordleSelected />}
            >
              {id => (
                <WordleDetails
                  wordleId={id()}
                  data={pageData.wordleDetail.data}
                  onRetry={() => { void pageData.wordleDetail.refetch() }}
                  onBackToArchive={pageData.showArchiveList}
                />
              )}
            </Show>
          </MainContent>
        </div>
      </div>
    </div>
  )
}
