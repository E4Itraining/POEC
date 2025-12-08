export interface Academy {
  id: string
  slug: string
  title: string
  description: string
  badge: string
  badgeColor: 'blue' | 'green' | 'orange' | 'cyan' | 'purple' | 'pink'
  iconGradient: string
  tags: string[]
  coursesCount: number
  learningPaths: number
}

export const academies: Academy[] = [
  {
    id: '1',
    slug: 'victoriametrics',
    title: 'VictoriaMetrics Training Academy',
    description: 'Full-spectrum training on VictoriaMetrics ecosystem. Architecture, scaling, industrial telemetry, AI observability.',
    badge: 'Observability',
    badgeColor: 'blue',
    iconGradient: 'from-blue-500 to-blue-600',
    tags: ['vmagent', 'vmalert', 'vmcluster', 'PromQL', 'Industrial', 'AI/ML'],
    coursesCount: 12,
    learningPaths: 3,
  },
  {
    id: '2',
    slug: 'ciq-stack',
    title: 'CIQ Stack Professional Training',
    description: 'Master Rocky Linux, Warewulf, and Apptainer. Build sovereign HPC infrastructure from cluster provisioning to containers.',
    badge: 'HPC & Compute',
    badgeColor: 'green',
    iconGradient: 'from-orange-400 to-orange-500',
    tags: ['Rocky Linux', 'Warewulf', 'Apptainer', 'Slurm', 'HPC'],
    coursesCount: 15,
    learningPaths: 4,
  },
  {
    id: '3',
    slug: 'monitoring360',
    title: 'Monitoring360',
    description: 'Complete observability stack training. Prometheus, Grafana, Loki, Tempo, OpenTelemetry integration.',
    badge: 'Full Stack',
    badgeColor: 'green',
    iconGradient: 'from-yellow-400 to-amber-500',
    tags: ['Prometheus', 'Grafana', 'Loki', 'Tempo', 'OTEL'],
    coursesCount: 14,
    learningPaths: 3,
  },
  {
    id: '4',
    slug: 'openobserve',
    title: 'OpenObserve Training Academy',
    description: 'Unified observability platform for logs, metrics & traces. S3-native, 140x lower storage costs than ELK.',
    badge: 'Unified Observability',
    badgeColor: 'cyan',
    iconGradient: 'from-cyan-400 to-teal-500',
    tags: ['Logs', 'Metrics', 'Traces', 'OTEL', 'SQL', 'S3'],
    coursesCount: 10,
    learningPaths: 3,
  },
]

export function getAcademyBySlug(slug: string): Academy | undefined {
  return academies.find((academy) => academy.slug === slug)
}

export function getBadgeColorClasses(color: Academy['badgeColor']): string {
  const colors: Record<Academy['badgeColor'], string> = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  }
  return colors[color]
}
