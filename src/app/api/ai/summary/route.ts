import { NextResponse } from "next/server";
import { PrismaClient, Stance } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";

// Ensure Node runtime for Prisma
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
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

function stanceRollup(facts: Array<{ stance: Stance }>): string {
  const counts: Record<Stance, number> = {
    supports: 0,
    opposes: 0,
    alleged_violation: 0,
    neutral: 0,
  };
  for (const f of facts) counts[f.stance]++;
  const parts: string[] = [];
  if (counts.supports) parts.push(`supports: ${counts.supports}`);
  if (counts.opposes) parts.push(`opposes: ${counts.opposes}`);
  if (counts.alleged_violation) parts.push(`alleged_violation: ${counts.alleged_violation}`);
  if (counts.neutral) parts.push(`neutral: ${counts.neutral}`);
  return parts.length ? parts.join(" · ") : "no recorded stances";
}

function generateEthicalityPrompt(input: {
  companyName: string;
  ethicalityRating: number | null;
  tags: string[];
  stanceSummary: string;
  recentArticles: Array<{ title?: string | null; url: string; publisher?: string | null; publishedAt?: string | null }>;
}) {
  const { companyName, ethicalityRating, tags, stanceSummary, recentArticles } = input;

  const seedLinks = recentArticles
    .slice(0, 6)
    .map(
      (a, i) =>
        `${i + 1}. ${a.title || a.publisher || a.url} — ${a.url}${a.publishedAt ? ` (published ${a.publishedAt})` : ""}`
    )
    .join("\n");

  const ratingText =
    ethicalityRating == null
      ? "No internal rating available."
      : `The database ethicality rating for this company is **${ethicalityRating}/100**.`;

  return `
You are an AI ethics analyst that researches corporate behavior.

### Task
Using reputable sources, research **${companyName}** and write a 90-150 word ethicality summary that **reinforces our database rating** and tags.

${ratingText}
Relevant tags: ${tags.length ? tags.join(", ") : "(none)"}.
Internal stance rollup: ${stanceSummary}.

When researching, prefer:
- If rating is high: positive sustainability reporting, ethical certifications, notable pro-labor or inclusive practices.
- If rating is low: investigations, fines, violations, credible allegations (labor, environment, governance, discrimination).
- If evidence is sparse or mixed, say so.

### Seed links from our DB (optional):
${seedLinks || "(none)"}

### Output format (exactly):
${companyName} is a(n) <ethical/unethical/mixed> company in relation to <tags>.
<newline>
50-100 word ethicality summary 
`;
}

// Extract URLs from text so UI can render clickable sources (best-effort)
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s)>\]]+)/gi;
  return Array.from(new Set(text.match(urlRegex) || []));
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

    const rating = computeEthicalityRating(
      company.facts.map((f) => ({ stance: f.stance, confidence: f.confidence }))
    );

    const stanceSummary = stanceRollup(company.facts);

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
      tags,
      stanceSummary,
      recentArticles,
    });

    // 3) Call Gemini (no googleSearch tool here to avoid entitlement/type issues)
    const resp = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = resp.text ?? "";

    // 4) Best-effort citations (from text or seed list)
    const urls = extractUrls(text);
    const citations = urls.length
      ? urls.map((u) => ({ url: u, title: null as string | null }))
      : recentArticles.map((a) => ({ url: a.url, title: a.title || a.publisher || null }));

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
