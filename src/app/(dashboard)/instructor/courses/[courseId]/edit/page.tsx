import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CourseEditor } from './course-editor'

export const metadata = {
  title: 'Edit Course | Erythix Campus',
  description: 'Edit your course content and settings',
}

async function getCourse(courseId: string, userId: string, role: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      _count: {
        select: { enrollments: true, modules: true },
      },
      modules: {
        include: {
          _count: { select: { lessons: true } },
          lessons: {
            include: {
              quiz: {
                include: {
                  questions: {
                    include: { answers: true },
                    orderBy: { order: 'asc' },
                  },
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!course) {
    return null
  }

  // Vérifier les permissions
  if (course.authorId !== userId && role !== 'ADMIN') {
    return null
  }

  return course
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const session = await getServerSession(authOptions)
  const { courseId } = await params

  if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
    redirect('/dashboard')
  }

  const course = await getCourse(courseId, session.user.id, session.user.role)

  if (!course) {
    notFound()
  }

  return <CourseEditor initialCourse={course} />
}
