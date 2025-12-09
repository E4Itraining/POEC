'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trophy, Lock, Star, Target, Award, Zap } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface BadgeType {
  id: string
  name: string
  description: string
  icon: string
  points: number
  category: string
}

interface UserBadge {
  id: string
  earnedAt: Date
  badge: BadgeType
  badgeId: string
}

interface AchievementsClientProps {
  userBadges: UserBadge[]
  allBadges: BadgeType[]
  stats: {
    completedCourses: number
    completedLessons: number
    passedQuizzes: number
    certificates: number
    totalPoints: number
  }
}

export function AchievementsClient({ userBadges, allBadges, stats }: AchievementsClientProps) {
  const { t, locale } = useI18n()

  const earnedBadgeIds = userBadges.map((ub) => ub.badgeId)
  const lockedBadges = allBadges.filter((b) => !earnedBadgeIds.includes(b.id))

  // Déterminer le niveau basé sur les points
  const levels = [
    { nameKey: 'beginner', minPoints: 0, maxPoints: 50 },
    { nameKey: 'apprentice', minPoints: 50, maxPoints: 150 },
    { nameKey: 'confirmed', minPoints: 150, maxPoints: 300 },
    { nameKey: 'expert', minPoints: 300, maxPoints: 500 },
    { nameKey: 'master', minPoints: 500, maxPoints: Infinity },
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

  const getLevelName = (nameKey: string) => {
    return t.achievements.levels[nameKey as keyof typeof t.achievements.levels] || nameKey
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(
      locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : locale === 'nl' ? 'nl-NL' : 'en-US'
    )
  }

  const categoryLabels: Record<string, string> = {
    ACHIEVEMENT: t.achievements.categories.achievement,
    MILESTONE: t.achievements.categories.milestone,
    SKILL: t.achievements.categories.skill,
    SPECIAL: t.achievements.categories.special,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">{t.achievements.title}</h1>
          <p className="text-slate-400 mt-1">
            {t.achievements.subtitle}
          </p>
        </div>

        {/* Niveau et points */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
                  <Trophy className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{getLevelName(currentLevel.nameKey)}</h2>
                  <p className="text-slate-400">
                    {stats.totalPoints} {t.achievements.pointsAccumulated}
                  </p>
                </div>
              </div>

              <div className="flex-1">
                {nextLevel && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>{getLevelName(currentLevel.nameKey)}</span>
                      <span>{getLevelName(nextLevel.nameKey)}</span>
                    </div>
                    <Progress value={levelProgress} className="h-3" />
                    <p className="text-sm text-slate-400 text-center">
                      {nextLevel.minPoints - stats.totalPoints} {t.achievements.pointsToNextLevel}
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
            label={t.achievements.stats.coursesCompleted}
            value={stats.completedCourses}
          />
          <StatCard
            icon={Target}
            label={t.achievements.stats.lessonsCompleted}
            value={stats.completedLessons}
          />
          <StatCard
            icon={Zap}
            label={t.achievements.stats.quizzesPassed}
            value={stats.passedQuizzes}
          />
          <StatCard
            icon={Star}
            label={t.achievements.stats.certificates}
            value={stats.certificates}
          />
        </div>

        {/* Badges obtenus */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-white">
            {t.achievements.earnedBadges} ({userBadges.length})
          </h2>
          {userBadges.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userBadges.map((userBadge) => (
                <BadgeCard
                  key={userBadge.id}
                  badge={userBadge.badge}
                  earnedAt={userBadge.earnedAt}
                  unlocked
                  categoryLabels={categoryLabels}
                  formatDate={formatDate}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="py-8 text-center">
                <Trophy className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                <p className="text-slate-400">
                  {t.achievements.noBadgesYet}
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Badges à débloquer */}
        {lockedBadges.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">
              {t.achievements.badgesToUnlock} ({lockedBadges.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lockedBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  unlocked={false}
                  categoryLabels={categoryLabels}
                  formatDate={formatDate}
                  t={t}
                />
              ))}
            </div>
          </section>
        )}
      </div>
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
    <Card className="bg-slate-900/50 border-white/10">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <p className="text-sm text-slate-400">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface BadgeCardProps {
  badge: BadgeType
  earnedAt?: Date
  unlocked: boolean
  categoryLabels: Record<string, string>
  formatDate: (date: Date) => string
  t: any
}

function BadgeCard({ badge, earnedAt, unlocked, categoryLabels, formatDate, t }: BadgeCardProps) {
  const categoryColors: Record<string, string> = {
    ACHIEVEMENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    MILESTONE: 'bg-green-500/10 text-green-400 border-green-500/20',
    SKILL: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    SPECIAL: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  }

  return (
    <Card className={`transition-all bg-slate-900/50 border-white/10 ${!unlocked ? 'opacity-60' : 'hover:border-cyan-500/40'}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className={`h-14 w-14 rounded-full flex items-center justify-center text-2xl ${
              unlocked
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/25'
                : 'bg-slate-800'
            }`}
          >
            {unlocked ? badge.icon : <Lock className="h-6 w-6 text-slate-500" />}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-white">{badge.name}</h3>
              <Badge className={categoryColors[badge.category]}>
                {categoryLabels[badge.category]}
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mt-1">{badge.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-medium text-cyan-400">
                +{badge.points} {t.achievements.points}
              </span>
              {earnedAt && (
                <span className="text-xs text-slate-500">
                  {t.achievements.earnedOn} {formatDate(earnedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
