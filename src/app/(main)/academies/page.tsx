import { Metadata } from 'next'
import { AcademyCard } from '@/components/academies'
import { academies } from '@/lib/academies'
import { GraduationCap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Training Academies - LMS Platform',
  description: 'Explore our specialized training academies covering observability, HPC, cloud infrastructure, and more.',
}

export default function AcademiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Training Academies
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Specialized learning paths designed by industry experts. Master cutting-edge technologies
            with hands-on courses and real-world projects.
          </p>
        </div>

        {/* Academy Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {academies.map((academy) => (
            <AcademyCard key={academy.id} academy={academy} />
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid gap-8 sm:grid-cols-3 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="text-4xl font-bold text-white mb-2">50+</div>
            <div className="text-slate-400">Expert-led Courses</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="text-4xl font-bold text-white mb-2">13</div>
            <div className="text-slate-400">Learning Paths</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="text-4xl font-bold text-white mb-2">1000+</div>
            <div className="text-slate-400">Active Learners</div>
          </div>
        </div>
      </div>
    </div>
  )
}
