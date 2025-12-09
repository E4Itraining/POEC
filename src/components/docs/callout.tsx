'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, Info, Lightbulb, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ReactNode } from 'react';

type CalloutType = 'info' | 'tip' | 'warning' | 'danger' | 'success' | 'note';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
  className?: string;
}

const calloutConfig: Record<CalloutType, { icon: ReactNode; colors: string; defaultTitle: string }> = {
  info: {
    icon: <Info className="h-5 w-5" />,
    colors: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    defaultTitle: 'Information',
  },
  tip: {
    icon: <Lightbulb className="h-5 w-5" />,
    colors: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    defaultTitle: 'Astuce',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    colors: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    defaultTitle: 'Attention',
  },
  danger: {
    icon: <XCircle className="h-5 w-5" />,
    colors: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    defaultTitle: 'Danger',
  },
  success: {
    icon: <CheckCircle className="h-5 w-5" />,
    colors: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
    defaultTitle: 'Succès',
  },
  note: {
    icon: <AlertCircle className="h-5 w-5" />,
    colors: 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200',
    defaultTitle: 'Note',
  },
};

export function Callout({ type = 'info', title, children, className }: CalloutProps) {
  const config = calloutConfig[type];

  return (
    <div
      className={cn(
        'my-6 flex gap-4 rounded-lg border p-4',
        config.colors,
        className
      )}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold mb-1">{title}</p>
        )}
        <div className="text-sm [&>p]:mb-2 [&>p:last-child]:mb-0">{children}</div>
      </div>
    </div>
  );
}

export default Callout;
