import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { CourseCreationForm } from './course-creation-form'

export const metadata = {
  title: 'Create a Course | Erythix Campus',
  description: 'Create a new course as an instructor',
}

export default async function NewCoursePage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
    redirect('/dashboard')
  }

  return <CourseCreationForm />
}
