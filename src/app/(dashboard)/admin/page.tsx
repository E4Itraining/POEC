import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  BookOpen,
  Trophy,
  TrendingUp,
  Plus,
  Eye,
  Settings,
  BarChart,
  Calendar,
  Activity,
} from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export const metadata = {
  title: 'Administration',
  description: 'Tableau de bord administrateur',
}

async function getAdminStats() {
  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    recentUsers,
    recentEnrollments,
    courseStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.enrollment.findMany({
      orderBy: { enrolledAt: 'desc' },
      take: 5,
      include: {
        user: { select: { firstName: true, lastName: true } },
        course: { select: { title: true } },
      },
    }),
    prisma.course.findMany({
      include: {
        _count: { select: { enrollments: true } },
      },
      orderBy: { enrollments: { _count: 'desc' } },
      take: 5,
    }),
  ])

  // Stats par jour (7 derniers jours)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const newUsersThisWeek = await prisma.user.count({
    where: { createdAt: { gte: sevenDaysAgo } },
  })

  const newEnrollmentsThisWeek = await prisma.enrollment.count({
    where: { enrolledAt: { gte: sevenDaysAgo } },
  })

  return {
    totalUsers,
    totalCourses,
    totalEnrollments,
    recentUsers,
    recentEnrollments,
    courseStats,
    newUsersThisWeek,
    newEnrollmentsThisWeek,
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const stats = await getAdminStats()

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre plateforme de formation
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/courses/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau cours
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisWeek} cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Formations publiées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newEnrollmentsThisWeek} cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux moyen</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCourses > 0
                ? Math.round(stats.totalEnrollments / stats.totalCourses)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Inscriptions par cours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Cours populaires */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cours populaires</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/courses">Voir tout</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.courseStats.map((course, index) => (
                <div key={course.id} className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-muted-foreground w-8">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {course._count.enrollments} inscrits
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/courses/${course.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dernières inscriptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Dernières inscriptions</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/enrollments">Voir tout</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {enrollment.user.firstName} {enrollment.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {enrollment.course.title}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(enrollment.enrolledAt)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nouveaux utilisateurs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Nouveaux utilisateurs</CardTitle>
              <CardDescription>Les derniers inscrits sur la plateforme</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">Gérer les utilisateurs</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Utilisateur</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Rôle</th>
                  <th className="text-left py-3 px-4 font-medium">Inscription</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <span className="font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'INSTRUCTOR' ? 'default' : 'secondary'}>
                        {user.role === 'ADMIN' ? 'Admin' : user.role === 'INSTRUCTOR' ? 'Formateur' : 'Apprenant'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/users/${user.id}`}>
                          <Settings className="h-4 w-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/courses">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Gérer les cours</h3>
                  <p className="text-sm text-muted-foreground">
                    Créer, modifier, publier
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/users">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Gérer les utilisateurs</h3>
                  <p className="text-sm text-muted-foreground">
                    Rôles, permissions, comptes
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/reports">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BarChart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Rapports</h3>
                  <p className="text-sm text-muted-foreground">
                    Statistiques et analyses
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}
