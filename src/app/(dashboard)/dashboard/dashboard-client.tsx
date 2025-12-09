'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n'
import { LearnerHeader } from '@/components/learner/header'
import { StatsCard } from '@/components/learner/stats-card'
import { CourseProgressCard } from '@/components/learner/course-progress-card'
import { BadgeCard } from '@/components/learner/badge-card'
import { StreakCounter } from '@/components/learner/streak-counter'
import { QuickActions } from '@/components/learner/quick-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  Bell,
  Sparkles,
  Users,
  Star,
  Flame,
  Target,
} from 'lucide-react'

interface DashboardClientProps {
  user: {
    firstName: string
    lastName: string
    email: string
    avatar: string | null
  }
  data: {
    coursesInProgress: Array<{
      id: string
      slug: string
      title: string
      thumbnail: string | null
      level: string
      category: string
      duration: number
      progress: number
      completedLessons: number
      totalLessons: number
      lastAccessedAt: Date
    }>
    badges: Array<{
      id: string
      name: string
      description: string
      icon: string
      points: number
      category: string
      earnedAt: Date
    }>
    notifications: Array<{
      id: string
      title: string
      message: string
      type: string
      createdAt: Date
    }>
    recommendedCourses: Array<{
      id: string
      slug: string
      title: string
      shortDescription: string | null
      thumbnail: string | null
      level: string
      category: string
      duration: number
      isFree: boolean
      isFeatured: boolean
      author: { firstName: string; lastName: string }
      enrollmentCount: number
      lessonCount: number
    }>
    stats: {
      totalCoursesEnrolled: number
      completedCourses: number
      totalTimeSpent: number
      averageProgress: number
      badgesCount: number
      totalPoints: number
    }
  }
}

export function DashboardClient({ user, data }: DashboardClientProps) {
  const { t, locale } = useTranslation()

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}${t.dashboard.stats.minutes}` : ''}`
    }
    return `${mins} ${t.dashboard.stats.minutes}`
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LearnerHeader />

      <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Welcome Section - Premium glassmorphism design */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-cyan-600 p-8 text-primary-foreground">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-cyan-400/20 rounded-full translate-y-1/2 blur-2xl" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full" />

          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl" />
            <div className="absolute bottom-10 right-20 w-16 h-16 bg-cyan-300/30 rounded-full blur-xl" />
          </div>

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-primary-foreground/80 text-sm font-medium mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {t.dashboard.welcome},
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-primary-foreground/80 max-w-md">
                {t.dashboard.subtitle}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/my-courses" className="gap-2">
                  <Target className="h-5 w-5" />
                  Mes cours
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <Link href="/courses" className="gap-2">
                  <BookOpen className="h-5 w-5" />
                  {t.dashboard.browseCourses}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">
            {locale === 'fr' ? 'Vos statistiques' : 'Your statistics'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Streak Counter - Premium component */}
            <div className="sm:col-span-2 lg:col-span-2">
              <StreakCounter
                currentStreak={7}
                longestStreak={21}
                lastActiveDate={new Date()}
              />
            </div>
            <StatsCard
              title={t.dashboard.stats.coursesEnrolled}
              value={data.stats.totalCoursesEnrolled}
              subtitle={`${data.stats.completedCourses} ${locale === 'fr' ? 'terminé(s)' : 'completed'}`}
              icon={BookOpen}
              variant="cyan"
            />
            <StatsCard
              title={t.dashboard.stats.learningTime}
              value={formatDuration(data.stats.totalTimeSpent)}
              subtitle={t.common.thisWeek}
              icon={Clock}
              variant="success"
            />
            <StatsCard
              title={t.dashboard.stats.badgesEarned}
              value={data.stats.badgesCount}
              subtitle={`${data.stats.totalPoints} pts`}
              icon={Trophy}
              variant="warning"
            />
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Continue Learning - Takes 2 columns */}
          <section className="lg:col-span-2 space-y-6" aria-labelledby="continue-heading">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="continue-heading" className="text-xl font-semibold">
                  {t.dashboard.continueLearning}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {locale === 'fr' ? 'Reprenez là où vous vous êtes arrêté' : 'Pick up where you left off'}
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild className="gap-1">
                <Link href="/my-courses">
                  {t.dashboard.viewAll}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {data.coursesInProgress.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {data.coursesInProgress.slice(0, 2).map((course, index) => (
                  <CourseProgressCard
                    key={course.id}
                    course={course}
                    variant={index === 0 ? 'featured' : 'default'}
                    className={index === 0 ? 'md:col-span-2' : ''}
                  />
                ))}
                {data.coursesInProgress.slice(2).map((course) => (
                  <CourseProgressCard
                    key={course.id}
                    course={course}
                    variant="compact"
                    className="md:col-span-1"
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{t.dashboard.noCoursesYet}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t.dashboard.startLearning}
                  </p>
                  <Button asChild>
                    <Link href="/courses">{t.dashboard.browseCourses}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Badges */}
            <section aria-labelledby="badges-heading">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                      {t.dashboard.recentBadges}
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild className="gap-1 h-8">
                      <Link href="/achievements">
                        {t.dashboard.viewAll}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {data.badges.length > 0 ? (
                    <div className="space-y-2">
                      {data.badges.slice(0, 4).map((badge) => (
                        <BadgeCard
                          key={badge.id}
                          badge={badge}
                          variant="compact"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Trophy className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">{t.dashboard.noBadgesYet}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.dashboard.earnBadges}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Notifications */}
            <section aria-labelledby="notifications-heading">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    {t.dashboard.notifications}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.notifications.length > 0 ? (
                    <div className="space-y-3">
                      {data.notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t.dashboard.noNotifications}
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>

        {/* Recommended Courses */}
        {data.recommendedCourses.length > 0 && (
          <section aria-labelledby="recommended-heading">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 id="recommended-heading" className="text-xl font-semibold">
                  {t.dashboard.recommendedCourses}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {locale === 'fr' ? 'Basés sur vos intérêts' : 'Based on your interests'}
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild className="gap-1">
                <Link href="/courses">
                  {t.dashboard.viewAll}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.recommendedCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:border-primary/30">
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <BookOpen className="h-10 w-10 text-primary/50" />
                        </div>
                      )}
                      {/* Badges overlay */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        {course.isFeatured && (
                          <Badge className="bg-yellow-500 text-yellow-950 text-[10px] px-1.5 py-0.5">
                            <Star className="h-3 w-3 mr-0.5" fill="currentColor" />
                            {locale === 'fr' ? 'Populaire' : 'Popular'}
                          </Badge>
                        )}
                        {course.isFree && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                            {t.courses.free}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-[10px] ${getLevelColor(course.level)}`}>
                          {getLevelLabel(course.level)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {course.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {course.author.firstName} {course.author.lastName}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(course.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.enrollmentCount}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Quick Actions FAB */}
      <QuickActions />
    </div>
  )
}
