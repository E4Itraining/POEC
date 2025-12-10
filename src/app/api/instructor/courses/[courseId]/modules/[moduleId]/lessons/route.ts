import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createLessonSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  type: z.enum(['TEXT', 'VIDEO', 'QUIZ', 'ASSIGNMENT', 'INTERACTIVE', 'LIVE']).default('TEXT'),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.number().min(0).default(0),
  isPreview: z.boolean().default(false),
  resources: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
  })).optional(),
})

const reorderLessonsSchema = z.object({
  lessons: z.array(z.object({
    id: z.string(),
    order: z.number(),
  })),
})

// Helper pour vérifier l'accès au cours
async function checkCourseAccess(courseId: string, moduleId: string, userId: string, role: string) {
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

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
  })

  if (!module || module.courseId !== courseId) {
    return { error: 'Module non trouvé', status: 404 }
  }

  return { success: true }
}

// GET - Liste des leçons d'un module
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId, moduleId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const access = await checkCourseAccess(courseId, moduleId, session.user.id, session.user.role)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const lessons = await prisma.lesson.findMany({
      where: { moduleId },
      include: {
        quiz: {
          include: {
            _count: { select: { questions: true } },
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Erreur lors de la récupération des leçons:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une nouvelle leçon
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId, moduleId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const access = await checkCourseAccess(courseId, moduleId, session.user.id, session.user.role)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const body = await request.json()
    const validatedData = createLessonSchema.parse(body)

    // Déterminer l'ordre de la nouvelle leçon
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const newOrder = (lastLesson?.order ?? -1) + 1

    const lesson = await prisma.lesson.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        type: validatedData.type,
        content: validatedData.content || null,
        videoUrl: validatedData.videoUrl || null,
        duration: validatedData.duration,
        isPreview: validatedData.isPreview,
        resources: validatedData.resources ? JSON.stringify(validatedData.resources) : null,
        order: newOrder,
        moduleId,
      },
    })

    // Mettre à jour la durée totale du cours
    await updateCourseDuration(courseId)

    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la création de la leçon:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH - Réordonner les leçons
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId, moduleId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const access = await checkCourseAccess(courseId, moduleId, session.user.id, session.user.role)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const body = await request.json()
    const validatedData = reorderLessonsSchema.parse(body)

    await Promise.all(
      validatedData.lessons.map(({ id, order }) =>
        prisma.lesson.update({
          where: { id },
          data: { order },
        })
      )
    )

    const lessons = await prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(lessons)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la réorganisation des leçons:', error)
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
