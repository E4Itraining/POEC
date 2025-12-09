'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen,
  Users,
  Trophy,
  Clock,
  TrendingUp,
  GraduationCap,
  BarChart3,
  FileText
} from 'lucide-react'
import { StatsCard, CoursePerformanceChart, StudentProgressTable } from '@/components/instructor'
import { useI18n } from '@/lib/i18n'

interface InstructorStats {
  totalCourses: number
  publishedCourses: number
  totalEnrollments: number
  completedEnrollments: number
  completionRate: number
  totalStudents: number
  avgQuizScore: number
  totalQuizAttempts: number
  courseStats: {
    id: string
    title: string
    isPublished: boolean
    enrollments: number
  }[]
}

export default function InstructorAnalyticsPage() {
  const { t } = useI18n()
  const [stats, setStats] = useState<InstructorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/instructor/stats')
        if (!response.ok) {
          throw new Error('Erreur lors du chargement')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Tableau de bord formateur
        </h1>
        <p className="text-muted-foreground mt-2">
          Suivez les performances de vos cours et la progression de vos apprenants
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Cours publiés"
          value={stats.publishedCourses}
          subtitle={`${stats.totalCourses} cours au total`}
          icon={BookOpen}
        />
        <StatsCard
          title="Apprenants"
          value={stats.totalStudents}
          subtitle={`${stats.totalEnrollments} inscriptions`}
          icon={Users}
        />
        <StatsCard
          title="Taux de complétion"
          value={`${Math.round(stats.completionRate)}%`}
          subtitle={`${stats.completedEnrollments} cours terminés`}
          icon={Trophy}
        />
        <StatsCard
          title="Score moyen quiz"
          value={`${Math.round(stats.avgQuizScore)}%`}
          subtitle={`${stats.totalQuizAttempts} tentatives`}
          icon={GraduationCap}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Performance */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Performance des cours
              </h2>
              <p className="text-sm text-muted-foreground">
                Nombre d'inscriptions par cours
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <CoursePerformanceChart courses={stats.courseStats} />
        </div>

        {/* Quick Stats */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Vos cours
              </h2>
              <p className="text-sm text-muted-foreground">
                Liste de tous vos cours
              </p>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {stats.courseStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Vous n'avez pas encore créé de cours
              </p>
            ) : (
              stats.courseStats.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${course.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.isPublished ? 'Publié' : 'Brouillon'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{course.enrollments}</p>
                    <p className="text-xs text-muted-foreground">inscrits</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <a
          href="/instructor/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          Créer un nouveau cours
        </a>
        <a
          href="/instructor/courses"
          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <FileText className="h-4 w-4" />
          Gérer mes cours
        </a>
      </div>
    </div>
  )
}
