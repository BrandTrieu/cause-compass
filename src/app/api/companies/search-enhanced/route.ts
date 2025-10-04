import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { companyScore, defaultGuestPrefs, type Prefs, type Fact } from '@/lib/db/scoring'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const mode = searchParams.get('mode') as 'user' | 'guest' || 'guest'

    console.log('Enhanced search for:', q, 'Mode:', mode)

    // Get user preferences
    let prefs: Prefs = defaultGuestPrefs

    // First, get companies without relations to avoid issues
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } }
        ]
      }
    })

    console.log('Found companies:', companies.length)

    // For each company, try to get additional data
    const results = []
    
    for (const company of companies) {
      try {
        // Try to get facts for this company
        let facts = []
        try {
          facts = await prisma.companyTagFact.findMany({
            where: { companyId: company.id },
            include: { tag: true }
          })
        } catch (factError) {
          console.log(`Could not get facts for ${company.name}:`, factError.message)
        }

        // Try to get sources for this company
        let sources = []
        try {
          sources = await prisma.source.findMany({
            where: { companyId: company.id },
            orderBy: [
              { reliability: 'desc' },
              { publishedAt: 'desc' }
            ],
            take: 3
          })
        } catch (sourceError) {
          console.log(`Could not get sources for ${company.name}:`, sourceError.message)
        }

        // Convert facts to the format expected by scoring
        const factsForScoring: Fact[] = facts
          .filter(fact => fact.tag) // Only include facts with valid tags
          .map(fact => ({
            tagKey: fact.tag!.key,
            stance: fact.stance,
            confidence: fact.confidence
          }))

        const score = companyScore(prefs, factsForScoring)

        // Get top tags for this company
        const topTags = facts
          .filter(fact => fact.tag) // Only include facts with valid tags
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 2)
          .map(fact => ({
            tagKey: fact.tag!.key,
            stance: fact.stance,
            confidence: fact.confidence
          }))

        // Get top sources
        const topSources = sources.map(source => ({
          url: source.url,
          publisher: source.publisher,
          publishedAt: source.publishedAt
        }))

        console.log(`Company ${company.name}: score=${score}, tags=${topTags.length}, sources=${topSources.length}`)

        results.push({
          id: company.id,
          name: company.name,
          category: company.category,
          summary: company.summary,
          score,
          topTags,
          topSources
        })
      } catch (error) {
        console.error(`Error processing company ${company.name}:`, error)
        // Return basic company info if there's an error
        results.push({
          id: company.id,
          name: company.name,
          category: company.category,
          summary: company.summary,
          score: 0,
          topTags: [],
          topSources: []
        })
      }
    }

    // Sort by score
    results.sort((a, b) => b.score - a.score)

    console.log('Returning results:', results.length)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Enhanced search error:', error)
    return NextResponse.json(
      { error: 'Failed to search companies', details: error.message },
      { status: 500 }
    )
  }
}
