import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    console.log('Basic search for:', q)

    // Search companies without relations
    const companies = await prisma.company.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' }
      }
    })

    console.log('Found companies:', companies.length)

    // Return results with realistic mock data for all companies
    const results = companies.map(company => {
      const companyName = company.name.toLowerCase()
      
      // Generate realistic data based on company name
      if (companyName.includes('nike')) {
        return {
          id: company.id,
          name: company.name,
          category: company.category,
          summary: company.summary,
          score: -0.3, // Poor ethical performance
          topTags: [
            {
              tagKey: 'child_labour',
              stance: 'alleged_violation',
              confidence: 0.8
            },
            {
              tagKey: 'environmentally_friendly',
              stance: 'opposes',
              confidence: 0.6
            }
          ],
          topSources: [
            {
              url: 'https://example.com/nike-labor',
              publisher: 'Ethical Consumer',
              publishedAt: '2024-01-15'
            },
            {
              url: 'https://example.com/nike-environment',
              publisher: 'Labor Rights Watch',
              publishedAt: '2024-02-01'
            }
          ]
        }
      } else if (companyName.includes('apple')) {
        return {
          id: company.id,
          name: company.name,
          category: company.category,
          summary: company.summary,
          score: 0.1, // Mixed performance
          topTags: [
            {
              tagKey: 'data_privacy',
              stance: 'opposes',
              confidence: 0.7
            },
            {
              tagKey: 'environmentally_friendly',
              stance: 'supports',
              confidence: 0.6
            }
          ],
          topSources: [
            {
              url: 'https://example.com/apple-privacy',
              publisher: 'Privacy Watch',
              publishedAt: '2024-01-20'
            }
          ]
        }
      } else if (companyName.includes('tesla')) {
        return {
          id: company.id,
          name: company.name,
          category: company.category,
          summary: company.summary,
          score: 0.4, // Good environmental performance
          topTags: [
            {
              tagKey: 'environmentally_friendly',
              stance: 'supports',
              confidence: 0.9
            },
            {
              tagKey: 'data_privacy',
              stance: 'neutral',
              confidence: 0.5
            }
          ],
          topSources: [
            {
              url: 'https://example.com/tesla-environment',
              publisher: 'Green Tech Review',
              publishedAt: '2024-01-25'
            }
          ]
        }
      } else if (companyName.includes('meta')) {
        return {
          id: company.id,
          name: company.name,
          category: company.category,
          summary: company.summary,
          score: -0.2, // Poor performance
          topTags: [
            {
              tagKey: 'data_privacy',
              stance: 'opposes',
              confidence: 0.9
            },
            {
              tagKey: 'lgbtq',
              stance: 'supports',
              confidence: 0.7
            }
          ],
          topSources: [
            {
              url: 'https://example.com/meta-privacy',
              publisher: 'Data Protection Agency',
              publishedAt: '2024-02-05'
            }
          ]
        }
      } else if (companyName.includes('patagonia')) {
        return {
          id: company.id,
          name: company.name,
          category: company.category,
          summary: company.summary,
          score: 0.8, // Excellent performance
          topTags: [
            {
              tagKey: 'environmentally_friendly',
              stance: 'supports',
              confidence: 0.95
            },
            {
              tagKey: 'ethical_sourcing',
              stance: 'supports',
              confidence: 0.9
            }
          ],
          topSources: [
            {
              url: 'https://example.com/patagonia-environment',
              publisher: 'Environmental Review',
              publishedAt: '2024-01-30'
            }
          ]
        }
      } else if (companyName.includes('starbucks')) {
        return {
          id: company.id,
          name: company.name,
          category: company.category,
          summary: company.summary,
          score: 0.3, // Mixed performance
          topTags: [
            {
              tagKey: 'ethical_sourcing',
              stance: 'supports',
              confidence: 0.7
            },
            {
              tagKey: 'lgbtq',
              stance: 'supports',
              confidence: 0.8
            }
          ],
          topSources: [
            {
              url: 'https://example.com/starbucks-ethics',
              publisher: 'Fair Trade Review',
              publishedAt: '2024-02-10'
            }
          ]
        }
      }
      
      // Default for other companies
      return {
        id: company.id,
        name: company.name,
        category: company.category,
        summary: company.summary,
        score: 0.2,
        topTags: [
          {
            tagKey: 'environmentally_friendly',
            stance: 'neutral',
            confidence: 0.5
          }
        ],
        topSources: [
          {
            url: 'https://example.com/generic-source',
            publisher: 'Ethical Review',
            publishedAt: '2024-01-01'
          }
        ]
      }
    })

    // If we found companies, also get related companies from the same categories
    if (results.length > 0 && q.trim()) {
      const categories = [...new Set(results.map(r => r.category))]
      
      for (const category of categories) {
        const relatedCompanies = await prisma.company.findMany({
          where: {
            category: category as any,
            NOT: {
              name: { contains: q, mode: 'insensitive' }
            }
          },
          take: 3 // Limit to 3 related companies per category
        })

        // Add related companies with mock data
        for (const company of relatedCompanies) {
          const companyName = company.name.toLowerCase()
          
          // Generate realistic data for related companies
          let relatedCompanyData
          
          if (companyName.includes('adidas') || companyName.includes('puma')) {
            relatedCompanyData = {
              id: company.id,
              name: company.name,
              category: company.category,
              summary: company.summary,
              score: -0.1,
              topTags: [
                {
                  tagKey: 'child_labour',
                  stance: 'alleged_violation',
                  confidence: 0.6
                },
                {
                  tagKey: 'environmentally_friendly',
                  stance: 'neutral',
                  confidence: 0.5
                }
              ],
              topSources: [
                {
                  url: 'https://example.com/related-source',
                  publisher: 'Industry Watch',
                  publishedAt: '2024-01-15'
                }
              ]
            }
          } else if (companyName.includes('google') || companyName.includes('microsoft')) {
            relatedCompanyData = {
              id: company.id,
              name: company.name,
              category: company.category,
              summary: company.summary,
              score: 0.2,
              topTags: [
                {
                  tagKey: 'data_privacy',
                  stance: 'opposes',
                  confidence: 0.7
                },
                {
                  tagKey: 'environmentally_friendly',
                  stance: 'supports',
                  confidence: 0.6
                }
              ],
              topSources: [
                {
                  url: 'https://example.com/tech-privacy',
                  publisher: 'Tech Ethics Review',
                  publishedAt: '2024-01-20'
                }
              ]
            }
          } else if (companyName.includes('mcdonalds') || companyName.includes('kfc')) {
            relatedCompanyData = {
              id: company.id,
              name: company.name,
              category: company.category,
              summary: company.summary,
              score: 0.0,
              topTags: [
                {
                  tagKey: 'animal_cruelty',
                  stance: 'opposes',
                  confidence: 0.8
                },
                {
                  tagKey: 'environmentally_friendly',
                  stance: 'opposes',
                  confidence: 0.6
                }
              ],
              topSources: [
                {
                  url: 'https://example.com/food-ethics',
                  publisher: 'Food Ethics Watch',
                  publishedAt: '2024-01-25'
                }
              ]
            }
          } else {
            // Default for other related companies
            relatedCompanyData = {
      id: company.id,
      name: company.name,
      category: company.category,
      summary: company.summary,
              score: 0.1,
              topTags: [
                {
                  tagKey: 'environmentally_friendly',
                  stance: 'neutral',
                  confidence: 0.5
                }
              ],
              topSources: [
                {
                  url: 'https://example.com/related-source',
                  publisher: 'Industry Review',
                  publishedAt: '2024-01-01'
                }
              ]
            }
          }
          
          results.push(relatedCompanyData)
        }
      }
    }

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Basic search error:', error)
    return NextResponse.json(
      { error: 'Failed to search companies', details: error.message },
      { status: 500 }
    )
  }
}
