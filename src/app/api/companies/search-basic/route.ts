import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { companyScore, defaultGuestPrefs, type Prefs, type Fact } from '@/lib/db/scoring'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    console.log('Basic search for:', q)

    // Get user preferences (using guest mode for now)
    const prefs: Prefs = defaultGuestPrefs

    // Search companies with their facts for real scoring
    const companies = await prisma.company.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' }
      },
      include: {
        facts: {
          include: { tag: true }
        }
      }
    })

    console.log('Found companies:', companies.length)

    // Calculate real scores using the same logic as company page
    const results = companies.map(company => {
      // Convert facts to the format expected by companyScore
      const facts: Fact[] = company.facts.map(fact => ({
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
        .map(fact => ({
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
        score,
        topTags,
        topSources
      }
    })

    // If we found companies, also get related companies from the same categories
    if (results.length > 0 && q.trim()) {
      const categories = [...new Set(results.map(r => r.category))]
      
      for (const category of categories) {
        const relatedCompanies = await prisma.company.findMany({
          where: {
            category: category as any,
            NOT: {
              name: { contains: q, mode: 'insensitive' }
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
          const facts: Fact[] = company.facts.map(fact => ({
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
            .map(fact => ({
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
            score,
            topTags,
            topSources
          })
        }
      }
    }

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Basic search error:', error)
    return NextResponse.json(
      { error: 'Failed to search companies', details: error.message },
      { status: 500 }
    )
  }
}
