'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CompanyCard } from '@/components/CompanyCard'
import { Card, CardContent } from '@/components/ui/Card'
import { SearchErrorHandler } from '@/components/SearchErrorHandler'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase/client'

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
  logoUrl?: string
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

  const response = await fetch(`/api/companies/search-basic?${params}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch search results')
  }

  return response.json()
}

function SearchResults({ query, mode }: { query: string; mode: 'user' | 'guest' }) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getSearchResults(query, mode)
        setResults(data)
      } catch (err) {
        console.error('Search error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch results')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query, mode])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2 text-foreground">Error Loading Results</h3>
          <p className="text-text-muted mb-4">
            {error}
          </p>
          <SearchErrorHandler variant="home" />
        </CardContent>
      </Card>
    )
  }

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

  // Separate main results from related companies
  const mainResults = results.filter(company => 
    company.name.toLowerCase().includes(query.toLowerCase())
  )
  const relatedResults = results.filter(company => 
    !company.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          {query ? `Results for "${query}"` : 'All Companies'}
        </h2>
        <div className="text-sm text-text-muted">
          {mode === 'user' ? 'Personalized to your values' : 'Based on overall ethicality'}
        </div>
      </div>

      {/* Main Search Results */}
      {mainResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Direct Matches</h3>
          <div className="grid grid-cols-1 gap-0">
            {mainResults.map((company) => (
              <CompanyCard
                key={company.id}
                id={company.id}
                name={company.name}
                category={company.category}
                summary={company.summary}
                score={company.score}
                logoUrl={company.logoUrl}
                topTags={company.topTags}
                topSources={company.topSources}
              />
            ))}
          </div>
        </div>
      )}

      {/* Related Companies */}
      {relatedResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Related Companies</h3>
          <div className="grid grid-cols-1 gap-0">
            {relatedResults.map((company) => (
              <CompanyCard
                key={company.id}
                id={company.id}
                name={company.name}
                category={company.category}
                summary={company.summary}
                score={company.score}
                logoUrl={company.logoUrl}
                topTags={company.topTags}
                topSources={company.topSources}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SearchBar({ initialQuery }: { initialQuery: string }) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="max-w-2xl">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search for a company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          />
          <Button type="submit" size="lg">
            Search
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function SearchPageClient({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: string }>
}) {
  const params = use(searchParams)
  const query = params.q || ''
  const [mode, setMode] = useState<'user' | 'guest'>('guest')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setMode('user')
        } else {
          setMode('guest')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setMode('guest')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SearchBar initialQuery={query} />
      <SearchResults query={query} mode={mode} />
    </div>
  )
}
