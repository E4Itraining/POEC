'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Academy, getBadgeColorClasses } from '@/lib/academies'
import { cn } from '@/lib/utils'

interface AcademyCardProps {
  academy: Academy
  locale?: 'en' | 'fr'
}

export function AcademyCard({ academy, locale = 'en' }: AcademyCardProps) {
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
    <div className="group relative flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-primary/5">
      {/* Header with icon and badge */}
      <div className="mb-6 flex items-start justify-between">
        {/* Icon */}
        <div
          className={cn(
            'h-14 w-14 rounded-xl bg-gradient-to-br shadow-lg',
            academy.iconGradient
          )}
        />

        {/* Badge */}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
            badgeClasses
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {academy.badge}
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-3 text-xl font-bold text-white group-hover:text-primary transition-colors">
        {academy.title}
      </h3>

      {/* Description */}
      <p className="mb-6 text-sm leading-relaxed text-slate-400 line-clamp-3">
        {academy.description}
      </p>

      {/* Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        {academy.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
        <div className="text-sm text-slate-400">
          <span className="text-white font-semibold">{academy.coursesCount}+</span>{' '}
          {t.courses}{' '}
          <span className="text-slate-500">·</span>{' '}
          <span className="text-white font-semibold">{academy.learningPaths}</span>{' '}
          {t.learningPaths}
        </div>

        <Link
          href={`/academies/${academy.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {t.explore}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
