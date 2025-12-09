'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Academy, getBadgeColorClasses } from '@/lib/academies'
import { cn } from '@/lib/utils'

interface AcademyCardProps {
  academy: Academy
  locale?: 'en' | 'fr'
  featured?: boolean
}

export function AcademyCard({ academy, locale = 'en', featured = false }: AcademyCardProps) {
  const badgeClasses = getBadgeColorClasses(academy.badgeColor)

  const translations = {
    en: {
      courses: 'courses',
      learningPaths: 'learning paths',
      explore: 'Explore',
    },
    fr: {
      courses: 'cours',
      learningPaths: 'parcours',
      explore: 'Explorer',
    },
  }

  const t = translations[locale]

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border p-6 transition-all duration-300',
        'bg-gradient-to-b from-slate-900/80 to-slate-950/90',
        'border-white/10 hover:border-white/20',
        'hover:shadow-xl hover:shadow-primary/5',
        featured && 'ring-1 ring-primary/50 animate-border-glow'
      )}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-transparent" />
      </div>

      {/* Header with icon and badge */}
      <div className="relative mb-6 flex items-start justify-between">
        {/* Icon with glow */}
        <div className="relative">
          <div
            className={cn(
              'h-14 w-14 rounded-xl bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-105',
              academy.iconGradient
            )}
          />
          {/* Icon glow effect */}
          <div
            className={cn(
              'absolute inset-0 rounded-xl bg-gradient-to-br blur-xl opacity-50 -z-10',
              academy.iconGradient
            )}
          />
        </div>

        {/* Badge with animated dot */}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
            badgeClasses
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot" />
          {academy.badge}
        </span>
      </div>

      {/* Featured badge */}
      {featured && (
        <div className="absolute top-4 left-4 flex items-center gap-1 text-xs text-amber-400">
          <Sparkles className="h-3 w-3" />
          <span>Featured</span>
        </div>
      )}

      {/* Title */}
      <h3 className="relative mb-3 text-xl font-bold text-white group-hover:text-primary transition-colors">
        {academy.title}
      </h3>

      {/* Description */}
      <p className="relative mb-6 text-sm leading-relaxed text-slate-400 line-clamp-3">
        {academy.description}
      </p>

      {/* Tags */}
      <div className="relative mb-6 flex flex-wrap gap-2">
        {academy.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:border-white/20 transition-colors cursor-default"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="relative mt-auto flex items-center justify-between pt-4 border-t border-white/5">
        <div className="text-sm text-slate-400">
          <span className="text-white font-semibold">{academy.coursesCount}+</span>{' '}
          {t.courses}{' '}
          <span className="text-slate-500">·</span>{' '}
          <span className="text-white font-semibold">{academy.learningPaths}</span>{' '}
          {t.learningPaths}
        </div>

        <Link
          href={`/academies/${academy.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-all group/link"
        >
          {t.explore}
          <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}
