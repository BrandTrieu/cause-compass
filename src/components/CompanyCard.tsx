import Link from 'next/link'
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
  topTags, 
  topSources,
  variant = 'default'
}: CompanyCardProps) {
  const tagMap: Record<string, string> = {
    free_palestine: 'Free Palestine',
    russia_ukraine: 'Russia Ukraine',
    feminism_workplace: 'Feminism/Workplace',
    child_labour: 'Child Labour',
    lgbtq: 'LGBTQ+',
    animal_cruelty: 'Animal Cruelty',
    environmentally_friendly: 'Environment',
    ethical_sourcing: 'Ethical Sourcing',
    data_privacy: 'Data Privacy'
  }

  if (variant === 'mini') {
    return (
      <Link href={`/company/${id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
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
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/company/${id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl mb-2">{name}</CardTitle>
              <Badge variant="outline" className="inline-block">
                {category.toLowerCase()}
              </Badge>
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
