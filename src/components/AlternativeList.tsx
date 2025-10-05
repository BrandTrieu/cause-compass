import { CompanyCard } from '@/components/CompanyCard'

interface Alternative {
  id: string
  name: string
  category: string
  summary?: string
  logoUrl?: string
  score: number
}

interface AlternativeListProps {
  alternatives: Alternative[]
  className?: string
}

export function AlternativeList({ alternatives, className }: AlternativeListProps) {
  if (alternatives.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">Better Alternatives</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alternatives.map((alternative) => (
          <CompanyCard
            key={alternative.id}
            id={alternative.id}
            name={alternative.name}
            category={alternative.category}
            summary={alternative.summary}
            logoUrl={alternative.logoUrl}
            score={alternative.score}
            topTags={[]} // We don't have tag data for alternatives in this context
            topSources={[]}
            variant="mini"
          />
        ))}
      </div>
    </div>
  )
}
