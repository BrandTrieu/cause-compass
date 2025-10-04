import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Checking Nike data...')
    
    // Find Nike
    const nike = await prisma.company.findFirst({
      where: { name: 'Nike' }
    })
    
    if (!nike) {
      return NextResponse.json({ error: 'Nike not found' })
    }
    
    console.log('Nike found:', nike.id, nike.name)
    
    // Check facts
    const facts = await prisma.companyTagFact.findMany({
      where: { companyId: nike.id },
      include: { tag: true }
    })
    
    console.log('Facts found:', facts.length)
    
    // Check sources
    const sources = await prisma.source.findMany({
      where: { companyId: nike.id }
    })
    
    console.log('Sources found:', sources.length)
    
    // Check tags
    const tags = await prisma.tag.findMany()
    
    console.log('Total tags in database:', tags.length)
    
    return NextResponse.json({
      nike: {
        id: nike.id,
        name: nike.name,
        category: nike.category
      },
      facts: facts.map(fact => ({
        id: fact.id,
        tagKey: fact.tag?.key || 'NO_TAG',
        stance: fact.stance,
        confidence: fact.confidence
      })),
      sources: sources.map(source => ({
        id: source.id,
        url: source.url,
        publisher: source.publisher
      })),
      totalTags: tags.length
    })
    
  } catch (error) {
    console.error('Check Nike data error:', error)
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
