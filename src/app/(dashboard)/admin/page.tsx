import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminClient } from './admin-client'

export const metadata = {
  title: 'Administration | Erythix Campus',
  description: 'Admin dashboard',
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

  return <AdminClient stats={stats} />
}
