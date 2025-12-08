'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'primary' | 'success' | 'warning'
  className?: string
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  const variantStyles = {
    default: {
      container: 'bg-card',
      icon: 'bg-muted text-muted-foreground',
    },
    primary: {
      container: 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
      icon: 'bg-primary/20 text-primary',
    },
    success: {
      container: 'bg-gradient-to-br from-success/10 via-success/5 to-transparent',
      icon: 'bg-success/20 text-success',
    },
    warning: {
      container: 'bg-gradient-to-br from-warning/10 via-warning/5 to-transparent',
      icon: 'bg-warning/20 text-warning',
    },
  }

  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/50 p-6 transition-all duration-300',
        'hover:shadow-lg hover:shadow-black/5 hover:border-border',
        styles.container,
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] -translate-y-8 translate-x-8">
        <Icon className="w-full h-full" />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn('rounded-xl p-3', styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
