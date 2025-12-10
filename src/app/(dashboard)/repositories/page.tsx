'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  GitBranch,
  Github,
  GitFork,
  GitPullRequest,
  Star,
  ExternalLink,
  Code2,
  FileCode,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

// Exemple de repos templates (à remplacer par données réelles)
const templateRepos = [
  {
    id: '1',
    name: 'observability-starter',
    fullName: 'erythix-academy/observability-starter',
    descriptionKey: 'repoDesc.observability',
    language: 'Python',
    stars: 45,
    forks: 23,
    topics: ['observability', 'prometheus', 'grafana', 'opentelemetry'],
    isTemplate: true,
  },
  {
    id: '2',
    name: 'ml-pipeline-template',
    fullName: 'erythix-academy/ml-pipeline-template',
    descriptionKey: 'repoDesc.mlPipeline',
    language: 'Python',
    stars: 67,
    forks: 34,
    topics: ['machine-learning', 'mlflow', 'dvc', 'ci-cd'],
    isTemplate: true,
  },
  {
    id: '3',
    name: 'hpc-slurm-starter',
    fullName: 'erythix-academy/hpc-slurm-starter',
    descriptionKey: 'repoDesc.hpcSlurm',
    language: 'Shell',
    stars: 28,
    forks: 12,
    topics: ['hpc', 'slurm', 'singularity', 'gpu'],
    isTemplate: true,
  },
]

// Exemple d'assignments en cours
const myAssignments = [
  {
    id: '1',
    title: 'Final Project - Observability',
    course: 'Monitoring 360',
    dueDate: '2024-02-15',
    status: 'IN_PROGRESS',
    repoUrl: 'https://github.com/student/obs-project',
    progress: 65,
  },
  {
    id: '2',
    title: 'Lab 3 - CI/CD Pipeline',
    course: 'DevOps Fundamentals',
    dueDate: '2024-02-10',
    status: 'SUBMITTED',
    repoUrl: 'https://github.com/student/cicd-lab',
    progress: 100,
  },
  {
    id: '3',
    title: 'Exercise - Docker Compose',
    course: 'Container Orchestration',
    dueDate: '2024-02-08',
    status: 'GRADED',
    repoUrl: 'https://github.com/student/docker-exercise',
    progress: 100,
    score: 92,
  },
]

const languageColors: Record<string, string> = {
  Python: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  TypeScript: 'bg-blue-600',
  Shell: 'bg-green-500',
  Go: 'bg-cyan-500',
  Rust: 'bg-orange-500',
}

export default function RepositoriesPage() {
  const { t } = useI18n()

  const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    NOT_STARTED: {
      label: t.repositories.status.NOT_STARTED,
      color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      icon: AlertCircle,
    },
    IN_PROGRESS: {
      label: t.repositories.status.IN_PROGRESS,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: Clock,
    },
    SUBMITTED: {
      label: t.repositories.status.SUBMITTED,
      color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      icon: GitPullRequest,
    },
    GRADED: {
      label: t.repositories.status.GRADED,
      color: 'bg-green-500/10 text-green-400 border-green-500/20',
      icon: CheckCircle,
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/20">
            <Github className="h-3 w-3 mr-1" aria-hidden="true" />
            {t.repositories.gitIntegration}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">
            {t.repositories.title}
          </h1>
          <p className="text-lg text-slate-400">
            {t.repositories.subtitle}
          </p>
        </section>

        {/* Connexion GitHub CTA */}
        <section>
          <Card className="border-dashed border-2 border-white/20 bg-slate-900/30">
            <CardContent className="p-8 text-center">
              <div className="p-4 rounded-full bg-[#24292e] w-fit mx-auto mb-4">
                <Github className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">{t.repositories.connectGitHub}</h2>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                {t.repositories.connectDescription}
              </p>
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
                <Github className="h-5 w-5 mr-2" aria-hidden="true" />
                {t.repositories.connectButton}
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Mes assignments */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{t.repositories.myProjects}</h2>
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
              {myAssignments.filter(a => a.status !== 'GRADED').length} {t.repositories.pending}
            </Badge>
          </div>

          {myAssignments.length > 0 ? (
            <div className="space-y-4">
              {myAssignments.map((assignment) => {
                const status = statusConfig[assignment.status]
                const StatusIcon = status.icon
                const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'GRADED'

                return (
                  <Card key={assignment.id} className="hover:border-cyan-500/40 transition-all bg-slate-900/50 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{assignment.title}</h3>
                            <Badge className={status.color}>
                              <StatusIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                              {status.label}
                            </Badge>
                            {isOverdue && (
                              <Badge className="bg-red-500/10 text-red-400 border-red-500/20">{t.repositories.overdue}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mb-2">
                            {assignment.course} • {t.repositories.deadline}: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                          {assignment.score !== undefined && (
                            <p className="text-sm font-medium text-green-400">
                              {t.repositories.score}: {assignment.score}/100
                            </p>
                          )}
                        </div>

                        {/* Progress bar */}
                        <div className="w-full md:w-32">
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{t.repositories.progress}</span>
                            <span>{assignment.progress}%</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
                              style={{ width: `${assignment.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-white/20 text-slate-300 hover:bg-white/10" asChild>
                            <a href={assignment.repoUrl} target="_blank" rel="noopener noreferrer">
                              <GitBranch className="h-4 w-4 mr-1" aria-hidden="true" />
                              Repo
                              <ExternalLink className="h-3 w-3 ml-1" aria-hidden="true" />
                            </a>
                          </Button>
                          {assignment.status === 'IN_PROGRESS' && (
                            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
                              <GitPullRequest className="h-4 w-4 mr-1" aria-hidden="true" />
                              {t.repositories.submit}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="p-12 text-center">
                <FileCode className="h-12 w-12 mx-auto text-slate-500 mb-4" aria-hidden="true" />
                <h3 className="font-semibold mb-2 text-white">{t.repositories.noProjects}</h3>
                <p className="text-slate-400 mb-4">
                  {t.repositories.noProjectsDesc}
                </p>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0" asChild>
                  <Link href="/courses">{t.repositories.exploreCourses}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Templates disponibles */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">{t.repositories.projectTemplates}</h2>
              <p className="text-slate-400">
                {t.repositories.templatesDesc}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templateRepos.map((repo) => (
              <Card key={repo.id} className="group hover:border-cyan-500/40 transition-all bg-slate-900/50 border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${languageColors[repo.language] || 'bg-gray-500'}`} />
                      <span className="text-sm text-slate-400">{repo.language}</span>
                    </div>
                    {repo.isTemplate && (
                      <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                        Template
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="group-hover:text-cyan-400 transition-colors flex items-center gap-2 text-white">
                    <Code2 className="h-5 w-5" aria-hidden="true" />
                    {repo.name}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {repo.descriptionKey === 'repoDesc.observability' && 'Template for observability labs with Prometheus, Grafana and OpenTelemetry.'}
                    {repo.descriptionKey === 'repoDesc.mlPipeline' && 'Project structure for ML pipelines with MLflow, DVC and automated tests.'}
                    {repo.descriptionKey === 'repoDesc.hpcSlurm' && 'Base configuration for HPC jobs with Slurm and Singularity containers.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Topics */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {repo.topics.map((topic) => (
                      <Badge key={topic} className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" aria-hidden="true" />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" aria-hidden="true" />
                      {repo.forks}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 border-white/20 text-slate-300 hover:bg-white/10" asChild>
                      <a href={`https://github.com/${repo.fullName}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" aria-hidden="true" />
                        {t.repositories.view}
                      </a>
                    </Button>
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
                      <GitFork className="h-4 w-4 mr-1" aria-hidden="true" />
                      Fork
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Fonctionnalités */}
        <section className="py-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-white">
            {t.repositories.workflowTitle}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="p-6 text-center">
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 w-fit mx-auto mb-4">
                  <GitFork className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-2 text-white">{t.repositories.step1Title}</h3>
                <p className="text-sm text-slate-400">
                  {t.repositories.step1Desc}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="p-6 text-center">
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 w-fit mx-auto mb-4">
                  <Code2 className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-2 text-white">{t.repositories.step2Title}</h3>
                <p className="text-sm text-slate-400">
                  {t.repositories.step2Desc}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="p-6 text-center">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 w-fit mx-auto mb-4">
                  <GitPullRequest className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-2 text-white">{t.repositories.step3Title}</h3>
                <p className="text-sm text-slate-400">
                  {t.repositories.step3Desc}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50">
          <h2 className="text-2xl font-bold mb-4 text-white">
            {t.repositories.ctaTitle}
          </h2>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            {t.repositories.ctaDescription}
          </p>
          <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0" asChild>
            <Link href="/courses">
              {t.repositories.exploreCourses}
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
