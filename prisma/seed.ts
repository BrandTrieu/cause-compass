// prisma/seed.ts
import { PrismaClient, Category, Stance } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // 0) Clear existing data (order matters for FKs)
  await prisma.source.deleteMany()
  await prisma.companyTagFact.deleteMany()
  await prisma.company.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.appUser.deleteMany()

  // 1) Seed Tags (from your schema/example)
  const tagDefs = [
    { key: 'free_palestine',         tag_name: 'Free Palestine',              description: 'Support for Palestinian rights and opposition to Israeli occupation' },
    { key: 'russia_ukraine',         tag_name: 'Russia Ukraine',              description: 'Position on Russia-Ukraine conflict and support for Ukraine' },
    { key: 'feminism_workplace',     tag_name: 'Feminism/Women in the workplace', description: 'Gender equality, women\'s rights, and workplace diversity' },
    { key: 'child_labour',           tag_name: 'Child Labour',                description: 'Opposition to child labor and support for children\'s rights' },
    { key: 'lgbtq',                  tag_name: 'LGBTQ',                       description: 'Support for LGBTQ+ rights and equality' },
    { key: 'animal_cruelty',         tag_name: 'Animal Cruelty',              description: 'Opposition to animal cruelty and support for animal welfare' },
    { key: 'environmentally_friendly', tag_name: 'Environmentally Friendly',  description: 'Environmental sustainability and climate action' },
    { key: 'ethical_sourcing',       tag_name: 'Ethical Sourcing',            description: 'Ethical supply chain and fair trade practices' },
    { key: 'data_privacy',           tag_name: 'Data Privacy',                description: 'Protection of user data and privacy rights' },
  ]

  const tags = await Promise.all(
    tagDefs.map(t => prisma.tag.create({ data: t }))
  )
  const tagByKey = new Map(tags.map(t => [t.key, t]))
  console.log(`✅ Tags created: ${tags.length}`)

  // 2) Seed Companies (controversial + alternatives)
  // NOTE: Amazon category corrected to OTHER (your pasted block said APPAREL)
  const companyDefs = [
    // Controversial
    {
      name: 'Starbucks',
      category: Category.RESTAURANT,
      website: 'https://www.starbucks.com',
      summary: 'Global coffeehouse company offering espresso beverages, brewed coffee, teas, and light food items, with thousands of cafés worldwide.',
      logoUrl: 'https://cdn.simpleicons.org/starbucks',
    },
    {
      name: 'Chick-fil-A',
      category: Category.RESTAURANT,
      website: 'https://www.chick-fil-a.com',
      summary: 'Quick-service restaurant brand specializing in chicken sandwiches, nuggets, and salads, with dine-in and drive-thru service.',
      logoUrl: 'https://cdn.simpleicons.org/chickfila',
    },
    {
      name: 'SHEIN',
      category: Category.APPAREL,
      website: 'https://www.shein.com',
      summary: 'Online fashion and lifestyle retailer offering a wide range of apparel, accessories, and home goods through its e-commerce platform.',
      logoUrl: 'https://cdn.simpleicons.org/shein',
    },
    {
      name: 'Nestlé Bottled Water',
      category: Category.GROCERY,
      website: 'https://www.nestle.com',
      summary: 'Global food and beverage company that has marketed several bottled water brands internationally.',
      logoUrl: 'https://cdn.worldvectorlogo.com/logos/nestle-4.svg',
    },
    {
      name: 'Nike',
      category: Category.APPAREL,
      website: 'https://www.nike.com',
      summary: 'Global athletic company that designs, markets, and sells footwear, apparel, equipment, and accessories across sport and lifestyle categories.',
      logoUrl: 'https://cdn.simpleicons.org/nike',
    },
    {
      name: 'Amazon',
      category: Category.OTHER, // corrected
      website: 'https://www.amazon.ca',
      summary: 'Multinational technology company operating a large e-commerce marketplace, cloud services, and digital content platforms.',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg',
    },
    {
      name: 'McDonald’s',
      category: Category.RESTAURANT,
      website: 'https://www.mcdonalds.com/ca/en-ca.html',
      summary: 'International quick-service restaurant brand serving burgers, chicken items, beverages, and breakfast across thousands of locations.',
      logoUrl: 'https://cdn.simpleicons.org/mcdonalds',
    },
    {
      name: 'Loblaws',
      category: Category.GROCERY,
      website: 'https://www.loblaws.ca',
      summary: 'Canadian supermarket chain offering groceries, pharmacy services, and household goods through stores and online shopping.',
      logoUrl: 'https://logo.clearbit.com/loblaws.ca',
    },
    {
      name: 'H&M',
      category: Category.APPAREL,
      website: 'https://www.hm.com',
      summary: 'Global fashion retailer offering men’s, women’s, and kids’ clothing, accessories, and basics across physical stores and online.',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/330px-H%26M-Logo.svg.png',
    },

    // Alternatives (added as companies; no facts)
    {
      name: 'Second Cup Café',
      category: Category.RESTAURANT,
      website: 'https://secondcup.com',
      summary: 'Canadian specialty coffee retailer operating cafés across the country, serving espresso drinks, brewed coffee, and baked goods.',
      logoUrl: 'https://logo.clearbit.com/secondcup.com',
    },
    {
      name: 'Balzac’s Coffee Roasters',
      category: Category.RESTAURANT,
      website: 'https://www.balzacs.com',
      summary: 'Ontario-based coffee roaster and café chain known for handcrafted beverages, whole-bean coffee, and café fare.',
      logoUrl: 'https://logo.clearbit.com/balzacs.com',
    },
    {
      name: 'Mary Brown’s Chicken',
      category: Category.RESTAURANT,
      website: 'https://www.marybrowns.com',
      summary: 'Canadian quick-serve chain offering fried chicken, sandwiches, and sides, with locations across the country.',
      logoUrl: 'https://logo.clearbit.com/marybrowns.com',
    },
    {
      name: 'Popeyes Louisiana Kitchen (Canada)',
      category: Category.RESTAURANT,
      website: 'https://www.popeyeschicken.ca',
      summary: 'Fast-service restaurant known for fried chicken, sandwiches, and Southern-inspired side dishes, operating widely in Canada.',
      logoUrl: 'https://logo.clearbit.com/popeyeschicken.ca',
    },
    {
      name: 'Kotn',
      category: Category.APPAREL,
      website: 'https://kotn.com',
      summary: 'Canadian apparel brand offering everyday clothing and basics, with a focus on cotton garments and modern design.',
      logoUrl: 'https://logo.clearbit.com/kotn.com',
    },
    {
      name: 'Frank And Oak',
      category: Category.APPAREL,
      website: 'https://www.frankandoak.com',
      summary: 'Canadian clothing label providing contemporary men’s and women’s collections, outerwear, and wardrobe essentials.',
      logoUrl: 'https://logo.clearbit.com/frankandoak.com',
    },
    {
      name: 'ESKA',
      category: Category.GROCERY,
      website: 'https://www.eskawater.com',
      summary: 'Quebec spring water brand; bottles made from 100% recycled, recyclable PET (rPET) sourced from regional recycling streams.',
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTic21yf3_LXivP1sTnACLrLkTRB-1bj--8LA&s',
    },
    {
      name: 'Flow Alkaline Spring Water',
      category: Category.GROCERY,
      website: 'https://flowhydration.ca',
      summary: 'Canadian alkaline spring water from an artesian source in Ontario, packaged in paper-based Tetra Pak cartons.',
      logoUrl: 'https://logo.clearbit.com/flowhydration.ca',
    },
    {
      name: 'New Balance (Canada)',
      category: Category.APPAREL,
      website: 'https://www.newbalance.ca',
      summary: 'Athletic footwear and apparel company offering running, training, and lifestyle products through retail and online channels.',
      logoUrl: 'https://cdn.simpleicons.org/newbalance',
    },
    {
      name: 'ASICS (Canada)',
      category: Category.APPAREL,
      website: 'https://www.asics.com/ca',
      summary: 'Sportswear company known for performance running shoes, athletic apparel, and accessories with distribution throughout Canada.',
      logoUrl: 'https://images.seeklogo.com/logo-png/30/2/asics-logo-png_seeklogo-305773.png',
    },
    {
      name: 'eBay (Canada)',
      category: Category.OTHER,
      website: 'https://www.ebay.ca',
      summary: 'Online marketplace enabling consumer-to-consumer and business-to-consumer sales of new and pre-owned goods.',
      logoUrl: 'https://cdn.simpleicons.org/ebay',
    },
    {
      name: 'Etsy (Canada)',
      category: Category.OTHER,
      website: 'https://www.etsy.com/ca',
      summary: 'Global marketplace for handmade goods, vintage items, and craft supplies featuring independent sellers.',
      logoUrl: 'https://cdn.simpleicons.org/etsy',
    },
    {
      name: 'A&W (Canada)',
      category: Category.RESTAURANT,
      website: 'https://aw.ca',
      summary: 'Canadian quick-service chain offering burgers, chicken, and root beer with dine-in and drive-thru options nationwide.',
      logoUrl: 'https://logo.clearbit.com/aw.ca',
    },
    {
      name: 'Harvey’s',
      category: Category.RESTAURANT,
      website: 'https://www.harveys.ca',
      summary: 'Canadian fast-food restaurant known for build-your-own burgers and grilled items with locations across the country.',
      logoUrl: 'https://logo.clearbit.com/harveys.ca',
    },
    {
      name: 'Metro',
      category: Category.GROCERY,
      website: 'https://www.metro.ca',
      summary: 'Canadian grocery retailer operating supermarkets and pharmacies with a wide range of fresh foods and everyday essentials.',
      logoUrl: 'https://logo.clearbit.com/metro.ca',
    },
    {
      name: 'Sobeys',
      category: Category.GROCERY,
      website: 'https://www.sobeys.com',
      summary: 'National grocery chain providing fresh produce, meat, bakery, and prepared foods through various store banners.',
      logoUrl: 'https://logo.clearbit.com/sobeys.com',
    },
    {
      name: 'UNIQLO (Canada)',
      category: Category.APPAREL,
      website: 'https://www.uniqlo.com/ca',
      summary: 'Apparel retailer known for everyday clothing, functional basics, and seasonal collections available online and in stores.',
      logoUrl: 'https://cdn.simpleicons.org/uniqlo',
    },
    {
      name: 'Roots',
      category: Category.APPAREL,
      website: 'https://www.roots.com',
      summary: 'Canadian lifestyle brand featuring sweats, leather goods, and casual apparel with retail and e-commerce presence.',
      logoUrl: 'https://logo.clearbit.com/roots.com',
    },
  ]

  const companies = await Promise.all(
    companyDefs.map(c => prisma.company.create({ data: c }))
  )
  const companyByName = new Map(companies.map(c => [c.name, c]))
  console.log(`✅ Companies created: ${companies.length}`)

  // 3) Facts for controversial companies + attach proof links
  type FactInput = {
    company: string
    tagKey: string
    stance: Stance
    confidence: number
    notes?: string
    sourceUrls: string[]
  }

  const factInputs: FactInput[] = [
    // Starbucks — labour/union items -> feminism_workplace (alleged_violation)
    {
      company: 'Starbucks',
      tagKey: 'feminism_workplace',
      stance: Stance.alleged_violation,
      confidence: 0.75,
      notes: 'Union/labour-related disputes reported.',
      sourceUrls: [
        'https://apnews.com/article/starbucks-workers-united-union-lawsuit-israel-palestinian-f212a994fef67f122854a4df7e5d13f5',
        'https://www.reuters.com/business/world-at-work/starbucks-union-rejects-companys-recent-offer-least-2-annual-pay-raise-2025-04-25/',
      ],
    },

    // Chick-fil-A — LGBTQ stance (opposes)
    {
      company: 'Chick-fil-A',
      tagKey: 'lgbtq',
      stance: Stance.opposes,
      confidence: 0.9,
      notes: 'Historical positions/donations referenced in reporting.',
      sourceUrls: [
        'https://www.businessinsider.com/chick-fil-a-lgbt-twitter-jack-dorsey-apology-marriage-equality-2018-6',
        'https://en.wikipedia.org/wiki/Chick-fil-A_and_LGBTQ_people',
      ],
    },

    // SHEIN — supply chain concerns (child_labour alleged_violation, ethical_sourcing alleged_violation)
    {
      company: 'SHEIN',
      tagKey: 'child_labour',
      stance: Stance.alleged_violation,
      confidence: 0.85,
      notes: 'Reports of labour violations in supply chain.',
      sourceUrls: [
        'https://www.antislavery.org/latest/shein-fast-fashion-problem',
        'https://www.theguardian.com/business/2025/feb/26/shein-found-two-cases-of-child-labour-at-suppliers-in-2024-firm-tells-uk-mps',
      ],
    },
    {
      company: 'SHEIN',
      tagKey: 'ethical_sourcing',
      stance: Stance.alleged_violation,
      confidence: 0.8,
      notes: 'Sourcing and oversight concerns.',
      sourceUrls: [
        'https://www.antislavery.org/latest/shein-fast-fashion-problem',
      ],
    },

    // Nestlé Bottled Water — water extraction & access concerns (environmentally_friendly opposes, ethical_sourcing alleged_violation)
    {
      company: 'Nestlé Bottled Water',
      tagKey: 'environmentally_friendly',
      stance: Stance.opposes,
      confidence: 0.8,
      notes: 'Water taking and environmental impact debates.',
      sourceUrls: [
        'https://www.theguardian.com/global/2018/oct/04/ontario-six-nations-nestle-running-water',
      ],
    },
    {
      company: 'Nestlé Bottled Water',
      tagKey: 'ethical_sourcing',
      stance: Stance.alleged_violation,
      confidence: 0.7,
      notes: 'Local access & extraction context raised by advocacy groups.',
      sourceUrls: [
        'https://canadians.org/analysis/what-we-know-about-nestle-departure/',
      ],
    },

    // Nike — wages & supply chain (ethical_sourcing/child_labour alleged_violation)
    {
      company: 'Nike',
      tagKey: 'ethical_sourcing',
      stance: Stance.alleged_violation,
      confidence: 0.8,
      notes: 'Wage/rights issues in supplier factories.',
      sourceUrls: [
        'https://www.propublica.org/article/nike-wages-clothing-factory-cambodia',
        'https://cleanclothes.org/news/2023/nike-board-executives-under-fire',
      ],
    },

    // Amazon — labour/union issues (feminism_workplace alleged_violation)
    {
      company: 'Amazon',
      tagKey: 'feminism_workplace',
      stance: Stance.alleged_violation,
      confidence: 0.7,
      notes: 'Labour relations context in Canada.',
      sourceUrls: [
        'https://www.reuters.com/technology/amazon-exits-quebec-operations-cut-about-1700-jobs-2025-01-22',
        'https://apnews.com/article/amazon-warehouses-quebec-union-jobs-66da72506ca52a9e6e99bcd634bba781',
      ],
    },

    // McDonald’s — child labour findings & workplace safety (alleged_violation)
    {
      company: 'McDonald’s',
      tagKey: 'child_labour',
      stance: Stance.alleged_violation,
      confidence: 0.8,
      notes: 'US DOL franchisee enforcement examples.',
      sourceUrls: [
        'https://www.dol.gov/newsroom/releases/whd/whd20231127',
      ],
    },
    {
      company: 'McDonald’s',
      tagKey: 'feminism_workplace',
      stance: Stance.alleged_violation,
      confidence: 0.65,
      notes: 'Workplace safety/harassment reporting.',
      sourceUrls: [
        'https://apnews.com/article/mcdonalds-sexual-assault-pittsburgh-5a7761ce76acf8bafe531b4a9224b720',
      ],
    },

    // Loblaws — price fixing (ethical_sourcing alleged_violation)
    {
      company: 'Loblaws',
      tagKey: 'ethical_sourcing',
      stance: Stance.alleged_violation,
      confidence: 0.85,
      notes: 'Bread price-fixing settlement / industry fines.',
      sourceUrls: [
        'https://globalnews.ca/news/11408873/bread-price-fixing-lawsuit-claims-open',
        'https://www.canada.ca/en/competition-bureau/news/2023/06/canada-bread-sentenced-to-50-million-fine-after-pleading-guilty-to-fixing-wholesale-bread-prices.html',
      ],
    },

    // H&M — Xinjiang & greenwashing scrutiny (ethical_sourcing, environmentally_friendly alleged_violation)
    {
      company: 'H&M',
      tagKey: 'ethical_sourcing',
      stance: Stance.alleged_violation,
      confidence: 0.7,
      notes: 'Sourcing stance and supply-chain sensitivity.',
      sourceUrls: [
        'https://www.reuters.com/world/americas/hms-xinjiang-labour-stance-raises-social-media-storm-china-2021-03-24/',
      ],
    },
    {
      company: 'H&M',
      tagKey: 'environmentally_friendly',
      stance: Stance.alleged_violation,
      confidence: 0.65,
      notes: 'Marketing/claims scrutiny around sustainability.',
      sourceUrls: [
        'https://www.theguardian.com/business/2022/jan/14/dirty-greenwashing-watchdog-targets-fashion-brands-over-misleading-claims',
      ],
    },
  ]

  let createdFacts = 0
  let createdSources = 0

  for (const f of factInputs) {
    const company = companyByName.get(f.company)
    const tag = tagByKey.get(f.tagKey)
    if (!company || !tag) {
      console.warn(`⚠️ Skipping fact: company or tag not found`, f.company, f.tagKey)
      continue
    }

    // Create the fact
    const fact = await prisma.companyTagFact.create({
      data: {
        companyId: company.id,
        tagId: tag.id,
        stance: f.stance,
        confidence: f.confidence,
        notes: f.notes ?? null,
        sourceUrls: f.sourceUrls,
        lastVerifiedAt: new Date(),
      },
    })
    createdFacts++

    // Also store each URL as a Source row
    for (const url of f.sourceUrls) {
      await prisma.source.create({
        data: {
          companyId: company.id,
          tagId: tag.id,
          url,
          title: null,
          publisher: null,
          publishedAt: null,
          reliability: null,
          claimExcerpt: `Reference link for ${company.name} on ${tag.tag_name}`,
        },
      })
      createdSources++
    }
  }

  console.log(`✅ CompanyTagFacts created: ${createdFacts}`)
  console.log(`✅ Sources created (from proof links): ${createdSources}`)
  console.log('🎉 Seed complete')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
