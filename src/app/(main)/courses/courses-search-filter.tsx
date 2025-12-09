'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { SearchInput } from '@/components/ui/search-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface CoursesSearchFilterProps {
  categories: { category: string; _count: number }[]
}

export function CoursesSearchFilter({ categories }: CoursesSearchFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const { t } = useI18n()

  const currentSearch = searchParams.get('search') || ''
  const currentCategory = searchParams.get('category') || 'all'
  const currentLevel = searchParams.get('level') || 'all'
  const currentSort = searchParams.get('sort') || 'featured'

  const hasFilters = currentSearch || currentCategory !== 'all' || currentLevel !== 'all'

  const updateParams = useCallback((key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/courses?${params.toString()}`)
    })
  }, [router, searchParams])

  const handleSearch = useCallback((value: string) => {
    updateParams('search', value)
  }, [updateParams])

  const handleClearFilters = useCallback(() => {
    startTransition(() => {
      router.push('/courses')
    })
  }, [router])

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Première ligne : Recherche */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={currentSearch}
              onChange={handleSearch}
              debounceMs={400}
              loading={isPending}
              placeholder={t.courses.searchPlaceholder}
              className="flex-1"
              aria-label={t.courses.searchPlaceholder}
            />
          </div>

          {/* Deuxième ligne : Filtres */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t.common.filter}:</span>
            </div>

            <div className="flex flex-wrap gap-2 flex-1">
              <Select
                value={currentCategory}
                onValueChange={(value) => updateParams('category', value)}
              >
                <SelectTrigger
                  className="w-full sm:w-48"
                  aria-label={t.courses.allCategories}
                >
                  <SelectValue placeholder={t.courses.allCategories} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.courses.allCategories}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category} value={cat.category}>
                      {cat.category} ({cat._count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={currentLevel}
                onValueChange={(value) => updateParams('level', value)}
              >
                <SelectTrigger
                  className="w-full sm:w-40"
                  aria-label={t.courses.allLevels}
                >
                  <SelectValue placeholder={t.courses.allLevels} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.courses.allLevels}</SelectItem>
                  <SelectItem value="BEGINNER">{t.courses.level.BEGINNER}</SelectItem>
                  <SelectItem value="INTERMEDIATE">{t.courses.level.INTERMEDIATE}</SelectItem>
                  <SelectItem value="ADVANCED">{t.courses.level.ADVANCED}</SelectItem>
                  <SelectItem value="EXPERT">{t.courses.level.EXPERT}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={currentSort}
                onValueChange={(value) => updateParams('sort', value)}
              >
                <SelectTrigger
                  className="w-full sm:w-40"
                  aria-label={t.courses.sortBy}
                >
                  <SelectValue placeholder={t.courses.sortBy} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">{t.courses.featured}</SelectItem>
                  <SelectItem value="newest">{t.courses.newest}</SelectItem>
                  <SelectItem value="popular">{t.courses.popular}</SelectItem>
                  <SelectItem value="duration">{t.courses.duration}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bouton réinitialiser */}
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="gap-1"
                disabled={isPending}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Réinitialiser</span>
              </Button>
            )}
          </div>
        </div>

        {/* Indicateur de chargement accessible */}
        {isPending && (
          <div className="sr-only" role="status" aria-live="polite">
            Recherche en cours...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
