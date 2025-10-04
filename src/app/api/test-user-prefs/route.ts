import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { companyScore, type Prefs, type Fact } from '@/lib/db/scoring'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || 'Nike'

    // Test with different user preferences
    const testPrefs: Prefs = {
      lgbtq: 0.1,           // Low weight
      child_labour: 0.9,    // High weight
      data_privacy: 0.3,    // Medium weight
      animal_cruelty: 0.8,  // High weight
      free_palestine: 0.2,  // Low weight
      russia_ukraine: 0.4,  // Medium weight
      ethical_sourcing: 0.9, // High weight
      feminism_workplace: 0.6, // Medium-high weight
      environmentally_friendly: 0.7 // High weight
    }

    console.log('Testing with custom preferences:', testPrefs)

    // Search for Nike with facts
    const companies = await prisma.company.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive'
        }
      },
      include: {
        facts: {
          include: { tag: true }
        }
      }
    })

    console.log('Found companies:', companies.length)

    if (companies.length === 0) {
      return NextResponse.json({ error: 'No companies found' })
    }

    // Calculate scores with custom preferences
    const results = companies.map((company: any) => {
      const facts: Fact[] = company.facts.map((fact: any) => ({
        tagKey: fact.tag.key,
        stance: fact.stance,
        confidence: fact.confidence
      }))

      const score = companyScore(testPrefs, facts)
      console.log(`Company: ${company.name}, Score with custom prefs: ${score}`)

      return {
        id: company.id,
        name: company.name,
        score: score,
        facts: facts.map(f => ({ tagKey: f.tagKey, stance: f.stance, confidence: f.confidence }))
      }
    })

    return NextResponse.json({
      message: 'Testing with custom user preferences',
      preferences: testPrefs,
      results: results
    })

  } catch (error: unknown) {
    console.error('Test error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to test preferences', details: errorMessage },
      { status: 500 }
    )
  }
}
