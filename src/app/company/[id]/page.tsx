import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ScoreBar } from '@/components/ScoreBar'
import { TagBadge } from '@/components/TagBadge'
import { AlternativeList } from '@/components/AlternativeList'
import { FeedbackForm } from '@/components/FeedbackForm'
import { AI_Summary } from '@/components/AI_Summary'
import { ErrorHandler } from './ErrorHandler'
import CompanyPageClient from './CompanyPageClient'
import { prisma } from '@/lib/db/prisma'
import { companyScore, defaultGuestPrefs, type Prefs, type Fact } from '@/lib/db/scoring'
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
    title: string | null
    companyId: string | null
    tagId: string | null
    url: string
    publisher: string | null
    publishedAt: Date | null
    reliability: number | null
    claimExcerpt: string | null
    createdAt: Date
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

async function getCompanyDetails(id: string): Promise<CompanyDetail> {
  // Use default guest preferences for now
  // User authentication in server components can be enhanced later
  const prefs: Prefs = defaultGuestPrefs

  // Fetch company with all related data
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      facts: {
        include: { tag: true }
      },
      sources: {
        orderBy: [
          { reliability: 'desc' },
          { publishedAt: 'desc' }
        ],
        take: 5
      }
    }
  })

  if (!company) {
    notFound()
  }

  // Calculate score
  const facts: Fact[] = company.facts.map(fact => ({
    tagKey: fact.tag.key,
    stance: fact.stance,
    confidence: fact.confidence
  }))

  const score = companyScore(prefs, facts)

  // Format facts breakdown
  const breakdown = company.facts.map(fact => ({
    tagKey: fact.tag.key,
    tagName: fact.tag.tag_name,
    stance: fact.stance as Stance,
    confidence: fact.confidence,
    notes: fact.notes || undefined,
    sourceUrls: fact.sourceUrls
  }))

  // Get alternatives (same category, different company, sorted by score)
  const alternatives = await prisma.company.findMany({
    where: {
      category: company.category,
      id: { not: company.id }
    },
    include: {
      facts: {
        include: { tag: true }
      }
    },
    take: 5
  })

  const alternativesWithScores = alternatives.map(alt => {
    const altFacts: Fact[] = alt.facts.map(fact => ({
      tagKey: fact.tag.key,
      stance: fact.stance,
      confidence: fact.confidence
    }))
    
    const altScore = companyScore(prefs, altFacts)
    
    return {
      id: alt.id,
      name: alt.name,
      category: alt.category as string,
      summary: alt.summary || undefined,
      logoUrl: alt.logoUrl || undefined,
      score: altScore
    }
  })

  // Filter alternatives to only show companies with higher scores
  const betterAlternatives = alternativesWithScores
    .filter(alt => alt.score > score)
    .sort((a, b) => b.score - a.score)

  return {
    id: company.id,
    name: company.name,
    category: company.category,
    website: company.website || undefined,
    summary: company.summary || undefined,
    logoUrl: company.logoUrl || undefined,
    score,
    breakdown,
    sources: company.sources,
    alternatives: betterAlternatives.slice(0, 5)
  }
}

const tagMap: Record<string, string> = {
  free_palestine: 'Free Palestine',
  justice_for_ukraine: 'Justice for Ukraine',
  women_workplace: 'Women in the Workplace',
  child_labour: 'Against Child Labour',
  lgbtq: 'LGBTQ Rights',
  animal_cruelty: 'Against Animal Cruelty',
  environmentally_friendly: 'Environment',
  ethical_sourcing: 'Ethical Sourcing',
  data_privacy: 'Data Privacy'
}


// Generate company logo URL or use placeholder
const getCompanyLogo = (companyName: string, logoUrl?: string) => {
  if (logoUrl) return logoUrl
  
    // Generate logo using a service like Clearbit or use initials
    // const initials = companyName
    //   .split(' ')
    //   .map(word => word[0])
    //   .join('')
    //   .toUpperCase()
    //   .slice(0, 2)
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&color=fff&size=80&bold=true&format=png`
}

// Check if the logo is an SVG
const isSvgLogo = (url?: string) => {
  if (!url) return false
  return url.includes('.svg') || url.includes('simpleicons.org') || url.includes('worldvectorlogo.com')
}

async function CompanyDetails({ id, mode }: { id: string; mode: 'user' | 'guest' }) {
  try {
    const company = await getCompanyDetails(id)

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
              <div className="mt-2 text-center">
                <div className="text-sm font-medium text-text-muted">
                  {mode === 'user' ? '✨ Personalized to your values' : '📊 Based on overall ethicality'}
                </div>
                <div className="text-sm text-text-muted mt-1">
                </div>
              </div>
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
                      tagName={tagMap[item.tagKey] || item.tagName}
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
                              {url.replace(/^https?:\/\//, '').split('/')[0]}
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

        {/* {company.sources.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Additional Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <SourceList sources={company.sources} />
            </CardContent>
          </Card>
        )} */}

        {/* Alternatives */}
        {company.alternatives.length > 0 && (
          <AlternativeList alternatives={company.alternatives} />
        )}
        {/* Feedback Form */}
        <div className="mt-8">
          <FeedbackForm companyId={company.id} />
        </div>

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
              <ErrorHandler />
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

export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const mode = (resolvedSearchParams.mode as 'user' | 'guest') || 'guest'
  
  // If no mode parameter, show the client component to detect auth
  if (!resolvedSearchParams.mode) {
    return <CompanyPageClient id={resolvedParams.id} />
  }

  // If mode is provided, show the server component directly
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CompanyDetails id={resolvedParams.id} mode={mode} />
    </Suspense>
  )
}
