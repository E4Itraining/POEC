'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronRight, BookOpen, Building, Zap, Folder, FileText, GraduationCap } from 'lucide-react';

interface NavItem {
  title: string;
  href?: string;
  icon?: string;
  items?: NavItem[];
}

interface DocSidebarProps {
  items: NavItem[];
  className?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  book: <BookOpen className="h-4 w-4" />,
  building: <Building className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
  folder: <Folder className="h-4 w-4" />,
  file: <FileText className="h-4 w-4" />,
  graduation: <GraduationCap className="h-4 w-4" />,
};

function NavSection({ item, level = 0 }: { item: NavItem; level?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(
    item.items?.some((child) => pathname.includes(child.href || '')) ||
    pathname === item.href
  );

  const hasChildren = item.items && item.items.length > 0;
  const isActive = pathname === item.href;
  const Icon = item.icon ? iconMap[item.icon] : null;

  if (hasChildren) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            level === 0 ? 'font-semibold' : 'font-medium',
            isOpen && 'text-gray-900 dark:text-gray-100'
          )}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          <span className="flex items-center gap-2">
            {Icon}
            {item.title}
          </span>
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-90'
            )}
          />
        </button>
        {isOpen && (
          <div className="mt-1">
            {item.items?.map((child, index) => (
              <NavSection key={index} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
        )}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        {Icon}
        {item.title}
      </Link>
    );
  }

  return (
    <span
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-sm text-gray-400 dark:text-gray-500',
        level === 0 && 'font-semibold uppercase text-xs tracking-wider mt-4 first:mt-0'
      )}
      style={{ paddingLeft: `${level * 12 + 12}px` }}
    >
      {Icon}
      {item.title}
    </span>
  );
}

export function DocSidebar({ items, className }: DocSidebarProps) {
  return (
    <nav className={cn('w-64 shrink-0', className)}>
      <div className="sticky top-20 -ml-3 h-[calc(100vh-5rem)] overflow-y-auto pb-10">
        {items.map((item, index) => (
          <NavSection key={index} item={item} />
        ))}
      </div>
    </nav>
  );
}

export default DocSidebar;
