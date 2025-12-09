import { Metadata } from 'next'
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
  Lock,
  Globe,
  Code2,
  FileCode,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Repositories - Projets Git',
  description: 'Gérez vos projets et assignments Git',
}

// Exemple de repos templates (à remplacer par données réelles)
const templateRepos = [
  {
    id: '1',
    name: 'observability-starter',
    fullName: 'erythix-academy/observability-starter',
    description: 'Template de départ pour les labs d\'observabilité avec Prometheus, Grafana et OpenTelemetry.',
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
    description: 'Structure de projet pour pipelines ML avec MLflow, DVC et tests automatisés.',
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
    description: 'Configuration de base pour jobs HPC avec Slurm et conteneurs Singularity.',
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
    title: 'Projet final - Observabilité',
    course: 'Monitoring 360',
    dueDate: '2024-02-15',
    status: 'IN_PROGRESS',
    repoUrl: 'https://github.com/student/obs-project',
    progress: 65,
  },
  {
    id: '2',
    title: 'Lab 3 - Pipeline CI/CD',
    course: 'DevOps Fundamentals',
    dueDate: '2024-02-10',
    status: 'SUBMITTED',
    repoUrl: 'https://github.com/student/cicd-lab',
    progress: 100,
  },
  {
    id: '3',
    title: 'Exercice - Docker Compose',
    course: 'Container Orchestration',
    dueDate: '2024-02-08',
    status: 'GRADED',
    repoUrl: 'https://github.com/student/docker-exercise',
    progress: 100,
    score: 92,
  },
]

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  NOT_STARTED: {
    label: 'Non commencé',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: 'En cours',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    icon: Clock,
  },
  SUBMITTED: {
    label: 'Soumis',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    icon: GitPullRequest,
  },
  GRADED: {
    label: 'Noté',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    icon: CheckCircle,
  },
}

const languageColors: Record<string, string> = {
  Python: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  TypeScript: 'bg-blue-600',
  Shell: 'bg-green-500',
  Go: 'bg-cyan-500',
  Rust: 'bg-orange-500',
}

export default function RepositoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto">
        <Badge variant="outline" className="mb-4">
          <Github className="h-3 w-3 mr-1" aria-hidden="true" />
          Intégration Git
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Repositories & Projets
        </h1>
        <p className="text-lg text-muted-foreground">
          Travaillez sur des projets réels avec Git. Forkez des templates,
          soumettez vos travaux via Pull Request, et obtenez des feedbacks
          directement dans votre code.
        </p>
      </section>

      {/* Connexion GitHub CTA */}
      <section>
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="p-8 text-center">
            <div className="p-4 rounded-full bg-[#24292e] w-fit mx-auto mb-4">
              <Github className="h-8 w-8 text-white" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold mb-2">Connectez votre compte GitHub</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Liez votre compte GitHub pour synchroniser automatiquement vos projets,
              soumettre vos travaux et recevoir des feedbacks.
            </p>
            <Button size="lg">
              <Github className="h-5 w-5 mr-2" aria-hidden="true" />
              Connecter GitHub
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Mes assignments */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Mes projets en cours</h2>
          <Badge variant="secondary">
            {myAssignments.filter(a => a.status !== 'GRADED').length} en attente
          </Badge>
        </div>

        {myAssignments.length > 0 ? (
          <div className="space-y-4">
            {myAssignments.map((assignment) => {
              const status = statusConfig[assignment.status]
              const StatusIcon = status.icon
              const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'GRADED'

              return (
                <Card key={assignment.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{assignment.title}</h3>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                            {status.label}
                          </Badge>
                          {isOverdue && (
                            <Badge variant="destructive">En retard</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {assignment.course} • Échéance : {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}
                        </p>
                        {assignment.score !== undefined && (
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            Note : {assignment.score}/100
                          </p>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="w-full md:w-32">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progression</span>
                          <span>{assignment.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${assignment.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={assignment.repoUrl} target="_blank" rel="noopener noreferrer">
                            <GitBranch className="h-4 w-4 mr-1" aria-hidden="true" />
                            Repo
                            <ExternalLink className="h-3 w-3 ml-1" aria-hidden="true" />
                          </a>
                        </Button>
                        {assignment.status === 'IN_PROGRESS' && (
                          <Button size="sm">
                            <GitPullRequest className="h-4 w-4 mr-1" aria-hidden="true" />
                            Soumettre
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
          <Card>
            <CardContent className="p-12 text-center">
              <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
              <h3 className="font-semibold mb-2">Aucun projet en cours</h3>
              <p className="text-muted-foreground mb-4">
                Inscrivez-vous à un cours pour accéder aux projets Git associés.
              </p>
              <Button asChild>
                <Link href="/courses">Explorer les cours</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Templates disponibles */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Templates de projets</h2>
            <p className="text-muted-foreground">
              Utilisez nos templates comme point de départ pour vos projets
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templateRepos.map((repo) => (
            <Card key={repo.id} className="group hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${languageColors[repo.language] || 'bg-gray-500'}`} />
                    <span className="text-sm text-muted-foreground">{repo.language}</span>
                  </div>
                  {repo.isTemplate && (
                    <Badge variant="outline" className="text-xs">
                      Template
                    </Badge>
                  )}
                </div>
                <CardTitle className="group-hover:text-primary transition-colors flex items-center gap-2">
                  <Code2 className="h-5 w-5" aria-hidden="true" />
                  {repo.name}
                </CardTitle>
                <CardDescription>{repo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Topics */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {repo.topics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
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
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`https://github.com/${repo.fullName}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" aria-hidden="true" />
                      Voir
                    </a>
                  </Button>
                  <Button size="sm" className="flex-1">
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
        <h2 className="text-2xl font-bold text-center mb-8">
          Workflow Git intégré
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <GitFork className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-2">1. Fork le template</h3>
              <p className="text-sm text-muted-foreground">
                Créez votre propre copie du projet template en un clic
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <Code2 className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-2">2. Codez et commitez</h3>
              <p className="text-sm text-muted-foreground">
                Travaillez sur votre fork, les tests s'exécutent automatiquement
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <GitPullRequest className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-2">3. Soumettez via PR</h3>
              <p className="text-sm text-muted-foreground">
                Créez une Pull Request pour soumettre et recevoir du feedback
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 bg-muted/50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">
          Développez vos compétences avec des projets réels
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Nos cours incluent des projets Git avec grading automatique et feedback personnalisé.
        </p>
        <Button size="lg" asChild>
          <Link href="/courses">
            Découvrir les cours
            <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </div>
  )
}
