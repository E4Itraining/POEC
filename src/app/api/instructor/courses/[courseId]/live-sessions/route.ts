import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSessionSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional().nullable(),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).default(60),
  type: z.enum(['WEBINAR', 'WORKSHOP', 'Q_AND_A', 'OFFICE_HOURS']).default('WEBINAR'),
  provider: z.enum(['JITSI', 'ZOOM', 'GOOGLE_MEET', 'TEAMS', 'CUSTOM']).default('JITSI'),
  roomUrl: z.string().optional().nullable(),
  maxParticipants: z.number().optional().nullable(),
  isRecorded: z.boolean().default(true),
  allowChat: z.boolean().default(true),
  allowQuestions: z.boolean().default(true),
  courseId: z.string(),
})

// Helper pour vérifier l'accès au cours
async function checkCourseAccess(courseId: string, userId: string, role: string) {
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

  return { success: true }
}

// GET - Liste des sessions live d'un cours
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const access = await checkCourseAccess(courseId, session.user.id, session.user.role)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const sessions = await prisma.liveSession.findMany({
      where: { courseId },
      include: {
        _count: { select: { registrations: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    })

    // Ajouter le nombre de participants
    const sessionsWithParticipants = sessions.map((s) => ({
      ...s,
      participantCount: s._count.registrations,
    }))

    return NextResponse.json(sessionsWithParticipants)
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une nouvelle session live
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const access = await checkCourseAccess(courseId, session.user.id, session.user.role)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const body = await request.json()
    const validatedData = createSessionSchema.parse(body)

    // Générer l'URL de la salle pour Jitsi
    let roomUrl = validatedData.roomUrl
    let roomId = null

    if (validatedData.provider === 'JITSI' && !roomUrl) {
      roomId = `poec-${courseId.slice(0, 8)}-${Date.now()}`
      roomUrl = `https://meet.jit.si/${roomId}`
    }

    const liveSession = await prisma.liveSession.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        scheduledAt: new Date(validatedData.scheduledAt),
        duration: validatedData.duration,
        type: validatedData.type,
        provider: validatedData.provider,
        roomUrl,
        roomId,
        maxParticipants: validatedData.maxParticipants || null,
        isRecorded: validatedData.isRecorded,
        allowChat: validatedData.allowChat,
        allowQuestions: validatedData.allowQuestions,
        hostId: session.user.id,
        courseId,
      },
    })

    return NextResponse.json(liveSession, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la création de la session:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
