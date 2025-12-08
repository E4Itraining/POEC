import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour vous inscrire' },
        { status: 401 }
      )
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json(
        { error: 'ID du cours requis' },
        { status: 400 }
      )
    }

    // Vérifier si le cours existe
    const course = await prisma.course.findUnique({
      where: { id: courseId, isPublished: true },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Cours non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si l'utilisateur est déjà inscrit
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Vous êtes déjà inscrit à ce cours' },
        { status: 400 }
      )
    }

    // Créer l'inscription
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
      },
    })

    // Créer une progression initiale
    await prisma.courseProgress.create({
      data: {
        userId: session.user.id,
        courseId,
        progressPercent: 0,
        timeSpent: 0,
      },
    })

    // Créer une notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: 'Inscription confirmée !',
        message: `Vous êtes maintenant inscrit au cours "${course.title}". Bon apprentissage !`,
        type: 'SUCCESS',
        link: `/courses/${course.slug}/learn`,
      },
    })

    // Vérifier et attribuer le badge "Explorateur" si l'utilisateur a 3 inscriptions
    const enrollmentCount = await prisma.enrollment.count({
      where: { userId: session.user.id },
    })

    if (enrollmentCount === 3) {
      const explorerBadge = await prisma.badge.findUnique({
        where: { name: 'Explorateur' },
      })

      if (explorerBadge) {
        const existingBadge = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId: session.user.id,
              badgeId: explorerBadge.id,
            },
          },
        })

        if (!existingBadge) {
          await prisma.userBadge.create({
            data: {
              userId: session.user.id,
              badgeId: explorerBadge.id,
            },
          })

          await prisma.notification.create({
            data: {
              userId: session.user.id,
              title: 'Nouveau badge obtenu !',
              message: `Félicitations ! Vous avez obtenu le badge "${explorerBadge.name}"`,
              type: 'ACHIEVEMENT',
            },
          })
        }
      }
    }

    return NextResponse.json(
      { message: 'Inscription réussie', enrollment },
      { status: 201 }
    )
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    )
  }
}
