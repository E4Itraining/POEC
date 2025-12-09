'use client';

import { cn } from '@/lib/utils';
import { createContext, useContext, useState, ReactNode, Children, isValidElement } from 'react';

interface TabsContextType {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps {
  items: string[];
  children: ReactNode;
  defaultIndex?: number;
  className?: string;
}

export function Tabs({ items, children, defaultIndex = 0, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultIndex);

  const childArray = Children.toArray(children).filter(isValidElement);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('my-6', className)}>
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={cn(
                'px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                'border-b-2 -mb-px',
                activeTab === index
                  ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="pt-4">
          {childArray[activeTab]}
        </div>
      </div>
    </TabsContext.Provider>
  );
}

interface TabProps {
  children: ReactNode;
  className?: string;
}

export function Tab({ children, className }: TabProps) {
  return (
    <div className={cn('prose prose-gray dark:prose-invert max-w-none', className)}>
      {children}
    </div>
  );
}

export default Tabs;
