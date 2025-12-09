'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavLink {
  title: string;
  href: string;
}

interface DocNavigationProps {
  prev?: NavLink;
  next?: NavLink;
  className?: string;
}

export function DocNavigation({ prev, next, className }: DocNavigationProps) {
  if (!prev && !next) return null;

  return (
    <nav
      className={cn(
        'mt-12 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6',
        className
      )}
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <div className="flex flex-col items-start">
            <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Précédent
            </span>
            <span className="font-medium">{prev.title}</span>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.href}
          className="group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Suivant
            </span>
            <span className="font-medium">{next.title}</span>
          </div>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}

export default DocNavigation;
