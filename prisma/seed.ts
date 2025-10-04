import { PrismaClient, Category, Stance } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.source.deleteMany()
  await prisma.companyTagFact.deleteMany()
  await prisma.company.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.appUser.deleteMany()

  // Create Tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        key: 'free_palestine',
        tag_name: 'Free Palestine',
        description: 'Support for Palestinian rights and opposition to Israeli occupation'
      }
    }),
    prisma.tag.create({
      data: {
        key: 'russia_ukraine',
        tag_name: 'Russia Ukraine',
        description: 'Position on Russia-Ukraine conflict and support for Ukraine'
      }
    }),
    prisma.tag.create({
      data: {
        key: 'feminism_workplace',
        tag_name: 'Feminism/Women in the workplace',
        description: 'Gender equality, women\'s rights, and workplace diversity'
      }
    }),
    prisma.tag.create({
      data: {
        key: 'child_labour',
        tag_name: 'Child Labour',
        description: 'Opposition to child labor and support for children\'s rights'
      }
    }),
    prisma.tag.create({
      data: {
        key: 'lgbtq',
        tag_name: 'LGBTQ',
        description: 'Support for LGBTQ+ rights and equality'
      }
    }),
    prisma.tag.create({
      data: {
        key: 'animal_cruelty',
        tag_name: 'Animal Cruelty',
        description: 'Opposition to animal cruelty and support for animal welfare'
      }
    }),
    prisma.tag.create({
      data: {
        key: 'environmentally_friendly',
        tag_name: 'Environmentally Friendly',
        description: 'Environmental sustainability and climate action'
      }
    }),
    prisma.tag.create({
      data: {
        key: 'ethical_sourcing',
        tag_name: 'Ethical Sourcing',
        description: 'Ethical supply chain and fair trade practices'
      }
    }),
    prisma.tag.create({
      data: {
        key: 'data_privacy',
        tag_name: 'Data Privacy',
        description: 'Protection of user data and privacy rights'
      }
    })
  ])

  console.log(`✅ Created ${tags.length} tags`)

  // Create Companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Patagonia',
        category: Category.APPAREL,
        website: 'https://patagonia.com',
        summary: 'Outdoor clothing company known for environmental activism and sustainable practices'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Nike',
        category: Category.APPAREL,
        website: 'https://nike.com',
        summary: 'Global sportswear brand with mixed record on labor practices and social issues'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Apple',
        category: Category.TECH,
        website: 'https://apple.com',
        summary: 'Technology company with strong privacy stance but supply chain concerns'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Meta',
        category: Category.TECH,
        website: 'https://meta.com',
        summary: 'Social media company with significant data privacy controversies'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Whole Foods',
        category: Category.GROCERY,
        website: 'https://wholefoodsmarket.com',
        summary: 'Organic grocery chain owned by Amazon, known for sustainable products'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Walmart',
        category: Category.GROCERY,
        website: 'https://walmart.com',
        summary: 'Retail giant with mixed record on labor rights and environmental practices'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Starbucks',
        category: Category.RESTAURANT,
        website: 'https://starbucks.com',
        summary: 'Coffee chain with progressive social policies but labor disputes'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Chick-fil-A',
        category: Category.RESTAURANT,
        website: 'https://chick-fil-a.com',
        summary: 'Fast food chain with conservative values and LGBTQ+ controversies'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Goldman Sachs',
        category: Category.FINANCE,
        website: 'https://goldmansachs.com',
        summary: 'Investment bank with mixed record on social responsibility'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Ben & Jerry\'s',
        category: Category.GROCERY,
        website: 'https://benjerry.com',
        summary: 'Ice cream company known for progressive social activism'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Tesla',
        category: Category.TECH,
        website: 'https://tesla.com',
        summary: 'Electric vehicle company with environmental focus but labor concerns'
      }
    }),
    prisma.company.create({
      data: {
        name: 'H&M',
        category: Category.APPAREL,
        website: 'https://hm.com',
        summary: 'Fast fashion retailer with sustainability initiatives but labor issues'
      }
    })
  ])

  console.log(`✅ Created ${companies.length} companies`)

  // Create CompanyTagFacts
  const facts = [
    // Patagonia - mostly positive
    { company: 'Patagonia', tag: 'environmentally_friendly', stance: Stance.supports, confidence: 0.95, notes: '1% for the Planet founder, carbon neutral operations' },
    { company: 'Patagonia', tag: 'ethical_sourcing', stance: Stance.supports, confidence: 0.9, notes: 'Fair Trade Certified products, supply chain transparency' },
    { company: 'Patagonia', tag: 'lgbtq', stance: Stance.supports, confidence: 0.85, notes: 'Progressive workplace policies and public support' },
    { company: 'Patagonia', tag: 'feminism_workplace', stance: Stance.supports, confidence: 0.8, notes: 'Gender equality initiatives and women in leadership' },

    // Nike - mixed
    { company: 'Nike', tag: 'child_labour', stance: Stance.alleged_violation, confidence: 0.7, notes: 'Past controversies with supplier factories' },
    { company: 'Nike', tag: 'feminism_workplace', stance: Stance.supports, confidence: 0.8, notes: 'Strong support for women athletes and employees' },
    { company: 'Nike', tag: 'environmentally_friendly', stance: Stance.supports, confidence: 0.6, notes: 'Sustainability initiatives but still room for improvement' },

    // Apple - mixed
    { company: 'Apple', tag: 'data_privacy', stance: Stance.supports, confidence: 0.9, notes: 'Strong privacy stance, end-to-end encryption' },
    { company: 'Apple', tag: 'child_labour', stance: Stance.alleged_violation, confidence: 0.6, notes: 'Supplier audits but ongoing concerns' },
    { company: 'Apple', tag: 'environmentally_friendly', stance: Stance.supports, confidence: 0.7, notes: 'Carbon neutral goals and renewable energy' },

    // Meta - mostly negative
    { company: 'Meta', tag: 'data_privacy', stance: Stance.opposes, confidence: 0.9, notes: 'Multiple privacy scandals and data misuse' },
    { company: 'Meta', tag: 'lgbtq', stance: Stance.supports, confidence: 0.7, notes: 'Public support but platform moderation issues' },

    // Whole Foods - mixed
    { company: 'Whole Foods', tag: 'environmentally_friendly', stance: Stance.supports, confidence: 0.8, notes: 'Organic focus and sustainability initiatives' },
    { company: 'Whole Foods', tag: 'ethical_sourcing', stance: Stance.supports, confidence: 0.7, notes: 'Local sourcing and fair trade products' },

    // Walmart - mostly negative
    { company: 'Walmart', tag: 'child_labour', stance: Stance.alleged_violation, confidence: 0.6, notes: 'Supplier monitoring but ongoing issues' },
    { company: 'Walmart', tag: 'feminism_workplace', stance: Stance.opposes, confidence: 0.7, notes: 'Gender discrimination lawsuits and pay gaps' },
    { company: 'Walmart', tag: 'environmentally_friendly', stance: Stance.opposes, confidence: 0.6, notes: 'Limited environmental initiatives' },

    // Starbucks - mixed
    { company: 'Starbucks', tag: 'lgbtq', stance: Stance.supports, confidence: 0.9, notes: 'Strong public support and inclusive policies' },
    { company: 'Starbucks', tag: 'feminism_workplace', stance: Stance.supports, confidence: 0.8, notes: 'Women in leadership and equal pay initiatives' },
    { company: 'Starbucks', tag: 'ethical_sourcing', stance: Stance.supports, confidence: 0.7, notes: 'Fair trade coffee and ethical sourcing' },

    // Chick-fil-A - mostly negative
    { company: 'Chick-fil-A', tag: 'lgbtq', stance: Stance.opposes, confidence: 0.9, notes: 'Historical donations to anti-LGBTQ organizations' },
    { company: 'Chick-fil-A', tag: 'feminism_workplace', stance: Stance.opposes, confidence: 0.7, notes: 'Conservative values and limited diversity' },

    // Goldman Sachs - mixed
    { company: 'Goldman Sachs', tag: 'feminism_workplace', stance: Stance.supports, confidence: 0.6, notes: 'Diversity initiatives but still male-dominated' },
    { company: 'Goldman Sachs', tag: 'environmentally_friendly', stance: Stance.opposes, confidence: 0.7, notes: 'Fossil fuel investments and limited green finance' },

    // Ben & Jerry's - mostly positive
    { company: 'Ben & Jerry\'s', tag: 'lgbtq', stance: Stance.supports, confidence: 0.95, notes: 'Long history of LGBTQ+ support and activism' },
    { company: 'Ben & Jerry\'s', tag: 'environmentally_friendly', stance: Stance.supports, confidence: 0.9, notes: 'Climate justice advocacy and sustainable practices' },
    { company: 'Ben & Jerry\'s', tag: 'ethical_sourcing', stance: Stance.supports, confidence: 0.85, notes: 'Fair trade ingredients and social justice' },

    // Tesla - mixed
    { company: 'Tesla', tag: 'environmentally_friendly', stance: Stance.supports, confidence: 0.9, notes: 'Electric vehicles and renewable energy' },
    { company: 'Tesla', tag: 'feminism_workplace', stance: Stance.opposes, confidence: 0.7, notes: 'Workplace discrimination allegations' },

    // H&M - mixed
    { company: 'H&M', tag: 'child_labour', stance: Stance.alleged_violation, confidence: 0.6, notes: 'Supplier monitoring but ongoing concerns' },
    { company: 'H&M', tag: 'environmentally_friendly', stance: Stance.supports, confidence: 0.7, notes: 'Sustainability initiatives and recycling programs' }
  ]

  for (const fact of facts) {
    const company = companies.find(c => c.name === fact.company)
    const tag = tags.find(t => t.key === fact.tag)
    
    if (company && tag) {
      await prisma.companyTagFact.create({
        data: {
          companyId: company.id,
          tagId: tag.id,
          stance: fact.stance,
          confidence: fact.confidence,
          notes: fact.notes,
          sourceUrls: [`https://example.com/source-${uuidv4()}`],
          lastVerifiedAt: new Date()
        }
      })
    }
  }

  console.log(`✅ Created ${facts.length} company tag facts`)

  // Create Sources
  const sources = [
    // Patagonia sources
    { company: 'Patagonia', tag: 'environmentally_friendly', url: 'https://patagonia.com/our-footprint', title: 'Patagonia Environmental Impact Report', publisher: 'Patagonia', publishedAt: new Date('2024-01-15'), reliability: 0.9 },
    { company: 'Patagonia', tag: 'ethical_sourcing', url: 'https://patagonia.com/fair-trade', title: 'Fair Trade Certified Products', publisher: 'Patagonia', publishedAt: new Date('2024-02-01'), reliability: 0.85 },
    
    // Nike sources
    { company: 'Nike', tag: 'child_labour', url: 'https://purpose.nike.com/supply-chain', title: 'Nike Supply Chain Transparency', publisher: 'Nike', publishedAt: new Date('2024-01-20'), reliability: 0.7 },
    { company: 'Nike', tag: 'feminism_workplace', url: 'https://news.nike.com/women', title: 'Nike Women\'s Initiatives', publisher: 'Nike News', publishedAt: new Date('2024-02-10'), reliability: 0.8 },
    
    // Apple sources
    { company: 'Apple', tag: 'data_privacy', url: 'https://apple.com/privacy', title: 'Apple Privacy Policy', publisher: 'Apple', publishedAt: new Date('2024-01-25'), reliability: 0.9 },
    { company: 'Apple', tag: 'child_labour', url: 'https://apple.com/supplier-responsibility', title: 'Supplier Responsibility Report', publisher: 'Apple', publishedAt: new Date('2024-02-05'), reliability: 0.75 },
    
    // Meta sources
    { company: 'Meta', tag: 'data_privacy', url: 'https://about.fb.com/news/2024/privacy-update', title: 'Meta Privacy Updates', publisher: 'Meta Newsroom', publishedAt: new Date('2024-01-30'), reliability: 0.6 },
    
    // Whole Foods sources
    { company: 'Whole Foods', tag: 'environmentally_friendly', url: 'https://wholefoodsmarket.com/sustainability', title: 'Sustainability Commitment', publisher: 'Whole Foods Market', publishedAt: new Date('2024-02-15'), reliability: 0.8 },
    
    // Walmart sources
    { company: 'Walmart', tag: 'feminism_workplace', url: 'https://corporate.walmart.com/diversity', title: 'Diversity and Inclusion Report', publisher: 'Walmart Corporate', publishedAt: new Date('2024-01-10'), reliability: 0.5 },
    
    // Starbucks sources
    { company: 'Starbucks', tag: 'lgbtq', url: 'https://stories.starbucks.com/lgbtq', title: 'LGBTQ+ Support and Inclusion', publisher: 'Starbucks Stories', publishedAt: new Date('2024-02-20'), reliability: 0.9 },
    
    // Chick-fil-A sources
    { company: 'Chick-fil-A', tag: 'lgbtq', url: 'https://chick-fil-a.com/values', title: 'Company Values and Mission', publisher: 'Chick-fil-A', publishedAt: new Date('2024-01-05'), reliability: 0.8 },
    
    // Ben & Jerry's sources
    { company: 'Ben & Jerry\'s', tag: 'lgbtq', url: 'https://benjerry.com/values/issues-we-care-about/lgbtq-equality', title: 'LGBTQ+ Equality Advocacy', publisher: 'Ben & Jerry\'s', publishedAt: new Date('2024-02-25'), reliability: 0.95 },
    
    // Tesla sources
    { company: 'Tesla', tag: 'environmentally_friendly', url: 'https://tesla.com/impact', title: 'Tesla Impact Report', publisher: 'Tesla', publishedAt: new Date('2024-01-12'), reliability: 0.85 },
    
    // H&M sources
    { company: 'H&M', tag: 'environmentally_friendly', url: 'https://hmgroup.com/sustainability', title: 'H&M Sustainability Strategy', publisher: 'H&M Group', publishedAt: new Date('2024-02-08'), reliability: 0.7 }
  ]

  for (const source of sources) {
    const company = companies.find(c => c.name === source.company)
    const tag = tags.find(t => t.key === source.tag)
    
    if (company && tag) {
      await prisma.source.create({
        data: {
          companyId: company.id,
          tagId: tag.id,
          url: source.url,
          title: source.title,
          publisher: source.publisher,
          publishedAt: source.publishedAt,
          reliability: source.reliability,
          claimExcerpt: `Evidence supporting ${source.company}'s stance on ${tag.tag_name}`
        }
      })
    }
  }

  console.log(`✅ Created ${sources.length} sources`)

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
