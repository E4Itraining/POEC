import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
}

function Skeleton({
  className,
  variant = 'default',
  animation = 'pulse',
  ...props
}: SkeletonProps) {
  const variants = {
    default: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full',
    rectangular: 'rounded-none',
  }

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-transparent via-foreground/10 to-transparent bg-[length:200%_100%]',
    none: '',
  }

  return (
    <div
      className={cn(
        'bg-muted',
        variants[variant],
        animations[animation],
        className
      )}
      aria-hidden="true"
      role="presentation"
      {...props}
    />
  )
}

// Skeleton pour une carte de cours
function CourseCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      {/* Image placeholder */}
      <Skeleton className="aspect-video w-full" />

      {/* Header */}
      <div className="p-6 pb-2 space-y-3">
        {/* Badges */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />
      </div>

      {/* Content */}
      <div className="px-6 pb-2 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-24 mt-2" />
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  )
}

// Skeleton pour une liste de cours
function CourseListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Chargement des cours..."
    >
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
      <span className="sr-only">Chargement en cours...</span>
    </div>
  )
}

// Skeleton pour le dashboard
function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Chargement du tableau de bord...">
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Course cards */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
      <span className="sr-only">Chargement en cours...</span>
    </div>
  )
}

// Skeleton pour la sidebar de leçon
function LessonSidebarSkeleton() {
  return (
    <div className="space-y-4 p-4" role="status" aria-label="Chargement du menu...">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <div className="pl-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
      <span className="sr-only">Chargement en cours...</span>
    </div>
  )
}

// Skeleton pour un tableau
function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-lg border" role="status" aria-label="Chargement des données...">
      {/* Header */}
      <div className="border-b bg-muted/50 p-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b last:border-0 p-4 flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
      <span className="sr-only">Chargement en cours...</span>
    </div>
  )
}

export {
  Skeleton,
  CourseCardSkeleton,
  CourseListSkeleton,
  DashboardSkeleton,
  LessonSidebarSkeleton,
  TableSkeleton
}
