'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Loader2,
  Video,
  FileText,
  Bookmark,
  Share2,
  HelpCircle,
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface LessonContentProps {
  lesson: {
    id: string
    title: string
    description: string | null
    content: string | null
    videoUrl: string | null
    duration: number
    type: string
    quiz?: {
      id: string
      title: string
      description: string | null
      passingScore: number
      timeLimit: number | null
    } | null
  }
  courseSlug: string
  prevLesson: { id: string; title: string } | null
  nextLesson: { id: string; title: string } | null
  isCompleted?: boolean
}

export function LessonContent({
  lesson,
  courseSlug,
  prevLesson,
  nextLesson,
  isCompleted = false,
}: LessonContentProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(isCompleted)

  const handleComplete = async () => {
    setCompleting(true)
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          isCompleted: true,
        }),
      })

      if (!response.ok) throw new Error('Erreur')

      setCompleted(true)
      toast({
        title: 'Leçon terminée !',
        description: 'Votre progression a été enregistrée.',
        variant: 'success',
      })

      // Passer à la leçon suivante automatiquement
      if (nextLesson) {
        setTimeout(() => {
          router.push(`/courses/${courseSlug}/learn?lesson=${nextLesson.id}`)
        }, 1000)
      }

      router.refresh()
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder votre progression',
        variant: 'destructive',
      })
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Contenu de la leçon */}
      <div className="flex-1 overflow-auto">
        {/* Vidéo si disponible */}
        {lesson.videoUrl && lesson.type === 'VIDEO' && (
          <div className="aspect-video bg-black">
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Lecteur vidéo</p>
                <p className="text-sm opacity-75 mt-2">{lesson.videoUrl}</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto p-6 md:p-8">
          {/* En-tête de la leçon */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {lesson.type === 'VIDEO' && (
                <Badge variant="secondary">
                  <Video className="h-3 w-3 mr-1" />
                  Vidéo
                </Badge>
              )}
              {lesson.type === 'TEXT' && (
                <Badge variant="secondary">
                  <FileText className="h-3 w-3 mr-1" />
                  Texte
                </Badge>
              )}
              {lesson.type === 'QUIZ' && (
                <Badge variant="secondary">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Quiz
                </Badge>
              )}
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(lesson.duration)}
              </Badge>
              {completed && (
                <Badge variant="success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complété
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-2">{lesson.title}</h1>

            {lesson.description && (
              <p className="text-muted-foreground">{lesson.description}</p>
            )}

            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-1" />
                Ajouter aux favoris
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Partager
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Contenu texte */}
          {lesson.content && (
            <article className="prose-content">
              <div dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br />') }} />
            </article>
          )}

          {/* Quiz si disponible */}
          {lesson.quiz && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  {lesson.quiz.title}
                </CardTitle>
                {lesson.quiz.description && (
                  <p className="text-sm text-muted-foreground">{lesson.quiz.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm mb-4">
                  <span>Score minimum : {lesson.quiz.passingScore}%</span>
                  {lesson.quiz.timeLimit && (
                    <span>Temps limite : {lesson.quiz.timeLimit} min</span>
                  )}
                </div>
                <Button asChild>
                  <Link href={`/courses/${courseSlug}/quiz/${lesson.quiz.id}`}>
                    Commencer le quiz
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="mt-8 pt-8 border-t">
            {!completed && !lesson.quiz && (
              <Button
                onClick={handleComplete}
                disabled={completing}
                size="lg"
                className="w-full md:w-auto"
              >
                {completing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marquer comme terminé
                  </>
                )}
              </Button>
            )}

            {completed && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Leçon terminée</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <footer className="sticky bottom-0 border-t bg-background p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {prevLesson ? (
            <Button variant="outline" asChild>
              <Link href={`/courses/${courseSlug}/learn?lesson=${prevLesson.id}`}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{prevLesson.title}</span>
                <span className="sm:hidden">Précédent</span>
              </Link>
            </Button>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Button asChild>
              <Link href={`/courses/${courseSlug}/learn?lesson=${nextLesson.id}`}>
                <span className="hidden sm:inline">{nextLesson.title}</span>
                <span className="sm:hidden">Suivant</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/courses/${courseSlug}`}>
                Terminer le cours
              </Link>
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
