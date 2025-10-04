import { Source } from '@prisma/client'
import { format } from 'date-fns'

interface SourceListProps {
  sources: Source[]
  className?: string
}

export function SourceList({ sources, className }: SourceListProps) {
  if (sources.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <h4 className="font-semibold text-sm text-gray-700 mb-2">Sources</h4>
      <ul className="space-y-2">
        {sources.map((source) => (
          <li key={source.id} className="text-sm">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {source.title || new URL(source.url).hostname}
            </a>
            {source.publisher && (
              <span className="text-gray-500 ml-2">
                - {source.publisher}
              </span>
            )}
            {source.publishedAt && (
              <span className="text-gray-400 ml-2">
                ({format(new Date(source.publishedAt), 'MMM yyyy')})
              </span>
            )}
            {source.reliability && (
              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                {Math.round(source.reliability * 100)}% reliable
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
