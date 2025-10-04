import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    
    console.log('Simple search for:', q)
    
    // Simple search without complex relations
    const companies = await prisma.company.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' }
      }
    })
    
    console.log('Found companies:', companies.length)
    
    // Return simple results
    const results = companies.map(company => ({
      id: company.id,
      name: company.name,
      category: company.category,
      website: company.website,
      summary: company.summary,
      score: 0, // Simple score for now
      topTags: [],
      topSources: []
    }))
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('Simple search error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
