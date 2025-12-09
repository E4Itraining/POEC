'use client';

import { cn } from '@/lib/utils';
import { Check, Copy, Terminal } from 'lucide-react';
import { useState, ReactNode } from 'react';

interface CodeBlockProps {
  children: ReactNode;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlight?: string;
  className?: string;
}

export function CodeBlock({
  children,
  language,
  filename,
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const code = typeof children === 'string' ? children : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('my-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {(filename || language) && (
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Terminal className="h-4 w-4" />
            <span>{filename || language}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span>Copié!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>
      )}
      <div className="relative">
        <pre className={cn(
          'overflow-x-auto p-4 text-sm',
          'bg-gray-50 dark:bg-gray-900',
          showLineNumbers && 'pl-12'
        )}>
          {showLineNumbers && (
            <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-end pr-2 pt-4 text-xs text-gray-400 dark:text-gray-600 select-none border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
              {code.split('\n').map((_, i) => (
                <div key={i} className="leading-6">{i + 1}</div>
              ))}
            </div>
          )}
          <code className={cn(
            'block font-mono',
            language && `language-${language}`
          )}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
}

interface InlineCodeProps {
  children: ReactNode;
  className?: string;
}

export function InlineCode({ children, className }: InlineCodeProps) {
  return (
    <code
      className={cn(
        'rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm font-mono',
        'text-violet-600 dark:text-violet-400',
        className
      )}
    >
      {children}
    </code>
  );
}

export default CodeBlock;
