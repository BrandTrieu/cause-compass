import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ScoreBar } from '@/components/ScoreBar'
import { TagBadge } from '@/components/TagBadge'
import { Stance } from '@prisma/client'

interface CompanyCardProps {
  id: string
  name: string
  category: string
  summary?: string
  score: number
  logoUrl?: string
  topTags: Array<{
    tagKey: string
    stance: Stance
    confidence: number
  }>
  topSources: Array<{
    url: string
    publisher?: string
    publishedAt?: string
  }>
  variant?: 'default' | 'mini'
}

export function CompanyCard({ 
  id, 
  name, 
  category, 
  summary, 
  score, 
  logoUrl,
  topTags, 
  topSources,
  variant = 'default'
}: CompanyCardProps) {
  const tagMap: Record<string, string> = {
    free_palestine: 'Free Palestine',
    russia_ukraine: 'Russia Ukraine',
    women_workplace: 'Women in the Workplace',
    child_labour: 'Against Child Labour',
    lgbtq: 'LGBTQ Rights',
    animal_cruelty: 'Against Animal Cruelty',
    environmentally_friendly: 'Environment',
    ethical_sourcing: 'Ethical Sourcing',
    data_privacy: 'Data Privacy'
  }

  // Generate company logo URL or use placeholder
  const getCompanyLogo = (companyName: string, logoUrl?: string) => {
    if (logoUrl) return logoUrl
    
    // Generate logo using a service like Clearbit or use initials
    const initials = companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&color=fff&size=64&bold=true&format=png`
  }

  // Check if the logo is an SVG
  const isSvgLogo = (url?: string) => {
    if (!url) return false
    return url.includes('.svg') || url.includes('simpleicons.org') || url.includes('worldvectorlogo.com')
  }

  if (variant === 'mini') {
    return (
      <Link href={`/company/${id}?score=${score}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0">
                <Image
                  src={getCompanyLogo(name, logoUrl)}
                  alt={`${name} logo`}
                  width={40}
                  height={40}
                  className="rounded-lg object-contain"
                  unoptimized={isSvgLogo(logoUrl)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">{name}</h3>
                <Badge variant="outline" className="text-xs inline-block">
                  {category.toLowerCase()}
                </Badge>
              </div>
            </div>
            <ScoreBar score={score} className="mb-3" />
            <div className="flex flex-wrap gap-1">
              {topTags.slice(0, 2).map((tag, index) => (
                <TagBadge
                  key={index}
                  tagName={tagMap[tag.tagKey] || tag.tagKey}
                  stance={tag.stance}
                  confidence={tag.confidence}
                  className="text-xs"
                  nameOnly={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/company/${id}?score=${score}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <Image
                  src={getCompanyLogo(name, logoUrl)}
                  alt={`${name} logo`}
                  width={60}
                  height={60}
                  className="rounded-lg object-contain"
                  unoptimized={isSvgLogo(logoUrl)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl mb-2">{name}</CardTitle>
                <Badge variant="outline" className="inline-block">
                  {category.toLowerCase()}
                </Badge>
              </div>
            </div>
            <div className="flex-shrink-0 w-full sm:w-48">
              <ScoreBar score={score} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {summary && (
            <p className="text-gray-600 mb-4 line-clamp-2">{summary}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {topTags.map((tag, index) => (
              <TagBadge
                key={index}
                tagName={tagMap[tag.tagKey] || tag.tagKey}
                stance={tag.stance}
                confidence={tag.confidence}
                nameOnly={true}
              />
            ))}
          </div>
          {topSources.length > 0 && (
            <div className="text-sm text-gray-500">
              Sources: {topSources.slice(0, 2).map(s => s.publisher).filter(Boolean).join(', ')}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
