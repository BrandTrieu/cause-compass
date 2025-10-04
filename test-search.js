const { PrismaClient } = require('@prisma/client')

async function testSearch() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const companyCount = await prisma.company.count()
    console.log(`Total companies in database: ${companyCount}`)
    
    // Test Nike search
    const nike = await prisma.company.findFirst({
      where: { name: { contains: 'Nike', mode: 'insensitive' } }
    })
    console.log('Nike found:', nike)
    
    // Test with relations
    const nikeWithFacts = await prisma.company.findFirst({
      where: { name: { contains: 'Nike', mode: 'insensitive' } },
      include: {
        facts: { include: { tag: true } },
        sources: true
      }
    })
    console.log('Nike with relations:', JSON.stringify(nikeWithFacts, null, 2))
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSearch()
