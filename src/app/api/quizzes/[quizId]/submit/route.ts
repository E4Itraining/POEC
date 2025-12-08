import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { answers } = await request.json()

    // Récupérer le quiz avec les réponses correctes
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.quizId },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz non trouvé' }, { status: 404 })
    }

    // Calculer le score
    let totalScore = 0
    let maxScore = 0
    const correctAnswers: Record<string, string[]> = {}

    for (const question of quiz.questions) {
      maxScore += question.points
      const correctAnswerIds = question.answers
        .filter((a) => a.isCorrect)
        .map((a) => a.id)
      correctAnswers[question.id] = correctAnswerIds

      const userAnswers = answers[question.id] || []

      // Vérifier si la réponse est correcte
      const isCorrect =
        userAnswers.length === correctAnswerIds.length &&
        userAnswers.every((id: string) => correctAnswerIds.includes(id))

      if (isCorrect) {
        totalScore += question.points
      }
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
    const isPassed = percentage >= quiz.passingScore

    // Enregistrer la tentative
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        quizId: quiz.id,
        score: totalScore,
        maxScore,
        percentage,
        isPassed,
        timeSpent: 0, // À calculer côté client si besoin
        answers: JSON.stringify(answers),
      },
    })

    // Si réussi, marquer la leçon comme complétée
    if (isPassed) {
      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: quiz.lessonId,
          },
        },
        update: {
          isCompleted: true,
          completedAt: new Date(),
        },
        create: {
          userId: session.user.id,
          lessonId: quiz.lessonId,
          isCompleted: true,
          completedAt: new Date(),
        },
      })

      // Mettre à jour la progression du cours
      const courseId = quiz.lesson.module.courseId

      const allLessons = await prisma.lesson.findMany({
        where: { module: { courseId } },
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
        },
        create: {
          userId: session.user.id,
          courseId,
          progressPercent,
        },
      })

      // Vérifier le badge "Champion des quiz"
      const perfectQuizzes = await prisma.quizAttempt.count({
        where: {
          userId: session.user.id,
          percentage: 100,
        },
      })

      if (percentage === 100 && perfectQuizzes >= 5) {
        const badge = await prisma.badge.findUnique({
          where: { name: 'Champion des quiz' },
        })
        if (badge) {
          const existing = await prisma.userBadge.findUnique({
            where: {
              userId_badgeId: {
                userId: session.user.id,
                badgeId: badge.id,
              },
            },
          })
          if (!existing) {
            await prisma.userBadge.create({
              data: {
                userId: session.user.id,
                badgeId: badge.id,
              },
            })
            await prisma.notification.create({
              data: {
                userId: session.user.id,
                title: 'Badge obtenu !',
                message: `Félicitations ! Vous avez obtenu le badge "${badge.name}"`,
                type: 'ACHIEVEMENT',
              },
            })
          }
        }
      }
    }

    return NextResponse.json({
      score: totalScore,
      maxScore,
      percentage: Math.round(percentage),
      isPassed,
      correctAnswers: quiz.showCorrectAnswers ? correctAnswers : undefined,
    })
  } catch (error) {
    console.error('Quiz submit error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la soumission du quiz' },
      { status: 500 }
    )
  }
}
