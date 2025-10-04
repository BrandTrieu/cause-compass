import { Suspense, use } from 'react'
import { CompanyCard } from '@/components/CompanyCard'
import { Card, CardContent } from '@/components/ui/Card'
import { SearchErrorHandler } from '@/components/SearchErrorHandler'
// Define Stance enum locally to avoid import issues
enum Stance {
  supports = 'supports',
  opposes = 'opposes',
  alleged_violation = 'alleged_violation',
  neutral = 'neutral'
}

interface SearchResult {
  id: string
  name: string
  category: string
  summary?: string
  score: number
  topTags: Array<{
    tagKey: string
    stance: Stance
    confidence: number
  }>
  topSources: Array<{
    url: string
    publisher?: string
    publishedAt?: string
  }>
}

async function getSearchResults(query: string, mode: 'user' | 'guest'): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    mode
  })

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/companies/search?${params}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch search results')
  }

  return response.json()
}

async function SearchResults({ query, mode }: { query: string; mode: 'user' | 'guest' }) {
  try {
    const results = await getSearchResults(query, mode)

    if (results.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2 text-foreground">No companies found</h3>
          <p className="text-text-muted mb-4">
              Try searching for a different company name or browse our database.
            </p>
            <SearchErrorHandler variant="home" />
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">
            {query ? `Results for "${query}"` : 'All Companies'}
          </h2>
          <div className="text-sm text-text-muted">
            {mode === 'user' ? 'Personalized to your values' : 'Based on overall ethicality'}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {results.map((company) => (
            <CompanyCard
              key={company.id}
              id={company.id}
              name={company.name}
              category={company.category}
              summary={company.summary}
              score={company.score}
              topTags={company.topTags}
              topSources={company.topSources}
            />
          ))}
        </div>
      </div>
    )
  } catch {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2 text-accent-2">Error loading results</h3>
          <p className="text-text-muted mb-4">
            Something went wrong while searching. Please try again.
          </p>
          <SearchErrorHandler />
        </CardContent>
      </Card>
    )
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-border rounded w-64 animate-pulse"></div>
        <div className="h-4 bg-border rounded w-48 animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-border rounded w-1/3 animate-pulse"></div>
                <div className="h-4 bg-border rounded w-full animate-pulse"></div>
                <div className="h-4 bg-border rounded w-2/3 animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-border rounded w-20 animate-pulse"></div>
                  <div className="h-6 bg-border rounded w-24 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: string }>
}) {
  const params = use(searchParams)
  const query = params.q || ''
  const mode = (params.mode as 'user' | 'guest') || 'guest'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <SearchResults query={query} mode={mode} />
      </Suspense>
    </div>
  )
}
