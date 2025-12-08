'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Play,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

interface CourseProgressCardProps {
  course: {
    id: string
    slug: string
    title: string
    thumbnail?: string | null
    level: string
    category: string
    duration: number
    progress?: number
    completedLessons?: number
    totalLessons?: number
    lastAccessedAt?: Date | string
  }
  variant?: 'default' | 'compact' | 'featured'
  className?: string
}

export function CourseProgressCard({
  course,
  variant = 'default',
  className,
}: CourseProgressCardProps) {
  const { t, locale } = useTranslation()

  const progress = course.progress || 0
  const isCompleted = progress >= 100

  const formatLastAccessed = (date: Date | string | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 60) {
      return `${minutes} ${locale === 'fr' ? 'min' : 'min'}`
    }
    if (hours < 24) {
      return `${hours}h`
    }
    if (days === 1) {
      return t.common.yesterday
    }
    if (days < 7) {
      return `${days} ${locale === 'fr' ? 'jours' : 'days'}`
    }
    return d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })
  }

  const levelLabel = t.courses.level[course.level as keyof typeof t.courses.level] || course.level

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'ADVANCED':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'EXPERT':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/courses/${course.slug}/learn`}
        className={cn(
          'group flex items-center gap-4 rounded-xl p-3 transition-all duration-200',
          'bg-card border border-border/50 hover:border-primary/30 hover:shadow-md',
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <BookOpen className="h-6 w-6 text-primary/50" />
            </div>
          )}
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-6 w-6 text-white" fill="white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="text-xs font-medium text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-border/50',
          'transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30',
          className
        )}
      >
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail */}
          <div className="relative h-48 md:h-auto md:w-64 flex-shrink-0 overflow-hidden">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <BookOpen className="h-12 w-12 text-primary/50" />
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r" />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-white/90 p-4 shadow-lg transition-transform group-hover:scale-110">
                <Play className="h-8 w-8 text-primary" fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={cn('text-xs', getLevelColor(course.level))}>
                    {levelLabel}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{course.category}</span>
                </div>
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
              </div>
              {isCompleted && (
                <div className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="mt-4 flex-1">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>{t.dashboard.progress}</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.floor(course.duration / 60)}h {course.duration % 60}min
                </span>
                {course.completedLessons !== undefined && course.totalLessons !== undefined && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {course.completedLessons}/{course.totalLessons}
                  </span>
                )}
              </div>
              <Button asChild size="sm" className="gap-2">
                <Link href={`/courses/${course.slug}/learn`}>
                  {t.dashboard.continueBtn}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-card border border-border/50',
        'transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:border-primary/30',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <BookOpen className="h-12 w-12 text-primary/50" />
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge variant="secondary" className={cn('text-xs', getLevelColor(course.level))}>
            {levelLabel}
          </Badge>
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-1 bg-black/20">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Play button on hover */}
        <Link
          href={`/courses/${course.slug}/learn`}
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
        >
          <div className="rounded-full bg-white/90 p-3 shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 text-primary" fill="currentColor" />
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span>{course.category}</span>
          {course.lastAccessedAt && (
            <>
              <span>•</span>
              <span>{formatLastAccessed(course.lastAccessedAt)}</span>
            </>
          )}
        </div>

        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors mb-3">
          {course.title}
        </h3>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t.dashboard.progress}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {Math.floor(course.duration / 60)}h
            </span>
            {course.completedLessons !== undefined && course.totalLessons !== undefined && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {course.completedLessons}/{course.totalLessons}
              </span>
            )}
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 h-8 px-3">
            <Link href={`/courses/${course.slug}/learn`}>
              {t.dashboard.continueBtn}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
