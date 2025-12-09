'use client';

import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { DocContent, NavItem } from '@/lib/mdx/content';
import { MdxContent } from '@/lib/mdx/mdx-components';
import { DocSidebar } from '@/components/docs/doc-sidebar';
import { DocBreadcrumb } from '@/components/docs/doc-breadcrumb';
import { DocNavigation } from '@/components/docs/doc-navigation';
import { TableOfContents } from '@/components/docs/table-of-contents';
import { DocSearch } from '@/components/docs/doc-search';
import { Clock, Calendar, Tag, Edit, Github } from 'lucide-react';
import gitConfig from '@/../../content/config.json';

interface DocPageClientProps {
  doc: DocContent;
  mdxSource: MDXRemoteSerializeResult;
  sidebarNav: NavItem[];
  breadcrumbs: { title: string; href: string }[];
  prevNext: {
    prev?: NavItem;
    next?: NavItem;
  };
  slug?: string;
}

export function DocPageClient({
  doc,
  mdxSource,
  sidebarNav,
  breadcrumbs,
  prevNext,
  slug = '',
}: DocPageClientProps) {
  // Generate GitHub edit URL
  const getEditUrl = () => {
    if (!gitConfig.features?.editOnGitHub || !gitConfig.git) return null;
    const filePath = slug ? `${slug}.mdx` : 'index.mdx';
    return `${gitConfig.git.editUrl}/${filePath}`;
  };

  const editUrl = getEditUrl();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Top bar with search */}
      <div className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex-1 max-w-xs">
              <DocSearch />
            </div>
            <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {doc.meta.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {doc.meta.duration}
                </span>
              )}
              {doc.readingTime && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {doc.readingTime}
                </span>
              )}
              {editUrl && (
                <a
                  href={editUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
                >
                  <Github className="h-4 w-4" />
                  Edit on GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <DocSidebar items={sidebarNav} className="pt-8" />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 py-8">
            {/* Breadcrumb */}
            {breadcrumbs.length > 0 && (
              <DocBreadcrumb items={breadcrumbs} className="mb-6" />
            )}

            {/* Article header */}
            <header className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {doc.meta.title}
              </h1>
              {doc.meta.description && (
                <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
                  {doc.meta.description}
                </p>
              )}

              {/* Tags */}
              {doc.meta.tags && doc.meta.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {doc.meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/30 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta info bar */}
              {(doc.meta.level || doc.meta.category) && (
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-4">
                  {doc.meta.level && (
                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                      Niveau: {doc.meta.level}
                    </span>
                  )}
                  {doc.meta.category && (
                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                      {doc.meta.category}
                    </span>
                  )}
                </div>
              )}
            </header>

            {/* Article content */}
            <article className="prose prose-gray dark:prose-invert max-w-none">
              <MdxContent source={mdxSource} />
            </article>

            {/* Prev/Next navigation */}
            <DocNavigation
              prev={prevNext.prev?.href ? { title: prevNext.prev.title, href: prevNext.prev.href } : undefined}
              next={prevNext.next?.href ? { title: prevNext.next.title, href: prevNext.next.href } : undefined}
            />
          </main>

          {/* Table of contents */}
          <aside className="hidden xl:block w-64 shrink-0">
            <TableOfContents className="pt-8" />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default DocPageClient;
