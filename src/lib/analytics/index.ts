import { prisma } from '@/lib/prisma'

// Track analytics events
export async function trackEvent(
  eventType: string,
  data: {
    userId?: string
    sessionId?: string
    courseId?: string
    lessonId?: string
    metadata?: Record<string, unknown>
  }
) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType,
        userId: data.userId,
        sessionId: data.sessionId,
        courseId: data.courseId,
        lessonId: data.lessonId,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    })
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

// Get instructor dashboard stats
export async function getInstructorStats(instructorId: string) {
  const [courses, enrollments, completions, quizStats] = await Promise.all([
    // Total courses
    prisma.course.findMany({
      where: { authorId: instructorId },
      select: {
        id: true,
        title: true,
        isPublished: true,
        _count: {
          select: { enrollments: true }
        }
      }
    }),
    // Total enrollments across all courses
    prisma.enrollment.count({
      where: {
        course: { authorId: instructorId }
      }
    }),
    // Completed enrollments
    prisma.enrollment.count({
      where: {
        course: { authorId: instructorId },
        status: 'COMPLETED'
      }
    }),
    // Quiz performance
    prisma.quizAttempt.aggregate({
      where: {
        quiz: {
          lesson: {
            module: {
              course: { authorId: instructorId }
            }
          }
        }
      },
      _avg: { percentage: true },
      _count: true
    })
  ])

  const totalStudents = new Set(
    (await prisma.enrollment.findMany({
      where: { course: { authorId: instructorId } },
      select: { userId: true }
    })).map((e: { userId: string }) => e.userId)
  ).size

  return {
    totalCourses: courses.length,
    publishedCourses: courses.filter((c: { isPublished: boolean }) => c.isPublished).length,
    totalEnrollments: enrollments,
    completedEnrollments: completions,
    completionRate: enrollments > 0 ? (completions / enrollments) * 100 : 0,
    totalStudents,
    avgQuizScore: quizStats._avg.percentage || 0,
    totalQuizAttempts: quizStats._count,
    courseStats: courses.map((c: { id: string; title: string; isPublished: boolean; _count: { enrollments: number } }) => ({
      id: c.id,
      title: c.title,
      isPublished: c.isPublished,
      enrollments: c._count.enrollments
    }))
  }
}

// Get course-specific analytics
export async function getCourseAnalytics(courseId: string) {
  const [course, enrollments, progress, lessonStats, quizStats, recentActivity] = await Promise.all([
    // Course info
    prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              select: { id: true, title: true }
            }
          }
        }
      }
    }),
    // Enrollment breakdown
    prisma.enrollment.groupBy({
      by: ['status'],
      where: { courseId },
      _count: true
    }),
    // Average progress
    prisma.courseProgress.aggregate({
      where: { courseId },
      _avg: { progressPercent: true, timeSpent: true }
    }),
    // Lesson completion rates
    prisma.lessonProgress.groupBy({
      by: ['lessonId'],
      where: {
        lesson: {
          module: { courseId }
        },
        isCompleted: true
      },
      _count: true
    }),
    // Quiz performance by quiz
    prisma.quizAttempt.groupBy({
      by: ['quizId'],
      where: {
        quiz: {
          lesson: {
            module: { courseId }
          }
        }
      },
      _avg: { percentage: true },
      _count: true
    }),
    // Recent activity
    prisma.lessonProgress.findMany({
      where: {
        lesson: {
          module: { courseId }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: { firstName: true, lastName: true }
        },
        lesson: {
          select: { title: true }
        }
      }
    })
  ])

  return {
    course,
    enrollmentsByStatus: enrollments.reduce((acc: Record<string, number>, e: { status: string; _count: number }) => {
      acc[e.status] = e._count
      return acc
    }, {} as Record<string, number>),
    avgProgress: progress._avg.progressPercent || 0,
    avgTimeSpent: progress._avg.timeSpent || 0,
    lessonCompletionRates: lessonStats,
    quizPerformance: quizStats.map((q: { quizId: string; _avg: { percentage: number | null }; _count: number }) => ({
      quizId: q.quizId,
      avgScore: q._avg.percentage || 0,
      attempts: q._count
    })),
    recentActivity: recentActivity.map((a: { user: { firstName: string | null; lastName: string | null }; lesson: { title: string }; completedAt: Date | null }) => ({
      user: `${a.user.firstName} ${a.user.lastName}`,
      lesson: a.lesson.title,
      completedAt: a.completedAt
    }))
  }
}

// Get student progress for a course
export async function getStudentProgress(courseId: string, limit = 50, offset = 0) {
  const students = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true
        }
      }
    },
    take: limit,
    skip: offset,
    orderBy: { enrolledAt: 'desc' }
  })

  const studentIds = students.map((s: { userId: string }) => s.userId)

  const [progressData, quizData] = await Promise.all([
    prisma.courseProgress.findMany({
      where: {
        courseId,
        userId: { in: studentIds }
      }
    }),
    prisma.quizAttempt.findMany({
      where: {
        userId: { in: studentIds },
        quiz: {
          lesson: {
            module: { courseId }
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    })
  ])

  const progressMap = new Map(progressData.map((p: { userId: string; progressPercent: number; timeSpent: number; lastAccessedAt: Date | null }) => [p.userId, p]))
  const quizMap = new Map<string, typeof quizData>()
  quizData.forEach((q: { userId: string; percentage: number }) => {
    const existing = quizMap.get(q.userId) || []
    existing.push(q as (typeof quizData)[number])
    quizMap.set(q.userId, existing)
  })

  return students.map((enrollment: { userId: string; user: { id: string; firstName: string | null; lastName: string | null; email: string; avatar: string | null }; enrolledAt: Date; status: string }) => {
    const progress = progressMap.get(enrollment.userId) as { progressPercent: number; timeSpent: number; lastAccessedAt: Date | null } | undefined
    const quizzes = quizMap.get(enrollment.userId) || []
    const avgQuizScore = quizzes.length > 0
      ? quizzes.reduce((sum: number, q: { percentage: number }) => sum + q.percentage, 0) / quizzes.length
      : null

    return {
      student: enrollment.user,
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status,
      progress: progress?.progressPercent || 0,
      timeSpent: progress?.timeSpent || 0,
      lastAccessed: progress?.lastAccessedAt,
      quizAttempts: quizzes.length,
      avgQuizScore
    }
  })
}

// Get platform-wide statistics (admin)
export async function getPlatformStats() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    newUsers30d,
    activeUsers7d,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    newEnrollments30d,
    completedCourses,
    totalQuizAttempts,
    avgQuizScore,
    totalCertificates
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: sevenDaysAgo } } }),
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { enrolledAt: { gte: thirtyDaysAgo } } }),
    prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
    prisma.quizAttempt.count(),
    prisma.quizAttempt.aggregate({ _avg: { percentage: true } }),
    prisma.certificate.count()
  ])

  return {
    users: {
      total: totalUsers,
      new30d: newUsers30d,
      active7d: activeUsers7d
    },
    courses: {
      total: totalCourses,
      published: publishedCourses
    },
    enrollments: {
      total: totalEnrollments,
      new30d: newEnrollments30d,
      completed: completedCourses,
      completionRate: totalEnrollments > 0 ? (completedCourses / totalEnrollments) * 100 : 0
    },
    quizzes: {
      totalAttempts: totalQuizAttempts,
      avgScore: avgQuizScore._avg.percentage || 0
    },
    certificates: totalCertificates
  }
}

// Get daily stats for charts
export async function getDailyStatsRange(startDate: Date, endDate: Date) {
  const stats = await prisma.dailyStats.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { date: 'asc' }
  })

  return stats
}

// Update daily stats (run via cron job)
export async function updateDailyStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    activeUsers,
    newUsers,
    newEnrollments,
    completedLessons,
    completedCourses,
    quizAttempts,
    totalTimeSpent
  ] = await Promise.all([
    prisma.user.count({
      where: { lastLoginAt: { gte: today, lt: tomorrow } }
    }),
    prisma.user.count({
      where: { createdAt: { gte: today, lt: tomorrow } }
    }),
    prisma.enrollment.count({
      where: { enrolledAt: { gte: today, lt: tomorrow } }
    }),
    prisma.lessonProgress.count({
      where: { completedAt: { gte: today, lt: tomorrow }, isCompleted: true }
    }),
    prisma.enrollment.count({
      where: { completedAt: { gte: today, lt: tomorrow }, status: 'COMPLETED' }
    }),
    prisma.quizAttempt.aggregate({
      where: { completedAt: { gte: today, lt: tomorrow } },
      _count: true,
      _avg: { percentage: true }
    }),
    prisma.courseProgress.aggregate({
      where: { lastAccessedAt: { gte: today, lt: tomorrow } },
      _sum: { timeSpent: true }
    })
  ])

  await prisma.dailyStats.upsert({
    where: { date: today },
    update: {
      activeUsers,
      newUsers,
      newEnrollments,
      completedLessons,
      completedCourses,
      quizAttempts: quizAttempts._count,
      avgQuizScore: quizAttempts._avg.percentage || 0,
      totalTimeSpent: totalTimeSpent._sum.timeSpent || 0
    },
    create: {
      date: today,
      activeUsers,
      newUsers,
      newEnrollments,
      completedLessons,
      completedCourses,
      quizAttempts: quizAttempts._count,
      avgQuizScore: quizAttempts._avg.percentage || 0,
      totalTimeSpent: totalTimeSpent._sum.timeSpent || 0
    }
  })
}
