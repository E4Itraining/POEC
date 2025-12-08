'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trophy,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface QuizPageProps {
  params: { slug: string; quizId: string }
}

interface Question {
  id: string
  text: string
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE'
  points: number
  answers: {
    id: string
    text: string
    isCorrect: boolean
  }[]
  explanation?: string
}

interface Quiz {
  id: string
  title: string
  description: string | null
  passingScore: number
  timeLimit: number | null
  questions: Question[]
}

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{
    score: number
    maxScore: number
    percentage: number
    isPassed: boolean
    correctAnswers: Record<string, string[]>
  } | null>(null)

  // Charger le quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${params.quizId}`)
        if (!response.ok) throw new Error('Quiz non trouvé')
        const data = await response.json()
        setQuiz(data)
        if (data.timeLimit) {
          setTimeRemaining(data.timeLimit * 60)
        }
      } catch {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le quiz',
          variant: 'destructive',
        })
        router.push(`/courses/${params.slug}/learn`)
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [params.quizId, params.slug, router, toast])

  // Timer
  useEffect(() => {
    if (timeRemaining === null || result) return

    if (timeRemaining <= 0) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, result])

  const handleAnswerChange = (questionId: string, answerId: string, isMultiple: boolean) => {
    setAnswers((prev) => {
      if (isMultiple) {
        const current = prev[questionId] || []
        if (current.includes(answerId)) {
          return { ...prev, [questionId]: current.filter((id) => id !== answerId) }
        }
        return { ...prev, [questionId]: [...current, answerId] }
      }
      return { ...prev, [questionId]: [answerId] }
    })
  }

  const handleSubmit = useCallback(async () => {
    if (!quiz) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/quizzes/${params.quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) throw new Error('Erreur lors de la soumission')

      const data = await response.json()
      setResult(data)

      if (data.isPassed) {
        toast({
          title: 'Félicitations !',
          description: `Vous avez réussi le quiz avec ${data.percentage}% !`,
          variant: 'success',
        })
      } else {
        toast({
          title: 'Quiz terminé',
          description: `Score: ${data.percentage}%. Score requis: ${quiz.passingScore}%`,
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de soumettre le quiz',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [quiz, params.quizId, answers, toast])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" aria-label="Chargement..." />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Quiz non trouvé</p>
      </div>
    )
  }

  // Afficher les résultats
  if (result) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              {result.isPassed ? (
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-green-600" />
                </div>
              ) : (
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              )}
              <CardTitle className="text-2xl">
                {result.isPassed ? 'Félicitations !' : 'Quiz terminé'}
              </CardTitle>
              <CardDescription>
                {result.isPassed
                  ? 'Vous avez réussi ce quiz !'
                  : `Score minimum requis: ${quiz.passingScore}%`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {Math.round(result.percentage)}%
                </div>
                <p className="text-muted-foreground">
                  {result.score} / {result.maxScore} points
                </p>
              </div>

              <Progress
                value={result.percentage}
                className="h-3"
                indicatorClassName={result.isPassed ? 'bg-green-600' : 'bg-red-600'}
              />

              {/* Révision des réponses */}
              <div className="space-y-4 mt-8">
                <h3 className="font-semibold">Révision des réponses</h3>
                {quiz.questions.map((question, index) => {
                  const userAnswer = answers[question.id] || []
                  const correctAnswers = result.correctAnswers[question.id] || []
                  const isCorrect =
                    userAnswer.length === correctAnswers.length &&
                    userAnswer.every((a) => correctAnswers.includes(a))

                  return (
                    <Card key={question.id} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">
                              Question {index + 1}: {question.text}
                            </p>
                            <div className="mt-2 text-sm">
                              <p className="text-muted-foreground">
                                Votre réponse:{' '}
                                {userAnswer
                                  .map((id) => question.answers.find((a) => a.id === id)?.text)
                                  .join(', ') || 'Pas de réponse'}
                              </p>
                              {!isCorrect && (
                                <p className="text-green-600 mt-1">
                                  Réponse correcte:{' '}
                                  {correctAnswers
                                    .map((id) => question.answers.find((a) => a.id === id)?.text)
                                    .join(', ')}
                                </p>
                              )}
                              {question.explanation && (
                                <p className="text-muted-foreground mt-2 italic">
                                  {question.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/courses/${params.slug}/learn`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour au cours
                </Link>
              </Button>
              {!result.isPassed && (
                <Button onClick={() => window.location.reload()}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Réessayer
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]
  const isMultiple = question.type === 'MULTIPLE_CHOICE'
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/courses/${params.slug}/learn`} aria-label="Retour au cours">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="font-semibold truncate">{quiz.title}</h1>
          </div>

          {timeRemaining !== null && (
            <Badge
              variant={timeRemaining < 60 ? 'destructive' : 'secondary'}
              className="text-base px-3 py-1"
            >
              <Clock className="mr-2 h-4 w-4" />
              {formatTime(timeRemaining)}
            </Badge>
          )}
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                Question {currentQuestion + 1} / {quiz.questions.length}
              </Badge>
              <Badge variant="secondary">{question.points} point(s)</Badge>
            </div>
            <CardTitle className="text-xl mt-4">{question.text}</CardTitle>
            {isMultiple && (
              <CardDescription>Plusieurs réponses possibles</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {isMultiple ? (
              <div className="space-y-3">
                {question.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => handleAnswerChange(question.id, answer.id, true)}
                  >
                    <Checkbox
                      id={answer.id}
                      checked={(answers[question.id] || []).includes(answer.id)}
                      onCheckedChange={() =>
                        handleAnswerChange(question.id, answer.id, true)
                      }
                    />
                    <Label htmlFor={answer.id} className="flex-1 cursor-pointer">
                      {answer.text}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup
                value={(answers[question.id] || [])[0] || ''}
                onValueChange={(value) => handleAnswerChange(question.id, value, false)}
              >
                <div className="space-y-3">
                  {question.answers.map((answer) => (
                    <div
                      key={answer.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleAnswerChange(question.id, answer.id, false)}
                    >
                      <RadioGroupItem value={answer.id} id={answer.id} />
                      <Label htmlFor={answer.id} className="flex-1 cursor-pointer">
                        {answer.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion((prev) => prev - 1)}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>

            {currentQuestion < quiz.questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestion((prev) => prev + 1)}
                disabled={!answers[question.id]?.length}
              >
                Suivant
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(answers).length < quiz.questions.length}
              >
                {isSubmitting ? 'Soumission...' : 'Terminer le quiz'}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Navigation rapide */}
        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-2">Navigation rapide</p>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((q, index) => (
              <Button
                key={q.id}
                variant={currentQuestion === index ? 'default' : answers[q.id]?.length ? 'secondary' : 'outline'}
                size="sm"
                className="w-10 h-10"
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
