'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Video,
  Terminal,
  HelpCircle,
  Clock,
  Trophy,
  Play,
  FileText,
  Lock,
  CheckCircle2,
  ChevronRight,
  Layers,
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  description: string | null
  duration: number
  type: string
  isPreview: boolean
  quiz?: { id: string } | null
  labAssignments?: Array<{
    id: string
    title: string
    difficulty: string
    estimatedTime: number
    points: number
  }>
}

interface Module {
  id: string
  title: string
  description: string | null
  order: number
  lessons: Lesson[]
}

interface CourseContentOrganizerProps {
  modules: Module[]
  courseSlug: string
  isEnrolled: boolean
  completedLessonIds?: Set<string>
}

const difficultyColors: Record<string, string> = {
  EASY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  HARD: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  EXPERT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

const difficultyLabels: Record<string, string> = {
  EASY: 'Facile',
  INTERMEDIATE: 'Intermédiaire',
  HARD: 'Difficile',
  EXPERT: 'Expert',
}

export function CourseContentOrganizer({
  modules,
  courseSlug,
  isEnrolled,
  completedLessonIds = new Set(),
}: CourseContentOrganizerProps) {
  const [activeTab, setActiveTab] = useState('all')

  // Extraire et organiser le contenu par type
  const allLessons = modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleName: m.title, moduleOrder: m.order }))
  )

  const theoryLessons = allLessons.filter((l) => l.type === 'TEXT')
  const videoLessons = allLessons.filter((l) => l.type === 'VIDEO')
  const quizLessons = allLessons.filter((l) => l.type === 'QUIZ' || l.quiz)
  const labLessons = allLessons.filter((l) => l.type === 'ASSIGNMENT' || (l.labAssignments && l.labAssignments.length > 0))

  // Statistiques
  const totalDuration = allLessons.reduce((acc, l) => acc + l.duration, 0)
  const totalTheoryDuration = theoryLessons.reduce((acc, l) => acc + l.duration, 0)
  const totalVideoDuration = videoLessons.reduce((acc, l) => acc + l.duration, 0)
  const totalLabDuration = labLessons.reduce((acc, l) => acc + l.duration, 0)
  const totalLabs = labLessons.reduce(
    (acc, l) => acc + (l.labAssignments?.length || 1),
    0
  )
  const totalPoints = labLessons.reduce(
    (acc, l) => acc + (l.labAssignments?.reduce((sum, lab) => sum + lab.points, 0) || 0),
    0
  )

  const renderLessonCard = (lesson: typeof allLessons[0], showModule = true) => {
    const isCompleted = completedLessonIds.has(lesson.id)

    return (
      <Card
        key={lesson.id}
        className={cn(
          'group transition-all hover:shadow-md',
          isCompleted && 'border-success/30 bg-success/5'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'p-2 rounded-lg flex-shrink-0',
                lesson.type === 'VIDEO' && 'bg-blue-100 dark:bg-blue-900/30',
                lesson.type === 'TEXT' && 'bg-purple-100 dark:bg-purple-900/30',
                lesson.type === 'QUIZ' && 'bg-orange-100 dark:bg-orange-900/30',
                lesson.type === 'ASSIGNMENT' && 'bg-pink-100 dark:bg-pink-900/30'
              )}
            >
              {lesson.type === 'VIDEO' && <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              {lesson.type === 'TEXT' && <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
              {lesson.type === 'QUIZ' && <HelpCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
              {lesson.type === 'ASSIGNMENT' && <Terminal className="h-5 w-5 text-pink-600 dark:text-pink-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {showModule && (
                  <Badge variant="outline" className="text-xs">
                    Module {lesson.moduleOrder}
                  </Badge>
                )}
                {lesson.isPreview && (
                  <Badge variant="secondary" className="text-xs">
                    Aperçu
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-success/20 text-success text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Terminé
                  </Badge>
                )}
              </div>

              <h4 className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                {lesson.title}
              </h4>

              {lesson.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {lesson.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {lesson.duration} min
                </span>
                {lesson.labAssignments && lesson.labAssignments.length > 0 && (
                  <>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5" />
                      {lesson.labAssignments.reduce((sum, lab) => sum + lab.points, 0)} pts
                    </span>
                    <Badge className={difficultyColors[lesson.labAssignments[0].difficulty]}>
                      {difficultyLabels[lesson.labAssignments[0].difficulty]}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              {isEnrolled || lesson.isPreview ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/courses/${courseSlug}/learn?lesson=${lesson.id}`}>
                    <Play className="h-4 w-4 mr-1" />
                    {isCompleted ? 'Revoir' : 'Commencer'}
                  </Link>
                </Button>
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{theoryLessons.length}</p>
              <p className="text-xs text-muted-foreground">Leçons théoriques</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{videoLessons.length}</p>
              <p className="text-xs text-muted-foreground">Vidéos ({Math.round(totalVideoDuration)} min)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
              <Terminal className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLabs}</p>
              <p className="text-xs text-muted-foreground">Labs pratiques</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <HelpCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{quizLessons.length}</p>
              <p className="text-xs text-muted-foreground">Quiz d'évaluation</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets par type de contenu */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Tout</span>
            <Badge variant="secondary" className="ml-1 px-1.5">
              {allLessons.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="theory" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Théorie</span>
            <Badge variant="secondary" className="ml-1 px-1.5">
              {theoryLessons.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Vidéos</span>
            <Badge variant="secondary" className="ml-1 px-1.5">
              {videoLessons.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="labs" className="gap-2">
            <Terminal className="h-4 w-4" />
            <span className="hidden sm:inline">Labs</span>
            <Badge variant="secondary" className="ml-1 px-1.5">
              {labLessons.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Quiz</span>
            <Badge variant="secondary" className="ml-1 px-1.5">
              {quizLessons.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          {modules.map((module) => (
            <div key={module.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {module.order}
                </div>
                <div>
                  <h3 className="font-semibold">{module.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {module.lessons.length} leçons
                  </p>
                </div>
              </div>
              <div className="ml-11 space-y-2">
                {module.lessons.map((lesson) =>
                  renderLessonCard({ ...lesson, moduleName: module.title, moduleOrder: module.order }, false)
                )}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="theory" className="mt-6 space-y-3">
          {theoryLessons.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune leçon théorique dans ce cours.
            </p>
          ) : (
            theoryLessons.map((lesson) => renderLessonCard(lesson))
          )}
        </TabsContent>

        <TabsContent value="video" className="mt-6 space-y-3">
          {videoLessons.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune vidéo dans ce cours.
            </p>
          ) : (
            videoLessons.map((lesson) => renderLessonCard(lesson))
          )}
        </TabsContent>

        <TabsContent value="labs" className="mt-6 space-y-3">
          {labLessons.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun lab pratique dans ce cours.
            </p>
          ) : (
            <>
              {totalPoints > 0 && (
                <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200 dark:border-pink-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                      <div>
                        <p className="font-medium">Points disponibles</p>
                        <p className="text-sm text-muted-foreground">
                          Complétez tous les labs pour gagner des points
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">{totalPoints} pts</div>
                  </CardContent>
                </Card>
              )}
              {labLessons.map((lesson) => renderLessonCard(lesson))}
            </>
          )}
        </TabsContent>

        <TabsContent value="quiz" className="mt-6 space-y-3">
          {quizLessons.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun quiz dans ce cours.
            </p>
          ) : (
            quizLessons.map((lesson) => renderLessonCard(lesson))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
