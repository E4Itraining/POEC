'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ReactNode } from 'react';
import {
  Building,
  Zap,
  Target,
  Shield,
  RefreshCw,
  BookOpen,
  Code,
  FileText,
  Video,
  CheckSquare,
  FlaskConical,
  Lightbulb,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  building: Building,
  zap: Zap,
  target: Target,
  shield: Shield,
  'refresh-cw': RefreshCw,
  book: BookOpen,
  code: Code,
  file: FileText,
  video: Video,
  check: CheckSquare,
  lab: FlaskConical,
  lightbulb: Lightbulb,
};

interface CardProps {
  title: string;
  href?: string;
  icon?: string;
  children?: ReactNode;
  className?: string;
}

export function Card({ title, href, icon, children, className }: CardProps) {
  const IconComponent = icon ? iconMap[icon] || BookOpen : BookOpen;

  const content = (
    <div
      className={cn(
        'group relative flex flex-col rounded-lg border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-900 p-5',
        'hover:border-violet-300 dark:hover:border-violet-700',
        'hover:shadow-md transition-all duration-200',
        href && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {title}
            {href && (
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
            )}
          </h3>
          {children && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {children}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

interface CardGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function CardGrid({ children, columns = 2, className }: CardGridProps) {
  const colsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('my-6 grid gap-4', colsClass[columns], className)}>
      {children}
    </div>
  );
}

export default Card;
