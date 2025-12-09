'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface DocBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function DocBreadcrumb({ items, className }: DocBreadcrumbProps) {
  return (
    <nav className={cn('flex items-center text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        <li>
          <Link
            href="/docs"
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Accueil docs</span>
          </Link>
        </li>

        {items.map((item, index) => (
          <Fragment key={item.href}>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" />
            </li>
            <li>
              {index === items.length - 1 ? (
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {item.title}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  {item.title}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

export default DocBreadcrumb;
