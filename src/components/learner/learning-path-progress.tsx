'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, Lock, ChevronRight, Play } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface LearningPathStep {
  id: string
  title: string
  status: 'completed' | 'current' | 'locked'
  duration?: string
}

interface LearningPathProgressProps {
  title: string
  description: string
  slug: string
  steps: LearningPathStep[]
  totalProgress: number
  badgeColor?: string
  className?: string
}

export function LearningPathProgress({
  title,
  description,
  slug,
  steps,
  totalProgress,
  badgeColor = 'from-cyan-500 to-blue-600',
  className,
}: LearningPathProgressProps) {
  const completedSteps = steps.filter((s) => s.status === 'completed').length
  const currentStep = steps.find((s) => s.status === 'current')

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10 p-6',
        'bg-gradient-to-b from-slate-900/90 to-slate-950',
        'transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-primary/5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{description}</p>
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            `bg-gradient-to-br ${badgeColor}`
          )}
        >
          <span className="text-white font-bold">{Math.round(totalProgress)}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">
            {completedSteps}/{steps.length} étapes complétées
          </span>
          <span className="text-primary font-medium">{Math.round(totalProgress)}%</span>
        </div>
        <div className="relative">
          <Progress value={totalProgress} className="h-2" />
          <div
            className="absolute top-0 left-0 h-2 rounded-full progress-shimmer"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Steps timeline */}
      <div className="space-y-1 mb-4">
        {steps.slice(0, 4).map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg transition-colors',
              step.status === 'current' && 'bg-primary/10'
            )}
          >
            {/* Status icon */}
            {step.status === 'completed' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            ) : step.status === 'current' ? (
              <div className="relative">
                <Circle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </span>
              </div>
            ) : (
              <Lock className="h-5 w-5 text-slate-600 flex-shrink-0" />
            )}

            {/* Step info */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm truncate',
                  step.status === 'completed'
                    ? 'text-slate-400 line-through'
                    : step.status === 'current'
                    ? 'text-white font-medium'
                    : 'text-slate-500'
                )}
              >
                {step.title}
              </p>
            </div>

            {/* Duration or action */}
            {step.status === 'current' && (
              <button className="p-1.5 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors">
                <Play className="h-4 w-4" fill="currentColor" />
              </button>
            )}
            {step.duration && step.status !== 'current' && (
              <span className="text-xs text-slate-500">{step.duration}</span>
            )}
          </div>
        ))}

        {steps.length > 4 && (
          <p className="text-xs text-slate-500 pl-8">
            +{steps.length - 4} autres étapes
          </p>
        )}
      </div>

      {/* Action button */}
      <Link
        href={`/learning-paths/${slug}`}
        className={cn(
          'flex items-center justify-center gap-2 w-full py-2.5 rounded-xl',
          'bg-primary/10 text-primary hover:bg-primary/20 transition-colors',
          'text-sm font-medium'
        )}
      >
        {currentStep ? 'Continuer' : 'Voir le parcours'}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
