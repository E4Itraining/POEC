import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSessionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().min(15).optional(),
  status: z.enum(['SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED']).optional(),
  type: z.enum(['WEBINAR', 'WORKSHOP', 'Q_AND_A', 'OFFICE_HOURS']).optional(),
  provider: z.enum(['JITSI', 'ZOOM', 'GOOGLE_MEET', 'TEAMS', 'CUSTOM']).optional(),
  roomUrl: z.string().optional().nullable(),
  maxParticipants: z.number().optional().nullable(),
  isRecorded: z.boolean().optional(),
  allowChat: z.boolean().optional(),
  allowQuestions: z.boolean().optional(),
  recordingUrl: z.string().optional().nullable(),
})

// Helper pour vérifier l'accès
async function checkAccess(courseId: string, sessionId: string, userId: string, role: string) {
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

  const session = await prisma.liveSession.findUnique({
    where: { id: sessionId },
  })

  if (!session || session.courseId !== courseId) {
    return { error: 'Session non trouvée', status: 404 }
  }

  return { success: true, session }
}

// GET - Récupérer une session spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId, sessionId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const access = await checkAccess(courseId, sessionId, session.user.id, session.user.role)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        registrations: {
          include: {
            // On ne peut pas inclure user directement car pas de relation définie
          },
        },
      },
    })

    return NextResponse.json(liveSession)
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour une session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId, sessionId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const access = await checkAccess(courseId, sessionId, session.user.id, session.user.role)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const body = await request.json()
    const validatedData = updateSessionSchema.parse(body)

    const updateData: Record<string, unknown> = {}

    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.scheduledAt !== undefined) updateData.scheduledAt = new Date(validatedData.scheduledAt)
    if (validatedData.duration !== undefined) updateData.duration = validatedData.duration
    if (validatedData.type !== undefined) updateData.type = validatedData.type
    if (validatedData.provider !== undefined) updateData.provider = validatedData.provider
    if (validatedData.roomUrl !== undefined) updateData.roomUrl = validatedData.roomUrl
    if (validatedData.maxParticipants !== undefined) updateData.maxParticipants = validatedData.maxParticipants
    if (validatedData.isRecorded !== undefined) updateData.isRecorded = validatedData.isRecorded
    if (validatedData.allowChat !== undefined) updateData.allowChat = validatedData.allowChat
    if (validatedData.allowQuestions !== undefined) updateData.allowQuestions = validatedData.allowQuestions
    if (validatedData.recordingUrl !== undefined) updateData.recordingUrl = validatedData.recordingUrl

    // Gestion du statut avec timestamps
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
      if (validatedData.status === 'LIVE' && !access.session?.actualStartAt) {
        updateData.actualStartAt = new Date()
      } else if (validatedData.status === 'ENDED' && !access.session?.actualEndAt) {
        updateData.actualEndAt = new Date()
      }
    }

    const liveSession = await prisma.liveSession.update({
      where: { id: sessionId },
      data: updateData,
    })

    return NextResponse.json(liveSession)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la mise à jour de la session:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId, sessionId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const access = await checkAccess(courseId, sessionId, session.user.id, session.user.role)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    await prisma.liveSession.delete({
      where: { id: sessionId },
    })

    return NextResponse.json({ success: true, message: 'Session supprimée' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
