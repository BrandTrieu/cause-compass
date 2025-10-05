import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium',
          {
            'bg-background text-foreground': variant === 'default',
            'bg-secondary text-white': variant === 'secondary',
            'bg-green-500 text-white': variant === 'success',
            'bg-yellow-500 text-white': variant === 'warning',
            'bg-red-500 text-white': variant === 'destructive',
            'border border-primary bg-transparent text-primary': variant === 'outline',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }
