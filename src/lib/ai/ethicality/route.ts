import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const MODEL_ID = "gemini-2.5-flash";

export async function POST(req: Request) {
  try {
    const { q } = await req.json();
    if (!q || typeof q !== "string") {
      return NextResponse.json({ ok: false, error: "Provide { q: string }" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_ID });

    const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: `Use web search to answer concisely and cite sources.\n\nQuery: ${q}` }],
          },
        ],
        tools: [{ googleSearchRetrieval: {} }], 
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 400,
        },
      });
      

    const text = result.response.text();

    // Try to pull citations from grounding metadata (if present)
    const cand = result.response.candidates?.[0] as { groundingMetadata?: { citations?: Array<{ uri?: string; web?: { uri?: string }; title?: string; web?: { title?: string } }> } };
    const gm = cand?.groundingMetadata;
    const citations =
      gm?.citations?.map((c) => ({
        url: c.uri || c.web?.uri,
        title: c.title || c.web?.title || null,
      }))?.filter((c) => !!c.url) ?? [];

    return NextResponse.json({ ok: true, model: MODEL_ID, answer: text, citations });
  } catch (err) {
    console.error("Grounded search failed:", err);
    return NextResponse.json({ ok: false, error: "Grounded query failed" }, { status: 500 });
  }
}
