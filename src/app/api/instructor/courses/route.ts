import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validation pour la création de cours
const createCourseSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  shortDescription: z.string().optional(),
  category: z.string().min(1, 'La catégorie est requise'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  price: z.number().min(0).default(0),
  isFree: z.boolean().default(true),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// Générer un slug unique
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// GET - Liste des cours de l'instructeur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const courses = await prisma.course.findMany({
      where: { authorId: session.user.id },
      include: {
        _count: {
          select: { enrollments: true, modules: true },
        },
        modules: {
          include: {
            _count: { select: { lessons: true } },
            lessons: {
              select: {
                id: true,
                title: true,
                type: true,
                duration: true,
                order: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau cours
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createCourseSchema.parse(body)

    // Générer un slug unique
    let slug = generateSlug(validatedData.title)
    let slugExists = await prisma.course.findUnique({ where: { slug } })
    let counter = 1

    while (slugExists) {
      slug = `${generateSlug(validatedData.title)}-${counter}`
      slugExists = await prisma.course.findUnique({ where: { slug } })
      counter++
    }

    const course = await prisma.course.create({
      data: {
        title: validatedData.title,
        slug,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription || null,
        category: validatedData.category,
        level: validatedData.level,
        price: validatedData.price,
        isFree: validatedData.isFree,
        thumbnail: validatedData.thumbnail || null,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
        authorId: session.user.id,
        isPublished: false,
      },
      include: {
        _count: {
          select: { enrollments: true, modules: true },
        },
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la création du cours:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
