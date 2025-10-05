import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { companyScore, defaultGuestPrefs, type Prefs, type Fact } from '@/lib/db/scoring'
import { createSupabaseServerClientFromRequest } from '@/lib/supabase/server'
import { Category } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    console.log('Basic search for:', q)

    // Get user preferences
    let prefs: Prefs = defaultGuestPrefs
    const mode = searchParams.get('mode') as 'user' | 'guest' || 'guest'
    
    if (mode === 'user') {
      try {
        const supabase = await createSupabaseServerClientFromRequest(request)
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user?.email) {
          const appUser = await prisma.appUser.findUnique({
            where: { email: user.email }
          })
          
          if (appUser?.prefsJson) {
            prefs = appUser.prefsJson as Prefs
            console.log('Using user preferences:', prefs)
          } else {
            console.log('No user preferences found, using defaults')
          }
        }
      } catch (error) {
        console.error('Auth error:', error)
        // Fall back to guest mode
      }
    }

    // Search companies with their facts for real scoring
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          {
            name: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            category: {
              in: [
                'RESTAURANT', 'APPAREL', 'GROCERY', 'TECH', 'FINANCE', 'OTHER'
              ].filter(cat => cat.toLowerCase().includes(q.toLowerCase())) as Category[]
            }
          }
        ]
      },
      include: {
        facts: {
          include: { tag: true }
        }
      }
    })

    console.log('Found companies:', companies.length)

    // Calculate real scores using the same logic as company page
    const results = companies.map((company) => {
      // Convert facts to the format expected by companyScore
      const facts: Fact[] = company.facts.map((fact) => ({
        tagKey: fact.tag.key,
        stance: fact.stance,
        confidence: fact.confidence
      }))

      // Calculate real score
      const score = companyScore(prefs, facts)

      // Get top tags (sorted by confidence)
      const topTags = company.facts
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3)
        .map((fact) => ({
          tagKey: fact.tag.key,
          stance: fact.stance,
          confidence: fact.confidence
        }))

      // Get sources (mock for now, but could be real)
      const topSources = [
        {
          url: 'https://example.com/source',
          publisher: 'Ethical Review',
          publishedAt: '2024-01-01'
        }
      ]

      return {
        id: company.id,
        name: company.name,
        category: company.category,
        summary: company.summary,
        logoUrl: company.logoUrl,
        score,
        topTags,
        topSources
      }
    })

    // If we found companies, also get related companies from the same categories
    if (results.length > 0 && q.trim()) {
      const categories = [...new Set(results.map((r) => r.category))]
      
      for (const category of categories) {
        const relatedCompanies = await prisma.company.findMany({
          where: {
            category: category,
            NOT: {
              name: {
                contains: q,
                mode: 'insensitive'
              }
            }
          },
          include: {
            facts: {
              include: { tag: true }
            }
          },
          take: 3 // Limit to 3 related companies per category
        })

        // Add related companies with real scoring
        for (const company of relatedCompanies) {
          // Convert facts to the format expected by companyScore
          const facts: Fact[] = company.facts.map((fact) => ({
            tagKey: fact.tag.key,
            stance: fact.stance,
            confidence: fact.confidence
          }))

          // Calculate real score
          const score = companyScore(prefs, facts)

          // Get top tags (sorted by confidence)
          const topTags = company.facts
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3)
            .map((fact) => ({
              tagKey: fact.tag.key,
              stance: fact.stance,
              confidence: fact.confidence
            }))

          // Get sources (mock for now, but could be real)
          const topSources = [
            {
              url: 'https://example.com/related-source',
              publisher: 'Industry Review',
              publishedAt: '2024-01-01'
            }
          ]

          results.push({
            id: company.id,
            name: company.name,
            category: company.category,
            summary: company.summary,
            logoUrl: company.logoUrl,
            score,
            topTags,
            topSources
          })
        }
      }
    }

    // Remove duplicates and sort by score (highest first)
    const uniqueResults = results.filter((company, index, self) => 
      index === self.findIndex(c => c.id === company.id)
    )
    uniqueResults.sort((a, b) => b.score - a.score)

    return NextResponse.json(uniqueResults)
  } catch (error: unknown) {
    console.error('Basic search error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to search companies', details: errorMessage },
      { status: 500 }
    )
  }
}
