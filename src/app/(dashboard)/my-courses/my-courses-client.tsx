'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { LearnerHeader } from '@/components/learner/header'
import { CourseProgressCard } from '@/components/learner/course-progress-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle2,
  Award,
  Calendar,
  Search,
  Download,
  FileText,
  ArrowRight,
  Filter,
} from 'lucide-react'

interface Course {
  id: string
  enrolledAt: Date
  status: string
  course: {
    id: string
    title: string
    slug: string
    thumbnail: string | null
    level: string
    category: string
    duration: number
    author: { firstName: string; lastName: string }
  }
  progress: number
  totalLessons: number
  completedLessons: number
  timeSpent: number
  lastAccessedAt: Date | null
}

interface Certificate {
  id: string
  certificateNumber: string
  issuedAt: Date
  course: {
    id: string
    title: string
    slug: string
  }
}

interface MyCoursesClientProps {
  courses: Course[]
  certificates: Certificate[]
}

export function MyCoursesClient({ courses, certificates }: MyCoursesClientProps) {
  const { t, locale } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')

  const inProgressCourses = courses.filter(
    (c) => c.status === 'ACTIVE' && c.progress < 100
  )
  const completedCourses = courses.filter(
    (c) => c.status === 'COMPLETED' || c.progress >= 100
  )

  const filterCourses = (courseList: Course[]) => {
    return courseList.filter((c) => {
      const matchesSearch = c.course.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesLevel =
        levelFilter === 'all' || c.course.level === levelFilter
      return matchesSearch && matchesLevel
    })
  }

  const filteredInProgress = filterCourses(inProgressCourses)
  const filteredCompleted = filterCourses(completedCourses)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(
      locale === 'fr' ? 'fr-FR' : 'en-US',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    )
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ''}`
    }
    return `${mins}min`
  }

  const getLevelLabel = (level: string) =>
    t.courses.level[level as keyof typeof t.courses.level] || level

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

  return (
    <div className="min-h-screen">
      <LearnerHeader />

      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t.myCourses.title}</h1>
            <p className="text-muted-foreground">
              {locale === 'fr'
                ? 'Gérez vos inscriptions et suivez votre progression'
                : 'Manage your enrollments and track your progress'}
            </p>
          </div>
          <Button asChild>
            <Link href="/courses" className="gap-2">
              <BookOpen className="h-4 w-4" />
              {t.dashboard.browseCourses}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.courses.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t.courses.allLevels} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.courses.allLevels}</SelectItem>
              <SelectItem value="BEGINNER">{t.courses.level.BEGINNER}</SelectItem>
              <SelectItem value="INTERMEDIATE">{t.courses.level.INTERMEDIATE}</SelectItem>
              <SelectItem value="ADVANCED">{t.courses.level.ADVANCED}</SelectItem>
              <SelectItem value="EXPERT">{t.courses.level.EXPERT}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="in-progress" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="in-progress" className="gap-2">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">{t.myCourses.inProgress}</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {filteredInProgress.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t.myCourses.completedTab}</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {filteredCompleted.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">{t.myCourses.certificates}</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {certificates.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* In Progress */}
          <TabsContent value="in-progress" className="space-y-4">
            {filteredInProgress.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredInProgress.map((enrollment) => (
                  <CourseCard
                    key={enrollment.id}
                    enrollment={enrollment}
                    locale={locale}
                    t={t}
                    formatDate={formatDate}
                    formatDuration={formatDuration}
                    getLevelLabel={getLevelLabel}
                    getLevelColor={getLevelColor}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title={t.myCourses.noCourses}
                description={t.myCourses.startExploring}
                actionLabel={t.dashboard.browseCourses}
                actionHref="/courses"
              />
            )}
          </TabsContent>

          {/* Completed */}
          <TabsContent value="completed" className="space-y-4">
            {filteredCompleted.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCompleted.map((enrollment) => (
                  <CourseCard
                    key={enrollment.id}
                    enrollment={enrollment}
                    completed
                    locale={locale}
                    t={t}
                    formatDate={formatDate}
                    formatDuration={formatDuration}
                    getLevelLabel={getLevelLabel}
                    getLevelColor={getLevelColor}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title={locale === 'fr' ? 'Aucun cours terminé' : 'No completed courses'}
                description={
                  locale === 'fr'
                    ? 'Terminez vos cours pour les voir ici'
                    : 'Complete courses to see them here'
                }
              />
            )}
          </TabsContent>

          {/* Certificates */}
          <TabsContent value="certificates" className="space-y-4">
            {certificates.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {certificates.map((cert) => (
                  <CertificateCard
                    key={cert.id}
                    certificate={cert}
                    locale={locale}
                    t={t}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Award}
                title={locale === 'fr' ? 'Aucun certificat' : 'No certificates'}
                description={
                  locale === 'fr'
                    ? 'Terminez des cours pour obtenir des certificats'
                    : 'Complete courses to earn certificates'
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface CourseCardProps {
  enrollment: Course
  completed?: boolean
  locale: string
  t: any
  formatDate: (date: Date) => string
  formatDuration: (minutes: number) => string
  getLevelLabel: (level: string) => string
  getLevelColor: (level: string) => string
}

function CourseCard({
  enrollment,
  completed = false,
  locale,
  t,
  formatDate,
  formatDuration,
  getLevelLabel,
  getLevelColor,
}: CourseCardProps) {
  const { course, progress, totalLessons, completedLessons, timeSpent, enrolledAt } =
    enrollment

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
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
        {/* Progress overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Completed badge */}
        {completed && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-success text-success-foreground">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {t.learn.completed}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className={`text-xs ${getLevelColor(course.level)}`}>
            {getLevelLabel(course.level)}
          </Badge>
          <span className="text-xs text-muted-foreground">{course.category}</span>
        </div>

        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {course.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-3">
          {course.author.firstName} {course.author.lastName}
        </p>

        {/* Progress */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t.dashboard.progress}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {completedLessons}/{totalLessons} {t.courses.lessons}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(timeSpent)}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(enrolledAt)}
          </span>
          <Button size="sm" variant={completed ? 'outline' : 'default'} asChild className="gap-1">
            <Link href={`/courses/${course.slug}/learn`}>
              {completed
                ? locale === 'fr'
                  ? 'Revoir'
                  : 'Review'
                : t.dashboard.continueBtn}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface CertificateCardProps {
  certificate: Certificate
  locale: string
  t: any
  formatDate: (date: Date) => string
}

function CertificateCard({ certificate, locale, t, formatDate }: CertificateCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        {/* Certificate Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
              <Award className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-success flex items-center justify-center shadow">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Certificate Info */}
        <div className="text-center">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {certificate.course.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-1">
            {t.myCourses.issuedOn} {formatDate(certificate.issuedAt)}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {t.myCourses.certificateNumber}: {certificate.certificateNumber}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <Button variant="outline" className="flex-1 gap-2" size="sm">
            <FileText className="h-4 w-4" />
            {t.myCourses.viewCertificate}
          </Button>
          <Button className="flex-1 gap-2" size="sm">
            <Download className="h-4 w-4" />
            {locale === 'fr' ? 'Télécharger' : 'Download'}
          </Button>
        </div>
      </CardContent>
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

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="rounded-full bg-muted p-4 w-fit mx-auto mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}
