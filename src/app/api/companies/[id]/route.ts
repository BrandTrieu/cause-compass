import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { companyScore, defaultGuestPrefs, type Prefs, type Fact } from '@/lib/db/scoring'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') as 'user' | 'guest' || 'guest'

    // Get user preferences if authenticated
    let prefs: Prefs = defaultGuestPrefs
    if (mode === 'user') {
      try {
        const supabase = await createSupabaseServerClient()
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
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Calculate score
    const facts: Fact[] = company.facts.map(fact => ({
      tagKey: fact.tag.key,
      stance: fact.stance,
      confidence: fact.confidence
    }))

    const score = companyScore(prefs, facts)
    
    console.log(`Company ${company.name} - Mode: ${mode}, Score: ${score}`)
    console.log('User preferences:', prefs)
    console.log('Company facts:', facts)

    // Format facts breakdown
    const breakdown = company.facts.map(fact => ({
      tagKey: fact.tag.key,
      tagName: fact.tag.tag_name,
      stance: fact.stance,
      confidence: fact.confidence,
      notes: fact.notes,
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
        category: alt.category,
        summary: alt.summary,
        logoUrl: alt.logoUrl,
        score: altScore
      }
    })

    // Filter alternatives to only show companies with higher scores
    const betterAlternatives = alternativesWithScores
      .filter(alt => alt.score > score)
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({
      id: company.id,
      name: company.name,
      category: company.category,
      website: company.website,
      summary: company.summary,
      logoUrl: company.logoUrl,
      score,
      breakdown,
      sources: company.sources,
      alternatives: betterAlternatives.slice(0, 5)
    })
  } catch (error) {
    console.error('Company detail error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company details' },
      { status: 500 }
    )
  }
}
