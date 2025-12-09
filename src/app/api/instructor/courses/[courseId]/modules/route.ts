import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createModuleSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
})

const reorderModulesSchema = z.object({
  modules: z.array(z.object({
    id: z.string(),
    order: z.number(),
  })),
})

// GET - Liste des modules d'un cours
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
      select: { authorId: true },
    })

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
    }

    if (course.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        _count: { select: { lessons: true } },
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(modules)
  } catch (error) {
    console.error('Erreur lors de la récupération des modules:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un nouveau module
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

    const body = await request.json()
    const validatedData = createModuleSchema.parse(body)

    // Déterminer l'ordre du nouveau module
    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const newOrder = (lastModule?.order ?? -1) + 1

    const module = await prisma.module.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        order: newOrder,
        courseId,
      },
      include: {
        _count: { select: { lessons: true } },
      },
    })

    return NextResponse.json(module, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la création du module:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH - Réordonner les modules
export async function PATCH(
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
      select: { authorId: true },
    })

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
    }

    if (course.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = reorderModulesSchema.parse(body)

    // Mettre à jour l'ordre de chaque module
    await Promise.all(
      validatedData.modules.map(({ id, order }) =>
        prisma.module.update({
          where: { id },
          data: { order },
        })
      )
    )

    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        _count: { select: { lessons: true } },
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(modules)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la réorganisation des modules:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
