'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  Eye,
  Settings,
  BookOpen,
  Video,
  Radio,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { CourseSettingsTab } from './tabs/course-settings-tab'
import { ModulesTab } from './tabs/modules-tab'
import { MediaTab } from './tabs/media-tab'
import { LiveSessionsTab } from './tabs/live-sessions-tab'

interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string | null
  thumbnail: string | null
  level: string
  category: string
  tags: string | null
  duration: number
  price: number
  isFree: boolean
  isPublished: boolean
  publishedAt: Date | null
  _count: {
    enrollments: number
    modules: number
  }
  modules: Module[]
}

interface Module {
  id: string
  title: string
  description: string | null
  order: number
  _count: { lessons: number }
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  description: string | null
  type: string
  content: string | null
  videoUrl: string | null
  duration: number
  order: number
  isPreview: boolean
  resources: string | null
  quiz?: Quiz | null
}

interface Quiz {
  id: string
  title: string
  description: string | null
  passingScore: number
  timeLimit: number | null
  maxAttempts: number
  questions: Question[]
}

interface Question {
  id: string
  text: string
  type: string
  explanation: string | null
  points: number
  order: number
  answers: Answer[]
}

interface Answer {
  id: string
  text: string
  isCorrect: boolean
  order: number
}

interface CourseEditorProps {
  initialCourse: Course
}

export function CourseEditor({ initialCourse }: CourseEditorProps) {
  const router = useRouter()
  const [course, setCourse] = useState<Course>(initialCourse)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('settings')
  const [hasChanges, setHasChanges] = useState(false)

  const updateCourse = useCallback(async (updates: Partial<Course>) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/instructor/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update course')
      }

      const updatedCourse = await response.json()
      setCourse((prev) => ({ ...prev, ...updatedCourse }))
      setHasChanges(false)
      return updatedCourse
    } catch (error) {
      console.error('Error updating course:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [course.id])

  const togglePublish = async () => {
    await updateCourse({ isPublished: !course.isPublished })
  }

  const refreshCourse = useCallback(async () => {
    try {
      const response = await fetch(`/api/instructor/courses/${course.id}`)
      if (response.ok) {
        const updatedCourse = await response.json()
        setCourse(updatedCourse)
      }
    } catch (error) {
      console.error('Error refreshing course:', error)
    }
  }, [course.id])

  const totalLessons = course.modules.reduce(
    (acc, mod) => acc + mod._count.lessons,
    0
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/instructor/courses"
              className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{course.title}</h1>
                <Badge
                  className={
                    course.isPublished
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }
                >
                  {course.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                {course._count.modules} modules | {totalLessons} lessons | {course._count.enrollments} enrolled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-white/20 text-slate-300 hover:bg-white/10"
            >
              <Link href={`/courses/${course.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={togglePublish}
              disabled={isSaving}
              className={
                course.isPublished
                  ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                  : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
              }
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : course.isPublished ? (
                <XCircle className="mr-2 h-4 w-4" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {course.isPublished ? 'Unpublish' : 'Publish'}
            </Button>

            {hasChanges && (
              <Button
                size="sm"
                onClick={() => updateCourse(course)}
                disabled={isSaving}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-white/10 p-1">
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Modules & Lessons
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
            >
              <Video className="mr-2 h-4 w-4" />
              Media
            </TabsTrigger>
            <TabsTrigger
              value="live"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
            >
              <Radio className="mr-2 h-4 w-4" />
              Live Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-6">
            <CourseSettingsTab
              course={course}
              onUpdate={updateCourse}
              setHasChanges={setHasChanges}
            />
          </TabsContent>

          <TabsContent value="modules" className="mt-6">
            <ModulesTab
              courseId={course.id}
              modules={course.modules}
              onRefresh={refreshCourse}
            />
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <MediaTab courseId={course.id} />
          </TabsContent>

          <TabsContent value="live" className="mt-6">
            <LiveSessionsTab courseId={course.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
