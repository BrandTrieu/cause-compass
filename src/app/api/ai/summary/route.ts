import { NextResponse } from "next/server";
import { PrismaClient, Stance } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure Node runtime for Prisma
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const prisma = new PrismaClient();
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL_ID = "gemini-2.5-flash";

// ---------- Helpers ----------

// Map stances to signed weights (tune as you like)
const STANCE_WEIGHT: Record<Stance, number> = {
  supports: +1.0,
  neutral: 0.0,
  opposes: -1.0,
  alleged_violation: -1.25,
};

// Compute a 0..100 rating from CompanyTagFact rows
function computeEthicalityRating(facts: Array<{ stance: Stance; confidence: number }>): number | null {
  if (!facts.length) return null;
  let wsum = 0;
  let wtotal = 0;
  for (const f of facts) {
    const w = STANCE_WEIGHT[f.stance] ?? 0;
    const c = isFinite(f.confidence) ? Math.max(0, Math.min(1, f.confidence)) : 0.5;
    wsum += w * c;
    wtotal += Math.abs(c);
  }
  if (wtotal === 0) return null;
  // Map average weight (-1.25..+1) to 0..100
  const avg = wsum / wtotal; // range ~[-1.25, +1]
  const norm = (avg + 1.25) / (1.25 + 1); // map [-1.25, +1] -> [0, 1]
  return Math.round(Math.max(0, Math.min(1, norm)) * 100);
}


function generateEthicalityPrompt(input: {
  companyName: string;
  ethicalityRating: number | null;
  tagsWithStances: Array<{ tag: string; stance: string; confidence: number }>;
}) {
  const { companyName, ethicalityRating, tagsWithStances } = input;

  const ratingText =
    ethicalityRating == null
      ? "No internal rating available."
      : `The database ethicality rating for this company is **${ethicalityRating}/100**.`;

  const tagDetails = tagsWithStances
    .map(t => `${t.tag} (${t.stance}, confidence: ${Math.round(t.confidence * 100)}%)`)
    .join(", ");

  return `
You are researching ${companyName} for an ethical business assessment. 

### Company Data:
${ratingText}

### Specific Ethical Stances:
${tagDetails}

### Research Task:
Search for recent information about ${companyName}'s business practices, particularly focusing on:
${tagsWithStances.map(t => `- ${t.tag} (Reinforce the view that they ${t.stance} this issue but do not reference the databse in your response)`).join('\n')}

Look for:
- Recent news articles, investigations, or reports
- Company sustainability reports or statements
- Third-party audits or certifications
- Regulatory actions or fines
- Independent assessments of their practices

### Output Requirements:
Write a 90-120 word summary that:
1. States whether ${companyName} is ethical, unethical, or mixed in their practices
2. Provides specific evidence from your search results
3. References the key ethical issues identified in our database
4. Uses a neutral, factual tone

Do not include URLs or citations in your response text - sources will be displayed separately.
`;
}


// ---------- Route ----------

export async function POST(req: Request) {
  try {
    const { companyId } = await req.json();
    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
    }

    // 1) Pull company, facts (with tags), and recent sources
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        category: true,
        website: true,
        summary: true,
        facts: {
          select: {
            stance: true,
            confidence: true,
            notes: true,
            sourceUrls: true,
            lastVerifiedAt: true,
            tag: { select: { tag_name: true, key: true } },
          },
        },
        sources: {
          select: {
            url: true,
            title: true,
            publisher: true,
            publishedAt: true,
            reliability: true,
          },
          orderBy: { publishedAt: "desc" },
          take: 8,
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const tags = Array.from(
      new Set(company.facts.map((f) => f.tag?.tag_name).filter(Boolean) as string[])
    );

    const tagsWithStances = company.facts
      .filter(f => f.tag?.tag_name)
      .map(f => ({
        tag: f.tag!.tag_name,
        stance: f.stance,
        confidence: f.confidence
      }));

    const rating = computeEthicalityRating(
      company.facts.map((f) => ({ stance: f.stance, confidence: f.confidence }))
    );

    // Merge Source rows + embedded fact URLs (sourceUrls) as extra seed links
    const factUrlSources =
      company.facts
        .flatMap((f) => f.sourceUrls || [])
        .filter((u) => typeof u === "string" && u.startsWith("http"))
        .slice(0, 6)
        .map((u) => ({ url: u, title: null as string | null, publisher: null as string | null, publishedAt: null as string | null })) || [];

    const recentArticles = [
      ...company.sources.map((s) => ({
        url: s.url,
        title: s.title,
        publisher: s.publisher,
        publishedAt: s.publishedAt?.toISOString() ?? null,
      })),
      ...factUrlSources,
    ].slice(0, 8);

    // 2) Build the prompt
    const prompt = generateEthicalityPrompt({
      companyName: company.name,
      ethicalityRating: rating,
      tagsWithStances,
    });

    // 3) Call Gemini (temporarily without Google Search until API is properly configured)
    const model = ai.getGenerativeModel({ model: MODEL_ID });

    const resp = await model.generateContent(prompt);

    const text = resp.response.text();

    // 4) Extract grounding sources from Google Search
    const groundingMetadata = resp.response.candidates?.[0]?.groundingMetadata;
    let citations: Array<{ url: string; title: string | null }> = [];

    if (groundingMetadata?.groundingChunks) {
      citations = groundingMetadata.groundingChunks
        .filter((chunk) => chunk.web?.uri)
        .map((chunk) => ({
          url: chunk.web!.uri!,
          title: chunk.web!.title || null
        }));
    }

    // Fallback to recent articles if no grounding sources
    if (citations.length === 0) {
      citations = recentArticles.map((a) => ({ 
        url: a.url, 
        title: a.title || a.publisher || null 
      }));
    }

    return NextResponse.json({
      ok: true,
      company: { id: company.id, name: company.name, category: company.category, website: company.website },
      rating,
      tags,
      paragraph: text,
      citations,
    });
  } catch (err) {
    console.error("Ethicality summary generation failed:", err);
    return NextResponse.json({ ok: false, error: "Generation failed" }, { status: 500 });
  }
}
