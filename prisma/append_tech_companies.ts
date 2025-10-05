// prisma/append_tech_companies.ts
import { PrismaClient, Category, Stance } from "@prisma/client";

const prisma = new PrismaClient();

// ---------- Types ----------
type PositiveSource = {
  url: string;
  title?: string | null;
  publisher?: string | null;
  reliability?: number | null;
  publishedAt?: Date | null;
  claimExcerpt?: string | null;
};

type FactInput = {
  company: string;
  tagKey: string;
  stance: Stance;
  confidence: number; // 0..1
  notes?: string;
  sources: PositiveSource[];
};

type CompanyInput = {
  name: string;
  category: Category;
  website?: string | null;
  summary?: string | null;
  logoUrl?: string | null;
};

// Normalize comparisons (keeps DB data intact)
const normalize = (s: string) =>
  s
    .normalize("NFKC")
    .replace(/[\u2018\u2019\u2032\u00B4]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

async function main() {
  console.log("🔧 Appending tech companies + facts + sources...");

  // --- 0) Ensure tag keys exist (idempotent) ---
  const TAG_KEYS = [
    "lgbtq",
    "child_labour",
    "data_privacy",
    "animal_cruelty",
    "free_palestine",
    "justice_for_ukraine",
    "ethical_sourcing",
    "women_workplace",
    "environmentally_friendly",
  ] as const;

  // Upsert minimal tag rows (names/descriptions are placeholders if missing)
  await Promise.all(
    TAG_KEYS.map((key) =>
      prisma.tag.upsert({
        where: { key },
        update: {},
        create: {
          key,
          tag_name:
            key
              .split("_")
              .map((w) => w[0].toUpperCase() + w.slice(1))
              .join(" ") || key,
          description: null,
        },
      })
    )
  );

  const tags = await prisma.tag.findMany({ where: { key: { in: TAG_KEYS as any } } });
  const tagByKey = new Map(tags.map((t) => [t.key, t]));

  // --- 1) Upsert companies (controversials + alternatives) ---
  const companyDefs: CompanyInput[] = [
    // Controversial — all TECH
    {
      name: "Apple",
      category: Category.TECH,
      website: "https://www.apple.com",
      summary:
        "Global consumer-tech company known for iPhone, Mac, iPad, and services; lauded for privacy marketing, criticized over supply-chain labor and repairability.",
      logoUrl: "https://cdn.simpleicons.org/apple",
    },
    {
      name: "Meta",
      category: Category.TECH,
      website: "https://about.meta.com",
      summary:
        "Social media and ads company (Facebook, Instagram, WhatsApp); repeated privacy and data-transfer enforcement actions.",
      logoUrl: "https://cdn.simpleicons.org/meta",
    },
    {
      name: "Tesla",
      category: Category.TECH,
      website: "https://www.tesla.com",
      summary:
        "EV and clean-energy company; advances zero-emissions transport, criticized for workplace discrimination and labor issues.",
      logoUrl: "https://cdn.simpleicons.org/tesla",
    },
    {
      name: "Google",
      category: Category.TECH,
      website: "https://about.google",
      summary:
        "Search and cloud giant; strong climate targets, significant privacy and antitrust actions against it.",
      logoUrl: "https://cdn.simpleicons.org/google",
    },
    {
      name: "Samsung",
      category: Category.TECH,
      website: "https://www.samsung.com",
      summary:
        "Electronics conglomerate spanning phones, TVs, chips; praised for recycled materials, criticized over supply-chain labor risks.",
      logoUrl: "https://cdn.simpleicons.org/samsung",
    },

    // Alternatives
    {
      name: "Fairphone",
      category: Category.TECH,
      website: "https://www.fairphone.com",
      summary:
        "Ethical smartphone maker focused on fair materials, living-wage supply chains, and long device lifespans via modular repair.",
      logoUrl: "https://logo.clearbit.com/fairphone.com",
    },
    {
      name: "Framework",
      category: Category.TECH,
      website: "https://frame.work",
      summary:
        "Modular laptops designed for easy upgrades/repairs and reduced e-waste; publishes parts and guides.",
      logoUrl: "https://logo.clearbit.com/frame.work",
    },
    {
      name: "Signal",
      category: Category.TECH,
      website: "https://signal.org",
      summary:
        "Nonprofit encrypted messenger using the Signal Protocol; designed to minimize retained metadata.",
      logoUrl: "https://logo.clearbit.com/signal.org",
    },
    {
      name: "Mozilla",
      category: Category.TECH,
      website: "https://www.mozilla.org",
      summary:
        "Nonprofit behind Firefox; advocates for privacy, publishes workforce inclusion metrics and product privacy research.",
      logoUrl: "https://logo.clearbit.com/mozilla.org",
    },
    {
      name: "Polestar",
      category: Category.TECH,
      website: "https://www.polestar.com",
      summary:
        "EV maker publishing model LCAs and expanding blockchain traceability of risk materials in batteries.",
      logoUrl: "https://logo.clearbit.com/polestar.com",
    },
    {
      name: "Volvo Cars",
      category: Category.TECH,
      website: "https://www.volvocars.com",
      summary:
        "Automaker investing in traceability and human-rights due diligence for battery materials; publishes modern-slavery statements.",
      logoUrl: "https://logo.clearbit.com/volvocars.com",
    },
    {
      name: "DuckDuckGo",
      category: Category.TECH,
      website: "https://duckduckgo.com",
      summary:
        "Privacy-focused search; does not create search-history profiles and minimizes data collection.",
      logoUrl: "https://logo.clearbit.com/duckduckgo.com",
    },
    {
      name: "Proton",
      category: Category.TECH,
      website: "https://proton.me",
      summary:
        "Privacy-by-default email/cloud suite with end-to-end and zero-access encryption; transparent legal-request stats.",
      logoUrl: "https://logo.clearbit.com/proton.me",
    },
    {
      name: "Nokia (HMD)",
      category: Category.TECH,
      website: "https://www.hmd.com",
      summary:
        "HMD’s Nokia-branded phones emphasize user-replaceable parts and right-to-repair collaborations with iFixit.",
      logoUrl: "https://logo.clearbit.com/hmd.com",
    },
  ];

  const companies = await Promise.all(
    companyDefs.map((c) =>
      prisma.company.upsert({
        where: { name: c.name },
        update: {
          category: c.category,
          website: c.website ?? null,
          summary: c.summary ?? null,
          logoUrl: c.logoUrl ?? null,
        },
        create: {
          name: c.name,
          category: c.category,
          website: c.website ?? null,
          summary: c.summary ?? null,
          logoUrl: c.logoUrl ?? null,
        },
      })
    )
  );

  const companyByName = new Map(companies.map((c) => [normalize(c.name), c]));
  console.log(`✅ Upserted companies: ${companies.length}`);

  // --- 2) Build facts from your provided data ---
  const controversialFacts: FactInput[] = [
    // Apple
    {
      company: "Apple",
      tagKey: "child_labour",
      stance: Stance.alleged_violation,
      confidence: 0.8,
      sources: [
        {
          url: "https://www.amnesty.org/en/documents/afr62/3183/2016/en/",
        },
      ],
    },
    {
      company: "Apple",
      tagKey: "data_privacy",
      stance: Stance.alleged_violation,
      confidence: 0.75,
      sources: [
        {
          url: "https://www.reuters.com/technology/french-antitrust-regulator-fines-apple-150-million-euros-over-privacy-tool-2025-03-31/",
        },
      ],
    },
    {
      company: "Apple",
      tagKey: "data_privacy",
      stance: Stance.supports,
      confidence: 0.7,
      sources: [
        {
          url: "https://support.apple.com/en-ca/102283",
        },
      ],
    },

    // Meta
    {
      company: "Meta",
      tagKey: "data_privacy",
      stance: Stance.alleged_violation,
      confidence: 0.9,
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Privacy_concerns_with_Facebook",
        },
        {
          url: "https://www.ftc.gov/news-events/news/press-releases/2019/07/ftc-imposes-5-billion-penalty-sweeping-new-privacy-restrictions-facebook",
        },
      ],
    },

    // Tesla
    {
      company: "Tesla",
      tagKey: "women_workplace",
      stance: Stance.alleged_violation,
      confidence: 0.85,
      sources: [
        {
          url: "https://calcivilrights.ca.gov/2022/02/10/dfeh-sues-tesla-inc-for-race-discrimination-and-harassment/",
        },
      ],
    },
    {
      company: "Tesla",
      tagKey: "ethical_sourcing",
      stance: Stance.alleged_violation,
      confidence: 0.75,
      notes: "Labor rights / union organizing allegation",
      sources: [
        {
          url: "https://www.reuters.com/business/autos-transportation/tesla-interfered-with-union-organizing-new-york-plant-us-agency-claims-2024-05-09/",
        },
      ],
    },

    // Google
    {
      company: "Google",
      tagKey: "data_privacy",
      stance: Stance.alleged_violation,
      confidence: 0.8,
      sources: [{ url: "https://www.bbc.com/news/articles/c3dr91z0g4zo" }],
    },
    {
      company: "Google",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.75,
      sources: [{ url: "https://sustainability.google/progress/" }],
    },

    // Samsung
    {
      company: "Samsung",
      tagKey: "child_labour",
      stance: Stance.alleged_violation,
      confidence: 0.8,
      sources: [{ url: "https://www.amnesty.org/en/documents/afr62/3183/2016/en/" }],
    },
    {
      company: "Samsung",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.7,
      sources: [
        {
          url: "https://news.samsung.com/global/samsung-electronics-receives-the-2022-seal-business-sustainability-award-for-repurposing-ocean-bound-plastic",
        },
      ],
    },
  ];

  const alternativeFacts: FactInput[] = [
    // Apple alternatives
    {
      company: "Fairphone",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.85,
      sources: [{ url: "https://www.ifixit.com/Device/Fairphone_5" }],
    },
    {
      company: "Fairphone",
      tagKey: "ethical_sourcing",
      stance: Stance.supports,
      confidence: 0.8,
      sources: [{ url: "https://www.fairphone.com/en/impact/fair-materials/" }],
    },
    {
      company: "Framework",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.85,
      sources: [
        { url: "https://www.ifixit.com/repairability/laptop-repairability-scores" },
        { url: "https://www.ifixit.com/News/51614/framework-laptop-teardown-10-10-but-is-it-perfect" },
      ],
    },

    // Meta alternatives
    {
      company: "Signal",
      tagKey: "data_privacy",
      stance: Stance.supports,
      confidence: 0.9,
      sources: [
        { url: "https://support.signal.org/hc/en-us/articles/360007059412-Signal-and-the-General-Data-Protection-Regulation-GDPR" },
        { url: "https://signal.org/docs/" },
      ],
    },
    {
      company: "Mozilla",
      tagKey: "women_workplace",
      stance: Stance.supports,
      confidence: 0.75,
      sources: [{ url: "https://assets.mozilla.net/pdf/Impact_Report_2024.pdf" }],
    },
    {
      company: "Mozilla",
      tagKey: "data_privacy",
      stance: Stance.supports,
      confidence: 0.8,
      sources: [{ url: "https://www.mozillafoundation.org/en/privacynotincluded/" }],
    },

    // Tesla alternatives
    {
      company: "Polestar",
      tagKey: "ethical_sourcing",
      stance: Stance.supports,
      confidence: 0.75,
      sources: [{ url: "https://media.polestar.com/global/en/media/pressreleases/500098" }],
    },
    {
      company: "Polestar",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.85,
      sources: [{ url: "https://www.polestar.com/dato-assets/11286/1732276748-polestar-2_lca_report_my23-my25_final_2024-11-19.pdf" }],
    },
    {
      company: "Volvo Cars",
      tagKey: "ethical_sourcing",
      stance: Stance.supports,
      confidence: 0.8,
      sources: [
        { url: "https://www.media.volvocars.com/global/en-gb/media/pressreleases/260242/volvo-cars-to-implement-blockchain-traceability-of-cobalt-used-in-electric-car-batteries" },
        { url: "https://www.volvocars.com/my/sustainability/downloads/" },
      ],
    },

    // Google alternatives
    {
      company: "DuckDuckGo",
      tagKey: "data_privacy",
      stance: Stance.supports,
      confidence: 0.9,
      sources: [
        { url: "https://duckduckgo.com/privacy" },
        { url: "https://duckduckgo.com/duckduckgo-help-pages/privacy-pro/terms-and-privacy" },
      ],
    },
    {
      company: "Proton",
      tagKey: "data_privacy",
      stance: Stance.supports,
      confidence: 0.9,
      sources: [
        { url: "https://proton.me/legal/transparency" },
        { url: "https://proton.me/blog/zero-access-encryption" },
      ],
    },

    // Samsung alternatives
    {
      company: "Fairphone",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.85,
      sources: [{ url: "https://www.ifixit.com/Device/Fairphone_5" }],
    },
    {
      company: "Fairphone",
      tagKey: "ethical_sourcing",
      stance: Stance.supports,
      confidence: 0.8,
      sources: [{ url: "https://www.fairphone.com/en/impact/fair-materials/" }],
    },
    {
      company: "Nokia (HMD)",
      tagKey: "environmentally_friendly",
      stance: Stance.supports,
      confidence: 0.75,
      sources: [
        { url: "https://www.ifixit.com/News/76105/just-how-repairable-is-nokias-g22" },
        { url: "https://www.ifixit.com/Device/Nokia_G22" },
      ],
    },
  ];

  // --- 3) Helpers to avoid duplicates ---
  async function ensureFactAndSources(f: FactInput) {
    const company = companyByName.get(normalize(f.company));
    const tag = tagByKey.get(f.tagKey);
    if (!company || !tag) {
      console.warn(`⚠️ Skipping fact, missing company or tag:`, f.company, f.tagKey);
      return { factCreated: false, sourcesCreated: 0 };
    }

    // Avoid duplicate facts: match by (companyId, tagId, stance)
    let fact = await prisma.companyTagFact.findFirst({
      where: {
        companyId: company.id,
        tagId: tag.id,
        stance: f.stance,
      },
    });

    if (!fact) {
      fact = await prisma.companyTagFact.create({
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
    } else {
      // Update confidence/notes/sourceUrls if new info is richer
      const mergedUrls = Array.from(new Set([...(fact.sourceUrls ?? []), ...f.sources.map((s) => s.url)]));
      await prisma.companyTagFact.update({
        where: { id: fact.id },
        data: {
          confidence: Math.max(fact.confidence ?? 0, f.confidence ?? 0),
          notes: fact.notes ?? f.notes ?? null,
          sourceUrls: mergedUrls,
          lastVerifiedAt: new Date(),
        },
      });
    }

    // Insert sources (skip if same companyId+tagId+url exists)
    let created = 0;
    for (const s of f.sources) {
      const exists = await prisma.source.findFirst({
        where: {
          companyId: company.id,
          tagId: tag.id,
          url: s.url,
        },
        select: { id: true },
      });
      if (!exists) {
        await prisma.source.create({
          data: {
            companyId: company.id,
            tagId: tag.id,
            url: s.url,
            title: s.title ?? null,
            publisher: s.publisher ?? null,
            publishedAt: s.publishedAt ?? null,
            reliability: s.reliability ?? null,
            claimExcerpt: s.claimExcerpt ?? null,
          },
        });
        created++;
      }
    }
    return { factCreated: true, sourcesCreated: created };
  }

  // --- 4) Write all facts ---
  let factsCount = 0;
  let sourcesCount = 0;

  for (const f of [...controversialFacts, ...alternativeFacts]) {
    const { factCreated, sourcesCreated } = await ensureFactAndSources(f);
    if (factCreated) factsCount++;
    sourcesCount += sourcesCreated;
  }

  console.log(`✅ Facts processed: ${factsCount}`);
  console.log(`✅ Sources created (new): ${sourcesCount}`);
  console.log("🎉 Append complete");
}

main()
  .catch((e) => {
    console.error("❌ Append failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
