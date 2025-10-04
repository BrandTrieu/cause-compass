import { clsx } from 'clsx'

interface ScoreBarProps {
  score: number // -1 to 1
  className?: string
}

export function ScoreBar({ score, className }: ScoreBarProps) {
  // Normalize score to 0-100 for percentage
  // Convert from -1 to +1 range to 0 to 100 range
  const percentage = Math.round(((score + 1) / 2) * 100)
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log(`ScoreBar: score=${score}, percentage=${percentage}`)
  }
  
  // Determine color based on percentage
  const getColorClass = (percentage: number) => {
    if (percentage >= 65) return 'from-green-500 to-green-400'
    if (percentage <= 35) return 'from-red-500 to-red-400'
    return 'from-yellow-500 to-yellow-400'
  }

  // Determine label based on score
  const getLabel = (score: number) => {
    if (score >= 0.3) return 'Aligned'
    if (score >= -0.3) return 'Mixed'
    return 'Conflicts'
  }

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex justify-between text-xs text-text-muted mb-1">
        <span>Conflicts</span>
        <span>Mixed</span>
        <span>Aligned</span>
      </div>
      <div className="w-full bg-border rounded-full h-2 relative">
        <div
          className={clsx(
            'h-2 rounded-full bg-gradient-to-r transition-all duration-300',
            getColorClass(percentage)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-center mt-1">
        <span className="text-sm font-medium text-foreground text-center">
          {getLabel(score)} ({Math.round(percentage)}%)
        </span>
      </div>
    </div>
  )
}
