'use client'

import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'cyan' | 'purple'
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
      container: 'bg-card dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950',
      icon: 'bg-muted text-muted-foreground dark:bg-slate-800 dark:text-slate-400',
      glow: '',
      border: 'border-border/50 dark:border-white/10',
    },
    primary: {
      container: 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-slate-950',
      icon: 'bg-primary/20 text-primary dark:bg-primary/30',
      glow: 'dark:glow-primary',
      border: 'border-primary/20 dark:border-primary/30',
    },
    success: {
      container: 'bg-gradient-to-br from-success/10 via-success/5 to-transparent dark:from-green-500/20 dark:via-green-500/10 dark:to-slate-950',
      icon: 'bg-success/20 text-success dark:bg-green-500/30',
      glow: 'dark:glow-success',
      border: 'border-success/20 dark:border-green-500/30',
    },
    warning: {
      container: 'bg-gradient-to-br from-warning/10 via-warning/5 to-transparent dark:from-orange-500/20 dark:via-orange-500/10 dark:to-slate-950',
      icon: 'bg-warning/20 text-warning dark:bg-orange-500/30',
      glow: 'dark:glow-orange',
      border: 'border-warning/20 dark:border-orange-500/30',
    },
    cyan: {
      container: 'bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent dark:from-cyan-500/20 dark:via-cyan-500/10 dark:to-slate-950',
      icon: 'bg-cyan-500/20 text-cyan-500 dark:bg-cyan-500/30',
      glow: 'dark:glow-cyan',
      border: 'border-cyan-500/20 dark:border-cyan-500/30',
    },
    purple: {
      container: 'bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent dark:from-purple-500/20 dark:via-purple-500/10 dark:to-slate-950',
      icon: 'bg-purple-500/20 text-purple-500 dark:bg-purple-500/30',
      glow: '',
      border: 'border-purple-500/20 dark:border-purple-500/30',
    },
  }

  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6 transition-all duration-300',
        'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
        'hover:border-border dark:hover:border-white/20',
        styles.container,
        styles.border,
        styles.glow,
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] dark:opacity-[0.05] -translate-y-8 translate-x-8">
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
                  'inline-flex items-center gap-0.5 text-sm font-medium px-1.5 py-0.5 rounded',
                  trend.isPositive
                    ? 'text-success bg-success/10'
                    : 'text-destructive bg-destructive/10'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn('rounded-xl p-3 transition-transform hover:scale-105', styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
