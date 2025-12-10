'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ImagePlus, X, Save, Loader2 } from 'lucide-react'

const CATEGORIES = [
  'AI & Machine Learning',
  'Observability',
  'DevOps & Infrastructure',
  'Cloud Computing',
  'Security',
  'Data Engineering',
  'Programming',
  'System Administration',
  'Networking',
  'Other',
]

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const

interface Course {
  id: string
  title: string
  description: string
  shortDescription: string | null
  thumbnail: string | null
  level: string
  category: string
  tags: string | null
  price: number
  isFree: boolean
}

interface CourseSettingsTabProps {
  course: Course
  onUpdate: (updates: Partial<Course>) => Promise<void>
  setHasChanges: (hasChanges: boolean) => void
}

export function CourseSettingsTab({ course, onUpdate, setHasChanges }: CourseSettingsTabProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(course.thumbnail)

  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description,
    shortDescription: course.shortDescription || '',
    category: course.category,
    level: course.level,
    price: course.price,
    isFree: course.isFree,
    tags: course.tags ? JSON.parse(course.tags).join(', ') : '',
    thumbnail: course.thumbnail || '',
  })

  useEffect(() => {
    const hasChanges =
      formData.title !== course.title ||
      formData.description !== course.description ||
      formData.shortDescription !== (course.shortDescription || '') ||
      formData.category !== course.category ||
      formData.level !== course.level ||
      formData.price !== course.price ||
      formData.isFree !== course.isFree ||
      formData.thumbnail !== (course.thumbnail || '')

    setHasChanges(hasChanges)
  }, [formData, course, setHasChanges])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    const uploadData = new FormData()
    uploadData.append('file', file)
    uploadData.append('category', 'thumbnails')

    try {
      const response = await fetch('/api/instructor/upload', {
        method: 'POST',
        body: uploadData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setFormData((prev) => ({ ...prev, thumbnail: data.url }))
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const tags = formData.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter(Boolean)

      await onUpdate({
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || null,
        category: formData.category,
        level: formData.level,
        price: formData.isFree ? 0 : parseFloat(String(formData.price)),
        isFree: formData.isFree,
        thumbnail: formData.thumbnail || null,
        tags: JSON.stringify(tags),
      } as Partial<Course>)
    } finally {
      setIsSaving(false)
    }
  }

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      BEGINNER: 'Beginner',
      INTERMEDIATE: 'Intermediate',
      ADVANCED: 'Advanced',
      EXPERT: 'Expert',
    }
    return labels[level] || level
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Basic Information</CardTitle>
          <CardDescription className="text-slate-400">
            General course information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">
              Course Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="bg-slate-800/50 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription" className="text-slate-300">
              Short Description
            </Label>
            <Input
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              className="bg-slate-800/50 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Full Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className="bg-slate-800/50 border-white/10 text-white resize-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-300">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-slate-300">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Level</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, level: value }))}
              >
                <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {LEVELS.map((level) => (
                    <SelectItem key={level} value={level} className="text-slate-300">
                      {getLevelLabel(level)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-slate-300">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="python, data-science, ml"
              className="bg-slate-800/50 border-white/10 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Course Thumbnail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="relative h-40 w-64 rounded-lg bg-slate-800/50 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden group">
              {thumbnailPreview ? (
                <>
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailPreview(null)
                      setFormData((prev) => ({ ...prev, thumbnail: '' }))
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center p-4 text-center">
                  <ImagePlus className="h-10 w-10 text-slate-500 mb-2" />
                  <span className="text-sm text-slate-400">Click to upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFree"
              checked={formData.isFree}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isFree: checked as boolean }))
              }
              className="border-white/20 data-[state=checked]:bg-cyan-500"
            />
            <Label htmlFor="isFree" className="text-slate-300">
              This course is free
            </Label>
          </div>

          {!formData.isFree && (
            <div className="space-y-2">
              <Label htmlFor="price" className="text-slate-300">
                Price (EUR)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="bg-slate-800/50 border-white/10 text-white max-w-xs"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
