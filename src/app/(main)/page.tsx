import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import {
  BookOpen,
  GraduationCap,
  Trophy,
  Users,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Shield,
  Zap,
  Target,
} from 'lucide-react'
import { formatDuration, getLevelLabel, getLevelColor } from '@/lib/utils'

export const metadata = {
  title: 'LMS Platform - Plateforme d\'apprentissage en ligne',
  description: 'Développez vos compétences avec notre plateforme de formation en ligne accessible et évolutive',
}

async function getFeaturedCourses() {
  return prisma.course.findMany({
    where: { isPublished: true, isFeatured: true },
    include: {
      author: { select: { firstName: true, lastName: true } },
      _count: { select: { enrollments: true } },
    },
    take: 6,
    orderBy: { createdAt: 'desc' },
  })
}

async function getStats() {
  const [coursesCount, usersCount, certificatesCount] = await Promise.all([
    prisma.course.count({ where: { isPublished: true } }),
    prisma.user.count(),
    prisma.certificate.count(),
  ])

  return { coursesCount, usersCount, certificatesCount }
}

export default async function HomePage() {
  const [featuredCourses, stats] = await Promise.all([
    getFeaturedCourses(),
    getStats(),
  ])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
              Plateforme 100% accessible
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Développez vos compétences avec notre{' '}
              <span className="text-yellow-300">LMS moderne</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Accédez à des formations de qualité, suivez votre progression en temps réel et obtenez des certifications reconnues. Apprenez à votre rythme, où que vous soyez.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="xl" asChild className="bg-white text-blue-700 hover:bg-blue-50">
                <Link href="/courses">
                  Explorer les cours
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="border-white text-white hover:bg-white/10">
                <Link href="/auth/register">
                  Créer un compte gratuit
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-3xl font-bold">{stats.coursesCount}+</div>
                <p className="text-muted-foreground">Cours disponibles</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-3xl font-bold">{stats.usersCount}+</div>
                <p className="text-muted-foreground">Apprenants</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Trophy className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-3xl font-bold">{stats.certificatesCount}+</div>
                <p className="text-muted-foreground">Certificats délivrés</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Star className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-3xl font-bold">4.8/5</div>
                <p className="text-muted-foreground">Satisfaction moyenne</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Pourquoi choisir notre plateforme ?</h2>
            <p className="text-muted-foreground">
              Une expérience d'apprentissage moderne, accessible et efficace conçue pour votre réussite.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="card-hover">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Apprentissage personnalisé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Progressez à votre rythme avec des parcours adaptés à votre niveau et vos objectifs. Reprenez où vous vous êtes arrêté.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Accessibilité garantie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Une plateforme conçue selon les standards WCAG 2.1 pour être accessible à tous, quel que soit le handicap.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Gamification motivante</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gagnez des badges, débloquez des récompenses et suivez votre progression pour rester motivé tout au long de votre parcours.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Cours populaires</h2>
              <p className="text-muted-foreground">Découvrez nos formations les plus appréciées</p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/courses">
                Voir tous les cours
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <Link key={course.id} href={`/courses/${course.slug}`} className="group block">
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt=""
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getLevelColor(course.level)}>
                        {getLevelLabel(course.level)}
                      </Badge>
                      {course.isFree && <Badge variant="success">Gratuit</Badge>}
                    </div>
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {course.author.firstName} {course.author.lastName}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(course.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course._count.enrollments}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Button asChild>
              <Link href="/courses">Voir tous les cours</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <GraduationCap className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à développer vos compétences ?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Rejoignez notre communauté d'apprenants et accédez à des centaines de cours de qualité.
            L'inscription est gratuite !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" asChild className="bg-white text-primary hover:bg-gray-100">
              <Link href="/auth/register">
                Commencer gratuitement
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="border-white hover:bg-white/10">
              <Link href="/courses">
                Explorer les cours
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials/Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Ce que vous obtenez</h2>
            <p className="text-muted-foreground">
              Tout ce dont vous avez besoin pour réussir votre apprentissage
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: CheckCircle,
                title: 'Accès illimité',
                description: 'Accédez à tous les cours autant de fois que vous le souhaitez',
              },
              {
                icon: Trophy,
                title: 'Certificats',
                description: 'Obtenez des certificats reconnus à chaque cours terminé',
              },
              {
                icon: Clock,
                title: 'À votre rythme',
                description: 'Apprenez quand vous voulez, où vous voulez',
              },
              {
                icon: Users,
                title: 'Communauté',
                description: 'Échangez avec les autres apprenants et formateurs',
              },
            ].map((item, index) => (
              <div key={index} className="text-center p-6">
                <item.icon className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
