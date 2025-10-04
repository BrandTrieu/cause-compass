import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const mode = searchParams.get('mode') as 'user' | 'guest' || 'guest'

    console.log('Search query:', q, 'Mode:', mode)

    // Search companies
    const companies = await prisma.company.findMany({
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
        sources: true
      }
    })

    console.log('Found companies:', companies.length)

    // Simple results without complex scoring
    const results = companies.map(company => {
      // Simple score calculation (0.5 for now)
      const score = 0.5

      // Get top tags
      const topTags = company.facts
        .filter(fact => fact.tag)
        .slice(0, 2)
        .map(fact => ({
          tagKey: fact.tag.key,
          stance: fact.stance,
          confidence: fact.confidence
        }))

      // Get top sources
      const topSources = company.sources
        .slice(0, 3)
        .map(source => ({
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

    // Sort by name for now
    results.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search companies', details: error.message },
      { status: 500 }
    )
  }
}
