'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Plus,
  GripVertical,
  Trash2,
  Edit,
  FileText,
  Video,
  HelpCircle,
  Code,
  Radio,
  Loader2,
  Eye,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
}

interface Module {
  id: string
  title: string
  description: string | null
  order: number
  _count: { lessons: number }
  lessons: Lesson[]
}

interface ModulesTabProps {
  courseId: string
  modules: Module[]
  onRefresh: () => Promise<void>
}

const LESSON_TYPES = [
  { value: 'TEXT', label: 'Text/Article', icon: FileText },
  { value: 'VIDEO', label: 'Video', icon: Video },
  { value: 'QUIZ', label: 'Quiz', icon: HelpCircle },
  { value: 'ASSIGNMENT', label: 'Assignment', icon: Code },
  { value: 'LIVE', label: 'Live Session', icon: Radio },
]

// Composant pour une leçon draggable
function SortableLesson({
  lesson,
  lessonIndex,
  moduleId,
  onEdit,
  onDelete,
}: {
  lesson: Lesson
  lessonIndex: number
  moduleId: string
  onEdit: (moduleId: string, lesson: Lesson) => void
  onDelete: (moduleId: string, lessonId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  const getLessonIcon = (type: string) => {
    const lessonType = LESSON_TYPES.find((t) => t.value === type)
    const Icon = lessonType?.icon || FileText
    return <Icon className="h-4 w-4" />
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg group hover:bg-slate-800"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-slate-700 rounded"
        >
          <GripVertical className="h-4 w-4 text-slate-600 hover:text-slate-400" />
        </button>
        <span className="text-slate-500 text-sm">{lessonIndex + 1}.</span>
        <span className="text-slate-400">{getLessonIcon(lesson.type)}</span>
        <span className="text-white">{lesson.title}</span>
        {lesson.isPreview && (
          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Badge>
        )}
        {lesson.duration > 0 && (
          <span className="text-slate-500 text-sm">
            {formatDuration(lesson.duration)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(moduleId, lesson)}
          className="text-slate-400 hover:text-white"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(moduleId, lesson.id)}
          className="text-red-400 hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Composant pour un module draggable
function SortableModule({
  module,
  index,
  courseId,
  onEdit,
  onDelete,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onReorderLessons,
}: {
  module: Module
  index: number
  courseId: string
  onEdit: (module: Module) => void
  onDelete: (moduleId: string) => void
  onAddLesson: (moduleId: string) => void
  onEditLesson: (moduleId: string, lesson: Lesson) => void
  onDeleteLesson: (moduleId: string, lessonId: string) => void
  onReorderLessons: (moduleId: string, lessons: Lesson[]) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  const lessonSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = module.lessons.findIndex((l) => l.id === active.id)
      const newIndex = module.lessons.findIndex((l) => l.id === over.id)
      const newLessons = arrayMove(module.lessons, oldIndex, newIndex).map((lesson, idx) => ({
        ...lesson,
        order: idx,
      }))
      onReorderLessons(module.id, newLessons)
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem
        value={module.id}
        className="bg-slate-900/50 border border-white/10 rounded-lg overflow-hidden"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5">
          <div className="flex items-center gap-3 flex-1">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-slate-700 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-slate-500 hover:text-slate-300" />
            </button>
            <span className="text-slate-500 text-sm">Module {index + 1}</span>
            <span className="font-medium text-white">{module.title}</span>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              {module._count.lessons} lessons
            </Badge>
          </div>
          <div className="flex items-center gap-2 mr-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(module)
              }}
              className="text-slate-400 hover:text-white"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(module.id)
              }}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          {module.description && (
            <p className="text-slate-400 text-sm mb-4 pl-7">{module.description}</p>
          )}

          <DndContext
            sensors={lessonSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleLessonDragEnd}
          >
            <SortableContext
              items={module.lessons.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {module.lessons.map((lesson, lessonIndex) => (
                  <SortableLesson
                    key={lesson.id}
                    lesson={lesson}
                    lessonIndex={lessonIndex}
                    moduleId={module.id}
                    onEdit={onEditLesson}
                    onDelete={onDeleteLesson}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddLesson(module.id)}
            className="mt-4 border-white/20 text-slate-300 hover:bg-white/10"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Lesson
          </Button>
        </AccordionContent>
      </AccordionItem>
    </div>
  )
}

export function ModulesTab({ courseId, modules, onRefresh }: ModulesTabProps) {
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [localModules, setLocalModules] = useState<Module[]>(modules)

  // Sync modules from props
  useEffect(() => {
    setLocalModules(modules)
  }, [modules])

  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
  })

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    type: 'TEXT',
    content: '',
    videoUrl: '',
    duration: 0,
    isPreview: false,
  })

  const moduleSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const openModuleDialog = (module?: Module) => {
    if (module) {
      setEditingModule(module)
      setModuleForm({
        title: module.title,
        description: module.description || '',
      })
    } else {
      setEditingModule(null)
      setModuleForm({ title: '', description: '' })
    }
    setIsModuleDialogOpen(true)
  }

  const openLessonDialog = (moduleId: string, lesson?: Lesson) => {
    setSelectedModuleId(moduleId)
    if (lesson) {
      setEditingLesson(lesson)
      setLessonForm({
        title: lesson.title,
        description: lesson.description || '',
        type: lesson.type,
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        duration: lesson.duration,
        isPreview: lesson.isPreview,
      })
    } else {
      setEditingLesson(null)
      setLessonForm({
        title: '',
        description: '',
        type: 'TEXT',
        content: '',
        videoUrl: '',
        duration: 0,
        isPreview: false,
      })
    }
    setIsLessonDialogOpen(true)
  }

  const handleSaveModule = async () => {
    setIsLoading(true)
    try {
      const url = editingModule
        ? `/api/instructor/courses/${courseId}/modules/${editingModule.id}`
        : `/api/instructor/courses/${courseId}/modules`

      const response = await fetch(url, {
        method: editingModule ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleForm),
      })

      if (!response.ok) throw new Error('Failed to save module')

      await onRefresh()
      setIsModuleDialogOpen(false)
    } catch (error) {
      console.error('Error saving module:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/instructor/courses/${courseId}/modules/${moduleId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to delete module')

      await onRefresh()
    } catch (error) {
      console.error('Error deleting module:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveLesson = async () => {
    if (!selectedModuleId) return

    setIsLoading(true)
    try {
      const url = editingLesson
        ? `/api/instructor/courses/${courseId}/modules/${selectedModuleId}/lessons/${editingLesson.id}`
        : `/api/instructor/courses/${courseId}/modules/${selectedModuleId}/lessons`

      const response = await fetch(url, {
        method: editingLesson ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonForm),
      })

      if (!response.ok) throw new Error('Failed to save lesson')

      await onRefresh()
      setIsLessonDialogOpen(false)
    } catch (error) {
      console.error('Error saving lesson:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to delete lesson')

      await onRefresh()
    } catch (error) {
      console.error('Error deleting lesson:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModuleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = localModules.findIndex((m) => m.id === active.id)
      const newIndex = localModules.findIndex((m) => m.id === over.id)
      const newModules = arrayMove(localModules, oldIndex, newIndex).map((mod, idx) => ({
        ...mod,
        order: idx,
      }))

      // Update local state immediately for smooth UX
      setLocalModules(newModules)

      // Save to API
      try {
        await fetch(`/api/instructor/courses/${courseId}/modules`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modules: newModules.map((m) => ({ id: m.id, order: m.order })),
          }),
        })
        await onRefresh()
      } catch (error) {
        console.error('Error reordering modules:', error)
        setLocalModules(modules) // Revert on error
      }
    }
  }

  const handleReorderLessons = async (moduleId: string, newLessons: Lesson[]) => {
    // Update local state immediately
    setLocalModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: newLessons } : m
      )
    )

    // Save to API
    try {
      await fetch(`/api/instructor/courses/${courseId}/modules/${moduleId}/lessons`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessons: newLessons.map((l) => ({ id: l.id, order: l.order })),
        }),
      })
      await onRefresh()
    } catch (error) {
      console.error('Error reordering lessons:', error)
      await onRefresh() // Revert on error
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Course Structure</h2>
          <p className="text-slate-400 text-sm">Drag modules and lessons to reorder them</p>
        </div>
        <Button
          onClick={() => openModuleDialog()}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Module
        </Button>
      </div>

      {localModules.length === 0 ? (
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No modules yet</h3>
            <p className="text-slate-400 mb-4">
              Start by creating your first module to organize your course content.
            </p>
            <Button
              onClick={() => openModuleDialog()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create First Module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={moduleSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleModuleDragEnd}
        >
          <SortableContext
            items={localModules.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <Accordion type="multiple" className="space-y-4">
              {localModules.map((module, index) => (
                <SortableModule
                  key={module.id}
                  module={module}
                  index={index}
                  courseId={courseId}
                  onEdit={openModuleDialog}
                  onDelete={handleDeleteModule}
                  onAddLesson={openLessonDialog}
                  onEditLesson={openLessonDialog}
                  onDeleteLesson={handleDeleteLesson}
                  onReorderLessons={handleReorderLessons}
                />
              ))}
            </Accordion>
          </SortableContext>
        </DndContext>
      )}

      {/* Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingModule ? 'Edit Module' : 'Create Module'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Module Title</Label>
              <Input
                value={moduleForm.title}
                onChange={(e) => setModuleForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Introduction to the Course"
                className="bg-slate-800/50 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Description (optional)</Label>
              <Textarea
                value={moduleForm.description}
                onChange={(e) => setModuleForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this module"
                rows={3}
                className="bg-slate-800/50 border-white/10 text-white resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModuleDialogOpen(false)}
              className="border-white/20 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveModule}
              disabled={isLoading || !moduleForm.title}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingModule ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Edit Lesson' : 'Create Lesson'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Lesson Title</Label>
                <Input
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Getting Started"
                  className="bg-slate-800/50 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Lesson Type</Label>
                <Select
                  value={lessonForm.type}
                  onValueChange={(value) => setLessonForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {LESSON_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-slate-300">
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Description (optional)</Label>
              <Textarea
                value={lessonForm.description}
                onChange={(e) => setLessonForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
                rows={2}
                className="bg-slate-800/50 border-white/10 text-white resize-none"
              />
            </div>

            {lessonForm.type === 'VIDEO' && (
              <div className="space-y-2">
                <Label className="text-slate-300">Video URL</Label>
                <Input
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="YouTube, Vimeo, or direct video URL"
                  className="bg-slate-800/50 border-white/10 text-white"
                />
              </div>
            )}

            {(lessonForm.type === 'TEXT' || lessonForm.type === 'ASSIGNMENT') && (
              <div className="space-y-2">
                <Label className="text-slate-300">Content (Markdown)</Label>
                <Textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your lesson content in Markdown..."
                  rows={8}
                  className="bg-slate-800/50 border-white/10 text-white resize-none font-mono text-sm"
                />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Duration (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  value={lessonForm.duration}
                  onChange={(e) =>
                    setLessonForm((prev) => ({ ...prev, duration: parseInt(e.target.value) || 0 }))
                  }
                  className="bg-slate-800/50 border-white/10 text-white"
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="isPreview"
                  checked={lessonForm.isPreview}
                  onCheckedChange={(checked) =>
                    setLessonForm((prev) => ({ ...prev, isPreview: checked as boolean }))
                  }
                  className="border-white/20 data-[state=checked]:bg-cyan-500"
                />
                <Label htmlFor="isPreview" className="text-slate-300">
                  Available as free preview
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLessonDialogOpen(false)}
              className="border-white/20 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveLesson}
              disabled={isLoading || !lessonForm.title}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingLesson ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
