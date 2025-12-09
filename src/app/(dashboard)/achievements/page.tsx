import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AchievementsClient } from './achievements-client'

export const metadata = {
  title: 'Achievements | Erythix Campus',
  description: 'Discover your achievements and earned badges',
}

async function getUserAchievements(userId: string) {
  const [userBadges, allBadges, stats] = await Promise.all([
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    }),
    prisma.badge.findMany({
      orderBy: { points: 'desc' },
    }),
    Promise.all([
      prisma.enrollment.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.lessonProgress.count({ where: { userId, isCompleted: true } }),
      prisma.quizAttempt.count({ where: { userId, isPassed: true } }),
      prisma.certificate.count({ where: { userId } }),
    ]),
  ])

  const [completedCourses, completedLessons, passedQuizzes, certificates] = stats

  const totalPoints = userBadges.reduce((acc, ub) => acc + ub.badge.points, 0)

  return {
    userBadges,
    allBadges,
    stats: {
      completedCourses,
      completedLessons,
      passedQuizzes,
      certificates,
      totalPoints,
    },
  }
}

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const { userBadges, allBadges, stats } = await getUserAchievements(session.user.id)

  return (
    <AchievementsClient
      userBadges={userBadges}
      allBadges={allBadges}
      stats={stats}
    />
  )
}
