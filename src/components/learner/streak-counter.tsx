'use client'

import { cn } from '@/lib/utils'
import { Flame, Calendar, Trophy, Zap } from 'lucide-react'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
  lastActiveDate?: Date
  className?: string
}

export function StreakCounter({
  currentStreak,
  longestStreak,
  lastActiveDate,
  className,
}: StreakCounterProps) {
  const isActiveToday = lastActiveDate
    ? new Date().toDateString() === new Date(lastActiveDate).toDateString()
    : false

  const streakLevel = currentStreak >= 30 ? 'legendary' : currentStreak >= 14 ? 'hot' : currentStreak >= 7 ? 'warm' : 'cool'

  const streakColors = {
    cool: {
      bg: 'from-slate-600 to-slate-700',
      glow: '',
      text: 'text-slate-300',
    },
    warm: {
      bg: 'from-orange-500 to-amber-600',
      glow: 'glow-orange',
      text: 'text-orange-300',
    },
    hot: {
      bg: 'from-orange-400 to-red-500',
      glow: 'glow-orange animate-fire',
      text: 'text-orange-200',
    },
    legendary: {
      bg: 'from-purple-500 via-pink-500 to-orange-500',
      glow: 'glow-orange animate-fire',
      text: 'text-amber-200',
    },
  }

  const colors = streakColors[streakLevel]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10 p-5',
        'bg-gradient-to-br from-slate-900/90 to-slate-950',
        'transition-all duration-300 hover:border-white/20',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 opacity-10">
        <Flame className="w-full h-full" />
      </div>

      <div className="relative flex items-center gap-4">
        {/* Flame icon with gradient */}
        <div
          className={cn(
            'relative flex items-center justify-center w-16 h-16 rounded-xl',
            `bg-gradient-to-br ${colors.bg}`,
            colors.glow
          )}
        >
          <Flame className="h-8 w-8 text-white" />
          {currentStreak >= 7 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
              <Zap className="h-3 w-3 text-yellow-900" />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className={cn('text-4xl font-bold', colors.text)}>
              {currentStreak}
            </span>
            <span className="text-sm text-slate-400">jours</span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Série en cours
          </p>
        </div>

        {/* Status indicator */}
        <div className="text-right">
          {isActiveToday ? (
            <div className="flex items-center gap-1.5 text-green-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot" />
              Actif aujourd'hui
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              À maintenir !
            </div>
          )}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span>Record: <span className="text-white font-medium">{longestStreak} jours</span></span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar className="h-4 w-4" />
          <span>Niveau {streakLevel}</span>
        </div>
      </div>
    </div>
  )
}
