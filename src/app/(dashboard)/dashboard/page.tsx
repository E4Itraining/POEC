import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardClient } from './dashboard-client'

export const metadata = {
  title: 'Tableau de bord | Erythix Campus',
  description: 'Votre espace d\'apprentissage personnel',
}

async function getDashboardData(userId: string) {
  const [enrollments, badges, recentProgress, notifications, recommendedCourses] = await Promise.all([
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
    }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
      take: 6,
    }),
    prisma.courseProgress.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { lastAccessedAt: 'desc' },
      take: 4,
    }),
    prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.course.findMany({
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
        modules: {
          include: {
            lessons: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { isFeatured: 'desc' },
      take: 4,
    }),
  ])

  // Calculate completed lessons for each course
  const lessonProgressMap = await prisma.lessonProgress.findMany({
    where: { userId },
    select: { lessonId: true, isCompleted: true },
  })

  const completedLessonsSet = new Set(
    lessonProgressMap.filter(lp => lp.isCompleted).map(lp => lp.lessonId)
  )

  const coursesWithProgress = recentProgress.map(progress => {
    const enrollment = enrollments.find(e => e.courseId === progress.courseId)
    const totalLessons = enrollment?.course.modules.reduce(
      (acc, m) => acc + m.lessons.length,
      0
    ) || 0
    const completedLessons = enrollment?.course.modules.reduce(
      (acc, m) => acc + m.lessons.filter(l => completedLessonsSet.has(l.id)).length,
      0
    ) || 0

    return {
      id: progress.course.id,
      slug: progress.course.slug,
      title: progress.course.title,
      thumbnail: progress.course.thumbnail,
      level: progress.course.level,
      category: progress.course.category,
      duration: progress.course.duration,
      progress: progress.progressPercent,
      completedLessons,
      totalLessons,
      lastAccessedAt: progress.lastAccessedAt,
    }
  })

  const totalCoursesEnrolled = enrollments.length
  const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length
  const totalTimeSpent = recentProgress.reduce((acc, p) => acc + p.timeSpent, 0)
  const averageProgress = recentProgress.length > 0
    ? recentProgress.reduce((acc, p) => acc + p.progressPercent, 0) / recentProgress.length
    : 0
  const totalPoints = badges.reduce((acc, ub) => acc + ub.badge.points, 0)

  return {
    coursesInProgress: coursesWithProgress,
    badges: badges.map(ub => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon,
      points: ub.badge.points,
      category: ub.badge.category,
      earnedAt: ub.earnedAt,
    })),
    notifications: notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      createdAt: n.createdAt,
    })),
    recommendedCourses: recommendedCourses.map(course => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      shortDescription: course.shortDescription,
      thumbnail: course.thumbnail,
      level: course.level,
      category: course.category,
      duration: course.duration,
      isFree: course.isFree,
      isFeatured: course.isFeatured,
      author: course.author,
      enrollmentCount: course._count.enrollments,
      lessonCount: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
    })),
    stats: {
      totalCoursesEnrolled,
      completedCourses,
      totalTimeSpent,
      averageProgress,
      badgesCount: badges.length,
      totalPoints,
    },
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const data = await getDashboardData(session.user.id)

  return (
    <DashboardClient
      user={{
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        email: session.user.email || '',
        avatar: session.user.avatar || null,
      }}
      data={data}
    />
  )
}
