import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CourseListSkeleton } from '@/components/ui/skeleton'
import { HighlightText } from '@/components/ui/search-input'
import { BookOpen, Clock, Users, Star, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { formatDuration, getLevelLabel, getLevelColor } from '@/lib/utils'
import { CoursesSearchFilter } from './courses-search-filter'

export const metadata = {
  title: 'Catalogue des cours',
  description: 'Découvrez notre catalogue de formations en ligne',
}

interface CoursesPageProps {
  searchParams: {
    category?: string
    level?: string
    search?: string
    sort?: string
  }
}

async function getCourses(filters: CoursesPageProps['searchParams']) {
  const where: Record<string, unknown> = {
    isPublished: true,
  }

  if (filters.category) {
    where.category = filters.category
  }

  if (filters.level) {
    where.level = filters.level
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { description: { contains: filters.search } },
    ]
  }

  const orderBy: Record<string, string | { _count: string }> = {}
  switch (filters.sort) {
    case 'newest':
      orderBy.createdAt = 'desc'
      break
    case 'popular':
      orderBy.enrollments = { _count: 'desc' }
      break
    case 'duration':
      orderBy.duration = 'asc'
      break
    default:
      orderBy.isFeatured = 'desc'
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      author: {
        select: { firstName: true, lastName: true },
      },
      _count: {
        select: { enrollments: true, modules: true },
      },
    },
    orderBy,
  })

  const categories = await prisma.course.groupBy({
    by: ['category'],
    where: { isPublished: true },
    _count: true,
  })

  return { courses, categories }
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { courses, categories } = await getCourses(searchParams)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <section className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Catalogue des cours
        </h1>
        <p className="text-lg text-muted-foreground">
          Explorez notre catalogue de formations et développez vos compétences avec des cours de qualité, accessibles à tous.
        </p>
      </section>

      {/* Filtres avec recherche améliorée */}
      <section className="mb-8" aria-label="Filtres de recherche">
        <CoursesSearchFilter categories={categories} />
      </section>

      {/* Liste des cours */}
      <section aria-label="Liste des cours">
        {courses.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {courses.length} cours trouvé{courses.length > 1 ? 's' : ''}
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course: CourseCardProps['course']) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
            <h2 className="text-xl font-semibold mb-2">Aucun cours trouvé</h2>
            <p className="text-muted-foreground mb-4">
              Essayez de modifier vos filtres ou votre recherche.
            </p>
            <Button asChild>
              <Link href="/courses">Réinitialiser les filtres</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}

interface CourseCardProps {
  course: {
    id: string
    title: string
    slug: string
    shortDescription: string | null
    description: string
    thumbnail: string | null
    duration: number
    level: string
    category: string
    isFeatured: boolean
    isFree: boolean
    author: {
      firstName: string
      lastName: string
    }
    _count: {
      enrollments: number
      modules: number
    }
  }
}

function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 card-hover">
      <Link href={`/courses/${course.slug}`} className="block">
        <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt=""
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="h-16 w-16 text-primary/40" aria-hidden="true" />
            </div>
          )}
          {course.isFeatured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-yellow-500 hover:bg-yellow-600">
                <Star className="h-3 w-3 mr-1" aria-hidden="true" />
                Populaire
              </Badge>
            </div>
          )}
          {course.isFree && (
            <div className="absolute top-3 right-3">
              <Badge variant="success">Gratuit</Badge>
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className={getLevelColor(course.level)}>
              {getLevelLabel(course.level)}
            </Badge>
            <Badge variant="outline">{course.category}</Badge>
          </div>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.shortDescription || course.description}
          </p>
          <p className="text-sm mt-2">
            Par <span className="font-medium">{course.author.firstName} {course.author.lastName}</span>
          </p>
        </CardContent>
        <CardFooter className="pt-2 border-t text-sm text-muted-foreground">
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {formatDuration(course.duration)}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {course._count.modules} modules
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" aria-hidden="true" />
              {course._count.enrollments}
            </span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}
