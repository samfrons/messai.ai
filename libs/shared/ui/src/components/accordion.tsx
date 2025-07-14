'use client';

import React, { useState, createContext, useContext, type ReactNode } from 'react';
import { cn } from '../utils';

// Accordion Context
interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

// Accordion Root Component
export interface AccordionProps {
  children: ReactNode;
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  className?: string;
}

export function Accordion({
  children,
  type = 'single',
  defaultValue = [],
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : [defaultValue]
  );

  const toggleItem = (value: string) => {
    if (type === 'single') {
      setOpenItems((current) => (current.includes(value) ? [] : [value]));
    } else {
      setOpenItems((current) =>
        current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn('space-y-2', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

// Accordion Item Context
const AccordionItemContext = React.createContext<{ value: string } | null>(null);

// Accordion Item Component
export interface AccordionItemProps {
  children: ReactNode;
  value: string;
  className?: string;
}

export function AccordionItem({ children, value, className }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={cn('border-b border-gray-200 last:border-b-0', className)} data-state={value}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

// Accordion Trigger Component
export interface AccordionTriggerProps {
  children: ReactNode;
  className?: string;
}

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionTrigger must be used within Accordion');

  const item = React.useContext(AccordionItemContext)?.value;
  if (!item) throw new Error('AccordionTrigger must be used within AccordionItem');

  const isOpen = context.openItems.includes(item);

  return (
    <button
      type="button"
      onClick={() => context.toggleItem(item)}
      className={cn(
        'flex w-full items-center justify-between py-4 text-left',
        'font-serif text-lg font-light',
        'transition-all duration-300',
        'hover:opacity-60',
        'focus:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        className
      )}
      aria-expanded={isOpen}
    >
      {children}
      <svg
        className={cn('h-4 w-4 shrink-0 transition-transform duration-300', isOpen && 'rotate-180')}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

// Accordion Content Component
export interface AccordionContentProps {
  children: ReactNode;
  className?: string;
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionContent must be used within Accordion');

  const item = React.useContext(AccordionItemContext)?.value;
  if (!item) throw new Error('AccordionContent must be used within AccordionItem');

  const isOpen = context.openItems.includes(item);

  return (
    <div
      className={cn('overflow-hidden transition-all duration-300', isOpen ? 'max-h-96' : 'max-h-0')}
    >
      <div className={cn('pb-4', className)}>{children}</div>
    </div>
  );
}
