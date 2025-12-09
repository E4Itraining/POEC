import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AcademyCard } from '@/components/academies/academy-card'
import { academies } from '@/lib/academies'
import {
  ArrowRight,
  Factory,
  Beaker,
  Terminal,
  GraduationCap,
  BookOpen,
  Route,
  Code2,
} from 'lucide-react'

export const metadata = {
  title: 'Erythix Campus - Formation DevOps & Infrastructure',
  description: 'L\'expertise terrain, pas le buzzword. Formations observabilité, HPC et infrastructures souveraines. 40% théorie, 60% labs.',
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20">
              <Factory className="h-3 w-3 mr-1" />
              15 ans d'expertise industrie
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
              L'expertise terrain,{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                pas le buzzword.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              Depuis 15 ans dans l'industrie — <span className="text-white font-medium">Airbus, Total, GrDF</span> — on sait ce qui fonctionne vraiment sur le terrain. Erythix Academy transmet cette expertise à vos équipes : observabilité, HPC, infrastructures souveraines.
            </p>

            {/* Stats badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                <span className="text-white font-semibold">3</span>
                <span className="text-slate-400">programmes</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <GraduationCap className="h-4 w-4 text-blue-400" />
                <span className="text-white font-semibold">40+</span>
                <span className="text-slate-400">formations</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <Code2 className="h-4 w-4 text-green-400" />
                <span className="text-white font-semibold">100%</span>
                <span className="text-slate-400">open-source</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" asChild className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
                <Link href="/academies">
                  Explorer les programmes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 hover:border-white/30">
                <Link href="/auth/register">
                  Créer un compte
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Academy Cards Section */}
      <section className="py-16 md:py-24 bg-slate-950 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="container mx-auto px-4 relative">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Monitoring360 */}
            <AcademyCard
              academy={{
                ...academies.find(a => a.slug === 'monitoring360')!,
                description: 'Observabilité complète : métriques, logs, traces, OpenTelemetry. La stack complète pour une visibilité 360° de vos systèmes.',
              }}
              locale="fr"
            />

            {/* VictoriaMetrics */}
            <AcademyCard
              academy={{
                ...academies.find(a => a.slug === 'victoriametrics')!,
                description: 'Du Foundation à l\'Expert, en partenariat officiel avec VictoriaMetrics. Architecture, scaling, télémétrie industrielle.',
              }}
              locale="fr"
              featured
            />

            {/* CIQ Stack */}
            <AcademyCard
              academy={{
                ...academies.find(a => a.slug === 'ciq-stack')!,
                description: 'Rocky Linux, Warewulf, Apptainer, HPC souverain. Construisez une infrastructure souveraine du provisioning au calcul.',
              }}
              locale="fr"
            />
          </div>
        </div>
      </section>

      {/* Method Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/20">
                <Beaker className="h-3 w-3 mr-1" />
                Notre méthode
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                40% théorie, 60% labs
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Chaque formation s'appuie sur des environnements réels, pas des slides. Vos équipes repartent avec des compétences immédiatement applicables.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-6 hover:border-white/20 transition-all">
                <div className="relative mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Terminal className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Environnements réels</h3>
                <p className="text-sm text-slate-400">
                  Labs sur infrastructure de production, pas des VM éphémères.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-6 hover:border-white/20 transition-all">
                <div className="relative mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                    <Factory className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Cas industriels</h3>
                <p className="text-sm text-slate-400">
                  Retours d'expérience terrain sur des projets grands comptes.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-6 hover:border-white/20 transition-all">
                <div className="relative mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Route className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Parcours structurés</h3>
                <p className="text-sm text-slate-400">
                  Progression claire du débutant à l'expert certifié.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5" />

        <div className="container mx-auto px-4 text-center relative">
          <GraduationCap className="h-16 w-16 mx-auto mb-6 text-cyan-400 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à former vos équipes ?
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Contactez-nous pour un parcours personnalisé ou inscrivez-vous directement aux formations disponibles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" asChild className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
              <Link href="/academies">
                Voir les programmes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 hover:border-white/30">
              <Link href="/contact">
                Nous contacter
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
