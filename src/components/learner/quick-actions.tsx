'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Plus,
  X,
  BookOpen,
  Trophy,
  MessageSquare,
  Settings,
  HelpCircle,
} from 'lucide-react'

interface QuickAction {
  icon: typeof Plus
  label: string
  href: string
  color: string
}

const actions: QuickAction[] = [
  {
    icon: BookOpen,
    label: 'Parcourir les cours',
    href: '/courses',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Trophy,
    label: 'Mes achievements',
    href: '/achievements',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: MessageSquare,
    label: 'Support',
    href: '/support',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Settings,
    label: 'Paramètres',
    href: '/settings',
    color: 'from-purple-500 to-pink-500',
  },
]

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      {/* Action buttons */}
      <div
        className={cn(
          'absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300',
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                'group flex items-center gap-3 transition-all duration-300',
                isOpen
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-4'
              )}
              style={{ transitionDelay: isOpen ? `${index * 50}ms` : '0ms' }}
              onClick={() => setIsOpen(false)}
            >
              {/* Label */}
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {action.label}
              </span>

              {/* Icon */}
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  'bg-gradient-to-br shadow-lg transition-transform hover:scale-110',
                  action.color
                )}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center',
          'bg-gradient-to-br from-primary to-cyan-500 text-white shadow-xl',
          'transition-all duration-300 hover:shadow-2xl hover:scale-105',
          'glow-primary',
          isOpen && 'rotate-45'
        )}
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu rapide'}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
