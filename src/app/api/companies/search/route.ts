import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { companyScore, defaultGuestPrefs, type Prefs, type Fact } from '@/lib/db/scoring'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const mode = searchParams.get('mode') as 'user' | 'guest' || 'guest'

    // Get user preferences if authenticated
    let prefs: Prefs = defaultGuestPrefs
    if (mode === 'user') {
      try {
        const supabase = createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user?.email) {
          const appUser = await prisma.appUser.findUnique({
            where: { email: user.email }
          })
          
          if (appUser?.prefsJson) {
            prefs = appUser.prefsJson as Prefs
          }
        }
      } catch (error) {
        console.error('Auth error:', error)
        // Fall back to guest mode
      }
    }

    // Search companies
    let companies
    if (q.trim()) {
      companies = await prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } }
          ]
        },
        include: {
          facts: {
            include: { tag: true }
          },
          sources: {
            orderBy: [
              { reliability: 'desc' },
              { publishedAt: 'desc' }
            ],
            take: 3
          }
        }
      })
    } else {
      // Return top companies if no search query
      companies = await prisma.company.findMany({
        include: {
          facts: {
            include: { tag: true }
          },
          sources: {
            orderBy: [
              { reliability: 'desc' },
              { publishedAt: 'desc' }
            ],
            take: 3
          }
        },
        take: 20
      })
    }

    // Calculate scores and format results
    const results = companies.map(company => {
      // Safely map facts, filtering out any with missing tags
      const facts: Fact[] = company.facts
        .filter(fact => fact.tag) // Only include facts with valid tags
        .map(fact => ({
          tagKey: fact.tag!.key,
          stance: fact.stance,
          confidence: fact.confidence
        }))

      const score = companyScore(prefs, facts)

      // Get top tags for this company
      const topTags = company.facts
        .filter(fact => fact.tag) // Only include facts with valid tags
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 2)
        .map(fact => ({
          tagKey: fact.tag!.key,
          stance: fact.stance,
          confidence: fact.confidence
        }))

      // Get top sources
      const topSources = company.sources.map(source => ({
        url: source.url,
        publisher: source.publisher,
        publishedAt: source.publishedAt
      }))

      return {
        id: company.id,
        name: company.name,
        category: company.category,
        summary: company.summary,
        score,
        topTags,
        topSources
      }
    })

    // Sort by score
    results.sort((a, b) => b.score - a.score)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search companies' },
      { status: 500 }
    )
  }
}
