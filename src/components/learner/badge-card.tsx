'use client'

import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface BadgeCardProps {
  badge: {
    id: string
    name: string
    description: string
    icon: string
    points: number
    category: string
    earnedAt?: Date | string
  }
  variant?: 'default' | 'compact' | 'showcase'
  isLocked?: boolean
  className?: string
}

export function BadgeCard({
  badge,
  variant = 'default',
  isLocked = false,
  className,
}: BadgeCardProps) {
  const { t, locale } = useTranslation()

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ACHIEVEMENT':
        return 'from-amber-400 to-orange-500'
      case 'MILESTONE':
        return 'from-blue-400 to-indigo-500'
      case 'SKILL':
        return 'from-green-400 to-emerald-500'
      case 'SPECIAL':
        return 'from-purple-400 to-pink-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl p-3 bg-card border border-border/50',
          'transition-all duration-200 hover:shadow-md hover:border-border',
          isLocked && 'opacity-50 grayscale',
          className
        )}
      >
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl text-2xl',
            isLocked
              ? 'bg-muted'
              : `bg-gradient-to-br ${getCategoryColor(badge.category)}`
          )}
        >
          {isLocked ? '🔒' : badge.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{badge.name}</h3>
          <p className="text-xs text-muted-foreground">+{badge.points} pts</p>
        </div>
      </div>
    )
  }

  if (variant === 'showcase') {
    return (
      <div
        className={cn(
          'group relative flex flex-col items-center text-center p-6 rounded-2xl',
          'bg-gradient-to-br from-card via-card to-muted/30 border border-border/50',
          'transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30',
          isLocked && 'opacity-50 grayscale',
          className
        )}
      >
        {/* Glow effect */}
        {!isLocked && (
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className={cn('absolute inset-0 rounded-2xl blur-xl opacity-20 bg-gradient-to-br', getCategoryColor(badge.category))} />
          </div>
        )}

        {/* Badge icon */}
        <div
          className={cn(
            'relative flex h-20 w-20 items-center justify-center rounded-2xl text-4xl mb-4',
            'transition-transform duration-300 group-hover:scale-110',
            isLocked
              ? 'bg-muted'
              : `bg-gradient-to-br ${getCategoryColor(badge.category)} shadow-lg`
          )}
        >
          {isLocked ? '🔒' : badge.icon}
        </div>

        {/* Content */}
        <h3 className="font-semibold text-lg mb-1">{badge.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {badge.description}
        </p>

        {/* Points */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-primary">+{badge.points}</span>
          <span className="text-muted-foreground">{t.achievements.points}</span>
        </div>

        {/* Earned date */}
        {badge.earnedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            {t.achievements.earnedOn} {formatDate(badge.earnedAt)}
          </p>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl p-5 bg-card border border-border/50',
        'transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:border-border',
        isLocked && 'opacity-50 grayscale',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Badge icon */}
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-xl text-3xl flex-shrink-0',
            'transition-transform duration-300 group-hover:scale-110',
            isLocked
              ? 'bg-muted'
              : `bg-gradient-to-br ${getCategoryColor(badge.category)} shadow-md`
          )}
        >
          {isLocked ? '🔒' : badge.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{badge.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {badge.description}
          </p>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className="font-medium text-primary">+{badge.points} {t.achievements.points}</span>
            {badge.earnedAt && (
              <span className="text-muted-foreground text-xs">
                {formatDate(badge.earnedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
