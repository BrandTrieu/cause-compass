import { GoogleGenerativeAI } from '@google/generative-ai'
import { Company, CompanyTagFact, Source, Tag } from '@prisma/client'
import { Prefs, getTopWeightedTags } from '@/lib/db/scoring'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface SummaryInput {
  company: Company
  facts: (CompanyTagFact & { tag: Tag })[]
  sources: Source[]
  prefs: Prefs
  mode: 'user' | 'guest'
}

export async function generateSummary({
  company,
  facts,
  sources,
  prefs,
  mode
}: SummaryInput): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 200
      }
    })

    // Get top facts by confidence
    const topFacts = facts
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)

    // Get top sources by reliability
    const topSources = sources
      .filter(s => s.reliability && s.publisher)
      .sort((a, b) => (b.reliability || 0) - (a.reliability || 0))
      .slice(0, 3)

    const sourcePublishers = topSources
      .map(s => s.publisher)
      .filter(Boolean)
      .slice(0, 2)

    let prompt: string

    if (mode === 'user') {
      const topWeightedTags = getTopWeightedTags(prefs, 3)
      const relevantFacts = topFacts.filter(f => topWeightedTags.includes(f.tag.key))
      
      prompt = `Write a single paragraph (90-130 words) about ${company.name}'s ethical alignment. 

Focus on how the company aligns or conflicts with these top user priorities: ${topWeightedTags.map(tag => {
        const fact = relevantFacts.find(f => f.tag.key === tag)
        return fact ? `${tag} (${fact.stance}, ${Math.round(fact.confidence * 100)}% confidence)` : tag
      }).join(', ')}.

Use an objective, informative tone. Include 1-2 publisher names from: ${sourcePublishers.join(', ')}. Do not include URLs in the paragraph.

Company context: ${company.summary || 'No summary available'}.`
    } else {
      const factSummary = topFacts
        .map(f => `${f.tag.tag_name}: ${f.stance} (${Math.round(f.confidence * 100)}% confidence)`)
        .join(', ')

      prompt = `Write a single paragraph (90-130 words) about ${company.name}'s general ethicality.

Focus on the most confident facts: ${factSummary}.

Use an objective, informative tone. Include 1-2 publisher names from: ${sourcePublishers.join(', ')}. Do not include URLs in the paragraph.

Company context: ${company.summary || 'No summary available'}.`
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Ensure the response is within word limits
    const words = text.split(/\s+/)
    if (words.length > 130) {
      return words.slice(0, 130).join(' ') + '...'
    }

    return text.trim()
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to generate summary')
  }
}
