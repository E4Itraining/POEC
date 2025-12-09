import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  BookOpen,
  ChevronLeft,
  CheckCircle,
  Circle,
  Play,
  FileText,
  Video,
  HelpCircle,
  Clock,
  Menu,
  X,
  Home,
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { LessonContent } from '@/components/courses/lesson-content'

interface LearnPageProps {
  params: { slug: string }
  searchParams: { lesson?: string }
}

async function getCourseWithProgress(slug: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { slug, isPublished: true },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              quiz: true,
              lessonProgress: {
                where: { userId },
              },
              labAssignments: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  instructions: true,
                  difficulty: true,
                  estimatedTime: true,
                  points: true,
                  startingCode: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!course) return null

  const courseProgress = await prisma.courseProgress.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  })

  return { course, courseProgress }
}

export default async function LearnPage({ params, searchParams }: LearnPageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect(`/auth/login?callbackUrl=/courses/${params.slug}/learn`)

  const data = await getCourseWithProgress(params.slug, session.user.id)
  if (!data) notFound()

  const { course, courseProgress } = data

  // Trouver la leçon active
  let currentLesson = null
  let currentModuleIndex = 0
  let currentLessonIndex = 0

  if (searchParams.lesson) {
    for (let mi = 0; mi < course.modules.length; mi++) {
      const module = course.modules[mi]
      for (let li = 0; li < module.lessons.length; li++) {
        if (module.lessons[li].id === searchParams.lesson) {
          currentLesson = module.lessons[li]
          currentModuleIndex = mi
          currentLessonIndex = li
          break
        }
      }
      if (currentLesson) break
    }
  }

  // Si pas de leçon spécifiée, trouver la première leçon non complétée ou la première leçon
  if (!currentLesson) {
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (!lesson.lessonProgress[0]?.isCompleted) {
          currentLesson = lesson
          break
        }
      }
      if (currentLesson) break
    }
    if (!currentLesson && course.modules[0]?.lessons[0]) {
      currentLesson = course.modules[0].lessons[0]
    }
  }

  // Calculer la progression
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const completedLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.lessonProgress[0]?.isCompleted).length,
    0
  )
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  // Trouver les leçons précédente et suivante
  const allLessons = course.modules.flatMap((m) => m.lessons)
  const currentIndex = currentLesson ? allLessons.findIndex((l) => l.id === currentLesson.id) : -1
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/courses/${params.slug}`} aria-label="Retour au cours">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="hidden md:block">
              <h1 className="font-semibold truncate max-w-md">{course.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {completedLessons}/{totalLessons} leçons
              </span>
              <Progress value={progressPercent} className="w-32 h-2" />
              <span className="text-sm font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard" aria-label="Tableau de bord">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Programme */}
        <aside className="hidden lg:flex w-80 flex-col border-r h-[calc(100vh-3.5rem)] sticky top-14">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Programme du cours</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {Math.round(progressPercent)}% complété
            </p>
            <Progress value={progressPercent} className="mt-2 h-2" />
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              <Accordion
                type="multiple"
                defaultValue={course.modules.map((m) => m.id)}
                className="w-full"
              >
                {course.modules.map((module, moduleIndex) => (
                  <AccordionItem key={module.id} value={module.id} className="border-b-0">
                    <AccordionTrigger className="py-2 px-2 hover:no-underline hover:bg-accent rounded-lg">
                      <div className="flex items-center gap-2 text-left">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {moduleIndex + 1}
                        </span>
                        <span className="text-sm font-medium">{module.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                      <ul className="space-y-1 ml-8">
                        {module.lessons.map((lesson) => {
                          const isCompleted = lesson.lessonProgress[0]?.isCompleted
                          const isActive = currentLesson?.id === lesson.id

                          return (
                            <li key={lesson.id}>
                              <Link
                                href={`/courses/${params.slug}/learn?lesson=${lesson.id}`}
                                className={`flex items-center gap-2 py-2 px-2 rounded-lg text-sm transition-colors ${
                                  isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent'
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle
                                    className={`h-4 w-4 flex-shrink-0 ${
                                      isActive ? 'text-primary-foreground' : 'text-green-600'
                                    }`}
                                    aria-label="Complété"
                                  />
                                ) : (
                                  <Circle
                                    className={`h-4 w-4 flex-shrink-0 ${
                                      isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                                    }`}
                                  />
                                )}
                                <span className="truncate flex-1">{lesson.title}</span>
                                {lesson.type === 'VIDEO' && (
                                  <Video className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                )}
                                {lesson.type === 'QUIZ' && (
                                  <HelpCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                )}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </ScrollArea>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)]">
          {currentLesson ? (
            <LessonContent
              lesson={currentLesson}
              courseSlug={params.slug}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
              isCompleted={currentLesson.lessonProgress[0]?.isCompleted}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune leçon disponible</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
