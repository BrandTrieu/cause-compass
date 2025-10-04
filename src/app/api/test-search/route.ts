import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Test search API called')
    
    // Test basic connection
    const companyCount = await prisma.company.count()
    console.log(`Total companies: ${companyCount}`)
    
    // Test Nike search
    const nike = await prisma.company.findFirst({
      where: { name: { contains: 'Nike', mode: 'insensitive' } }
    })
    console.log('Nike found:', nike?.name)
    
    return NextResponse.json({ 
      success: true, 
      companyCount,
      nike: nike?.name 
    })
  } catch (error) {
    console.error('Test search error:', error)
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
