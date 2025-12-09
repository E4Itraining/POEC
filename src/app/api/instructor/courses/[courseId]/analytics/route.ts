import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCourseAnalytics, getStudentProgress } from '@/lib/analytics'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Cours non trouvé' },
        { status: 404 }
      )
    }

    if (course.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé à ce cours' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeStudents = searchParams.get('students') === 'true'

    const analytics = await getCourseAnalytics(courseId)

    let students = null
    if (includeStudents) {
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')
      students = await getStudentProgress(courseId, limit, offset)
    }

    return NextResponse.json({
      ...analytics,
      students
    })
  } catch (error) {
    console.error('Course analytics error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des analytics' },
      { status: 500 }
    )
  }
}
