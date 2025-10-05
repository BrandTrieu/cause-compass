// src/app/api/ai/summary/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs"; // ensure Node runtime (not edge) for DB client

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL_ID = "gemini-2.5-flash";

export async function POST(req: Request) {
  try {
    const { companyId, mode } = await req.json();

    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
    }

    // 1) Resolve company name from DB
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    });

    const companyName = company?.name?.trim();
    if (!companyName) {
      // Graceful message if id is bad or not found
      return NextResponse.json({
        grounded: false,
        paragraph:
          "I couldn't resolve this company from the database. Please check the company ID.",
        citations: [],
      });
    }

    // 2) Prompt Gemini using the NAME (not UUID)
    const prompt = `Find recent or controversial news articles about "${companyName}".
Summarize briefly (3–5 sentences) and include citations (publisher + URL).`;

    // NOTE: If your key doesn’t have search grounding, just call without tools.
    const resp = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      // If you enable grounding later (and typings allow), add: config: { tools: [{ googleSearch: {} }] }
    });

    const paragraph = resp.text ?? "";
    // Optional: try to extract URLs from the text for clickable sources
    const urlRegex = /(https?:\/\/[^\s)>\]]+)/gi;
    const urls = Array.from(new Set(paragraph.match(urlRegex) || []));
    const citations = urls.map((u) => ({ url: u, title: null as string | null }));

    return NextResponse.json({ grounded: false, paragraph, citations });
  } catch (err) {
    console.error("AI summary route failed:", err);
    return NextResponse.json({ error: "Failed to fetch controversial articles" }, { status: 500 });
  }
}
