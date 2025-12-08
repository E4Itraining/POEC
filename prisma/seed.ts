import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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

  // Créer les cours
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
      duration: 360,
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

  // Créer les modules et leçons pour le cours 1
  const module1 = await prisma.module.create({
    data: {
      title: 'Introduction à la Gouvernance IT',
      description: 'Comprendre les enjeux et les fondamentaux de la gouvernance des SI',
      order: 1,
      courseId: course1.id,
    },
  })

  const lesson1_1 = await prisma.lesson.create({
    data: {
      title: 'Qu\'est-ce que la Gouvernance IT ?',
      description: 'Définition, enjeux et importance de la gouvernance IT',
      content: `
# Qu'est-ce que la Gouvernance IT ?

La gouvernance IT est l'ensemble des processus et pratiques qui assurent que les systèmes d'information soutiennent les objectifs stratégiques de l'organisation.

## Les piliers de la gouvernance IT

1. **Alignement stratégique** - S'assurer que l'IT soutient les objectifs métier
2. **Création de valeur** - Optimiser les investissements IT
3. **Gestion des risques** - Identifier et mitiger les risques technologiques
4. **Gestion des ressources** - Optimiser l'utilisation des ressources IT
5. **Mesure de la performance** - Suivre et améliorer les performances

## Pourquoi est-ce important ?

- Meilleure prise de décision
- Réduction des coûts
- Amélioration de la qualité des services
- Conformité réglementaire
- Avantage compétitif

> "La gouvernance IT n'est pas une option, c'est une nécessité pour toute organisation moderne." - ISACA
      `,
      duration: 15,
      order: 1,
      type: 'TEXT',
      isPreview: true,
      moduleId: module1.id,
    },
  })

  const lesson1_2 = await prisma.lesson.create({
    data: {
      title: 'Les frameworks de référence',
      description: 'COBIT, ITIL, ISO 38500 - Vue d\'ensemble',
      content: `
# Les Frameworks de Gouvernance IT

## COBIT (Control Objectives for Information Technologies)

COBIT est un framework de gouvernance IT développé par l'ISACA. Il fournit :
- Des processus de gouvernance clairement définis
- Des métriques et modèles de maturité
- Des bonnes pratiques reconnues mondialement

### Les 5 domaines de COBIT

1. Évaluer, Diriger et Surveiller (EDM)
2. Aligner, Planifier et Organiser (APO)
3. Construire, Acquérir et Implémenter (BAI)
4. Délivrer, Servir et Supporter (DSS)
5. Surveiller, Évaluer et Apprécier (MEA)

## ITIL (Information Technology Infrastructure Library)

ITIL est un ensemble de bonnes pratiques pour la gestion des services IT.

### Le cycle de vie des services ITIL

- Stratégie des services
- Conception des services
- Transition des services
- Exploitation des services
- Amélioration continue des services

## ISO/IEC 38500

Norme internationale pour la gouvernance IT des organisations.
      `,
      duration: 20,
      order: 2,
      type: 'TEXT',
      moduleId: module1.id,
    },
  })

  // Créer un quiz pour la première leçon
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Quiz : Fondamentaux de la Gouvernance IT',
      description: 'Testez vos connaissances sur les bases de la gouvernance IT',
      passingScore: 70,
      timeLimit: 10,
      maxAttempts: 3,
      lessonId: lesson1_2.id,
    },
  })

  // Créer les questions du quiz
  const question1 = await prisma.question.create({
    data: {
      text: 'Quels sont les piliers de la gouvernance IT ?',
      type: 'MULTIPLE_CHOICE',
      explanation: 'Les 5 piliers sont : alignement stratégique, création de valeur, gestion des risques, gestion des ressources et mesure de la performance.',
      points: 2,
      order: 1,
      quizId: quiz1.id,
    },
  })

  await prisma.answer.createMany({
    data: [
      { text: 'Alignement stratégique', isCorrect: true, order: 1, questionId: question1.id },
      { text: 'Marketing digital', isCorrect: false, order: 2, questionId: question1.id },
      { text: 'Gestion des risques', isCorrect: true, order: 3, questionId: question1.id },
      { text: 'Mesure de la performance', isCorrect: true, order: 4, questionId: question1.id },
    ],
  })

  const question2 = await prisma.question.create({
    data: {
      text: 'COBIT est développé par quelle organisation ?',
      type: 'SINGLE_CHOICE',
      explanation: 'COBIT est développé et maintenu par l\'ISACA (Information Systems Audit and Control Association).',
      points: 1,
      order: 2,
      quizId: quiz1.id,
    },
  })

  await prisma.answer.createMany({
    data: [
      { text: 'ISO', isCorrect: false, order: 1, questionId: question2.id },
      { text: 'ISACA', isCorrect: true, order: 2, questionId: question2.id },
      { text: 'PMI', isCorrect: false, order: 3, questionId: question2.id },
      { text: 'IEEE', isCorrect: false, order: 4, questionId: question2.id },
    ],
  })

  const question3 = await prisma.question.create({
    data: {
      text: 'ITIL se concentre principalement sur la gestion des services IT.',
      type: 'TRUE_FALSE',
      explanation: 'Vrai. ITIL (Information Technology Infrastructure Library) est un ensemble de bonnes pratiques spécifiquement conçu pour la gestion des services IT.',
      points: 1,
      order: 3,
      quizId: quiz1.id,
    },
  })

  await prisma.answer.createMany({
    data: [
      { text: 'Vrai', isCorrect: true, order: 1, questionId: question3.id },
      { text: 'Faux', isCorrect: false, order: 2, questionId: question3.id },
    ],
  })

  // Module 2
  const module2 = await prisma.module.create({
    data: {
      title: 'Mise en œuvre de la Gouvernance',
      description: 'Stratégies et étapes pour implémenter une gouvernance IT efficace',
      order: 2,
      courseId: course1.id,
    },
  })

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Évaluation de la maturité',
        description: 'Comment évaluer le niveau de maturité de votre gouvernance IT',
        content: `# Évaluation de la maturité IT\n\nL'évaluation de la maturité permet de comprendre où se situe votre organisation...`,
        duration: 25,
        order: 1,
        type: 'TEXT',
        moduleId: module2.id,
      },
      {
        title: 'Plan de mise en œuvre',
        description: 'Élaborer un plan d\'action concret',
        content: `# Plan de mise en œuvre\n\n## Étapes clés\n\n1. Diagnostic initial\n2. Définition des objectifs\n3. Choix du framework...`,
        duration: 30,
        order: 2,
        type: 'TEXT',
        moduleId: module2.id,
      },
    ],
  })

  // Créer des modules pour le cours 2
  const module3 = await prisma.module.create({
    data: {
      title: 'Introduction à l\'Agilité',
      description: 'Découvrir les principes fondamentaux des méthodes agiles',
      order: 1,
      courseId: course2.id,
    },
  })

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Le Manifeste Agile',
        description: 'Les 4 valeurs et 12 principes de l\'agilité',
        content: `# Le Manifeste Agile\n\n## Les 4 valeurs\n\n1. Les individus et leurs interactions plus que les processus et les outils\n2. Des logiciels opérationnels plus qu'une documentation exhaustive\n3. La collaboration avec les clients plus que la négociation contractuelle\n4. L'adaptation au changement plus que le suivi d'un plan`,
        duration: 20,
        order: 1,
        type: 'TEXT',
        isPreview: true,
        moduleId: module3.id,
      },
      {
        title: 'Scrum en pratique',
        description: 'Les rôles, événements et artefacts Scrum',
        content: `# Scrum en pratique\n\n## Les 3 rôles\n\n- Product Owner\n- Scrum Master\n- Équipe de développement\n\n## Les événements\n\n- Sprint Planning\n- Daily Scrum\n- Sprint Review\n- Sprint Retrospective`,
        duration: 35,
        order: 2,
        type: 'TEXT',
        moduleId: module3.id,
      },
    ],
  })

  // Inscrire l'apprenant aux cours
  await prisma.enrollment.createMany({
    data: [
      { userId: learner.id, courseId: course1.id },
      { userId: learner.id, courseId: course2.id },
    ],
  })

  // Créer de la progression pour l'apprenant
  await prisma.courseProgress.create({
    data: {
      userId: learner.id,
      courseId: course1.id,
      progressPercent: 25,
      timeSpent: 45,
    },
  })

  await prisma.lessonProgress.create({
    data: {
      userId: learner.id,
      lessonId: lesson1_1.id,
      isCompleted: true,
      completedAt: new Date(),
      timeSpent: 900,
    },
  })

  // Attribuer un badge à l'apprenant
  await prisma.userBadge.create({
    data: {
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
