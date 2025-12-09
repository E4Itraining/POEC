import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validation pour la mise à jour
const updateCourseSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  shortDescription: z.string().optional().nullable(),
  category: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  price: z.number().min(0).optional(),
  isFree: z.boolean().optional(),
  thumbnail: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  duration: z.number().min(0).optional(),
})

// GET - Récupérer un cours spécifique
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
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est bien l'auteur
    if (course.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Erreur lors de la récupération du cours:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour un cours
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!existingCourse) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
    }

    if (existingCourse.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateCourseSchema.parse(body)

    // Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {}

    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.shortDescription !== undefined) updateData.shortDescription = validatedData.shortDescription
    if (validatedData.category !== undefined) updateData.category = validatedData.category
    if (validatedData.level !== undefined) updateData.level = validatedData.level
    if (validatedData.price !== undefined) updateData.price = validatedData.price
    if (validatedData.isFree !== undefined) updateData.isFree = validatedData.isFree
    if (validatedData.thumbnail !== undefined) updateData.thumbnail = validatedData.thumbnail
    if (validatedData.duration !== undefined) updateData.duration = validatedData.duration
    if (validatedData.tags !== undefined) updateData.tags = JSON.stringify(validatedData.tags)

    // Gestion de la publication
    if (validatedData.isPublished !== undefined) {
      updateData.isPublished = validatedData.isPublished
      if (validatedData.isPublished && !existingCourse.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: {
        _count: {
          select: { enrollments: true, modules: true },
        },
        modules: {
          include: {
            lessons: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la mise à jour du cours:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un cours
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: { select: { enrollments: true } },
      },
    })

    if (!existingCourse) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
    }

    if (existingCourse.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Avertir si le cours a des inscriptions
    if (existingCourse._count.enrollments > 0) {
      return NextResponse.json(
        {
          error: 'Impossible de supprimer un cours avec des inscriptions',
          enrollments: existingCourse._count.enrollments,
        },
        { status: 400 }
      )
    }

    await prisma.course.delete({
      where: { id: courseId },
    })

    return NextResponse.json({ success: true, message: 'Cours supprimé' })
  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
