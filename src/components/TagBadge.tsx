import { Badge } from '@/components/ui/Badge'
import { Stance } from '@prisma/client'

interface TagBadgeProps {
  tagName: string
  stance: Stance
  confidence: number
  className?: string
}

export function TagBadge({ tagName, stance, confidence, className }: TagBadgeProps) {
  const getVariant = (stance: Stance) => {
    switch (stance) {
      case 'supports':
        return 'success'
      case 'opposes':
      case 'alleged_violation':
        return 'destructive'
      case 'neutral':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getStanceText = (stance: Stance) => {
    switch (stance) {
      case 'supports':
        return 'Supports'
      case 'opposes':
        return 'Opposes'
      case 'alleged_violation':
        return 'Violation'
      case 'neutral':
        return 'Neutral'
      default:
        return 'Unknown'
    }
  }

  return (
    <Badge variant={getVariant(stance)} className={className}>
      {tagName}: {getStanceText(stance)} ({Math.round(confidence * 100)}%)
    </Badge>
  )
}
