import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    console.log('Basic search for:', q)

    // Search companies without relations
    const companies = await prisma.company.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' }
      }
    })

    console.log('Found companies:', companies.length)

    // Simple results
    const results = companies.map(company => ({
      id: company.id,
      name: company.name,
      category: company.category,
      summary: company.summary,
      score: 0.5,
      topTags: [],
      topSources: []
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error('Basic search error:', error)
    return NextResponse.json(
      { error: 'Failed to search companies', details: error.message },
      { status: 500 }
    )
  }
}
