import { clsx } from 'clsx'

interface ScoreBarProps {
  score: number // -1 to 1
  className?: string
}

export function ScoreBar({ score, className }: ScoreBarProps) {
  // Normalize score to 0-100 for percentage
  const percentage = Math.max(0, Math.min(100, ((score + 1) / 2) * 100))
  
  // Determine color based on score
  const getColorClass = (score: number) => {
    if (score >= 0.3) return 'from-green-500 to-green-600'
    if (score >= -0.3) return 'from-gray-400 to-gray-500'
    return 'from-red-500 to-red-600'
  }

  // Determine label based on score
  const getLabel = (score: number) => {
    if (score >= 0.3) return 'Aligned'
    if (score >= -0.3) return 'Mixed'
    return 'Conflicts'
  }

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Conflicts</span>
        <span>Mixed</span>
        <span>Aligned</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={clsx(
            'h-2 rounded-full bg-gradient-to-r transition-all duration-300',
            getColorClass(score)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-center mt-1">
        <span className="text-sm font-medium text-gray-700">
          {getLabel(score)} ({Math.round(score * 100)}%)
        </span>
      </div>
    </div>
  )
}
