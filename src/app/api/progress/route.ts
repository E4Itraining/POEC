import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { lessonId, isCompleted, timeSpent } = await request.json()

    if (!lessonId) {
      return NextResponse.json({ error: 'ID de leçon requis' }, { status: 400 })
    }

    // Récupérer la leçon et son cours
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Leçon non trouvée' }, { status: 404 })
    }

    const courseId = lesson.module.courseId

    // Vérifier que l'utilisateur est inscrit au cours
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas inscrit à ce cours' },
        { status: 403 }
      )
    }

    // Mettre à jour ou créer la progression de la leçon
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        },
      },
      update: {
        isCompleted: isCompleted ?? undefined,
        completedAt: isCompleted ? new Date() : undefined,
        timeSpent: timeSpent ? { increment: timeSpent } : undefined,
      },
      create: {
        userId: session.user.id,
        lessonId,
        isCompleted: isCompleted ?? false,
        completedAt: isCompleted ? new Date() : null,
        timeSpent: timeSpent ?? 0,
      },
    })

    // Calculer la progression globale du cours
    const allLessons = await prisma.lesson.findMany({
      where: {
        module: { courseId },
      },
      include: {
        lessonProgress: {
          where: { userId: session.user.id },
        },
      },
    })

    const completedLessons = allLessons.filter(
      (l) => l.lessonProgress[0]?.isCompleted
    ).length
    const totalLessons = allLessons.length
    const progressPercent =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

    // Mettre à jour la progression du cours
    await prisma.courseProgress.upsert({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
      update: {
        progressPercent,
        lastAccessedAt: new Date(),
        timeSpent: timeSpent ? { increment: timeSpent } : undefined,
      },
      create: {
        userId: session.user.id,
        courseId,
        progressPercent,
        timeSpent: timeSpent ?? 0,
      },
    })

    // Vérifier et attribuer les badges
    await checkAndAwardBadges(session.user.id, completedLessons, progressPercent, courseId)

    // Si le cours est terminé
    if (progressPercent === 100) {
      await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId,
          },
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })

      // Générer un certificat
      const existingCert = await prisma.certificate.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId,
          },
        },
      })

      if (!existingCert) {
        const certNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

        await prisma.certificate.create({
          data: {
            userId: session.user.id,
            courseId,
            certificateNumber: certNumber,
          },
        })

        await prisma.notification.create({
          data: {
            userId: session.user.id,
            title: 'Félicitations !',
            message: `Vous avez terminé le cours "${lesson.module.course.title}" ! Votre certificat est disponible.`,
            type: 'SUCCESS',
          },
        })
      }
    }

    return NextResponse.json({
      message: 'Progression enregistrée',
      lessonProgress,
      courseProgress: progressPercent,
    })
  } catch (error) {
    console.error('Progress error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de la progression' },
      { status: 500 }
    )
  }
}

async function checkAndAwardBadges(
  userId: string,
  completedLessons: number,
  courseProgress: number,
  courseId: string
) {
  // Badge "Premier pas" - Première leçon complétée
  if (completedLessons === 1) {
    const badge = await prisma.badge.findUnique({ where: { name: 'Premier pas' } })
    if (badge) {
      const existing = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
      })
      if (!existing) {
        await prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        })
        await prisma.notification.create({
          data: {
            userId,
            title: 'Badge obtenu !',
            message: `Vous avez obtenu le badge "${badge.name}" - ${badge.description}`,
            type: 'ACHIEVEMENT',
          },
        })
      }
    }
  }

  // Badge "Diplômé" - Premier cours terminé
  if (courseProgress === 100) {
    const completedCoursesCount = await prisma.enrollment.count({
      where: { userId, status: 'COMPLETED' },
    })

    if (completedCoursesCount === 0) {
      // Ce sera le premier
      const badge = await prisma.badge.findUnique({ where: { name: 'Diplômé' } })
      if (badge) {
        const existing = await prisma.userBadge.findUnique({
          where: { userId_badgeId: { userId, badgeId: badge.id } },
        })
        if (!existing) {
          await prisma.userBadge.create({
            data: { userId, badgeId: badge.id },
          })
          await prisma.notification.create({
            data: {
              userId,
              title: 'Badge obtenu !',
              message: `Vous avez obtenu le badge "${badge.name}" - ${badge.description}`,
              type: 'ACHIEVEMENT',
            },
          })
        }
      }
    }
  }
}
