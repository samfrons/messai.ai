'use client';

import { type ReactNode, useState, useEffect, useRef } from 'react';
import { cn } from '../utils';

interface LayoutProps {
  children: ReactNode;
  /**
   * Optional navigation items
   */
  navigation?: Array<{
    label: string;
    href: string;
    active?: boolean;
  }>;
  /**
   * Optional user menu
   */
  userMenu?: ReactNode;
  /**
   * Whether to show the sidebar
   */
  showSidebar?: boolean;
  /**
   * Sidebar content
   */
  sidebar?: ReactNode;
}

export default function Layout({
  children,
  navigation = [],
  userMenu,
  showSidebar = false,
  sidebar,
}: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [children]);

  return (
    <div className="min-h-screen bg-cream text-black">
      {/* Minimalist Header */}
      <header className="border-b border-gray-200 relative">
        <div className="container-grid">
          <div className="grid-12 py-6">
            {/* Logo - Left aligned */}
            <div className="col-span-8 md:col-span-3 flex items-center">
              <a href="/" className="inline-flex items-center group">
                <h1 className="text-xl font-serif font-light tracking-tight">
                  MESSAI<span className="opacity-60">.AI</span>
                </h1>
              </a>
            </div>

            {/* Desktop Navigation - Center (hidden on mobile) */}
            {navigation.length > 0 && (
              <nav className="hidden md:col-span-6 md:flex items-center justify-center">
                <div className="flex items-center gap-8">
                  {navigation.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={cn('nav-link text-sm', item.active && 'active')}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </nav>
            )}

            {/* User Menu & Hamburger - Right aligned */}
            <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-4">
              {/* Desktop User Menu (hidden on mobile) */}
              <div className="hidden md:block">
                {userMenu || <span className="text-sm opacity-60">Research Platform</span>}
              </div>

              {/* Mobile Hamburger Menu (hidden on desktop) */}
              <button
                className="md:hidden p-2 -mr-2 hover:opacity-60 transition-opacity"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  // Close icon (X)
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                ) : (
                  // Hamburger icon
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />

            {/* Menu */}
            <div
              ref={menuRef}
              className="fixed inset-0 bg-gray-900 z-50 md:hidden animate-slide-down"
            >
              {/* Mobile Menu Header */}
              <div className="container-grid border-b border-gray-800">
                <div className="grid-12 py-6">
                  <div className="col-span-8 flex items-center">
                    <a href="/" className="inline-flex items-center group">
                      <h1 className="text-xl font-serif font-light tracking-tight text-white">
                        MESSAI<span className="opacity-60">.AI</span>
                      </h1>
                    </a>
                  </div>
                  <div className="col-span-4 flex items-center justify-end">
                    <button
                      className="p-2 -mr-2 text-white hover:opacity-60 transition-opacity"
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label="Close menu"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Navigation */}
              <nav className="container-grid py-8">
                <div className="grid-12">
                  <div className="col-span-12 flex flex-col gap-2">
                    {navigation.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'px-4 py-3 text-lg text-white hover:bg-gray-800 transition-colors rounded',
                          item.active && 'bg-gray-800'
                        )}
                      >
                        {item.label}
                      </a>
                    ))}
                    {/* Mobile User Menu */}
                    {userMenu && (
                      <>
                        <div className="my-4 border-t border-gray-800" />
                        <div className="px-4 py-3 text-white">{userMenu}</div>
                      </>
                    )}
                  </div>
                </div>
              </nav>
            </div>
          </>
        )}
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar - Minimalist style */}
        {showSidebar && (
          <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
            <div className="p-6">{sidebar}</div>
          </aside>
        )}

        {/* Main Content */}
        <main className={cn('flex-1', !showSidebar && 'w-full')}>
          <div className={cn('container-grid py-12', showSidebar && 'max-w-none')}>{children}</div>
        </main>
      </div>

      {/* Minimalist Footer */}
      <footer className="border-t border-gray-200 mt-24">
        <div className="container-grid py-8">
          <div className="grid-12">
            <div className="col-span-12 text-center">
              <p className="text-sm opacity-60">
                © {new Date().getFullYear()} MESSAI.AI — Advancing Electrochemical Research
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
