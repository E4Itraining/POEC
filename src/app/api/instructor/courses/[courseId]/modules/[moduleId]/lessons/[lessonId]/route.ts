import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  type: z.enum(['TEXT', 'VIDEO', 'QUIZ', 'ASSIGNMENT', 'INTERACTIVE', 'LIVE']).optional(),
  content: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  duration: z.number().min(0).optional(),
  isPreview: z.boolean().optional(),
  resources: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
  })).optional().nullable(),
  order: z.number().optional(),
})

// Helper pour vérifier l'accès
async function checkAccess(courseId: string, moduleId: string, lessonId: string, userId: string, role: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { authorId: true },
  })

  if (!course) {
    return { error: 'Cours non trouvé', status: 404 }
  }

  if (course.authorId !== userId && role !== 'ADMIN') {
    return { error: 'Non autorisé', status: 403 }
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  })

  if (!lesson || lesson.moduleId !== moduleId || lesson.module.courseId !== courseId) {
    return { error: 'Leçon non trouvée', status: 404 }
  }

  return { success: true, lesson }
}

// GET - Récupérer une leçon spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId, moduleId, lessonId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const access = await checkAccess(courseId, moduleId, lessonId, session.user.id, session.user.role)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        quiz: {
          include: {
            questions: {
              include: { answers: true },
              orderBy: { order: 'asc' },
            },
          },
        },
        labAssignments: true,
        repoAssignments: true,
      },
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Erreur lors de la récupération de la leçon:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour une leçon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId, moduleId, lessonId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const access = await checkAccess(courseId, moduleId, lessonId, session.user.id, session.user.role)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const body = await request.json()
    const validatedData = updateLessonSchema.parse(body)

    const updateData: Record<string, unknown> = {}

    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.type !== undefined) updateData.type = validatedData.type
    if (validatedData.content !== undefined) updateData.content = validatedData.content
    if (validatedData.videoUrl !== undefined) updateData.videoUrl = validatedData.videoUrl
    if (validatedData.duration !== undefined) updateData.duration = validatedData.duration
    if (validatedData.isPreview !== undefined) updateData.isPreview = validatedData.isPreview
    if (validatedData.order !== undefined) updateData.order = validatedData.order
    if (validatedData.resources !== undefined) {
      updateData.resources = validatedData.resources ? JSON.stringify(validatedData.resources) : null
    }

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
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
    })

    // Mettre à jour la durée totale du cours
    await updateCourseDuration(courseId)

    return NextResponse.json(lesson)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la mise à jour de la leçon:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une leçon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId, moduleId, lessonId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const access = await checkAccess(courseId, moduleId, lessonId, session.user.id, session.user.role)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    })

    // Réordonner les leçons restantes
    const remainingLessons = await prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
    })

    await Promise.all(
      remainingLessons.map((lesson: { id: string }, index: number) =>
        prisma.lesson.update({
          where: { id: lesson.id },
          data: { order: index },
        })
      )
    )

    // Mettre à jour la durée totale du cours
    await updateCourseDuration(courseId)

    return NextResponse.json({ success: true, message: 'Leçon supprimée' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la leçon:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Helper pour mettre à jour la durée totale du cours
async function updateCourseDuration(courseId: string) {
  const modules = await prisma.module.findMany({
    where: { courseId },
    include: {
      lessons: {
        select: { duration: true },
      },
    },
  })

  const totalDuration = modules.reduce((acc: number, mod: { lessons: { duration: number }[] }) => {
    return acc + mod.lessons.reduce((lessonAcc: number, lesson: { duration: number }) => lessonAcc + lesson.duration, 0)
  }, 0)

  await prisma.course.update({
    where: { id: courseId },
    data: { duration: totalDuration },
  })
}
