import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const CONTENT_PATH = path.join(process.cwd(), 'content/courses');

export interface DocMeta {
  title: string;
  description?: string;
  level?: string;
  duration?: string;
  category?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface DocContent {
  slug: string;
  meta: DocMeta;
  content: string;
  readingTime: string;
}

export interface NavItem {
  title: string;
  href?: string;
  icon?: string;
  items?: NavItem[];
}

/**
 * Get all MDX files from the content directory
 */
export function getAllDocSlugs(): string[] {
  const slugs: string[] = [];

  function walkDir(dir: string, basePath: string = '') {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath, path.join(basePath, file));
      } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
        const slug = path.join(basePath, file.replace(/\.(mdx|md)$/, ''));
        slugs.push(slug.replace(/\\/g, '/'));
      }
    }
  }

  walkDir(CONTENT_PATH);
  return slugs;
}

/**
 * Get document content by slug
 */
export function getDocBySlug(slug: string): DocContent | null {
  const slugPath = slug === '' ? 'index' : slug;

  // Try both .mdx and .md extensions
  const extensions = ['.mdx', '.md'];
  let filePath: string | null = null;
  let fileContent: string | null = null;

  for (const ext of extensions) {
    // Try direct path
    const directPath = path.join(CONTENT_PATH, `${slugPath}${ext}`);
    if (fs.existsSync(directPath)) {
      filePath = directPath;
      fileContent = fs.readFileSync(directPath, 'utf-8');
      break;
    }

    // Try index file in directory
    const indexPath = path.join(CONTENT_PATH, slugPath, `index${ext}`);
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
      fileContent = fs.readFileSync(indexPath, 'utf-8');
      break;
    }
  }

  if (!fileContent) {
    return null;
  }

  const { data, content } = matter(fileContent);
  const readTime = readingTime(content);

  return {
    slug,
    meta: data as DocMeta,
    content,
    readingTime: readTime.text,
  };
}

/**
 * Get all documents with their metadata
 */
export function getAllDocs(): DocContent[] {
  const slugs = getAllDocSlugs();
  const docs: DocContent[] = [];

  for (const slug of slugs) {
    const doc = getDocBySlug(slug);
    if (doc) {
      docs.push(doc);
    }
  }

  return docs;
}

/**
 * Get navigation structure from _meta.json files
 */
export function getNavigation(basePath: string = ''): NavItem[] {
  const fullPath = path.join(CONTENT_PATH, basePath);

  if (!fs.existsSync(fullPath)) {
    return [];
  }

  const metaPath = path.join(fullPath, '_meta.json');
  let meta: Record<string, unknown> = {};

  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    } catch {
      console.error(`Error parsing ${metaPath}`);
    }
  }

  const items: NavItem[] = [];

  // Process meta entries
  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === 'string') {
      // Simple entry: "key": "Title"
      items.push({
        title: value,
        href: `/docs/${basePath ? `${basePath}/` : ''}${key === 'index' ? '' : key}`.replace(/\/+/g, '/'),
      });
    } else if (typeof value === 'object' && value !== null) {
      const entry = value as { title?: string; description?: string; icon?: string; items?: Record<string, string> };

      if (entry.items) {
        // Section with nested items
        const nestedItems: NavItem[] = Object.entries(entry.items).map(([subKey, subTitle]) => ({
          title: subTitle,
          href: `/docs/${basePath ? `${basePath}/` : ''}${key}/${subKey}`.replace(/\/+/g, '/'),
        }));

        items.push({
          title: entry.title || key,
          icon: entry.icon,
          items: nestedItems,
        });
      } else {
        // Entry with metadata
        items.push({
          title: entry.title || key,
          href: `/docs/${basePath ? `${basePath}/` : ''}${key}`.replace(/\/+/g, '/'),
          icon: entry.icon,
        });
      }
    }
  }

  return items;
}

/**
 * Get full sidebar navigation
 */
export function getSidebarNavigation(): NavItem[] {
  const rootNav = getNavigation();
  const fullNav: NavItem[] = [];

  // Add main sections
  for (const item of rootNav) {
    if (item.items) {
      fullNav.push(item);
    } else {
      // Check if this is a directory with its own _meta.json
      const subNav = getNavigation(item.href?.replace('/docs/', '') || '');
      if (subNav.length > 0) {
        fullNav.push({
          ...item,
          items: subNav,
        });
      } else {
        fullNav.push(item);
      }
    }
  }

  return fullNav;
}

/**
 * Get breadcrumb items for a given slug
 */
export function getBreadcrumbs(slug: string): { title: string; href: string }[] {
  const parts = slug.split('/').filter(Boolean);
  const breadcrumbs: { title: string; href: string }[] = [];

  let currentPath = '';

  for (const part of parts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    const doc = getDocBySlug(currentPath);

    breadcrumbs.push({
      title: doc?.meta.title || part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      href: `/docs/${currentPath}`,
    });
  }

  return breadcrumbs;
}

/**
 * Get previous and next documents for navigation
 */
export function getDocNavigation(slug: string): { prev?: NavItem; next?: NavItem } {
  const allSlugs = getAllDocSlugs();
  const currentIndex = allSlugs.indexOf(slug);

  let prev: NavItem | undefined;
  let next: NavItem | undefined;

  if (currentIndex > 0) {
    const prevSlug = allSlugs[currentIndex - 1];
    const prevDoc = getDocBySlug(prevSlug);
    if (prevDoc) {
      prev = {
        title: prevDoc.meta.title,
        href: `/docs/${prevSlug}`,
      };
    }
  }

  if (currentIndex < allSlugs.length - 1) {
    const nextSlug = allSlugs[currentIndex + 1];
    const nextDoc = getDocBySlug(nextSlug);
    if (nextDoc) {
      next = {
        title: nextDoc.meta.title,
        href: `/docs/${nextSlug}`,
      };
    }
  }

  return { prev, next };
}
