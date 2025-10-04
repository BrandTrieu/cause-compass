import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test basic company query without relations
    const companies = await prisma.company.findMany({
      where: {
        name: { contains: 'Nike', mode: 'insensitive' }
      }
    })
    
    console.log('Found companies:', companies.length)
    
    if (companies.length === 0) {
      return NextResponse.json({ message: 'No Nike found in database' })
    }
    
    const nike = companies[0]
    console.log('Nike found:', nike.name, nike.category)
    
    // Test relations separately
    try {
      const facts = await prisma.fact.findMany({
        where: { companyId: nike.id },
        include: { tag: true }
      })
      console.log('Facts found:', facts.length)
      
      const sources = await prisma.source.findMany({
        where: { companyId: nike.id }
      })
      console.log('Sources found:', sources.length)
      
      return NextResponse.json({
        success: true,
        company: {
          id: nike.id,
          name: nike.name,
          category: nike.category,
          summary: nike.summary
        },
        facts: facts.length,
        sources: sources.length
      })
      
    } catch (relationError) {
      console.error('Relation error:', relationError)
      return NextResponse.json({
        success: true,
        company: {
          id: nike.id,
          name: nike.name,
          category: nike.category,
          summary: nike.summary
        },
        relationError: relationError.message
      })
    }
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
