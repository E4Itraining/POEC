'use client'

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
import { useI18n } from '@/lib/i18n'

export default function LabsPage() {
  const { t } = useI18n()

  // Types d'environnements de labs disponibles
  const labEnvironments = [
    {
      id: 'container',
      nameKey: 'Docker Containers',
      descriptionKey: 'Isolated and reproducible environments for your development exercises.',
      icon: Container,
      features: ['Complete Linux environment', 'Pre-installed tools', 'Dedicated resources'],
      available: true,
    },
    {
      id: 'jupyter',
      nameKey: 'Jupyter Notebooks',
      descriptionKey: 'Interactive notebooks for data analysis and machine learning.',
      icon: Code2,
      features: ['Python, R, Julia', 'Integrated visualizations', 'GPU available'],
      available: true,
    },
    {
      id: 'kubernetes',
      nameKey: 'Kubernetes Clusters',
      descriptionKey: 'Deploy and manage applications on K8s clusters.',
      icon: Server,
      features: ['Dedicated cluster', 'kubectl configured', 'Monitoring included'],
      available: false,
      comingSoon: true,
    },
    {
      id: 'hpc',
      nameKey: 'HPC / GPU Computing',
      descriptionKey: 'Access to high-performance computing resources.',
      icon: Cpu,
      features: ['NVIDIA GPUs', 'Slurm scheduler', 'High-speed storage'],
      available: false,
      comingSoon: true,
    },
  ]

  // Labs en vedette (exemple)
  const featuredLabs = [
    {
      id: '1',
      title: 'Introduction to Docker',
      description: 'Learn the basics of Docker: images, containers, and Dockerfile.',
      difficulty: 'EASY' as const,
      estimatedTime: 30,
      points: 100,
      completedBy: 234,
      category: 'DevOps',
    },
    {
      id: '2',
      title: 'Monitoring with Prometheus',
      description: 'Set up a complete monitoring stack with Prometheus and Grafana.',
      difficulty: 'INTERMEDIATE' as const,
      estimatedTime: 60,
      points: 200,
      completedBy: 156,
      category: 'Observability',
    },
    {
      id: '3',
      title: 'ML Pipeline with MLflow',
      description: 'Create a reproducible ML pipeline with MLflow and track your experiments.',
      difficulty: 'HARD' as const,
      estimatedTime: 90,
      points: 300,
      completedBy: 89,
      category: 'Machine Learning',
    },
  ]

  const difficultyColors: Record<string, string> = {
    EASY: 'bg-green-500/10 text-green-400 border-green-500/20',
    INTERMEDIATE: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    HARD: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    EXPERT: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            <Terminal className="h-3 w-3 mr-1" aria-hidden="true" />
            {t.labs.environments}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">
            {t.labs.title}
          </h1>
          <p className="text-lg text-slate-400">
            {t.labs.subtitle}
          </p>
        </section>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
                <Terminal className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-sm text-slate-400">{t.labs.stats.available}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-slate-400">{t.labs.stats.completed}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500">
                <Trophy className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-slate-400">{t.labs.stats.pointsEarned}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Clock className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0h</p>
                <p className="text-sm text-slate-400">{t.labs.stats.practiceTime}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Environnements disponibles */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-white">{t.labs.environments}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {labEnvironments.map((env) => (
              <Card
                key={env.id}
                className={`relative overflow-hidden transition-all bg-slate-900/50 border-white/10 ${
                  env.available ? 'hover:border-cyan-500/40' : 'opacity-75'
                }`}
              >
                {env.comingSoon && (
                  <div className="absolute top-3 right-3">
                    <Badge className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
                      <Rocket className="h-3 w-3 mr-1" aria-hidden="true" />
                      {t.labs.comingSoon}
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className={`p-3 rounded-xl w-fit ${
                    env.available
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                      : 'bg-slate-800'
                  }`}>
                    <env.icon
                      className={`h-6 w-6 ${env.available ? 'text-white' : 'text-slate-500'}`}
                      aria-hidden="true"
                    />
                  </div>
                  <CardTitle className="mt-4 text-white">{env.nameKey}</CardTitle>
                  <CardDescription className="text-slate-400">{env.descriptionKey}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {env.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-slate-300">
                        <CheckCircle className="h-4 w-4 text-green-400" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-4 ${
                      env.available
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0'
                        : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}
                    disabled={!env.available}
                  >
                    {env.available ? (
                      <>
                        <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                        {t.labs.startLab}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" aria-hidden="true" />
                        {t.labs.unavailable}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Labs populaires */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{t.labs.popularLabs}</h2>
            <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10" asChild>
              <Link href="/labs/browse">
                {t.labs.viewAllLabs}
                <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredLabs.map((lab) => (
              <Card key={lab.id} className="group hover:border-cyan-500/40 transition-all bg-slate-900/50 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-slate-800 text-slate-300 border-white/10">{lab.category}</Badge>
                    <Badge className={difficultyColors[lab.difficulty]}>
                      {t.labs.difficulty[lab.difficulty]}
                    </Badge>
                  </div>
                  <CardTitle className="group-hover:text-cyan-400 transition-colors text-white">
                    {lab.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400">{lab.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
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
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
                    <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                    {t.labs.startLab}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50">
          <h2 className="text-2xl font-bold mb-4 text-white">
            {t.homepage.cta.title}
          </h2>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            {t.labs.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0" asChild>
              <Link href="/courses">
                {t.homepage.cta.exploreCatalog}
                <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/academies">
                {t.academies.explore}
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
