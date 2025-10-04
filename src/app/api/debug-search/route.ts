import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { companyScore, defaultGuestPrefs, type Prefs, type Fact } from '@/lib/db/scoring'

export async function GET(request: NextRequest) {
  try {
    console.log('Debug search API called')
    
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const mode = searchParams.get('mode') as 'user' | 'guest' || 'guest'
    
    console.log('Query:', q, 'Mode:', mode)
    
    // Test the search query
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
        sources: {
          orderBy: [
            { reliability: 'desc' },
            { publishedAt: 'desc' }
          ],
          take: 3
        }
      }
    })
    
    console.log('Found companies:', companies.length)
    
    if (companies.length === 0) {
      return NextResponse.json({ message: 'No companies found', companies: [] })
    }
    
    // Test scoring for first company
    const company = companies[0]
    console.log('Testing company:', company.name)
    
    const facts: Fact[] = company.facts.map(fact => ({
      tagKey: fact.tag.key,
      stance: fact.stance,
      confidence: fact.confidence
    }))
    
    console.log('Facts:', facts)
    
    const prefs: Prefs = defaultGuestPrefs
    console.log('Prefs:', prefs)
    
    const score = companyScore(prefs, facts)
    console.log('Score:', score)
    
    return NextResponse.json({ 
      success: true,
      companiesFound: companies.length,
      firstCompany: {
        name: company.name,
        facts: facts,
        score: score
      }
    })
    
  } catch (error) {
    console.error('Debug search error:', error)
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
