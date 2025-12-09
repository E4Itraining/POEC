import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateModuleSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  order: z.number().optional(),
})

// GET - Récupérer un module spécifique
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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    })

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
    }

    if (course.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        _count: { select: { lessons: true } },
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!module || module.courseId !== courseId) {
      return NextResponse.json({ error: 'Module non trouvé' }, { status: 404 })
    }

    return NextResponse.json(module)
  } catch (error) {
    console.error('Erreur lors de la récupération du module:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour un module
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId, moduleId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    })

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
    }

    if (course.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId },
    })

    if (!existingModule || existingModule.courseId !== courseId) {
      return NextResponse.json({ error: 'Module non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateModuleSchema.parse(body)

    const module = await prisma.module.update({
      where: { id: moduleId },
      data: validatedData,
      include: {
        _count: { select: { lessons: true } },
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(module)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la mise à jour du module:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un module
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { courseId, moduleId } = await params

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    })

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
    }

    if (course.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId },
    })

    if (!existingModule || existingModule.courseId !== courseId) {
      return NextResponse.json({ error: 'Module non trouvé' }, { status: 404 })
    }

    await prisma.module.delete({
      where: { id: moduleId },
    })

    // Réordonner les modules restants
    const remainingModules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    })

    await Promise.all(
      remainingModules.map((mod, index) =>
        prisma.module.update({
          where: { id: mod.id },
          data: { order: index },
        })
      )
    )

    return NextResponse.json({ success: true, message: 'Module supprimé' })
  } catch (error) {
    console.error('Erreur lors de la suppression du module:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
