import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            answers: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                text: true,
                order: true,
                // Ne pas inclure isCorrect ici pour ne pas révéler les réponses
              },
            },
          },
        },
        lesson: {
          include: {
            module: {
              include: {
                course: {
                  include: {
                    enrollments: {
                      where: { userId: session.user.id },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est inscrit au cours
    if (quiz.lesson.module.course.enrollments.length === 0) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Mélanger les questions si configuré
    let questions = quiz.questions
    if (quiz.shuffleQuestions) {
      questions = [...questions].sort(() => Math.random() - 0.5)
    }

    // Mélanger les réponses
    questions = questions.map((q: { id: string; order: number; quizId: string; text: string; type: string; points: number; explanation: string | null; answers: { id: string; order: number; text: string }[] }) => ({
      ...q,
      answers: [...q.answers].sort(() => Math.random() - 0.5),
    }))

    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      questions: questions.map((q: { id: string; order: number; quizId: string; text: string; type: string; points: number; explanation: string | null; answers: { id: string; order: number; text: string }[] }) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        points: q.points,
        explanation: q.explanation,
        answers: q.answers,
      })),
    })
  } catch (error) {
    console.error('Quiz fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement du quiz' },
      { status: 500 }
    )
  }
}
