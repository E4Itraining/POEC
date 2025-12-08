import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface LearnLayoutProps {
  children: React.ReactNode
  params: { slug: string }
}

export default async function LearnLayout({ children, params }: LearnLayoutProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/auth/login?callbackUrl=/courses/${params.slug}/learn`)
  }

  const course = await prisma.course.findUnique({
    where: { slug: params.slug, isPublished: true },
    include: {
      enrollments: {
        where: { userId: session.user.id },
      },
    },
  })

  if (!course) {
    notFound()
  }

  if (course.enrollments.length === 0) {
    redirect(`/courses/${params.slug}`)
  }

  return <>{children}</>
}
