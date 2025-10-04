import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateSummary } from '@/lib/ai/gemini'
import { defaultGuestPrefs, type Prefs } from '@/lib/db/scoring'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds

function getRateLimitKey(request: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return ip
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(key)

  if (!limit) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (limit.count >= RATE_LIMIT) {
    return true
  }

  limit.count++
  return false
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitKey = getRateLimitKey(request)
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { companyId, mode } = body

    if (!companyId || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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

    // Fetch company data
    const company = await prisma.company.findUnique({
      where: { id: companyId },
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

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        paragraph: `${company.name} is a ${company.category.toLowerCase()} company. ${company.summary || 'No additional information available.'}`
      })
    }

    // Generate AI summary
    const paragraph = await generateSummary({
      company,
      facts: company.facts,
      sources: company.sources,
      prefs,
      mode
    })

    return NextResponse.json({ paragraph })
  } catch (error) {
    console.error('AI summary error:', error)
    
    // Return fallback summary on error
    try {
      const { companyId } = await request.json()
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      })
      
      if (company) {
        return NextResponse.json({
          paragraph: `${company.name} is a ${company.category.toLowerCase()} company. ${company.summary || 'We encountered an issue generating a detailed summary, but you can explore the company details below.'}`
        })
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError)
    }

    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
