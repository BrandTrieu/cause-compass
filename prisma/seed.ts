// prisma/seed.ts
import { PrismaClient, Category, Stance } from "@prisma/client";

const prisma = new PrismaClient();

type PositiveSource = {
  url: string;
  title: string | null;
  publisher: string | null;
  reliability: number | null;
  publishedAt?: Date | null;
  claimExcerpt: string;
};

type FactInput = {
  company: string;
  tagKey: string;
  stance: Stance;
  confidence: number;
  notes?: string;
  sources: PositiveSource[];
};

async function main() {
  console.log("🌱 Starting database seed...");

  // 0) Clear existing data (order matters for FKs)
  await prisma.source.deleteMany();
  await prisma.companyTagFact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.appUser.deleteMany();

  // 1) Seed Tags
  const tagDefs = [
    {
      key: "free_palestine",
      tag_name: "Free Palestine",
      description:
        "Support for Palestinian rights and opposition to Israeli occupation",
    },
    {
      key: "justice_for_ukraine",
      tag_name: "Justice for Ukraine",
      description:
        "Support for Ukraine's sovereignty and territorial integrity",
    },
    {
      key: "women_workplace",
      tag_name: "Women in the workplace",
      description: "Gender equality, women's rights, and workplace diversity",
    },
    {
      key: "child_labour",
      tag_name: "Against Child Labour",
      description:
        "Opposition to child labor and support for children's rights",
    },
    {
      key: "lgbtq",
      tag_name: "LGBTQ Rights",
      description: "Support for LGBTQ+ rights and equality",
    },
    {
      key: "animal_cruelty",
      tag_name: "Against Animal Cruelty",
      description:
        "Opposition to animal cruelty and support for animal welfare",
    },
    {
      key: "environmentally_friendly",
      tag_name: "Environmentally Friendly",
      description: "Environmental sustainability and climate action",
    },
    {
      key: "ethical_sourcing",
      tag_name: "Ethical Sourcing",
      description: "Ethical supply chain and fair trade practices",
    },
    {
      key: "data_privacy",
      tag_name: "Data Privacy",
      description: "Protection of user data and privacy rights",
    },
  ];

  const tags = await Promise.all(
    tagDefs.map((t) => prisma.tag.create({ data: t }))
  );
  const tagByKey = new Map(tags.map((t) => [t.key, t]));
  console.log(`✅ Tags created: ${tags.length}`);

  // 2) Seed Companies (controversial + alternatives)
  const companyDefs = [
    // Controversial
    {
      name: "Starbucks",
      category: Category.RESTAURANT,
      website: "https://www.starbucks.com",
      summary:
        "Global coffeehouse company offering espresso beverages, brewed coffee, teas, and light food items, with thousands of cafés worldwide.",
      logoUrl: "https://cdn.simpleicons.org/starbucks",
    },
    {
      name: "Chick-fil-A",
      category: Category.RESTAURANT,
      website: "https://www.chick-fil-a.com",
      summary:
        "Quick-service restaurant brand specializing in chicken sandwiches, nuggets, and salads, with dine-in and drive-thru service.",
      logoUrl: "https://cdn.worldvectorlogo.com/logos/chick-fil-a-1.svg",
    },
    {
      name: "SHEIN",
      category: Category.APPAREL,
      website: "https://www.shein.com",
      summary:
        "Online fashion and lifestyle retailer offering a wide range of apparel, accessories, and home goods through its e-commerce platform.",
      logoUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS48hlthLhxmHKsnP5Ld6JQXPaHXr3R8c3gTg&s",
    },
    {
      name: "Nestlé Bottled Water",
      category: Category.GROCERY,
      website: "https://www.nestle.com",
      summary:
        "Global food and beverage company that has marketed several bottled water brands internationally.",
      logoUrl: "https://cdn.worldvectorlogo.com/logos/nestle-4.svg",
    },
    {
      name: "Nike",
      category: Category.APPAREL,
      website: "https://www.nike.com",
      summary:
        "Global athletic company that designs, markets, and sells footwear, apparel, equipment, and accessories across sport and lifestyle categories.",
      logoUrl: "https://cdn.simpleicons.org/nike",
    },
    {
      name: "Amazon",
      category: Category.OTHER, // corrected from pasted APPAREL
      website: "https://www.amazon.ca",
      summary:
        "Multinational technology company operating a large e-commerce marketplace, cloud services, and digital content platforms.",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg",
    },
    {
      name: "McDonald’s",
      category: Category.RESTAURANT,
      website: "https://www.mcdonalds.com/ca/en-ca.html",
      summary:
        "International quick-service restaurant brand serving burgers, chicken items, beverages, and breakfast across thousands of locations.",
      logoUrl: "https://cdn.simpleicons.org/mcdonalds",
    },
    {
      name: "Loblaws",
      category: Category.GROCERY,
      website: "https://www.loblaws.ca",
      summary:
        "Canadian supermarket chain offering groceries, pharmacy services, and household goods through stores and online shopping.",
      logoUrl: "https://logo.clearbit.com/loblaws.ca",
    },
    {
      name: "H&M",
      category: Category.APPAREL,
      website: "https://www.hm.com",
      summary:
        "Global fashion retailer offering men’s, women’s, and kids’ clothing, accessories, and basics across physical stores and online.",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/330px-H%26M-Logo.svg.png",
    },

    // Alternatives
    {
      name: "Second Cup Café",
      category: Category.RESTAURANT,
      website: "https://secondcup.com",
      summary:
        "Canadian specialty coffee retailer operating cafés across the country, serving espresso drinks, brewed coffee, and baked goods.",
      logoUrl: "https://logo.clearbit.com/secondcup.com",
    },
    {
      name: "Balzac’s Coffee Roasters",
      category: Category.RESTAURANT,
      website: "https://www.balzacs.com",
      summary:
        "Ontario-based coffee roaster and café chain known for handcrafted beverages, whole-bean coffee, and café fare.",
      logoUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCeh5xAUN_zl7OlZ8HJFHseiDVSACyqPMEWA&s",
    },
    {
      name: "Mary Brown’s Chicken",
      category: Category.RESTAURANT,
      website: "https://www.marybrowns.com",
      summary:
        "Canadian quick-serve chain offering fried chicken, sandwiches, and sides, with locations across the country.",
      logoUrl: "https://logo.clearbit.com/marybrowns.com",
    },
    {
      name: "Popeyes Louisiana Kitchen (Canada)",
      category: Category.RESTAURANT,
      website: "https://www.popeyeschicken.ca",
      summary:
        "Fast-service restaurant known for fried chicken, sandwiches, and Southern-inspired side dishes, operating widely in Canada.",
      logoUrl: "https://logo.clearbit.com/popeyeschicken.ca",
    },
    {
      name: "Kotn",
      category: Category.APPAREL,
      website: "https://kotn.com",
      summary:
        "Canadian apparel brand offering everyday clothing and basics, with a focus on cotton garments and modern design.",
      logoUrl: "https://logo.clearbit.com/kotn.com",
    },
    {
      name: "Frank And Oak",
      category: Category.APPAREL,
      website: "https://www.frankandoak.com",
      summary:
        "Canadian clothing label providing contemporary men’s and women’s collections, outerwear, and wardrobe essentials.",
      logoUrl: "https://logo.clearbit.com/frankandoak.com",
    },
    {
      name: "ESKA",
      category: Category.GROCERY,
      website: "https://www.eskawater.com",
      summary:
        "Quebec spring water brand; bottles made from 100% recycled, recyclable PET (rPET) sourced from regional recycling streams.",
      logoUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTic21yf3_LXivP1sTnACLrLkTRB-1bj--8LA&s",
    },
    {
      name: "Flow Alkaline Spring Water",
      category: Category.GROCERY,
      website: "https://flowhydration.ca",
      summary:
        "Canadian alkaline spring water from an artesian source in Ontario, packaged in paper-based Tetra Pak cartons.",
      logoUrl: "https://logo.clearbit.com/flowhydration.ca",
    },
    {
      name: "New Balance (Canada)",
      category: Category.APPAREL,
      website: "https://www.newbalance.ca",
      summary:
        "Athletic footwear and apparel company offering running, training, and lifestyle products through retail and online channels.",
      logoUrl: "https://cdn.simpleicons.org/newbalance",
    },
    {
      name: "ASICS (Canada)",
      category: Category.APPAREL,
      website: "https://www.asics.com/ca",
      summary:
        "Sportswear company known for performance running shoes, athletic apparel, and accessories with distribution throughout Canada.",
      logoUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQphWOUUy_D_5Mh0Kl2xjNQAd9cljqUxK-Puw&s",
    },
    {
      name: "eBay (Canada)",
      category: Category.OTHER,
      website: "https://www.ebay.ca",
      summary:
        "Online marketplace enabling consumer-to-consumer and business-to-consumer sales of new and pre-owned goods.",
      logoUrl: "https://cdn.simpleicons.org/ebay",
    },
    {
      name: "Etsy (Canada)",
      category: Category.OTHER,
      website: "https://www.etsy.com/ca",
      summary:
        "Global marketplace for handmade goods, vintage items, and craft supplies featuring independent sellers.",
      logoUrl: "https://cdn.simpleicons.org/etsy",
    },
    {
      name: "A&W (Canada)",
      category: Category.RESTAURANT,
      website: "https://aw.ca",
      summary:
        "Canadian quick-service chain offering burgers, chicken, and root beer with dine-in and drive-thru options nationwide.",
      logoUrl: "https://logo.clearbit.com/aw.ca",
    },
    {
      name: "Harvey’s",
      category: Category.RESTAURANT,
      website: "https://www.harveys.ca",
      summary:
        "Canadian fast-food restaurant known for build-your-own burgers and grilled items with locations across the country.",
      logoUrl: "https://logo.clearbit.com/harveys.ca",
    },
    {
      name: "Metro",
      category: Category.GROCERY,
      website: "https://www.metro.ca",
      summary:
        "Canadian grocery retailer operating supermarkets and pharmacies with a wide range of fresh foods and everyday essentials.",
      logoUrl: "https://logo.clearbit.com/metro.ca",
    },
    {
      name: "Sobeys",
      category: Category.GROCERY,
      website: "https://www.sobeys.com",
      summary:
        "National grocery chain providing fresh produce, meat, bakery, and prepared foods through various store banners.",
      logoUrl: "https://logo.clearbit.com/sobeys.com",
    },
    {
      name: "UNIQLO (Canada)",
      category: Category.APPAREL,
      website: "https://www.uniqlo.com/ca",
      summary:
        "Apparel retailer known for everyday clothing, functional basics, and seasonal collections available online and in stores.",
      logoUrl: "https://cdn.simpleicons.org/uniqlo",
    },
    {
      name: "Roots",
      category: Category.APPAREL,
      website: "https://www.roots.com",
      summary:
        "Canadian lifestyle brand featuring sweats, leather goods, and casual apparel with retail and e-commerce presence.",
      logoUrl: "https://logo.clearbit.com/roots.com",
    },
    {
      name: "WestJet",
      category: Category.OTHER,
      website: "https://www.westjet.com",
      summary:
        "Canadian airline offering domestic and international flights with service across North America, Europe, and the Caribbean.",
      logoUrl: "https://logo.clearbit.com/westjet.com",
    },
    {
      name: "Porter Airlines",
      category: Category.OTHER,
      website: "https://www.flyporter.com",
      summary:
        "Regional and transcontinental airline based in Toronto, operating from Billy Bishop and Pearson with a growing Embraer fleet.",
      logoUrl: "https://logo.clearbit.com/flyporter.com",
    },
  ];

  const companies = await Promise.all(
    companyDefs.map((c) => prisma.company.create({ data: c }))
  );
  const companyByName = new Map(companies.map((c) => [c.name, c]));
  console.log(`✅ Companies created: ${companies.length}`);

  // 3) Controversial facts (negative / alleged_violation), using your links
  const controversialFacts: FactInput[] = [
    // Starbucks
    {
      company: "Starbucks",
      tagKey: "women_workplace",
      stance: Stance.alleged_violation,
      confidence: 0.75,
      notes: "Union/labour-related disputes reported.",
      sources: [
        {
          url: "https://apnews.com/article/starbucks-workers-united-union-lawsuit-israel-palestinian-f212a994fef67f122854a4df7e5d13f5",
          title: "AP News coverage",
          publisher: "AP News",
          reliability: 0.85,
          claimExcerpt: "Reporting on union-related disputes.",
        },
        {
          url: "https://www.reuters.com/business/world-at-work/starbucks-union-rejects-companys-recent-offer-least-2-annual-pay-raise-2025-04-25/",
          title: "Reuters coverage",
          publisher: "Reuters",
          reliability: 0.9,
          claimExcerpt: "Coverage of union response to company offers.",
        },
      ],
    },

    // Chick-fil-A
    {
      company: "Chick-fil-A",
      tagKey: "lgbtq",
      stance: Stance.opposes,
      confidence: 0.9,
      notes: "Historical positions/donations referenced in reporting.",
      sources: [
        {
          url: "https://www.businessinsider.com/chick-fil-a-lgbt-twitter-jack-dorsey-apology-marriage-equality-2018-6",
          title: "Business Insider article",
          publisher: "Business Insider",
          reliability: 0.75,
          claimExcerpt: "Background on LGBTQ-related controversy.",
        },
        {
          url: "https://en.wikipedia.org/wiki/Chick-fil-A_and_LGBTQ_people",
          title: "Wikipedia overview",
          publisher: "Wikipedia",
          reliability: 0.55,
          claimExcerpt: "Summary page on topic.",
        },
      ],
    },

    // SHEIN
    {
      company: "SHEIN",
      tagKey: "child_labour",
      stance: Stance.alleged_violation,
      confidence: 0.85,
      notes: "Reports of labour violations in supply chain.",
      sources: [
        {
          url: "https://www.antislavery.org/latest/shein-fast-fashion-problem",
          title: "Anti-Slavery International",
          publisher: "Anti-Slavery International",
          reliability: 0.8,
          claimExcerpt: "Advocacy page summarizing concerns.",
        },
        {
          url: "https://www.theguardian.com/business/2025/feb/26/shein-found-two-cases-of-child-labour-at-suppliers-in-2024-firm-tells-uk-mps",
          title: "The Guardian reporting (2025)",
          publisher: "The Guardian",
          reliability: 0.85,
          claimExcerpt: "Report on supplier investigations.",
        },
      ],
    },
    {
      company: "SHEIN",
      tagKey: "ethical_sourcing",
      stance: Stance.alleged_violation,
      confidence: 0.8,
      sources: [
        {
          url: "https://www.antislavery.org/latest/shein-fast-fashion-problem",
          title: "Anti-Slavery International",
          publisher: "Anti-Slavery International",
          reliability: 0.8,
          claimExcerpt: "Supply-chain oversight concerns.",
        },
      ],
    },

    // Nestlé Bottled Water
    {
      company: "Nestlé Bottled Water",
      tagKey: "environmentally_friendly",
      stance: Stance.opposes,
      confidence: 0.8,
      sources: [
        {
          url: "https://www.theguardian.com/global/2018/oct/04/ontario-six-nations-nestle-running-water",
          title: "The Guardian (2018)",
          publisher: "The Guardian",
          reliability: 0.85,
          claimExcerpt: "Coverage of water access issues in Ontario.",
        },
      ],
    },
    {
      company: "Nestlé Bottled Water",
      tagKey: "ethical_sourcing",
      stance: Stance.alleged_violation,
      confidence: 0.7,
      sources: [
        {
          url: "https://canadians.org/analysis/what-we-know-about-nestle-departure/",
          title: "Council of Canadians analysis",
          publisher: "Council of Canadians",
          reliability: 0.7,
          claimExcerpt: "Context on water extraction/departure.",
        },
      ],
    },

    // Nike
    {
      company: "Nike",
      tagKey: "ethical_sourcing",
      stance: Stance.alleged_violation,
      confidence: 0.8,
      sources: [
        {
          url: "https://www.propublica.org/article/nike-wages-clothing-factory-cambodia",
          title: "ProPublica investigation",
          publisher: "ProPublica",
          reliability: 0.9,
          claimExcerpt: "Wage/rights issues in supplier factories.",
        },
        {
          url: "https://cleanclothes.org/news/2023/nike-board-executives-under-fire",
          title: "Clean Clothes Campaign",
          publisher: "Clean Clothes Campaign",
          reliability: 0.75,
          claimExcerpt: "Campaign reporting on Nike board/executives.",
        },
      ],
    },

    // Amazon
    {
      company: "Amazon",
      tagKey: "women_workplace",
      stance: Stance.alleged_violation,
      confidence: 0.7,
      sources: [
        {
          url: "https://www.reuters.com/technology/amazon-exits-quebec-operations-cut-about-1700-jobs-2025-01-22",
          title: "Reuters (2025-01-22)",
          publisher: "Reuters",
          reliability: 0.9,
          claimExcerpt: "Canada operations change context.",
        },
        {
          url: "https://apnews.com/article/amazon-warehouses-quebec-union-jobs-66da72506ca52a9e6e99bcd634bba781",
          title: "AP News coverage",
          publisher: "AP News",
          reliability: 0.85,
          claimExcerpt: "Union jobs context in Quebec warehouses.",
        },
      ],
    },

    // McDonald’s
    {
      company: "McDonald’s",
      tagKey: "child_labour",
      stance: Stance.alleged_violation,
      confidence: 0.8,
      sources: [
        {
          url: "https://www.dol.gov/newsroom/releases/whd/whd20231127",
          title: "US DOL press release (2023)",
          publisher: "U.S. Department of Labor",
          reliability: 0.9,
          claimExcerpt: "Wage and Hour Division enforcement (franchisees).",
        },
      ],
    },
    {
      company: "McDonald’s",
      tagKey: "women_workplace",
      stance: Stance.alleged_violation,
      confidence: 0.65,
      sources: [
        {
          url: "https://apnews.com/article/mcdonalds-sexual-assault-pittsburgh-5a7761ce76acf8bafe531b4a9224b720",
          title: "AP News coverage",
          publisher: "AP News",
          reliability: 0.85,
          claimExcerpt: "Workplace safety/harassment case coverage.",
        },
      ],
    },

    // Loblaws
    {
      company: "Loblaws",
      tagKey: "ethical_sourcing",
      stance: Stance.alleged_violation,
      confidence: 0.85,
      sources: [
        {
          url: "https://globalnews.ca/news/11408873/bread-price-fixing-lawsuit-claims-open",
          title: "Global News coverage",
          publisher: "Global News",
          reliability: 0.8,
          claimExcerpt: "Bread price-fixing lawsuit claims context.",
        },
        {
          url: "https://www.canada.ca/en/competition-bureau/news/2023/06/canada-bread-sentenced-to-50-million-fine-after-pleading-guilty-to-fixing-wholesale-bread-prices.html",
          title: "Competition Bureau - news release",
          publisher: "Government of Canada",
          reliability: 0.95,
          claimExcerpt: "Guilty plea & fine in bread price-fixing case.",
        },
      ],
    },

    // H&M
    {
      company: "H&M",
      tagKey: "ethical_sourcing",
      stance: Stance.alleged_violation,
      confidence: 0.7,
      sources: [
        {
          url: "https://www.reuters.com/world/americas/hms-xinjiang-labour-stance-raises-social-media-storm-china-2021-03-24/",
          title: "Reuters coverage (2021)",
          publisher: "Reuters",
          reliability: 0.9,
          claimExcerpt: "Xinjiang labour stance/social media reaction.",
        },
      ],
    },
    {
      company: "H&M",
      tagKey: "environmentally_friendly",
      stance: Stance.alleged_violation,
      confidence: 0.65,
      sources: [
        {
          url: "https://www.theguardian.com/business/2022/jan/14/dirty-greenwashing-watchdog-targets-fashion-brands-over-misleading-claims",
          title: "The Guardian (2022)",
          publisher: "The Guardian",
          reliability: 0.85,
          claimExcerpt: "Greenwashing claims against multiple brands.",
        },
      ],
    },
  ];

  // 4) Positive facts for ALTERNATIVES (supports) — using the links you provided
  const positiveFacts: FactInput[] = [
    // Starbucks alternatives
    {
      company: "Second Cup Café",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.75,
      notes: "Sustainability program & certified coffees.",
      sources: [
        {
          url: "https://www.mysecondcup.com/sustainability",
          title: "Second Cup Sustainability",
          publisher: "Second Cup",
          reliability: 0.7,
          claimExcerpt:
            "Program overview: certified coffees, packaging, community.",
        },
        {
          url: "https://secondcup.com/en/our-story",
          title: "Second Cup – Our Story",
          publisher: "Second Cup",
          reliability: 0.6,
          claimExcerpt: "Brand background and quality focus.",
        },
      ],
    },
    {
      company: "Balzac’s Coffee Roasters",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.75,
      notes: "Sustainability practices & certifications.",
      sources: [
        {
          url: "https://balzacs.com/pages/balzacs-sustainability-practices",
          title: "Balzac’s Sustainability Practices",
          publisher: "Balzac’s Coffee Roasters",
          reliability: 0.7,
          claimExcerpt:
            "LEAF certification, compostable pods, packaging notes.",
        },
        {
          url: "https://balzacs.com/blogs/news/balzacs-sustainability-practices",
          title: "Balzac’s Sustainability (news/blog)",
          publisher: "Balzac’s Coffee Roasters",
          reliability: 0.6,
          claimExcerpt: "Additional detail on sustainability focus.",
        },
      ],
    },

    // Chick-fil-A alternatives
    {
      company: "Mary Brown’s Chicken",
      tagKey: "ethical_sourcing",
      stance: Stance.supports,
      confidence: 0.7,
      notes: "Canadian sourcing & partnerships.",
      sources: [
        {
          url: "https://marybrowns.com/wp-content/uploads/International-Brand-Presentation-1.pdf",
          title: "Mary Brown’s Brand Presentation",
          publisher: "Mary Brown’s",
          reliability: 0.6,
          claimExcerpt:
            "Company profile; Canadian roots & sourcing statements.",
        },
        {
          url: "https://www.newswire.ca/news-releases/mary-brown-s-chicken-celebrates-canadian-farming-roots-through-local-partnerships-868356621.html",
          title: "Newswire release — local partnerships",
          publisher: "Newswire",
          reliability: 0.7,
          claimExcerpt: "Canadian farming roots & local supplier partnerships.",
        },
      ],
    },
    {
      company: "Popeyes Louisiana Kitchen (Canada)",
      tagKey: "animal_cruelty",
      stance: Stance.supports,
      confidence: 0.7,
      notes: "Animal welfare/antibiotics policy commitments.",
      sources: [
        {
          url: "https://news.popeyes.com/blog-posts/popeyes-r-announces-new-quality-sustainability-commitments",
          title: "Popeyes — Quality & Sustainability Commitments",
          publisher: "Popeyes News",
          reliability: 0.7,
          claimExcerpt: "Antibiotics and animal welfare commitments.",
        },
      ],
    },

    // SHEIN alternatives
    {
      company: "Kotn",
      tagKey: "ethical_sourcing",
      stance: Stance.supports,
      confidence: 0.8,
      notes: "B-Corp & sourcing ethos.",
      sources: [
        {
          url: "https://kotn.com/about?srsltid=AfmBOopwV5697Dj5_xwS23Y39YpAjZBGfZcc2XHmyvxpf4IfPvBAmpYz",
          title: "Kotn — About",
          publisher: "Kotn",
          reliability: 0.65,
          claimExcerpt: "Overview of sourcing and values.",
        },
        {
          url: "https://www.bcorporation.net/en-us/find-a-b-corp/company/kotn/",
          title: "B Lab — Kotn",
          publisher: "B Lab",
          reliability: 0.85,
          claimExcerpt: "Certified B Corporation listing for Kotn.",
        },
      ],
    },
    {
      company: "Frank And Oak",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.65,
      notes: "Sustainable e-commerce practices (historical operations).",
      sources: [
        {
          url: "https://www.yieldify.com/blog/sustainable-e-commerce-with-frank-and-oak/",
          title: "Yieldify case study",
          publisher: "Yieldify",
          reliability: 0.6,
          claimExcerpt: "Sustainability initiatives in online operations.",
        },
      ],
    },

    // Nestlé bottled water alternatives
    {
      company: "ESKA",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.8,
      notes: "100% rPET bottles; Canadian spring source.",
      sources: [
        {
          url: "https://www.eskawater.com/recycle-of-life/",
          title: "ESKA — Recycle of Life",
          publisher: "ESKA",
          reliability: 0.7,
          claimExcerpt: "100% rPET and 100% recyclable bottle communication.",
        },
      ],
    },
    {
      company: "Flow Alkaline Spring Water",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.75,
      notes: "Carton-based packaging & artesian source.",
      sources: [
        {
          url: "https://www.tetrapak.com/en-us/insights/cases-articles/flow-alkaline-water-in-tetra-prisma-aseptic",
          title: "Tetra Pak case — Flow Alkaline Water",
          publisher: "Tetra Pak",
          reliability: 0.75,
          claimExcerpt: "Carton packaging format and benefits.",
        },
      ],
    },

    // Nike alternatives
    {
      company: "New Balance (Canada)",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.75,
      notes: "Circularity/resale program; sustainability hub.",
      sources: [
        {
          url: "https://newbalance.newsmarket.com/latest-news/new-balance-launches--reconsidered--resale-platform/s/fdc630d8-393a-4cb2-b864-46dd68c086b3",
          title: "New Balance launches “Reconsidered”",
          publisher: "New Balance Newsroom",
          reliability: 0.75,
          claimExcerpt: "Official announcement of resale program.",
        },
        {
          url: "https://www.newbalance.com/responsible-leadership.html",
          title: "Responsible Leadership (sustainability hub)",
          publisher: "New Balance",
          reliability: 0.7,
          claimExcerpt: "Sustainability/impact themes and targets.",
        },
      ],
    },
    {
      company: "ASICS (Canada)",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.8,
      notes: "Sustainability report and targets.",
      sources: [
        {
          url: "https://assets.asics.com/system/libraries/4036/ASICS_sustainability_report_2024.pdf",
          title: "ASICS Sustainability Report 2024",
          publisher: "ASICS",
          reliability: 0.8,
          claimExcerpt: "KPIs/targets for climate & materials.",
        },
        {
          url: "https://corp.asics.com/en/csr",
          title: "ASICS CSR / Sustainability portal",
          publisher: "ASICS",
          reliability: 0.7,
          claimExcerpt: "Program overview and disclosures.",
        },
      ],
    },

    // Amazon alternatives
    {
      company: "eBay (Canada)",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.75,
      notes: "Circular commerce & ESG reporting.",
      sources: [
        {
          url: "https://www.ebayinc.com/impact/",
          title: "eBay Impact",
          publisher: "eBay Inc.",
          reliability: 0.75,
          claimExcerpt: "Circular commerce / environmental initiatives.",
        },
        {
          url: "https://materials.proxyvote.com/Approved/278642/20250428/AR_607280.PDF",
          title: "eBay Annual/Impact sections (2024)",
          publisher: "eBay Inc.",
          reliability: 0.75,
          claimExcerpt: "ESG highlights from annual materials.",
        },
      ],
    },
    {
      company: "Etsy (Canada)",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.8,
      notes: "Impact goals & ESG resources.",
      sources: [
        {
          url: "https://www.etsy.com/news/etsys-2024-environmental-impact-goals",
          title: "Etsy 2024 Environmental Impact Goals",
          publisher: "Etsy",
          reliability: 0.75,
          claimExcerpt: "Targets for emissions/energy.",
        },
        {
          url: "https://investors.etsy.com/impact-reporting/ESG-Reporting-and-Resources/default.aspx",
          title: "Etsy ESG Reporting Hub",
          publisher: "Etsy",
          reliability: 0.8,
          claimExcerpt: "Formal ESG reporting resources.",
        },
      ],
    },

    // McDonald’s alternatives
    {
      company: "A&W (Canada)",
      tagKey: "ethical_sourcing",
      stance: Stance.supports,
      confidence: 0.8,
      notes: "Modern Slavery (Bill S-211) statement & supply-chain policy.",
      sources: [
        {
          url: "https://www.web.aw.ca/i/pdf/AW-Bill-S-211-Report-en.pdf",
          title: "A&W Bill S-211 Report",
          publisher: "A&W",
          reliability: 0.8,
          claimExcerpt: "Supplier due diligence & human rights statement.",
        },
        {
          url: "https://awincomefund.mediaroom.com/2024-12-02-One-Million-Meals-and-Counting-A-W-Tackles-Food-Waste-and-Hunger-with-Second-Harvest-Partnership",
          title: "A&W x Second Harvest press release",
          publisher: "A&W Income Fund",
          reliability: 0.7,
          claimExcerpt: "Food-rescue partnership and impact.",
        },
      ],
    },
    {
      company: "Harvey’s",
      tagKey: "ethical_sourcing",
      stance: Stance.supports,
      confidence: 0.75,
      notes: "Certified Sustainable Beef sourcing & Canadian values.",
      sources: [
        {
          url: "https://www.harveys.ca/en/canadianvalues.html",
          title: "Harvey’s — Our Canadian Values",
          publisher: "Harvey’s",
          reliability: 0.65,
          claimExcerpt: "Values, community & sourcing themes.",
        },
        {
          url: "https://www.canadiancattlemen.ca/news-roundup/harveys-sourcing-certified-sustainable-beef",
          title: "Canadian Cattlemen — Harvey’s Certified Sustainable Beef",
          publisher: "Canadian Cattlemen",
          reliability: 0.7,
          claimExcerpt: "CRSB-aligned beef sourcing reported.",
        },
      ],
    },

    // Loblaws alternatives
    {
      company: "Metro",
      tagKey: "ethical_sourcing",
      stance: Stance.supports,
      confidence: 0.75,
      notes: "Corporate responsibility report (ESG).",
      sources: [
        {
          url: "https://corpo.metro.ca/userfiles/file/PDF/2024-cr-report.pdf",
          title: "METRO — Corporate Responsibility Report 2024",
          publisher: "METRO Inc.",
          reliability: 0.8,
          claimExcerpt: "ESG commitments and supply-chain topics.",
        },
      ],
    },
    {
      company: "Sobeys",
      tagKey: "ethical_sourcing",
      stance: Stance.supports,
      confidence: 0.75,
      notes: "Sustainable Business Report (Empire).",
      sources: [
        {
          url: "https://sobeyssbreport.com/wp-content/uploads/2024/07/Fiscal-2024-Sustainable-Business-Report__EN_.pdf",
          title: "Sobeys/Empire — Sustainable Business Report (FY2024)",
          publisher: "Empire Company Limited",
          reliability: 0.8,
          claimExcerpt: "Supplier standards and ESG metrics.",
        },
      ],
    },

    // H&M alternatives
    {
      company: "UNIQLO (Canada)",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.75,
      notes: "RE.UNIQLO take-back & recycling program.",
      sources: [
        {
          url: "https://www.uniqlo.com/jp/en/contents/sustainability/planet/clothes_recycling/re-uniqlo/",
          title: "RE.UNIQLO — Clothes Recycling",
          publisher: "UNIQLO / Fast Retailing",
          reliability: 0.75,
          claimExcerpt: "In-store take-back and reuse/recycling.",
        },
        {
          url: "https://www.fastretailing.com/eng/ir/library/pdf/ar2024_en.pdf",
          title: "Fast Retailing Integrated Report 2024",
          publisher: "Fast Retailing",
          reliability: 0.85,
          claimExcerpt: "Group sustainability governance & metrics.",
        },
      ],
    },
    {
      company: "Roots",
      tagKey: "ethical_sourcing",
      stance: Stance.supports,
      confidence: 0.8,
      notes: "Modern Slavery Report & sustainability page.",
      sources: [
        {
          url: "https://www.roots.com/ca/en/sustainability.html",
          title: "Roots — Sustainability",
          publisher: "Roots",
          reliability: 0.75,
          claimExcerpt: "Materials and environmental programs.",
        },
        {
          url: "https://www.roots.com/on/demandware.static/-/Sites-RootsUS-Library/default/dw3d367df0/ROOTS_ASSETS/landing-pages/coc/RootsCorporationModernSlaveryReport2023.pdf",
          title: "Roots Modern Slavery Report 2023",
          publisher: "Roots",
          reliability: 0.85,
          claimExcerpt: "Human rights due diligence documentation.",
        },
      ],
    },

    // Air Canada alternatives
    {
      company: "WestJet",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.65,
      notes: "Environmental stewardship overview.",
      sources: [
        {
          url: "https://www.westjet.com/en-ca/who-we-are/environment",
          title: "WestJet — Environment",
          publisher: "WestJet",
          reliability: 0.65,
          claimExcerpt: "Approach to responsible growth & emissions.",
        },
      ],
    },
    {
      company: "Porter Airlines",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.75,
      notes: "Sustainability report.",
      sources: [
        {
          url: "https://www.flyporter.com/Content/Documents/Porter_2023_Sustainability_Report.pdf",
          title: "Porter 2023 Sustainability Report",
          publisher: "Porter Airlines",
          reliability: 0.75,
          claimExcerpt: "KPIs/initiatives for fleet and operations.",
        },
      ],
    },
  ];

  // Helper to write facts + sources
  async function writeFactAndSources(f: FactInput) {
    const company = companyByName.get(f.company);
    const tag = tagByKey.get(f.tagKey);
    if (!company || !tag) {
      console.warn(
        `⚠️ Skipping fact: company or tag not found ->`,
        f.company,
        f.tagKey
      );
      return { fact: null, sources: 0 };
    }

    const fact = await prisma.companyTagFact.create({
      data: {
        companyId: company.id,
        tagId: tag.id,
        stance: f.stance,
        confidence: f.confidence,
        notes: f.notes ?? null,
        sourceUrls: f.sources.map((s) => s.url),
        lastVerifiedAt: new Date(),
      },
    });

    let n = 0;
    for (const s of f.sources) {
      await prisma.source.create({
        data: {
          companyId: company.id,
          tagId: tag.id,
          url: s.url,
          title: s.title,
          publisher: s.publisher,
          publishedAt: s.publishedAt ?? null,
          reliability: s.reliability,
          claimExcerpt: s.claimExcerpt,
        },
      });
      n++;
    }
    return { fact, sources: n };
  }

  // 5) Write all facts
  let createdFacts = 0;
  let createdSources = 0;

  for (const f of controversialFacts) {
    const { fact, sources } = await writeFactAndSources(f);
    if (fact) createdFacts++;
    createdSources += sources;
  }
  for (const f of positiveFacts) {
    const { fact, sources } = await writeFactAndSources(f);
    if (fact) createdFacts++;
    createdSources += sources;
  }

  console.log(`✅ CompanyTagFacts created: ${createdFacts}`);
  console.log(`✅ Sources created: ${createdSources}`);
  console.log("🎉 Seed complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
