'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  HelpCircle,
  PenTool,
  Zap,
  Lock,
  Clock,
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  duration: number
  type: string
  isPreview: boolean
  isCompleted?: boolean
}

interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

interface CourseSidebarProps {
  course: {
    slug: string
    title: string
    progress: number
  }
  modules: Module[]
  currentLessonId?: string
  completedLessonIds: Set<string>
  className?: string
  onClose?: () => void
}

export function CourseSidebar({
  course,
  modules,
  currentLessonId,
  completedLessonIds,
  className,
  onClose,
}: CourseSidebarProps) {
  const { t } = useTranslation()
  const [expandedModules, setExpandedModules] = useState<string[]>(
    // Expand the module containing the current lesson
    modules
      .filter((m) => m.lessons.some((l) => l.id === currentLessonId))
      .map((m) => m.id)
  )

  const getLessonIcon = (type: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
    }
    switch (type) {
      case 'VIDEO':
        return <PlayCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
      case 'TEXT':
        return <FileText className="h-4 w-4 text-purple-500 flex-shrink-0" />
      case 'QUIZ':
        return <HelpCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
      case 'ASSIGNMENT':
        return <PenTool className="h-4 w-4 text-pink-500 flex-shrink-0" />
      case 'INTERACTIVE':
        return <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    }
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const completedCount = completedLessonIds.size

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-card border-r border-border',
        className
      )}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8"
          >
            <Link href={`/courses/${course.slug}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">{t.common.back}</span>
            </Link>
          </Button>
          <h2 className="font-semibold text-sm line-clamp-1 flex-1">
            {course.title}
          </h2>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t.learn.courseProgress}</span>
            <span className="font-medium">{Math.round(course.progress)}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {completedCount}/{totalLessons} {t.courses.lessons}
          </p>
        </div>
      </div>

      {/* Modules List */}
      <ScrollArea className="flex-1">
        <Accordion
          type="multiple"
          value={expandedModules}
          onValueChange={setExpandedModules}
          className="p-2"
        >
          {modules.map((module, moduleIndex) => {
            const moduleCompletedCount = module.lessons.filter((l) =>
              completedLessonIds.has(l.id)
            ).length
            const isModuleComplete = moduleCompletedCount === module.lessons.length

            return (
              <AccordionItem
                key={module.id}
                value={module.id}
                className="border-none"
              >
                <AccordionTrigger
                  className={cn(
                    'px-3 py-2.5 rounded-lg hover:bg-muted/50 hover:no-underline',
                    '[&[data-state=open]]:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium flex-shrink-0',
                        isModuleComplete
                          ? 'bg-success/20 text-success'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isModuleComplete ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        moduleIndex + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{module.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {moduleCompletedCount}/{module.lessons.length} {t.courses.lessons}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <div className="ml-4 pl-6 border-l border-border space-y-0.5">
                    {module.lessons.map((lesson) => {
                      const isCompleted = completedLessonIds.has(lesson.id)
                      const isCurrent = lesson.id === currentLessonId

                      return (
                        <Link
                          key={lesson.id}
                          href={`/courses/${course.slug}/learn?lesson=${lesson.id}`}
                          onClick={onClose}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                            'hover:bg-muted/50',
                            isCurrent && 'bg-primary/10 text-primary',
                            isCompleted && !isCurrent && 'text-muted-foreground'
                          )}
                        >
                          {getLessonIcon(lesson.type, isCompleted)}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'truncate',
                              isCurrent && 'font-medium'
                            )}>
                              {lesson.title}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.duration}m
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </ScrollArea>
    </div>
  )
}
