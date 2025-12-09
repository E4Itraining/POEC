'use client'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/lib/i18n'

interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string | null
  thumbnail: string | null
  level: string
  category: string
  duration: number
  isPublished: boolean
  createdAt: Date
  publishedAt: Date | null
  _count: {
    enrollments: number
    modules: number
  }
  modules: {
    _count: { lessons: number }
  }[]
}

interface InstructorClientProps {
  courses: Course[]
}

export function InstructorClient({ courses }: InstructorClientProps) {
  const { t, locale } = useI18n()

  const publishedCourses = courses.filter((c) => c.isPublished)
  const draftCourses = courses.filter((c) => !c.isPublished)
  const totalEnrollments = courses.reduce((acc, c) => acc + c._count.enrollments, 0)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ''}`
    }
    return `${mins}min`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(
      locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : locale === 'nl' ? 'nl-NL' : 'en-US'
    )
  }

  const getLevelLabel = (level: string) =>
    t.courses.level[level as keyof typeof t.courses.level] || level

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{t.instructor.title}</h1>
            <p className="text-slate-400 mt-1">
              {t.instructor.subtitle}
            </p>
          </div>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0" asChild>
            <Link href="/instructor/courses/new">
              <Plus className="mr-2 h-4 w-4" />
              {t.instructor.createCourse}
            </Link>
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{courses.length}</div>
                  <p className="text-sm text-slate-400">{t.instructor.stats.created}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{publishedCourses.length}</div>
                  <p className="text-sm text-slate-400">{t.instructor.stats.published}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{draftCourses.length}</div>
                  <p className="text-sm text-slate-400">{t.instructor.stats.drafts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalEnrollments}</div>
                  <p className="text-sm text-slate-400">{t.instructor.stats.students}</p>
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
                <Card key={course.id} className="hover:border-cyan-500/40 transition-all bg-slate-900/50 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-24 w-40 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center flex-shrink-0">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt=""
                            className="object-cover w-full h-full rounded-lg"
                          />
                        ) : (
                          <BookOpen className="h-10 w-10 text-cyan-400/40" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={
                                course.isPublished
                                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }>
                                {course.isPublished ? t.instructor.course.published : t.instructor.course.draft}
                              </Badge>
                              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                                {getLevelLabel(course.level)}
                              </Badge>
                              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">{course.category}</Badge>
                            </div>
                            <h3 className="font-semibold text-lg text-white">{course.title}</h3>
                            <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                              {course.shortDescription || course.description}
                            </p>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                              <DropdownMenuItem asChild className="text-slate-300 hover:text-white hover:bg-white/10">
                                <Link href={`/courses/${course.slug}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t.instructor.course.viewCourse}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="text-slate-300 hover:text-white hover:bg-white/10">
                                <Link href={`/instructor/courses/${course.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {t.instructor.course.edit}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-white/10">
                                {course.isPublished ? (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    {t.instructor.course.unpublish}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {t.instructor.course.publish}
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-6 mt-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {course._count.modules} {t.instructor.course.modules} • {totalLessons} {t.instructor.course.lessons}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDuration(course.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course._count.enrollments} {t.instructor.course.enrolled}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                          <span className="text-xs text-slate-500">
                            {t.instructor.course.createdOn} {formatDate(course.createdAt)}
                            {course.publishedAt && ` • ${t.instructor.course.publishedOn} ${formatDate(course.publishedAt)}`}
                          </span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-white/20 text-slate-300 hover:bg-white/10" asChild>
                              <Link href={`/instructor/courses/${course.id}/analytics`}>
                                {t.instructor.course.statistics}
                              </Link>
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0" asChild>
                              <Link href={`/instructor/courses/${course.id}/edit`}>
                                {t.instructor.course.edit}
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
          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <h3 className="text-lg font-medium mb-2 text-white">{t.instructor.noCourses.title}</h3>
              <p className="text-slate-400 mb-4">
                {t.instructor.noCourses.message}
              </p>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0" asChild>
                <Link href="/instructor/courses/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t.instructor.createCourse}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
