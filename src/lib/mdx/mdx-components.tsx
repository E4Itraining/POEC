'use client';

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import Link from 'next/link';
import Image from 'next/image';
import { ComponentProps, ReactNode } from 'react';
import { Callout } from '@/components/docs/callout';
import { Tabs, Tab } from '@/components/docs/tabs';
import { Steps, Step } from '@/components/docs/steps';
import { Card, CardGrid } from '@/components/docs/card';
import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { DocNavigation } from '@/components/docs/doc-navigation';

// Custom components for MDX
const components = {
  // Documentation components
  Callout,
  Tabs,
  Tab,
  Steps,
  Step,
  Card,
  CardGrid,
  CodeBlock,
  InlineCode,
  DocNavigation,

  // HTML element overrides
  h1: (props: ComponentProps<'h1'>) => (
    <h1
      className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4 mt-8 first:mt-0"
      {...props}
    />
  ),
  h2: (props: ComponentProps<'h2'>) => {
    const id = typeof props.children === 'string'
      ? props.children.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      : '';
    return (
      <h2
        id={id}
        className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-3 mt-10 scroll-mt-20 border-b border-gray-200 dark:border-gray-800 pb-2"
        {...props}
      />
    );
  },
  h3: (props: ComponentProps<'h3'>) => {
    const id = typeof props.children === 'string'
      ? props.children.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      : '';
    return (
      <h3
        id={id}
        className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-8 scroll-mt-20"
        {...props}
      />
    );
  },
  h4: (props: ComponentProps<'h4'>) => (
    <h4
      className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-6"
      {...props}
    />
  ),
  p: (props: ComponentProps<'p'>) => (
    <p className="text-gray-600 dark:text-gray-300 leading-7 mb-4" {...props} />
  ),
  a: ({ href, children, ...props }: ComponentProps<'a'>) => {
    const isExternal = href?.startsWith('http');
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 dark:text-violet-400 hover:underline"
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href || '#'}
        className="text-violet-600 dark:text-violet-400 hover:underline"
        {...props}
      >
        {children}
      </Link>
    );
  },
  ul: (props: ComponentProps<'ul'>) => (
    <ul className="list-disc list-inside mb-4 space-y-2 text-gray-600 dark:text-gray-300" {...props} />
  ),
  ol: (props: ComponentProps<'ol'>) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-600 dark:text-gray-300" {...props} />
  ),
  li: (props: ComponentProps<'li'>) => (
    <li className="leading-7" {...props} />
  ),
  blockquote: (props: ComponentProps<'blockquote'>) => (
    <blockquote
      className="border-l-4 border-violet-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4"
      {...props}
    />
  ),
  table: (props: ComponentProps<'table'>) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props} />
    </div>
  ),
  thead: (props: ComponentProps<'thead'>) => (
    <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
  ),
  th: (props: ComponentProps<'th'>) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
      {...props}
    />
  ),
  td: (props: ComponentProps<'td'>) => (
    <td
      className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-gray-200 dark:border-gray-700" />,
  pre: ({ children, ...props }: ComponentProps<'pre'>) => {
    return (
      <pre
        className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm my-4"
        {...props}
      >
        {children}
      </pre>
    );
  },
  code: ({ children, className, ...props }: ComponentProps<'code'>) => {
    // Check if this is inline code or a code block
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm font-mono text-violet-600 dark:text-violet-400"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={`${className} text-gray-100`} {...props}>
        {children}
      </code>
    );
  },
  img: ({ src, alt }: ComponentProps<'img'>) => (
    <span className="block my-6">
      <Image
        src={src || ''}
        alt={alt || ''}
        width={800}
        height={400}
        className="rounded-lg border border-gray-200 dark:border-gray-700"
      />
    </span>
  ),
  strong: (props: ComponentProps<'strong'>) => (
    <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />
  ),
  em: (props: ComponentProps<'em'>) => (
    <em className="italic" {...props} />
  ),
};

interface MdxContentProps {
  source: MDXRemoteSerializeResult;
}

export function MdxContent({ source }: MdxContentProps) {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <MDXRemote {...source} components={components} />
    </div>
  );
}

export { components as mdxComponents };
export default MdxContent;
