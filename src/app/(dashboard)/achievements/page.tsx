import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trophy, Lock, Star, Target, Clock, Award, Zap } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata = {
  title: 'Mes badges et récompenses',
  description: 'Découvrez vos accomplissements et badges gagnés',
}

async function getUserAchievements(userId: string) {
  const [userBadges, allBadges, stats] = await Promise.all([
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    }),
    prisma.badge.findMany({
      orderBy: { points: 'desc' },
    }),
    Promise.all([
      prisma.enrollment.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.lessonProgress.count({ where: { userId, isCompleted: true } }),
      prisma.quizAttempt.count({ where: { userId, isPassed: true } }),
      prisma.certificate.count({ where: { userId } }),
    ]),
  ])

  const [completedCourses, completedLessons, passedQuizzes, certificates] = stats

  const totalPoints = userBadges.reduce((acc, ub) => acc + ub.badge.points, 0)

  return {
    userBadges,
    allBadges,
    stats: {
      completedCourses,
      completedLessons,
      passedQuizzes,
      certificates,
      totalPoints,
    },
  }
}

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const { userBadges, allBadges, stats } = await getUserAchievements(session.user.id)

  const earnedBadgeIds = userBadges.map((ub) => ub.badgeId)
  const lockedBadges = allBadges.filter((b) => !earnedBadgeIds.includes(b.id))

  // Déterminer le niveau basé sur les points
  const levels = [
    { name: 'Débutant', minPoints: 0, maxPoints: 50 },
    { name: 'Apprenti', minPoints: 50, maxPoints: 150 },
    { name: 'Confirmé', minPoints: 150, maxPoints: 300 },
    { name: 'Expert', minPoints: 300, maxPoints: 500 },
    { name: 'Maître', minPoints: 500, maxPoints: Infinity },
  ]

  const currentLevel = levels.find(
    (l) => stats.totalPoints >= l.minPoints && stats.totalPoints < l.maxPoints
  ) || levels[0]

  const nextLevel = levels[levels.indexOf(currentLevel) + 1]
  const levelProgress = nextLevel
    ? ((stats.totalPoints - currentLevel.minPoints) /
        (nextLevel.minPoints - currentLevel.minPoints)) *
      100
    : 100

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Badges et récompenses</h1>
        <p className="text-muted-foreground mt-1">
          Suivez vos accomplissements et débloquez de nouveaux badges
        </p>
      </div>

      {/* Niveau et points */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white">
                <Trophy className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentLevel.name}</h2>
                <p className="text-muted-foreground">
                  {stats.totalPoints} points accumulés
                </p>
              </div>
            </div>

            <div className="flex-1">
              {nextLevel && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentLevel.name}</span>
                    <span>{nextLevel.name}</span>
                  </div>
                  <Progress value={levelProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground text-center">
                    {nextLevel.minPoints - stats.totalPoints} points pour le prochain niveau
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={Award}
          label="Cours terminés"
          value={stats.completedCourses}
        />
        <StatCard
          icon={Target}
          label="Leçons complétées"
          value={stats.completedLessons}
        />
        <StatCard
          icon={Zap}
          label="Quiz réussis"
          value={stats.passedQuizzes}
        />
        <StatCard
          icon={Star}
          label="Certificats"
          value={stats.certificates}
        />
      </div>

      {/* Badges obtenus */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Badges obtenus ({userBadges.length})
        </h2>
        {userBadges.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userBadges.map((userBadge) => (
              <BadgeCard
                key={userBadge.id}
                badge={userBadge.badge}
                earnedAt={userBadge.earnedAt}
                unlocked
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Vous n'avez pas encore de badge. Continuez votre apprentissage pour en gagner !
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Badges à débloquer */}
      {lockedBadges.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Badges à débloquer ({lockedBadges.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lockedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} unlocked={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface BadgeCardProps {
  badge: {
    id: string
    name: string
    description: string
    icon: string
    points: number
    category: string
  }
  earnedAt?: Date
  unlocked: boolean
}

function BadgeCard({ badge, earnedAt, unlocked }: BadgeCardProps) {
  const categoryColors: Record<string, string> = {
    ACHIEVEMENT: 'bg-blue-100 text-blue-800',
    MILESTONE: 'bg-green-100 text-green-800',
    SKILL: 'bg-purple-100 text-purple-800',
    SPECIAL: 'bg-yellow-100 text-yellow-800',
  }

  const categoryLabels: Record<string, string> = {
    ACHIEVEMENT: 'Accomplissement',
    MILESTONE: 'Étape',
    SKILL: 'Compétence',
    SPECIAL: 'Spécial',
  }

  return (
    <Card className={`transition-all ${!unlocked ? 'opacity-60' : 'hover:shadow-lg'}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className={`h-14 w-14 rounded-full flex items-center justify-center text-2xl ${
              unlocked
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                : 'bg-muted'
            }`}
          >
            {unlocked ? badge.icon : <Lock className="h-6 w-6 text-muted-foreground" />}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold">{badge.name}</h3>
              <Badge variant="secondary" className={categoryColors[badge.category]}>
                {categoryLabels[badge.category]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-medium text-primary">
                +{badge.points} points
              </span>
              {earnedAt && (
                <span className="text-xs text-muted-foreground">
                  Obtenu le {formatDate(earnedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
