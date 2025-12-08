import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Play,
  ChevronRight,
  Target,
  Calendar,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { formatDuration, formatRelativeTime, getLevelLabel, getLevelColor } from '@/lib/utils'

export const metadata = {
  title: 'Tableau de bord',
  description: 'Votre espace personnel d\'apprentissage',
}

async function getDashboardData(userId: string) {
  const [enrollments, badges, recentProgress, notifications] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
      take: 5,
    }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
      take: 5,
    }),
    prisma.courseProgress.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { lastAccessedAt: 'desc' },
      take: 3,
    }),
    prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const totalCoursesEnrolled = enrollments.length
  const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length
  const totalTimeSpent = recentProgress.reduce((acc, p) => acc + p.timeSpent, 0)
  const averageProgress = recentProgress.length > 0
    ? recentProgress.reduce((acc, p) => acc + p.progressPercent, 0) / recentProgress.length
    : 0

  return {
    enrollments,
    badges,
    recentProgress,
    notifications,
    stats: {
      totalCoursesEnrolled,
      completedCourses,
      totalTimeSpent,
      averageProgress,
      badgesCount: badges.length,
    },
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const data = await getDashboardData(session.user.id)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* En-tête de bienvenue */}
      <section aria-labelledby="welcome-heading">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 id="welcome-heading" className="text-3xl font-bold tracking-tight">
              Bonjour, {session.user.firstName} !
            </h1>
            <p className="text-muted-foreground mt-1">
              Prêt à continuer votre apprentissage aujourd'hui ?
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/courses">
              <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
              Explorer les cours
            </Link>
          </Button>
        </div>
      </section>

      {/* Statistiques */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Vos statistiques</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cours suivis</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalCoursesEnrolled}</div>
              <p className="text-xs text-muted-foreground">
                {data.stats.completedCourses} terminé(s)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps d'apprentissage</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(data.stats.totalTimeSpent)}</div>
              <p className="text-xs text-muted-foreground">
                Cette semaine
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progression moyenne</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(data.stats.averageProgress)}%</div>
              <Progress value={data.stats.averageProgress} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Badges obtenus</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.badgesCount}</div>
              <p className="text-xs text-muted-foreground">
                Continuez ainsi !
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Continuer l'apprentissage */}
        <section className="lg:col-span-2" aria-labelledby="continue-learning-heading">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle id="continue-learning-heading">Continuer l'apprentissage</CardTitle>
                  <CardDescription>Reprenez là où vous vous êtes arrêté</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/my-courses">
                    Voir tout
                    <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {data.recentProgress.length > 0 ? (
                <div className="space-y-4">
                  {data.recentProgress.map((progress) => (
                    <div
                      key={progress.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-8 w-8 text-primary" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{progress.course.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" aria-hidden="true" />
                            {Math.round(progress.progressPercent)}%
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {formatRelativeTime(progress.lastAccessedAt)}
                          </span>
                        </div>
                        <Progress value={progress.progressPercent} className="h-1.5 mt-2" />
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/courses/${progress.course.slug}/learn`}>
                          <Play className="h-4 w-4 mr-1" aria-hidden="true" />
                          Continuer
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
                  <p className="text-muted-foreground">Vous n'avez pas encore commencé de cours</p>
                  <Button className="mt-4" asChild>
                    <Link href="/courses">Découvrir les cours</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Colonne de droite */}
        <div className="space-y-6">
          {/* Badges récents */}
          <section aria-labelledby="badges-heading">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle id="badges-heading" className="text-lg">Badges récents</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/achievements">
                      Voir tout
                      <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {data.badges.length > 0 ? (
                  <div className="space-y-3">
                    {data.badges.slice(0, 3).map((userBadge) => (
                      <div
                        key={userBadge.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                          {userBadge.badge.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{userBadge.badge.name}</p>
                          <p className="text-xs text-muted-foreground">
                            +{userBadge.badge.points} points
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Trophy className="h-8 w-8 mx-auto text-muted-foreground mb-2" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">
                      Terminez des leçons pour gagner des badges !
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Notifications */}
          <section aria-labelledby="notifications-heading">
            <Card>
              <CardHeader>
                <CardTitle id="notifications-heading" className="text-lg">Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                {data.notifications.length > 0 ? (
                  <div className="space-y-3">
                    {data.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune nouvelle notification
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* Cours recommandés */}
      <section aria-labelledby="recommended-heading">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle id="recommended-heading">Cours recommandés</CardTitle>
                <CardDescription>Basés sur vos intérêts et votre progression</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/courses">
                  Voir le catalogue
                  <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RecommendedCourses userId={session.user.id} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

async function RecommendedCourses({ userId }: { userId: string }) {
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      enrollments: {
        none: { userId },
      },
    },
    include: {
      author: {
        select: { firstName: true, lastName: true },
      },
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { isFeatured: 'desc' },
    take: 3,
  })

  if (courses.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        Vous êtes inscrit à tous nos cours ! De nouveaux contenus arrivent bientôt.
      </p>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/courses/${course.slug}`}
          className="group block"
        >
          <div className="rounded-lg border overflow-hidden hover:shadow-lg transition-all">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary/60" aria-hidden="true" />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className={getLevelColor(course.level)}>
                  {getLevelLabel(course.level)}
                </Badge>
                {course.isFeatured && (
                  <Badge variant="default" className="bg-yellow-500">
                    <Star className="h-3 w-3 mr-1" aria-hidden="true" />
                    Populaire
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {course.author.firstName} {course.author.lastName}
              </p>
              <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {formatDuration(course.duration)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" aria-hidden="true" />
                  {course._count.enrollments}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function Users({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
