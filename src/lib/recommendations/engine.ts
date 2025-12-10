import { prisma } from '@/lib/prisma'

interface CourseScore {
  courseId: string
  score: number
  reasons: string[]
}

interface RecommendationFactors {
  categoryMatch: number
  levelMatch: number
  popularityBonus: number
  completionPotential: number
  recencyBonus: number
}

// Weights for different factors
const WEIGHTS = {
  categoryMatch: 0.35,
  levelMatch: 0.25,
  popularityBonus: 0.15,
  completionPotential: 0.15,
  recencyBonus: 0.10,
}

export async function generateRecommendations(userId: string, limit = 5): Promise<CourseScore[]> {
  // Get user's learning profile
  const profile = await prisma.learnerProfile.findUnique({
    where: { userId }
  })

  // Get user's enrolled courses and progress
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          category: true,
          level: true,
          tags: true
        }
      }
    }
  })

  const enrolledCourseIds = enrollments.map((e: { course: { id: string } }) => e.course.id)
  const completedCategories = new Set(enrollments.map((e: { course: { category: string } }) => e.course.category))
  const userLevels = new Set<string>(enrollments.map((e: { course: { level: string } }) => e.course.level))

  // Get all published courses not already enrolled
  const availableCourses = await prisma.course.findMany({
    where: {
      isPublished: true,
      id: { notIn: enrolledCourseIds }
    },
    include: {
      _count: {
        select: { enrollments: true }
      }
    }
  })

  // Calculate scores for each course
  const scoredCourses: CourseScore[] = await Promise.all(
    availableCourses.map(async (course: { id: string; category: string; level: string; duration: number; publishedAt: Date | null; _count: { enrollments: number } }) => {
      const factors: RecommendationFactors = {
        categoryMatch: 0,
        levelMatch: 0,
        popularityBonus: 0,
        completionPotential: 0,
        recencyBonus: 0,
      }
      const reasons: string[] = []

      // Category match - higher if user has completed courses in this category
      if (completedCategories.has(course.category)) {
        factors.categoryMatch = 0.8
        reasons.push('Catégorie similaire à vos cours précédents')
      } else {
        // Check if interests match (from profile)
        const interests = profile?.interests ? JSON.parse(profile.interests) : []
        if (interests.includes(course.category)) {
          factors.categoryMatch = 0.9
          reasons.push('Correspond à vos centres d\'intérêt')
        } else {
          factors.categoryMatch = 0.3
        }
      }

      // Level match
      const levelOrder = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']
      const userMaxLevel = Math.max(
        ...Array.from(userLevels).map((l: string) => levelOrder.indexOf(l))
      )
      const courseLevel = levelOrder.indexOf(course.level)
      const profileLevel = levelOrder.indexOf(profile?.skillLevel || 'BEGINNER')

      if (courseLevel === userMaxLevel + 1 || courseLevel === profileLevel) {
        factors.levelMatch = 1.0
        reasons.push('Niveau adapté à votre progression')
      } else if (courseLevel <= userMaxLevel) {
        factors.levelMatch = 0.5
      } else {
        factors.levelMatch = 0.2
      }

      // Popularity bonus
      const maxEnrollments = Math.max(...availableCourses.map((c: { _count: { enrollments: number } }) => c._count.enrollments))
      if (maxEnrollments > 0) {
        factors.popularityBonus = course._count.enrollments / maxEnrollments
        if (factors.popularityBonus > 0.7) {
          reasons.push('Cours populaire')
        }
      }

      // Completion potential - based on user's average completion rate
      const completedEnrollments = enrollments.filter((e: { status: string }) => e.status === 'COMPLETED').length
      const completionRate = enrollments.length > 0
        ? completedEnrollments / enrollments.length
        : 0.5

      // Shorter courses for users with lower completion rates
      const avgDuration = availableCourses.reduce((sum: number, c: { duration: number }) => sum + c.duration, 0) / availableCourses.length
      if (completionRate < 0.5 && course.duration < avgDuration) {
        factors.completionPotential = 0.9
        reasons.push('Durée adaptée à votre rythme')
      } else {
        factors.completionPotential = 0.6
      }

      // Recency bonus - newer courses get a small boost
      const daysSincePublish = course.publishedAt
        ? (Date.now() - course.publishedAt.getTime()) / (1000 * 60 * 60 * 24)
        : 365

      if (daysSincePublish < 30) {
        factors.recencyBonus = 1.0
        reasons.push('Nouveau cours')
      } else if (daysSincePublish < 90) {
        factors.recencyBonus = 0.7
      } else {
        factors.recencyBonus = 0.3
      }

      // Calculate weighted score
      const score =
        factors.categoryMatch * WEIGHTS.categoryMatch +
        factors.levelMatch * WEIGHTS.levelMatch +
        factors.popularityBonus * WEIGHTS.popularityBonus +
        factors.completionPotential * WEIGHTS.completionPotential +
        factors.recencyBonus * WEIGHTS.recencyBonus

      return {
        courseId: course.id,
        score,
        reasons
      }
    })
  )

  // Sort by score and return top recommendations
  return scoredCourses
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// Save recommendations to database
export async function saveRecommendations(userId: string): Promise<void> {
  const recommendations = await generateRecommendations(userId, 10)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // Recommendations expire in 7 days

  // Delete old recommendations
  await prisma.recommendation.deleteMany({
    where: { userId }
  })

  // Save new recommendations
  await prisma.recommendation.createMany({
    data: recommendations.map(rec => ({
      userId,
      courseId: rec.courseId,
      score: rec.score,
      reason: JSON.stringify(rec.reasons),
      expiresAt
    }))
  })
}

// Get recommendations for a user
export async function getRecommendations(userId: string) {
  const recommendations = await prisma.recommendation.findMany({
    where: {
      userId,
      isDismissed: false,
      expiresAt: { gte: new Date() }
    },
    orderBy: { score: 'desc' },
    include: {
      course: {
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: { enrollments: true }
          }
        }
      }
    }
  })

  // If no recommendations exist, generate them
  if (recommendations.length === 0) {
    await saveRecommendations(userId)
    return getRecommendations(userId)
  }

  return recommendations.map((rec: { reason: string; [key: string]: unknown }) => ({
    ...rec,
    reasons: JSON.parse(rec.reason)
  }))
}

// Mark recommendation as viewed
export async function markRecommendationViewed(userId: string, courseId: string) {
  await prisma.recommendation.updateMany({
    where: { userId, courseId },
    data: { isViewed: true }
  })
}

// Mark recommendation as clicked
export async function markRecommendationClicked(userId: string, courseId: string) {
  await prisma.recommendation.updateMany({
    where: { userId, courseId },
    data: { isClicked: true }
  })
}

// Dismiss a recommendation
export async function dismissRecommendation(userId: string, courseId: string) {
  await prisma.recommendation.updateMany({
    where: { userId, courseId },
    data: { isDismissed: true }
  })
}

// Create or update learner profile
export async function updateLearnerProfile(
  userId: string,
  data: {
    skillLevel?: string
    learningStyle?: string
    preferredPace?: string
    goals?: string[]
    interests?: string[]
    weeklyTimeGoal?: number
  }
) {
  await prisma.learnerProfile.upsert({
    where: { userId },
    update: {
      ...data,
      goals: data.goals ? JSON.stringify(data.goals) : undefined,
      interests: data.interests ? JSON.stringify(data.interests) : undefined,
    },
    create: {
      userId,
      skillLevel: data.skillLevel || 'BEGINNER',
      learningStyle: data.learningStyle,
      preferredPace: data.preferredPace || 'NORMAL',
      goals: data.goals ? JSON.stringify(data.goals) : null,
      interests: data.interests ? JSON.stringify(data.interests) : null,
      weeklyTimeGoal: data.weeklyTimeGoal || 5,
    }
  })

  // Regenerate recommendations after profile update
  await saveRecommendations(userId)
}
