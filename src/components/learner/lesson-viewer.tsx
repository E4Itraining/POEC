'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  FileText,
  HelpCircle,
  Clock,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Share2,
  FileDown,
  StickyNote,
  Menu,
  X,
  Terminal,
  Trophy,
  Code2,
  Play,
} from 'lucide-react'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

interface LabAssignment {
  id: string
  title: string
  description: string
  instructions: string
  difficulty: string
  estimatedTime: number
  points: number
  startingCode: string | null
}

interface LessonViewerProps {
  lesson: {
    id: string
    title: string
    description: string | null
    content: string | null
    videoUrl: string | null
    duration: number
    type: string
    resources: string | null
    labAssignments?: LabAssignment[]
  }
  course: {
    slug: string
    title: string
  }
  module: {
    title: string
  }
  isCompleted: boolean
  isBookmarked: boolean
  prevLesson?: { id: string; title: string } | null
  nextLesson?: { id: string; title: string } | null
  quizId?: string | null
  onToggleSidebar?: () => void
  showSidebarButton?: boolean
}

export function LessonViewer({
  lesson,
  course,
  module,
  isCompleted,
  isBookmarked,
  prevLesson,
  nextLesson,
  quizId,
  onToggleSidebar,
  showSidebarButton,
}: LessonViewerProps) {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const [isMarking, setIsMarking] = useState(false)
  const [completed, setCompleted] = useState(isCompleted)
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [note, setNote] = useState('')
  const [videoProgress, setVideoProgress] = useState(0)

  const getLessonTypeLabel = (type: string) => {
    return t.learn.lessonTypes[type as keyof typeof t.learn.lessonTypes] || type
  }

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <PlayCircle className="h-4 w-4" />
      case 'TEXT':
        return <FileText className="h-4 w-4" />
      case 'QUIZ':
        return <HelpCircle className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const handleMarkComplete = async () => {
    setIsMarking(true)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: lesson.id }),
      })

      if (res.ok) {
        setCompleted(true)
        toast({
          title: locale === 'fr' ? 'Leçon terminée !' : 'Lesson completed!',
          description: locale === 'fr'
            ? 'Votre progression a été mise à jour.'
            : 'Your progress has been updated.',
        })

        // Auto-navigate to next lesson after a short delay
        if (nextLesson) {
          setTimeout(() => {
            router.push(`/courses/${course.slug}/learn?lesson=${nextLesson.id}`)
          }, 1500)
        }
      }
    } catch {
      toast({
        title: locale === 'fr' ? 'Erreur' : 'Error',
        description: locale === 'fr'
          ? 'Impossible de mettre à jour la progression.'
          : 'Could not update progress.',
        variant: 'destructive',
      })
    } finally {
      setIsMarking(false)
    }
  }

  const handleVideoProgress = ({ played }: { played: number }) => {
    setVideoProgress(played * 100)
    // Auto-mark as complete when video reaches 90%
    if (played >= 0.9 && !completed) {
      handleMarkComplete()
    }
  }

  const resources = lesson.resources ? JSON.parse(lesson.resources) : []

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex-shrink-0 sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3 min-w-0">
            {showSidebarButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate">{module.title}</span>
              </div>
              <h1 className="font-semibold truncate">{lesson.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1">
              {getLessonTypeIcon(lesson.type)}
              {getLessonTypeLabel(lesson.type)}
            </Badge>
            <Badge variant="outline" className="hidden sm:flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lesson.duration} min
            </Badge>
            {completed && (
              <Badge className="bg-success/20 text-success border-success/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {t.learn.completed}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
          {/* Video Player */}
          {lesson.type === 'VIDEO' && lesson.videoUrl && (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
              <ReactPlayer
                url={lesson.videoUrl}
                width="100%"
                height="100%"
                controls
                onProgress={handleVideoProgress}
                config={{
                  youtube: {
                    playerVars: { showinfo: 1 },
                  },
                }}
              />
              {/* Video Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Tabs for Content/Lab/Notes/Resources */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList className={cn(
              "grid w-full lg:w-auto lg:inline-flex",
              lesson.labAssignments && lesson.labAssignments.length > 0 ? "grid-cols-4" : "grid-cols-3"
            )}>
              <TabsTrigger value="content" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">{t.learn.lessonContent}</span>
                <span className="sm:hidden">Content</span>
              </TabsTrigger>
              {lesson.labAssignments && lesson.labAssignments.length > 0 && (
                <TabsTrigger value="lab" className="gap-2">
                  <Terminal className="h-4 w-4" />
                  <span className="hidden sm:inline">Lab</span>
                  <span className="sm:hidden">Lab</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="notes" className="gap-2">
                <StickyNote className="h-4 w-4" />
                <span className="hidden sm:inline">{t.learn.notes}</span>
                <span className="sm:hidden">Notes</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="gap-2">
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">{t.learn.resources}</span>
                <span className="sm:hidden">Files</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-6">
              {lesson.content ? (
                <div
                  className="prose-content"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              ) : lesson.description ? (
                <p className="text-muted-foreground">{lesson.description}</p>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {locale === 'fr'
                    ? 'Aucun contenu textuel pour cette leçon.'
                    : 'No text content for this lesson.'}
                </p>
              )}

              {/* Quiz Link */}
              {lesson.type === 'QUIZ' && quizId && (
                <Card className="mt-6 border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      {t.quiz.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {locale === 'fr'
                        ? 'Testez vos connaissances avec ce quiz.'
                        : 'Test your knowledge with this quiz.'}
                    </p>
                    <Button asChild>
                      <a href={`/courses/${course.slug}/quiz/${quizId}`}>
                        {t.learn.takeQuiz}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Lab Tab Content */}
            {lesson.labAssignments && lesson.labAssignments.length > 0 && (
              <TabsContent value="lab" className="mt-6 space-y-6">
                {lesson.labAssignments.map((lab) => (
                  <Card key={lab.id} className="border-primary/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                            <Terminal className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{lab.title}</CardTitle>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {lab.estimatedTime} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                                {lab.points} pts
                              </span>
                              <Badge className={cn(
                                "text-xs",
                                lab.difficulty === 'EASY' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
                                lab.difficulty === 'INTERMEDIATE' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
                                lab.difficulty === 'HARD' && 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
                                lab.difficulty === 'EXPERT' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                              )}>
                                {lab.difficulty === 'EASY' && 'Facile'}
                                {lab.difficulty === 'INTERMEDIATE' && 'Intermédiaire'}
                                {lab.difficulty === 'HARD' && 'Difficile'}
                                {lab.difficulty === 'EXPERT' && 'Expert'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{lab.description}</p>

                      {/* Instructions du lab */}
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Instructions
                        </h4>
                        <div className="prose-content bg-muted/50 rounded-lg p-4 max-h-96 overflow-auto">
                          <div dangerouslySetInnerHTML={{ __html: lab.instructions.replace(/\n/g, '<br />').replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>') }} />
                        </div>
                      </div>

                      {/* Code de départ */}
                      {lab.startingCode && (
                        <div className="space-y-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <Code2 className="h-4 w-4" />
                            Code de départ
                          </h4>
                          <pre className="bg-slate-900 text-slate-50 rounded-lg p-4 overflow-auto text-sm">
                            <code>{lab.startingCode}</code>
                          </pre>
                        </div>
                      )}

                      {/* Bouton pour lancer le lab */}
                      <div className="flex justify-end pt-4">
                        <Button className="gap-2">
                          <Play className="h-4 w-4" />
                          {locale === 'fr' ? 'Lancer le lab' : 'Start lab'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            )}

            <TabsContent value="notes" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <Textarea
                    placeholder={t.learn.addNote}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                  <div className="flex justify-end mt-4">
                    <Button disabled={!note.trim()}>
                      {t.learn.saveNote}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              {resources.length > 0 ? (
                <div className="space-y-2">
                  {resources.map((resource: { name: string; url: string }, index: number) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <FileDown className="h-5 w-5 text-primary" />
                          <span className="font-medium">{resource.name}</span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            {locale === 'fr' ? 'Télécharger' : 'Download'}
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {locale === 'fr'
                    ? 'Aucune ressource disponible pour cette leçon.'
                    : 'No resources available for this lesson.'}
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer - Navigation & Actions */}
      <footer className="flex-shrink-0 sticky bottom-0 z-20 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6 gap-4">
          {/* Left - Previous */}
          <div className="flex-1">
            {prevLesson && (
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => router.push(`/courses/${course.slug}/learn?lesson=${prevLesson.id}`)}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline truncate max-w-[150px]">
                  {prevLesson.title}
                </span>
                <span className="sm:hidden">{t.learn.previousLesson}</span>
              </Button>
            )}
          </div>

          {/* Center - Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setBookmarked(!bookmarked)}
              className={bookmarked ? 'text-yellow-500' : ''}
            >
              {bookmarked ? (
                <BookmarkCheck className="h-5 w-5" fill="currentColor" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>

            {!completed && (
              <Button
                onClick={handleMarkComplete}
                disabled={isMarking}
                className="gap-2"
              >
                {isMarking ? (
                  <>
                    <div className="spinner h-4 w-4" />
                    {locale === 'fr' ? 'Enregistrement...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {t.learn.markComplete}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Right - Next */}
          <div className="flex-1 flex justify-end">
            {nextLesson && (
              <Button
                className="gap-2"
                onClick={() => router.push(`/courses/${course.slug}/learn?lesson=${nextLesson.id}`)}
              >
                <span className="hidden sm:inline truncate max-w-[150px]">
                  {nextLesson.title}
                </span>
                <span className="sm:hidden">{t.learn.nextLesson}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
