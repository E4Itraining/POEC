import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MyCoursesClient } from './my-courses-client'

export const metadata = {
  title: 'Mes formations | Erythix Campus',
  description: 'Gérez vos formations et suivez votre progression',
}

async function getUserCourses(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          author: { select: { firstName: true, lastName: true } },
          modules: {
            include: {
              lessons: {
                include: {
                  lessonProgress: {
                    where: { userId },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  })

  const courseProgress = await prisma.courseProgress.findMany({
    where: { userId },
  })

  return enrollments.map((enrollment) => {
    const progress = courseProgress.find((p) => p.courseId === enrollment.courseId)
    const totalLessons = enrollment.course.modules.reduce(
      (acc, m) => acc + m.lessons.length,
      0
    )
    const completedLessons = enrollment.course.modules.reduce(
      (acc, m) =>
        acc + m.lessons.filter((l) => l.lessonProgress[0]?.isCompleted).length,
      0
    )

    return {
      id: enrollment.id,
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        slug: enrollment.course.slug,
        thumbnail: enrollment.course.thumbnail,
        level: enrollment.course.level,
        category: enrollment.course.category,
        duration: enrollment.course.duration,
        author: enrollment.course.author,
      },
      progress: progress?.progressPercent || 0,
      totalLessons,
      completedLessons,
      timeSpent: progress?.timeSpent || 0,
      lastAccessedAt: progress?.lastAccessedAt || null,
    }
  })
}

async function getCertificates(userId: string) {
  const certs = await prisma.certificate.findMany({
    where: { userId },
    include: {
      course: true,
    },
    orderBy: { issuedAt: 'desc' },
  })

  return certs.map((cert) => ({
    id: cert.id,
    certificateNumber: cert.certificateNumber,
    issuedAt: cert.issuedAt,
    course: {
      id: cert.course.id,
      title: cert.course.title,
      slug: cert.course.slug,
    },
  }))
}

export default async function MyCoursesPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const [courses, certificates] = await Promise.all([
    getUserCourses(session.user.id),
    getCertificates(session.user.id),
  ])

  return <MyCoursesClient courses={courses} certificates={certificates} />
}
