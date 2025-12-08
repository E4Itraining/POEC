import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle,
  Award,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'
import { formatDuration, formatDate, getLevelLabel, getLevelColor } from '@/lib/utils'

export const metadata = {
  title: 'Mes cours',
  description: 'Gérez vos formations et suivez votre progression',
}

async function getUserCourses(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          author: { select: { firstName: true, lastName: true } },
          modules: {
            include: {
              lessons: {
                include: {
                  lessonProgress: {
                    where: { userId },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  })

  const courseProgress = await prisma.courseProgress.findMany({
    where: { userId },
  })

  return enrollments.map((enrollment) => {
    const progress = courseProgress.find((p) => p.courseId === enrollment.courseId)
    const totalLessons = enrollment.course.modules.reduce(
      (acc, m) => acc + m.lessons.length,
      0
    )
    const completedLessons = enrollment.course.modules.reduce(
      (acc, m) =>
        acc + m.lessons.filter((l) => l.lessonProgress[0]?.isCompleted).length,
      0
    )

    return {
      ...enrollment,
      progress: progress?.progressPercent || 0,
      totalLessons,
      completedLessons,
      timeSpent: progress?.timeSpent || 0,
    }
  })
}

async function getCertificates(userId: string) {
  return prisma.certificate.findMany({
    where: { userId },
    include: {
      course: true,
    },
    orderBy: { issuedAt: 'desc' },
  })
}

export default async function MyCoursesPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const [courses, certificates] = await Promise.all([
    getUserCourses(session.user.id),
    getCertificates(session.user.id),
  ])

  const inProgressCourses = courses.filter((c) => c.status === 'ACTIVE' && c.progress < 100)
  const completedCourses = courses.filter((c) => c.status === 'COMPLETED' || c.progress === 100)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes cours</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos inscriptions et suivez votre progression
        </p>
      </div>

      <Tabs defaultValue="in-progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="in-progress">
            En cours ({inProgressCourses.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Terminés ({completedCourses.length})
          </TabsTrigger>
          <TabsTrigger value="certificates">
            Certificats ({certificates.length})
          </TabsTrigger>
        </TabsList>

        {/* Cours en cours */}
        <TabsContent value="in-progress" className="space-y-4">
          {inProgressCourses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {inProgressCourses.map((enrollment) => (
                <CourseCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Aucun cours en cours"
              description="Inscrivez-vous à un cours pour commencer votre apprentissage"
              actionLabel="Voir le catalogue"
              actionHref="/courses"
            />
          )}
        </TabsContent>

        {/* Cours terminés */}
        <TabsContent value="completed" className="space-y-4">
          {completedCourses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {completedCourses.map((enrollment) => (
                <CourseCard key={enrollment.id} enrollment={enrollment} completed />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle}
              title="Aucun cours terminé"
              description="Terminez vos cours en cours pour les voir ici"
            />
          )}
        </TabsContent>

        {/* Certificats */}
        <TabsContent value="certificates" className="space-y-4">
          {certificates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {certificates.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Award className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{cert.course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Délivré le {formatDate(cert.issuedAt)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        N° {cert.certificateNumber}
                      </p>
                      <Button className="mt-4" variant="outline" size="sm">
                        Télécharger
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title="Aucun certificat"
              description="Terminez des cours pour obtenir des certificats"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface CourseCardProps {
  enrollment: {
    id: string
    enrolledAt: Date
    course: {
      id: string
      title: string
      slug: string
      thumbnail: string | null
      level: string
      duration: number
      author: {
        firstName: string
        lastName: string
      }
    }
    progress: number
    totalLessons: number
    completedLessons: number
    timeSpent: number
  }
  completed?: boolean
}

function CourseCard({ enrollment, completed = false }: CourseCardProps) {
  const { course, progress, totalLessons, completedLessons, timeSpent, enrolledAt } = enrollment

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all">
      <div className="flex">
        <div className="w-32 md:w-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt=""
              className="object-cover w-full h-full"
            />
          ) : (
            <BookOpen className="h-10 w-10 text-primary/40" />
          )}
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Badge className={getLevelColor(course.level)} variant="secondary">
                {getLevelLabel(course.level)}
              </Badge>
              <h3 className="font-semibold mt-2 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-muted-foreground">
                {course.author.firstName} {course.author.lastName}
              </p>
            </div>
            {completed && (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {completedLessons}/{totalLessons} leçons
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(timeSpent)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Inscrit le {formatDate(enrolledAt)}
            </span>
            <Button size="sm" asChild>
              <Link href={`/courses/${course.slug}/learn`}>
                {completed ? 'Revoir' : 'Continuer'}
                <Play className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}
