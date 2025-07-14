import { type ReactNode } from 'react';
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
  return (
    <div className="min-h-screen bg-cream text-black">
      {/* Minimalist Header */}
      <header className="border-b border-gray-200">
        <div className="container-grid">
          <div className="grid-12 py-6">
            {/* Logo - Left aligned */}
            <div className="col-span-3 flex items-center">
              <a href="/" className="inline-flex items-center group">
                <h1 className="text-xl font-serif font-light tracking-tight">
                  MESSAI<span className="opacity-60">.AI</span>
                </h1>
              </a>
            </div>

            {/* Navigation - Center */}
            {navigation.length > 0 && (
              <nav className="col-span-6 flex items-center justify-center">
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

            {/* User Menu - Right aligned */}
            <div className="col-span-3 flex items-center justify-end">
              {userMenu || <span className="text-sm opacity-60">Research Platform</span>}
            </div>
          </div>
        </div>
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
