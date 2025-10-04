import { Suspense, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ScoreBar } from '@/components/ScoreBar'
import { TagBadge } from '@/components/TagBadge'
import { SourceList } from '@/components/SourceList'
import { AlternativeList } from '@/components/AlternativeList'
import { AI_Summary } from '@/components/AI_Summary'
// Define Stance enum locally to avoid import issues
enum Stance {
  supports = 'supports',
  opposes = 'opposes',
  alleged_violation = 'alleged_violation',
  neutral = 'neutral'
}

interface CompanyDetail {
  id: string
  name: string
  category: string
  website?: string
  summary?: string
  logoUrl?: string
  score: number
  breakdown: Array<{
    tagKey: string
    tagName: string
    stance: Stance
    confidence: number
    notes?: string
    sourceUrls: string[]
  }>
  sources: Array<{
    id: string
    url: string
    title?: string
    publisher?: string
    publishedAt?: string
    reliability?: number
    claimExcerpt?: string
  }>
  alternatives: Array<{
    id: string
    name: string
    category: string
    summary?: string
    logoUrl?: string
    score: number
  }>
}

async function getCompanyDetails(id: string, mode: 'user' | 'guest'): Promise<CompanyDetail> {
  const params = new URLSearchParams({ mode })
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/companies/${id}?${params}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    if (response.status === 404) {
      notFound()
    }
    throw new Error('Failed to fetch company details')
  }

  return response.json()
}

const tagMap: Record<string, string> = {
  free_palestine: 'Free Palestine',
  russia_ukraine: 'Russia Ukraine',
  feminism_workplace: 'Feminism/Workplace',
  child_labour: 'Child Labour',
  lgbtq: 'LGBTQ+',
  animal_cruelty: 'Animal Cruelty',
  environmentally_friendly: 'Environment',
  ethical_sourcing: 'Ethical Sourcing',
  data_privacy: 'Data Privacy'
}

// Generate company logo URL or use placeholder
const getCompanyLogo = (companyName: string, logoUrl?: string) => {
  if (logoUrl) return logoUrl
  
  // Generate logo using a service like Clearbit or use initials
  const initials = companyName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&color=fff&size=80&bold=true&format=png`
}

// Check if the logo is an SVG
const isSvgLogo = (url?: string) => {
  if (!url) return false
  return url.includes('.svg') || url.includes('simpleicons.org') || url.includes('worldvectorlogo.com')
}

async function CompanyDetails({ id, mode }: { id: string; mode: 'user' | 'guest' }) {
  try {
    const company = await getCompanyDetails(id, mode)

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/search" className="text-primary hover:text-accent-1">
              ← Back to Search
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Image
                  src={getCompanyLogo(company.name, company.logoUrl)}
                  alt={`${company.name} logo`}
                  width={80}
                  height={80}
                  className="rounded-lg object-contain"
                  unoptimized={isSvgLogo(company.logoUrl)}
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{company.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline">{company.category.toLowerCase()}</Badge>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-accent-1"
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="w-64">
              <ScoreBar score={company.score} />
            </div>
          </div>

          {company.summary && (
            <p className="text-lg text-text-muted mt-4">{company.summary}</p>
          )}
        </div>

        {/* AI Summary */}
        <div className="mb-8">
          <AI_Summary companyId={company.id} mode={mode} />
        </div>

        {/* Per-cause Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Per-Cause Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {company.breakdown.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">
                      {tagMap[item.tagKey] || item.tagName}
                    </h3>
                    <TagBadge
                      tagName=""
                      stance={item.stance}
                      confidence={item.confidence}
                    />
                  </div>
                  
                  {item.notes && (
                    <p className="text-gray-600 mb-3">{item.notes}</p>
                  )}

                  {item.sourceUrls.length > 0 && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-700">Sources:</h4>
                      <ul className="space-y-1">
                        {item.sourceUrls.map((url, urlIndex) => (
                          <li key={urlIndex}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              {typeof window !== 'undefined' ? new URL(url).hostname : url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sources */}
        {company.sources.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Additional Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <SourceList sources={company.sources} />
            </CardContent>
          </Card>
        )}

        {/* Alternatives */}
        {company.alternatives.length > 0 && (
          <AlternativeList alternatives={company.alternatives} />
        )}
      </div>
    )
  } catch {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-accent-2">Error loading company</h2>
            <p className="text-text-muted mb-6">
              Something went wrong while loading the company details. Please try again.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload()
                }
              }}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/search'
                }
              }}>
                Back to Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="h-12 bg-border rounded w-1/4 animate-pulse"></div>
        <div className="h-8 bg-border rounded w-1/2 animate-pulse"></div>
        <div className="h-4 bg-border rounded w-3/4 animate-pulse"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-6 bg-border rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-border rounded w-full animate-pulse"></div>
            <div className="h-4 bg-border rounded w-2/3 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-border rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-border rounded w-full animate-pulse"></div>
            <div className="h-4 bg-border rounded w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CompanyPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: Promise<{ mode?: string }>
}) {
  const resolvedSearchParams = use(searchParams)
  const mode = (resolvedSearchParams.mode as 'user' | 'guest') || 'guest'

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CompanyDetails id={params.id} mode={mode} />
    </Suspense>
  )
}
