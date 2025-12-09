'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n'
import {
  ArrowRight,
  Factory,
  Beaker,
  Terminal,
  GraduationCap,
  BookOpen,
  Route,
  Brain,
  Server,
  Network,
  Shield,
  Users,
  Award,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Lightbulb,
  Target,
  Repeat,
  Play,
  Clock,
  Building2,
  Euro,
  Headphones,
  Globe,
} from 'lucide-react'

// Video component for PeerTube integration
function VideoEmbed({ videoId, title }: { videoId?: string; title: string }) {
  if (!videoId) {
    return (
      <div className="aspect-video bg-slate-800/50 rounded-xl border border-white/10 flex items-center justify-center">
        <div className="text-center">
          <Play className="h-16 w-16 text-cyan-400/50 mx-auto mb-4" />
          <p className="text-slate-400">{title}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
      <iframe
        src={`https://tube.erythix.com/videos/embed/${videoId}`}
        title={title}
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-popups"
        className="w-full h-full"
      />
    </div>
  )
}

export default function HomePage() {
  const { t } = useI18n()
  const hp = t.homepage

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
              {hp.hero.badge}
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
              {hp.hero.title}
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-6 max-w-3xl mx-auto leading-relaxed">
              {hp.hero.subtitle}
            </p>

            <p className="text-base md:text-lg text-cyan-400 font-medium mb-10">
              {hp.hero.tagline}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" asChild className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
                <Link href="/academies">
                  {hp.hero.cta.explore}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 hover:border-white/30">
                <Link href="/contact">
                  {hp.hero.cta.diagnostic}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Golden Triangle Section */}
      <section className="py-16 md:py-24 bg-slate-950 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/20">
              <Target className="h-3 w-3 mr-1" />
              {hp.triangle.badge}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {hp.triangle.title}
            </h2>
            <p className="text-lg text-slate-400 mb-4">
              {hp.triangle.intro}
            </p>
            <p className="text-base text-slate-500">
              {hp.triangle.context}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* AI Observability */}
            <div className="group relative rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-950/30 to-slate-950/50 p-6 hover:border-cyan-500/40 transition-all">
              <div className="relative mb-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Brain className="h-7 w-7 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{hp.triangle.aiObs.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {hp.triangle.aiObs.description}
              </p>
            </div>

            {/* HPC Souverain */}
            <div className="group relative rounded-2xl border border-orange-500/20 bg-gradient-to-b from-orange-950/30 to-slate-950/50 p-6 hover:border-orange-500/40 transition-all">
              <div className="relative mb-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                  <Server className="h-7 w-7 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{hp.triangle.hpc.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {hp.triangle.hpc.description}
              </p>
            </div>

            {/* IT/OT Convergence */}
            <div className="group relative rounded-2xl border border-green-500/20 bg-gradient-to-b from-green-950/30 to-slate-950/50 p-6 hover:border-green-500/40 transition-all">
              <div className="relative mb-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Network className="h-7 w-7 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{hp.triangle.itot.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {hp.triangle.itot.description}
              </p>
            </div>
          </div>

          <p className="text-center text-lg text-white/80 max-w-3xl mx-auto">
            {hp.triangle.conclusion}
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/20">
                <Lightbulb className="h-3 w-3 mr-1" />
                {hp.philosophy.badge}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {hp.philosophy.title}
              </h2>
              <p className="text-lg text-slate-400 mb-4">
                {hp.philosophy.intro}
              </p>
              <p className="text-base text-slate-500 mb-8">
                {hp.philosophy.approach}
              </p>
              <p className="text-lg font-semibold text-white">
                {hp.philosophy.convictionsTitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Comprendre */}
              <div className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-6 hover:border-white/20 transition-all">
                <div className="relative mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{hp.philosophy.understand.title}</h3>
                <p className="text-sm text-slate-400">
                  {hp.philosophy.understand.description}
                </p>
              </div>

              {/* Pratiquer */}
              <div className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-6 hover:border-white/20 transition-all">
                <div className="relative mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                    <Terminal className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{hp.philosophy.practice.title}</h3>
                <p className="text-sm text-slate-400">
                  {hp.philosophy.practice.description}
                </p>
              </div>

              {/* Transmettre */}
              <div className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-6 hover:border-white/20 transition-all">
                <div className="relative mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Repeat className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{hp.philosophy.transmit.title}</h3>
                <p className="text-sm text-slate-400">
                  {hp.philosophy.transmit.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators Section */}
      <section className="py-16 md:py-24 bg-slate-900 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
              <Award className="h-3 w-3 mr-1" />
              {hp.differentiators.badge}
            </Badge>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            {/* Field Expertise */}
            <div className="flex flex-col md:flex-row gap-6 items-start p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/50 to-slate-950/50">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Factory className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">{hp.differentiators.fieldExpertise.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {hp.differentiators.fieldExpertise.description}
                </p>
              </div>
            </div>

            {/* Sovereignty */}
            <div className="flex flex-col md:flex-row gap-6 items-start p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/50 to-slate-950/50">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">{hp.differentiators.sovereignty.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {hp.differentiators.sovereignty.description}
                </p>
              </div>
            </div>

            {/* Pedagogy */}
            <div className="flex flex-col md:flex-row gap-6 items-start p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/50 to-slate-950/50">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Route className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">{hp.differentiators.pedagogy.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {hp.differentiators.pedagogy.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-950 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
              <GraduationCap className="h-3 w-3 mr-1" />
              {hp.programs.badge}
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* AI Observability Academy */}
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 to-slate-950 p-6 hover:border-cyan-500/40 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{hp.programs.aiObs.title}</h3>
                  <p className="text-sm text-slate-400">{hp.programs.aiObs.subtitle}</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  {hp.programs.aiObs.fundamentals}
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  {hp.programs.aiObs.llm}
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  {hp.programs.aiObs.mlProd}
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  {hp.programs.aiObs.euAct}
                </li>
              </ul>
            </div>

            {/* CIQ Stack Professional */}
            <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-b from-orange-950/20 to-slate-950 p-6 hover:border-orange-500/40 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{hp.programs.ciq.title}</h3>
                  <p className="text-sm text-slate-400">{hp.programs.ciq.subtitle}</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  {hp.programs.ciq.rocky}
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  {hp.programs.ciq.hpc}
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  {hp.programs.ciq.hpcAi}
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  {hp.programs.ciq.security}
                </li>
              </ul>
            </div>

            {/* Monitoring 360 */}
            <div className="rounded-2xl border border-green-500/20 bg-gradient-to-b from-green-950/20 to-slate-950 p-6 hover:border-green-500/40 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Network className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{hp.programs.m360.title}</h3>
                  <p className="text-sm text-slate-400">{hp.programs.m360.subtitle}</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {hp.programs.m360.foundations}
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {hp.programs.m360.vm}
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {hp.programs.m360.itot}
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {hp.programs.m360.otel}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16 md:py-24 bg-slate-950 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/20">
              <Award className="h-3 w-3 mr-1" />
              {hp.certifications.badge}
            </Badge>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {hp.certifications.intro}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Observability Engineer */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950 p-5 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-cyan-400 font-medium">{hp.certifications.obsEngineer.duration}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{hp.certifications.obsEngineer.title}</h3>
              <p className="text-sm text-slate-400">{hp.certifications.obsEngineer.modules}</p>
            </div>

            {/* AI/ML Production Specialist */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950 p-5 hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-orange-400 font-medium">{hp.certifications.aiMlSpecialist.duration}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{hp.certifications.aiMlSpecialist.title}</h3>
              <p className="text-sm text-slate-400">{hp.certifications.aiMlSpecialist.modules}</p>
            </div>

            {/* Industrial AI Architect */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950 p-5 hover:border-green-500/30 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">{hp.certifications.industrialArchitect.duration}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{hp.certifications.industrialArchitect.title}</h3>
              <p className="text-sm text-slate-400">{hp.certifications.industrialArchitect.modules}</p>
            </div>

            {/* Sovereign Infrastructure Engineer */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950 p-5 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-purple-400 font-medium">{hp.certifications.sovereignEngineer.duration}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{hp.certifications.sovereignEngineer.title}</h3>
              <p className="text-sm text-slate-400">{hp.certifications.sovereignEngineer.modules}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTO Advocate Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
              <Headphones className="h-3 w-3 mr-1" />
              {hp.ctoAdvocate.badge}
            </Badge>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              {hp.ctoAdvocate.intro}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Diagnostic */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-6 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-cyan-400 font-medium">{hp.ctoAdvocate.diagnostic.duration}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{hp.ctoAdvocate.diagnostic.title}</h3>
              <p className="text-sm text-slate-400">{hp.ctoAdvocate.diagnostic.description}</p>
            </div>

            {/* Integration */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-6 hover:border-orange-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                  <Beaker className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-orange-400 font-medium">{hp.ctoAdvocate.integration.duration}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{hp.ctoAdvocate.integration.title}</h3>
              <p className="text-sm text-slate-400">{hp.ctoAdvocate.integration.description}</p>
            </div>

            {/* Continuous */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-6 hover:border-green-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Repeat className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-green-400 font-medium">{hp.ctoAdvocate.continuous.duration}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{hp.ctoAdvocate.continuous.title}</h3>
              <p className="text-sm text-slate-400">{hp.ctoAdvocate.continuous.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Organizations Section */}
      <section className="py-16 md:py-24 bg-slate-900 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
              <Building2 className="h-3 w-3 mr-1" />
              {hp.organizations.badge}
            </Badge>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Financing */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Euro className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{hp.organizations.financing.title}</h3>
              </div>
              <p className="text-slate-400 mb-4 leading-relaxed">
                {hp.organizations.financing.description}
              </p>
              <p className="text-slate-400 leading-relaxed">
                {hp.organizations.financing.attestation}
              </p>
            </div>

            {/* Formats */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{hp.organizations.formats.title}</h3>
              </div>
              <ul className="space-y-2">
                {hp.organizations.formats.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-400">
                    <CheckCircle2 className="h-4 w-4 text-orange-400 mt-1 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact - Full width */}
            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/50 to-slate-950/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{hp.organizations.contact.title}</h3>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {hp.organizations.contact.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section - PeerTube Integration */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-950 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/20">
                <Play className="h-3 w-3 mr-1" />
                Erythix Academy
              </Badge>
            </div>
            <VideoEmbed title="Presentation Erythix Academy" />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5" />

        <div className="container mx-auto px-4 text-center relative">
          <GraduationCap className="h-16 w-16 mx-auto mb-6 text-cyan-400 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            {hp.cta.title}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" asChild className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
              <Link href="/academies">
                {hp.cta.exploreCatalog}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50">
              <Link href="/contact">
                {hp.cta.bookDiagnostic}
                <MessageSquare className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 hover:border-white/30">
              <Link href="/contact">
                {hp.cta.contactUs}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Brand */}
      <footer className="py-8 bg-slate-950 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Globe className="h-4 w-4" />
            <span>{hp.footer.brand}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
