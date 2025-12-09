'use client';

import { cn } from '@/lib/utils';
import { ReactNode, Children, isValidElement, cloneElement } from 'react';

interface StepsProps {
  children: ReactNode;
  className?: string;
}

export function Steps({ children, className }: StepsProps) {
  const childArray = Children.toArray(children).filter(isValidElement);

  return (
    <div className={cn('my-6 ml-4 border-l-2 border-gray-200 dark:border-gray-700', className)}>
      {childArray.map((child, index) => {
        if (isValidElement(child) && child.type === Step) {
          return cloneElement(child as React.ReactElement<StepProps>, {
            stepNumber: index + 1,
          });
        }
        return child;
      })}
    </div>
  );
}

interface StepProps {
  title: string;
  children?: ReactNode;
  stepNumber?: number;
  className?: string;
}

export function Step({ title, children, stepNumber, className }: StepProps) {
  return (
    <div className={cn('relative pb-8 pl-8 last:pb-0', className)}>
      <div className="absolute -left-[13px] flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
        {stepNumber}
      </div>
      <div className="pt-0.5">
        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h4>
        {children && (
          <div className="text-sm text-gray-600 dark:text-gray-400 [&>p]:mb-2 [&>p:last-child]:mb-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default Steps;
