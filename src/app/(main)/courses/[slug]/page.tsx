import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  Clock,
  Users,
  Play,
  CheckCircle,
  FileText,
  Video,
  HelpCircle,
  Star,
  Award,
  BarChart,
  Lock,
  Terminal,
} from 'lucide-react'
import { formatDuration, getLevelLabel, getLevelColor, getInitials } from '@/lib/utils'
import { EnrollButton } from '@/components/courses/enroll-button'
import { CourseContentOrganizer } from '@/components/courses/course-content-organizer'

interface CoursePageProps {
  params: { slug: string }
}

async function getCourse(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug, isPublished: true },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          bio: true,
          avatar: true,
        },
      },
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              quiz: {
                select: { id: true },
              },
              labAssignments: {
                select: {
                  id: true,
                  title: true,
                  difficulty: true,
                  estimatedTime: true,
                  points: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: { enrollments: true },
      },
    },
  })

  return course
}

export async function generateMetadata({ params }: CoursePageProps) {
  const course = await getCourse(params.slug)
  if (!course) return { title: 'Cours non trouvé' }

  return {
    title: course.title,
    description: course.shortDescription || course.description,
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = await getCourse(params.slug)
  if (!course) notFound()

  const session = await getServerSession(authOptions)

  let enrollment = null
  if (session) {
    enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
    })
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const totalQuizzes = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.quiz).length,
    0
  )
  const totalLabs = course.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((lacc, l) => lacc + (l.labAssignments?.length || 0), 0),
    0
  )
  const totalVideos = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.type === 'VIDEO').length,
    0
  )

  const tags = course.tags ? JSON.parse(course.tags) : []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6" aria-label="Fil d'Ariane">
        <ol className="flex items-center gap-2">
          <li><Link href="/courses" className="hover:text-foreground">Cours</Link></li>
          <li>/</li>
          <li><Link href={`/courses?category=${course.category}`} className="hover:text-foreground">{course.category}</Link></li>
          <li>/</li>
          <li className="text-foreground" aria-current="page">{course.title}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-8">
          {/* En-tête du cours */}
          <section>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary" className={getLevelColor(course.level)}>
                {getLevelLabel(course.level)}
              </Badge>
              <Badge variant="outline">{course.category}</Badge>
              {course.isFeatured && (
                <Badge className="bg-yellow-500">
                  <Star className="h-3 w-3 mr-1" aria-hidden="true" />
                  Populaire
                </Badge>
              )}
              {course.isFree && <Badge variant="success">Gratuit</Badge>}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {course.title}
            </h1>

            <p className="text-lg text-muted-foreground mb-6">
              {course.shortDescription || course.description}
            </p>

            {/* Statistiques */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{course._count.enrollments} inscrits</span>
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{formatDuration(course.duration)}</span>
              </span>
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{totalLessons} leçons</span>
              </span>
              {totalVideos > 0 && (
                <span className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>{totalVideos} vidéos</span>
                </span>
              )}
              {totalLabs > 0 && (
                <span className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>{totalLabs} labs</span>
                </span>
              )}
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{totalQuizzes} quiz</span>
              </span>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          {/* Onglets */}
          <Tabs defaultValue="organized" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="organized">Contenu</TabsTrigger>
              <TabsTrigger value="curriculum">Programme</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="instructor">Formateur</TabsTrigger>
            </TabsList>

            {/* Contenu organisé par type */}
            <TabsContent value="organized" className="space-y-4">
              <CourseContentOrganizer
                modules={course.modules}
                courseSlug={course.slug}
                isEnrolled={!!enrollment}
              />
            </TabsContent>

            {/* Programme du cours */}
            <TabsContent value="curriculum" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contenu du cours</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {course.modules.length} modules • {totalLessons} leçons • {formatDuration(course.duration)}
                  </p>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {course.modules.map((module, index) => (
                      <AccordionItem key={module.id} value={module.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-4 text-left">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <h3 className="font-medium">{module.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {module.lessons.length} leçons
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2 ml-12">
                            {module.lessons.map((lesson) => (
                              <li
                                key={lesson.id}
                                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-accent/50"
                              >
                                {lesson.type === 'VIDEO' ? (
                                  <Video className="h-4 w-4 text-blue-500" aria-hidden="true" />
                                ) : lesson.type === 'QUIZ' ? (
                                  <HelpCircle className="h-4 w-4 text-orange-500" aria-hidden="true" />
                                ) : lesson.type === 'ASSIGNMENT' || (lesson.labAssignments && lesson.labAssignments.length > 0) ? (
                                  <Terminal className="h-4 w-4 text-pink-500" aria-hidden="true" />
                                ) : (
                                  <FileText className="h-4 w-4 text-purple-500" aria-hidden="true" />
                                )}
                                <span className="flex-1">{lesson.title}</span>
                                {lesson.labAssignments && lesson.labAssignments.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">Lab</Badge>
                                )}
                                <span className="text-sm text-muted-foreground">
                                  {formatDuration(lesson.duration)}
                                </span>
                                {lesson.isPreview ? (
                                  <Badge variant="outline" className="text-xs">Aperçu</Badge>
                                ) : !enrollment ? (
                                  <Lock className="h-4 w-4 text-muted-foreground" aria-label="Contenu verrouillé" />
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Description détaillée */}
            <TabsContent value="description">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose-content">
                    <div dangerouslySetInnerHTML={{ __html: course.description.replace(/\n/g, '<br />') }} />
                  </div>

                  {/* Ce que vous apprendrez */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Ce que vous apprendrez</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        'Comprendre les concepts fondamentaux',
                        'Appliquer les meilleures pratiques',
                        'Développer des compétences pratiques',
                        'Obtenir une certification reconnue',
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Formateur */}
            <TabsContent value="instructor">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={course.author.avatar || undefined} />
                      <AvatarFallback className="text-lg">
                        {getInitials(course.author.firstName, course.author.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {course.author.firstName} {course.author.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">Formateur certifié</p>
                      {course.author.bio && (
                        <p className="mt-2 text-muted-foreground">{course.author.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Carte d'inscription */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-20">
            <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/20 to-primary/5">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt=""
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookOpen className="h-16 w-16 text-primary/40" aria-hidden="true" />
                </div>
              )}
              {!enrollment && course.modules[0]?.lessons[0]?.isPreview && (
                <Button
                  size="lg"
                  className="absolute inset-0 m-auto w-fit h-fit"
                  asChild
                >
                  <Link href={`/courses/${course.slug}/preview`}>
                    <Play className="mr-2 h-5 w-5" aria-hidden="true" />
                    Aperçu gratuit
                  </Link>
                </Button>
              )}
            </div>
            <CardContent className="p-6 space-y-6">
              {enrollment ? (
                <>
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-2" aria-hidden="true" />
                    <p className="font-medium text-green-600">Vous êtes inscrit !</p>
                  </div>
                  <Button className="w-full" size="lg" asChild>
                    <Link href={`/courses/${course.slug}/learn`}>
                      <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                      Continuer le cours
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center">
                    {course.isFree ? (
                      <p className="text-3xl font-bold text-green-600">Gratuit</p>
                    ) : (
                      <p className="text-3xl font-bold">{course.price}€</p>
                    )}
                  </div>
                  <EnrollButton courseId={course.id} courseSlug={course.slug} />
                </>
              )}

              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Ce cours inclut :</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    {formatDuration(course.duration)} de contenu
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-500" aria-hidden="true" />
                    {totalLessons} leçons
                  </li>
                  {totalVideos > 0 && (
                    <li className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-blue-500" aria-hidden="true" />
                      {totalVideos} vidéos
                    </li>
                  )}
                  {totalLabs > 0 && (
                    <li className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-pink-500" aria-hidden="true" />
                      {totalLabs} labs pratiques
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-orange-500" aria-hidden="true" />
                    {totalQuizzes} quiz d'évaluation
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" aria-hidden="true" />
                    Certificat de réussite
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-green-500" aria-hidden="true" />
                    Suivi de progression
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

// Users icon is imported from lucide-react
