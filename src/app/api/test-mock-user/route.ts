import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { companyScore, type Prefs, type Fact } from '@/lib/db/scoring'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || 'Nike'

    // Create a mock user with different preferences
    const mockEmail = 'test@example.com'
    const customPrefs: Prefs = {
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

    // Create or update mock user
    const mockUser = await prisma.appUser.upsert({
      where: { email: mockEmail },
      update: { prefsJson: customPrefs },
      create: {
        email: mockEmail,
        prefsJson: customPrefs
      }
    })

    console.log('Mock user created/updated:', mockUser.email)

    // Search for companies
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

    // Calculate scores with both default and custom preferences
    const results = companies.map((company: any) => {
      const facts: Fact[] = company.facts.map((fact: any) => ({
        tagKey: fact.tag.key,
        stance: fact.stance,
        confidence: fact.confidence
      }))

      // Score with default preferences
      const defaultScore = companyScore({
        lgbtq: 0.5,
        child_labour: 0.5,
        data_privacy: 0.5,
        animal_cruelty: 0.5,
        free_palestine: 0.5,
        russia_ukraine: 0.5,
        ethical_sourcing: 0.5,
        feminism_workplace: 0.5,
        environmentally_friendly: 0.5
      }, facts)

      // Score with custom preferences
      const customScore = companyScore(customPrefs, facts)

      console.log(`Company: ${company.name}`)
      console.log(`  Default score: ${defaultScore}`)
      console.log(`  Custom score: ${customScore}`)
      console.log(`  Facts:`, facts)

      return {
        id: company.id,
        name: company.name,
        defaultScore: defaultScore,
        customScore: customScore,
        facts: facts.map(f => ({ tagKey: f.tagKey, stance: f.stance, confidence: f.confidence }))
      }
    })

    return NextResponse.json({
      message: 'Testing with mock user preferences',
      mockUser: { email: mockUser.email, preferences: customPrefs },
      results: results
    })

  } catch (error: unknown) {
    console.error('Test error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to test mock user', details: errorMessage },
      { status: 500 }
    )
  }
}
