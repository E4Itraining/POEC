import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { InstructorClient } from './instructor-client'

export const metadata = {
  title: 'My Courses | Erythix Campus',
  description: 'Manage your courses and trainings',
}

async function getInstructorCourses(userId: string) {
  return prisma.course.findMany({
    where: { authorId: userId },
    include: {
      _count: {
        select: { enrollments: true, modules: true },
      },
      modules: {
        include: {
          _count: { select: { lessons: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function InstructorCoursesPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
    redirect('/dashboard')
  }

  const courses = await getInstructorCourses(session.user.id)

  return <InstructorClient courses={courses} />
}
