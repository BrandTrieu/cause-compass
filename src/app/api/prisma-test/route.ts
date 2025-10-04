import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Prisma test API called')
    
    // Test basic count
    const count = await prisma.company.count()
    console.log('Company count:', count)
    
    return NextResponse.json({ 
      success: true, 
      companyCount: count 
    })
  } catch (error) {
    console.error('Prisma test error:', error)
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
