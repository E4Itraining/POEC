import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { getDocBySlug, getBreadcrumbs, getDocNavigation, getSidebarNavigation } from '@/lib/mdx/content';
import { DocPageClient } from './doc-page-client';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.join('/') || '';
  const doc = getDocBySlug(slug);

  if (!doc) {
    return {
      title: 'Documentation - Erythix Campus',
    };
  }

  return {
    title: `${doc.meta.title} - Erythix Campus`,
    description: doc.meta.description || 'Documentation Erythix Campus',
  };
}

export default async function DocsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.join('/') || '';
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  // Serialize MDX content
  const mdxSource = await serialize(doc.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      ],
    },
  });

  // Get navigation data
  const sidebarNav = getSidebarNavigation();
  const breadcrumbs = getBreadcrumbs(slug);
  const { prev, next } = getDocNavigation(slug);

  return (
    <DocPageClient
      doc={doc}
      mdxSource={mdxSource}
      sidebarNav={sidebarNav}
      breadcrumbs={breadcrumbs}
      prevNext={{ prev, next }}
      slug={slug}
    />
  );
}
