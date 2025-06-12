'use client';

import { ReactNode, useState } from 'react';

interface TabsProps {
  children: (activeId: string, setActiveId: (id: string) => void) => ReactNode;
  defaultActiveId?: string;
  className?: string;
}

export function Tabs({ children, defaultActiveId = '', className = '' }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultActiveId);

  return (
    <div className={className}>
      {children(activeId, setActiveId)}
    </div>
  );
}

interface TabProps {
  id: string;
  children: ReactNode;
  activeId: string;
  setActiveId: (id: string) => void;
  className?: string;
}

export function Tab({ id, children, activeId, setActiveId, className = '' }: TabProps) {
  return (
    <button
      onClick={() => setActiveId(id)}
      className={`${className} ${activeId === id 
        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
    >
      {children}
    </button>
  );
}

interface TabContentProps {
  id: string;
  activeId: string;
  children: ReactNode;
  className?: string;
}

export function TabContent({ id, activeId, children, className = '' }: TabContentProps) {
  return activeId === id ? (
    <div className={className}>
      {children}
    </div>
  ) : null;
}
