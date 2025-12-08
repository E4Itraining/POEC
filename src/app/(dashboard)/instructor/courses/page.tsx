import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  BookOpen,
  Users,
  Eye,
  Edit,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { formatDuration, formatDate, getLevelLabel } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const metadata = {
  title: 'Mes formations',
  description: 'Gérez vos cours et formations',
}

async function getInstructorCourses(userId: string) {
  return prisma.course.findMany({
    where: { authorId: userId },
    include: {
      _count: {
        select: { enrollments: true, modules: true },
      },
      modules: {
        include: {
          _count: { select: { lessons: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function InstructorCoursesPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
    redirect('/dashboard')
  }

  const courses = await getInstructorCourses(session.user.id)

  const publishedCourses = courses.filter((c) => c.isPublished)
  const draftCourses = courses.filter((c) => !c.isPublished)

  const totalEnrollments = courses.reduce((acc, c) => acc + c._count.enrollments, 0)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes formations</h1>
          <p className="text-muted-foreground mt-1">
            Créez et gérez vos cours
          </p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Créer un cours
          </Link>
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-sm text-muted-foreground">Cours créés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{publishedCourses.length}</div>
                <p className="text-sm text-muted-foreground">Publiés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Edit className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{draftCourses.length}</div>
                <p className="text-sm text-muted-foreground">Brouillons</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalEnrollments}</div>
                <p className="text-sm text-muted-foreground">Étudiants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des cours */}
      {courses.length > 0 ? (
        <div className="space-y-4">
          {courses.map((course) => {
            const totalLessons = course.modules.reduce(
              (acc, m) => acc + m._count.lessons,
              0
            )

            return (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-24 w-40 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt=""
                          className="object-cover w-full h-full rounded-lg"
                        />
                      ) : (
                        <BookOpen className="h-10 w-10 text-primary/40" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={course.isPublished ? 'success' : 'secondary'}
                            >
                              {course.isPublished ? 'Publié' : 'Brouillon'}
                            </Badge>
                            <Badge variant="outline">
                              {getLevelLabel(course.level)}
                            </Badge>
                            <Badge variant="outline">{course.category}</Badge>
                          </div>
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {course.shortDescription || course.description}
                          </p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/courses/${course.slug}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir le cours
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/instructor/courses/${course.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              {course.isPublished ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Dépublier
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Publier
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {course._count.modules} modules • {totalLessons} leçons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDuration(course.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course._count.enrollments} inscrits
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <span className="text-xs text-muted-foreground">
                          Créé le {formatDate(course.createdAt)}
                          {course.publishedAt && ` • Publié le ${formatDate(course.publishedAt)}`}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/instructor/courses/${course.id}/analytics`}>
                              Statistiques
                            </Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/instructor/courses/${course.id}/edit`}>
                              Modifier
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun cours créé</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre premier cours
            </p>
            <Button asChild>
              <Link href="/instructor/courses/new">
                <Plus className="mr-2 h-4 w-4" />
                Créer un cours
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
