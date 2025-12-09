import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Terminal,
  Play,
  Clock,
  Trophy,
  Code2,
  Server,
  Container,
  Cpu,
  Rocket,
  Lock,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Labs - Exercices Pratiques',
  description: 'Environnements de travaux pratiques interactifs',
}

// Types d'environnements de labs disponibles
const labEnvironments = [
  {
    id: 'container',
    name: 'Conteneurs Docker',
    description: 'Environnements isolés et reproductibles pour vos exercices de développement.',
    icon: Container,
    features: ['Environnement Linux complet', 'Pre-installé avec outils', 'Ressources dédiées'],
    available: true,
  },
  {
    id: 'jupyter',
    name: 'Jupyter Notebooks',
    description: 'Notebooks interactifs pour l\'analyse de données et le machine learning.',
    icon: Code2,
    features: ['Python, R, Julia', 'Visualisations intégrées', 'GPU disponible'],
    available: true,
  },
  {
    id: 'kubernetes',
    name: 'Clusters Kubernetes',
    description: 'Déployez et gérez des applications sur des clusters K8s.',
    icon: Server,
    features: ['Cluster dédié', 'kubectl configuré', 'Monitoring inclus'],
    available: false,
    comingSoon: true,
  },
  {
    id: 'hpc',
    name: 'HPC / GPU Computing',
    description: 'Accès à des ressources de calcul haute performance.',
    icon: Cpu,
    features: ['GPUs NVIDIA', 'Slurm scheduler', 'Stockage haute vitesse'],
    available: false,
    comingSoon: true,
  },
]

// Labs en vedette (exemple - à remplacer par données réelles)
const featuredLabs = [
  {
    id: '1',
    title: 'Introduction à Docker',
    description: 'Apprenez les bases de Docker : images, conteneurs, et Dockerfile.',
    difficulty: 'EASY',
    estimatedTime: 30,
    points: 100,
    completedBy: 234,
    category: 'DevOps',
  },
  {
    id: '2',
    title: 'Monitoring avec Prometheus',
    description: 'Configurez un stack de monitoring complet avec Prometheus et Grafana.',
    difficulty: 'INTERMEDIATE',
    estimatedTime: 60,
    points: 200,
    completedBy: 156,
    category: 'Observabilité',
  },
  {
    id: '3',
    title: 'Pipeline ML avec MLflow',
    description: 'Créez un pipeline ML reproductible avec MLflow et suivez vos expériences.',
    difficulty: 'HARD',
    estimatedTime: 90,
    points: 300,
    completedBy: 89,
    category: 'Machine Learning',
  },
]

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

export default function LabsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto">
        <Badge variant="outline" className="mb-4">
          <Terminal className="h-3 w-3 mr-1" aria-hidden="true" />
          Environnements Pratiques
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Labs & Exercices Pratiques
        </h1>
        <p className="text-lg text-muted-foreground">
          Mettez en pratique vos connaissances dans des environnements réels.
          Nos labs vous offrent des espaces de travail configurés et sécurisés
          pour expérimenter sans risque.
        </p>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Terminal className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-muted-foreground">Labs disponibles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <CheckCircle className="h-6 w-6 text-green-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Complétés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-500/10">
              <Trophy className="h-6 w-6 text-yellow-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Points gagnés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <Clock className="h-6 w-6 text-blue-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">0h</p>
              <p className="text-sm text-muted-foreground">Temps pratique</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Environnements disponibles */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Environnements de travail</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {labEnvironments.map((env) => (
            <Card
              key={env.id}
              className={`relative overflow-hidden transition-all ${
                env.available ? 'hover:shadow-lg hover:border-primary/50' : 'opacity-75'
              }`}
            >
              {env.comingSoon && (
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="text-xs">
                    <Rocket className="h-3 w-3 mr-1" aria-hidden="true" />
                    Bientôt
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className={`p-3 rounded-lg w-fit ${
                  env.available ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <env.icon
                    className={`h-6 w-6 ${env.available ? 'text-primary' : 'text-muted-foreground'}`}
                    aria-hidden="true"
                  />
                </div>
                <CardTitle className="mt-4">{env.name}</CardTitle>
                <CardDescription>{env.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {env.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-4"
                  variant={env.available ? 'default' : 'outline'}
                  disabled={!env.available}
                >
                  {env.available ? (
                    <>
                      <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                      Lancer
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" aria-hidden="true" />
                      Indisponible
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Labs en vedette */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Labs populaires</h2>
          <Button variant="ghost" asChild>
            <Link href="/labs/browse">
              Voir tous les labs
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredLabs.map((lab) => (
            <Card key={lab.id} className="group hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{lab.category}</Badge>
                  <Badge className={difficultyColors[lab.difficulty]}>
                    {difficultyLabels[lab.difficulty]}
                  </Badge>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {lab.title}
                </CardTitle>
                <CardDescription>{lab.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {lab.estimatedTime} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" aria-hidden="true" />
                    {lab.points} pts
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    {lab.completedBy}
                  </span>
                </div>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                  Commencer le lab
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 bg-muted/50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">
          Prêt à mettre en pratique vos connaissances ?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Inscrivez-vous à un cours pour accéder aux labs associés et progresser
          avec des exercices pratiques supervisés.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/courses">
              Explorer les cours
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/academies">
              Découvrir les académies
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
