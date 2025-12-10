import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { courseStructures, createQuizQuestions } from './seed-courses'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Créer les utilisateurs
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lms.com' },
    update: {},
    create: {
      email: 'admin@lms.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: 'ADMIN',
      bio: 'Administrateur de la plateforme LMS',
    },
  })

  const instructor = await prisma.user.upsert({
    where: { email: 'formateur@lms.com' },
    update: {},
    create: {
      email: 'formateur@lms.com',
      password: userPassword,
      firstName: 'Marie',
      lastName: 'Dupont',
      role: 'INSTRUCTOR',
      bio: 'Formatrice certifiée avec 10 ans d\'expérience en gestion de projets IT',
    },
  })

  const learner = await prisma.user.upsert({
    where: { email: 'apprenant@lms.com' },
    update: {},
    create: {
      email: 'apprenant@lms.com',
      password: userPassword,
      firstName: 'Jean',
      lastName: 'Martin',
      role: 'LEARNER',
      bio: 'Passionné par les nouvelles technologies',
    },
  })

  // Créer un environnement de lab par défaut
  const defaultLabEnv = await prisma.labEnvironment.upsert({
    where: { id: 'default-container-env' },
    update: {},
    create: {
      id: 'default-container-env',
      name: 'Conteneur Linux',
      description: 'Environnement Linux standard pour les exercices',
      type: 'CONTAINER',
      dockerImage: 'ubuntu:22.04',
      resourceLimits: JSON.stringify({ cpu: '1', memory: '2Gi', storage: '10Gi' }),
      timeout: 3600,
      isActive: true,
    },
  })

  const jupyterLabEnv = await prisma.labEnvironment.upsert({
    where: { id: 'jupyter-notebook-env' },
    update: {},
    create: {
      id: 'jupyter-notebook-env',
      name: 'Jupyter Notebook',
      description: 'Environnement Jupyter pour l\'analyse de données',
      type: 'JUPYTER',
      dockerImage: 'jupyter/datascience-notebook:latest',
      resourceLimits: JSON.stringify({ cpu: '2', memory: '4Gi', storage: '20Gi' }),
      timeout: 7200,
      isActive: true,
    },
  })

  // Créer les badges
  const badges = await Promise.all([
    prisma.badge.upsert({
      where: { name: 'Premier pas' },
      update: {},
      create: {
        name: 'Premier pas',
        description: 'Terminer votre première leçon',
        icon: '🎯',
        criteria: JSON.stringify({ type: 'lessons_completed', count: 1 }),
        points: 10,
        category: 'ACHIEVEMENT',
      },
    }),
    prisma.badge.upsert({
      where: { name: 'Explorateur' },
      update: {},
      create: {
        name: 'Explorateur',
        description: 'S\'inscrire à 3 cours différents',
        icon: '🔭',
        criteria: JSON.stringify({ type: 'enrollments', count: 3 }),
        points: 25,
        category: 'MILESTONE',
      },
    }),
    prisma.badge.upsert({
      where: { name: 'Champion des quiz' },
      update: {},
      create: {
        name: 'Champion des quiz',
        description: 'Obtenir 100% à 5 quiz',
        icon: '🏆',
        criteria: JSON.stringify({ type: 'perfect_quizzes', count: 5 }),
        points: 50,
        category: 'SKILL',
      },
    }),
    prisma.badge.upsert({
      where: { name: 'Diplômé' },
      update: {},
      create: {
        name: 'Diplômé',
        description: 'Terminer votre premier cours',
        icon: '🎓',
        criteria: JSON.stringify({ type: 'courses_completed', count: 1 }),
        points: 100,
        category: 'ACHIEVEMENT',
      },
    }),
    prisma.badge.upsert({
      where: { name: 'Assidu' },
      update: {},
      create: {
        name: 'Assidu',
        description: 'Se connecter 7 jours de suite',
        icon: '📅',
        criteria: JSON.stringify({ type: 'login_streak', count: 7 }),
        points: 30,
        category: 'MILESTONE',
      },
    }),
  ])

  // Créer les cours avec la structure enrichie
  const course1 = await prisma.course.upsert({
    where: { slug: 'gouvernance-si' },
    update: {},
    create: {
      title: 'Gouvernance des Systèmes d\'Information',
      slug: 'gouvernance-si',
      description: 'Maîtrisez les fondamentaux de la gouvernance des SI. Ce cours complet vous guidera à travers les meilleures pratiques, les frameworks reconnus (COBIT, ITIL) et les stratégies de gestion efficaces pour aligner l\'IT avec les objectifs métier de votre organisation.',
      shortDescription: 'Apprenez à aligner l\'IT avec les objectifs métier',
      thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
      duration: 480,
      level: 'INTERMEDIATE',
      category: 'Management IT',
      tags: JSON.stringify(['Gouvernance', 'COBIT', 'ITIL', 'Management']),
      isFree: true,
      isPublished: true,
      isFeatured: true,
      authorId: instructor.id,
    },
  })

  const course2 = await prisma.course.upsert({
    where: { slug: 'gestion-projet-agile' },
    update: {},
    create: {
      title: 'Gestion de Projet Agile',
      slug: 'gestion-projet-agile',
      description: 'Découvrez les méthodologies agiles (Scrum, Kanban, SAFe) et apprenez à les implémenter efficacement dans vos projets. Des exercices pratiques et des études de cas réels vous permettront de maîtriser ces approches modernes.',
      shortDescription: 'Maîtrisez Scrum, Kanban et SAFe',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      duration: 420,
      level: 'BEGINNER',
      category: 'Gestion de Projet',
      tags: JSON.stringify(['Agile', 'Scrum', 'Kanban', 'SAFe']),
      isFree: true,
      isPublished: true,
      isFeatured: true,
      authorId: instructor.id,
    },
  })

  const course3 = await prisma.course.upsert({
    where: { slug: 'securite-informatique' },
    update: {},
    create: {
      title: 'Cybersécurité : Les Fondamentaux',
      slug: 'securite-informatique',
      description: 'Protégez votre organisation contre les cybermenaces. Ce cours couvre les principes fondamentaux de la sécurité informatique, de la gestion des risques aux bonnes pratiques de protection des données.',
      shortDescription: 'Protégez votre organisation des cybermenaces',
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
      duration: 420,
      level: 'INTERMEDIATE',
      category: 'Sécurité',
      tags: JSON.stringify(['Cybersécurité', 'RGPD', 'ISO 27001', 'Risk Management']),
      isFree: true,
      isPublished: true,
      authorId: instructor.id,
    },
  })

  // Supprimer les modules existants pour éviter les doublons lors de re-seed
  // (les leçons, quiz, questions, réponses et labs sont supprimés en cascade)
  await prisma.module.deleteMany({
    where: {
      courseId: { in: [course1.id, course2.id] },
    },
  })

  // Créer le contenu pour le cours 1 (Gouvernance SI)
  const govStructure = courseStructures['gouvernance-si']
  let firstLesson1: { id: string } | null = null

  for (const moduleData of govStructure.modules) {
    const module = await prisma.module.create({
      data: {
        title: moduleData.title,
        description: moduleData.description,
        order: moduleData.order,
        courseId: course1.id,
      },
    })

    for (const lessonData of moduleData.lessons) {
      const lesson = await prisma.lesson.create({
        data: {
          title: lessonData.title,
          description: lessonData.description,
          content: lessonData.content,
          videoUrl: (lessonData as { videoUrl?: string }).videoUrl || null,
          duration: lessonData.duration,
          order: lessonData.order,
          type: lessonData.type,
          isPreview: (lessonData as { isPreview?: boolean }).isPreview || false,
          resources: (lessonData as { resources?: string }).resources || null,
          moduleId: module.id,
        },
      })

      if (!firstLesson1) firstLesson1 = lesson

      // Créer le quiz si nécessaire
      if ((lessonData as { hasQuiz?: boolean }).hasQuiz) {
        const quizData = createQuizQuestions(lessonData.title)
        if (quizData) {
          const quiz = await prisma.quiz.create({
            data: {
              title: lessonData.title,
              description: lessonData.description,
              passingScore: 70,
              timeLimit: lessonData.duration,
              maxAttempts: 3,
              lessonId: lesson.id,
            },
          })

          let questionOrder = 1
          for (const q of quizData.questions) {
            const question = await prisma.question.create({
              data: {
                text: q.text,
                type: q.type,
                explanation: q.explanation,
                points: q.points,
                order: questionOrder++,
                quizId: quiz.id,
              },
            })

            let answerOrder = 1
            for (const a of q.answers) {
              await prisma.answer.create({
                data: {
                  text: a.text,
                  isCorrect: a.isCorrect,
                  order: answerOrder++,
                  questionId: question.id,
                },
              })
            }
          }
        }
      }

      // Créer le lab si nécessaire
      if ((lessonData as { hasLab?: boolean; labConfig?: { title: string; description: string; instructions: string; difficulty: string; estimatedTime: number; points: number; startingCode?: string } }).hasLab) {
        const labConfig = (lessonData as { labConfig: { title: string; description: string; instructions: string; difficulty: string; estimatedTime: number; points: number; startingCode?: string } }).labConfig
        await prisma.labAssignment.create({
          data: {
            title: labConfig.title,
            description: labConfig.description,
            instructions: labConfig.instructions,
            difficulty: labConfig.difficulty,
            estimatedTime: labConfig.estimatedTime,
            points: labConfig.points,
            startingCode: labConfig.startingCode || null,
            lessonId: lesson.id,
            environmentId: defaultLabEnv.id,
          },
        })
      }
    }
  }

  // Créer le contenu pour le cours 2 (Gestion de Projet Agile)
  const agileStructure = courseStructures['gestion-projet-agile']
  let firstLesson2: { id: string } | null = null

  for (const moduleData of agileStructure.modules) {
    const module = await prisma.module.create({
      data: {
        title: moduleData.title,
        description: moduleData.description,
        order: moduleData.order,
        courseId: course2.id,
      },
    })

    for (const lessonData of moduleData.lessons) {
      const lesson = await prisma.lesson.create({
        data: {
          title: lessonData.title,
          description: lessonData.description,
          content: lessonData.content,
          videoUrl: (lessonData as { videoUrl?: string }).videoUrl || null,
          duration: lessonData.duration,
          order: lessonData.order,
          type: lessonData.type,
          isPreview: (lessonData as { isPreview?: boolean }).isPreview || false,
          resources: (lessonData as { resources?: string }).resources || null,
          moduleId: module.id,
        },
      })

      if (!firstLesson2) firstLesson2 = lesson

      // Créer le quiz si nécessaire
      if ((lessonData as { hasQuiz?: boolean }).hasQuiz) {
        const quizData = createQuizQuestions(lessonData.title)
        if (quizData) {
          const quiz = await prisma.quiz.create({
            data: {
              title: lessonData.title,
              description: lessonData.description,
              passingScore: 70,
              timeLimit: lessonData.duration,
              maxAttempts: 3,
              lessonId: lesson.id,
            },
          })

          let questionOrder = 1
          for (const q of quizData.questions) {
            const question = await prisma.question.create({
              data: {
                text: q.text,
                type: q.type,
                explanation: q.explanation,
                points: q.points,
                order: questionOrder++,
                quizId: quiz.id,
              },
            })

            let answerOrder = 1
            for (const a of q.answers) {
              await prisma.answer.create({
                data: {
                  text: a.text,
                  isCorrect: a.isCorrect,
                  order: answerOrder++,
                  questionId: question.id,
                },
              })
            }
          }
        }
      }

      // Créer le lab si nécessaire
      if ((lessonData as { hasLab?: boolean; labConfig?: { title: string; description: string; instructions: string; difficulty: string; estimatedTime: number; points: number; startingCode?: string } }).hasLab) {
        const labConfig = (lessonData as { labConfig: { title: string; description: string; instructions: string; difficulty: string; estimatedTime: number; points: number; startingCode?: string } }).labConfig
        await prisma.labAssignment.create({
          data: {
            title: labConfig.title,
            description: labConfig.description,
            instructions: labConfig.instructions,
            difficulty: labConfig.difficulty,
            estimatedTime: labConfig.estimatedTime,
            points: labConfig.points,
            startingCode: labConfig.startingCode || null,
            lessonId: lesson.id,
            environmentId: defaultLabEnv.id,
          },
        })
      }
    }
  }

  // Garder les références aux premières leçons pour la progression
  const lesson1_1 = firstLesson1!

  // Inscrire l'apprenant aux cours (using upsert since SQLite doesn't support skipDuplicates)
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: learner.id, courseId: course1.id } },
    update: {},
    create: { userId: learner.id, courseId: course1.id },
  })
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: learner.id, courseId: course2.id } },
    update: {},
    create: { userId: learner.id, courseId: course2.id },
  })

  // Créer de la progression pour l'apprenant
  await prisma.courseProgress.upsert({
    where: {
      userId_courseId: { userId: learner.id, courseId: course1.id },
    },
    update: {},
    create: {
      userId: learner.id,
      courseId: course1.id,
      progressPercent: 25,
      timeSpent: 45,
    },
  })

  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: { userId: learner.id, lessonId: lesson1_1.id },
    },
    update: {},
    create: {
      userId: learner.id,
      lessonId: lesson1_1.id,
      isCompleted: true,
      completedAt: new Date(),
      timeSpent: 900,
    },
  })

  // Attribuer un badge à l'apprenant
  await prisma.userBadge.upsert({
    where: {
      userId_badgeId: { userId: learner.id, badgeId: badges[0].id },
    },
    update: {},
    create: {
      userId: learner.id,
      badgeId: badges[0].id, // Premier pas
    },
  })

  // Créer des notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: learner.id,
        title: 'Bienvenue sur la plateforme !',
        message: 'Commencez votre parcours d\'apprentissage dès maintenant.',
        type: 'INFO',
      },
      {
        userId: learner.id,
        title: 'Badge obtenu !',
        message: 'Félicitations ! Vous avez obtenu le badge "Premier pas".',
        type: 'ACHIEVEMENT',
      },
    ],
  })

  console.log('Database seeded successfully!')
  console.log({
    users: { admin: admin.email, instructor: instructor.email, learner: learner.email },
    courses: [course1.title, course2.title, course3.title],
    badges: badges.map(b => b.name),
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
