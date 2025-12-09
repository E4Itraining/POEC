'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  BookOpen,
  TrendingUp,
  Plus,
  Eye,
  Settings,
  BarChart,
  Activity,
} from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

interface AdminStats {
  totalUsers: number
  totalCourses: number
  totalEnrollments: number
  recentUsers: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
    createdAt: Date
  }[]
  recentEnrollments: {
    id: string
    enrolledAt: Date
    user: { firstName: string; lastName: string }
    course: { title: string }
  }[]
  courseStats: {
    id: string
    title: string
    _count: { enrollments: number }
  }[]
  newUsersThisWeek: number
  newEnrollmentsThisWeek: number
}

interface AdminClientProps {
  stats: AdminStats
}

export function AdminClient({ stats }: AdminClientProps) {
  const { t, locale } = useI18n()

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(
      locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : locale === 'nl' ? 'nl-NL' : 'en-US'
    )
  }

  const getRoleLabel = (role: string) => {
    if (role === 'ADMIN') return t.admin.roles.admin
    if (role === 'INSTRUCTOR') return t.admin.roles.instructor
    return t.admin.roles.learner
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{t.admin.title}</h1>
            <p className="text-slate-400 mt-1">
              {t.admin.subtitle}
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0" asChild>
              <Link href="/admin/courses/new">
                <Plus className="mr-2 h-4 w-4" />
                {t.admin.newCourse}
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">{t.admin.stats.users}</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <p className="text-xs text-slate-400">
                +{stats.newUsersThisWeek} {t.admin.stats.thisWeek}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">{t.admin.stats.courses}</CardTitle>
              <BookOpen className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalCourses}</div>
              <p className="text-xs text-slate-400">
                {t.admin.stats.published}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">{t.admin.stats.enrollments}</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalEnrollments}</div>
              <p className="text-xs text-slate-400">
                +{stats.newEnrollmentsThisWeek} {t.admin.stats.thisWeek}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">{t.admin.stats.avgRate}</CardTitle>
              <Activity className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.totalCourses > 0
                  ? Math.round(stats.totalEnrollments / stats.totalCourses)
                  : 0}
              </div>
              <p className="text-xs text-slate-400">
                {t.admin.stats.perCourse}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Cours populaires */}
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{t.admin.popularCourses}</CardTitle>
                <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10" asChild>
                  <Link href="/admin/courses">{t.admin.viewAll}</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.courseStats.map((course, index) => (
                  <div key={course.id} className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-slate-500 w-8">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-white">{course.title}</p>
                      <p className="text-sm text-slate-400">
                        {course._count.enrollments} {t.admin.enrolled}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10" asChild>
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
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{t.admin.recentEnrollments}</CardTitle>
                <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10" asChild>
                  <Link href="/admin/enrollments">{t.admin.viewAll}</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">
                        {enrollment.user.firstName} {enrollment.user.lastName}
                      </p>
                      <p className="text-sm text-slate-400 truncate">
                        {enrollment.course.title}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatDate(enrollment.enrolledAt)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nouveaux utilisateurs */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">{t.admin.newUsers}</CardTitle>
                <CardDescription className="text-slate-400">{t.admin.newUsersSubtitle}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10" asChild>
                <Link href="/admin/users">{t.admin.manageUsers}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-medium text-slate-300">{t.admin.table.user}</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-300">{t.admin.table.email}</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-300">{t.admin.table.role}</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-300">{t.admin.table.registration}</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-300">{t.admin.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <span className="font-medium text-white">
                          {user.firstName} {user.lastName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={
                          user.role === 'ADMIN'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : user.role === 'INSTRUCTOR'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/10" asChild>
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
          <Card className="hover:border-cyan-500/40 transition-all cursor-pointer bg-slate-900/50 border-white/10">
            <Link href="/admin/courses">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{t.admin.quickActions.manageCourses}</h3>
                    <p className="text-sm text-slate-400">
                      {t.admin.quickActions.manageCoursesDesc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:border-green-500/40 transition-all cursor-pointer bg-slate-900/50 border-white/10">
            <Link href="/admin/users">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{t.admin.quickActions.manageUsers}</h3>
                    <p className="text-sm text-slate-400">
                      {t.admin.quickActions.manageUsersDesc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:border-purple-500/40 transition-all cursor-pointer bg-slate-900/50 border-white/10">
            <Link href="/admin/reports">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                    <BarChart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{t.admin.quickActions.reports}</h3>
                    <p className="text-sm text-slate-400">
                      {t.admin.quickActions.reportsDesc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
