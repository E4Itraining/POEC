'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { ArrowLeft, Save, Loader2, ImagePlus, X } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

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

export function CourseCreationForm() {
  const router = useRouter()
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    level: 'BEGINNER' as (typeof LEVELS)[number],
    price: 0,
    isFree: true,
    tags: '',
    thumbnail: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Prévisualisation locale
    const reader = new FileReader()
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload vers le serveur
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', 'thumbnails')

    try {
      const response = await fetch('/api/instructor/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload')
      }

      const data = await response.json()
      setFormData((prev) => ({ ...prev, thumbnail: data.url }))
    } catch {
      setError('Erreur lors de l\'upload de la miniature')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)

      const response = await fetch('/api/instructor/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: formData.isFree ? 0 : parseFloat(String(formData.price)),
          tags,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création')
      }

      const course = await response.json()
      router.push(`/instructor/courses/${course.id}/edit`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      BEGINNER: t.courses?.level?.BEGINNER || 'Beginner',
      INTERMEDIATE: t.courses?.level?.INTERMEDIATE || 'Intermediate',
      ADVANCED: t.courses?.level?.ADVANCED || 'Advanced',
      EXPERT: t.courses?.level?.EXPERT || 'Expert',
    }
    return labels[level] || level
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/instructor/courses"
            className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.instructor?.title || 'My Courses'}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {t.instructor?.createCourse || 'Create a Course'}
          </h1>
          <p className="text-slate-400 mt-2">
            Fill in the information below to create your new course.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
                <CardDescription className="text-slate-400">
                  General information about your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">
                    Course Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Introduction to Machine Learning"
                    required
                    className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
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
                    placeholder="A brief summary (displayed in course cards)"
                    className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300">
                    Full Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Detailed description of your course content, objectives, and target audience"
                    required
                    rows={5}
                    className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 resize-none"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-300">
                      Category *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-slate-300 hover:text-white">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level" className="text-slate-300">
                      Level *
                    </Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, level: value as (typeof LEVELS)[number] }))
                      }
                    >
                      <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                        <SelectValue placeholder="Select a level" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        {LEVELS.map((level) => (
                          <SelectItem key={level} value={level} className="text-slate-300 hover:text-white">
                            {getLevelLabel(level)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-slate-300">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="python, data-science, ml (comma-separated)"
                    className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Course Thumbnail</CardTitle>
                <CardDescription className="text-slate-400">
                  Upload an image that represents your course (recommended: 1280x720)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <div className="relative h-40 w-64 rounded-lg bg-slate-800/50 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden group">
                    {thumbnailPreview ? (
                      <>
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => setThumbnailPreview(null)}
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
                  <div className="text-sm text-slate-400">
                    <p>Supported formats: JPG, PNG, GIF, WebP</p>
                    <p>Maximum size: 10 MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Pricing</CardTitle>
                <CardDescription className="text-slate-400">
                  Set the price for your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFree"
                    checked={formData.isFree}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isFree: checked as boolean }))
                    }
                    className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
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

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/instructor/courses')}
                className="border-white/20 text-slate-300 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.title || !formData.description || !formData.category}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Course
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
